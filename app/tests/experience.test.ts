import { describe, expect, it } from 'vitest';
import { experienceDestination, experienceFor, selectExperience } from '../src/app/experience';
import { useUI, type Module, type Mode } from '../src/app/store';

describe('global clinical experiences', () => {
  it.each(['curriculum', 'videos'] as Module[])('enters a real clinical workspace from %s', (module) => {
    for (const next of ['learn', 'explore', 'practice'] as const) {
      const result = experienceDestination(module, 'learn', next);
      expect(result.module).toBe('vent');
      expect(result.mode).toBe(next === 'practice' ? 'challenge' : next);
    }
  });
  it.each(['vent', 'abg', 'labs', 'lines', 'heart', 'abdomen', 'neuro', 'moa', 'pediatrics', 'womens'] as Module[])('preserves %s when switching modes', (module) => {
    for (const next of ['learn', 'explore', 'practice'] as const) {
      expect(experienceDestination(module, 'explore', next)).toEqual({ module, mode: next === 'practice' ? 'challenge' : next });
    }
  });
  it('preserves an active simulator when Practice is selected again', () => {
    expect(experienceDestination('vent', 'sim', 'practice')).toEqual({ module: 'vent', mode: 'sim' });
    expect(experienceDestination('curriculum', 'sim', 'practice').mode).toBe('challenge');
  });
  it('writes the destination atomically into the shared navigation store', () => {
    useUI.getState().set({ module: 'curriculum', mode: 'learn' });
    selectExperience('learn');
    expect(useUI.getState().module).toBe('vent');
    expect(useUI.getState().mode).toBe('learn');
    selectExperience('explore'); expect(useUI.getState().mode).toBe('explore');
    selectExperience('practice'); expect(useUI.getState().mode).toBe('challenge');
  });
  it.each(['learn', 'explore', 'challenge', 'sim'] as Mode[])('maps %s to one of three public modes', (mode) => {
    expect(['learn', 'explore', 'practice']).toContain(experienceFor(mode));
  });
});
