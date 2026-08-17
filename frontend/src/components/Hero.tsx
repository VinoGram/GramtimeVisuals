import { Box, Flex, Heading, Text, Button, VStack, HStack } from "@chakra-ui/react";

interface HeroProps {
  setCurrentSection: (section: string) => void;
}

export function Hero({ setCurrentSection }: HeroProps) {
  return (
    <Box position="relative" minH="100vh" display="flex" alignItems="center" justifyContent="center" overflow="hidden">
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(34, 197, 94, 0.15) 50%, rgba(0, 0, 0, 0.9) 100%)"
        _after={{
          content: '""',
          position: "absolute",
          inset: 0,
          bg: "radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 70%)",
        }}
      />

      <VStack position="relative" zIndex={10} textAlign="center" color="white" px={6} maxW="4xl" mx="auto" spacing={8}>
        <Heading
          fontSize={{ base: "5xl", md: "7xl", lg: "8xl" }}
          fontWeight="300"
          letterSpacing="0.2em"
          lineHeight="1.2"
          animation="fadeIn 1.5s ease-in"
        >
          LUXURY
          <br />
          <Text as="span" fontWeight="100" fontStyle="italic" color="elegant.green">
            REDEFINED
          </Text>
        </Heading>

        <Text
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="300"
          letterSpacing="0.05em"
          maxW="2xl"
          mx="auto"
          opacity={0.9}
          lineHeight="1.8"
        >
          Capturing the extraordinary moments that define your legacy through timeless artistry and uncompromising excellence
        </Text>

        <HStack spacing={6} flexDirection={{ base: "column", sm: "row" }} pt={4}>
          <Button
            onClick={() => setCurrentSection("portfolio")}
            variant="elegantGreen"
            size="lg"
            px={8}
            py={6}
            fontSize="sm"
            letterSpacing="0.15em"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "0 12px 40px rgba(34, 197, 94, 0.4)",
            }}
          >
            VIEW PORTFOLIO
          </Button>

          <Button
            onClick={() => setCurrentSection("contact")}
            variant="glass"
            size="lg"
            px={8}
            py={6}
            fontSize="sm"
            letterSpacing="0.15em"
          >
            BEGIN YOUR JOURNEY
          </Button>
        </HStack>

        <VStack
          position="absolute"
          bottom={8}
          left="50%"
          transform="translateX(-50%)"
          spacing={4}
          opacity={0.7}
        >
          <Box
            w="1px"
            h={16}
            bg="whiteAlpha.500"
            animation="pulse 2s ease-in-out infinite"
          />
          <Text fontSize="xs" fontWeight="300" letterSpacing="0.2em">
            SCROLL TO EXPLORE
          </Text>
        </VStack>
      </VStack>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  );
}
