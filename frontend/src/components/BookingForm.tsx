import { useState } from "react";
import { toast } from "sonner";
import {
  Box, Flex, Heading, Text, Button, VStack, HStack, Grid, GridItem, Input, Textarea
} from "@chakra-ui/react";

interface BookingFormProps {
  niche: string;
  packageName: string;
  onClose: () => void;
}

const terms = [
  ["1. BOOKING AND PAYMENT", "A 50% non-refundable deposit is required to secure your booking date. The remaining balance is due 7 days before the event date. Failure to pay the balance may result in cancellation of services."],
  ["2. CANCELLATION POLICY", "Cancellations made more than 60 days before the event will receive a 50% refund of the deposit. Cancellations made within 60 days are non-refundable. Rescheduling is subject to availability."],
  ["3. IMAGE DELIVERY", "All edited images will be delivered within 4–6 weeks after the event via an online gallery. High-resolution digital files are included. Rush delivery is available for an additional fee."],
  ["4. COPYRIGHT AND USAGE", "The Photographer retains copyright to all images. The Client receives a personal usage license for printing, sharing, and personal use. Commercial use requires written permission."],
  ["5. MODEL RELEASE", "The Client grants the Photographer permission to use images for portfolio, marketing, and promotional purposes unless otherwise specified in writing."],
  ["6. LIABILITY", "The Photographer will take all reasonable precautions to ensure quality coverage. The Photographer is not liable for missed shots due to circumstances beyond their control."],
  ["7. WEATHER AND FORCE MAJEURE", "In case of extreme weather or unforeseen circumstances, the session may be rescheduled at no additional cost, subject to availability."],
  ["8. CLIENT RESPONSIBILITIES", "The Client is responsible for obtaining necessary permits and permissions for the shoot location and must inform the Photographer of any special requirements."],
  ["9. BACKUP AND STORAGE", "All images are backed up immediately after the shoot. Raw files are stored for 90 days after delivery. Clients are responsible for backing up their delivered images."],
  ["10. AGREEMENT", "By proceeding with this booking, the Client acknowledges they have read, understood, and agree to be bound by all terms and conditions outlined in this agreement."],
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  background: "#fff",
  fontWeight: 400,
  fontSize: "0.95rem",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
};

export function BookingForm({ niche, packageName, onClose }: BookingFormProps) {
  const [step, setStep] = useState(1); // 1=Terms, 2=Details, 3=Confirm
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", eventDate: "", eventLocation: "", additionalNotes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setHasScrolled(true);
  };

  const generateAgreement = () => {
    const content = `PHOTOGRAPHY SERVICE AGREEMENT\n\nClient: ${formData.fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nPackage: ${packageName} (${niche})\nEvent Date: ${formData.eventDate}\nLocation: ${formData.eventLocation}\nDate Signed: ${new Date().toLocaleDateString()}\n\n${terms.map(([t, b]) => `${t}\n${b}`).join("\n\n")}\n\nClient Signature: ${formData.fullName}\nDate: ${new Date().toLocaleDateString()}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Agreement_${formData.fullName.replace(/\s+/g, "_")}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    generateAgreement();
    toast.success("Booking confirmed! Your agreement has been downloaded.");
    setSubmitting(false);
    setTimeout(() => onClose(), 2000);
  };

  const steps = ["Terms & Conditions", "Your Details", "Confirm"];

  return (
    <Box
      position="fixed" inset={0} zIndex={200}
      display="flex" alignItems="center" justifyContent="center" p={4}
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Box
        bg="white" w="full" maxW="2xl" maxH="92vh" overflowY="auto"
        borderRadius="2xl" boxShadow="0 32px 80px rgba(0,0,0,0.3)"
        style={{ animation: "bookingSlideIn 0.3s cubic-bezier(0.22,1,0.36,1)" }}
      >
        <style>{`
          @keyframes bookingSlideIn {
            from { opacity: 0; transform: translateY(24px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)     scale(1); }
          }
        `}</style>

        {/* ── HEADER ── */}
        <Box
          px={8} pt={8} pb={6}
          borderBottom="1px solid" borderColor="gray.100"
          style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #0d2818 100%)" }}
          borderTopRadius="2xl"
        >
          <Flex justify="space-between" align="start" mb={5}>
            <Box>
              <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em" color="green.400" mb={1}>
                GRAMTIME VISUALS
              </Text>
              <Heading fontSize="2xl" fontWeight="800" color="white" letterSpacing="-0.02em">
                {packageName}
              </Heading>
              <Text fontSize="sm" color="gray.500" fontWeight="400" mt={1}>{niche} Package</Text>
            </Box>
            <Box
              as="button" onClick={onClose}
              w={9} h={9} borderRadius="lg"
              display="flex" alignItems="center" justifyContent="center"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", color: "white", fontSize: "20px" }}
            >
              ×
            </Box>
          </Flex>

          {/* Step indicator */}
          <Flex align="center" gap={2}>
            {steps.map((label, i) => {
              const num = i + 1;
              const active = step === num;
              const done = step > num;
              return (
                <Flex key={label} align="center" gap={2} flex={i < steps.length - 1 ? "1" : "none"}>
                  <Flex align="center" gap={2} flexShrink={0}>
                    <Flex
                      w={7} h={7} borderRadius="full" align="center" justify="center"
                      fontSize="xs" fontWeight="700"
                      style={{
                        background: done ? "#4ade80" : active ? "#fff" : "rgba(255,255,255,0.1)",
                        color: done ? "#000" : active ? "#000" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {done ? "✓" : num}
                    </Flex>
                    <Text
                      fontSize="xs" fontWeight="600" letterSpacing="0.05em"
                      display={{ base: "none", sm: "block" }}
                      color={active ? "white" : done ? "green.400" : "rgba(255,255,255,0.3)"}
                    >
                      {label}
                    </Text>
                  </Flex>
                  {i < steps.length - 1 && (
                    <Box flex="1" h="1px" style={{ background: done ? "#4ade80" : "rgba(255,255,255,0.1)" }} />
                  )}
                </Flex>
              );
            })}
          </Flex>
        </Box>

        <Box p={8}>

          {/* ══════════════════════════════════════════════════════
              STEP 1 — TERMS & CONDITIONS
          ══════════════════════════════════════════════════════ */}
          {step === 1 && (
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading fontSize="lg" fontWeight="700" color="gray.900" mb={1}>
                  Please Read Before Booking
                </Heading>
                <Text fontSize="sm" color="gray.500" fontWeight="300">
                  Scroll through all terms, then check the box to continue.
                </Text>
              </Box>

              {/* Scrollable terms */}
              <Box
                border="1px solid" borderColor="gray.200" borderRadius="xl"
                maxH="320px" overflowY="auto" p={6}
                onScroll={handleScroll}
                style={{ scrollbarWidth: "thin" }}
              >
                <VStack spacing={5} align="start">
                  {terms.map(([title, body]) => (
                    <Box key={title as string}>
                      <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="green.600" mb={1}>
                        {title}
                      </Text>
                      <Text fontSize="sm" color="gray.600" fontWeight="300" lineHeight="1.7">{body}</Text>
                    </Box>
                  ))}
                </VStack>

                {/* Scroll prompt */}
                {!hasScrolled && (
                  <Flex justify="center" mt={4}>
                    <Text fontSize="xs" color="gray.400" fontWeight="400">↓ Scroll to read all terms</Text>
                  </Flex>
                )}
              </Box>

              {/* Agreement checkbox */}
              <Box
                p={4} borderRadius="xl"
                border="1px solid" borderColor={agreedToTerms ? "green.300" : "gray.200"}
                bg={agreedToTerms ? "green.50" : "gray.50"}
                transition="all 0.2s"
              >
                <HStack align="start" spacing={3}>
                  <Box
                    as="button"
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                    w={5} h={5} borderRadius="md" flexShrink={0} mt="1px"
                    display="flex" alignItems="center" justifyContent="center"
                    style={{
                      background: agreedToTerms ? "#22c55e" : "#fff",
                      border: `2px solid ${agreedToTerms ? "#22c55e" : "#cbd5e0"}`,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {agreedToTerms && <Text color="white" fontSize="10px" fontWeight="900">✓</Text>}
                  </Box>
                  <Text fontSize="sm" color="gray.700" fontWeight="400" lineHeight="1.6">
                    I have read and agree to all the terms and conditions. I understand this is a legally binding agreement between myself and Gramtime Visuals.
                  </Text>
                </HStack>
              </Box>

              <Button
                w="full" py={5} borderRadius="xl"
                bg={agreedToTerms ? "black" : "gray.200"}
                color={agreedToTerms ? "white" : "gray.400"}
                fontWeight="700" letterSpacing="0.1em" fontSize="sm"
                cursor={agreedToTerms ? "pointer" : "not-allowed"}
                _hover={agreedToTerms ? { bg: "gray.800" } : {}}
                transition="all 0.2s"
                onClick={() => {
                  if (!agreedToTerms) { toast.error("Please read and agree to the terms to continue."); return; }
                  setStep(2);
                }}
              >
                I AGREE — CONTINUE TO BOOKING →
              </Button>
            </VStack>
          )}

          {/* ══════════════════════════════════════════════════════
              STEP 2 — CLIENT DETAILS
          ══════════════════════════════════════════════════════ */}
          {step === 2 && (
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading fontSize="lg" fontWeight="700" color="gray.900" mb={1}>Your Details</Heading>
                <Text fontSize="sm" color="gray.500" fontWeight="300">Tell us about your event so we can prepare.</Text>
              </Box>

              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                {[["fullName", "Full Name *", "text"], ["email", "Email Address *", "email"]].map(([name, label, type]) => (
                  <GridItem key={name}>
                    <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="gray.600" mb={2}>{label.toUpperCase()}</Text>
                    <input name={name} type={type} value={(formData as any)[name]} onChange={handleChange}
                      required style={inputStyle} placeholder={label.replace(" *", "")}
                      onFocus={(e) => e.target.style.borderColor = "#22c55e"}
                      onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                  </GridItem>
                ))}
              </Grid>

              <Box>
                <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="gray.600" mb={2}>PHONE NUMBER</Text>
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                  style={inputStyle} placeholder="Phone number"
                  onFocus={(e) => e.target.style.borderColor = "#22c55e"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
              </Box>

              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                {[["eventDate", "Event Date *", "date"], ["eventLocation", "Event Location *", "text"]].map(([name, label, type]) => (
                  <GridItem key={name}>
                    <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="gray.600" mb={2}>{label.toUpperCase()}</Text>
                    <input name={name} type={type} value={(formData as any)[name]} onChange={handleChange}
                      required style={inputStyle} placeholder={label.replace(" *", "")}
                      onFocus={(e) => e.target.style.borderColor = "#22c55e"}
                      onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
                  </GridItem>
                ))}
              </Grid>

              <Box>
                <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="gray.600" mb={2}>ADDITIONAL NOTES</Text>
                <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleChange}
                  rows={4} placeholder="Any special requests or details we should know..."
                  style={{ ...inputStyle, resize: "none", display: "block" }}
                  onFocus={(e) => e.target.style.borderColor = "#22c55e"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"} />
              </Box>

              <HStack spacing={3}>
                <Button flex={1} variant="outline" borderColor="gray.200" color="gray.600"
                  fontWeight="600" letterSpacing="0.05em" py={5} borderRadius="xl"
                  onClick={() => setStep(1)} _hover={{ borderColor: "gray.400" }}>
                  ← BACK
                </Button>
                <Button
                  flex={2} py={5} borderRadius="xl" bg="black" color="white"
                  fontWeight="700" letterSpacing="0.1em" fontSize="sm"
                  _hover={{ bg: "gray.800" }} transition="all 0.2s"
                  onClick={() => {
                    if (!formData.fullName || !formData.email || !formData.eventDate || !formData.eventLocation) {
                      toast.error("Please fill in all required fields.");
                      return;
                    }
                    setStep(3);
                  }}
                >
                  REVIEW BOOKING →
                </Button>
              </HStack>
            </VStack>
          )}

          {/* ══════════════════════════════════════════════════════
              STEP 3 — CONFIRM
          ══════════════════════════════════════════════════════ */}
          {step === 3 && (
            <VStack spacing={5} align="stretch">
              <Box>
                <Heading fontSize="lg" fontWeight="700" color="gray.900" mb={1}>Review & Confirm</Heading>
                <Text fontSize="sm" color="gray.500" fontWeight="300">Check your details before confirming.</Text>
              </Box>

              {/* Package summary */}
              <Box
                p={5} borderRadius="xl"
                style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #0d2818 100%)" }}
              >
                <Text fontSize="xs" fontWeight="700" letterSpacing="0.2em" color="green.400" mb={2}>SELECTED PACKAGE</Text>
                <Text fontSize="xl" fontWeight="800" color="white">{packageName}</Text>
                <Text fontSize="sm" color="gray.500" mt={1}>{niche} Package</Text>
              </Box>

              {/* Details grid */}
              <Grid templateColumns="1fr 1fr" gap={3}>
                {[
                  ["Name", formData.fullName],
                  ["Email", formData.email],
                  ["Phone", formData.phone || "—"],
                  ["Event Date", formData.eventDate],
                  ["Location", formData.eventLocation],
                ].map(([label, value]) => (
                  <Box key={label} p={4} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.100">
                    <Text fontSize="10px" fontWeight="700" letterSpacing="0.15em" color="gray.400" mb={1}>{label.toUpperCase()}</Text>
                    <Text fontSize="sm" fontWeight="600" color="gray.900" noOfLines={1}>{value}</Text>
                  </Box>
                ))}
                {formData.additionalNotes && (
                  <Box gridColumn="span 2" p={4} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.100">
                    <Text fontSize="10px" fontWeight="700" letterSpacing="0.15em" color="gray.400" mb={1}>NOTES</Text>
                    <Text fontSize="sm" fontWeight="400" color="gray.700">{formData.additionalNotes}</Text>
                  </Box>
                )}
              </Grid>

              {/* Agreement notice */}
              <Box p={4} borderRadius="xl" bg="green.50" border="1px solid" borderColor="green.200">
                <HStack spacing={3}>
                  <Box w={5} h={5} borderRadius="full" bg="green.500" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                    <Text color="white" fontSize="10px" fontWeight="900">✓</Text>
                  </Box>
                  <Text fontSize="sm" color="green.800" fontWeight="400" lineHeight="1.6">
                    You agreed to the Terms & Conditions. Your agreement document will be automatically downloaded upon confirmation.
                  </Text>
                </HStack>
              </Box>

              <HStack spacing={3}>
                <Button flex={1} variant="outline" borderColor="gray.200" color="gray.600"
                  fontWeight="600" letterSpacing="0.05em" py={5} borderRadius="xl"
                  onClick={() => setStep(2)} _hover={{ borderColor: "gray.400" }}>
                  ← BACK
                </Button>
                <Button
                  flex={2} py={5} borderRadius="xl" bg="green.500" color="black"
                  fontWeight="800" letterSpacing="0.1em" fontSize="sm"
                  loading={submitting} _hover={{ bg: "green.400" }} transition="all 0.2s"
                  onClick={handleSubmit}
                >
                  CONFIRM BOOKING ✓
                </Button>
              </HStack>
            </VStack>
          )}

        </Box>
      </Box>
    </Box>
  );
}
