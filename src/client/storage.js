const PREFIX = 'gk-v1-';
export const DEFAULT_SETTINGS = Object.freeze({sfx:0.65, music:0.22, vibration:true, quality:'orta', tutorial:true});
let available = true;
export function read(key, fallback = null) {
  try { const raw = localStorage.getItem(PREFIX + key); return raw === null ? fallback : JSON.parse(raw); }
  catch { return fallback; }
}
export function write(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); available = true; return true; }
  catch { available = false; return false; }
}
export function remove(key) { try { localStorage.removeItem(PREFIX + key); } catch { available = false; } }
export function storageAvailable() { return available; }
export function loadSettings() {
  const saved = read('settings', {});
  const settings = {...DEFAULT_SETTINGS};
  for (const key of ['sfx','music']) if (Number.isFinite(saved?.[key])) settings[key] = Math.max(0, Math.min(1, saved[key]));
  for (const key of ['vibration','tutorial']) if (typeof saved?.[key] === 'boolean') settings[key] = saved[key];
  if (['dusuk','orta','yuksek'].includes(saved?.quality)) settings.quality = saved.quality;
  return settings;
}
export function getProgress(ids) { const saved = read('progress', []); return Array.isArray(saved) ? saved.filter(id => ids.includes(id)) : []; }
export function saveMatch(sim, client) { return write('autosave', {version:1, savedAt:Date.now(), sim, client}); }
export function loadMatch() { const saved = read('autosave'); return saved?.version === 1 && typeof saved.sim === 'string' ? saved : null; }
