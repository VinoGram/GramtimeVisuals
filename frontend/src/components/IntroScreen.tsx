import { useEffect, useState } from "react";
import { Box, Text } from "@chakra-ui/react";

interface IntroScreenProps {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase]     = useState<"idle" | "flashing" | "drawing" | "exit">("idle");
  const [flashOn, setFlashOn] = useState(false);
  const [drawTop, setDrawTop] = useState(false);   // triggers GRAMTIME stroke
  const [drawBot, setDrawBot] = useState(false);   // triggers VISUALS stroke
  const [fillTop, setFillTop] = useState(false);   // fills GRAMTIME white
  const [fillBot, setFillBot] = useState(false);   // fills VISUALS green

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];
    const FLASH_ON  = 100;
    const FLASH_OFF = 100;

    // ── 3 camera flashes ──────────────────────────────────────────────────
    t.push(setTimeout(() => setFlashOn(true),  0));
    t.push(setTimeout(() => setFlashOn(false), FLASH_ON));
    t.push(setTimeout(() => setFlashOn(true),  FLASH_ON + FLASH_OFF));
    t.push(setTimeout(() => setFlashOn(false), FLASH_ON * 2 + FLASH_OFF));
    t.push(setTimeout(() => setFlashOn(true),  FLASH_ON * 2 + FLASH_OFF * 2));
    t.push(setTimeout(() => setFlashOn(false), FLASH_ON * 3 + FLASH_OFF * 2));

    const A = FLASH_ON * 3 + FLASH_OFF * 2 + 120; // after flashes

    // ── Drawing sequence ──────────────────────────────────────────────────
    t.push(setTimeout(() => { setPhase("drawing"); setDrawTop(true); }, A));
    // GRAMTIME draws over 1.6s → fill it
    t.push(setTimeout(() => setFillTop(true), A + 1400));
    // VISUALS starts drawing 1.2s after GRAMTIME
    t.push(setTimeout(() => setDrawBot(true), A + 1200));
    // VISUALS draws over 1.6s → fill it
    t.push(setTimeout(() => setFillBot(true), A + 2600));

    // ── Exit ──────────────────────────────────────────────────────────────
    t.push(setTimeout(() => setPhase("exit"),  A + 4000));
    t.push(setTimeout(() => onComplete(),      A + 4800));

    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  // Stroke dash values
  const DASH = 3000;

  const strokeStyle = (draw: boolean, delay = 0): React.CSSProperties => ({
    strokeDasharray: DASH,
    strokeDashoffset: draw ? 0 : DASH,
    transition: draw ? `stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1) ${delay}ms` : "none",
  });

  const fillStyle = (filled: boolean, delay = 0): React.CSSProperties => ({
    opacity: filled ? 1 : 0,
    transition: filled ? `opacity 0.6s ease ${delay}ms` : "none",
  });

  const commonText = {
    fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
    fontWeight: 900,
    fontSize: 108,
    letterSpacing: 6,
  } as const;

  return (
    <Box
      position="fixed" inset={0} zIndex={9999} bg="black"
      display="flex" alignItems="center" justifyContent="center" overflow="hidden"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transition: phase === "exit" ? "opacity 0.8s ease-in" : "none",
      }}
    >
      {/* ── Studio flash ─────────────────────────────────────────────────── */}
      <Box
        position="absolute" inset={0} pointerEvents="none"
        style={{
          opacity: flashOn ? 1 : 0,
          transition: flashOn ? "opacity 0.03s ease-in" : "opacity 0.08s ease-out",
          background: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 25%, rgba(220,240,255,0.4) 55%, transparent 75%)",
        }}
      />
      <Box
        position="absolute" top="38%" left={0} right={0} h="2px" pointerEvents="none"
        style={{
          opacity: flashOn ? 0.6 : 0,
          transition: flashOn ? "opacity 0.03s" : "opacity 0.1s",
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 30%, white 50%, rgba(255,255,255,0.9) 70%, transparent 100%)",
        }}
      />

      {/* ── Self-drawing SVG ─────────────────────────────────────────────── */}
      <Box
        position="relative" zIndex={10} textAlign="center" w="full" px={4}
        style={{
          opacity: phase === "drawing" || phase === "exit" ? 1 : 0,
          transition: "opacity 0.2s ease-out",
        }}
      >
        <svg
          viewBox="0 0 900 230"
          width="100%"
          style={{ maxWidth: 860, display: "block", margin: "0 auto", overflow: "visible" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── GRAMTIME ── */}

          {/* 1. Filled layer (fades in after stroke draws) */}
          <text x="450" y="108" textAnchor="middle" {...commonText}
            fill="#ffffff" stroke="none"
            style={fillStyle(fillTop)}>
            GRAMTIME
          </text>

          {/* 2. Stroke layer (self-draws) */}
          <text x="450" y="108" textAnchor="middle" {...commonText}
            fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={strokeStyle(drawTop)}>
            GRAMTIME
          </text>

          {/* ── VISUALS ── */}

          {/* 1. Filled layer */}
          <text x="450" y="208" textAnchor="middle" {...commonText}
            fill="#4ade80" stroke="none"
            style={fillStyle(fillBot)}>
            VISUALS
          </text>

          {/* 2. Stroke layer */}
          <text x="450" y="208" textAnchor="middle" {...commonText}
            fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={strokeStyle(drawBot)}>
            VISUALS
          </text>

          {/* Thin underline that draws under VISUALS */}
          <line
            x1="200" y1="220" x2="700" y2="220"
            stroke="#4ade80" strokeWidth="1.5"
            style={{
              strokeDasharray: 500,
              strokeDashoffset: drawBot ? 0 : 500,
              transition: drawBot ? "stroke-dashoffset 0.8s ease 1.2s" : "none",
              opacity: 0.5,
            }}
          />
        </svg>

        {/* Tagline */}
        <Text
          mt={3}
          fontSize={{ base: "9px", md: "11px" }}
          fontWeight="400"
          letterSpacing="0.55em"
          textTransform="uppercase"
          style={{
            color: "rgba(255,255,255,0.45)",
            opacity: fillBot ? 1 : 0,
            transition: fillBot ? "opacity 0.8s ease 0.3s" : "none",
          }}
        >
          Photography &amp; Cinematography
        </Text>
      </Box>

      {/* Vignette */}
      <Box
        position="absolute" inset={0} pointerEvents="none"
        background="radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.8) 100%)"
      />
    </Box>
  );
}
