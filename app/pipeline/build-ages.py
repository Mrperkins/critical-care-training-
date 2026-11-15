import numpy as np, trimesh, os, re
D='makehuman/makehuman/data/'
verts=[]; faces=[]; grp=None
for l in open(D+'3dobjs/base.obj'):
    if l.startswith('v '): verts.append([float(x) for x in l.split()[1:4]])
    elif l.startswith('g '): grp=l.split()[1]
    elif l.startswith('f ') and grp=='body':
        idx=[int(p.split('/')[0])-1 for p in l.split()[1:]]
        faces.append(idx)
V=np.array(verts)
def target(name):
    off=np.zeros_like(V); p=D+'targets/macrodetails/'+name
    for l in open(p):
        if l.startswith('#') or not l.strip(): continue
        a=l.split(); off[int(a[0])]=[float(a[1]),float(a[2]),float(a[3])]
    return off
def body(age):
    v=V.copy()
    for g in ('male','female'):
        v+=0.5*target(f'universal-{g}-{age}-averagemuscle-averageweight.target')
        for e in ('african','asian','caucasian'):
            try: v+= (1/6)*target(f'{e}-{g}-{age}.target')
            except FileNotFoundError: pass
        for h in ('minheight','maxheight'):
            pass
    return v
tris=[]
for f in faces:
    for i in range(1,len(f)-1): tris.append([f[0],f[i],f[i+1]])
tris=np.array(tris)
sc=trimesh.Scene()
for age,name in (('young','adult'),('child','child'),('baby','infant')):
    v=body(age)
    m=trimesh.Trimesh(vertices=v,faces=tris,process=True); m.remove_unreferenced_vertices()
    m.apply_scale(0.1); lo=m.bounds[0][1]; m.apply_translation([-m.centroid[0],-lo,0]); m.vertex_normals
    m.visual=trimesh.visual.ColorVisuals(m)
    print(name,'height',round(m.bounds[1][1],3),'head-to-height', len(m.vertices))
    sc.add_geometry(m,node_name=name,geom_name=name)
sc.export('ages.glb'); import os; print(os.path.getsize('ages.glb'))
