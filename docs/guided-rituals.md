# Guided Rituals — local implementation review

Implemented on local branch `codex/guided-rituals` in `sites/olo-guided-rituals`. The user subsequently authorized the required testing batch and publication. App shell release 59 is prepared for the existing Sites destination. Validation passed: 57/57 Node checks and 125/125 browser checks, including the existing required release/design-parity suites and Guided Rituals cases. No database or Figma writes were made.

## Experience

Visits uses one top keyboard-accessible selector: the timer icon with Live Timer first, followed by Guided Session. The former Session / Post-visit entry row and nested selector have been combined. Manual post-visit entries open from Add visit. Live Timer keeps its existing functions and draft. Changing tabs does not start, pause, finish, or discard either timer; a notice identifies a session still timing in the other tab. The manual entry form stays available through Add visit, and either session tab returns from that form without clearing its draft.

Guided offers four preset tiles, each with a 52px rounded photo thumbnail, title, description, step count, planned duration and chevron:

| Preset | Sequence | Total |
| --- | --- | --- |
| Mindful Reset | Sauna 8m → Rest 8m → Reflection 3m | 19m |
| First Dip | Sauna 5m → Rest 5m → Cool Down 30s | 10m 30s |
| Nordic Contrast | Sauna 10m → Rest 5m → Cold Plunge 30s → Rest 5m → Sauna 10m → Rest 5m | 35m 30s |
| Pure Sauna | Sauna 8m → Rest 8m | 16m |

Selecting a preset saves an editable preview, never a running timer. A session copy supports 30-second duration adjustments, all five activities, adding/removing steps, keyboard-operated move-up/down controls, preset restoration, an optional intention and returning to the list. Start Ritual is a separate action. At least one step is retained; the editor supports up to 100 steps and the existing app's 24-hour per-step duration ceiling. These are data-entry limits, not suggested exposure times.

Active sessions show the current activity, step position, countdown, subdued planned-time progress, planned/actual duration and upcoming activity. Pause/Resume, Complete & Next, Skip Step and End Ritual are explicit actions. Zero never advances a step: actual time continues until pause or a transition. Every cold-plunge step waits without accumulating time and requires a separate confirmation, including a cold step placed first in a customized ritual. Skipping cold is always possible.

Ending early preserves the current step as partial and later steps as not started. Review presents Planned vs. Actual before saving, duration/temperature correction, optional moods, intention, reflection and date. Original measured durations and timing segments remain in the record after correction. The user can keep the draft for later. Saved ritual visits show the summary in history and reopen the ritual editor for correction.

## Architecture and data

The canonical app remains self-contained in `index.html` for the existing offline packaging and test fixtures. Clearly marked Guided Ritual Styles, Core and UI sections keep responsibilities separate without new dependencies or a build step.

- **Templates:** deeply frozen, versioned configuration in `OloRituals.templates`. New presets use the same generic tile/editor/countdown interface. Session copies include the original template snapshot; Restore uses that snapshot.
- **Timing:** a pure transition engine accepts timestamps. `runningSince`, accumulated `actualMs`, original `recordedMs` and completed timing segments preserve active elapsed time over backgrounding/reload while excluding pauses. Clock reversals are bounded and marked uncertain. Foreground recovery marks a running step for review rather than inventing a stop time.
- **Local session:** `db.guidedRitual` is separate from `activeVisit`, which remains the Live Timer draft. It persists through the existing atomic journal write/rollback and account-owned storage. `db.guidedRitualEdit` keeps edits to a saved visit separate from an in-progress ritual. Another-tab stale-state checks and owner/session/step-bound cold confirmations protect transitions.
- **Journal:** explicit Save creates one visit using the session ID, `source: 'guided'`, a standalone `ritual` snapshot and ordinary actual-duration `intervals`. Duplicate saves do not append new records. Existing cloud merge/conflict handling is retained; editing refuses to overwrite a saved visit changed elsewhere. No earlier records are migrated or rewritten.
- **Metrics:** Sauna and Cold Plunge map to the existing heat/cold types. Rest, Cool Down and Reflection map to rest, retaining their specific activity labels and ritual metadata. Cool Down does not imply cold-water immersion. Planned durations and pending/zero-duration steps do not add exposure minutes.
- **Sync:** completed/partial saved ritual visits use the existing Supabase JSON journal payload and owner controls. Active/review drafts remain device-local, matching the existing Live Timer architecture. They are not cross-device timer sessions. No schema, RLS, auth, API or credential changes are needed.
- **Export/import:** JSON retains full saved ritual metadata, with validation on import. CSV keeps its original columns and appends ritual identity, plan, status, measured time, corrections, uncertainty and timestamps; skipped/unstarted ritual steps get rows too. Existing backups cannot erase a local unfinished ritual during either restore mode. As with the existing active Live Timer, ordinary JSON export does not include an in-progress ritual; save a partial ritual before moving devices.

## Changed files

- `index.html`: styles, configuration, timing engine, UI, recovery, journal editing, backup validation/preservation, CSV integration and image-backed preset thumbnails.
- `assets/rituals/{mindful-reset,first-dip,nordic-contrast,pure-sauna}.jpg`: four generated, locally packaged thumbnails.
- `sw.js`: adds the four thumbnail URLs to the existing offline asset list; shell revision remains pending release preparation.
- `docs/guided-ritual-imagery.md`: prompt set, brand direction and asset provenance.
- `tests/guided-rituals.test.cjs`: new pure-engine cases for presets, pauses, overtime, cold consent, recovery, partial/skipped records, corrections, template snapshots, clock reversal and validation.
- `tests/guided-rituals.browser.test.cjs`: new browser cases for responsive editing, independent timers, reload, cold confirmation, partial saving, correction, backup round-trip, idempotency and failed storage writes.
- `tests/visits-page.test.cjs`: checks the single top selector, its order, no duplicate inner selector, and manual entry via Add visit; includes the DOM attribute-removal stub.
- `tests/intentions.browser.test.cjs`: uses Add visit for manual entry and the Live Timer tab to return, preserving the existing intention scenario. `tests/intentions.test.cjs` adds the DOM attribute-removal stub needed by the session panel.
- `.github/workflows/backup-tests.yml`: includes the new cases for a future authorized CI run; retains all existing suites.
- `docs/guided-rituals.md`: implementation and review record.

## Design and outstanding review

Reuses the existing pine/paper/activity colors, Manrope and DM Sans typography, card/field/button styles, activity icons within session controls and the shared dialog button bar. The four preset cards use coordinated generated photographs, matched to the misty pine, lake, stone and wood palette of the existing brand landscape. Georgia quote styling is unchanged. Controls have 44px minimum targets, labels, visible focus and logical keyboard order. New appearance/progress transitions are 240–250ms and disabled with reduced motion. Four optimized 208px JPEG thumbnails were added under `assets/rituals/`; no fonts or dependencies were added. The generation prompts and asset provenance are recorded in `docs/guided-ritual-imagery.md`.

Figma access failed through the Ølo Apps account for app frame `2xNboef6xqT9T3EHYEyNQm` / `10:8155` and metadata of design-system file `ZFaJvHXzlUXyopMzk3kZm3`; the connector reported unavailable file access. No successful current Figma node inspection or full parity is claimed. Existing implementation styles and the repository's prior reference records were used provisionally.

Proposed additions to the existing design system, still awaiting Figma access and phone/desktop review: Unified Live Timer / Guided Session selector, ritual preset tile, editable sequence row, guided countdown/waiting/paused/elapsed states, cold confirmation, and Planned vs. Actual review/correction. Reuse the system's foundations and existing card, button, field, activity and dialog patterns; no new semantic tokens are proposed. Review the app dialog references `10:11933` / `10:12021`, Post-visit Entry `10:8155`, and the relevant system components when access returns. These are references to inspect, not nodes claimed reviewed during this task.

Validation: 57/57 Node checks and 125/125 browser checks passed in Chromium, including release, design parity, backups, accounts, cloud-merge mocks, Live Timer, manual entry, and Guided Rituals. Isolated 390px and 1280px screenshots of selection, preview and countdown were reviewed. The unchanged GitHub baseline was verified online. Figma access was retried and remains unavailable. Physical iPhone Safari, screen-reader testing, and real-account cross-device sync acceptance remain unverified; mocked checks do not establish those production guarantees. Existing related gaps remain explicitly deferred, with no claim of full Figma parity.

## Baseline and release status

| Item | Observed baseline |
| --- | --- |
| Existing Site | `appgprj_6ad0ed618ee081918f2ce51dc0aca31c`, `https://olo.chrisplarz.chatgpt.site` |
| Sites metadata | Latest saved Site version reported as **47**; this is separate from the shell revision |
| Sites source commit | `a252720461f6771d01ac790bf99eeaa8407f273c` |
| App shell revision in that source | **58** |
| Approved GitHub archive | `chrisplarz/olo-notes`, `main`, `661e7be21b8df769282d94e31cafa020cdb042b0` |
| Initial guard | `node scripts/release.mjs check --online` passed: revision 58, 17 runtime files, GitHub checked |
| Baseline index SHA-256 | `99f7df4f2749e12a8e9fb0ff02e1256ba25eabe3b47f636d27edf7320dd5e3c8` |
| Baseline service-worker SHA-256 | `29da878bed560dcc5edb00c8ba951b40b3f41faec4544026fa8e8616c1e71ff0` |
| Candidate canonical index SHA-256 | `3cb09f9c3f584eba1c531e6b4f62b4ab473b7c49757d53fd227085a437cadf1a` |
| Candidate publication / archive | Shell 59 prepared and tested; deployment and archive results recorded separately |
| Figma parity | Provisional reuse of implementation; current inspection and synchronization blocked by access |

The earlier `olo-current-review` checkout was stale and its guard correctly rejected newer GitHub changes. This work instead opened fresh Sites source with the supported helper and preserved its newer Home, timer, mood, rest-temperature and Close-label refinements. Older/pending checkouts were inspected and left untouched. The current checkout also contains the reviewed repository rename to `olo-notes`; no destination was changed.

Release 59 was prepared through `node scripts/release.mjs prepare --version 59`; canonical source, generated `dist/`, service-worker revision and `.openai/source-sync.json` match. Source-helper packaging must repeat the online guard immediately before pushing. The user authorized publication before further Figma adjustments. Preserve the existing Sites audience and URL, verify the deployed release and appearance, then archive the exact runtime through a reviewed GitHub PR with successful CI. The separate draft Insights experiment PR #40 is excluded.

Local source preview: `http://127.0.0.1:4178/#guided` (opened for user review). Isolated phone/desktop flows and rendering were subsequently checked; private QA screenshots were kept outside source. This loopback URL is on the development computer and is not a public or physical-iPhone deployment.
