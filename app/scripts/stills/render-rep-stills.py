# Renders the audio app's 3D stills (public/audio/visuals/*.webp) from the real anatomy models + the overlays built by
# pipeline/build-rep-stills.ts. Needs a headless renderer that loads public/models/*.glb with per-mesh styles (see shot.js).

import json, subprocess, urllib.parse, sys, concurrent.futures as cf
OUT='/tmp/claude-0/-home-claude-critical-care-training-/6160a629-120d-55cb-b796-bc079bb31577/scratchpad/stills'
import os; os.makedirs(OUT, exist_ok=True)
def url(files, style, cam, clip=None, cap=None, up=None):
    q={'f':','.join(files),'style':json.dumps(style),'cam':cam,'w':'1200','h':'840'}
    if clip: q['clip']=clip
    if cap: q['cap']=cap
    if up: q['up']=up
    return 'http://localhost:8765/index.html?'+urllib.parse.urlencode(q)
SK={'skin':['#caa08a',0.16]}
shots={}
shots['efast-map']=url(['body','gut','heart-hd','_stills/efast'],{
 'body::^(brain|airway|bone_marrow|aorta|vena_cava|colon)$':'hide','body::skin':['#d2a48c',0.2],'body::lung_.':['#e2a9a4',0.28],'body::liver':['#7a2a24',1],'body::spleen':['#6b2638',1],'body::kidney_.':['#8b3a34',1],'body::bladder':['#d7b9a6',1],'body::gallbladder':['#4d6b3a',1],'body::pancreas':['#d8b48a',1],'body::heart':'hide',
 'gut::.*':['#e2aa9c',1],'gut::diaphragm':['#c77a70',0.25],'gut::mesenteric.*':'hide','heart-hd::.*':['#9c3a30',1],'heart-hd::(coronary_art|cardiac_veins)':'hide','_stills/efast::.*':['#2fd3c1',1]},'-1.0,3.7,13.0,0.15,3.5,0.0,30')
shots['io-landmark']=url(['skeleton','body','_stills/io'],{'body::^(?!skin$).*':'hide','body::skin':['#d2a48c',0.22],'skeleton::^(?!(tibia_R|fibula_R|patella_R|femur_R)$).*':'hide','skeleton::.*':['#e8dcc4',1],'_stills/io::.*':['#b8c4cc',1],'_stills/io::io_site':['#2fd3c1',1]},'0.9,-4.2,4.6,-1.45,-4.95,0.1,30')
shots['piv']=url(['_stills/arm'],{'_stills/arm::.*':['#3b5fb0',1],'_stills/arm::bone_.*':['#e8dcc4',0.55],'_stills/arm::.*artery':['#c8322b',1],'_stills/arm::cannula.*':['#f2b33d',1]},'-5.0,2.75,3.3,-2.7,2.55,-0.05,30')
shots['evd-level']=url(['body','skeleton','neuro','_stills/evd'],{'body::^(?!skin$).*':'hide','body::skin':['#d2a48c',0.16],'skeleton::^(?!(skull|mandible)$).*':'hide','skeleton::.*':['#e8dcc4',0.25],'neuro::^(?!(lat_ventricle_.|third_ventricle|aqueduct|fourth_ventricle)$).*':'hide','neuro::.*':['#4f7fd0',1],'_stills/evd::.*':['#f2b33d',1],'_stills/evd::evd_level':['#2fd3c1',0.18],'_stills/evd::evd_(monro|tragus)':['#2fd3c1',1]},'-5.2,9.4,3.0,-0.1,8.45,0.0,30')
shots['airway-overview']=url(['upper-airway','skeleton','body'],{'body::^(?!skin$).*':'hide','body::skin':['#d2a48c',0.16],'skeleton::^(?!(skull|mandible|C[1-7]|hyoid.*)$).*':'hide','skeleton::.*':['#e8dcc4',1],'upper-airway::.*':['#b9d3dd',1],'upper-airway::tongue':['#c56a6a',1],'upper-airway::(pharynx|soft_palate)':['#d89090',1],'upper-airway::epiglottis':['#e8c070',1],'upper-airway::(thyroid|cricoid).*':['#cfe0e8',1]},'5.6,7.6,0.6,0,7.55,0.2,30',clip='-1,0,0,0.002',cap='#c9b9a0')
for k,(t) in [('ra',None),('rv',None),('pa',None),('wedge',None)]:
    st={'heart-hd::.*':['#9c3a30',0.3],'heart-hd::(coronary_art|cardiac_veins)':['#b0302a',0.45],'lines::^(?!(svc|ivc|pulm_art|aorta|arch_branches)$).*':'hide','lines::.*':['#7d6ab0',0.28],'lines::(aorta|arch_branches)':['#c8322b',0.25],f'_stills/pac::^(?!(pac|balloon)_{k}$).*':'hide','_stills/pac::.*':['#f2b33d',1]}
    shots['pac-'+k]=url(['heart-hd','lines','_stills/pac'],st,'-0.6,5.55,6.6,0.3,5.15,0.3,30')
def run(item):
    k,u=item; r=subprocess.run(['node','shot.js',u,f'{OUT}/{k}.png','1200','840'],capture_output=True,text=True,timeout=300); return k,(r.stdout+r.stderr).strip().splitlines()[-1:] 
with cf.ThreadPoolExecutor(3) as ex:
    for k,res in ex.map(run, shots.items()): print(k,res)
