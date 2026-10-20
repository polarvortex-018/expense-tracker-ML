# Local Dashboard Question Box Design

## Goal

Add a dashboard question box to Cash Buddy that answers financial questions and questions about how to use the app. The first implementation targets the web app and keeps all question handling and data access local. Its JavaScript modules should remain reusable in the Android WebView app.

## Product scope

The first financial-query capability answers expense-total questions. It recognizes categories, description terms, and date ranges. A broad expense question groups its result by category. A question naming multiple items groups results by those items when they can be separated without double-counting.

The same question box also supports app-help questions by searching bundled, curated help content. The help path does not access financial records. Income questions, transaction creation or editing, and open-ended AI conversation are outside the first implementation.

## User flow

1. The dashboard shows one question box with a short description: “Ask about your spending, reports, or how to use Cash Buddy.” It can show examples such as “How much did I spend on petrol?”, “Show my spending by category last month,” and “How do I create another vault?”
2. A local router classifies the question as a financial question or an app-help question.
3. The financial parser produces a structured query, or a clarification/unsupported result. It never produces SQL.
4. The query runner reads from the active local SQLite vault with fixed query templates and bound parameters.
5. A result view opens over the dashboard. It displays financial summaries and breakdowns, or a help answer with a guide/screen link. Closing it returns to the dashboard and preserves the question.

## Financial query semantics

The initial query schema supports an expense-total intent, zero or more requested items, and an optional local-calendar date range. Requested items are typed as category matches or description terms; category and description are not interchangeable.

- If no date is specified, use all available history in the active vault.
- “Last week” means the previous Monday through Sunday.
- “This week” means Monday through today.
- “Last month” means the previous calendar month.
- “This month” means the first day of the current month through today.
- “Past N days” is a rolling range ending today.
- Explicit dates and ranges are inclusive and use the device's local calendar.
- A phrase matching a known category is treated as a category. An unrecognized item phrase such as “petrol” is searched in transaction descriptions, case-insensitively.
- If a phrase plausibly refers to multiple filters, and that choice could materially change the result, ask the user to clarify.
- If requested groups overlap, count each matching transaction once in the overall total. Only show a per-item chart when group assignment is unambiguous; otherwise explain the overlap and ask the user to refine the question.

All-time responses show the actual first and last matching transaction dates. Date-limited responses state the requested period, even when some days have no transactions. Daily details list dates with matching transactions and their totals.

## Result presentation

The result view is a reusable component presented as a modal on wider web layouts and full-screen on narrow layouts. It contains the original question, a close/back control, a plain-English summary, and the effective period.

Financial results include the total, transaction count, and the days with matching expenses. A daily breakdown shows each active date and its amount. For an all-time query, the summary gives the full matching date span and count of active days; the detailed date list is expandable so long histories do not dominate the view.

A pie chart is shown when there are at least two meaningful, non-overlapping groups:

- Broad expense questions are grouped by category, including an “Uncategorized” group where needed.
- Multi-item questions are grouped by the requested items.
- A single group or an empty result does not show a pie chart.

All currency formatting uses the active vault's configured currency. App-help results show a concise local answer and, where available, a link/action to the relevant guide or app screen.

## Architecture and privacy

Keep parsing, date interpretation, query execution, answer formatting, and presentation in separate modules. The financial query runner uses the existing frontend local SQLite/SQL.js connection and reads only from the active vault. SQL values are parameterized; user text is never interpolated as executable SQL. Help content is bundled with the app and searched locally.

The question flow makes no network requests and uses no remote model or service. No model is required for the first implementation. The shared router and query schema leave room for additional local capabilities later without coupling them to SQL execution.

## Error and ambiguity behavior

- Empty input asks the user to enter a question.
- Unsupported financial wording offers examples of supported expense questions.
- Unclear category/description or overlapping-group interpretation asks a targeted clarification instead of silently guessing or double-counting.
- A valid query with no matches states that no matching expenses were found for the interpreted period.
- Help search with no confident match offers nearby guide topics and examples rather than inventing an answer.

## Acceptance examples

- “How much have I spent on petrol?” matches `petrol` in descriptions across all time, reports the actual matching date span and active days, and does not require a category named Petrol.
- “How much on petrol last week?” uses the previous Monday-through-Sunday range.
- “How much did I spend last month?” returns a category breakdown and a pie chart when multiple categories have expenses.
- “How much on petrol and groceries?” returns a total and an item breakdown when the matches are disjoint; it does not double-count overlapping transactions.
- “How do I create another vault?” returns a bundled help answer through the same question box without querying transactions.
- An unsupported or ambiguous question does not execute a guessed query.

## Implementation sequence

1. Inspect existing dashboard composition, active-vault database access, currency formatting, and help-guide content locations.
2. Define plain JavaScript query/result types and a local question router.
3. Implement expense intent, category/description matching, and the agreed local date rules.
4. Implement fixed parameterized SQLite queries for totals, group breakdowns, active dates, and daily totals.
5. Add deterministic English answer templates and the responsive results view with conditional pie chart and expandable daily details.
6. Add bundled help search to the same question box and render help answers in the results view.
7. Connect the dashboard prompt, helper text, and example questions to the flow.
8. Review the changed query path for local-only behavior and keep all work on the existing local `dev` branch without pushing to a remote.
