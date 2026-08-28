import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { Hands, Results, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function isPinching(lm: any[]) { return dist(lm[4], lm[8]) < 0.065; }

// tip landmarks: index=8, middle=10, ring=14, pinky=18; base knuckles: 6,10,14,18
function countFingers(lm: any[]): number {
  // thumb: tip x vs base x (mirrored)
  const tips = [8, 12, 16, 20];
  const bases = [6, 10, 14, 18];
  let count = 0;
  for (let i = 0; i < 4; i++) {
    if (lm[tips[i]].y < lm[bases[i]].y) count++;
  }
  return count;
}

interface CardState {
  id: string; url: string; title: string; category: string; location: string;
  x: number; y: number; rot: number; z: number; vx: number; vy: number;
}

function HUDCorners() {
  return (
    <>
      <div className="corner-tl" /><div className="corner-tr" />
      <div className="corner-bl" /><div className="corner-br" />
    </>
  );
}

// ── Gesture label SVG icons ──────────────────────────────────────────────────
function IconPinch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
      <path d="M9 6.5v5l-2 4h10l-2-4v-5"/>
      <path d="M9 10h6"/>
    </svg>
  );
}
function IconSwipe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 12h14M15 8l4 4-4 4"/>
    </svg>
  );
}
function IconPalm() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8 4v8M11 3v9M14 4v8M17 6v6M6 14c0 3 2 5 6 5s6-2 6-5v-2H6v2z"/>
    </svg>
  );
}

export function CameraTrackingGallery() {
  const [cards, setCards] = useState<CardState[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [gesture, setGesture] = useState("AWAITING INPUT");
  const [lightbox, setLightbox] = useState<CardState | null>(null);
  const [handDetected, setHandDetected] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const dragging = useRef<{ id: string; offX: number; offY: number } | null>(null);
  const lastPinchPos = useRef<{ x: number; y: number } | null>(null);
  const prevPinchPos = useRef<{ x: number; y: number } | null>(null);
  const zCounter = useRef(10);
  const mouseDragging = useRef<{ id: string; offX: number; offY: number } | null>(null);
  const gestureDebounce = useRef(false);
  const scatterRef = useRef<() => void>(() => {});
  const stackRef = useRef<() => void>(() => {});

  useEffect(() => {
    fetch(`${API}/portfolio`)
      .then(r => r.json())
      .then(({ images }) => {
        const imgs: any[] = images || [];
        setCards(imgs.map((img, i) => ({
          id: img.id, url: img.url, title: img.title || "",
          category: img.category || "", location: img.location || "",
          x: 80 + (i % 4) * 230 + Math.random() * 30,
          y: 80 + Math.floor(i / 4) * 270 + Math.random() * 30,
          rot: (Math.random() - 0.5) * 14,
          z: i + 1, vx: 0, vy: 0,
        })));
      })
      .catch(() => setCards([]));
  }, []);

  // physics
  useEffect(() => {
    let raf: number;
    const tick = () => {
      setCards(prev => prev.map(c => {
        if (dragging.current?.id === c.id) return c;
        if (Math.abs(c.vx) < 0.1 && Math.abs(c.vy) < 0.1) return c;
        return { ...c, x: c.x + c.vx, y: c.y + c.vy, vx: c.vx * 0.88, vy: c.vy * 0.88 };
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const bringToFront = useCallback((id: string) => {
    zCounter.current += 1;
    const z = zCounter.current;
    setCards(prev => prev.map(c => c.id === id ? { ...c, z } : c));
    return z;
  }, []);

  // mouse drag
  const onMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    bringToFront(id);
    const stage = stageRef.current!.getBoundingClientRect();
    const card = cards.find(c => c.id === id)!;
    mouseDragging.current = { id, offX: e.clientX - stage.left - card.x, offY: e.clientY - stage.top - card.y };
  }, [cards, bringToFront]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!mouseDragging.current || !stageRef.current) return;
      const stage = stageRef.current.getBoundingClientRect();
      const { id, offX, offY } = mouseDragging.current;
      setCards(prev => prev.map(c => c.id === id
        ? { ...c, x: e.clientX - stage.left - offX, y: e.clientY - stage.top - offY, vx: 0, vy: 0 } : c));
    };
    const onUp = () => { mouseDragging.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  // touch drag
  const onTouchStart = useCallback((e: React.TouchEvent, id: string) => {
    bringToFront(id);
    const stage = stageRef.current!.getBoundingClientRect();
    const card = cards.find(c => c.id === id)!;
    const t = e.touches[0];
    mouseDragging.current = { id, offX: t.clientX - stage.left - card.x, offY: t.clientY - stage.top - card.y };
  }, [cards, bringToFront]);

  useEffect(() => {
    const onMove = (e: TouchEvent) => {
      if (!mouseDragging.current || !stageRef.current) return;
      const stage = stageRef.current.getBoundingClientRect();
      const { id, offX, offY } = mouseDragging.current;
      const t = e.touches[0];
      setCards(prev => prev.map(c => c.id === id
        ? { ...c, x: t.clientX - stage.left - offX, y: t.clientY - stage.top - offY, vx: 0, vy: 0 } : c));
    };
    const onEnd = () => { mouseDragging.current = null; };
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => { window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
  }, []);

  const onResults = useCallback((results: Results) => {
    const lm = results.multiHandLandmarks?.[0] ?? null;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (lm) {
          ctx.strokeStyle = "rgba(74,222,128,0.65)";
          ctx.lineWidth = 1.5;
          for (const [a, b] of HAND_CONNECTIONS) {
            ctx.beginPath();
            ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
            ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
            ctx.stroke();
          }
          for (const pt of lm) {
            ctx.beginPath();
            ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 3, 0, Math.PI * 2);
            ctx.fillStyle = "#4ade80";
            ctx.fill();
          }
        }
      }
    }
    if (!lm) {
      setHandDetected(false);
      dragging.current = null;
      lastPinchPos.current = null;
      prevPinchPos.current = null;
      setGesture("NO HAND DETECTED");
      return;
    }
    setHandDetected(true);
    const stage = stageRef.current;
    if (!stage) return;
    const sr = stage.getBoundingClientRect();
    const fingerX = (1 - lm[8].x) * sr.width;
    const fingerY = lm[8].y * sr.height;
    const pinching = isPinching(lm);
    const fingers = countFingers(lm);

    // 2 fingers = scatter, 3 fingers = stack (debounced via ref)
    if (!pinching && fingers === 2) {
      setGesture("2 FINGERS — SCATTER");
      if (!gestureDebounce.current) {
        gestureDebounce.current = true;
        scatterRef.current();
        setTimeout(() => { gestureDebounce.current = false; }, 1200);
      }
      return;
    }
    if (!pinching && fingers === 3) {
      setGesture("3 FINGERS — STACK");
      if (!gestureDebounce.current) {
        gestureDebounce.current = true;
        stackRef.current();
        setTimeout(() => { gestureDebounce.current = false; }, 1200);
      }
      return;
    }

    if (pinching) {
      setGesture("PINCH — GRAB & MOVE");
      const cur = { x: fingerX, y: fingerY };
      if (!dragging.current) {
        const hit = [...cards].sort((a, b) => b.z - a.z).find(c => {
          const W = 160, H = 210;
          return fingerX >= c.x && fingerX <= c.x + W && fingerY >= c.y && fingerY <= c.y + H;
        });
        if (hit) {
          bringToFront(hit.id);
          dragging.current = { id: hit.id, offX: fingerX - hit.x, offY: fingerY - hit.y };
        }
        lastPinchPos.current = cur;
        prevPinchPos.current = cur;
      } else {
        const { id, offX, offY } = dragging.current;
        const vx = prevPinchPos.current ? cur.x - prevPinchPos.current.x : 0;
        const vy = prevPinchPos.current ? cur.y - prevPinchPos.current.y : 0;
        prevPinchPos.current = lastPinchPos.current;
        lastPinchPos.current = cur;
        setCards(prev => prev.map(c => c.id === id
          ? { ...c, x: fingerX - offX, y: fingerY - offY, vx, vy } : c));
      }
    } else {
      if (dragging.current) {
        const id = dragging.current.id;
        const vx = lastPinchPos.current && prevPinchPos.current
          ? (lastPinchPos.current.x - prevPinchPos.current.x) * 0.6 : 0;
        const vy = lastPinchPos.current && prevPinchPos.current
          ? (lastPinchPos.current.y - prevPinchPos.current.y) * 0.6 : 0;
        setCards(prev => prev.map(c => c.id === id ? { ...c, vx, vy } : c));
      }
      dragging.current = null;
      lastPinchPos.current = null;
      prevPinchPos.current = null;
      setGesture("OPEN — HOVER TO BROWSE");
    }
  }, [cards, bringToFront]);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    setStatus("loading");
    try {
      const hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
      hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.6 });
      hands.onResults(onResults);
      handsRef.current = hands;
      const cam = new Camera(videoRef.current, {
        onFrame: async () => { if (videoRef.current) await hands.send({ image: videoRef.current }); },
        width: 320, height: 240,
      });
      await cam.start();
      cameraRef.current = cam;
      setCameraOn(true);
      setStatus("ready");
      setGesture("HAND GESTURE ACTIVE");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, [onResults]);

  const stopCamera = useCallback(() => {
    cameraRef.current?.stop();
    handsRef.current?.close();
    cameraRef.current = null;
    handsRef.current = null;
    setCameraOn(false);
    setHandDetected(false);
    setGesture("AWAITING INPUT");
    setStatus("idle");
  }, []);

  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  const scatter = () => setCards(prev => prev.map(c => ({
    ...c,
    x: 60 + Math.random() * (window.innerWidth - 280),
    y: 60 + Math.random() * (window.innerHeight - 320),
    rot: (Math.random() - 0.5) * 22,
    vx: (Math.random() - 0.5) * 10,
    vy: (Math.random() - 0.5) * 10,
  })));

  const stack = () => setCards(prev => prev.map((c, i) => ({
    ...c,
    x: window.innerWidth / 2 - 80 + i * 2,
    y: window.innerHeight / 2 - 105 + i * 2,
    rot: (Math.random() - 0.5) * 5,
    vx: 0, vy: 0,
  })));

  useEffect(() => { scatterRef.current = scatter; }, [cards]);
  useEffect(() => { stackRef.current = stack; }, [cards]);

  return (
    <Box style={{ background: "#050505", minHeight: "100vh", overflow: "hidden" }} color="white">

      {/* ── Top HUD bar ── */}
      <Flex position="fixed" top={0} left={0} right={0} zIndex={1000}
        align="center" justify="space-between" px={6} h="52px"
        style={{ background: "rgba(5,5,5,0.92)", borderBottom: "1px solid rgba(74,222,128,0.12)", backdropFilter: "blur(12px)" }}>

        {/* Left: brand + status */}
        <Flex align="center" gap={4}>
          <Flex align="center" gap={2}>
            <Box w="6px" h="6px" borderRadius="full"
              style={{ background: cameraOn && handDetected ? "#4ade80" : cameraOn ? "#facc15" : "#374151",
                boxShadow: cameraOn && handDetected ? "0 0 8px #4ade80" : "none",
                transition: "all 0.3s" }} />
            <Text fontSize="10px" fontWeight="700" letterSpacing="0.35em"
              style={{ color: "#4ade80", fontFamily: "monospace" }}>HAND GESTURE CONTROL</Text>
          </Flex>
          <Box w="1px" h="20px" style={{ background: "rgba(74,222,128,0.15)" }} />
          <Text fontSize="10px" letterSpacing="0.2em"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
            {cards.length} OBJECTS
          </Text>
        </Flex>

        {/* Center: gesture readout */}
        <Flex align="center" gap={3}
          px={4} py={1}
          style={{ border: "1px solid rgba(74,222,128,0.15)", background: "rgba(74,222,128,0.04)" }}>
          <Box w="5px" h="5px" borderRadius="full"
            style={{ background: cameraOn ? "#4ade80" : "#374151",
              animation: cameraOn ? "pulse 2s infinite" : "none" }} />
          <Text fontSize="10px" fontWeight="700" letterSpacing="0.25em"
            style={{ color: cameraOn ? "#4ade80" : "rgba(255,255,255,0.2)", fontFamily: "monospace", minWidth: 220, textAlign: "center" }}>
            {gesture}
          </Text>
        </Flex>

        {/* Right: controls */}
        <Flex align="center" gap={2}>
          <Text fontSize="8px" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Inter', sans-serif" }}>
            2 FINGERS = SCATTER &nbsp;|&nbsp; 3 FINGERS = STACK &nbsp;|&nbsp; PINCH = GRAB &nbsp;|&nbsp; DBL-CLICK = FULLSCREEN
          </Text>
          <Box w="1px" h="20px" style={{ background: "rgba(74,222,128,0.15)" }} />
          <Box as="button" px={4} py={1} fontSize="9px" fontWeight="700" letterSpacing="0.2em"
            onClick={cameraOn ? stopCamera : startCamera}
            disabled={status === "loading"}
            style={{ fontFamily: "monospace",
              background: cameraOn ? "rgba(239,68,68,0.08)" : "rgba(74,222,128,0.08)",
              border: `1px solid ${cameraOn ? "rgba(239,68,68,0.4)" : "rgba(74,222,128,0.4)"}`,
              color: cameraOn ? "#ef4444" : "#4ade80",
              cursor: status === "loading" ? "wait" : "pointer",
              transition: "all 0.2s" }}>
            {status === "loading" ? "LOADING" : cameraOn ? "STOP" : "START CAMERA"}
          </Box>
          {status === "error" && (
            <Text fontSize="8px" style={{ color: "#ef4444", fontFamily: "monospace" }}>ACCESS DENIED</Text>
          )}
        </Flex>
      </Flex>

      {/* hidden camera + canvas — MediaPipe still needs the video element */}
      <Box style={{ display: "none" }}>
        <video ref={videoRef} autoPlay muted playsInline />
        <canvas ref={canvasRef} width={320} height={240} />
      </Box>

      {/* ── Stage ── */}
      <Box ref={stageRef} position="fixed" inset={0} pt="52px" style={{ cursor: "default" }}>
        {cards.length === 0 && (
          <Flex align="center" justify="center" h="100%">
            <Box textAlign="center">
              <Text fontSize="10px" fontWeight="700" letterSpacing="0.4em" mb={2}
                style={{ color: "rgba(74,222,128,0.2)", fontFamily: "monospace" }}>NO IMAGES FOUND</Text>
              <Text fontSize="10px" style={{ color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>
                UPLOAD IMAGES FROM THE ADMIN PANEL
              </Text>
            </Box>
          </Flex>
        )}

        {cards.map(card => (
          <Box key={card.id} position="absolute"
            style={{ left: card.x, top: card.y, width: 160, zIndex: card.z,
              transform: `rotate(${card.rot}deg)`,
              cursor: "grab", userSelect: "none", willChange: "transform" }}
            onMouseDown={e => onMouseDown(e, card.id)}
            onTouchStart={e => onTouchStart(e, card.id)}
            onDoubleClick={() => setLightbox(card)}>

            <Box borderRadius="4px" overflow="hidden"
              style={{ border: "1px solid rgba(74,222,128,0.18)", background: "#0a0a0a",
                boxShadow: `0 ${6 + card.z * 0.3}px ${20 + card.z}px rgba(0,0,0,0.75), 0 0 0 1px rgba(74,222,128,0.06)` }}>

              <Box position="relative" style={{ aspectRatio: "3/4" }}>
                <Image src={card.url} alt={card.title} w="full" h="full" objectFit="cover" display="block" draggable={false} />
                <div className="scan-line" />
                <HUDCorners />
                {card.category && (
                  <Box position="absolute" top={2} right={2} px={1} py={0.5}
                    style={{ background: "rgba(5,5,5,0.75)", border: "1px solid rgba(74,222,128,0.3)", backdropFilter: "blur(4px)" }}>
                    <Text fontSize="7px" fontWeight="700" letterSpacing="0.15em"
                      style={{ color: "#4ade80", fontFamily: "monospace" }}>
                      {card.category.toUpperCase()}
                    </Text>
                  </Box>
                )}
              </Box>

              <Box px={2} py={2} style={{ background: "#0c0c0c", borderTop: "1px solid rgba(74,222,128,0.08)" }}>
                <Text fontSize="9px" fontWeight="700" color="white" noOfLines={1}
                  style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>
                  {card.title || "UNTITLED"}
                </Text>
                {card.location && (
                  <Text fontSize="7px" mt={0.5}
                    style={{ color: "rgba(74,222,128,0.45)", fontFamily: "monospace" }}>
                    {card.location.toUpperCase()}
                  </Text>
                )}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Lightbox ── */}
      {lightbox && (
        <Box position="fixed" inset={0} zIndex={2000}
          display="flex" alignItems="center" justifyContent="center"
          style={{ background: "rgba(0,0,0,0.97)", backdropFilter: "blur(24px)" }}
          onClick={() => setLightbox(null)}>

          <Box position="absolute" inset={0} pointerEvents="none">
            <div className="corner-tl" style={{ top: 16, left: 16, width: 24, height: 24, opacity: 1 }} />
            <div className="corner-tr" style={{ top: 16, right: 16, width: 24, height: 24, opacity: 1 }} />
            <div className="corner-bl" style={{ bottom: 16, left: 16, width: 24, height: 24, opacity: 1 }} />
            <div className="corner-br" style={{ bottom: 16, right: 16, width: 24, height: 24, opacity: 1 }} />
            <Flex position="absolute" top={4} left="50%" transform="translateX(-50%)" align="center" gap={3}>
              <Box w="5px" h="5px" borderRadius="full" bg="green.400" className="hud-pulse" />
              <Text fontSize="9px" fontWeight="700" letterSpacing="0.35em"
                style={{ color: "#4ade80", fontFamily: "monospace" }}>GRAMTIME VISUALS</Text>
            </Flex>
          </Box>

          <Box as="button" position="absolute" top={6} right={6}
            w={9} h={9} display="flex" alignItems="center" justifyContent="center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "18px", borderRadius: 2 }}
            onClick={() => setLightbox(null)}>x</Box>

          <Box position="relative" maxW="85vw" maxH="85vh"
            style={{ border: "1px solid rgba(74,222,128,0.2)", boxShadow: "0 0 80px rgba(74,222,128,0.08)" }}
            onClick={e => e.stopPropagation()}>
            <Image src={lightbox.url} alt={lightbox.title} maxH="80vh" objectFit="contain" />
            <div className="scan-line" />
            <HUDCorners />
          </Box>

          <Box position="absolute" bottom={8} left="50%" transform="translateX(-50%)" textAlign="center">
            <Text fontSize="lg" fontWeight="700" color="white" letterSpacing="0.05em" mb={1}>{lightbox.title}</Text>
            <Flex align="center" justify="center" gap={3}>
              {lightbox.category && (
                <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em"
                  style={{ color: "#4ade80", fontFamily: "monospace" }}>{lightbox.category.toUpperCase()}</Text>
              )}
              {lightbox.location && (
                <>
                  <Box w="1px" h="10px" style={{ background: "rgba(74,222,128,0.3)" }} />
                  <Text fontSize="9px" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                    {lightbox.location.toUpperCase()}
                  </Text>
                </>
              )}
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
}
