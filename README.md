# TMDL Generator

A browser-based tool for generating [Tabular Model Definition Language (TMDL)](https://learn.microsoft.com/en-us/analysis-services/tmdl/tmdl-overview) templates for Power BI / Analysis Services semantic models.

🌐 **Live app:**
- [https://rhariharaneee.github.io](https://rhariharaneee.github.io)
- [https://rhariharaneee.github.io/TMDL-Generator](https://rhariharaneee.github.io/TMDL-Generator)

---

## Features

- **15 object types** covering every layer of a TMDL model
- **Live preview** — TMDL output updates instantly as you fill in the form
- **Multi-tab workflow** — keep multiple objects open simultaneously
- **Syntax highlighting** — colour-coded TMDL tokens in the preview pane
- **Copy & Save** — copy to clipboard or download as a `.tmdl` file
- No build step, no dependencies — pure HTML / CSS / JavaScript

---

## Supported Object Types

| Group | Object Types |
|---|---|
| **Model** | Model, Relationship, Expression, Function (UDF), Aggregation, Culture, Perspective |
| **Tables** | Table, Measure, Column, Calculated Column, Hierarchy, Calculation Group, Date Table |
| **Security** | Role |

---

## Getting Started

### Run locally

Just open `index.html` in any modern browser — no server required.

```bash
# Clone the repo
git clone https://github.com/rhariharaneee/rhariharaneee.github.io.git
cd rhariharaneee.github.io

# Open in browser (Windows)
start index.html

# Open in browser (macOS)
open index.html
```

### Deploy to GitHub Pages

The app is already configured for GitHub Pages. Any push to `main` will be reflected at the live URL above within ~1 minute.

---

## Usage

1. Click **New** in the header to open a new object tab
2. Select an **Object Type** from the dropdown on the left
3. Fill in the form fields — the TMDL preview on the right updates live
4. Use **Copy** to copy the TMDL to your clipboard, or **Save .tmdl** to download the file
5. Paste or save the output into your TMDL folder structure

### TMDL file structure

```
model.bim  (or TMDL folder)
├── model.tmdl
├── tables/
│   ├── Sales.tmdl
│   ├── Date.tmdl
│   └── ...
├── relationships.tmdl
├── roles.tmdl
└── expressions.tmdl
```

---

## TMDL Reference

- [TMDL Overview](https://learn.microsoft.com/en-us/analysis-services/tmdl/tmdl-overview)
- [TMDL Syntax Reference](https://learn.microsoft.com/en-us/analysis-services/tmdl/tmdl-reference)
- [DAX User Defined Functions](https://learn.microsoft.com/en-us/dax/best-practices/dax-user-defined-functions)

---

## Tech Stack

- **HTML5 / CSS3 / Vanilla JavaScript** — no framework, no bundler
- **Fonts:** [Inter](https://fonts.google.com/specimen/Inter) (UI) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (code) via Google Fonts

---

## License

MIT
