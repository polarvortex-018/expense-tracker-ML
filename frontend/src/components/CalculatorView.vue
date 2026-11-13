<template>
  <section class="space-y-4" @keydown="handleKeydown" tabindex="0" aria-label="Cash Buddy calculator">
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)]">
      <div class="min-w-0 space-y-4">
        <section class="rounded-2xl border border-[#29293a] bg-[#0f1019] p-4 sm:p-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-[#9e9cae]">Current calculation</p>
          <p class="mt-2 min-h-6 break-all text-right text-sm text-[#9e9cae]" aria-live="polite">{{ formatTerms(terms) || 'Enter an amount' }}</p>
          <p class="mt-1 min-h-11 break-all text-right text-3xl font-bold tabular-nums text-[#f1f0f5] sm:text-4xl">{{ currentAmount }}</p>
          <p class="mt-2 min-h-5 text-right text-sm tabular-nums text-[#B3F5E1]">{{ resultPreview !== null ? `= ${money(resultPreview)}` : '\u00a0' }}</p>
          <p v-if="error" class="mt-3 rounded-lg border border-rose-400/20 bg-rose-950/20 px-3 py-2 text-xs text-rose-200" role="alert">{{ error }}</p>
        </section>

        <div class="grid grid-cols-4 gap-2" role="group" aria-label="Calculator keypad">
          <button v-for="key in keypadRows.flat()" :key="key.value" type="button" class="min-h-14 rounded-xl border text-base font-semibold transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4BFFF]" :class="key.kind === 'operator' || key.kind === 'equals' ? 'border-[#D4BFFF]/25 bg-[#D4BFFF]/10 text-[#D4BFFF] hover:bg-[#D4BFFF]/20' : key.kind === 'utility' ? 'border-[#29293a] bg-[#191924] text-[#ccc3d8] hover:bg-[#242431]' : 'border-[#29293a] bg-[#141520] text-[#f1f0f5] hover:bg-[#20212d]'" :aria-label="key.label" @click="pressKey(key.value)">{{ key.label }}</button>
          <button type="button" class="col-span-4 min-h-14 rounded-xl bg-[#D4BFFF] text-base font-bold text-[#0f0f15] transition hover:bg-[#e2d3ff] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" @click="equals">=</button>
        </div>

        <section class="rounded-2xl border border-[#29293a] bg-[#0f1019] p-4 sm:p-5">
          <div class="flex items-center justify-between gap-2">
            <div><h3 class="text-sm font-bold text-[#f1f0f5]">Starting balance</h3><p class="mt-1 text-xs text-[#9e9cae]">Scratchpad only. This won’t change your accounts or buckets.</p></div>
            <BucketDial ref="bucketDialRef" :buckets="buckets" :manual-amount="Number(manualStartingAmount) || 0" :calculator-result="resultPreview ?? 0" v-model="includedBuckets" />
          </div>
          <label class="mt-4 block text-xs font-semibold text-[#ccc3d8]">Manual amount</label>
          <div class="mt-1 flex items-center gap-2 rounded-xl border border-[#29293a] bg-[#141520] px-3 focus-within:border-[#D4BFFF]/60">
            <span class="text-sm text-[#9e9cae]">{{ currencySymbol }}</span>
            <input :value="manualStartingAmount" type="number" inputmode="decimal" step="0.01" placeholder="0.00" class="min-h-11 min-w-0 flex-1 bg-transparent text-sm tabular-nums text-[#f1f0f5] outline-none placeholder:text-[#777487]" aria-label="Manual starting amount" @input="updateManualAmount($event.target.value)">
            <button v-if="manualStartingAmount" type="button" class="grid size-9 place-items-center rounded-lg text-[#9e9cae] hover:bg-[#242431] hover:text-white" aria-label="Clear manual starting amount" @click="updateManualAmount('')"><span class="material-symbols-outlined text-base">close</span></button>
          </div>
          <div class="mt-4 rounded-xl border border-[#B3F5E1]/20 bg-[#B3F5E1]/5 p-3.5">
            <div class="flex items-center justify-between gap-3"><span class="text-xs font-semibold text-[#ccc3d8]">Available after plan</span><strong class="text-lg tabular-nums" :class="availableAfterPlan < 0 ? 'text-[#ffb4ab]' : 'text-[#B3F5E1]'">{{ money(availableAfterPlan) }}</strong></div>
            <p class="mt-1 text-[11px] text-[#9e9cae]">Starting balance + signed calculator result</p>
          </div>
        </section>

      </div>

      <aside class="min-w-0 space-y-4">
        <section class="rounded-2xl border border-[#29293a] bg-[#0f1019] p-4 sm:p-5">
          <div class="flex items-center justify-between gap-2"><h3 class="text-sm font-bold text-[#f1f0f5]">Calculation history</h3><button type="button" class="min-h-10 rounded-lg px-3 text-xs text-[#9e9cae] hover:bg-[#191924] disabled:opacity-40" :disabled="!undoAvailable" @click="undo">Undo</button></div>
          <p class="mt-1 text-xs text-[#9e9cae]">Current calculation and completed results stay in this vault session.</p>

          <div class="mt-3 rounded-xl border border-[#B3F5E1]/25 bg-[#B3F5E1]/[0.035] p-3">
            <p class="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#B3F5E1]">Active · {{ formatTerms(terms) || 'New amount' }}</p>
            <div v-for="(term, index) in terms" :key="term.id" class="flex items-start gap-2 border-t border-[#1f202e] py-2 first:border-0 first:pt-0">
              <button type="button" class="grid size-10 shrink-0 place-items-center rounded-lg border border-[#29293a] bg-[#141520] text-[#D4BFFF]" :aria-label="`Choose icon for ${term.label || 'amount'}`" @click="toggleIconEditor(`active:${term.id}`)"><span class="material-symbols-outlined text-lg">{{ resolveIcon(term.icon, 'calculate') }}</span></button>
              <div class="min-w-0 flex-1">
                <input :value="term.label" class="min-h-8 w-full bg-transparent text-xs text-[#f1f0f5] outline-none placeholder:text-[#777487]" placeholder="Add a label" :aria-label="`Label for amount ${index + 1}`" @input="updateTermLabel('active', term.id, $event.target.value)">
                <p class="text-sm font-semibold tabular-nums text-[#ccc3d8]">{{ money(Number(term.value) || 0) }}<span v-if="term.operator" class="ml-2 text-[#D4BFFF]">{{ displayOperator(term.operator) }}</span><span v-else-if="index === terms.length - 1" class="ml-2 text-[10px] font-normal text-[#9e9cae]">current</span></p>
              </div>
            </div>
            <p v-if="resultPreview !== null" class="mt-2 border-t border-[#1f202e] pt-2 text-right text-xs font-bold tabular-nums text-[#B3F5E1]">Result · {{ money(resultPreview) }}</p>
          </div>

          <div v-if="completedCalculations.length" class="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            <article v-for="calculation in completedCalculations" :key="calculation.id" class="rounded-xl border border-[#1f202e] bg-[#141520] p-3">
              <div class="flex items-center justify-between gap-2"><p class="min-w-0 truncate text-xs text-[#9e9cae]">{{ calculation.expression }}</p><strong class="shrink-0 text-sm tabular-nums text-[#f1f0f5]">{{ money(calculation.result) }}</strong></div>
              <div v-for="(term, index) in calculation.terms" :key="term.id" class="relative mt-2 flex items-start gap-2 border-t border-[#1f202e] pt-2">
                <button type="button" class="grid size-9 shrink-0 place-items-center rounded-lg border border-[#29293a] bg-[#0f1019] text-[#D4BFFF]" :aria-label="`Choose icon for ${term.label || 'amount'}`" @click="toggleIconEditor(`${calculation.id}:${term.id}`)"><span class="material-symbols-outlined">{{ resolveIcon(term.icon, 'calculate') }}</span></button>
                <div class="min-w-0 flex-1"><input :value="term.label" class="min-h-7 w-full bg-transparent text-xs text-[#f1f0f5] outline-none placeholder:text-[#777487]" placeholder="Add a label" :aria-label="`Label for completed amount ${index + 1}`" @input="updateTermLabel(calculation.id, term.id, $event.target.value)"><p class="text-xs tabular-nums text-[#9e9cae]">{{ money(Number(term.value) || 0) }}<span v-if="term.operator" class="ml-2 text-[#D4BFFF]">{{ displayOperator(term.operator) }}</span></p></div>
              </div>
              <p class="mt-2 text-right text-[10px] text-[#777487]">{{ calculation.time }}</p>
            </article>
          </div>
          <p v-else class="mt-3 rounded-xl border border-dashed border-[#29293a] p-3 text-xs text-[#777487]">Completed calculations will appear here.</p>
        </section>

        <section class="rounded-2xl border border-[#29293a] bg-[#0f1019] p-4 sm:p-5">
          <div class="flex items-center justify-between gap-2"><div><h3 class="text-sm font-bold text-[#f1f0f5]">Saved snapshots</h3><p class="mt-1 text-xs text-[#9e9cae]">Named plans stored in this vault.</p></div><span class="material-symbols-outlined text-lg text-[#D4BFFF]">bookmark</span></div>
          <form class="mt-3 flex gap-2" @submit.prevent="saveSnapshot">
            <input v-model="snapshotName" maxlength="100" class="min-h-11 min-w-0 flex-1 rounded-xl border border-[#29293a] bg-[#141520] px-3 text-xs text-[#f1f0f5] outline-none placeholder:text-[#777487] focus:border-[#D4BFFF]/60" placeholder="Name this plan" aria-label="Snapshot name">
            <button type="submit" class="min-h-11 shrink-0 rounded-xl bg-[#D4BFFF] px-3 text-xs font-bold text-[#0f0f15] disabled:opacity-50" :disabled="savingSnapshot">{{ savingSnapshot ? 'Saving…' : 'Save' }}</button>
          </form>
          <p v-if="snapshotError" class="mt-2 text-xs text-rose-200" role="alert">{{ snapshotError }}</p>
          <div v-if="snapshots.length" class="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
            <article v-for="snapshot in snapshots" :key="snapshot.id" class="flex items-center justify-between gap-3 rounded-xl border border-[#1f202e] bg-[#141520] p-3">
              <button type="button" class="min-w-0 flex-1 text-left" @click="restoreSnapshot(snapshot)"><strong class="block truncate text-xs text-[#f1f0f5]">{{ snapshot.name }}</strong><span class="mt-1 block truncate text-[10px] text-[#9e9cae]">{{ formatTerms(snapshot.payload.terms) }} · {{ money(snapshot.payload.result) }}</span></button>
              <button type="button" class="grid size-10 shrink-0 place-items-center rounded-lg text-[#9e9cae] hover:bg-rose-950/30 hover:text-rose-200" :aria-label="`Delete ${snapshot.name}`" @click="deleteSnapshot(snapshot)"><span class="material-symbols-outlined text-base">delete</span></button>
            </article>
          </div>
          <p v-else class="mt-3 text-xs text-[#777487]">No saved snapshots in this vault yet.</p>
          <p v-if="snapshotLoadError" class="mt-2 text-xs text-rose-200" role="alert">{{ snapshotLoadError }}</p>
        </section>
      </aside>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="iconEditingTarget" class="fixed inset-0 z-[130] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4" @click.self="closeIconPicker" @keydown.esc.stop.prevent="closeIconPicker">
          <section role="dialog" aria-modal="true" aria-labelledby="calculator-icon-title" class="flex max-h-[min(90dvh,680px)] w-full flex-col overflow-hidden rounded-t-2xl border border-[#29293a] bg-[#0f1019] shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <header class="flex shrink-0 items-center justify-between border-b border-[#1f202e] px-4 py-3">
              <div><h2 id="calculator-icon-title" class="text-sm font-bold text-[#f1f0f5]">Choose amount icon</h2><p class="mt-1 text-xs text-[#9e9cae]">{{ iconEditingTarget.term.label || 'Amount' }}</p></div>
              <button type="button" class="grid size-11 place-items-center rounded-lg text-[#9e9cae] hover:bg-[#191924] hover:text-white" aria-label="Close icon picker" @click="closeIconPicker"><span class="material-symbols-outlined">close</span></button>
            </header>
            <div class="min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4">
              <IconPicker class="w-full min-w-0" :model-value="iconEditingTarget.term.icon" @update:model-value="updateTermIcon(iconEditingTarget.collectionId, iconEditingTarget.term.id, $event)" />
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { api } from '../services/api.js'
import { currencySymbol } from '../utils/currency.js'
import { formatCalculatorAmount, formatTerms, evaluateTerms } from '../utils/calculatorMath.js'
import { resolveIcon } from '../utils/iconResolver.js'
import BucketDial from './BucketDial.vue'
import IconPicker from './IconPicker.vue'

const props = defineProps({ buckets: { type: Array, default: () => [] }, activeVault: { type: String, default: '' } })
const freshTerm = (value = '0') => ({ id: crypto.randomUUID(), value, label: '', icon: 'calculate', operator: null })
const terms = ref([freshTerm()])
const completedCalculations = ref([])
const manualStartingAmount = ref('')
const includedBuckets = ref([])
const undoState = ref(null)
const hasUndone = ref(false)
const hasFinalized = ref(false)
const error = ref('')
const bucketDialRef = ref(null)
const iconEditorId = ref(null)
const snapshotName = ref('')
const snapshotError = ref('')
const snapshotLoadError = ref('')
const savingSnapshot = ref(false)
const snapshots = ref([])
const iconEditingTarget = computed(() => {
  if (!iconEditorId.value) return null
  const [collectionId, termId] = iconEditorId.value.split(':')
  if (collectionId === 'active') {
    const term = terms.value.find((item) => item.id === termId)
    return term ? { collectionId, term } : null
  }
  const calculation = completedCalculations.value.find((item) => item.id === collectionId)
  const term = calculation?.terms.find((item) => item.id === termId)
  return term ? { collectionId, term } : null
})
const key = (value, label = value, kind = 'digit') => ({ value, label, kind })
const keypadRows = [
  [key('clear', 'AC', 'utility'), key('undo', '↶', 'utility'), key('backspace', '⌫', 'utility'), key('/', '÷', 'operator')],
  ['7', '8', '9'].map((value) => key(value)).concat(key('*', '×', 'operator')),
  ['4', '5', '6'].map((value) => key(value)).concat(key('-', '−', 'operator')),
  ['1', '2', '3'].map((value) => key(value)).concat(key('+', '+', 'operator')),
  [key('sign', '±', 'utility'), key('0'), key('.'), key('percent', '%', 'utility')]
]
const currentTerm = computed(() => terms.value[terms.value.length - 1] || freshTerm())
const currentAmount = computed(() => currentTerm.value.value || '0')
const resultPreview = computed(() => {
  try { return evaluateTerms(terms.value) } catch { return null }
})
const startingBalance = computed(() => (Number(manualStartingAmount.value) || 0) + includedBuckets.value.reduce((sum, bucket) => sum + (Number(bucket.balance) || 0), 0))
const availableAfterPlan = computed(() => Math.round((startingBalance.value + (resultPreview.value ?? 0) + Number.EPSILON) * 100) / 100)
const undoAvailable = computed(() => Boolean(undoState.value) && !hasUndone.value)
const money = (amount) => `${currencySymbol.value}${formatCalculatorAmount(amount)}`

function clone(value) { return JSON.parse(JSON.stringify(value)) }
function recordUndo() {
  undoState.value = clone({ terms: terms.value, completedCalculations: completedCalculations.value, manualStartingAmount: manualStartingAmount.value, includedBuckets: includedBuckets.value, hasFinalized: hasFinalized.value })
  hasUndone.value = false
}
function undo() {
  if (!undoAvailable.value) return
  const previous = undoState.value
  terms.value = previous.terms
  completedCalculations.value = previous.completedCalculations
  manualStartingAmount.value = previous.manualStartingAmount
  includedBuckets.value = previous.includedBuckets
  hasFinalized.value = previous.hasFinalized
  hasUndone.value = true
  error.value = ''
}
function startNewAfterResult(value) {
  if (!hasFinalized.value) return false
  terms.value = [freshTerm(value)]
  hasFinalized.value = false
  return true
}
function updateCurrent(value) {
  const next = [...terms.value]
  next[next.length - 1] = { ...next[next.length - 1], value }
  terms.value = next
  error.value = ''
}
function appendDigit(value) {
  recordUndo()
  if (startNewAfterResult(value)) { error.value = ''; return }
  const existing = currentTerm.value.value
  updateCurrent(existing === '0' || existing === '' ? value : `${existing}${value}`)
}
function appendDecimal() {
  if (hasFinalized.value) { recordUndo(); startNewAfterResult('0.'); return }
  if (currentTerm.value.value.includes('.')) return
  recordUndo()
  updateCurrent(currentTerm.value.value ? `${currentTerm.value.value}.` : '0.')
}
function selectOperator(operator) {
  recordUndo()
  if (hasFinalized.value) hasFinalized.value = false
  const current = currentTerm.value
  if (!current.value) {
    if (terms.value.length > 1) {
      const next = terms.value.slice(0, -1)
      next[next.length - 1] = { ...next[next.length - 1], operator }
      terms.value = next
    }
    return
  }
  const next = [...terms.value]
  next[next.length - 1] = { ...current, operator }
  next.push(freshTerm(''))
  terms.value = next
  error.value = ''
}
function applyPercent() {
  if (!currentTerm.value.value || !Number.isFinite(Number(currentTerm.value.value))) return
  recordUndo()
  updateCurrent(String(Number(currentTerm.value.value) / 100))
  hasFinalized.value = false
}
function toggleSign() {
  recordUndo()
  const value = Number(currentTerm.value.value || 0)
  updateCurrent(String(value === 0 ? 0 : -value))
  hasFinalized.value = false
}
function backspace() {
  recordUndo()
  if (!currentTerm.value.value && terms.value.length > 1) {
    const next = terms.value.slice(0, -1)
    next[next.length - 1] = { ...next[next.length - 1], operator: null }
    terms.value = next
  } else updateCurrent((currentTerm.value.value || '0').slice(0, -1) || '0')
  hasFinalized.value = false
}
function clear() {
  recordUndo()
  terms.value = [freshTerm()]
  hasFinalized.value = false
  error.value = ''
}
function equals() {
  try {
    const result = evaluateTerms(terms.value)
    recordUndo()
    completedCalculations.value.unshift({ id: crypto.randomUUID(), terms: clone(terms.value), result, expression: formatTerms(terms.value), time: new Date().toLocaleString() })
    completedCalculations.value = completedCalculations.value.slice(0, 50)
    const last = currentTerm.value
    terms.value = [{ ...freshTerm(String(result)), label: last.label || 'Result', icon: last.icon || 'calculate' }]
    hasFinalized.value = true
    error.value = ''
    iconEditorId.value = null
  } catch (err) { error.value = err.message }
}
function pressKey(value) {
  if (/^\d$/.test(value)) return appendDigit(value)
  if (value === '.') return appendDecimal()
  if (['+', '-', '*', '/'].includes(value)) return selectOperator(value)
  if (value === 'percent') return applyPercent()
  if (value === 'sign') return toggleSign()
  if (value === 'backspace') return backspace()
  if (value === 'clear') return clear()
  if (value === 'undo') return undo()
}
function handleKeydown(event) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLInputElement) return
  if (/^\d$/.test(event.key) || ['.', '+', '-', '*', '/', '%', 'Backspace', 'Escape', 'Enter', '='].includes(event.key)) {
    event.preventDefault()
    if (event.key === 'Escape') clear()
    else if (event.key === 'Enter' || event.key === '=') equals()
    else if (event.key === 'Backspace') backspace()
    else if (event.key === '%') applyPercent()
    else pressKey(event.key)
  }
}
function updateManualAmount(value) {
  if (value !== '' && !Number.isFinite(Number(value))) return
  recordUndo()
  manualStartingAmount.value = value
}
function updateTermLabel(collectionId, termId, label) {
  recordUndo()
  if (collectionId === 'active') terms.value = terms.value.map((term) => term.id === termId ? { ...term, label } : term)
  else completedCalculations.value = completedCalculations.value.map((calculation) => calculation.id === collectionId ? { ...calculation, terms: calculation.terms.map((term) => term.id === termId ? { ...term, label } : term) } : calculation)
}
function updateTermIcon(collectionId, termId, icon) {
  recordUndo()
  if (collectionId === 'active') terms.value = terms.value.map((term) => term.id === termId ? { ...term, icon } : term)
  else completedCalculations.value = completedCalculations.value.map((calculation) => calculation.id === collectionId ? { ...calculation, terms: calculation.terms.map((term) => term.id === termId ? { ...term, icon } : term) } : calculation)
  iconEditorId.value = null
}
function toggleIconEditor(id) { iconEditorId.value = iconEditorId.value === id ? null : id }
function closeIconPicker() { iconEditorId.value = null }
function displayOperator(operator) { return operator === '*' ? '×' : operator === '/' ? '÷' : operator }

async function loadSnapshots() {
  try { snapshotLoadError.value = ''; snapshots.value = await api.getCalculatorSnapshots() }
  catch (err) { snapshotLoadError.value = err.message || 'Could not load saved snapshots.' }
}
async function saveSnapshot() {
  snapshotError.value = ''
  const name = snapshotName.value.trim()
  if (!name) { snapshotError.value = 'Enter a name for this snapshot.'; return }
  let result
  try { result = evaluateTerms(terms.value) }
  catch (err) { snapshotError.value = `Finish the calculation before saving: ${err.message}`; return }
  const manual = manualStartingAmount.value === '' ? 0 : Number(manualStartingAmount.value)
  if (!Number.isFinite(manual)) { snapshotError.value = 'Enter a valid starting amount.'; return }
  const payload = { terms: clone(terms.value), manualStartingAmount: manual, buckets: clone(includedBuckets.value), result }
  savingSnapshot.value = true
  try {
    await api.saveCalculatorSnapshot({ name, payload })
    snapshotName.value = ''
    await loadSnapshots()
  } catch (err) { snapshotError.value = err.message || 'Could not save this snapshot.' }
  finally { savingSnapshot.value = false }
}
function restoreSnapshot(snapshot) {
  try {
    const payload = snapshot.payload
    if (!Array.isArray(payload?.terms) || !Array.isArray(payload?.buckets) || !Number.isFinite(Number(payload.result)) || !Number.isFinite(Number(payload.manualStartingAmount))) throw new Error('The saved snapshot is incomplete.')
    evaluateTerms(payload.terms)
    recordUndo()
    terms.value = clone(payload.terms)
    manualStartingAmount.value = String(payload.manualStartingAmount || '')
    includedBuckets.value = clone(payload.buckets)
    hasFinalized.value = false
    error.value = ''
    snapshotError.value = ''
  } catch (err) { snapshotError.value = err.message || 'Could not restore this snapshot.' }
}
async function deleteSnapshot(snapshot) {
  snapshotLoadError.value = ''
  try {
    await api.deleteCalculatorSnapshot(snapshot.id)
    snapshots.value = snapshots.value.filter((item) => item.id !== snapshot.id)
  } catch (err) { snapshotLoadError.value = err.message || 'Could not delete this snapshot.' }
}
watch(() => props.activeVault, loadSnapshots)
onMounted(loadSnapshots)
defineExpose({
  closeActiveDialog: () => {
    if (iconEditorId.value) { closeIconPicker(); return true }
    return bucketDialRef.value?.closeDialog() || false
  }
})
</script>
