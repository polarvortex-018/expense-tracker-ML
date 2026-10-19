// Database DDL schema definitions for WebAssembly SQLite engine

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    balance REAL NOT NULL DEFAULT 0.0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT NULL DEFAULT '🏷️',
    category_type TEXT NOT NULL DEFAULT 'expense',
    is_quick_select INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS savings_buckets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    allocated_balance REAL NOT NULL DEFAULT 0.0,
    target_amount REAL NULL,
    icon TEXT NULL DEFAULT '🪣',
    color TEXT NULL DEFAULT '#6366f1',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    transaction_type TEXT NOT NULL,
    adjustment_direction TEXT NULL,
    description TEXT NULL,
    date TEXT NOT NULL,
    account_id TEXT NULL,
    bucket_id TEXT NULL,
    category_id TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    include_in_chart INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE SET NULL,
    FOREIGN KEY (bucket_id) REFERENCES savings_buckets (id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS debts (
    id TEXT PRIMARY KEY,
    person_name TEXT NOT NULL,
    amount REAL NOT NULL,
    debt_type TEXT NOT NULL,
    description TEXT NULL,
    due_date TEXT NULL,
    is_settled INTEGER NOT NULL DEFAULT 0,
    account_id TEXT NULL,
    bucket_id TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE SET NULL,
    FOREIGN KEY (bucket_id) REFERENCES savings_buckets (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS allocation_presets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'percentage',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS allocation_preset_rules (
    id TEXT PRIMARY KEY,
    preset_id TEXT NOT NULL,
    bucket_id TEXT NULL,
    account_id TEXT NULL,
    category_id TEXT NULL,
    mode TEXT NOT NULL,
    value REAL NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (preset_id) REFERENCES allocation_presets(id) ON DELETE CASCADE,
    FOREIGN KEY (bucket_id) REFERENCES savings_buckets(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vault_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
`;

export const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', color: '#ef4444', icon: 'restaurant', is_quick_select: 1 },
  { name: 'Groceries', color: '#10b981', icon: 'shopping_cart', is_quick_select: 1 },
  { name: 'Rent & Housing', color: '#3b82f6', icon: 'home', is_quick_select: 1 },
  { name: 'Utilities', color: '#f59e0b', icon: 'bolt', is_quick_select: 1 },
  { name: 'Salary & Income', color: '#10b981', icon: 'payments', is_quick_select: 0 },
  { name: 'Shopping', color: '#8b5cf6', icon: 'shopping_bag', is_quick_select: 1 },
  { name: 'Entertainment', color: '#ec4899', icon: 'movie', is_quick_select: 0 },
  { name: 'Transportation', color: '#06b6d4', icon: 'directions_car', is_quick_select: 0 },
  { name: 'Adjustments', color: '#a855f7', icon: 'tune', is_quick_select: 0 },
  { name: 'General', color: '#64748b', icon: 'category', is_quick_select: 0 }
];

export const DEFAULT_ACCOUNTS = [
  { name: 'Checking Account', type: 'Checking', balance: 0.0 },
  { name: 'Savings Account', type: 'Savings', balance: 0.0 }
];

export const DEFAULT_BUCKET = {
  name: 'Unassigned',
  icon: '🪣',
  color: '#6366f1',
  allocated_balance: 0.0,
  is_archived: 0
};
