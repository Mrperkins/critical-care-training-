import { useRef } from 'react';

/** Accessible rotary encoder for a training ventilator. Touch drag, mouse drag and keyboard. */
export function VentRotaryDial({label,value,min,max,step,onChange}:{label:string;value:number;min:number;max:number;step:number;onChange:(value:number)=>void}) {
  const start=useRef<{y:number;value:number}|null>(null);
  const clamp=(v:number)=>Math.max(min,Math.min(max,Math.round((v-min)/step)*step+min));
  const change=(v:number)=>onChange(+clamp(v).toFixed(4));
  return <div className="vent-rotary-wrap">
    <div role="slider" tabIndex={0} aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
      title="Drag up or down to rotate; use arrow keys for precise adjustments"
      style={{touchAction:'none',userSelect:'none',width:96,height:96,borderRadius:'50%',border:'8px solid var(--line, #6d8496)',display:'grid',placeItems:'center',cursor:'ns-resize',fontWeight:700,margin:'8px auto'}}
      onPointerDown={e=>{start.current={y:e.clientY,value};e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove={e=>{if(start.current)change(start.current.value+(start.current.y-e.clientY)*step/6);}}
      onPointerUp={()=>{start.current=null;}} onPointerCancel={()=>{start.current=null;}}
      onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowRight'){e.preventDefault();change(value+step);}else if(e.key==='ArrowDown'||e.key==='ArrowLeft'){e.preventDefault();change(value-step);}else if(e.key==='Home'){e.preventDefault();change(min);}else if(e.key==='End'){e.preventDefault();change(max);}}}>
      <span aria-hidden="true">{value.toFixed(step<1?1:0)}</span>
    </div>
    <p className="muted small" style={{textAlign:'center'}}>Touch and drag the dial, or use arrow keys</p>
  </div>;
}
