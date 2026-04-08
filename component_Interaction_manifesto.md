# AME Component Interaction Manifesto

> author: ceaserzhao  
> date: 2026-04-08  
> status: living document

---

## I. The Core Metaphor: An Instrument, Not an App

AME is not a consumer application. It is a **scientific instrument**.

A physical instrument — an oscilloscope, a spectrometer, a lathe — does not greet you. It does not animate. It does not ask if you are sure. When you turn a dial, it responds to that action and only that action. It is always ready. It never wastes your attention.

Every interaction decision in AME must pass this test:

> *"Would a precision instrument do this?"*

If the answer is no, cut it.

---

## II. The Architecture of Interaction: Addition, Not Navigation

AME is a **workbench**, not a multi-page app.

The interface does not navigate between screens. It **accumulates components**. Each component is an independent processing unit that can be added to the workbench. The whole system grows by addition — like assembling a physical rig, one instrument at a time.

```
┌──────────────────────────────────────────────────────────────┐
│  AME Workbench                                               │
│                                                              │
│  [ Rector ]   [ Component B ]   [ Component C ]   [ + ]     │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│         Active component panel expands here                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Consequences of this model:

- **No page routing.** Components are panels, not pages.
- **No modal interruptions.** Configuration happens inline, within the component.
- **Shared substrate.** All components read from and write to the **Information Pool** — the central data bus of AME.
- **Uniform visual language.** Every component looks and behaves as part of the same machine. A user who knows Rector already knows how to operate the next component.

---

## III. The Information Pool

The Information Pool is the connective tissue of AME.

```
  AME Rector
      │  outputs: scene layout (walls / doors / windows / objects)
      ▼
┌─────────────────────┐
│   Information Pool  │  ← persistent structured data store
└─────────────────────┘
      │  downstream components read from here
      ▼
  Component B, C, D ...
```

Rules governing the Pool:

1. **Components do not talk to each other directly.** They communicate only through the Pool.
2. **The Pool is append-friendly.** Each component run adds a new record; it does not overwrite prior results.
3. **The Pool is inspectable.** There must always be a way for the user to see what is currently in the Pool — what has been processed, what is waiting, what failed.

---

## IV. The Interaction Rhythm of a Single Component

Every AME component follows the same internal rhythm. This is not a convention — it is a **law**.

```
IDLE
  │
  │  user loads input
  ▼
INPUT READY
  │
  │  user configures parameters
  ▼
CONFIGURED
  │
  │  user triggers RUN
  ▼
PROCESSING
  │  (feedback at every stage — never a black box)
  │
  ├─ success →  DONE   → result written to Information Pool
  └─ failure →  ERROR  → precise message, recoverable
```

The state must always be **visible**. The user must never wonder: "Is it running? Did it finish? Did it crash?"

---

## V. The State Machine of AME Rector

Rector is the first component. Its state machine is the reference implementation for all future components.

```
Idle
  → (file dropped or selected)
Input Ready
  → (user reviews config)
Configured
  → (RUN clicked)
Processing · Stage 1 — SAM3
  → (point cloud generated)
Processing · Stage 2 — SpatialLM
  → (layout predicted)
Done
  → result displayed in Output Preview
  → scene data written to Information Pool
Error
  → specific message shown (which stage failed, why)
  → user can retry from Configured state without re-uploading
```

State indicators must be **precise**. Not "Processing..." but "Running SAM3 — segmenting objects". Not "Error" but "SpatialLM: model path not found at ./models/SpatialLM1.1-Llama-1B".

---

## VI. Guidance Without Hand-Holding

The interface must be operable by a user with no technical background. But it must not condescend to an expert.

The solution is **information hierarchy**, not animated tutorials:

- **Required vs. optional** fields are visually distinct at a glance.
- Every configuration input has a one-line description in muted gray beneath it, explaining what it controls and what the default means.
- Errors are **diagnostic**, not apologetic. Tell the user exactly what went wrong and what to do.
- Sensible defaults are pre-filled. A user who clicks RUN without touching anything should get a reasonable result.

Example of correct error copy:
```
✗  Model not found — expected SpatialLM1.1-Llama-1B at ./models/
   Download: huggingface-cli download manycore-research/SpatialLM1.1-Llama-1B
```

Example of wrong error copy:
```
✗  An error occurred. Please try again.
```

---

## VII. Interaction Rules

These rules have no exceptions.

**1. Instant feedback.**  
Every user action produces a visible response within one frame. No delayed acknowledgement.

**2. No blocking UI.**  
Long-running AI processes (SAM3, SpatialLM inference) must never freeze the interface. Run on a background thread or worker; the UI stays alive and shows progress.

**3. No destructive defaults.**  
The RUN button does not overwrite previous results without warning. The user must be able to compare the current run against the last.

**4. Recoverability.**  
An error state must always offer a clear path back. The user does not need to reload the page or re-enter their file to retry.

**5. Explicit over implicit.**  
If something is happening, say so. If a file was accepted, confirm it. If the Pool was written to, show it. Never let the user infer what the system is doing.

**6. Silence is reserved for success.**  
Do not display a success toast for every minor action. Reserve explicit confirmation for operations that have lasting consequences — a completed run, a save, a delete.

---

## VIII. Visual Interaction Grammar

Derived from the Design Manifesto. These are the interaction-layer expressions of the visual rules.

| Element | Default | Hover | Active / Focus | Disabled |
|---------|---------|-------|----------------|----------|
| Button (primary) | white bg, black text | `#cccccc` bg | `#aaaaaa` bg | `#333` bg, `#555` text |
| Button (ghost) | transparent, border `--border` | `--bg-hover` bg | border `--border-focus` | opacity 0.3 |
| Input field | `--bg-input` bg, border `--border` | — | border `--border-focus` | opacity 0.4 |
| Drop zone | dashed border `--border` | dashed border `--border-focus` | solid border `--border-focus` | — |
| State dot | gray (idle) | — | — | — |

Color of state dots:

| State | Color | Hex |
|-------|-------|-----|
| Idle | muted gray | `#555555` |
| Processing | light gray (pulsing) | `#999999` |
| Done | white | `#f0f0f0` |
| Error | light gray | `#888888` |

> Note: No color is used to convey state. Shape, brightness, and text carry the semantic weight.

---

## IX. What This Manifesto Is Not

- It is not a wireframe specification.
- It is not a component API contract.
- It is not final.

It is the set of **first principles** that every interaction decision in AME should be traceable back to. When there is a design disagreement, come here first.

---

*"Eliminate the unnecessary so that the essential may speak."*  
*Structure is Beauty. Logic is Elegance.*
