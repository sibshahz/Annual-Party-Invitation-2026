import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../utils/gsapConfig';

interface LiquidGoldCanvasProps {
  /** Incremented when the golden envelope opens to trigger a gentle 3D wave surge. */
  surgeNonce?: number;
}

const VERTEX_SHADER_SOURCE = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  uniform float uSurge;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Quintic-interpolated value noise for C2-smooth 3D liquid normals (zero grid artifacts)
  float qNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // 3-octave rotated FBM with contrast expansion for plump molten swells
  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.56;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 3; i++) {
      val += amp * qNoise(p);
      p = rot * p * 2.02 + vec2(17.1, 31.7);
      amp *= 0.48;
    }
    return clamp((val - 0.5) * 2.05 + 0.5, 0.0, 1.0);
  }

  // Evaluates 3D molten gold height & flowing liquid coverage mask
  vec2 evalGoldSurface(vec2 p, float t) {
    vec2 flow = vec2(t * 0.10 + uScroll * 0.28, -t * 0.065 + uScroll * 0.42);
    vec2 q = p * 1.55 + flow + uPointer * 0.08;

    // Two-stage viscous domain warping for heavy molten 24k gold currents
    vec2 warp1 = vec2(
      fbm(q * 0.92 + vec2(0.0, t * 0.08)),
      fbm(q * 0.92 + vec2(5.2, 1.3 - t * 0.07))
    );
    vec2 qWarped = q + (warp1 - 0.5) * (1.45 + uSurge * 0.28);

    vec2 warp2 = vec2(
      fbm(qWarped * 1.35 - vec2(t * 0.06, 0.0)),
      fbm(qWarped * 1.35 + vec2(2.7, t * 0.055))
    );
    vec2 qFinal = qWarped + (warp2 - 0.5) * 0.82;

    // Sweeping viscous fluid ridges + trochoidal undulations
    float swellA = sin(qFinal.x * 2.85 + qFinal.y * 1.95 - t * 0.44) * 0.5 + 0.5;
    float swellB = cos(qFinal.x * 1.65 - qFinal.y * 2.75 + t * 0.34) * 0.5 + 0.5;
    float fluidNoise = fbm(qFinal * 1.48 + vec2(t * 0.045, -t * 0.035));
    float fineRipple = qNoise(qFinal * 3.4 + vec2(-t * 0.14, t * 0.11));

    // Radial liquid gold wave surge when envelope opens
    float dist = length(p);
    float openRipple = sin(dist * 9.0 - uSurge * 7.5) * exp(-dist * 1.35) * uSurge * 0.26;

    float height = fluidNoise * 0.50 + swellA * 0.26 + swellB * 0.16 + fineRipple * 0.08 + openRipple;

    // Generous, healthy quantity (~70% sculptural molten gold currents across the viewport)
    float poolField = fluidNoise * 0.54 + swellA * 0.28 + swellB * 0.18;
    float liquidMask = smoothstep(0.28, 0.50, poolField);

    return vec2(height, liquidMask);
  }

  // Procedural high-contrast studio reflection environment for real 3D metallic gold
  vec3 sampleGoldStudioEnv(vec3 R) {
    float horizon = sin(R.x * 2.8 + R.z * 2.1) * 0.5 + 0.5;
    float softbox1 = smoothstep(0.15, 0.88, R.y * 0.65 - R.x * 0.55 + 0.35);
    float softbox2 = smoothstep(0.25, 0.92, R.y * 0.50 + R.z * 0.65 + 0.15);
    float crease = smoothstep(-0.35, 0.25, R.y);

    // Rich burnished bronze-gold troughs -> vivid 24k gold slopes -> warm champagne softbox peaks
    vec3 bronzeTrough = vec3(0.49, 0.31, 0.05);
    vec3 burnishedGold = vec3(0.79, 0.55, 0.13);
    vec3 molten24k = vec3(0.95, 0.74, 0.25);
    vec3 champagnePeak = vec3(1.00, 0.91, 0.58);
    vec3 ivoryHighlight = vec3(1.00, 0.98, 0.89);

    vec3 env = mix(bronzeTrough, burnishedGold, crease);
    env = mix(env, molten24k, horizon * 0.78);
    env = mix(env, champagnePeak, softbox1 * 0.72);
    env = mix(env, ivoryHighlight, pow(softbox2, 2.2) * 0.58);
    return env;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 p = (uv - 0.5) * aspect;

    float t = uTime;

    vec2 center = evalGoldSurface(p, t);
    float h0 = center.x;
    float mask = center.y;

    float eps = 0.008;
    float hx = evalGoldSurface(p + vec2(eps, 0.0), t).x;
    float hy = evalGoldSurface(p + vec2(0.0, eps), t).x;
    vec2 grad = vec2(hx - h0, hy - h0) / eps;

    // Bold 3D liquid curvature normals so specular bands wrap realistically over every swell
    float bump = 1.95 * (0.35 + 0.65 * mask);
    vec3 N = normalize(vec3(-grad.x * bump, 1.0, -grad.y * bump));

    vec3 V = normalize(vec3(uPointer.x * 0.42 - p.x * 0.22, 1.0, uPointer.y * 0.42 - p.y * 0.22));
    vec3 R = reflect(-V, N);

    float NdotV = max(dot(N, V), 0.001);

    // Metallic 24k gold Fresnel reflectance
    vec3 F0 = vec3(0.95, 0.73, 0.28);
    vec3 fresnel = F0 + (1.0 - F0) * pow(1.0 - NdotV, 3.2);

    vec3 envColor = sampleGoldStudioEnv(R);

    // Directional studio key & rim lights for glossy wet liquid gold volume
    vec3 L1 = normalize(vec3(-0.52, 0.74, 0.42));
    vec3 H1 = normalize(L1 + V);
    float NdotH1 = max(dot(N, H1), 0.0);

    vec3 L2 = normalize(vec3(0.64, 0.48, -0.58));
    vec3 H2 = normalize(L2 + V);
    float NdotH2 = max(dot(N, H2), 0.0);

    float broadSheen = pow(NdotH1, 12.0);
    float liquidGlint = pow(NdotH1, 72.0);
    float warmRim = pow(NdotH2, 18.0);

    // Light, natural real-gold micro-shimmer along curved sunlit wave crests
    vec2 shimmerCoord = p * 38.0 + vec2(t * 0.22, -t * 0.16) + grad * 0.85;
    float sparkleField = qNoise(shimmerCoord) * qNoise(shimmerCoord * 1.67 + 7.3);
    float shimmerMask = smoothstep(0.50, 0.84, sparkleField) * smoothstep(0.45, 0.90, NdotH1);
    float shimmerBreath = 0.55 + 0.45 * sin(t * 2.2 + p.x * 6.5 - p.y * 5.2);
    float realGoldShimmer = shimmerMask * shimmerBreath * 0.26;

    // Compose glossy 3D molten gold
    vec3 goldBody = envColor * (0.78 + 0.34 * fresnel);
    goldBody += vec3(1.00, 0.90, 0.58) * broadSheen * 0.36;
    goldBody += vec3(1.00, 0.98, 0.88) * (liquidGlint * 0.65 + realGoldShimmer);
    goldBody += vec3(0.92, 0.70, 0.24) * warmRim * 0.30;

    // Warm alabaster porcelain ground with luminous champagne pools in valleys
    vec3 alabasterBase = vec3(0.980, 0.973, 0.953);
    vec3 champagneSilk = vec3(0.968, 0.925, 0.815);
    vec3 ground = mix(alabasterBase, champagneSilk, smoothstep(0.24, 0.58, h0) * 0.85);

    // Sculpted 3D meniscus lip & warm shadow halo where heavy liquid gold curls over alabaster
    float outerShadow = smoothstep(0.10, 0.32, mask) * (1.0 - smoothstep(0.32, 0.52, mask));
    vec3 groundWithLip = mix(ground, vec3(0.84, 0.68, 0.36), outerShadow * 0.38);

    // Rich translucent blend (~82% max metallic intensity so typography & cards remain crisp)
    vec3 finalColor = mix(groundWithLip, goldBody, mask * 0.82);

    // Soft bright alabaster readability lift strictly under left-center hero text zone on wide screens
    float wideFactor = smoothstep(1.05, 1.45, aspect.x);
    float heroCopyZone = smoothstep(0.56, 0.10, length((uv - vec2(0.26, 0.46)) * vec2(1.05, 1.35)));
    finalColor = mix(finalColor, mix(finalColor, alabasterBase, 0.56), heroCopyZone * wideFactor);

    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Real-time 3D molten liquid gold background powered by a custom C2-smooth WebGL heightfield
 * shader and orchestrated by GSAP ticker, ScrollTrigger velocity/progress, quickTo, and matchMedia.
 */
export function LiquidGoldCanvas({ surgeNonce = 0 }: LiquidGoldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const shaderStateRef = useRef({
    time: 0,
    scroll: 0,
    scrollSpeedBoost: 0,
    pointerX: 0,
    pointerY: 0,
    surge: 0,
    reducedMotion: false,
  });

  useEffect(() => {
    if (surgeNonce <= 0) return;
    if (shaderStateRef.current.reducedMotion) return;

    const state = shaderStateRef.current;
    gsap.killTweensOf(state, 'surge');
    gsap.fromTo(
      state,
      { surge: 0.05 },
      {
        surge: 1,
        duration: 1.15,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(state, { surge: 0, duration: 1.8, ease: 'power2.inOut' });
        },
      }
    );
  }, [surgeNonce]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      setWebglUnavailable(true);
      return;
    }

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vert || !frag) {
      if (vert) gl.deleteShader(vert);
      if (frag) gl.deleteShader(frag);
      setWebglUnavailable(true);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      setWebglUnavailable(true);
      return;
    }

    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      setWebglUnavailable(true);
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uScroll = gl.getUniformLocation(program, 'uScroll');
    const uPointer = gl.getUniformLocation(program, 'uPointer');
    const uSurge = gl.getUniformLocation(program, 'uSurge');

    let isContextLost = false;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
    };
    const handleContextRestored = () => {
      isContextLost = false;
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    const resizeCanvas = () => {
      // Smooth liquid gradients upsample cleanly; capping internal width keeps 60fps across all GPUs
      const dpr = gsap.utils.clamp(1, 1.25, window.devicePixelRatio || 1);
      const rawW = window.innerWidth * dpr;
      const rawH = window.innerHeight * dpr;
      const downscale = rawW > 1080 ? 1080 / rawW : 1;
      const width = Math.max(1, Math.floor(rawW * downscale));
      const height = Math.max(1, Math.floor(rawH * downscale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const drawFrame = () => {
      if (isContextLost || document.hidden) return;
      const state = shaderStateRef.current;

      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, state.time);
      gl.uniform1f(uScroll, state.scroll);
      gl.uniform2f(uPointer, state.pointerX, state.pointerY);
      gl.uniform1f(uSurge, state.surge);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    resizeCanvas();
    drawFrame();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const state = shaderStateRef.current;
    const quickPtrX = gsap.quickTo(state, 'pointerX', { duration: 1.0, ease: 'power3.out' });
    const quickPtrY = gsap.quickTo(state, 'pointerY', { duration: 1.0, ease: 'power3.out' });
    const quickBoost = gsap.quickTo(state, 'scrollSpeedBoost', { duration: 0.7, ease: 'power2.out' });

    const normalizeX = gsap.utils.pipe(
      (x: number) => x / Math.max(window.innerWidth, 1),
      gsap.utils.mapRange(0, 1, -1, 1),
      gsap.utils.clamp(-1, 1)
    );
    const normalizeY = gsap.utils.pipe(
      (y: number) => y / Math.max(window.innerHeight, 1),
      gsap.utils.mapRange(0, 1, 1, -1),
      gsap.utils.clamp(-1, 1)
    );
    const velocityToBoost = gsap.utils.pipe(
      gsap.utils.clamp(-1800, 1800),
      gsap.utils.mapRange(-1800, 1800, -0.45, 0.45)
    );

    const handlePointerMove = (e: PointerEvent) => {
      if (state.reducedMotion) return;
      quickPtrX(normalizeX(e.clientX));
      quickPtrY(normalizeY(e.clientY));
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const mm = gsap.matchMedia();
    let tickerActive = false;

    const tick = (_time: number, deltaTime: number) => {
      const dt = Math.min(deltaTime, 50) * 0.001;
      state.time += dt * (1.0 + Math.abs(state.scrollSpeedBoost) * 0.65 + state.surge * 0.5);
      state.scrollSpeedBoost = gsap.utils.interpolate(state.scrollSpeedBoost, 0, 0.06);
      drawFrame();
    };

    mm.add(
      {
        normalMotion: '(prefers-reduced-motion: no-preference)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { reduceMotion } = context.conditions ?? {};
        state.reducedMotion = Boolean(reduceMotion);

        if (reduceMotion) {
          state.time = 2.4;
          drawFrame();
          return;
        }

        ScrollTrigger.create({
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          refreshPriority: -10,
          onUpdate: (self) => {
            state.scroll = self.progress;
            quickBoost(velocityToBoost(self.getVelocity()));
          },
        });

        gsap.ticker.add(tick);
        tickerActive = true;
      }
    );

    return () => {
      if (tickerActive) gsap.ticker.remove(tick);
      mm.revert();
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, []);

  if (webglUnavailable) {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 75% 25%, rgba(232,188,88,0.48), rgba(250,248,243,0) 70%), radial-gradient(ellipse 75% 65% at 18% 82%, rgba(212,163,56,0.42), rgba(250,248,243,0) 68%), linear-gradient(135deg, #FAF8F3 0%, #F5E8C3 48%, #FAF8F3 100%)',
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
