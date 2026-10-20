<template>
  <section class="space-y-3 rounded-2xl border border-[#29293a] bg-[#0f1019] p-4 animate-cascade-2" aria-labelledby="ask-cash-buddy-title">
    <div>
      <div class="flex items-center gap-2">
        <h3 id="ask-cash-buddy-title" class="text-sm font-bold text-[#f1f0f5]">Ask Cash Buddy</h3>
        <button
          type="button"
          class="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[#393747] text-[#bcb7ca] transition hover:border-[#D4BFFF] hover:text-[#f1f0f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4BFFF]"
          :aria-expanded="showQuestionGuide"
          aria-controls="cash-buddy-question-guide"
          aria-label="Show questions Cash Buddy can answer"
          @click="showQuestionGuide = !showQuestionGuide"
        >
          <span class="material-symbols-outlined text-base" aria-hidden="true">help</span>
        </button>
      </div>
      <p class="mt-1 text-xs leading-5 text-[#9e9cae]">Ask about your spending, reports, or how to use Cash Buddy.</p>
    </div>

    <div v-if="showQuestionGuide" id="cash-buddy-question-guide" class="rounded-xl border border-[#29293a] bg-[#141520] p-3" aria-label="Things you can ask Cash Buddy">
      <p class="mb-3 text-xs text-[#9e9cae]">Ask in your own words and combine topics with dates, categories, descriptions, accounts, or buckets. Cash Buddy can correct some small typos and will ask when a name is ambiguous.</p>
      <p class="mb-3 text-xs text-[#9e9cae]">Compare multiple periods in the chart and category table. In an answer, adjust dates or buckets, or select a chart segment to filter its transactions.</p>
      <div class="grid gap-3 sm:grid-cols-2">
        <div v-for="feature in questionFeatures" :key="feature.title" class="min-w-0">
          <h4 class="text-xs font-semibold text-[#f1f0f5]">{{ feature.title }}</h4>
          <button
            v-for="example in feature.examples"
            :key="example"
            type="button"
            class="mt-1 flex min-h-11 max-w-full items-center rounded-lg px-2 text-left text-xs text-[#bcb7ca] underline decoration-[#555165] underline-offset-2 hover:bg-[#1b1c28] hover:text-[#D4BFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4BFFF]"
            @click="useExample(example)"
          >
            {{ example }}
          </button>
        </div>
      </div>
    </div>

    <form class="flex gap-2" @submit.prevent="submitQuestion">
      <label class="sr-only" for="cash-buddy-question">Your question</label>
      <input
        id="cash-buddy-question"
        v-model="question"
        type="text"
        :disabled="isSubmitting"
        autocomplete="off"
        enterkeyhint="send"
        placeholder="How much did I spend on petrol?"
        class="min-w-0 flex-1 rounded-xl border border-[#29293a] bg-[#141520] px-3 py-2.5 text-sm text-[#f1f0f5] placeholder:text-[#777487] focus:border-[#D4BFFF] focus:outline-none focus:ring-2 focus:ring-[#D4BFFF]/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
      <button type="submit" :disabled="isSubmitting || !question.trim()" class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#D4BFFF] px-3 text-sm font-bold text-[#0f0f15] transition hover:bg-[#e2d3ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1f0f5] disabled:cursor-not-allowed disabled:opacity-60">
        <span v-if="isSubmitting" class="material-symbols-outlined animate-spin" aria-hidden="true">progress_activity</span>
        <span v-else>Ask</span>
      </button>
    </form>

    <p v-if="isSubmitting" class="inline-flex items-center gap-2 text-xs text-[#9e9cae]" role="status">
      <span>Thinking through your question</span>
      <span class="inline-flex gap-0.5" aria-hidden="true"><span class="animate-bounce motion-reduce:animate-none">·</span><span class="animate-bounce motion-reduce:animate-none [animation-delay:100ms]">·</span><span class="animate-bounce motion-reduce:animate-none [animation-delay:200ms]">·</span></span>
    </p>
    <p v-else-if="error" class="text-xs text-rose-300" role="alert">{{ error }}</p>

    <QuestionResultsView
      :result="result"
      :currency-symbol="currencySymbol"
      :buckets="buckets"
      :net-worth="netWorth"
      :is-refining="isSubmitting"
      @close="result = null"
      @open-help="openHelp"
      @refine="refineQuestion"
    />
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { currencySymbol } from '../utils/currency.js';
import { answerQuestion } from '../services/questionService.js';
import QuestionResultsView from './QuestionResultsView.vue';

const props = defineProps({
  categories: { type: Array, default: () => [] },
  accounts: { type: Array, default: () => [] },
  buckets: { type: Array, default: () => [] },
  netWorth: { type: Number, default: 0 }
});
const emit = defineEmits(['open-help']);

const question = ref('');
const result = ref(null);
const isSubmitting = ref(false);
const error = ref('');
const showQuestionGuide = ref(false);
const questionFeatures = [
  { title: 'Spending and income', examples: ['How much did I spend last month?', 'How much income did I receive this year?'] },
  { title: 'Categories and purchases', examples: ['How much did I spend on petrol?', 'How many times did I spend on food?', 'How much did I send home?'] },
  { title: 'Accounts and buckets', examples: ['How much did I spend from cash?', 'How much can I spend per day in Monthly Budget?'] },
  { title: 'Dates and comparisons', examples: ['How much did I spend in September and July?', 'Compare this month with last month'] },
  { title: 'Rankings and patterns', examples: ['Which category did I spend the most on?', 'Which expenses might be recurring?'] },
  { title: 'Summaries and budgets', examples: ['What is my average monthly spending?', 'How much can I spend per day until month end?', 'How much is left to reach my savings target?'] },
  { title: 'Transaction details', examples: ['Where did I spend my last ₹20,000?', 'Show my expenses from last week'] },
  { title: 'Using Cash Buddy', examples: ['How do I create another vault?', 'How do I filter transactions in History?'] }
];

function useExample(example) {
  question.value = example;
  showQuestionGuide.value = false;
}

async function submitQuestion() {
  const originalQuestion = question.value.trim();
  if (!originalQuestion || isSubmitting.value) return;

  isSubmitting.value = true;
  error.value = '';
  try {
    const answer = await answerQuestion({ question: originalQuestion, categories: props.categories, accounts: props.accounts, buckets: props.buckets, netWorth: props.netWorth });
    result.value = answer;
  } catch (err) {
    error.value = err?.message || 'Cash Buddy could not answer that question. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}

async function refineQuestion(filters) {
  const originalQuestion = result.value?.question
  if (!originalQuestion || isSubmitting.value) return
  isSubmitting.value = true
  try {
    result.value = await answerQuestion({ question: originalQuestion, categories: props.categories, accounts: props.accounts, buckets: props.buckets, netWorth: props.netWorth, overrides: filters })
  } catch (err) {
    error.value = err?.message || 'Cash Buddy could not update this answer.'
  } finally {
    isSubmitting.value = false
  }
}

function openHelp() {
  result.value = null;
  emit('open-help');
}
</script>
