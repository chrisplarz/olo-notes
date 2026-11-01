# Insights exploration branch

Unmerged experiment on `feature/insights-exploration`. No live Ølo Notes deployment or database changes.

Insights reads completed journal visits into a shared overview and three views:
- My rhythm: distinct days, attendance buckets and a clearly labeled weekly goal using the current preference. No historical goal settings are inferred.
- How I feel: paired before/after means, improved/unchanged/lower counts and all three intention responses. Missing responses are excluded; existing mood defaults cannot be distinguished from deliberate choices and are disclosed.
- My rituals: sauna/cold/rest totals, proportions and median recorded visit/interval lengths. Unrecorded breaks are excluded.

Period options are this week, last 28 days, this month and year to date. Home links retain their selected-week context. No invented sample values appear in the app. Aggregations do not write journal data or change authentication, exports, sync, or storage identifiers.

## Baseline and packaging

Started from GitHub main `661e7be`. Main already contained runtime changes newer than its prepared release-55 package: home ripple/weekly-navigation changes, visit controls and temperature defaults, account outline, and botanical/share icon additions. Those source changes are retained. The pre-existing source/dist mismatch was repaired through `scripts/release.mjs prepare --version 58`, after explicitly reconciling the reviewed GitHub baseline; the release guard was not disabled. Revision 58 identifies this unshipped branch package only.

## Design reference

Reuses source-backed metric card, tab, card, progress and semantic color styles. Inspected Ølo Notes Design System `ZFaJvHXzlUXyopMzk3kZm3`, Tab default `4:73` (including design context and screenshot), with metric-card reference `6:116` documented in `metric-card-release-52.md`. No new Figma component or token was created. The composed Insights screen still needs Figma synchronization if this experiment is accepted.

## Try locally

Serve this checkout with `python3 -m http.server 8765 --bind 127.0.0.1` and open `http://127.0.0.1:8765/`, then Insights. This preview has its own browser storage; use a journal backup or test entries. The production app is unchanged.

## Verification

New browser coverage exercises 320/390/768/1280px, all views and periods, selected-week navigation, missing/empty values, exact aggregates, future-date exclusion and unchanged journal data. Existing reflection and selected-week assertions reflect the new explicit chart labels. CI runs the new suite.

Verification result: 46/46 Node checks passed. Full browser run: 116/123 passed; all seven failures reproduce on unchanged main (five stale Home past-date color assertions, a stale Home goal-label assertion, and the hero hover animation test). After final chart-label refinement, all 13 focused Insights/reflection/design-parity checks passed. Phone and desktop screenshots were visually reviewed. Physical iPhone Safari and real-account sync were not exercised; account and backup coverage uses isolated fixtures.

## Review refinements

Restored native segmented Day / Week / Months / Year buttons, defaulting to Week. Day shows today's visits; Months shows the current calendar month. Removed the period dropdown. A footer button switches between the original main-branch Insights renderer and the experimental renderer in the same preview, preserving journal data and period selection. This compares the two page implementations without switching servers, deployments or data stores. No actual Git checkout occurs from the browser. Four responsive browser cases verify day totals, both directions of the version switch, period selection and unchanged journal data; all pass, as do all 46 Node checks.

## Reconciled with published Guided Rituals

Merged main `f539db4d119a9529a4408d5c153bc9a552cc64dc` into this review branch. Retains the Insights experiment, Day/Week/Months/Year controls and original/experimental comparison, plus Guided Rituals, imagery, manual Add visit, current journal safeguards and the Ubuntu 24.04 CI runner. The original Insights comparison now uses current main’s goal-completion metric while retaining the branch’s Day option. Tests retain the newer Home week-title assertions and check the experimental selected-week totals/date label. No database or Figma changes.

Regenerated canonical output and hashes through the release guard as revision **60**, identifying this unshipped review package only. Live Sites remains version 48 / shell 59. No Sites publication or main merge is part of this conflict resolution.
