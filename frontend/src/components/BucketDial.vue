<template>
  <div>
    <button type="button" class="inline-flex size-11 items-center justify-center rounded-lg border border-[#29293a] bg-[#141520] text-[#B3F5E1] transition hover:border-[#B3F5E1]/50" aria-label="Choose savings buckets for starting balance" @click="dialogOpen = true">
      <span class="material-symbols-outlined text-lg">savings</span>
    </button>

    <ul v-if="modelValue.length" class="mt-2 flex flex-wrap gap-1.5">
      <li v-for="(bucket, index) in modelValue" :key="bucket.id" class="inline-flex max-w-full items-center gap-1 rounded-full border border-[#1f202e] bg-[#0f1019] py-0.5 pl-2 pr-1">
        <span class="material-symbols-outlined shrink-0 text-sm" :style="{ color: bucket.color || '#B3F5E1' }">{{ resolveIcon(bucket.icon, 'savings') }}</span>
        <span class="max-w-28 truncate text-[10px] text-[#ccc3d8]">{{ bucket.name }}</span>
        <strong class="text-[10px] tabular-nums text-[#f1f0f5]">{{ money(bucket.balance) }}</strong>
        <button type="button" class="grid size-6 shrink-0 place-items-center rounded-full text-[#9e9cae] hover:bg-[#242431] hover:text-white" :aria-label="`Remove ${bucket.name} from starting balance`" @click="removeBucket(index)"><span class="material-symbols-outlined text-sm">close</span></button>
      </li>
    </ul>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="dialogOpen" class="fixed inset-0 z-[120] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4" @click.self="closeDialog">
          <section role="dialog" aria-modal="true" aria-labelledby="bucket-dial-title" class="flex max-h-[min(92dvh,760px)] w-full flex-col overflow-hidden rounded-t-2xl border border-[#29293a] bg-[#14141d] shadow-2xl sm:max-w-xl sm:rounded-2xl">
            <header class="flex shrink-0 items-center justify-between border-b border-[#29293a] px-4 py-3 sm:px-5">
              <div><h2 id="bucket-dial-title" class="text-base font-bold text-[#f1f0f5]">Starting balance buckets</h2><p class="mt-0.5 text-xs text-[#9e9cae]">Add or remove balances for this calculation only.</p></div>
              <button type="button" class="grid size-11 shrink-0 place-items-center rounded-xl text-[#9e9cae] hover:bg-[#232332] hover:text-white" aria-label="Close bucket chooser" @click="closeDialog"><span class="material-symbols-outlined">close</span></button>
            </header>

            <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
              <div v-if="activeBuckets.length" class="flex flex-col items-center">
                <div class="relative grid size-64 shrink-0 touch-pan-y place-items-center select-none sm:size-72" @pointerdown="beginSwipe" @pointerup="endSwipe" @pointercancel="swipeStart = null">
                  <div class="absolute inset-5 rounded-full border border-[#B3F5E1]/20 bg-[radial-gradient(circle,rgba(179,245,225,0.1),rgba(20,21,32,0.1)_70%)] shadow-[0_0_44px_rgba(179,245,225,0.08)] transition-transform duration-500" :style="{ transform: `rotate(${rotation * 360}deg)` }"></div>
                  <div class="relative z-10 text-center">
                    <span class="material-symbols-outlined text-3xl" :style="{ color: focusedBucket?.color || '#B3F5E1' }">{{ resolveIcon(focusedBucket?.icon, 'savings') }}</span>
                    <p class="mt-1 max-w-36 truncate text-sm font-semibold text-[#f1f0f5]">{{ focusedBucket?.name }}</p>
                    <p class="mt-1 text-base font-bold tabular-nums text-[#B3F5E1]">{{ money(focusedBucket?.allocated_balance) }}</p>
                  </div>
                  <button v-for="(bucket, index) in activeBuckets" :key="bucket.id" type="button" class="absolute z-20 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-[#0c0d14] shadow-lg transition-[left,top,scale,opacity] duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4BFFF]" :class="index === currentIndex ? 'scale-110 border-[#D4BFFF] ring-2 ring-[#D4BFFF]/30' : 'border-[#29293a] opacity-80 hover:opacity-100'" :style="bucketPosition(index)" :aria-label="`${bucket.name}, ${money(bucket.allocated_balance)}. Tap to include this balance`" :aria-pressed="isSelected(bucket)" @click="focusBucket(bucket, index)">
                    <span class="material-symbols-outlined" :style="{ color: bucket.color || '#B3F5E1' }">{{ resolveIcon(bucket.icon, 'savings') }}</span>
                  </button>
                </div>
                <div class="mt-1 flex items-center gap-4">
                  <button type="button" class="grid size-11 place-items-center rounded-full border border-[#29293a] text-[#ccc3d8] hover:border-[#B3F5E1]/50" aria-label="Previous bucket" @click="move(-1)"><span class="material-symbols-outlined">chevron_left</span></button>
                  <span class="min-w-16 text-center text-xs tabular-nums text-[#9e9cae]">{{ currentIndex + 1 }} / {{ activeBuckets.length }}</span>
                  <button type="button" class="grid size-11 place-items-center rounded-full border border-[#29293a] text-[#ccc3d8] hover:border-[#B3F5E1]/50" aria-label="Next bucket" @click="move(1)"><span class="material-symbols-outlined">chevron_right</span></button>
                </div>
                <button type="button" class="mt-3 min-h-11 rounded-xl border px-4 text-xs font-bold transition" :class="isSelected(focusedBucket) ? 'border-[#B3F5E1]/40 bg-[#B3F5E1]/10 text-[#B3F5E1]' : 'border-[#D4BFFF]/40 bg-[#D4BFFF]/10 text-[#D4BFFF]'" @click="toggleBucket(focusedBucket)">{{ isSelected(focusedBucket) ? 'Remove from starting balance' : 'Add bucket balance' }}</button>
              </div>
              <div v-else class="rounded-xl border border-[#29293a] p-4 text-center text-sm text-[#9e9cae]">There are no active savings buckets in this vault.</div>

              <div class="mt-5 border-t border-[#29293a] pt-4">
                <div class="mb-2 flex items-center justify-between gap-2"><h3 class="text-sm font-semibold text-[#f1f0f5]">Included balances</h3><span class="text-xs tabular-nums text-[#B3F5E1]">{{ money(selectedTotal) }}</span></div>
                <p v-if="!modelValue.length" class="py-3 text-xs text-[#9e9cae]">No bucket balances included. You can still use a manual starting amount.</p>
                <ul v-else class="flex flex-wrap gap-1.5">
                  <li v-for="(bucket, index) in modelValue" :key="bucket.id" class="inline-flex max-w-full items-center gap-1 rounded-full border border-[#1f202e] bg-[#0f1019] py-0.5 pl-2 pr-1">
                    <span class="material-symbols-outlined shrink-0 text-sm" :style="{ color: bucket.color || '#B3F5E1' }">{{ resolveIcon(bucket.icon, 'savings') }}</span><span class="max-w-28 truncate text-[10px] text-[#ccc3d8]">{{ bucket.name }}</span><strong class="text-[10px] tabular-nums text-[#f1f0f5]">{{ money(bucket.balance) }}</strong><button type="button" class="grid size-6 shrink-0 place-items-center rounded-full text-[#9e9cae] hover:bg-[#232332] hover:text-white" :aria-label="`Remove ${bucket.name}`" @click="removeBucket(index)"><span class="material-symbols-outlined text-sm">close</span></button>
                  </li>
                </ul>
                <div class="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#B3F5E1]/25 bg-[#B3F5E1]/5 px-3 py-2.5"><span class="text-xs text-[#ccc3d8]">Available after plan</span><strong class="text-sm tabular-nums" :class="availableAfterPlan < 0 ? 'text-[#ffb4ab]' : 'text-[#B3F5E1]'">{{ money(availableAfterPlan) }}</strong></div>
              </div>
            </div>

            <footer class="shrink-0 border-t border-[#29293a] bg-[#14141d] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
              <button type="button" class="min-h-11 w-full rounded-xl bg-[#D4BFFF] px-4 text-sm font-bold text-[#0f0f15] hover:bg-[#e2d3ff]" @click="closeDialog">Done</button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { resolveIcon } from '../utils/iconResolver.js'

const props = defineProps({ buckets: { type: Array, default: () => [] }, modelValue: { type: Array, default: () => [] }, manualAmount: { type: Number, default: 0 }, calculatorResult: { type: Number, default: 0 } })
const emit = defineEmits(['update:modelValue'])
const dialogOpen = ref(false)
const currentIndex = ref(0)
const swipeStart = ref(null)
const activeBuckets = computed(() => props.buckets.filter((bucket) => !bucket.is_archived))
const focusedBucket = computed(() => activeBuckets.value[currentIndex.value] || null)
const rotation = computed(() => activeBuckets.value.length ? -currentIndex.value / activeBuckets.value.length : 0)
const selectedTotal = computed(() => props.modelValue.reduce((total, bucket) => total + (Number(bucket.balance) || 0), 0))
const availableAfterPlan = computed(() => Math.round((selectedTotal.value + props.manualAmount + props.calculatorResult + Number.EPSILON) * 100) / 100)
const isSelected = (bucket) => props.modelValue.some((item) => String(item.id) === String(bucket?.id))
const money = (amount) => `${currencySymbol.value}${(Number(amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
import { currencySymbol } from '../utils/currency.js'

function move(amount) {
  const length = activeBuckets.value.length
  if (length) currentIndex.value = (currentIndex.value + amount + length) % length
}
function bucketPosition(index) {
  const length = activeBuckets.value.length
  const angle = ((index - currentIndex.value) * 2 * Math.PI) / length
  const radius = 35
  return {
    left: `${50 + Math.sin(angle) * radius}%`,
    top: `${50 - Math.cos(angle) * radius}%`
  }
}
function toggleBucket(bucket) {
  if (!bucket) return
  if (isSelected(bucket)) return removeBucket(props.modelValue.findIndex((item) => String(item.id) === String(bucket.id)))
  emit('update:modelValue', [...props.modelValue, { id: String(bucket.id), name: bucket.name, balance: Number(bucket.allocated_balance) || 0, icon: bucket.icon, color: bucket.color }])
}
function focusBucket(bucket, index) {
  currentIndex.value = index
  if (!isSelected(bucket)) toggleBucket(bucket)
}
function removeBucket(index) {
  if (index < 0) return
  emit('update:modelValue', props.modelValue.filter((_, itemIndex) => itemIndex !== index))
}
function beginSwipe(event) { swipeStart.value = event.clientX; event.currentTarget.setPointerCapture?.(event.pointerId) }
function endSwipe(event) {
  if (swipeStart.value === null) return
  const delta = event.clientX - swipeStart.value
  if (Math.abs(delta) > 32) move(delta < 0 ? 1 : -1)
  swipeStart.value = null
}
function closeDialog() { dialogOpen.value = false }
function handleArrow(event) {
  if (!dialogOpen.value) return
  if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
  if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
}
watch(activeBuckets, (buckets) => { if (currentIndex.value >= buckets.length) currentIndex.value = Math.max(0, buckets.length - 1) })
onMounted(() => {
  window.addEventListener('keydown', handleArrow)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleArrow)
})
defineExpose({ closeDialog: () => { if (!dialogOpen.value) return false; closeDialog(); return true } })
</script>
