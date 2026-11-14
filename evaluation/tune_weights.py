#!/usr/bin/env python3
"""
Skillio weight sensitivity analysis.

The HYBRID score is  w_emb * similarity + w_skill * skillMatch + w_cat * categoryMatch
(current weights 0.6 / 0.3 / 0.1). This script checks how sensitive the ranking quality is to
that choice, WITHOUT touching the backend:

  1. It fetches the HYBRID results from the real API once. Every item already carries its three
     components (similarity, skillMatch.score, categoryMatch). They are cached in
     evaluation/results/components.csv, so later runs work offline (--from-cache).
  2. It recomputes the ranking offline for a grid of weights (w_emb + w_skill + w_cat = 1) and
     measures nDCG@5 against the same ground truth (evaluation/data/relevance.csv).
  3. Cross-validation: the queries are split 50/50 many times; the best weights are chosen on the
     TRAIN half and judged on the TEST half and compared with the current weights. This shows
     whether "tuning" would really help or only fits the noise.

Usage (project root, backend + ai-service + database running, seed data loaded, NO seed profile):

    python evaluation/tune_weights.py              # fetches from the API, writes the cache
    python evaluation/tune_weights.py --from-cache # offline, uses evaluation/results/components.csv

Outputs in evaluation/results/: components.csv, weights_grid.csv, weights_cv.csv, weights.md,
weights_heatmap.png (the PNG needs matplotlib; the rest does not).
"""
import argparse
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
import run_evaluation as ev  # noqa: E402  (same folder)

DEFAULT = (0.6, 0.3, 0.1)
STEP = 0.05
N_SPLITS = 200
DIRECTIONS = ["student->postings", "posting->candidates"]
METRICS = ["nDCG@3", "nDCG@5", "MRR2"]   # MRR2 = MRR with strict relevance (grade 2)


# ------------------------------------------------------------------------------- fetching

def parse_item(item, id_key):
    """Extracts (id, similarity, skill score, category match) from one API item."""
    item_id = item["posting"]["id"] if id_key == "posting" else item["userId"]
    skill = item.get("skillMatch") or {}
    return (item_id,
            float(item.get("similarity") or 0.0),
            float(skill.get("score") or 0.0),
            float(item.get("categoryMatch") or 0.0))


def fetch_components(base_url, password, data_dir, do_login=None, get=None):
    """Calls the API in HYBRID mode and returns a DataFrame with the three components per item."""
    do_login = do_login or (lambda email: ev.login(base_url, email, password))
    get = get or (lambda path, token, params: ev.get_json(base_url, path, token, params))

    postings = pd.read_csv(data_dir / "postings.csv")
    students = pd.read_csv(data_dir / "students.csv")
    posting_by_db = dict(zip(postings.db_id, postings.seed_id))
    student_by_db = dict(zip(students.db_id, students.seed_id))
    rows = []

    print("Student -> postings ...")
    for s in students.itertuples():
        token = do_login(s.email)
        items = get("/api/recommendations/postings", token, {"limit": 50, "mode": "HYBRID"})
        rank = 0
        for item in items:
            pid, sim, skill, cat = parse_item(item, "posting")
            if pid in posting_by_db:
                rank += 1
                rows.append(("student->postings", s.seed_id, posting_by_db[pid], sim, skill, cat, rank))

    print("Posting -> candidates ...")
    tokens = {}
    for p in postings.itertuples():
        if p.company_email not in tokens:
            tokens[p.company_email] = do_login(p.company_email)
        items = get(f"/api/company/postings/{p.db_id}/candidates", tokens[p.company_email],
                    {"limit": 50, "mode": "HYBRID"})
        rank = 0
        for item in items:
            uid, sim, skill, cat = parse_item(item, "user")
            if uid in student_by_db:
                rank += 1
                rows.append(("posting->candidates", p.seed_id, student_by_db[uid], sim, skill, cat, rank))

    return pd.DataFrame(rows, columns=["direction", "query", "item", "similarity", "skill", "category", "api_rank"])


# ---------------------------------------------------------------------------------- maths

def weight_grid(step=STEP):
    """All (w_emb, w_skill, w_cat) with non-negative parts summing to 1, on a grid."""
    n = int(round(1 / step))
    grid = [(i * step, j * step, (n - i - j) * step) for i in range(n + 1) for j in range(n + 1 - i)]
    return np.array(grid)


def build_queries(components, relevance_grade):
    """Per query: item ids, component matrix (n_items x 3) and relevance grades, ordered by item id."""
    queries = {}
    for (direction, query), group in components.groupby(["direction", "query"]):
        group = group.sort_values("item")
        items = list(group["item"])
        if direction == "student->postings":
            gains = [relevance_grade[(query, i)] for i in items]
        else:
            gains = [relevance_grade[(i, query)] for i in items]
        queries[(direction, query)] = {
            "components": group[["similarity", "skill", "category"]].to_numpy(),
            "gains": np.array(gains),
            "api_rank": group["api_rank"].to_numpy(),
        }
    return queries


def rank_with_weights(q, weights):
    """Item order for the weights; ties are broken by similarity (like the backend), then by id."""
    comp = q["components"]
    score = np.round(comp @ np.asarray(weights), 9)
    order = np.lexsort((np.arange(len(score)), -comp[:, 0], -score))
    return order


def metrics_for(q, weights):
    gains = list(q["gains"][rank_with_weights(q, weights)])
    result = ev.metrics_for_ranking(gains)
    return {"nDCG@3": result[("graded", "nDCG@3")],
            "nDCG@5": result[("graded", "nDCG@5")],
            "MRR2": result[(2, "MRR")]}


def evaluate_grid(queries, grid):
    """Array [metric][direction] -> matrix (n_weights x n_queries) of per-query values."""
    out = {}
    for direction in DIRECTIONS:
        keys = sorted(k for k in queries if k[0] == direction)
        for metric in METRICS:
            out[(metric, direction)] = np.full((len(grid), len(keys)), np.nan)
        for wi, w in enumerate(grid):
            for qi, key in enumerate(keys):
                values = metrics_for(queries[key], w)
                for metric in METRICS:
                    out[(metric, direction)][wi, qi] = values[metric]
    return out


def check_reproduction(queries):
    """Sanity check: the default weights must reproduce the order returned by the API."""
    same, total = 0, 0
    for q in queries.values():
        order = rank_with_weights(q, DEFAULT)
        recomputed = np.empty(len(order), dtype=int)
        recomputed[order] = np.arange(1, len(order) + 1)
        total += 1
        same += int(np.array_equal(recomputed, q["api_rank"]))
    return same, total


def nanmean(matrix, axis):
    return np.nanmean(matrix, axis=axis)


def index_of(grid, weights):
    return int(np.argmin(np.abs(grid - np.asarray(weights)).sum(axis=1)))


def cross_validate(matrices, grid, directions, rng, default_idx):
    """
    Repeated 50/50 query splits. Weights are chosen on TRAIN (best mean nDCG@5; ties go to the
    weights closest to the current ones) and judged on TEST. For several directions the objective is
    the mean of the per-direction means, because the system uses one set of weights for both.
    """
    distance = np.abs(grid - np.asarray(DEFAULT)).sum(axis=1)
    rows = []
    for split in range(N_SPLITS):
        train_means, test_means = [], []
        for d in directions:
            m = matrices[("nDCG@5", d)]
            n = m.shape[1]
            perm = rng.permutation(n)
            train, test = perm[: n // 2], perm[n // 2:]
            train_means.append(nanmean(m[:, train], axis=1))
            test_means.append(nanmean(m[:, test], axis=1))
        train_obj = np.mean(train_means, axis=0)
        test_obj = np.mean(test_means, axis=0)
        best = np.flatnonzero(train_obj >= train_obj.max() - 1e-12)
        chosen = int(best[np.argmin(distance[best])])
        rows.append({"split": split, "chosen_emb": grid[chosen][0], "chosen_skill": grid[chosen][1],
                     "chosen_cat": grid[chosen][2], "test_chosen": test_obj[chosen],
                     "test_default": test_obj[default_idx], "test_best_possible": test_obj.max()})
    return pd.DataFrame(rows)


# --------------------------------------------------------------------------------- output

def label_for(directions):
    return " + ".join(directions) if len(directions) > 1 else directions[0]


def write_outputs(out_dir, grid, matrices, cv_results, reproduction):
    default_idx = index_of(grid, DEFAULT)

    grid_df = pd.DataFrame({"w_embedding": grid[:, 0], "w_skills": grid[:, 1], "w_category": grid[:, 2]})
    for metric in METRICS:
        for d in DIRECTIONS:
            grid_df[f"{metric} {d}"] = nanmean(matrices[(metric, d)], axis=1)
    grid_df["nDCG@5 mean of both"] = (grid_df[f"nDCG@5 {DIRECTIONS[0]}"] + grid_df[f"nDCG@5 {DIRECTIONS[1]}"]) / 2
    grid_df.round(4).to_csv(out_dir / "weights_grid.csv", index=False)

    cv_all = pd.concat([df.assign(scope=label) for label, df in cv_results.items()])
    cv_all.round(4).to_csv(out_dir / "weights_cv.csv", index=False)

    lines = ["# Weight sensitivity analysis", "",
             f"Grid step {STEP}, {len(grid)} weight combinations (w_embedding + w_skills + w_category = 1). "
             f"Current weights: {DEFAULT[0]} / {DEFAULT[1]} / {DEFAULT[2]}.",
             f"Check: the current weights reproduce the API ranking exactly for {reproduction[0]} of "
             f"{reproduction[1]} queries.", ""]

    # ---- grid summary per scope
    lines += ["## nDCG@5 over the weight grid", "",
              "| Scope | Current | Best on the grid (weights) | Worst | Share of grid within 0.01 of the best |",
              "|---|---|---|---|---|"]
    scopes = {DIRECTIONS[0]: f"nDCG@5 {DIRECTIONS[0]}", DIRECTIONS[1]: f"nDCG@5 {DIRECTIONS[1]}",
              "mean of both": "nDCG@5 mean of both"}
    for name, col in scopes.items():
        values = grid_df[col].to_numpy()
        best_i = int(np.argmax(values))
        near = float(np.mean(values >= values.max() - 0.01))
        lines.append(f"| {name} | {values[default_idx]:.3f} | {values.max():.3f} "
                     f"({grid[best_i][0]:.2f}/{grid[best_i][1]:.2f}/{grid[best_i][2]:.2f}) | "
                     f"{values.min():.3f} | {near:.0%} |")
    lines.append("")

    # ---- reference corners
    lines += ["## Single-component references (nDCG@5)", "",
              "| Weights (emb / skills / cat) | " + " | ".join(DIRECTIONS) + " |", "|---|---|---|"]
    for name, w in [("embedding only", (1, 0, 0)), ("skills only", (0, 1, 0)), ("category only", (0, 0, 1)),
                    ("current (0.6 / 0.3 / 0.1)", DEFAULT)]:
        i = index_of(grid, w)
        lines.append(f"| {name} | " + " | ".join(f"{grid_df[f'nDCG@5 {d}'].iloc[i]:.3f}" for d in DIRECTIONS) + " |")
    lines.append("")

    # ---- cross-validation
    lines += [f"## Cross-validation ({N_SPLITS} random 50/50 splits of the queries)", "",
              "Weights are chosen on the train half and judged on the test half (nDCG@5).", "",
              "| Scope | Test: chosen weights | Test: current weights | Difference (chosen - current) | "
              "Splits where chosen is better by > 0.005 | Most often chosen (emb / skills / cat) |",
              "|---|---|---|---|---|---|"]
    for label, df in cv_results.items():
        diff = df.test_chosen - df.test_default
        low, high = np.percentile(diff, [2.5, 97.5])
        common = df.groupby(["chosen_emb", "chosen_skill", "chosen_cat"]).size().sort_values(ascending=False)
        top = common.index[0]
        lines.append(f"| {label} | {df.test_chosen.mean():.3f} | {df.test_default.mean():.3f} | "
                     f"{diff.mean():+.3f} [{low:+.3f}, {high:+.3f}] | {(diff > 0.005).mean():.0%} | "
                     f"{top[0]:.2f} / {top[1]:.2f} / {top[2]:.2f} ({common.iloc[0] / len(df):.0%} of splits) |")
    lines += ["", "The interval is the 2.5-97.5 percentile over splits. The splits overlap, so it describes how "
              "stable the choice is, not a formal confidence interval.", ""]
    (out_dir / "weights.md").write_text("\n".join(lines), encoding="utf-8")
    return grid_df, lines


def heatmap(out_dir, grid, grid_df):
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib is not installed - skipping weights_heatmap.png (pip install matplotlib)")
        return
    n = int(round(1 / STEP)) + 1
    panels = [(DIRECTIONS[0], f"nDCG@5 {DIRECTIONS[0]}"), (DIRECTIONS[1], f"nDCG@5 {DIRECTIONS[1]}"),
              ("mean of both", "nDCG@5 mean of both")]
    fig, axes = plt.subplots(1, 3, figsize=(15, 4.8), constrained_layout=True)
    for ax, (title, col) in zip(axes, panels):
        z = np.full((n, n), np.nan)
        for (we, ws, _), v in zip(grid, grid_df[col]):
            z[int(round(ws / STEP)), int(round(we / STEP))] = v
        image = ax.imshow(z, origin="lower", cmap="Blues", extent=(-STEP / 2, 1 + STEP / 2, -STEP / 2, 1 + STEP / 2),
                          vmin=np.nanmin(z), vmax=np.nanmax(z))
        best = np.unravel_index(np.nanargmax(z), z.shape)
        ax.plot(best[1] * STEP, best[0] * STEP, marker="o", ls="none", ms=11, mfc="none", mec="#1a1a1a", mew=2, label="best")
        ax.plot(DEFAULT[0], DEFAULT[1], marker="D", ls="none", ms=8, mfc="#d95f02", mec="white", mew=1.5, label="current")
        ax.set_title(title, fontsize=11)
        ax.set_xlabel("w_embedding")
        ax.set_ylabel("w_skills   (w_category = 1 - both)")
        ax.set_xlim(-STEP / 2, 1 + STEP / 2)
        ax.set_ylim(-STEP / 2, 1 + STEP / 2)
        ax.set_aspect("equal")
        for side in ("top", "right"):
            ax.spines[side].set_visible(False)
        fig.colorbar(image, ax=ax, shrink=0.8, label="nDCG@5")
    axes[0].legend(loc="upper right", frameon=False, fontsize=9)
    fig.savefig(out_dir / "weights_heatmap.png", dpi=200)
    print(f"Wrote {out_dir / 'weights_heatmap.png'}")


def main():
    parser = argparse.ArgumentParser(description="Skillio weight sensitivity analysis")
    parser.add_argument("--base-url", default="http://localhost:8080")
    parser.add_argument("--password", default="Seed12345!")
    parser.add_argument("--data-dir", default="evaluation/data")
    parser.add_argument("--out-dir", default="evaluation/results")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--from-cache", action="store_true", help="skip the API, use results/components.csv")
    args = parser.parse_args()

    data_dir, out_dir = Path(args.data_dir), Path(args.out_dir)
    for name in ("postings.csv", "students.csv", "relevance.csv"):
        if not (data_dir / name).exists():
            ev.die(f"{data_dir / name} not found.")
    out_dir.mkdir(parents=True, exist_ok=True)
    cache = out_dir / "components.csv"

    if args.from_cache:
        if not cache.exists():
            ev.die(f"{cache} not found. Run once without --from-cache.")
        components = pd.read_csv(cache)
    else:
        components = fetch_components(args.base_url, args.password, data_dir)
        components.to_csv(cache, index=False)
        print(f"Wrote {cache}")

    relevance = pd.read_csv(data_dir / "relevance.csv")
    grade = {(r.student_id, r.posting_id): int(r.grade) for r in relevance.itertuples()}
    queries = build_queries(components, grade)
    print(f"{len(queries)} queries loaded.")

    reproduction = check_reproduction(queries)
    print(f"Current weights reproduce the API ranking for {reproduction[0]}/{reproduction[1]} queries.")
    if reproduction[0] < reproduction[1]:
        print("WARNING: not all rankings are reproduced. The score formula in the backend may differ from "
              "0.6/0.3/0.1, or scores are rounded in the response (ties). Interpret the results carefully.")

    grid = weight_grid()
    matrices = evaluate_grid(queries, grid)
    default_idx = index_of(grid, DEFAULT)
    rng = np.random.default_rng(args.seed)
    cv_results = {
        DIRECTIONS[0]: cross_validate(matrices, grid, [DIRECTIONS[0]], rng, default_idx),
        DIRECTIONS[1]: cross_validate(matrices, grid, [DIRECTIONS[1]], rng, default_idx),
        "shared weights (both directions)": cross_validate(matrices, grid, DIRECTIONS, rng, default_idx),
    }
    grid_df, lines = write_outputs(out_dir, grid, matrices, cv_results, reproduction)
    heatmap(out_dir, grid, grid_df)
    print("\n" + "\n".join(lines))
    print(f"\nWritten to {out_dir}/ (weights.md, weights_grid.csv, weights_cv.csv, weights_heatmap.png, components.csv)")


if __name__ == "__main__":
    main()
