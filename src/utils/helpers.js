export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function getWeekLabel(date = new Date()) {
  const year = date.getFullYear();
  const start = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date - start) / 86400000 + start.getDay() + 1) / 7);
  return `${year}년 ${week}주차`;
}

// 이번 주 일요일 (교육은 매주 일요일 실시)
export function getThisSunday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0=일, 1=월, ..., 6=토
  // 이미 일요일이면 그대로, 아니면 다음 일요일
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekRangeLabel(weekStart) {
  const start = new Date(weekStart);
  return formatDate(start.toISOString()) + ' (주일)';
}
