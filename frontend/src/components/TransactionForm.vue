<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center p-2 pt-[max(2.25rem,env(safe-area-inset-top))] sm:pt-10 safe-area-modal-pt bg-[#0c0d14]/90 backdrop-blur-sm overflow-y-auto">
    <div data-tour="transaction-form" class="relative w-full max-w-md bg-[#0c0d14] border border-[#1f202e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-1rem)] my-auto">
      
      <!-- Header -->
      <div class="px-4 py-2.5 border-b border-[#1f202e] flex justify-between items-center bg-[#0c0d14] shrink-0">
        <div class="flex items-center gap-2">
          <button 
            v-if="currentStep === 2 && !isEdit"
            type="button" 
            @click="goToStep1"
            class="text-[#9e9cae] hover:text-[#f1f0f5] transition text-sm font-semibold cursor-pointer p-1"
            title="Back to Step 1"
          >
            ←
          </button>
          <button 
            @click="$emit('close')" 
            class="text-[#9e9cae] hover:text-[#f1f0f5] transition text-base font-semibold cursor-pointer p-1"
            title="Close"
          >
            ✕
          </button>
        </div>
        <div class="text-center">
          <h3 class="text-xs font-bold text-[#D4BFFF] tracking-tight">
            {{ isEdit ? 'Edit Transaction' : 'Add Transaction' }}
          </h3>
          <p v-if="!isEdit" class="text-[9px] font-semibold text-[#9e9cae]">
            Step {{ currentStep }} of 2
          </p>
        </div>
        <div class="w-8"></div> <!-- Centering layout placeholder -->
      </div>

      <!-- Form Body (Scrollable container with autofill prevention) -->
      <form 
        id="transaction-entry-form" 
        novalidate
        @submit.prevent="handleSubmit" 
        autocomplete="off" 
        autocorrect="off" 
        autocapitalize="off" 
        spellcheck="false" 
        data-form-type="other" 
        data-lpignore="true" 
        class="p-3.5 sm:p-4 space-y-3 overflow-y-auto flex-1 overscroll-contain pb-48 sm:pb-6"
      >
        <!-- Error Alerts -->
        <div v-if="error" class="p-2.5 bg-rose-950/30 border border-rose-900/40 rounded-xl text-[#ffb4ab] text-xs font-semibold">
          {{ error }}
        </div>

        <!-- Smooth Step Slide Container -->
        <Transition :name="slideDirection === 'next' ? 'step-next' : 'step-prev'" mode="out-in">
          <!-- STEP 1: Bucket & Account Selection -->
          <div v-if="currentStep === 1" key="step-1" data-tour="step-1-form" class="space-y-3">
            
            <!-- 1. Select Bucket Section (2-Column Mobile Grid) -->
            <div class="space-y-1.5">
              <h4 class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">1. Select Savings Bucket</h4>
              
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <!-- Active Buckets -->
                <button
                  v-for="b in activeBuckets"
                  :key="b.id"
                  type="button"
                  @click="selectBucket(b.id)"
                  class="flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer active:scale-[0.98] min-h-[46px]"
                  :class="form.bucket_id === b.id
                    ? 'bg-[#D4BFFF]/15 border-[#D4BFFF] ring-1 ring-[#D4BFFF]/40'
                    : 'bg-[#0f1019] border-[#1f202e] hover:bg-[#141520] hover:border-[#D4BFFF]/40'"
                >
                  <div class="w-7 h-7 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-sm leading-none" :style="{ color: b.color || '#D4BFFF' }">{{ resolveIcon(b.icon, 'savings') }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-bold text-[#f1f0f5] truncate">{{ b.name }}</p>
                    <p class="text-[10px] font-bold text-[#9e9cae] truncate mt-0.5 tabular-nums">{{ currencySymbol }}{{ formatAmount(b.allocated_balance) }}</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- 2. Account Section -->
            <div ref="accountSectionRef" class="space-y-1.5 pt-1 border-t border-[#1f202e]/60">
              <h4 class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">2. Select Storage Account</h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <!-- Unallocated Funds Secret Account Option -->
                <button
                  type="button"
                  @click="selectAccount('acc_unallocated_funds')"
                  class="flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer active:scale-[0.98] min-h-[46px]"
                  :class="form.account_id === 'acc_unallocated_funds'
                    ? 'bg-[#D4BFFF]/15 border-[#D4BFFF] ring-1 ring-[#D4BFFF]/40'
                    : 'bg-[#0f1019] border-[#1f202e] hover:bg-[#141520] hover:border-[#D4BFFF]/40'"
                >
                  <div class="w-7 h-7 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-sm leading-none text-[#FFD1B3]">account_balance_wallet</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-bold text-[#f1f0f5] truncate">Unallocated Funds</p>
                    <p class="text-[10px] text-[#9e9cae] truncate mt-0.5">Pool (No category needed)</p>
                  </div>
                </button>

                <!-- Physical User Accounts -->
                <button
                  v-for="acc in userAccounts" 
                  :key="acc.id"
                  type="button"
                  @click="selectAccount(acc.id)"
                  class="flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer active:scale-[0.98] min-h-[46px]"
                  :class="form.account_id === acc.id
                    ? 'bg-[#D4BFFF]/15 border-[#D4BFFF] ring-1 ring-[#D4BFFF]/40'
                    : 'bg-[#0f1019] border-[#1f202e] hover:bg-[#141520] hover:border-[#D4BFFF]/40'"
                >
                  <div class="w-7 h-7 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-sm leading-none text-[#D4BFFF]">account_balance</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-bold text-[#f1f0f5] truncate">{{ acc.name }}</p>
                    <p class="text-[10px] font-bold text-[#9e9cae] truncate mt-0.5 tabular-nums">{{ currencySymbol }}{{ formatAmount(acc.balance) }}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 2: Details (Category -> Amount -> Description -> Submit) -->
          <div v-else key="step-2" class="space-y-3.5 pb-2">
            
            <!-- Selected Allocation Badges Bar -->
            <div class="flex items-center justify-between gap-2 p-2 px-3 bg-[#0f1019] border border-[#1f202e] rounded-xl text-xs">
              <div class="flex flex-wrap items-center gap-1.5 min-w-0">
                <span class="px-2 py-0.5 rounded-md bg-[#D4BFFF]/15 text-[#D4BFFF] font-semibold text-[10px] truncate flex items-center gap-1">
                  <span v-if="selectedBucketObj" class="material-symbols-outlined text-xs leading-none">{{ resolveIcon(selectedBucketObj.icon, 'savings') }}</span>
                  <span>{{ selectedBucketObj ? selectedBucketObj.name : 'Unassigned' }}</span>
                </span>
                <span class="text-[#9e9cae] shrink-0 text-[10px]">•</span>
                <span class="px-2 py-0.5 rounded-md bg-[#141520] border border-[#1f202e] text-[#f1f0f5] font-semibold text-[10px] truncate">{{ selectedAccountName }}</span>
              </div>
              <button type="button" @click="goToStep1" class="text-[10px] text-[#D4BFFF] hover:underline font-semibold cursor-pointer shrink-0 ml-auto">Change</button>
            </div>

            <!-- Savings Bucket Selector in Step 2 (Editable in Edit & Add Modes) -->
            <div v-if="form.account_id !== 'acc_unallocated_funds'" class="space-y-1">
              <BucketPicker 
                :buckets="activeBuckets" 
                v-model="form.bucket_id" 
                label="SAVINGS BUCKET *"
                title="Select Savings Bucket"
                placeholder="Choose Savings Bucket"
              />
            </div>

            <!-- Transaction Type Switcher (Expense & Income) -->
            <div class="grid grid-cols-2 gap-1 p-1 bg-[#0f1019] rounded-xl border border-[#1f202e]">
              <button 
                type="button"
                @click="setTransactionType('expense')"
                class="py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                :class="form.transaction_type === 'expense' ? 'bg-[#FFD1B3] text-[#0f0f15] font-bold shadow-sm' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
              >
                <span class="material-symbols-outlined text-sm">trending_down</span>
                <span>Expense</span>
              </button>
              <button 
                type="button"
                @click="setTransactionType('income')"
                class="py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                :class="form.transaction_type === 'income' ? 'bg-[#B3F5E1] text-[#0f0f15] font-bold shadow-sm' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
              >
                <span class="material-symbols-outlined text-sm">trending_up</span>
                <span>Income</span>
              </button>
            </div>

            <!-- 1. CATEGORY SELECTION FIRST (Hidden for Unallocated Funds) -->
            <div v-if="form.account_id !== 'acc_unallocated_funds'" class="space-y-1.5">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">SELECT CATEGORY *</label>

              <!-- 3-Column Spacious Quick Category Grid -->
              <div class="grid grid-cols-3 gap-2">
                <button 
                  type="button"
                  v-for="cat in displayedQuickCategories" 
                  :key="cat.id"
                  @click="selectCategoryAndFocusAmount(cat.id)"
                  class="p-2 rounded-xl border text-xs transition flex items-center justify-start gap-2 text-left cursor-pointer min-h-[46px] active:scale-[0.98]"
                  :class="form.category_id === cat.id ? 'bg-[#D4BFFF]/15 border-[#D4BFFF] text-[#f1f0f5] ring-1 ring-[#D4BFFF]/40' : 'bg-[#0f1019] border-[#1f202e] text-[#9e9cae] hover:border-[#D4BFFF]/30'"
                >
                  <div class="w-7 h-7 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-sm shrink-0" :style="{ color: cat.color || '#D4BFFF' }">{{ resolveIcon(cat.icon, 'category') }}</span>
                  </div>
                  <span class="text-[10px] sm:text-[11px] font-bold leading-tight text-[#f1f0f5] whitespace-normal break-words line-clamp-2">{{ cat.name }}</span>
                </button>

                <!-- More Categories Picker Trigger Card -->
                <button
                  type="button"
                  @click="categoryPickerRef?.open()"
                  class="p-2 rounded-xl border text-xs transition flex items-center justify-start gap-2 text-left cursor-pointer min-h-[46px] w-full active:scale-[0.98]"
                  :class="selectedCategoryIsNonQuick ? 'bg-[#D4BFFF]/15 border-[#D4BFFF] text-[#D4BFFF] ring-1 ring-[#D4BFFF]/40' : 'bg-[#0f1019] border-[#1f202e] text-[#9e9cae] hover:border-[#D4BFFF]/30'"
                >
                  <div class="w-7 h-7 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                    <span 
                      v-if="selectedCategoryIsNonQuick"
                      class="material-symbols-outlined text-sm shrink-0"
                      :style="{ color: categories.find(c => c.id === form.category_id)?.color || '#D4BFFF' }"
                    >
                      {{ resolveIcon(categories.find(c => c.id === form.category_id)?.icon, 'category') }}
                    </span>
                    <span v-else class="material-symbols-outlined text-sm text-[#D4BFFF]">more_horiz</span>
                  </div>
                  <span class="text-[10px] sm:text-[11px] font-bold leading-tight whitespace-normal break-words line-clamp-2">
                    {{ selectedCategoryIsNonQuick ? categories.find(c => c.id === form.category_id)?.name : 'More' }}
                  </span>
                </button>
              </div>

              <!-- Reusable Category Picker Modal (Hidden inline trigger) -->
              <CategoryPicker 
                ref="categoryPickerRef"
                :categories="transactionCategories"
                v-model="form.category_id" 
                :hide-trigger="true"
                allow-create
                @create="showCategoryForm = true"
                @change="focusAmountInput"
                title="Select Category" 
                placeholder="Choose Category"
              />
            </div>

            <!-- 2. AMOUNT & DESCRIPTION SECOND -->
            <div class="grid grid-cols-2 gap-3 items-end">
              <!-- Amount Input (Left) -->
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">AMOUNT *</label>
                <div class="flex items-center gap-1.5 border-b border-[#1f202e] focus-within:border-[#D4BFFF] pb-1">
                  <span class="text-base font-bold text-[#9e9cae]">{{ currencySymbol }}</span>
                  <input 
                    ref="amountInputRef"
                    v-model="form.amount"
                    type="text"
                    name="tx_amount"
                    inputmode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    data-form-type="other"
                    data-lpignore="true"
                    placeholder="0.00"
                    required
                    @keydown.enter.prevent="focusDescriptionInput"
                    class="w-full text-lg font-bold text-[#f1f0f5] tabular-nums bg-transparent focus:outline-none transition"
                  />
                </div>
              </div>

              <!-- Description Input (Right - Replaces Date in Grid) -->
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">DESCRIPTION (OPTIONAL)</label>
                <input 
                  ref="descriptionInputRef"
                  v-model="form.description"
                  type="text" 
                  name="tx_description"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  data-form-type="other"
                  data-lpignore="true"
                  placeholder="e.g. Lunch"
                  @keydown.enter.prevent="handleSubmit"
                  class="w-full h-8.5 px-3 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs placeholder-[#9e9cae]/50 focus:outline-none transition"
                />
              </div>
            </div>

            <!-- 3. DATE THIRD -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">DATE</label>
              <input 
                v-model="form.date"
                @click="$event.target.showPicker?.()"
                type="date" 
                required
                class="w-full h-8.5 px-2.5 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs font-semibold focus:outline-none transition cursor-pointer [color-scheme:dark]"
              />
            </div>

            <!-- 4. NOTE FOURTH -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">NOTE (OPTIONAL)</label>
              <textarea 
                v-model="form.notes"
                rows="1"
                name="tx_notes"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                data-form-type="other"
                data-lpignore="true"
                placeholder="Optional note"
                @keydown.enter.prevent="handleSubmit"
                class="w-full h-8 px-3 py-1.5 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs placeholder-[#9e9cae]/50 focus:outline-none transition resize-none"
              ></textarea>
            </div>

            <!-- Include on Pie Chart Toggle (For Adjustments) -->
            <div v-if="form.transaction_type === 'adjustment'" class="p-3 bg-[#0f1019] border border-[#1f202e] rounded-xl flex items-center justify-between gap-3">
              <div>
                <p class="text-xs font-bold text-[#f1f0f5]">Include in Pie Charts & Analytics?</p>
                <p class="text-[10px] text-[#9e9cae]">If enabled, this adjustment adds to pie chart spending/income breakdown.</p>
              </div>
              <button
                type="button"
                @click="form.include_in_chart = !form.include_in_chart"
                class="w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer p-0.5"
                :class="form.include_in_chart ? 'bg-[#a855f7]' : 'bg-[#191924] border border-[#1f202e]'"
              >
                <span
                  class="block w-5 h-5 rounded-full transition-transform"
                  :class="form.include_in_chart ? 'translate-x-5 bg-white' : 'translate-x-0 bg-[#9e9cae]'"
                ></span>
              </button>
            </div>
          </div>
        </Transition>
      </form>

      <!-- Fixed Modal Footer -->
      <div class="px-4 py-2.5 border-t border-[#1f202e] bg-[#0c0d14] shrink-0">
        <button
          v-if="currentStep === 1 && !isEdit"
          type="button"
          @click="goToStep2"
          class="w-full py-2 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Next</span>
          <span>→</span>
        </button>
        <button
          v-else
          form="transaction-entry-form"
          type="submit"
          :disabled="submitting"
          class="w-full py-2 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-[#0f0f15] border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isEdit ? 'Update Transaction' : 'Save Transaction' }}</span>
        </button>
      </div>
    </div>
    <CategoryFormModal
      :is-open="showCategoryForm"
      :default-category-type="form.transaction_type === 'income' ? 'income' : 'expense'"
      @close="showCategoryForm = false"
      @save="createCategoryFromPicker"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import CategoryPicker from './CategoryPicker.vue';
import CategoryFormModal from './CategoryFormModal.vue';
import BucketPicker from './BucketPicker.vue';
import { resolveIcon } from '../utils/iconResolver.js';
import { currencySymbol } from '../utils/currency.js';

const props = defineProps({
  transaction: {
    type: Object,
    default: null
  },
  accounts: {
    type: Array,
    required: true
  },
  categories: {
    type: Array,
    required: true
  },
  buckets: {
    type: Array,
    required: true
  },
  defaultBucketId: {
    type: String,
    default: ''
  },
  defaultType: {
    type: String,
    default: 'expense'
  },
  createCategory: { type: Function, required: true },
  initialStep: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['close', 'save']);
const showCategoryForm = ref(false);

const isEdit = computed(() => !!props.transaction);
const currentStep = ref(props.initialStep || 1);
const slideDirection = ref('next');
const submitting = ref(false);
const error = ref('');

watch(() => props.initialStep, (val) => {
  if (val) currentStep.value = val;
}, { immediate: true });

const activeBuckets = computed(() => props.buckets.filter(b => !b.is_archived));
const userAccounts = computed(() => props.accounts.filter(a => a.id !== 'acc_unallocated_funds'));
const categoryType = computed(() => form.value.transaction_type === 'income' ? 'income' : 'expense');
const transactionCategories = computed(() => props.categories.filter(c => (c.category_type || 'expense') === categoryType.value));
const quickSelectCategories = computed(() => transactionCategories.value.filter(c => c.is_quick_select == 1));
const displayedQuickCategories = computed(() => {
  const pinned = quickSelectCategories.value;
  return pinned.length > 0 ? pinned : transactionCategories.value.slice(0, 5);
});

// Category grid picker ref, amount ref, description ref & account section ref
const accountSectionRef = ref(null);
const categoryPickerRef = ref(null);
const amountInputRef = ref(null);
const descriptionInputRef = ref(null);

const goToStep1 = () => {
  slideDirection.value = 'prev';
  currentStep.value = 1;
};

const validateStep1Selection = () => {
  const accId = form.value.account_id || '';
  const bucketId = form.value.bucket_id || '';

  // Exception Rule: Unallocated Funds account with NO bucket selected is allowed
  if (accId === 'acc_unallocated_funds' && !bucketId) {
    return true;
  }

  // Rule 1: If ANY bucket is chosen -> Real Bank Account is MANDATORY
  if (bucketId) {
    if (!accId || accId === 'acc_unallocated_funds') {
      error.value = 'Selecting a bank account is mandatory when a bucket is chosen.';
      return false;
    }
  }

  // Rule 2: If ANY account is chosen -> Savings Bucket is MANDATORY
  if (accId) {
    if (!bucketId) {
      error.value = 'Selecting a savings bucket is mandatory when an account is chosen.';
      return false;
    }
  }

  // Rule 3: If NEITHER account nor bucket is chosen -> Both are MANDATORY
  if (!accId && !bucketId) {
    error.value = 'Selecting an account and a savings bucket is mandatory.';
    return false;
  }

  return true;
};

const validateMutualSelection = () => {
  if (!validateStep1Selection()) return false;
  const accId = form.value.account_id || '';
  const catId = form.value.category_id || '';

  if (accId !== 'acc_unallocated_funds' && !catId) {
    error.value = 'Selecting a category is mandatory.';
    return false;
  }

  return true;
};

const goToStep2 = () => {
  error.value = '';
  if (!validateStep1Selection()) {
    return;
  }
  slideDirection.value = 'next';
  currentStep.value = 2;
  focusAmountInput();
};

const selectBucket = (bId) => {
  form.value.bucket_id = bId;
  nextTick(() => {
    accountSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
};

const setTransactionType = (type) => {
  const currentCategory = props.categories.find(c => c.id === form.value.category_id);
  form.value.transaction_type = type;
  if (currentCategory && (currentCategory.category_type || 'expense') !== type) {
    form.value.category_id = '';
  }
};

const selectAccount = (accId) => {
  const prevAcc = form.value.account_id;
  form.value.account_id = accId || '';
  if (accId === 'acc_unallocated_funds') {
    form.value.bucket_id = '';
    if (form.value.transaction_type !== 'adjustment') {
      setTransactionType('income');
    }
  } else if (prevAcc === 'acc_unallocated_funds') {
    if (form.value.transaction_type !== 'adjustment') {
      setTransactionType(props.defaultType || 'expense');
    }
  }
};

const selectCategoryAndFocusAmount = (catId) => {
  form.value.category_id = catId;
  focusAmountInput();
};

const focusAmountInput = () => {
  nextTick(() => {
    amountInputRef.value?.focus();
    amountInputRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
};

const createCategoryFromPicker = async (payload) => {
  try {
    const category = await props.createCategory(payload);
    if (category?.id) {
      setTransactionType(category.category_type === 'income' ? 'income' : 'expense');
      form.value.category_id = category.id;
    }
    showCategoryForm.value = false;
    focusAmountInput();
  } catch (err) {
    error.value = err.message || 'Failed to create category.';
  }
};

const focusDescriptionInput = () => {
  nextTick(() => {
    descriptionInputRef.value?.focus();
    descriptionInputRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
};

const selectedCategoryIsNonQuick = computed(() => {
  if (!form.value.category_id) return false;
  return !displayedQuickCategories.value.some(c => c.id === form.value.category_id);
});

const netWorth = computed(() => {
  return props.accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
});

const totalAllocated = computed(() => {
  return props.buckets.reduce((sum, bucket) => {
    if (bucket.is_archived) return sum;
    return sum + (Number(bucket.allocated_balance) || 0);
  }, 0);
});

const unassignedAmount = computed(() => {
  const unallocAcc = props.accounts.find(a => a.id === 'acc_unallocated_funds');
  if (unallocAcc) return Number(unallocAcc.balance) || 0;
  return Math.round((netWorth.value - totalAllocated.value) * 100) / 100;
});

const form = ref({
  amount: '',
  date: new Date().toISOString().substring(0, 10),
  description: '',
  transaction_type: props.defaultType || 'expense',
  adjustment_direction: 'add',
  adjustment_target: 'both',
  notes: '',
  account_id: '',
  category_id: '',
  bucket_id: props.defaultBucketId || '',
  include_in_chart: false
});

watch(() => form.value.bucket_id, (newVal) => {
  if (newVal === '') {
    form.value.category_id = '';
  }
}, { immediate: true });

watch(() => form.value.account_id, (newAccId, oldAccId) => {
  if (newAccId === 'acc_unallocated_funds') {
    form.value.bucket_id = '';
    if (form.value.transaction_type !== 'adjustment') {
      form.value.transaction_type = 'income';
    }
  } else if (oldAccId === 'acc_unallocated_funds') {
    if (form.value.transaction_type !== 'adjustment') {
      form.value.transaction_type = props.defaultType || 'expense';
    }
  }
});

// Helper labels
const selectedBucketObj = computed(() => {
  return props.buckets.find(b => b.id === form.value.bucket_id) || null;
});

const selectedBucketName = computed(() => {
  const b = selectedBucketObj.value;
  return b ? b.name : 'Unassigned';
});

const selectedAccountName = computed(() => {
  if (!form.value.account_id) {
    return 'No Account';
  }
  const acc = props.accounts.find(a => a.id === form.value.account_id);
  return acc ? acc.name : 'No Account';
});

const formatAmount = (val) => {
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Load edit values or defaults
onMounted(() => {
  if (isEdit.value && props.transaction) {
    currentStep.value = 2; // Jump directly to details in edit mode
    form.value = {
      amount: Number(props.transaction.amount),
      date: props.transaction.date,
      description: props.transaction.description,
      transaction_type: props.transaction.transaction_type,
      adjustment_direction: props.transaction.adjustment_direction || 'add',
      adjustment_target: props.transaction.adjustment_target || 'both',
      notes: props.transaction.notes || '',
      account_id: props.transaction.account_id || '',
      category_id: props.transaction.category_id,
      bucket_id: props.transaction.bucket_id || '',
      include_in_chart: Number(props.transaction.include_in_chart) === 1
    };
    focusAmountInput();
  } else {
    // Reset account_id and category_id
    form.value.account_id = '';
    form.value.category_id = '';

    if (props.defaultBucketId) {
      form.value.bucket_id = props.defaultBucketId;
    }
  }
});

const handleSubmit = async () => {
  error.value = '';

  if (currentStep.value === 1 && !isEdit.value) {
    goToStep2();
    return;
  }
  
  // Validation checks
  const normalizedAmount = String(form.value.amount).replace(',', '.');
  if (Number(normalizedAmount) <= 0 || !Number.isFinite(Number(normalizedAmount))) {
    error.value = 'Amount must be greater than zero.';
    return;
  }

  if (!validateMutualSelection()) {
    return;
  }

  submitting.value = true;
  try {
    const selectedCat = props.categories.find(c => c.id === form.value.category_id);
    const isUnallocated = form.value.account_id === 'acc_unallocated_funds';
    const defaultTitle = isUnallocated ? 'Unallocated Funds Deposit' : (selectedCat ? selectedCat.name : 'Transaction');
    const finalDesc = form.value.description && form.value.description.trim() 
      ? form.value.description.trim() 
      : defaultTitle;

    const payload = {
      ...form.value,
      category_id: isUnallocated ? null : (form.value.category_id || null),
      bucket_id: isUnallocated ? null : (form.value.bucket_id || null),
      account_id: form.value.account_id || null,
      amount: Number(normalizedAmount),
      description: finalDesc,
      notes: form.value.notes ? form.value.notes.trim() : null
    };
    emit('save', payload);
  } catch (err) {
    error.value = err.message || 'An error occurred while saving the transaction.';
    submitting.value = false;
  }
};
</script>

<style scoped>
/* Step Slide Animations (Step 1 -> Step 2 / Editing Part) */
.step-next-enter-active,
.step-next-leave-active,
.step-prev-enter-active,
.step-prev-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}

/* Going Next: Old slide moves LEFT (-100%), new editing slide enters from RIGHT (100%) */
.step-next-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.step-next-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Going Prev: Old slide moves RIGHT (100%), new slide enters from LEFT (-100%) */
.step-prev-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.step-prev-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
