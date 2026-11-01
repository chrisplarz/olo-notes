# Visits panel — November 1, 2026

Reference: Olo Notes file `uUSYiwpSoqZGEJdG9Jfksi`, selected nodes `136:1277`, `136:1281`, `144:2943`; implementation detail reviewed at `143:1921` and `144:2677`.

The existing heading and intro already match the selection. The session switch and content now share a paper card, with a sand switch track and pine active tab. The ritual picker uses the approved image crops, order, larger thumbnails, and sand tiles. Below 1100px the cards stack; thumbnails reduce to 64px on phones to preserve readable text. Timer, guided customization, saved visits, local storage and account sync behavior remain unchanged.

Reconciled the reviewed GitHub Insights release 60 before preparing release 61; no previous runtime feature was removed. The design system baseline file was inaccessible through the Olo Apps connection; existing app components, typography and semantic tokens were reused, with no new Figma component required. No database changes.

## Live Timer follow-up — release 62

Selected nodes `133:430`, `133:51`, `133:48` update the Live Timer card, intro copy, activity-button spacing and intention-card divider. The existing animated timer ripple remains intact. The activity dot appears only while Guided Session is selected and a live interval is running: sauna uses `--heat`, cold plunge `--cold`, rest `--rest`. It is hidden when idle, paused, ended, or when Live Timer itself is selected. An accessible description announces which timer is running without changing the tab name. No database or new design-system component changes.
