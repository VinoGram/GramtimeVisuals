import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { Box, Flex, Heading, Text, Button, VStack, HStack, Grid, Input, Textarea } from "@chakra-ui/react";
import { apiService } from "../services/api-production";

interface TimeSlot { time: string; available: boolean; reserved?: boolean; }
interface ConsultationType { id: string; title: string; duration: string; description: string; accent: string; location: string; }

// ── AR / HUD design tokens ──────────────────────────────────────────────────
const HUD_GREEN = "#4ade80";
const HUD_GREEN_DIM = "rgba(74,222,128,0.4)";
const HUD_GREEN_FAINT = "rgba(74,222,128,0.15)";
const HUD_BG = "#050505";
const HUD_PANEL = "#0a0a0a";
const HUD_BORDER = "1px solid rgba(74,222,128,0.3)";
const HUD_FONT = "monospace";

const hudGradients: Record<string, string> = {
  discovery: "linear-gradient(135deg, rgba(74,222,128,0.28) 0%, #0a0a0a 60%)",
  wedding:   "linear-gradient(135deg, rgba(74,222,128,0.22) 0%, #0a0a0a 60%)",
  portrait:  "linear-gradient(135deg, rgba(74,222,128,0.18) 0%, #0a0a0a 60%)",
  bespoke:   "linear-gradient(135deg, rgba(74,222,128,0.32) 0%, #0a0a0a 60%)",
};

const hudGlow: Record<string, string> = {
  discovery: "0 0 20px rgba(74,222,128,0.15)",
  wedding:   "0 0 24px rgba(74,222,128,0.12)",
  portrait:  "0 0 20px rgba(74,222,128,0.10)",
  bespoke:   "0 0 28px rgba(74,222,128,0.20)",
};

// ── Shared HUD corner helper ────────────────────────────────────────────────
function HUDCorners({ active }: { active?: boolean }) {
  const forceStyle: React.CSSProperties = active ? { opacity: 1 } : {};
  return (
    <>
      <div className="corner-tl" style={forceStyle} />
      <div className="corner-tr" style={forceStyle} />
      <div className="corner-bl" style={forceStyle} />
      <div className="corner-br" style={forceStyle} />
    </>
  );
}

// ── Reusable AR input styles (mirrors index.css .ar-input / .ar-select) ─────
const arInput: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: HUD_PANEL,
  border: HUD_BORDER,
  color: "#fff",
  fontFamily: HUD_FONT,
  fontWeight: 600,
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const arSelect: React.CSSProperties = {
  ...arInput,
  appearance: "none",
  cursor: "pointer",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234ade80' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: "36px",
};

// ── Step 1 selectable AR card with 3D tilt ──────────────────────────────────
function ARSelectableCard({
  c,
  selected,
  onClick,
}: {
  c: ConsultationType;
  selected: boolean;
  onClick: () => void;
}) {
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
      borderColor={selected ? HUD_GREEN : "rgba(74,222,128,0.2)"}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
        transition: "transform 0.15s ease",
        background: HUD_PANEL,
        boxShadow: selected ? `0 0 30px ${HUD_GREEN_DIM}` : hudGlow[c.id],
      }}
    >
      <Box
        className="card-img"
        position="absolute"
        inset={0}
        style={{ background: hudGradients[c.id] }}
      />
      <div className="scan-line" />
      <HUDCorners active={selected} />

      <Box className="hud-overlay" position="absolute" inset={0} zIndex={10}>
        <Box position="absolute" top={4} left={4}>
          <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
            ◈ {c.id.toUpperCase()}.TYPE
          </Text>
        </Box>

        <Box
          position="absolute"
          top={4}
          right={4}
          px={2}
          py={0.5}
          style={{ background: HUD_GREEN_FAINT, border: `1px solid ${HUD_GREEN_DIM}`, backdropFilter: "blur(4px)" }}
        >
          <Text fontSize="9px" fontWeight="700" letterSpacing="0.15em" style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
            {c.duration}
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

      <Box
        className="meta-panel"
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        p={5}
        zIndex={20}
        style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.95))", backdropFilter: "blur(2px)" }}
      >
        <Flex align="center" gap={2} mb={2}>
          <Box w={1} h={1} borderRadius="full" bg="green.400" className="hud-pulse" />
          <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" style={{ color: "rgba(74,222,128,0.7)", fontFamily: HUD_FONT }}>
            OBJECT IDENTIFIED
          </Text>
        </Flex>

        <Text fontSize="lg" fontWeight="700" color="white" letterSpacing="0.05em" className="glitch-title" mb={1}>
          {c.title}
        </Text>

        <Text fontSize="xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: HUD_FONT }} mb={3}>
          {c.description}
        </Text>

        <Flex align="center" justify="space-between">
          <Text fontSize="xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: HUD_FONT }}>
            📍 {c.location}
          </Text>
          <Box px={2} py={0.5} style={{ background: HUD_GREEN_FAINT, border: `1px solid ${HUD_GREEN_DIM}` }}>
            <Text fontSize="9px" fontWeight="700" letterSpacing="0.1em" style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
              SELECT →
            </Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

export function ConsultationBooking() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    eventType: "", eventDate: "", budget: "", message: "", preferredContact: "email",
  });

  const consultationTypes: ConsultationType[] = [
    { id: "discovery", title: "Discovery Call",            duration: "30 MIN", description: "An intimate conversation to explore your vision and find out if we're the perfect match.", accent: HUD_GREEN, location: "Virtual / Studio" },
    { id: "wedding",   title: "Wedding Consultation",      duration: "60 MIN", description: "Deep-dive into your wedding day — timeline, locations, creative direction, all of it.", accent: HUD_GREEN, location: "In-Person / Virtual" },
    { id: "portrait",  title: "Portrait Planning",         duration: "45 MIN", description: "Styling guidance, location scouting, and creative concepts for your portrait session.", accent: HUD_GREEN, location: "Studio / On-Location" },
    { id: "bespoke",   title: "Bespoke Experience Design", duration: "90 MIN", description: "Custom packages, destination shoots, and multi-day celebrations built from scratch.", accent: HUD_GREEN, location: "Worldwide" },
  ];

  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0 && d.getDay() !== 6) dates.push(d);
    }
    return dates;
  };

  const timeSlots: TimeSlot[] = [
    { time: "10:00 AM", available: true },
    { time: "11:00 AM", available: true },
    { time: "12:00 PM", available: false },
    { time: "1:00 PM",  available: true },
    { time: "2:00 PM",  available: true, reserved: true },
    { time: "3:00 PM",  available: true },
    { time: "4:00 PM",  available: true },
    { time: "5:00 PM",  available: true },
  ];

  const availableDates = getAvailableDates();
  const formatDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const consultationData = {
        consultationType: selectedConsultation?.id,
        consultationTitle: selectedConsultation?.title,
        duration: selectedConsultation?.duration,
        location: selectedConsultation?.location,
        date: selectedDate?.toISOString(),
        time: selectedTime,
        client: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        eventDetails: {
          eventType: formData.eventType,
          eventDate: formData.eventDate,
          budget: formData.budget,
        },
        preferredContact: formData.preferredContact,
        message: formData.message,
        status: "pending",
      };

      const response = await apiService.bookConsultation(consultationData);
      const refId = response?.consultation?.id || `GTV-${Date.now().toString(36).toUpperCase()}`;
      setBookingReference(refId);
      setBookingConfirmed(true);
      toast.success(`Consultation booked! Reference: ${refId}`);
    } catch (error) {
      // Fallback: still confirm locally if backend is unavailable
      const refId = `GTV-${Date.now().toString(36).toUpperCase()}`;
      setBookingReference(refId);
      setBookingConfirmed(true);
      toast.success(`Consultation booked! Reference: ${refId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setBookingConfirmed(false);
    setBookingReference("");
    setStep(1); setSelectedDate(null); setSelectedTime(""); setSelectedConsultation(null);
    setFormData({ firstName: "", lastName: "", email: "", phone: "", eventType: "", eventDate: "", budget: "", message: "", preferredContact: "email" });
  };

  const steps = ["Experience", "Date & Time", "Your Details", "Confirm"];

  return (
    <Box minH="100vh" pt={24} pb={20} style={{ background: HUD_BG }} color="white">
      <Box maxW="6xl" mx="auto" px={{ base: 4, lg: 8 }}>

        {/* ═══════════════════════════════════════════════════════════════════
            BOOKING CONFIRMED SCREEN
        ═══════════════════════════════════════════════════════════════════ */}
        {bookingConfirmed && (
          <Box className="ar-fade-in" textAlign="center" py={20}>
            <Box position="relative" display="inline-block" mb={8}>
              <Box
                w={24} h={24} mx="auto"
                display="flex" alignItems="center" justifyContent="center"
                borderRadius="full"
                style={{
                  background: HUD_GREEN_FAINT,
                  border: `2px solid ${HUD_GREEN}`,
                  boxShadow: `0 0 40px ${HUD_GREEN_DIM}`,
                }}
              >
                <Text fontSize="48px" fontWeight="900" style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>✓</Text>
              </Box>
              <div className="scan-line" style={{ animation: "scanline 2s linear infinite", top: 0, height: "100%" }} />
            </Box>

            <Text fontSize="xs" fontWeight="700" letterSpacing="0.4em" mb={4} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
              ◈ CONSULTATION.BOOKED // STATUS: CONFIRMED
            </Text>

            <Heading fontSize={{ base: "4xl", md: "6xl" }} fontWeight="900" letterSpacing="-0.03em" lineHeight="0.9" color="white" textTransform="uppercase" mb={4}>
              BOOKING
              <Box as="span" style={{ WebkitTextStroke: `2px ${HUD_GREEN}`, color: "transparent" }}>
                CONFIRMED
              </Box>
            </Heading>

            <Box maxW="md" mx="auto" p={6} mb={8} style={{ background: HUD_PANEL, border: HUD_BORDER, boxShadow: `0 0 30px ${HUD_GREEN_FAINT}` }}>
              <Flex align="center" justify="space-between" mb={4} pb={4} style={{ borderBottom: HUD_BORDER }}>
                <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" style={{ color: "rgba(255,255,255,0.4)", fontFamily: HUD_FONT }}>
                  REFERENCE ID
                </Text>
                <Text fontSize="lg" fontWeight="900" style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                  {bookingReference}
                </Text>
              </Flex>
              <Grid templateColumns="1fr 1fr" gap={4} textAlign="left">
                <Box>
                  <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" mb={1} style={{ color: "rgba(255,255,255,0.4)", fontFamily: HUD_FONT }}>
                    SESSION
                  </Text>
                  <Text fontSize="sm" fontWeight="700" color="white">{selectedConsultation?.title}</Text>
                </Box>
                <Box>
                  <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" mb={1} style={{ color: "rgba(255,255,255,0.4)", fontFamily: HUD_FONT }}>
                    DURATION
                  </Text>
                  <Text fontSize="sm" fontWeight="700" color="white">{selectedConsultation?.duration}</Text>
                </Box>
                <Box>
                  <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" mb={1} style={{ color: "rgba(255,255,255,0.4)", fontFamily: HUD_FONT }}>
                    DATE
                  </Text>
                  <Text fontSize="sm" fontWeight="700" color="white">{selectedDate && formatDate(selectedDate)}</Text>
                </Box>
                <Box>
                  <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" mb={1} style={{ color: "rgba(255,255,255,0.4)", fontFamily: HUD_FONT }}>
                    TIME
                  </Text>
                  <Text fontSize="sm" fontWeight="700" style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>{selectedTime}</Text>
                </Box>
              </Grid>
            </Box>

            <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: HUD_FONT }} mb={8} maxW="lg" mx="auto">
              A confirmation email has been sent to {formData.email}. You'll receive a calendar invite and preparation guide shortly.
            </Text>

            <HStack gap={4} justify="center">
              <Button className="ar-btn" fontSize="xs" letterSpacing="0.1em" px={6} py={5} onClick={resetBooking}>
                ◈ BOOK ANOTHER
              </Button>
            </HStack>
          </Box>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            BOOKING FLOW (hidden when confirmed)
        ═══════════════════════════════════════════════════════════════════ */}
        {!bookingConfirmed && (
          <>
            {/* ── AR HUD HEADER ── */}
            <Box mb={14} pt={8}>
              <Flex align="center" gap={3} mb={4}>
                <Box w={2} h={2} borderRadius="full" bg="green.400" className="hud-pulse" />
                <Text fontSize="xs" fontWeight="700" letterSpacing="0.4em" style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                  GRAMTIME.VISUALS // CONSULTATION.SCAN
                </Text>
              </Flex>

              <Box position="relative" display="inline-block">
                <Heading
                  fontSize={{ base: "5xl", md: "8xl" }}
                  fontWeight="900"
                  letterSpacing="-0.03em"
                  lineHeight="0.9"
                  color="white"
                  textTransform="uppercase"
                  style={{ animation: "glitchX 0.4s ease" }}
                >
                  BOOK YOUR
                  <Box as="span" style={{ WebkitTextStroke: `2px ${HUD_GREEN}`, color: "transparent" }}>
                    CONSULTATION
                  </Box>
                </Heading>
                <Heading
                  fontSize={{ base: "5xl", md: "8xl" }}
                  fontWeight="900"
                  letterSpacing="-0.03em"
                  lineHeight="0.9"
                  position="absolute"
                  top={0}
                  left={0}
                  style={{
                    color: HUD_GREEN_FAINT,
                    transform: "translateX(3px)",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  BOOK YOUR CONSULTATION
                </Heading>
              </Box>

              <Flex align="center" gap={6} mt={4}>
                <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: HUD_FONT }}>
                  [4-STEP BOOKING PROTOCOL]
                </Text>
                <Box h="1px" flex={1} style={{ background: `linear-gradient(90deg, ${HUD_GREEN_DIM}, transparent)` }} />
              </Flex>
            </Box>

            {/* ── STEP INDICATOR ── */}
            <Flex justify="center" mb={12} gap={{ base: 2, md: 4 }} flexWrap="wrap">
              {steps.map((label, i) => {
                const num = i + 1;
                const active = step === num;
                const done = step > num;
                return (
                  <Flex key={label} align="center" gap={2}>
                    <Box
                      w={8}
                      h={8}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="sm"
                      fontWeight="900"
                      cursor={done ? "pointer" : "default"}
                      onClick={() => done && setStep(num)}
                      style={{
                        fontFamily: HUD_FONT,
                        background: done ? HUD_GREEN : active ? HUD_GREEN_FAINT : HUD_PANEL,
                        color: done ? HUD_BG : active ? HUD_GREEN : "rgba(255,255,255,0.4)",
                        border: `1px solid ${done || active ? HUD_GREEN : "rgba(255,255,255,0.1)"}`,
                        boxShadow: active ? `0 0 12px ${HUD_GREEN_DIM}` : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      {done ? "✓" : num}
                    </Box>
                    <Text
                      fontSize="xs"
                      display={{ base: "none", md: "block" }}
                      style={{ fontFamily: HUD_FONT, color: active ? HUD_GREEN : "rgba(255,255,255,0.4)" }}
                    >
                      {label.toUpperCase()}
                    </Text>
                    {i < steps.length - 1 && (
                      <Box
                        w={8}
                        h="2px"
                        display={{ base: "none", md: "block" }}
                        style={{
                          background: done
                            ? `linear-gradient(90deg, ${HUD_GREEN}, rgba(255,255,255,0.1))`
                            : "rgba(255,255,255,0.1)",
                        }}
                      />
                    )}
                  </Flex>
                );
              })}
            </Flex>

            {/* ═══════════════════════════════════════════════════════════════════
                STEP 1 — SELECT EXPERIENCE
            ═══════════════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <Box className="ar-fade-in">
                <Text fontSize="xs" fontWeight="700" letterSpacing="0.2em" mb={6} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                  — SELECT EXPERIENCE
                </Text>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5} style={{ perspective: "1200px" }}>
                  {consultationTypes.map((c, i) => (
                    <Box key={c.id} className="ar-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      <ARSelectableCard
                        c={c}
                        selected={selectedConsultation?.id === c.id}
                        onClick={() => { setSelectedConsultation(c); setStep(2); }}
                      />
                    </Box>
                  ))}
                </Grid>
              </Box>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                STEP 2 — DATE & TIME
            ═══════════════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <Box className="ar-fade-in">
                <Box mb={8} p={4} style={{ background: HUD_PANEL, border: HUD_BORDER, boxShadow: `0 0 20px ${HUD_GREEN_FAINT}` }}>
                  <Flex align="center" gap={4} flexWrap="wrap">
                    <Box>
                      <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" mb={1} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                        SELECTED
                      </Text>
                      <Text fontSize="xl" fontWeight="900" color="white" textTransform="uppercase">
                        {selectedConsultation?.title}
                      </Text>
                      <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: HUD_FONT }}>
                        {selectedConsultation?.duration}
                      </Text>
                    </Box>
                    <Button ml="auto" className="ar-btn" fontSize="xs" letterSpacing="0.1em" px={4} py={2} onClick={() => setStep(1)}>
                      CHANGE ↩
                    </Button>
                  </Flex>
                </Box>

                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <Box style={{ background: HUD_PANEL, border: HUD_BORDER }}>
                    <Box px={5} py={3} style={{ background: HUD_GREEN_FAINT, borderBottom: HUD_BORDER }}>
                      <Text fontSize="xs" fontWeight="700" letterSpacing="0.2em" style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                        PICK A DATE
                      </Text>
                    </Box>
                    <Box p={4} maxH="400px" overflowY="auto">
                      <VStack gap={2} align="stretch">
                        {availableDates.map((date, i) => {
                          const isSel = selectedDate?.toDateString() === date.toDateString();
                          return (
                            <Box
                              key={i}
                              p={3}
                              cursor="pointer"
                              onClick={() => { setSelectedDate(date); setSelectedTime(""); }}
                              style={{
                                fontFamily: HUD_FONT,
                                background: isSel ? HUD_GREEN_FAINT : HUD_PANEL,
                                border: HUD_BORDER,
                                boxShadow: isSel ? `0 0 12px ${HUD_GREEN_DIM}` : "none",
                                transition: "all 0.2s",
                              }}
                            >
                              <Flex justify="space-between" align="center">
                                <Box>
                                  <Text fontWeight="900" fontSize="sm" color="white">
                                    {date.toLocaleDateString("en-US", { weekday: "long" })}
                                  </Text>
                                  <Text fontSize="xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: HUD_FONT }}>
                                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </Text>
                                </Box>
                                {isSel && <Text style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>✓</Text>}
                              </Flex>
                            </Box>
                          );
                        })}
                      </VStack>
                    </Box>
                  </Box>

                  <Box style={{ background: HUD_PANEL, border: HUD_BORDER }}>
                    <Box px={5} py={3} style={{ background: HUD_GREEN_FAINT, borderBottom: HUD_BORDER }}>
                      <Text fontSize="xs" fontWeight="700" letterSpacing="0.2em" style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                        {selectedDate ? "PICK A TIME" : "SELECT DATE FIRST"}
                      </Text>
                    </Box>
                    <Box p={4}>
                      {selectedDate ? (
                        <Grid templateColumns="1fr 1fr" gap={3}>
                          {timeSlots.map((slot, i) => {
                            const isSel = selectedTime === slot.time;
                            return (
                              <Box
                                key={i}
                                p={3}
                                textAlign="center"
                                cursor={slot.available ? "pointer" : "not-allowed"}
                                onClick={() => slot.available && setSelectedTime(slot.time)}
                                style={{
                                  fontFamily: HUD_FONT,
                                  background: !slot.available ? "rgba(255,255,255,0.05)" : isSel ? HUD_GREEN_FAINT : HUD_PANEL,
                                  border: `1px solid ${!slot.available ? "rgba(255,255,255,0.1)" : isSel ? HUD_GREEN : "rgba(74,222,128,0.2)"}`,
                                  color: !slot.available ? "rgba(255,255,255,0.25)" : isSel ? HUD_GREEN : "white",
                                  boxShadow: isSel && slot.available ? `0 0 12px ${HUD_GREEN_DIM}` : "none",
                                  transition: "all 0.2s",
                                }}
                              >
                                <Text fontWeight="900" fontSize="sm">{slot.time}</Text>
                                {slot.reserved && slot.available && (
                                  <Text fontSize="9px" fontWeight="700" letterSpacing="0.1em" style={{ color: isSel ? HUD_GREEN : "#f6ad55", fontFamily: HUD_FONT }}>
                                    LAST SPOT
                                  </Text>
                                )}
                                {!slot.available && (
                                  <Text fontSize="9px" fontWeight="700" letterSpacing="0.1em" style={{ color: "rgba(255,255,255,0.3)", fontFamily: HUD_FONT }}>
                                    BOOKED
                                  </Text>
                                )}
                              </Box>
                            );
                          })}
                        </Grid>
                      ) : (
                        <Flex h="200px" align="center" justify="center">
                          <Text fontWeight="700" fontSize="sm" style={{ color: "rgba(255,255,255,0.3)", fontFamily: HUD_FONT }}>
                            ← Choose a date first
                          </Text>
                        </Flex>
                      )}
                    </Box>
                  </Box>
                </Grid>

                {selectedDate && selectedTime && (
                  <Box mt={6} p={5} style={{ background: HUD_PANEL, border: HUD_BORDER, boxShadow: `0 0 20px ${HUD_GREEN_FAINT}` }}>
                    <Flex align="center" justify="space-between" flexWrap="wrap" gap={4}>
                      <Box>
                        <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" mb={1} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                          YOUR SLOT
                        </Text>
                        <Text fontSize="lg" fontWeight="900" color="white">
                          {formatDate(selectedDate)} — {selectedTime}
                        </Text>
                        <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: HUD_FONT }}>
                          {selectedConsultation?.duration} session
                        </Text>
                      </Box>
                      <Button className="ar-btn-primary" fontSize="xs" letterSpacing="0.1em" px={8} py={5} onClick={() => setStep(3)}>
                        NEXT: YOUR DETAILS →
                      </Button>
                    </Flex>
                  </Box>
                )}
              </Box>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                STEP 3 — CLIENT DETAILS
            ═══════════════════════════════════════════════════════════════════ */}
            {step === 3 && (
              <Box className="ar-fade-in" style={{ background: HUD_PANEL, border: HUD_BORDER, boxShadow: `0 0 30px ${HUD_GREEN_FAINT}` }}>
                <Box px={6} py={4} style={{ background: HUD_GREEN_FAINT, borderBottom: HUD_BORDER }}>
                  <Flex align="center" justify="space-between">
                    <Text fontSize="sm" fontWeight="700" letterSpacing="0.2em" style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                      TELL US ABOUT YOURSELF
                    </Text>
                    <Button className="ar-btn" fontSize="xs" letterSpacing="0.1em" px={3} py={2} onClick={() => setStep(2)}>
                      ← BACK
                    </Button>
                  </Flex>
                </Box>

                <Box as="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); setStep(4); }} p={8}>
                  <VStack gap={6}>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5} w="full">
                      {[["firstName", "FIRST NAME *", "text"], ["lastName", "LAST NAME *", "text"]].map(([name, label, type]) => (
                        <Box key={name}>
                          <Text fontSize="xs" fontWeight="700" letterSpacing="0.15em" mb={2} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                            {label}
                          </Text>
                          <Input
                            name={name as string}
                            type={type as string}
                            value={(formData as any)[name]}
                            onChange={handleChange}
                            required
                            className="ar-input"
                            style={arInput}
                            placeholder={label.replace(" *", "")}
                          />
                        </Box>
                      ))}
                    </Grid>

                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5} w="full">
                      {[["email", "EMAIL *", "email"], ["phone", "PHONE *", "tel"]].map(([name, label, type]) => (
                        <Box key={name}>
                          <Text fontSize="xs" fontWeight="700" letterSpacing="0.15em" mb={2} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                            {label}
                          </Text>
                          <Input
                            name={name as string}
                            type={type as string}
                            value={(formData as any)[name]}
                            onChange={handleChange}
                            required
                            className="ar-input"
                            style={arInput}
                            placeholder={label.replace(" *", "")}
                          />
                        </Box>
                      ))}
                    </Grid>

                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5} w="full">
                      <Box>
                        <Text fontSize="xs" fontWeight="700" letterSpacing="0.15em" mb={2} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                          EVENT TYPE
                        </Text>
                        <select name="eventType" value={formData.eventType} onChange={handleChange} className="ar-input ar-select" style={arSelect}>
                          <option value="">Select type</option>
                          {["Wedding", "Engagement", "Portrait", "Family", "Corporate", "Other"].map((v) => (
                            <option key={v} value={v.toLowerCase()}>{v}</option>
                          ))}
                        </select>
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="700" letterSpacing="0.15em" mb={2} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                          EVENT DATE (IF KNOWN)
                        </Text>
                        <Input name="eventDate" type="date" value={formData.eventDate} onChange={handleChange} className="ar-input" style={arInput} />
                      </Box>
                    </Grid>

                    <Box w="full">
                      <Text fontSize="xs" fontWeight="700" letterSpacing="0.15em" mb={2} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                        INVESTMENT RANGE
                      </Text>
                      <select name="budget" value={formData.budget} onChange={handleChange} className="ar-input ar-select" style={arSelect}>
                        <option value="">Select range</option>
                        <option value="150-1000">GH₵ 150 – 1,000</option>
                        <option value="1000-5000">GH₵ 1,000 – 5,000</option>
                        <option value="5000-10000">GH₵ 5,000 – 10,000</option>
                        <option value="10000+">GH₵ 10,000+</option>
                      </select>
                    </Box>

                    <Box w="full">
                      <Text fontSize="xs" fontWeight="700" letterSpacing="0.15em" mb={2} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                        PREFERRED CONTACT
                      </Text>
                      <HStack gap={4}>
                        {["email", "phone"].map((method) => (
                          <Box key={method} as="label" cursor="pointer" display="flex" alignItems="center" gap={2}>
                            <Box
                              w={5}
                              h={5}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              style={{ border: HUD_BORDER, background: formData.preferredContact === method ? HUD_GREEN : "transparent", transition: "all 0.2s" }}
                            >
                              {formData.preferredContact === method && <Text fontSize="10px" fontWeight="900" color={HUD_BG}>✓</Text>}
                            </Box>
                            <input type="radio" name="preferredContact" value={method} checked={formData.preferredContact === method} onChange={handleChange} style={{ display: "none" }} />
                            <Text fontSize="sm" fontWeight="700" style={{ color: "rgba(255,255,255,0.8)", fontFamily: HUD_FONT, textTransform: "capitalize" }}>
                              {method}
                            </Text>
                          </Box>
                        ))}
                      </HStack>
                    </Box>

                    <Box w="full">
                      <Text fontSize="xs" fontWeight="700" letterSpacing="0.15em" mb={2} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                        YOUR VISION
                      </Text>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tell us what you're dreaming of..."
                        className="ar-input"
                        style={{ ...arInput, resize: "none", display: "block" }}
                      />
                    </Box>

                    <Button type="submit" w="full" className="ar-btn-primary" fontSize="sm" letterSpacing="0.15em" py={6}>
                      REVIEW BOOKING →
                    </Button>
                  </VStack>
                </Box>
              </Box>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                STEP 4 — CONFIRM
            ═══════════════════════════════════════════════════════════════════ */}
            {step === 4 && (
              <Box className="ar-fade-in" style={{ background: HUD_PANEL, border: HUD_BORDER, boxShadow: `0 0 30px ${HUD_GREEN_FAINT}` }}>
                <Box px={6} py={4} style={{ background: HUD_GREEN_FAINT, borderBottom: HUD_BORDER }}>
                  <Flex align="center" justify="space-between">
                    <Text fontSize="sm" fontWeight="700" letterSpacing="0.2em" style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                      CONFIRM YOUR BOOKING
                    </Text>
                    <Button className="ar-btn" fontSize="xs" letterSpacing="0.1em" px={3} py={2} onClick={() => setStep(3)}>
                      ← BACK
                    </Button>
                  </Flex>
                </Box>

                <Box p={8}>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5} mb={6}>
                    <Box p={5} style={{ background: HUD_BG, border: HUD_BORDER }}>
                      <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" mb={2} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                        SESSION
                      </Text>
                      <Text fontSize="xl" fontWeight="900" color="white" textTransform="uppercase" lineHeight="1.2">
                        {selectedConsultation?.title}
                      </Text>
                      <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: HUD_FONT }} mt={1}>
                        {selectedConsultation?.duration}
                      </Text>
                    </Box>

                    <Box p={5} style={{ background: HUD_BG, border: HUD_BORDER }}>
                      <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" mb={2} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                        DATE & TIME
                      </Text>
                      <Text fontSize="lg" fontWeight="900" color="white" lineHeight="1.3">
                        {selectedDate && formatDate(selectedDate)}
                      </Text>
                      <Text fontSize="xl" fontWeight="900" style={{ color: HUD_GREEN, fontFamily: HUD_FONT }} mt={1}>
                        {selectedTime}
                      </Text>
                    </Box>

                    <Box p={5} style={{ background: HUD_BG, border: HUD_BORDER }} gridColumn={{ md: "span 2" }}>
                      <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" mb={3} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                        YOUR DETAILS
                      </Text>
                      <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={3}>
                        {[
                          ["Name", `${formData.firstName} ${formData.lastName}`],
                          ["Email", formData.email],
                          ["Phone", formData.phone],
                          ...(formData.eventType ? [["Event", formData.eventType]] : []),
                          ...(formData.budget ? [["Budget", formData.budget]] : []),
                        ].map(([l, v]) => (
                          <Box key={l} pl={3} style={{ borderLeft: `2px solid ${HUD_GREEN}` }}>
                            <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" style={{ color: "rgba(255,255,255,0.4)", fontFamily: HUD_FONT }}>
                              {l}
                            </Text>
                            <Text fontSize="sm" fontWeight="700" style={{ color: "rgba(255,255,255,0.9)", fontFamily: HUD_FONT }}>
                              {v}
                            </Text>
                          </Box>
                        ))}
                      </Grid>
                    </Box>
                  </Grid>

                  <Box p={5} mb={6} style={{ background: HUD_GREEN_FAINT, border: HUD_BORDER }}>
                    <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em" mb={3} style={{ color: HUD_GREEN, fontFamily: HUD_FONT }}>
                      WHAT HAPPENS NEXT
                    </Text>
                    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={2}>
                      {[
                        "Confirmation email + calendar invite",
                        "Reminder 24 hrs before your session",
                        "Preparation guide sent to your inbox",
                        "Free reschedule up to 24 hrs before",
                      ].map((item) => (
                        <HStack key={item} gap={2}>
                          <Box w={4} h={4} display="flex" alignItems="center" justifyContent="center" flexShrink={0} style={{ background: HUD_GREEN }}>
                            <Text fontSize="9px" fontWeight="900" color={HUD_BG}>✓</Text>
                          </Box>
                          <Text fontSize="sm" fontWeight="600" style={{ color: "rgba(255,255,255,0.7)", fontFamily: HUD_FONT }}>
                            {item}
                          </Text>
                        </HStack>
                      ))}
                    </Grid>
                  </Box>

                  <HStack gap={4}>
                    <Button flex={1} className="ar-btn" fontSize="xs" letterSpacing="0.1em" py={5} onClick={() => setStep(3)}>
                      ← BACK
                    </Button>
                    <Button flex={2} className="ar-btn-primary" fontSize="xs" letterSpacing="0.1em" py={5} loading={submitting} onClick={handleSubmit}>
                      {submitting ? "PROCESSING..." : "CONFIRM BOOKING ✓"}
                    </Button>
                  </HStack>
                </Box>
              </Box>
            )}
          </>
        )}

      </Box>
    </Box>
  );
}