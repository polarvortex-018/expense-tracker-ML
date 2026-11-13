# Settings Calculator Design

## Goal

Add a local planning calculator as a subpage in the More/Settings hub. The calculator evaluates arithmetic and scratchpad starting balances without writing to accounts, transactions, or savings buckets. Named snapshots are stored in the active vault's SQLite database, so normal vault export and backup behavior carries them.

## Structure

- `SettingsView.vue` adds the More tile, calculator subpage, and Android Back delegation.
- `CalculatorView.vue` owns expression terms, labels and icons, undo, calculation history, starting amount, snapshot controls, and responsive layout.
- `BucketDial.vue` owns the savings bucket picker, animated circular selection, pointer rotation, arrows, multi-select, and body-level mobile dialog.
- `calculatorMath.js` is a pure arithmetic helper for precedence, finite-number checks, divide-by-zero, formatting, and expression display.
- `schema.js` creates `calculator_snapshots` inside each active vault database; `api.js` validates and lists, inserts, and deletes snapshot records.

## Data flow

1. Keypad or focused keyboard input updates editable expression terms.
2. Operators commit the current operand into the working expression; labels and icons stay on their term records.
3. Evaluation applies multiplication and division before addition and subtraction, rejects invalid or non-finite expressions, and rounds results to cents.
4. Manual starting amount and captured active bucket balances remain scratchpad values. Available after plan is their sum plus the signed result.
5. Saving validates the name and expression before inserting a JSON payload into the currently loaded vault database. A restore copies the payload into working state; it does not update the saved record.

## Mobile and navigation

The calculator uses a stacked layout on narrow screens and a calculator/history sidebar layout on wide screens. The bucket dialog teleports to `body`, limits its height to the viewport, scrolls its content, and keeps Done visible. Settings delegates Android Back to the calculator first; the calculator closes the dialog before the Settings page closes. Ask Cash Buddy remains at the top level of More/Settings.

## Validation

The API rejects missing or oversized names, malformed payload structure, non-finite results or starting amounts, and oversized serialized snapshots. The view reports validation errors inline and leaves the working calculation untouched.
