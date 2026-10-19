<template>
  <div>
    <!-- Main Form Modal -->
    <Transition name="fade-slide">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 pt-[max(1rem,env(safe-area-inset-top))] sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
        @click.self="$emit('close')"
      >
        <div class="relative w-full max-w-md bg-[#0c0d14] border border-[#1f202e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-1rem)] my-auto">
          
          <!-- Header -->
          <div class="flex justify-between items-center px-4 py-3.5 border-b border-[#1f202e] bg-[#0c0d14] shrink-0">
            <h3 class="text-base font-bold text-[#f1f0f5] tracking-tight">
              {{ form.id ? 'Edit Category' : 'Create New Category' }}
            </h3>
            <button 
              type="button" 
              @click="$emit('close')" 
              class="w-8 h-8 flex items-center justify-center rounded-lg text-[#9e9cae] hover:text-[#f1f0f5] hover:bg-[#141520] transition text-sm cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <!-- Form Wrapper -->
          <form @submit.prevent="handleSubmit" class="flex flex-col flex-1 overflow-hidden">
            <!-- Body -->
            <div class="p-4 space-y-4 overflow-y-auto flex-1 pb-48 sm:pb-6">
              <!-- Category Name Input -->
              <div class="space-y-1">
                <label class="block text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">Category Name *</label>
                <input 
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. Groceries, Fuel, Subscriptions"
                  required
                  @focus="$event.target.scrollIntoView({ behavior: 'smooth', block: 'center' })"
                  class="w-full px-3.5 py-2.5 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs font-bold focus:outline-none transition"
                />
              </div>

              <!-- Category Type -->
              <div class="space-y-1">
                <label class="block text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">Category Type</label>
                <div class="grid grid-cols-2 gap-2" role="group" aria-label="Category type">
                  <button type="button" :aria-pressed="form.category_type === 'expense'" @click="form.category_type = 'expense'" class="min-h-11 rounded-xl border px-3 text-xs font-bold transition" :class="form.category_type === 'expense' ? 'border-[#FFD1B3] bg-[#FFD1B3]/15 text-[#FFD1B3]' : 'border-[#1f202e] bg-[#0f1019] text-[#9e9cae]'">Expense</button>
                  <button type="button" :aria-pressed="form.category_type === 'income'" @click="form.category_type = 'income'" class="min-h-11 rounded-xl border px-3 text-xs font-bold transition" :class="form.category_type === 'income' ? 'border-[#B3F5E1] bg-[#B3F5E1]/15 text-[#B3F5E1]' : 'border-[#1f202e] bg-[#0f1019] text-[#9e9cae]'">Income</button>
                </div>
              </div>

              <!-- Compact Appearance Trigger -->
              <div class="space-y-1">
                <label class="block text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">Appearance</label>
                <div 
                  @click="showAppearanceModal = true"
                  class="flex items-center justify-between p-3 bg-[#0f1019] border border-[#1f202e] hover:border-[#D4BFFF]/60 rounded-xl cursor-pointer transition min-h-[48px]"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined text-xl" :style="{ color: form.color || '#D4BFFF' }">{{ resolveIcon(form.icon, 'category') }}</span>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-[#f1f0f5]">Icon & Color</p>
                      <p class="text-[10px] text-[#9e9cae] font-mono mt-0.5">{{ resolveIcon(form.icon, 'category') }} • {{ form.color || '#D4BFFF' }}</p>
                    </div>
                  </div>
                  <span class="text-xs font-bold text-[#D4BFFF] flex items-center gap-1">Customize ›</span>
                </div>
              </div>

              <!-- Quick Select Option -->
              <label class="flex items-center gap-2.5 p-3 bg-[#0f1019] border border-[#1f202e] rounded-xl text-xs text-[#f1f0f5] cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="form.is_quick_select" 
                  class="w-4 h-4 rounded border-[#1f202e] text-[#D4BFFF] bg-[#0c0d14] cursor-pointer"
                />
                <span class="font-bold">Pin to Quick Select</span>
              </label>
            </div>

            <!-- Sticky Footer Actions -->
            <div class="px-4 py-3 border-t border-[#1f202e] bg-[#0c0d14] shrink-0 flex items-center justify-end gap-2.5">
              <button 
                type="button" 
                @click="$emit('close')" 
                class="px-4 py-2.5 text-xs font-semibold text-[#9e9cae] hover:text-[#f1f0f5] transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                :disabled="submitting"
                class="px-6 py-2.5 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50 min-h-[38px]"
              >
                {{ submitting ? 'Saving...' : (form.id ? 'Save Changes' : '+ Create Category') }}
              </button>
            </div>
          </form>

        </div>
      </div>
    </Transition>

    <!-- Nested Appearance Customizer Sheet -->
    <AppearanceModal 
      :isOpen="showAppearanceModal"
      v-model:icon="form.icon"
      v-model:color="form.color"
      title="Category Appearance"
      :entityName="form.name || 'Category Preview'"
      @close="showAppearanceModal = false"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { resolveIcon } from '../utils/iconResolver.js';
import AppearanceModal from './AppearanceModal.vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  category: { type: Object, default: null },
  defaultCategoryType: { type: String, default: 'expense' }
});

const emit = defineEmits(['close', 'save']);

const submitting = ref(false);
const showAppearanceModal = ref(false);

const form = ref({
  id: null,
  name: '',
  icon: 'category',
  color: '#D4BFFF',
  is_quick_select: false
});

watch([() => props.isOpen, () => props.category, () => props.defaultCategoryType], ([open, currentCategory, defaultCategoryType]) => {
  if (open) {
    if (currentCategory) {
      form.value = {
        id: currentCategory.id,
        name: currentCategory.name || '',
        category_type: currentCategory.category_type === 'income' ? 'income' : 'expense',
        icon: resolveIcon(currentCategory.icon, 'category'),
        color: currentCategory.color || '#D4BFFF',
        is_quick_select: Boolean(currentCategory.is_quick_select)
      };
    } else {
      form.value = {
        id: null,
        name: '',
        category_type: defaultCategoryType === 'income' ? 'income' : 'expense',
        icon: 'category',
        color: '#D4BFFF',
        is_quick_select: false
      };
    }
  }
}, { immediate: true });

function handleSubmit() {
  if (!form.value.name.trim()) return;
  submitting.value = true;
  try {
    emit('save', {
      id: form.value.id,
      name: form.value.name.trim(),
      category_type: form.value.category_type === 'income' ? 'income' : 'expense',
      icon: form.value.icon,
      color: form.value.color,
      is_quick_select: form.value.is_quick_select ? 1 : 0
    });
  } finally {
    submitting.value = false;
  }
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
