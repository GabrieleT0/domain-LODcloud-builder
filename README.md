# AccessibleLOD

### A human-centred view of the Linked Open Data Cloud

This repository brings together accessibility assessment results, an analysis notebook, an accessibility ontology, and the source code for an interactive cloud explorer.

**[Inspect the supplementary material](supplementary_material/)** · **[Reproduce the analysis](#reproduce-the-analysis)** · **[Explore the source code](#explore-the-source-code)**

> All supplementary research artifacts are in [`supplementary_material/`](supplementary_material/). Start with the score table for a quick overview, then use the detailed results and notebook to investigate individual metrics and reproduce the figures.

---

## What is included?

AccessibleLOD examines accessibility signals across the **Perceivable**, **Operable**, **Understandable**, and **Robust** categories, alongside indicators for visual and hearing accessibility. The supplied KGHeartBeat results provide both individual evaluation details and aggregate scores.

The repository supports three complementary activities:

- **Inspect the evidence:** browse stored evaluation results and compare scores across knowledge graphs and domains.
- **Reproduce the analysis:** generate figures and statistical tables from the supplied results snapshot.
- **Explore the implementation:** inspect the React frontend, Express backend, and scripts that prepare cloud metadata.

## Inspect the supplementary material

All paths below are relative to the repository root.

| Artifact | Location | What to inspect |
| :--- | :--- | :--- |
| Accessibility framework · expert evaluation | [`AccessibilityFramework - ExpertEvaluation.csv`](supplementary_material/AccessibilityFramework%20-%20ExpertEvaluation.csv) | Expert evaluation responses for the accessibility framework. |
| Score table | [`HumanAccessibility_LODCloud_scores.csv`](supplementary_material/raw_kgheartbeat_results/HumanAccessibility_LODCloud_scores.csv) | A compact table of metric values and aggregate scores, with knowledge graph identifiers, titles, and domains. Start here for comparisons. |
| Detailed results · JSON | [`HumanAccessibility_LODCloud_results.json`](supplementary_material/raw_kgheartbeat_results/HumanAccessibility_LODCloud_results.json) | Evaluation records indexed by knowledge graph identifier. This is the input used by the analysis notebook. |
| Detailed results · CSV | [`HumanAccessibility_LODCloud_results.csv`](supplementary_material/raw_kgheartbeat_results/HumanAccessibility_LODCloud_results.csv) | A tabular export of the detailed results, including endpoint information and evaluation details. |
| Analysis notebook | [`human_accessibility_lodcloud_charts.ipynb`](supplementary_material/human_accessibility_lodcloud_charts.ipynb) | Data checks, domain comparisons, score distributions, radar charts, dimension-level plots, and statistical exports. |
| Accessibility ontology | [`lodaccessible_ontology.ttl`](supplementary_material/lodaccessible_ontology.ttl) | The supplied LOD Accessibility Ontology, describing accessibility categories, dimensions, metrics, and their relationships. |


## Reproduce the analysis

Use Python 3 with a virtual environment. From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install jupyterlab pandas numpy matplotlib 'seaborn>=0.13'
cd supplementary_material
jupyter lab human_accessibility_lodcloud_charts.ipynb
```

Select the virtual environment's Python kernel and run all cells in order. Keep the notebook's working directory set to `supplementary_material/`: its default input is `raw_kgheartbeat_results/HumanAccessibility_LODCloud_results.json`.

The notebook writes generated artifacts to **`supplementary_material/plots/`**, including:

- PNG and PDF figures for domain boxplots, mean and domain radar charts, score distributions, and dimension-level comparisons.
- Editable LaTeX/TikZ or PGFPlots sources for figures.
- CSV tables containing category, domain, radar, and dimension statistics.

LaTeX is only needed to compile the exported `.tex` files. 


## Explore the source code

```text
.
├── supplementary_material/             # Research artifacts and analysis
│   ├── raw_kgheartbeat_results/         # Detailed results and score table
│   ├── human_accessibility_lodcloud_charts.ipynb
│   └── lodaccessible_ontology.ttl
├── AccessibleLOD_generator/            # Cloud metadata preparation
│   ├── data/                           # Selected identifiers and metadata
│   └── src/update_cloud.py             # Fetch and filter LOD Cloud metadata
├── WebApp/
│   ├── frontend/accessiblelod/         # React explorer and score views
│   ├── backend/                        # Express API, data, and database scripts
│   └── docker-compose.yml              # Application service configuration
└── update_AccessibleLOD_cloud.sh        # Update workflow script
```

The frontend provides cloud exploration, dataset search and the accessibility details. The backend serves dataset metadata and evaluation information.

