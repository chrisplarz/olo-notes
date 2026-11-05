# Calendar mobile refinements — release 74

The existing compact weekly card uses date circles 18% larger than the previous clamp: 30.68px minimum, 9.44% of the card content width, and 70.8px maximum. Desktop circles keep their existing scale. Seven Sunday-first dates remain evenly distributed in one row.

Planned visits use the existing sauna background token, #f0dfd4. A 4px dot begins 3px below the date-number line box, independently of the circle size. Today's ring, recorded-day checks and accessible planned-visit counts remain intact.

Weekly navigation (previous, range, next) precedes the existing Today calendar control in visual and keyboard order. Swiping the date row right browses one previous week; left browses one next week. Horizontal movement must exceed 40px and be at least 1.5 times the vertical movement. Early vertical movement locks out week browsing. Native vertical scrolling and pinch zoom remain enabled. Cancelled or multi-touch gestures do not browse; swipes suppress accidental date activation. Navigation updates the existing week, totals, and Insights behavior without modifying saved journal or plan data.

References reviewed: the user's private mobile screenshot, Ølo Notes Design System file ZFaJvHXzlUXyopMzk3kZm3 journal patterns page 2:6, and mobile weekly card 69:694 in component set 69:760. Existing typography, icons, semantic colors, card structure, and responsive rules are reused. This update adds no new visual component or semantic token. Figma still needs the updated date sizing, plan-dot specification, control order, and swipe interaction documented; code and Figma do not synchronize automatically. Private screenshots are excluded from source and GitHub.

Changed files: index.html, sw.js, generated dist equivalents, .openai/source-sync.json, the focused gesture tests, CI registration, two stale baseline test assertions and this note. No database, authentication, runtime dependencies, or hosting-audience changes.

Validation: release drift check, all 57 Node checks, and all 140 browser checks pass (135 in the full run, plus the five corrected baseline assertions verified in the focused rerun). Eight new browser checks verify size increases and 3px spacing at 320/390/430/768/1280px, native Chromium touch swipes through disabled past dates, vertical scrolling, diagonal gesture rejection, cancellation, multi-touch, date taps, and unchanged journal data. Compact and desktop screenshots were reviewed. Physical iPhone/Safari gestures were not exercised.

The full baseline run reproduced five failures before these calendar edits: four stale Lora metric-font assertions after the approved Plus Jakarta Sans change, and one status-text assertion after Fort Union adopted separate status/detail elements. Tests now assert the existing approved font and both status elements; production typography and status behavior were not changed.
