<template>
  <Transition name="fade-slide">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md pb-16 sm:pb-0"
      @click.self="$emit('close')"
    >
      <div class="relative w-full max-w-lg bg-[#0c0d14] border-t sm:border border-[#1f202e] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[78vh] sm:max-h-[85vh]">
        
        <!-- Modal Header -->
        <div class="flex justify-between items-center px-4 py-3 border-b border-[#1f202e] bg-[#0c0d14] shrink-0">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-[#f1f0f5] tracking-tight">{{ title || 'Customize Appearance' }}</h3>
          </div>
          <button 
            type="button"
            @click="$emit('close')" 
            class="w-8 h-8 flex items-center justify-center rounded-lg text-[#9e9cae] hover:text-[#f1f0f5] hover:bg-[#141520] transition text-sm cursor-pointer"
          >
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <!-- Scrollable Modal Content -->
        <div class="p-4 overflow-y-auto flex-1 space-y-4">
          
          <!-- Live Preview Card -->
          <div class="flex items-center gap-3 p-3 bg-[#0f1019] border border-[#1f202e] rounded-xl">
            <div class="w-12 h-12 rounded-xl bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-3xl" :style="{ color: color || '#D4BFFF' }">{{ resolveIcon(icon, 'category') }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-[#f1f0f5] truncate">{{ entityName || 'Live Preview' }}</p>
              <p class="text-[11px] text-[#9e9cae] font-mono mt-0.5">{{ resolveIcon(icon, 'category') }} • {{ color || '#D4BFFF' }}</p>
            </div>
          </div>

          <!-- Tab Switcher: Icon vs Color -->
          <div class="grid grid-cols-2 p-1 bg-[#0f1019] border border-[#1f202e] rounded-xl text-xs font-bold">
            <button
              type="button"
              @click="activeTab = 'icon'"
              class="py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
              :class="activeTab === 'icon' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
            >
              <span class="material-symbols-outlined text-base">category</span>
              <span>Icon</span>
            </button>
            <button
              type="button"
              @click="activeTab = 'color'"
              class="py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
              :class="activeTab === 'color' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
            >
              <span class="material-symbols-outlined text-base">palette</span>
              <span>Color</span>
            </button>
          </div>

          <!-- TAB 1: ICON SELECTION -->
          <div v-if="activeTab === 'icon'" class="space-y-3">
            <!-- Search Bar -->
            <div class="relative">
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Search icons (e.g. car, food, rent, card)..."
                class="w-full bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl px-3 py-2 text-xs text-[#f1f0f5] placeholder-[#9e9cae] focus:outline-none"
              />
              <span v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-2 text-xs text-[#9e9cae] cursor-pointer hover:text-[#f1f0f5]">✕</span>
            </div>

            <!-- Horizontally Scrollable Category Chips -->
            <div v-if="!searchQuery" class="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 border-b border-[#1f202e]">
              <button
                v-for="(cat, idx) in ICON_CATALOG"
                :key="cat.category"
                @click="activeCategoryIndex = idx"
                type="button"
                class="px-2.5 py-1 text-[10px] font-bold rounded-lg whitespace-nowrap transition cursor-pointer shrink-0"
                :class="activeCategoryIndex === idx ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'bg-[#0f1019] text-[#9e9cae] hover:text-[#f1f0f5] border border-[#1f202e]'"
              >
                {{ cat.category }}
              </button>
            </div>

            <!-- Compact Icon Grid (6 columns on mobile, 8 on desktop) -->
            <div class="max-h-60 overflow-y-auto pr-1">
              <div v-if="filteredIcons.length === 0" class="py-6 text-center text-xs text-[#9e9cae]">
                No matching icons found.
              </div>
              <div v-else class="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                <button
                  v-for="iconObj in filteredIcons"
                  :key="iconObj.id"
                  @click="$emit('update:icon', iconObj.id)"
                  type="button"
                  :title="iconObj.label"
                  class="h-10 min-h-[40px] rounded-xl flex flex-col items-center justify-center transition cursor-pointer border"
                  :class="icon === iconObj.id || resolveIcon(icon) === iconObj.id ? 'bg-[#D4BFFF]/20 border-[#D4BFFF] text-[#D4BFFF]' : 'bg-[#0f1019] border-[#1f202e] text-[#f1f0f5] hover:bg-[#141520] hover:border-[#D4BFFF]/40'"
                >
                  <span class="material-symbols-outlined text-xl">{{ iconObj.id }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 2: COLOR SELECTION -->
          <div v-else class="space-y-4">
            <ColorPicker :modelValue="color" @update:modelValue="$emit('update:color', $event)" label="Select Color Palette" />
          </div>

        </div>

        <!-- Sticky Footer -->
        <div class="px-4 py-3 bg-[#0c0d14] border-t border-[#1f202e] flex justify-end shrink-0">
          <button
            type="button"
            @click="$emit('close')"
            class="w-full sm:w-auto px-6 py-2.5 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ICON_CATALOG, resolveIcon } from '../utils/iconResolver.js';
import ColorPicker from './ColorPicker.vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  icon: { type: String, default: 'category' },
  color: { type: String, default: '#D4BFFF' },
  title: { type: String, default: 'Customize Appearance' },
  entityName: { type: String, default: '' }
});

defineEmits(['update:icon', 'update:color', 'close']);

const activeTab = ref('icon');
const activeCategoryIndex = ref(0);
const searchQuery = ref('');

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
