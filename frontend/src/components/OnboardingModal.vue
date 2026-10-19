<template>
  <div>
    <!-- ============================================================== -->
    <!-- MODE 1: QUICK VAULT SETUP WIZARD DIALOG                        -->
    <!-- ============================================================== -->
    <div v-if="isOpen && !isSpotlightTour" class="fixed inset-0 z-[100] bg-[#0c0d14]/95 backdrop-blur-xl flex items-start sm:items-center justify-center p-3 pt-[max(2.5rem,env(safe-area-inset-top))] sm:p-4 overflow-y-auto">
      <div class="relative w-full max-w-xl bg-[#0f1019] border border-[#1f202e] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[calc(100dvh-3.5rem)]">
        
        <!-- TOP HEADER BAR -->
        <div class="px-5 py-4 border-b border-[#1f202e] flex items-center justify-between bg-[#141520]/80 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-[#D4BFFF]/10 border border-[#D4BFFF]/20 text-[#D4BFFF] flex items-center justify-center font-bold text-sm">
              <span class="material-symbols-outlined text-lg">tune</span>
            </div>
            <div>
              <h2 class="text-sm font-bold text-[#f1f0f5] leading-tight">Quick Vault Setup</h2>
              <p class="text-[10px] text-[#9e9cae] leading-tight">Step {{ setupStep }} of 5</p>
            </div>
          </div>

          <!-- SKIP SETUP BUTTON -->
          <button
            @click="skipSetup"
            type="button"
            class="px-3 py-1.5 rounded-xl bg-[#141520] hover:bg-[#1f202e] border border-[#1f202e] text-[11px] font-bold text-[#9e9cae] hover:text-[#f1f0f5] transition cursor-pointer active:scale-95"
          >
            Skip Setup
          </button>
        </div>

        <!-- PROGRESS BAR -->
        <div class="w-full bg-[#141520] h-1.5 shrink-0 overflow-hidden">
          <div 
            class="bg-[#D4BFFF] h-full transition-all duration-300 ease-out"
            :style="{ width: (setupStep / 5 * 100) + '%' }"
          ></div>
        </div>

        <!-- WIZARD BODY CONTENT -->
        <div class="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          <!-- STEP 1: CURRENCY & REGION -->
          <div v-if="setupStep === 1" class="space-y-4">
            <div class="space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#D4BFFF]">Primary Currency</span>
              <h3 class="text-base font-bold text-[#f1f0f5]">Choose Vault Currency</h3>
              <p class="text-xs text-[#9e9cae]">Select the default currency symbol and code used across all calculations in this vault.</p>
            </div>

            <!-- Active Currency Selected Card -->
            <div class="p-4 bg-[#141520] border border-[#D4BFFF]/40 rounded-2xl flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#D4BFFF]/20 border border-[#D4BFFF]/40 text-[#D4BFFF] font-bold text-lg flex items-center justify-center">
                  {{ currencySymbol }}
                </div>
                <div>
                  <h4 class="text-xs font-bold text-[#f1f0f5]">{{ currentCurrency?.name || 'Indian Rupee' }}</h4>
                  <p class="text-[10px] text-[#9e9cae] font-mono">{{ currentCurrency?.code || 'INR' }} ({{ currencySymbol }})</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-[#B3F5E1]/15 text-[#B3F5E1] text-[10px] font-bold border border-[#B3F5E1]/30">Active</span>
            </div>

            <!-- Currency Search Input -->
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-2.5 text-base text-[#9e9cae]">search</span>
              <input
                v-model="currencySearchQuery"
                type="text"
                placeholder="Search currency by code or name..."
                class="w-full bg-[#0f1019] border border-[#1f202e] focus:border-[#D4BFFF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#f1f0f5] placeholder-[#9e9cae] focus:outline-none"
              />
            </div>

            <!-- Quick Currency Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              <button
                v-for="curr in filteredCurrencies"
                :key="curr.code"
                @click="selectCurrencyCode(curr.code)"
                type="button"
                class="p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 active:scale-95"
                :class="currentCurrency?.code === curr.code ? 'bg-[#D4BFFF]/15 border-[#D4BFFF] text-[#f1f0f5] font-bold' : 'bg-[#141520] border-[#1f202e] text-[#9e9cae] hover:border-[#D4BFFF]/40 hover:text-[#f1f0f5]'"
              >
                <span class="w-6 h-6 rounded-lg bg-[#0f1019] border border-[#1f202e] text-[11px] font-bold text-[#D4BFFF] flex items-center justify-center shrink-0">
                  {{ curr.symbol }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-[11px] font-bold truncate leading-tight">{{ curr.name }}</p>
                  <p class="text-[9px] opacity-70 font-mono leading-tight">{{ curr.code }}</p>
                </div>
              </button>
            </div>
          </div>

          <!-- STEP 2: STORAGE ACCOUNTS SETUP -->
          <div v-else-if="setupStep === 2" class="space-y-4">
            <div class="space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#D4BFFF]">Physical Storage Accounts</span>
              <h3 class="text-base font-bold text-[#f1f0f5]">Configure Your Storage Accounts</h3>
              <p class="text-xs text-[#9e9cae]">Select the physical bank accounts, cash reserves, and digital wallets you wish to track.</p>
            </div>

            <!-- Default Account Options List -->
            <div class="space-y-2">
              <div
                v-for="(acc, idx) in accountOptions"
                :key="acc.name"
                class="p-3 bg-[#141520] border border-[#1f202e] rounded-2xl flex items-center justify-between transition"
                :class="acc.selected ? 'border-[#D4BFFF]/40' : 'opacity-60'"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-[#0f1019] border border-[#1f202e] text-[#D4BFFF] flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-base">{{ acc.icon }}</span>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-[#f1f0f5]">{{ acc.name }}</h4>
                    <p class="text-[10px] text-[#9e9cae]">{{ acc.type }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <!-- Starting Balance Input -->
                  <div v-if="acc.selected" class="flex items-center gap-1 bg-[#0f1019] border border-[#1f202e] rounded-xl px-2.5 py-1">
                    <span class="text-[10px] text-[#9e9cae] font-mono">{{ currencySymbol }}</span>
                    <input
                      v-model="acc.seedBalance"
                      type="number"
                      placeholder="0.00"
                      class="w-20 bg-transparent text-xs text-[#f1f0f5] font-bold tabular-nums focus:outline-none"
                    />
                  </div>

                  <!-- Toggle Button -->
                  <button
                    @click="toggleAccountOption(idx)"
                    type="button"
                    class="w-7 h-7 rounded-xl border flex items-center justify-center transition cursor-pointer"
                    :class="acc.selected ? 'bg-[#D4BFFF] text-[#0f0f15] border-[#D4BFFF]' : 'bg-[#0f1019] text-[#9e9cae] border-[#1f202e]'"
                  >
                    <span class="material-symbols-outlined text-sm">{{ acc.selected ? 'check' : 'add' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Custom Account Form Trigger -->
            <div v-if="!showCustomAccountForm">
              <button
                @click="showCustomAccountForm = true"
                type="button"
                class="w-full py-2.5 border border-dashed border-[#1f202e] hover:border-[#D4BFFF]/50 rounded-2xl text-xs font-bold text-[#D4BFFF] hover:bg-[#141520] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span class="material-symbols-outlined text-base">add_circle</span>
                <span>Add Custom Storage Account</span>
              </button>
            </div>

            <!-- Custom Account Creator Card -->
            <div v-else class="p-4 bg-[#141520] border border-[#D4BFFF]/40 rounded-2xl space-y-3">
              <h4 class="text-xs font-bold text-[#f1f0f5]">Add New Storage Account</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  v-model="customAccount.name"
                  type="text"
                  placeholder="Account Name (e.g. HDFC Bank)"
                  class="bg-[#0f1019] border border-[#1f202e] rounded-xl px-3 py-2 text-xs text-[#f1f0f5] focus:outline-none focus:border-[#D4BFFF]"
                />
                <select
                  v-model="customAccount.type"
                  class="bg-[#0f1019] border border-[#1f202e] rounded-xl px-3 py-2 text-xs text-[#f1f0f5] focus:outline-none focus:border-[#D4BFFF]"
                >
                  <option value="Checking">Checking Account</option>
                  <option value="Savings">Savings Account</option>
                  <option value="Cash">Cash Reserve</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Wallet">Digital Wallet</option>
                </select>
              </div>
              <div class="flex justify-end gap-2">
                <button
                  @click="showCustomAccountForm = false"
                  type="button"
                  class="px-3 py-1.5 rounded-xl bg-[#0f1019] text-[#9e9cae] text-xs font-bold hover:text-[#f1f0f5]"
                >
                  Cancel
                </button>
                <button
                  @click="addCustomAccount"
                  type="button"
                  class="px-4 py-1.5 rounded-xl bg-[#D4BFFF] text-[#0f0f15] text-xs font-bold hover:bg-[#c099fb]"
                >
                  Add Account
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 3: SAVINGS BUCKETS SETUP -->
          <div v-else-if="setupStep === 3" class="space-y-4">
            <div class="space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#D4BFFF]">Envelope Budgeting</span>
              <h3 class="text-base font-bold text-[#f1f0f5]">Configure Savings Buckets</h3>
              <p class="text-xs text-[#9e9cae]">Set up virtual savings envelopes to subdivide and protect goal funds.</p>
            </div>

            <!-- Default Buckets Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="(bucket, idx) in bucketOptions"
                :key="bucket.name"
                @click="toggleBucketOption(idx)"
                class="p-3 bg-[#141520] border rounded-2xl flex items-center justify-between transition cursor-pointer active:scale-95"
                :class="bucket.selected ? 'border-[#D4BFFF]/40 bg-[#D4BFFF]/5' : 'border-[#1f202e] opacity-60'"
              >
                <div class="flex items-center gap-2.5">
                  <div 
                    class="w-8 h-8 rounded-xl bg-[#0f1019] border border-[#1f202e] flex items-center justify-center shrink-0"
                    :style="{ color: bucket.color || '#D4BFFF' }"
                  >
                    <span class="material-symbols-outlined text-base">{{ bucket.icon }}</span>
                  </div>
                  <span class="text-xs font-bold text-[#f1f0f5]">{{ bucket.name }}</span>
                </div>
                <span 
                  class="w-6 h-6 rounded-lg border flex items-center justify-center text-xs"
                  :class="bucket.selected ? 'bg-[#D4BFFF] text-[#0f0f15] border-[#D4BFFF]' : 'bg-[#0f1019] border-[#1f202e] text-[#9e9cae]'"
                >
                  <span class="material-symbols-outlined text-xs">{{ bucket.selected ? 'check' : 'add' }}</span>
                </span>
              </div>
            </div>

            <!-- Custom Bucket Trigger -->
            <div v-if="!showCustomBucketForm">
              <button
                @click="showCustomBucketForm = true"
                type="button"
                class="w-full py-2.5 border border-dashed border-[#1f202e] hover:border-[#D4BFFF]/50 rounded-2xl text-xs font-bold text-[#D4BFFF] hover:bg-[#141520] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span class="material-symbols-outlined text-base">add_circle</span>
                <span>Add Custom Goal Bucket</span>
              </button>
            </div>

            <!-- Custom Bucket Form Card -->
            <div v-else class="p-4 bg-[#141520] border border-[#D4BFFF]/40 rounded-2xl space-y-3">
              <h4 class="text-xs font-bold text-[#f1f0f5]">Add Custom Goal Bucket</h4>
              <input
                v-model="customBucket.name"
                type="text"
                placeholder="Bucket Name (e.g. New Laptop Fund)"
                class="w-full bg-[#0f1019] border border-[#1f202e] rounded-xl px-3 py-2 text-xs text-[#f1f0f5] focus:outline-none focus:border-[#D4BFFF]"
              />
              <div class="flex justify-end gap-2">
                <button
                  @click="showCustomBucketForm = false"
                  type="button"
                  class="px-3 py-1.5 rounded-xl bg-[#0f1019] text-[#9e9cae] text-xs font-bold hover:text-[#f1f0f5]"
                >
                  Cancel
                </button>
                <button
                  @click="addCustomBucket"
                  type="button"
                  class="px-4 py-1.5 rounded-xl bg-[#D4BFFF] text-[#0f0f15] text-xs font-bold hover:bg-[#c099fb]"
                >
                  Add Bucket
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 4: CATEGORIES SETUP -->
          <div v-else-if="setupStep === 4" class="space-y-4">
            <div class="space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#D4BFFF]">Transaction Tagging</span>
              <h3 class="text-base font-bold text-[#f1f0f5]">Income & Expense Categories</h3>
              <p class="text-xs text-[#9e9cae]">Choose starting categories for tracking cash flows and generating donut charts.</p>
            </div>

            <!-- Expense Categories Section -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <h4 class="text-xs font-bold text-[#FFD1B3] uppercase tracking-wider">Expense Categories</h4>
                <span class="text-[10px] text-[#9e9cae]">{{ selectedCategoryCount('expense') }} selected</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div
                  v-for="(cat, idx) in expenseCategoryOptions"
                  :key="cat.name"
                  @click="toggleCategoryOption('expense', idx)"
                  class="p-2.5 bg-[#141520] border rounded-2xl flex items-center justify-between transition cursor-pointer active:scale-95"
                  :class="cat.selected ? 'border-[#FFD1B3]/40 bg-[#FFD1B3]/5' : 'border-[#1f202e] opacity-60'"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="material-symbols-outlined text-base shrink-0" :style="{ color: cat.color }">{{ cat.icon }}</span>
                    <span class="text-xs font-bold text-[#f1f0f5] truncate">{{ cat.name }}</span>
                  </div>
                  <span class="material-symbols-outlined text-xs text-[#FFD1B3]" v-if="cat.selected">check</span>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 5: APP FEATURES RUNDOWN -->
          <div v-else-if="setupStep === 5" class="space-y-4">
            <div class="space-y-1 text-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#D4BFFF]">Architecture Overview</span>
              <h3 class="text-base font-bold text-[#f1f0f5]">Cash Buddy Core Capabilities</h3>
              <p class="text-xs text-[#9e9cae]">Key architectural concepts designed for private, offline-first finance tracking.</p>
            </div>

            <!-- Feature Cards Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Feature 1 -->
              <div class="p-3.5 bg-[#141520] border border-[#1f202e] rounded-2xl space-y-1.5">
                <div class="flex items-center gap-2 text-[#D4BFFF]">
                  <span class="material-symbols-outlined text-base">savings</span>
                  <h4 class="text-xs font-bold text-[#f1f0f5]">Envelope Budgeting</h4>
                </div>
                <p class="text-[11px] text-[#9e9cae] leading-relaxed">
                  Subdivide real bank funds into goal buckets without opening separate bank accounts.
                </p>
              </div>

              <!-- Feature 2 -->
              <div class="p-3.5 bg-[#141520] border border-[#1f202e] rounded-2xl space-y-1.5">
                <div class="flex items-center gap-2 text-[#B3F5E1]">
                  <span class="material-symbols-outlined text-base">folder_zip</span>
                  <h4 class="text-xs font-bold text-[#f1f0f5]">Multi-Vault Isolation</h4>
                </div>
                <p class="text-[11px] text-[#9e9cae] leading-relaxed">
                  Create isolated vaults for Personal, Business, or Travel with separate SQLite databases.
                </p>
              </div>

              <!-- Feature 3 -->
              <div class="p-3.5 bg-[#141520] border border-[#1f202e] rounded-2xl space-y-1.5">
                <div class="flex items-center gap-2 text-[#FFD1B3]">
                  <span class="material-symbols-outlined text-base">payments</span>
                  <h4 class="text-xs font-bold text-[#f1f0f5]">Salary Allocation Engine</h4>
                </div>
                <p class="text-[11px] text-[#9e9cae] leading-relaxed">
                  Automatically split incoming monthly salary across your active savings buckets in one tap.
                </p>
              </div>

              <!-- Feature 4 -->
              <div class="p-3.5 bg-[#141520] border border-[#1f202e] rounded-2xl space-y-1.5">
                <div class="flex items-center gap-2 text-[#D4BFFF]">
                  <span class="material-symbols-outlined text-base">database</span>
                  <h4 class="text-xs font-bold text-[#f1f0f5]">Offline & Encrypted Backups</h4>
                </div>
                <p class="text-[11px] text-[#9e9cae] leading-relaxed">
                  All data stays 100% on your device with local WebAssembly SQLite and export capabilities.
                </p>
              </div>
            </div>
          </div>

        </div>

        <!-- WIZARD FOOTER NAVIGATION -->
        <div class="px-5 py-4 border-t border-[#1f202e] bg-[#141520]/80 flex items-center justify-between shrink-0">
          <button
            v-if="setupStep > 1"
            @click="setupStep--"
            type="button"
            class="px-4 py-2 rounded-xl bg-[#0f1019] hover:bg-[#1f202e] text-xs font-bold text-[#9e9cae] hover:text-[#f1f0f5] transition cursor-pointer active:scale-95"
          >
            Back
          </button>
          <div v-else></div>

          <button
            @click="goNextSetup"
            type="button"
            class="px-5 py-2.5 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl shadow-lg transition cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <span>{{ setupStep === 5 ? 'Start Spotlight Tour' : 'Next Step' }}</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODE 2: INTERACTIVE SPOTLIGHT CUTOUT OVERLAY TOUR              -->
    <!-- ============================================================== -->
    <div 
      v-if="isOpen && isSpotlightTour" 
      class="fixed inset-0 z-[120] pointer-events-auto overflow-hidden touch-none"
      @touchmove.prevent
    >
      <!-- Crystal-Clear Highlight Spotlight Cutout Box -->
      <div
        v-if="spotlightRect"
        class="fixed rounded-2xl border-2 border-[#D4BFFF] shadow-[0_0_0_9999px_rgba(12,13,20,0.85),0_0_30px_rgba(212,191,255,0.6)] pointer-events-none transition-all duration-300 ease-out z-[125]"
        :style="{
          top: spotlightRect.top + 'px',
          left: spotlightRect.left + 'px',
          width: spotlightRect.width + 'px',
          height: spotlightRect.height + 'px'
        }"
      ></div>

      <!-- Floating Tooltip Card -->
      <div
        class="fixed z-[130] w-full max-w-sm px-4 transition-all duration-300"
        :style="tooltipStyle"
      >
        <div class="bg-[#0f1019] border border-[#D4BFFF]/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 relative overflow-hidden backdrop-blur-xl">
          <!-- Header Tag & Step Progress Indicator -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-[#D4BFFF]/15 border border-[#D4BFFF]/30 text-[#D4BFFF] flex items-center justify-center font-bold text-xs">
                <span class="material-symbols-outlined text-base">{{ currentSpotlightStep.icon }}</span>
              </span>
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#D4BFFF]">
                Step {{ spotlightIndex + 1 }} of {{ SPOTLIGHT_STEPS.length }}
              </span>
            </div>

            <!-- Skip Tour Button -->
            <button
              @click="finishTour"
              type="button"
              class="text-[10px] font-bold text-[#9e9cae] hover:text-[#f1f0f5] bg-[#141520] hover:bg-[#1f202e] border border-[#1f202e] px-2.5 py-1 rounded-lg transition cursor-pointer active:scale-95"
            >
              Skip Tour
            </button>
          </div>

          <!-- Content Title & Description -->
          <div>
            <h3 class="text-sm font-bold text-[#f1f0f5] leading-tight">{{ currentSpotlightStep.title }}</h3>
            <p class="text-xs text-[#9e9cae] mt-1.5 leading-relaxed">{{ currentSpotlightStep.description }}</p>
          </div>

          <!-- Progress Dots & Next / Finish Action Footer -->
          <div class="pt-2 border-t border-[#1f202e] flex items-center justify-between">
            <!-- Progress Dots -->
            <div class="flex items-center gap-1 max-w-[150px] overflow-hidden">
              <span
                v-for="(_, idx) in SPOTLIGHT_STEPS"
                :key="idx"
                class="h-1.5 rounded-full transition-all duration-300"
                :class="idx === spotlightIndex ? 'w-4 bg-[#D4BFFF]' : 'w-1.5 bg-[#1f202e]'"
              ></span>
            </div>

            <!-- Action Button -->
            <button
              @click="nextSpotlightStep"
              type="button"
              class="px-4 py-2 bg-[#D4BFFF] hover:bg-[#c099fb] text-[#0f0f15] font-bold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <span>{{ spotlightIndex === SPOTLIGHT_STEPS.length - 1 ? 'Finish Tour' : 'Next' }}</span>
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue';
import { api } from '../services/api.js';
import { CURRENCIES, currentCurrency, currencySymbol, setCurrency } from '../utils/currency.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  initialStage: {
    type: String,
    default: 'setup' // 'setup' or 'tutorial'
  },
  activeVault: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'completed', 'switch-tab', 'open-form-step-1', 'open-form-step-2', 'close-form']);

// Setup vs Spotlight Tour State
const isSpotlightTour = ref(props.initialStage === 'tutorial');
const setupStep = ref(1);

// Currency Step State
const currencySearchQuery = ref('');

const filteredCurrencies = computed(() => {
  if (!currencySearchQuery.value.trim()) return CURRENCIES;
  const q = currencySearchQuery.value.toLowerCase().trim();
  return CURRENCIES.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
});

function selectCurrencyCode(code) {
  setCurrency(code, props.activeVault);
}

// Storage Accounts Setup State
const accountOptions = ref([
  { name: 'Cash', type: 'Cash', icon: 'payments', selected: true, seedBalance: '0' },
  { name: 'Bank Account', type: 'Checking', icon: 'account_balance', selected: true, seedBalance: '0' },
  { name: 'Savings Account', type: 'Savings', icon: 'savings', selected: true, seedBalance: '0' },
  { name: 'Credit Card', type: 'Credit Card', icon: 'credit_card', selected: false, seedBalance: '0' }
]);

const showCustomAccountForm = ref(false);
const customAccount = ref({ name: '', type: 'Checking' });

function toggleAccountOption(idx) {
  accountOptions.value[idx].selected = !accountOptions.value[idx].selected;
}

function addCustomAccount() {
  if (!customAccount.value.name.trim()) return;
  accountOptions.value.push({
    name: customAccount.value.name.trim(),
    type: customAccount.value.type,
    icon: 'account_balance',
    selected: true,
    seedBalance: '0'
  });
  customAccount.value.name = '';
  showCustomAccountForm.value = false;
}

// Savings Buckets Setup State
const bucketOptions = ref([
  { name: 'Emergency Fund', icon: 'shield', color: '#3b82f6', selected: true },
  { name: 'Travel Goal', icon: 'flight', color: '#06b6d4', selected: false },
  { name: 'Monthly Bills', icon: 'receipt_long', color: '#f59e0b', selected: true },
  { name: 'General Savings', icon: 'savings', color: '#10b981', selected: true }
]);

const showCustomBucketForm = ref(false);
const customBucket = ref({ name: '', icon: 'savings', color: '#D4BFFF' });

function toggleBucketOption(idx) {
  bucketOptions.value[idx].selected = !bucketOptions.value[idx].selected;
}

function addCustomBucket() {
  if (!customBucket.value.name.trim()) return;
  bucketOptions.value.push({
    name: customBucket.value.name.trim(),
    icon: customBucket.value.icon || 'savings',
    color: customBucket.value.color || '#D4BFFF',
    selected: true
  });
  customBucket.value = { name: '', icon: 'savings', color: '#D4BFFF' };
  showCustomBucketForm.value = false;
}

// Category Options Setup State
const expenseCategoryOptions = ref([
  { name: 'Food & Dining', icon: 'restaurant', color: '#ef4444', selected: true },
  { name: 'Groceries', icon: 'shopping_cart', color: '#10b981', selected: true },
  { name: 'Transport', icon: 'directions_car', color: '#06b6d4', selected: true },
  { name: 'Shopping', icon: 'shopping_bag', color: '#8b5cf6', selected: true },
  { name: 'Bills & Utilities', icon: 'bolt', color: '#f59e0b', selected: true },
  { name: 'Entertainment', icon: 'movie', color: '#ec4899', selected: true }
]);

function toggleCategoryOption(type, idx) {
  expenseCategoryOptions.value[idx].selected = !expenseCategoryOptions.value[idx].selected;
}

function selectedCategoryCount(type) {
  return expenseCategoryOptions.value.filter(c => c.selected).length;
}

async function applyQuickSetup() {
  try {
    const existingAccounts = (await api.getAccounts()).map(a => a.name.toLowerCase());
    const existingCategories = (await api.getCategories()).map(c => c.name.toLowerCase());
    const existingBuckets = (await api.getBuckets()).map(b => b.name.toLowerCase());

    // 1. Accounts
    for (const acc of accountOptions.value.filter(a => a.selected)) {
      if (!existingAccounts.includes(acc.name.toLowerCase())) {
        const seed = parseFloat(String(acc.seedBalance || '0').replace(',', '.')) || 0.0;
        await api.createAccount({ name: acc.name, type: acc.type, balance: seed });
      }
    }
    // 2. Expense Categories
    for (const cat of expenseCategoryOptions.value.filter(c => c.selected)) {
      if (!existingCategories.includes(cat.name.toLowerCase())) {
        await api.createCategory({ name: cat.name, color: cat.color, icon: cat.icon });
      }
    }
    // 3. Buckets
    for (const b of bucketOptions.value.filter(b => b.selected)) {
      if (!existingBuckets.includes(b.name.toLowerCase())) {
        await api.createBucket({ name: b.name, icon: b.icon, color: b.color });
      }
    }
    await api.setOnboardingState({ setupComplete: true });
  } catch (err) {
    console.error('Error saving onboarding quick setup:', err);
  }
}

async function goNextSetup() {
  if (setupStep.value < 5) {
    setupStep.value++;
  } else if (setupStep.value === 5) {
    await applyQuickSetup();
    startSpotlightTour();
  }
}

async function skipSetup() {
  await applyQuickSetup();
  await api.setOnboardingState({ setupComplete: true, tutorialComplete: true });
  emit('completed');
  emit('close');
}

// Stage Synchronization
const syncModalStageState = () => {
  console.log('[ONBOARDING DEBUG] OnboardingModal syncModalStageState: isOpen =', props.isOpen, 'initialStage =', props.initialStage);
  if (props.isOpen) {
    isSpotlightTour.value = props.initialStage === 'tutorial';
    if (props.initialStage === 'setup') {
      setupStep.value = 1;
    } else if (props.initialStage === 'tutorial') {
      startSpotlightTour();
    }
  } else {
    isSpotlightTour.value = false;
  }
};

watch([() => props.isOpen, () => props.initialStage], () => {
  syncModalStageState();
}, { immediate: true });

// Lock / Unlock Screen Scroll During Interactive Tour
watch(isSpotlightTour, (val) => {
  if (val) {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  } else {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
}, { immediate: true });

// =====================================================================
// INTERACTIVE SPOTLIGHT TOUR LOGIC
// =====================================================================

const SPOTLIGHT_STEPS = [
  {
    target: 'vault-switcher',
    tab: 'dashboard',
    title: 'Vault Switcher',
    icon: 'folder_zip',
    description: 'Switch between isolated financial workspaces (e.g. Personal vs Business) anytime from here. Each vault maintains its own private database.'
  },
  {
    target: 'dashboard-summary',
    tab: 'dashboard',
    title: 'Financial Overview',
    icon: 'dashboard',
    description: 'Track Net Worth, Income, and Expenses in real-time with smooth animated tickers and fast monthly filters.'
  },
  {
    target: 'buckets-grid',
    tab: 'dashboard',
    title: 'Savings Buckets',
    icon: 'savings',
    description: 'Enforce virtual envelope budgeting using savings buckets to keep your money organized (e.g. Emergency Fund, Travel, Bills).'
  },
  {
    target: 'accounts-grid',
    tab: 'dashboard',
    title: 'Storage Accounts',
    icon: 'account_balance',
    description: 'Monitor real bank accounts, cash reserves, and digital wallets. Click any account tile to record quick balance adjustments.'
  },
  {
    target: 'salary-allocation-btn',
    tab: 'dashboard',
    title: 'Salary Allocation Engine',
    icon: 'payments',
    description: 'Automate salary distribution across your savings buckets in one tap when monthly income arrives.'
  },
  {
    target: 'add-tx-btn',
    altTarget: 'add-tx-btn-mobile',
    tab: 'dashboard',
    title: 'Instant Transaction Entry',
    icon: 'add_circle',
    description: 'Tap + anywhere to quickly log Income, Expense, Transfers, or Balance Adjustments.'
  },
  {
    target: 'step-1-form',
    openFormStep: 1,
    tab: 'dashboard',
    title: 'Transaction Form: Select Bucket & Account',
    icon: 'tune',
    description: 'Select which Savings Bucket and Storage Account to allocate transactions toward.'
  },
  {
    target: 'step-2-form',
    openFormStep: 2,
    tab: 'dashboard',
    title: 'Transaction Form: Amount & Details',
    icon: 'account_tree',
    description: 'Select Income, Expense, Transfer, or Adjustment. Enter amounts in your active vault currency.'
  },
  {
    target: 'history-tab',
    altTarget: 'history-filters',
    closeForm: true,
    tab: 'transactions',
    title: 'Transactions History & Breakdown',
    icon: 'receipt_long',
    description: 'This is where your full transaction history and category breakdown donut charts will come. Filter by month, search records, or inspect category totals.'
  },
  {
    target: 'categories-tile',
    altTarget: 'settings-tab',
    tab: 'settings',
    title: 'Categories & Directory Grid',
    icon: 'category',
    description: 'This highlights all your categories! Manage storage accounts, savings buckets to keep your money organized, categories, icons, and colors anytime under More.'
  },
  {
    target: 'backup-tile',
    tab: 'settings',
    title: 'Local Encrypted Backups',
    icon: 'database',
    description: 'Create encrypted local database backups, export snapshots, and manage app preferences securely.'
  },
  {
    target: null,
    tab: 'settings',
    title: 'Thank You from Cash Buddy! ❤️',
    icon: 'favorite',
    description: 'Thank you for using Cash Buddy! We love having you with us. Remember, if you ever have any questions or doubts, you can tap Settings → FAQ & Guides anytime to re-run this tour or read detailed guides!'
  }
];

const spotlightIndex = ref(0);
const spotlightRect = ref(null);
const tooltipStyle = ref({});

const currentSpotlightStep = computed(() => SPOTLIGHT_STEPS[spotlightIndex.value] || SPOTLIGHT_STEPS[0]);

function startSpotlightTour() {
  console.log('[ONBOARDING DEBUG] startSpotlightTour() called in OnboardingModal.vue!');
  isSpotlightTour.value = true;
  spotlightIndex.value = 0;
  updateSpotlightStep();
}

function updateSpotlightStep() {
  const step = currentSpotlightStep.value;

  if (step.openFormStep === 1) {
    emit('open-form-step-1');
  } else if (step.openFormStep === 2) {
    emit('open-form-step-2');
  } else if (step.closeForm) {
    emit('close-form');
  }

  if (step.tab) emit('switch-tab', step.tab);

  nextTick(() => {
    setTimeout(() => {
      let el = null;
      if (step.target) {
        el = document.querySelector(`[data-tour="${step.target}"]`) || document.querySelector(`[data-tour-target="${step.target}"]`);
      }
      if (!el && step.altTarget) {
        el = document.querySelector(`[data-tour="${step.altTarget}"]`) || document.querySelector(`[data-tour-target="${step.altTarget}"]`);
      }

      if (el) {
        // Instant scroll target element into view center
        try {
          el.scrollIntoView({ behavior: 'auto', block: 'center' });
        } catch (e) {}

        // Immediate calculation + multi-frame recalculation for 100% position accuracy
        positionSpotlightForElement(el, step);
        setTimeout(() => positionSpotlightForElement(el, step), 80);
        setTimeout(() => positionSpotlightForElement(el, step), 250);
      } else {
        spotlightRect.value = null;
        tooltipStyle.value = { 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)' 
        };
      }
    }, 120);
  });
}

function positionSpotlightForElement(el, step) {
  if (!el) {
    spotlightRect.value = null;
    tooltipStyle.value = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    return;
  }

  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  if (rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < vh) {
    // Clamp spotlight rectangle bounds to safe screen area
    const top = Math.max(12, Math.min(rect.top - 6, vh - 60));
    const left = Math.max(8, Math.min(rect.left - 6, vw - 40));
    const width = Math.min(rect.width + 12, vw - left - 8);
    const height = Math.min(rect.height + 12, vh - top - 80);

    spotlightRect.value = { top, left, width, height };

    if (step && step.openFormStep) {
      // For modal form steps, place tooltip floating neatly at bottom
      tooltipStyle.value = { 
        bottom: 'max(16px, env(safe-area-inset-bottom))', 
        left: '50%', 
        transform: 'translateX(-50%)' 
      };
    } else {
      const targetBottom = top + height;
      const spaceBelow = vh - targetBottom;
      const spaceAbove = top;

      if (spaceBelow >= 220 && targetBottom + 210 <= vh) {
        // Place neatly below the target
        tooltipStyle.value = { 
          top: (targetBottom + 12) + 'px', 
          left: '50%', 
          transform: 'translateX(-50%)' 
        };
      } else if (spaceAbove >= 220) {
        // Place neatly above the target
        tooltipStyle.value = { 
          top: Math.max(16, top - 210) + 'px', 
          left: '50%', 
          transform: 'translateX(-50%)' 
        };
      } else {
        // Fallback: floating anchored at safe bottom viewport
        tooltipStyle.value = { 
          bottom: 'max(24px, env(safe-area-inset-bottom))', 
          left: '50%', 
          transform: 'translateX(-50%)' 
        };
      }
    }
  } else {
    spotlightRect.value = null;
    tooltipStyle.value = { 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)' 
    };
  }
}

function nextSpotlightStep() {
  if (spotlightIndex.value < SPOTLIGHT_STEPS.length - 1) {
    spotlightIndex.value++;
    updateSpotlightStep();
  } else {
    finishTour();
  }
}

async function finishTour() {
  await api.setOnboardingState({ setupComplete: true, tutorialComplete: true });
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  isSpotlightTour.value = false;
  emit('close-form');
  emit('switch-tab', 'dashboard');
  emit('completed');
  emit('close');
}

onUnmounted(() => {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  spotlightRect.value = null;
});
</script>
