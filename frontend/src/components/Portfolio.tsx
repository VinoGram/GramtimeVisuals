import { useState, useRef, useEffect } from "react";
import { Box, Flex, Heading, Text, Button, Grid, Image } from "@chakra-ui/react";

const images = [
  { _id: "1", title: "Golden Hour Romance",  url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=750&fit=crop", location: "Tuscany, Italy",    category: "wedding",    id: "GTV-001" },
  { _id: "2", title: "Urban Elegance",        url: "https://images.unsplash.com/photo-1554048612-b6a482b224b8?w=600&h=750&fit=crop", location: "New York City",   category: "portrait",   id: "GTV-002" },
  { _id: "3", title: "Timeless Beauty",       url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=750&fit=crop", location: "Paris, France",  category: "fashion",    id: "GTV-003" },
  { _id: "4", title: "Sacred Vows",           url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=750&fit=crop", location: "Santorini, Greece", category: "wedding", id: "GTV-004" },
  { _id: "5", title: "Natural Light",         url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&h=750&fit=crop", location: "Accra, Ghana",   category: "portrait",   id: "GTV-005" },
  { _id: "6", title: "Editorial Vision",      url: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=750&fit=crop", location: "London, UK",     category: "fashion",    id: "GTV-006" },
];

const categories = ["all", "wedding", "portrait", "fashion", "engagement"];

function HUDCorners() {
  return (
    <>
      <div className="corner-tl" />
      <div className="corner-tr" />
      <div className="corner-bl" />
      <div className="corner-br" />
    </>
  );
}

function ARCard({ image, onClick }: { image: typeof images[0]; onClick: () => void }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => setMousePos({ x: 0, y: 0 });

  return (
    <Box
      ref={cardRef}
      className="ar-card"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      cursor="pointer"
      aspectRatio="4/5"
      border="1px solid"
      borderColor="rgba(74,222,128,0.2)"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
        transition: "transform 0.15s ease",
        background: "#0a0a0a",
      }}
    >
      {/* Image */}
      <Image
        src={image.url} alt={image.title}
        w="full" h="full" objectFit="cover"
        className="card-img"
        position="absolute" inset={0}
      />

      {/* Scanline */}
      <div className="scan-line" />

      {/* HUD corners */}
      <HUDCorners />

      {/* HUD overlay */}
      <Box className="hud-overlay" position="absolute" inset={0} zIndex={10}>
        {/* Top-left ID tag */}
        <Box position="absolute" top={4} left={4}>
          <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em"
            style={{ color: "#4ade80", fontFamily: "monospace" }}>
            ◈ {image.id}
          </Text>
        </Box>

        {/* Top-right category */}
        <Box position="absolute" top={4} right={4}
          px={2} py={0.5}
          style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.4)", backdropFilter: "blur(4px)" }}>
          <Text fontSize="9px" fontWeight="700" letterSpacing="0.15em"
            style={{ color: "#4ade80", fontFamily: "monospace" }}>
            {image.category.toUpperCase()}
          </Text>
        </Box>

        {/* Center reticle */}
        <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)">
          <svg width="40" height="40" viewBox="0 0 40 40" className="reticle" style={{ opacity: 0.6 }}>
            <circle cx="20" cy="20" r="18" fill="none" stroke="#4ade80" strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="20" cy="20" r="3" fill="none" stroke="#4ade80" strokeWidth="1" />
            <line x1="20" y1="2" x2="20" y2="10" stroke="#4ade80" strokeWidth="1" />
            <line x1="20" y1="30" x2="20" y2="38" stroke="#4ade80" strokeWidth="1" />
            <line x1="2" y1="20" x2="10" y2="20" stroke="#4ade80" strokeWidth="1" />
            <line x1="30" y1="20" x2="38" y2="20" stroke="#4ade80" strokeWidth="1" />
          </svg>
        </Box>

        {/* Horizontal scan bars */}
        <Box position="absolute" top="30%" left={0} right={0} h="1px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent)" }} />
        <Box position="absolute" top="70%" left={0} right={0} h="1px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent)" }} />
      </Box>

      {/* Meta panel slides up on hover */}
      <Box
        className="meta-panel"
        position="absolute" bottom={0} left={0} right={0}
        p={5} zIndex={20}
        style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.95))", backdropFilter: "blur(2px)" }}
      >
        {/* Data readout line */}
        <Flex align="center" gap={2} mb={2}>
          <Box w={1} h={1} borderRadius="full" bg="green.400" className="hud-pulse" />
          <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em"
            style={{ color: "rgba(74,222,128,0.7)", fontFamily: "monospace" }}>
            OBJECT IDENTIFIED
          </Text>
        </Flex>

        <Text fontSize="lg" fontWeight="700" color="white" letterSpacing="0.05em"
          className="glitch-title" mb={1}>
          {image.title}
        </Text>

        <Flex align="center" justify="space-between">
          <Text fontSize="xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
            📍 {image.location}
          </Text>
          <Box px={2} py={0.5}
            style={{ background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.5)" }}>
            <Text fontSize="9px" fontWeight="700" letterSpacing="0.1em"
              style={{ color: "#4ade80", fontFamily: "monospace" }}>
              VIEW →
            </Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

export function Portfolio({ fullPage = false }: { fullPage?: boolean }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<typeof images[0] | null>(null);
  const [glitchActive, setGlitchActive] = useState(false);

  const displayed = selectedCategory === "all"
    ? images
    : images.filter(img => img.category === selectedCategory);

  const handleCategoryChange = (cat: string) => {
    setGlitchActive(true);
    setTimeout(() => { setSelectedCategory(cat); setGlitchActive(false); }, 150);
  };

  return (
    <Box minH={fullPage ? "100vh" : "auto"} pt={fullPage ? 24 : 0} pb={16}
      style={{ background: "#050505" }} color="white">
      <Box maxW="7xl" mx="auto" px={{ base: 4, lg: 8 }}>

        {/* ── AR HUD HEADER ── */}
        <Box mb={14} pt={fullPage ? 0 : 8}>
          <Flex align="center" gap={3} mb={4}>
            <Box w={2} h={2} borderRadius="full" bg="green.400" className="hud-pulse" />
            <Text fontSize="xs" fontWeight="700" letterSpacing="0.4em"
              style={{ color: "#4ade80", fontFamily: "monospace" }}>
              GRAMTIME.VISUALS // PORTFOLIO.SCAN
            </Text>
          </Flex>

          <Box position="relative" display="inline-block">
            <Heading
              fontSize={{ base: "5xl", md: "8xl" }} fontWeight="900"
              letterSpacing="-0.03em" lineHeight="0.9" color="white"
              style={{ animation: glitchActive ? "glitchX 0.15s ease" : "none" }}
            >
              PORT
              <Box as="span" style={{ WebkitTextStroke: "2px #4ade80", color: "transparent" }}>
                FOLIO
              </Box>
            </Heading>
            {/* Glitch duplicate */}
            <Heading
              fontSize={{ base: "5xl", md: "8xl" }} fontWeight="900"
              letterSpacing="-0.03em" lineHeight="0.9"
              position="absolute" top={0} left={0}
              style={{
                color: "rgba(74,222,128,0.15)",
                transform: "translateX(3px)",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              PORTFOLIO
            </Heading>
          </Box>

          <Flex align="center" gap={6} mt={4}>
            <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
              [{displayed.length} OBJECTS DETECTED]
            </Text>
            <Box h="1px" flex={1} style={{ background: "linear-gradient(90deg, rgba(74,222,128,0.4), transparent)" }} />
          </Flex>
        </Box>

        {/* ── AR CATEGORY FILTER ── */}
        <Flex gap={3} mb={12} flexWrap="wrap">
          {categories.map((cat) => (
            <Box
              key={cat} as="button"
              onClick={() => handleCategoryChange(cat)}
              px={4} py={2} fontSize="xs" fontWeight="700" letterSpacing="0.2em"
              style={{
                fontFamily: "monospace",
                background: selectedCategory === cat ? "rgba(74,222,128,0.15)" : "transparent",
                border: `1px solid ${selectedCategory === cat ? "rgba(74,222,128,0.8)" : "rgba(255,255,255,0.1)"}`,
                color: selectedCategory === cat ? "#4ade80" : "rgba(255,255,255,0.4)",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: selectedCategory === cat ? "0 0 12px rgba(74,222,128,0.2)" : "none",
              }}
            >
              {cat === "all" ? "◈ ALL" : `◦ ${cat.toUpperCase()}`}
            </Box>
          ))}
        </Flex>

        {/* ── AR GRID ── */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
          gap={5}
          style={{ perspective: "1200px" }}
        >
          {displayed.map((img, i) => (
            <Box key={img._id} style={{ animationDelay: `${i * 0.05}s` }}>
              <ARCard image={img} onClick={() => setSelectedImage(img)} />
            </Box>
          ))}
        </Grid>

        {fullPage && (
          <Flex justify="center" mt={16}>
            <Box
              as="button" px={8} py={4} fontSize="xs" fontWeight="700" letterSpacing="0.2em"
              style={{
                fontFamily: "monospace",
                background: "transparent",
                border: "1px solid rgba(74,222,128,0.4)",
                color: "#4ade80",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(74,222,128,0.1)",
                transition: "all 0.3s",
              }}
            >
              ◈ LOAD MORE OBJECTS
            </Box>
          </Flex>
        )}
      </Box>

      {/* ── AR LIGHTBOX ── */}
      {selectedImage && (
        <Box
          position="fixed" inset={0} zIndex={200}
          display="flex" alignItems="center" justifyContent="center"
          style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)" }}
          onClick={() => setSelectedImage(null)}
        >
          {/* HUD frame */}
          <Box position="absolute" inset={0} pointerEvents="none">
            <div className="corner-tl" style={{ top: 16, left: 16, width: 24, height: 24, opacity: 1 }} />
            <div className="corner-tr" style={{ top: 16, right: 16, width: 24, height: 24, opacity: 1 }} />
            <div className="corner-bl" style={{ bottom: 16, left: 16, width: 24, height: 24, opacity: 1 }} />
            <div className="corner-br" style={{ bottom: 16, right: 16, width: 24, height: 24, opacity: 1 }} />
            <Box position="absolute" top={4} left="50%" transform="translateX(-50%)">
              <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em"
                style={{ color: "#4ade80", fontFamily: "monospace" }} className="hud-pulse">
                ◈ GRAMTIME VISUALS // VIEWING: {selectedImage.id}
              </Text>
            </Box>
          </Box>

          {/* Close */}
          <Box
            as="button" position="absolute" top={6} right={6}
            w={10} h={10} display="flex" alignItems="center" justifyContent="center"
            style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.4)", color: "#4ade80", cursor: "pointer", fontSize: "20px" }}
            onClick={() => setSelectedImage(null)}
          >
            ×
          </Box>

          {/* Image */}
          <Box
            position="relative" maxW="80vw" maxH="80vh"
            style={{ border: "1px solid rgba(74,222,128,0.3)", boxShadow: "0 0 60px rgba(74,222,128,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={selectedImage.url} alt={selectedImage.title} maxH="75vh" objectFit="contain" />
            <div className="scan-line" style={{ animation: "scanline 2s linear infinite" }} />
            <HUDCorners />
          </Box>

          {/* Bottom meta */}
          <Box position="absolute" bottom={8} left="50%" transform="translateX(-50%)" textAlign="center">
            <Text fontSize="lg" fontWeight="700" color="white" mb={1}>{selectedImage.title}</Text>
            <Text fontSize="xs" style={{ color: "rgba(74,222,128,0.7)", fontFamily: "monospace" }}>
              📍 {selectedImage.location} // {selectedImage.category.toUpperCase()}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
