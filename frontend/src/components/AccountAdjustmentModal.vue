<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center p-2 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-10 safe-area-modal-pt bg-[#0c0d14]/90 backdrop-blur-sm overflow-y-auto" @click.self="close">
    <div class="relative w-full max-w-md bg-[#0c0d14] border border-[#1f202e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-1rem)] my-auto">
      
      <!-- Header -->
      <div class="px-4 py-3 border-b border-[#1f202e] flex justify-between items-center bg-[#0c0d14] shrink-0">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-[#D4BFFF]/15 text-[#D4BFFF] flex items-center justify-center font-bold text-sm">
            <span class="material-symbols-outlined text-base">tune</span>
          </div>
          <div>
            <h3 class="text-xs font-bold text-[#f1f0f5] tracking-tight">Adjust Account Balance</h3>
            <p class="text-[10px] text-[#9e9cae]">{{ account?.name || 'Account' }}</p>
          </div>
        </div>
        <button 
          @click="close" 
          type="button"
          class="text-[#9e9cae] hover:text-[#f1f0f5] transition text-base font-semibold cursor-pointer p-1"
        >
          ✕
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleAdjust" class="p-4 space-y-4 overflow-y-auto flex-1 overscroll-contain pb-48 sm:pb-6">
        <!-- Error Alert -->
        <div v-if="error" class="p-2.5 bg-rose-950/30 border border-rose-900/40 rounded-xl text-[#ffb4ab] text-xs font-semibold">
          {{ error }}
        </div>

        <!-- 1. Current vs Real Balance Card -->
        <div class="p-3.5 bg-[#0f1019] border border-[#1f202e] rounded-xl space-y-3">
          <div class="flex justify-between items-center text-xs">
            <span class="text-[#9e9cae] font-semibold">App Current Balance:</span>
            <span class="font-bold text-[#f1f0f5] tabular-nums">{{ currencySymbol }}{{ formatAmount(currentBalance) }}</span>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-[#D4BFFF] uppercase tracking-wider mb-1">
              Actual Real-Life Balance *
            </label>
            <div class="flex items-center gap-1.5 border-b border-[#1f202e] focus-within:border-[#D4BFFF] pb-1">
              <span class="text-base font-bold text-[#9e9cae]">{{ currencySymbol }}</span>
              <input 
                ref="realInputRef"
                v-model="realBalanceInput" 
                type="text" 
                inputmode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                placeholder="0.00"
                required
                class="w-full text-lg font-bold text-[#f1f0f5] tabular-nums bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <!-- Calculated Difference Result -->
          <div v-if="calculatedDiff !== null" class="pt-2 border-t border-[#1f202e] flex justify-between items-center text-xs">
            <span class="text-[#9e9cae] font-semibold">Adjustment Difference:</span>
            <span 
              class="font-bold tabular-nums text-sm"
              :class="calculatedDiff >= 0 ? 'text-[#B3F5E1]' : 'text-[#FFD1B3]'"
            >
              {{ calculatedDiff >= 0 ? '+' : '' }}{{ currencySymbol }}{{ formatAmount(calculatedDiff) }}
            </span>
          </div>
        </div>

        <!-- 2. Show on Pie Chart Switch -->
        <div class="p-3.5 bg-[#0f1019] border border-[#1f202e] rounded-xl space-y-2">
          <label class="block text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">
            Chart Visibility
          </label>
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-bold text-[#f1f0f5]">Include on Spending Pie Chart?</p>
              <p class="text-[10px] text-[#9e9cae]">If disabled, adjustment is logged as a secret regulation entry.</p>
            </div>
            <button
              type="button"
              @click="showOnChart = !showOnChart"
              class="w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer p-0.5"
              :class="showOnChart ? 'bg-[#D4BFFF]' : 'bg-[#191924] border border-[#1f202e]'"
            >
              <span 
                class="block w-5 h-5 rounded-full transition-transform"
                :class="showOnChart ? 'translate-x-5 bg-[#0f0f15]' : 'translate-x-0 bg-[#9e9cae]'"
              ></span>
            </button>
          </div>
        </div>

        <!-- 3. Target Savings Bucket Selector -->
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">
            Which Bucket Should This Affect? *
          </label>
          <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-0.5">
            <!-- Unassigned Bucket Option -->
            <button
              type="button"
              @click="targetBucketId = ''"
              class="flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer active:scale-[0.98] min-h-[44px]"
              :class="!targetBucketId
                ? 'bg-[#D4BFFF]/15 border-[#D4BFFF] ring-1 ring-[#D4BFFF]/40'
                : 'bg-[#0f1019] border-[#1f202e] hover:bg-[#141520] hover:border-[#D4BFFF]/40'"
            >
              <div class="w-6 h-6 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-xs leading-none text-[#FFD1B3]">savings</span>
              </div>
              <span class="text-xs font-bold text-[#f1f0f5] truncate">No Bucket Allocation</span>
            </button>

            <!-- Active Savings Buckets -->
            <button
              v-for="b in activeBuckets"
              :key="b.id"
              type="button"
              @click="targetBucketId = b.id"
              class="flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer active:scale-[0.98] min-h-[44px]"
              :class="targetBucketId === b.id
                ? 'bg-[#D4BFFF]/15 border-[#D4BFFF] ring-1 ring-[#D4BFFF]/40'
                : 'bg-[#0f1019] border-[#1f202e] hover:bg-[#141520] hover:border-[#D4BFFF]/40'"
            >
              <div class="w-6 h-6 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-xs leading-none" :style="{ color: b.color || '#D4BFFF' }">{{ resolveIcon(b.icon, 'savings') }}</span>
              </div>
              <span class="text-xs font-bold text-[#f1f0f5] truncate">{{ b.name }}</span>
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="submitting"
          class="w-full py-2.5 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
        >
          <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-[#0f0f15] border-t-transparent rounded-full animate-spin"></span>
          <span>Save Account Adjustment</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { api } from '../services/api.js';
import { resolveIcon } from '../utils/iconResolver.js';
import { currencySymbol } from '../utils/currency.js';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  account: { type: Object, default: null },
  buckets: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'save']);

const realInputRef = ref(null);
const realBalanceInput = ref('');
const showOnChart = ref(true);
const targetBucketId = ref('');
const submitting = ref(false);
const error = ref('');

const currentBalance = computed(() => Math.round((Number(props.account?.balance) || 0) * 100) / 100);
const activeBuckets = computed(() => props.buckets.filter(b => !b.is_archived));

const calculatedDiff = computed(() => {
  if (realBalanceInput.value === '' || realBalanceInput.value === null || realBalanceInput.value === undefined) return null;
  const parsed = parseFloat(String(realBalanceInput.value).replace(',', '.'));
  if (isNaN(parsed)) return null;
  return Math.round((parsed - currentBalance.value) * 100) / 100;
});

watch(() => props.isOpen, (open) => {
  if (open) {
    error.value = '';
    submitting.value = false;
    const rounded = Math.round(currentBalance.value * 100) / 100;
    realBalanceInput.value = rounded.toString();
    showOnChart.value = true;
    targetBucketId.value = 'bucket_unassigned';
    nextTick(() => {
      realInputRef.value?.focus();
      realInputRef.value?.select();
    });
  }
});

const close = () => {
  emit('close');
};

const formatAmount = (val) => {
  const num = Number(val);
  if (isNaN(num)) return '0.00';
  const rounded = Math.round(num * 100) / 100;
  return rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const handleAdjust = async () => {
  error.value = '';
  if (!props.account?.id) {
    error.value = 'No account selected.';
    return;
  }
  const parsed = parseFloat(String(realBalanceInput.value).replace(',', '.'));
  if (isNaN(parsed)) {
    error.value = 'Please enter a valid balance.';
    return;
  }
  if (calculatedDiff.value === 0) {
    error.value = 'Account balance is already equal to this value.';
    return;
  }

  submitting.value = true;
  try {
    const res = await api.adjustAccountBalance({
      account_id: props.account.id,
      real_balance: parsed,
      target_bucket_id: targetBucketId.value,
      include_in_chart: showOnChart.value
    });
    emit('save', res);
    close();
  } catch (err) {
    error.value = err.message || 'Failed to apply adjustment.';
  } finally {
    submitting.value = false;
  }
};
</script>
