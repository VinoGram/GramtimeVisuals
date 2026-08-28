import { useEffect, useRef } from "react";

// ── INTRO IMAGES ── drop your files into /public/intro/ with these exact names
const IMGS = {
  sky:    '/intro/sky.jpg',
  four:   '/intro/four.png',
  bazaar: '/intro/bazaar.png',
  splitL: '/intro/split-l.png',
  splitR: '/intro/split-r.png',
  bridge: '/intro/bridge.png',
  frame2: '/intro/frame2.png',
};

// ── VIDEO SLOT ── replace VIDEO_SRC with your reel path e.g. '/videos/gramtime-reel.mp4'
const VIDEO_SRC = '';

export function IntroScreen() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number>(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const root = wrap.style;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    // ── CSS vars initial state ──
    const vars: Record<string, string> = {
      '--blur-tint': '74,181,224',
      '--back-opacity': '1', '--back-x': '0px', '--back-y': '0px', '--back-scale': '0.76',
      '--four-y': '10vh', '--four-scale': '0.78', '--bazaar-y': '20vh',
      '--blur-px': '0px', '--back-brightness': '1',
      '--bazaar-blur-px': '0px', '--bazaar-brightness': '1', '--bazaar-saturation': '1',
      '--shade-opacity': '1', '--shade-z': '2',
      '--shade-top-alpha': '0', '--shade-mid-alpha': '0', '--shade-bottom-alpha': '0',
      '--title-y': '0px', '--title-scale': '1', '--title-opacity': '1',
      '--bridge-x': '-50%', '--bridge-y': '0px', '--bridge-bottom': '5vh',
      '--bridge-width': '67.2vw', '--bridge-scale': '1.02',
      '--split-left-x': '-50%', '--split-left-y': '0px', '--split-left-scale': '1',
      '--split-right-x': '-50%', '--split-right-y': '0px', '--split-right-scale': '1',
      '--frame2-opacity': '0', '--frame2-x': '-50%', '--frame2-y': '-50%', '--frame2-scale': '1.06',
      '--intro-copy-y': '0px', '--intro-copy-opacity': '1',
    };
    Object.entries(vars).forEach(([k, v]) => root.setProperty(k, v));

    // ── helpers ──
    const clamp = (v: number, mn = 0, mx = 1) => Math.min(mx, Math.max(mn, v));
    const ss = (e0: number, e1: number, v: number) => { const x = clamp((v - e0) / (e1 - e0)); return x * x * (3 - 2 * x); };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const seg = (s: number, a: number, b: number, c: number, d: number) => {
      const enter = ss(a, b, s), exit = ss(c, d, s);
      return { enter, exit, active: enter * (1 - exit) };
    };

    let mx = 0, my = 0, tmx = 0, tmy = 0;
    let smooth = 0, target = 0, rafPending = false;

    const section = wrap.querySelector('.gtv-scroll') as HTMLElement;
    const getScroll = () => clamp(window.scrollY, 0, section.offsetHeight - window.innerHeight);

    const set = (k: string, v: string) => root.setProperty(k, v);

    const update = () => {
      rafPending = false;
      target = getScroll();
      if (reduce.matches) { smooth = target; }
      else { smooth = lerp(smooth, target, 0.14); }
      if (Math.abs(smooth - target) < 0.08) smooth = target;

      if (!reduce.matches) {
        mx = lerp(mx, tmx, 0.12);
        my = lerp(my, tmy, 0.12);
      } else { mx = 0; my = 0; }

      const s = smooth;
      const progress = clamp(s / 2700);
      const f2 = seg(s, 560, 900, 1300, 1620);
      const f3 = seg(s, 1760, 2140, 2540, 2700);
      const introExit = ss(90, 650, s);
      const sightsRaw = ss(2760, 3560, s);
      const sightsEnter = Math.pow(sightsRaw, 1.55);
      const blurActive = clamp(f2.active + f3.active);
      const f2op = f2.active * (1 - f3.enter);
      const splitDrift = Math.pow(f2.enter, 1.5);
      const backScale = 0.76 + progress * 0.2 + f2.enter * 0.18 + f3.enter * 0.16;
      const heroY = progress * -74;
      const heroScale = progress * 0.23;

      set('--back-opacity',      String(1 - f2.active * 0.06));
      set('--back-x',            `${mx * -12}px`);
      set('--back-y',            `${my * -4}px`);
      set('--back-scale',        String(backScale));
      set('--four-y',            `${10 + progress * 10}vh`);
      set('--four-scale',        String(0.78 + progress * 0.16));
      set('--bazaar-y',          `${20 - progress * 8}vh`);
      set('--blur-px',           `${blurActive * 14}px`);
      set('--back-brightness',   String(1 - blurActive * 0.255));
      set('--bazaar-blur-px',    `${f2.active * 14}px`);
      set('--bazaar-brightness', String(1 - f2.active * 0.255 - f3.active * 0.06));
      set('--bazaar-saturation', String(1 + f3.active * 0.18));
      set('--shade-z',           f2.active > 0.02 ? '2' : '0');
      set('--shade-top-alpha',   String(blurActive * 0.465));
      set('--shade-mid-alpha',   String(blurActive * 0.42));
      set('--shade-bottom-alpha',String(blurActive * 0.51));
      set('--title-y',           `${introExit * -210}px`);
      set('--title-scale',       String(1 - introExit * 0.08));
      set('--title-opacity',     String(1 - introExit));
      set('--bridge-x',          `calc(-50% + ${mx * 18}px)`);
      set('--bridge-y',          `${my * 8 + heroY - f2.exit * 760}px`);
      set('--bridge-bottom',     `${5 - f2.enter * 13}vh`);
      set('--bridge-width',      `${67.2 + f2.enter * 37.8}vw`);
      set('--bridge-scale',      String(1.02 + heroScale + f2.exit * 0.46));
      set('--split-left-x',      `calc(-50% + ${-splitDrift * 46}vw + ${mx * 22}px)`);
      set('--split-left-y',      `${my * 10 + heroY - splitDrift * 180}px`);
      set('--split-left-scale',  String(1 + heroScale + f2.enter * 0.74));
      set('--split-right-x',     `calc(-50% + ${splitDrift * 46}vw + ${mx * 22}px)`);
      set('--split-right-y',     `${my * 10 + heroY - splitDrift * 180}px`);
      set('--split-right-scale', String(1 + heroScale + f2.enter * 0.74));
      set('--frame2-opacity',    String(f2op));
      set('--frame2-x',          `calc(-50% + ${mx * 10}px)`);
      set('--frame2-y',          `calc(-50% + ${my * 8 - f2.exit * 150}px)`);
      set('--frame2-scale',      String(1.06 + f2.enter * 0.08 + f2.exit * 0.08));
      set('--intro-copy-y',      `${introExit * 90}px`);
      set('--intro-copy-opacity',String(1 - introExit));



      const stillMoving = Math.abs(smooth - target) > 0.08
        || Math.abs(mx - tmx) > 0.001
        || Math.abs(my - tmy) > 0.001;
      if (stillMoving) tick();
    };

    const tick = () => { if (!rafPending) { rafPending = true; rafRef.current = requestAnimationFrame(update); } };

    const onScroll = () => tick();
    const onMove = (e: PointerEvent) => {
      tmx = e.clientX / window.innerWidth - 0.5;
      tmy = e.clientY / window.innerHeight - 0.5;
      tick();
    };
    const onResize = () => tick();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div ref={wrapRef} className="gtv-wrap">
      <style>{`
        @font-face {
          font-family: 'Ogg Medium';
          src: url('https://dcym8fthxf5uu.cloudfront.net/fonts/247a073c-29f5-4a89-aa3a-741020f346fc/OggText-Medium.woff2') format('woff2');
          font-weight: 500; font-style: normal; font-display: swap;
        }
        .gtv-wrap { position: relative; z-index: 9999; background: #0b1110; }
        .gtv-scroll { position: relative; height: calc(100vh + 3700px); }
        .gtv-stage {
          position: sticky; top: 0; height: 100vh; min-height: 620px;
          overflow: hidden; isolation: isolate; background: #7fb4d4;
        }
        .gtv-img {
          position: absolute; display: block;
          user-select: none; -webkit-user-drag: none;
          will-change: transform, opacity, filter; pointer-events: none;
        }
        .gtv-sky {
          inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;
          filter: blur(var(--blur-px)) brightness(var(--back-brightness));
        }
        .gtv-back-stack {
          position: absolute; top: 0; bottom: 0; left: -3vw; right: -3vw; z-index: 1;
          opacity: var(--back-opacity);
          transform: translate3d(var(--back-x), var(--back-y), 0) scale(var(--back-scale));
          transform-origin: 50% 100%; will-change: transform, filter, opacity;
        }
        .gtv-back-img {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
          filter: blur(var(--blur-px)) brightness(var(--back-brightness));
        }
        .gtv-back-bazaar, .gtv-back-four {
          top: auto; bottom: 0; left: 48%; right: auto; width: 112%; height: auto; object-fit: contain;
        }
        .gtv-back-bazaar {
          z-index: 3;
          filter: blur(var(--bazaar-blur-px)) brightness(var(--bazaar-brightness)) saturate(var(--bazaar-saturation));
          transform: translate3d(-50%, var(--bazaar-y), 0) scale(0.86);
        }
        .gtv-back-four {
          z-index: 1; opacity: 0.72; mix-blend-mode: screen;
          transform: translate3d(-50%, calc(var(--four-y) - 110px), 0) scale(var(--four-scale));
        }
        .gtv-bridge {
          z-index: 4; left: 50%; bottom: var(--bridge-bottom);
          width: min(var(--bridge-width), 2140px); height: auto;
          transform: translate3d(var(--bridge-x), var(--bridge-y), 0) scale(var(--bridge-scale));
          transform-origin: 50% 48%;
        }
        .gtv-split { z-index: 6; left: 50%; bottom: -2vh; width: min(118vw, 2240px); height: auto; }
        .gtv-split-left {
          transform: translate3d(var(--split-left-x), var(--split-left-y), 0) scale(var(--split-left-scale));
          transform-origin: 21% 52%;
        }
        .gtv-split-right {
          transform: translate3d(var(--split-right-x), var(--split-right-y), 0) scale(var(--split-right-scale));
          transform-origin: 79% 52%;
        }
        .gtv-frame2 {
          z-index: 5; left: 50%; top: 50%; width: min(122vw, 2160px); height: auto;
          opacity: var(--frame2-opacity);
          transform: translate3d(var(--frame2-x), var(--frame2-y), 0) scale(var(--frame2-scale));
          transform-origin: 50% 48%;
        }
        .gtv-shade {
          position: absolute; inset: 0; pointer-events: none;
          z-index: var(--shade-z); opacity: var(--shade-opacity);
          background: linear-gradient(180deg,
            rgba(var(--blur-tint), var(--shade-top-alpha)) 0%,
            rgba(var(--blur-tint), var(--shade-mid-alpha)) 48%,
            rgba(var(--blur-tint), var(--shade-bottom-alpha)) 100%);
        }
        .gtv-header {
          position: absolute; top: 0; left: 0; right: 0; z-index: 10;
          display: grid; grid-template-columns: minmax(200px,1fr) auto minmax(200px,1fr);
          align-items: center; gap: 32px; padding: 32px;
          color: rgba(253,241,225,0.86);
        }
        .gtv-logo {
          justify-self: start; font-family: 'Ogg Medium', 'Manrope', sans-serif;
          font-size: 20px; font-weight: 500; color: rgba(253,241,225,0.92);
          text-decoration: none; white-space: nowrap; letter-spacing: 0.04em;
        }
        .gtv-logo span { color: #4ade80; }
        .gtv-tagline {
          justify-self: center; font-size: 10px; font-weight: 700;
          letter-spacing: 0.35em; color: rgba(253,241,225,0.45); text-transform: uppercase;
        }
        .gtv-skip {
          justify-self: end; padding: 8px 20px; border-radius: 999px; border: 0;
          background: rgba(253,241,225,0.1); border: 1px solid rgba(253,241,225,0.2);
          color: rgba(253,241,225,0.7); font-size: 12px; font-weight: 600;
          letter-spacing: 0.1em; cursor: pointer; transition: background 0.2s;
        }
        .gtv-skip:hover { background: rgba(253,241,225,0.18); }
        .gtv-title {
          position: absolute; z-index: 3; left: 50%; top: clamp(122px, 19vh, 205px);
          width: min(94vw, 1780px); margin: 0;
          font-family: 'Ogg Medium', 'Manrope', sans-serif; font-size: 14rem; font-weight: 500;
          line-height: 0.78; text-align: center; color: #fdf1e1; text-shadow: none;
          transform: translate3d(-50%, var(--title-y), 0) scale(var(--title-scale));
          opacity: var(--title-opacity); will-change: transform, opacity;
        }
        .gtv-copy {
          position: absolute; z-index: 9; left: 50%; bottom: clamp(56px, 28vh, 400px);
          width: min(560px, calc(100vw - 40px)); text-align: center;
          transform: translate3d(-50%, var(--intro-copy-y), 0);
          opacity: var(--intro-copy-opacity); will-change: transform, opacity;
        }
        .gtv-copy p {
          margin: 0 auto; color: #fdf1e1; font-size: 1.1rem; font-weight: 500;
          line-height: 1.18; text-shadow: 0 2px 18px rgba(0,0,0,0.42);
          font-family: Manrope, sans-serif;
        }
        .gtv-tags {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 26px;
        }
        .gtv-tags span {
          min-height: 42px; display: inline-flex; align-items: center;
          padding: 0 25px; color: #111411; border-radius: 999px;
          background: #fdf1e1; font-size: 0.95rem; font-weight: 500;
          box-shadow: 0 12px 30px rgba(0,0,0,0.18);
          font-family: Manrope, sans-serif;
        }
        /* ── VIDEO SLOT ── */
        .gtv-video-slot {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
        }
        .gtv-video-slot video {
          width: 100%; height: 100%; object-fit: cover; opacity: 0.38;
        }
        .gtv-video-placeholder {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 600; letter-spacing: 0.25em;
          color: rgba(253,241,225,0.12); text-transform: uppercase;
          font-family: Manrope, sans-serif; pointer-events: none;
        }
        .gtv-scroll-hint {
          position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
          z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 8px;
          opacity: var(--intro-copy-opacity);
          color: rgba(253,241,225,0.45); font-size: 10px; font-weight: 600;
          letter-spacing: 0.3em; text-transform: uppercase;
          font-family: Manrope, sans-serif;
        }
        .gtv-scroll-line {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, rgba(253,241,225,0.4), transparent);
          animation: gtv-pulse 1.8s ease-in-out infinite;
        }
        @keyframes gtv-pulse {
          0%,100% { opacity: 0.3; transform: scaleY(0.6); }
          50% { opacity: 1; transform: scaleY(1); }
        }
        @media (max-width: 1100px) { .gtv-title { font-size: 7.5rem; top: 15vh; } }
        @media (max-width: 640px) {
          .gtv-header { grid-template-columns: 1fr auto; gap: 18px; padding: 24px; }
          .gtv-tagline { display: none; }
          .gtv-title { font-size: 4.5rem; top: 16vh; }
          .gtv-copy { bottom: 42px; }
          .gtv-copy p { font-size: 1rem; }
          .gtv-tags span { min-height: 38px; padding: 0 16px; font-size: 0.88rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gtv-img, .gtv-back-stack, .gtv-title, .gtv-copy { transition: none !important; }
        }
      `}</style>

      <div className="gtv-scroll">
        <div className="gtv-stage">

          {/* ── VIDEO SLOT ── add src to VIDEO_SRC constant above when ready */}
          <div className="gtv-video-slot">
            {VIDEO_SRC
              ? <video src={VIDEO_SRC} autoPlay muted loop playsInline />
              : <div className="gtv-video-placeholder">Video reel — add src to VIDEO_SRC</div>
            }
          </div>

          {/* Sky */}
          <img className="gtv-img gtv-sky" src={IMGS.sky} alt="" />

          {/* Header */}
          <header className="gtv-header">
            <span className="gtv-logo">GRAMTIME <span>VISUALS</span></span>
            <span className="gtv-tagline">Photography &amp; Cinematography · Accra, Ghana</span>
            <button className="gtv-skip" onClick={() => { const s = wrapRef.current?.querySelector('.gtv-scroll') as HTMLElement | null; window.scrollTo({ top: s ? s.offsetTop + s.offsetHeight : 3700, behavior: 'smooth' }); }}>SKIP INTRO</button>
          </header>

          {/* Back stack */}
          <div className="gtv-back-stack">
            <img className="gtv-img gtv-back-img gtv-back-four"   src={IMGS.four}   alt="" />
            <img className="gtv-img gtv-back-img gtv-back-bazaar" src={IMGS.bazaar} alt="" />
          </div>

          {/* Hero title */}
          <h1 className="gtv-title">GRAMTIME</h1>

          {/* Split frames */}
          <img className="gtv-img gtv-split gtv-split-left"  src={IMGS.splitL} alt="" />
          <img className="gtv-img gtv-split gtv-split-right" src={IMGS.splitR} alt="" />

          {/* Bridge */}
          <img className="gtv-img gtv-bridge" src={IMGS.bridge} alt="" />

          {/* Frame 2 */}
          <img className="gtv-img gtv-frame2" src={IMGS.frame2} alt="" />

          {/* Shade */}
          <div className="gtv-shade" />

          {/* Intro copy */}
          <div className="gtv-copy">
            <p>Cinematic photography &amp; videography — capturing your most extraordinary moments.</p>
            <div className="gtv-tags">
              <span>Weddings</span>
              <span>Portraits</span>
              <span>Accra, Ghana</span>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="gtv-scroll-hint">
            <div className="gtv-scroll-line" />
            <span>Scroll</span>
          </div>

        </div>
      </div>
    </div>
  );
}
