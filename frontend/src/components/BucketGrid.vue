<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
    <!-- Unassigned option (optional) -->
    <button
      v-if="showUnassigned"
      type="button"
      @click="$emit('update:modelValue', null)"
      class="flex items-center gap-2.5 p-3 rounded-xl border text-left transition cursor-pointer active:scale-[0.98] min-h-[50px]"
      :class="modelValue === null
        ? 'bg-[#D4BFFF]/15 border-[#D4BFFF] ring-1 ring-[#D4BFFF]/40'
        : 'bg-[#0f1019] border-[#1f202e] hover:bg-[#141520] hover:border-[#D4BFFF]/40'"
    >
      <div class="w-8 h-8 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-base leading-none text-[#FFD1B3]">savings</span>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-bold text-[#f1f0f5] truncate">Unallocated Funds</p>
        <p v-if="unassignedAmount !== null && unassignedAmount !== undefined" class="text-[10px] font-bold text-[#9e9cae] truncate mt-0.5 tabular-nums">{{ currencySymbol }}{{ formatAmount(unassignedAmount) }}</p>
        <p v-else class="text-[10px] text-[#9e9cae] truncate mt-0.5">Pool</p>
      </div>
    </button>

    <!-- Bucket cards -->
    <button
      v-for="bucket in filteredBuckets"
      :key="bucket.id"
      type="button"
      @click="$emit('update:modelValue', bucket.id)"
      class="flex items-center gap-2.5 p-3 rounded-xl border text-left transition cursor-pointer active:scale-[0.98] min-h-[50px]"
      :class="modelValue === bucket.id
        ? 'bg-[#D4BFFF]/15 border-[#D4BFFF] ring-1 ring-[#D4BFFF]/40'
        : 'bg-[#0f1019] border-[#1f202e] hover:bg-[#141520] hover:border-[#D4BFFF]/40'"
    >
      <div class="w-8 h-8 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-base leading-none" :style="{ color: bucket.color || '#D4BFFF' }">{{ resolveIcon(bucket.icon, 'savings') }}</span>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-bold text-[#f1f0f5] truncate">{{ bucket.name }}</p>
        <p class="text-[10px] font-bold text-[#9e9cae] truncate mt-0.5 tabular-nums">{{ currencySymbol }}{{ formatAmount(bucket.allocated_balance) }}</p>
      </div>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { resolveIcon } from '../utils/iconResolver.js';
import { currencySymbol } from '../utils/currency.js';

const props = defineProps({
  buckets: { type: Array, required: true },
  modelValue: { type: String, default: null },
  showUnassigned: { type: Boolean, default: false },
  unassignedAmount: { type: Number, default: null }
});

defineEmits(['update:modelValue']);

const filteredBuckets = computed(() => (props.buckets || []).filter(b => !b.is_archived));

const formatAmount = (val) => {
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
