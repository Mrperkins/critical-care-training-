export const vec3 = { transform(v: number[], m: number[]) { const [x, y, z] = v; return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]]; } };
export const mat4 = {};
