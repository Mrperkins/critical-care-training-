// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { makeBackup, readBackup, restoreBackup } from '../src/library/backup';

beforeEach(() => localStorage.clear());
describe('progress backup', () => {
  it('saves only this app’s data and restores it exactly', () => {
    localStorage.setItem('ccp.progress.v1', '{"completed":["a"]}'); localStorage.setItem('cc.fpc.bank.v1', '{"x:0":{"n":1}}'); localStorage.setItem('other-site', 'keep out');
    const b = makeBackup(localStorage, new Date('2026-11-15T00:00:00Z')); expect(Object.keys(b.data).sort()).toEqual(['cc.fpc.bank.v1', 'ccp.progress.v1']);
    const text = JSON.stringify(b); localStorage.clear(); localStorage.setItem('ccp.missions.v1', '{"stale":1}'); localStorage.setItem('other-site', 'mine');
    expect(restoreBackup(readBackup(text))).toBe(2);
    expect(localStorage.getItem('ccp.progress.v1')).toBe('{"completed":["a"]}'); expect(localStorage.getItem('ccp.missions.v1')).toBeNull(); expect(localStorage.getItem('other-site')).toBe('mine');
  });
  it('refuses files that are not a backup from this app', () => {
    expect(() => readBackup('not json')).toThrow(/not a progress backup/); expect(() => readBackup('{"app":"x","data":{}}')).toThrow();
    expect(() => readBackup(JSON.stringify({ app: 'critical-care-training', version: 1, savedAt: '', data: { 'evil.key': '1' } }))).toThrow(/does not recognise/);
  });
});
