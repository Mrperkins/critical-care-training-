import{g as _}from"./c-PBDDHZSX.js";import{a as T}from"./c-4TIYSYRS.js";import{a as N}from"./c-GCNXBE3O.js";import{$a as H,O as E,Oa as M,X as y,ca as R,h as x,ma as F}from"./c-WQ2PHO7R.js";import{c as w}from"./c-LV7NOCMP.js";var r=w(N(),1);var A=w(T(),1);function P(n,u=.72){if(n.length<2)throw new Error("Flow column needs at least two points");let i=n.map(e=>e.p.clone()),c=new M(i,!1,"centripetal"),p=Math.min(180,Math.max(28,n.length*9)),a=new H(c,p,1,10,!1),s=a.getAttribute("position"),v=n.map(e=>Math.max(.003,e.r)),t=[0];for(let e=1;e<i.length;e++)t.push(t[e-1]+i[e].distanceTo(i[e-1]));let f=t[t.length-1]||1,o=new y,m=new y;for(let e=0;e<=p;e++){let d=e/p,g=d*f,l=1;for(;l<t.length-1&&t[l]<g;)l++;let C=E.clamp((g-t[l-1])/Math.max(1e-6,t[l]-t[l-1]),0,1),S=E.lerp(v[l-1],v[l],C)*u;c.getPointAt(d,m);for(let h=0;h<=10;h++){let b=e*11+h;o.fromBufferAttribute(s,b).sub(m).multiplyScalar(S).add(m),s.setXYZ(b,o.x,o.y,o.z)}}return s.needsUpdate=!0,a.computeVertexNormals(),a.computeBoundingSphere(),a}var V=n=>Number.isFinite(n)?E.clamp(n,0,1):0;function U({path:n,color:u,sample:i,width:c=.72,label:p,opacity:a=.72,clippingPlanes:s,layer:v=3}){let t=(0,r.useMemo)(()=>P(n,c),[n,c]),f=(0,r.useRef)(i);f.current=i;let o=(0,r.useMemo)(()=>({uColor:{value:new R(u)},uTravel:{value:0},uActivity:{value:0},uOpacity:{value:a}}),[]);(0,r.useEffect)(()=>{o.uColor.value.set(u),o.uOpacity.value=a},[u,a,o]);let m=(0,r.useMemo)(()=>new F({uniforms:o,side:x,transparent:!0,depthWrite:!1,depthTest:!1,clipping:!!s,clippingPlanes:s,vertexShader:`varying float vAlong; varying vec3 vNormal;
      #include <clipping_planes_pars_vertex>
      void main() {vAlong=uv.x;vNormal=normalize(normalMatrix*normal);
      vec3 transformed=position;
      vec4 mvPosition=modelViewMatrix*vec4(transformed,1.0);
      gl_Position=projectionMatrix*mvPosition;
      #include <clipping_planes_vertex>
      }`,fragmentShader:`uniform vec3 uColor; uniform float uTravel,uActivity,uOpacity;
      varying float vAlong;varying vec3 vNormal;
      #include <clipping_planes_pars_fragment>
      void main() {
        #include <clipping_planes_fragment>
        float u=fract(vAlong-uTravel+1.0);
        float envelope=smoothstep(0.01,0.075,u)*(1.0-smoothstep(0.31,0.44,u));
        float wake=smoothstep(0.0,0.06,u)*(1.0-smoothstep(0.49,0.8,u));
        float rim=0.70+0.30*abs(vNormal.z);
        float alpha=(0.23+0.64*envelope+0.15*wake)*uActivity*uOpacity;
        if(alpha<0.012) discard;
        vec3 rgb=uColor*(0.74+0.65*envelope+0.12*wake)*rim;
        gl_FragColor=vec4(rgb,min(0.92,alpha));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`}),[o,s]);return _(()=>{let e=f.current(),d=Math.max(0,Number.isFinite(e.speed??1)?e.speed??1:1),g=e.direction===-1?-1:1;o.uTravel.value=(e.time*d*g*.34%1+1)%1,o.uActivity.value=V(e.activity)}),(0,r.useEffect)(()=>()=>{t.dispose(),m.dispose()},[t,m]),(0,A.jsx)("mesh",{name:p,geometry:t,material:m,renderOrder:v,frustumCulled:!1})}export{U as a};
