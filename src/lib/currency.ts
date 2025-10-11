const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
});

export function formatCurrency(amount: number) {
  return rupiahFormatter.format(amount);
}
