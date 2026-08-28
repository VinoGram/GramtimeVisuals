import { Box, Grid, GridItem, Text, Image } from "@chakra-ui/react";
import { AboutCanvas } from "./AboutCanvas";

interface AboutProps {
  fullPage?: boolean;
}

export function About({ fullPage = false }: AboutProps) {
  return (
    <Box
      minH={fullPage ? "100vh" : "auto"}
      pt={fullPage ? 24 : 0}
      pb={0}
      bg="#000000"
      overflow="hidden"
      position="relative"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Manrope:wght@300;400;500;600;700;800&display=swap');

        .tm-grain::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }

        .tm-stamp {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          line-height: 0.88;
          letter-spacing: -0.02em;
        }

        .tm-tag {
          display: inline-block;
          border: 2px solid;
          padding: 3px 10px;
          font-size: 0.65rem;
          font-weight: 900;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }

        .tm-rule {
          width: 100%;
          height: 3px;
          background: repeating-linear-gradient(
            90deg,
            #22c55e 0px, #22c55e 18px,
            transparent 18px, transparent 24px
          );
        }

        .tm-photo-frame {
          position: relative;
        }
        .tm-photo-frame::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, transparent 60%, rgba(34,197,94,0.18) 100%);
          pointer-events: none;
        }

        .tm-sticker {
          position: absolute;
          background: #22c55e;
          color: #000000;
          font-weight: 900;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 6px 12px;
          transform: rotate(-3deg);
          z-index: 10;
        }

        .tm-award-row {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 14px 0;
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .tm-award-row:last-child {
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .tm-quote-block {
          border-left: 6px solid #22c55e;
          padding-left: 24px;
          position: relative;
        }
        .tm-quote-block::before {
          content: '"';
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-size: 8rem;
          color: rgba(34,197,94,0.08);
          position: absolute;
          top: -30px;
          left: -10px;
          line-height: 1;
          pointer-events: none;
        }

        .tm-counter {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-size: 3.5rem;
          line-height: 1;
          color: #22c55e;
        }
      `}</style>

      {/* ── BACKGROUND TEXTURE LAYER ── */}
      <Box
        className="tm-grain"
        position="absolute"
        inset={0}
        zIndex={0}
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 60%, #071a0e 0%, #000000 65%)",
        }}
      />
      {/* ── THREE.JS RIBBON LAYER ── */}
      <Box position="absolute" inset={0} zIndex={1}>
        <AboutCanvas />
      </Box>

      {/* ── OVERSIZED BG TEXT ── */}
      <Box
        position="absolute"
        top="-40px"
        left="-20px"
        className="tm-stamp"
        fontSize="22vw"
        color="rgba(255,255,255,0.02)"
        userSelect="none"
        pointerEvents="none"
        zIndex={0}
        whiteSpace="nowrap"
      >
        GRAMTIME
      </Box>

      <Box maxW="1400px" mx="auto" px={{ base: 5, lg: 12 }} position="relative" zIndex={2}>

        {/* ── TOP LABEL BAR ── */}
        <Box
          borderBottom="1px solid rgba(255,255,255,0.1)"
          py={4}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={3}
        >
          <span className="tm-tag" style={{ borderColor: "#22c55e", color: "#22c55e" }}>
            Est. 2015
          </span>
          <span className="tm-tag" style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.4)" }}>
            Nigeria · Ghana · Worldwide
          </span>
          <span className="tm-tag" style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.4)" }}>
            Visual Storytelling
          </span>
        </Box>

        {/* ── HERO HEADLINE ── */}
        <Box pt={10} pb={6}>
          <Text
            className="tm-stamp"
            fontSize={{ base: "15vw", md: "10vw", lg: "8vw" }}
            color="white"
            mb={0}
          >
            PROMISE
          </Text>
          <Box display="flex" alignItems="baseline" gap={4} flexWrap="wrap">
            <Text
              className="tm-stamp"
              fontSize={{ base: "15vw", md: "10vw", lg: "8vw" }}
              color="#22c55e"
              fontStyle="italic"
            >
              ALBERT
            </Text>
            <Text
              fontSize={{ base: "sm", md: "md" }}
              color="rgba(255,255,255,0.35)"
              fontWeight="300"
              letterSpacing="0.3em"
              textTransform="uppercase"
              alignSelf="center"
            >
              Vinogram
            </Text>
          </Box>
          <div className="tm-rule" style={{ marginTop: "16px" }} />
        </Box>

        {/* ── MAIN GRID ── */}
        <Grid
          templateColumns={{ base: "1fr", lg: "5fr 7fr" }}
          gap={{ base: 10, lg: 16 }}
          pb={16}
        >
          {/* LEFT — PHOTO COLUMN */}
          <GridItem>
            <Box position="relative">
              <div className="tm-sticker" style={{ top: "20px", right: "-10px" }}>
                10+ Years
              </div>

              <Box className="tm-photo-frame" position="relative">
                <Image
                  src="/api/placeholder/600/750"
                  alt="Promise Albert"
                  w="full"
                  display="block"
                  style={{ filter: "contrast(1.08) saturate(0.9)" }}
                />
                <Box
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  p={5}
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                  }}
                >
                  <Text
                    className="tm-stamp"
                    fontSize="2xl"
                    color="white"
                    letterSpacing="0.05em"
                  >
                    THE PHOTOGRAPHER
                  </Text>
                </Box>
              </Box>

              {/* Stats row below photo */}
              <Grid templateColumns="1fr 1fr 1fr" mt={1} borderTop="3px solid #22c55e">
                {[["500+", "Events"], ["10+", "Years"], ["2", "Countries"]].map(([num, label]) => (
                  <Box
                    key={label}
                    p={4}
                    borderRight="1px solid rgba(255,255,255,0.08)"
                    _last={{ borderRight: "none" }}
                    bg="rgba(255,255,255,0.03)"
                  >
                    <div className="tm-counter">{num}</div>
                    <Text fontSize="0.65rem" fontWeight="700" letterSpacing="0.2em" color="rgba(255,255,255,0.4)" textTransform="uppercase">
                      {label}
                    </Text>
                  </Box>
                ))}
              </Grid>
            </Box>
          </GridItem>

          {/* RIGHT — CONTENT COLUMN */}
          <GridItem>
            <Box display="flex" flexDirection="column" gap={10}>

              {/* Bio paragraphs */}
              <Box>
                <span className="tm-tag" style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.4)", marginBottom: "16px", display: "inline-block" }}>
                  The Story
                </span>
                <Box display="flex" flexDirection="column" gap={5}>
                  {[
                    "With over a decade of experience capturing life's most precious moments, I have dedicated my career to creating timeless imagery that transcends trends and speaks to the soul.",
                    "My approach combines classical techniques with contemporary vision, resulting in photographs that are both artistically compelling and deeply personal. Each session is a collaborative journey where your story becomes the foundation for something truly extraordinary.",
                    "Based between Nigeria and Ghana, I work with a select number of clients annually — ensuring every experience receives the full weight of my attention and artistry.",
                  ].map((para, i) => (
                    <Text
                      key={i}
                      color="rgba(255,255,255,0.6)"
                      fontWeight="300"
                      lineHeight="1.85"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      {para}
                    </Text>
                  ))}
                </Box>
              </Box>

              {/* Quote */}
              <Box className="tm-quote-block">
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="300"
                  fontStyle="italic"
                  color="white"
                  lineHeight="1.6"
                  mb={4}
                >
                  Photography is not just about capturing what you see — it's about revealing what you feel. Every image should tell a story that resonates for generations.
                </Text>
                <Text fontSize="xs" fontWeight="700" letterSpacing="0.25em" color="#22c55e" textTransform="uppercase">
                  — Promise Albert (Vinogram)
                </Text>
              </Box>

              {/* Awards */}
              <Box>
                <span className="tm-tag" style={{ borderColor: "#22c55e", color: "#22c55e", marginBottom: "12px", display: "inline-block" }}>
                  Recognition
                </span>
                <Box>
                  {[
                    ["01", "International Photography Awards", "Wedding Photographer of the Year"],
                    ["02", "Featured In", "Vogue · Harper's Bazaar · Town & Country"],
                    ["03", "Master Craftsman", "Professional Photographers of Ghana"],
                    ["04", "Certified", "International Association of Photography & Digital Arts"],
                  ].map(([num, title, sub]) => (
                    <div className="tm-award-row" key={num}>
                      <Text
                        className="tm-stamp"
                        fontSize="xl"
                        color="rgba(34,197,94,0.3)"
                        flexShrink={0}
                        w="36px"
                      >
                        {num}
                      </Text>
                      <Box>
                        <Text fontSize="sm" fontWeight="700" color="white" letterSpacing="0.05em">
                          {title}
                        </Text>
                        <Text fontSize="xs" color="rgba(255,255,255,0.4)" fontWeight="300" mt={0.5}>
                          {sub}
                        </Text>
                      </Box>
                    </div>
                  ))}
                </Box>
              </Box>

            </Box>
          </GridItem>
        </Grid>

        {/* ── VIDEO BANNER ── */}
      </Box>

      <Box position="relative" w="full" overflow="hidden" style={{ height: "70vh" }}>
        {/* ▼ DROP YOUR VIDEO SRC HERE ▼ */}
        <video
          autoPlay
          muted
          loop
          playsInline
          src=""  // ← replace with your video path e.g. "/videos/showreel.mp4"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.45) saturate(0.8)",
          }}
        />

        {/* gradient top fade */}
        <Box
          position="absolute" top={0} left={0} right={0} h="160px"
          style={{ background: "linear-gradient(to bottom, #000000 0%, transparent 100%)" }}
          zIndex={1}
        />
        {/* gradient bottom fade */}
        <Box
          position="absolute" bottom={0} left={0} right={0} h="160px"
          style={{ background: "linear-gradient(to top, #000000 0%, transparent 100%)" }}
          zIndex={1}
        />
        {/* green tint overlay */}
        <Box
          position="absolute" inset={0} zIndex={1}
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(34,197,94,0.07) 0%, transparent 70%)" }}
        />

        {/* centered text */}
        <Box
          position="absolute" inset={0} zIndex={2}
          display="flex" flexDirection="column"
          alignItems="center" justifyContent="center"
          textAlign="center" px={6}
        >
          <Text
            fontSize="0.65rem" fontWeight="900" letterSpacing="0.35em"
            color="#22c55e" textTransform="uppercase" mb={5}
          >
            Behind the Lens
          </Text>
          <Text
            className="tm-stamp"
            fontSize={{ base: "12vw", md: "7vw", lg: "5.5vw" }}
            color="white"
            lineHeight="0.9"
            mb={6}
          >
            THE WORK<br />
            <Text as="span" color="#22c55e">SPEAKS</Text>
          </Text>
          <Box w="48px" h="2px" bg="#22c55e" />
        </Box>
      </Box>

      <Box maxW="1400px" mx="auto" px={{ base: 5, lg: 12 }} position="relative" zIndex={2}>
        {/* ── BOTTOM MARQUEE STRIP ── */}
        <Box
          borderTop="3px solid rgba(255,255,255,0.06)"
          py={4}
          overflow="hidden"
          position="relative"
        >
          <style>{`
            @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
            .tm-marquee { display: flex; gap: 48px; animation: marquee 18s linear infinite; white-space: nowrap; }
          `}</style>
          <div className="tm-marquee">
            {Array(8).fill(null).map((_, i) => (
              <Text
                key={i}
                className="tm-stamp"
                fontSize="sm"
                color="rgba(255,255,255,0.12)"
                letterSpacing="0.3em"
                flexShrink={0}
              >
                GRAMTIME VISUALS · WEDDING · PORTRAIT · COMMERCIAL · EVENT ·
              </Text>
            ))}
          </div>
        </Box>

      </Box>
    </Box>
  );
}
