<template>
  <div class="space-y-6">
    <!-- 1. Header & Net Worth Overview Section (Flush, Hairline Dividers) -->
    <section data-tour="dashboard-summary" class="space-y-3 pb-4 border-b border-[#1f202e] animate-cascade-1">
      <div>
        <h2 class="text-base font-bold text-[#f1f0f5] tracking-tight">Financial Overview</h2>
        <p class="text-xs text-[#9e9cae]">Real-time summary of your accounts, income, expenses, and savings buckets.</p>
      </div>

      <!-- Hero Net Worth Readout with Count-Up Ticker -->
      <div class="pt-1">
        <span class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">NET WORTH</span>
        <div class="text-3xl font-bold tabular-nums tracking-tight mt-0.5" :class="netWorth >= 0 ? 'text-[#f1f0f5]' : 'text-[#FFD1B3]'">
          {{ currencySymbol }}{{ formatAmount(animatedNetWorth) }}
        </div>
      </div>

      <!-- Side-by-Side Income & Expense Metrics with Pulsating Arrow Icons Only -->
      <div class="grid grid-cols-2 divide-x divide-[#1f202e] pt-3 mt-3 border-t border-[#1f202e]/60">
        <!-- Income Metric -->
        <div class="flex items-center gap-2 pr-2.5 min-w-0">
          <span class="material-symbols-outlined text-lg text-[#B3F5E1] animate-bounce-gentle shrink-0">north_east</span>
          <div class="min-w-0 flex-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#B3F5E1] block truncate">INCOME ({{ currentMonthLabel }})</span>
            <span class="text-sm font-bold text-[#B3F5E1] tabular-nums tracking-tight block truncate">{{ currencySymbol }}{{ formatAmount(animatedIncome) }}</span>
          </div>
        </div>

        <!-- Expense Metric -->
        <div class="flex items-center gap-2 pl-3 min-w-0">
          <span class="material-symbols-outlined text-lg text-[#FFD1B3] animate-pulse-slow shrink-0">south_east</span>
          <div class="min-w-0 flex-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#FFD1B3] block truncate">EXPENSE ({{ currentMonthLabel }})</span>
            <span class="text-sm font-bold text-[#FFD1B3] tabular-nums tracking-tight block truncate">{{ currencySymbol }}{{ formatAmount(animatedExpenses) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. SAVINGS ALLOCATIONS (Hairline Grid Layout) -->
    <section data-tour="buckets-grid" class="space-y-2 animate-cascade-2">
      <div class="px-0.5">
        <h3 class="text-sm font-bold text-[#f1f0f5] tracking-tight">Savings Allocations</h3>
      </div>

      <div v-if="activeBuckets.length === 0" class="py-6 text-center text-xs text-[#9e9cae] border-y border-[#1f202e]">
        No active savings buckets configured. Go to Settings → Savings Buckets to add buckets.
      </div>

      <!-- Clean Hairline Grid Layout (No Heavy Cards) -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 border-y border-[#1f202e] divide-y sm:divide-y-0 divide-[#1f202e]">
        <div 
          v-for="(bucket, idx) in activeBuckets" 
          :key="bucket.id"
          @click="$emit('add-transaction', { bucketId: bucket.id, type: 'expense' })"
          class="flex items-center gap-2.5 p-3 hover:bg-[#141520] transition cursor-pointer active:bg-[#141520]"
          :class="[
            idx % 2 !== 0 ? 'border-l border-[#1f202e]' : '',
            idx >= 2 ? 'border-t border-[#1f202e]' : ''
          ]"
          title="Click to add transaction for this bucket"
        >
          <div class="w-7 h-7 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-sm leading-none" :style="{ color: bucket.color || '#D4BFFF' }">{{ resolveIcon(bucket.icon, 'savings') }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-[#f1f0f5] truncate leading-tight">{{ bucket.name }}</p>
            <p class="text-[11px] font-bold tabular-nums truncate mt-0.5 leading-tight" :class="Number(bucket.allocated_balance) >= 0 ? 'text-[#D4BFFF]' : 'text-[#FFD1B3]'">
              {{ currencySymbol }}{{ formatAmount(bucket.allocated_balance) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Current Month Expenses Breakdown (Staggered Entrance) -->
    <section class="space-y-3 pt-2 animate-cascade-3">
      <div class="border-b border-[#1f202e] pb-2 px-0.5">
        <h3 class="text-sm font-bold text-[#f1f0f5] tracking-tight">Expenses Breakdown ({{ currentMonthLabel }})</h3>
      </div>

      <div v-if="dashboardPiePaths.length === 0" class="py-8 text-center text-xs font-medium text-[#9e9cae]">
        No expense records found for this month.
      </div>

      <div v-else class="space-y-4 py-1">
        <!-- Donut Chart SVG -->
        <div class="flex items-center justify-center py-2">
          <div class="relative w-56 h-56 flex items-center justify-center shrink-0">
            <svg class="w-full h-full overflow-visible" viewBox="-30 -30 260 260">
              <defs>
                <!-- Smooth Ambient Radial Gradient Glow for Active Category -->
                <radialGradient v-if="activeHoveredCategoryInfo" id="dashboard-radial-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" :stop-color="activeHoveredCategoryInfo.color" stop-opacity="0.4" />
                  <stop offset="60%" :stop-color="activeHoveredCategoryInfo.color" stop-opacity="0.15" />
                  <stop offset="100%" :stop-color="activeHoveredCategoryInfo.color" stop-opacity="0" />
                </radialGradient>
              </defs>

              <!-- Ambient Breathing Radial Glow Aura for Active Category -->
              <circle
                v-if="activeHoveredCategoryInfo"
                cx="100"
                cy="100"
                r="90"
                fill="url(#dashboard-radial-glow)"
                class="animate-breathe-glow transition-all duration-700 pointer-events-none origin-[100px_100px]"
              />

              <!-- Floating Orbiting Sparkle Particles -->
              <g class="pointer-events-none">
                <g class="animate-orbit-1 origin-[100px_100px]">
                  <circle 
                    cx="222" cy="100" r="2.2" 
                    :fill="activeHoveredCategoryInfo ? activeHoveredCategoryInfo.color : '#D4BFFF'" 
                    class="particle-dot transition-colors duration-500 opacity-90"
                  />
                </g>
                <g class="animate-orbit-2 origin-[100px_100px]">
                  <circle 
                    cx="161" cy="205" r="1.8" 
                    :fill="activeHoveredCategoryInfo ? activeHoveredCategoryInfo.color : '#B3F5E1'" 
                    class="particle-dot transition-colors duration-500 opacity-90"
                    style="animation-delay: 0.5s;"
                  />
                </g>
                <g class="animate-orbit-3 origin-[100px_100px]">
                  <circle 
                    cx="39" cy="205" r="2.5" 
                    :fill="activeHoveredCategoryInfo ? activeHoveredCategoryInfo.color : '#FFD1B3'" 
                    class="particle-dot transition-colors duration-500 opacity-90"
                    style="animation-delay: 1s;"
                  />
                </g>
                <g class="animate-orbit-4 origin-[100px_100px]">
                  <circle 
                    cx="-22" cy="100" r="1.6" 
                    :fill="activeHoveredCategoryInfo ? activeHoveredCategoryInfo.color : '#c084fc'" 
                    class="particle-dot transition-colors duration-500 opacity-90"
                    style="animation-delay: 1.5s;"
                  />
                </g>
                <g class="animate-orbit-5 origin-[100px_100px]">
                  <circle 
                    cx="39" cy="-5" r="2.2" 
                    :fill="activeHoveredCategoryInfo ? activeHoveredCategoryInfo.color : '#38bdf8'" 
                    class="particle-dot transition-colors duration-500 opacity-90"
                    style="animation-delay: 2s;"
                  />
                </g>
                <g class="animate-orbit-6 origin-[100px_100px]">
                  <circle 
                    cx="161" cy="-5" r="1.8" 
                    :fill="activeHoveredCategoryInfo ? activeHoveredCategoryInfo.color : '#f472b6'" 
                    class="particle-dot transition-colors duration-500 opacity-90"
                    style="animation-delay: 2.5s;"
                  />
                </g>
              </g>

              <!-- Donut Slices Group with Smooth Orbit & Snap-to-Top Rotation -->
              <g 
                class="transition-transform duration-700 ease-out origin-[100px_100px]"
                :style="{
                  transformOrigin: '100px 100px',
                  transform: chartRotationTransform
                }"
              >
                <g
                  v-for="segment in dashboardPiePaths"
                  :key="segment.name"
                  class="cursor-pointer"
                  @mouseenter="hoveredCategoryIndex = segment.originalIndex"
                  @mouseleave="hoveredCategoryIndex = null"
                  @click="toggleSelectCategory(segment.originalIndex)"
                >
                  <path :d="segment.hitD" fill="transparent" />
                  <path
                    :d="segment.d"
                    :fill="segment.color"
                    class="transition-all duration-300 pointer-events-none"
                    :style="{
                      transformOrigin: '100px 100px',
                      transform: activeDashboardIndex === segment.originalIndex ? 'scale(1.07)' : 'scale(1)',
                      opacity: activeDashboardIndex === null || activeDashboardIndex === segment.originalIndex ? 1 : 0.35
                    }"
                  />
                </g>
              </g>
            </svg>

            <!-- Center Readout -->
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-3">
              <span class="text-[11px] font-semibold text-[#9e9cae] uppercase tracking-wider truncate max-w-[120px]">
                {{ activeHoveredCategoryInfo ? activeHoveredCategoryInfo.name : 'Total' }}
              </span>
              <div class="text-xl font-bold text-[#f1f0f5] tabular-nums tracking-tight mt-0.5">
                {{ currencySymbol }}{{ formatAmount(activeHoveredCategoryInfo ? activeHoveredCategoryInfo.amount : totalFilteredCategoryExpense) }}
              </div>
              <span v-if="activeHoveredCategoryInfo" class="text-[10px] font-semibold text-[#B3F5E1] mt-0.5">
                {{ activeHoveredCategoryInfo.percentage }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Hairline Divided Legend List -->
        <TransitionGroup 
          name="flip-list" 
          tag="div" 
          class="border-y border-[#1f202e] divide-y divide-[#1f202e]"
        >
          <div 
            v-for="item in activeDashboardLegendItems"
            :key="item.name"
            @mouseenter="hoveredCategoryIndex = item.originalIndex"
            @mouseleave="hoveredCategoryIndex = null"
            @click="toggleSelectCategory(item.originalIndex)"
            class="flex items-center justify-between py-2.5 px-1 transition cursor-pointer hover:bg-[#141520] active:bg-[#141520]"
            :class="activeDashboardIndex === item.originalIndex ? 'bg-[#141520]' : ''"
          >
            <!-- Left: Color Indicator Dot + Category Name -->
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: item.color }"></span>
              <span class="text-xs font-semibold text-[#f1f0f5] truncate">{{ item.name }}</span>
            </div>

            <!-- Right: Percentage + Amount -->
            <div class="flex items-center gap-4 shrink-0 tabular-nums">
              <span class="text-[11px] text-[#9e9cae] font-medium w-10 text-right">{{ item.percentage }}%</span>
              <span class="text-xs font-bold text-[#f1f0f5] text-right min-w-[70px]">
                {{ currencySymbol }}{{ formatAmount(item.amount) }}
              </span>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </section>

    <!-- 4. STORAGE ACCOUNTS BREAKDOWN (Staggered Entrance) -->
    <section data-tour="accounts-grid" class="space-y-2 pt-2 animate-cascade-4">
      <div class="flex justify-between items-center border-b border-[#1f202e] pb-2 px-0.5">
        <h3 class="text-sm font-bold text-[#f1f0f5] tracking-tight">Storage Accounts</h3>
        <span class="text-[10px] font-semibold text-[#9e9cae] uppercase tracking-wider">Real-time Balances</span>
      </div>

      <div v-if="physicalAccounts.length === 0" class="py-6 text-center text-xs text-[#9e9cae] border-y border-[#1f202e]">
        No storage accounts configured. Go to Settings → Storage Accounts to add accounts.
      </div>

      <!-- Hairline Divided Accounts List -->
      <div v-else class="border-y border-[#1f202e] divide-y divide-[#1f202e]">
        <button 
          v-for="acc in physicalAccounts" 
          :key="acc.id"
          type="button"
          @click="openAdjustModal(acc)"
          class="w-full text-left py-3 px-1 flex items-center justify-between gap-2 hover:bg-[#141520] transition cursor-pointer active:bg-[#141520]"
          title="Click to adjust balance for this account"
        >
          <div class="overflow-hidden min-w-0 flex-1">
            <p class="text-xs font-semibold text-[#f1f0f5] truncate leading-tight">{{ acc.name }}</p>
            <p class="text-xs font-bold tracking-tight tabular-nums truncate leading-tight mt-0.5" :class="Number(acc.balance) >= 0 ? 'text-[#B3F5E1]' : 'text-[#FFD1B3]'">
              {{ currencySymbol }}{{ formatAmount(acc.balance) }}
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-[#1f202e] text-[#9e9cae]">
              {{ acc.account_type || acc.type || 'ACCOUNT' }}
            </span>
            <span class="material-symbols-outlined text-sm text-[#D4BFFF]">tune</span>
          </div>
        </button>
      </div>
    </section>

    <!-- Account Adjustment Modal -->
    <AccountAdjustmentModal
      :is-open="isAdjustModalOpen"
      :account="selectedAccountForAdjust"
      :buckets="buckets"
      @close="isAdjustModalOpen = false"
      @save="handleAdjustmentSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { resolveIcon } from '../utils/iconResolver.js';
import { currencySymbol } from '../utils/currency.js';
import { sortAccountsByOrder } from '../utils/accountSorter.js';
import BlackHoleCanvas from './BlackHoleCanvas.vue';
import AccountAdjustmentModal from './AccountAdjustmentModal.vue';

const props = defineProps({
  transactions: {
    type: Array,
    default: () => []
  },
  accounts: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  buckets: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['add-transaction', 'refresh']);

const isAdjustModalOpen = ref(false);
const selectedAccountForAdjust = ref(null);

const openAdjustModal = (acc) => {
  selectedAccountForAdjust.value = acc;
  isAdjustModalOpen.value = true;
};

const handleAdjustmentSaved = () => {
  emit('refresh');
};

// Time-of-Day Sky Glow Tint & Black Hole Particle Color Palettes
const timeOfDayGlow = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    // Morning: Warm golden-rose
    return {
      primary: '#3b1c2b',
      secondary: '#2a1520'
    };
  } else if (hour >= 12 && hour < 18) {
    // Afternoon: Deep indigo-cyan
    return {
      primary: '#0e2438',
      secondary: '#0b1626'
    };
  } else {
    // Night: Deep obsidian lavender
    return {
      primary: '#241638',
      secondary: '#160d26'
    };
  }
});

const blackHoleColors = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    // Morning: Warm Golden Rose & Champagne
    return ['#FFD1B3', '#f472b6', '#fbbf24'];
  } else if (hour >= 12 && hour < 18) {
    // Afternoon: Crisp Sky Cyan & Electric Mint
    return ['#B3F5E1', '#38bdf8', '#818cf8'];
  } else {
    // Evening / Night: Deep Lavender & Cosmic Violet
    return ['#D4BFFF', '#c084fc', '#a78bfa'];
  }
});

// Metrics & Number Ticker Animations
const hideUnallocatedDashboard = ref(localStorage.getItem('cashbuddy_hide_unallocated_dashboard') === 'true');

const updateHideUnallocated = () => {
  hideUnallocatedDashboard.value = localStorage.getItem('cashbuddy_hide_unallocated_dashboard') === 'true';
};

const toggleHideUnallocatedDashboard = () => {
  hideUnallocatedDashboard.value = !hideUnallocatedDashboard.value;
  localStorage.setItem('cashbuddy_hide_unallocated_dashboard', String(hideUnallocatedDashboard.value));
  window.dispatchEvent(new CustomEvent('cashbuddy-settings-updated'));
};

const physicalAccounts = computed(() => {
  let list = props.accounts || [];
  if (hideUnallocatedDashboard.value) {
    list = list.filter(a => a.id !== 'acc_unallocated_funds');
  }
  return sortAccountsByOrder(list);
});

const currentMonthLabel = computed(() => {
  return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
});

const netWorth = computed(() => {
  return physicalAccounts.value.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
});

// Animated Ticker Values
const animatedNetWorth = ref(0);
const animatedIncome = ref(0);
const animatedExpenses = ref(0);

const currentMonthTransactions = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  return props.transactions.filter(t => {
    if (!t.date) return false;
    const parts = String(t.date).split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      return y === year && m === month;
    }
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
});

const filteredCategoryExpenses = computed(() => {
  const map = {};
  currentMonthTransactions.value.forEach(t => {
    if (t.account_id === 'acc_unallocated_funds') {
      const isSalaryAlloc = Boolean(t.bucket_id) && (t.transaction_type === 'income' || (t.description && t.description.includes('Salary Allocation')));
      if (!isSalaryAlloc) return;
    }
    const isAdjustment = t.transaction_type === 'adjustment' || t.category_id === 'cat_adjustments' || t.category?.name === 'Adjustments';
    if (isAdjustment && Number(t.include_in_chart) !== 1) return;

    if (t.transaction_type === 'expense' || (isAdjustment && t.adjustment_direction === 'subtract')) {
      const category = props.categories.find(c => c.id === t.category_id) || t.category;
      const bucket = props.buckets.find(b => b.id === t.bucket_id) || t.bucket;
      const catName = category ? category.name : (bucket ? bucket.name : (isAdjustment ? 'Adjustments' : 'Uncategorized'));
      const catColor = category?.color || bucket?.color || (isAdjustment ? '#a855f7' : '#ef4444');
      const catIcon = category?.icon || bucket?.icon || (isAdjustment ? 'tune' : 'category');
      const amt = Number(t.amount) || 0;
      if (!map[catName]) {
        map[catName] = { id: category?.id || bucket?.id || null, name: catName, color: catColor, icon: catIcon, total: 0 };
      }
      map[catName].total += amt;
    }
  });

  return Object.values(map).sort((a, b) => b.total - a.total);
});

const totalExpenses = computed(() => {
  return filteredCategoryExpenses.value.reduce((sum, c) => sum + c.total, 0);
});

const totalFilteredCategoryExpense = totalExpenses;

const filteredCategoryIncome = computed(() => {
  const map = {};
  currentMonthTransactions.value.forEach(t => {
    if (t.account_id === 'acc_unallocated_funds') {
      const isSalaryAlloc = Boolean(t.bucket_id) && (t.transaction_type === 'income' || (t.description && t.description.includes('Salary Allocation')));
      if (!isSalaryAlloc) return;
    }
    const isAdjustment = t.transaction_type === 'adjustment' || t.category_id === 'cat_adjustments' || t.category?.name === 'Adjustments';
    if (isAdjustment && Number(t.include_in_chart) !== 1) return;

    if (t.transaction_type === 'income' || (isAdjustment && t.adjustment_direction === 'add')) {
      const category = props.categories.find(c => c.id === t.category_id) || t.category;
      const bucket = props.buckets.find(b => b.id === t.bucket_id) || t.bucket;
      const catName = category ? category.name : (bucket ? bucket.name : (isAdjustment ? 'Adjustments' : 'Uncategorized'));
      const catColor = category?.color || bucket?.color || (isAdjustment ? '#a855f7' : '#10b981');
      const catIcon = category?.icon || bucket?.icon || (isAdjustment ? 'tune' : 'category');
      const amt = Number(t.amount) || 0;
      if (!map[catName]) {
        map[catName] = { id: category?.id || bucket?.id || null, name: catName, color: catColor, icon: catIcon, total: 0 };
      }
      map[catName].total += amt;
    }
  });

  return Object.values(map).sort((a, b) => b.total - a.total);
});

const totalIncome = computed(() => {
  return filteredCategoryIncome.value.reduce((sum, c) => sum + c.total, 0);
});

const animateNumberTicker = () => {
  const start = performance.now();
  const duration = 800;
  const targetNW = netWorth.value;
  const targetInc = totalIncome.value;
  const targetExp = totalExpenses.value;
  const initialNW = animatedNetWorth.value;
  const initialInc = animatedIncome.value;
  const initialExp = animatedExpenses.value;

  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    
    animatedNetWorth.value = initialNW + (targetNW - initialNW) * ease;
    animatedIncome.value = initialInc + (targetInc - initialInc) * ease;
    animatedExpenses.value = initialExp + (targetExp - initialExp) * ease;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

onMounted(() => {
  animateNumberTicker();
});

watch([netWorth, totalIncome, totalExpenses], () => {
  animateNumberTicker();
});

const activeBuckets = computed(() => props.buckets.filter(bucket => {
  if (bucket.is_archived || bucket.id === 'bucket_unassigned') return false;
  return Number.isFinite(Number(bucket.allocated_balance));
}));

const hoveredCategoryIndex = ref(null);
const selectedCategoryIndex = ref(null);

const activeDashboardIndex = computed(() => {
  return selectedCategoryIndex.value !== null ? selectedCategoryIndex.value : hoveredCategoryIndex.value;
});

const toggleSelectCategory = (idx) => {
  if (selectedCategoryIndex.value === idx) {
    selectedCategoryIndex.value = null;
    hoveredCategoryIndex.value = null;
  } else {
    selectedCategoryIndex.value = idx;
    hoveredCategoryIndex.value = idx;
  }
};

const activeHoveredCategoryInfo = computed(() => {
  const currentIdx = activeDashboardIndex.value;
  if (currentIdx !== null && dashboardPiePaths.value[currentIdx]) {
    return dashboardPiePaths.value[currentIdx];
  }
  return null;
});

const currentOrbitAngle = ref(0);
let animFrameId = null;
let lastTimestamp = 0;

const animateOrbit = (timestamp) => {
  if (activeDashboardIndex.value === null) {
    if (lastTimestamp) {
      const dt = timestamp - lastTimestamp;
      currentOrbitAngle.value = (currentOrbitAngle.value + dt * 0.0048) % 360;
    }
    lastTimestamp = timestamp;
    animFrameId = requestAnimationFrame(animateOrbit);
  } else {
    lastTimestamp = 0;
  }
};

onMounted(() => {
  animFrameId = requestAnimationFrame(animateOrbit);
  window.addEventListener('cashbuddy-settings-updated', updateHideUnallocated);
});

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  window.removeEventListener('cashbuddy-settings-updated', updateHideUnallocated);
});

watch(activeDashboardIndex, (newVal) => {
  if (newVal === null) {
    lastTimestamp = 0;
    animFrameId = requestAnimationFrame(animateOrbit);
  } else {
    if (animFrameId) cancelAnimationFrame(animFrameId);
  }
});

const chartRotationTransform = computed(() => {
  const currentIdx = activeDashboardIndex.value;
  if (currentIdx === null) {
    return `rotate(${currentOrbitAngle.value}deg)`;
  }
  const segment = dashboardPiePaths.value.find(s => s.originalIndex === currentIdx);
  if (!segment || segment.midAngle === undefined) return `rotate(${currentOrbitAngle.value}deg)`;
  
  const midAngleDeg = (segment.midAngle * 180) / Math.PI;
  const rawSnapRot = -90 - midAngleDeg;
  
  const baseOrbit = currentOrbitAngle.value;
  const k = Math.round((baseOrbit - rawSnapRot) / 360);
  const targetRot = rawSnapRot + k * 360;
  
  return `rotate(${targetRot}deg)`;
});

const dashboardPiePaths = computed(() => {
  const total = totalFilteredCategoryExpense.value;
  if (!total || filteredCategoryExpenses.value.length === 0) return [];

  const cx = 100;
  const cy = 100;
  const outerR = 103;
  const innerR = 89;
  const hitOuterR = 118;
  const hitInnerR = 74;

  let currentAngle = -Math.PI / 2;

  return filteredCategoryExpenses.value.map((item, idx) => {
    const fraction = item.total / total;
    const angleSpan = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    const midAngle = startAngle + angleSpan / 2;
    const percentage = Math.round((item.total / total) * 100);
    currentAngle = endAngle;

    const createArcPath = (oR, iR) => {
      const x1o = cx + oR * Math.cos(startAngle);
      const y1o = cy + oR * Math.sin(startAngle);
      const x2o = cx + oR * Math.cos(endAngle);
      const y2o = cy + oR * Math.sin(endAngle);

      const x1i = cx + iR * Math.cos(startAngle);
      const y1i = cy + iR * Math.sin(startAngle);
      const x2i = cx + iR * Math.cos(endAngle);
      const y2i = cy + iR * Math.sin(endAngle);

      const largeArc = angleSpan > Math.PI ? 1 : 0;

      return [
        `M ${x1o} ${y1o}`,
        `A ${oR} ${oR} 0 ${largeArc} 1 ${x2o} ${y2o}`,
        `L ${x2i} ${y2i}`,
        `A ${iR} ${iR} 0 ${largeArc} 0 ${x1i} ${y1i}`,
        'Z'
      ].join(' ');
    };

    return {
      ...item,
      amount: item.total,
      percentage,
      midAngle,
      d: createArcPath(outerR, innerR),
      hitD: createArcPath(hitOuterR, hitInnerR),
      originalIndex: idx
    };
  });
});

const activeDashboardLegendItems = computed(() => {
  return dashboardPiePaths.value;
});

const formatAmount = (val) => {
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>

<style scoped>
.flip-list-move,
.flip-list-enter-active,
.flip-list-leave-active {
  transition: transform 0.22s var(--ease-out), opacity 0.22s var(--ease-out);
}

@keyframes slowOrbit {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

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

.animate-slow-orbit {
  animation: slowOrbit 75s linear infinite;
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

@keyframes cascadeIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-cascade-1 { animation: cascadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0s both; }
.animate-cascade-2 { animation: cascadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.07s both; }
.animate-cascade-3 { animation: cascadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.14s both; }
.animate-cascade-4 { animation: cascadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.21s both; }

@keyframes arrowPulse {
  0%, 100% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.15) translate(1px, -1px); }
}

.animate-arrow-pulse {
  animation: arrowPulse 2.4s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%); }
  100% { transform: translateX(100%) translateY(100%); }
}

.animate-shimmer {
  animation: shimmer 3.5s infinite;
}

@keyframes bounceGentle {
  0%, 100% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.18) translate(1px, -1px); }
}

.animate-bounce-gentle {
  animation: bounceGentle 2.2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
}

@keyframes pulseSlow {
  0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.9; }
  50% { transform: scale(1.14) translate(-0.5px, 1px); opacity: 1; }
}

.animate-pulse-slow {
  animation: pulseSlow 2.8s ease-in-out infinite;
}
</style>
