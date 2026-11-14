# Weight sensitivity analysis

Grid step 0.05, 231 weight combinations (w_embedding + w_skills + w_category = 1). Current weights: 0.6 / 0.3 / 0.1.
Check: the current weights reproduce the API ranking exactly for 45 of 60 queries.

## nDCG@5 over the weight grid

| Scope | Current | Best on the grid (weights) | Worst | Share of grid within 0.01 of the best |
|---|---|---|---|---|
| student->postings | 0.976 | 0.997 (0.00/0.05/0.95) | 0.770 | 51% |
| posting->candidates | 0.984 | 0.990 (0.00/0.05/0.95) | 0.881 | 65% |
| mean of both | 0.980 | 0.993 (0.00/0.05/0.95) | 0.826 | 52% |

## Single-component references (nDCG@5)

| Weights (emb / skills / cat) | student->postings | posting->candidates |
|---|---|---|
| embedding only | 0.770 | 0.881 |
| skills only | 0.975 | 0.964 |
| category only | 0.836 | 0.941 |
| current (0.6 / 0.3 / 0.1) | 0.976 | 0.984 |

## Cross-validation (200 random 50/50 splits of the queries)

Weights are chosen on the train half and judged on the test half (nDCG@5).

| Scope | Test: chosen weights | Test: current weights | Difference (chosen - current) | Splits where chosen is better by > 0.005 | Most often chosen (emb / skills / cat) |
|---|---|---|---|---|---|
| student->postings | 0.992 | 0.976 | +0.016 [+0.003, +0.029] | 92% | 0.30 / 0.40 / 0.30 (24% of splits) |
| posting->candidates | 0.986 | 0.984 | +0.002 [-0.004, +0.008] | 32% | 0.30 / 0.40 / 0.30 (23% of splits) |
| shared weights (both directions) | 0.992 | 0.980 | +0.012 [+0.004, +0.020] | 94% | 0.30 / 0.40 / 0.30 (62% of splits) |

The interval is the 2.5-97.5 percentile over splits. The splits overlap, so it describes how stable the choice is, not a formal confidence interval.
