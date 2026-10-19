<template>
  <div class="space-y-6">
    
    <!-- MAIN "MORE" HUB GRID (Visible when no sheet/page is open) -->
    <div v-if="!activeSheet" class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center border-b border-[#1f202e] pb-4 animate-cascade-1">
        <div>
          <h2 class="text-xl font-bold text-[#f1f0f5] tracking-tight">More</h2>
          <p class="text-xs text-[#9e9cae] mt-0.5">Preferences, savings buckets, accounts, data backup, and app guide</p>
        </div>
      </div>

      <!-- 2-Column Hairline Grid Directory (Matching Savings Allocations Grid on Dashboard) -->
      <div class="border border-[#1f202e] rounded-2xl bg-[#0f1019] overflow-hidden divide-y divide-[#1f202e] animate-cascade-2">
        
        <!-- Row 1: Quick Actions & Savings Buckets -->
        <div class="grid grid-cols-2 divide-x divide-[#1f202e]">
          <!-- 1. Quick Actions -->
          <button 
            type="button"
            @click="activeSheet = 'quick_actions'"
            class="p-3.5 hover:bg-[#141520] transition duration-150 cursor-pointer text-left flex items-center gap-2.5 group active:bg-[#191924]"
          >
            <div class="w-8.5 h-8.5 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <span class="material-symbols-outlined text-base">bolt</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xs font-bold text-[#f1f0f5] group-hover:text-[#D4BFFF] transition leading-tight truncate">Quick Actions</h3>
              <p class="text-[10px] text-[#9e9cae] mt-0.5 leading-tight truncate">Transfers & splits</p>
            </div>
          </button>

          <!-- 2. Savings Buckets -->
          <button 
            data-tour="buckets-tile"
            type="button"
            @click="activeSheet = 'buckets'"
            class="p-3.5 hover:bg-[#141520] transition duration-150 cursor-pointer text-left flex items-center gap-2.5 group active:bg-[#191924]"
          >
            <div class="w-8.5 h-8.5 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <span class="material-symbols-outlined text-base">savings</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xs font-bold text-[#f1f0f5] group-hover:text-[#D4BFFF] transition leading-tight truncate">Savings Buckets</h3>
              <p class="text-[10px] text-[#9e9cae] mt-0.5 leading-tight truncate">Virtual divisions of money</p>
            </div>
          </button>
        </div>

        <!-- Row 2: Manage Accounts & Manage Categories -->
        <div class="grid grid-cols-2 divide-x divide-[#1f202e]">
          <!-- 3. Manage Accounts -->
          <button 
            type="button"
            @click="activeSheet = 'accounts'"
            class="p-3.5 hover:bg-[#141520] transition duration-150 cursor-pointer text-left flex items-center gap-2.5 group active:bg-[#191924]"
          >
            <div class="w-8.5 h-8.5 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <span class="material-symbols-outlined text-base">account_balance</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xs font-bold text-[#f1f0f5] group-hover:text-[#D4BFFF] transition leading-tight truncate">Manage Accounts</h3>
              <p class="text-[10px] text-[#9e9cae] mt-0.5 leading-tight truncate">Bank accounts</p>
            </div>
          </button>

          <!-- 4. Manage Categories -->
          <button 
            data-tour="categories-tile"
            type="button"
            @click="activeSheet = 'categories'"
            class="p-3.5 hover:bg-[#141520] transition duration-150 cursor-pointer text-left flex items-center gap-2.5 group active:bg-[#191924]"
          >
            <div class="w-8.5 h-8.5 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <span class="material-symbols-outlined text-base">category</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xs font-bold text-[#f1f0f5] group-hover:text-[#D4BFFF] transition leading-tight truncate">Manage Categories</h3>
              <p class="text-[10px] text-[#9e9cae] mt-0.5 leading-tight truncate">Categories & icons</p>
            </div>
          </button>
        </div>

        <!-- Row 3: Backup & Export & FAQ / About -->
        <div class="grid grid-cols-2 divide-x divide-[#1f202e]">
          <!-- 5. Backup & Export -->
          <button 
            data-tour="backup-[#D4BFFF]"
            data-tour-target="backup-tile"
            type="button"
            @click="activeSheet = 'backup'"
            class="p-3.5 hover:bg-[#141520] transition duration-150 cursor-pointer text-left flex items-center gap-2.5 group active:bg-[#191924]"
          >
            <div class="w-8.5 h-8.5 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <span class="material-symbols-outlined text-base">database</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xs font-bold text-[#f1f0f5] group-hover:text-[#D4BFFF] transition leading-tight truncate">Backup & Export</h3>
              <p class="text-[10px] text-[#9e9cae] mt-0.5 leading-tight truncate">Database & vaults</p>
            </div>
          </button>

          <!-- 6. FAQ & About -->
          <button 
            type="button"
            @click="activeSheet = 'faq'"
            class="p-3.5 hover:bg-[#141520] transition duration-150 cursor-pointer text-left flex items-center gap-2.5 group active:bg-[#191924]"
          >
            <div class="w-8.5 h-8.5 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <span class="material-symbols-outlined text-base">help_outline</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xs font-bold text-[#f1f0f5] group-hover:text-[#D4BFFF] transition leading-tight truncate">FAQ & About</h3>
              <p class="text-[10px] text-[#9e9cae] mt-0.5 leading-tight truncate">App guide & note</p>
            </div>
          </button>
        </div>

        <!-- Row 4: Balance Audit Log & Currency Settings -->
        <div class="grid grid-cols-2 divide-x divide-[#1f202e]">
          <!-- Balance Audit Log -->
          <button 
            type="button"
            @click="openAdjustmentAuditSheet"
            class="p-3.5 hover:bg-[#141520] transition duration-150 cursor-pointer text-left flex items-center gap-2.5 group active:bg-[#191924]"
          >
            <div class="w-8.5 h-8.5 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <span class="material-symbols-outlined text-base">history_edu</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xs font-bold text-[#f1f0f5] group-hover:text-[#D4BFFF] transition leading-tight truncate">Audit Log</h3>
              <p class="text-[10px] text-[#9e9cae] mt-0.5 leading-tight truncate">Adjustment trail</p>
            </div>
          </button>

          <!-- Currency Settings -->
          <button 
            type="button"
            @click="activeSheet = 'currency'"
            class="p-3.5 hover:bg-[#141520] transition duration-150 cursor-pointer text-left flex items-center gap-2.5 group active:bg-[#191924]"
          >
            <div class="w-8.5 h-8.5 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <span class="material-symbols-outlined text-base">payments</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xs font-bold text-[#f1f0f5] group-hover:text-[#D4BFFF] transition leading-tight truncate">Currency</h3>
              <p class="text-[10px] text-[#9e9cae] mt-0.5 leading-tight truncate">{{ currentCurrency?.code || 'INR' }} ({{ currencySymbol }})</p>
            </div>
          </button>
        </div>

        <!-- Reports -->
        <div class="border-t border-[#1f202e]">
          <button
            type="button"
            @click="activeSheet = 'reports'"
            class="w-full p-3.5 hover:bg-[#141520] transition duration-150 cursor-pointer text-left flex items-center gap-2.5 group active:bg-[#191924]"
          >
            <div class="w-8.5 h-8.5 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <span class="material-symbols-outlined text-base">summarize</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-xs font-bold text-[#f1f0f5] group-hover:text-[#D4BFFF] transition leading-tight truncate">Reports</h3>
              <p class="text-[10px] text-[#9e9cae] mt-0.5 leading-tight truncate">Spending by month, category, and bucket</p>
            </div>
            <span class="material-symbols-outlined text-[#9e9cae] text-sm group-hover:text-[#f1f0f5] transition">chevron_right</span>
          </button>
        </div>

        <!-- Row 5: App Theme & Appearance -->
        <div class="border-t border-[#1f202e]">
          <button 
            type="button"
            @click="showThemeModal = true"
            class="w-full p-3.5 hover:bg-[#141520] transition duration-150 cursor-pointer text-left flex items-center justify-between gap-2.5 group active:bg-[#191924]"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8.5 h-8.5 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <span class="material-symbols-outlined text-base">palette</span>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-xs font-bold text-[#f1f0f5] group-hover:text-[#D4BFFF] transition leading-tight truncate">App Theme & Appearance</h3>
                <p class="text-[10px] text-[#9e9cae] mt-0.5 leading-tight truncate">Pastel Dark, OLED Pitch Black, Nordic Slate, Emerald & Light</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[#9e9cae] text-sm group-hover:text-[#f1f0f5] transition">chevron_right</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ENTIRE FULL PAGE VIEW (Opened when activeSheet is selected) -->
    <Transition name="fade-slide">
      <div v-if="activeSheet" class="fixed inset-0 z-50 bg-[#0c0d14] flex flex-col w-full h-full overflow-hidden">
        
        <!-- Full Page Header Bar -->
        <div class="px-4 sm:px-6 pb-3.5 border-b border-[#1f202e] flex items-center justify-between bg-[#0c0d14]/95 backdrop-blur-md shrink-0 safe-area-modal-pt">
          <div class="flex items-center gap-3">
            <button 
              @click="activeSheet = null"
              class="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#141520] hover:bg-[#1f202e] border border-[#1f202e] rounded-xl text-xs font-bold text-[#D4BFFF] transition cursor-pointer active:scale-95"
            >
              <span class="material-symbols-outlined text-base">arrow_back</span>
              <span>Back to More</span>
            </button>
            <div class="h-4 w-px bg-[#1f202e] mx-1"></div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-lg text-[#D4BFFF] leading-none">
                {{ getSheetIcon(activeSheet) }}
              </span>
              <h3 class="text-base font-bold text-[#f1f0f5] tracking-tight">
                {{ getSheetTitle(activeSheet) }}
              </h3>
            </div>
          </div>
        </div>

        <!-- Full Page Content Body Container -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 pb-32 max-w-4xl mx-auto w-full space-y-6">

          <ReportsView
            v-if="activeSheet === 'reports'"
            ref="reportsViewRef"
            :categories="categories"
            :buckets="buckets"
            :active-vault="activeVault"
          />
          
          <!-- 1. QUICK ACTIONS PAGE -->
          <div v-if="activeSheet === 'quick_actions'" class="space-y-6">
            <div>
              <h3 class="text-lg font-bold text-[#f1f0f5] tracking-tight">Quick Actions</h3>
              <p class="text-xs text-[#9e9cae] mt-0.5">Rapid balance operations and allocation presets</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <!-- Bucket Transfer Button -->
              <button
                @click="showTransferModal = true"
                class="flex items-center justify-between p-4 bg-[#0f1019] hover:bg-[#141520] border border-[#1f202e] hover:border-[#D4BFFF]/40 rounded-2xl transition cursor-pointer text-left group active:scale-[0.98]"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-xl">swap_horiz</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-[#f1f0f5]">Bucket Transfer</p>
                    <p class="text-[10px] text-[#9e9cae] mt-0.5 truncate">Move allocation between buckets</p>
                  </div>
                </div>
                <span class="material-symbols-outlined text-sm text-[#9e9cae] group-hover:text-[#D4BFFF] transition">chevron_right</span>
              </button>

              <!-- Account Transfer Button -->
              <button
                @click="showAccountTransferModal = true"
                class="flex items-center justify-between p-4 bg-[#0f1019] hover:bg-[#141520] border border-[#1f202e] hover:border-[#D4BFFF]/40 rounded-2xl transition cursor-pointer text-left group active:scale-[0.98]"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-xl">sync_alt</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-[#f1f0f5]">Account Transfer</p>
                    <p class="text-[10px] text-[#9e9cae] mt-0.5 truncate">Transfer funds between bank accounts</p>
                  </div>
                </div>
                <span class="material-symbols-outlined text-sm text-[#9e9cae] group-hover:text-[#D4BFFF] transition">chevron_right</span>
              </button>

              <!-- Salary Allocation Preset Button -->
              <button
                @click="showPresetsModal = true"
                class="flex items-center justify-between p-4 bg-[#0f1019] hover:bg-[#141520] border border-[#1f202e] hover:border-[#D4BFFF]/40 rounded-2xl transition cursor-pointer text-left group active:scale-[0.98]"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-xl">auto_awesome</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-[#f1f0f5]">Salary Allocation</p>
                    <p class="text-[10px] text-[#9e9cae] mt-0.5 truncate">Auto-split deposits into buckets</p>
                  </div>
                </div>
                <span class="material-symbols-outlined text-sm text-[#9e9cae] group-hover:text-[#D4BFFF] transition">chevron_right</span>
              </button>
            </div>
          </div>

          <!-- 2. SAVINGS BUCKETS PAGE -->
          <div v-if="activeSheet === 'buckets'" class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
              <div>
                <h3 class="text-lg font-bold text-[#f1f0f5] tracking-tight">Savings Buckets</h3>
                <p class="text-xs text-[#9e9cae]">Virtual divisions of money</p>
              </div>
              <div class="flex flex-wrap items-center gap-2 shrink-0">
                <button 
                  @click="showTransferModal = true"
                  class="px-2.5 py-1.5 bg-[#141520] hover:bg-[#1f202e] border border-[#1f202e] hover:border-[#D4BFFF]/40 text-[#D4BFFF] font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span class="material-symbols-outlined text-xs">swap_horiz</span>
                  <span>Transfer</span>
                </button>
                <button 
                  @click="showArchivedBuckets = !showArchivedBuckets"
                  class="text-[11px] font-bold text-[#9e9cae] hover:text-[#D4BFFF] hover:underline cursor-pointer shrink-0"
                >
                  {{ showArchivedBuckets ? 'Hide Archived' : 'Show Archived' }}
                </button>
                <button 
                  @click="openCreateBucketModal"
                  class="px-3 py-1.5 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>+ Create Bucket</span>
                </button>
              </div>
            </div>

            <!-- Equal-Height Symmetrical Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Total Allocated Card -->
              <div class="rounded-xl border border-[#1f202e] bg-[#0f1019] p-4 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between">
                    <p class="text-[10px] font-bold uppercase tracking-wider text-[#D4BFFF]">Total Allocated</p>
                    <span class="material-symbols-outlined text-base text-[#D4BFFF]">pie_chart</span>
                  </div>
                  <p class="mt-1 text-lg sm:text-xl font-bold text-[#f1f0f5] tabular-nums">{{ currencySymbol }}{{ formatAmount(totalAllocated) }}</p>
                </div>
                <p class="text-[10px] text-[#9e9cae] mt-2">Sum of all active bucket balances (virtual subdivisions of account funds)</p>
              </div>

              <!-- Unallocated Funds Pool Card -->
              <div class="rounded-xl border border-[#1f202e] bg-[#0f1019] p-4 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between">
                    <p class="text-[10px] font-bold uppercase tracking-wider text-[#FFD1B3]">Unallocated Funds Pool</p>
                    <span class="material-symbols-outlined text-base text-[#FFD1B3]">account_balance_wallet</span>
                  </div>
                  <p 
                    class="mt-1 text-lg sm:text-xl font-bold tabular-nums"
                    :class="unassignedAmount < 0 ? 'text-rose-400' : 'text-[#FFD1B3]'"
                  >
                    {{ unassignedAmount < 0 ? '-' : '' }}{{ currencySymbol }}{{ formatAmount(Math.abs(unassignedAmount)) }}
                  </p>
                </div>

                <div class="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#1f202e]/60">
                  <button
                    type="button"
                    @click="openAllocateModal()"
                    class="flex-1 py-1.5 px-2 bg-[#FFD1B3]/15 hover:bg-[#FFD1B3]/25 border border-[#FFD1B3]/30 text-[#FFD1B3] text-xs font-bold rounded-lg transition cursor-pointer text-center"
                  >
                    Allocate
                  </button>
                  <button
                    type="button"
                    @click="showPresetsModal = true"
                    class="flex-1 py-1.5 px-2 bg-[#D4BFFF]/15 hover:bg-[#D4BFFF]/25 border border-[#D4BFFF]/30 text-[#D4BFFF] text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span class="material-symbols-outlined text-xs shrink-0">payments</span>
                    <span class="truncate">Salary Split</span>
                  </button>
                </div>
              </div>
            </div>

            <div 
              v-if="localBuckets.length > 0" 
              class="divide-y divide-[#1f202e] border border-[#1f202e] rounded-xl overflow-hidden bg-[#0f1019] relative"
            >
              <div 
                v-for="(bucket, idx) in localBuckets" 
                :key="bucket.id"
                :data-drag-idx="idx"
                class="py-2.5 px-3 hover:bg-[#141520] flex items-center justify-between group select-none relative bg-[#0f1019]"
                :class="{
                  'z-50 shadow-2xl scale-[1.02] bg-[#1a1b2a] border border-[#D4BFFF]/80 text-white rounded-xl ring-2 ring-[#D4BFFF]/30': isDragActive && activeDragType === 'buckets' && activeDragIdx === idx,
                  'border-t-2 border-[#D4BFFF]': isDragActive && activeDragType === 'buckets' && dropTargetIdx === idx && activeDragIdx !== idx
                }"
                :style="{ 
                  transform: getItemTransform(idx, 'buckets'), 
                  transition: (isDragActive && activeDragType === 'buckets' && activeDragIdx === idx) ? 'none' : 'transform 0.22s cubic-bezier(0.2, 1, 0.3, 1)',
                  pointerEvents: (isDragActive && activeDragType === 'buckets' && activeDragIdx === idx) ? 'none' : 'auto'
                }"
              >
                <div class="flex items-center gap-2.5 min-w-0 flex-grow">
                  <!-- Long-Press Drag Handle -->
                  <span 
                    @pointerdown="handleDragPointerDown($event, idx, 'buckets')"
                    @pointermove="handleDragPointerMove"
                    @pointerup="handleDragPointerUp"
                    @pointercancel="handleDragPointerUp"
                    class="material-symbols-outlined text-base text-[#9e9cae]/50 hover:text-[#D4BFFF] cursor-grab active:cursor-grabbing select-none shrink-0 p-1.5 transition-colors touch-none"
                    title="Press & hold to drag reorder"
                  >
                    drag_indicator
                  </span>

                  <div class="w-8 h-8 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-base leading-none" :style="{ color: bucket.color || '#D4BFFF' }">{{ resolveIcon(bucket.icon, 'savings') }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                      <p class="text-xs font-bold text-[#f1f0f5] truncate">{{ bucket.name }}</p>
                      <span v-if="bucket.is_archived" class="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-amber-950/60 text-amber-400 border border-amber-800/40 shrink-0">Archived</span>
                    </div>
                    <p class="text-[10px] text-[#9e9cae] font-medium mt-0.5">
                      Allocated: <span class="text-[#D4BFFF] font-bold">{{ currencySymbol }}{{ formatAmount(bucket.allocated_balance) }}</span>
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    v-if="unassignedAmount > 0 && !bucket.is_archived"
                    @click="allocateToBucket(bucket)"
                    class="px-2 py-1.5 rounded-lg border border-amber-800/50 bg-amber-950/40 text-[9px] font-bold text-amber-300 cursor-pointer"
                    title="Deposit funds into bucket"
                  >Allocate</button>
                  <button 
                    @click="openEditBucketModal(bucket)"
                    class="text-[#9e9cae] hover:text-[#D4BFFF] hover:bg-[#141520] p-1.5 rounded-lg transition cursor-pointer text-xs"
                    title="Edit Bucket"
                  >
                    <span class="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button 
                    @click="confirmDeleteBucket(bucket)"
                    class="text-[#9e9cae] hover:text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition cursor-pointer text-xs"
                    title="Delete / Archive Bucket"
                  >
                    <span class="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 border-y border-[#1f202e] text-xs text-[#9e9cae]">
              No savings buckets found.
            </div>
          </div>

          <!-- 3. MANAGE ACCOUNTS PAGE -->
          <div v-if="activeSheet === 'accounts'" class="space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-bold text-[#f1f0f5] tracking-tight">Manage Accounts</h3>
                <p class="text-xs text-[#9e9cae]">Create & manage bank accounts (where money is stored)</p>
              </div>
              <button 
                type="button"
                @click="showAccountTransferModal = true"
                class="px-3 py-1.5 bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 hover:bg-[#D4BFFF]/20 text-[#D4BFFF] font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span class="material-symbols-outlined text-xs">swap_horiz</span>
                <span>Account Transfer</span>
              </button>
            </div>

            <!-- Add Account Form -->
            <form @submit.prevent="submitAccount" class="p-4 bg-[#0f1019] border border-[#1f202e] rounded-xl space-y-3.5">
              <p class="text-xs font-bold text-[#f1f0f5] uppercase tracking-wider">Add New Account</p>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  v-model="newAccount.name"
                  type="text"
                  placeholder="Account Name (e.g. SBI)"
                  required
                  class="w-full px-3.5 py-2 bg-[#141520] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs placeholder-[#9e9cae] focus:outline-none transition"
                />
                <select 
                  v-model="newAccount.type"
                  class="w-full px-3.5 py-2 bg-[#141520] border border-[#1f202e] hover:bg-[#191924] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs focus:outline-none transition cursor-pointer"
                >
                  <option value="Checking" class="bg-[#0c0d14]">Checking</option>
                  <option value="Savings" class="bg-[#0c0d14]">Savings</option>
                  <option value="Credit Card" class="bg-[#0c0d14]">Credit Card</option>
                  <option value="Cash" class="bg-[#0c0d14]">Cash</option>
                  <option value="Wallet" class="bg-[#0c0d14]">Wallet</option>
                </select>
              </div>
              <button 
                type="submit"
                :disabled="submittingAccount"
                class="w-full py-2.5 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 min-h-[38px]"
              >
                {{ submittingAccount ? 'Creating...' : '+ Create Account' }}
              </button>
            </form>

            <!-- Reorderable Account List -->
            <div>
              <div 
                v-if="localAccounts.length > 0" 
                class="divide-y divide-[#1f202e] border border-[#1f202e] rounded-xl overflow-hidden bg-[#0f1019] relative"
              >
                <div 
                  v-for="(account, idx) in localAccounts" 
                  :key="account.id"
                  :data-drag-idx="idx"
                  class="py-2.5 px-3 hover:bg-[#141520] flex items-center justify-between group select-none relative bg-[#0f1019]"
                  :class="{
                    'z-50 shadow-2xl scale-[1.02] bg-[#1a1b2a] border border-[#D4BFFF]/80 text-white rounded-xl ring-2 ring-[#D4BFFF]/30': isDragActive && activeDragType === 'accounts' && activeDragIdx === idx,
                    'border-t-2 border-[#D4BFFF]': isDragActive && activeDragType === 'accounts' && dropTargetIdx === idx && activeDragIdx !== idx
                  }"
                  :style="{ 
                    transform: getItemTransform(idx, 'accounts'), 
                    transition: (isDragActive && activeDragType === 'accounts' && activeDragIdx === idx) ? 'none' : 'transform 0.22s cubic-bezier(0.2, 1, 0.3, 1)',
                    pointerEvents: (isDragActive && activeDragType === 'accounts' && activeDragIdx === idx) ? 'none' : 'auto'
                  }"
                >
                  <!-- Long-Press Drag Handle & Account Info -->
                  <div class="flex items-center gap-2.5 min-w-0 flex-grow">
                    <span 
                      @pointerdown="handleDragPointerDown($event, idx, 'accounts')"
                      @pointermove="handleDragPointerMove"
                      @pointerup="handleDragPointerUp"
                      @pointercancel="handleDragPointerUp"
                      class="material-symbols-outlined text-base text-[#9e9cae]/50 hover:text-[#D4BFFF] cursor-grab active:cursor-grabbing select-none shrink-0 p-1.5 transition-colors touch-none"
                      title="Press & hold to drag reorder"
                    >
                      drag_indicator
                    </span>

                    <!-- Editing Mode (User Accounts Only) -->
                    <div v-if="editingAccountId === account.id" class="space-y-3 flex-1">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input 
                          v-model="editAccountName"
                          type="text"
                          required
                          class="w-full px-3 py-1.5 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-lg text-[#f1f0f5] text-xs focus:outline-none transition"
                        />
                        <select 
                          v-model="editAccountType"
                          class="w-full px-2.5 py-1.5 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-lg text-[#f1f0f5] text-xs focus:outline-none transition cursor-pointer"
                        >
                          <option value="Checking" class="bg-[#0c0d14]">Checking</option>
                          <option value="Savings" class="bg-[#0c0d14]">Savings</option>
                          <option value="Credit Card" class="bg-[#0c0d14]">Credit Card</option>
                          <option value="Cash" class="bg-[#0c0d14]">Cash</option>
                          <option value="Wallet" class="bg-[#0c0d14]">Wallet</option>
                        </select>
                      </div>
                      <div class="flex justify-end gap-2">
                        <button 
                          type="button"
                          @click="cancelEditAccount"
                          class="px-2.5 py-1 text-[10px] font-semibold text-[#9e9cae] hover:text-[#f1f0f5] transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="button"
                          @click="saveAccountEdit(account)"
                          class="px-2.5 py-1 bg-[#D4BFFF] text-[#0f0f15] font-bold text-[10px] rounded-lg transition cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <!-- Normal Mode -->
                    <div v-else class="min-w-0 flex-1">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <p class="text-xs font-bold text-[#f1f0f5] leading-tight">{{ account.name }}</p>
                        <span v-if="account.id === 'acc_unallocated_funds'" class="px-1.5 py-0.2 rounded bg-[#FFD1B3]/15 text-[#FFD1B3] text-[8px] font-bold uppercase tracking-wider border border-[#FFD1B3]/30 shrink-0">System Default</span>
                      </div>
                      <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span class="px-1.5 py-0.5 rounded bg-[#0f1019] border border-[#1f202e] text-[#9e9cae] text-[9px] font-medium">{{ account.type || 'Unallocated' }}</span>
                        <span class="text-[10px] font-medium text-[#9e9cae]">Balance: <span class="font-bold text-[#B3F5E1]">{{ currencySymbol }}{{ formatAmount(account.id === 'acc_unallocated_funds' ? unassignedAmount : account.balance) }}</span></span>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-1.5 shrink-0 ml-2">
                    <template v-if="account.id === 'acc_unallocated_funds'">
                      <button
                        type="button"
                        @click="toggleHideUnallocatedDashboard"
                        class="px-2 py-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shrink-0 select-none"
                        :class="hideUnallocatedDashboard ? 'bg-[#141520] border-[#1f202e] text-[#9e9cae] hover:text-[#f1f0f5]' : 'bg-[#D4BFFF]/15 border-[#D4BFFF]/30 text-[#D4BFFF] hover:bg-[#D4BFFF]/25'"
                        :title="hideUnallocatedDashboard ? 'Click to show on Dashboard' : 'Click to hide from Dashboard'"
                      >
                        <span class="material-symbols-outlined text-xs">{{ hideUnallocatedDashboard ? 'visibility_off' : 'visibility' }}</span>
                        <span>{{ hideUnallocatedDashboard ? 'Hidden' : 'Shown' }}</span>
                      </button>
                    </template>
                    <template v-else-if="editingAccountId !== account.id">
                      <button 
                        @click="startEditAccount(account)"
                        class="text-[#9e9cae] hover:text-[#D4BFFF] hover:bg-[#141520] p-1.5 rounded-lg transition cursor-pointer text-xs"
                        title="Edit Account"
                      >
                        <span class="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button 
                        @click="confirmDeleteAccount(account)"
                        class="text-[#9e9cae] hover:text-rose-400 hover:bg-rose-950/20 p-1.5 rounded-lg transition cursor-pointer text-xs"
                        title="Delete Account"
                      >
                        <span class="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </template>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 border-y border-[#1f202e] text-xs text-[#9e9cae]">
                No accounts configured.
              </div>
            </div>
          </div>

          <!-- 4. MANAGE CATEGORIES PAGE -->
          <div v-if="activeSheet === 'categories'" class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-[#f1f0f5] tracking-tight">Manage Categories</h3>
                <p class="text-xs text-[#9e9cae]">Create and organize spending categories</p>
              </div>
              <button 
                @click="openCreateCategoryModal"
                class="px-3 py-1.5 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>+ Create Category</span>
              </button>
            </div>

            <div 
              v-if="localCategories.length > 0" 
              class="divide-y divide-[#1f202e] border border-[#1f202e] rounded-xl overflow-hidden bg-[#0f1019] relative"
            >
              <div 
                v-for="(category, idx) in localCategories" 
                :key="category.id"
                :data-drag-idx="idx"
                class="py-2.5 px-3 hover:bg-[#141520] flex items-center justify-between gap-2 group select-none relative bg-[#0f1019]"
                :class="{
                  'z-50 shadow-2xl scale-[1.02] bg-[#1a1b2a] border border-[#D4BFFF]/80 text-white rounded-xl ring-2 ring-[#D4BFFF]/30': isDragActive && activeDragType === 'categories' && activeDragIdx === idx,
                  'border-t-2 border-[#D4BFFF]': isDragActive && activeDragType === 'categories' && dropTargetIdx === idx && activeDragIdx !== idx
                }"
                :style="{ 
                  transform: getItemTransform(idx, 'categories'), 
                  transition: (isDragActive && activeDragType === 'categories' && activeDragIdx === idx) ? 'none' : 'transform 0.22s cubic-bezier(0.2, 1, 0.3, 1)',
                  pointerEvents: (isDragActive && activeDragType === 'categories' && activeDragIdx === idx) ? 'none' : 'auto'
                }"
              >
                <div class="flex items-center gap-2.5 min-w-0 flex-grow">
                  <!-- Long-Press Drag Handle -->
                  <span 
                    @pointerdown="handleDragPointerDown($event, idx, 'categories')"
                    @pointermove="handleDragPointerMove"
                    @pointerup="handleDragPointerUp"
                    @pointercancel="handleDragPointerUp"
                    class="material-symbols-outlined text-base text-[#9e9cae]/50 hover:text-[#D4BFFF] cursor-grab active:cursor-grabbing select-none shrink-0 p-1.5 transition-colors touch-none"
                    title="Press & hold to drag reorder"
                  >
                    drag_indicator
                  </span>

                  <div class="w-7 h-7 rounded-lg bg-[#141520] border border-[#1f202e] flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-base leading-none" :style="{ color: category.color || '#D4BFFF' }">{{ resolveIcon(category.icon, 'category') }}</span>
                  </div>
                  <p class="text-xs font-bold text-[#f1f0f5] truncate" :title="category.name">{{ category.name }}</p>
                  <span v-if="category.is_quick_select" class="text-[9px] font-bold text-[#D4BFFF] bg-[#D4BFFF]/10 px-1.5 py-0.2 rounded border border-[#D4BFFF]/20 shrink-0">Pinned</span>
                  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0" :class="category.category_type === 'income' ? 'text-[#B3F5E1] bg-[#B3F5E1]/10 border-[#B3F5E1]/20' : 'text-[#FFD1B3] bg-[#FFD1B3]/10 border-[#FFD1B3]/20'">{{ category.category_type === 'income' ? 'Income' : 'Expense' }}</span>
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <button 
                    @click="openEditCategoryModal(category)"
                    class="text-[#9e9cae] hover:text-[#D4BFFF] hover:bg-[#141520] p-1.5 rounded-lg transition cursor-pointer text-xs"
                    title="Edit Category"
                  >
                    <span class="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button 
                    @click="confirmDeleteCategory(category)"
                    class="text-[#9e9cae] hover:text-rose-400 hover:bg-rose-950/20 p-1.5 rounded-lg transition cursor-pointer text-xs"
                    title="Delete Category"
                  >
                    <span class="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12 border border-dashed border-[#29293a] rounded-xl text-xs text-[#6b6a7d]">
              No categories configured.
            </div>
          </div>

          <!-- 5. BACKUP & EXPORT PAGE (FULL FLUID SCROLLING WITHOUT CUTOFF) -->
          <div v-if="activeSheet === 'backup'" class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#1f202e] pb-4">
              <div>
                <h3 class="text-base font-bold text-[#f1f0f5] flex items-center gap-2">
                  <span class="material-symbols-outlined text-base text-[#D4BFFF]">database</span>
                  <span>Data Backup & Export Controls</span>
                </h3>
                <p class="text-xs text-[#9e9cae] mt-0.5">Export active database file, create local snapshots, or restore backups.</p>
              </div>
              <div class="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0">
                <button 
                  type="button"
                  @click="handleExportActiveDatabase"
                  class="px-3.5 py-2 bg-[#B3F5E1] hover:bg-[#92edd0] text-[#0f0f15] font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm min-h-[36px]"
                >
                  <span class="material-symbols-outlined text-sm">download</span>
                  <span>Export Database</span>
                </button>
                <label class="px-3.5 py-2 bg-[#0f1019] hover:bg-[#141520] text-[#f1f0f5] border border-[#1f202e] hover:border-[#D4BFFF]/40 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[36px]">
                  <span class="material-symbols-outlined text-sm">upload</span>
                  <span>Import Backup</span>
                  <input type="file" accept=".db,.sqlite,.cbbak,*/*" class="hidden" @change="handleImportBackupFile" />
                </label>
                <button 
                  @click="handleCreateSnapshot"
                  :disabled="creatingBackup"
                  class="px-3.5 py-2 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm min-h-[36px]"
                >
                  <span class="material-symbols-outlined text-sm">photo_camera</span>
                  <span>{{ creatingBackup ? 'Creating...' : 'Create Snapshot' }}</span>
                </button>
              </div>
            </div>

            <!-- Local Snapshots List (Full length scroll without inner height cutoff) -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <p class="text-xs font-semibold text-[#9e9cae] uppercase tracking-wider">Local Snapshots (<code class="text-[#D4BFFF] font-mono">backups/</code>)</p>
                <button @click="loadBackupsList" class="text-xs text-[#D4BFFF] hover:underline cursor-pointer">Refresh List</button>
              </div>

              <div v-if="backupsList.length > 0" class="divide-y divide-[#1f202e] border-y border-[#1f202e]">
                <div 
                  v-for="b in backupsList" 
                  :key="b.filename"
                  class="py-3.5 px-1 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[#141520] transition gap-3"
                >
                  <div class="flex items-center gap-2.5 min-w-0 flex-grow">
                    <span class="material-symbols-outlined text-base text-[#D4BFFF] shrink-0">inventory_2</span>
                    <div class="min-w-0 flex-grow">
                      <p class="text-xs font-bold text-[#f1f0f5] font-mono break-all sm:truncate" :title="b.filename">{{ b.filename }}</p>
                      <p class="text-[10px] text-[#9e9cae] mt-0.5">{{ formatSize(b.size_bytes) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-end w-full sm:w-auto">
                    <button
                      @click="handleDownloadBackup(b.filename)"
                      class="px-2.5 py-1.5 bg-[#0f1019] hover:bg-[#141520] text-[#B3F5E1] border border-[#1f202e] hover:border-[#B3F5E1]/40 font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1 min-h-[28px]"
                      title="Download backup file"
                    >
                      <span>Save</span>
                    </button>
                    <button 
                      @click="handleShareBackup(b.filename)"
                      class="px-2.5 py-1.5 bg-[#0f1019] hover:bg-[#141520] text-[#D4BFFF] border border-[#1f202e] hover:border-[#D4BFFF]/40 font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1 min-h-[28px]"
                      title="Share file"
                    >
                      <span>Share</span>
                    </button>
                    <button 
                      @click="handleRestoreBackup(b.filename)"
                      class="px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800/40 font-bold text-[10px] rounded-lg transition cursor-pointer min-h-[28px]"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 border-y border-[#1f202e] text-xs text-[#9e9cae]">
                No snapshot backups saved in <code class="text-[#9e9cae] font-mono">backups/</code> folder yet.
              </div>
            </div>
          </div>

          <!-- 6. FAQ & ABOUT PAGE (Sajid's Exact Content) -->
          <div v-if="activeSheet === 'faq'" class="space-y-6">
            <!-- Take Tour Again Banner -->
            <div class="p-4 bg-[#0f1019] border border-[#D4BFFF]/30 rounded-2xl flex items-center justify-between shadow-lg">
              <div>
                <h4 class="text-xs font-bold text-[#f1f0f5]">Interactive App Tour</h4>
                <p class="text-[10px] text-[#9e9cae] mt-0.5">Re-run the Cash Buddy guided tutorial anytime</p>
              </div>
              <button 
                @click="handleTakeTourAgain" 
                type="button"
                class="px-3.5 py-2 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm"
              >
                <span class="material-symbols-outlined text-base">auto_stories</span>
                <span>Take Tour Again</span>
              </button>
            </div>

            <!-- Frequently Asked Questions Card -->
            <div class="bg-[#0f1019] border border-[#1f202e] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div class="border-b border-[#1f202e] pb-3.5">
                <h3 class="text-base font-bold text-[#f1f0f5] tracking-tight flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#D4BFFF] text-xl">help</span>
                  <span>Frequently Asked Questions & Guides</span>
                </h3>
                <p class="text-xs text-[#9e9cae] mt-1">Comprehensive guide on Cash Buddy mechanics, Savings Buckets, Salary Allocation, and Vaults.</p>
              </div>

              <div class="border border-[#1f202e] rounded-2xl bg-[#0f1019] overflow-hidden divide-y divide-[#1f202e]">
                <!-- Q1: Savings Buckets Mechanics (Tips & Tricks) -->
                <details class="group">
                  <summary class="p-3 sm:p-3.5 text-xs font-bold text-[#f1f0f5] cursor-pointer flex items-center justify-between hover:bg-[#141520] transition select-none">
                    <div class="flex items-center gap-2.5 min-w-0 pr-2">
                      <div class="w-6.5 h-6.5 rounded-lg bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-sm">savings</span>
                      </div>
                      <span class="text-xs font-bold text-[#f1f0f5] truncate">How do Savings Buckets work?</span>
                    </div>
                    <span class="text-[#9e9cae] group-open:rotate-180 transition-transform text-xs shrink-0">▼</span>
                  </summary>
                  <div class="px-3.5 pb-3.5 pt-2.5 text-xs text-[#9e9cae] space-y-2 border-t border-[#1f202e] bg-[#0f0f15]/80 leading-relaxed">
                    <p><strong class="text-[#f1f0f5]">Savings Buckets represent the PURPOSE of your money (why it exists).</strong></p>
                    <p>Instead of needing multiple real bank accounts, Savings Buckets organize your single bank balance into virtual goal allocations (e.g. <em>Emergency Fund</em>, <em>Japan Trip</em>, <em>Monthly Budget</em>, <em>Bike EMI</em>).</p>
                    <div class="p-2.5 bg-[#141520] border border-[#1f202e] rounded-xl space-y-1 text-[11px] text-[#f1f0f5]">
                      <p class="font-bold text-[#D4BFFF] flex items-center gap-1">Pro Tips:</p>
                      <ul class="list-disc pl-4 space-y-1 text-[#9e9cae]">
                        <li><strong class="text-[#f1f0f5]">Bucket Transfer:</strong> Move allocated funds between buckets anytime without altering physical bank accounts.</li>
                        <li><strong class="text-[#f1f0f5]">Unallocated Funds Pool:</strong> Any money in bank accounts not assigned to a bucket lives in the Unallocated Pool.</li>
                        <li><strong class="text-[#f1f0f5]">Mutual Mandate:</strong> Selecting a bucket for a transaction strictly requires selecting a physical storage account!</li>
                      </ul>
                    </div>
                  </div>
                </details>

                <!-- Q2: Salary Allocation & Salary Split Detailed Guide -->
                <details class="group">
                  <summary class="p-3 sm:p-3.5 text-xs font-bold text-[#f1f0f5] cursor-pointer flex items-center justify-between hover:bg-[#141520] transition select-none">
                    <div class="flex items-center gap-2.5 min-w-0 pr-2">
                      <div class="w-6.5 h-6.5 rounded-lg bg-[#B3F5E1]/10 border border-[#B3F5E1]/20 text-[#B3F5E1] flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-sm">payments</span>
                      </div>
                      <span class="text-xs font-bold text-[#f1f0f5] truncate">How does Salary Allocation work?</span>
                    </div>
                    <span class="text-[#9e9cae] group-open:rotate-180 transition-transform text-xs shrink-0">▼</span>
                  </summary>
                  <div class="px-3.5 pb-3.5 pt-2.5 text-xs text-[#9e9cae] space-y-2 border-t border-[#1f202e] bg-[#0f0f15]/80 leading-relaxed">
                    <p><strong class="text-[#f1f0f5]">Salary Allocation lets you automatically split incoming income into your buckets.</strong></p>
                    <div class="space-y-2 pt-1">
                      <div class="flex items-start gap-2">
                        <span class="w-4.5 h-4.5 rounded-full bg-[#B3F5E1]/15 text-[#B3F5E1] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <p><strong class="text-[#f1f0f5]">Log Income:</strong> Add your salary to Unallocated Funds or your bank account (e.g. +₹30,000).</p>
                      </div>
                      <div class="flex items-start gap-2">
                        <span class="w-4.5 h-4.5 rounded-full bg-[#B3F5E1]/15 text-[#B3F5E1] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <p><strong class="text-[#f1f0f5]">Configure Presets:</strong> Set up a Salary Preset with percentage or fixed rules (e.g. 50% Monthly Budget, 20% Emergency, 30% Savings).</p>
                      </div>
                      <div class="flex items-start gap-2">
                        <span class="w-4.5 h-4.5 rounded-full bg-[#B3F5E1]/15 text-[#B3F5E1] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <p><strong class="text-[#f1f0f5]">Execute Salary Split:</strong> Tap "Apply Preset" to split unallocated funds across target buckets. Each split creates an income transaction (`include_in_chart = 1`), accurately showing in pie charts!</p>
                      </div>
                    </div>
                  </div>
                </details>

                <!-- Q3: Debt & Settlement Tracking -->
                <details class="group">
                  <summary class="p-3 sm:p-3.5 text-xs font-bold text-[#f1f0f5] cursor-pointer flex items-center justify-between hover:bg-[#141520] transition select-none">
                    <div class="flex items-center gap-2.5 min-w-0 pr-2">
                      <div class="w-6.5 h-6.5 rounded-lg bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-sm">handshake</span>
                      </div>
                      <span class="text-xs font-bold text-[#f1f0f5] truncate">Debt & Settlement tracking</span>
                    </div>
                    <span class="text-[#9e9cae] group-open:rotate-180 transition-transform text-xs shrink-0">▼</span>
                  </summary>
                  <div class="px-3.5 pb-3.5 pt-2.5 text-xs text-[#9e9cae] space-y-2 border-t border-[#1f202e] bg-[#0f0f15]/80 leading-relaxed">
                    <p><strong class="text-[#f1f0f5]">Track money you have lent to others or borrowed.</strong></p>
                    <p>When someone pays you back (or when you settle a debt), tap <strong class="text-[#B3F5E1]">Settle Debt</strong> inside the Debts tab to log a settlement directly to your target bank account.</p>
                  </div>
                </details>

                <!-- Q4: Multi-Vault Management -->
                <details class="group">
                  <summary class="p-3 sm:p-3.5 text-xs font-bold text-[#f1f0f5] cursor-pointer flex items-center justify-between hover:bg-[#141520] transition select-none">
                    <div class="flex items-center gap-2.5 min-w-0 pr-2">
                      <div class="w-6.5 h-6.5 rounded-lg bg-[#FFD1B3]/10 border border-[#FFD1B3]/20 text-[#FFD1B3] flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-sm">dataset</span>
                      </div>
                      <span class="text-xs font-bold text-[#f1f0f5] truncate">Vaults & switching between them</span>
                    </div>
                    <span class="text-[#9e9cae] group-open:rotate-180 transition-transform text-xs shrink-0">▼</span>
                  </summary>
                  <div class="px-3.5 pb-3.5 pt-2.5 text-xs text-[#9e9cae] space-y-2 border-t border-[#1f202e] bg-[#0f0f15]/80 leading-relaxed">
                    <p><strong class="text-[#f1f0f5]">Vaults are completely isolated SQLite databases on your phone.</strong></p>
                    <p>You can create separate vaults for <em>Personal Finances</em>, <em>Business / Freelance</em>, or <em>Test Experiments</em>. Tap the vault name badge at the top of the header anytime to switch or create new vaults.</p>
                  </div>
                </details>

                <!-- Q5: Storage Accounts -->
                <details class="group">
                  <summary class="p-3 sm:p-3.5 text-xs font-bold text-[#f1f0f5] cursor-pointer flex items-center justify-between hover:bg-[#141520] transition select-none">
                    <div class="flex items-center gap-2.5 min-w-0 pr-2">
                      <div class="w-6.5 h-6.5 rounded-lg bg-[#FFD1B3]/10 border border-[#FFD1B3]/20 text-[#FFD1B3] flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-sm">account_balance</span>
                      </div>
                      <span class="text-xs font-bold text-[#f1f0f5] truncate">What are Accounts?</span>
                    </div>
                    <span class="text-[#9e9cae] group-open:rotate-180 transition-transform text-xs shrink-0">▼</span>
                  </summary>
                  <div class="px-3.5 pb-3.5 pt-2.5 text-xs text-[#9e9cae] space-y-2 border-t border-[#1f202e] bg-[#0f0f15]/80 leading-relaxed">
                    <p><strong class="text-[#f1f0f5]">Accounts represent physical storage locations where your money lives.</strong></p>
                    <p>Examples include your <em>Checking Bank Account</em>, <em>Savings Account</em>, <em>Physical Cash Wallet</em>, or <em>UPI Wallet</em>.</p>
                  </div>
                </details>

                <!-- Q6: Filtering & Search -->
                <details class="group">
                  <summary class="p-3 sm:p-3.5 text-xs font-bold text-[#f1f0f5] cursor-pointer flex items-center justify-between hover:bg-[#141520] transition select-none">
                    <div class="flex items-center gap-2.5 min-w-0 pr-2">
                      <div class="w-6.5 h-6.5 rounded-lg bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-sm">filter_alt</span>
                      </div>
                      <span class="text-xs font-bold text-[#f1f0f5] truncate">Filtering & searching</span>
                    </div>
                    <span class="text-[#9e9cae] group-open:rotate-180 transition-transform text-xs shrink-0">▼</span>
                  </summary>
                  <div class="px-3.5 pb-3.5 pt-2.5 text-xs text-[#9e9cae] space-y-2 border-t border-[#1f202e] bg-[#0f0f15]/80 leading-relaxed">
                    <p>In the <strong>History</strong> tab, filter by Date Range (This Month, Last Month, Month Grid Matrix, Custom Range), Transaction Type (Income/Expense), Account, Bucket, or Category.</p>
                  </div>
                </details>

                <!-- Q7: Balance Audit Log -->
                <details class="group">
                  <summary class="p-3 sm:p-3.5 text-xs font-bold text-[#f1f0f5] cursor-pointer flex items-center justify-between hover:bg-[#141520] transition select-none">
                    <div class="flex items-center gap-2.5 min-w-0 pr-2">
                      <div class="w-6.5 h-6.5 rounded-lg bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-sm">history_edu</span>
                      </div>
                      <span class="text-xs font-bold text-[#f1f0f5] truncate">Balance Audit Log</span>
                    </div>
                    <span class="text-[#9e9cae] group-open:rotate-180 transition-transform text-xs shrink-0">▼</span>
                  </summary>
                  <div class="px-3.5 pb-3.5 pt-2.5 text-xs text-[#9e9cae] space-y-2 border-t border-[#1f202e] bg-[#0f0f15]/80 leading-relaxed">
                    <p>Under <strong>More → Balance Audit Log</strong>, view a complete audit trail of all balance recalibrations and adjustments made across accounts and buckets.</p>
                  </div>
                </details>

                <!-- Q8: Export & Backup -->
                <details class="group">
                  <summary class="p-3 sm:p-3.5 text-xs font-bold text-[#f1f0f5] cursor-pointer flex items-center justify-between hover:bg-[#141520] transition select-none">
                    <div class="flex items-center gap-2.5 min-w-0 pr-2">
                      <div class="w-6.5 h-6.5 rounded-lg bg-[#B3F5E1]/10 border border-[#B3F5E1]/20 text-[#B3F5E1] flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-sm">database</span>
                      </div>
                      <span class="text-xs font-bold text-[#f1f0f5] truncate">Backup & Export</span>
                    </div>
                    <span class="text-[#9e9cae] group-open:rotate-180 transition-transform text-xs shrink-0">▼</span>
                  </summary>
                  <div class="px-3.5 pb-3.5 pt-2.5 text-xs text-[#9e9cae] space-y-2 border-t border-[#1f202e] bg-[#0f0f15]/80 leading-relaxed">
                    <p>Under <strong>More → Backup & Export</strong>, tap <strong>Export Active Database</strong> to save your standard <code class="text-[#D4BFFF] font-mono">.db</code> SQLite file, or tap <strong>Create Local Snapshot</strong> to save a local restore point anytime.</p>
                  </div>
                </details>
              </div>
            </div>

            <!-- ABOUT CASH BUDDY (Sajid's Creator Note & Guarantee - Content Preserved 100% Intact) -->
            <div class="bg-[#0f1019] border border-[#1f202e] rounded-2xl p-5 shadow-2xl space-y-4">
              <div class="flex items-center gap-3 border-b border-[#1f202e] pb-3.5">
                <img src="/cashbuddy-logo.svg?v=3" alt="Cash Buddy Logo" class="w-10 h-10 object-contain shrink-0" />
                <div>
                  <h3 class="text-base font-bold text-[#f1f0f5] leading-tight">About Cash Buddy</h3>
                  <p class="text-xs text-[#D4BFFF] font-medium leading-tight">Your Personal Expense Tracker</p>
                </div>
              </div>

              <!-- Ideation & Creator Note (Content Intact) -->
              <div class="space-y-3 text-xs text-[#9e9cae] leading-relaxed">
                <div class="p-3 bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 rounded-xl text-[#D4BFFF] font-medium flex items-center gap-2">
                  <span>✨</span>
                  <span>This whole app was built and ideated by <strong>Sajid</strong>.</span>
                </div>

                <p class="text-[#ccc3d8]">
                  I have been tracking my finances via a notepad all this time. It was just for my own needs so I would know where my money is going, but I thought I needed an app that would make adding transactions easier.
                </p>
                <p class="text-[#ccc3d8]">
                  The first thing that made me think of this was how I spent so much time at the end of months manually tallying and summing everything; it took way too long and quite frankly I would have made many mistakes.
                </p>
                <p class="text-[#ccc3d8]">
                  This app has been on my mind for the past 4-ish years, and I’ve been making versions of it for a very long time. But this is the first time that I’ve brought it to a phone. I am still actively working on making it better.
                </p>

                <!-- On-Device Local Data Storage Guarantee -->
                <div class="p-3.5 bg-[#141520] border border-[#1f202e] rounded-xl space-y-1.5 text-[#9e9cae]">
                  <p class="font-bold text-[#f1f0f5] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <span>🔒</span> 100% Local On-Phone Storage Guarantee
                  </p>
                  <p class="text-[#ccc3d8] text-[11px] leading-normal">
                    Cash Buddy stores all your financial data <strong>completely locally on your own phone</strong>. Every transaction, savings bucket, and custom database vault is saved directly inside your device's local internal storage memory (WebAssembly SQLite + OPFS).
                  </p>
                  <p class="text-[#9e9cae] text-[11px] leading-normal">
                    No user accounts, no external servers, no cloud sync, and zero tracking—your financial data never leaves your device.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 7. BALANCE ADJUSTMENTS & AUDIT LOG PAGE -->
          <div v-if="activeSheet === 'adjustment_audit'" class="space-y-4">
            <div>
              <h3 class="text-lg font-bold text-[#f1f0f5] tracking-tight">Balance Adjustments & Audit Log</h3>
              <p class="text-xs text-[#9e9cae]">Complete audit trail of account balance adjustments and ledger records.</p>
            </div>

            <!-- Date Filter Toolbar with Month/Year Matrix Grid Picker -->
            <div class="space-y-2.5 p-3 bg-[#0f1019] border border-[#1f202e] rounded-xl">
              <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  <button 
                    type="button" 
                    @click="auditDateFilter = 'all'; showAuditMonthPicker = false;"
                    class="px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer"
                    :class="auditDateFilter === 'all' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'bg-[#141520] text-[#9e9cae] hover:text-[#f1f0f5]'"
                  >
                    All Time
                  </button>
                  <button 
                    type="button" 
                    @click="auditDateFilter = 'this_month'; showAuditMonthPicker = false;"
                    class="px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer"
                    :class="auditDateFilter === 'this_month' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'bg-[#141520] text-[#9e9cae] hover:text-[#f1f0f5]'"
                  >
                    This Month
                  </button>
                  <button 
                    type="button" 
                    @click="auditDateFilter = 'last_month'; showAuditMonthPicker = false;"
                    class="px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer"
                    :class="auditDateFilter === 'last_month' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'bg-[#141520] text-[#9e9cae] hover:text-[#f1f0f5]'"
                  >
                    Last Month
                  </button>
                </div>
                <button 
                  type="button"
                  @click="showAuditMonthPicker = !showAuditMonthPicker"
                  class="px-2.5 py-1 bg-[#141520] border border-[#1f202e] hover:border-[#D4BFFF]/40 text-[#D4BFFF] text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-sm">calendar_month</span>
                  <span>{{ auditDateFilter.includes('-') ? auditDateFilter : 'Pick Month' }}</span>
                </button>
              </div>

              <!-- Sleek Month/Year Matrix Picker -->
              <div v-if="showAuditMonthPicker" class="p-3 bg-[#141520] border border-[#1f202e] rounded-xl space-y-2.5 animate-cascade-1 mt-2">
                <div class="flex items-center justify-between border-b border-[#1f202e] pb-2">
                  <button 
                    type="button"
                    @click="changeAuditPickerYear(-1)"
                    class="w-7 h-7 rounded-lg bg-[#0c0d14] hover:bg-[#191924] text-[#f1f0f5] flex items-center justify-center text-xs font-bold border border-[#1f202e] transition cursor-pointer"
                  >
                    ❮
                  </button>
                  <span class="text-sm font-bold text-[#D4BFFF]">{{ auditPickerYear }}</span>
                  <button 
                    type="button"
                    @click="changeAuditPickerYear(1)"
                    class="w-7 h-7 rounded-lg bg-[#0c0d14] hover:bg-[#191924] text-[#f1f0f5] flex items-center justify-center text-xs font-bold border border-[#1f202e] transition cursor-pointer"
                  >
                    ❯
                  </button>
                </div>

                <div class="grid grid-cols-4 gap-1.5">
                  <button
                    v-for="(mName, idx) in monthNames"
                    :key="mName"
                    type="button"
                    @click="selectAuditMonthAndYear(idx)"
                    class="py-2 rounded-lg border text-xs font-bold transition cursor-pointer text-center"
                    :class="auditDateFilter === `${auditPickerYear}-${String(idx + 1).padStart(2, '0')}` ? 'bg-[#D4BFFF] text-[#0f0f15] border-[#D4BFFF]' : 'bg-[#0c0d14] border-[#1f202e] text-[#f1f0f5] hover:bg-[#191924]'"
                  >
                    {{ mName }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="filteredAuditLogs.length > 0" class="border-y border-[#1f202e] divide-y divide-[#1f202e]">
              <div 
                v-for="log in filteredAuditLogs" 
                :key="log.id"
                class="py-3 px-1.5 hover:bg-[#141520] transition flex items-center justify-between gap-3 text-xs"
              >
                <div class="min-w-0 flex-1">
                  <p class="font-bold text-[#f1f0f5] truncate">{{ log.description || 'Account Adjustment' }}</p>
                  <p class="text-[10px] text-[#9e9cae] mt-0.5">
                    {{ log.date }} • Account: {{ log.account_name || 'Unassigned' }} • Bucket: {{ log.bucket_name || 'Unassigned' }}
                  </p>
                </div>
                <span 
                  class="font-bold tabular-nums text-xs shrink-0"
                  :class="log.adjustment_direction === 'subtract' ? 'text-[#FFD1B3]' : 'text-[#B3F5E1]'"
                >
                  {{ log.adjustment_direction === 'subtract' ? '-' : '+' }}{{ currencySymbol }}{{ formatAmount(log.amount) }}
                </span>
              </div>
            </div>
            <div v-else class="text-center py-8 border-y border-[#1f202e] text-xs text-[#9e9cae]">
              No balance adjustment logs found for selected date filter.
            </div>
          </div>

          <!-- 8. CURRENCY & FORMATTING SHEET -->
          <div v-if="activeSheet === 'currency'" class="space-y-6">
            <div>
              <h3 class="text-lg font-bold text-[#f1f0f5] tracking-tight">Currency & Formatting</h3>
              <p class="text-xs text-[#9e9cae] mt-0.5">Set default app currency for displays, inputs, and reports (100% offline)</p>
            </div>

            <!-- Current Active Currency Card -->
            <div class="p-4 bg-[#0f1019] border border-[#1f202e] rounded-2xl flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#D4BFFF]/15 border border-[#D4BFFF]/30 text-[#D4BFFF] flex items-center justify-center font-bold text-lg shrink-0">
                  {{ currencySymbol }}
                </div>
                <div>
                  <p class="text-[10px] text-[#9e9cae] font-semibold uppercase tracking-wider">Active Currency</p>
                  <h4 class="text-sm font-bold text-[#f1f0f5]">{{ currentCurrency?.name || 'Indian Rupee' }}</h4>
                </div>
              </div>
              <div class="px-3 py-1 bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 rounded-full text-xs font-bold text-[#D4BFFF] shrink-0">
                {{ currentCurrency?.code || 'INR' }}
              </div>
            </div>

            <!-- Search Currencies -->
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9e9cae] text-base">search</span>
              <input
                v-model="currencySearchQuery"
                type="text"
                placeholder="Search currency by name, 3-letter code (USD, EUR, SAR, INR...)"
                class="w-full pl-10 pr-4 py-2.5 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl text-xs text-[#f1f0f5] placeholder-[#9e9cae] focus:outline-none"
              />
            </div>

            <!-- Currency Selection Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
              <button
                v-for="c in filteredCurrencies"
                :key="c.code"
                type="button"
                @click="handleSelectCurrency(c)"
                class="p-3 bg-[#0f1019] hover:bg-[#141520] border rounded-xl text-left transition cursor-pointer flex items-center justify-between group active:scale-[0.98]"
                :class="currentCurrency?.code === c.code ? 'border-[#D4BFFF] bg-[#D4BFFF]/10' : 'border-[#1f202e] hover:border-[#D4BFFF]/40'"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div 
                    class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                    :class="currentCurrency?.code === c.code ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'bg-[#191924] border border-[#1f202e] text-[#f1f0f5]'"
                  >
                    {{ c.symbol || c.code }}
                  </div>
                  <div class="min-w-0 truncate">
                    <p class="text-xs font-bold text-[#f1f0f5] truncate">{{ c.name }}</p>
                    <p class="text-[10px] text-[#9e9cae] mt-0.5">{{ c.code }}</p>
                  </div>
                </div>
                <span v-if="currentCurrency?.code === c.code" class="material-symbols-outlined text-base text-[#D4BFFF] shrink-0">check_circle</span>
              </button>
            </div>

            <!-- Custom Currency Expander -->
            <div class="p-4 bg-[#0f1019] border border-[#1f202e] rounded-2xl space-y-3">
              <h4 class="text-xs font-bold text-[#f1f0f5]">Or Enter Custom Currency</h4>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  v-model="customCurrencyCode"
                  type="text"
                  placeholder="Code (e.g. BTC)"
                  class="px-3 py-2 bg-[#141520] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl text-xs text-[#f1f0f5] placeholder-[#9e9cae] focus:outline-none uppercase"
                />
                <input
                  v-model="customCurrencySymbol"
                  type="text"
                  placeholder="Symbol (e.g. ₿ or leave blank)"
                  class="px-3 py-2 bg-[#141520] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl text-xs text-[#f1f0f5] placeholder-[#9e9cae] focus:outline-none"
                />
                <button
                  type="button"
                  @click="handleApplyCustomCurrency"
                  :disabled="!customCurrencyCode.trim()"
                  class="px-3 py-2 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-40"
                >
                  Set Custom Currency
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <!-- Allocate from Unallocated Funds Modal -->
    <Transition name="modal">
      <div v-if="showAllocateModal" class="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 pt-[max(1.5rem,env(safe-area-inset-top))] sm:p-4 bg-[#0f0f15]/80 backdrop-blur-sm overflow-y-auto" @click.self="showAllocateModal = false">
        <div class="bg-[#14141d] border border-[#29293a] rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[88vh] my-auto">
          <!-- Header -->
          <div class="flex justify-between items-center border-b border-[#29293a] px-5 py-4 shrink-0">
            <div>
              <h3 class="text-base font-bold text-[#f1f0f5]">Allocate Unallocated Funds</h3>
              <p class="text-[10px] text-[#FFD1B3] mt-0.5 font-bold">Available Pool: ₹{{ formatAmount(unassignedAmount) }}</p>
            </div>
            <button @click="showAllocateModal = false" class="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 text-[#9e9cae] hover:text-[#f1f0f5] text-lg cursor-pointer">✕</button>
          </div>

          <form @submit.prevent="submitAllocateFromUnallocated" class="flex flex-col flex-1 min-h-0">
            <div class="overflow-y-auto p-5 space-y-4 flex-1 pb-14 sm:pb-5">
              <div class="p-3 bg-[#FFD1B3]/10 border border-[#FFD1B3]/20 rounded-xl text-xs text-[#FFD1B3]">
                <p>Moves the amount from the Unallocated Funds pool into the selected bank account and bucket. The chosen category remains included in charts and analytics.</p>
              </div>

              <!-- Destination Bank Account -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-[#ccc3d8]">To Bank Account *</label>
                <AccountGrid :accounts="bankAccounts" v-model="allocateForm.account_id" />
              </div>
              <!-- Target Bucket Selection -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-[#ccc3d8]">To Bucket *</label>
                <BucketGrid :buckets="activeBuckets" v-model="allocateForm.bucket_id" :show-unassigned="false" />
              </div>

              <!-- Category Selection -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-[#ccc3d8]">Category *</label>
                <CategoryPicker :categories="categories" v-model="allocateForm.category_id" title="Select Target Category" placeholder="Choose Category" />
              </div>

              <!-- Amount Input -->
              <div>
                <label class="block text-xs font-semibold text-[#ccc3d8] mb-1">Amount to Allocate ({{ currencySymbol }}) *</label>
                <input 
                  v-model="allocateForm.amount"
                  type="text"
                  inputmode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  autocomplete="off"
                  placeholder="0.00"
                  required
                  class="w-full px-3.5 py-2.5 bg-[#0f0f15] border border-[#29293a] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs focus:outline-none transition"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-xs font-semibold text-[#ccc3d8] mb-1">Description (Optional)</label>
                <input 
                  v-model="allocateForm.description"
                  type="text"
                  placeholder="e.g. Allocation from pool to Vacation"
                  class="w-full px-3.5 py-2.5 bg-[#0f0f15] border border-[#29293a] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs focus:outline-none transition"
                />
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="border-t border-[#29293a] p-4 bg-[#14141d] shrink-0 flex gap-3">
              <button 
                type="button" 
                @click="showAllocateModal = false"
                class="flex-1 py-2.5 bg-[#1f1f2e] hover:bg-[#29293a] text-[#f1f0f5] text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="submittingAllocate"
                class="flex-1 py-2.5 bg-[#FFD1B3] hover:bg-[#ffbe94] text-[#0f0f15] text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {{ submittingAllocate ? 'Allocating...' : 'Allocate Funds' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Sub-Modals (Bucket Transfer, Account Transfer, Presets, Category Form, Bucket Form) -->
    <!-- Bucket Transfer Modal -->
    <Transition name="modal">
      <div v-if="showTransferModal" class="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 pt-[max(1.5rem,env(safe-area-inset-top))] sm:p-4 bg-[#0f0f15]/80 backdrop-blur-sm overflow-y-auto" @click.self="showTransferModal = false">
        <div class="bg-[#14141d] border border-[#29293a] rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[88vh] my-auto">
          <!-- Header -->
          <div class="flex justify-between items-center border-b border-[#29293a] px-5 py-4 shrink-0">
            <h3 class="text-base font-bold text-[#f1f0f5]">Transfer Allocation</h3>
            <button @click="showTransferModal = false" class="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 text-[#9e9cae] hover:text-[#f1f0f5] text-lg cursor-pointer">✕</button>
          </div>

          <form @submit.prevent="submitBucketTransfer" class="flex flex-col flex-1 min-h-0">
            <div class="overflow-y-auto p-5 space-y-4 flex-1 pb-14 sm:pb-5">
              <div class="p-3 bg-[#1a1030]/30 border border-[#D4BFFF]/15 rounded-xl text-xs text-[#ccc3d8]">
                <p>This moves allocated funds from one bucket to another. Your physical <strong>bank account balances remain 100% unchanged</strong>.</p>
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-[#ccc3d8]">From Bucket *</label>
                <BucketGrid :buckets="activeBuckets" v-model="transferForm.from_bucket_id" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-[#ccc3d8]">To Bucket *</label>
                <BucketGrid :buckets="activeBuckets" v-model="transferForm.to_bucket_id" :show-unassigned="false" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#ccc3d8] mb-1">Amount to Move ({{ currencySymbol }}) *</label>
                <input 
                  v-model="transferForm.amount"
                  type="text"
                  inputmode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  autocomplete="off"
                  placeholder="0.00"
                  required
                  @focus="$event.target.scrollIntoView({ behavior: 'smooth', block: 'center' })"
                  class="w-full px-3.5 py-2.5 bg-[#0f0f15] border border-[#29293a] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs focus:outline-none transition"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#ccc3d8] mb-1">Reason / Description (Optional)</label>
                <input 
                  v-model="transferForm.description"
                  type="text"
                  placeholder="e.g. Reallocating trip funds to laptop"
                  @focus="$event.target.scrollIntoView({ behavior: 'smooth', block: 'center' })"
                  class="w-full px-3.5 py-2.5 bg-[#0f0f15] border border-[#29293a] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs focus:outline-none transition"
                />
              </div>
            </div>
            <div class="flex justify-end gap-3 px-5 py-3.5 border-t border-[#29293a] bg-[#14141d] shrink-0">
              <button type="button" @click="showTransferModal = false" class="px-4 py-2.5 text-xs font-semibold text-[#9e9cae] hover:text-[#f1f0f5] transition cursor-pointer">Cancel</button>
              <button type="submit" :disabled="submittingTransfer" class="px-4 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold text-xs rounded-xl transition cursor-pointer disabled:opacity-50">
                {{ submittingTransfer ? 'Transferring...' : 'Transfer Funds' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Account Transfer Modal -->
    <Transition name="modal">
      <div v-if="showAccountTransferModal" class="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 pt-[max(1.5rem,env(safe-area-inset-top))] sm:p-4 bg-[#0f0f15]/80 backdrop-blur-sm overflow-y-auto" @click.self="showAccountTransferModal = false">
        <div class="bg-[#14141d] border border-[#29293a] rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[88vh] my-auto">
          <div class="flex justify-between items-center border-b border-[#29293a] px-5 py-4 shrink-0">
            <div>
              <h3 class="text-base font-bold text-[#f1f0f5]">Transfer Between Accounts</h3>
              <p class="text-[11px] text-[#9e9cae] mt-0.5">Move money between physical accounts</p>
            </div>
            <button @click="showAccountTransferModal = false" class="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 text-[#9e9cae] hover:text-[#f1f0f5] text-lg cursor-pointer">✕</button>
          </div>
          <form @submit.prevent="submitAccountTransfer" class="flex flex-col flex-1 min-h-0">
            <div class="overflow-y-auto p-5 space-y-4 flex-1 pb-14 sm:pb-5">
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-semibold text-[#ccc3d8] mb-1.5">From Account *</label>
                  <AccountGrid :accounts="accounts" v-model="accountTransferForm.from_account_id" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[#ccc3d8] mb-1.5">To Account *</label>
                  <AccountGrid :accounts="accounts" v-model="accountTransferForm.to_account_id" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#ccc3d8] mb-1">Amount ({{ currencySymbol }}) *</label>
                <input v-model="accountTransferForm.amount" type="text" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*" autocomplete="off" placeholder="0.00" required @focus="$event.target.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="w-full px-3.5 py-2.5 bg-[#0f0f15] border border-[#29293a] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs focus:outline-none transition" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#ccc3d8] mb-1">Description (Optional)</label>
                <input v-model="accountTransferForm.description" type="text" placeholder="e.g. Moving savings to checking" @focus="$event.target.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="w-full px-3.5 py-2.5 bg-[#0f0f15] border border-[#29293a] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs focus:outline-none transition" />
              </div>
            </div>
            <div class="flex justify-end gap-3 px-5 py-3.5 border-t border-[#29293a] bg-[#14141d] shrink-0">
              <button type="button" @click="showAccountTransferModal = false" class="px-4 py-2.5 text-xs font-semibold text-[#9e9cae] hover:text-[#f1f0f5] transition cursor-pointer">Cancel</button>
              <button type="submit" :disabled="submittingAccountTransfer" class="px-5 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50">
                {{ submittingAccountTransfer ? 'Transferring...' : 'Transfer Funds' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Salary Allocation Presets Modal -->
    <Transition name="modal">
      <div v-if="showPresetsModal" class="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 pt-[max(1rem,env(safe-area-inset-top))] sm:p-4 bg-[#0f0f15]/80 backdrop-blur-sm overflow-y-auto" @click.self="showPresetsModal = false; editingPreset = null">
        <div class="bg-[#14141d] border border-[#29293a] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[calc(100dvh-1rem)] my-auto">
          <div class="flex justify-between items-center border-b border-[#29293a] px-5 py-4 shrink-0">
            <div>
              <h3 class="text-base font-bold text-[#f1f0f5]">Salary Allocation Presets</h3>
              <p class="text-[11px] text-[#9e9cae] mt-0.5">Auto-split any amount across your buckets</p>
            </div>
            <button @click="showPresetsModal = false; editingPreset = null" class="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 text-[#9e9cae] hover:text-[#f1f0f5] text-lg cursor-pointer">✕</button>
          </div>
          <div class="overflow-y-auto flex-1 p-5 space-y-4 pb-48 sm:pb-6">
            <div v-if="editingPreset" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-[#ccc3d8] mb-1">Preset Name *</label>
                <input v-model="editingPreset.name" type="text" placeholder="e.g. Monthly Salary Split" @focus="$event.target.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="w-full px-3.5 py-2.5 bg-[#0f0f15] border border-[#29293a] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs focus:outline-none transition font-bold" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#ccc3d8] mb-1.5">Preset Mode (Applies to all rules) *</label>
                <div class="grid grid-cols-2 p-1 bg-[#0f0f15] border border-[#29293a] rounded-xl">
                  <button
                    type="button"
                    @click="editingPreset.mode = 'percentage'"
                    class="py-1.5 text-xs font-bold rounded-lg transition cursor-pointer"
                    :class="editingPreset.mode === 'percentage' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
                  >
                    % Percentage
                  </button>
                  <button
                    type="button"
                    @click="editingPreset.mode = 'fixed'"
                    class="py-1.5 text-xs font-bold rounded-lg transition cursor-pointer"
                    :class="editingPreset.mode === 'fixed' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
                  >
                    {{ currencySymbol }} Fixed Amounts
                  </button>
                </div>
              </div>
              <div class="bg-[#1a1a24] border border-[#29293a] rounded-xl p-3 flex justify-around text-center">
                <div>
                  <p class="text-[9px] uppercase tracking-wider text-[#9e9cae] font-bold">Total Percentage</p>
                  <p class="text-sm font-black mt-0.5" :class="editingPresetTotalPercentage > 100 ? 'text-[#FFD1B3]' : 'text-[#D4BFFF]'">
                    {{ editingPresetTotalPercentage }}%
                  </p>
                </div>
                <div class="w-px bg-[#29293a]"></div>
                <div>
                  <p class="text-[9px] uppercase tracking-wider text-[#9e9cae] font-bold">Total Fixed Amount</p>
                  <p class="text-sm font-black mt-0.5 text-[#B3F5E1]">
                    {{ currencySymbol }}{{ formatAmount(editingPresetTotalFixed) }}
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <label class="text-xs font-bold text-[#ccc3d8] uppercase tracking-wider">Allocation Rules</label>
                  <button
                    type="button"
                    @click="editingPreset.rules.unshift({ id: 'new-' + Date.now() + '-' + Math.random(), bucket_id: activeBuckets[0]?.id || '', account_id: accounts[0]?.id || '', category_id: categories[0]?.id || '', value: '' })"
                    class="px-3 py-1.5 bg-[#D4BFFF]/10 hover:bg-[#D4BFFF]/20 text-[#D4BFFF] text-[10px] font-bold rounded-lg transition cursor-pointer"
                  >
                    + Add Rule
                  </button>
                </div>

                <div class="relative min-h-[50px]">
                  <TransitionGroup
                    tag="div"
                    class="space-y-3"
                    enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="transform opacity-0 translate-y-4 scale-95"
                    enter-to-class="transform opacity-100 translate-y-0 scale-100"
                    leave-active-class="transition-all duration-250 ease-in absolute w-full z-0"
                    leave-from-class="transform opacity-100 translate-y-0 scale-100"
                    leave-to-class="transform opacity-0 translate-y-4 scale-95"
                    move-class="transition-all duration-300 ease-in-out"
                  >
                    <div
                      v-for="(rule, idx) in editingPreset.rules"
                      :key="rule.id || idx"
                      class="bg-[#0f0f15] border border-[#29293a] rounded-xl p-3.5 space-y-3 relative transition-all duration-300"
                    >
                      <div class="flex items-center gap-1.5 border-b border-[#29293a]/40 pb-2 mr-6">
                        <span class="text-[10px] px-2 py-0.5 rounded-md bg-[#29293a]/50 text-[#D4BFFF] font-black uppercase tracking-wider">
                          Rule #{{ editingPreset.rules.length - idx }}
                        </span>
                      </div>
                      <button
                        type="button"
                        @click="editingPreset.rules.splice(idx, 1)"
                        class="absolute top-3 right-3 text-[#9e9cae] hover:text-[#FFD1B3] text-xs font-bold transition cursor-pointer p-1"
                        title="Remove Rule"
                      >
                        ✕
                      </button>
                      <div class="space-y-2">
                        <div>
                          <label class="block text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider mb-1">Target Savings Bucket *</label>
                          <BucketGrid :buckets="activeBuckets" v-model="rule.bucket_id" />
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label class="block text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider mb-1">Deposit Account *</label>
                            <AccountGrid :accounts="accounts" v-model="rule.account_id" />
                          </div>
                          <div>
                            <label class="block text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider mb-1">Transaction Category *</label>
                            <CategoryPicker :categories="categories" v-model="rule.category_id" />
                          </div>
                        </div>
                        <div>
                          <label class="block text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider mb-1">
                            {{ editingPreset.mode === 'percentage' ? 'Percentage Allocation (%)*' : 'Fixed Amount (' + currencySymbol + ')*' }}
                          </label>
                          <div class="relative flex items-center">
                            <span v-if="editingPreset.mode === 'fixed'" class="absolute left-3 text-xs font-bold text-[#9e9cae] pointer-events-none">{{ currencySymbol }}</span>
                            <input
                              v-model="rule.value"
                              type="text"
                              inputmode="decimal"
                              :placeholder="editingPreset.mode === 'percentage' ? '25' : '1000.00'"
                              required
                              class="w-full px-3 py-2 bg-[#14141d] border border-[#29293a] focus:border-[#D4BFFF] rounded-xl text-xs font-bold focus:outline-none transition text-right"
                              :class="editingPreset.mode === 'fixed' ? 'pl-6 pr-3' : 'px-3'"
                            />
                            <span v-if="editingPreset.mode === 'percentage'" class="absolute right-3 text-xs font-bold text-[#9e9cae] pointer-events-none">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TransitionGroup>
                </div>
                <p v-if="!editingPreset.rules.length" class="text-xs text-[#9e9cae] text-center py-4 border border-dashed border-[#29293a] rounded-xl">No rules yet. Click "+ Add Rule" to begin.</p>
              </div>

              <div class="flex justify-end gap-3 pt-1">
                <button type="button" @click="editingPreset = null" class="px-4 py-2.5 text-xs font-semibold text-[#9e9cae] hover:text-[#f1f0f5] transition cursor-pointer">Cancel</button>
                <button @click="savePreset" :disabled="submittingPreset" class="px-5 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50">
                  {{ submittingPreset ? 'Saving...' : editingPreset.id ? 'Save Changes' : 'Create Preset' }}
                </button>
              </div>
            </div>

            <div v-else-if="applyingPreset" class="space-y-4">
              <div class="bg-[#1a1a24] border border-[#29293a] rounded-xl p-3.5 flex justify-between items-center">
                <div>
                  <p class="text-[9px] uppercase tracking-wider text-[#9e9cae] font-bold">Unallocated Account Balance</p>
                  <p class="text-[10px] text-[#9e9cae] mt-0.5">Total unallocated cash in bank accounts</p>
                </div>
                <p class="text-sm font-black text-[#B3F5E1]">
                  {{ currencySymbol }}{{ formatAmount(unassignedAmount) }}
                </p>
              </div>
              <div class="p-3 bg-[#1a1030]/50 border border-[#D4BFFF]/15 rounded-xl">
                <p class="text-xs font-bold text-[#D4BFFF]">Applying: {{ applyingPreset.name }} ({{ applyingPreset.mode === 'percentage' ? 'Percentage' : 'Fixed' }})</p>
                <div class="flex flex-wrap gap-1.5 mt-1.5">
                  <span v-for="rule in applyingPreset.rules" :key="rule.id" class="text-[10px] px-2.5 py-1 rounded-lg bg-[#14141d] border border-[#29293a] text-[#9e9cae] inline-flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-xs shrink-0" :style="{ color: getCategoryColor(rule.category_id) }">{{ resolveIcon(getCategoryIcon(rule.category_id), 'category') }}</span>
                    <span>{{ getBucketName(rule.bucket_id) }} ({{ getAccountName(rule.account_id) }}) · {{ getCategoryName(rule.category_id) }} · {{ applyingPreset.mode === 'percentage' ? rule.value + '%' : currencySymbol + formatAmount(rule.value) }}</span>
                  </span>
                </div>
              </div>
              <div class="p-3 bg-[#0f0f15] border border-[#29293a] rounded-xl text-xs text-[#9e9cae] flex items-center justify-between">
                <span>Source Funds:</span>
                <span class="font-bold text-[#f1f0f5]">Unallocated Pool ({{ currencySymbol }}{{ formatAmount(unassignedAmount) }})</span>
              </div>
              <div v-if="applyingPreset.mode === 'percentage'" class="space-y-1.5">
                <label class="block text-xs font-semibold text-[#ccc3d8]">Enter Total Salary Deposit Amount ({{ currencySymbol }}) *</label>
                <input v-model="presetBaseAmount" type="text" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*" placeholder="e.g. 50000" class="w-full px-3.5 py-2.5 bg-[#0f0f15] border border-[#29293a] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs focus:outline-none transition font-bold" />
              </div>
              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="applyingPreset = null" class="px-4 py-2.5 text-xs font-semibold text-[#9e9cae] hover:text-[#f1f0f5] transition cursor-pointer">Cancel</button>
                <button @click="confirmApplyPreset" :disabled="submittingPreset || (applyingPreset.mode === 'percentage' && !presetBaseAmount)" class="px-5 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50">
                  {{ submittingPreset ? 'Processing...' : 'Execute Salary Split' }}
                </button>
              </div>
            </div>

            <div v-else>
              <div v-if="localPresets.length > 0" class="space-y-2.5 mb-4">
                <div
                  v-for="preset in localPresets"
                  :key="preset.id"
                  class="bg-[#0f0f15] border border-[#29293a] rounded-xl p-3.5 transition-all duration-200 cursor-pointer hover:bg-[#191924]/30"
                  @click="expandedPresetId = expandedPresetId === preset.id ? null : preset.id"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-[#f1f0f5]">{{ preset.name }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#14141d] border border-[#29293a] text-[#9e9cae]">
                        {{ preset.rules.length }} {{ preset.rules.length === 1 ? 'rule' : 'rules' }}
                      </span>
                      <span class="text-[10px] text-[#D4BFFF] font-bold">{{ expandedPresetId === preset.id ? '▲' : '▼' }}</span>
                    </div>
                  </div>
                  <div
                    class="overflow-hidden transition-all duration-300 ease-in-out"
                    :class="expandedPresetId === preset.id ? 'max-h-[500px] mt-3.5 pt-3.5 border-t border-[#29293a]/50 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'"
                    @click.stop
                  >
                    <div class="space-y-3">
                      <div class="flex flex-wrap gap-1.5">
                        <span v-for="rule in preset.rules" :key="rule.id" class="text-[10px] px-2.5 py-1 rounded-lg bg-[#14141d] border border-[#29293a] text-[#dae2fd] inline-flex items-center gap-1.5">
                          <span class="material-symbols-outlined text-xs shrink-0" :style="{ color: getCategoryColor(rule.category_id) }">{{ resolveIcon(getCategoryIcon(rule.category_id), 'category') }}</span>
                          <span>{{ getBucketName(rule.bucket_id) }} ({{ getAccountName(rule.account_id) }}) · {{ getCategoryName(rule.category_id) }} · {{ rule.mode === 'percentage' ? rule.value + '%' : currencySymbol + formatAmount(rule.value) }}</span>
                        </span>
                      </div>
                      <div class="flex justify-end gap-2.5 pt-1">
                        <button @click="startApplyPreset(preset)" class="px-3.5 py-1.5 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-black text-[10px] rounded-lg cursor-pointer transition shadow-sm">
                          Apply Preset
                        </button>
                        <button @click="editingPreset = JSON.parse(JSON.stringify(preset))" class="px-3.5 py-1.5 bg-[#29293a] hover:bg-[#363648] text-[#ccc3d8] font-bold text-[10px] rounded-lg cursor-pointer transition">
                          Edit
                        </button>
                        <button @click="deletePreset(preset.id)" class="px-2.5 py-1.5 text-[#9e9cae] hover:text-[#FFD1B3] cursor-pointer transition text-xs font-bold">
                          ✕ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-xs text-[#9e9cae] text-center py-6 border border-dashed border-[#29293a] rounded-xl mb-4">No presets yet. Create your first one below.</p>
              <button @click="editingPreset = { id: null, name: '', mode: 'percentage', rules: [] }" class="w-full py-2.5 border border-dashed border-[#29293a] hover:border-[#D4BFFF]/40 text-[#9e9cae] hover:text-[#D4BFFF] text-xs font-bold rounded-xl transition cursor-pointer">+ New Preset</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <CategoryFormModal 
      :isOpen="showCategoryModal"
      :category="activeEditingCategory"
      @close="showCategoryModal = false"
      @save="handleSaveCategory"
    />

    <BucketFormModal 
      :isOpen="showBucketModal"
      :bucket="activeEditingBucket"
      @close="showBucketModal = false"
      @save="handleSaveBucket"
    />

    <ThemeModal 
      :isOpen="showThemeModal"
      @close="showThemeModal = false"
    />

    <!-- Encrypted Backup Passphrase Modal (Cash Buddy Aesthetic) -->
    <Transition name="modal">
      <div 
        v-if="showPassphraseModal" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <div class="bg-[#0f1019] border border-[#1f202e] rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-[#1f202e] pb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center">
                <span class="material-symbols-outlined text-xl">lock</span>
              </div>
              <div>
                <h3 class="text-sm font-bold text-[#f1f0f5]">Encrypt Backup File</h3>
                <p class="text-[11px] text-[#9e9cae]">Set a secure passphrase for portable export</p>
              </div>
            </div>
            <button 
              @click="showPassphraseModal = false"
              class="w-7 h-7 rounded-lg text-[#9e9cae] hover:text-white hover:bg-[#1a1b26] flex items-center justify-center transition cursor-pointer"
            >
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <!-- Target File Banner -->
          <div class="p-2.5 rounded-xl bg-[#141520] border border-[#1f202e] flex items-center justify-between text-xs">
            <span class="text-[#9e9cae] font-medium truncate max-w-[200px]">{{ selectedBackupForShare }}</span>
            <span class="text-[10px] font-bold text-[#D4BFFF] bg-[#D4BFFF]/10 px-2 py-0.5 rounded-full border border-[#D4BFFF]/20">AES Encrypted</span>
          </div>

          <!-- Passphrase Input Form -->
          <form @submit.prevent="confirmShareBackup" class="space-y-3">
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-[#9e9cae]">
                Passphrase <span class="text-rose-400">*</span>
              </label>
              <div class="relative">
                <input 
                  :type="showPassphraseText ? 'text' : 'password'"
                  v-model="sharePassphrase"
                  placeholder="At least 8 characters..."
                  required
                  minlength="8"
                  class="w-full bg-[#141520] border border-[#1f202e] rounded-xl px-3.5 py-2.5 text-xs text-[#f1f0f5] placeholder-[#9e9cae]/50 focus:outline-none focus:border-[#D4BFFF] transition pr-10"
                />
                <button 
                  type="button"
                  @click="showPassphraseText = !showPassphraseText"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e9cae] hover:text-white transition cursor-pointer"
                >
                  <span class="material-symbols-outlined text-base">
                    {{ showPassphraseText ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
              <p v-if="passphraseError" class="text-[11px] font-semibold text-rose-400 mt-1">
                {{ passphraseError }}
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 pt-2">
              <button 
                type="button"
                @click="showPassphraseModal = false"
                class="flex-1 py-2.5 text-xs font-semibold text-[#9e9cae] bg-[#141520] hover:bg-[#1f202e] hover:text-white rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                :disabled="isSharingBackup"
                class="flex-1 py-2.5 text-xs font-bold text-[#0f0f15] bg-[#D4BFFF] hover:bg-[#c099fb] rounded-xl transition cursor-pointer shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-base leading-none">share</span>
                <span>{{ isSharingBackup ? 'Encrypting...' : 'Encrypt & Share' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import BucketGrid from './BucketGrid.vue';
import AccountGrid from './AccountGrid.vue';
import CategoryFormModal from './CategoryFormModal.vue';
import BucketFormModal from './BucketFormModal.vue';
import CategoryPicker from './CategoryPicker.vue';
import ThemeModal from './ThemeModal.vue';
import { resolveIcon } from '../utils/iconResolver.js';
import { api } from '../services/api';
import { CURRENCIES, currentCurrency, currencySymbol, setCurrency } from '../utils/currency.js';
import { sortAccountsByOrder, saveAccountOrder } from '../utils/accountSorter.js';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import ReportsView from './ReportsView.vue';

const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);

const showThemeModal = ref(false);
const activeSheet = ref(null); // null or the selected settings page
const reportsViewRef = ref(null);
const unassignedAuditLogs = ref([]);
const auditDateFilter = ref('all');
const customAuditMonth = ref('');

const backupsList = ref([]);
const creatingBackup = ref(false);

const hideUnallocatedDashboard = ref(localStorage.getItem('cashbuddy_hide_unallocated_dashboard') === 'true');

const toggleHideUnallocatedDashboard = () => {
  hideUnallocatedDashboard.value = !hideUnallocatedDashboard.value;
  localStorage.setItem('cashbuddy_hide_unallocated_dashboard', String(hideUnallocatedDashboard.value));
  window.dispatchEvent(new CustomEvent('cashbuddy-settings-updated'));
};

const currencySearchQuery = ref('');
const customCurrencyCode = ref('');
const customCurrencySymbol = ref('');
const customCurrencyName = ref('');

const filteredCurrencies = computed(() => {
  const q = currencySearchQuery.value.trim().toLowerCase();
  if (!q) return CURRENCIES;
  return CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q) ||
    (c.symbol && c.symbol.toLowerCase().includes(q))
  );
});

const handleSelectCurrency = (curr) => {
  setCurrency(curr, props.activeVault);
};

const handleApplyCustomCurrency = () => {
  if (!customCurrencyCode.value.trim()) return;
  setCurrency({
    code: customCurrencyCode.value.trim().toUpperCase(),
    symbol: customCurrencySymbol.value.trim(),
    name: customCurrencyName.value.trim() || customCurrencyCode.value.trim().toUpperCase()
  }, props.activeVault);
  customCurrencyCode.value = '';
  customCurrencySymbol.value = '';
  customCurrencyName.value = '';
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const auditPickerYear = ref(new Date().getFullYear());
const showAuditMonthPicker = ref(false);

const selectAuditMonthAndYear = (monthIdx) => {
  const m = String(monthIdx + 1).padStart(2, '0');
  auditDateFilter.value = `${auditPickerYear.value}-${m}`;
  showAuditMonthPicker.value = false;
};

const changeAuditPickerYear = (delta) => {
  auditPickerYear.value += delta;
};

watch(activeSheet, (val) => {
  emit('active-sheet-change', val);
  if (val === 'backup') {
    loadBackupsList();
  }
});

const filteredAuditLogs = computed(() => {
  if (auditDateFilter.value === 'all') return unassignedAuditLogs.value;
  const today = new Date();
  if (auditDateFilter.value === 'this_month') {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `${y}-${m}`;
    return unassignedAuditLogs.value.filter(log => log.date && String(log.date).startsWith(prefix));
  }
  if (auditDateFilter.value === 'last_month') {
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const y = prevMonth.getFullYear();
    const m = String(prevMonth.getMonth() + 1).padStart(2, '0');
    const prefix = `${y}-${m}`;
    return unassignedAuditLogs.value.filter(log => log.date && String(log.date).startsWith(prefix));
  }
  return unassignedAuditLogs.value.filter(log => log.date && String(log.date).startsWith(auditDateFilter.value));
});

const openAdjustmentAuditSheet = async () => {
  activeSheet.value = 'adjustment_audit';
  auditDateFilter.value = 'all';
  customAuditMonth.value = '';
  try {
    unassignedAuditLogs.value = await api.getAdjustmentAuditLogs();
  } catch (err) {
    console.error('Failed to load adjustment audit logs:', err);
  }
};

const openUnassignedAuditSheet = openAdjustmentAuditSheet;

const getSheetIcon = (sheet) => {
  switch (sheet) {
    case 'quick_actions': return 'bolt';
    case 'buckets': return 'savings';
    case 'accounts': return 'account_balance';
    case 'categories': return 'category';
    case 'backup': return 'database';
    case 'faq': return 'help_outline';
    case 'adjustment_audit':
    case 'unassigned_audit': return 'history_edu';
    case 'currency': return 'payments';
    case 'reports': return 'summarize';
    default: return 'widgets';
  }
};

const getSheetTitle = (sheet) => {
  switch (sheet) {
    case 'quick_actions': return 'Quick Actions';
    case 'buckets': return 'Savings Buckets';
    case 'accounts': return 'Manage Accounts';
    case 'categories': return 'Manage Categories';
    case 'backup': return 'Backup & Export';
    case 'faq': return 'FAQ & About';
    case 'adjustment_audit':
    case 'unassigned_audit': return 'Balance Adjustments & Audit Log';
    case 'currency': return 'Currency & Formatting';
    case 'reports': return 'Reports';
    default: return 'More';
  }
};

const updateOnlineStatus = () => {
  isOnline.value = typeof navigator !== 'undefined' ? navigator.onLine : true;
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  }
});


const props = defineProps({
  accounts: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  buckets: { type: Array, default: () => [] },
  activeVault: { type: String, default: '' }
});

const emit = defineEmits([
  'create-account', 'update-account', 'delete-account',
  'create-category', 'update-category', 'delete-category',
  'create-bucket', 'update-bucket', 'delete-bucket', 'transfer-bucket', 'transfer-accounts',
  'reorder-buckets', 'reorder-categories', 'reorder-accounts', 'allocate-unassigned', 'data-refresh', 'open-tutorial', 'open-vault-setup',
  'active-sheet-change', 'error'
]);

const handleTakeTourAgain = () => {
  console.log('[ONBOARDING DEBUG] "Take Tour Again" button clicked in SettingsView!');
  emit('open-tutorial');
};

defineExpose({
  closeActiveSheet: () => {
    if (activeSheet.value === 'reports' && reportsViewRef.value?.closeDrilldown()) return;
    activeSheet.value = null;
  }
});

const formatAmount = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Account Form & List State
const newAccount = ref({ name: '', type: 'Checking' });
const submittingAccount = ref(false);
const editingAccountId = ref(null);
const editAccountName = ref('');
const editAccountType = ref('Checking');

const userAccounts = computed(() => props.accounts || []);
const bankAccounts = computed(() => userAccounts.value.filter(account => account.id !== 'acc_unallocated_funds'));

const displayedAccounts = computed(() => {
  const list = [...(props.accounts || [])];
  const hasUnalloc = list.some(a => a.id === 'acc_unallocated_funds');
  if (!hasUnalloc) {
    list.unshift({
      id: 'acc_unallocated_funds',
      name: 'Unallocated Funds',
      type: 'System Pool',
      balance: unassignedAmount.value,
      isSystemDefault: true
    });
  }
  return sortAccountsByOrder(list);
});

const moveAccountPriority = (idx, direction) => {
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= displayedAccounts.value.length) return;
  const list = [...displayedAccounts.value];
  const [moved] = list.splice(idx, 1);
  list.splice(newIdx, 0, moved);
  const ids = list.map(a => a.id);
  saveAccountOrder(ids);
};

const submitAccount = () => {
  if (!newAccount.value.name.trim()) return;
  submittingAccount.value = true;
  emit('create-account', {
    name: newAccount.value.name.trim(),
    type: newAccount.value.type
  });
  newAccount.value = { name: '', type: 'Checking' };
  submittingAccount.value = false;
};

const startEditAccount = (account) => {
  if (account.id === 'acc_unallocated_funds') return;
  editingAccountId.value = account.id;
  editAccountName.value = account.name;
  editAccountType.value = account.type;
};

const cancelEditAccount = () => {
  editingAccountId.value = null;
};

const saveAccountEdit = (account) => {
  if (account.id === 'acc_unallocated_funds') return;
  const name = editAccountName.value.trim();
  if (!name) return;
  emit('update-account', account.id, {
    name,
    type: editAccountType.value
  });
  editingAccountId.value = null;
};

const confirmDeleteAccount = (account) => {
  if (account.id === 'acc_unallocated_funds') {
    alert('Unallocated Funds is a system default account and cannot be deleted.');
    return;
  }
  const confirm = window.confirm(`Are you sure you want to delete the account "${account.name}"?`);
  if (confirm) {
    emit('delete-account', account.id);
  }
};

// Category Modal & Form State
const showCategoryModal = ref(false);
const activeEditingCategory = ref(null);

const openCreateCategoryModal = () => {
  activeEditingCategory.value = null;
  showCategoryModal.value = true;
};

const openEditCategoryModal = (cat) => {
  activeEditingCategory.value = cat;
  showCategoryModal.value = true;
};

const handleSaveCategory = (payload) => {
  if (!payload) return;
  const { id, ...data } = payload;
  if (id) {
    emit('update-category', id, data);
  } else {
    emit('create-category', data);
  }
  showCategoryModal.value = false;
};

const confirmDeleteCategory = (category) => {
  const confirm = window.confirm(`Are you sure you want to delete the category "${category.name}"?`);
  if (confirm) {
    emit('delete-category', category.id);
  }
};

// Bucket Modal & Form State
const showBucketModal = ref(false);
const activeEditingBucket = ref(null);
const showArchivedBuckets = ref(false);

const activeBuckets = computed(() => (props.buckets || []).filter(b => !b.is_archived));
const displayedBuckets = computed(() => {
  const list = props.buckets || [];
  return showArchivedBuckets.value ? list : list.filter(b => !b.is_archived);
});

const totalAllocated = computed(() => {
  return (props.buckets || []).reduce((sum, b) => {
    if (b.is_archived) return sum;
    return sum + (Number(b.allocated_balance) || 0);
  }, 0);
});

const totalAccountBalance = computed(() => {
  return (props.accounts || []).reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
});

const unassignedAmount = computed(() => {
  const unallocAcc = (props.accounts || []).find(a => a.id === 'acc_unallocated_funds');
  if (unallocAcc) return Number(unallocAcc.balance) || 0;
  return totalAccountBalance.value - totalAllocated.value;
});

const showAllocateModal = ref(false);
const submittingAllocate = ref(false);
const allocateForm = ref({
  bucket_id: '',
  account_id: '',
  category_id: '',
  amount: '',
  description: ''
});

const openAllocateModal = (targetBucketId = null) => {
  allocateForm.value = {
    bucket_id: targetBucketId || activeBuckets.value[0]?.id || '',
    account_id: bankAccounts.value[0]?.id || '',
    category_id: props.categories[0]?.id || '',
    amount: '',
    description: ''
  };
  showAllocateModal.value = true;
};

const submitAllocateFromUnallocated = async () => {
  const amt = Math.round(Number(String(allocateForm.value.amount).replace(',', '.')) * 100) / 100;
  if (!amt || amt <= 0) {
    emit('error', 'Please enter a valid allocation amount.');
    return;
  }
  if (!allocateForm.value.bucket_id) {
    emit('error', 'Please select a target bucket.');
    return;
  }
  if (!allocateForm.value.account_id) {
    emit('error', 'Please select a bank account.');
    return;
  }
  if (amt > unassignedAmount.value) {
    emit('error', `Allocation exceeds available unallocated funds (${currencySymbol.value}${unassignedAmount.value.toFixed(2)} available).`);
    return;
  }

  submittingAllocate.value = true;
  try {
    await api.allocateUnassigned({
      bucket_id: allocateForm.value.bucket_id,
      account_id: allocateForm.value.account_id,
      category_id: allocateForm.value.category_id || null,
      amount: amt,
      description: allocateForm.value.description
    });
    showAllocateModal.value = false;
    emit('data-refresh');
  } catch (err) {
    emit('error', err.message || 'Failed to allocate funds.');
  } finally {
    submittingAllocate.value = false;
  }
};

const openCreateBucketModal = () => {
  activeEditingBucket.value = null;
  showBucketModal.value = true;
};

const openEditBucketModal = (bucket) => {
  activeEditingBucket.value = bucket;
  showBucketModal.value = true;
};

const handleSaveBucket = (payload) => {
  if (!payload) return;
  const { id, ...data } = payload;
  if (id) {
    emit('update-bucket', id, data);
  } else {
    emit('create-bucket', data);
  }
  showBucketModal.value = false;
};

const confirmDeleteBucket = (bucket) => {
  const allocation = formatAmount(bucket.allocated_balance);
  const confirm = window.confirm(`Permanently delete the bucket "${bucket.name}" and remove its ${currencySymbol.value}${allocation} allocation? Transaction history will be kept, but it will no longer reference this bucket. This cannot be undone.`);
  if (confirm) {
    emit('delete-bucket', bucket.id);
  }
};

const allocateToBucket = (bucket) => {
  openAllocateModal(bucket?.id);
};

// Quick Actions & Transfer Modals
const showTransferModal = ref(false);
const submittingTransfer = ref(false);
const transferForm = ref({ from_bucket_id: '', to_bucket_id: '', amount: '', description: '' });

const submitBucketTransfer = () => {
  if (!transferForm.value.from_bucket_id || !transferForm.value.to_bucket_id || !transferForm.value.amount) {
    emit('error', 'Please select both buckets and enter an amount.');
    return;
  }
  submittingTransfer.value = true;
  emit('transfer-bucket', {
    from_bucket_id: transferForm.value.from_bucket_id,
    to_bucket_id: transferForm.value.to_bucket_id,
    amount: Number(transferForm.value.amount),
    description: transferForm.value.description
  });
  submittingTransfer.value = false;
  showTransferModal.value = false;
  transferForm.value = { from_bucket_id: '', to_bucket_id: '', amount: '', description: '' };
};

const showAccountTransferModal = ref(false);
const submittingAccountTransfer = ref(false);
const accountTransferForm = ref({ from_account_id: '', to_account_id: '', amount: '', description: '' });

const submitAccountTransfer = () => {
  if (!accountTransferForm.value.from_account_id || !accountTransferForm.value.to_account_id || !accountTransferForm.value.amount) {
    emit('error', 'Please select both accounts and enter an amount.');
    return;
  }
  submittingAccountTransfer.value = true;
  emit('transfer-accounts', {
    from_account_id: accountTransferForm.value.from_account_id,
    to_account_id: accountTransferForm.value.to_account_id,
    amount: Number(accountTransferForm.value.amount),
    description: accountTransferForm.value.description
  });
  submittingAccountTransfer.value = false;
  showAccountTransferModal.value = false;
  accountTransferForm.value = { from_account_id: '', to_account_id: '', amount: '', description: '' };
};

// Presets State & Helpers
const showPresetsModal = ref(false);
const localPresets = ref([]);
const editingPreset = ref(null);
const applyingPreset = ref(null);
const presetBaseAmount = ref('');
const submittingPreset = ref(false);
const expandedPresetId = ref(null);

const loadPresets = async () => {
  try {
    localPresets.value = await api.getPresets();
  } catch (err) {
    console.error('Failed to load presets:', err);
  }
};

const getBucketName = (id) => {
  if (!id) return 'Unassigned / No Bucket';
  return (props.buckets || []).find(b => b.id === id)?.name || 'Unknown Bucket';
};
const getAccountName = (id) => (props.accounts || []).find(a => a.id === id)?.name || 'Unknown Account';
const getCategoryName = (id) => (props.categories || []).find(c => c.id === id)?.name || 'Unknown Category';
const getCategoryIcon = (id) => (props.categories || []).find(c => c.id === id)?.icon || '🏷️';
const getCategoryColor = (id) => (props.categories || []).find(c => c.id === id)?.color || '#D4BFFF';

const startApplyPreset = (preset) => {
  applyingPreset.value = JSON.parse(JSON.stringify(preset));
  presetBaseAmount.value = '';
};

const confirmApplyPreset = async () => {
  if (!applyingPreset.value) return;
  submittingPreset.value = true;
  try {
    let base = 0;
    if (applyingPreset.value.mode === 'percentage') {
      base = Number(presetBaseAmount.value);
      if (!base || base <= 0) {
        alert('Please enter a valid deposit amount.');
        submittingPreset.value = false;
        return;
      }
    }
    await api.applyPreset({
      preset_id: applyingPreset.value.id,
      base_amount: base
    });
    emit('data-refresh');
    applyingPreset.value = null;
    showPresetsModal.value = false;
  } catch (err) {
    alert(err.message);
  } finally {
    submittingPreset.value = false;
  }
};

const savePreset = async () => {
  if (!editingPreset.value?.name?.trim() || !editingPreset.value.rules.length) {
    alert('Please add a name and at least one rule.');
    return;
  }
  submittingPreset.value = true;
  try {
    const rules = editingPreset.value.rules.map(r => ({
      bucket_id: r.bucket_id || null,
      account_id: r.account_id || null,
      category_id: r.category_id || null,
      mode: editingPreset.value.mode,
      value: Number(r.value)
    }));
    let saved;
    if (editingPreset.value.id) {
      saved = await api.updatePreset(editingPreset.value.id, { name: editingPreset.value.name, mode: editingPreset.value.mode, rules });
    } else {
      saved = await api.createPreset({ name: editingPreset.value.name, mode: editingPreset.value.mode, rules });
    }
    await loadPresets();
    if (saved && saved.id) {
      expandedPresetId.value = saved.id;
    } else if (localPresets.value.length > 0) {
      expandedPresetId.value = localPresets.value[0].id;
    }
    editingPreset.value = null;
  } catch (err) {
    alert(err.message);
  } finally {
    submittingPreset.value = false;
  }
};

const deletePreset = async (id) => {
  if (!confirm('Delete this preset?')) return;
  try {
    await api.deletePreset(id);
    await loadPresets();
  } catch (err) { alert(err.message); }
};

const editingPresetTotalPercentage = computed(() => {
  if (!editingPreset.value || !editingPreset.value.rules || editingPreset.value.mode !== 'percentage') return 0;
  return editingPreset.value.rules.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
});

const editingPresetTotalFixed = computed(() => {
  if (!editingPreset.value || !editingPreset.value.rules || editingPreset.value.mode !== 'fixed') return 0;
  return editingPreset.value.rules.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
});

// Local reactive copies for smooth instant reordering & drag & drop
const localAccounts = ref([]);
const localBuckets = ref([]);
const localCategories = ref([]);

const updateLocalAccounts = () => {
  const list = [...(props.accounts || [])];
  const hasUnalloc = list.some(a => a.id === 'acc_unallocated_funds');
  if (!hasUnalloc) {
    list.unshift({
      id: 'acc_unallocated_funds',
      name: 'Unallocated Funds',
      type: 'System Pool',
      balance: unassignedAmount.value,
      isSystemDefault: true
    });
  }
  localAccounts.value = sortAccountsByOrder(list);
};

const updateLocalBuckets = () => {
  const list = showArchivedBuckets.value 
    ? (props.buckets || [])
    : (props.buckets || []).filter(b => !b.is_archived);
  localBuckets.value = [...list];
};

const updateLocalCategories = () => {
  localCategories.value = [...(props.categories || [])];
};

watch(() => props.accounts, updateLocalAccounts, { immediate: true, deep: true });
watch([() => props.buckets, showArchivedBuckets], updateLocalBuckets, { immediate: true, deep: true });
watch(() => props.categories, updateLocalCategories, { immediate: true, deep: true });

// Mobile Long-Press Drag & Drop State
const activeDragType = ref(null); // 'accounts', 'buckets', 'categories'
const activeDragIdx = ref(null);
const dropTargetIdx = ref(null);
const isDragActive = ref(false);
const touchStartY = ref(0);
const touchStartX = ref(0);
const dragOffsetY = ref(0);
let pressTimer = null;

const getTargetList = (type) => {
  if (type === 'accounts') return localAccounts;
  if (type === 'buckets') return localBuckets;
  if (type === 'categories') return localCategories;
  return null;
};

const triggerHaptic = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (e) {}
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50]);
    }
  } catch (err) {}
};

function removePointerListeners() {
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointermove', handleDragPointerMove);
    window.removeEventListener('pointerup', handleDragPointerUp);
    window.removeEventListener('pointercancel', handleDragPointerUp);
    window.removeEventListener('touchmove', handleDragPointerMove);
    window.removeEventListener('touchend', handleDragPointerUp);
  }
}

// Start Pointer gesture on Drag Handle with 180ms Long-Press delay
function handleDragPointerDown(event, idx, type) {
  try {
    if (typeof window !== 'undefined' && window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  } catch (e) {}

  activeDragType.value = type;
  activeDragIdx.value = idx;
  dropTargetIdx.value = idx;
  isDragActive.value = false;
  dragOffsetY.value = 0;

  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  touchStartY.value = clientY;
  touchStartX.value = clientX;

  if (pressTimer) clearTimeout(pressTimer);

  if (event.target && event.target.setPointerCapture && event.pointerId !== undefined) {
    try {
      event.target.setPointerCapture(event.pointerId);
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('pointermove', handleDragPointerMove, { passive: false });
    window.addEventListener('pointerup', handleDragPointerUp);
    window.addEventListener('pointercancel', handleDragPointerUp);
    window.addEventListener('touchmove', handleDragPointerMove, { passive: false });
    window.addEventListener('touchend', handleDragPointerUp);
  }

  const isMouse = event.pointerType === 'mouse' || (!event.touches && event.button === 0);

  if (isMouse) {
    // Mouse drag starts immediately for fast responsive PC drag-and-drop
    isDragActive.value = true;
    triggerHaptic();
  } else {
    // Touch drag uses 180ms long-press timer to allow touch scrolling
    pressTimer = setTimeout(() => {
      isDragActive.value = true;
      triggerHaptic();
    }, 180);
  }
}

function handleDragPointerMove(event) {
  if (activeDragIdx.value === null || !activeDragType.value) return;

  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const deltaY = clientY - touchStartY.value;
  const deltaX = clientX - touchStartX.value;

  // Cancel long-press if movement occurs before 180ms threshold -> enables native sheet scrolling!
  if (!isDragActive.value) {
    if (Math.hypot(deltaY, deltaX) > 6) {
      if (pressTimer) clearTimeout(pressTimer);
      pressTimer = null;
      removePointerListeners();
    }
    return;
  }

  if (event.cancelable && event.preventDefault) {
    event.preventDefault();
  }

  dragOffsetY.value = deltaY;

  const element = document.elementFromPoint(clientX, clientY);
  if (!element) return;
  const rowElement = element.closest('[data-drag-idx]');
  if (rowElement) {
    const idx = parseInt(rowElement.getAttribute('data-drag-idx'), 10);
    if (!isNaN(idx) && idx !== dropTargetIdx.value) {
      dropTargetIdx.value = idx;
    }
  }
}

function handleDragPointerUp() {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }

  removePointerListeners();

  const fromIdx = activeDragIdx.value;
  const toIdx = dropTargetIdx.value;
  const type = activeDragType.value;
  const wasActive = isDragActive.value;

  // Instantly clear drag state to eliminate visual lag/glitch when placing card
  activeDragType.value = null;
  activeDragIdx.value = null;
  dropTargetIdx.value = null;
  isDragActive.value = false;
  dragOffsetY.value = 0;

  if (wasActive && fromIdx !== null && toIdx !== null && type && fromIdx !== toIdx) {
    requestAnimationFrame(() => {
      const targetRef = getTargetList(type);
      if (targetRef && targetRef.value) {
        const list = [...targetRef.value];
        const [moved] = list.splice(fromIdx, 1);
        list.splice(toIdx, 0, moved);
        targetRef.value = list;

        const ids = list.map(item => item.id);
        if (type === 'accounts') {
          saveAccountOrder(ids);
          emit('reorder-accounts', ids);
        } else if (type === 'buckets') {
          emit('reorder-buckets', ids);
        } else if (type === 'categories') {
          emit('reorder-categories', ids);
        }
      }
    });
  }
}

// Calculate hardware-accelerated CSS translateY transform for surrounding rows
const getItemTransform = (idx, type) => {
  if (!isDragActive.value || activeDragType.value !== type || activeDragIdx.value === null || dropTargetIdx.value === null) {
    return 'translateY(0px)';
  }

  const from = activeDragIdx.value;
  const to = dropTargetIdx.value;

  if (idx === from) {
    return `translateY(${dragOffsetY.value}px)`;
  }

  if (from < to && idx > from && idx <= to) {
    return 'translateY(-52px)';
  }

  if (from > to && idx >= to && idx < from) {
    return 'translateY(52px)';
  }

  return 'translateY(0px)';
};

const closeSheet = () => {
  activeSheet.value = null;
};


const loadBackupsList = async () => {
  try {
    backupsList.value = await api.getBackups();
  } catch (err) {
    console.error('Failed to load backups list:', err);
  }
};

onMounted(() => {
  loadBackupsList();
});

watch(showPresetsModal, (val) => {
  if (val) loadPresets();
});

const handleCreateSnapshot = async () => {
  creatingBackup.value = true;
  try {
    const res = await api.createBackup();
    alert(`Snapshot backup created: ${res.backup_filename}`);
    await loadBackupsList();
  } catch (err) {
    alert(`Failed to create backup: ${err.message}`);
  } finally {
    creatingBackup.value = false;
  }
};

const handleImportBackupFile = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const res = await api.importVault(file);
    alert(`Successfully imported backup file "${file.name}"! Vault loaded: ${res.active_vault}. Reloading application...`);
    window.location.reload();
  } catch (err) {
    if (!/cancelled/i.test(err.message)) alert(`Failed to import backup file: ${err.message}`);
  } finally {
    event.target.value = '';
  }
};

const handleRestoreBackup = async (filename) => {
  if (confirm(`Are you sure you want to restore database from backup "${filename}"? Current data will be overwritten.`)) {
    try {
      await api.restoreBackup(filename);
      alert(`Successfully restored database from backup! Application will reload.`);
      window.location.reload();
    } catch (err) {
      alert(`Failed to restore backup: ${err.message}`);
    }
  }
};

const handleExportActiveDatabase = async () => {
  try {
    await api.exportActiveDatabase();
  } catch (err) {
    alert(`Failed to export database: ${err.message}`);
  }
};

const handleDownloadBackup = async (filename) => {
  try {
    await api.downloadBackupFile(filename);
  } catch (err) {
    if (!/cancelled/i.test(err.message)) alert(err.message || 'Failed to download backup.');
  }
};

// Encrypted Backup Passphrase Modal State
const showPassphraseModal = ref(false);
const selectedBackupForShare = ref('');
const sharePassphrase = ref('');
const showPassphraseText = ref(false);
const passphraseError = ref('');
const isSharingBackup = ref(false);

const handleShareBackup = (filename) => {
  selectedBackupForShare.value = filename;
  sharePassphrase.value = '';
  showPassphraseText.value = false;
  passphraseError.value = '';
  showPassphraseModal.value = true;
};

const confirmShareBackup = async () => {
  if (!sharePassphrase.value || sharePassphrase.value.length < 8) {
    passphraseError.value = 'Passphrase must be at least 8 characters long.';
    return;
  }

  isSharingBackup.value = true;
  passphraseError.value = '';
  try {
    await api.shareBackupFile(selectedBackupForShare.value, sharePassphrase.value);
    showPassphraseModal.value = false;
  } catch (err) {
    passphraseError.value = err.message || 'Failed to share encrypted backup file.';
  } finally {
    isSharingBackup.value = false;
  }
};

const formatSize = (bytes) => {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};
</script>

<style scoped>
.flip-list-move {
  transition: transform 0.25s cubic-bezier(0.2, 1, 0.3, 1);
}
</style>
