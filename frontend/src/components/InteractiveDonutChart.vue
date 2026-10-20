<template>
  <div class="space-y-4 py-1">
    <div class="flex items-center justify-center py-2">
      <div class="relative flex h-56 w-56 shrink-0 items-center justify-center">
        <svg class="h-full w-full overflow-visible" viewBox="-30 -30 260 260" role="group" :aria-label="chartLabel">
          <defs>
            <radialGradient v-if="activeGroup" :id="glowId" cx="50%" cy="50%" r="50%">
              <stop offset="0%" :stop-color="activeGroup.color" stop-opacity="0.4" />
              <stop offset="60%" :stop-color="activeGroup.color" stop-opacity="0.15" />
              <stop offset="100%" :stop-color="activeGroup.color" stop-opacity="0" />
            </radialGradient>
          </defs>

          <circle v-if="activeGroup" cx="100" cy="100" r="90" :fill="`url(#${glowId})`" class="animate-breathe-glow pointer-events-none origin-[100px_100px] transition-all duration-700" />

          <g class="pointer-events-none">
            <g class="animate-orbit-1 origin-[100px_100px]"><circle cx="222" cy="100" r="2.2" :fill="activeGroup?.color || '#D4BFFF'" class="particle-dot opacity-90 transition-colors duration-500" /></g>
            <g class="animate-orbit-2 origin-[100px_100px]"><circle cx="161" cy="205" r="1.8" :fill="activeGroup?.color || '#B3F5E1'" class="particle-dot opacity-90 transition-colors duration-500" style="animation-delay: 0.5s" /></g>
            <g class="animate-orbit-3 origin-[100px_100px]"><circle cx="39" cy="205" r="2.5" :fill="activeGroup?.color || '#FFD1B3'" class="particle-dot opacity-90 transition-colors duration-500" style="animation-delay: 1s" /></g>
            <g class="animate-orbit-4 origin-[100px_100px]"><circle cx="-22" cy="100" r="1.6" :fill="activeGroup?.color || '#c084fc'" class="particle-dot opacity-90 transition-colors duration-500" style="animation-delay: 1.5s" /></g>
            <g class="animate-orbit-5 origin-[100px_100px]"><circle cx="39" cy="-5" r="2.2" :fill="activeGroup?.color || '#38bdf8'" class="particle-dot opacity-90 transition-colors duration-500" style="animation-delay: 2s" /></g>
            <g class="animate-orbit-6 origin-[100px_100px]"><circle cx="161" cy="-5" r="1.8" :fill="activeGroup?.color || '#f472b6'" class="particle-dot opacity-90 transition-colors duration-500" style="animation-delay: 2.5s" /></g>
          </g>

          <g class="origin-[100px_100px] transition-transform duration-700 ease-out" :style="{ transformOrigin: '100px 100px', transform: rotationTransform }">
            <g
              v-for="segment in chartSegments"
              :key="segment.id || segment.name"
              role="button"
              tabindex="0"
              class="cursor-pointer outline-none focus-visible:drop-shadow-[0_0_4px_#D4BFFF]"
              :aria-label="`${segment.name}: ${currencySymbol}${formatAmount(segment.amount)} (${segment.percentage}%). Select ${selectionLabel}`"
              :aria-pressed="selectedIndex === segment.originalIndex"
              @mouseenter="hoveredIndex = segment.originalIndex"
              @mouseleave="hoveredIndex = null"
              @click="toggleSelection(segment.originalIndex)"
              @keydown.enter.prevent="toggleSelection(segment.originalIndex)"
              @keydown.space.prevent="toggleSelection(segment.originalIndex)"
            >
              <path :d="segment.hitD" fill="transparent" />
              <path
                :d="segment.d"
                :fill="segment.color || fallbackColors[segment.originalIndex % fallbackColors.length]"
                class="pointer-events-none transition-all duration-300"
                :style="{
                  transformOrigin: '100px 100px',
                  transform: activeIndex === segment.originalIndex ? 'scale(1.07)' : 'scale(1)',
                  opacity: activeIndex === null || activeIndex === segment.originalIndex ? 1 : 0.35
                }"
              />
            </g>
          </g>
        </svg>

        <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
          <span class="max-w-[120px] truncate text-[11px] font-semibold uppercase tracking-wider text-[#9e9cae]">{{ activeGroup?.name || 'Total' }}</span>
          <div class="mt-0.5 text-xl font-bold tracking-tight text-[#f1f0f5] tabular-nums">{{ currencySymbol }}{{ formatAmount(activeGroup ? activeGroup.amount : displayedTotal) }}</div>
          <span v-if="activeGroup" class="mt-0.5 text-[10px] font-semibold text-[#B3F5E1]">{{ activeGroup.percentage }}%</span>
        </div>
      </div>
    </div>

    <TransitionGroup name="flip-list" tag="div" class="divide-y divide-[#1f202e] border-y border-[#1f202e]">
      <button
        v-for="item in chartSegments"
        :key="item.id || item.name"
        type="button"
        class="flex min-h-11 w-full cursor-pointer items-center justify-between px-1 py-2.5 text-left transition hover:bg-[#141520] active:bg-[#141520] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D4BFFF]"
        :class="activeIndex === item.originalIndex ? 'bg-[#141520]' : ''"
        @mouseenter="hoveredIndex = item.originalIndex"
        @mouseleave="hoveredIndex = null"
        @click="toggleSelection(item.originalIndex)"
      >
        <span class="flex min-w-0 items-center gap-2.5">
          <span class="h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: item.color || fallbackColors[item.originalIndex % fallbackColors.length] }"></span>
          <span class="truncate text-xs font-semibold text-[#f1f0f5]">{{ item.name }}</span>
        </span>
        <span class="flex shrink-0 items-center gap-4 tabular-nums">
          <span class="w-10 text-right text-[11px] font-medium text-[#9e9cae]">{{ item.percentage }}%</span>
          <span class="min-w-[70px] text-right text-xs font-bold text-[#f1f0f5]">{{ currencySymbol }}{{ formatAmount(item.amount) }}</span>
        </span>
      </button>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  groups: { type: Array, default: () => [] },
  total: { type: Number, default: null },
  currencySymbol: { type: String, default: '' },
  animateTotal: { type: Boolean, default: false },
  idPrefix: { type: String, default: 'donut' },
  selectionLabel: { type: String, default: 'category' }
});
const emit = defineEmits(['select']);

const glowId = `${props.idPrefix}-radial-glow`;
const fallbackColors = ['#D4BFFF', '#B3F5E1', '#FFD1B3', '#c084fc', '#38bdf8', '#f472b6'];
const hoveredIndex = ref(null);
const selectedIndex = ref(null);
const activeIndex = computed(() => selectedIndex.value !== null ? selectedIndex.value : hoveredIndex.value);
const totalValue = computed(() => props.total === null ? props.groups.reduce((sum, group) => sum + (Number(group.total ?? group.amount) || 0), 0) : Number(props.total) || 0);
const chartSegments = computed(() => {
  const total = totalValue.value;
  if (!total) return [];

  const cx = 100;
  const cy = 100;
  const outerR = 103;
  const innerR = 89;
  const hitOuterR = 118;
  const hitInnerR = 74;
  let currentAngle = -Math.PI / 2;

  return props.groups.map((item, originalIndex) => {
    const amount = Number(item.total ?? item.amount) || 0;
    const angleSpan = amount / total * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    const midAngle = startAngle + angleSpan / 2;
    currentAngle = endAngle;

    const createArcPath = (outerRadius, innerRadius) => {
      const x1o = cx + outerRadius * Math.cos(startAngle);
      const y1o = cy + outerRadius * Math.sin(startAngle);
      const x2o = cx + outerRadius * Math.cos(endAngle);
      const y2o = cy + outerRadius * Math.sin(endAngle);
      const x1i = cx + innerRadius * Math.cos(startAngle);
      const y1i = cy + innerRadius * Math.sin(startAngle);
      const x2i = cx + innerRadius * Math.cos(endAngle);
      const y2i = cy + innerRadius * Math.sin(endAngle);
      const largeArc = angleSpan > Math.PI ? 1 : 0;
      return [
        `M ${x1o} ${y1o}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2o} ${y2o}`,
        `L ${x2i} ${y2i}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1i} ${y1i}`,
        'Z'
      ].join(' ');
    };

    return {
      ...item,
      amount,
      color: item.color || fallbackColors[originalIndex % fallbackColors.length],
      percentage: Math.round(amount / total * 100),
      midAngle,
      originalIndex,
      d: createArcPath(outerR, innerR),
      hitD: createArcPath(hitOuterR, hitInnerR)
    };
  });
});

const activeGroup = computed(() => activeIndex.value === null ? null : chartSegments.value[activeIndex.value] || null);
const chartLabel = computed(() => chartSegments.value.map((item) => `${item.name}: ${props.currencySymbol}${formatAmount(item.amount)}, ${item.percentage}%`).join('. '));
const currentOrbitAngle = ref(0);
const animatedTotal = ref(props.animateTotal ? 0 : totalValue.value);
const displayedTotal = computed(() => props.animateTotal ? animatedTotal.value : totalValue.value);
let orbitFrame = null;
let counterFrame = null;
let lastTimestamp = 0;

function formatAmount(value) {
  return (Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toggleSelection(index) {
  if (selectedIndex.value === index) {
    selectedIndex.value = null;
    hoveredIndex.value = null;
    emit('select', null);
  } else {
    selectedIndex.value = index;
    hoveredIndex.value = index;
    emit('select', chartSegments.value.find((segment) => segment.originalIndex === index) || null);
  }
}

function animateOrbit(timestamp) {
  if (activeIndex.value !== null) {
    lastTimestamp = 0;
    orbitFrame = null;
    return;
  }
  if (lastTimestamp) currentOrbitAngle.value = (currentOrbitAngle.value + (timestamp - lastTimestamp) * 0.0048) % 360;
  lastTimestamp = timestamp;
  orbitFrame = requestAnimationFrame(animateOrbit);
}

const rotationTransform = computed(() => {
  const segment = chartSegments.value.find((item) => item.originalIndex === activeIndex.value);
  if (!segment) return `rotate(${currentOrbitAngle.value}deg)`;
  const rawSnapRotation = -90 - (segment.midAngle * 180) / Math.PI;
  const turns = Math.round((currentOrbitAngle.value - rawSnapRotation) / 360);
  return `rotate(${rawSnapRotation + turns * 360}deg)`;
});

function animateCounter() {
  if (counterFrame) cancelAnimationFrame(counterFrame);
  const target = totalValue.value;
  if (!props.animateTotal) {
    animatedTotal.value = target;
    return;
  }
  const startValue = 0;
  const startTime = performance.now();
  const duration = 800;
  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    animatedTotal.value = startValue + (target - startValue) * eased;
    if (progress < 1) counterFrame = requestAnimationFrame(step);
    else counterFrame = null;
  };
  counterFrame = requestAnimationFrame(step);
}

watch(() => props.groups, () => {
  hoveredIndex.value = null;
  selectedIndex.value = null;
}, { deep: false });
watch(totalValue, animateCounter, { immediate: true });
watch(activeIndex, (value) => {
  if (orbitFrame) cancelAnimationFrame(orbitFrame);
  orbitFrame = null;
  lastTimestamp = 0;
  if (value === null) orbitFrame = requestAnimationFrame(animateOrbit);
});

onMounted(() => {
  if (activeIndex.value === null && orbitFrame === null) orbitFrame = requestAnimationFrame(animateOrbit);
});
onBeforeUnmount(() => {
  if (orbitFrame) cancelAnimationFrame(orbitFrame);
  if (counterFrame) cancelAnimationFrame(counterFrame);
});
</script>

<style scoped>
@keyframes orbitCW {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes orbitCCW {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes particlePulse {
  0%, 100% { opacity: 0.25; transform: scale(0.85); }
  50% { opacity: 0.95; transform: scale(1.35); }
}

.animate-orbit-1 { animation: orbitCW 24s linear infinite; transform-origin: 100px 100px; }
.animate-orbit-2 { animation: orbitCCW 36s linear infinite; transform-origin: 100px 100px; }
.animate-orbit-3 { animation: orbitCW 48s linear infinite; transform-origin: 100px 100px; }
.animate-orbit-4 { animation: orbitCCW 28s linear infinite; transform-origin: 100px 100px; }
.animate-orbit-5 { animation: orbitCW 42s linear infinite; transform-origin: 100px 100px; }
.animate-orbit-6 { animation: orbitCCW 56s linear infinite; transform-origin: 100px 100px; }

.particle-dot {
  animation: particlePulse 3s ease-in-out infinite;
  transform-origin: center;
}

.flip-list-move,
.flip-list-enter-active,
.flip-list-leave-active {
  transition: transform 0.22s var(--ease-out), opacity 0.22s var(--ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .animate-orbit-1,
  .animate-orbit-2,
  .animate-orbit-3,
  .animate-orbit-4,
  .animate-orbit-5,
  .animate-orbit-6,
  .particle-dot { animation: none; }
}
</style>
