<template>
  <Teleport to="body">
  <div v-if="result" class="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 sm:items-center sm:p-4" @click.self="emit('close')">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-results-title"
      class="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-[#29293a] bg-[#14141d] shadow-2xl sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl"
    >
      <header class="shrink-0 border-b border-[#29293a] p-4 pt-[max(3.25rem,calc(env(safe-area-inset-top)+1.5rem))] sm:p-5">
        <button type="button" class="mb-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#393747] bg-[#0f1019] px-3 text-sm font-semibold text-[#f1f0f5] hover:border-[#D4BFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4BFFF]" aria-label="Back to questions" @click="emit('close')">
          <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>Back to questions
        </button>
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wide text-[#9e9cae]">Cash Buddy answer</p>
          <h2 id="question-results-title" class="mt-1 text-lg font-bold text-[#f1f0f5]">Your question</h2>
          <p class="mt-1 break-words text-sm text-[#ccc3d8]">{{ result.question }}</p>
        </div>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-5">
        <section v-if="result.kind === 'finance' || result.dailyBudget" class="mb-4 space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" class="inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl border border-[#29293a] bg-[#0f1019] px-3 text-xs font-semibold text-[#ccc3d8] hover:border-[#D4BFFF]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4BFFF]" :aria-expanded="showBucketPicker" @click="showBucketPicker = !showBucketPicker; showDatePicker = false">
              <span v-if="result.dailyBudget && result.dailyBudgetSource === 'net_worth'" class="material-symbols-outlined text-base text-[#D4BFFF]">account_balance</span>
              <span v-else-if="selectedBucketGroups.length" class="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5"><span v-for="(bucket, index) in selectedBucketGroups" :key="bucket.id" class="inline-flex items-center gap-1 font-semibold" :style="{ color: bucket.color || '#D4BFFF' }"><span class="material-symbols-outlined text-base">{{ resolveIcon(bucket.icon, 'savings') }}</span>{{ bucket.name }}<span v-if="index < selectedBucketGroups.length - 1" class="text-[#9e9cae]">,</span></span></span>
              <span v-else class="truncate">{{ bucketFilterLabel }}</span>
              <span class="material-symbols-outlined text-base">{{ showBucketPicker ? 'expand_less' : 'expand_more' }}</span>
            </button>
            <button v-if="!result.dailyBudget" type="button" class="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#29293a] bg-[#0f1019] px-3 text-xs font-semibold text-[#ccc3d8] hover:border-[#D4BFFF]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4BFFF]" :aria-expanded="showDatePicker" @click="showDatePicker = !showDatePicker; showBucketPicker = false">
              <span class="material-symbols-outlined text-base text-[#D4BFFF]">calendar_month</span>{{ dateFilterLabel }}<span class="material-symbols-outlined text-base">{{ showDatePicker ? 'expand_less' : 'expand_more' }}</span>
            </button>
            <button v-else type="button" class="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#29293a] bg-[#0f1019] px-3 text-xs font-semibold text-[#ccc3d8] hover:border-[#D4BFFF]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4BFFF]" :aria-expanded="showDatePicker" @click="showDatePicker = !showDatePicker; showBucketPicker = false">
              <span class="material-symbols-outlined text-base text-[#D4BFFF]">calendar_month</span>Through {{ shortDate(budgetEndDate) }}<span class="material-symbols-outlined text-base">{{ showDatePicker ? 'expand_less' : 'expand_more' }}</span>
            </button>
          </div>

          <div v-if="showBucketPicker" class="rounded-xl border border-[#29293a] bg-[#0f1019] p-3">
            <div class="mb-2 flex items-center justify-between gap-2"><div><h3 class="text-sm font-bold text-[#f1f0f5]">Choose buckets</h3><p class="text-xs text-[#9e9cae]">{{ result.dailyBudget ? 'Select balances to calculate from; clear all to use net worth.' : 'Choose one or more buckets to filter transactions.' }}</p></div><button type="button" class="min-h-11 shrink-0 rounded-lg px-3 text-xs text-[#9e9cae] hover:bg-[#232332]" @click="showBucketPicker = false">Close</button></div>
            <button v-if="result.dailyBudget" type="button" class="mb-2 flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-3 text-left text-xs" :class="selectedBucketIds.length ? 'border-[#29293a] text-[#9e9cae]' : 'border-[#D4BFFF]/50 bg-[#D4BFFF]/5 text-[#f1f0f5]'" @click="selectedBucketIds = []"><span class="flex items-center gap-2"><span class="material-symbols-outlined text-base text-[#D4BFFF]">account_balance</span>Net worth · {{ money(netWorth) }}</span><span v-if="!selectedBucketIds.length" class="material-symbols-outlined text-base text-[#D4BFFF]">check</span></button>
            <ul class="max-h-56 space-y-1 overflow-y-auto">
              <li v-for="bucket in buckets.filter((item) => !item.is_archived)" :key="bucket.id">
                <label class="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 text-xs transition hover:bg-[#141520]" :class="selectedBucketIds.includes(String(bucket.id)) ? 'border-[#D4BFFF]/40 bg-[#D4BFFF]/5' : 'border-transparent'">
                  <span class="flex min-w-0 items-center gap-2"><span class="grid size-8 shrink-0 place-items-center rounded-lg border bg-[#141520]" :style="{ color: bucket.color || '#D4BFFF', borderColor: `${bucket.color || '#D4BFFF'}66` }"><span class="material-symbols-outlined text-base">{{ resolveIcon(bucket.icon, 'savings') }}</span></span><span class="min-w-0 truncate text-[#ccc3d8]">{{ bucket.name }}</span></span>
                  <span class="flex shrink-0 items-center gap-2"><span class="tabular-nums text-[#9e9cae]">{{ money(bucket.allocated_balance) }}</span><input v-model="selectedBucketIds" type="checkbox" :value="String(bucket.id)" class="size-4 accent-[#D4BFFF]" :aria-label="`Use ${bucket.name} bucket`"></span>
                </label>
              </li>
              <li v-if="!buckets.some((item) => !item.is_archived)" class="p-3 text-xs text-[#9e9cae]">No active buckets available.</li>
            </ul>
            <div class="mt-3 flex justify-end gap-2"><button type="button" class="min-h-11 rounded-lg px-3 text-xs text-[#ccc3d8] hover:bg-[#232332]" @click="showBucketPicker = false">Cancel</button><button type="button" class="min-h-11 rounded-lg bg-[#D4BFFF] px-3 text-xs font-bold text-[#0f0f15] disabled:opacity-50" :disabled="isRefining" @click="applyFilters">{{ isRefining ? 'Updating…' : 'Apply' }}</button></div>
          </div>

          <div v-if="showDatePicker" class="rounded-xl border border-[#29293a] bg-[#0f1019] p-3">
            <div class="mb-3 flex items-center justify-between gap-2"><div><h3 class="text-sm font-bold text-[#f1f0f5]">{{ result.dailyBudget ? 'Choose end date' : 'Choose dates' }}</h3><p class="text-xs text-[#9e9cae]">{{ result.dailyBudget ? 'Daily spending is divided through this date.' : 'Choose months or enter a custom date range.' }}</p></div><button type="button" class="min-h-11 shrink-0 rounded-lg px-3 text-xs text-[#9e9cae] hover:bg-[#232332]" @click="showDatePicker = false">Close</button></div>
            <template v-if="result.dailyBudget">
              <label class="block text-xs text-[#9e9cae]">Through date<input v-model="budgetEndDate" type="date" :min="todayDate" class="mt-1 min-h-11 w-full rounded-lg border border-[#29293a] bg-[#141520] px-3 text-sm text-[#f1f0f5] color-scheme-dark"></label>
            </template>
            <template v-else>
              <p class="mb-2 text-xs font-semibold text-[#9e9cae]">Months</p>
              <div class="flex flex-wrap gap-1.5">
                <button v-for="month in monthChoices" :key="month.key" type="button" class="min-h-11 rounded-lg border px-2.5 text-xs" :class="selectedMonths.includes(month.key) ? 'border-[#D4BFFF]/60 bg-[#D4BFFF]/10 text-[#f1f0f5]' : 'border-[#29293a] text-[#9e9cae] hover:text-[#f1f0f5]'" @click="toggleMonth(month.key)">{{ month.label }}</button>
              </div>
              <p class="mb-1 mt-3 text-xs font-semibold text-[#9e9cae]">Or set a custom range</p>
              <div class="grid grid-cols-2 gap-2"><label class="text-xs text-[#9e9cae]">From<input v-model="rangeStart" type="date" class="mt-1 min-h-11 w-full rounded-lg border border-[#29293a] bg-[#141520] px-2 text-xs text-[#f1f0f5] color-scheme-dark" @input="selectedMonths = []"></label><label class="text-xs text-[#9e9cae]">To<input v-model="rangeEnd" type="date" class="mt-1 min-h-11 w-full rounded-lg border border-[#29293a] bg-[#141520] px-2 text-xs text-[#f1f0f5] color-scheme-dark" @input="selectedMonths = []"></label></div>
              <button v-if="selectedMonths.length || dateRanges.length" type="button" class="mt-2 min-h-11 rounded-lg px-2 text-xs text-[#9e9cae] hover:bg-[#232332]" @click="selectedMonths = []; rangeStart = ''; rangeEnd = ''">Clear dates · all time</button>
            </template>
            <div class="mt-3 flex justify-end gap-2"><button type="button" class="min-h-11 rounded-lg px-3 text-xs text-[#ccc3d8] hover:bg-[#232332]" @click="showDatePicker = false">Cancel</button><button type="button" class="min-h-11 rounded-lg bg-[#D4BFFF] px-3 text-xs font-bold text-[#0f0f15] disabled:opacity-50" :disabled="isRefining || (!result.dailyBudget && !selectedMonths.length && Boolean(rangeStart) !== Boolean(rangeEnd))" @click="applyFilters">{{ isRefining ? 'Updating…' : 'Apply' }}</button></div>
          </div>
        </section>

        <template v-if="result.kind === 'finance'">
          <div v-if="hasMatches" class="space-y-4">
            <section class="rounded-2xl border border-[#FFD1B3]/20 bg-[#FFD1B3]/5 p-4" :class="result.flow === 'income' ? 'border-[#B3F5E1]/20 bg-[#B3F5E1]/5' : ''">
              <p class="text-xs text-[#9e9cae]">{{ totalLabel }}</p>
              <p class="mt-2 break-words text-3xl font-bold tracking-tight tabular-nums" :class="result.flow === 'income' ? 'text-[#B3F5E1]' : 'text-[#FFD1B3]'">{{ result.analyticsIntent === 'frequency' ? result.transactionCount : money(animatedTotalSpent) }}</p>
              <p class="mt-2 text-sm leading-5 text-[#ccc3d8]">{{ plainEnglishSummary }}</p>
              <p v-if="result.analyticsIntent !== 'frequency'" class="mt-2 text-sm text-[#ccc3d8]">{{ result.transactionCount }} {{ transactionCountLabel }} · {{ result.dateLabel }}</p>
              <p v-else class="mt-2 text-sm text-[#ccc3d8]">{{ result.dateLabel }}</p>
            </section>

            <section v-if="!['average', 'frequency'].includes(result.analyticsIntent)" class="grid gap-3 sm:grid-cols-3">
              <article class="rounded-xl border border-[#1f202e] bg-[#0f1019] p-3"><p class="text-[11px] text-[#9e9cae]">Average per active day</p><p class="mt-1 text-sm font-bold tabular-nums text-[#f1f0f5]">{{ money(result.averagePerActiveDay) }}</p><p class="mt-1 text-[11px] text-[#9e9cae]">Over {{ result.activeDayCount }} active {{ result.activeDayCount === 1 ? 'day' : 'days' }}</p></article>
              <article v-if="monthlyAverage" class="rounded-xl border border-[#1f202e] bg-[#0f1019] p-3"><p class="text-[11px] text-[#9e9cae]">Average per month</p><p class="mt-1 text-sm font-bold tabular-nums text-[#f1f0f5]">{{ money(monthlyAverage.amount) }}</p><p class="mt-1 text-[11px] text-[#9e9cae]">Over {{ monthlyAverage.monthCount }} {{ monthlyAverage.monthCount === 1 ? 'month' : 'months' }}</p></article>
              <article v-if="result.largestTransaction" class="rounded-xl border border-[#1f202e] bg-[#0f1019] p-3"><p class="text-[11px] text-[#9e9cae]">Largest transaction</p><p class="mt-1 truncate text-sm font-bold text-[#f1f0f5]">{{ result.largestTransaction.description || 'No description' }}</p><p class="mt-1 text-xs tabular-nums text-[#FFD1B3]">{{ money(result.largestTransaction.amount) }} · {{ date(result.largestTransaction.date) }}</p></article>
            </section>

            <details v-if="result.interpretation" class="overflow-hidden rounded-xl border border-[#1f202e] bg-[#0f1019]">
              <summary class="flex min-h-11 cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-[#f1f0f5]">What I matched <span class="text-xs font-normal text-[#9e9cae]">Show details</span></summary>
              <dl class="grid gap-2 border-t border-[#1f202e] px-4 py-3 text-xs sm:grid-cols-[7rem_1fr]">
                <dt class="text-[#9e9cae]">Question type</dt><dd class="text-[#ccc3d8]">{{ result.flow === 'income' ? 'Income received' : result.flow === 'outgoing' ? 'Money sent and expenses' : 'Expenses' }}</dd>
                <dt class="text-[#9e9cae]">Date range</dt><dd class="text-[#ccc3d8]">{{ result.interpretation.periods.length ? result.interpretation.periods.join(', ') : 'All time' }}</dd>
                <template v-if="result.interpretation.items.length"><dt class="text-[#9e9cae]">Items</dt><dd class="text-[#ccc3d8]">{{ result.interpretation.items.join(', ') }}</dd></template>
                <template v-if="result.interpretation.accounts.length"><dt class="text-[#9e9cae]">Accounts</dt><dd class="text-[#ccc3d8]">{{ result.interpretation.accounts.join(', ') }}</dd></template>
                <template v-if="result.interpretation.buckets.length"><dt class="text-[#9e9cae]">Buckets</dt><dd class="text-[#ccc3d8]">{{ result.interpretation.buckets.join(', ') }}</dd></template>
              </dl>
            </details>

            <section v-if="showChart" class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-4">
              <div class="mb-4"><h3 class="text-sm font-bold text-[#f1f0f5]">{{ chartHeading }}</h3><p class="mt-1 text-xs text-[#9e9cae]">{{ result.groupMode === 'period' ? 'Compare spending across the selected date ranges' : 'Breakdown of the matching expenses' }}</p></div>
              <InteractiveDonutChart
                :groups="chartGroups"
                :total="chartTotal"
                :currency-symbol="currencySymbol"
                id-prefix="question-results"
                :selection-label="result.groupMode === 'period' ? 'period' : 'category'"
                @select="selectedGroup = $event"
              />
            </section>

            <section v-if="result.categoryComparisons?.length" class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-4">
              <h3 class="text-sm font-bold text-[#f1f0f5]">Category changes</h3>
              <p class="mt-1 text-xs text-[#9e9cae]">Compare each category across the selected months.</p>
              <div class="mt-3 overflow-x-auto">
                <table class="w-full min-w-max text-left text-xs tabular-nums">
                  <thead><tr class="border-b border-[#29293a] text-[#9e9cae]"><th class="sticky left-0 bg-[#0f1019] py-2 pr-4 font-semibold">Category</th><th v-for="period in result.groups" :key="period.id" class="px-3 py-2 text-right font-semibold">{{ period.name }}</th></tr></thead>
                  <tbody class="divide-y divide-[#1f202e]">
                    <tr v-for="category in result.categoryComparisons" :key="category.id">
                      <th class="sticky left-0 bg-[#0f1019] py-2 pr-4 text-left font-medium text-[#ccc3d8]"><span class="mr-2 inline-block size-2 rounded-full" :style="{ backgroundColor: category.color || '#9e9cae' }"></span>{{ category.name }}</th>
                      <td v-for="(total, index) in category.totals" :key="index" class="px-3 py-2 text-right text-[#f1f0f5]">{{ money(total) }}</td>
                    </tr>
                    <tr class="border-t border-[#29293a] font-bold"><th class="sticky left-0 bg-[#0f1019] py-2 pr-4 text-left text-[#f1f0f5]">Total</th><td v-for="period in result.groups" :key="period.id" class="px-3 py-2 text-right text-[#f1f0f5]">{{ money(period.total) }}</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <p v-if="result.overlap" class="rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">Some requested items overlap, so the total counts each expense only once and no item chart is shown. Please refine your question.</p>

            <section class="overflow-hidden rounded-2xl border border-[#1f202e] bg-[#0f1019]">
              <div class="flex min-h-12 flex-col items-start justify-center gap-1 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-3">
                <h3 class="text-sm font-bold text-[#f1f0f5]">Matching transactions</h3>
                <div class="flex max-w-full flex-wrap items-center gap-2 text-xs text-[#9e9cae]">
                  <span>Showing {{ visibleTransactions.length }}<template v-if="filteredTransactions.length > visibleTransactions.length"> of {{ filteredTransactions.length }}</template> records · newest first</span>
                  <button v-if="selectedGroup" type="button" class="min-h-11 rounded-lg px-2 font-semibold text-[#D4BFFF] hover:bg-[#232332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4BFFF]" @click="selectedGroup = null">Clear filter</button>
                </div>
              </div>
              <div class="border-t border-[#1f202e]">
              <section v-for="day in groupedVisibleTransactions" :key="day.date" class="space-y-0">
                <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#1f202e] bg-[#0c0d14]/95 px-3 py-2 text-xs font-semibold sm:px-4">
                  <span class="font-bold tracking-tight text-[#f1f0f5]">{{ formatDateHeader(day.date) }}</span>
                  <div class="flex flex-wrap items-center justify-end gap-x-3 tabular-nums">
                    <span v-if="day.outflow > 0" class="text-[#9e9cae]">{{ result.flow === 'outgoing' ? 'Sent & spent' : 'Spent' }}: <span class="text-[#f1f0f5]">{{ money(day.outflow) }}</span></span>
                    <span v-if="day.income > 0" class="text-[#B3F5E1]">Income: {{ money(day.income) }}</span>
                  </div>
                </div>
                <ul class="divide-y divide-[#1f202e] border-b border-[#1f202e]">
                <li v-for="transaction in day.transactions" :key="transaction.id" class="flex min-h-12 items-center justify-between gap-3 px-3 py-3 transition hover:bg-[#141520] sm:px-4">
                  <div class="flex min-w-0 flex-1 items-center gap-3">
                    <div class="grid size-8 shrink-0 place-items-center rounded-lg border border-[#1f202e] bg-[#141520]">
                      <span class="material-symbols-outlined text-base" :style="{ color: transaction.category_color || '#9e9cae' }">{{ transactionIcon(transaction) }}</span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-xs font-bold leading-tight text-[#f1f0f5]">{{ transaction.description || 'No description' }}</p>
                      <div class="mt-1 flex min-w-0 items-center gap-1.5 truncate text-[10px] text-[#9e9cae]">
                        <span class="truncate">{{ transaction.category_name || 'Uncategorized' }}</span><span>·</span>
                        <span class="truncate">{{ transaction.account_name || 'Unknown account' }}</span>
                      </div>
                      <p v-if="transaction.bucket_name" class="mt-0.5 truncate text-[10px] text-[#9e9cae]">{{ transaction.bucket_name }}</p>
                    </div>
                  </div>
                  <span class="shrink-0 text-right text-xs font-bold tabular-nums" :class="transaction.transaction_type === 'income' ? 'text-[#B3F5E1]' : 'text-[#FFD1B3]'">{{ transaction.transaction_type === 'income' ? '+' : '−' }}{{ money(transaction.amount) }}</span>
                </li>
                </ul>
              </section>
              </div>
              <button v-if="visibleTransactions.length < filteredTransactions.length" type="button" class="flex min-h-11 w-full items-center justify-center border-t border-[#1f202e] px-4 text-xs font-semibold text-[#D4BFFF] hover:bg-[#141520] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D4BFFF]" @click="transactionLimit += 60">Show 60 more transactions</button>
            </section>
          </div>

          <section v-else class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-5 text-center">
            <span class="material-symbols-outlined text-3xl text-[#D4BFFF]">search_off</span>
            <h3 class="mt-3 text-base font-bold text-[#f1f0f5]">No matching transactions found</h3>
            <p class="mt-2 text-sm text-[#9e9cae]">No transactions matched the interpreted question for {{ result.dateLabel }}.</p>
          </section>
        </template>

        <section v-else-if="result.kind === 'help'" class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-5">
          <span class="material-symbols-outlined text-3xl text-[#B3F5E1]">help</span>
          <h3 class="mt-3 text-lg font-bold text-[#f1f0f5]">{{ result.title }}</h3>
          <p class="mt-2 whitespace-pre-line text-sm leading-6 text-[#ccc3d8]">{{ result.answer }}</p>
          <button type="button" class="mt-5 min-h-11 rounded-xl bg-[#D4BFFF] px-4 text-sm font-bold text-[#0f0f15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1f0f5]" @click="emit('open-help', result.destination)">Open FAQ &amp; Guides</button>
        </section>

        <section v-else-if="result.kind === 'insight'" class="space-y-4 rounded-2xl border border-[#1f202e] bg-[#0f1019] p-5">
          <span class="material-symbols-outlined text-3xl text-[#B3F5E1]">track_changes</span>
          <h3 class="text-lg font-bold text-[#f1f0f5]">{{ result.title }}</h3>
          <p v-if="result.dailyBudget" class="text-sm leading-6 text-[#ccc3d8]">
            Using {{ result.dailyBudgetSource === 'buckets' ? 'the selected bucket balances' : 'your dashboard net worth' }}, divided across {{ result.daysLeft }} days through {{ shortDate(result.budgetEndDate) }}.
          </p>
          <p v-else class="text-sm leading-6 text-[#ccc3d8]">{{ result.message }}</p>
          <div v-if="result.dailyBudget" class="rounded-xl border bg-[#B3F5E1]/5 p-4" :style="{ borderColor: `${result.groups?.length === 1 ? result.groups[0].color || '#B3F5E1' : '#B3F5E1'}55` }">
            <p class="text-xs text-[#9e9cae]">Available to spend per day · {{ result.daysLeft }} days including today</p>
            <p class="mt-1 text-2xl font-bold tabular-nums" :style="{ color: result.groups?.length === 1 ? result.groups[0].color || '#B3F5E1' : '#B3F5E1' }">{{ money(result.dailyAmount) }}</p>
            <p class="mt-1 text-xs text-[#ccc3d8]">{{ money(result.available) }} available in total through {{ shortDate(result.budgetEndDate) }}</p>
          </div>
          <ul v-if="result.groups?.length" class="divide-y divide-[#1f202e] rounded-xl border border-[#1f202e] px-3">
            <li v-for="group in result.groups" :key="group.id" class="flex items-center justify-between gap-3 py-3 text-sm">
              <span class="flex min-w-0 items-center gap-2 text-[#ccc3d8]">
                <span v-if="result.dailyBudget" class="grid size-8 shrink-0 place-items-center rounded-lg border bg-[#141520]" :style="{ color: group.color || '#D4BFFF', borderColor: `${group.color || '#D4BFFF'}66` }"><span class="material-symbols-outlined text-base">{{ resolveIcon(group.icon, 'savings') }}</span></span>
                <span class="min-w-0 truncate">{{ group.name }}<template v-if="result.dailyBudget"> · {{ money(group.balance) }} available</template></span>
              </span>
              <strong class="shrink-0 tabular-nums text-[#B3F5E1]">{{ money(group.remaining) }}<template v-if="result.dailyBudget"> / day</template></strong>
            </li>
          </ul>
        </section>

        <section v-else class="rounded-2xl border border-[#1f202e] bg-[#0f1019] p-5">
          <span class="material-symbols-outlined text-3xl text-[#D4BFFF]">{{ result.kind === 'clarify' ? 'help' : 'tips_and_updates' }}</span>
          <h3 class="mt-3 text-lg font-bold text-[#f1f0f5]">{{ result.kind === 'clarify' ? 'A little more detail needed' : 'Try a supported question' }}</h3>
          <p class="mt-2 text-sm leading-6 text-[#ccc3d8]">{{ result.message }}</p>
          <div v-if="result.suggestions?.length" class="mt-5 rounded-xl border border-[#29293a] bg-[#141520] p-3">
            <p class="text-xs font-bold text-[#f1f0f5]">Nearby local guide topics</p>
            <ul class="mt-2 space-y-1 text-sm text-[#9e9cae]"><li v-for="suggestion in result.suggestions" :key="suggestion.title">{{ suggestion.title }}</li></ul>
          </div>
          <div class="mt-5 rounded-xl border border-[#29293a] bg-[#141520] p-3"><p class="text-xs font-bold text-[#f1f0f5]">Examples</p><ul class="mt-2 space-y-1 text-sm text-[#9e9cae]"><li>How much did I spend on petrol?</li><li>How much did I spend last month?</li><li>How do I create another vault?</li></ul></div>
        </section>
      </div>
    </section>
  </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { formatDateDDMMYYYY } from '../utils/dateUtils.js';
import { resolveIcon } from '../utils/iconResolver.js';
import InteractiveDonutChart from './InteractiveDonutChart.vue';

const props = defineProps({
  result: { type: Object, default: null },
  currencySymbol: { type: String, default: '' },
  buckets: { type: Array, default: () => [] },
  netWorth: { type: Number, default: 0 },
  isRefining: { type: Boolean, default: false }
});
const emit = defineEmits(['close', 'open-help', 'refine']);

function handleCashBuddyBack() {
  if (props.result) emit('close');
}

onMounted(() => window.addEventListener('cashbuddy:back', handleCashBuddyBack));
onBeforeUnmount(() => {
  window.removeEventListener('cashbuddy:back', handleCashBuddyBack);
  window.dispatchEvent(new CustomEvent('cashbuddy-answer-open', { detail: false }));
});
watch(() => Boolean(props.result), (isOpen) => {
  window.dispatchEvent(new CustomEvent('cashbuddy-answer-open', { detail: isOpen }));
}, { immediate: true });

const showBucketPicker = ref(false);
const showDatePicker = ref(false);
const transactionLimit = ref(60);
const selectedBucketIds = ref([]);
const selectedMonths = ref([]);
const rangeStart = ref('');
const rangeEnd = ref('');
const budgetEndDate = ref('');
const dateRanges = computed(() => props.result?.queryFilters?.dateRanges || []);
const todayDate = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
});
const monthChoices = computed(() => Array.from({ length: 12 }, (_, index) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - index);
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  return { key, label: date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }) };
}).reverse());
const selectedBucketGroups = computed(() => props.buckets.filter((bucket) => selectedBucketIds.value.includes(String(bucket.id))));
const bucketFilterLabel = computed(() => {
  if (props.result?.dailyBudget && !selectedBucketIds.value.length) return `Net worth · ${money(props.netWorth)}`;
  return 'All buckets';
});
const dateFilterLabel = computed(() => {
  if (!dateRanges.value.length) return 'All time';
  return dateRanges.value.map((range) => range.label || `${range.startDate} – ${range.endDate}`).join(', ');
});

const hasMatches = computed(() => Number(props.result?.transactionCount) > 0);
const isAllTime = computed(() => props.result?.dateLabel === 'all time');
const monthlyAverage = computed(() => {
  const result = props.result;
  if (result?.kind !== 'finance' || result.analyticsIntent === 'average' || result.analyticsIntent === 'recent_amount') return null;

  const months = new Set();
  const addMonthsInRange = (startDate, endDate) => {
    const start = /^(\d{4})-(\d{2})/.exec(String(startDate || ''));
    const end = /^(\d{4})-(\d{2})/.exec(String(endDate || ''));
    if (!start || !end) return;
    const first = Number(start[1]) * 12 + Number(start[2]) - 1;
    const last = Number(end[1]) * 12 + Number(end[2]) - 1;
    for (let month = first; month <= last; month += 1) months.add(month);
  };

  const ranges = result.queryFilters?.dateRanges || [];
  if (ranges.length) ranges.forEach((range) => addMonthsInRange(range.startDate, range.endDate));
  else if (result.dateLabel === 'all time') addMonthsInRange(result.firstDate, result.lastDate);
  if (!months.size || (months.size === 1 && result.dateLabel !== 'all time')) return null;
  return { amount: (Number(result.total) || 0) / months.size, monthCount: months.size };
});
const rawGroups = computed(() => props.result?.groups || []);
const chartGroups = computed(() => props.result?.groupMode === 'period' ? rawGroups.value : rawGroups.value.filter((group) => Number(group.total) > 0));
const chartTotal = computed(() => chartGroups.value.reduce((sum, group) => sum + Number(group.total), 0));
const showChart = computed(() => props.result?.analyticsIntent !== 'frequency' && (props.result?.groupMode === 'period' ? chartGroups.value.length >= 2 && chartTotal.value > 0 : chartGroups.value.length >= 2) && !props.result?.overlap);
const chartHeading = computed(() => props.result?.groupMode === 'period' ? 'Spending by selected period' : props.result?.analyticsIntent === 'trend' ? 'Biggest spending changes' : props.result?.groupMode === 'requested' ? 'Requested items' : props.result?.analyticsGroupBy ? `${props.result.analyticsGroupBy[0].toUpperCase()}${props.result.analyticsGroupBy.slice(1)} breakdown` : 'Spending categories');
const selectedGroup = ref(null);
watch(() => props.result, (result) => {
  selectedBucketIds.value = [...(result?.queryFilters?.bucketIds || [])].map(String);
  const ranges = result?.queryFilters?.dateRanges || [];
  const fullMonths = ranges.filter((range) => range.startDate?.slice(0, 8) === range.endDate?.slice(0, 8) && range.startDate?.endsWith('-01') && range.endDate?.slice(8) === String(new Date(Number(range.endDate.slice(0, 4)), Number(range.endDate.slice(5, 7)), 0).getDate()).padStart(2, '0'));
  selectedMonths.value = fullMonths.map((range) => range.startDate.slice(0, 7));
  const customRange = ranges.find((range) => !fullMonths.includes(range));
  rangeStart.value = customRange?.startDate || '';
  rangeEnd.value = customRange?.endDate || '';
  budgetEndDate.value = result?.budgetEndDate || todayDate.value;
  showBucketPicker.value = false;
  showDatePicker.value = false;
  selectedGroup.value = null;
  transactionLimit.value = 60;
}, { immediate: true });
const filteredTransactions = computed(() => {
  const transactions = props.result?.transactions || [];
  return selectedGroup.value ? transactions.filter((transaction) => transaction.groupIds?.includes(selectedGroup.value.id)) : transactions;
});
const visibleTransactions = computed(() => filteredTransactions.value.slice(0, transactionLimit.value));
watch(selectedGroup, () => { transactionLimit.value = 60; });
const groupedVisibleTransactions = computed(() => {
  const groups = new Map();
  for (const transaction of visibleTransactions.value) {
    const day = transaction.date ? String(transaction.date).split('T')[0] : 'Unknown Date';
    if (!groups.has(day)) groups.set(day, { date: day, transactions: [], outflow: 0, income: 0 });
    const group = groups.get(day);
    group.transactions.push(transaction);
    const amount = Number(transaction.amount) || 0;
    if (transaction.transaction_type === 'income') group.income += amount;
    else group.outflow += amount;
  }
  return [...groups.values()];
});
const totalLabel = computed(() => props.result?.analyticsIntent === 'frequency' ? 'Matching transactions' : props.result?.analyticsIntent === 'average' ? 'Period total' : props.result?.analyticsIntent === 'recent_amount' ? 'Selected recent spending' : props.result?.flow === 'income' ? 'Total received' : props.result?.flow === 'outgoing' ? 'Total sent & spent' : 'Total spent');
const transactionCountLabel = computed(() => props.result?.flow === 'income' ? 'income record' + (props.result?.transactionCount === 1 ? '' : 's') : props.result?.flow === 'outgoing' ? 'outgoing record' + (props.result?.transactionCount === 1 ? '' : 's') : 'expense' + (props.result?.transactionCount === 1 ? '' : 's'));
const plainEnglishSummary = computed(() => {
  if (props.result?.analyticsIntent === 'frequency') {
    const count = Number(props.result.transactionCount) || 0;
    const group = props.result.groups?.[0];
    const item = group?.name || props.result.interpretation?.buckets?.[0] || props.result.interpretation?.accounts?.[0] || props.result.interpretation?.items?.[0];
    const qualifier = item ? ` on ${item}` : '';
    return `You spent${qualifier} ${count} ${count === 1 ? 'time' : 'times'} during ${props.result.dateLabel || 'the selected period'}.`;
  }
  if (props.result?.analyticsIntent === 'rank') {
    const ranked = props.result.groups?.[0];
    if (ranked) {
      const position = props.result.rankPosition || 1;
      const suffix = position % 100 >= 11 && position % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[position % 10] || 'th');
      const rank = position === 1 ? (props.result.direction === 'asc' ? 'lowest' : 'highest') : `${position}${suffix}-${props.result.direction === 'asc' ? 'lowest' : 'highest'}`;
      return `${ranked.name} had the ${rank} spending at ${money(ranked.total)} across ${ranked.count} transactions.`;
    }
  }
  if (props.result?.analyticsIntent === 'average') {
    const average = props.result.groups?.[0];
    if (average) return `You spent an average of ${money(average.total)} per ${props.result.analyticsGroupBy}, across ${average.periodCount} calendar ${props.result.analyticsGroupBy === 'month' ? 'months' : 'weeks'}.`;
  }
  if (props.result?.analyticsIntent === 'trend' && props.result?.groupMode === 'period') {
    return `You spent ${money(props.result.total)} across ${props.result.groups.length} selected periods.`;
  }
  if (props.result?.analyticsIntent === 'trend' && props.result?.groups?.length) {
    const changed = props.result.groups[0];
    return `${changed.name} changed the most: spending ${changed.delta > 0 ? 'increased' : 'decreased'} by ${money(Math.abs(changed.delta))}.`;
  }
  if (props.result?.analyticsIntent && props.result?.message) return props.result.message;
  const verb = props.result?.flow === 'income' ? 'received' : props.result?.flow === 'outgoing' ? 'sent or spent' : 'spent';
  const requestedGroups = props.result?.groupMode === 'requested'
    ? (props.result.groups || []).filter((group) => Number(group.total) > 0)
    : [];
  if (requestedGroups.length) {
    const items = requestedGroups.map((group) => `${money(group.total)} on ${group.name}`);
    const itemList = items.length === 1 ? items[0] : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
    return `You ${verb} ${itemList}.`;
  }

  const total = money(props.result?.total);
  return isAllTime.value
    ? `You ${verb} ${total}, from ${date(props.result?.firstDate)} to ${date(props.result?.lastDate)}.`
    : `You ${verb} ${total} during ${props.result?.dateLabel || 'the selected period'}.`;
});
const animatedTotalSpent = ref(0);
let totalTickerFrame = null;

watch(() => props.result?.kind === 'finance' && props.result.analyticsIntent !== 'frequency' ? Number(props.result.total) || 0 : null, (target) => {
  if (totalTickerFrame) cancelAnimationFrame(totalTickerFrame);
  totalTickerFrame = null;
  if (target === null) {
    animatedTotalSpent.value = 0;
    return;
  }

  const start = performance.now();
  const duration = 800;
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    animatedTotalSpent.value = target * eased;
    if (progress < 1) totalTickerFrame = requestAnimationFrame(step);
    else totalTickerFrame = null;
  };
  totalTickerFrame = requestAnimationFrame(step);
}, { immediate: true });

onBeforeUnmount(() => {
  if (totalTickerFrame) cancelAnimationFrame(totalTickerFrame);
});

function money(value) {
  return `${props.currencySymbol}${(Number(value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortDate(value) {
  if (!value) return todayDate.value;
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function toggleMonth(key) {
  selectedMonths.value = selectedMonths.value.includes(key)
    ? selectedMonths.value.filter((month) => month !== key)
    : [...selectedMonths.value, key].sort();
  rangeStart.value = '';
  rangeEnd.value = '';
}

function applyFilters() {
  let ranges = dateRanges.value;
  let selectedBudgetEnd = budgetEndDate.value;
  if (props.result?.dailyBudget) {
    ranges = [];
  } else if (selectedMonths.value.length) {
    ranges = selectedMonths.value.map((month) => {
      const [year, monthNumber] = month.split('-').map(Number);
      const end = new Date(year, monthNumber, 0).getDate();
      const monthName = new Date(year, monthNumber - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      return { startDate: `${month}-01`, endDate: `${month}-${String(end).padStart(2, '0')}`, label: monthName };
    });
  } else if (rangeStart.value && rangeEnd.value) {
    if (rangeEnd.value < rangeStart.value) return;
    ranges = [{ startDate: rangeStart.value, endDate: rangeEnd.value, label: `${shortDate(rangeStart.value)} – ${shortDate(rangeEnd.value)}` }];
  } else if (!rangeStart.value && !rangeEnd.value) {
    ranges = [];
  } else {
    return;
  }
  emit('refine', { bucketIds: [...selectedBucketIds.value], dateRanges: ranges, budgetEndDate: selectedBudgetEnd });
  showBucketPicker.value = false;
  showDatePicker.value = false;
}

function date(value) {
  return formatDateDDMMYYYY(value) || 'Date unavailable';
}

function formatDateHeader(value) {
  if (!value || value === 'Unknown Date') return 'Unknown Date';
  const today = new Date();
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayValue = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (value === todayValue) return 'Today';
  if (value === yesterdayValue) return 'Yesterday';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function transactionIcon(transaction) {
  const icon = transaction.bucket_icon && transaction.bucket_icon !== '🪣'
    ? transaction.bucket_icon
    : transaction.category_icon;
  return resolveIcon(icon, 'savings');
}

</script>
