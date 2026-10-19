<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">{{ label }}</label>
    
    <!-- Compact Trigger Button -->
    <button
      v-if="!hideTrigger"
      type="button"
      :disabled="disabled"
      @click="isOpen = true"
      class="w-full flex items-center justify-between p-3 bg-[#0f1019] border border-[#1f202e] hover:border-[#D4BFFF]/50 rounded-xl cursor-pointer transition min-h-[44px] text-left disabled:opacity-50 active:scale-[0.98]"
    >
      <div class="flex items-center gap-2.5 min-w-0 flex-1">
        <div class="w-8 h-8 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
          <span 
            class="material-symbols-outlined text-lg"
            :style="{ color: selectedCategory?.color || '#D4BFFF' }"
          >
            {{ resolveIcon(selectedCategory?.icon, 'category') }}
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-[#f1f0f5] truncate">
            {{ selectedCategory ? selectedCategory.name : (placeholder || 'Select Category') }}
          </p>
        </div>
      </div>
      <span class="text-xs font-bold text-[#D4BFFF] flex items-center gap-1 shrink-0 ml-2">Select ›</span>
    </button>

    <!-- Bottom Sheet / Modal Picker -->
    <Transition name="fade-slide">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md pb-16 sm:pb-0"
        @click.self="isOpen = false"
      >
        <div class="relative w-full max-w-md bg-[#0c0d14] border-t sm:border border-[#1f202e] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[78vh] sm:max-h-[85vh]">
          
          <!-- Modal Header -->
          <div class="flex justify-between items-center px-4 py-3 border-b border-[#1f202e] bg-[#0c0d14] shrink-0">
            <h3 class="text-sm font-bold text-[#f1f0f5] tracking-tight">{{ title || 'Select Category' }}</h3>
            <button 
              type="button"
              @click="isOpen = false" 
              class="w-8 h-8 flex items-center justify-center rounded-lg text-[#9e9cae] hover:text-[#f1f0f5] hover:bg-[#141520] transition text-sm cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <!-- Search Bar -->
          <div class="p-3 border-b border-[#1f202e] bg-[#0c0d14] shrink-0">
            <div class="relative">
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Search categories..."
                class="w-full bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl px-3 py-2 text-xs text-[#f1f0f5] placeholder-[#9e9cae] focus:outline-none"
              />
              <span v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-2 text-xs text-[#9e9cae] cursor-pointer hover:text-[#f1f0f5]">✕</span>
            </div>
          </div>

          <!-- Category Options Grid Matrix (2-Column Mobile, 3-Column Desktop) -->
          <div class="p-3 overflow-y-auto flex-1">
            <div v-if="filteredCategories.length === 0" class="py-8 text-center text-xs text-[#9e9cae]">
              No categories found.
            </div>
            
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="cat in filteredCategories"
                :key="cat.id"
                type="button"
                @click="selectCategory(cat.id)"
                class="flex items-center gap-2.5 p-3 rounded-xl border text-left transition cursor-pointer active:scale-[0.98] min-h-[50px]"
                :class="modelValue === cat.id 
                  ? 'bg-[#D4BFFF]/15 border-[#D4BFFF] ring-1 ring-[#D4BFFF]/40' 
                  : 'bg-[#0f1019] border-[#1f202e] hover:bg-[#141520] hover:border-[#D4BFFF]/40'"
              >
                <div class="w-8 h-8 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                  <span 
                    class="material-symbols-outlined text-base leading-none"
                    :style="{ color: cat.color || '#D4BFFF' }"
                  >
                    {{ resolveIcon(cat.icon, 'category') }}
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold text-[#f1f0f5] truncate">{{ cat.name }}</p>
                </div>
                <span v-if="modelValue === cat.id" class="material-symbols-outlined text-xs text-[#D4BFFF] shrink-0">check</span>
              </button>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-4 py-3 bg-[#0c0d14] border-t border-[#1f202e] flex flex-col-reverse sm:flex-row gap-2 shrink-0">
            <button
              v-if="allowCreate"
              type="button"
              @click="isOpen = false; emit('create')"
              class="w-full sm:flex-1 px-4 py-2.5 border border-[#1f202e] hover:border-[#D4BFFF]/60 text-[#D4BFFF] font-bold text-xs rounded-xl transition cursor-pointer min-h-11"
            >
              + Create Category
            </button>
            <button
              type="button"
              @click="isOpen = false"
              class="w-full sm:w-auto px-5 py-2 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
            >
              Done
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

const props = defineProps({
  categories: { type: Array, required: true },
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Select Category' },
  title: { type: String, default: 'Select Category' },
  disabled: { type: Boolean, default: false },
  hideTrigger: { type: Boolean, default: false },
  allowCreate: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'change', 'create']);

const isOpen = ref(false);
const searchQuery = ref('');

const selectedCategory = computed(() => {
  if (!props.modelValue) return null;
  return props.categories.find(c => c.id === props.modelValue) || null;
});

const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) return props.categories;
  const q = searchQuery.value.toLowerCase().trim();
  return props.categories.filter(c => c.name.toLowerCase().includes(q));
});

function selectCategory(id) {
  emit('update:modelValue', id);
  emit('change', id);
  isOpen.value = false;
  searchQuery.value = '';
}

const open = () => { isOpen.value = true; };
const close = () => { isOpen.value = false; };
defineExpose({ open, close });
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
