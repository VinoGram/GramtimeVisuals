import { useState } from "react";
import { toast } from "sonner";
import { Box, Flex, Heading, Text, Button, HStack, Grid, GridItem, Input } from "@chakra-ui/react";

const socials = [
  {
    label: "IG",
    href: "#",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TW",
    href: "#",
    icon: (
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YT",
    href: "#",
    icon: (
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "TK",
    href: "#",
    icon: (
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
  },
];

const services = ["Wedding Photography", "Engagement Sessions", "Portrait Photography", "Corporate Events", "Event Coverage", "Bespoke Experiences"];
const company  = ["About Gramtime", "The Process", "Packages & Pricing", "Client Gallery", "Journal", "Inquire"];

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're in! Welcome to the Gramtime circle.");
    setEmail("");
  };

  return (
    <Box as="footer" bg="#0a0a0a" color="white" pt={16} pb={8} px={{ base: 4, lg: 8 }}>
      <Box maxW="7xl" mx="auto">

        {/* ── TOP BENTO GRID ─────────────────────────────────────────── */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(6, 1fr)" }}
          gap={4}
          mb={4}
        >
          {/* Brand tile — wide */}
          <GridItem colSpan={{ base: 1, md: 3 }}>
            <Box
              bg="#111" borderRadius="2xl" p={8} h="full" minH="260px"
              position="relative" overflow="hidden"
              border="1px solid" borderColor="whiteAlpha.100"
            >
              {/* Glow */}
              <Box position="absolute" top="-60px" left="-60px" w="200px" h="200px" borderRadius="full"
                style={{ background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)" }} />

              <Flex direction="column" h="full" justify="space-between" position="relative">
                <Box>
                  <Box display="inline-flex" alignItems="center" gap={2} mb={6}>
                    <Box w={2} h={2} borderRadius="full" bg="green.400" className="status-dot" />
                    <Text fontSize="xs" color="green.400" fontWeight="600" letterSpacing="0.3em">
                      ACCRA, GHANA
                    </Text>
                  </Box>
                  <Heading
                    fontSize={{ base: "3xl", md: "4xl" }}
                    fontWeight="800"
                    letterSpacing="-0.02em"
                    lineHeight="1.1"
                    mb={4}
                  >
                    GRAMTIME<br />
                    <Box as="span" color="green.400">VISUALS</Box>
                  </Heading>
                  <Text color="gray.500" fontSize="sm" fontWeight="300" lineHeight="1.8" maxW="sm">
                    Storytellers, artists, and memory keepers. Crafting visual narratives that transcend time.
                  </Text>
                </Box>

                {/* Social icons */}
                <HStack spacing={3} mt={8}>
                  {socials.map((s) => (
                    <Box
                      key={s.label}
                      as="a" href={s.href}
                      w={10} h={10} borderRadius="xl"
                      border="1px solid" borderColor="whiteAlpha.200"
                      display="flex" alignItems="center" justifyContent="center"
                      color="gray.400"
                      transition="all 0.2s"
                      className="social-icon-btn"
                      _hover={{ bg: "green.500", color: "white", borderColor: "green.500", transform: "translateY(-4px) rotate(-8deg)" }}
                    >
                      {s.icon}
                    </Box>
                  ))}
                </HStack>
              </Flex>
            </Box>
          </GridItem>

          {/* Newsletter tile */}
          <GridItem colSpan={{ base: 1, md: 3 }}>
            <Box
              bg="green.500" borderRadius="2xl" p={8} h="full" minH="260px"
              position="relative" overflow="hidden"
            >
              <Box position="absolute" bottom="-40px" right="-40px" w="180px" h="180px" borderRadius="full"
                style={{ background: "rgba(0,0,0,0.1)" }} />
              <Flex direction="column" h="full" justify="space-between" position="relative">
                <Box>
                  <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em" color="green.900" mb={3}>
                    NEWSLETTER
                  </Text>
                  <Heading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800" color="black" lineHeight="1.2" mb={3}>
                    Stay in the<br />loop.
                  </Heading>
                  <Text fontSize="sm" color="green.900" fontWeight="500" lineHeight="1.7">
                    New work, behind-the-scenes, and exclusive early access — straight to your inbox.
                  </Text>
                </Box>
                <Box as="form" onSubmit={handleSubmit} mt={6}>
                  <Flex gap={2}>
                    <Input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com" required
                      bg="black" color="white" border="none"
                      borderRadius="xl" px={4} py={3} fontSize="sm" fontWeight="500"
                      _placeholder={{ color: "gray.500" }} _focus={{ outline: "none", ring: "none" }}
                      flex="1"
                    />
                    <Button
                      type="submit" bg="black" color="white" borderRadius="xl"
                      px={5} fontWeight="700" fontSize="sm"
                      _hover={{ bg: "gray.900" }} flexShrink={0}
                    >
                      →
                    </Button>
                  </Flex>
                </Box>
              </Flex>
            </Box>
          </GridItem>

          {/* Services tile */}
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Box bg="#111" borderRadius="2xl" p={7} h="full"
              border="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em" color="gray.500" mb={5}>
                SERVICES
              </Text>
              <Flex direction="column" gap={3}>
                {services.map((s) => (
                  <Flex key={s} align="center" justify="space-between" role="group" cursor="pointer"
                    _hover={{ color: "green.400" }} transition="color 0.2s">
                    <Text fontSize="sm" fontWeight="500" color="gray.300" _groupHover={{ color: "green.400" }} transition="color 0.2s">
                      {s}
                    </Text>
                    <Text fontSize="xs" color="gray.600" _groupHover={{ color: "green.400" }} transition="color 0.2s" className="icon-arrow">↗</Text>
                  </Flex>
                ))}
              </Flex>
            </Box>
          </GridItem>

          {/* Company tile */}
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Box bg="#111" borderRadius="2xl" p={7} h="full"
              border="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em" color="gray.500" mb={5}>
                COMPANY
              </Text>
              <Flex direction="column" gap={3}>
                {company.map((c) => (
                  <Flex key={c} align="center" justify="space-between" role="group" cursor="pointer"
                    _hover={{ color: "green.400" }} transition="color 0.2s">
                    <Text fontSize="sm" fontWeight="500" color="gray.300" _groupHover={{ color: "green.400" }} transition="color 0.2s">
                      {c}
                    </Text>
                    <Text fontSize="xs" color="gray.600" _groupHover={{ color: "green.400" }} transition="color 0.2s" className="icon-arrow">↗</Text>
                  </Flex>
                ))}
              </Flex>
            </Box>
          </GridItem>

          {/* Contact CTA tile */}
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Box
              bg="#0d2818" borderRadius="2xl" p={7} h="full"
              border="1px solid" borderColor="green.900"
              position="relative" overflow="hidden"
            >
              <Box position="absolute" bottom="-30px" right="-30px" w="120px" h="120px" borderRadius="full"
                style={{ background: "radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%)" }} />
              <Flex direction="column" h="full" justify="space-between" position="relative">
                <Box>
                  <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em" color="green.600" mb={4}>
                    READY TO BOOK?
                  </Text>
                  <Heading fontSize="xl" fontWeight="800" color="white" lineHeight="1.3" mb={3}>
                    Let's create something extraordinary.
                  </Heading>
                  <Text fontSize="sm" color="green.700" fontWeight="400" lineHeight="1.7">
                    Reach out and we'll respond within 24 hours.
                  </Text>
                </Box>
                <Button
                  mt={6} bg="green.500" color="black" fontWeight="700" fontSize="sm"
                  borderRadius="xl" px={6} py={5} w="full"
                  _hover={{ bg: "green.400", transform: "translateY(-2px)" }} transition="all 0.2s"
                >
                  GET IN TOUCH →
                </Button>
              </Flex>
            </Box>
          </GridItem>
        </Grid>

        {/* ── BOTTOM BAR ─────────────────────────────────────────────── */}
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center" justify="space-between"
          pt={6} mt={2}
          borderTop="1px solid" borderColor="whiteAlpha.100"
          gap={4}
        >
          <Text fontSize="xs" color="gray.600" fontWeight="400">
            © {new Date().getFullYear()} Gramtime Visuals. All rights reserved.
          </Text>

          <HStack spacing={1}>
            {["Privacy", "Terms", "Cookies", "Licensing"].map((item, i, arr) => (
              <HStack key={item} spacing={1}>
                <Text
                  as="a" href="#" fontSize="xs" color="gray.600" fontWeight="400"
                  _hover={{ color: "white" }} transition="color 0.2s" cursor="pointer"
                >
                  {item}
                </Text>
                {i < arr.length - 1 && <Text fontSize="xs" color="gray.700">·</Text>}
              </HStack>
            ))}
          </HStack>

          <HStack spacing={2}>
            <Box w={1.5} h={1.5} borderRadius="full" bg="green.400" />
            <Text fontSize="xs" color="gray.600" fontWeight="400">
              Available for bookings
            </Text>
          </HStack>
        </Flex>

      </Box>
    </Box>
  );
}
