export function toBn(n) {
  return Number(n).toLocaleString('bn-BD');
}

export function formatDuration(sec) {
  if (!sec) return '০ মিনিট';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h) return `${toBn(h)} ঘণ্টা ${toBn(m)} মিনিট`;
  if (m) return `${toBn(m)} মিনিট`;
  return `${toBn(sec)} সেকেন্ড`;
}

export function formatTime(iso) {
  return new Date(iso).toLocaleString('bn-BD', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}