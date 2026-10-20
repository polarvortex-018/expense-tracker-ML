# Cash Buddy — Complete Release & Version History

This document tracks the complete versioning roadmap for Cash Buddy, mapped directly from project git commits and development milestones.

**Versioning Schema**: `v0.xx.yy`
- `xx` = Major Feature Milestones & Architectural Shifts
- `yy` = Minor Refinements, Bug Fixes & UX Polish

---

## Current Version: **`v0.07.13`**

---

## Version History Log

### **v0.07 — Reports & Spending Insights**
- **`v0.07.13`** *(Current)*
  - Added **Cash Buddy**, a fully local natural-language question tool in Settings, with help search for app questions and a guide to supported query types.
  - Expanded the parser for expense and income totals, money sent home, category/account/bucket and description matching, transaction counts, rankings, averages, recurring expenses, recent spending amounts, daily spending guidance, and multiple non-contiguous date ranges.
  - Made question matching use the active vault’s categories, accounts, and buckets; added fuzzy name correction with clarification when a name could refer to more than one item.
  - Added interactive answer results with animated totals, colored donut charts, plain-English summaries, date and bucket selectors, category comparisons across months, and matching transactions grouped by day. Excluded salary allocations and internal pool movements from spending totals.
  - Improved mobile results with a question-help guide, incremental transaction loading, a visible Back to questions button, Android safe-area spacing, and Android Back handling that closes the answer first.
  - Removed an artificial query-loading delay and rebuilt the local Android debug APK.
- **`v0.07.12`**
  - Split categories into expense and income types, defaulted existing and newly created categories to expense, added type selection when creating or editing categories, filtered transaction quick-select and picker options by transaction type, and added category creation directly from the transaction picker.
- **`v0.07.11`**
  - Replaced the adaptive-icon splash resource with the transparent high-resolution logo drawable directly; removed the wrapper after the splash continued to display as a square. Clean Android debug APK build succeeded.
- **`v0.07.10`**
  - Wrapped the high-resolution splash logo in an Android adaptive icon so the system keeps it circular through the splash-to-app transition.
- **`v0.07.09`**
  - Deleted the legacy square splash images in all Android density/orientation folders and removed the scripts that regenerated them.
- **`v0.07.08`**
  - Removed the legacy square launch-window background so the Android splash no longer changes from the circular high-resolution logo to a square image.
- **`v0.07.07`**
  - Pool allocation now moves funds from Unallocated Funds into a selected bank account while adding them to the chosen savings bucket.
- **`v0.07.06`**
  - Added person-level **Settle all**, which nets active lent and borrowed entries, settles the difference through the selected account, restores bucket allocations, and retains individual settlement controls.
- **`v0.07.05`**
  - Fixed debt entry submission being blocked when the optional reason field is empty and made the Record Debt control explicitly open its form.
  - Updated the Android splash to use the app’s 512px transparent logo asset instead of a density-scaled launcher image.
- **`v0.07.04`**
  - Replaced native report month dropdowns with app-styled month/year pickers, removed the redundant comparison-filter note, and made Android Back close an open report detail first.
  - Grouped debt records by person, added per-person detail views and repeat debt entries with a required reason; each entry remains independently settleable.
- **`v0.07.03`**
  - Fixed the Android launch splash to display the transparent Cash Buddy logo without the launcher tile background.
  - Changed native database and backup sharing to pass files explicitly without a text-only payload, preventing WhatsApp from sending only the caption.
- **`v0.07.02`**
  - Added category and savings-bucket drilldowns with average, highest, and lowest expense transaction amounts plus matching transactions.
  - Made report exclusions persist across month and custom-range changes within the active vault, carrying forward saved exclusions when available.
- **`v0.07.01`**
  - Updated monthly reports with readable month/year selectors and direct comparison of any two months; the default is labeled as the previous month’s report.
  - Changed category insights to rank spending categories by transaction count and total amount.
- **`v0.07.00`**
  - Added private, on-device monthly and custom-range reports with category and savings-bucket spending breakdowns, period comparisons, and per-month exclusion filters.
  - Excluded transfers, internal savings allocations, and balance adjustments from report totals.
  - Corrected transaction category names returned by the local API so reports and other transaction views can display them accurately.

### **v0.06 — Multi-Theme Engine & Semantic Token System**
- **`v0.06.04`**
  - **Enter-to-Save on Description**: Pressing Enter on description input in transaction creation saves transaction directly without jumping to notes field; updated mobile floating input in `App.vue` to dispatch Enter KeyboardEvents to target elements.
  - **Editable Savings Bucket in Edit Mode**: Integrated `BucketPicker.vue` in Step 2 of `TransactionForm.vue` to view and edit assigned savings buckets with 1 tap.
  - **Unassigned Bucket Filter Option**: Added "Unassigned" button option under Savings Buckets in the History Filter Drawer (`TransactionList.vue`) and updated filter matching to display unassigned transactions.
  - **App-Aesthetic Sort Sheet & Flat Amount Sorting**: Replaced native HTML `<select>` with custom popover sheet modal (`showSortModal`) matching Cash Buddy's dark pastel theme. Implemented flat continuous list rendering when sorting by Highest or Lowest Amount without breaking into date headers.
  - **Capacitor Android Sync**: Rebuilt production assets (`npm run build`) and synced Capacitor Android bundle (`npx cap sync android`).
- **`v0.06.03`**
  - **In-App Encrypted Backup Passphrase Modal**: Replaced raw browser `prompt()` dialog with a dark glassmorphic modal in `SettingsView.vue` (`#0f1019` container, `#1f202e` borders, `backdrop-blur-md`), featuring target filename banner, password visibility eye toggle button, 8-character validation, and sleek action buttons (`Cancel` and `Encrypt & Share`).
  - **Floating Glassmorphic Island Nav Dock**: Mobile bottom navigation in `App.vue` styled as a floating capsule island (`bottom-3 rounded-3xl backdrop-blur-xl bg-[#0c0d14]/90 border border-[#1f202e] shadow-2xl`) with active tab glow pills.
  - **Ambient Radial Breathing Pie Chart Glow**: Multi-stop `<radialGradient>` and smooth 3.5s breathing pulse animation (`animate-breathe-glow`) on both Home (`Dashboard.vue`) and History (`TransactionList.vue`) charts.
  - **Android Production Build**: Rebuilt Capacitor Android assets and compiled debug APK (`BUILD SUCCESSFUL in 9s`).
- **`v0.06.02`**
  - **Ambient Radial Breathing Pie Chart Glow**: Replaced flat SVG blur circles with a multi-stop `<radialGradient>` and smooth 3.5s breathing pulse animation (`animate-breathe-glow`) on both Home (`Dashboard.vue`) and History (`TransactionList.vue`) charts.
  - **Floating Glassmorphic Island Nav Dock**: Transformed mobile bottom navigation bar in `App.vue` into a floating capsule island dock (`bottom-3 rounded-3xl backdrop-blur-xl bg-[#0c0d14]/90 border border-[#1f202e]`) with glowing active tab capsule highlights and an elevated center `+` FAB button.
  - **Native Backup Direct Save & WhatsApp Attachment Fix**: Fixed Android Capacitor file sharing bug in `services/api.js` by omitting text body strings so WhatsApp attaches actual `.sqlite3`/`.db`/`.json` file binaries. Created `saveNativeFile()` helper to save backup files directly to device `Documents` folder without popping up the native share sheet.
- **`v0.06.01`**
  - Expanded **Multi-Theme Engine** to 7 theme presets with light theme variants: `nordic-light` (Frost Blue `#0284c7`) and `emerald-light` (Forest Mint `#059669`).
  - **High-Contrast Light Mode Overrides**: Resolved text contrast bugs, mapped arbitrary Tailwind hex utilities (`bg-[#...]`, `text-[#...]`, `border-[#...]`, `hover:bg-[#...]`) to semantic CSS variable tokens.
  - **Card Hover & Active State Fixes**: Replaced pitch-black hover boxes (`hover:bg-[#141520]`) with dynamic container highlights (`var(--bg-container-high)`).
  - **Interactive Spotlight Tour Auto-Centering**: Fixed off-screen tour element bugs by adding instant centered scrolling (`scrollIntoView({ behavior: 'auto', block: 'center' })`), multi-frame coordinate passes, and strict viewport clamping for tour highlight cutouts and tooltips.
  - **Responsive PC Mouse Drag-and-Drop**: Updated `handleDragPointerDown()` in `SettingsView.vue` so PC mouse users drag instantly on `pointerdown` while maintaining 180ms long-press delays for mobile touch scrolling.
  - **Light Mode UI & Divider Refinements**: Redesigned Delete buttons with high-contrast light-red containers (`bg-rose-500/10 text-rose-600`), standardized uniform 1px list dividers (`divide-y divide-[#1f202e] border border-[#1f202e] rounded-xl overflow-hidden`), unified directory tile icon colors in More Hub, and updated Savings Buckets descriptions to *"Virtual divisions of money"*.
  - **Android Production Build**: Rebuilt Capacitor Android project and compiled fresh APK (`app-debug.apk`, `BUILD SUCCESSFUL in 9s`).
- **`v0.06.00`**
  - Implemented the **Multi-Theme Engine** with 5 customizable visual presets:
    1. 🌙 **Pastel Dark** (Material 3 Dark Pastel default)
    2. 🖤 **OLED Pitch Black** (Pure `#000000` AMOLED screen battery saver)
    3. ❄️ **Nordic Slate** (Deep arctic slate blue & cyan accent)
    4. 🌲 **Emerald Midnight** (Deep forest green & mint accent)
    5. ☀️ **Pastel Light** (Soft warm light theme)
  - Created theme utility module (`utils/theme.js`) and added `[data-theme="..."]` CSS custom property token definitions to `style.css`.
  - Vault-isolated persistence: Theme preferences are saved per vault database in the SQLite `vault_settings` table (`vault_theme`).
  - Added interactive **"App Theme & Appearance"** launcher modal (`ThemeModal.vue`) under Settings.
  - Web production build compiled cleanly (`✓ built in 1.36s`).

---

### **v0.05 — Multi-Currency System & Native Drag-and-Drop Polish**
- **`v0.05.20`**
  - Rebuilt the **Initial Quick Vault Setup Wizard** & **Interactive Spotlight Tour** system from scratch with robust architecture and zero runtime errors.
  - **Setup Wizard (5 Steps)**: Step 1 (Currency Picker with live search and polymorphic code/object handling), Step 2 (Storage Accounts & Custom Creator with seed balances), Step 3 (Savings Buckets to keep money organized), Step 4 (Expense & Income Categories), Step 5 (Architecture Feature Rundown & Overview).
  - **Interactive Spotlight Tour (12 Steps)**: Cutout highlight overlay with mobile/desktop selector fallback (`add-tx-btn` / `add-tx-btn-mobile`), step-specific floating tooltip positioning to prevent modal overlap, re-worded savings buckets terminology, and a heartfelt Thank You message (`Thank You from Cash Buddy! ❤️`).
  - Added **"Take Tour Again"** banner card to **Settings $\rightarrow$ FAQ & Guides**.
  - Re-synced and assembled Android debug APK (`BUILD SUCCESSFUL in 8s`).
- **`v0.05.19`**
  - Fixed currency selection handler in `utils/currency.js` and `OnboardingModal.vue`: updated `setCurrency()` to be polymorphic, accepting both string codes (`'USD'`, `'EUR'`, `'INR'`) and currency objects.
  - Resolved issue where tapping currency cards on Step 1 of the setup wizard failed to apply.
- **`v0.05.18`**
  - Resolved Temporal Dead Zone (TDZ) initialization crash in `Dashboard.vue`: moved `filteredCategoryExpenses`, `totalExpenses`, `filteredCategoryIncome`, and `totalIncome` computed variables above `animateNumberTicker()` and `watch([netWorth, totalIncome, totalExpenses])`.
  - Fixed `ReferenceError: Cannot access 'x' before initialization` and `ReferenceError: Cannot access 'y' before initialization` that crashed Vue reactivity on component mount.
- **`v0.05.17`**
  - Fixed race condition in `OnboardingModal.vue` stage watchers: consolidated `watch([() => props.isOpen, () => props.initialStage])` to guarantee spotlight DOM elements mount before calculating bounding rect coordinates.
  - Streamlined `openTutorial()` in `App.vue` for atomic stage updates.
  - Service worker caching strategy updated to `NetworkFirst` / `StaleWhileRevalidate` in `vite.config.js` to ensure fresh JS bundle delivery.
- **`v0.05.16`**
  - Resolved fatal uncaught console errors (`ReferenceError: loadSettings is not defined`, `ReferenceError: Cannot access 'x' before initialization`, `ReferenceError: Cannot access 'y' before initialization`) captured in diagnostic screenshot.
  - Converted pointer/drag event handlers in `SettingsView.vue` to hoisted function declarations to eliminate Temporal Dead Zone (TDZ) minification crashes.
  - Removed stale `loadSettings()` call from `SettingsView.vue`'s `onMounted()` hook to prevent component initialization failure.
  - Re-synced and assembled Android debug APK.
- **`v0.05.15`**
  - Removed "Re-run Vault Setup Wizard" button from `SettingsView.vue` as requested.
  - Fixed modal collision in `App.vue`: `handleCreateVault` and `handleSwitchVault` now immediately set `showVaultModal.value = false` before calling `refreshAll()`.
  - The Quick Vault Setup wizard now pops up unhindered over the main application screen whenever a new vault is created or opened.
  - Re-synced and assembled Android debug APK.
- **`v0.05.14`**
  - Fixed silent runtime crash (`ReferenceError: nextTick is not defined`) in `App.vue` by adding `nextTick` to the Vue imports.
  - The **"Re-run Vault Setup Wizard"** button in Settings and new vault creation flow now trigger and open the setup modal cleanly.
  - Re-synced and assembled Android debug APK.
- **`v0.05.13`**
  - Fixed onboarding modal toggle reactivity in `App.vue`: `checkOnboarding()` and `openVaultSetup()` now cleanly unmount and remount `showOnboardingModal` via `nextTick()`.
  - Creating a new vault or switching vaults now reliably triggers the initial setup wizard starting at Step 1 every time.
  - Re-synced and assembled Android debug APK.
- **`v0.05.12`**
  - Resolved onboarding loop issue in `api.js`: updated `getOnboardingState()` to check both explicit `app_metadata` (`setup_complete = 'true'`) and `txCount > 0`.
  - Finishing or skipping the setup wizard now correctly saves `setup_complete = 'true'` to SQLite, allowing setup completion while ensuring brand new vaults (without transactions and without `setup_complete = 'true'`) mandatorily trigger setup.
  - Re-synced and assembled Android debug APK.
- **`v0.05.11`**
  - Fixed new vault setup modal state initialization in `OnboardingModal.vue`: added immediate watchers on `props.isOpen` to reset `setupStep = 1` and `isSpotlightTour = false` when opening new vaults.
  - Updated `handleCreateVault` and `handleSwitchVault` in `App.vue` to update `activeVault.value` state immediately.
  - Re-synced and assembled Android debug APK.
- **`v0.05.10`**
  - Mandatory Vault Setup trigger: Simplified setup detection in `api.js` to strictly check `txCount === 0`.
  - Any new or clean vault without transaction history automatically & mandatorily launches the Quick Vault Setup wizard.
  - Added **"Re-run Vault Setup Wizard"** card under Settings (More Hub) to allow re-running setup anytime.
  - Re-synced and assembled Android debug APK.
- **`v0.05.09`**
  - Vault-isolated backup filtering: updated `listBackupSnapshots()` in `local_sqlite.js` to filter snapshots by active vault filename (`source_vault`).
  - Opening Backup & Export in Settings now lists ONLY backup snapshots belonging to the active vault.
  - Re-synced and assembled Android debug APK.
- **`v0.05.08`**
  - Fixed initial setup modal trigger detection in `api.js`: resolved false `setupComplete = true` inference caused by default categories & accounts counts.
  - Initial setup tour wizard now reliably opens for all new database vaults and fresh installs.
  - Re-synced and assembled Android debug APK.
- **`v0.05.07`**
  - Isolated currency selection per vault database: added `vault_settings` table to WebAssembly SQLite engine.
  - Changing currency in Vault A (e.g. `INR`) now leaves Vault B (e.g. `USD` / `SAR`) completely untouched and independent.
  - Exporting or sharing a vault preserves its vault-specific currency setting.
  - Re-synced and assembled Android debug APK.
- **`v0.05.06`**
  - Fixed blank Step 3 (Categories selection) in `OnboardingModal.vue` setup wizard caused by duplicate `setupStep === 2` directive.
  - Re-synced and assembled Android debug APK.
- **`v0.05.05`**
  - Polished Manage Accounts UI layout: responsive flex-wrapping title, zero text truncation for `Unallocated Funds`, compact `Shown`/`Hidden` dashboard toggle button.
  - Re-synced and assembled Android debug APK.
- **`v0.05.04`**
  - Integrated `@capacitor/haptics` plugin for native Android vibration on card long-press pickup (180ms threshold).
  - Implemented hardware-accelerated CSS `translateY` transforms for smooth, non-glitchy card drag and drop.
  - Fixed pointer capture and text selection prevention (`window.getSelection().removeAllRanges()`).
- **`v0.05.03`**
  - Added persistent custom account order utility (`src/utils/accountSorter.js`).
  - Synced account sorting across Dashboard, AccountGrid, and SettingsView.
- **`v0.05.02`**
  - Protected `acc_unallocated_funds` system default account from accidental editing/deletion.
  - Added Dashboard visibility toggle preference (`cashbuddy_hide_unallocated_dashboard`).
- **`v0.05.01`**
  - Audited codebase for fallback default names; renamed all secret/unbucketed fallback pools to **"Unassigned"** (`Unassigned Pool`, `Unassigned / No Bucket`).
- **`v0.05.00`** *(Git `5434467`)*
  - Added offline multi-currency engine (30+ currencies: INR `₹`, SAR `﷼`, USD `$`, EUR `€`, AED `AED`, etc., custom ISO code and symbol support).
  - Added Currency & Region setup as Step 1 in Onboarding wizard.
  - Fixed floating-point precision errors in balance adjustments module.

---

### **v0.04 — Unallocated Funds Engine, Tutorials & Audit Logging**
- **`v0.04.03`** *(Git `3e6af7f`)*
  - Revamped app intro and onboarding stage transitions.
- **`v0.04.02`** *(Git `63b06d7`)*
  - Salary allocation auditing, balance adjustments history log, and native Android back-button handling in More Hub.
  - Date filtering (`All`, `This Month`, `Last Month`, custom year/month picker) in audit log.
- **`v0.04.01`** *(Git `cbe6226`)*
  - Implemented End-to-End Unallocated Funds pool logic (`acc_unallocated_funds`).
  - Added automatic seed fund allocation for newly created storage accounts.
- **`v0.04.00`** *(Git `149e3d8`, `18c1cfd`)*
  - Created interactive 6-step setup & 5-step tutorial onboarding wizard (`OnboardingModal.vue`).
  - Added splash screen launcher.

---

### **v0.03 — Native Android App & Hairline Grid Motion System**
- **`v0.03.03`** *(Git `52c31d8`, `27ceb1a`, `c9af0e6`)*
  - Redesigned Settings into compact 2-column Hairline Directory ("More Hub").
  - Animated SVG donut chart with orbit particles and active segment scaling.
- **`v0.03.02`** *(Git `6c20668`, `21e82c5`)*
  - Major UI redesign featuring dark hairline grid lines (`#1f202e`) and smooth spring motion transitions.
  - Streamlined transaction entry form with category & bucket quick pickers.
- **`v0.03.01`** *(Git `11eff3e`, `a0f2fb1`)*
  - Updated app splash screen to lavender theme (`#D4BFFF`) with Cash Buddy branding.
- **`v0.03.00`** *(Git `fc5d16e`, `37fa06b`, `4c6c3fe`)*
  - Built first working native Android Capacitor app (`frontend/android`).
  - Extended hybrid mobile plugins (`@capacitor/filesystem`, `@capacitor/share`, `@capacitor/status-bar`).

---

### **v0.02 — UI Standardization, Presets & Quick Actions**
- **`v0.02.03`** *(Git `f85ed37`)*
  - Restored complete offline WebAssembly SQLite capabilities and fixed offline fallback logic.
- **`v0.02.02`** *(Git `e3dee5c`, `8076d20`)*
  - Added Quick Actions module: Account-to-Account Transfers and Bulk Salary Allocation presets.
- **`v0.02.01`** *(Git `945efc9`, `45c3ba3`)*
  - Modernized visual style with pastel accent tokens and updated transaction category filters.
- **`v0.02.00`** *(Git `cbce8d2`, `8b54c1d`)*
  - Standardized compact dark theme components across Dashboard, Transactions, Debts, and Settings.

---

### **v0.01 — Foundation & Initial Working Prototypes**
- **`v0.01.03`** *(Git `c2f2cca`, `4fcbb06`)*
  - Offline database backup export & import system.
- **`v0.01.02`** *(Git `42868a1`, `a5626a6`)*
  - First mobile PWA build working completely offline on mobile web browsers.
- **`v0.01.01`** *(Git `824bc33`, `a79897e`)*
  - Refactored core engine to support multi-vault SQLite switching.
- **`v0.01.00`** *(Git `1e9c364`, `81a66de`)*
  - Initial commit of Cash Buddy personal finance tracker: SQLite engine, buckets, accounts, categories, and debt tracking.
