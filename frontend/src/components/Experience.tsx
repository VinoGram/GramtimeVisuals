import { useState } from "react";
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  Grid, 
  GridItem,
  Card,
  CardBody,
  Icon,
  Image
} from "@chakra-ui/react";

interface ExperienceProps {
  setCurrentSection?: (section: string) => void;
}

export function Experience({ setCurrentSection }: ExperienceProps = {}) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <Box minH="100vh">
      {/* Hero Section */}
      <Box position="relative" h="100vh" display="flex" alignItems="center" justifyContent="center" overflow="hidden">
        <Box position="absolute" inset={0}>
          <Image
            src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920"
            alt="Gramtime Visuals Experience"
            w="full"
            h="full"
            objectFit="cover"
          />
          <Box position="absolute" inset={0} bg="blackAlpha.600" />
        </Box>
        
        <VStack position="relative" zIndex={10} textAlign="center" color="white" px={6} spacing={8}>
          <Heading
            fontSize={{ base: "4xl", md: "6xl" }}
            fontFamily="heading"
            fontWeight="300"
            letterSpacing="0.2em"
            color="white"
            lineHeight="1.2"
          >
            THE GRAMTIME VISUALS EXPERIENCE
          </Heading>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="300"
            maxW="3xl"
            mx="auto"
            color="whiteAlpha.900"
            lineHeight="1.8"
          >
            A multimedia journey through artistry, elegance, and timeless storytelling
          </Text>
          <Button
            onClick={() => setCurrentSection?.("consultation")}
            bg="green.500"
            color="white"
            size="lg"
            px={8}
            py={6}
            _hover={{ bg: "green.600" }}
          >
            RESERVE YOUR CONSULTATION
          </Button>
        </VStack>
      </Box>

      {/* Brand Story */}
      <Box py={24} px={{ base: 6, lg: 8 }} maxW="7xl" mx="auto">
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={16} alignItems="center">
          <VStack align="start" spacing={6}>
            <Heading
              fontSize={{ base: "3xl", md: "4xl" }}
              fontFamily="heading"
              fontWeight="300"
              letterSpacing="0.2em"
              color="black"
            >
              WHO WE ARE
            </Heading>
            <Text fontSize="lg" fontWeight="300" color="gray.700" lineHeight="1.8">
              GRAMTIME VISUALS is more than a photography studio—we are storytellers, 
              artists, and memory keepers. For over a decade, we've been crafting visual 
              narratives that transcend time, capturing the essence of life's most precious moments.
            </Text>
          </VStack>
          <Box position="relative" h="600px">
            <Image
              src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800"
              alt="Gramtime Visuals Studio"
              w="full"
              h="full"
              objectFit="cover"
              borderRadius="lg"
              boxShadow="2xl"
            />
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}