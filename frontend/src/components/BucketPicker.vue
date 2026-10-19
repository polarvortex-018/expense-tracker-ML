<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">{{ label }}</label>
    
    <!-- Compact Trigger Button -->
    <button
      type="button"
      :disabled="disabled"
      @click="isOpen = true"
      class="w-full flex items-center justify-between p-3 bg-[#0f0f15] border border-[#29293a] hover:border-[#D4BFFF]/60 rounded-xl cursor-pointer transition min-h-[44px] text-left disabled:opacity-50"
    >
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <div class="w-8 h-8 rounded-lg bg-[#191924] border border-[#29293a] flex items-center justify-center shrink-0">
          <span 
            class="material-symbols-outlined text-xl"
            :style="{ color: selectedBucket?.color || '#D4BFFF' }"
          >
            {{ resolveIcon(selectedBucket?.icon, 'savings') }}
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-[#f1f0f5] truncate">
            {{ selectedBucket ? selectedBucket.name : (placeholder || 'Select Bucket') }}
          </p>
          <p v-if="selectedBucket && selectedBucket.allocated_balance !== undefined" class="text-[10px] text-[#9e9cae] truncate">
            {{ currencySymbol }}{{ formatAmount(selectedBucket.allocated_balance) }}
          </p>
        </div>
      </div>
      <span class="text-xs font-bold text-[#D4BFFF] flex items-center gap-1 shrink-0 ml-2">Select ›</span>
    </button>

    <!-- Bottom Sheet / Modal Picker -->
    <Transition name="fade-slide">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0f0f15]/80 backdrop-blur-md pb-16 sm:pb-0"
        @click.self="isOpen = false"
      >
        <div class="relative w-full max-w-md bg-[#14141d] border-t sm:border border-[#29293a] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[78vh] sm:max-h-[85vh]">
          
          <!-- Modal Header -->
          <div class="flex justify-between items-center px-4 py-3 border-b border-[#29293a] bg-[#14141d] shrink-0">
            <h3 class="text-sm font-bold text-[#f1f0f5] tracking-tight">{{ title || 'Select Bucket' }}</h3>
            <button 
              @click="isOpen = false" 
              type="button" 
              class="text-[#9e9cae] hover:text-[#f1f0f5] transition text-base font-semibold cursor-pointer p-1"
            >
              ✕
            </button>
          </div>

          <!-- Search Bar -->
          <div class="p-3 bg-[#0f0f15] border-b border-[#29293a]">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search savings buckets..."
              class="w-full px-3.5 py-2 bg-[#191924] border border-[#29293a] focus:border-[#D4BFFF] rounded-xl text-xs text-[#f1f0f5] placeholder-[#9e9cae] focus:outline-none"
            />
          </div>

          <!-- Bucket List -->
          <div class="p-2 space-y-1 overflow-y-auto flex-1">
            <!-- Unassigned option -->
            <button
              v-if="showUnassigned"
              type="button"
              @click="selectBucket(null)"
              class="w-full flex items-center justify-between p-3 rounded-xl transition cursor-pointer text-left"
              :class="modelValue === null ? 'bg-[#D4BFFF]/15 border border-[#D4BFFF]' : 'hover:bg-[#191924] border border-transparent'"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-[#191924] border border-[#29293a] flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-base leading-none text-[#FFD1B3]">savings</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold text-[#f1f0f5] truncate">Unallocated Funds</p>
                  <p class="text-[10px] text-[#9e9cae] truncate">Unassigned Pool</p>
                </div>
              </div>
              <span v-if="modelValue === null" class="text-xs font-bold text-[#D4BFFF] shrink-0 ml-2">✓</span>
            </button>

            <!-- Savings Buckets -->
            <button
              v-for="b in filteredBuckets"
              :key="b.id"
              type="button"
              @click="selectBucket(b.id)"
              class="w-full flex items-center justify-between p-3 rounded-xl transition cursor-pointer text-left"
              :class="modelValue === b.id ? 'bg-[#D4BFFF]/15 border border-[#D4BFFF]' : 'hover:bg-[#191924] border border-transparent'"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-8 h-8 rounded-lg bg-[#191924] border border-[#29293a] flex items-center justify-center shrink-0">
                  <span 
                    class="material-symbols-outlined text-base leading-none"
                    :style="{ color: b.color || '#D4BFFF' }"
                  >
                    {{ resolveIcon(b.icon, 'savings') }}
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold text-[#f1f0f5] truncate">{{ b.name }}</p>
                  <p class="text-[10px] font-semibold text-[#9e9cae] truncate">{{ currencySymbol }}{{ formatAmount(b.allocated_balance) }}</p>
                </div>
              </div>

              <span v-if="modelValue === b.id" class="text-xs font-bold text-[#D4BFFF] shrink-0 ml-2">✓</span>
            </button>
          </div>

          <!-- Modal Footer -->
          <div class="px-4 py-3 bg-[#14141d] border-t border-[#29293a] flex justify-end shrink-0">
            <button
              type="button"
              @click="isOpen = false"
              class="px-5 py-2 text-xs font-semibold text-[#9e9cae] hover:text-[#f1f0f5] transition cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { resolveIcon } from '../utils/iconResolver.js';
import { currencySymbol } from '../utils/currency.js';

const props = defineProps({
  buckets: { type: Array, required: true },
  modelValue: { type: String, default: null },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Select Bucket' },
  title: { type: String, default: 'Select Bucket' },
  showUnassigned: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const searchQuery = ref('');

const selectedBucket = computed(() => {
  if (!props.modelValue) return null;
  return props.buckets.find(b => b.id === props.modelValue) || null;
});

const filteredBuckets = computed(() => {
  if (!searchQuery.value.trim()) return props.buckets;
  const q = searchQuery.value.toLowerCase().trim();
  return props.buckets.filter(b => b.name.toLowerCase().includes(q));
});

function selectBucket(id) {
  emit('update:modelValue', id);
  emit('change', id);
  isOpen.value = false;
  searchQuery.value = '';
}

function formatAmount(val) {
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.22s var(--ease-out), transform 0.22s var(--ease-out);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
