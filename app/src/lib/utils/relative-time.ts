export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) {
    return '-';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const diffMs = Date.now() - date.getTime();
  const isFuture = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (absMs < minute) {
    return isFuture ? 'in a few seconds' : 'a few seconds ago';
  }

  const format = (value: number, unit: string) => {
    const rounded = Math.max(1, Math.floor(value));
    const label = rounded === 1 ? unit : `${unit}s`;
    return isFuture ? `in ${rounded} ${label}` : `${rounded} ${label} ago`;
  };

  if (absMs < hour) {
    return format(absMs / minute, 'minute');
  }

  if (absMs < day) {
    return format(absMs / hour, 'hour');
  }

  if (absMs < month) {
    return format(absMs / day, 'day');
  }

  if (absMs < year) {
    return format(absMs / month, 'month');
  }

  return format(absMs / year, 'year');
}
