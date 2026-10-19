<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">{{ label }}</label>
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="color in CURATED_COLORS"
        :key="color.hex"
        @click="selectColor(color.hex)"
        type="button"
        :title="color.name"
        class="w-7 h-7 min-w-[28px] min-h-[28px] rounded-full border transition flex items-center justify-center cursor-pointer shrink-0"
        :class="modelValue?.toLowerCase() === color.hex.toLowerCase() ? 'ring-2 ring-white ring-offset-2 ring-offset-[#14141d] scale-110 border-white' : 'border-white/20 hover:scale-105'"
        :style="{ backgroundColor: color.hex }"
      >
        <span v-if="modelValue?.toLowerCase() === color.hex.toLowerCase()" class="text-xs font-bold text-[#0f0f15]">✓</span>
      </button>

      <!-- Custom Color Input Swatch -->
      <div 
        class="relative w-7 h-7 min-w-[28px] min-h-[28px] rounded-full border border-white/30 bg-[#0f0f15] flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:border-white"
        title="Custom Color"
      >
        <input 
          :value="modelValue"
          @input="selectColor($event.target.value)"
          type="color"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0 border-0"
        />
        <div class="w-3.5 h-3.5 rounded-full border border-white/40" :style="{ backgroundColor: modelValue }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '#D4BFFF'
  },
  label: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const CURATED_COLORS = [
  { name: 'Lavender', hex: '#D4BFFF' },
  { name: 'Mint', hex: '#B3F5E1' },
  { name: 'Peach', hex: '#FFD1B3' },
  { name: 'Purple', hex: '#7c3aed' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#ef4444' },
  { name: 'Sky', hex: '#3b82f6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Slate', hex: '#94a3b8' }
];

function selectColor(hex) {
  emit('update:modelValue', hex);
}
</script>
