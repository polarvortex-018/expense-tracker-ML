<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { api } from './services/api';
import { saveAccountOrder } from './utils/accountSorter.js';
import Dashboard from './components/Dashboard.vue';
import TransactionList from './components/TransactionList.vue';
import TransactionForm from './components/TransactionForm.vue';
import DebtList from './components/DebtList.vue';
import SettingsView from './components/SettingsView.vue';
import VaultModal from './components/VaultModal.vue';
import OnboardingModal from './components/OnboardingModal.vue';
import { loadCurrencyForActiveVault, setCurrency } from './utils/currency.js';
import { applyTheme } from './utils/theme.js';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

// State
const currentTab = ref('dashboard'); // 'dashboard', 'transactions', 'debts', or 'settings'
const transactions = ref([]);
const dashboardTransactions = ref([]);
const transactionSummary = ref({ total_count: 0, total_income: 0, total_expense: 0, categories_breakdown: [] });
const accounts = ref([]);
const categories = ref([]);
const buckets = ref([]);
const debts = ref([]);

// Onboarding State
const showOnboardingModal = ref(false);
const onboardingStage = ref('setup');

const checkOnboarding = async () => {
  try {
    const ob = await api.getOnboardingState();
    console.log('[ONBOARDING DEBUG] checkOnboarding result:', ob, 'current showModal:', showOnboardingModal.value);
    if (!ob.setupComplete || !ob.tutorialComplete) {
      if (!showOnboardingModal.value) {
        onboardingStage.value = !ob.setupComplete ? 'setup' : 'tutorial';
        showOnboardingModal.value = true;
        console.log('[ONBOARDING DEBUG] Opening onboarding modal with stage:', onboardingStage.value);
      }
    } else {
      showOnboardingModal.value = false;
      console.log('[ONBOARDING DEBUG] Onboarding & Tutorial complete. Modal closed.');
    }
  } catch (err) {
    console.error('Check onboarding error:', err);
  }
};

const openTutorial = () => {
  console.log('[ONBOARDING DEBUG] openTutorial event received in App.vue! Opening tutorial stage.');
  onboardingStage.value = 'tutorial';
  showOnboardingModal.value = true;
};

const openVaultSetup = () => {
  console.log('[ONBOARDING DEBUG] openVaultSetup event received in App.vue! Opening setup stage.');
  onboardingStage.value = 'setup';
  showOnboardingModal.value = true;
};



// Settings Component Ref
const settingsViewRef = ref(null);

const handleSwitchTabFromTour = (tab) => {
  currentTab.value = tab;
  if (tab === 'settings') {
    nextTick(() => {
      settingsViewRef.value?.closeActiveSheet();
    });
  }
};

// Vaults State
const vaults = ref([]);
const activeVault = ref('finance.db');
const showVaultModal = ref(false);

// Toast Notification State (Success & Error Toasts)
const toastNotification = ref({ show: false, message: '', type: 'success' });
let toastTimer = null;

const showToast = (message, colorTheme = 'green') => {
  if (toastTimer) clearTimeout(toastTimer);
  toastNotification.value = { show: true, message, colorTheme };
  toastTimer = setTimeout(() => {
    toastNotification.value.show = false;
  }, 2800);
};

const showSuccess = (message) => {
  let theme = 'green';
  const lower = String(message || '').toLowerCase();
  if (lower.includes('edit') || lower.includes('update') || lower.includes('modifi')) {
    theme = 'orange'; // Orange for editing
  } else if (lower.includes('debt') || lower.includes('transfer') || lower.includes('preset') || lower.includes('salary allocation success')) {
    theme = 'purple'; // Purple for debts, bucket transfers, account transfers, and salary allocation success
  } else if (lower.includes('salary') || lower.includes('allocat')) {
    theme = 'green'; // Green for salary allocation
  } else if (lower.includes('delete') || lower.includes('add') || lower.includes('create') || lower.includes('record')) {
    theme = 'green'; // Green for adding and deleting
  }
  showToast(message, theme);
};

const showError = (message) => showToast(message, 'red');

const activeVaultName = computed(() => {
  const v = vaults.value.find(item => item.is_active);
  return v ? v.name : 'Personal';
});

// Modal & Subpage Control State
const showForm = ref(false);
const editingTransaction = ref(null);
const selectedBucketForTx = ref('');
const selectedTypeForTx = ref('expense');
const loading = ref(false);
const error = ref('');
const isSettingsSubpageOpen = ref(false);

const fetchTransactions = async () => {
  try {
    [transactions.value, transactionSummary.value] = await Promise.all([
      api.getTransactions({ limit: 10000 }),
      api.getTransactionSummary({ limit: 10000 })
    ]);
  } catch (err) {
    error.value = 'Failed to load transactions: ' + err.message;
  }
};

const fetchAccounts = async () => {
  try {
    accounts.value = await api.getAccounts();
  } catch (err) {
    error.value = 'Failed to load accounts: ' + err.message;
  }
};

const fetchCategories = async () => {
  try {
    categories.value = await api.getCategories();
  } catch (err) {
    error.value = 'Failed to load categories: ' + err.message;
  }
};

const fetchBuckets = async () => {
  try {
    buckets.value = await api.getBuckets(true);
  } catch (err) {
    error.value = 'Failed to load savings buckets: ' + err.message;
  }
};

const fetchDebts = async () => {
  try {
    debts.value = await api.getDebts();
  } catch (err) {
    error.value = 'Failed to load debts: ' + err.message;
  }
};

const loadVaults = async () => {
  try {
    vaults.value = await api.getVaults();
    const active = vaults.value.find(v => v.is_active);
    if (active) activeVault.value = active.filename;
  } catch (err) {
    console.error("Failed to load vaults:", err);
  }
};

const refreshAll = async () => {
  loading.value = true;
  error.value = '';
  try {
    await api.init();
    await Promise.all([
      fetchTransactions(),
      fetchAccounts(),
      fetchCategories(),
      fetchBuckets(),
      fetchDebts(),
      loadVaults()
    ]);
    await loadCurrencyForActiveVault(activeVault.value);
    const activeTheme = await api.getVaultTheme();
    applyTheme(activeTheme);
    dashboardTransactions.value = await api.getTransactions();
    await checkOnboarding();
  } catch (err) {
    console.error("refreshAll error:", err);
    error.value = err.message || 'Error loading local database';
  } finally {
    loading.value = false;
  }
};

// Vault Management Handlers
const handleSwitchVault = async (filename) => {
  try {
    showVaultModal.value = false;
    await api.switchVault(filename);
    activeVault.value = filename;
    await refreshAll();
    showSuccess('Switched vault');
  } catch (err) {
    showError(err.message || 'Failed to switch vault.');
  }
};

const handleCreateVault = async (name) => {
  try {
    showVaultModal.value = false;
    const res = await api.createVault(name);
    if (res && res.active_vault) activeVault.value = res.active_vault;
    await refreshAll();
    showSuccess('Vault created');
  } catch (err) {
    showError(err.message || 'Failed to create vault.');
  }
};

const handleImportVault = async (file) => {
  try {
    await api.importVault(file);
    await refreshAll();
    showVaultModal.value = false;
    showSuccess('Vault imported');
  } catch (err) {
    showError(err.message || 'Failed to import vault.');
  }
};

const handleDeleteVault = async (filename) => {
  if (confirm(`Are you sure you want to delete vault "${filename}"? This action cannot be undone.`)) {
    try {
      await api.deleteVault(filename);
      await loadVaults();
      showSuccess('Vault deleted');
    } catch (err) {
      showError(err.message || 'Failed to delete vault.');
    }
  }
};

const handleRenameVault = async ({ filename, name }) => {
  try {
    await api.renameVault(filename, name);
    await loadVaults();
    showSuccess('Vault renamed successfully');
  } catch (err) {
    showError(err.message || 'Failed to rename vault.');
  }
};

// Form Open/Close Handlers
const transactionFormStep = ref(1);
const showArcMenu = ref(false);

const openAddTransaction = (opts = {}) => {
  editingTransaction.value = null;
  selectedBucketForTx.value = opts.bucketId || '';
  selectedTypeForTx.value = opts.type || 'expense';
  transactionFormStep.value = opts.step || 1;
  showForm.value = true;
};

const openEditTransaction = (transaction) => {
  editingTransaction.value = transaction;
  selectedBucketForTx.value = transaction.bucket_id || '';
  selectedTypeForTx.value = transaction.transaction_type || 'expense';
  showForm.value = true;
};

const handleSaveTransaction = async (payload) => {
  const wasEditing = Boolean(editingTransaction.value);
  try {
    if (wasEditing) {
      await api.updateTransaction(editingTransaction.value.id, payload);
    } else {
      await api.createTransaction(payload);
    }
    await refreshAll();
    showForm.value = false;
    showSuccess(wasEditing ? 'Transaction updated' : 'Transaction added');
  } catch (err) {
    showError(err.message || 'Failed to save transaction.');
  }
};

const handleDirectSaveTransaction = async ({ id, payload }) => {
  try {
    await api.updateTransaction(id, payload);
    await refreshAll();
    showSuccess('Transaction updated');
  } catch (err) {
    showError(err.message || 'Failed to update transaction.');
  }
};

const handleDeleteTransaction = async (id) => {
  try {
    await api.deleteTransaction(id);
    await refreshAll();
    showSuccess('Transaction deleted');
  } catch (err) {
    showError(err.message || 'Failed to delete transaction.');
  }
};

// Account & Category Handlers
const handleCreateAccount = async (payload) => {
  try {
    await api.createAccount(payload);
    await refreshAll();
    showSuccess('Account created');
  } catch (err) {
    showError(err.message || 'Failed to create account.');
  }
};

const handleUpdateAccount = async (id, payload) => {
  try {
    await api.updateAccount(id, payload);
    await refreshAll();
    showSuccess('Account updated');
  } catch (err) {
    showError(err.message || 'Failed to update account.');
  }
};

const handleDeleteAccount = async (id) => {
  try {
    await api.deleteAccount(id);
    await refreshAll();
    showSuccess('Account deleted');
  } catch (err) {
    showError(err.message || 'Failed to delete account.');
  }
};

const handleCreateCategory = async (payload) => {
  try {
    await api.createCategory(payload);
    await refreshAll();
    showSuccess('Category created');
  } catch (err) {
    showError(err.message || 'Failed to create category.');
  }
};

const handleCreateTransactionCategory = async (payload) => {
  const category = await api.createCategory(payload);
  await refreshAll();
  showSuccess('Category created');
  return category;
};

const handleUpdateCategory = async (id, payload) => {
  try {
    await api.updateCategory(id, payload);
    await refreshAll();
    showSuccess('Category updated');
  } catch (err) {
    showError(err.message || 'Failed to update category.');
  }
};

const handleDeleteCategory = async (id) => {
  try {
    await api.deleteCategory(id);
    await refreshAll();
    showSuccess('Category deleted');
  } catch (err) {
    showError(err.message || 'Failed to delete category.');
  }
};

// Savings Bucket Handlers
const handleCreateBucket = async (payload) => {
  try {
    await api.createBucket(payload);
    await refreshAll();
    showSuccess('Bucket created');
  } catch (err) {
    showError(err.message || 'Failed to create savings bucket.');
  }
};

const handleUpdateBucket = async (id, payload) => {
  try {
    await api.updateBucket(id, payload);
    await refreshAll();
    showSuccess('Bucket updated');
  } catch (err) {
    showError(err.message || 'Failed to update savings bucket.');
  }
};

const handleDeleteBucket = async (id) => {
  try {
    await api.deleteBucket(id);
    await refreshAll();
    showSuccess('Bucket permanently deleted');
  } catch (err) {
    showError(err.message || 'Failed to delete savings bucket.');
  }
};

const handleTransferBucket = async (payload) => {
  try {
    await api.transferBucket(payload);
    await refreshAll();
    showSuccess('Bucket transfer completed');
  } catch (err) {
    showError(err.message || 'Failed to transfer bucket funds.');
  }
};

const handleTransferAccounts = async (payload) => {
  try {
    await api.transferBetweenAccounts(payload);
    await refreshAll();
    showSuccess('Account transfer completed');
  } catch (err) {
    showError(err.message || 'Failed to transfer between accounts.');
  }
};

const floatingInput = ref({
  show: false,
  label: '',
  value: '',
  type: 'text',
  inputmode: 'text',
  placeholder: '',
  targetEl: null
});
const floatingInputRef = ref(null);

const setupGlobalFloatingInputHandler = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('focusin', (e) => {
    const el = e.target;
    if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
    if (el === floatingInputRef.value) return;

    const rect = el.getBoundingClientRect();
    const isBottom40Percent = rect.top > window.innerHeight * 0.60;

    if (isBottom40Percent) {
      let labelText = '';
      const parentContainer = el.closest('.space-y-1, .space-y-2, .space-y-3, div');
      if (parentContainer) {
        const lbl = parentContainer.querySelector('label, p.font-bold, span.font-bold');
        if (lbl && lbl.innerText) labelText = lbl.innerText.trim();
      }
      if (!labelText) {
        labelText = el.getAttribute('placeholder') || el.name || el.id || 'Input Field';
      }
      floatingInput.value = {
        show: true,
        label: labelText ? labelText.trim() : 'Input Field',
        value: el.value || '',
        type: el.type || 'text',
        inputmode: el.getAttribute('inputmode') || 'text',
        placeholder: el.getAttribute('placeholder') || '',
        targetEl: el
      };
      setTimeout(() => {
        floatingInputRef.value?.focus();
      }, 60);
    }
  }, true);
};

const syncFloatingValueToTarget = () => {
  if (floatingInput.value.targetEl) {
    floatingInput.value.targetEl.value = floatingInput.value.value;
    floatingInput.value.targetEl.dispatchEvent(new Event('input', { bubbles: true }));
    floatingInput.value.targetEl.dispatchEvent(new Event('change', { bubbles: true }));
  }
};

const closeFloatingInput = () => {
  const target = floatingInput.value.targetEl;
  floatingInput.value.show = false;
  if (target) {
    target.blur();
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true, cancelable: true }));
  }
};

const handleDataRefresh = async () => {
  await refreshAll();
};

const handleAllocateUnassigned = async ({ bucketId, amount }) => {
  try {
    await api.transferBucket({ to_bucket_id: bucketId, amount });
    await refreshAll();
    showSuccess('Money deposited into bucket');
  } catch (err) {
    alert(err.message || 'Failed to deposit money into bucket.');
  }
};

const handleReorderBuckets = async (bucketIds) => {
  try {
    await api.updateBucketSortOrder(bucketIds);
    await refreshAll();
  } catch (err) {
    alert(err.message || 'Failed to reorder buckets.');
  }
};

const handleReorderCategories = async (categoryIds) => {
  try {
    await api.updateCategorySortOrder(categoryIds);
    await refreshAll();
  } catch (err) {
    alert(err.message || 'Failed to reorder categories.');
  }
};

const handleReorderAccounts = async (accountIds) => {
  try {
    saveAccountOrder(accountIds);
    await refreshAll();
  } catch (err) {
    console.error('Failed to reorder accounts:', err);
  }
};

// Debt Handlers
const handleCreateDebt = async (payload) => {
  try {
    await api.createDebt(payload);
    await refreshAll();
    showSuccess('Debt recorded');
  } catch (err) {
    alert(err.message || 'Failed to record debt entry.');
  }
};

const handleSettleDebt = async (id, payload) => {
  try {
    await api.settleDebt(id, payload);
    await refreshAll();
    showSuccess('Debt settled');
  } catch (err) {
    alert(err.message || 'Failed to settle debt.');
  }
};

const handleSettleDebts = async (ids, accountId) => {
  try {
    await api.settleDebts(ids, accountId);
    await refreshAll();
    showSuccess('Debts settled');
  } catch (err) {
    alert(err.message || 'Failed to settle debts.');
  }
};
const handleDeleteDebt = async (id) => {
  try {
    await api.deleteDebt(id);
    await refreshAll();
    showSuccess('Debt deleted');
  } catch (err) {
    alert(err.message || 'Failed to delete debt.');
  }
};

const isScrolling = ref(false);
let scrollTimer = null;

const handleWindowScroll = () => {
  isScrolling.value = true;
  if (scrollTimer) clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    isScrolling.value = false;
  }, 350);
};

onMounted(() => {
  window.addEventListener('scroll', handleWindowScroll, { passive: true });
  if (typeof window !== 'undefined' && window.visualViewport) {
    const handleVVResize = () => {
      document.documentElement.style.setProperty('--vv-height', `${window.visualViewport.height}px`);
    };
    window.visualViewport.addEventListener('resize', handleVVResize);
    window.visualViewport.addEventListener('scroll', handleVVResize);
    handleVVResize();
  }

  window.addEventListener('cashbuddy-storage-error', event => {
    error.value = `Your latest change could not be saved securely: ${event.detail}`;
  });
  setupGlobalFloatingInputHandler();
  refreshAll();

  if (Capacitor.isNativePlatform()) {
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#0f0f15' }).catch(() => {});

    CapApp.addListener('backButton', () => {
      if (floatingInput.value.show) {
        floatingInput.value.show = false;
      } else if (showForm.value) {
        showForm.value = false;
      } else if (showVaultModal.value) {
        showVaultModal.value = false;
      } else if (currentTab.value === 'settings' && isSettingsSubpageOpen.value) {
        settingsViewRef.value?.closeActiveSheet();
      } else if (currentTab.value !== 'dashboard') {
        currentTab.value = 'dashboard';
      } else {
        CapApp.exitApp();
      }
    });
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#0c0d14] text-[#f1f0f5]">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="successMessage"
        class="pointer-events-none fixed top-[max(2.5rem,calc(env(safe-area-inset-top)+1rem))] left-1/2 z-[80] -translate-x-1/2 rounded-full border border-[#B3F5E1]/30 bg-[#0c0d14]/95 px-4 py-2 text-xs font-semibold text-[#B3F5E1] shadow-xl backdrop-blur-md flex items-center gap-1.5"
        role="status"
        aria-live="polite"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-[#B3F5E1]"></span>
        <span>{{ successMessage }}</span>
      </div>
    </Transition>

    <!-- Navbar / TopAppBar -->
    <header class="bg-[#0c0d14]/95 backdrop-blur-md border-b border-[#1f202e] sticky top-0 z-40 safe-area-pt">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <img src="/cashbuddy-logo.svg" alt="Cash Buddy Logo" class="w-9.5 h-9.5 object-contain" />
          <span class="font-bold text-[#D4BFFF] tracking-tight text-base leading-none">Cash Buddy</span>
          
          <!-- Vault Switcher Trigger -->
          <button 
            data-tour="vault-switcher"
            @click="showVaultModal = true"
            class="ml-1.5 px-2.5 py-1 bg-[#0f1019] hover:bg-[#141520] border border-[#1f202e] hover:border-[#D4BFFF]/50 rounded-full text-[11px] font-medium text-[#f1f0f5] flex items-center gap-1.5 transition cursor-pointer"
            :title="`Active Vault: ${activeVaultName}. Click to switch database.`"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#B3F5E1]"></span>
            <span class="text-[#9e9cae] truncate max-w-[90px]">{{ activeVaultName }}</span>
            <span class="text-[9px] text-[#9e9cae]">▾</span>
          </button>
        </div>

        <!-- Desktop Navigation Tabs -->
        <nav class="hidden sm:flex gap-1 bg-[#0f1019] p-1 rounded-xl border border-[#1f202e]">
          <button 
            @click="currentTab = 'dashboard'"
            class="px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5"
            :class="currentTab === 'dashboard' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
          >
            <img src="/cashbuddy-logo.svg" alt="Home" class="w-4 h-4 object-contain shrink-0" />
            <span>Dashboard</span>
          </button>
          <button 
            data-tour="history-tab"
            @click="currentTab = 'transactions'"
            class="px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5"
            :class="currentTab === 'transactions' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
          >
            <span class="material-symbols-outlined text-base">receipt_long</span>
            <span>History</span>
          </button>
          <button 
            data-tour="debts-tab"
            @click="currentTab = 'debts'"
            class="px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5"
            :class="currentTab === 'debts' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
          >
            <span class="material-symbols-outlined text-base">account_balance_wallet</span>
            <span>Debts</span>
          </button>
          <button 
            data-tour="settings-tab"
            @click="currentTab = 'settings'"
            class="px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5"
            :class="currentTab === 'settings' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
          >
            <span class="material-symbols-outlined text-base">widgets</span>
            <span>More</span>
          </button>
        </nav>

        <!-- Desktop Quick Add Button -->
        <button
          data-tour="add-tx-btn"
          @click="openAddTransaction()"
          class="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl transition cursor-pointer shadow-sm ml-2"
        >
          <span class="material-symbols-outlined text-base leading-none">add</span>
          <span>New Transaction</span>
        </button>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="flex-grow max-w-5xl w-full mx-auto px-3.5 sm:px-6 py-4 pb-24 sm:pb-8">
      <!-- Top-Down Slide Toast Notification Banner (10% Compact & Notch Safe) -->
      <Transition name="toast-top-down">
        <div 
          v-if="toastNotification.show"
          class="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[10000] px-4 py-2.5 sm:px-5 sm:py-3 border-2 rounded-2xl shadow-2xl flex items-center gap-2.5 max-w-xs sm:max-w-sm pointer-events-none backdrop-blur-md transition-all duration-300"
          :class="{
            'bg-[#0c1f17]/95 border-[#B3F5E1] text-[#B3F5E1]': toastNotification.colorTheme === 'green',
            'bg-[#26150b]/95 border-[#FFD1B3] text-[#FFD1B3]': toastNotification.colorTheme === 'orange',
            'bg-[#1c122b]/95 border-[#D4BFFF] text-[#D4BFFF]': toastNotification.colorTheme === 'purple',
            'bg-[#280d14]/95 border-rose-600 text-rose-200': toastNotification.colorTheme === 'red'
          }"
        >
          <span 
            class="material-symbols-outlined text-lg sm:text-xl shrink-0"
            :class="{
              'text-[#B3F5E1]': toastNotification.colorTheme === 'green',
              'text-[#FFD1B3]': toastNotification.colorTheme === 'orange',
              'text-[#D4BFFF]': toastNotification.colorTheme === 'purple',
              'text-rose-400': toastNotification.colorTheme === 'red'
            }"
          >
            {{ toastNotification.colorTheme === 'red' ? 'error' : (toastNotification.colorTheme === 'orange' ? 'edit_note' : 'check_circle') }}
          </span>
          <span class="text-xs sm:text-sm font-bold leading-snug">{{ toastNotification.message }}</span>
        </div>
      </Transition>

      <!-- Error Banner -->
      <div v-if="error" class="mb-4 p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl flex justify-between items-center">
        <div class="flex gap-2.5 items-center">
          <span class="material-symbols-outlined text-rose-400 text-base">warning</span>
          <p class="text-xs text-rose-300 font-medium">{{ error }}</p>
        </div>
        <button @click="error = ''" class="text-[#9e9cae] hover:text-[#f1f0f5] text-xs font-semibold cursor-pointer">Dismiss</button>
      </div>

      <!-- Non-blocking Loading Indicator -->
      <div v-if="loading && transactions.length === 0" class="fixed top-16 right-4 z-50 bg-[#0f1019] border border-[#1f202e] px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg backdrop-blur-md">
        <div class="w-3 h-3 border-2 border-[#D4BFFF] border-t-transparent rounded-full animate-spin"></div>
        <span class="text-[11px] font-semibold text-[#D4BFFF]">Syncing...</span>
      </div>

      <div>
        <Dashboard 
          v-show="currentTab === 'dashboard'" 
          :accounts="accounts"
          :transactions="dashboardTransactions"
          :categories="categories"
          :buckets="buckets"
          @add-transaction="openAddTransaction"
          @refresh="refreshAll"
        />

        <TransactionList 
          v-show="currentTab === 'transactions'"
          :transactions="transactions"
          :accounts="accounts"
          :categories="categories"
          :buckets="buckets"
          :summary="transactionSummary"
          @add-transaction="openAddTransaction"
          @edit-transaction="openEditTransaction"
          @edit-transaction-save="handleDirectSaveTransaction"
          @delete-transaction="handleDeleteTransaction"
        />

        <DebtList 
          v-show="currentTab === 'debts'"
          :debts="debts"
          :accounts="accounts"
          :buckets="buckets"
          @create-debt="handleCreateDebt"
          @settle-debt="handleSettleDebt"
          @settle-debts="handleSettleDebts"
          @delete-debt="handleDeleteDebt"
        />

        <SettingsView 
          ref="settingsViewRef"
          v-show="currentTab === 'settings'"
          :accounts="accounts"
          :categories="categories"
          :buckets="buckets"
          :active-vault="activeVault"
          @active-sheet-change="isSettingsSubpageOpen = Boolean($event)"
          @error="showError"
          @create-account="handleCreateAccount"
          @update-account="handleUpdateAccount"
          @delete-account="handleDeleteAccount"
          @create-category="handleCreateCategory"
          @update-category="handleUpdateCategory"
          @delete-category="handleDeleteCategory"
          @create-bucket="handleCreateBucket"
          @update-bucket="handleUpdateBucket"
          @delete-bucket="handleDeleteBucket"
          @transfer-bucket="handleTransferBucket"
          @transfer-accounts="handleTransferAccounts"
          @reorder-buckets="handleReorderBuckets"
          @reorder-categories="handleReorderCategories"
          @reorder-accounts="handleReorderAccounts"
          @allocate-unassigned="handleAllocateUnassigned"
          @data-refresh="refreshAll"
          @open-tutorial="openTutorial"
          @open-vault-setup="openVaultSetup"
        />
      </div>
    </main>

    <!-- Floating Island Glassmorphic Bottom Navigation Dock -->
    <div class="fixed bottom-3 left-0 right-0 z-40 flex justify-center px-4 sm:hidden pointer-events-none safe-area-pb">
      <nav class="pointer-events-auto bg-[#0c0d14]/90 backdrop-blur-xl border border-[#1f202e] shadow-2xl rounded-3xl h-14 px-3 flex items-center justify-between w-full max-w-sm">
        <button 
          @click="currentTab = 'dashboard'"
          class="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 cursor-pointer min-w-[54px]"
          :class="currentTab === 'dashboard' ? 'text-[#D4BFFF] font-bold' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
        >
          <span v-if="currentTab === 'dashboard'" class="absolute inset-0 bg-[#D4BFFF]/15 border border-[#D4BFFF]/30 rounded-2xl pointer-events-none transition-all duration-300 shadow-[0_0_12px_rgba(212,191,255,0.15)]"></span>
          <img src="/cashbuddy-logo.svg" alt="Home" class="w-5.5 h-5.5 object-contain mb-0.5 relative z-10 transition-transform duration-200" :class="{ 'scale-110': currentTab === 'dashboard' }" />
          <span class="text-[10px] leading-none relative z-10">Home</span>
        </button>

        <button 
          @click="currentTab = 'transactions'"
          class="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 cursor-pointer min-w-[54px]"
          :class="currentTab === 'transactions' ? 'text-[#D4BFFF] font-bold' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
        >
          <span v-if="currentTab === 'transactions'" class="absolute inset-0 bg-[#D4BFFF]/15 border border-[#D4BFFF]/30 rounded-2xl pointer-events-none transition-all duration-300 shadow-[0_0_12px_rgba(212,191,255,0.15)]"></span>
          <span class="material-symbols-outlined text-lg mb-0.5 relative z-10 transition-transform duration-200" :class="{ 'scale-110': currentTab === 'transactions' }">receipt_long</span>
          <span class="text-[10px] leading-none relative z-10">History</span>
        </button>

        <!-- Elevated Center Quick Add FAB -->
        <div class="relative flex items-center justify-center shrink-0 w-11 h-11 -mt-5">
          <button 
            data-tour="add-tx-btn-mobile"
            @click="openAddTransaction()"
            class="relative w-11 h-11 rounded-full bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] flex items-center justify-center shadow-xl transition-all duration-200 active:scale-90 cursor-pointer border-2 border-[#0c0d14] ring-2 ring-[#D4BFFF]/40 z-10"
            title="Add Transaction"
          >
            <span class="material-symbols-outlined text-2xl leading-none font-bold">add</span>
          </button>
        </div>

        <button 
          @click="currentTab = 'debts'"
          class="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 cursor-pointer min-w-[54px]"
          :class="currentTab === 'debts' ? 'text-[#D4BFFF] font-bold' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
        >
          <span v-if="currentTab === 'debts'" class="absolute inset-0 bg-[#D4BFFF]/15 border border-[#D4BFFF]/30 rounded-2xl pointer-events-none transition-all duration-300 shadow-[0_0_12px_rgba(212,191,255,0.15)]"></span>
          <span class="material-symbols-outlined text-lg mb-0.5 relative z-10 transition-transform duration-200" :class="{ 'scale-110': currentTab === 'debts' }">account_balance_wallet</span>
          <span class="text-[10px] leading-none relative z-10">Debts</span>
        </button>

        <button 
          @click="currentTab = 'settings'"
          class="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 cursor-pointer min-w-[54px]"
          :class="currentTab === 'settings' ? 'text-[#D4BFFF] font-bold' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
        >
          <span v-if="currentTab === 'settings'" class="absolute inset-0 bg-[#D4BFFF]/15 border border-[#D4BFFF]/30 rounded-2xl pointer-events-none transition-all duration-300 shadow-[0_0_12px_rgba(212,191,255,0.15)]"></span>
          <span class="material-symbols-outlined text-lg mb-0.5 relative z-10 transition-transform duration-200" :class="{ 'scale-110': currentTab === 'settings' }">widgets</span>
          <span class="text-[10px] leading-none relative z-10">More</span>
        </button>
      </nav>
    </div>

    <!-- Slide-over / Modal Form -->
    <Transition name="modal">
      <TransactionForm 
        v-if="showForm" 
        :transaction="editingTransaction"
        :accounts="accounts"
        :categories="categories"
        :buckets="buckets"
        :default-bucket-id="selectedBucketForTx"
        :default-type="selectedTypeForTx"
        :initial-step="transactionFormStep"
        :create-category="handleCreateTransactionCategory"
        @close="showForm = false"
        @save="handleSaveTransaction"
      />
    </Transition>

    <!-- Multi-Vault Management Modal -->
    <VaultModal 
      :is-open="showVaultModal"
      :vaults="vaults"
      @close="showVaultModal = false"
      @switch-vault="handleSwitchVault"
      @create-vault="handleCreateVault"
      @import-vault="handleImportVault"
      @delete-vault="handleDeleteVault"
      @rename-vault="handleRenameVault"
    />

    <!-- Onboarding & Interactive App Tour Modal -->
    <OnboardingModal 
      :is-open="showOnboardingModal"
      :initial-stage="onboardingStage"
      :active-vault="activeVault"
      @close="showOnboardingModal = false"
      @completed="refreshAll"
      @switch-tab="handleSwitchTabFromTour"
      @open-form-step-1="openAddTransaction({ step: 1 })"
      @open-form-step-2="openAddTransaction({ step: 2 })"
      @close-form="showForm = false"
    />

    <!-- Floating Virtual Input Bar for Bottom 40% Screen Fields -->
    <Transition name="floating-down">
      <div 
        v-if="floatingInput.show" 
        class="fixed top-[30vh] sm:top-[35vh] left-3.5 right-3.5 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-[9999] bg-[#141520] border-2 border-[#D4BFFF] rounded-2xl shadow-2xl p-4 flex flex-col gap-2.5 backdrop-blur-md"
      >
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-bold text-[#D4BFFF] uppercase tracking-wider truncate flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm">edit</span>
            <span>{{ floatingInput.label }}</span>
          </span>
          <button 
            type="button" 
            @click="closeFloatingInput" 
            class="px-3.5 py-1 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] text-xs font-black rounded-lg cursor-pointer transition shadow-md active:scale-95"
          >
            Done ✓
          </button>
        </div>
        <div class="flex items-center gap-2">
          <input 
            ref="floatingInputRef"
            v-model="floatingInput.value"
            :type="floatingInput.type"
            :inputmode="floatingInput.inputmode"
            :placeholder="floatingInput.placeholder"
            @input="syncFloatingValueToTarget"
            @keydown.enter="closeFloatingInput"
            class="w-full px-3.5 py-2.5 bg-[#0c0d14] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-sm font-bold focus:outline-none shadow-inner"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>
