import { Box, Heading, Text, VStack, Grid, GridItem, Image } from "@chakra-ui/react";

interface AboutProps {
  fullPage?: boolean;
}

export function About({ fullPage = false }: AboutProps) {
  return (
    <Box minH={fullPage ? "100vh" : "auto"} pt={fullPage ? 24 : 0} pb={16} bg="white">
      <Box maxW="7xl" mx="auto" px={{ base: 6, lg: 8 }}>
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={16} alignItems="center">
          <GridItem order={{ base: 2, lg: 1 }}>
            <Box aspectRatio="4/5" bg="gray.100">
              <Image
                src="/api/placeholder/600/750"
                alt="Alexandra Sterling"
                w="full"
                h="full"
                objectFit="cover"
              />
            </Box>
          </GridItem>

          <GridItem order={{ base: 1, lg: 2 }}>
            <VStack align="start" gap={8}>
              <Heading
                fontSize={{ base: "3xl", md: "4xl" }}
                fontFamily="heading"
                fontWeight="300"
                letterSpacing="0.2em"
                color="black"
                lineHeight="1.2"
              >
                PROMISE
                <br />
                <Text as="span" fontWeight="100" fontStyle="italic">ALBERT VinoGram</Text>
              </Heading>

              <VStack align="start" gap={6} color="gray.600" fontWeight="300" lineHeight="1.8">
                <Text>
                  With over a decade of experience capturing life's most precious moments, 
                  I have dedicated my career to creating timeless imagery that transcends 
                  trends and speaks to the soul.
                </Text>

                <Text>
                  My approach combines classical techniques with contemporary vision, 
                  resulting in photographs that are both artistically compelling and 
                  deeply personal. Each session is a collaborative journey, where your 
                  story becomes the foundation for creating something truly extraordinary.
                </Text>

                <Text>
                  Based between Nigeria and Ghana, I work with a select number 
                  of clients annually, ensuring that each experience receives the attention 
                  and artistry it deserves. My work has been featured in leading publications 
                  and has earned recognition from prestigious industry organizations.
                </Text>
              </VStack>

              <Box>
                <Heading fontSize="lg" fontWeight="300" letterSpacing="0.1em" color="black" mb={4}>
                  RECOGNITION & AWARDS
                </Heading>
                <VStack align="start" gap={2} fontSize="sm" color="gray.600" fontWeight="300">
                  <Text>• International Photography Awards - Wedding Photographer of the Year</Text>
                  <Text>• Featured in Vogue, Harper's Bazaar, and Town & Country</Text>
                  <Text>• Master Craftsman, Professional Photographers of Ghana</Text>
                  <Text>• Certified by the International Association of Photography & Digital Arts</Text>
                </VStack>
              </Box>

              <Box p={8} bg="gray.50">
                <Text fontSize="lg" fontWeight="300" fontStyle="italic" color="gray.700" lineHeight="1.6" mb={4}>
                  "I believe that photography is not just about capturing what you see, 
                  but about revealing what you feel. Every image should tell a story 
                  that resonates for generations to come."
                </Text>
                <Text fontSize="sm" fontWeight="300" color="gray.600">
                  — Promise Albert(Vinogram)
                </Text>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
}