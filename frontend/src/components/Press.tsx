import { useEffect, useState } from "react";
import { Box, Flex, Heading, Text, Grid, VStack } from "@chakra-ui/react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TYPE_COLOR: Record<string, string> = {
  feature: "#818cf8",
  award: "#fbbf24",
  partner: "#4ade80",
};

const TYPE_LABEL: Record<string, string> = {
  feature: "PRESS FEATURE",
  award: "AWARD",
  partner: "PARTNER",
};

export function Press() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/press/public`)
      .then(r => r.json())
      .then(({ pressItems }) => { if (pressItems?.length) setItems(pressItems); })
      .catch(() => {});
  }, []);

  const features = items.filter(i => i.type === "feature");
  const awards   = items.filter(i => i.type === "award");
  const partners = items.filter(i => i.type === "partner");

  if (items.length === 0) return null;

  return (
    <Box as="section" py={24} bg="#0a0a0a" color="white">
      <Box maxW="7xl" mx="auto" px={{ base: 6, lg: 8 }}>

        {/* Header */}
        <VStack mb={16} gap={4} textAlign="center">
          <Text fontSize="xs" fontWeight={700} letterSpacing="0.4em" color="green.400"
            style={{ fontFamily: "monospace" }}>
            ◈ PRESS & RECOGNITION
          </Text>
          <Heading
            fontSize={{ base: "4xl", md: "6xl" }} fontWeight={900}
            letterSpacing="-0.03em" lineHeight={0.9} color="white"
          >
            AS SEEN IN
          </Heading>
          <Box h="2px" w="80px" bg="green.400" />
        </VStack>

        {/* Features */}
        {features.length > 0 && (
          <Box mb={16}>
            <Text fontSize="xs" fontWeight={700} letterSpacing="0.3em" color="gray.500"
              mb={8} style={{ fontFamily: "monospace" }}>
              PRESS FEATURES
            </Text>
            <Grid templateColumns={{ base: "repeat(2,1fr)", md: "repeat(3,1fr)", lg: "repeat(4,1fr)" }} gap={4}>
              {features.map(item => (
                <Box
                  key={item.id}
                  p={6}
                  style={{
                    background: "rgba(129,140,248,0.05)",
                    border: "1px solid rgba(129,140,248,0.2)",
                    borderRadius: 12,
                  }}
                >
                  <Text fontSize="xs" fontWeight={700} letterSpacing="0.2em"
                    color="#818cf8" mb={2} style={{ fontFamily: "monospace" }}>
                    {item.year || "—"}
                  </Text>
                  <Text fontSize="md" fontWeight={700} color="white" mb={1}>{item.name}</Text>
                  {item.note && <Text fontSize="xs" color="gray.500" fontWeight={300}>{item.note}</Text>}
                </Box>
              ))}
            </Grid>
          </Box>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <Box mb={16}>
            <Text fontSize="xs" fontWeight={700} letterSpacing="0.3em" color="gray.500"
              mb={8} style={{ fontFamily: "monospace" }}>
              AWARDS & HONORS
            </Text>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }} gap={4}>
              {awards.map(item => (
                <Flex
                  key={item.id}
                  align="center" gap={4} p={6}
                  style={{
                    background: "rgba(251,191,36,0.05)",
                    border: "1px solid rgba(251,191,36,0.2)",
                    borderRadius: 12,
                  }}
                >
                  <Box
                    w={10} h={10} borderRadius="full" flexShrink={0}
                    style={{ background: "rgba(251,191,36,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Text fontSize="lg">🏆</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight={700} color="white">{item.name}</Text>
                    {item.year && <Text fontSize="xs" color="#fbbf24" fontWeight={600}>{item.year}</Text>}
                    {item.note && <Text fontSize="xs" color="gray.500" mt={1}>{item.note}</Text>}
                  </Box>
                </Flex>
              ))}
            </Grid>
          </Box>
        )}

        {/* Partners */}
        {partners.length > 0 && (
          <Box>
            <Text fontSize="xs" fontWeight={700} letterSpacing="0.3em" color="gray.500"
              mb={8} style={{ fontFamily: "monospace" }}>
              PREFERRED PARTNERS
            </Text>
            <Flex gap={4} flexWrap="wrap">
              {partners.map(item => (
                <Box
                  key={item.id}
                  px={5} py={3}
                  style={{
                    background: "rgba(74,222,128,0.05)",
                    border: "1px solid rgba(74,222,128,0.2)",
                    borderRadius: 8,
                  }}
                >
                  <Text fontSize="sm" fontWeight={700} color="green.400">{item.name}</Text>
                  {item.note && <Text fontSize="xs" color="gray.600" mt={0.5}>{item.note}</Text>}
                </Box>
              ))}
            </Flex>
          </Box>
        )}

      </Box>
    </Box>
  );
}
