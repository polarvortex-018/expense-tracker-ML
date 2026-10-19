# Cash Buddy — Complete Release & Version History

This document tracks the complete versioning roadmap for Cash Buddy, mapped directly from project git commits and development milestones.

**Versioning Schema**: `v0.xx.yy`
- `xx` = Major Feature Milestones & Architectural Shifts
- `yy` = Minor Refinements, Bug Fixes & UX Polish

---

## Current Version: **`v0.05.17`** (or `v0.5.17`)

---

## Version History Log

### **v0.05 — Multi-Currency System & Native Drag-and-Drop Polish**
- **`v0.05.17`** *(Current)*
  - Updated `TransactionForm.vue` Step 2 layout: paired `AMOUNT` and `DESCRIPTION (OPTIONAL)` side-by-side in a 2-column grid directly below Category selection, and moved Date below Amount & Description.
  - Re-synced Capacitor web assets and assembled Android debug APK.
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
