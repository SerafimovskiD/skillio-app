#!/usr/bin/env python3
"""
Skillio recommendation evaluation.

Runs the real backend API for the seeded students and companies, compares the ranked
results with the ground truth (evaluation/data/relevance.csv) and writes the metrics.

Usage (from the project root, backend + ai-service + database running, seed data loaded):

    pip install requests pandas numpy
    python evaluation/run_evaluation.py

Two directions are evaluated:
  * student -> postings   (20 queries: one per seeded student, 40 candidate postings)
  * posting -> candidates (40 queries: one per seeded posting, 20 candidate students)

Compared methods: HYBRID, EMBEDDING, SKILLS (the three modes of the system) and two baselines:
  * Random         - random order (average over many random shuffles)
  * Category-only  - items in the student's field first, random order inside the groups

Metrics: Precision@K, Recall@K (binary relevance), MRR, nDCG@K (graded relevance), K = 3, 5, 10.
"Relevant" is either grade >= 1 (relevant or partially relevant) or grade == 2 (strictly relevant).
Only seeded accounts and postings (@example.com) take part; your own test data is ignored.

Besides per-method means, a PAIRED comparison is written (paired_differences.csv): for every pair of
methods the difference is computed per query and bootstrapped, so "A is better than B" is only
reported when the 95% interval of the difference excludes zero.
"""
import argparse
import json
import math
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd
import requests

MODES = ["HYBRID", "EMBEDDING", "SKILLS"]
KS = [3, 5, 10]
THRESHOLDS = [1, 2]
N_SHUFFLES = 200      # shuffles used to average the random baselines
N_BOOTSTRAP = 2000    # resamples used for the confidence intervals
METHOD_ORDER = ["Random", "Category-only", "EMBEDDING", "SKILLS", "HYBRID"]


# ---------------------------------------------------------------------------------- API

def die(message):
    print(f"\nERROR: {message}", file=sys.stderr)
    sys.exit(1)


def login(base_url, email, password):
    response = requests.post(f"{base_url}/api/auth/login",
                             json={"email": email, "password": password}, timeout=30)
    if response.status_code != 200:
        die(f"Login failed for {email} (HTTP {response.status_code}). "
            f"Is the seed data loaded and the password correct?")
    return response.json()["token"]


def get_json(base_url, path, token, params):
    response = requests.get(f"{base_url}{path}", params=params, timeout=60,
                            headers={"Authorization": f"Bearer {token}"})
    if response.status_code != 200:
        die(f"GET {path} failed (HTTP {response.status_code}): {response.text[:200]}")
    return response.json()


def fetch_posting_ranking(base_url, token, mode):
    """Ranked list of posting DATABASE ids for one student."""
    items = get_json(base_url, "/api/recommendations/postings", token, {"limit": 50, "mode": mode})
    return [item["posting"]["id"] for item in items]


def fetch_candidate_ranking(base_url, token, posting_db_id, mode):
    """Ranked list of student DATABASE ids for one posting."""
    items = get_json(base_url, f"/api/company/postings/{posting_db_id}/candidates", token,
                     {"limit": 50, "mode": mode})
    return [item["userId"] for item in items]


# ------------------------------------------------------------------------------ metrics

def dcg(gains, k):
    return sum((2 ** g - 1) / math.log2(i + 2) for i, g in enumerate(gains[:k]))


def metrics_for_ranking(gains):
    """gains: relevance grades (0/1/2) of the items in ranked order. Returns {metric: value or nan}."""
    result = {}
    ideal = sorted(gains, reverse=True)
    has_any = any(g > 0 for g in gains)
    for k in KS:
        denominator = dcg(ideal, k)
        result[("graded", f"nDCG@{k}")] = dcg(gains, k) / denominator if has_any and denominator > 0 else np.nan
    for th in THRESHOLDS:
        total_relevant = sum(1 for g in gains if g >= th)
        for k in KS:
            hits = sum(1 for g in gains[:k] if g >= th)
            result[(th, f"P@{k}")] = hits / k if total_relevant else np.nan
            result[(th, f"R@{k}")] = hits / total_relevant if total_relevant else np.nan
        first = next((i for i, g in enumerate(gains) if g >= th), None)
        result[(th, "MRR")] = (1.0 / (first + 1) if first is not None else 0.0) if total_relevant else np.nan
    return result


def average_over_shuffles(groups, grade_of, rng):
    """Baseline: items are put into ordered groups; inside a group the order is random."""
    sums = {}
    for _ in range(N_SHUFFLES):
        ranking = []
        for group in groups:
            shuffled = list(group)
            rng.shuffle(shuffled)
            ranking.extend(shuffled)
        for key, value in metrics_for_ranking([grade_of(i) for i in ranking]).items():
            sums.setdefault(key, []).append(value)
    return {key: float(np.nanmean(values)) if not np.all(np.isnan(values)) else np.nan
            for key, values in sums.items()}


# ----------------------------------------------------------------------------- evaluation

def evaluate(base_url, password, data_dir, seed, fetch_posting=None, fetch_candidates=None, do_login=None):
    """Runs the whole evaluation and returns a long DataFrame of per-query metric values."""
    fetch_posting = fetch_posting or (lambda token, mode: fetch_posting_ranking(base_url, token, mode))
    fetch_candidates = fetch_candidates or (lambda token, pid, mode: fetch_candidate_ranking(base_url, token, pid, mode))
    do_login = do_login or (lambda email: login(base_url, email, password))

    postings = pd.read_csv(data_dir / "postings.csv")
    students = pd.read_csv(data_dir / "students.csv")
    relevance = pd.read_csv(data_dir / "relevance.csv")
    grade = {(r.student_id, r.posting_id): int(r.grade) for r in relevance.itertuples()}

    posting_by_db = dict(zip(postings.db_id, postings.seed_id))
    student_by_db = dict(zip(students.db_id, students.seed_id))
    posting_category = dict(zip(postings.seed_id, postings.category))
    student_interests = {r.seed_id: set(r.interests.split(";")) for r in students.itertuples()}
    all_postings = list(postings.seed_id)
    all_students = list(students.seed_id)

    rng = np.random.default_rng(seed)
    rows = []

    def add(direction, method, query, values):
        for (th, metric), value in values.items():
            rows.append({"direction": direction, "method": method, "query": query,
                         "threshold": th, "metric": metric, "value": value})

    # ---- direction 1: student -> postings
    print("Student -> postings ...")
    for student in students.itertuples():
        token = do_login(student.email)
        grade_of = lambda pid, sid=student.seed_id: grade[(sid, pid)]
        for mode in MODES:
            ranking_db = fetch_posting(token, mode)
            ranking = [posting_by_db[i] for i in ranking_db if i in posting_by_db]
            if len(ranking) != len(all_postings):
                die(f"{student.email}: API returned {len(ranking)} seeded postings in mode {mode}, "
                    f"expected {len(all_postings)}. Is the seed data complete (and limit=50 enough)?")
            add("student->postings", mode, student.seed_id, metrics_for_ranking([grade_of(p) for p in ranking]))
        add("student->postings", "Random", student.seed_id,
            average_over_shuffles([all_postings], grade_of, rng))
        in_field = [p for p in all_postings if posting_category[p] in student_interests[student.seed_id]]
        out_field = [p for p in all_postings if p not in set(in_field)]
        add("student->postings", "Category-only", student.seed_id,
            average_over_shuffles([in_field, out_field], grade_of, rng))

    # ---- direction 2: posting -> candidates
    print("Posting -> candidates ...")
    company_tokens = {}
    for posting in postings.itertuples():
        if posting.company_email not in company_tokens:
            company_tokens[posting.company_email] = do_login(posting.company_email)
        token = company_tokens[posting.company_email]
        grade_of = lambda sid, pid=posting.seed_id: grade[(sid, pid)]
        for mode in MODES:
            ranking_db = fetch_candidates(token, posting.db_id, mode)
            ranking = [student_by_db[i] for i in ranking_db if i in student_by_db]
            if len(ranking) != len(all_students):
                die(f"{posting.seed_id}: API returned {len(ranking)} seeded students in mode {mode}, "
                    f"expected {len(all_students)}.")
            add("posting->candidates", mode, posting.seed_id, metrics_for_ranking([grade_of(s) for s in ranking]))
        add("posting->candidates", "Random", posting.seed_id,
            average_over_shuffles([all_students], grade_of, rng))
        in_field = [s for s in all_students if posting.category in student_interests[s]]
        out_field = [s for s in all_students if s not in set(in_field)]
        add("posting->candidates", "Category-only", posting.seed_id,
            average_over_shuffles([in_field, out_field], grade_of, rng))

    return pd.DataFrame(rows)


# --------------------------------------------------------------------------------- output

def bootstrap_ci(values, rng):
    values = np.asarray([v for v in values if not np.isnan(v)])
    if len(values) == 0:
        return np.nan, np.nan, np.nan
    means = rng.choice(values, size=(N_BOOTSTRAP, len(values)), replace=True).mean(axis=1)
    return float(values.mean()), float(np.percentile(means, 2.5)), float(np.percentile(means, 97.5))


def summarize(per_query, seed):
    rng = np.random.default_rng(seed)
    rows = []
    for (direction, method, th, metric), group in per_query.groupby(["direction", "method", "threshold", "metric"]):
        mean, low, high = bootstrap_ci(group["value"].to_numpy(), rng)
        rows.append({"direction": direction, "method": method, "threshold": th, "metric": metric,
                     "n_queries": int(group["value"].notna().sum()),
                     "mean": mean, "ci_low": low, "ci_high": high})
    return pd.DataFrame(rows)


PAIRS = [("HYBRID", "SKILLS"), ("HYBRID", "EMBEDDING"), ("SKILLS", "EMBEDDING"),
         ("EMBEDDING", "Category-only"), ("HYBRID", "Category-only"), ("HYBRID", "Random")]


def paired_differences(per_query, seed):
    """Per-query difference A - B with a bootstrap 95% interval; significant if the interval excludes 0."""
    rng = np.random.default_rng(seed + 1)
    rows = []
    for (direction, th, metric), group in per_query.groupby(["direction", "threshold", "metric"]):
        wide = group.pivot(index="query", columns="method", values="value")
        for a, b in PAIRS:
            diff = (wide[a] - wide[b]).dropna().to_numpy()
            if len(diff) == 0:
                continue
            means = rng.choice(diff, size=(N_BOOTSTRAP, len(diff)), replace=True).mean(axis=1)
            low, high = float(np.percentile(means, 2.5)), float(np.percentile(means, 97.5))
            rows.append({"direction": direction, "threshold": th, "metric": metric,
                         "method_a": a, "method_b": b, "n_queries": len(diff),
                         "mean_diff": float(diff.mean()), "ci_low": low, "ci_high": high,
                         "significant": bool(low > 0 or high < 0)})
    return pd.DataFrame(rows)


def metric_columns(th):
    cols = [f"P@{k}" for k in KS] + [f"R@{k}" for k in KS] + ["MRR"]
    return [(th, c) for c in cols] + [("graded", f"nDCG@{k}") for k in KS]


def table(summary, direction, th):
    part = summary[(summary.direction == direction) &
                   (summary.threshold.astype(str).isin([str(th), "graded"]))]
    out = {}
    for method in METHOD_ORDER:
        row = {}
        for t, metric in metric_columns(th):
            m = part[(part.method == method) & (part.metric == metric) & (part.threshold.astype(str) == str(t))]
            row[metric] = m["mean"].iloc[0] if len(m) else np.nan
        out[method] = row
    return pd.DataFrame(out).T


def write_markdown(summary, path, n_students, n_postings):
    lines = ["# Evaluation results", "",
             f"Seeded data: {n_students} students, {n_postings} postings. Values are means over queries.", ""]
    for direction in ["student->postings", "posting->candidates"]:
        for th, label in [(1, "relevant = grade >= 1 (relevant or partial)"), (2, "relevant = grade 2 (strict)")]:
            lines += [f"## {direction}, {label}", ""]
            t = table(summary, direction, th)
            lines.append("| Method | " + " | ".join(t.columns) + " |")
            lines.append("|---|" + "---|" * len(t.columns))
            for method, row in t.iterrows():
                lines.append(f"| {method} | " + " | ".join(f"{v:.3f}" for v in row) + " |")
            lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Skillio recommendation evaluation")
    parser.add_argument("--base-url", default="http://localhost:8080")
    parser.add_argument("--password", default="Seed12345!")
    parser.add_argument("--data-dir", default="evaluation/data")
    parser.add_argument("--out-dir", default="evaluation/results")
    parser.add_argument("--seed", type=int, default=42, help="random seed (baselines, bootstrap)")
    args = parser.parse_args()

    data_dir, out_dir = Path(args.data_dir), Path(args.out_dir)
    for name in ("postings.csv", "students.csv", "relevance.csv"):
        if not (data_dir / name).exists():
            die(f"{data_dir / name} not found. Run the backend once with the 'seed' profile first.")
    out_dir.mkdir(parents=True, exist_ok=True)

    started = time.time()
    per_query = evaluate(args.base_url, args.password, data_dir, args.seed)
    summary = summarize(per_query, args.seed)

    paired = paired_differences(per_query, args.seed)
    per_query.to_csv(out_dir / "per_query.csv", index=False)
    paired.to_csv(out_dir / "paired_differences.csv", index=False)
    summary.to_csv(out_dir / "summary.csv", index=False)
    n_students = per_query[per_query.direction == "student->postings"]["query"].nunique()
    n_postings = per_query[per_query.direction == "posting->candidates"]["query"].nunique()
    write_markdown(summary, out_dir / "results.md", n_students, n_postings)
    (out_dir / "run_info.json").write_text(json.dumps({
        "base_url": args.base_url, "seed": args.seed, "students": n_students, "postings": n_postings,
        "shuffles": N_SHUFFLES, "bootstrap": N_BOOTSTRAP, "ks": KS,
        "finished": time.strftime("%Y-%m-%d %H:%M:%S"), "seconds": round(time.time() - started, 1)},
        indent=2), encoding="utf-8")

    pd.set_option("display.width", 200)
    for direction in ["student->postings", "posting->candidates"]:
        for th in THRESHOLDS:
            print(f"\n=== {direction} | relevant = grade >= {th} ===")
            print(table(summary, direction, th).round(3).to_string())
    shown = paired[paired.metric.isin(["nDCG@5", "P@3"]) & paired.threshold.astype(str).isin(["graded", "1"])]
    if len(shown):
        print("\n=== paired differences (A - B), 95% bootstrap interval; * = interval excludes 0 ===")
        for r in shown.itertuples():
            flag = "*" if r.significant else " "
            print(f"{r.direction:20s} {r.metric:7s} {r.method_a:9s} - {r.method_b:13s} "
                  f"{r.mean_diff:+.3f} [{r.ci_low:+.3f}, {r.ci_high:+.3f}] {flag}")
    print(f"\nResults written to {out_dir}/ (results.md, summary.csv, paired_differences.csv, per_query.csv, run_info.json)")


if __name__ == "__main__":
    main()
