import { useUI } from '../app/store';
/** Point the respiratory view at a semantic target (state only: the scene decides how to show it). */
export function focusVentTarget(id: string) {
  const set = useUI.getState().set;
  if (id === 'lung.whole') set({ ventView: 'front', ventTarget: 'lung.whole' });
  else set({ ventView: 'alveolus', ventTarget: id });
}
