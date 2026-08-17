import { useState } from "react";
import { Box, Heading, Text, Button, VStack, HStack, Grid, GridItem, Flex } from "@chakra-ui/react";
import { BookingForm } from "./BookingForm";

interface ServicesProps {
  fullPage?: boolean;
}

export function Services({ fullPage = false }: ServicesProps) {
  const [booking, setBooking] = useState<{ packageName: string; niche: string } | null>(null);

  const openBooking = (packageName: string, niche: string) => setBooking({ packageName, niche });
  return (
    <Box minH={fullPage ? "100vh" : "auto"} pt={fullPage ? 24 : 0} pb={20} bg="gray.50">
      {booking && (
        <BookingForm
          packageName={booking.packageName}
          niche={booking.niche}
          onClose={() => setBooking(null)}
        />
      )}
      <Box maxW="7xl" mx="auto" px={{ base: 4, lg: 8 }}>

        {/* Header */}
        <VStack textAlign="center" mb={14} spacing={4}>
          <Text fontSize="xs" fontWeight="400" letterSpacing="0.4em" color="green.500" textTransform="uppercase">
            What We Offer
          </Text>
          <Heading fontSize={{ base: "3xl", md: "5xl" }} fontWeight="800" letterSpacing="-0.02em" color="gray.900">
            Packages & Pricing
          </Heading>
          <Text fontSize="lg" color="gray.500" fontWeight="300" maxW="2xl" mx="auto" lineHeight="1.8">
            From intimate studio sessions to grand multi-day celebrations — every package is built around your story.
          </Text>
        </VStack>

        {/* ── BENTO GRID ── */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(6, 1fr)" }}
          templateRows={{ base: "auto", md: "repeat(5, auto)" }}
          gap={4}
        >

          {/* 1 — STUDIO  (2 cols, tall) */}
          <GridItem colSpan={{ base: 1, md: 2 }} rowSpan={{ base: 1, md: 2 }}>
            <Box
              h="full" minH="280px" bg="white" borderRadius="2xl" p={8}
              border="1px solid" borderColor="gray.200"
              position="relative" overflow="hidden"
              transition="all 0.3s" _hover={{ shadow: "xl", borderColor: "green.300", transform: "translateY(-4px)" }}
              cursor="pointer"
            >
              {/* decorative circle */}
              <Box position="absolute" bottom="-40px" right="-40px" w="160px" h="160px"
                borderRadius="full" bg="green.50" opacity={0.6} />
              <VStack align="start" spacing={4} h="full" justify="space-between" position="relative">
                <Box>
                  <Box bg="green.100" color="green.700" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="600" letterSpacing="0.1em" display="inline-block" mb={4}>
                    STUDIO
                  </Box>
                  <Heading fontSize="2xl" fontWeight="700" color="gray.900" mb={2}>Portrait Sessions</Heading>
                  <Text fontSize="sm" color="gray.500" fontWeight="300" lineHeight="1.7">
                    Perfect for personal portraits and creative shoots. Costume changes welcome.
                  </Text>
                </Box>
                <VStack align="start" spacing={2} w="full">
                  {[["5 photos", "GH₵ 150"], ["10 photos", "GH₵ 300"], ["15 photos", "GH₵ 450"]].map(([label, price]) => (
                    <Flex key={label} justify="space-between" w="full" borderBottom="1px dashed" borderColor="gray.100" pb={1}>
                      <Text fontSize="sm" color="gray.600" fontWeight="300">{label}</Text>
                      <Text fontSize="sm" color="gray.900" fontWeight="600">{price}</Text>
                    </Flex>
                  ))}
                  <Text fontSize="xs" color="green.600" fontWeight="500" pt={1}>From GH₵ 150</Text>
                  <Button w="full" mt={4} bg="black" color="white" fontWeight="400" letterSpacing="0.1em"
                    borderRadius="xl" py={4} fontSize="sm" _hover={{ bg: "gray.800" }} transition="all 0.3s"
                    onClick={() => openBooking("Studio Portrait", "Studio")}>
                    BOOK SESSION
                  </Button>
                </VStack>
              </VStack>
            </Box>
          </GridItem>

          {/* 2 — OUTDOOR  (2 cols, tall) */}
          <GridItem colSpan={{ base: 1, md: 2 }} rowSpan={{ base: 1, md: 2 }}>
            <Box
              h="full" minH="280px" bg="gray.900" borderRadius="2xl" p={8}
              position="relative" overflow="hidden"
              transition="all 0.3s" _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
              cursor="pointer"
            >
              <Box position="absolute" top="-30px" left="-30px" w="140px" h="140px"
                borderRadius="full" bg="green.500" opacity={0.08} />
              <VStack align="start" spacing={4} h="full" justify="space-between" position="relative">
                <Box>
                  <Box style={{ background: "rgba(255,255,255,0.15)" }} color="white" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="600" letterSpacing="0.1em" display="inline-block" mb={4}>
                    OUTDOOR
                  </Box>
                  <Heading fontSize="2xl" fontWeight="700" color="white" mb={2}>On-Location Sessions</Heading>
                  <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.65)" }} fontWeight="300" lineHeight="1.7">
                    Curated outdoor settings. Costume changes welcome.
                  </Text>
                </Box>
                <VStack align="start" spacing={2} w="full">
                  {[["5 photos", "GH₵ 300"], ["10 photos", "GH₵ 450"], ["15 photos", "GH₵ 600"]].map(([label, price]) => (
                    <Flex key={label} justify="space-between" w="full" borderBottom="1px dashed" style={{ borderColor: "rgba(255,255,255,0.15)" }} pb={1}>
                      <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.65)" }} fontWeight="300">{label}</Text>
                      <Text fontSize="sm" color="white" fontWeight="600">{price}</Text>
                    </Flex>
                  ))}
                  <Text fontSize="xs" color="green.400" fontWeight="500" pt={1}>From GH₵ 300</Text>
                  <Button w="full" mt={4} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
                    color="white" fontWeight="400" letterSpacing="0.1em"
                    borderRadius="xl" py={4} fontSize="sm" _hover={{ style: { background: "rgba(255,255,255,0.25)" } }} transition="all 0.3s"
                    onClick={() => openBooking("Outdoor Portrait", "Outdoor")}>
                    BOOK SESSION
                  </Button>
                </VStack>
              </VStack>
            </Box>
          </GridItem>

          {/* 3 — EVENT COVERAGE  (2 cols, tall) */}
          <GridItem colSpan={{ base: 1, md: 2 }} rowSpan={{ base: 1, md: 2 }}>
            <Box
              h="full" minH="280px" borderRadius="2xl" p={8}
              bgGradient="linear(135deg, green.500 0%, green.700 100%)"
              position="relative" overflow="hidden"
              transition="all 0.3s" _hover={{ shadow: "2xl", transform: "translateY(-4px)" }}
              cursor="pointer"
            >
              <Box position="absolute" bottom="-20px" right="-20px" w="180px" h="180px"
                borderRadius="full" bg="white" opacity={0.06} />
              <VStack align="start" spacing={4} h="full" justify="space-between" position="relative">
                <Box>
                  <Box style={{ background: "rgba(255,255,255,0.2)" }} color="white" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="600" letterSpacing="0.1em" display="inline-block" mb={4}>
                    EVENT COVERAGE
                  </Box>
                  <Heading fontSize="2xl" fontWeight="700" color="white" mb={2}>Full-Day Events</Heading>
                  <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.8)" }} fontWeight="300" lineHeight="1.7">
                    Cinematic quality documentation for any event, any scale.
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="4xl" fontWeight="800" color="white" lineHeight="1">GH₵ 1,000</Text>
                  <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.65)" }} fontWeight="300" mb={4}>per day</Text>
                  <VStack align="start" spacing={1} fontSize="xs" style={{ color: "rgba(255,255,255,0.8)" }} fontWeight="300">
                    <Text>✓ 250+ edited images & video</Text>
                    <Text>✓ 1 photographer & 1 cinematographer</Text>
                    <Text>✓ Customized online gallery</Text>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </GridItem>

          {/* 4 — BASIC WEDDING  (3 cols, tall) */}
          <GridItem colSpan={{ base: 1, md: 3 }} rowSpan={{ base: 1, md: 3 }}>
            <Box
              h="full" minH="380px" bg="white" borderRadius="2xl" p={10}
              border="1px solid" borderColor="gray.200"
              position="relative" overflow="hidden"
              transition="all 0.35s" _hover={{ shadow: "2xl", borderColor: "green.400", transform: "translateY(-6px)" }}
              cursor="pointer"
            >
              {/* Most popular badge */}
              <Box position="absolute" top={5} right={5} bg="black" color="white"
                px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="600" letterSpacing="0.1em">
                MOST POPULAR
              </Box>
              <Box position="absolute" bottom="-60px" right="-60px" w="240px" h="240px"
                borderRadius="full" bg="green.50" opacity={0.5} />

              <VStack align="start" spacing={6} h="full" justify="space-between" position="relative">
                <Box>
                  <Box bg="gray.100" color="gray.700" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="600" letterSpacing="0.1em" display="inline-block" mb={5}>
                    BASIC WEDDING
                  </Box>
                  <Text fontSize="5xl" fontWeight="800" color="gray.900" lineHeight="1">GH₵ 4,500</Text>
                  <Text fontSize="sm" color="gray.500" fontWeight="300" mt={2} mb={6} lineHeight="1.7">
                    Elegant one-day wedding coverage capturing every cherished moment.
                  </Text>
                  <VStack align="start" spacing={3}>
                    {[
                      "Full length high quality film",
                      "3-minute cinematic video trailer",
                      "150+ edited images & video on flash drive",
                      "12\"×15\" borderless framed print",
                      "1 photographer & 1 cinematographer",
                    ].map((f) => (
                      <HStack key={f} spacing={3}>
                        <Box w={5} h={5} borderRadius="full" bg="green.100" display="flex" alignItems="center" justifyContent="center" flexShrink={0} className="check-circle">
                          <Text fontSize="10px" color="green.600" className="icon-check">✓</Text>
                        </Box>
                        <Text fontSize="sm" color="gray.600" fontWeight="300">{f}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
                <Button w="full" bg="black" color="white" fontWeight="400" letterSpacing="0.1em"
                  borderRadius="xl" py={5} _hover={{ bg: "gray.800" }} transition="all 0.3s"
                  onClick={() => openBooking("Basic Wedding", "Wedding")}>
                  BOOK THIS PACKAGE
                </Button>
              </VStack>
            </Box>
          </GridItem>

          {/* 5 — DIAMOND WEDDING  (3 cols, tall) */}
          <GridItem colSpan={{ base: 1, md: 3 }} rowSpan={{ base: 1, md: 3 }}>
            <Box
              h="full" minH="380px" borderRadius="2xl" p={10}
              style={{ background: "linear-gradient(160deg, #0f0f0f 0%, #1a1a1a 50%, #0d2818 100%)" }}
              position="relative" overflow="hidden"
              transition="all 0.35s" _hover={{ shadow: "2xl", transform: "translateY(-6px)" }}
              cursor="pointer"
            >
              {/* Glow orbs */}
              <Box position="absolute" top="-40px" right="-40px" w="220px" h="220px"
                borderRadius="full" style={{ background: "radial-gradient(circle, rgba(34,197,94,0.25) 0%, transparent 70%)" }} />
              <Box position="absolute" bottom="-60px" left="-40px" w="200px" h="200px"
                borderRadius="full" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%)" }} />

              <VStack align="start" spacing={6} h="full" justify="space-between" position="relative">
                <Box>
                  <HStack mb={5} spacing={2}>
                    <Box bg="green.500" color="white" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="600" letterSpacing="0.1em">
                      DIAMOND WEDDING
                    </Box>
                    <Box style={{ background: "rgba(255,255,255,0.1)" }} color="white" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="400" opacity={0.8}>
                      Premium
                    </Box>
                  </HStack>
                  <Text fontSize="5xl" fontWeight="800" color="white" lineHeight="1">GH₵ 7,500</Text>
                  <Text fontSize="sm" style={{ color: "rgba(255,255,255,0.55)" }} fontWeight="300" mt={2} mb={6} lineHeight="1.7">
                    Premium wedding collection with every luxury detail included.
                  </Text>
                  <Grid templateColumns="1fr 1fr" gap={2}>
                    {[
                      "Full length high quality film",
                      "5-min cinematic trailer",
                      "250+ edited images",
                      "12\"×15\" framed print",
                      "Drone aerial coverage",
                      "Second shooter included",
                      "Engagement session",
                      "15-page 12\"×24\" photobook",
                      "Customized online gallery",
                      "USB drive with all images",
                      "Professional color grading",
                      "1-year online gallery",
                    ].map((f) => (
                      <HStack key={f} spacing={2} align="start">
                        <Text color="green.400" fontSize="xs" mt="2px" flexShrink={0} className="icon-check">✓</Text>
                        <Text fontSize="xs" style={{ color: "rgba(255,255,255,0.65)" }} fontWeight="300" lineHeight="1.5">{f}</Text>
                      </HStack>
                    ))}
                  </Grid>
                </Box>
                <Button w="full" bg="green.500" color="white" fontWeight="400" letterSpacing="0.1em"
                  borderRadius="xl" py={5} _hover={{ bg: "green.600" }} transition="all 0.3s"
                  onClick={() => openBooking("Diamond Wedding", "Wedding")}>
                  BOOK THIS PACKAGE
                </Button>
              </VStack>
            </Box>
          </GridItem>

          {/* 6 — PRE-WEDDING NOTE  (2 cols) */}
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Box h="full" minH="120px" bg="green.500" borderRadius="2xl" p={7}
              display="flex" alignItems="center" justifyContent="center" textAlign="center">
              <Text fontSize="sm" color="white" fontWeight="400" lineHeight="1.7" fontStyle="italic">
                Pre-wedding sessions available at a <strong>discounted rate</strong> when booked with any wedding package.
              </Text>
            </Box>
          </GridItem>

          {/* 7 — BESPOKE  (4 cols) */}
          <GridItem colSpan={{ base: 1, md: 4 }}>
            <Box
              h="full" minH="120px" bg="white" borderRadius="2xl" p={7}
              border="1px solid" borderColor="gray.200"
              display="flex" alignItems="center" justifyContent="space-between"
              gap={6} flexDirection={{ base: "column", sm: "row" }}
              transition="all 0.3s" _hover={{ shadow: "lg", borderColor: "green.300" }}
              cursor="pointer"
            >
              <Box>
                <HStack mb={2} spacing={2}>
                  <Box w={2} h={2} borderRadius="full" bg="green.500" />
                  <Text fontSize="xs" fontWeight="600" letterSpacing="0.2em" color="green.600">BESPOKE EXPERIENCES</Text>
                </HStack>
                <Heading fontSize="xl" fontWeight="700" color="gray.900" mb={1}>Custom Multi-Day Packages</Heading>
                <Text fontSize="sm" color="gray.500" fontWeight="300" lineHeight="1.7" maxW="lg">
                  Drone coverage, extra photographers, and content creators available as add-ons. Built entirely around your event's scope.
                </Text>
              </Box>
              <Button flexShrink={0} bg="black" color="white" fontWeight="400" letterSpacing="0.1em"
                borderRadius="xl" px={8} py={5} _hover={{ bg: "gray.800" }} transition="all 0.3s"
                onClick={() => openBooking("Bespoke Experience", "Custom")}>
                GET A QUOTE <Box as="span" className="icon-arrow" ml={1}>→</Box>
              </Button>
            </Box>
          </GridItem>

        </Grid>
      </Box>
    </Box>
  );
}
