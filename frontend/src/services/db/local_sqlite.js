import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { CREATE_TABLES_SQL, DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS, DEFAULT_BUCKET } from './schema.js';

// Pure JS SHA-256 implementation
function sha256(bytes) {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  
  const l = bytes.length * 8;
  const paddingSize = (l % 512 < 448) ? (448 - l % 512) : (960 - l % 512);
  const pad = new Uint8Array(bytes.length + Math.ceil(paddingSize / 8) + 8);
  pad.set(bytes);
  pad[bytes.length] = 0x80;
  const view = new DataView(pad.buffer);
  view.setUint32(pad.length - 4, l);

  const rightRotate = (v, n) => (v >>> n) | (v << (32 - n));

  for (let i = 0; i < pad.length; i += 64) {
    const W = new Uint32Array(64);
    for (let t = 0; t < 16; t++) W[t] = view.getUint32(i + t * 4);
    for (let t = 16; t < 64; t++) {
      const s0 = (rightRotate(W[t-15], 7) ^ rightRotate(W[t-15], 18) ^ (W[t-15] >>> 3));
      const s1 = (rightRotate(W[t-2], 17) ^ rightRotate(W[t-2], 19) ^ (W[t-2] >>> 10));
      W[t] = (W[t-16] + s0 + W[t-7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const S1 = (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
      const S0 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;
      h = g; g = f; f = e;
      e = (d + temp1) | 0;
      d = c; c = b; b = a;
      a = (temp1 + temp2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  const digest = new Uint8Array(32);
  const dvDigest = new DataView(digest.buffer);
  for (let j = 0; j < 8; j++) dvDigest.setUint32(j * 4, H[j]);
  return digest;
}

function deriveKeyJS(passphrase, salt, iterations) {
  const passBytes = new TextEncoder().encode(passphrase);
  let current = new Uint8Array(salt.length + passBytes.length);
  current.set(salt);
  current.set(passBytes, salt.length);
  for (let i = 0; i < iterations; i++) {
    current = sha256(current);
  }
  return current;
}

function cryptCTR(bytes, key, iv) {
  const out = new Uint8Array(bytes.length);
  const block = new Uint8Array(32 + 12 + 4);
  block.set(key, 0);
  block.set(iv, 32);
  const dv = new DataView(block.buffer);
  
  for (let i = 0; i < bytes.length; i += 32) {
    const blockIndex = Math.floor(i / 32);
    dv.setUint32(32 + 12, blockIndex);
    const keystream = sha256(block);
    const limit = Math.min(bytes.length - i, 32);
    for (let j = 0; j < limit; j++) {
      out[i + j] = bytes[i + j] ^ keystream[j];
    }
  }
  return out;
}

let SQL = null;
let db = null;
let activeVaultFilename = 'finance.db';
let vaults = [];
let persistChain = Promise.resolve();

const IDB_NAME = 'cash_buddy_secure_store';
const IDB_VERSION = 1;
const LEGACY_INDEX_KEY = 'finance_vaults_index';
const LEGACY_DATA_PREFIX = 'finance_vault_db_';

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Browser storage request failed.'));
  });
}

function openStore() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = () => {
      const store = request.result;
      if (!store.objectStoreNames.contains('vaults')) store.createObjectStore('vaults', { keyPath: 'filename' });
      if (!store.objectStoreNames.contains('backups')) store.createObjectStore('backups', { keyPath: 'filename' });
      if (!store.objectStoreNames.contains('settings')) store.createObjectStore('settings', { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open secure browser storage.'));
  });
}

async function storeRequest(storeName, mode, action) {
  const database = await openStore();
  try {
    const tx = database.transaction(storeName, mode);
    const result = await requestResult(action(tx.objectStore(storeName)));
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('Browser storage transaction failed.'));
      tx.onabort = () => reject(tx.error || new Error('Browser storage transaction was aborted.'));
    });
    return result;
  } finally {
    database.close();
  }
}

const getRecord = (store, key) => storeRequest(store, 'readonly', s => s.get(key));
const putRecord = (store, value) => storeRequest(store, 'readwrite', s => s.put(value));
const deleteRecord = (store, key) => storeRequest(store, 'readwrite', s => s.delete(key));
const allRecords = store => storeRequest(store, 'readonly', s => s.getAll());

async function getEncryptionKey() {
  const saved = await getRecord('settings', 'device_encryption_key');
  if (saved?.value) return saved.value;
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  await putRecord('settings', { key: 'device_encryption_key', value: key });
  return key;
}

async function encryptBytes(bytes) {
  if (!globalThis.crypto?.subtle) {
    return { version: 1, algorithm: 'PLAINTEXT-INSECURE', bytes: new Uint8Array(bytes) };
  }
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes);
  return { version: 1, algorithm: 'AES-GCM', iv, ciphertext };
}

async function derivePortableKey(passphrase, salt, iterations = 310000) {
  const passStr = String(passphrase || 'default_cashbuddy_pass');
  if (!globalThis.crypto?.subtle) {
    let hash = 0;
    const combined = passStr + Array.from(salt).join(',');
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash |= 0;
    }
    return { isFallback: true, pass: passStr, hash };
  }
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passStr), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function decryptBytes(record) {
  if (record.bytes) return new Uint8Array(record.bytes);
  if (record.encrypted?.algorithm === 'PLAINTEXT-INSECURE' && record.encrypted.bytes) {
    return new Uint8Array(record.encrypted.bytes);
  }
  if (!record.encrypted?.ciphertext) throw new Error('Vault data is missing.');
  const key = await getEncryptionKey();
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(record.encrypted.iv) },
    key,
    record.encrypted.ciphertext
  );
  return new Uint8Array(plain);
}

export function generateUUID() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 3 | 8)).toString(16);
  });
}

function normalizeFilename(name) {
  const base = String(name || '').replace(/\.(db|sqlite)$/i, '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
  if (!base) throw new Error('Vault name must contain a letter or number.');
  return `${base}.db`;
}

function validateDatabaseBytes(bytes) {
  let candidate;
  try {
    candidate = new SQL.Database(bytes);
    const integrity = candidate.exec('PRAGMA integrity_check');
    if (integrity[0]?.values?.[0]?.[0] !== 'ok') throw new Error('SQLite integrity check failed.');
    const tables = candidate.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const names = new Set((tables[0]?.values || []).map(row => row[0]));
    for (const required of ['accounts', 'categories', 'savings_buckets', 'transactions', 'debts']) {
      if (!names.has(required)) throw new Error(`Required table '${required}' is missing.`);
    }
    return true;
  } catch (error) {
    throw new Error(`Invalid Cash Buddy database: ${error.message}`);
  } finally {
    candidate?.close();
  }
}

async function saveVaultBytes(filename, bytes, displayName) {
  const encrypted = await encryptBytes(bytes);
  const existing = await getRecord('vaults', filename);
  const record = {
    filename,
    name: displayName || existing?.name || filename.replace(/\.db$/i, ''),
    encrypted,
    size_bytes: bytes.byteLength,
    updated_at: Date.now()
  };
  await putRecord('vaults', record);
  const verified = await decryptBytes(await getRecord('vaults', filename));
  if (verified.byteLength !== bytes.byteLength) throw new Error('Saved vault verification failed.');
  return record;
}

async function migrateLegacyStorage() {
  if ((await allRecords('vaults')).length) return;
  let legacy = [];
  try { legacy = JSON.parse(localStorage.getItem(LEGACY_INDEX_KEY) || '[]'); } catch { legacy = []; }
  if (!legacy.length) legacy = [{ filename: 'finance.db', name: 'Personal', is_active: true }];
  for (const item of legacy) {
    const raw = localStorage.getItem(`${LEGACY_DATA_PREFIX}${item.filename}`);
    if (!raw) continue;
    const binary = atob(raw);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    try {
      new SQL.Database(bytes).close();
      await saveVaultBytes(item.filename, bytes, item.name);
    } catch (error) {
      console.warn(`Legacy vault '${item.filename}' was retained but could not be migrated:`, error);
    }
  }
  await putRecord('settings', { key: 'active_vault', value: legacy.find(v => v.is_active)?.filename || 'finance.db' });
}

async function refreshVaultIndex() {
  const active = (await getRecord('settings', 'active_vault'))?.value || activeVaultFilename;
  vaults = (await allRecords('vaults')).map(({ encrypted, ...item }) => ({ ...item, is_active: item.filename === active }));
}

export async function initDatabaseEngine() {
  if (!globalThis.indexedDB) throw new Error('This browser cannot provide offline database storage.');
  if (!SQL) SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
  await migrateLegacyStorage();
  await refreshVaultIndex();
  const savedActive = vaults.find(v => v.is_active)?.filename || vaults[0]?.filename || 'finance.db';
  await loadVault(savedActive);
}

export async function loadVault(filename) {
  if (db && activeVaultFilename !== filename) await persistCurrentDatabase();
  const record = await getRecord('vaults', filename);
  activeVaultFilename = filename;
  if (record) {
    const bytes = await decryptBytes(record);
    db = new SQL.Database(bytes);
  } else {
    db = new SQL.Database();
  }
  runSchemaAndSeeds();
  await putRecord('settings', { key: 'active_vault', value: filename });
  await persistCurrentDatabase();
  await refreshVaultIndex();
}

function runSchemaAndSeeds() {
  db.run('PRAGMA foreign_keys = ON');
  db.run(CREATE_TABLES_SQL);
  db.run('CREATE TABLE IF NOT EXISTS app_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  const migrations = [
    ['categories', 'is_quick_select', 'ALTER TABLE categories ADD COLUMN is_quick_select INTEGER NOT NULL DEFAULT 0'],
    ['categories', 'category_type', "ALTER TABLE categories ADD COLUMN category_type TEXT NOT NULL DEFAULT 'expense'"],
    ['categories', 'icon', "ALTER TABLE categories ADD COLUMN icon TEXT NULL DEFAULT '🏷️'"],
    ['savings_buckets', 'sort_order', 'ALTER TABLE savings_buckets ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0']
    ,['transactions', 'adjustment_direction', 'ALTER TABLE transactions ADD COLUMN adjustment_direction TEXT NULL']
    ,['debts', 'bucket_id', 'ALTER TABLE debts ADD COLUMN bucket_id TEXT NULL']
    ,['categories', 'sort_order', 'ALTER TABLE categories ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0']
    ,['allocation_preset_rules', 'account_id', 'ALTER TABLE allocation_preset_rules ADD COLUMN account_id TEXT NULL']
    ,['allocation_presets', 'mode', "ALTER TABLE allocation_presets ADD COLUMN mode TEXT NOT NULL DEFAULT 'percentage'"]
    ,['allocation_preset_rules', 'category_id', 'ALTER TABLE allocation_preset_rules ADD COLUMN category_id TEXT NULL']
  ];
  for (const [table, column, sql] of migrations) {
    const columns = execQuery(`PRAGMA table_info(${table})`).map(row => row.name);
    if (!columns.includes(column)) db.run(sql);
  }
  db.run('CREATE INDEX IF NOT EXISTS ix_transactions_date ON transactions(date)');
  db.run('CREATE INDEX IF NOT EXISTS ix_transactions_type ON transactions(transaction_type)');
  db.run('CREATE INDEX IF NOT EXISTS ix_transactions_account ON transactions(account_id)');
  db.run('CREATE INDEX IF NOT EXISTS ix_transactions_category ON transactions(category_id)');
  db.run('CREATE INDEX IF NOT EXISTS ix_transactions_bucket ON transactions(bucket_id)');
  db.run('CREATE INDEX IF NOT EXISTS ix_transactions_date_created ON transactions(date DESC, created_at DESC)');
  // Allocation preset tables (idempotent — safe to run on existing vaults)
  db.run(`CREATE TABLE IF NOT EXISTS allocation_presets (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS allocation_preset_rules (
    id TEXT PRIMARY KEY, preset_id TEXT NOT NULL, bucket_id TEXT NULL, account_id TEXT NULL, mode TEXT NOT NULL, value REAL NOT NULL, created_at TEXT NOT NULL,
    FOREIGN KEY (preset_id) REFERENCES allocation_presets(id) ON DELETE CASCADE,
    FOREIGN KEY (bucket_id) REFERENCES savings_buckets(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE SET NULL
  )`);
  const now = new Date().toISOString();
  if (execQuery('SELECT COUNT(*) count FROM categories')[0]?.count === 0) {
    for (const cat of DEFAULT_CATEGORIES) db.run('INSERT INTO categories (id,name,color,icon,is_quick_select,created_at,updated_at) VALUES (?,?,?,?,?,?,?)', [generateUUID(), cat.name, cat.color, cat.icon || '🏷️', cat.is_quick_select || 0, now, now]);
  }
  if (execQuery('SELECT COUNT(*) count FROM accounts')[0]?.count === 0) {
    for (const account of DEFAULT_ACCOUNTS) db.run('INSERT INTO accounts (id,name,type,balance,created_at,updated_at) VALUES (?,?,?,?,?,?)', [generateUUID(), account.name, account.type, account.balance, now, now]);
  }
  if (execQuery('SELECT COUNT(*) count FROM savings_buckets')[0]?.count === 0) {
    db.run('INSERT INTO savings_buckets (id,name,allocated_balance,icon,color,is_archived,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)', [generateUUID(), DEFAULT_BUCKET.name, DEFAULT_BUCKET.allocated_balance, DEFAULT_BUCKET.icon, DEFAULT_BUCKET.color, DEFAULT_BUCKET.is_archived, now, now]);
  }

  // Ensure system account 'Unallocated Funds' exists
  if (execQuery("SELECT COUNT(*) count FROM accounts WHERE id = 'acc_unallocated_funds'")[0]?.count === 0) {
    db.run("INSERT INTO accounts (id, name, type, balance, created_at, updated_at) VALUES ('acc_unallocated_funds', 'Unallocated Funds', 'Unallocated', 0.0, ?, ?)", [now, now]);
  }

  // Ensure system category 'Adjustments' exists
  if (execQuery("SELECT COUNT(*) count FROM categories WHERE name = 'Adjustments' OR id = 'cat_adjustments'")[0]?.count === 0) {
    db.run("INSERT INTO categories (id, name, color, icon, is_quick_select, sort_order, created_at, updated_at) VALUES ('cat_adjustments', 'Adjustments', '#a855f7', 'tune', 0, 999, ?, ?)", [now, now]);
  }

  ensureTransactionsAccountIdNullable();

  try {
    const cols = execQuery("PRAGMA table_info(transactions)");
    if (!cols.some(c => c.name === 'include_in_chart')) {
      db.run("ALTER TABLE transactions ADD COLUMN include_in_chart INTEGER NOT NULL DEFAULT 0");
    }
  } catch (e) {
    console.warn('transactions include_in_chart migration:', e);
  }

  // Cleanup all legacy system entity rows from database and re-link transactions
  try {
    db.exec(`
      PRAGMA foreign_keys = OFF;
      UPDATE transactions SET account_id = NULL WHERE account_id = 'acc_unassigned_pool';
      UPDATE transactions SET bucket_id = NULL WHERE bucket_id = 'bucket_unassigned';
      UPDATE transactions SET category_id = NULL WHERE category_id IN ('cat_unassigned', 'cat_adjustment');
      UPDATE debts SET account_id = NULL WHERE account_id = 'acc_unassigned_pool';
      UPDATE debts SET bucket_id = NULL WHERE bucket_id = 'bucket_unassigned';
      UPDATE allocation_preset_rules SET account_id = NULL WHERE account_id = 'acc_unassigned_pool';
      UPDATE allocation_preset_rules SET bucket_id = NULL WHERE bucket_id = 'bucket_unassigned';
      DELETE FROM accounts WHERE id = 'acc_unassigned_pool' OR type = 'Unassigned' OR name LIKE '%Unassigned%';
      DELETE FROM savings_buckets WHERE id = 'bucket_unassigned' OR name LIKE '%Unassigned%';
      DELETE FROM categories WHERE id IN ('cat_unassigned', 'cat_adjustment') OR name LIKE '%Unassigned%' OR name LIKE '%Adjustments%';
      PRAGMA foreign_keys = ON;
    `);
  } catch (e) {
    console.warn('Unassigned system entity migration cleanup:', e);
  }

  db.run("INSERT OR REPLACE INTO app_metadata(key,value) VALUES ('schema_version','3')");
}

export function ensureTransactionsAccountIdNullable() {
  if (!db) return;
  try {
    const cols = execQuery("PRAGMA table_info(transactions)");
    const accCol = cols.find(c => c.name === 'account_id');
    if (accCol && accCol.notnull === 1) {
      db.exec(`
        PRAGMA foreign_keys = OFF;
        CREATE TABLE transactions_new (
          id TEXT PRIMARY KEY, amount REAL NOT NULL, transaction_type TEXT NOT NULL, adjustment_direction TEXT NULL,
          description TEXT NULL, date TEXT NOT NULL, account_id TEXT NULL, bucket_id TEXT NULL, category_id TEXT NULL,
          created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
          FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE SET NULL,
          FOREIGN KEY (bucket_id) REFERENCES savings_buckets (id) ON DELETE SET NULL,
          FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
        );
        INSERT INTO transactions_new (id, amount, transaction_type, adjustment_direction, description, date, account_id, bucket_id, category_id, created_at, updated_at)
          SELECT id, amount, transaction_type, adjustment_direction, description, date, account_id, bucket_id, category_id, created_at, updated_at FROM transactions;
        DROP TABLE transactions;
        ALTER TABLE transactions_new RENAME TO transactions;
        CREATE INDEX IF NOT EXISTS ix_transactions_account ON transactions(account_id);
        CREATE INDEX IF NOT EXISTS ix_transactions_category ON transactions(category_id);
        CREATE INDEX IF NOT EXISTS ix_transactions_bucket ON transactions(bucket_id);
        CREATE INDEX IF NOT EXISTS ix_transactions_date_created ON transactions(date DESC, created_at DESC);
        PRAGMA foreign_keys = ON;
      `);
    }
  } catch (e) {
    console.warn('Transactions NULL account_id schema upgrade error:', e);
  }
}

export function execQuery(sql, params = []) {
  if (!db) return [];
  const stmt = db.prepare(sql);
  try {
    if (params.length) stmt.bind(params);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    return results;
  } finally { stmt.free(); }
}

export function execRun(sql, params = [], persist = true) {
  if (!db) throw new Error('Database is not initialized.');
  db.run(sql, params);
  if (persist) queuePersistence();
}

let persistTimeout = null;

function queuePersistence() {
  clearTimeout(persistTimeout);
  persistTimeout = setTimeout(() => {
    persistChain = persistChain.then(() => persistCurrentDatabase());
    persistChain.catch(error => globalThis.dispatchEvent?.(new CustomEvent('cashbuddy-storage-error', { detail: error.message })));
  }, 100);
  return persistChain;
}

export async function persistCurrentDatabase() {
  if (!db) return;
  const bytes = db.export();
  await saveVaultBytes(activeVaultFilename, bytes);
  await refreshVaultIndex();
}

export async function runInTransaction(callback) {
  db.run('BEGIN IMMEDIATE');
  try {
    const result = await callback();
    db.run('COMMIT');
    await persistCurrentDatabase();
    return result;
  } catch (error) {
    try { db.run('ROLLBACK'); } catch { /* transaction was already closed */ }
    throw error;
  }
}

export const getActiveVaultName = () => activeVaultFilename;
export const listVaults = () => vaults.map(v => ({ ...v, is_active: v.filename === activeVaultFilename }));

export async function createNewVault(name) {
  const filename = normalizeFilename(name);
  if (await getRecord('vaults', filename)) throw new Error(`Vault '${filename}' already exists.`);
  await loadVault(filename);
  db.run("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('setup_complete', 'false'), ('tutorial_complete', 'false')");
  await saveVaultBytes(filename, db.export(), String(name).trim());
  await refreshVaultIndex();
  return filename;
}

export async function switchActiveVault(filename) {
  if (!(await getRecord('vaults', filename))) throw new Error(`Vault '${filename}' not found.`);
  await loadVault(filename);
  return filename;
}

export async function deleteVault(filename) {
  if (filename === activeVaultFilename) throw new Error('Cannot delete the currently active vault.');
  await deleteRecord('vaults', filename);
  await refreshVaultIndex();
  return true;
}

export async function renameVault(filename, newName) {
  const record = await getRecord('vaults', filename);
  if (!record) throw new Error(`Vault '${filename}' not found.`);
  const trimmed = String(newName || '').trim();
  if (!trimmed) throw new Error('New name cannot be empty.');
  record.name = trimmed;
  await putRecord('vaults', record);
  await refreshVaultIndex();
  return record;
}

export function exportActiveDatabaseBlob() { return db?.export() || null; }

export async function exportDatabaseBlobByName(filename) {
  const record = await getRecord('vaults', filename);
  return record ? decryptBytes(record) : null;
}

export async function importDatabaseBlob(filename, uint8Array, passphrase = '') {
  if (!uint8Array || uint8Array.byteLength === 0) throw new Error('Selected file is empty.');
  if (uint8Array.byteLength > 100 * 1024 * 1024) throw new Error('Imported database exceeds the 100 MB safety limit.');

  let dbBytes = uint8Array;
  let isEncryptedPayload = false;

  // Check if raw SQLite binary (starts with "SQLite format 3")
  const headerStr = new TextDecoder().decode(uint8Array.slice(0, 16));
  if (!headerStr.startsWith('SQLite format 3')) {
    // Try parsing as JSON backup payload
    try {
      const fullText = new TextDecoder().decode(uint8Array);
      const json = JSON.parse(fullText);

      if (json.format === 'cashbuddy-encrypted-backup') {
        isEncryptedPayload = true;

        // Helper to attempt decryption with a given passphrase
        const tryDecrypt = async (pass) => {
          const iterations = json.iterations || 310000;
          const salt = new Uint8Array(json.salt);
          const iv = new Uint8Array(json.iv);
          const ciphertext = new Uint8Array(json.ciphertext);

          if (json.mode === 'JS_CTR_V1' || json.version === 2) {
            const key = deriveKeyJS(pass || 'default_cashbuddy_pass', salt, iterations);
            return cryptCTR(ciphertext, key, iv);
          } else if (json.mode === 'JS_XOR_HTTP') {
            const passBytes = new TextEncoder().encode(pass || 'default_cashbuddy_pass');
            const out = new Uint8Array(ciphertext.length);
            for (let i = 0; i < ciphertext.length; i++) {
              out[i] = ciphertext[i] ^ passBytes[i % passBytes.length] ^ salt[i % salt.length];
            }
            return out;
          } else {
            // Original SubtleCrypto AES-GCM format
            if (!globalThis.crypto?.subtle) {
              throw new Error('This legacy backup file requires a secure browser context (HTTPS or localhost) to import.');
            }
            const key = await derivePortableKey(pass || 'default_cashbuddy_pass', salt, iterations);
            const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
            return new Uint8Array(decrypted);
          }
        };

        let plain = null;

        // If caller provided a passphrase, use it directly
        if (passphrase) {
          plain = await tryDecrypt(passphrase);
        } else {
          // Auto-try default passphrase first
          try {
            const attempt = await tryDecrypt('default_cashbuddy_pass');
            validateDatabaseBytes(attempt);
            plain = attempt;
          } catch (err) {
            if (/secure browser context/i.test(err.message)) throw err;
            // Default didn't work, prompt user
            const userPass = prompt('Enter the passphrase for this encrypted backup file:');
            if (!userPass) throw new Error('Import cancelled: a passphrase is required.');
            plain = await tryDecrypt(userPass);
          }
        }

        dbBytes = plain;
        filename = json.source_vault || filename.replace(/\.cbbak$/i, '.db');
      } else if (json.bytes || json.encrypted) {
        // Internal device snapshot record format
        dbBytes = await decryptBytes(json);
      }
    } catch (err) {
      if (isEncryptedPayload || /passphrase|cancelled|secure browser context/i.test(err.message)) {
        throw new Error(err.message || 'Incorrect passphrase or damaged encrypted backup file.');
      }
      // Binary file that isn't valid JSON — fall through to validateDatabaseBytes
    }
  }

  validateDatabaseBytes(dbBytes);
  let cleanName = normalizeFilename(filename);
  if (await getRecord('vaults', cleanName)) cleanName = cleanName.replace(/\.db$/, `_${Date.now()}.db`);
  await saveVaultBytes(cleanName, dbBytes, cleanName.replace(/\.db$/, ''));
  await loadVault(cleanName);
  await persistCurrentDatabase();
  return cleanName;
}

export async function createBackupSnapshot() {
  const bytes = db.export();
  const stamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const filename = `backup_${activeVaultFilename.replace(/\.db$/, '')}_${stamp}.cbbak`;
  await putRecord('backups', { filename, source_vault: activeVaultFilename, encrypted: await encryptBytes(bytes), size_bytes: bytes.byteLength, created_at: Date.now() });
  return filename;
}

export async function listBackupSnapshots() {
  const records = await allRecords('backups');
  const baseName = activeVaultFilename.replace(/\.db$/, '');
  return records
    .filter(item => {
      if (item.source_vault) {
        return item.source_vault === activeVaultFilename;
      }
      if (item.filename && item.filename.includes(`backup_${baseName}_`)) {
        return true;
      }
      return false;
    })
    .map(({ encrypted, ...item }) => item)
    .sort((a, b) => b.created_at - a.created_at);
}

export async function restoreBackupSnapshot(filename) {
  const record = await getRecord('backups', filename);
  if (!record) throw new Error('Backup file not found.');
  const bytes = await decryptBytes(record);
  validateDatabaseBytes(bytes);
  await createBackupSnapshot();
  db.close();
  db = new SQL.Database(bytes);
  runSchemaAndSeeds();
  await persistCurrentDatabase();
  return activeVaultFilename;
}

export async function getBackupSnapshotBytes(filename) {
  const record = await getRecord('backups', filename);
  if (!record) return null;
  return decryptBytes(record);
}

export async function exportBackupBytes(filename, passphrase) {
  const record = await getRecord('backups', filename);
  if (!record) return null;
  const bytes = await decryptBytes(record);
  const salt = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    crypto.getRandomValues(salt);
  } else {
    for (let i = 0; i < 16; i++) salt[i] = Math.floor(Math.random() * 256);
  }
  const iv = new Uint8Array(12);
  if (globalThis.crypto?.getRandomValues) {
    crypto.getRandomValues(iv);
  } else {
    for (let i = 0; i < 12; i++) iv[i] = Math.floor(Math.random() * 256);
  }
  const iterations = 5000;

  const key = deriveKeyJS(passphrase || 'default_cashbuddy_pass', salt, iterations);
  const ciphertext = cryptCTR(bytes, key, iv);

  const payload = {
    format: 'cashbuddy-encrypted-backup',
    version: 2,
    mode: 'JS_CTR_V1',
    source_vault: record.source_vault,
    created_at: record.created_at,
    iterations,
    salt: Array.from(salt),
    iv: Array.from(iv),
    ciphertext: Array.from(ciphertext)
  };
  return new TextEncoder().encode(JSON.stringify(payload));
}

export function checkDatabaseIntegrity() {
  return {
    integrity: execQuery('PRAGMA integrity_check')[0]?.integrity_check || 'unknown',
    foreign_key_violations: execQuery('PRAGMA foreign_key_check'),
    transaction_count: execQuery('SELECT COUNT(*) count FROM transactions')[0]?.count || 0,
    size_bytes: db?.export().byteLength || 0
  };
}
