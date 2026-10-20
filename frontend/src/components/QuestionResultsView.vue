<template>
  <div v-if="result" class="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 sm:items-center sm:p-4" @click.self="emit('close')">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-results-title"
      class="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-[#29293a] bg-[#14141d] shadow-2xl sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl"
    >
      <header class="flex items-start justify-between gap-4 border-b border-[#29293a] p-4 sm:p-5">
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wide text-[#9e9cae]">Cash Buddy answer</p>
          <h2 id="question-results-title" class="mt-1 text-lg font-bold text-[#f1f0f5]">Your question</h2>
          <p class="mt-1 break-words text-sm text-[#ccc3d8]">{{ result.question }}</p>
        </div>
        <button type="button" class="grid size-11 shrink-0 place-items-center rounded-xl text-[#ccc3d8] hover:bg-[#232332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4BFFF]" aria-label="Close answer" @click="emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        <template v-if="result.kind === 'finance'">
          <div v-if="hasMatches" class="space-y-4">
            <section class="rounded-2xl border border-[#FFD1B3]/20 bg-[#FFD1B3]/5 p-4">
              <p class="text-xs text-[#9e9cae]">Total spent</p>
              <p class="mt-2 break-words text-3xl font-bold tracking-tight text-[#FFD1B3] tabular-nums">{{ money(result.total) }}</p>
              <p class="mt-2 text-sm text-[#ccc3d8]">{{ result.transactionCount }} expense{{ result.transactionCount === 1 ? '' : 's' }} · {{ result.dateLabel }}</p>
            </section>

            <section class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-4">
              <h3 class="text-sm font-bold text-[#f1f0f5]">Matching activity</h3>
              <p v-if="isAllTime" class="mt-2 text-sm text-[#ccc3d8]">Matched from {{ date(result.firstDate) }} to {{ date(result.lastDate) }}.</p>
              <p v-else class="mt-2 text-sm text-[#ccc3d8]">Interpreted period: {{ result.dateLabel }}.</p>
              <p class="mt-2 text-sm text-[#9e9cae]">{{ result.activeDayCount }} active spending {{ result.activeDayCount === 1 ? 'day' : 'days' }}.</p>
            </section>

            <section v-if="showChart" class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-4">
              <div class="mb-4"><h3 class="text-sm font-bold text-[#f1f0f5]">{{ result.groupMode === 'requested' ? 'Requested items' : 'Spending categories' }}</h3><p class="mt-1 text-xs text-[#9e9cae]">Breakdown of the matching expenses</p></div>
              <div class="grid gap-5 sm:grid-cols-[9rem_1fr] sm:items-center">
                <div class="mx-auto size-36 rounded-full" :style="{ background: chartGradient }" role="img" :aria-label="chartLabel"></div>
                <ul class="space-y-2">
                  <li v-for="group in chartGroups" :key="group.id" class="flex items-start gap-2 text-sm text-[#ccc3d8]">
                    <span class="mt-1.5 size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: group.color }"></span>
                    <span class="min-w-0 flex-1 break-words">{{ group.name }}</span>
                    <span class="shrink-0 text-right font-semibold text-[#f1f0f5] tabular-nums">{{ money(group.total) }}<small class="ml-1 font-normal text-[#9e9cae]">{{ group.percent }}%</small></span>
                  </li>
                </ul>
              </div>
            </section>

            <p v-if="result.overlap" class="rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">Some requested items overlap, so the total counts each expense only once and no item chart is shown.</p>

            <details class="overflow-hidden rounded-2xl border border-[#1f202e] bg-[#0f1019]">
              <summary class="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-[#f1f0f5]">Daily totals <span class="text-xs font-normal text-[#9e9cae]">{{ result.activeDayCount }} active days</span></summary>
              <ul class="divide-y divide-[#1f202e] border-t border-[#1f202e]">
                <li v-for="day in result.dailyTotals" :key="day.date" class="flex items-center justify-between gap-3 px-4 py-3 text-sm"><span class="text-[#ccc3d8]">{{ date(day.date) }}</span><span class="font-semibold text-[#f1f0f5] tabular-nums">{{ money(day.total) }}</span></li>
              </ul>
            </details>
          </div>

          <section v-else class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-5 text-center">
            <span class="material-symbols-outlined text-3xl text-[#D4BFFF]">search_off</span>
            <h3 class="mt-3 text-base font-bold text-[#f1f0f5]">No matching expenses found</h3>
            <p class="mt-2 text-sm text-[#9e9cae]">No expenses matched the interpreted period: {{ result.dateLabel }}.</p>
          </section>
        </template>

        <section v-else-if="result.kind === 'help'" class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-5">
          <span class="material-symbols-outlined text-3xl text-[#B3F5E1]">help</span>
          <h3 class="mt-3 text-lg font-bold text-[#f1f0f5]">{{ result.title }}</h3>
          <p class="mt-2 whitespace-pre-line text-sm leading-6 text-[#ccc3d8]">{{ result.answer }}</p>
          <button type="button" class="mt-5 min-h-11 rounded-xl bg-[#D4BFFF] px-4 text-sm font-bold text-[#0f0f15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1f0f5]" @click="emit('open-help', result.destination)">Open FAQ &amp; Guides</button>
        </section>

        <section v-else class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-5">
          <span class="material-symbols-outlined text-3xl text-[#D4BFFF]">{{ result.kind === 'clarify' ? 'help' : 'tips_and_updates' }}</span>
          <h3 class="mt-3 text-lg font-bold text-[#f1f0f5]">{{ result.kind === 'clarify' ? 'A little more detail needed' : 'Try a supported question' }}</h3>
          <p class="mt-2 text-sm leading-6 text-[#ccc3d8]">{{ result.message }}</p>
          <div class="mt-5 rounded-xl border border-[#29293a] bg-[#141520] p-3"><p class="text-xs font-bold text-[#f1f0f5]">Examples</p><ul class="mt-2 space-y-1 text-sm text-[#9e9cae]"><li>How much did I spend on petrol?</li><li>How much did I spend last month?</li><li>How do I create another vault?</li></ul></div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatDateDDMMYYYY } from '../utils/dateUtils.js';

const props = defineProps({
  result: { type: Object, default: null },
  currencySymbol: { type: String, default: '' }
});
const emit = defineEmits(['close', 'open-help']);
const colors = ['#D4BFFF', '#B3F5E1', '#FFD1B3', '#9FCBFF', '#F9B7D0', '#F7E6A1'];

const hasMatches = computed(() => Number(props.result?.transactionCount) > 0);
const isAllTime = computed(() => props.result?.dateLabel === 'all time');
const rawGroups = computed(() => props.result?.groups || []);
const chartTotal = computed(() => rawGroups.value.reduce((sum, group) => sum + Math.max(0, Number(group.total) || 0), 0));
const chartGroups = computed(() => rawGroups.value.map((group, index) => ({
  ...group,
  color: group.color || colors[index % colors.length],
  percent: chartTotal.value ? ((Math.max(0, Number(group.total) || 0) / chartTotal.value) * 100).toFixed(0) : 0
})));
const showChart = computed(() => chartGroups.value.length >= 2 && !props.result?.overlap);
const chartGradient = computed(() => {
  let position = 0;
  const total = chartTotal.value;
  const stops = chartGroups.value.map((group) => {
    const end = position + (total ? Math.max(0, Number(group.total) || 0) / total * 100 : 100 / chartGroups.value.length);
    const stop = `${group.color} ${position}% ${end}%`;
    position = end;
    return stop;
  });
  return `conic-gradient(${stops.join(', ')})`;
});
const chartLabel = computed(() => chartGroups.value.map((group) => `${group.name}: ${money(group.total)}, ${group.percent}%`).join('. '));

function money(value) {
  return `${props.currencySymbol}${(Number(value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function date(value) {
  return formatDateDDMMYYYY(value) || 'Date unavailable';
}

</script>
