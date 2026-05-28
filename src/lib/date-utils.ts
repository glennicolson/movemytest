// Tax year helpers — UK tax year runs 6 April to 5 April
export function startOfTaxYear(date: Date): Date {
  const year = date.getMonth() < 3 ? date.getFullYear() - 1 : date.getFullYear();
  return new Date(year, 3, 6);// April 6
}

export function endOfTaxYear(date: Date): Date {
  const year = date.getMonth() < 3 ? date.getFullYear() : date.getFullYear() + 1;
  return new Date(year, 3, 5);// April 5
}

export function formatTaxYear(date: Date): string {
  const start = startOfTaxYear(date);
  const end = endOfTaxYear(date);
  return `${start.getFullYear()}/${String(end.getFullYear()).slice(2)}`;
}
