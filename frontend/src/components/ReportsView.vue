<template>
  <section class="space-y-5">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-lg font-bold tracking-tight text-[#f1f0f5]">Spending report</h2>
        <p class="mt-1 text-xs text-[#9e9cae]">Your data stays in this vault on this device.</p>
      </div>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Report date mode">
        <button type="button" class="min-h-11 rounded-xl border px-4 text-xs font-bold transition" :class="mode === 'month' ? 'border-[#D4BFFF] bg-[#D4BFFF] text-[#0f0f15]' : 'border-[#1f202e] bg-[#141520] text-[#9e9cae]'" @click="setMode('month')">Monthly</button>
        <button type="button" class="min-h-11 rounded-xl border px-4 text-xs font-bold transition" :class="mode === 'custom' ? 'border-[#D4BFFF] bg-[#D4BFFF] text-[#0f0f15]' : 'border-[#1f202e] bg-[#141520] text-[#9e9cae]'" @click="setMode('custom')">Custom range</button>
      </div>
    </header>

    <div class="grid gap-3 rounded-2xl border border-[#1f202e] bg-[#0f1019] p-4 sm:grid-cols-2 sm:items-end">
      <div v-if="mode === 'month'" class="relative">
        <span class="block text-xs font-semibold text-[#ccc3d8]">Report month</span>
        <button type="button" class="mt-2 flex min-h-11 w-full items-center justify-between rounded-xl border border-[#29293a] bg-[#191924] px-3 text-left text-sm text-[#f1f0f5]" :aria-expanded="monthPickerTarget === 'report'" @click="toggleMonthPicker('report', selectedMonth)"><span>{{ selectedMonthLabel }}</span><span class="material-symbols-outlined text-[#D4BFFF]">calendar_month</span></button>
        <div v-if="monthPickerTarget === 'report'" class="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-[#29293a] bg-[#141520] p-3 shadow-xl">
          <div class="mb-3 flex items-center justify-between border-b border-[#1f202e] pb-2"><button type="button" class="grid size-9 place-items-center rounded-lg border border-[#1f202e] bg-[#0c0d14] text-[#f1f0f5]" aria-label="Previous year" @click="pickerYear--"><span class="material-symbols-outlined">chevron_left</span></button><span class="text-sm font-bold text-[#D4BFFF]">{{ pickerYear }}</span><button type="button" class="grid size-9 place-items-center rounded-lg border border-[#1f202e] bg-[#0c0d14] text-[#f1f0f5]" aria-label="Next year" @click="pickerYear++"><span class="material-symbols-outlined">chevron_right</span></button></div>
          <div class="grid grid-cols-4 gap-2"><button v-for="(month, index) in monthNames" :key="month" type="button" class="min-h-11 rounded-lg border text-xs font-bold" :class="selectedMonth === `${pickerYear}-${String(index + 1).padStart(2, '0')}` ? 'border-[#D4BFFF] bg-[#D4BFFF] text-[#0f0f15]' : 'border-[#1f202e] bg-[#0c0d14] text-[#f1f0f5]'" @click="selectMonth('report', index)">{{ month }}</button></div>
        </div>
      </div>
      <div v-if="mode === 'month'" class="relative">
        <span class="block text-xs font-semibold text-[#ccc3d8]">Compare with</span>
        <button type="button" class="mt-2 flex min-h-11 w-full items-center justify-between rounded-xl border border-[#29293a] bg-[#191924] px-3 text-left text-sm text-[#f1f0f5]" :aria-expanded="monthPickerTarget === 'compare'" @click="toggleMonthPicker('compare', compareMonth)"><span>{{ compareMonthLabel }}</span><span class="material-symbols-outlined text-[#D4BFFF]">calendar_month</span></button>
        <div v-if="monthPickerTarget === 'compare'" class="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-[#29293a] bg-[#141520] p-3 shadow-xl">
          <div class="mb-3 flex items-center justify-between border-b border-[#1f202e] pb-2"><button type="button" class="grid size-9 place-items-center rounded-lg border border-[#1f202e] bg-[#0c0d14] text-[#f1f0f5]" aria-label="Previous year" @click="pickerYear--"><span class="material-symbols-outlined">chevron_left</span></button><span class="text-sm font-bold text-[#D4BFFF]">{{ pickerYear }}</span><button type="button" class="grid size-9 place-items-center rounded-lg border border-[#1f202e] bg-[#0c0d14] text-[#f1f0f5]" aria-label="Next year" @click="pickerYear++"><span class="material-symbols-outlined">chevron_right</span></button></div>
          <div class="grid grid-cols-4 gap-2"><button v-for="(month, index) in monthNames" :key="month" type="button" class="min-h-11 rounded-lg border text-xs font-bold" :class="compareMonth === `${pickerYear}-${String(index + 1).padStart(2, '0')}` ? 'border-[#D4BFFF] bg-[#D4BFFF] text-[#0f0f15]' : 'border-[#1f202e] bg-[#0c0d14] text-[#f1f0f5]'" @click="selectMonth('compare', index)">{{ month }}</button></div>
        </div>
      </div>
      <template v-else>
        <label class="block text-xs font-semibold text-[#ccc3d8]">From<input v-model="customStart" type="date" class="mt-2 min-h-11 w-full rounded-xl border border-[#29293a] bg-[#191924] px-3 text-sm text-[#f1f0f5] accent-[#D4BFFF]" /></label>
        <label class="block text-xs font-semibold text-[#ccc3d8]">To<input v-model="customEnd" type="date" class="mt-2 min-h-11 w-full rounded-xl border border-[#29293a] bg-[#191924] px-3 text-sm text-[#f1f0f5] accent-[#D4BFFF]" /></label>
      </template>
      <p v-if="mode === 'month'" class="text-xs text-[#9e9cae] sm:col-span-2">{{ isDefaultComparison ? `Previous month’s report: ${selectedMonthLabel} compared with ${compareMonthLabel}.` : `${selectedMonthLabel} compared with ${compareMonthLabel}.` }}</p>
      <p v-else class="text-xs text-[#9e9cae] sm:pb-3">Custom reports show the selected range without a comparison.</p>
    </div>

    <details class="overflow-hidden rounded-2xl border border-[#1f202e] bg-[#0f1019]">
      <summary class="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-[#f1f0f5]">
        <span>Report filters <span v-if="excludedCount" class="ml-1 text-[#D4BFFF]">({{ excludedCount }} excluded)</span></span>
        <span class="material-symbols-outlined text-[#9e9cae]">tune</span>
      </summary>
      <div class="grid gap-4 border-t border-[#1f202e] p-4 sm:grid-cols-2">
        <fieldset class="space-y-2">
          <legend class="mb-2 text-xs font-bold text-[#D4BFFF]">Exclude spending categories</legend>
          <label class="flex min-h-11 items-center gap-3 rounded-xl bg-[#141520] px-3 text-sm text-[#f1f0f5]"><input v-model="excludedCategories" type="checkbox" value="__uncategorized__" class="size-4 accent-[#D4BFFF]" @change="saveExclusions" />Uncategorized</label>
          <label v-for="category in categories" :key="category.id" class="flex min-h-11 items-center gap-3 rounded-xl bg-[#141520] px-3 text-sm text-[#f1f0f5]"><input v-model="excludedCategories" type="checkbox" :value="category.id" class="size-4 accent-[#D4BFFF]" @change="saveExclusions" /><span class="size-2.5 rounded-full" :style="{ backgroundColor: category.color || '#9e9cae' }"></span><span class="min-w-0 flex-1 truncate">{{ category.name }}</span></label>
        </fieldset>
        <fieldset class="space-y-2">
          <legend class="mb-2 text-xs font-bold text-[#D4BFFF]">Exclude savings buckets</legend>
          <label class="flex min-h-11 items-center gap-3 rounded-xl bg-[#141520] px-3 text-sm text-[#f1f0f5]"><input v-model="excludedBuckets" type="checkbox" value="__unassigned__" class="size-4 accent-[#D4BFFF]" @change="saveExclusions" />Unassigned bucket</label>
          <label v-for="bucket in buckets" :key="bucket.id" class="flex min-h-11 items-center gap-3 rounded-xl bg-[#141520] px-3 text-sm text-[#f1f0f5]"><input v-model="excludedBuckets" type="checkbox" :value="bucket.id" class="size-4 accent-[#D4BFFF]" @change="saveExclusions" /><span class="size-2.5 rounded-full" :style="{ backgroundColor: bucket.color || '#9e9cae' }"></span><span class="min-w-0 flex-1 truncate">{{ bucket.name }}</span></label>
        </fieldset>
        <button type="button" class="min-h-11 justify-self-start rounded-xl border border-[#29293a] bg-[#141520] px-4 text-xs font-bold text-[#D4BFFF]" @click="clearFilters">Clear filters</button>
        <p class="self-center text-xs text-[#9e9cae]">Saved for this vault and used across report periods.</p>
      </div>
    </details>

    <div v-if="rangeError" class="rounded-xl border border-rose-400/30 bg-rose-950/30 p-4 text-sm text-rose-200">{{ mode === 'month' ? 'Choose two different months to compare.' : 'Choose a valid start and end date.' }}</div>
    <div v-else-if="error" class="rounded-xl border border-rose-400/30 bg-rose-950/30 p-4 text-sm text-rose-200">{{ error }}</div>
    <div v-else-if="loading" class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-8 text-center text-sm text-[#9e9cae]" aria-live="polite">Loading report…</div>
    <template v-else>
      <div class="grid gap-3 sm:grid-cols-3">
        <article class="rounded-2xl border border-[#FFD1B3]/20 bg-[#FFD1B3]/5 p-4">
          <p class="text-xs text-[#9e9cae]">Total spent</p>
          <p class="mt-2 break-words text-2xl font-bold tracking-tight text-[#FFD1B3] tabular-nums">{{ currencySymbol }}{{ formatAmount(report.totalSpent) }}</p>
          <p class="mt-1 text-xs text-[#9e9cae]">{{ report.expenseCount }} expense{{ report.expenseCount === 1 ? '' : 's' }}</p>
          <p v-if="mode === 'month'" class="mt-2 text-xs" :class="deltaClass(report.totalSpent - previousReport.totalSpent)">{{ deltaText(report.totalSpent, previousReport.totalSpent) }} vs {{ compareMonthLabel }}</p>
        </article>
        <article class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-4">
          <p class="text-xs text-[#9e9cae]">Most spent on</p>
          <p class="mt-2 truncate text-lg font-bold text-[#f1f0f5]">{{ report.topCategory?.name || 'No category spending' }}</p>
          <p v-if="report.topCategory" class="mt-1 text-sm text-[#FFD1B3] tabular-nums">{{ currencySymbol }}{{ formatAmount(report.topCategory.amount) }}</p>
          <p v-else class="mt-1 text-xs text-[#9e9cae]">No expenses in this period</p>
        </article>
        <article class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-4">
          <p class="text-xs text-[#9e9cae]">Spending categories</p>
          <p class="mt-2 text-sm font-bold text-[#f1f0f5]">Most transactions: <span class="text-[#D4BFFF]">{{ report.mostFrequentCategory?.name || '—' }}</span></p>
          <p class="mt-1 text-xs text-[#9e9cae]">{{ report.mostFrequentCategory ? `${report.mostFrequentCategory.count} expense transactions` : 'No expense transactions' }}</p>
          <p class="mt-2 text-sm font-bold text-[#f1f0f5]">Highest total: <span class="text-[#D4BFFF]">{{ report.largestCategory?.name || '—' }}</span></p>
          <p v-if="report.largestCategory" class="mt-1 text-xs text-[#FFD1B3] tabular-nums">{{ currencySymbol }}{{ formatAmount(report.largestCategory.amount) }}</p>
        </article>
      </div>

      <section class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-4 sm:p-5">
        <div class="mb-4 flex items-center justify-between gap-3"><div><h3 class="text-sm font-bold text-[#f1f0f5]">Spending categories</h3><p class="mt-1 text-xs text-[#9e9cae]">Expenses grouped by category</p></div><span class="material-symbols-outlined text-[#D4BFFF]">category</span></div>
        <div v-if="categoryRows.length" class="space-y-3">
          <button v-for="item in categoryRows" :key="item.id" type="button" class="min-h-11 w-full space-y-1.5 rounded-lg p-2 text-left transition hover:bg-[#191924] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4BFFF]" :aria-label="`View ${item.name} transactions and spending statistics`" @click="openDrilldown('category', item)">
            <span class="flex min-h-7 items-start justify-between gap-3 text-xs"><span class="min-w-0 truncate text-[#f1f0f5]">{{ item.name }} <small class="text-[#9e9cae]">· {{ item.count }}</small></span><span class="shrink-0 text-right font-bold text-[#f1f0f5] tabular-nums">{{ currencySymbol }}{{ formatAmount(item.amount) }}<small v-if="mode === 'month'" class="ml-2 font-medium" :class="deltaClass(item.amount - item.previousAmount)">{{ compactDelta(item.amount, item.previousAmount) }}</small></span></span>
            <span class="block h-1.5 overflow-hidden rounded-full bg-[#191924]"><span class="block h-full rounded-full bg-[#D4BFFF]" :style="{ width: barWidth(item.amount, report.totalSpent) }"></span></span>
          </button>
        </div>
        <p v-else class="py-5 text-center text-sm text-[#9e9cae]">No spending categories in this period.</p>
      </section>

      <section class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-4 sm:p-5">
        <div class="mb-4 flex items-center justify-between gap-3"><div><h3 class="text-sm font-bold text-[#f1f0f5]">Savings buckets</h3><p class="mt-1 text-xs text-[#9e9cae]">Spending assigned to each bucket; allocations and transfers are excluded</p></div><span class="material-symbols-outlined text-[#D4BFFF]">savings</span></div>
        <div v-if="bucketRows.length" class="space-y-3">
          <button v-for="item in bucketRows" :key="item.id" type="button" class="min-h-11 w-full space-y-1.5 rounded-lg p-2 text-left transition hover:bg-[#191924] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4BFFF]" :aria-label="`View ${item.name} bucket transactions and spending statistics`" @click="openDrilldown('bucket', item)">
            <span class="flex min-h-7 items-start justify-between gap-3 text-xs"><span class="min-w-0 truncate text-[#f1f0f5]">{{ item.name }}</span><span class="shrink-0 text-right font-bold text-[#f1f0f5] tabular-nums">{{ currencySymbol }}{{ formatAmount(item.amount) }}<small v-if="mode === 'month'" class="ml-2 font-medium" :class="deltaClass(item.amount - item.previousAmount)">{{ compactDelta(item.amount, item.previousAmount) }}</small></span></span>
            <span class="block h-1.5 overflow-hidden rounded-full bg-[#191924]"><span class="block h-full rounded-full bg-[#B3F5E1]" :style="{ width: barWidth(item.amount, report.totalSpent) }"></span></span>
          </button>
        </div>
        <p v-else class="py-5 text-center text-sm text-[#9e9cae]">No bucket-assigned spending in this period.</p>
      </section>

    </template>

    <div v-if="selectedDrilldown" class="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" @click.self="selectedDrilldown = null">
      <section role="dialog" aria-modal="true" :aria-label="`${selectedDrilldown.name} report details`" class="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-[#29293a] bg-[#14141d] sm:max-w-2xl sm:rounded-2xl">
        <header class="flex items-start justify-between gap-4 border-b border-[#29293a] p-4 sm:p-5">
          <div class="min-w-0"><p class="text-xs font-semibold uppercase tracking-wide text-[#9e9cae]">{{ selectedDrilldown.kind === 'category' ? 'Spending category' : 'Savings bucket' }}</p><h3 class="mt-1 truncate text-lg font-bold text-[#f1f0f5]">{{ selectedDrilldown.name }}</h3><p class="mt-1 text-xs text-[#9e9cae]">{{ mode === 'month' ? selectedMonthLabel : `${customStart} to ${customEnd}` }}</p></div>
          <button type="button" class="grid size-11 shrink-0 place-items-center rounded-xl text-[#ccc3d8] hover:bg-[#232332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4BFFF]" aria-label="Close details" @click="selectedDrilldown = null"><span class="material-symbols-outlined">close</span></button>
        </header>
        <div class="grid grid-cols-3 gap-2 p-4 sm:gap-3 sm:p-5">
          <article v-for="stat in drilldownStats" :key="stat.label" class="min-w-0 rounded-xl border border-[#29293a] bg-[#0f1019] p-3"><p class="text-[11px] text-[#9e9cae]">{{ stat.label }}</p><p class="mt-1 truncate text-sm font-bold text-[#FFD1B3] tabular-nums">{{ stat.value === null ? '—' : `${currencySymbol}${formatAmount(stat.value)}` }}</p></article>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5">
          <h4 class="mb-2 text-sm font-bold text-[#f1f0f5]">Transactions <span class="font-normal text-[#9e9cae]">({{ drilldownTransactions.length }})</span></h4>
          <div v-if="drilldownTransactions.length" class="divide-y divide-[#29293a] rounded-xl border border-[#29293a]">
            <article v-for="tx in drilldownTransactions" :key="tx.id" class="flex items-start justify-between gap-3 p-3"><div class="min-w-0"><p class="truncate text-sm font-medium text-[#f1f0f5]">{{ tx.description || selectedDrilldown.name }}</p><p class="mt-1 text-xs text-[#9e9cae]">{{ formatTransactionDate(tx.date) }}<span v-if="selectedDrilldown.kind === 'bucket' && tx.category?.name"> · {{ tx.category.name }}</span></p></div><p class="shrink-0 text-sm font-semibold text-[#FFD1B3] tabular-nums">{{ currencySymbol }}{{ formatAmount(tx.amount) }}</p></article>
          </div>
          <p v-else class="rounded-xl border border-[#29293a] p-6 text-center text-sm text-[#9e9cae]">No matching expense transactions in this period.</p>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { api } from '../services/api.js';
import { currencySymbol } from '../utils/currency.js';

const props = defineProps({
  categories: { type: Array, default: () => [] },
  buckets: { type: Array, default: () => [] },
  activeVault: { type: String, default: '' }
});

const SETTING_KEY = 'report_exclusions';
const LEGACY_SETTING_KEY = 'report_exclusions_by_month';
const mode = ref('month');
const currentMonthKey = monthKey(new Date());
const defaultMonthKey = shiftMonth(currentMonthKey, -1);
const defaultCompareMonthKey = shiftMonth(defaultMonthKey, -1);
const selectedMonth = ref(defaultMonthKey);
const compareMonth = ref(defaultCompareMonthKey);
const monthPickerTarget = ref(null);
const pickerYear = ref(Number(selectedMonth.value.slice(0, 4)));
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const today = localDate(new Date());
const customStart = ref(today.slice(0, 8) + '01');
const customEnd = ref(today);
const excludedCategories = ref([]);
const excludedBuckets = ref([]);
const exclusionStore = ref({});
let exclusionsLoadedForVault = null;
const selectedDrilldown = ref(null);
const rangeTransactions = ref([]);
const loading = ref(true);
const error = ref('');

const rangeError = computed(() => mode.value === 'month'
  ? (!/^\d{4}-\d{2}$/.test(selectedMonth.value) || !/^\d{4}-\d{2}$/.test(compareMonth.value) || selectedMonth.value === compareMonth.value)
  : (!customStart.value || !customEnd.value || customStart.value > customEnd.value));
const selectedMonthLabel = computed(() => monthLabel(selectedMonth.value));
const compareMonthLabel = computed(() => monthLabel(compareMonth.value));
const isDefaultComparison = computed(() => selectedMonth.value === defaultMonthKey && compareMonth.value === defaultCompareMonthKey);
const excludedCount = computed(() => excludedCategories.value.length + excludedBuckets.value.length);


function toggleMonthPicker(target, value) {
  if (monthPickerTarget.value === target) {
    monthPickerTarget.value = null;
    return;
  }
  pickerYear.value = Number(value.slice(0, 4));
  monthPickerTarget.value = target;
}

function selectMonth(target, index) {
  const key = `${pickerYear.value}-${String(index + 1).padStart(2, '0')}`;
  if (target === 'report') selectedMonth.value = key;
  else compareMonth.value = key;
  monthPickerTarget.value = null;
}

function closeDrilldown() {
  if (!selectedDrilldown.value) return false;
  selectedDrilldown.value = null;
  return true;
}

defineExpose({ closeDrilldown });

function localDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(key, delta) {
  const [year, month] = String(key || '').split('-').map(Number);
  return monthKey(new Date(year, month - 1 + delta, 1));
}

function monthLabel(key) {
  if (!key) return '';
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function monthBounds(key) {
  const [year, month] = key.split('-').map(Number);
  return { start: localDate(new Date(year, month - 1, 1)), end: localDate(new Date(year, month, 0)) };
}

function parseSetting(raw) {
  try {
    const value = JSON.parse(raw || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

async function loadExclusions() {
  const vault = props.activeVault;
  if (exclusionsLoadedForVault === vault) return;
  const stored = await api.getAppSetting(SETTING_KEY, '');
  let setting = parseSetting(stored);
  if (!stored) {
    const legacy = parseSetting(await api.getAppSetting(LEGACY_SETTING_KEY, '{}'));
    setting = legacy[selectedMonth.value] || legacy[defaultMonthKey] || {};
  }
  if (vault !== props.activeVault) return;
  exclusionStore.value = setting;
  excludedCategories.value = Array.isArray(setting.categories) ? setting.categories : [];
  excludedBuckets.value = Array.isArray(setting.buckets) ? setting.buckets : [];
  exclusionsLoadedForVault = vault;
}

async function saveExclusions() {
  exclusionStore.value = { categories: [...excludedCategories.value], buckets: [...excludedBuckets.value] };
  try {
    await api.updateAppSetting(SETTING_KEY, JSON.stringify(exclusionStore.value));
  } catch (err) {
    error.value = err?.message || 'Could not save report filters.';
  }
}

function clearFilters() {
  excludedCategories.value = [];
  excludedBuckets.value = [];
  saveExclusions();
}

function setMode(value) {
  mode.value = value;
  monthPickerTarget.value = null;
  error.value = '';
}

function isInternal(tx) {
  const description = String(tx.description || '').trim().toLowerCase();
  return tx.transaction_type === 'transfer'
    || tx.transaction_type === 'adjustment'
    || tx.account_id === 'acc_unallocated_funds'
    || description.startsWith('salary allocation');
}

function isExcluded(tx) {
  const categoryId = tx.category_id || '__uncategorized__';
  const bucketId = tx.bucket_id || '__unassigned__';
  return excludedCategories.value.includes(categoryId) || excludedBuckets.value.includes(bucketId);
}

function buildReport(rows) {
  const expenses = rows.filter(tx => tx.transaction_type === 'expense');
  const categoriesMap = new Map();
  const bucketsMap = new Map();

  for (const tx of expenses) {
    const amount = Number(tx.amount) || 0;
    const categoryId = tx.category_id || '__uncategorized__';
    const categoryName = tx.category?.name || 'Uncategorized';
    const categoryColor = tx.category?.color || '#9e9cae';
    const category = categoriesMap.get(categoryId) || { id: categoryId, name: categoryName, color: categoryColor, amount: 0, count: 0 };
    category.amount += amount;
    category.count += 1;
    categoriesMap.set(categoryId, category);

    const bucketId = tx.bucket_id || '__unassigned__';
    const bucket = bucketsMap.get(bucketId) || { id: bucketId, name: tx.bucket?.name || 'Unassigned', color: tx.bucket?.color || '#9e9cae', amount: 0 };
    bucket.amount += amount;
    bucketsMap.set(bucketId, bucket);
  }

  const categoryAmounts = Object.fromEntries([...categoriesMap].map(([id, item]) => [id, item.amount]));
  const bucketAmounts = Object.fromEntries([...bucketsMap].map(([id, item]) => [id, item.amount]));
  const totalSpent = expenses.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const categories = [...categoriesMap.values()].sort((a, b) => b.amount - a.amount);
  return {
    totalSpent,
    expenseCount: expenses.length,
    categories,
    buckets: [...bucketsMap.values()].sort((a, b) => b.amount - a.amount),
    categoryAmounts,
    bucketAmounts,
    topCategory: categories[0] || null,
    mostFrequentCategory: [...categories].sort((a, b) => b.count - a.count)[0] || null,
    largestCategory: categories[0] || null
  };
}

const periodRows = computed(() => {
  const validRows = rangeTransactions.value.filter(tx => !isInternal(tx) && !isExcluded(tx));
  return mode.value === 'month'
    ? validRows.filter(tx => String(tx.date || '').startsWith(selectedMonth.value))
    : validRows;
});

const previousRows = computed(() => rangeTransactions.value.filter(tx =>
  String(tx.date || '').startsWith(compareMonth.value) && !isInternal(tx) && !isExcluded(tx)
));
const report = computed(() => buildReport(periodRows.value));
const previousReport = computed(() => buildReport(previousRows.value));

function combinePeriods(current, previous) {
  const previousById = new Map(previous.map(item => [item.id, item]));
  const rows = current.map(item => ({ ...item, previousAmount: previousById.get(item.id)?.amount || 0 }));
  const currentIds = new Set(current.map(item => item.id));
  for (const item of previous) {
    if (!currentIds.has(item.id)) rows.push({ ...item, amount: 0, count: 0, previousAmount: item.amount });
  }
  return rows.sort((a, b) => b.amount - a.amount || b.previousAmount - a.previousAmount);
}

const categoryRows = computed(() => combinePeriods(report.value.categories, mode.value === 'month' ? previousReport.value.categories : []));
const bucketRows = computed(() => combinePeriods(report.value.buckets, mode.value === 'month' ? previousReport.value.buckets : []));

function deltaText(current, previous) {
  const delta = current - previous;
  if (!previous && current) return `Up ${currencySymbol.value}${formatAmount(current)} (new spending)`;
  if (!previous) return 'No spend in either month';
  return `${delta > 0 ? 'Up' : delta < 0 ? 'Down' : 'Unchanged'} ${currencySymbol.value}${formatAmount(Math.abs(delta))} (${Math.abs((delta / previous) * 100).toFixed(0)}%)`;
}

function compactDelta(current, previous) {
  if (!previous && !current) return '—';
  if (!previous) return `↑ ${currencySymbol.value}${formatAmount(current)}`;
  const delta = current - previous;
  if (!delta) return '—';
  return `${delta > 0 ? '↑' : '↓'} ${currencySymbol.value}${formatAmount(Math.abs(delta))}`;
}

function deltaClass(delta) {
  return delta > 0 ? 'text-[#FFD1B3]' : delta < 0 ? 'text-[#B3F5E1]' : 'text-[#9e9cae]';
}

function barWidth(amount, total) {
  return `${total > 0 ? Math.max(2, Math.min(100, (amount / total) * 100)) : 0}%`;
}

function openDrilldown(kind, item) {
  selectedDrilldown.value = { kind, id: item.id, name: item.name };
}

const drilldownTransactions = computed(() => {
  const selected = selectedDrilldown.value;
  if (!selected) return [];
  return periodRows.value.filter(tx => tx.transaction_type === 'expense' && (selected.kind === 'category'
    ? (tx.category_id || '__uncategorized__') === selected.id
    : (tx.bucket_id || '__unassigned__') === selected.id))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
});

const drilldownStats = computed(() => {
  const amounts = drilldownTransactions.value.map(tx => Number(tx.amount) || 0);
  if (!amounts.length) return [
    { label: 'Average per transaction', value: null },
    { label: 'Highest transaction', value: null },
    { label: 'Lowest transaction', value: null }
  ];
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  return [
    { label: 'Average per transaction', value: total / amounts.length },
    { label: 'Highest transaction', value: Math.max(...amounts) },
    { label: 'Lowest transaction', value: Math.min(...amounts) }
  ];
});

function formatTransactionDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatAmount(value) {
  return (Number(value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

let loadSequence = 0;
async function loadReport() {
  const sequence = ++loadSequence;
  error.value = '';
  if (rangeError.value) {
    loading.value = false;
    rangeTransactions.value = [];
    return;
  }
  loading.value = true;
  try {
    if (mode.value === 'month') {
      await loadExclusions();
      if (sequence !== loadSequence) return;
      const current = monthBounds(selectedMonth.value);
      const comparison = monthBounds(compareMonth.value);
      const start = current.start < comparison.start ? current.start : comparison.start;
      const end = current.end > comparison.end ? current.end : comparison.end;
      const rows = await api.getTransactions({ start_date: start, end_date: end });
      if (sequence === loadSequence) rangeTransactions.value = rows;
    } else {
      await loadExclusions();
      if (sequence !== loadSequence) return;
      const rows = await api.getTransactions({ start_date: customStart.value, end_date: customEnd.value });
      if (sequence === loadSequence) rangeTransactions.value = rows;
    }
  } catch (err) {
    if (sequence === loadSequence) error.value = err?.message || 'Could not load this report.';
  } finally {
    if (sequence === loadSequence) loading.value = false;
  }
}

watch([mode, selectedMonth, compareMonth, customStart, customEnd, () => props.activeVault], loadReport, { immediate: true });
</script>
