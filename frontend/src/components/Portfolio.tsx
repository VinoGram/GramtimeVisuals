import { useState, useRef, useEffect } from "react";
import { Box, Flex, Heading, Text, Grid, Image } from "@chakra-ui/react";
import { CameraTrackingGallery } from "./CameraTrackingGallery";

// inject fly-in keyframes once
const STYLE_ID = "portfolio-flyin-style";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes cardFlyIn {
      0%   { opacity:0; transform: perspective(900px) rotateY(90deg) rotateX(30deg) translateZ(300px) scale(0.4); }
      60%  { opacity:1; transform: perspective(900px) rotateY(-8deg) rotateX(-4deg) translateZ(20px) scale(1.04); }
      80%  { transform: perspective(900px) rotateY(3deg) rotateX(2deg) translateZ(0px) scale(0.98); }
      100% { opacity:1; transform: perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1); }
    }
  `;
  document.head.appendChild(s);
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// ── Folder Card ──────────────────────────────────────────────────────────────
function FolderCard({ folder, onClick }: { folder: any; onClick: () => void }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setMousePos({ x, y });
  };

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
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      style={{
        transform: `perspective(800px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
        transition: "transform 0.15s ease",
        background: "#0a0a0a",
      }}
    >
      {folder.coverUrl ? (
        <Image src={folder.coverUrl} alt={folder.name} w="full" h="full" objectFit="cover"
          className="card-img" position="absolute" inset={0} />
      ) : (
        <Flex position="absolute" inset={0} align="center" justify="center"
          style={{ background: "linear-gradient(135deg, #0d1a0d, #0a0a0a)" }}>
          <Text fontSize="4xl" style={{ opacity: 0.15 }}>📁</Text>
        </Flex>
      )}

      <div className="scan-line" />
      <HUDCorners />

      {/* HUD overlay */}
      <Box className="hud-overlay" position="absolute" inset={0} zIndex={10}>
        <Box position="absolute" top={4} left={4}>
          <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em"
            style={{ color: "#4ade80", fontFamily: "Inter, sans-serif" }}>
            FOLDER
          </Text>
        </Box>
        <Box position="absolute" top={4} right={4}
          px={2} py={0.5}
          style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.4)", backdropFilter: "blur(4px)" }}>
          <Text fontSize="9px" fontWeight="700" letterSpacing="0.15em"
            style={{ color: "#4ade80", fontFamily: "Inter, sans-serif" }}>
            {folder.category?.toUpperCase()}
          </Text>
        </Box>
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
        <Box position="absolute" top="30%" left={0} right={0} h="1px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent)" }} />
        <Box position="absolute" top="70%" left={0} right={0} h="1px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent)" }} />
      </Box>

      {/* Meta panel */}
      <Box className="meta-panel" position="absolute" bottom={0} left={0} right={0}
        p={5} zIndex={20}
        style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.95))", backdropFilter: "blur(2px)" }}>
        <Flex align="center" gap={2} mb={2}>
          <Box w={1} h={1} borderRadius="full" bg="green.400" className="hud-pulse" />
          <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em"
            style={{ color: "rgba(74,222,128,0.7)", fontFamily: "Inter, sans-serif" }}>
            {folder.imageCount ?? 0} IMAGES
          </Text>
        </Flex>
        <Text fontSize="lg" fontWeight="700" color="white" letterSpacing="0.05em"
          className="glitch-title" mb={1}>
          {folder.name}
        </Text>
        {folder.description && (
          <Text fontSize="xs" mb={2}
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Manrope, sans-serif", lineHeight: 1.5,
              overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>
            {folder.description}
          </Text>
        )}
        <Flex align="center" justify="flex-end">
          <Box px={2} py={0.5}
            style={{ background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.5)" }}>
            <Text fontSize="9px" fontWeight="700" letterSpacing="0.1em"
              style={{ color: "#4ade80", fontFamily: "Inter, sans-serif" }}>
              OPEN →
            </Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

// ── Image Card ───────────────────────────────────────────────────────────────
function ARCard({ image, onClick }: { image: any; onClick: () => void }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setMousePos({ x, y });
  };

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
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      style={{
        transform: `perspective(800px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
        transition: "transform 0.15s ease",
        background: "#0a0a0a",
      }}
    >
      <Image src={image.url} alt={image.title} w="full" h="full" objectFit="cover"
        className="card-img" position="absolute" inset={0} />
      <div className="scan-line" />
      <HUDCorners />
      <Box className="hud-overlay" position="absolute" inset={0} zIndex={10}>
        <Box position="absolute" top={4} right={4} px={2} py={0.5}
          style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.4)", backdropFilter: "blur(4px)" }}>
          <Text fontSize="9px" fontWeight="700" letterSpacing="0.15em"
            style={{ color: "#4ade80", fontFamily: "Inter, sans-serif" }}>
            {image.category?.toUpperCase()}
          </Text>
        </Box>
        <Box position="absolute" top="30%" left={0} right={0} h="1px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent)" }} />
        <Box position="absolute" top="70%" left={0} right={0} h="1px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent)" }} />
      </Box>
      <Box className="meta-panel" position="absolute" bottom={0} left={0} right={0}
        p={5} zIndex={20}
        style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.95))", backdropFilter: "blur(2px)" }}>
        <Flex align="center" gap={2} mb={2}>
          <Box w={1} h={1} borderRadius="full" bg="green.400" className="hud-pulse" />
          <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em"
            style={{ color: "rgba(74,222,128,0.7)", fontFamily: "Inter, sans-serif" }}>OBJECT IDENTIFIED</Text>
        </Flex>
        <Text fontSize="lg" fontWeight="700" color="white" letterSpacing="0.05em"
          className="glitch-title" mb={1}>{image.title}</Text>
        <Flex align="center" justify="space-between">
          <Text fontSize="xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Manrope, sans-serif" }}>
            📍 {image.location}
          </Text>
          <Box px={2} py={0.5}
            style={{ background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.5)" }}>
            <Text fontSize="9px" fontWeight="700" letterSpacing="0.1em"
              style={{ color: "#4ade80", fontFamily: "Inter, sans-serif" }}>VIEW →</Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

// ── Main Portfolio ───────────────────────────────────────────────────────────
export function Portfolio({ fullPage = false, setCurrentSection }: { fullPage?: boolean; setCurrentSection?: (s: string) => void }) {
  const [folders, setFolders] = useState<any[]>([]);
  const [openFolder, setOpenFolder] = useState<any>(null);
  const [folderImages, setFolderImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [glitchActive, setGlitchActive] = useState(false);
  const [showCameraTracking, setShowCameraTracking] = useState(false);

  useEffect(() => {
    fetch(`${API}/portfolio/folders`)
      .then(r => r.json())
      .then(({ folders }) => setFolders(folders || []))
      .catch(() => setFolders([]))
      .finally(() => setLoading(false));
  }, []);

  const openFolderView = async (folder: any) => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 150);
    setOpenFolder(folder);
    setLoadingImages(true);
    try {
      const res = await fetch(`${API}/portfolio?folderId=${folder.id}`);
      const { images } = await res.json();
      setFolderImages(images || []);
    } catch { setFolderImages([]); }
    finally { setLoadingImages(false); }
  };

  const handleBack = () => {
    setOpenFolder(null);
    setFolderImages([]);
    setSelectedImage(null);
  };

  if (showCameraTracking) {
    return (
      <Box style={{ background: "#050505" }}>
        <Box maxW="7xl" mx="auto" px={{ base: 4, lg: 8 }} pt={fullPage ? 24 : 8}>
          <Box as="button" px={4} py={2} mb={6} fontSize="xs" fontWeight="700" letterSpacing="0.2em"
            onClick={() => setShowCameraTracking(false)}
            style={{ fontFamily: "Inter, sans-serif", background: "transparent", border: "1px solid rgba(74,222,128,0.4)", color: "#4ade80", cursor: "pointer", padding: "4px 12px" }}>
            ← BACK TO PORTFOLIO
          </Box>
        </Box>
        <CameraTrackingGallery />
      </Box>
    );
  }

  return (
    <Box minH={fullPage ? "100vh" : "auto"} pt={fullPage ? 24 : 0} pb={16}
      style={{ background: "#050505" }} color="white">
      <Box maxW="7xl" mx="auto" px={{ base: 4, lg: 8 }}>

        {/* ── Header ── */}
        <Box mb={14} pt={fullPage ? 0 : 8}>
          <Flex align="center" gap={3} mb={4}>
            <Box w={2} h={2} borderRadius="full" bg="green.400" className="hud-pulse" />
            <Text fontSize="xs" fontWeight="700" letterSpacing="0.4em"
              style={{ color: "#4ade80", fontFamily: "Inter, sans-serif" }}>
              GRAMTIME.VISUALS // PORTFOLIO.SCAN
            </Text>
          </Flex>

          <Box position="relative" display="inline-block">
            <Heading fontSize={{ base: "5xl", md: "8xl" }} fontWeight="900"
              letterSpacing="-0.03em" lineHeight="0.9" color="white"
              style={{ animation: glitchActive ? "glitchX 0.15s ease" : "none" }}>
              PORT
              <Box as="span" style={{ WebkitTextStroke: "2px #4ade80", color: "transparent" }}>FOLIO</Box>
            </Heading>
            <Heading fontSize={{ base: "5xl", md: "8xl" }} fontWeight="900"
              letterSpacing="-0.03em" lineHeight="0.9"
              position="absolute" top={0} left={0}
              style={{ color: "rgba(74,222,128,0.15)", transform: "translateX(3px)", pointerEvents: "none", userSelect: "none" }}>
              PORTFOLIO
            </Heading>
          </Box>

          {/* Breadcrumb */}
          <Flex align="center" gap={6} mt={4}>
            {openFolder ? (
              <Flex align="center" gap={3}>
                <Box as="button" onClick={handleBack} fontSize="xs" fontWeight="700" letterSpacing="0.2em"
                  style={{ fontFamily: "Inter, sans-serif", background: "transparent", border: "1px solid rgba(74,222,128,0.4)", color: "#4ade80", cursor: "pointer", padding: "4px 12px" }}>
                  ← FOLDERS
                </Box>
                <Text fontSize="xs" style={{ color: "rgba(74,222,128,0.6)", fontFamily: "Inter, sans-serif" }}>
                  / {openFolder.name.toUpperCase()}
                </Text>
                <Text fontSize="xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Manrope, sans-serif" }}>
                  [{folderImages.length} OBJECTS]
                </Text>
              </Flex>
            ) : (
              <>
                <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Manrope, sans-serif" }}>
                  [{folders.length} FOLDERS DETECTED]
                </Text>
                <Box h="1px" flex={1} style={{ background: "linear-gradient(90deg, rgba(74,222,128,0.4), transparent)" }} />
              </>
            )}
          </Flex>
        </Box>

        {/* ── Folder Grid ── */}
        {!openFolder && (
          loading ? (
            <Flex justify="center" align="center" minH="300px">
              <Box textAlign="center">
                <Box w={2} h={2} borderRadius="full" bg="green.400" className="hud-pulse" mx="auto" mb={4} />
                <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em"
                  style={{ color: "#4ade80", fontFamily: "Inter, sans-serif" }}>SCANNING...</Text>
              </Box>
            </Flex>
          ) : folders.length === 0 ? (
            <Flex justify="center" align="center" minH="300px">
              <Box textAlign="center">
                <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em" mb={3}
                  style={{ color: "rgba(74,222,128,0.4)", fontFamily: "Inter, sans-serif" }}>NO FOLDERS DETECTED</Text>
                <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Manrope, sans-serif" }}>
                  Portfolio folders will appear here once created from the admin panel.
                </Text>
              </Box>
            </Flex>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
              gap={5} style={{ perspective: "1200px" }}>
              {folders.map((folder, i) => (
                <Box key={folder.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <FolderCard folder={folder} onClick={() => openFolderView(folder)} />
                </Box>
              ))}
            </Grid>
          )
        )}

        {/* ── Folder Images Grid ── */}
        {openFolder && (
          loadingImages ? (
            <Flex justify="center" align="center" minH="300px">
              <Box textAlign="center">
                <Box w={2} h={2} borderRadius="full" bg="green.400" className="hud-pulse" mx="auto" mb={4} />
                <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em"
                  style={{ color: "#4ade80", fontFamily: "Inter, sans-serif" }}>LOADING...</Text>
              </Box>
            </Flex>
          ) : folderImages.length === 0 ? (
            <Flex justify="center" align="center" minH="300px">
              <Box textAlign="center">
                <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em" mb={3}
                  style={{ color: "rgba(74,222,128,0.4)", fontFamily: "Inter, sans-serif" }}>NO IMAGES YET</Text>
                <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Manrope, sans-serif" }}>
                  Upload images to this folder from the admin panel.
                </Text>
              </Box>
            </Flex>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
              gap={5} style={{ perspective: "1400px" }} key={openFolder?.id}>
              {folderImages.map((img, i) => (
                <Box key={img.id} style={{
                  animation: "cardFlyIn 0.65s cubic-bezier(0.22,1,0.36,1) both",
                  animationDelay: `${i * 0.07}s`,
                }}>
                  <ARCard image={img} onClick={() => setSelectedImage(img)} />
                </Box>
              ))}
            </Grid>
          )
        )}

        {fullPage && !openFolder && (
          <Flex justify="center" mt={16}>
            <Box as="button" px={8} py={4} fontSize="xs" fontWeight="700" letterSpacing="0.2em"
              onClick={() => setShowCameraTracking(true)}
              style={{ fontFamily: "Inter, sans-serif", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.6)", color: "#4ade80", cursor: "pointer", boxShadow: "0 0 20px rgba(74,222,128,0.15)", transition: "all 0.3s" }}>
              HAND GESTURE CONTROL GALLERY
            </Box>
          </Flex>
        )}
      </Box>

      {/* ── Lightbox ── */}
      {selectedImage && (
        <Box position="fixed" inset={0} zIndex={200}
          display="flex" alignItems="center" justifyContent="center"
          style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)" }}
          onClick={() => setSelectedImage(null)}>
          <Box position="absolute" inset={0} pointerEvents="none">
            <div className="corner-tl" style={{ top: 16, left: 16, width: 24, height: 24, opacity: 1 }} />
            <div className="corner-tr" style={{ top: 16, right: 16, width: 24, height: 24, opacity: 1 }} />
            <div className="corner-bl" style={{ bottom: 16, left: 16, width: 24, height: 24, opacity: 1 }} />
            <div className="corner-br" style={{ bottom: 16, right: 16, width: 24, height: 24, opacity: 1 }} />
            <Box position="absolute" top={4} left="50%" transform="translateX(-50%)">
              <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em"
                style={{ color: "#4ade80", fontFamily: "Inter, sans-serif" }} className="hud-pulse">
                GRAMTIME VISUALS // {openFolder?.name?.toUpperCase()}
              </Text>
            </Box>
          </Box>
          <Box as="button" position="absolute" top={6} right={6}
            w={10} h={10} display="flex" alignItems="center" justifyContent="center"
            style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.4)", color: "#4ade80", cursor: "pointer", fontSize: "20px" }}
            onClick={() => setSelectedImage(null)}>×</Box>
          <Box position="relative" maxW="80vw" maxH="80vh"
            style={{ border: "1px solid rgba(74,222,128,0.3)", boxShadow: "0 0 60px rgba(74,222,128,0.1)" }}
            onClick={e => e.stopPropagation()}>
            <Image src={selectedImage.url} alt={selectedImage.title} maxH="75vh" objectFit="contain" />
            <div className="scan-line" style={{ animation: "scanline 2s linear infinite" }} />
            <HUDCorners />
          </Box>
          <Box position="absolute" bottom={8} left="50%" transform="translateX(-50%)" textAlign="center">
            <Text fontSize="lg" fontWeight="700" color="white" mb={1}>{selectedImage.title}</Text>
            <Text fontSize="xs" style={{ color: "rgba(74,222,128,0.7)", fontFamily: "Inter, sans-serif" }}>
               {selectedImage.location} // {selectedImage.category?.toUpperCase()}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
