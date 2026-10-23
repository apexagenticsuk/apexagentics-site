import { Renderer, Program, Mesh, Triangle } from 'ogl';
// o.host: element the canvas fills; o.c: orb centre in height units from the middle; o.r: orb radius in height units
export function orb(o = {}) {
  const host = document.querySelector(o.host || '.hero'); if (!host) return;
  const C = o.c || [.45, .1], R = o.r || .36;
  let renderer; try { renderer = new Renderer({ alpha: true, dpr: Math.min(devicePixelRatio, 1.5) }); } catch { return; }
  const gl = renderer.gl; if (!gl) return;
  gl.canvas.className = 'orb'; gl.canvas.setAttribute('aria-hidden', 'true'); host.append(gl.canvas);
  const program = new Program(gl, { transparent: true, uniforms: { t: { value: 0 }, r: { value: [1, 1] }, ce: { value: C }, rad: { value: R } },
    vertex: 'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}',
    fragment: `precision highp float;uniform float t;uniform vec2 r;uniform vec2 ce;uniform float rad;
      float n(vec2 p){return sin(p.x*3.+t*.6)*sin(p.y*3.-t*.5)+sin(p.x*5.-t*.3+p.y*2.)*.5;}
      void main(){vec2 uv=(gl_FragCoord.xy-.5*r)/r.y;vec2 c=(uv-ce)*(.36/rad);float d=length(c)+n(c*2.)*.05;
      float o=smoothstep(.36,.0,d);vec3 col=mix(vec3(.05,.06,.07),vec3(.486,1.,.698),o*o)+vec3(.2,.3,.6)*smoothstep(.4,.1,length(c+vec2(.12,-.1)))*.25;
      gl_FragColor=vec4(col,o*.85);}` });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  const size = () => { renderer.setSize(host.clientWidth, host.clientHeight); program.uniforms.r.value = [gl.canvas.width, gl.canvas.height]; };
  size(); addEventListener('resize', size);
  let vis = true; new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(host);
  const loop = t => { requestAnimationFrame(loop); if (!vis) return; program.uniforms.t.value = t * .001; renderer.render({ scene: mesh }); };
  requestAnimationFrame(loop); gl.canvas.style.opacity = 1; host.classList.add('orb-live');
}
