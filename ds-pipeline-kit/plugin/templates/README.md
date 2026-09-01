# Templates

Starting points for the documents this pipeline produces. Each mirrors a contract defined in a
skill — the skill is authoritative, and where a template and its skill disagree, the skill wins.

| Template | Produced at | Governed by |
|---|---|---|
| `requirements-brief.md` | stage #0 | `component-requirements-builder` |
| `component-spec.md` | stage #4 | `component-spec-writer` |
| `retrofit-addendum.md` | before a mechanical change to a spec-less component | the pipeline rule |
| `pr-1-body.md` | opening PR-1 | the pipeline rule |
| `pr-2-body.md` | opening PR-2 | the pipeline rule |

**Write only the sections the component actually needs.** An empty heading left in to satisfy a
template is worse than an absent one: it reads as "considered, nothing to say" when the truth is
"not considered". Delete what does not apply.
