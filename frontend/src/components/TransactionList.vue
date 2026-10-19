<template>
  <div 
    class="space-y-4 touch-pan-y"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @mousedown="onTouchStart"
    @mousemove="onTouchMove"
    @mouseup="onTouchEnd"
    @mouseleave="onTouchEnd"
  >
    <!-- Top Header & Controls Strip (Flush, Hairline Divider) -->
    <div data-tour="history-filters" class="border-b border-[#1f202e] pb-3 space-y-3 animate-cascade-1">
      <!-- Centered Header: < Month Year > (Moves synchronously with touch swipe) -->
      <div class="flex items-center justify-between px-1">
        <button 
          @click="prevMonth"
          class="w-7 h-7 rounded-lg bg-[#0f1019] hover:bg-[#141520] text-[#f1f0f5] flex items-center justify-center text-xs font-semibold transition cursor-pointer active:scale-95 border border-[#1f202e] z-10 shrink-0"
          title="Previous Month"
        >
          ❮
        </button>

        <div class="overflow-hidden relative flex-1 mx-2 flex justify-center">
          <h2 
            :style="swipeTransformStyle"
            class="text-base sm:text-lg font-bold text-[#f1f0f5] tracking-tight select-none will-change-transform text-center whitespace-nowrap"
          >
            {{ formattedMonthYear }}
          </h2>
        </div>

        <button 
          @click="nextMonth"
          class="w-7 h-7 rounded-lg bg-[#0f1019] hover:bg-[#141520] text-[#f1f0f5] flex items-center justify-center text-xs font-semibold transition cursor-pointer active:scale-95 border border-[#1f202e] z-10 shrink-0"
          title="Next Month"
        >
          ❯
        </button>
      </div>

      <!-- Ultra-Compact Single-Line Controls Strip -->
      <div class="flex items-center justify-between gap-1.5 pt-1 px-0.5">
        <!-- Left: Time Mode Segmented Pill [ Monthly | Custom ▾ ] -->
        <div class="inline-flex p-0.5 bg-[#0f1019] border border-[#1f202e] rounded-xl text-xs font-semibold shrink-0">
          <button 
            @click="timeMode = 'monthly'"
            class="px-2.5 py-1 rounded-lg transition cursor-pointer"
            :class="timeMode === 'monthly' ? 'bg-[#141520] text-[#f1f0f5] border border-[#D4BFFF]/40 shadow-sm font-bold' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
          >
            Monthly
          </button>
          <button 
            @click="openCustomRangeModal"
            class="px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
            :class="timeMode === 'range' ? 'bg-[#141520] text-[#D4BFFF] border border-[#D4BFFF]/40 shadow-sm font-bold' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
          >
            <span>Custom</span>
            <span class="text-[10px] text-[#D4BFFF]">▾</span>
          </button>
        </div>

        <!-- Right: Action Strip (Chart View Toggle, Filter Icon, Sort Dropdown) -->
        <div class="flex items-center gap-1.5 shrink-0">
          <!-- Chart Breakdown View Mode Pill -->
          <div class="inline-flex p-0.5 bg-[#0f1019] border border-[#1f202e] rounded-xl text-xs font-semibold shrink-0">
            <button 
              @click="chartViewMode = 'both'"
              class="px-2 py-0.5 rounded-lg transition cursor-pointer text-[11px]"
              :class="chartViewMode === 'both' ? 'bg-[#D4BFFF] text-[#0f0f15] font-bold' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
              title="Show Both Charts"
            >
              All
            </button>
            <button 
              @click="chartViewMode = 'expense'"
              class="px-2 py-0.5 rounded-lg transition cursor-pointer text-[11px]"
              :class="chartViewMode === 'expense' ? 'bg-[#FFD1B3] text-[#0f0f15] font-bold' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
              title="Expenses Chart Only"
            >
              Exp
            </button>
            <button 
              @click="chartViewMode = 'income'"
              class="px-2 py-0.5 rounded-lg transition cursor-pointer text-[11px]"
              :class="chartViewMode === 'income' ? 'bg-[#B3F5E1] text-[#0f0f15] font-bold' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
              title="Income Chart Only"
            >
              Inc
            </button>
          </div>

          <!-- Filter Button Icon -->
          <button 
            @click="showFilterDrawer = !showFilterDrawer"
            class="w-7 h-7 bg-[#0f1019] hover:bg-[#141520] border border-[#1f202e] hover:border-[#D4BFFF]/60 rounded-xl text-[#D4BFFF] flex items-center justify-center transition cursor-pointer relative shrink-0"
            title="Toggle Filter Options"
          >
            <span class="material-symbols-outlined text-sm">filter_list</span>
            <span v-if="activeFilterCount > 0" class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] bg-[#D4BFFF] text-[#0f0f15] font-bold flex items-center justify-center">
              {{ activeFilterCount }}
            </span>
          </button>

          <!-- Aesthetic Sort Order Trigger Button -->
          <button 
            type="button"
            @click="showSortModal = true"
            class="w-7 h-7 bg-[#0f1019] hover:bg-[#141520] border border-[#1f202e] hover:border-[#D4BFFF]/60 rounded-xl text-[#D4BFFF] flex items-center justify-center transition cursor-pointer relative shrink-0"
            title="Sort Order"
          >
            <span class="material-symbols-outlined text-sm">swap_vert</span>
            <span v-if="sortBy !== 'date_desc'" class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D4BFFF] border border-[#0c0d14]"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Sleek Custom Time Range & Month/Year Pop-up Modal Sheet -->
    <Transition name="fade-slide">
      <div v-if="showCustomRangeModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pb-20 sm:pb-4 bg-black/75 backdrop-blur-md">
        <div class="relative w-full max-w-md bg-[#0c0d14] border border-[#1f202e] rounded-2xl shadow-2xl overflow-hidden flex flex-col p-4 space-y-3.5">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-[#1f202e] pb-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-[#D4BFFF]">calendar_month</span>
              <h3 class="text-sm font-bold text-[#f1f0f5] tracking-tight">Select Time Range Horizon</h3>
            </div>
            <button @click="showCustomRangeModal = false" class="text-[#9e9cae] hover:text-[#f1f0f5] transition cursor-pointer p-1">
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <!-- 1-Tap Preset Chip Options -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">Quick Presets</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                @click="selectRangeChoice('this_month')"
                class="px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer"
                :class="rangeTimeChoice === 'this_month' ? 'bg-[#D4BFFF] text-[#0f0f15] border-[#D4BFFF] font-bold' : 'bg-[#0f1019] border-[#1f202e] text-[#f1f0f5] hover:border-[#D4BFFF]/40'"
              >
                This Month
              </button>
              <button
                type="button"
                @click="selectRangeChoice('last_month')"
                class="px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer"
                :class="rangeTimeChoice === 'last_month' ? 'bg-[#D4BFFF] text-[#0f0f15] border-[#D4BFFF] font-bold' : 'bg-[#0f1019] border-[#1f202e] text-[#f1f0f5] hover:border-[#D4BFFF]/40'"
              >
                Last Month
              </button>
              <button
                type="button"
                @click="selectRangeChoice('last_3_months')"
                class="px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer"
                :class="rangeTimeChoice === 'last_3_months' ? 'bg-[#D4BFFF] text-[#0f0f15] border-[#D4BFFF] font-bold' : 'bg-[#0f1019] border-[#1f202e] text-[#f1f0f5] hover:border-[#D4BFFF]/40'"
              >
                Last 3 Months
              </button>
              <button
                type="button"
                @click="selectRangeChoice('last_6_months')"
                class="px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer"
                :class="rangeTimeChoice === 'last_6_months' ? 'bg-[#D4BFFF] text-[#0f0f15] border-[#D4BFFF] font-bold' : 'bg-[#0f1019] border-[#1f202e] text-[#f1f0f5] hover:border-[#D4BFFF]/40'"
              >
                Last 6 Months
              </button>
              <button
                type="button"
                @click="selectRangeChoice('this_year')"
                class="px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer"
                :class="rangeTimeChoice === 'this_year' ? 'bg-[#D4BFFF] text-[#0f0f15] border-[#D4BFFF] font-bold' : 'bg-[#0f1019] border-[#1f202e] text-[#f1f0f5] hover:border-[#D4BFFF]/40'"
              >
                This Year
              </button>
              <button
                type="button"
                @click="rangeTimeChoice = 'specific_month'"
                class="px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                :class="rangeTimeChoice === 'specific_month' ? 'bg-[#D4BFFF] text-[#0f0f15] border-[#D4BFFF] font-bold' : 'bg-[#0f1019] border-[#1f202e] text-[#f1f0f5] hover:border-[#D4BFFF]/40'"
              >
                <span class="material-symbols-outlined text-sm">calendar_month</span>
                <span>Month/Year Grid</span>
              </button>
              <button
                type="button"
                @click="rangeTimeChoice = 'custom'"
                class="px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer"
                :class="rangeTimeChoice === 'custom' ? 'bg-[#D4BFFF] text-[#0f0f15] border-[#D4BFFF] font-bold' : 'bg-[#0f1019] border-[#1f202e] text-[#f1f0f5] hover:border-[#D4BFFF]/40'"
              >
                Custom Dates...
              </button>
            </div>
          </div>

          <!-- Sleek Month/Year Matrix Picker -->
          <div v-if="rangeTimeChoice === 'specific_month'" class="p-3 bg-[#0f1019] border border-[#1f202e] rounded-xl space-y-2.5">
            <div class="flex items-center justify-between border-b border-[#1f202e] pb-2">
              <button 
                type="button"
                @click="changePickerYear(-1)"
                class="w-7 h-7 rounded-lg bg-[#141520] hover:bg-[#191924] text-[#f1f0f5] flex items-center justify-center text-xs font-bold border border-[#1f202e] transition cursor-pointer"
              >
                ❮
              </button>
              <span class="text-sm font-bold text-[#D4BFFF]">{{ pickerYear }}</span>
              <button 
                type="button"
                @click="changePickerYear(1)"
                class="w-7 h-7 rounded-lg bg-[#141520] hover:bg-[#191924] text-[#f1f0f5] flex items-center justify-center text-xs font-bold border border-[#1f202e] transition cursor-pointer"
              >
                ❯
              </button>
            </div>

            <div class="grid grid-cols-4 gap-1.5">
              <button
                v-for="(mName, idx) in monthNames"
                :key="mName"
                type="button"
                @click="selectMonthAndYearModal(idx)"
                class="py-2 rounded-lg border text-xs font-bold transition cursor-pointer text-center"
                :class="isCurrentSelectedMonth(idx) ? 'bg-[#D4BFFF] text-[#0f0f15] border-[#D4BFFF]' : 'bg-[#141520] border-[#1f202e] text-[#f1f0f5] hover:bg-[#191924]'"
              >
                {{ mName }}
              </button>
            </div>
          </div>

          <!-- Custom Date Range Inputs -->
          <div v-if="rangeTimeChoice === 'custom'" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#1f202e]">
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">Start Date</label>
              <input 
                v-model="startDateInput"
                type="date"
                @click="$event.target.showPicker?.()"
                class="w-full h-8 px-2.5 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-lg text-[#f1f0f5] text-xs focus:outline-none transition cursor-pointer [color-scheme:dark]"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">End Date</label>
              <input 
                v-model="endDateInput"
                type="date"
                @click="$event.target.showPicker?.()"
                class="w-full h-8 px-2.5 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-lg text-[#f1f0f5] text-xs focus:outline-none transition cursor-pointer [color-scheme:dark]"
              />
            </div>
          </div>

          <!-- Modal Action Footer -->
          <div class="pt-2 border-t border-[#1f202e] flex items-center justify-end gap-2">
            <button
              type="button"
              @click="showCustomRangeModal = false"
              class="px-5 py-2 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Apply Range
            </button>
          </div>

        </div>
      </div>
    </Transition>

    <!-- Sleek UI Filter Modal Prompt Sheet -->
    <Transition name="fade-slide">
      <div v-if="showFilterDrawer" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pb-20 sm:pb-4 bg-black/75 backdrop-blur-md">
        <div class="relative w-full max-w-lg bg-[#0c0d14] border border-[#1f202e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[72vh] sm:max-h-[80vh]">
          
          <!-- Modal Header -->
          <div class="px-5 py-3 border-b border-[#1f202e] flex justify-between items-center bg-[#0c0d14] shrink-0">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-[#D4BFFF]">search</span>
              <h3 class="text-sm font-bold text-[#f1f0f5] tracking-tight">Filter & Search Transactions</h3>
              <span v-if="activeFilterCount > 0" class="px-2 py-0.5 rounded-full text-[9px] bg-[#D4BFFF] text-[#0f0f15] font-bold">
                {{ activeFilterCount }} active
              </span>
            </div>
            <button 
              @click="showFilterDrawer = false" 
              class="text-[#9e9cae] hover:text-[#f1f0f5] transition cursor-pointer p-1"
              title="Close Filters"
            >
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <!-- Modal Body (Scrollable with compact spacing) -->
          <div class="p-3.5 sm:p-4 space-y-3 overflow-y-auto flex-1 overscroll-contain">
            
            <!-- Search Input -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">Search</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-2 text-[#9e9cae] text-sm">search</span>
                <input 
                  v-model="filters.search"
                  type="text" 
                  placeholder="Search description or notes..."
                  class="w-full pl-8 pr-8 py-1.5 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs placeholder-[#9e9cae]/60 focus:outline-none transition"
                />
                <button 
                  v-if="filters.search" 
                  @click="filters.search = ''"
                  class="absolute right-3 top-2 text-[#9e9cae] hover:text-[#f1f0f5]"
                >
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>

            <!-- Savings Buckets Table Grid Matrix -->
            <div class="space-y-1">
              <div class="flex justify-between items-center">
                <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">Savings Buckets</label>
                <div class="flex items-center gap-2 text-[10px] font-bold">
                  <button type="button" @click="selectAllBuckets" class="text-[#D4BFFF] hover:underline cursor-pointer">Select All</button>
                  <span class="text-[#1f202e]">|</span>
                  <button type="button" @click="deselectAllBuckets" class="text-[#9e9cae] hover:text-[#FFD1B3] hover:underline cursor-pointer">Clear</button>
                </div>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-0.5">
                <button
                  type="button"
                  @click="deselectAllBuckets"
                  class="px-2 py-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between gap-1.5 h-8"
                  :class="filters.bucket_ids.length === 0 ? 'bg-[#D4BFFF]/20 border-[#D4BFFF] text-[#D4BFFF] font-bold' : 'bg-[#0f1019] border-[#1f202e] text-[#9e9cae] hover:border-[#D4BFFF]/40'"
                >
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="material-symbols-outlined text-xs">savings</span>
                    <span class="truncate text-[11px]">All Buckets</span>
                  </div>
                </button>
                <button
                  type="button"
                  @click="toggleBucketFilter('unassigned')"
                  class="px-2 py-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between gap-1.5 h-8"
                  :class="filters.bucket_ids.includes('unassigned') ? 'bg-[#D4BFFF]/20 border-[#D4BFFF] text-[#D4BFFF] font-bold' : 'bg-[#0f1019] border-[#1f202e] text-[#9e9cae] hover:border-[#D4BFFF]/40'"
                >
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="material-symbols-outlined text-xs leading-none shrink-0 text-[#FFD1B3]">account_balance_wallet</span>
                    <span class="truncate text-[11px]">Unassigned</span>
                  </div>
                  <span v-if="filters.bucket_ids.includes('unassigned')" class="material-symbols-outlined text-xs text-[#D4BFFF] shrink-0">check</span>
                </button>
                <button
                  v-for="b in buckets"
                  :key="b.id"
                  type="button"
                  @click="toggleBucketFilter(b.id)"
                  class="px-2 py-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between gap-1.5 h-8"
                  :class="filters.bucket_ids.includes(b.id) ? 'bg-[#D4BFFF]/20 border-[#D4BFFF] text-[#D4BFFF] font-bold' : 'bg-[#0f1019] border-[#1f202e] text-[#9e9cae] hover:border-[#D4BFFF]/40'"
                >
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="material-symbols-outlined text-xs leading-none shrink-0" :style="{ color: b.color || '#D4BFFF' }">{{ resolveIcon(b.icon, 'savings') }}</span>
                    <span class="truncate text-[11px]">{{ b.name }}</span>
                  </div>
                  <span v-if="filters.bucket_ids.includes(b.id)" class="material-symbols-outlined text-xs text-[#D4BFFF] shrink-0">check</span>
                </button>
              </div>
            </div>

            <!-- Storage Accounts Table Grid Matrix -->
            <div class="space-y-1">
              <div class="flex justify-between items-center">
                <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">Storage Accounts</label>
                <div class="flex items-center gap-2 text-[10px] font-bold">
                  <button type="button" @click="selectAllAccounts" class="text-[#D4BFFF] hover:underline cursor-pointer">Select All</button>
                  <span class="text-[#1f202e]">|</span>
                  <button type="button" @click="deselectAllAccounts" class="text-[#9e9cae] hover:text-[#FFD1B3] hover:underline cursor-pointer">Clear</button>
                </div>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-0.5">
                <button
                  type="button"
                  @click="deselectAllAccounts"
                  class="px-2 py-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between gap-1.5 h-8"
                  :class="filters.account_ids.length === 0 ? 'bg-[#D4BFFF]/20 border-[#D4BFFF] text-[#D4BFFF] font-bold' : 'bg-[#0f1019] border-[#1f202e] text-[#9e9cae] hover:border-[#D4BFFF]/40'"
                >
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="material-symbols-outlined text-xs">account_balance</span>
                    <span class="truncate text-[11px]">All Accounts</span>
                  </div>
                </button>
                <button
                  v-for="acc in accounts"
                  :key="acc.id"
                  type="button"
                  @click="toggleAccountFilter(acc.id)"
                  class="px-2 py-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between gap-1.5 h-8"
                  :class="filters.account_ids.includes(acc.id) ? 'bg-[#D4BFFF]/20 border-[#D4BFFF] text-[#D4BFFF] font-bold' : 'bg-[#0f1019] border-[#1f202e] text-[#9e9cae] hover:border-[#D4BFFF]/40'"
                >
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="truncate text-[11px]">{{ acc.name }}</span>
                  </div>
                  <span v-if="filters.account_ids.includes(acc.id)" class="material-symbols-outlined text-xs text-[#D4BFFF] shrink-0">check</span>
                </button>
              </div>
            </div>

            <!-- Categories Table Grid Matrix -->
            <div class="space-y-1">
              <div class="flex justify-between items-center">
                <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">Categories</label>
                <div class="flex items-center gap-2 text-[10px] font-bold">
                  <button type="button" @click="selectAllCategories" class="text-[#D4BFFF] hover:underline cursor-pointer">Select All</button>
                  <span class="text-[#1f202e]">|</span>
                  <button type="button" @click="deselectAllCategories" class="text-[#9e9cae] hover:text-[#FFD1B3] hover:underline cursor-pointer">Clear</button>
                </div>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#0f1019] border border-[#1f202e] rounded-xl">
                <button
                  v-for="cat in filteredCategories"
                  :key="cat.id"
                  type="button"
                  @click="toggleCategoryFilter(cat.id)"
                  class="px-2 py-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between gap-1.5 h-8"
                  :class="filters.category_ids.includes(cat.id) ? 'bg-[#D4BFFF]/20 border-[#D4BFFF] text-[#D4BFFF] font-bold' : 'bg-[#141520] border-[#1f202e] text-[#9e9cae] hover:border-[#D4BFFF]/40'"
                >
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="material-symbols-outlined text-xs leading-none shrink-0" :style="{ color: cat.color || '#D4BFFF' }">{{ resolveIcon(cat.icon, 'category') }}</span>
                    <span class="truncate text-[11px]">{{ cat.name }}</span>
                  </div>
                  <span v-if="filters.category_ids.includes(cat.id)" class="material-symbols-outlined text-xs text-[#D4BFFF] shrink-0">check</span>
                </button>
              </div>
            </div>

                <!-- Transaction Type Structured Table Row -->
                <div class="space-y-1">
                  <label class="text-[10px] font-semibold text-[#9e9cae] uppercase tracking-wider block">Transaction Type</label>
                  <div class="grid grid-cols-4 gap-1 p-0.5 bg-[#0f0f15] rounded-xl border border-[#29293a]">
                    <button
                      type="button"
                      @click="filters.transaction_type = ''"
                      class="py-1 text-xs font-semibold rounded-lg transition cursor-pointer text-center"
                      :class="!filters.transaction_type ? 'bg-[#14141d] text-[#f1f0f5] border border-[#29293a]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      @click="filters.transaction_type = 'expense'"
                      class="py-1 text-xs font-semibold rounded-lg transition cursor-pointer text-center"
                      :class="filters.transaction_type === 'expense' ? 'bg-[#FFD1B3] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      @click="filters.transaction_type = 'income'"
                      class="py-1 text-xs font-semibold rounded-lg transition cursor-pointer text-center"
                      :class="filters.transaction_type === 'income' ? 'bg-[#B3F5E1] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      @click="filters.transaction_type = 'adjustment'"
                      class="py-1 text-xs font-semibold rounded-lg transition cursor-pointer text-center"
                      :class="filters.transaction_type === 'adjustment' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
                    >
                      Adjust
                    </button>
                  </div>
                </div>

                <!-- Sort Order Matrix inside Filter Drawer -->
                <div class="space-y-1">
                  <label class="text-[10px] font-semibold text-[#9e9cae] uppercase tracking-wider block">Sort Order</label>
                  <div class="grid grid-cols-2 gap-1.5 p-1 bg-[#0f0f15] rounded-xl border border-[#29293a]">
                    <button
                      v-for="opt in sortOptions"
                      :key="opt.value"
                      type="button"
                      @click="sortBy = opt.value"
                      class="py-1.5 px-2 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center justify-between gap-1.5"
                      :class="sortBy === opt.value ? 'bg-[#D4BFFF]/20 border-[#D4BFFF] text-[#f1f0f5] font-bold shadow-sm' : 'bg-[#14141d] border-transparent text-[#9e9cae] hover:text-[#f1f0f5]'"
                    >
                      <div class="flex items-center gap-1.5 min-w-0 truncate">
                        <span class="material-symbols-outlined text-xs text-[#D4BFFF] shrink-0">{{ opt.icon }}</span>
                        <span class="truncate text-[11px]">{{ opt.label }}</span>
                      </div>
                      <span v-if="sortBy === opt.value" class="material-symbols-outlined text-xs text-[#D4BFFF] shrink-0">check</span>
                    </button>
                  </div>
                </div>

              </div>

              <!-- Modal Footer Action Strip -->
              <div class="p-3 border-t border-[#29293a] bg-[#14141d] flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  @click="resetAllFilters"
                  class="px-3 py-1.5 text-xs font-semibold text-[#9e9cae] hover:text-[#FFD1B3] transition cursor-pointer"
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  @click="showFilterDrawer = false"
                  class="px-5 py-2 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-semibold text-xs rounded-full shadow-md transition cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>

            </div>
          </div>
        </Transition>

    <!-- Sleek Custom Sort Sheet Modal -->
    <Transition name="fade-slide">
      <div v-if="showSortModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pb-20 sm:pb-4 bg-black/75 backdrop-blur-md" @click.self="showSortModal = false">
        <div class="relative w-full max-w-xs sm:max-w-sm bg-[#0c0d14] border border-[#1f202e] rounded-2xl shadow-2xl overflow-hidden flex flex-col p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-[#1f202e] pb-2.5">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-[#D4BFFF]">swap_vert</span>
              <h3 class="text-sm font-bold text-[#f1f0f5] tracking-tight">Sort Transactions</h3>
            </div>
            <button @click="showSortModal = false" class="text-[#9e9cae] hover:text-[#f1f0f5] transition cursor-pointer p-1">
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <div class="space-y-1.5">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              type="button"
              @click="sortBy = opt.value; showSortModal = false"
              class="w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-left"
              :class="sortBy === opt.value ? 'bg-[#D4BFFF]/20 border-[#D4BFFF] text-[#f1f0f5] font-bold shadow-sm' : 'bg-[#0f1019] border-[#1f202e] text-[#9e9cae] hover:text-[#f1f0f5] hover:border-[#D4BFFF]/40'"
            >
              <div class="flex items-center gap-2.5">
                <span class="material-symbols-outlined text-base text-[#D4BFFF]">{{ opt.icon }}</span>
                <span>{{ opt.label }}</span>
              </div>
              <span v-if="sortBy === opt.value" class="material-symbols-outlined text-sm text-[#D4BFFF]">check</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Dual Expenses & Income Donut Charts Container with Continuous Spring Gesture Physics -->
    <div class="overflow-hidden relative min-h-[220px] animate-cascade-2">
      <div 
        :style="swipeTransformStyle"
        class="space-y-4 touch-pan-y will-change-transform w-full"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @mousedown="onTouchStart"
        @mousemove="onTouchMove"
        @mouseup="onTouchEnd"
        @mouseleave="onTouchEnd"
      >
        <!-- Expenses Breakdown Donut Chart Section (Flat Seamless Surface) -->
        <section 
          v-if="chartViewMode === 'both' || chartViewMode === 'expense'"
          class="p-1 space-y-3"
        >
          <div class="border-b border-[#1f202e] pb-2">
            <h2 class="text-sm font-bold text-[#f1f0f5] tracking-tight">Expenses Breakdown</h2>
          </div>

          <div v-if="expensePiePaths.length === 0" class="p-8 text-center text-xs font-semibold text-[#9e9cae]">
            No expense records found for this period.
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-2">
            <!-- SVG Donut Ring -->
            <div class="md:col-span-6 flex items-center justify-center">
              <div class="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center shrink-0">
                <svg class="w-full h-full overflow-visible" viewBox="-30 -30 260 260">
                  <defs>
                    <!-- Smooth Ambient Radial Gradient Glow for Active Category -->
                    <radialGradient v-if="activeHoveredExpenseInfo" id="expense-radial-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" :stop-color="activeHoveredExpenseInfo.color" stop-opacity="0.4" />
                      <stop offset="60%" :stop-color="activeHoveredExpenseInfo.color" stop-opacity="0.15" />
                      <stop offset="100%" :stop-color="activeHoveredExpenseInfo.color" stop-opacity="0" />
                    </radialGradient>

                    <!-- Option A Clockwise Radial Sweep Mask -->
                    <mask id="expense-donut-mask">
                      <circle
                        cx="100"
                        cy="100"
                        r="96"
                        fill="none"
                        stroke="#ffffff"
                        stroke-width="38"
                        stroke-linecap="butt"
                        :stroke-dasharray="603.18"
                        :stroke-dashoffset="603.18 * (1 - expSweepProgress)"
                        style="transform-origin: 100px 100px; transform: rotate(-90deg);"
                      />
                    </mask>
                  </defs>

                  <!-- Ambient Breathing Radial Glow Aura for Active Category -->
                  <circle
                    v-if="activeHoveredExpenseInfo"
                    cx="100"
                    cy="100"
                    r="90"
                    fill="url(#expense-radial-glow)"
                    class="animate-breathe-glow transition-all duration-700 pointer-events-none origin-[100px_100px]"
                  />

                  <!-- Donut Slices Group with Snap-to-Top Rotation -->
                  <g 
                    class="transition-transform duration-700 ease-out origin-[100px_100px]"
                    :style="{
                      transformOrigin: '100px 100px',
                      transform: expenseChartRotationTransform
                    }"
                  >
                    <!-- Segmented Category Donut Paths -->
                    <g mask="url(#expense-donut-mask)" :style="{ opacity: expSweepProgress > 0.01 ? 1 : 0, transition: 'opacity 0.15s ease-out' }">
                      <g
                        v-for="segment in expensePiePaths"
                        :key="segment.name"
                        class="cursor-pointer"
                        @mouseenter="hoveredExpenseIndex = segment.originalIndex"
                        @mouseleave="hoveredExpenseIndex = null"
                        @click="toggleSelectExpenseCategory(segment.originalIndex)"
                      >
                        <path :d="segment.hitD" fill="transparent" />
                        <path
                          :d="segment.d"
                          :fill="segment.color"
                          class="transition-all duration-300 pointer-events-none"
                          :style="{
                            transformOrigin: '100px 100px',
                            transform: activeExpenseIndex === segment.originalIndex ? 'scale(1.07)' : 'scale(1)',
                            opacity: activeExpenseIndex === null || activeExpenseIndex === segment.originalIndex ? 1 : 0.35
                          }"
                        />
                      </g>
                    </g>
                  </g>
                </svg>

                <!-- Center Readout (Count-up on month switch) -->
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-3">
                  <span class="text-xs font-semibold text-[#9e9cae] truncate max-w-[130px]">
                    {{ activeHoveredExpenseInfo ? activeHoveredExpenseInfo.name : 'Total Spent' }}
                  </span>
                  <div class="text-xl sm:text-2xl font-black text-[#f1f0f5] tabular-nums tracking-tight mt-0.5">
                    <span class="text-sm text-[#9e9cae] font-bold">{{ currencySymbol }}</span>{{ formatAmount(activeHoveredExpenseInfo ? activeHoveredExpenseInfo.amount : (isChartLoading ? animatedExpenseAmount : totalFilteredCategoryExpense)) }}
                  </div>
                  <span v-if="activeHoveredExpenseInfo" class="text-xs font-bold text-[#FFD1B3] mt-0.5 px-2 py-0.5 rounded-full bg-[#FFD1B3]/10 border border-[#FFD1B3]/20">
                    {{ activeHoveredExpenseInfo.percentage }}% of total
                  </span>
                </div>
              </div>
            </div>

            <!-- Interactive Borderless Legend List (Natural Page Flow, No Scroll Hijack) -->
            <TransitionGroup 
              name="flip-list" 
              tag="div" 
              class="md:col-span-6 space-y-1.5 p-1"
            >
              <div 
                v-for="item in activeExpenseLegendItems"
                :key="item.name"
                @mouseenter="hoveredExpenseIndex = item.originalIndex"
                @mouseleave="hoveredExpenseIndex = null"
                @click="toggleSelectExpenseCategory(item.originalIndex)"
                class="flex items-center justify-between py-2 px-2.5 rounded-xl border transition-all duration-200 cursor-pointer"
                :class="activeExpenseIndex === item.originalIndex ? 'bg-[#141520] border-[#D4BFFF]' : 'hover:bg-[#141520] border-transparent'"
              >
                <!-- Left: Material Symbol Icon + Category Name -->
                <div class="flex items-center gap-2.5 min-w-0">
                  <span 
                    class="material-symbols-outlined text-xs leading-none shrink-0 transition-transform duration-200"
                    :style="{ 
                      color: item.color
                    }"
                  >
                    {{ resolveIcon(item.icon, 'category') }}
                  </span>
                  <span class="text-xs font-bold text-[#f1f0f5] truncate leading-none">{{ item.name }}</span>
                </div>

                <!-- Right: Percentage Badge + Amount -->
                <div class="flex items-center gap-2.5 shrink-0 tabular-nums">
                  <span class="text-[10px] font-bold text-[#9e9cae] bg-[#141520] px-2 py-0.5 rounded-md border border-[#1f202e]">{{ item.percentage }}%</span>
                  <span class="text-xs sm:text-sm font-bold text-[#f1f0f5]">
                    {{ currencySymbol }}{{ formatAmount(item.amount) }}
                  </span>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </section>

        <!-- Income Breakdown Donut Chart Section (Flat Seamless Surface) -->
        <section 
          v-if="chartViewMode === 'both' || chartViewMode === 'income'"
          class="p-1 space-y-3"
        >
          <div class="border-b border-[#1f202e] pb-2">
            <h2 class="text-sm font-bold text-[#f1f0f5] tracking-tight">Income Breakdown</h2>
          </div>

          <div v-if="incomePiePaths.length === 0" class="p-8 text-center text-xs font-semibold text-[#9e9cae]">
            No income records found for this period.
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-2">
            <!-- SVG Donut Ring -->
            <div class="md:col-span-6 flex items-center justify-center">
              <div class="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center shrink-0">
                <svg class="w-full h-full overflow-visible" viewBox="-30 -30 260 260">
                  <defs>
                    <!-- Smooth Ambient Radial Gradient Glow for Active Category -->
                    <radialGradient v-if="activeHoveredIncomeInfo" id="income-radial-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" :stop-color="activeHoveredIncomeInfo.color" stop-opacity="0.4" />
                      <stop offset="60%" :stop-color="activeHoveredIncomeInfo.color" stop-opacity="0.15" />
                      <stop offset="100%" :stop-color="activeHoveredIncomeInfo.color" stop-opacity="0" />
                    </radialGradient>

                    <!-- Option A Clockwise Radial Sweep Mask -->
                    <mask id="income-donut-mask">
                      <circle
                        cx="100"
                        cy="100"
                        r="96"
                        fill="none"
                        stroke="#ffffff"
                        stroke-width="38"
                        stroke-linecap="butt"
                        :stroke-dasharray="603.18"
                        :stroke-dashoffset="603.18 * (1 - incSweepProgress)"
                        style="transform-origin: 100px 100px; transform: rotate(-90deg);"
                      />
                    </mask>
                  </defs>

                  <!-- Ambient Breathing Radial Glow Aura for Active Category -->
                  <circle
                    v-if="activeHoveredIncomeInfo"
                    cx="100"
                    cy="100"
                    r="90"
                    fill="url(#income-radial-glow)"
                    class="animate-breathe-glow transition-all duration-700 pointer-events-none origin-[100px_100px]"
                  />

                  <!-- Donut Slices Group with Snap-to-Top Rotation -->
                  <g 
                    class="transition-transform duration-700 ease-out origin-[100px_100px]"
                    :style="{
                      transformOrigin: '100px 100px',
                      transform: incomeChartRotationTransform
                    }"
                  >
                    <!-- Segmented Category Donut Paths -->
                    <g mask="url(#income-donut-mask)" :style="{ opacity: incSweepProgress > 0.01 ? 1 : 0, transition: 'opacity 0.15s ease-out' }">
                      <g
                        v-for="segment in incomePiePaths"
                        :key="segment.name"
                        class="cursor-pointer"
                        @mouseenter="hoveredIncomeIndex = segment.originalIndex"
                        @mouseleave="hoveredIncomeIndex = null"
                        @click="toggleSelectIncomeCategory(segment.originalIndex)"
                      >
                        <path :d="segment.hitD" fill="transparent" />
                        <path
                          :d="segment.d"
                          :fill="segment.color"
                          class="transition-all duration-300 pointer-events-none"
                          :style="{
                            transformOrigin: '100px 100px',
                            transform: activeIncomeIndex === segment.originalIndex ? 'scale(1.07)' : 'scale(1)',
                            opacity: activeIncomeIndex === null || activeIncomeIndex === segment.originalIndex ? 1 : 0.35
                          }"
                        />
                      </g>
                    </g>
                  </g>
                </svg>

                <!-- Center Readout (Count-up on month switch) -->
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-3">
                  <span class="text-xs font-semibold text-[#9e9cae] truncate max-w-[130px]">
                    {{ activeHoveredIncomeInfo ? activeHoveredIncomeInfo.name : 'Income' }}
                  </span>
                  <div class="text-xl sm:text-2xl font-bold text-[#B3F5E1] tabular-nums tracking-tight mt-0.5">
                    <span class="text-sm text-[#9e9cae] font-bold">{{ currencySymbol }}</span>{{ formatAmount(activeHoveredIncomeInfo ? activeHoveredIncomeInfo.amount : (isChartLoading ? animatedIncomeAmount : totalFilteredCategoryIncome)) }}
                  </div>
                  <span v-if="activeHoveredIncomeInfo" class="text-xs font-bold text-[#B3F5E1] mt-0.5 px-2 py-0.5 rounded-full bg-[#B3F5E1]/10 border border-[#B3F5E1]/20">
                    {{ activeHoveredIncomeInfo.percentage }}% of total
                  </span>
                </div>
              </div>
            </div>

            <!-- Interactive Borderless Legend List (Natural Page Flow, No Scroll Hijack) -->
            <TransitionGroup 
              name="flip-list" 
              tag="div" 
              class="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 p-1"
            >
              <div 
                v-for="item in activeIncomeLegendItems"
                :key="item.name"
                @mouseenter="hoveredIncomeIndex = item.originalIndex"
                @mouseleave="hoveredIncomeIndex = null"
                @click="toggleSelectIncomeCategory(item.originalIndex)"
                class="flex items-center justify-between py-1.5 px-2 rounded-xl border transition-all duration-200 cursor-pointer"
                :class="activeIncomeIndex === item.originalIndex ? 'bg-[#141520] border-[#B3F5E1]' : 'hover:bg-[#141520] border-transparent'"
              >
                <!-- Left: Material Symbol Icon + Category Name -->
                <div class="flex items-center gap-2 min-w-0">
                  <span 
                    class="material-symbols-outlined text-xs leading-none shrink-0 transition-transform duration-200"
                    :style="{ 
                      color: item.color
                    }"
                  >
                    {{ resolveIcon(item.icon, 'category') }}
                  </span>
                  <span class="text-xs font-bold text-[#f1f0f5] truncate leading-none">{{ item.name }}</span>
                </div>

                <!-- Right: Percentage + Amount -->
                <div class="flex items-center gap-2 shrink-0 tabular-nums">
                  <span class="text-[10px] font-semibold text-[#9e9cae] bg-[#141520] px-1.5 py-0.2 rounded-md border border-[#1f202e]">{{ item.percentage }}%</span>
                  <span class="text-xs font-bold text-[#B3F5E1]">
                    {{ currencySymbol }}{{ formatAmount(item.amount) }}
                  </span>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </section>
      </div>
    </div>



    <!-- 4. Grouped / Flat Transaction Records List (Flush, Hairline Dividers) -->
    <div id="history-records-section" v-if="displayedTransactions.length > 0" class="space-y-4 animate-cascade-3">
      <!-- Flat Continuous List for Amount Sorting -->
      <div v-if="isAmountSort" class="space-y-0">
        <div class="flex items-center justify-between px-1 py-2 border-b border-[#1f202e] text-xs font-semibold sticky top-13 z-10 bg-[#0c0d14]/95 backdrop-blur-md">
          <span class="text-[#D4BFFF] font-bold tracking-tight flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm">{{ sortBy === 'amount_desc' ? 'arrow_upward' : 'arrow_downward' }}</span>
            <span>{{ sortBy === 'amount_desc' ? 'Sorted by Highest Amount' : 'Sorted by Lowest Amount' }}</span>
          </span>
          <span class="text-[#9e9cae] text-[11px] font-medium">{{ displayedTransactions.length }} records</span>
        </div>

        <div class="divide-y divide-[#1f202e] border-b border-[#1f202e]">
          <div 
            v-for="tx in displayedTransactions" 
            :key="tx.id" 
            @click="viewTransactionDetails(tx)"
            class="py-3 px-1 hover:bg-[#141520] transition cursor-pointer flex items-center justify-between gap-3 min-h-[48px] active:bg-[#141520]"
          >
            <!-- Left: Square Icon Tile & Description -->
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="w-8 h-8 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-base leading-none" :style="{ color: getCategoryColor(tx.category_id) }">{{ resolveIcon(getBucketIcon(tx.bucket_id) !== '🪣' ? getBucketIcon(tx.bucket_id) : getCategoryIcon(tx.category_id), 'savings') }}</span>
              </div>

              <!-- Center: Description & Metadata -->
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-[#f1f0f5] truncate leading-tight">{{ tx.description || 'No description' }}</p>
                <div class="flex items-center gap-1.5 text-[10px] text-[#9e9cae] truncate mt-0.5">
                  <span class="font-semibold text-[#D4BFFF] shrink-0">{{ formatDate(tx.date) }}</span>
                  <span>•</span>
                  <span class="inline-flex items-center gap-1 min-w-0">
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: getCategoryColor(tx.category_id) }"></span>
                    <span class="truncate font-medium text-[#9e9cae]">{{ getCategoryName(tx.category_id) }}</span>
                  </span>
                  <span>•</span>
                  <span class="truncate text-[#9e9cae] font-medium">{{ getAccountName(tx.account_id) }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Amount & Actions -->
            <div class="flex items-center gap-2 shrink-0 text-right">
              <span class="text-xs sm:text-sm font-bold block tabular-nums" :class="transactionAmountClass(tx)">
                {{ transactionSign(tx) }}{{ currencySymbol }}{{ formatAmount(tx.amount) }}
              </span>

              <!-- Desktop Action Buttons -->
              <div class="hidden sm:flex gap-1 items-center ml-1">
                <button @click.stop="$emit('edit-transaction', tx)" class="p-1 text-[#D4BFFF] hover:text-white transition cursor-pointer" title="Edit">
                  <span class="material-symbols-outlined text-sm">edit</span>
                </button>
                <button @click.stop="confirmDelete(tx)" class="p-1 text-[#FFD1B3] hover:text-rose-300 transition cursor-pointer" title="Delete">
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Date-Grouped List for Date Sorting (Newest / Oldest First) -->
      <template v-else>
        <div 
          v-for="group in groupedTransactionsByDate" 
          :key="group.dateStr" 
          class="space-y-0"
        >
          <!-- Group Date Header (Flush, sticky background) -->
          <div class="flex items-center justify-between px-1 py-2 border-b border-[#1f202e] text-xs font-semibold sticky top-13 z-10 bg-[#0c0d14]/95 backdrop-blur-md">
            <span class="text-[#f1f0f5] font-bold tracking-tight">{{ formatDateHeader(group.dateStr) }}</span>
            <div class="flex items-center gap-2 tabular-nums text-xs font-semibold">
              <span v-if="group.totalExpense > 0" class="text-[#9e9cae]">Spent: <span class="text-[#f1f0f5]">{{ currencySymbol }}{{ formatAmount(group.totalExpense) }}</span></span>
              <span v-if="group.totalIncome > 0" class="text-[#B3F5E1]">Income: {{ currencySymbol }}{{ formatAmount(group.totalIncome) }}</span>
            </div>
          </div>

          <!-- Group Records Hairline List -->
          <div class="divide-y divide-[#1f202e] border-b border-[#1f202e]">
            <div 
              v-for="tx in group.transactions" 
              :key="tx.id" 
              @click="viewTransactionDetails(tx)"
              class="py-3 px-1 hover:bg-[#141520] transition cursor-pointer flex items-center justify-between gap-3 min-h-[48px] active:bg-[#141520]"
            >
              <!-- Left: Square Icon Tile & Description -->
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-8 h-8 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-base leading-none" :style="{ color: getCategoryColor(tx.category_id) }">{{ resolveIcon(getBucketIcon(tx.bucket_id) !== '🪣' ? getBucketIcon(tx.bucket_id) : getCategoryIcon(tx.category_id), 'savings') }}</span>
                </div>

                <!-- Center: Description & Metadata -->
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold text-[#f1f0f5] truncate leading-tight">{{ tx.description || 'No description' }}</p>
                  <div class="flex items-center gap-1.5 text-[10px] text-[#9e9cae] truncate mt-0.5">
                    <span class="inline-flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: getCategoryColor(tx.category_id) }"></span>
                      <span class="truncate font-medium text-[#9e9cae]">{{ getCategoryName(tx.category_id) }}</span>
                    </span>
                    <span>•</span>
                    <span class="truncate text-[#9e9cae] font-medium">{{ getAccountName(tx.account_id) }}</span>
                  </div>
                </div>
              </div>

              <!-- Right: Amount & Actions -->
              <div class="flex items-center gap-2 shrink-0 text-right">
                <span class="text-xs sm:text-sm font-bold block tabular-nums" :class="transactionAmountClass(tx)">
                  {{ transactionSign(tx) }}{{ currencySymbol }}{{ formatAmount(tx.amount) }}
                </span>

                <!-- Desktop Action Buttons -->
                <div class="hidden sm:flex gap-1 items-center ml-1">
                  <button @click.stop="$emit('edit-transaction', tx)" class="p-1 text-[#D4BFFF] hover:text-white transition cursor-pointer" title="Edit">
                    <span class="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button @click.stop="confirmDelete(tx)" class="p-1 text-[#FFD1B3] hover:text-rose-300 transition cursor-pointer" title="Delete">
                    <span class="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 5. Desktop Data Table Section (Visible on >= sm) -->
    <div class="hidden sm:block bg-[#131b2e] border border-[#31394d] rounded-xl shadow-sm overflow-hidden">
      <div class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-[#31394d] text-[10px] font-bold text-[#ccc3d8] uppercase tracking-wider bg-[#0b1326]">
              <th class="py-2.5 px-3 pl-4 whitespace-nowrap">Date</th>
              <th class="py-2.5 px-3">Description</th>
              <th class="py-2.5 px-3">Bucket</th>
              <th class="py-2.5 px-3">Account</th>
              <th class="py-2.5 px-3">Category</th>
              <th class="py-2.5 px-3">Type</th>
              <th class="py-2.5 px-3 text-right">Amount</th>
              <th class="py-2.5 px-3 pr-4 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#31394d]/40">
            <tr 
              v-for="tx in displayedTransactions" 
              :key="tx.id" 
              @click="viewTransactionDetails(tx)"
              class="hover:bg-[#171f33]/90 transition cursor-pointer min-h-[44px]"
            >
              <td class="py-2.5 px-3 pl-4 text-xs text-[#ccc3d8] whitespace-nowrap font-mono">
                {{ formatDate(tx.date) }}
              </td>

              <td class="py-2.5 px-3 text-xs">
                <p class="font-bold text-[#dae2fd] break-words whitespace-normal leading-snug">{{ tx.description || 'No description' }}</p>
                <p v-if="tx.notes" class="text-[10px] text-[#ccc3d8] break-words whitespace-normal leading-snug mt-0.5">{{ tx.notes }}</p>
              </td>

              <td class="py-2.5 px-3 text-xs">
                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#0b1326] text-[#d2bbff] border border-[#31394d] text-[10px] font-semibold">
                  <span class="material-symbols-outlined text-xs leading-none" :style="{ color: getBucketColor(tx.bucket_id) }">{{ resolveIcon(getBucketIcon(tx.bucket_id), 'savings') }}</span>
                  <span class="break-words">{{ getBucketName(tx.bucket_id) }}</span>
                </span>
              </td>

              <td class="py-2.5 px-3 text-xs text-[#ccc3d8]">
                <span class="font-medium break-words">{{ getAccountName(tx.account_id) }}</span>
              </td>

              <td class="py-2.5 px-3 text-xs">
                <span class="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-[#0b1326] text-[#dae2fd] text-[10px] font-semibold border border-[#31394d]">
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: getCategoryColor(tx.category_id) }"></span>
                  <span class="break-words">{{ getCategoryName(tx.category_id) }}</span>
                </span>
              </td>

              <td class="py-2.5 px-3 text-xs whitespace-nowrap">
                <span 
                  class="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  :class="transactionBadgeClass(tx)"
                >
                  {{ transactionLabel(tx) }}
                </span>
              </td>

              <td 
                class="py-2.5 px-3 text-right text-xs font-bold whitespace-nowrap tabular-nums"
                :class="transactionAmountClass(tx)"
              >
                {{ transactionSign(tx) }}{{ currencySymbol }}{{ formatAmount(tx.amount) }}
              </td>

              <td class="py-2.5 px-3 pr-4 text-center whitespace-nowrap">
                <div class="flex justify-center items-center gap-2">
                  <button 
                    @click.stop="$emit('edit-transaction', tx)"
                    class="text-[11px] font-bold text-[#d2bbff] hover:text-white transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button 
                    @click.stop="confirmDelete(tx)"
                    class="text-[11px] font-bold text-[#ffb4ab] hover:text-rose-300 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="displayedTransactions.length === 0">
              <td colspan="8" class="text-center py-8 text-xs text-[#ccc3d8]">
                No transaction records found matching your filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 6. Transaction Details Modal Sheet (Hairline Divide with Smooth Spring Transition) -->
    <Transition name="modal-sheet">
      <div 
        v-if="selectedTransactionForView"
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0c0d14]/95 backdrop-blur-md"
        @click.self="closeViewModal"
      >
        <div class="modal-sheet-card relative w-full max-w-md bg-[#0c0d14] border-t sm:border border-[#1f202e] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] pb-6 sm:pb-0 my-0 sm:my-auto">
          <!-- Modal Header -->
          <div class="flex justify-between items-center px-5 py-3.5 border-b border-[#1f202e] bg-[#0c0d14]">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-base leading-none" :style="{ color: getBucketColor(selectedTransactionForView.bucket_id) }">{{ resolveIcon(getBucketIcon(selectedTransactionForView.bucket_id), 'savings') }}</span>
              </div>
              <div>
                <h3 class="text-sm font-bold text-[#f1f0f5]">
                  {{ isEditingInModal ? 'Edit Transaction' : 'Transaction Details' }}
                </h3>
                <p class="text-[10px] text-[#9e9cae]">
                  {{ isEditingInModal ? 'Update transaction details below' : 'Complete record breakdown' }}
                </p>
              </div>
            </div>
            <button 
              @click="closeViewModal"
              class="text-[#9e9cae] hover:text-[#f1f0f5] transition cursor-pointer p-1"
            >
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <!-- Modal Body (View Mode) -->
          <div v-if="!isEditingInModal" class="p-5 space-y-4">
            <div class="bg-[#0f1019] border border-[#1f202e] rounded-xl p-4 text-center space-y-1">
              <span 
                class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1"
                :class="transactionBadgeClass(selectedTransactionForView)"
              >
                {{ transactionLabel(selectedTransactionForView) }}
              </span>
              <div 
                class="text-2xl font-bold tabular-nums tracking-tight"
                :class="transactionAmountClass(selectedTransactionForView)"
              >
                {{ transactionSign(selectedTransactionForView) }}{{ currencySymbol }}{{ formatAmount(selectedTransactionForView.amount) }}
              </div>
              <p class="text-xs font-bold text-[#f1f0f5] break-words pt-1">
                {{ selectedTransactionForView.description || 'No Description' }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-2.5 text-xs">
              <div class="bg-[#0f1019] border border-[#1f202e] rounded-xl p-3 space-y-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#9e9cae]">Category</span>
                <div class="flex items-center gap-1.5 pt-0.5">
                  <span class="material-symbols-outlined text-sm leading-none shrink-0" :style="{ color: getCategoryColor(selectedTransactionForView.category_id) }">{{ resolveIcon(getCategoryIcon(selectedTransactionForView.category_id), 'category') }}</span>
                  <span class="font-bold text-[#f1f0f5] break-words">{{ getCategoryName(selectedTransactionForView.category_id) }}</span>
                </div>
              </div>

              <div class="bg-[#0f1019] border border-[#1f202e] rounded-xl p-3 space-y-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#9e9cae]">Date</span>
                <p class="font-bold text-[#f1f0f5] pt-0.5">{{ formatDate(selectedTransactionForView.date) }}</p>
              </div>

              <div class="bg-[#0f1019] border border-[#1f202e] rounded-xl p-3 space-y-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#9e9cae]">Storage Account</span>
                <p class="font-bold text-[#f1f0f5] break-words pt-0.5">{{ getAccountName(selectedTransactionForView.account_id) }}</p>
              </div>

              <div class="bg-[#0f1019] border border-[#1f202e] rounded-xl p-3 space-y-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#9e9cae]">Bucket</span>
                <div class="flex items-center gap-1.5 pt-0.5">
                  <span class="material-symbols-outlined text-sm leading-none shrink-0" :style="{ color: getBucketColor(selectedTransactionForView.bucket_id) }">{{ resolveIcon(getBucketIcon(selectedTransactionForView.bucket_id), 'savings') }}</span>
                  <span class="font-bold text-[#f1f0f5] break-words">{{ getBucketName(selectedTransactionForView.bucket_id) }}</span>
                </div>
              </div>
            </div>

            <div class="bg-[#0f1019] border border-[#1f202e] rounded-xl p-3 space-y-1 text-xs">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#9e9cae]">Additional Notes / Description</span>
              <p v-if="selectedTransactionForView.notes" class="text-[#f1f0f5] leading-relaxed break-words pt-0.5 font-medium">
                {{ selectedTransactionForView.notes }}
              </p>
              <p v-else class="text-[#9e9cae]/50 italic text-xs font-medium pt-0.5">
                N/A
              </p>
            </div>
          </div>

          <!-- Modal Body (Inline Edit Mode) -->
          <div v-else class="p-4 space-y-3">
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">Description / Title</label>
              <input 
                v-model="editForm.description"
                type="text"
                placeholder="e.g. Dinner, Grocery Shopping..."
                class="w-full h-8 px-2.5 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-lg text-xs text-[#f1f0f5] placeholder-[#9e9cae]/40 focus:outline-none transition"
              />
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">Amount (₹)</label>
                <input 
                  v-model.number="editForm.amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  class="w-full h-8 px-2.5 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-lg text-xs text-[#f1f0f5] placeholder-[#9e9cae]/40 focus:outline-none transition tabular-nums"
                />
              </div>

              <div class="space-y-1">
                <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">Type</label>
                <select 
                  v-model="editForm.transaction_type"
                  class="w-full h-8 px-2 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-lg text-xs text-[#f1f0f5] focus:outline-none transition cursor-pointer"
                >
                  <option value="expense" class="bg-[#0c0d14]">Expense</option>
                  <option value="income" class="bg-[#0c0d14]">Income</option>
                  <option value="adjustment" class="bg-[#0c0d14]">Adjustment</option>
                  <option value="transfer" class="bg-[#0c0d14]">Transfer</option>
                </select>
              </div>
            </div>

            <!-- Include on Pie Chart Slider Toggle (Visible ONLY when transaction_type === 'adjustment') -->
            <div v-if="editForm.transaction_type === 'adjustment'" class="p-3 bg-[#0f1019] border border-[#1f202e] rounded-xl flex items-center justify-between gap-3">
              <div>
                <p class="text-xs font-bold text-[#f1f0f5]">Include in Pie Charts & Analytics?</p>
                <p class="text-[10px] text-[#9e9cae]">Include this adjustment in pie chart analytics & daily totals</p>
              </div>
              <button
                type="button"
                @click="editForm.include_in_chart = editForm.include_in_chart === 1 ? 0 : 1"
                class="w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer p-0.5"
                :class="editForm.include_in_chart === 1 ? 'bg-[#a855f7]' : 'bg-[#191924] border border-[#1f202e]'"
              >
                <span
                  class="block w-5 h-5 rounded-full transition-transform"
                  :class="editForm.include_in_chart === 1 ? 'translate-x-5 bg-white' : 'translate-x-0 bg-[#9e9cae]'"
                ></span>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <CategoryPicker 
                :categories="categories" 
                v-model="editForm.category_id" 
                label="Category" 
                title="Select Category"
                placeholder="Choose Category"
              />
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">Storage Account</label>
                <select 
                  v-model="editForm.account_id"
                  class="w-full h-8 px-2 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-lg text-xs text-[#f1f0f5] focus:outline-none transition cursor-pointer"
                >
                  <option v-for="acc in accounts" :key="acc.id" :value="acc.id" class="bg-[#0c0d14]">
                    {{ acc.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">Savings Bucket</label>
                <select 
                  v-model="editForm.bucket_id"
                  class="w-full h-8 px-2 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-lg text-xs text-[#f1f0f5] focus:outline-none transition cursor-pointer"
                >
                  <option value="" class="bg-[#0c0d14]">No Bucket</option>
                  <option v-for="b in buckets" :key="b.id" :value="b.id" class="bg-[#0c0d14]">
                    {{ b.name }}
                  </option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">Date</label>
                <input 
                  v-model="editForm.date"
                  type="date"
                  @click="$event.target.showPicker?.()"
                  class="w-full h-8 px-2.5 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-lg text-xs text-[#f1f0f5] focus:outline-none transition cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider">Additional Notes</label>
              <textarea 
                v-model="editForm.notes"
                rows="2"
                placeholder="Add optional transaction notes..."
                class="w-full p-2 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-lg text-xs text-[#f1f0f5] placeholder-[#9e9cae]/40 focus:outline-none transition"
              ></textarea>
            </div>
          </div>

          <!-- Modal Footer Actions (View Mode) -->
          <div v-if="!isEditingInModal" class="flex items-center gap-2.5 p-3.5 bg-[#0c0d14] border-t border-[#1f202e]">
            <button 
              @click="startModalEdit" 
              class="flex-1 h-9 px-3 rounded-xl bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span class="material-symbols-outlined text-sm">edit</span>
              <span>Edit Record</span>
            </button>
            <button 
              @click="deleteFromModal" 
              class="h-9 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:bg-rose-950/30 dark:border-rose-800/40 dark:text-rose-300 dark:hover:bg-rose-900/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">delete</span>
              <span>Delete</span>
            </button>
          </div>

          <!-- Modal Footer Actions (Inline Edit Mode) -->
          <div v-else class="flex items-center justify-between gap-2 p-3.5 bg-[#0c0d14] border-t border-[#1f202e]">
            <button 
              @click="deleteFromModal" 
              class="h-8 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:bg-rose-950/30 dark:border-rose-800/40 dark:text-rose-300 dark:hover:bg-rose-900/40 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">delete</span>
              <span>Delete</span>
            </button>
            <div class="flex items-center gap-2">
              <button 
                @click="cancelModalEdit" 
                class="h-8 px-3 rounded-lg bg-[#0f1019] border border-[#1f202e] text-[#9e9cae] text-xs font-bold hover:text-[#f1f0f5] transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                @click="saveModalEdit" 
                class="h-8 px-3.5 rounded-lg bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-md"
              >
                <span class="material-symbols-outlined text-sm">check</span>
                <span>Save Changes</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <!-- Custom App-Styled Delete Transaction Confirmation Modal -->
    <Transition name="modal-fade">
      <div 
        v-if="showDeleteConfirmModal" 
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0c0d14]/95 backdrop-blur-md"
        @click.self="showDeleteConfirmModal = false"
      >
        <div class="relative w-full max-w-sm bg-[#0f1019] border border-[#1f202e] rounded-2xl shadow-2xl p-5 space-y-4 text-left animate-cascade-1">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-xl">delete_forever</span>
            </div>
            <div>
              <h3 class="text-sm font-bold text-[#f1f0f5]">Delete Transaction</h3>
              <p class="text-xs text-[#9e9cae] mt-0.5 leading-snug">
                Are you sure you want to delete <strong class="text-[#f1f0f5]">"{{ txToDelete?.description || 'this transaction' }}"</strong>? This action cannot be undone.
              </p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1f202e]">
            <button 
              type="button" 
              @click="showDeleteConfirmModal = false" 
              class="px-4 py-2 bg-[#141520] hover:bg-[#191924] border border-[#1f202e] text-[#9e9cae] hover:text-[#f1f0f5] text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button" 
              @click="executeDeleteTransaction" 
              class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import CategoryPicker from './CategoryPicker.vue';
import { resolveIcon } from '../utils/iconResolver.js';
import { currencySymbol } from '../utils/currency.js';

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
  },
  summary: {
    type: Object,
    default: () => ({ total_count: 0 })
  }
});

const emit = defineEmits([
  'edit-transaction',
  'edit-transaction-save',
  'delete-transaction'
]);

// Time Mode & Navigation
const timeMode = ref('monthly'); // 'monthly' or 'range'
const currentMonthDate = ref(new Date());
const formattedMonthYear = computed(() => {
  return currentMonthDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});
const rangeTimeChoice = ref('this_month');
const startDateInput = ref('');
const endDateInput = ref('');

const toggleTimeMode = () => {
  timeMode.value = timeMode.value === 'monthly' ? 'range' : 'monthly';
};

// Filter Drawer State & Values
const filteredCategories = computed(() => props.categories.filter(c => c.name !== 'Uncategorized'));
const showFilterDrawer = ref(false);
const showSortModal = ref(false);
const sortBy = ref('date_desc'); // 'date_desc', 'date_asc', 'amount_desc', 'amount_asc'
const sortOptions = [
  { value: 'date_desc', label: 'Newest First', icon: 'schedule' },
  { value: 'date_asc', label: 'Oldest First', icon: 'history' },
  { value: 'amount_desc', label: 'Highest Amount', icon: 'arrow_upward' },
  { value: 'amount_asc', label: 'Lowest Amount', icon: 'arrow_downward' }
];
const isAmountSort = computed(() => sortBy.value === 'amount_desc' || sortBy.value === 'amount_asc');

const filters = ref({
  search: '',
  bucket_ids: [],
  account_ids: [],
  category_ids: [],
  transaction_type: ''
});

// Sleek Custom Range Modal State & Methods
const showCustomRangeModal = ref(false);
const pickerYear = ref(new Date().getFullYear());
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const openCustomRangeModal = () => {
  timeMode.value = 'range';
  pickerYear.value = currentMonthDate.value.getFullYear();
  showCustomRangeModal.value = true;
};

const selectRangeChoice = (choice) => {
  rangeTimeChoice.value = choice;
  showCustomRangeModal.value = false;
};

const changePickerYear = (delta) => {
  pickerYear.value += delta;
};

const selectMonthAndYearModal = (monthIndex) => {
  currentMonthDate.value = new Date(pickerYear.value, monthIndex, 1);
  showCustomRangeModal.value = false;
};

const isCurrentSelectedMonth = (idx) => {
  return currentMonthDate.value.getFullYear() === pickerYear.value && currentMonthDate.value.getMonth() === idx;
};

const jumpToThisMonth = () => {
  const now = new Date();
  currentMonthDate.value = new Date(now.getFullYear(), now.getMonth(), 1);
  pickerYear.value = now.getFullYear();
  showCustomRangeModal.value = false;
};

// Chart View Mode State (Default to 'expense')
const chartViewMode = ref('expense'); // 'expense', 'both', 'income'

// Full Slide Transition State
const slideDirection = ref('next'); // 'next' or 'prev'

// Touch Drag & Gesture Spring Physics Tracking
const touchStartX = ref(0);
const touchStartY = ref(0);
const dragOffset = ref(0);
const isDragging = ref(false);
const isAnimating = ref(false);

const swipeTransformStyle = computed(() => {
  if (isDragging.value) {
    return {
      transform: `translateX(${dragOffset.value}px)`,
      transition: 'none'
    };
  }
  if (isAnimating.value) {
    return {
      transform: `translateX(${dragOffset.value}px)`,
      transition: 'transform 0.26s cubic-bezier(0.16, 1, 0.3, 1)'
    };
  }
  return {
    transform: 'translateX(0px)',
    transition: 'transform 0.26s cubic-bezier(0.16, 1, 0.3, 1)'
  };
});

const changeMonthByOffset = (offset) => {
  expSweepProgress.value = 0;
  incSweepProgress.value = 0;
  animatedExpenseAmount.value = 0;
  animatedIncomeAmount.value = 0;
  isChartLoading.value = true;

  const d = new Date(currentMonthDate.value);
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  currentMonthDate.value = d;
};

const prevMonth = () => {
  slideDirection.value = 'prev';
  changeMonthByOffset(-1);
};

const nextMonth = () => {
  slideDirection.value = 'next';
  changeMonthByOffset(1);
};

const onTouchStart = (e) => {
  const target = e.target;
  if (target && (target.closest('button') || target.closest('select') || target.closest('input') || target.closest('a'))) {
    return;
  }
  const touch = e.touches ? e.touches[0] : e;
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
  dragOffset.value = 0;
  isDragging.value = true;
  isAnimating.value = false;
};

const onTouchMove = (e) => {
  if (!isDragging.value) return;
  const touch = e.touches ? e.touches[0] : e;
  const deltaX = touch.clientX - touchStartX.value;
  const deltaY = touch.clientY - touchStartY.value;

  if (Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
    dragOffset.value = deltaX;
  }
};

const onTouchEnd = (e) => {
  if (!isDragging.value) return;
  const touch = e.changedTouches ? e.changedTouches[0] : (e.touches ? e.touches[0] : e);
  const deltaX = touch ? touch.clientX - touchStartX.value : dragOffset.value;
  const deltaY = touch ? touch.clientY - touchStartY.value : 0;

  isDragging.value = false;

  const threshold = 45;
  if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
    const isNext = deltaX < 0;
    slideDirection.value = isNext ? 'next' : 'prev';

    isAnimating.value = true;
    // Step 1: Smoothly slide current month container off-screen in swipe direction with spring physics
    dragOffset.value = isNext ? -360 : 360;

    setTimeout(() => {
      // Step 2: Swap month date
      changeMonthByOffset(isNext ? 1 : -1);

      // Step 3: Teleport container off-screen to opposite side without transition
      isAnimating.value = false;
      dragOffset.value = isNext ? 360 : -360;

      nextTick(() => {
        // Step 4: Spring animate in from opposite side to 0
        requestAnimationFrame(() => {
          isAnimating.value = true;
          dragOffset.value = 0;

          setTimeout(() => {
            isAnimating.value = false;
          }, 280);
        });
      });
    }, 180);
  } else {
    // Snap back smoothly to 0 if drag was small
    isAnimating.value = true;
    dragOffset.value = 0;
    setTimeout(() => {
      isAnimating.value = false;
    }, 240);
  }
};

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.search) count++;
  if (filters.value.bucket_ids.length > 0) count += filters.value.bucket_ids.length;
  if (filters.value.account_ids.length > 0) count += filters.value.account_ids.length;
  if (filters.value.category_ids.length > 0) count += filters.value.category_ids.length;
  if (filters.value.transaction_type) count++;
  if (rangeTimeChoice.value === 'custom' && (startDateInput.value || endDateInput.value)) count++;
  return count;
});

const hasActiveFilters = computed(() => activeFilterCount.value > 0);

const clearFilters = () => {
  filters.value = {
    search: '',
    bucket_ids: [],
    account_ids: [],
    category_ids: [],
    transaction_type: ''
  };
  startDateInput.value = '';
  endDateInput.value = '';
  selectedExpenseIndex.value = null;
  selectedIncomeIndex.value = null;
  selectedChartCategoryRecordId.value = null;
};

const resetAllFilters = clearFilters;

// Multi-Select Helpers
const selectAllBuckets = () => {
  filters.value.bucket_ids = [...props.buckets.map(b => b.id), 'unassigned'];
};

const deselectAllBuckets = () => {
  filters.value.bucket_ids = [];
};

const toggleBucketFilter = (bId) => {
  const idx = filters.value.bucket_ids.indexOf(bId);
  if (idx > -1) {
    filters.value.bucket_ids.splice(idx, 1);
  } else {
    filters.value.bucket_ids.push(bId);
  }
};

const selectAllAccounts = () => {
  filters.value.account_ids = props.accounts.map(a => a.id);
};

const deselectAllAccounts = () => {
  filters.value.account_ids = [];
};

const toggleAccountFilter = (accId) => {
  const idx = filters.value.account_ids.indexOf(accId);
  if (idx > -1) {
    filters.value.account_ids.splice(idx, 1);
  } else {
    filters.value.account_ids.push(accId);
  }
};

const selectAllCategories = () => {
  filters.value.category_ids = props.categories.map(c => c.id);
};

const deselectAllCategories = () => {
  filters.value.category_ids = [];
};

const toggleCategoryFilter = (catId) => {
  const idx = filters.value.category_ids.indexOf(catId);
  if (idx > -1) {
    filters.value.category_ids.splice(idx, 1);
  } else {
    filters.value.category_ids.push(catId);
  }
};

const parseYearMonth = (dateStr) => {
  if (!dateStr) return { year: -1, month: -1 };
  const cleanStr = String(dateStr).split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length >= 3) {
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10) - 1,
      day: parseInt(parts[2], 10)
    };
  }
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
};

// Transaction Filtering Logic
const isMatchingTransaction = (t) => {
  if (!t || !t.date) return false;

  // 1. Time Horizon Filter
  let dateMatch = true;
  const tInfo = parseYearMonth(t.date);

  if (timeMode.value === 'monthly') {
    const targetY = currentMonthDate.value.getFullYear();
    const targetM = currentMonthDate.value.getMonth();
    dateMatch = tInfo.year === targetY && tInfo.month === targetM;
  } else {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    switch (rangeTimeChoice.value) {
      case 'this_month':
        dateMatch = tInfo.year === year && tInfo.month === month;
        break;
      case 'last_month': {
        const targetMonth = month === 0 ? 11 : month - 1;
        const targetYear = month === 0 ? year - 1 : year;
        dateMatch = tInfo.year === targetYear && tInfo.month === targetMonth;
        break;
      }
      case 'last_3_months': {
        const threeMonthsAgo = new Date(year, month - 3, 1);
        const tDate = new Date(t.date);
        dateMatch = tDate >= threeMonthsAgo;
        break;
      }
      case 'last_6_months': {
        const sixMonthsAgo = new Date(year, month - 6, 1);
        const tDate = new Date(t.date);
        dateMatch = tDate >= sixMonthsAgo;
        break;
      }
      case 'this_year':
        dateMatch = tInfo.year === year;
        break;
      case 'custom': {
        const cleanDateStr = String(t.date).split('T')[0];
        if (startDateInput.value && cleanDateStr < startDateInput.value) dateMatch = false;
        if (endDateInput.value && cleanDateStr > endDateInput.value) dateMatch = false;
        break;
      }
      default:
        dateMatch = true;
    }
  }

  if (!dateMatch) return false;

  // 2. Search Filter
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase();
    const desc = (t.description || '').toLowerCase();
    const notes = (t.notes || '').toLowerCase();
    if (!desc.includes(q) && !notes.includes(q)) return false;
  }

  // 3. Bucket Filter (Multi-select with Unassigned support)
  if (filters.value.bucket_ids.length > 0) {
    const matchesBucket = filters.value.bucket_ids.some(bId => {
      if (bId === 'unassigned') {
        return !t.bucket_id || t.bucket_id === '' || t.bucket_id === 'unassigned';
      }
      return t.bucket_id === bId;
    });
    if (!matchesBucket) return false;
  }

  // 4. Account Filter (Multi-select)
  if (filters.value.account_ids.length > 0 && !filters.value.account_ids.includes(t.account_id)) {
    return false;
  }

  // 5. Category Filter (Multi-select)
  if (filters.value.category_ids.length > 0 && !filters.value.category_ids.includes(t.category_id)) {
    return false;
  }

  // 6. Type Filter
  if (filters.value.transaction_type && t.transaction_type !== filters.value.transaction_type) {
    return false;
  }

  return true;
};

const selectedChartCategoryRecordId = ref(null);

const allPeriodTransactions = computed(() => {
  return props.transactions.filter(isMatchingTransaction);
});

const displayedTransactions = computed(() => {
  let list = allPeriodTransactions.value;
  if (selectedChartCategoryRecordId.value) {
    list = list.filter(t => t.category_id === selectedChartCategoryRecordId.value);
  }

  return [...list].sort((a, b) => {
    if (sortBy.value === 'date_asc') {
      return new Date(a.date) - new Date(b.date);
    }
    if (sortBy.value === 'amount_desc') {
      return Number(b.amount) - Number(a.amount);
    }
    if (sortBy.value === 'amount_asc') {
      return Number(a.amount) - Number(b.amount);
    }
    // Default: 'date_desc' (Newest first)
    return new Date(b.date) - new Date(a.date);
  });
});

const groupedTransactionsByDate = computed(() => {
  const groups = {};
  displayedTransactions.value.forEach(t => {
    const rawDate = t.date ? String(t.date).split('T')[0] : 'Unknown Date';
    if (!groups[rawDate]) {
      groups[rawDate] = { dateStr: rawDate, transactions: [], totalExpense: 0, totalIncome: 0 };
    }
    groups[rawDate].transactions.push(t);

    // Unallocated Funds deposits/adjustments must NEVER count toward daily summary headers EXCEPT Salary Allocations
    if (t.account_id === 'acc_unallocated_funds') {
      const isSalaryAlloc = Boolean(t.bucket_id) && (t.transaction_type === 'income' || (t.description && t.description.includes('Salary Allocation')));
      if (!isSalaryAlloc) return;
    }

    const isAdjustment = t.transaction_type === 'adjustment' || t.category_id === 'cat_adjustments';
    if (isAdjustment && Number(t.include_in_chart) !== 1) return;

    const amt = Number(t.amount) || 0;
    if (t.transaction_type === 'expense' || (isAdjustment && t.adjustment_direction === 'subtract')) {
      groups[rawDate].totalExpense += amt;
    }
    if (t.transaction_type === 'income' || (isAdjustment && t.adjustment_direction === 'add')) {
      groups[rawDate].totalIncome += amt;
    }
  });

  return Object.values(groups);
});

const formatDateHeader = (dateStr) => {
  if (!dateStr || dateStr === 'Unknown Date') return 'Unknown Date';
  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
  
  const yestObj = new Date();
  yestObj.setDate(yestObj.getDate() - 1);
  const yestStr = `${yestObj.getFullYear()}-${String(yestObj.getMonth() + 1).padStart(2, '0')}-${String(yestObj.getDate()).padStart(2, '0')}`;

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yestStr) return 'Yesterday';

  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

// Category Expense & Income Aggregation for Donut Charts (ALWAYS stays 100% full & intact!)
const filteredCategoryExpenses = computed(() => {
  const map = {};
  allPeriodTransactions.value.forEach(t => {
    if (t.account_id === 'acc_unallocated_funds') {
      const isSalaryAlloc = Boolean(t.bucket_id) && (t.transaction_type === 'income' || (t.description && t.description.includes('Salary Allocation')));
      if (!isSalaryAlloc) return;
    }
    const isAdjustment = t.transaction_type === 'adjustment' || t.category_id === 'cat_adjustments';
    if (isAdjustment && Number(t.include_in_chart) !== 1) return;

    if (t.transaction_type === 'expense' || (isAdjustment && t.adjustment_direction === 'subtract')) {
      const catId = t.category_id || 'cat_adjustments';
      const bName = t.bucket_id ? getBucketName(t.bucket_id) : null;
      const catName = getCategoryName(catId) || bName || (isAdjustment ? 'Adjustments' : 'Uncategorized');
      const catColor = getCategoryColor(catId) || (isAdjustment ? '#a855f7' : '#ef4444');
      const catIcon = getCategoryIcon(catId) || (isAdjustment ? 'tune' : 'category');
      const amt = Number(t.amount) || 0;
      if (!map[catName]) {
        map[catName] = { id: catId, name: catName, color: catColor, icon: catIcon, total: 0 };
      }
      map[catName].total += amt;
    }
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
});

const totalFilteredCategoryExpense = computed(() => {
  return filteredCategoryExpenses.value.reduce((sum, c) => sum + c.total, 0);
});

const filteredCategoryIncome = computed(() => {
  const map = {};
  allPeriodTransactions.value.forEach(t => {
    if (t.account_id === 'acc_unallocated_funds') {
      const isSalaryAlloc = Boolean(t.bucket_id) && (t.transaction_type === 'income' || (t.description && t.description.includes('Salary Allocation')));
      if (!isSalaryAlloc) return;
    }
    const isAdjustment = t.transaction_type === 'adjustment' || t.category_id === 'cat_adjustments';
    if (isAdjustment && Number(t.include_in_chart) !== 1) return;

    if (t.transaction_type === 'income' || (isAdjustment && t.adjustment_direction === 'add')) {
      const catId = t.category_id || 'cat_adjustments';
      const bName = t.bucket_id ? getBucketName(t.bucket_id) : null;
      const catName = getCategoryName(catId) || bName || (isAdjustment ? 'Adjustments' : 'Uncategorized');
      const catColor = getCategoryColor(catId) || (isAdjustment ? '#a855f7' : '#10b981');
      const catIcon = getCategoryIcon(catId) || (isAdjustment ? 'tune' : 'category');
      const amt = Number(t.amount) || 0;
      if (!map[catName]) {
        map[catName] = { id: catId, name: catName, color: catColor, icon: catIcon, total: 0 };
      }
      map[catName].total += amt;
    }
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
});

const totalFilteredCategoryIncome = computed(() => {
  return filteredCategoryIncome.value.reduce((sum, c) => sum + c.total, 0);
});

// Option A: Clockwise Radial Sweep & Count-Up State (750ms Slower & Smoother)
const isChartLoading = ref(false);
const expSweepProgress = ref(1);
const incSweepProgress = ref(1);
const animatedExpenseAmount = ref(0);
const animatedIncomeAmount = ref(0);

const triggerChartLoaderAndCountUp = () => {
  // Step 1: Immediately reset sweep progress & amount to 0%
  isChartLoading.value = true;
  expSweepProgress.value = 0;
  incSweepProgress.value = 0;
  animatedExpenseAmount.value = 0;
  animatedIncomeAmount.value = 0;

  // Step 2: Allow browser to paint the 0% hidden state first before starting the sweep
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const startTime = performance.now();
      const duration = 750; // Ultra smooth 750ms draw

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out quartic for silky smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 4);

        expSweepProgress.value = eased;
        incSweepProgress.value = eased;

        const targetExp = totalFilteredCategoryExpense.value;
        const targetInc = totalFilteredCategoryIncome.value;

        animatedExpenseAmount.value = Math.round((targetExp * eased) * 100) / 100;
        animatedIncomeAmount.value = Math.round((targetInc * eased) * 100) / 100;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          expSweepProgress.value = 1;
          incSweepProgress.value = 1;
          animatedExpenseAmount.value = targetExp;
          animatedIncomeAmount.value = targetInc;
          isChartLoading.value = false;
        }
      };

      requestAnimationFrame(step);
    });
  });
};

watch(currentMonthDate, () => {
  triggerChartLoaderAndCountUp();
}, { immediate: true });

// Expense Donut Reactive Logic
const hoveredExpenseIndex = ref(null);
const selectedExpenseIndex = ref(null);

const activeExpenseIndex = computed(() => {
  return selectedExpenseIndex.value !== null ? selectedExpenseIndex.value : hoveredExpenseIndex.value;
});

const scrollToHistoryRecords = () => {
  setTimeout(() => {
    const el = document.getElementById('history-records-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 50);
};

const toggleSelectExpenseCategory = (idx) => {
  if (selectedExpenseIndex.value === idx) {
    selectedExpenseIndex.value = null;
    hoveredExpenseIndex.value = null;
    selectedChartCategoryRecordId.value = null;
  } else {
    selectedExpenseIndex.value = idx;
    hoveredExpenseIndex.value = idx;
    const item = expensePiePaths.value[idx];
    if (item) {
      selectedChartCategoryRecordId.value = item.id;
    }
  }
};

const activeHoveredExpenseInfo = computed(() => {
  const currentIdx = activeExpenseIndex.value;
  if (currentIdx !== null && expensePiePaths.value[currentIdx]) {
    return expensePiePaths.value[currentIdx];
  }
  return null;
});

// Income Donut Reactive Logic
const hoveredIncomeIndex = ref(null);
const selectedIncomeIndex = ref(null);

const activeIncomeIndex = computed(() => {
  return selectedIncomeIndex.value !== null ? selectedIncomeIndex.value : hoveredIncomeIndex.value;
});

const toggleSelectIncomeCategory = (idx) => {
  if (selectedIncomeIndex.value === idx) {
    selectedIncomeIndex.value = null;
    hoveredIncomeIndex.value = null;
    selectedChartCategoryRecordId.value = null;
  } else {
    selectedIncomeIndex.value = idx;
    hoveredIncomeIndex.value = idx;
    const item = incomePiePaths.value[idx];
    if (item) {
      selectedChartCategoryRecordId.value = item.id;
    }
  }
};

const activeHoveredIncomeInfo = computed(() => {
  const currentIdx = activeIncomeIndex.value;
  if (currentIdx !== null && incomePiePaths.value[currentIdx]) {
    return incomePiePaths.value[currentIdx];
  }
  return null;
});

// Snap-to-Top Rotation Transforms (Static at 0deg when idle, snaps to 12 o'clock on selection)
const expenseChartRotationTransform = computed(() => {
  const currentIdx = activeExpenseIndex.value;
  if (currentIdx === null) return 'rotate(0deg)';
  const segment = expensePiePaths.value.find(s => s.originalIndex === currentIdx);
  if (!segment || segment.midAngle === undefined) return 'rotate(0deg)';
  
  const midAngleDeg = (segment.midAngle * 180) / Math.PI;
  const rot = -90 - midAngleDeg;
  return `rotate(${rot}deg)`;
});

const incomeChartRotationTransform = computed(() => {
  const currentIdx = activeIncomeIndex.value;
  if (currentIdx === null) return 'rotate(0deg)';
  const segment = incomePiePaths.value.find(s => s.originalIndex === currentIdx);
  if (!segment || segment.midAngle === undefined) return 'rotate(0deg)';
  
  const midAngleDeg = (segment.midAngle * 180) / Math.PI;
  const rot = -90 - midAngleDeg;
  return `rotate(${rot}deg)`;
});

// Donut Chart SVG Arc Calculation Helper
const generatePiePaths = (items, totalSum) => {
  if (!totalSum || items.length === 0) return [];

  const cx = 100;
  const cy = 100;
  const outerR = 103;
  const innerR = 89;
  const hitOuterR = 118;
  const hitInnerR = 74;

  let currentAngle = -Math.PI / 2;

  return items.map((item, idx) => {
    const fraction = item.total / totalSum;
    const angleSpan = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    const midAngle = startAngle + angleSpan / 2;
    const percentage = Math.round(fraction * 100);
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
};

const expensePiePaths = computed(() => {
  return generatePiePaths(filteredCategoryExpenses.value, totalFilteredCategoryExpense.value);
});

const activeExpenseLegendItems = computed(() => {
  return expensePiePaths.value;
});

const incomePiePaths = computed(() => {
  return generatePiePaths(filteredCategoryIncome.value, totalFilteredCategoryIncome.value);
});

const activeIncomeLegendItems = computed(() => {
  return incomePiePaths.value;
});

// Transaction Modal State & Logic
const selectedTransactionForView = ref(null);
const isEditingInModal = ref(false);
const editForm = ref({
  description: '',
  notes: '',
  amount: 0,
  date: '',
  category_id: '',
  account_id: '',
  bucket_id: '',
  transaction_type: 'expense',
  include_in_chart: 0
});

const viewTransactionDetails = (tx) => {
  selectedTransactionForView.value = tx;
  isEditingInModal.value = false;
  editForm.value = {
    description: tx.description || '',
    notes: tx.notes || '',
    amount: Number(tx.amount) || 0,
    date: tx.date ? String(tx.date).split('T')[0] : '',
    category_id: tx.category_id || '',
    account_id: tx.account_id || '',
    bucket_id: tx.bucket_id || '',
    transaction_type: tx.transaction_type || 'expense',
    include_in_chart: Number(tx.include_in_chart) === 1 ? 1 : 0
  };
};

const closeViewModal = () => {
  selectedTransactionForView.value = null;
  isEditingInModal.value = false;
};

const startModalEdit = () => {
  const tx = selectedTransactionForView.value;
  if (!tx) return;
  closeViewModal();
  emit('edit-transaction', tx);
};

const cancelModalEdit = () => {
  isEditingInModal.value = false;
};

const saveModalEdit = () => {
  const tx = selectedTransactionForView.value;
  if (!tx) return;
  emit('edit-transaction-save', {
    id: tx.id,
    payload: { ...editForm.value }
  });
  closeViewModal();
};

const deleteFromModal = () => {
  const tx = selectedTransactionForView.value;
  if (!tx) return;
  confirmDelete(tx);
  closeViewModal();
};

const showDeleteConfirmModal = ref(false);
const txToDelete = ref(null);

const confirmDelete = (tx) => {
  txToDelete.value = tx;
  showDeleteConfirmModal.value = true;
};

const executeDeleteTransaction = () => {
  if (txToDelete.value) {
    emit('delete-transaction', txToDelete.value.id);
  }
  showDeleteConfirmModal.value = false;
  txToDelete.value = null;
};

// Computed O(1) Lookup Maps for High Performance
const categoryMap = computed(() => new Map(props.categories.map(c => [c.id, c])));
const accountMap = computed(() => new Map(props.accounts.map(a => [a.id, a])));
const bucketMap = computed(() => new Map(props.buckets.map(b => [b.id, b])));

// Helper Lookup Methods (O(1) Speed)
const getCategoryName = (id) => categoryMap.value.get(id)?.name || 'Uncategorized';
const getCategoryIcon = (id) => categoryMap.value.get(id)?.icon || 'label';
const getCategoryColor = (id) => categoryMap.value.get(id)?.color || '#64748b';
const getAccountName = (id) => accountMap.value.get(id)?.name || 'Unknown Account';
const getBucketName = (id) => (id ? bucketMap.value.get(id)?.name || 'Unassigned' : 'Unassigned');
const getBucketIcon = (id) => (id ? bucketMap.value.get(id)?.icon || 'savings' : 'savings');
const getBucketColor = (id) => (id ? bucketMap.value.get(id)?.color || '#D4BFFF' : '#D4BFFF');

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatAmount = (val) => {
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const transactionBadgeClass = (tx) => {
  if (tx.transaction_type === 'income') return 'bg-[#B3F5E1]/20 text-[#B3F5E1] border border-[#B3F5E1]/30';
  if (tx.transaction_type === 'transfer') return 'bg-[#D4BFFF]/20 text-[#D4BFFF] border border-[#D4BFFF]/30';
  if (tx.transaction_type === 'adjustment') return 'bg-[#d2bbff]/20 text-[#d2bbff] border border-[#d2bbff]/30';
  return 'bg-[#FFD1B3]/20 text-[#FFD1B3] border border-[#FFD1B3]/30';
};

const transactionAmountClass = (tx) => {
  if (tx.transaction_type === 'income') return 'text-[#B3F5E1]';
  if (tx.transaction_type === 'transfer') return 'text-[#D4BFFF]';
  if (tx.transaction_type === 'adjustment') {
    if (tx.adjustment_direction === 'add') return 'text-[#B3F5E1]';
    if (tx.adjustment_direction === 'subtract') return 'text-[#FFD1B3]';
    return 'text-[#D4BFFF]';
  }
  return 'text-[#FFD1B3]';
};

const transactionSign = (tx) => {
  if (tx.transaction_type === 'income') return '+';
  if (tx.transaction_type === 'transfer') {
    if (tx.adjustment_direction === 'add') return '+';
    if (tx.adjustment_direction === 'subtract') return '-';
    return '⇄ ';
  }
  if (tx.transaction_type === 'adjustment') {
    if (tx.adjustment_direction === 'add') return '+';
    if (tx.adjustment_direction === 'subtract') return '-';
    return '±';
  }
  return '-';
};

const transactionLabel = (tx) => {
  if (tx.transaction_type === 'income') return 'Income';
  if (tx.transaction_type === 'transfer') return 'Transfer';
  if (tx.transaction_type === 'adjustment') return 'Adjustment';
  return 'Expense';
};
</script>

<style scoped>
.flip-list-move,
.flip-list-enter-active,
.flip-list-leave-active {
  transition: transform 0.22s var(--ease-out), opacity 0.22s var(--ease-out);
}

/* Modal and Dropdown Sheet Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.22s var(--ease-out), transform 0.22s var(--ease-out);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(6px);
}

/* Transaction Detail Modal Sheet Spring Animation */
.modal-sheet-enter-active,
.modal-sheet-leave-active {
  transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-sheet-enter-active .modal-sheet-card,
.modal-sheet-leave-active .modal-sheet-card {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}

.modal-sheet-enter-from,
.modal-sheet-leave-to {
  opacity: 0;
}
.modal-sheet-enter-from .modal-sheet-card,
.modal-sheet-leave-to .modal-sheet-card {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}

/* Full Month Slide Out & Slide In Animations (Parallel Smooth Motion) */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}

.slide-next-leave-active,
.slide-prev-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
}

/* Going Next: Old slide exits LEFT (-100%), new slide enters from RIGHT (100%) */
.slide-next-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-next-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Going Prev: Old slide exits RIGHT (100%), new slide enters from LEFT (-100%) */
.slide-prev-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-prev-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
/* Option B Spinning Loader Ring Animation */
@keyframes spinRing {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin-group {
  transform-box: fill-box;
  transform-origin: center;
  animation: spinRing 0.55s linear infinite;
  pointer-events: none;
}
</style>
