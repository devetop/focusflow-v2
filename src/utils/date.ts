export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getFormattedDateString(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function getCurrentHour(): number {
  return new Date().getHours();
}

export function isDateOverdue(dueDateStr: string, completed: boolean): boolean {
  if (completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDateStr) < today;
}

export function getLast7DaysDateStrings(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}
