<template>
  <div class="space-y-3 bg-[#0f1019] border border-[#1f202e] rounded-xl p-3.5">
    <div class="flex items-center justify-between gap-2 border-b border-[#1f202e] pb-2">
      <span class="text-xs font-bold text-[#D4BFFF] uppercase tracking-wider">Select Icon</span>
      <!-- Currently Selected Icon Preview -->
      <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#141520] border border-[#1f202e]">
        <span class="material-symbols-outlined text-base text-[#D4BFFF]">{{ resolveIcon(modelValue) }}</span>
        <span class="text-[10px] font-mono text-[#9e9cae]">{{ resolveIcon(modelValue) }}</span>
      </div>
    </div>

    <!-- Search / Filter Input -->
    <div class="relative">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="Search icons (e.g. car, food, rent, card)..."
        class="w-full bg-[#141520] border border-[#1f202e] focus:border-[#D4BFFF] rounded-lg px-3 py-1.5 text-xs text-[#f1f0f5] placeholder-[#9e9cae] focus:outline-none"
      />
      <span v-if="searchQuery" @click="searchQuery = ''" class="absolute right-2.5 top-1.5 text-xs text-[#9e9cae] cursor-pointer hover:text-[#f1f0f5]">✕</span>
    </div>

    <!-- Category Tabs (Shown when not searching) -->
    <div v-if="!searchQuery" class="flex gap-1 overflow-x-auto scrollbar-none pb-1 border-b border-[#1f202e]">
      <button
        v-for="(cat, idx) in ICON_CATALOG"
        :key="cat.category"
        @click="activeCategoryIndex = idx"
        type="button"
        class="px-2.5 py-1 text-[10px] font-bold rounded-md whitespace-nowrap transition cursor-pointer shrink-0"
        :class="activeCategoryIndex === idx ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'bg-[#141520] text-[#9e9cae] hover:text-[#f1f0f5] border border-[#1f202e]'"
      >
        {{ cat.category }}
      </button>
    </div>

    <!-- Icon Grid -->
    <div class="max-h-48 overflow-y-auto pr-1">
      <div v-if="filteredIcons.length === 0" class="py-6 text-center text-xs text-[#9e9cae]">
        No matching icons found.
      </div>
      <div v-else class="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
        <button
          v-for="iconObj in filteredIcons"
          :key="iconObj.id"
          @click="selectIcon(iconObj.id)"
          type="button"
          :title="iconObj.label"
          class="h-10 min-h-[40px] rounded-lg flex flex-col items-center justify-center transition cursor-pointer border"
          :class="modelValue === iconObj.id || resolveIcon(modelValue) === iconObj.id ? 'bg-[#D4BFFF]/20 border-[#D4BFFF] text-[#D4BFFF]' : 'bg-[#141520] border-[#1f202e] text-[#f1f0f5] hover:bg-[#191924] hover:border-[#D4BFFF]/40'"
        >
          <span class="material-symbols-outlined text-xl">{{ iconObj.id }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ICON_CATALOG, resolveIcon } from '../utils/iconResolver.js';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'category'
  }
});

const emit = defineEmits(['update:modelValue']);

const activeCategoryIndex = ref(0);
const searchQuery = ref('');

function selectIcon(id) {
  emit('update:modelValue', id);
}

const filteredIcons = computed(() => {
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    const all = [];
    ICON_CATALOG.forEach(cat => {
      cat.icons.forEach(item => {
        if (item.id.includes(q) || item.label.toLowerCase().includes(q)) {
          all.push(item);
        }
      });
    });
    return all;
  }
  return ICON_CATALOG[activeCategoryIndex.value]?.icons || [];
});
</script>
