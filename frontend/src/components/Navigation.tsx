import { useState, useEffect } from "react";
import { Box, Flex, Text, Grid, GridItem } from "@chakra-ui/react";

interface NavigationProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
  isScrolled: boolean;
}

const NAV_STYLES = `
  @keyframes menuReveal {
    from { opacity: 0; transform: translateY(-12px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)     scale(1); }
  }
  @keyframes itemSlide {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes logoGlow {
    0%, 100% { text-shadow: 0 0 0px rgba(74,222,128,0); }
    50%       { text-shadow: 0 0 20px rgba(74,222,128,0.4); }
  }
  @keyframes pillPop {
    0%   { transform: scale(0.8); opacity: 0; }
    70%  { transform: scale(1.05); }
    100% { transform: scale(1);   opacity: 1; }
  }

  .nav-logo {
    animation: logoGlow 4s ease-in-out infinite;
    transition: letter-spacing 0.3s ease, color 0.2s ease;
  }
  .nav-logo:hover {
    letter-spacing: 0.28em !important;
  }

  .menu-open .menu-panel {
    animation: menuReveal 0.25s cubic-bezier(0.22,1,0.36,1) forwards;
  }

  .nav-item {
    transition: all 0.2s ease;
    position: relative;
  }
  .nav-item::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 0;
    width: 0; height: 1.5px;
    background: #4ade80;
    transition: width 0.25s ease;
  }
  .nav-item:hover::after,
  .nav-item.active::after {
    width: 100%;
  }
  .nav-item:hover { color: #4ade80 !important; }
  .nav-item.active { color: #4ade80 !important; }

  .menu-item {
    animation: itemSlide 0.3s ease both;
  }

  .menu-item-inner {
    transition: all 0.2s ease;
    border-radius: 12px;
  }
  .menu-item-inner:hover {
    background: rgba(74,222,128,0.08);
    padding-left: 20px !important;
  }
  .menu-item-inner.active-item {
    background: rgba(74,222,128,0.12);
    border-left: 2px solid #4ade80;
  }

  .hamburger-line {
    transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
    transform-origin: center;
  }

  .cta-btn {
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }
  .cta-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #22c55e;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 0;
  }
  .cta-btn:hover::before { transform: translateX(0); }
  .cta-btn span { position: relative; z-index: 1; }

  .active-pill {
    animation: pillPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
  }
`;

const navItems = [
  { id: "home",            label: "Experience",       tag: "01" },
  { id: "portfolio",       label: "Portfolio",        tag: "02" },
  { id: "services",        label: "Packages",         tag: "03" },
  { id: "about",           label: "About",            tag: "04" },
  { id: "blog",            label: "Journal",          tag: "05" },
  { id: "shop",            label: "Shop",             tag: "06" },
  { id: "client-gallery",  label: "Client Gallery",   tag: "07" },
];

export function Navigation({ currentSection, setCurrentSection, isScrolled }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (isMenuOpen && !t.closest(".nav-container") && !t.closest(".menu-panel")) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const navigate = (id: string) => {
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setCurrentSection(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      <style>{NAV_STYLES}</style>

      {/* ── NAVBAR BAR ─────────────────────────────────────────────── */}
      <Box
        className="nav-container"
        position="fixed" top={0} left={0} right={0} zIndex={100}
        transition="all 0.4s ease"
        style={{
          background: isScrolled
            ? "rgba(10,10,10,0.92)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
          backdropFilter: isScrolled ? "blur(24px)" : "blur(8px)",
          borderBottom: isScrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
      >
        <Flex
          maxW="7xl" mx="auto"
          px={{ base: 5, lg: 8 }}
          h={{ base: "64px", md: "72px" }}
          align="center" justify="space-between"
        >
          {/* Logo */}
          <Box
            as="button"
            onClick={() => navigate("home")}
            className="nav-logo"
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="800"
            letterSpacing="0.22em"
            color="white"
            textTransform="uppercase"
            style={{ fontFamily: "'Arial Black', sans-serif", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            GRAMTIME{" "}
            <Box as="span" color="#4ade80">VISUALS</Box>
          </Box>

          {/* Desktop nav links — center */}
          <Flex
            display={{ base: "none", xl: "flex" }}
            align="center" gap={8}
          >
            {navItems.slice(0, 5).map((item) => (
              <Box
                key={item.id}
                as="button"
                onClick={() => navigate(item.id)}
                className={`nav-item${currentSection === item.id ? " active" : ""}`}
                fontSize="xs"
                fontWeight="600"
                letterSpacing="0.12em"
                color={currentSection === item.id ? "#4ade80" : "rgba(255,255,255,0.7)"}
                textTransform="uppercase"
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}
              >
                {item.label}
              </Box>
            ))}
          </Flex>

          {/* Right side */}
          <Flex align="center" gap={4}>
            {/* CTA button — desktop */}
            <Box
              as="a"
              href="http://localhost:5173"
              target="_blank"
              display={{ base: "none", md: "flex" }}
              className="cta-btn"
              px={5} py={2}
              fontSize="xs" fontWeight="700" letterSpacing="0.15em"
              color="black" bg="#4ade80"
              borderRadius="full"
              style={{ border: "none", cursor: "pointer", textDecoration: "none" }}
            >
              <Box as="span">BOOK NOW</Box>
            </Box>

            {/* Hamburger */}
            <Box
              as="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              w={10} h={10}
              display="flex" flexDirection="column"
              alignItems="center" justifyContent="center" gap="5px"
              borderRadius="xl"
              style={{
                background: isMenuOpen ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.06)",
                border: "1px solid",
                borderColor: isMenuOpen ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.1)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <Box
                className="hamburger-line" w="18px" h="1.5px" bg={isMenuOpen ? "#4ade80" : "white"}
                style={{ transform: isMenuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }}
              />
              <Box
                className="hamburger-line" w="18px" h="1.5px" bg={isMenuOpen ? "#4ade80" : "white"}
                style={{ opacity: isMenuOpen ? 0 : 1, transform: isMenuOpen ? "scaleX(0)" : "none" }}
              />
              <Box
                className="hamburger-line" w="18px" h="1.5px" bg={isMenuOpen ? "#4ade80" : "white"}
                style={{ transform: isMenuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }}
              />
            </Box>
          </Flex>
        </Flex>
      </Box>

      {/* ── FULL-SCREEN MENU OVERLAY ────────────────────────────────── */}
      <Box
        position="fixed" inset={0} zIndex={99}
        style={{
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          opacity: isMenuOpen ? 1 : 0,
          pointerEvents: isMenuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* ── MENU PANEL ──────────────────────────────────────────────── */}
      <Box
        className={`menu-panel${isMenuOpen ? " menu-open" : ""}`}
        position="fixed"
        top={0} right={0}
        w={{ base: "100%", sm: "420px" }}
        h="100vh"
        zIndex={100}
        style={{
          background: "rgba(10,10,10,0.97)",
          backdropFilter: "blur(40px)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          transform: isMenuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
          overflowY: "auto",
        }}
      >
        {/* Panel header */}
        <Flex
          px={8} h="72px" align="center" justify="space-between"
          borderBottom="1px solid" borderColor="rgba(255,255,255,0.06)"
        >
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em" color="gray.600">NAVIGATION</Text>
          <Box
            as="button"
            onClick={() => setIsMenuOpen(false)}
            w={9} h={9} borderRadius="lg"
            display="flex" alignItems="center" justifyContent="center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              color: "white",
              fontSize: "18px",
              transition: "all 0.2s",
            }}
          >
            ×
          </Box>
        </Flex>

        {/* Nav items — bento grid style */}
        <Box p={6}>
          <Grid templateColumns="1fr 1fr" gap={3} mb={6}>
            {navItems.slice(0, 6).map((item, i) => (
              <GridItem key={item.id} colSpan={i === 0 ? 2 : 1}>
                <Box
                  as="button"
                  onClick={() => navigate(item.id)}
                  className={`menu-item menu-item-inner${currentSection === item.id ? " active-item" : ""}`}
                  w="full"
                  p={i === 0 ? 5 : 4}
                  textAlign="left"
                  style={{
                    background: currentSection === item.id
                      ? "rgba(74,222,128,0.1)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${currentSection === item.id ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: "14px",
                    cursor: "pointer",
                    animationDelay: `${i * 0.04}s`,
                    paddingLeft: "16px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Text
                    fontSize="9px" fontWeight="700" letterSpacing="0.2em"
                    color={currentSection === item.id ? "#4ade80" : "rgba(255,255,255,0.25)"}
                    mb={1}
                  >
                    {item.tag}
                  </Text>
                  <Text
                    fontSize={i === 0 ? "xl" : "sm"}
                    fontWeight={i === 0 ? "800" : "600"}
                    letterSpacing="-0.01em"
                    color={currentSection === item.id || hovered === item.id ? "#4ade80" : "white"}
                    transition="color 0.2s"
                  >
                    {item.label}
                  </Text>
                </Box>
              </GridItem>
            ))}
          </Grid>

          {/* Inquire — full width CTA tile */}
          <Box
            as="button"
            onClick={() => navigate('client-gallery')}
            w="full" p={5}
            style={{
              background: "linear-gradient(135deg, #0f0f0f 0%, #0d2818 100%)",
              borderRadius: "14px",
              cursor: "pointer",
              border: "1px solid rgba(74,222,128,0.2)",
              marginBottom: "12px",
              display: "block",
            }}
          >
            <Flex align="center" justify="space-between">
              <Box textAlign="left">
                <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" color="rgba(74,222,128,0.5)" mb={1}>EXCLUSIVE</Text>
                <Text fontSize="xl" fontWeight="800" letterSpacing="-0.01em" color="white">Client Gallery</Text>
                <Text fontSize="xs" color="rgba(255,255,255,0.4)" fontWeight="500" mt={0.5}>View your private photos →</Text>
              </Box>
              <Box
                w={10} h={10} borderRadius="full"
                display="flex" alignItems="center" justifyContent="center"
                style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", fontSize: "18px" }}
              >
                →
              </Box>
            </Flex>
          </Box>

          {/* Book Now CTA */}
          <Box
            as="a"
            href="http://localhost:5173"
            target="_blank"
            w="full" p={5}
            style={{
              background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
              borderRadius: "14px",
              cursor: "pointer",
              border: "none",
              marginBottom: "24px",
              display: "block",
              textDecoration: "none",
            }}
          >
            <Flex align="center" justify="space-between">
              <Box textAlign="left">
                <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" color="rgba(0,0,0,0.5)" mb={1}>BOOK</Text>
                <Text fontSize="xl" fontWeight="800" letterSpacing="-0.01em" color="black">Book Now</Text>
                <Text fontSize="xs" color="rgba(0,0,0,0.6)" fontWeight="500" mt={0.5}>Start your journey →</Text>
              </Box>
              <Box
                w={10} h={10} borderRadius="full" bg="black"
                display="flex" alignItems="center" justifyContent="center"
                fontSize="lg" color="#4ade80"
              >
                →
              </Box>
            </Flex>
          </Box>

          {/* Bottom info */}
          <Box
            p={5} borderRadius="14px"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Flex justify="space-between" align="center" mb={3}>
              <Text fontSize="xs" fontWeight="700" letterSpacing="0.2em" color="gray.600">GRAMTIME VISUALS</Text>
              <Flex align="center" gap={2}>
                <Box w={1.5} h={1.5} borderRadius="full" bg="#4ade80" className="status-dot" />
                <Text fontSize="10px" color="gray.600" fontWeight="500">Available</Text>
              </Flex>
            </Flex>
            <Text fontSize="xs" color="gray.700" fontWeight="300" lineHeight="1.6">
              Photography & Cinematography<br />Accra, Ghana · Est. 2014
            </Text>
          </Box>
        </Box>
      </Box>
    </>
  );
}
