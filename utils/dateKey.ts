export function formatLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getLastNDateKeys(n: number, baseDate: Date = new Date()): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(formatLocalDateKey(d));
  }
  return days;
}

export function localDayBounds(dateStr: string): { startTime: string; endTime: string } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  return { startTime: start.toISOString(), endTime: end.toISOString() };
}
