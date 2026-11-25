# Ølo Notes — approved Home behavior addendum

## Weekly activity

- Enclose the calendar and three totals in one card titled “This week's activity”.
- Place “Tap a day to revisit or schedule an upcoming visit.” below the title and align the week range to the card's right content edge.
- Show seven Sunday-first date circles with weekday labels below. Completed days use a check inside a filled circle; today has an additional outer ring in both completed and unvisited states.
- Preserve existing recorded-visit review, multiple-visit selection, today/future planning, and scheduled-visit review/edit actions. Plans remain visually distinct from attendance.
- Below a divider, show equal-width tiles for Weekly visit goal (target icon, completed-day number / goal), Sauna time (flame, warm fill, minutes), and Cold plunge time (snowflake, blue fill, minutes).
- Count distinct completed local visit dates once. Scheduled visits and stopped drafts do not contribute to completed days or minutes. Preserve unset and exceeded goals and local week rollover.
- The goal tile opens Settings; time tiles open weekly Insights. Remove segmented progress, remaining-days copy, and the progress explanation.
- Support 320px mobile through desktop with wrapping labels, keyboard activation, visible focus, and no horizontal overflow.

## Today’s Thought disclosure

- The title/arrow and “Read more” operate the same expander.
- Use one native button for “Read more” / “Read less”, with aria-expanded synchronized with the header and aria-controls referencing the disclosure body.
- When collapsed, place “Read more” at the far right of the attribution row. Keep the card’s content padding even and avoid excess space below the row. When expanded, move that same control below the quote source link and label it “Read less”. Topics without a source place the control after the reflection body.
- Activating “Read less” collapses the body and restores the control at the right side of the attribution row. Preserve focus when moving the activated control.
- Keep the source link independent: it opens the original source in a new tab and does not toggle the card.
- Collapsed content is inert and unavailable to keyboard focus. Buttons retain a minimum 44px height and visible keyboard focus. Expansion respects reduced-motion preferences.
- Preserve daily content selection, topics, quote attribution, production Georgia typography, and journal/timer/sync data.

## Validation and scope

Weekly layout and existing day actions were verified at 320, 390, 768, 1024, and 1280px. Thought disclosure checks cover 320, 390, and 1280px, keyboard Enter/Space, focus restoration, source ordering, source-free topics, motion preferences, and journal storage preservation.

This addendum is prepared for incorporation into the user's canonical application spec once its path or link is identified. It does not replace an existing spec.
