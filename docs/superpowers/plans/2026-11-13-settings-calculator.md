# Settings Calculator Implementation Plan

1. Add pure arithmetic evaluation and expression formatting in `frontend/src/utils/calculatorMath.js`.
2. Add a per-vault `calculator_snapshots` table and validated list/save/delete methods in the existing SQLite schema and API.
3. Build `BucketDial.vue` with active bucket balances, multi-select, removal, pointer swipe, arrow keys, previous/next controls, body portal, and a fixed Done action.
4. Build `CalculatorView.vue` with keypad and focused keyboard input, precedence-based evaluation, validation, sign/percent/backspace/clear/equal/undo, editable labels and Material Symbols, working and completed history, scratchpad balances, signed remaining amount, and saved snapshots.
5. Add the More tile and calculator page in `SettingsView.vue`; delegate Android Back to the dial before leaving the page. Preserve Ask Cash Buddy.
6. Update the root `VERSION_HISTORY.md` for v0.08.00 and v0.08.01.
7. Verify with the frontend production build, Capacitor Android sync, Android debug APK build, and mobile checks for editors, snapshot restoration, dial dismissal, and signed balance arithmetic.
