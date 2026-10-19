<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
    <!-- Account cards -->
    <button
      v-for="account in filteredAccounts"
      :key="account.id"
      type="button"
      @click="handleAccountClick(account)"
      class="flex items-center gap-2.5 p-3 rounded-xl border text-left transition cursor-pointer active:scale-[0.98] min-h-[50px]"
      :class="modelValue === account.id
        ? 'bg-[#D4BFFF]/15 border-[#D4BFFF] ring-1 ring-[#D4BFFF]/40'
        : 'bg-[#0f1019] border-[#1f202e] hover:bg-[#141520] hover:border-[#D4BFFF]/40'"
    >
      <div class="w-8 h-8 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-base leading-none text-[#D4BFFF]">
          {{ getAccountSymbol(account.type) }}
        </span>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-bold text-[#f1f0f5] truncate">{{ account.name }}</p>
        <p class="text-[10px] font-bold text-[#9e9cae] truncate mt-0.5 tabular-nums">{{ currencySymbol }}{{ formatAmount(account.balance) }}</p>
      </div>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { currencySymbol } from '../utils/currency.js';
import { sortAccountsByOrder } from '../utils/accountSorter.js';

const props = defineProps({
  accounts: { type: Array, required: true },
  modelValue: { type: [String, Number], default: null }
});

const filteredAccounts = computed(() => {
  return sortAccountsByOrder(props.accounts || []);
});

const emit = defineEmits(['update:modelValue', 'accountClick']);

const handleAccountClick = (acc) => {
  emit('update:modelValue', acc.id);
  emit('accountClick', acc);
};

const getAccountSymbol = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('saving')) return 'account_balance';
  if (t.includes('credit')) return 'credit_card';
  if (t.includes('cash')) return 'payments';
  if (t.includes('wallet')) return 'account_balance_wallet';
  return 'account_balance';
};

const formatAmount = (val) => {
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
