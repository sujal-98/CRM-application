export const CONDITIONS = [
  {
    value: 'spend',
    label: 'Total Spend',
    type: 'number',
    unit: 'INR',
    description: 'Total amount spent by the customer',
  },
  // ... rest of the conditions
];

export const COMPARATORS = [
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'eq', label: '=' },
  { value: 'gte', label: '≥' },
  { value: 'lte', label: '≤' },
];

export const OPERATORS = ['AND', 'OR']; 