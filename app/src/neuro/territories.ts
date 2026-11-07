/** Cerebral arterial territories as plain data (no three.js), shared by the perfusion and exam engines and the scene. */
export type Side = 'R' | 'L' | 'M';
export type TerritoryId = 'MCA_R' | 'MCA_L' | 'ACA_R' | 'ACA_L' | 'PCA_R' | 'PCA_L' | 'VB';
export const TERRITORIES: TerritoryId[] = ['MCA_R', 'MCA_L', 'ACA_R', 'ACA_L', 'PCA_R', 'PCA_L', 'VB'];
/** approximate adult territory volumes, mL (teaching values) */
export const TERRITORY_ML: Record<TerritoryId, number> = { MCA_R: 280, MCA_L: 280, ACA_R: 90, ACA_L: 90, PCA_R: 80, PCA_L: 80, VB: 150 };
export const TERRITORY_NAME: Record<TerritoryId, string> = { MCA_R: 'Right MCA', MCA_L: 'Left MCA', ACA_R: 'Right ACA', ACA_L: 'Left ACA', PCA_R: 'Right PCA', PCA_L: 'Left PCA', VB: 'Brainstem / cerebellum' };
/** deepest (least collateralised) point of each territory in local coordinates — tissue far from it is fed first by collaterals */
export const TERRITORY_CORE: Record<TerritoryId, [number, number, number]> = {
  MCA_R: [-0.5, -0.3, 0.05], MCA_L: [0.5, -0.3, 0.05], ACA_R: [-0.1, 0.15, 0.45], ACA_L: [0.1, 0.15, 0.45],
  PCA_R: [-0.25, -0.35, -0.72], PCA_L: [0.25, -0.35, -0.72], VB: [0, -0.8, -0.45],
};

