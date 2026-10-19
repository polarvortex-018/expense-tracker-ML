import {
  initDatabaseEngine,
  execQuery,
  execRun,
  runInTransaction,
  generateUUID,
  getActiveVaultName,
  listVaults,
  createNewVault,
  switchActiveVault,
  deleteVault as removeVault,
  renameVault,
  exportActiveDatabaseBlob,
  exportDatabaseBlobByName,
  importDatabaseBlob,
  createBackupSnapshot,
  listBackupSnapshots,
  restoreBackupSnapshot,
  getBackupSnapshotBytes,
  exportBackupBytes,
  checkDatabaseIntegrity,
  ensureTransactionsAccountIdNullable
} from './db/local_sqlite.js';

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { applyTheme } from '../utils/theme.js';

function uint8ToBase64(uint8) {
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

async function handleNativeExportOrShare(filename, uint8Array, title = 'Cash Buddy File') {
  try {
    const base64Data = uint8ToBase64(uint8Array);
    
    const writeResult = await Filesystem.writeFile({
      path: filename,
      data: base64Data,
      directory: Directory.Cache
    });

    const canShareResult = await Share.canShare();
    if (canShareResult && canShareResult.value) {
      await Share.share({
        title,
        files: [writeResult.uri],
        dialogTitle: title
      });
    } else {
      alert(`File saved to device at: ${writeResult.uri}`);
    }
  } catch (err) {
    console.error('Native export/share error:', err);
    throw new Error(`Failed to save or share file: ${err.message}`);
  }
}

async function normalizeHistoricalTransfers() {
  try {
    execRun(`
      UPDATE transactions 
      SET transaction_type = 'transfer' 
      WHERE transaction_type != 'transfer'
        AND (
          description LIKE 'Transfer:%' 
          OR description LIKE 'Transfer %'
          OR description LIKE '%(split out)' 
          OR description LIKE '%(split in)'
          OR description LIKE 'Salary allocation:%'
        )
    `, [], false);
  } catch (e) {
    console.warn('Historical transfer normalization notice:', e);
  }
}

let isEngineInitialized = false;

async function ensureDB() {
  if (!isEngineInitialized) {
    await initDatabaseEngine();
    isEngineInitialized = true;
    normalizeHistoricalTransfers();
  }
}

function transactionMultiplier(type, adjustmentDirection) {
  if (type === 'expense') return -1;
  if (type === 'income') return 1;
  if (type === 'adjustment' || type === 'transfer') return adjustmentDirection === 'subtract' ? -1 : 1;
  throw new Error('Invalid transaction type.');
}

export const api = {
  async init() {
    await ensureDB();
  },

  // ----------------------------------------------------
  // TRANSACTIONS
  // ----------------------------------------------------
  async getTransactions(params = {}) {
    await ensureDB();
    
    let sql = `
      SELECT 
        t.id, t.amount, t.transaction_type, t.adjustment_direction, t.description, t.date,
        t.account_id, t.bucket_id, t.category_id, t.created_at, t.updated_at, t.include_in_chart,
        a.name as account_name,
        c.name as category_name, c.color as category_color,
        b.name as bucket_name, b.icon as bucket_icon, b.color as bucket_color
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN savings_buckets b ON t.bucket_id = b.id
      WHERE 1=1
    `;
    const sqlParams = [];

    if (params.search) {
      sql += ` AND (t.description LIKE ? OR a.name LIKE ? OR c.name LIKE ? OR b.name LIKE ?)`;
      const term = `%${params.search}%`;
      sqlParams.push(term, term, term, term);
    }

    if (params.account_id) {
      sql += ` AND t.account_id = ?`;
      sqlParams.push(params.account_id);
    }

    if (params.bucket_id) {
      sql += ` AND t.bucket_id = ?`;
      sqlParams.push(params.bucket_id);
    }

    if (params.category_id) {
      const catIds = Array.isArray(params.category_id) ? params.category_id : [params.category_id];
      if (catIds.length > 0) {
        const placeholders = catIds.map(() => '?').join(',');
        sql += ` AND t.category_id IN (${placeholders})`;
        sqlParams.push(...catIds);
      }
    }

    if (params.transaction_type) {
      sql += ` AND t.transaction_type = ?`;
      sqlParams.push(params.transaction_type);
    }

    if (params.start_date) {
      sql += ` AND t.date >= ?`;
      sqlParams.push(params.start_date);
    }

    if (params.end_date) {
      sql += ` AND t.date <= ?`;
      sqlParams.push(params.end_date);
    }

    sql += ` ORDER BY t.date DESC, t.created_at DESC, t.id DESC`;

    if (params.limit) {
      const limit = parseInt(params.limit);
      const skip = parseInt(params.skip || 0);
      sql += ` LIMIT ? OFFSET ?`;
      sqlParams.push(limit, skip);
    }

    const rows = execQuery(sql, sqlParams);
    return rows.map(r => ({
      id: r.id,
      amount: r.amount,
      transaction_type: r.transaction_type,
      adjustment_direction: r.adjustment_direction,
      description: r.description,
      date: r.date,
      account_id: r.account_id,
      bucket_id: r.bucket_id,
      category_id: r.category_id,
      created_at: r.created_at,
      updated_at: r.updated_at,
      include_in_chart: r.include_in_chart ?? 0,
      account: r.account_name ? { id: r.account_id, name: r.account_name } : null,
      category: r.category_name ? { id: r.category_id, name: r.category_name, color: r.category_color } : null,
      bucket: r.bucket_name ? { id: r.bucket_id, name: r.bucket_name, icon: r.bucket_icon, color: r.bucket_color } : null
    }));
  },

  async getTransactionSummary(params = {}) {
    await ensureDB();
    const txs = await this.getTransactions(params);

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotalsMap = {};

    txs.forEach(t => {
      // Internal account transfers & Unallocated Funds transactions must NEVER be included in income or expense totals EXCEPT Salary Allocations
      if (t.transaction_type === 'transfer') return;
      if (t.account_id === 'acc_unallocated_funds') {
        const isSalaryAlloc = Boolean(t.bucket_id) && (t.transaction_type === 'income' || (t.description && t.description.includes('Salary Allocation')));
        if (!isSalaryAlloc) return;
      }

      const isAdjustment = t.transaction_type === 'adjustment' || t.category_id === 'cat_adjustments' || t.category?.name === 'Adjustments';
      if (isAdjustment && Number(t.include_in_chart) !== 1) return;

      const amt = Number(t.amount) || 0;
      if (t.transaction_type === 'income' || (isAdjustment && t.adjustment_direction === 'add')) {
        totalIncome += amt;
      } else if (t.transaction_type === 'expense' || (isAdjustment && t.adjustment_direction === 'subtract')) {
        totalExpense += amt;
        const catName = t.category?.name || (isAdjustment ? 'Adjustments' : 'Uncategorized');
        const catColor = t.category?.color || (isAdjustment ? '#a855f7' : '#64748b');
        if (!categoryTotalsMap[catName]) {
          categoryTotalsMap[catName] = { name: catName, color: catColor, total: 0 };
        }
        categoryTotalsMap[catName].total += amt;
      }
    });

    return {
      total_count: txs.length,
      total_income: totalIncome,
      total_expense: totalExpense,
      net_savings: totalIncome - totalExpense,
      categories_breakdown: Object.values(categoryTotalsMap).sort((a, b) => b.total - a.total)
    };
  },

  async createTransaction(payload) {
    await ensureDB();
    const id = generateUUID();
    const now = new Date().toISOString();
    const amount = Number(payload.amount);
    const type = payload.transaction_type;

    if (!amount || amount <= 0) throw new Error("Amount must be a positive number.");
    if (!['income', 'expense', 'adjustment', 'transfer'].includes(type)) throw new Error('Invalid transaction type.');
    if ((type === 'adjustment' || type === 'transfer') && !['add', 'subtract'].includes(payload.adjustment_direction)) throw new Error('Choose whether the adjustment adds or subtracts money.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date || '')) throw new Error('A valid transaction date is required.');
    
    const accountId = payload.account_id || null;
    const target = payload.adjustment_target || 'both';

    return runInTransaction(async () => {
    // Update Account Balance (if account_id is valid and NOT bucket_only)
    if (accountId && target !== 'bucket_only') {
      const accRows = execQuery('SELECT * FROM accounts WHERE id = ?', [accountId]);
      if (accRows.length) {
        const currentAccBalance = Number(accRows[0].balance) || 0;
        const multiplier = transactionMultiplier(type, payload.adjustment_direction);
        const newAccBalance = Math.round((currentAccBalance + (amount * multiplier)) * 100) / 100;
        execRun('UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?', [newAccBalance, now, accountId], false);
      }
    }

    // Update Savings Bucket Allocation (if bucket_id specified and NOT account_only)
    if (payload.bucket_id && target !== 'account_only') {
      const bucketRows = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [payload.bucket_id]);
      if (bucketRows.length) {
        const currentBucketAlloc = Number(bucketRows[0].allocated_balance) || 0;
        const multiplier = transactionMultiplier(type, payload.adjustment_direction);
        const newBucketAlloc = Math.round((currentBucketAlloc + (amount * multiplier)) * 100) / 100;
        execRun('UPDATE savings_buckets SET allocated_balance = ?, updated_at = ? WHERE id = ?', [newBucketAlloc, now, payload.bucket_id], false);
      }
    }

    // Insert Transaction Record
    const categoryId = accountId === 'acc_unallocated_funds' ? null : (payload.category_id || null);
    const bucketId = accountId === 'acc_unallocated_funds' ? null : (payload.bucket_id || null);
    const includeInChart = payload.include_in_chart ? 1 : 0;

    execRun(
      `INSERT INTO transactions (id, amount, transaction_type, adjustment_direction, description, date, account_id, bucket_id, category_id, created_at, updated_at, include_in_chart)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, amount, type, type === 'adjustment' ? payload.adjustment_direction : null, payload.description || null, payload.date, accountId, bucketId, categoryId, now, now, includeInChart], false
    );

    const created = await this.getTransactions({ limit: 1 });
    return created[0];
    });
  },

  async updateTransaction(id, payload) {
    await ensureDB();
    const existingRows = execQuery('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existingRows.length) throw new Error("Transaction not found.");
    const oldTx = existingRows[0];
    const newAmount = Number(payload.amount);
    if (!Number.isFinite(newAmount) || newAmount <= 0) throw new Error('Amount must be a positive number.');
    if (!['income', 'expense', 'adjustment'].includes(payload.transaction_type)) throw new Error('Invalid transaction type.');
    if (payload.transaction_type === 'adjustment' && !['add', 'subtract'].includes(payload.adjustment_direction)) throw new Error('Choose whether the adjustment adds or subtracts money.');
    
    const accountId = payload.account_id || null;
    const target = payload.adjustment_target || 'both';

    return runInTransaction(async () => {

    // Revert Old Transaction Impact
    const oldAmount = Number(oldTx.amount);
    const oldType = oldTx.transaction_type;
    const oldTarget = oldTx.adjustment_target || 'both';

    if (oldTx.account_id && oldTarget !== 'bucket_only') {
      const oldAccRows = execQuery('SELECT * FROM accounts WHERE id = ?', [oldTx.account_id]);
      if (oldAccRows.length) {
        const bal = Number(oldAccRows[0].balance);
        const revertedBal = Math.round((bal - (oldAmount * transactionMultiplier(oldType, oldTx.adjustment_direction))) * 100) / 100;
        execRun('UPDATE accounts SET balance = ? WHERE id = ?', [revertedBal, oldTx.account_id], false);
      }
    }

    if (oldTx.bucket_id && oldTarget !== 'account_only') {
      const oldBucketRows = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [oldTx.bucket_id]);
      if (oldBucketRows.length) {
        const alloc = Number(oldBucketRows[0].allocated_balance);
        const revertedAlloc = Math.round((alloc - (oldAmount * transactionMultiplier(oldType, oldTx.adjustment_direction))) * 100) / 100;
        execRun('UPDATE savings_buckets SET allocated_balance = ? WHERE id = ?', [revertedAlloc, oldTx.bucket_id], false);
      }
    }

    // Apply New Transaction Impact
    const now = new Date().toISOString();
    const newType = payload.transaction_type;

    if (accountId && target !== 'bucket_only') {
      const newAccRows = execQuery('SELECT * FROM accounts WHERE id = ?', [accountId]);
      if (newAccRows.length) {
        const bal = Number(newAccRows[0].balance);
        const appliedBal = Math.round((bal + (newAmount * transactionMultiplier(newType, payload.adjustment_direction))) * 100) / 100;
        execRun('UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?', [appliedBal, now, accountId], false);
      }
    }

    if (payload.bucket_id && target !== 'account_only') {
      const newBucketRows = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [payload.bucket_id]);
      if (newBucketRows.length) {
        const alloc = Number(newBucketRows[0].allocated_balance);
        const appliedAlloc = Math.round((alloc + (newAmount * transactionMultiplier(newType, payload.adjustment_direction))) * 100) / 100;
        execRun('UPDATE savings_buckets SET allocated_balance = ?, updated_at = ? WHERE id = ?', [appliedAlloc, now, payload.bucket_id], false);
      }
    }

    const includeInChart = payload.include_in_chart ? 1 : 0;

    execRun(
      `UPDATE transactions 
       SET amount = ?, transaction_type = ?, adjustment_direction = ?, description = ?, date = ?, account_id = ?, bucket_id = ?, category_id = ?, updated_at = ?, include_in_chart = ?
       WHERE id = ?`,
      [newAmount, newType, newType === 'adjustment' ? payload.adjustment_direction : null, payload.description || null, payload.date, accountId, payload.bucket_id || null, payload.category_id || null, now, includeInChart, id], false
    );

    return { id, ...payload };
    });
  },

  async deleteTransaction(id) {
    await ensureDB();
    const existingRows = execQuery('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existingRows.length) return null;
    const oldTx = existingRows[0];
    const oldTarget = oldTx.adjustment_target || 'both';

    return runInTransaction(async () => {

    // Revert Account & Bucket impact
    const oldAmount = Number(oldTx.amount);
    const oldType = oldTx.transaction_type;

    if (oldTx.account_id && oldTx.account_id !== 'acc_unassigned_pool' && oldTarget !== 'bucket_only') {
      const oldAccRows = execQuery('SELECT * FROM accounts WHERE id = ?', [oldTx.account_id]);
      if (oldAccRows.length) {
        const bal = Number(oldAccRows[0].balance);
        const revertedBal = bal - (oldAmount * transactionMultiplier(oldType, oldTx.adjustment_direction));
        execRun('UPDATE accounts SET balance = ? WHERE id = ?', [revertedBal, oldTx.account_id], false);
      }
    }

    if (oldTx.bucket_id && oldTarget !== 'account_only') {
      const oldBucketRows = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [oldTx.bucket_id]);
      if (oldBucketRows.length) {
        const alloc = Number(oldBucketRows[0].allocated_balance);
        const revertedAlloc = alloc - (oldAmount * transactionMultiplier(oldType, oldTx.adjustment_direction));
        execRun('UPDATE savings_buckets SET allocated_balance = ? WHERE id = ?', [revertedAlloc, oldTx.bucket_id], false);
      }
    }

    execRun('DELETE FROM transactions WHERE id = ?', [id], false);
    return { status: "deleted" };
    });
  },

  // ----------------------------------------------------
  // ACCOUNTS
  // ----------------------------------------------------
  async getAccounts() {
    await ensureDB();
    return execQuery('SELECT * FROM accounts ORDER BY created_at ASC');
  },

  async createAccount(payload) {
    await ensureDB();
    if (!String(payload.name || '').trim()) throw new Error('Account name is required.');
    const id = generateUUID();
    const now = new Date().toISOString();
    execRun(
      'INSERT INTO accounts (id, name, type, balance, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, payload.name.trim(), payload.type, payload.balance || 0.0, now, now]
    );
    const rows = execQuery('SELECT * FROM accounts WHERE id = ?', [id]);
    return rows[0];
  },

  async updateAccount(id, payload) {
    await ensureDB();
    const now = new Date().toISOString();
    execRun(
      'UPDATE accounts SET name = ?, type = ?, balance = ?, updated_at = ? WHERE id = ?',
      [payload.name.trim(), payload.type || 'Checking', payload.balance || 0.0, now, id]
    );
    const rows = execQuery('SELECT * FROM accounts WHERE id = ?', [id]);
    return rows[0];
  },

  async deleteAccount(id) {
    await ensureDB();
    ensureTransactionsAccountIdNullable();

    return runInTransaction(async () => {
      execRun('UPDATE transactions SET account_id = NULL WHERE account_id = ? OR account_id = "acc_unassigned_pool"', [id], false);
      execRun('UPDATE debts SET account_id = NULL WHERE account_id = ? OR account_id = "acc_unassigned_pool"', [id], false);
      execRun('UPDATE allocation_preset_rules SET account_id = NULL WHERE account_id = ? OR account_id = "acc_unassigned_pool"', [id], false);
      execRun('DELETE FROM accounts WHERE id = ? OR id = "acc_unassigned_pool" OR type = "Unassigned" OR name LIKE "%Unassigned%"', [id], false);
      return { status: 'deleted' };
    });
  },

  async adjustAccountBalance(payload) {
    await ensureDB();
    const { account_id, real_balance, target_bucket_id, include_in_chart } = payload;
    const targetReal = Math.round(Number(real_balance) * 100) / 100;
    if (!Number.isFinite(targetReal)) throw new Error('Valid target balance is required.');
    
    const accRows = execQuery('SELECT * FROM accounts WHERE id = ?', [account_id]);
    if (!accRows.length) throw new Error('Account not found.');
    const acc = accRows[0];
    const currentReal = Number(acc.balance) || 0;
    const diff = targetReal - currentReal;

    if (Math.abs(diff) < 0.005) throw new Error('Account balance already matches current value.');

    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const direction = diff > 0 ? 'add' : 'subtract';
    const absDiff = Math.round(Math.abs(diff) * 100) / 100;
    const desc = `Balance Adjustment for ${acc.name} (${diff > 0 ? '+' : ''}₹${absDiff.toFixed(2)})`;
    const includeInChart = include_in_chart ? 1 : 0;

    return runInTransaction(async () => {
      // 1. Update Account balance
      execRun('UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?', [targetReal, now, account_id], false);

      // 2. Update Bucket balance if a target bucket was specified
      if (target_bucket_id) {
        const bRows = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [target_bucket_id]);
        if (bRows.length) {
          const currentBAlloc = Number(bRows[0].allocated_balance) || 0;
          const newBAlloc = Math.round((currentBAlloc + diff) * 100) / 100;
          execRun('UPDATE savings_buckets SET allocated_balance = ?, updated_at = ? WHERE id = ?', [newBAlloc, now, target_bucket_id], false);
        }
      }

      // 3. Create Transaction Record
      const id = generateUUID();
      execRun(
        `INSERT INTO transactions (id, amount, transaction_type, adjustment_direction, description, date, account_id, bucket_id, category_id, created_at, updated_at, include_in_chart)
         VALUES (?, ?, 'adjustment', ?, ?, ?, ?, ?, NULL, ?, ?, ?)`,
        [id, absDiff, direction, desc, today, account_id, target_bucket_id || null, now, now, includeInChart],
        false
      );

      return { status: 'adjusted', difference: diff, new_balance: targetReal };
    });
  },

  async getAdjustmentAuditLogs() {
    await ensureDB();
    return execQuery(`
      SELECT 
        t.id, t.amount, t.transaction_type, t.adjustment_direction, t.description, t.date,
        t.account_id, t.bucket_id, t.category_id, t.created_at,
        COALESCE(a.name, CASE WHEN t.account_id = 'acc_unallocated_funds' THEN 'Unallocated Funds' ELSE 'Unassigned' END) as account_name,
        c.name as category_name,
        b.name as bucket_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN savings_buckets b ON t.bucket_id = b.id
      WHERE t.transaction_type = 'adjustment' 
         OR t.account_id = 'acc_unallocated_funds' 
         OR t.category_id = 'cat_adjustments' 
         OR t.category_id IS NULL
      ORDER BY t.date DESC, t.created_at DESC
    `);
  },

  async getUnassignedAuditLogs() {
    return this.getAdjustmentAuditLogs();
  },

  // ----------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------
  async getCategories() {
    await ensureDB();
    return execQuery('SELECT * FROM categories ORDER BY sort_order ASC, name ASC');
  },

  async updateCategorySortOrder(categoryIds) {
    await ensureDB();
    const now = new Date().toISOString();
    categoryIds.forEach((id, idx) => {
      execRun('UPDATE categories SET sort_order = ?, updated_at = ? WHERE id = ?', [idx, now, id]);
    });
    return this.getCategories();
  },

  async createCategory(payload) {
    await ensureDB();
    if (!String(payload.name || '').trim()) throw new Error('Category name is required.');
    const id = generateUUID();
    const now = new Date().toISOString();
    execRun(
      'INSERT INTO categories (id, name, color, icon, category_type, is_quick_select, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, payload.name.trim(), payload.color || '#D4BFFF', payload.icon || 'category', payload.category_type === 'income' ? 'income' : 'expense', payload.is_quick_select ? 1 : 0, now, now]
    );
    const rows = execQuery('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  },

  async updateCategory(id, payload) {
    await ensureDB();
    const now = new Date().toISOString();
    execRun(
      'UPDATE categories SET name = ?, color = ?, icon = ?, category_type = ?, is_quick_select = ?, updated_at = ? WHERE id = ?',
      [payload.name.trim(), payload.color || '#D4BFFF', payload.icon || 'category', payload.category_type === 'income' ? 'income' : 'expense', payload.is_quick_select ? 1 : 0, now, id]
    );
    const rows = execQuery('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  },

  async deleteCategory(id) {
    await ensureDB();
    execRun('DELETE FROM categories WHERE id = ?', [id]);
    return { status: "deleted" };
  },

  // ----------------------------------------------------
  // SAVINGS BUCKETS
  // ----------------------------------------------------
  async getBuckets(includeArchived = false) {
    await ensureDB();
    if (includeArchived) {
      return execQuery('SELECT * FROM savings_buckets ORDER BY is_archived ASC, sort_order ASC, created_at ASC');
    }
    return execQuery('SELECT * FROM savings_buckets WHERE is_archived = 0 ORDER BY sort_order ASC, created_at ASC');
  },

  async updateBucketSortOrder(bucketIds) {
    await ensureDB();
    const now = new Date().toISOString();
    bucketIds.forEach((id, idx) => {
      execRun('UPDATE savings_buckets SET sort_order = ?, updated_at = ? WHERE id = ?', [idx, now, id]);
    });
    return this.getBuckets(true);
  },

  async createBucket(payload) {
    await ensureDB();
    if (!String(payload.name || '').trim()) throw new Error('Bucket name is required.');
    const id = generateUUID();
    const now = new Date().toISOString();
    execRun(
      'INSERT INTO savings_buckets (id, name, allocated_balance, target_amount, icon, color, is_archived, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, payload.name.trim(), payload.allocated_balance || 0.0, payload.target_amount || null, payload.icon || 'savings', payload.color || '#D4BFFF', 0, now, now]
    );
    const rows = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [id]);
    return rows[0];
  },

  async updateBucket(id, payload) {
    await ensureDB();
    const now = new Date().toISOString();
    execRun(
      'UPDATE savings_buckets SET name = ?, icon = ?, color = ?, is_archived = ?, updated_at = ? WHERE id = ?',
      [payload.name.trim(), payload.icon || 'savings', payload.color || '#D4BFFF', payload.is_archived ? 1 : 0, now, id]
    );
    const rows = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [id]);
    return rows[0];
  },

  async deleteBucket(id) {
    await ensureDB();
    const bucket = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [id])[0];
    if (!bucket) throw new Error('Savings bucket not found.');
    return runInTransaction(async () => {
      // Preserve ledger and debt history while removing the deleted purpose.
      execRun('UPDATE transactions SET bucket_id = NULL WHERE bucket_id = ?', [id], false);
      execRun('UPDATE debts SET bucket_id = NULL WHERE bucket_id = ?', [id], false);
      execRun('DELETE FROM savings_buckets WHERE id = ?', [id], false);
      return { status: 'deleted', removed_allocation: Number(bucket.allocated_balance) || 0 };
    });
  },

  async transferBucket(payload) {
    await ensureDB();
    const { from_bucket_id, to_bucket_id, amount } = payload;
    const transferAmt = Number(amount);
    if (!transferAmt || transferAmt <= 0) throw new Error("Transfer amount must be positive.");
    if (to_bucket_id && from_bucket_id === to_bucket_id) throw new Error('Source and destination buckets must be different.');

    const fromRows = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [from_bucket_id]);
    if (!fromRows.length) throw new Error("Source bucket not found.");
    const fromAlloc = Number(fromRows[0].allocated_balance) || 0;
    if (transferAmt > fromAlloc) throw new Error('Transfer amount exceeds the source bucket balance.');

    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    return runInTransaction(async () => {
      execRun('UPDATE savings_buckets SET allocated_balance = ?, updated_at = ? WHERE id = ?', [fromAlloc - transferAmt, now, from_bucket_id], false);
      let toName = 'Unallocated Funds';
      if (to_bucket_id) {
        // Transfer to another bucket
        const toRows = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [to_bucket_id]);
        if (!toRows.length) throw new Error("Destination bucket not found.");
        const toAlloc = Number(toRows[0].allocated_balance) || 0;
        toName = toRows[0].name;
        execRun('UPDATE savings_buckets SET allocated_balance = ?, updated_at = ? WHERE id = ?', [toAlloc + transferAmt, now, to_bucket_id], false);
      }

      // Log real transaction so bucket transfer appears in History
      const fromName = fromRows[0].name;
      const desc = `Bucket Transfer: ${fromName} → ${toName}`;
      const txId = generateUUID();
      const accId = fromRows[0].account_id || 'acc_unallocated_funds';

      execRun(
        `INSERT INTO transactions (id, amount, transaction_type, adjustment_direction, description, date, account_id, bucket_id, category_id, created_at, updated_at, include_in_chart)
         VALUES (?, ?, 'transfer', 'subtract', ?, ?, ?, ?, NULL, ?, ?, 0)`,
        [txId, transferAmt, desc, today, accId, from_bucket_id, now, now],
        false
      );

      return { status: "transferred", transaction_id: txId };
    });
  },

  // ----------------------------------------------------
  // ACCOUNT-TO-ACCOUNT TRANSFER
  // ----------------------------------------------------
  async transferBetweenAccounts(payload) {
    await ensureDB();
    const { from_account_id, to_account_id, bucket_id, amount, description } = payload;
    const transferAmt = Number(amount);
    if (!transferAmt || transferAmt <= 0) throw new Error("Transfer amount must be positive.");
    if (from_account_id === to_account_id) throw new Error('Source and destination accounts must be different.');

    const fromAcc = execQuery('SELECT * FROM accounts WHERE id = ?', [from_account_id])[0];
    const toAcc = execQuery('SELECT * FROM accounts WHERE id = ?', [to_account_id])[0];
    if (!fromAcc || !toAcc) throw new Error("One or both accounts not found.");
    if (Number(fromAcc.balance) < transferAmt) throw new Error(`Insufficient balance in source account (₹${Number(fromAcc.balance).toFixed(2)} available).`);

    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const desc = description?.trim() || `Transfer: ${fromAcc.name} → ${toAcc.name}`;

    return runInTransaction(async () => {
      // Deduct from source account
      execRun('UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?', [Math.round((Number(fromAcc.balance) - transferAmt) * 100) / 100, now, from_account_id], false);
      // Add to destination account
      execRun('UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?', [Math.round((Number(toAcc.balance) + transferAmt) * 100) / 100, now, to_account_id], false);

      // Bucket impact — the money stays allocated to the same bucket, just moves accounts
      // We record two transfer transactions for full ledger traceability
      const outId = generateUUID();
      const inId = generateUUID();
      execRun(
        `INSERT INTO transactions (id, amount, transaction_type, adjustment_direction, description, date, account_id, bucket_id, category_id, created_at, updated_at)
         VALUES (?, ?, 'transfer', 'subtract', ?, ?, ?, ?, NULL, ?, ?)`,
        [outId, transferAmt, desc, today, from_account_id, bucket_id || null, now, now], false
      );
      execRun(
        `INSERT INTO transactions (id, amount, transaction_type, adjustment_direction, description, date, account_id, bucket_id, category_id, created_at, updated_at)
         VALUES (?, ?, 'transfer', 'add', ?, ?, ?, ?, NULL, ?, ?)`,
        [inId, transferAmt, desc, today, to_account_id, bucket_id || null, now, now], false
      );

      // If a bucket was specified, the balance within the bucket doesn't change
      // (same money, just moved between accounts — net bucket impact is 0)
      // But we do need to cancel out the bucket allocation adjustment since both
      // adjustments would double-count. Keep allocation flat.
      if (bucket_id) {
        const bucket = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [bucket_id])[0];
        if (bucket) {
          // The two transactions cancel each other on bucket allocation (−amount + amount = 0)
          // So no UPDATE needed on savings_buckets. The transactions are just ledger records.
        }
      }

      return { status: 'transferred', from: fromAcc.name, to: toAcc.name, amount: transferAmt };
    });
  },

  // ----------------------------------------------------
  // ALLOCATION PRESETS
  // ----------------------------------------------------
  async getPresets() {
    await ensureDB();
    const presets = execQuery('SELECT * FROM allocation_presets ORDER BY updated_at DESC');
    return presets.map(p => ({
      ...p,
      rules: execQuery('SELECT * FROM allocation_preset_rules WHERE preset_id = ? ORDER BY rowid ASC', [p.id])
    }));
  },

  async createPreset(payload) {
    await ensureDB();
    if (!String(payload.name || '').trim()) throw new Error('Preset name is required.');
    if (!Array.isArray(payload.rules) || payload.rules.length === 0) throw new Error('At least one rule is required.');
    const id = generateUUID();
    const now = new Date().toISOString();
    return runInTransaction(async () => {
      execRun('INSERT INTO allocation_presets (id, name, mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [id, payload.name.trim(), payload.mode || 'percentage', now, now], false);
      for (const rule of payload.rules) {
        const val = Number(rule.value);
        if (!val || val <= 0) throw new Error('Each rule value must be a positive number.');
        execRun(
          'INSERT INTO allocation_preset_rules (id, preset_id, bucket_id, account_id, category_id, mode, value, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [generateUUID(), id, rule.bucket_id || null, rule.account_id || null, rule.category_id || null, payload.mode || 'percentage', val, now], false
        );
      }
      const preset = execQuery('SELECT * FROM allocation_presets WHERE id = ?', [id])[0];
      return { ...preset, rules: execQuery('SELECT * FROM allocation_preset_rules WHERE preset_id = ?', [id]) };
    });
  },

  async updatePreset(id, payload) {
    await ensureDB();
    const now = new Date().toISOString();
    return runInTransaction(async () => {
      if (payload.name) execRun('UPDATE allocation_presets SET name = ?, mode = ?, updated_at = ? WHERE id = ?', [payload.name.trim(), payload.mode || 'percentage', now, id], false);
      if (Array.isArray(payload.rules)) {
        execRun('DELETE FROM allocation_preset_rules WHERE preset_id = ?', [id], false);
        for (const rule of payload.rules) {
          const val = Number(rule.value);
          if (!val || val <= 0) throw new Error('Each rule value must be a positive number.');
          execRun(
            'INSERT INTO allocation_preset_rules (id, preset_id, bucket_id, account_id, category_id, mode, value, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [generateUUID(), id, rule.bucket_id || null, rule.account_id || null, rule.category_id || null, payload.mode || 'percentage', val, now], false
          );
        }
      }
      const preset = execQuery('SELECT * FROM allocation_presets WHERE id = ?', [id])[0];
      return { ...preset, rules: execQuery('SELECT * FROM allocation_preset_rules WHERE preset_id = ?', [id]) };
    });
  },

  async deletePreset(id) {
    await ensureDB();
    execRun('DELETE FROM allocation_presets WHERE id = ?', [id]);
    return { status: 'deleted' };
  },

  async applyPreset(idOrPayload, options = {}) {
    await ensureDB();
    let id, payload;
    if (typeof idOrPayload === 'object' && idOrPayload !== null) {
      id = idOrPayload.preset_id || idOrPayload.id;
      payload = idOrPayload;
    } else {
      id = idOrPayload;
      payload = options || {};
    }

    if (!id) throw new Error('Preset ID is required.');
    
    const preset = execQuery('SELECT * FROM allocation_presets WHERE id = ?', [id])[0];
    if (!preset) throw new Error('Preset not found.');
    
    const rules = execQuery('SELECT * FROM allocation_preset_rules WHERE preset_id = ?', [id]);
    if (!rules.length) throw new Error('This preset has no rules configured.');

    const mode = preset.mode || 'percentage';
    const totalAmount = Number(payload.base_amount || payload.total_amount || 0);

    let total = 0;
    if (mode === 'percentage') {
      total = totalAmount;
      if (!total || total <= 0) throw new Error('Deposit amount must be a positive number.');
    } else {
      total = rules.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
    }

    const actualSourceAccountId = payload.source_account_id || 'acc_unallocated_funds';
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const desc = payload.description?.trim() || `Salary Allocation: ${preset.name}`;

    return runInTransaction(async () => {
      const distributions = [];

      for (const rule of rules) {
        const share = mode === 'percentage' ? (total * Number(rule.value) / 100) : Number(rule.value);
        const rounded = Math.round(share * 100) / 100;
        if (rounded <= 0) continue;

        const targetBucketId = rule.bucket_id || null;
        const targetAccountId = rule.account_id || null;

        // 1. Allocate to target bucket
        if (targetBucketId) {
          const bRows = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [targetBucketId]);
          if (bRows.length) {
            execRun('UPDATE savings_buckets SET allocated_balance = allocated_balance + ?, updated_at = ? WHERE id = ?',
              [rounded, now, targetBucketId], false);
          }
        }

        // 2. If target account is specified, update target account balance
        if (targetAccountId) {
          execRun('UPDATE accounts SET balance = balance + ?, updated_at = ? WHERE id = ?', [rounded, now, targetAccountId], false);
        }

        // 3. Log income transaction for bucket allocation so it reflects as bucket income
        const txId = generateUUID();
        const bObj = targetBucketId ? execQuery('SELECT name FROM savings_buckets WHERE id = ?', [targetBucketId])[0] : null;
        const allocDesc = bObj ? `Salary Allocation → ${bObj.name}` : desc;
        execRun(
          `INSERT INTO transactions (id, amount, transaction_type, adjustment_direction, description, date, account_id, bucket_id, category_id, created_at, updated_at, include_in_chart)
           VALUES (?, ?, 'income', 'add', ?, ?, ?, ?, ?, ?, ?, 1)`,
          [txId, rounded, allocDesc, today, targetAccountId || actualSourceAccountId, targetBucketId, rule.category_id || null, now, now],
          false
        );

        distributions.push({ bucket_id: targetBucketId, amount: rounded });
      }

      if (actualSourceAccountId === 'acc_unallocated_funds') {
        const totalDistributed = distributions.reduce((sum, d) => sum + d.amount, 0);
        execRun('UPDATE accounts SET balance = balance - ?, updated_at = ? WHERE id = "acc_unallocated_funds"', [totalDistributed, now], false);
      }

      return { status: 'applied', preset_name: preset.name, distributions };
    });
  },

  // ----------------------------------------------------
  // DEBTS
  // ----------------------------------------------------
  async getDebts() {
    await ensureDB();
    return execQuery(`
      SELECT d.*, a.name as account_name
      FROM debts d
      LEFT JOIN accounts a ON d.account_id = a.id
      ORDER BY d.created_at DESC
    `).map(debt => ({ ...debt, type: debt.debt_type }));
  },

  async createDebt(payload) {
    await ensureDB();
    if (!String(payload.person_name || '').trim()) throw new Error('Person name is required.');
    if (!Number.isFinite(Number(payload.amount)) || Number(payload.amount) <= 0) throw new Error('Debt amount must be positive.');
    const debtType = payload.debt_type || payload.type;
    if (!['lent', 'borrowed'].includes(debtType)) throw new Error('Debt type must be lent or borrowed.');
    const account = execQuery('SELECT * FROM accounts WHERE id = ?', [payload.account_id])[0];
    if (!account) throw new Error('Please select a valid account.');
    const bucket = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [payload.bucket_id])[0];
    if (!bucket) throw new Error('Please select a valid savings bucket.');
    const id = generateUUID();
    const now = new Date().toISOString();
    const amount = Number(payload.amount);
    return runInTransaction(async () => {
      const nextBalance = Math.round((debtType === 'lent' ? Number(account.balance) - amount : Number(account.balance) + amount) * 100) / 100;
      const nextAllocation = Math.round((debtType === 'lent' ? Number(bucket.allocated_balance) - amount : Number(bucket.allocated_balance) + amount) * 100) / 100;
      execRun('UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?', [nextBalance, now, account.id], false);
      execRun('UPDATE savings_buckets SET allocated_balance = ?, updated_at = ? WHERE id = ?', [nextAllocation, now, bucket.id], false);
      execRun(
        'INSERT INTO debts (id, person_name, amount, debt_type, description, due_date, is_settled, account_id, bucket_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, payload.person_name.trim(), amount, debtType, payload.description || null, payload.due_date || null, 0, account.id, bucket.id, now, now],
        false
      );
      const debt = execQuery('SELECT * FROM debts WHERE id = ?', [id])[0];
      return { ...debt, type: debt.debt_type };
    });
  },

  async allocateUnassigned(payload, amountArg) {
    await ensureDB();
    const isObject = typeof payload === 'object' && payload !== null;
    const bucketId = isObject ? payload.bucket_id : payload;
    const accountId = isObject ? payload.account_id : null;
    const allocation = Math.round(Number(isObject ? payload.amount : amountArg) * 100) / 100;
    const categoryId = isObject ? (payload.category_id || null) : null;
    const description = isObject ? payload.description : null;

    if (!Number.isFinite(allocation) || allocation <= 0) throw new Error('Allocation amount must be positive.');
    if (!accountId || accountId === 'acc_unallocated_funds') throw new Error('Please select a destination bank account.');
    const account = execQuery('SELECT * FROM accounts WHERE id = ?', [accountId])[0];
    if (!account) throw new Error('Destination bank account not found.');
    const bucket = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [bucketId])[0];
    if (!bucket) throw new Error('Savings bucket not found.');
    const unallocatedAccount = execQuery("SELECT * FROM accounts WHERE id = 'acc_unallocated_funds'")[0];
    if (!unallocatedAccount) throw new Error('Unallocated Funds account not found.');
    if (allocation > Number(unallocatedAccount.balance || 0)) throw new Error('Allocation exceeds available unallocated funds.');

    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const desc = description?.trim() || `Reallocated to ${bucket.name}`;

    return runInTransaction(async () => {
      const currentPool = execQuery("SELECT * FROM accounts WHERE id = 'acc_unallocated_funds'")[0];
      const currentAccount = execQuery('SELECT * FROM accounts WHERE id = ?', [accountId])[0];
      const currentBucket = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [bucketId])[0];
      if (!currentPool || !currentAccount || !currentBucket) throw new Error('The selected account or bucket is no longer available.');
      if (allocation > Number(currentPool.balance || 0)) throw new Error('Allocation exceeds available unallocated funds.');

      execRun('UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?', [Math.round((Number(currentPool.balance) - allocation) * 100) / 100, now, currentPool.id], false);
      execRun('UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?', [Math.round((Number(currentAccount.balance) + allocation) * 100) / 100, now, accountId], false);
      execRun('UPDATE savings_buckets SET allocated_balance = ?, updated_at = ? WHERE id = ?', [Math.round((Number(currentBucket.allocated_balance) + allocation) * 100) / 100, now, bucketId], false);

      const txId = generateUUID();
      execRun(
        `INSERT INTO transactions (id, amount, transaction_type, adjustment_direction, description, date, account_id, bucket_id, category_id, created_at, updated_at, include_in_chart)
         VALUES (?, ?, 'income', NULL, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [txId, allocation, desc, today, accountId, bucketId, categoryId, now, now],
        false
      );

      return { status: 'allocated', amount: allocation, bucket_id: bucketId, account_id: accountId, transaction_id: txId };
    });
  },
  async settleDebt(id, payload = {}) {
    await ensureDB();
    const debt = execQuery('SELECT * FROM debts WHERE id = ?', [id])[0];
    if (!debt) throw new Error('Debt record not found.');
    if (debt.is_settled) throw new Error('This debt is already settled.');
    const accountId = typeof payload === 'string' ? payload : (payload.account_id || debt.account_id);
    const account = execQuery('SELECT * FROM accounts WHERE id = ?', [accountId])[0];
    if (!account) throw new Error('Please select a valid settlement account.');
    const now = new Date().toISOString();
    return runInTransaction(async () => {
      const amount = Number(debt.amount);
      const nextBalance = Math.round((debt.debt_type === 'lent' ? Number(account.balance) + amount : Number(account.balance) - amount) * 100) / 100;
      execRun('UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?', [nextBalance, now, account.id], false);
      if (debt.bucket_id) {
        const bucket = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [debt.bucket_id])[0];
        if (bucket) {
          const nextAllocation = Math.round((debt.debt_type === 'lent' ? Number(bucket.allocated_balance) + amount : Number(bucket.allocated_balance) - amount) * 100) / 100;
          execRun('UPDATE savings_buckets SET allocated_balance = ?, updated_at = ? WHERE id = ?', [nextAllocation, now, bucket.id], false);
        }
      }
      execRun('UPDATE debts SET is_settled = 1, account_id = ?, updated_at = ? WHERE id = ?', [account.id, now, id], false);
      return { ...execQuery('SELECT * FROM debts WHERE id = ?', [id])[0], type: debt.debt_type };
    });
  },

  async settleDebts(ids, payload = {}) {
    await ensureDB();
    const debtIds = [...new Set((Array.isArray(ids) ? ids : []).filter(Boolean))];
    if (!debtIds.length) throw new Error('No debt entries to settle.');
    const placeholders = debtIds.map(() => '?').join(', ');
    const debts = execQuery(`SELECT * FROM debts WHERE id IN (${placeholders})`, debtIds);
    if (debts.length !== debtIds.length) throw new Error('One or more debt records could not be found.');
    if (debts.some(debt => debt.is_settled)) throw new Error('All entries must be active to settle them together.');
    const personKey = String(debts[0].person_name || '').trim().toLocaleLowerCase();
    if (debts.some(debt => String(debt.person_name || '').trim().toLocaleLowerCase() !== personKey)) {
      throw new Error('Debt entries must belong to the same person.');
    }

    const netCents = debts.reduce((total, debt) => {
      const cents = Math.round(Number(debt.amount) * 100);
      return total + (debt.debt_type === 'lent' ? cents : -cents);
    }, 0);
    const accountId = typeof payload === 'string' ? payload : payload.account_id;
    if (netCents && !accountId) throw new Error('Please select a settlement account.');
    const now = new Date().toISOString();

    return runInTransaction(async () => {
      if (netCents) {
        const account = execQuery('SELECT * FROM accounts WHERE id = ?', [accountId])[0];
        if (!account) throw new Error('Please select a valid settlement account.');
        const nextBalance = Math.round((Number(account.balance) + netCents / 100) * 100) / 100;
        execRun('UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?', [nextBalance, now, account.id], false);
      }

      const bucketDeltas = new Map();
      for (const debt of debts) {
        if (!debt.bucket_id) continue;
        const cents = Math.round(Number(debt.amount) * 100) * (debt.debt_type === 'lent' ? 1 : -1);
        bucketDeltas.set(debt.bucket_id, (bucketDeltas.get(debt.bucket_id) || 0) + cents);
      }
      for (const [bucketId, cents] of bucketDeltas) {
        const bucket = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [bucketId])[0];
        if (!bucket) continue;
        const nextAllocation = Math.round((Number(bucket.allocated_balance) + cents / 100) * 100) / 100;
        execRun('UPDATE savings_buckets SET allocated_balance = ?, updated_at = ? WHERE id = ?', [nextAllocation, now, bucketId], false);
      }

      execRun(
        `UPDATE debts SET is_settled = 1, ${netCents ? 'account_id = ?, ' : ''}updated_at = ? WHERE id IN (${placeholders}) AND is_settled = 0`,
        netCents ? [accountId, now, ...debtIds] : [now, ...debtIds],
        false
      );
      return { status: 'settled', count: debts.length, net_amount: netCents / 100 };
    });
  },
  async deleteDebt(id) {
    await ensureDB();
    const debt = execQuery('SELECT * FROM debts WHERE id = ?', [id])[0];
    if (!debt) throw new Error('Debt record not found.');
    return runInTransaction(async () => {
      if (!debt.is_settled && debt.account_id) {
        const account = execQuery('SELECT * FROM accounts WHERE id = ?', [debt.account_id])[0];
        if (account) {
          const amount = Number(debt.amount);
          const restored = debt.debt_type === 'lent' ? Number(account.balance) + amount : Number(account.balance) - amount;
          execRun('UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?', [restored, new Date().toISOString(), account.id], false);
        }
      }
      if (!debt.is_settled && debt.bucket_id) {
        const bucket = execQuery('SELECT * FROM savings_buckets WHERE id = ?', [debt.bucket_id])[0];
        if (bucket) {
          const amount = Number(debt.amount);
          const restored = debt.debt_type === 'lent' ? Number(bucket.allocated_balance) + amount : Number(bucket.allocated_balance) - amount;
          execRun('UPDATE savings_buckets SET allocated_balance = ?, updated_at = ? WHERE id = ?', [restored, new Date().toISOString(), bucket.id], false);
        }
      }
      execRun('DELETE FROM debts WHERE id = ?', [id], false);
      return { status: "deleted" };
    });
  },

  // ----------------------------------------------------
  // VAULTS MANAGEMENT (ON-PHONE)
  // ----------------------------------------------------
  async getVaults() {
    await ensureDB();
    return listVaults();
  },

  async createVault(name) {
    await ensureDB();
    const filename = await createNewVault(name);
    return { active_vault: filename, vaults: listVaults() };
  },

  async switchVault(filename) {
    await ensureDB();
    await switchActiveVault(filename);
    return { active_vault: filename, vaults: listVaults() };
  },

  async importVault(file, passphrase = '') {
    await ensureDB();
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const filename = await importDatabaseBlob(file.name, uint8Array, passphrase);
    return { active_vault: filename, vaults: listVaults() };
  },

  async deleteVault(filename) {
    await ensureDB();
    await removeVault(filename);
    return { vaults: listVaults() };
  },

  async renameVault(filename, newName) {
    await ensureDB();
    await renameVault(filename, newName);
    return { vaults: listVaults() };
  },

  async getVaultCurrency() {
    await ensureDB();
    try {
      execRun(`CREATE TABLE IF NOT EXISTS vault_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`, [], false);
      const rows = execQuery("SELECT value FROM vault_settings WHERE key = 'currency'");
      if (rows && rows.length > 0 && rows[0].value) {
        return JSON.parse(rows[0].value);
      }
    } catch (e) {
      console.warn("Failed to get vault currency from DB:", e);
    }
    return null;
  },

  async setVaultCurrency(curr) {
    await ensureDB();
    try {
      execRun(`CREATE TABLE IF NOT EXISTS vault_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`, [], false);
      const now = new Date().toISOString();
      const valStr = JSON.stringify(curr);
      execRun("INSERT OR REPLACE INTO vault_settings (key, value, updated_at) VALUES ('currency', ?, ?)", [valStr, now], false);
      return curr;
    } catch (e) {
      console.error("Failed to save vault currency to DB:", e);
      throw e;
    }
  },

  async getVaultTheme() {
    await ensureDB();
    try {
      execRun(`CREATE TABLE IF NOT EXISTS vault_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`, [], false);
      const rows = execQuery("SELECT value FROM vault_settings WHERE key = 'theme'");
      if (rows && rows.length > 0 && rows[0].value) {
        return rows[0].value;
      }
    } catch (e) {
      console.warn("Failed to get vault theme from DB:", e);
    }
    return 'pastel-dark';
  },

  async setVaultTheme(themeId) {
    await ensureDB();
    try {
      execRun(`CREATE TABLE IF NOT EXISTS vault_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`, [], false);
      const now = new Date().toISOString();
      execRun("INSERT OR REPLACE INTO vault_settings (key, value, updated_at) VALUES ('theme', ?, ?)", [themeId, now], false);
      applyTheme(themeId);
      return themeId;
    } catch (e) {
      console.error("Failed to save vault theme to DB:", e);
      throw e;
    }
  },

  // ----------------------------------------------------
  // BACKUP & EXPORT (ON-PHONE & WEB)
  // ----------------------------------------------------
  async exportActiveDatabase() {
    await ensureDB();
    const binary = exportActiveDatabaseBlob();
    if (!binary || binary.byteLength === 0) throw new Error("Database is empty or not initialized.");

    const filename = getActiveVaultName() || 'finance.db';

    if (Capacitor.isNativePlatform()) {
      await handleNativeExportOrShare(filename, binary, `Cash Buddy Database (${filename})`);
      return;
    }

    const blob = new Blob([binary], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  async downloadBackupFile(filename) {
    await ensureDB();
    const binary = await getBackupSnapshotBytes(filename);
    if (!binary || binary.byteLength === 0) throw new Error('Failed to read backup file data.');

    const outName = filename.endsWith('.db') ? filename : filename.replace(/\.cbbak$/i, '.db');

    if (Capacitor.isNativePlatform()) {
      await handleNativeExportOrShare(outName, binary, `Cash Buddy Backup (${outName})`);
      return;
    }

    const blob = new Blob([binary], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  exportDatabaseUrl() {
    const binary = exportActiveDatabaseBlob();
    if (!binary) return '#';
    const blob = new Blob([binary], { type: 'application/x-sqlite3' });
    return URL.createObjectURL(blob);
  },

  async createBackup() {
    await ensureDB();
    const backupFilename = await createBackupSnapshot();
    return { backup_filename: backupFilename, message: "Backup snapshot saved locally." };
  },

  async getBackups() {
    await ensureDB();
    return listBackupSnapshots();
  },

  async restoreBackup(filename) {
    await ensureDB();
    const active = await restoreBackupSnapshot(filename);
    return { active_vault: active, message: "Database restored from backup." };
  },

  async getBackupDownloadUrl(filename) {
    await ensureDB();
    const binary = await getBackupSnapshotBytes(filename);
    if (!binary) return '#';
    const blob = new Blob([binary], { type: 'application/x-sqlite3' });
    return URL.createObjectURL(blob);
  },

  async shareBackupFile(filename, passphrase) {
    if (!passphrase || passphrase.length < 8) {
      throw new Error('Passphrase must be at least 8 characters long.');
    }
    const binary = await exportBackupBytes(filename, passphrase);
    if (!binary) throw new Error("Backup file not found");

    if (Capacitor.isNativePlatform()) {
      await handleNativeExportOrShare(filename, binary, `Cash Buddy Backup (${filename})`);
      return;
    }

    const blob = new Blob([binary], { type: 'application/x-sqlite3' });
    const file = new File([blob], filename, { type: 'application/x-sqlite3' });

    let sharedSuccess = false;
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Cash Buddy Backup (${filename})`,
          text: `Here is my Cash Buddy database backup file: ${filename}`,
          files: [file]
        });
        sharedSuccess = true;
      } catch (err) {
        if (err.name === 'AbortError') sharedSuccess = true;
      }
    }

    if (!sharedSuccess) {
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  },

  async shareVaultFile(filename) {
    await ensureDB();
    const binary = await exportDatabaseBlobByName(filename);
    if (!binary) throw new Error("Vault not found.");

    if (Capacitor.isNativePlatform()) {
      await handleNativeExportOrShare(filename, binary, `Cash Buddy Vault (${filename})`);
      return;
    }

    const blob = new Blob([binary], { type: 'application/x-sqlite3' });
    const file = new File([blob], filename, { type: 'application/x-sqlite3' });

    let sharedSuccess = false;
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Cash Buddy Vault (${filename})`,
          text: `Here is my Cash Buddy vault file: ${filename}`,
          files: [file]
        });
        sharedSuccess = true;
      } catch (err) {
        if (err.name === 'AbortError') sharedSuccess = true;
      }
    }

    if (!sharedSuccess) {
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  },

  async checkIntegrity() { await ensureDB(); return checkDatabaseIntegrity(); },

  // ----------------------------------------------------
  // ONBOARDING & TUTORIAL STATE (PER VAULT)
  // ----------------------------------------------------
  async getOnboardingState() {
    await ensureDB();
    const rows = execQuery("SELECT key, value FROM app_metadata WHERE key IN ('setup_complete', 'tutorial_complete')");
    const map = {};
    rows.forEach(r => { map[r.key] = r.value; });

    const txCount = execQuery('SELECT COUNT(*) count FROM transactions')[0]?.count || 0;

    let setupComplete = false;
    if (map['setup_complete'] === 'true') {
      setupComplete = true;
    } else if (map['setup_complete'] === 'false') {
      setupComplete = false;
    } else {
      // Legacy vault without setup_complete key: complete if txCount > 0
      setupComplete = txCount > 0;
    }

    let tutorialComplete = false;
    if (map['tutorial_complete'] === 'true') {
      tutorialComplete = true;
    } else if (map['tutorial_complete'] === 'false') {
      tutorialComplete = false;
    } else {
      // Legacy vault without tutorial_complete key: complete if txCount > 0
      tutorialComplete = txCount > 0;
    }

    console.log('[ONBOARDING DEBUG] api.getOnboardingState():', { map, txCount, setupComplete, tutorialComplete });
    return { setupComplete, tutorialComplete };
  },

  async setOnboardingState({ setupComplete, tutorialComplete }) {
    await ensureDB();
    return runInTransaction(async () => {
      if (setupComplete !== undefined) {
        execRun("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('setup_complete', ?)", [setupComplete ? 'true' : 'false'], false);
      }
      if (tutorialComplete !== undefined) {
        execRun("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('tutorial_complete', ?)", [tutorialComplete ? 'true' : 'false'], false);
      }
      return this.getOnboardingState();
    });
  },

  async getAppSetting(key, defaultValue = 'false') {
    await ensureDB();
    const rows = execQuery("SELECT value FROM app_metadata WHERE key = ?", [key]);
    return rows.length ? rows[0].value : defaultValue;
  },

  async updateAppSetting(key, value) {
    await ensureDB();
    const valStr = String(value);
    execRun("INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)", [key, valStr], true);
    return { key, value: valStr };
  }
};
