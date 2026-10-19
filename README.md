# 💸 Cash Buddy — Local-First Personal Finance Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Local First](https://img.shields.io/badge/Privacy-100%25%20Local%20%26%20Offline-emerald.svg)](#-privacy--zero-data-sharing-guarantee)
[![Tech Stack](https://img.shields.io/badge/Stack-Vue%203%20%7C%20Capacitor%208%20%7C%20FastAPI%20%7C%20SQLite-indigo.svg)](#-technologies-used)

Cash Buddy is a modern, ultra-sleek, **100% local-first personal finance and savings allocation app** built for Web and Android.

---

## 🔒 Privacy & Zero Data-Sharing Guarantee

> [!IMPORTANT]
> **Your financial data NEVER leaves your device.**
> - **Zero Cloud / External Servers**: Cash Buddy operates entirely offline and locally on your phone or computer.
> - **Zero Telemetry or Analytics**: No tracking scripts, no phone-home APIs, and no third-party telemetry.
> - **100% Offline SQLite Engine**: Your transactions, savings buckets, accounts, and debt records are stored inside local SQLite database files on your own filesystem (`sql-wasm.wasm` in browser / native `.db` files on disk).
> - **Full Data Ownership**: Export, snapshot, or move your database `.db` files anywhere at any time without software or vendor lock-in.

---

## 🛠️ Technologies Used

- **Frontend Core**: [Vue 3](https://vuejs.org/) (Composition API `<script setup>`), [Vite 6](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/).
- **Iconography & Fonts**: 100% bundled offline [Material Symbols Outlined](https://fonts.google.com/icons) (WOFF2) with custom color mapping and zero external CDN/Google Fonts network requests.
- **Client Database & Engine**: [SQL.js](https://sql.js.org/) / `sql-wasm.wasm` (pure WebAssembly SQLite engine running directly inside the browser thread).
- **Backend API (Optional / Sync Mode)**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+), [SQLModel](https://sqlmodel.tiangolo.com/) (SQLAlchemy 2.0 + Pydantic v2), and [Alembic](https://alembic.sqlalchemy.org/) schema migrations.
- **Mobile Engine (Android)**: [Capacitor 8](https://capacitorjs.com/) with native plugins:
  - `@capacitor/app` (Native lifecycle & hardware back button handling)
  - `@capacitor/filesystem` (Direct local file read/write access)
  - `@capacitor/share` (Native OS file export sheet)
  - `@capacitor/status-bar` (System status bar themes and styling)

---

## 🌟 Key Features

- 🏛️ **Obsidian-Style Financial Vaults**: Switch instantly between isolated local database vaults (e.g., `Personal.db`, `Freelance.db`, `Family.db`).
- 🪣 **Dual-Dimension Savings Allocations**: Distinguish **where** your money is stored (Bank Accounts, Wallet) from **why** it exists (Emergency Fund, Investments, Travel Buckets).
- 🤝 **Debt & IOU Tracker**: Keep tabs on money lent to friends or borrowed liabilities with net balance calculations.
- 🎨 **Material 3 Dark Pastel Theme**: Bespoke visual design system with zero emoji bloat, tabular numbers (`₹1,234.56`), and smooth 60fps animations.
- 💾 **Snapshots & 1-Click Backups**: Instant local database downloads and timestamped disk snapshots (`backups/`).

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your development machine:

1. **Node.js**: `v18.0.0` or higher (includes `npm`).
   - Verify: `node -v` and `npm -v`
2. **Python**: `3.10` or higher *(Required only if running the Python FastAPI backend)*.
   - Verify: `python --version` or `python3 --version`
3. **Android Build Requirements** *(Required only for compiling Android APKs)*:
   - Android Studio (JBR / JDK 21 configured).
   - Android SDK API Level 34+.

---

## 🚀 Step-by-Step Build & Setup Guide

Follow these exact steps to build and run Cash Buddy from scratch on your machine.

### Step 1: Clone the Repository

Open your terminal or command prompt and clone the repository:

```bash
git clone <your-repository-url>
cd "financial tracking app v2"
```

---

### Step 2: Install All Dependencies

Install both the root automation packages and the frontend packages with a single command:

```bash
npm run install:all
```

*Alternatively, install manually step by step:*

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

#### (Optional) Set Up Python Backend Environment
If you intend to run the FastAPI backend server alongside the frontend:

```bash
# 1. Create a Python virtual environment inside backend/
python -m venv backend/.venv

# 2. Activate the environment:
# On Windows PowerShell:
.\backend\.venv\Scripts\Activate.ps1
# On macOS / Linux:
source backend/.venv/bin/activate

# 3. Install backend dependencies
pip install -r backend/requirements.txt
```

---

### Step 3: Run the Web App in Development Mode

#### Option A: 1-Command Concurrent Launch (Recommended)
Start both the FastAPI backend server (`http://localhost:8000`) and the Vite Vue 3 frontend (`http://localhost:5173`) simultaneously:

```bash
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`**. The app will automatically initialize its local database!

#### Option B: Standalone Web Frontend Mode
If you want to run purely offline in the browser without running a Python backend:

```bash
cd frontend
npm run dev
```

Open **`http://localhost:5173`**. Cash Buddy will run 100% in-browser using WebAssembly SQLite (`sql-wasm.wasm`).

---

### Step 4: Build Web App for Production

To create a static production bundle of the web frontend:

```bash
cd frontend
npm run build
```

The optimized, minified HTML/JS/CSS assets will be generated in the `frontend/dist/` directory.

To preview the built production app locally:

```bash
npm run preview
```

---

### Step 5: Build & Run on Android Mobile (Capacitor 8)

Cash Buddy uses Capacitor 8 to run as a native Android app.

#### 1. Compile Frontend & Sync Native Platform
From the root directory:

```bash
cd frontend

# Build production assets
npm run build

# Sync assets & native plugins to the Android project
npx cap sync android
```

#### 2. Option A: Build Debug APK via Command Line (Gradle)

**On Windows (PowerShell):**
```powershell
# Set Java Home to Android Studio's bundled JDK 21 (adjust path if needed)
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "C:\Program Files\Android\Android Studio\jbr\bin;$env:Path"

# Navigate to android folder and build APK
cd android
.\gradlew assembleDebug
```
The compiled APK will be located at:
`frontend/android/app/build/outputs/apk/debug/app-debug.apk`

**On macOS / Linux:**
```bash
cd android
./gradlew assembleDebug
```

#### 3. Option B: Launch in Android Studio
To open the project in Android Studio and run it on an Android Emulator or physical phone:

```bash
cd frontend
npx cap open android
```
In Android Studio, click **Run 'app'** (`Shift + F10`) or navigate to **Build > Build APK(s)**.

---

## 🏛️ Multi-Vault & Data Management

- **Switching Vaults**: Navigate to **Settings → Database Vaults** to switch active SQLite databases in 1 click.
- **Creating Vaults**: Enter a name (e.g., `Travel.db`) and tap **+ Create Vault**. A fresh local SQLite file is generated automatically.
- **Local Snapshots**: Tap **📸 Create Local Snapshot** in Settings to back up your database to the timestamped `backups/` directory.
- **Exporting Data**: Use **⬇️ Export Active Database** to save your raw `.db` file directly to your desktop or device filesystem.

---

## 📁 Repository Structure

```text
financial-tracking-app-v2/
├── backend/                  # Python FastAPI Backend (Optional Sync Engine)
│   ├── app/
│   │   ├── api/              # REST Endpoints (transactions, accounts, buckets, vaults, backup)
│   │   ├── db/               # SQLite VaultManager & Session manager
│   │   └── models/           # SQLModel Entities
│   ├── migrations/           # Alembic DB Migrations
│   └── requirements.txt      # Python Dependencies
│
├── frontend/                 # Vue 3 Frontend & Native Mobile Core
│   ├── android/              # Native Android Studio / Gradle Project
│   ├── public/
│   │   └── fonts/            # Offline Material Symbols WOFF2 Font
│   ├── src/
│   │   ├── components/       # Vue SFC Components (Dashboard, Buckets, Transactions, Debts, Vaults)
│   │   ├── utils/            # Icon resolvers, currency formatting, date helpers
│   │   └── style.css         # Tailwind v4 & Custom Motion Rules
│   ├── capacitor.config.json # Capacitor 8 Configuration
│   └── package.json          # Frontend Dependencies & Build Scripts
│
├── data/                     # Local SQLite Databases (Vaults) [Git-Ignored]
├── backups/                  # Database Snapshots [Git-Ignored]
├── package.json              # Root 1-Command Startup Scripts
└── README.md                 # Project Documentation
```

---

## 🧪 Testing & Verification

### Run Backend Tests (Pytest)

```bash
# Windows
.\backend\.venv\Scripts\pytest.exe

# macOS / Linux
pytest
```

### Run Frontend Build Check

```bash
cd frontend
npm run build
```

---

## 📄 License

MIT License. 100% Free and Open-Source for personal privacy.
