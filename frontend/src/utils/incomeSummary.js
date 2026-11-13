import { isInternalAllocation, isSalaryAllocation } from './transactionSemantics.js';

export function calculateIncomeSummary(transactions = []) {
  let recordedIncome = 0;
  let salaryAllocations = 0;

  for (const transaction of transactions) {
    const amount = Number(transaction.amount) || 0;
    if (isSalaryAllocation(transaction) && transaction.adjustment_direction !== 'subtract') {
      salaryAllocations += amount;
    } else if (
      transaction.account_id !== 'acc_unallocated_funds'
      && !isInternalAllocation(transaction)
      && transaction.transaction_type === 'income'
    ) {
      recordedIncome += amount;
    } else if (
      transaction.account_id !== 'acc_unallocated_funds'
      && !isInternalAllocation(transaction)
      && transaction.transaction_type === 'adjustment'
      && transaction.adjustment_direction === 'add'
      && Number(transaction.include_in_chart) === 1
    ) {
      recordedIncome += amount;
    }
  }

  return { recordedIncome, salaryAllocations, total: recordedIncome + salaryAllocations };
}
