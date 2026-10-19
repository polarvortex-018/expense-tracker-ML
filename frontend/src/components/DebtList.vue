<template>
  <div class="space-y-6">
    <!-- Header -->
    <div data-tour="debt-list" class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#1f202e] pb-3 animate-cascade-1">
      <div>
        <h2 class="text-lg font-bold text-[#f1f0f5] tracking-tight">Debt Tracker</h2>
        <p class="text-xs text-[#9e9cae]">Track money lent to people and money borrowed from others</p>
      </div>
      <button
        type="button"
        @click="openAddModal()"
        class="flex min-h-11 items-center gap-1.5 px-4 py-2 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl transition shadow-sm cursor-pointer shrink-0"
      >
        <span class="material-symbols-outlined text-base leading-none">add</span>
        <span>Record Debt</span>
      </button>
    </div>

    <!-- Summary Metrics Section (Flush, Hairline Dividers) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-[#1f202e] animate-cascade-2">
      <!-- Owed to You -->
      <div>
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#B3F5E1]">Owed To You</span>
          <span class="material-symbols-outlined text-base text-[#B3F5E1]">south_west</span>
        </div>
        <p class="mt-1 text-2xl font-bold text-[#f1f0f5] tabular-nums tracking-tight">
          {{ currencySymbol }}{{ formatAmount(totalOwedToYou) }}
        </p>
        <p class="mt-0.5 text-[10px] text-[#9e9cae]">Money lent to others (Unsettled)</p>
      </div>

      <!-- You Owe -->
      <div>
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#FFD1B3]">You Owe</span>
          <span class="material-symbols-outlined text-base text-[#FFD1B3]">north_east</span>
        </div>
        <p class="mt-1 text-2xl font-bold text-[#f1f0f5] tabular-nums tracking-tight">
          {{ currencySymbol }}{{ formatAmount(totalYouOwe) }}
        </p>
        <p class="mt-0.5 text-[10px] text-[#9e9cae]">Money borrowed from others (Unsettled)</p>
      </div>

      <!-- Net Position -->
      <div>
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#D4BFFF]">Net Position</span>
        </div>
        <p class="mt-1 text-2xl font-bold tabular-nums tracking-tight" :class="netPosition >= 0 ? 'text-[#B3F5E1]' : 'text-[#FFD1B3]'">
          {{ currencySymbol }}{{ formatAmount(netPosition) }}
        </p>
        <p class="mt-0.5 text-[10px] text-[#9e9cae]">
          {{ netPosition >= 0 ? 'Net surplus' : 'Net liability' }}
        </p>
      </div>
    </div>

    <!-- Debt Controls & Hairline List -->
    <div class="space-y-3 animate-cascade-3">
      <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5">
        <!-- Tabs -->
        <div class="flex gap-1 bg-[#0f1019] p-1 rounded-xl border border-[#1f202e]">
          <button 
            @click="activeTab = 'active'"
            class="min-h-11 px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer"
            :class="activeTab === 'active' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
          >
            Active
          </button>
          <button 
            @click="activeTab = 'settled'"
            class="min-h-11 px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer"
            :class="activeTab === 'settled' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
          >
            Settled
          </button>
          <button 
            @click="activeTab = 'all'"
            class="min-h-11 px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer"
            :class="activeTab === 'all' ? 'bg-[#D4BFFF] text-[#0f0f15]' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
          >
            All
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative flex-grow sm:max-w-xs">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search person or notes..."
            class="min-h-11 w-full pl-8 pr-3 py-1.5 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs placeholder-[#9e9cae] focus:outline-none transition"
          />
          <span class="material-symbols-outlined text-xs absolute left-2.5 top-2 text-[#9e9cae]">search</span>
        </div>
      </div>

      <!-- Debts grouped by person -->
      <div v-if="visiblePeople.length" class="border-y border-[#1f202e] divide-y divide-[#1f202e]">
        <button v-for="person in visiblePeople" :key="person.key" type="button" @click="openDetailModal(person)" class="flex min-h-16 w-full items-center gap-3 px-2 py-3 text-left transition hover:bg-[#141520] active:bg-[#191924]">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl border border-[#D4BFFF]/20 bg-[#D4BFFF]/10 text-[#D4BFFF]"><span class="material-symbols-outlined">person</span></span>
          <span class="min-w-0 flex-1"><span class="block truncate text-sm font-bold text-[#f1f0f5]">{{ person.name }}</span><span class="mt-1 block text-[10px] text-[#9e9cae]">{{ person.debts.length }} entr{{ person.debts.length === 1 ? 'y' : 'ies' }} · {{ person.activeCount }} active</span></span>
          <span class="shrink-0 text-right"><span v-if="person.totalLent" class="block text-xs font-bold text-[#B3F5E1]">{{ currencySymbol }}{{ formatAmount(person.totalLent) }} owed to you</span><span v-if="person.totalBorrowed" class="mt-1 block text-xs font-bold text-[#FFD1B3]">{{ currencySymbol }}{{ formatAmount(person.totalBorrowed) }} you owe</span><span v-if="!person.totalLent && !person.totalBorrowed" class="text-xs text-[#9e9cae]">Settled</span></span>
          <span class="material-symbols-outlined shrink-0 text-[#9e9cae]">chevron_right</span>
        </button>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8 border-y border-[#1f202e] text-xs text-[#9e9cae] space-y-1">
        <p class="text-xs text-[#f1f0f5] font-semibold">No debts found matching your filters.</p>
        <p class="text-[11px]">Tap "Record Debt" above to log a debt entry.</p>
      </div>
    </div>

    <!-- Add Debt Modal Sheet -->
    <Transition name="modal">
      <div v-if="showAddModal" class="fixed inset-0 z-[110] flex items-start sm:items-center justify-center p-2 safe-area-modal-pt sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto" @click.self="showAddModal = false">
        <div class="relative w-full max-w-md bg-[#0c0d14] border border-[#1f202e] rounded-2xl shadow-2xl overflow-hidden transform transition-all max-h-[calc(100dvh-1rem)] flex flex-col my-auto">
          
          <!-- Header -->
          <div class="px-5 py-3.5 border-b border-[#1f202e] flex justify-between items-center bg-[#0c0d14] shrink-0">
            <div>
              <h3 class="text-base font-bold text-[#D4BFFF] tracking-tight">{{ personNameLocked ? 'Add Debt Entry' : 'Record New Debt' }}</h3>
              <p class="text-[11px] text-[#9e9cae]">{{ personNameLocked ? `Add another entry for ${newDebt.person_name}` : 'Track money lent or borrowed' }}</p>
            </div>
            <button @click="showAddModal = false" class="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#9e9cae] hover:text-[#f1f0f5] cursor-pointer">
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <form @submit.prevent="submitAddDebt" class="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain pb-48 sm:pb-6">
            <!-- Person Name -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">Person Name *</label>
              <input 
                v-model="newDebt.person_name"
                type="text"
                placeholder="e.g. John Doe"
                required
                :readonly="personNameLocked"
                @focus="$event.target.scrollIntoView({ behavior: 'smooth', block: 'center' })"
                class="w-full px-3 py-2 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs placeholder-[#9e9cae] focus:outline-none transition"
              />
            </div>

            <!-- Debt Type Switcher -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">Debt Type *</label>
              <div class="grid grid-cols-2 gap-2 p-1 bg-[#0f1019] rounded-xl border border-[#1f202e]">
                <button 
                  type="button"
                  @click="newDebt.type = 'lent'"
                  class="py-2 text-xs font-bold rounded-lg transition cursor-pointer flex flex-col items-center justify-center"
                  :class="newDebt.type === 'lent' ? 'bg-[#10b981] text-white shadow-sm' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
                >
                  <span>Lent Money</span>
                  <span class="text-[9px] font-normal opacity-80">(Deducts from account)</span>
                </button>
                <button 
                  type="button"
                  @click="newDebt.type = 'borrowed'"
                  class="py-2 text-xs font-bold rounded-lg transition cursor-pointer flex flex-col items-center justify-center"
                  :class="newDebt.type === 'borrowed' ? 'bg-[#ef4444] text-white shadow-sm' : 'text-[#9e9cae] hover:text-[#f1f0f5]'"
                >
                  <span>Borrowed Money</span>
                  <span class="text-[9px] font-normal opacity-80">(Adds to account)</span>
                </button>
              </div>
            </div>

            <!-- Amount Input -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">AMOUNT *</label>
              <div class="flex items-center gap-1 border-b border-[#1f202e] focus-within:border-[#D4BFFF] pb-1">
                <span class="text-base font-bold text-[#9e9cae]">{{ currencySymbol }}</span>
                <input 
                  v-model="newDebt.amount"
                  type="text"
                  inputmode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  autocomplete="off"
                  placeholder="0.00"
                  required
                  @focus="$event.target.scrollIntoView({ behavior: 'smooth', block: 'center' })"
                  class="w-full text-base sm:text-lg font-bold text-[#f1f0f5] tabular-nums bg-transparent focus:outline-none transition"
                />
              </div>
            </div>

            <!-- Account Selection (2-Column Mobile Grid) -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">ACCOUNT *</label>
              <AccountGrid :accounts="accounts" v-model="newDebt.account_id" />
            </div>

            <!-- Savings Bucket Selection -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">SAVINGS BUCKET *</label>
              <BucketGrid :buckets="activeBuckets" v-model="newDebt.bucket_id" />
            </div>

            <!-- Notes / Description -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">REASON (OPTIONAL)</label>
              <input 
                v-model="newDebt.description"
                type="text"
                placeholder="e.g. Dinner split, Emergency cash"
                @focus="$event.target.scrollIntoView({ behavior: 'smooth', block: 'center' })"
                class="w-full px-3 py-2 bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl text-[#f1f0f5] text-xs placeholder-[#9e9cae] focus:outline-none transition"
              />
            </div>

            <!-- Action CTA -->
            <div class="pt-2 border-t border-[#1f202e]">
              <button 
                type="submit" 
                :disabled="submitting"
                class="w-full py-3 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span v-if="submitting" class="w-4 h-4 border-2 border-[#0f0f15] border-t-transparent rounded-full animate-spin"></span>
                <span v-else class="material-symbols-outlined text-base">check</span>
                <span>{{ submitting ? 'Saving Debt...' : (personNameLocked ? 'Add Debt Entry' : 'Save Debt') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Settle Debt Modal -->
    <Transition name="modal">
      <div v-if="showSettleModal" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0c0d14]/95 backdrop-blur-md" @click.self="showSettleModal = false">
        <div class="relative w-full max-w-md bg-[#0c0d14] border-t sm:border border-[#1f202e] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] pb-6 sm:pb-0">
          
          <!-- Header -->
          <div class="px-5 py-3.5 border-b border-[#1f202e] flex justify-between items-center bg-[#0c0d14] shrink-0">
            <h3 class="text-base font-bold text-[#D4BFFF] tracking-tight">Settle Debt</h3>
            <button @click="showSettleModal = false" class="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#9e9cae] hover:text-[#f1f0f5] cursor-pointer">
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <div class="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
            <div v-if="settlingDebts" class="p-3.5 bg-[#0f1019] border border-[#1f202e] rounded-xl space-y-1">
              <p class="text-xs text-[#9e9cae]">Settling all active debts with <strong class="text-[#f1f0f5]">{{ settlingDebts[0]?.person_name }}</strong></p>
              <p class="text-xl font-bold tabular-nums" :class="settlementNet >= 0 ? 'text-[#B3F5E1]' : 'text-[#FFD1B3]'">{{ currencySymbol }}{{ formatAmount(Math.abs(settlementNet)) }}</p>
              <p class="text-[11px] text-[#9e9cae] leading-tight">{{ settlementNet === 0 ? 'The debts cancel each other out; no payment is needed.' : settlementNet > 0 ? 'They pay you this net amount.' : 'You pay them this net amount.' }}</p>
            </div>
            <div v-else-if="settlingDebt" class="p-3.5 bg-[#0f1019] border border-[#1f202e] rounded-xl space-y-1">
              <p class="text-xs text-[#9e9cae]">Settling debt with <strong class="text-[#f1f0f5]">{{ settlingDebt.person_name }}</strong></p>
              <p class="text-xl font-bold text-[#B3F5E1] tabular-nums">{{ currencySymbol }}{{ formatAmount(settlingDebt.amount) }}</p>
              <p class="text-[11px] text-[#9e9cae] leading-tight">
                {{ settlingDebt.type === 'lent' ? 'Repayment received from person → Deposits into selected account' : 'Repaid money back to person → Deducts from selected account' }}
              </p>
            </div>

            <div v-if="!settlingDebts || settlementNet !== 0" class="space-y-1.5">
              <label class="text-[10px] font-bold text-[#9e9cae] uppercase tracking-wider block">SETTLEMENT ACCOUNT *</label>
              <AccountGrid :accounts="accounts" v-model="settleAccountId" />
            </div>
            <button
              @click="submitSettleDebt"
              :disabled="submitting"
              class="w-full py-3 bg-[#B3F5E1] hover:bg-[#86efac] text-[#0f0f15] font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span v-if="submitting" class="w-4 h-4 border-2 border-[#0f0f15] border-t-transparent rounded-full animate-spin"></span>
              <span v-else class="material-symbols-outlined text-base">task_alt</span>
              <span>{{ settlingDebts ? 'Settle All' : 'Confirm & Mark Settled' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Person Debt Details -->
    <Transition name="modal">
      <div v-if="selectedPerson" class="fixed inset-0 z-[90] flex items-end justify-center bg-[#0c0d14]/95 backdrop-blur-md sm:items-center sm:p-4" @click.self="selectedPersonKey = null">
        <section class="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-[#1f202e] bg-[#0c0d14] sm:max-w-xl sm:rounded-2xl sm:border">
          <header class="flex items-center justify-between gap-3 border-b border-[#1f202e] px-5 py-4">
            <div class="min-w-0"><h3 class="truncate text-base font-bold text-[#f1f0f5]">{{ selectedPerson.name }}</h3><p class="mt-1 text-[11px] text-[#9e9cae]">{{ selectedPerson.debts.length }} debt entries</p></div>
            <button type="button" aria-label="Close person debts" class="grid size-11 shrink-0 place-items-center rounded-xl text-[#9e9cae] hover:bg-[#191924] hover:text-[#f1f0f5]" @click="selectedPersonKey = null"><span class="material-symbols-outlined">close</span></button>
          </header>
          <div class="grid grid-cols-2 gap-2 p-4 sm:p-5">
            <article class="rounded-xl border border-[#B3F5E1]/20 bg-[#B3F5E1]/5 p-3"><p class="text-[10px] text-[#9e9cae]">Owed to you</p><p class="mt-1 text-sm font-bold text-[#B3F5E1] tabular-nums">{{ currencySymbol }}{{ formatAmount(selectedPerson.totalLent) }}</p></article>
            <article class="rounded-xl border border-[#FFD1B3]/20 bg-[#FFD1B3]/5 p-3"><p class="text-[10px] text-[#9e9cae]">You owe</p><p class="mt-1 text-sm font-bold text-[#FFD1B3] tabular-nums">{{ currencySymbol }}{{ formatAmount(selectedPerson.totalBorrowed) }}</p></article>
          </div>
          <div class="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-4 sm:px-5">
            <article v-for="debt in selectedPerson.debts" :key="debt.id" class="rounded-xl border border-[#1f202e] bg-[#0f1019] p-3">
              <div class="flex items-start justify-between gap-3"><div class="min-w-0"><p class="text-xs font-bold" :class="debt.type === 'lent' ? 'text-[#B3F5E1]' : 'text-[#FFD1B3]'">{{ debt.type === 'lent' ? 'Lent · Owed to you' : 'Borrowed · You owe' }} <span class="ml-1 text-[10px] font-medium text-[#9e9cae]">{{ debt.is_settled ? 'Settled' : 'Active' }}</span></p><p class="mt-1 break-words text-xs text-[#ccc3d8]">{{ debt.description || 'No reason recorded' }}</p><p class="mt-1 text-[10px] text-[#9e9cae]">{{ formatDate(debt.created_at) }} · {{ getAccountName(debt.account_id) }}</p></div><p class="shrink-0 text-sm font-bold tabular-nums" :class="debt.type === 'lent' ? 'text-[#B3F5E1]' : 'text-[#FFD1B3]'">{{ currencySymbol }}{{ formatAmount(debt.amount) }}</p></div>
              <div class="mt-3 flex justify-end gap-2"><button v-if="!debt.is_settled" type="button" class="min-h-11 rounded-lg bg-[#B3F5E1]/10 px-3 text-[11px] font-bold text-[#B3F5E1]" @click="openSettleModal(debt)">Settle</button><button type="button" class="min-h-11 rounded-lg bg-[#FFD1B3]/10 px-3 text-[11px] font-bold text-[#FFD1B3]" @click="confirmDelete(debt)">Delete</button></div>
            </article>
            <p v-if="!selectedPerson.debts.length" class="py-8 text-center text-xs text-[#9e9cae]">No debt entries yet.</p>
          </div>
                    <footer class="space-y-2 border-t border-[#1f202e] p-4 sm:px-5">
            <button v-if="activePersonDebts.length" type="button" class="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#B3F5E1] text-xs font-bold text-[#0f0f15]" @click="openSettleAllModal"><span class="material-symbols-outlined text-base">task_alt</span>Settle all</button>
            <button type="button" class="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#D4BFFF] text-xs font-bold text-[#0f0f15]" @click="openAddModal(selectedPerson)"><span class="material-symbols-outlined text-base">add</span>Add debt to {{ selectedPerson.name }}</button>
          </footer>
        </section>
      </div>
    </Transition>

    <!-- Custom App-Styled Delete Debt Confirmation Modal -->
    <Transition name="modal-fade">
      <div 
        v-if="showDeleteConfirmModal" 
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0c0d14]/95 backdrop-blur-md"
        @click.self="showDeleteConfirmModal = false"
      >
        <div class="relative w-full max-w-sm bg-[#0f1019] border border-[#1f202e] rounded-2xl shadow-2xl p-5 space-y-4 text-left">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-xl">delete_forever</span>
            </div>
            <div>
              <h3 class="text-sm font-bold text-[#f1f0f5]">Delete Debt Record</h3>
              <p class="text-xs text-[#9e9cae] mt-0.5 leading-snug">
                Are you sure you want to delete debt record for <strong class="text-[#f1f0f5]">"{{ debtToDelete?.person_name }}"</strong>? This action cannot be undone.
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
              @click="executeDeleteDebt" 
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

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.22s var(--ease-out), transform 0.22s var(--ease-out); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.96) translateY(6px); }
</style>

<script setup>
import { ref, computed } from 'vue';
import BucketGrid from './BucketGrid.vue';
import AccountGrid from './AccountGrid.vue';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import { currencySymbol } from '../utils/currency.js';

const props = defineProps({
  debts: {
    type: Array,
    required: true
  },
  accounts: {
    type: Array,
    required: true
  },
  buckets: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['create-debt', 'settle-debt', 'settle-debts', 'delete-debt']);

// Filter states
const activeTab = ref('active'); // 'active', 'settled', 'all'
const searchQuery = ref('');

// Modal states
const showAddModal = ref(false);
const showSettleModal = ref(false);
const selectedPersonKey = ref(null);
const personNameLocked = ref(false);
const submitting = ref(false);

const openDetailModal = (person) => { selectedPersonKey.value = person.key; };

const newDebt = ref({
  person_name: '',
  type: 'lent',
  amount: '',
  account_id: '',
  bucket_id: '',
  description: ''
});

const settlingDebt = ref(null);
const settlingDebts = ref(null);
const settlementNet = ref(0);
const settleAccountId = ref('');

// Formatters
const formatAmount = (val) => {
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (isoStr) => {
  return formatDateDDMMYYYY(isoStr);
};

const getAccountName = (accId) => {
  const acc = props.accounts.find(a => a.id === accId);
  return acc ? acc.name : 'Unknown Account';
};

// Computeds for metrics
const totalOwedToYou = computed(() => {
  return props.debts
    .filter(d => d.type === 'lent' && !d.is_settled)
    .reduce((sum, d) => sum + Number(d.amount), 0);
});

const totalYouOwe = computed(() => {
  return props.debts
    .filter(d => d.type === 'borrowed' && !d.is_settled)
    .reduce((sum, d) => sum + Number(d.amount), 0);
});

const netPosition = computed(() => {
  return totalOwedToYou.value - totalYouOwe.value;
});
const activeBuckets = computed(() => props.buckets.filter(bucket => !bucket.is_archived));

// Group individual debt records under a person's name; keep lent and borrowed totals separate.
const allPeople = computed(() => {
  const groups = new Map();
  for (const debt of [...props.debts].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))) {
    const name = String(debt.person_name || '').trim();
    const key = name.toLocaleLowerCase();
    if (!groups.has(key)) groups.set(key, { key, name, debts: [], totalLent: 0, totalBorrowed: 0, activeCount: 0 });
    const person = groups.get(key);
    person.debts.push(debt);
    if (!debt.is_settled) {
      person.activeCount += 1;
      if (debt.type === 'lent') person.totalLent += Number(debt.amount) || 0;
      else person.totalBorrowed += Number(debt.amount) || 0;
    }
  }
  return [...groups.values()];
});

const visiblePeople = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase();
  return allPeople.value.filter(person => {
    const entries = person.debts.filter(debt => activeTab.value === 'active' ? !debt.is_settled : activeTab.value === 'settled' ? Boolean(debt.is_settled) : true);
    if (!entries.length) return false;
    return !query || person.name.toLocaleLowerCase().includes(query) || entries.some(debt => String(debt.description || '').toLocaleLowerCase().includes(query));
  });
});

const selectedPerson = computed(() => allPeople.value.find(person => person.key === selectedPersonKey.value) || null);
const activePersonDebts = computed(() => selectedPerson.value?.debts.filter(debt => !debt.is_settled) || []);

// Handlers
const openAddModal = (person = null) => {
  personNameLocked.value = Boolean(person);
  if (person) activeTab.value = 'active';
  newDebt.value = {
    person_name: person?.name || '',
    type: person?.debts[0]?.type || 'lent',
    amount: '',
    account_id: props.accounts.length > 0 ? props.accounts[0].id : '',
    bucket_id: activeBuckets.value.length > 0 ? activeBuckets.value[0].id : '',
    description: ''
  };
  showAddModal.value = true;
};

const submitAddDebt = async () => {
  if (!newDebt.value.person_name.trim() || !newDebt.value.amount || !newDebt.value.account_id || !newDebt.value.bucket_id) return;
  submitting.value = true;
  try {
    emit('create-debt', {
      person_name: newDebt.value.person_name.trim(),
      type: newDebt.value.type,
      amount: Number(newDebt.value.amount),
      account_id: newDebt.value.account_id,
      bucket_id: newDebt.value.bucket_id,
      description: newDebt.value.description.trim() || null
    });
    showAddModal.value = false;
  } finally {
    submitting.value = false;
  }
};

const openSettleModal = (debt) => {
  settlingDebts.value = null;
  settlingDebt.value = debt;
  settleAccountId.value = debt.account_id || (props.accounts.length > 0 ? props.accounts[0].id : '');
  showSettleModal.value = true;
};

const openSettleAllModal = () => {
  settlingDebt.value = null;
  settlingDebts.value = activePersonDebts.value;
  settlementNet.value = selectedPerson.value.totalLent - selectedPerson.value.totalBorrowed;
  settleAccountId.value = activePersonDebts.value[0]?.account_id || props.accounts[0]?.id || '';
  showSettleModal.value = true;
};

const submitSettleDebt = async () => {
  if (settlingDebts.value) {
    if (settlementNet.value !== 0 && !settleAccountId.value) return;
    submitting.value = true;
    try {
      emit('settle-debts', settlingDebts.value.map(debt => debt.id), settleAccountId.value);
      showSettleModal.value = false;
    } finally {
      submitting.value = false;
    }
    return;
  }
  if (!settlingDebt.value || !settleAccountId.value) return;
  submitting.value = true;
  try {
    emit('settle-debt', settlingDebt.value.id, settleAccountId.value);
    showSettleModal.value = false;
  } finally {
    submitting.value = false;
  }
};
const showDeleteConfirmModal = ref(false);
const debtToDelete = ref(null);

const confirmDelete = (debt) => {
  debtToDelete.value = debt;
  showDeleteConfirmModal.value = true;
};

const executeDeleteDebt = () => {
  if (debtToDelete.value) {
    emit('delete-debt', debtToDelete.value.id);
  }
  showDeleteConfirmModal.value = false;
  debtToDelete.value = null;
};
</script>
