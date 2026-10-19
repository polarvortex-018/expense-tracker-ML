<template>
  <Transition name="fade-slide">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md pb-16 sm:pb-0"
      @click.self="$emit('close')"
    >
      <div class="relative w-full max-w-lg bg-[#0c0d14] border-t sm:border border-[#1f202e] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <!-- Modal Header -->
        <div class="flex justify-between items-center px-4 py-3.5 border-b border-[#1f202e] bg-[#0c0d14] shrink-0">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#D4BFFF] text-xl">palette</span>
            <div>
              <h3 class="text-sm font-bold text-[#f1f0f5] tracking-tight">App Theme & Appearance</h3>
              <p class="text-[11px] text-[#9e9cae]">Customize visual palette & contrast</p>
            </div>
          </div>
          <button 
            type="button"
            @click="$emit('close')" 
            class="w-8 h-8 flex items-center justify-center rounded-lg text-[#9e9cae] hover:text-[#f1f0f5] hover:bg-[#141520] transition text-sm cursor-pointer"
          >
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <!-- Scrollable Theme Cards Grid -->
        <div class="p-4 overflow-y-auto flex-1 space-y-3">
          <div 
            v-for="theme in THEMES" 
            :key="theme.id"
            @click="selectTheme(theme.id)"
            class="group relative p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3"
            :class="activeThemeId === theme.id ? 'bg-[#141520] border-[#D4BFFF] shadow-md ring-1 ring-[#D4BFFF]/40' : 'bg-[#0f1019] border-[#1f202e] hover:border-[#D4BFFF]/30 hover:bg-[#141520]/70'"
          >
            <!-- Left Info & Preview Swatch -->
            <div class="flex items-center gap-3 min-w-0">
              <!-- Theme Color Preview Swatch -->
              <div 
                class="w-12 h-12 rounded-xl border flex flex-col overflow-hidden shrink-0 shadow-inner relative"
                :style="{ backgroundColor: theme.bg, borderColor: theme.border }"
              >
                <!-- Mini Card Header inside Swatch -->
                <div class="h-4 border-b flex items-center px-1 gap-1" :style="{ backgroundColor: theme.card, borderColor: theme.border }">
                  <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: theme.primary }"></div>
                  <div class="w-4 h-1 rounded-full opacity-40" :style="{ backgroundColor: theme.primary }"></div>
                </div>
                <!-- Mini Card Body -->
                <div class="flex-1 p-1 flex flex-col justify-end">
                  <div class="w-full h-1.5 rounded opacity-60" :style="{ backgroundColor: theme.primary }"></div>
                </div>
              </div>

              <!-- Name & Description -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h4 class="text-xs font-bold text-[#f1f0f5] tracking-tight group-hover:text-[#D4BFFF] transition">{{ theme.name }}</h4>
                  <span 
                    class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                    :class="theme.isDark ? 'bg-slate-800 text-slate-300' : 'bg-amber-100 text-amber-900'"
                  >
                    {{ theme.isDark ? 'Dark' : 'Light' }}
                  </span>
                </div>
                <p class="text-[11px] text-[#9e9cae] truncate mt-0.5">{{ theme.desc }}</p>
              </div>
            </div>

            <!-- Selection Indicator Radio / Check -->
            <div 
              class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition"
              :class="activeThemeId === theme.id ? 'bg-[#D4BFFF] border-[#D4BFFF] text-[#0c0d14]' : 'border-[#1f202e] bg-[#0c0d14] text-transparent group-hover:border-[#9e9cae]'"
            >
              <span class="material-symbols-outlined text-sm font-bold">check</span>
            </div>
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
import { ref, onMounted, watch } from 'vue';
import { THEMES, applyTheme } from '../utils/theme.js';
import { api } from '../services/api.js';

const props = defineProps({
  isOpen: { type: Boolean, default: false }
});

defineEmits(['close']);

const activeThemeId = ref('pastel-dark');

const loadCurrentTheme = async () => {
  try {
    const current = await api.getVaultTheme();
    activeThemeId.value = current || 'pastel-dark';
  } catch (e) {
    console.warn('Failed to load theme in ThemeModal:', e);
  }
};

const selectTheme = async (themeId) => {
  activeThemeId.value = themeId;
  applyTheme(themeId);
  try {
    await api.setVaultTheme(themeId);
  } catch (e) {
    console.error('Failed to save selected theme:', e);
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadCurrentTheme();
  }
});

onMounted(() => {
  loadCurrentTheme();
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
