import { useEffect, useRef, useState } from "react";
import { Box, Text, Button, Flex } from "@chakra-ui/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Campaign {
  id: string;
  campaign_type: string;
  offerTitle?: string;
  packageTitle?: string;
  offerDescription?: string;
  packageDescription?: string;
  discount?: string;
  validUntil?: string;
  deadline?: string;
  festivalName?: string;
  flyerUrl?: string;
  title?: string;
}

interface ExperienceProps {
  setCurrentSection?: (section: string) => void;
}

// ── Stats shown during the pinned video section ──────────────────────────────
const STATS = [
  { value: "500+", label: "Stories Told" },
  { value: "12",   label: "Years of Craft" },
  { value: "40+",  label: "Countries Shot" },
  { value: "100%", label: "Client Love" },
];

// ── Services revealed after the video ────────────────────────────────────────
const SERVICES = [
  {
    num: "01",
    title: "Wedding Films",
    desc: "Cinematic full-day coverage that captures every whisper, tear, and dance.",
  },
  {
    num: "02",
    title: "Portrait Sessions",
    desc: "Intimate, editorial portraits that reveal the person behind the face.",
  },
  {
    num: "03",
    title: "Brand Visuals",
    desc: "High-concept imagery that positions your brand at the top of its field.",
  },
  {
    num: "04",
    title: "Bespoke Experiences",
    desc: "Destination shoots, multi-day productions, and legacy projects built from scratch.",
  },
];

export function Experience({ setCurrentSection }: ExperienceProps = {}) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const videoRef       = useRef<HTMLVideoElement>(null);
  const pinRef         = useRef<HTMLDivElement>(null);
  const overlayRef     = useRef<HTMLDivElement>(null);
  const heroTextRef    = useRef<HTMLDivElement>(null);
  const statsRef       = useRef<HTMLDivElement>(null);
  const progressRef    = useRef<HTMLDivElement>(null);
  const servicesRef    = useRef<HTMLDivElement>(null);
  const ctaRef         = useRef<HTMLDivElement>(null);
  const labelRef       = useRef<HTMLDivElement>(null);

  const [videoReady, setVideoReady]   = useState(false);
  const [campaigns, setCampaigns]     = useState<Campaign[]>([]);

  // ── Fetch active campaigns ────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/campaigns/active`)
      .then(r => r.json())
      .then(({ campaigns }) => setCampaigns(campaigns || []))
      .catch(() => {});
  }, []);

  // ── GSAP ScrollTrigger setup ──────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Wait for metadata so duration is known
    const onMeta = () => setVideoReady(true);
    video.addEventListener("loadedmetadata", onMeta);
    return () => video.removeEventListener("loadedmetadata", onMeta);
  }, []);

  useEffect(() => {
    if (!videoReady) return;

    const video    = videoRef.current!;
    const pin      = pinRef.current!;
    const overlay  = overlayRef.current!;
    const heroText = heroTextRef.current!;
    const stats    = statsRef.current!;
    const progress = progressRef.current!;
    const label    = labelRef.current!;

    const ctx = gsap.context(() => {

      // ── 1. PIN the video section for 300vh of scroll ──────────────────────
      ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: "+=300%",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      });

      // ── 2. Scrub video playback through the pinned scroll ─────────────────
      const scrubProxy = { t: 0 };
      gsap.to(scrubProxy, {
        t: video.duration,
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: "+=300%",
          scrub: 1.2,
          onUpdate: self => {
            video.currentTime = self.progress * video.duration;
            // Update progress bar
            if (progress) progress.style.width = `${self.progress * 100}%`;
          },
        },
      });

      // ── 3. Hero text — fade + slide up on enter, fade out mid-scroll ──────
      gsap.fromTo(
        heroText.querySelectorAll(".hero-line"),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: pin,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.to(heroText, {
        opacity: 0,
        y: -40,
        ease: "power2.in",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: "+=80%",
          scrub: true,
        },
      });

      // ── 4. Overlay darkens as scroll progresses then lightens ─────────────
      gsap.fromTo(
        overlay,
        { opacity: 0.55 },
        {
          opacity: 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: "+=150%",
            scrub: true,
          },
        }
      );

      // ── 5. Stats — stagger in at 50% scroll progress ──────────────────────
      gsap.fromTo(
        stats.querySelectorAll(".stat-item"),
        { y: 50, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.12,
          duration: 0.8,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: pin,
            start: "+=100%",
            end: "+=150%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // ── 6. HUD label pulses in ────────────────────────────────────────────
      gsap.fromTo(
        label,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: pin,
            start: "+=50%",
            toggleActions: "play none none reverse",
          },
        }
      );

    }, containerRef);

    // ── 7. Services section — each card slides in from alternating sides ────
    const serviceCards = servicesRef.current?.querySelectorAll(".service-card");
    if (serviceCards) {
      serviceCards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { x: i % 2 === 0 ? -80 : 80, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }

    // ── 8. CTA section — scale up from below ─────────────────────────────
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    return () => ctx.revert();
  }, [videoReady]);

  return (
    <Box ref={containerRef} bg="#050505" color="white" minH="100vh">

      {/* ═══════════════════════════════════════════════════════════════════
          PINNED VIDEO SCROLL-TRIGGER SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <Box
        ref={pinRef}
        position="relative"
        w="full"
        h="100vh"
        overflow="hidden"
        style={{ willChange: "transform" }}
      >
        {/* ── Video ── */}
        <video
          ref={videoRef}
          src="/videos/experience.mp4"
          muted
          playsInline
          preload="auto"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* ── Dark overlay ── */}
        <Box
          ref={overlayRef}
          position="absolute"
          inset={0}
          style={{ background: "rgba(0,0,0,0.55)", zIndex: 1 }}
        />

        {/* ── Scan line ── */}
        <div
          className="scan-line"
          style={{ zIndex: 2, position: "absolute", left: 0, right: 0 }}
        />

        {/* ── HUD top label ── */}
        <Box
          ref={labelRef}
          position="absolute"
          top={8}
          left={8}
          zIndex={10}
          style={{ opacity: 0 }}
        >
          <Flex align="center" gap={3}>
            <Box
              w={2}
              h={2}
              borderRadius="full"
              bg="green.400"
              className="hud-pulse"
            />
            <Text
              fontSize="xs"
              fontWeight={700}
              letterSpacing="0.35em"
              color="green.400"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              GRAMTIME.VISUALS // EXPERIENCE.REEL
            </Text>
          </Flex>
        </Box>

        {/* ── Hero text ── */}
        <Box
          ref={heroTextRef}
          position="absolute"
          inset={0}
          zIndex={10}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          px={{ base: 6, md: 16 }}
          textAlign="center"
        >
          <Text
            className="hero-line"
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.4em"
            color="green.400"
            mb={4}
            style={{ fontFamily: "Inter, sans-serif", opacity: 0 }}
          >
            ◈ THE GRAMTIME VISUALS EXPERIENCE
          </Text>

          <Box overflow="hidden" mb={3}>
            <Text
              className="hero-line"
              fontSize={{ base: "5xl", md: "8xl", lg: "9xl" }}
              fontWeight={900}
              letterSpacing="-0.03em"
              lineHeight={0.9}
              color="white"
              textTransform="uppercase"
              style={{ opacity: 0 }}
            >
              EVERY
            </Text>
          </Box>
          <Box overflow="hidden" mb={6}>
            <Text
              className="hero-line"
              fontSize={{ base: "5xl", md: "8xl", lg: "9xl" }}
              fontWeight={900}
              letterSpacing="-0.03em"
              lineHeight={0.9}
              textTransform="uppercase"
              style={{
                WebkitTextStroke: "2px #4ade80",
                color: "transparent",
                opacity: 0,
              }}
            >
              MOMENT
            </Text>
          </Box>

          <Text
            className="hero-line"
            fontSize={{ base: "sm", md: "lg" }}
            fontWeight={300}
            color="whiteAlpha.700"
            maxW="2xl"
            lineHeight={1.8}
            style={{ opacity: 0 }}
          >
            Scroll to experience the story — a cinematic journey through
            artistry, elegance, and timeless memory-making.
          </Text>

          <Box
            className="hero-line"
            mt={8}
            style={{ opacity: 0 }}
          >
            <Flex align="center" gap={3} justify="center">
              <Box
                h="1px"
                w={12}
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(74,222,128,0.6))",
                }}
              />
              <Text
                fontSize="xs"
                fontWeight={700}
                letterSpacing="0.3em"
                color="whiteAlpha.500"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                SCROLL TO EXPLORE
              </Text>
              <Box
                h="1px"
                w={12}
                style={{
                  background:
                    "linear-gradient(90deg, rgba(74,222,128,0.6), transparent)",
                }}
              />
            </Flex>
          </Box>
        </Box>

        {/* ── Stats overlay (appears mid-scroll) ── */}
        <Box
          ref={statsRef}
          position="absolute"
          bottom={16}
          left={0}
          right={0}
          zIndex={10}
          px={{ base: 6, md: 16 }}
        >
          <Flex
            justify="center"
            gap={{ base: 8, md: 16 }}
            flexWrap="wrap"
          >
            {STATS.map(s => (
              <Box
                key={s.value}
                className="stat-item"
                textAlign="center"
                style={{ opacity: 0 }}
              >
                <Text
                  fontSize={{ base: "3xl", md: "5xl" }}
                  fontWeight={900}
                  color="green.400"
                  letterSpacing="-0.03em"
                  lineHeight={1}
                >
                  {s.value}
                </Text>
                <Text
                  fontSize="xs"
                  fontWeight={700}
                  letterSpacing="0.2em"
                  color="whiteAlpha.600"
                  mt={1}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {s.label.toUpperCase()}
                </Text>
              </Box>
            ))}
          </Flex>
        </Box>

        {/* ── Scroll progress bar ── */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="2px"
          bg="whiteAlpha.100"
          zIndex={20}
        >
          <Box
            ref={progressRef}
            h="full"
            style={{
              width: "0%",
              background:
                "linear-gradient(90deg, #4ade80, rgba(74,222,128,0.4))",
              transition: "width 0.05s linear",
              boxShadow: "0 0 8px rgba(74,222,128,0.6)",
            }}
          />
        </Box>

        {/* ── Corner HUD decorations ── */}
        <div className="corner-tl" style={{ opacity: 1, zIndex: 10 }} />
        <div className="corner-tr" style={{ opacity: 1, zIndex: 10 }} />
        <div className="corner-bl" style={{ opacity: 1, zIndex: 10 }} />
        <div className="corner-br" style={{ opacity: 1, zIndex: 10 }} />
      </Box>

      {/* ═══════════════════════════════════════════════════════════════════
          SERVICES SECTION — cards animate in on scroll
      ═══════════════════════════════════════════════════════════════════ */}
      <Box
        ref={servicesRef}
        py={28}
        px={{ base: 6, md: 16 }}
        maxW="7xl"
        mx="auto"
      >
        {/* Section header */}
        <Flex align="center" gap={4} mb={16}>
          <Box
            h="1px"
            w={8}
            style={{ background: "rgba(74,222,128,0.5)" }}
          />
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.4em"
            color="green.400"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            WHAT WE DO
          </Text>
          <Box
            h="1px"
            flex={1}
            style={{
              background:
                "linear-gradient(90deg, rgba(74,222,128,0.4), transparent)",
            }}
          />
        </Flex>

        <Box
          display="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1px",
            border: "1px solid rgba(74,222,128,0.15)",
          }}
        >
          {SERVICES.map((s, i) => (
            <Box
              key={s.num}
              className="service-card"
              p={10}
              position="relative"
              style={{
                background:
                  i % 2 === 0
                    ? "rgba(74,222,128,0.03)"
                    : "rgba(0,0,0,0.4)",
                borderRight: "1px solid rgba(74,222,128,0.1)",
                opacity: 0,
                cursor: "default",
                transition: "background 0.3s",
              }}
              _hover={{
                style: { background: "rgba(74,222,128,0.07)" },
              }}
            >
              <Text
                fontSize="xs"
                fontWeight={700}
                letterSpacing="0.3em"
                color="green.400"
                mb={4}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {s.num}
              </Text>
              <Text
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight={800}
                color="white"
                letterSpacing="-0.02em"
                lineHeight={1.1}
                mb={4}
              >
                {s.title}
              </Text>
              <Text
                fontSize="sm"
                color="whiteAlpha.600"
                lineHeight={1.8}
                fontWeight={300}
              >
                {s.desc}
              </Text>

              {/* Bottom accent line */}
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                h="1px"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(74,222,128,0.4), transparent)",
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════════
          ACTIVE CAMPAIGNS
      ═══════════════════════════════════════════════════════════════════ */}
      {campaigns.length > 0 && (
        <Box
          py={16}
          px={{ base: 6, md: 16 }}
          style={{ borderTop: "1px solid rgba(74,222,128,0.1)" }}
        >
          <Box maxW="7xl" mx="auto">
            <Flex align="center" gap={3} mb={10}>
              <Box w={2} h={2} borderRadius="full" bg="green.400" className="hud-pulse" />
              <Text fontSize="xs" fontWeight={700} letterSpacing="0.4em" color="green.400"
                style={{ fontFamily: "Inter, sans-serif" }}>
                CURRENT OFFERS
              </Text>
            </Flex>

            {/* Flyer scroll strip */}
            {campaigns.some(c => c.campaign_type === 'flyer') && (
              <Box
                overflow="hidden"
                style={{ borderTop: "1px solid rgba(74,222,128,0.15)", borderBottom: "1px solid rgba(74,222,128,0.15)", padding: "12px 0", marginBottom: 24 }}
              >
                <style>{`
                  @keyframes flyerScroll {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                  }
                  .flyer-track {
                    display: flex;
                    width: max-content;
                    animation: flyerScroll 30s linear infinite;
                    gap: 16px;
                  }
                  .flyer-track:hover { animation-play-state: paused; }
                `}</style>
                <div className="flyer-track">
                  {[...campaigns.filter(c => c.campaign_type === 'flyer'), ...campaigns.filter(c => c.campaign_type === 'flyer')].map((c, i) => (
                    <img
                      key={`${c.id}-${i}`}
                      src={c.flyerUrl}
                      alt={c.title || 'Campaign flyer'}
                      style={{ height: 180, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(74,222,128,0.2)' }}
                    />
                  ))}
                </div>
              </Box>
            )}

            {/* Text-based campaigns */}
            {campaigns.filter(c => c.campaign_type !== 'flyer').length > 0 && (
              <Box
                display="grid"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}
              >
                {campaigns.filter(c => c.campaign_type !== 'flyer').map(c => (
                  <Box
                    key={c.id} p={7}
                    style={{
                      background: "rgba(74,222,128,0.04)",
                      border: "1px solid rgba(74,222,128,0.2)",
                      borderRadius: "12px",
                    }}
                  >
                    {c.discount && (
                      <Text fontSize="3xl" fontWeight={900} color="green.400" mb={2}>
                        {c.discount} OFF
                      </Text>
                    )}
                    <Text fontSize="lg" fontWeight={700} color="white" mb={2}>
                      {c.offerTitle || c.packageTitle || c.festivalName || "Special Offer"}
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.600" lineHeight={1.7} mb={4}>
                      {c.offerDescription || c.packageDescription || ""}
                    </Text>
                    {(c.validUntil || c.deadline) && (
                      <Text fontSize="xs" color="green.400" fontWeight={600} mb={4}
                        style={{ fontFamily: "Inter, sans-serif" }}>
                        VALID UNTIL: {c.validUntil || c.deadline}
                      </Text>
                    )}
                    <Button size="sm" bg="green.500" color="black" fontWeight={700}
                      _hover={{ bg: "green.400" }}
                      onClick={() => setCurrentSection?.("consultation")}>
                      BOOK NOW →
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <Box
        ref={ctaRef}
        py={28}
        px={{ base: 6, md: 16 }}
        textAlign="center"
        style={{
          borderTop: "1px solid rgba(74,222,128,0.1)",
          opacity: 0,
        }}
      >
        <Text
          fontSize="xs"
          fontWeight={700}
          letterSpacing="0.4em"
          color="green.400"
          mb={6}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          ◈ READY TO BEGIN
        </Text>

        <Text
          fontSize={{ base: "4xl", md: "7xl" }}
          fontWeight={900}
          letterSpacing="-0.03em"
          lineHeight={0.9}
          color="white"
          textTransform="uppercase"
          mb={4}
        >
          LET'S CREATE
        </Text>
        <Text
          fontSize={{ base: "4xl", md: "7xl" }}
          fontWeight={900}
          letterSpacing="-0.03em"
          lineHeight={0.9}
          textTransform="uppercase"
          mb={10}
          style={{
            WebkitTextStroke: "2px #4ade80",
            color: "transparent",
          }}
        >
          SOMETHING TIMELESS
        </Text>

        <Text
          fontSize={{ base: "sm", md: "lg" }}
          color="whiteAlpha.600"
          maxW="xl"
          mx="auto"
          lineHeight={1.8}
          mb={10}
        >
          Every great story starts with a single conversation. Reserve your
          consultation and let's build something extraordinary together.
        </Text>

        <Flex justify="center" gap={4} flexWrap="wrap">
          <Button
            onClick={() => setCurrentSection?.("consultation")}
            bg="green.500"
            color="black"
            fontWeight={800}
            fontSize="sm"
            letterSpacing="0.1em"
            px={10}
            py={7}
            borderRadius="none"
            _hover={{
              bg: "green.400",
              transform: "translateY(-3px)",
              boxShadow: "0 12px 40px rgba(74,222,128,0.3)",
            }}
            transition="all 0.25s"
          >
            RESERVE YOUR CONSULTATION →
          </Button>
          <Button
            onClick={() => setCurrentSection?.("portfolio")}
            variant="outline"
            borderColor="whiteAlpha.300"
            color="white"
            fontWeight={600}
            fontSize="sm"
            letterSpacing="0.1em"
            px={10}
            py={7}
            borderRadius="none"
            _hover={{
              borderColor: "green.400",
              color: "green.400",
              transform: "translateY(-3px)",
            }}
            transition="all 0.25s"
          >
            VIEW PORTFOLIO
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
