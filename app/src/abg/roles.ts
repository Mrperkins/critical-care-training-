/** Which alveoli are normal, low V/Q, collapsed (shunt) or unperfused (dead space). Dependent alveoli collapse first. */
export function alveolarRoles(n: number, ys: number[], shunt: number, lowVQ: number, vdAlv: number) {
  const order = ys.map((y, i) => [y, i] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const role: ('normal' | 'low' | 'shunt' | 'dead')[] = Array(n).fill('normal');
  const ns = Math.round(Math.min(0.6, shunt) * n), nl = Math.round(Math.min(0.5, lowVQ) * n), nd = Math.round(Math.min(0.5, vdAlv) * n);
  order.slice(0, ns).forEach((i) => (role[i] = 'shunt')); order.slice(ns, ns + nl).forEach((i) => (role[i] = 'low'));
  order.slice().reverse().slice(0, nd).forEach((i) => { if (role[i] === 'normal') role[i] = 'dead'; });
  return role;
}

