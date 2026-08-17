import { Box, Flex, Heading, Text, Button, VStack, HStack, Grid, Image } from "@chakra-ui/react";

export function Press() {
  // Static placeholder data since convex is not available
  const pressFeatures: any[] = [];
  const awards: any[] = [];
  const partners: any[] = [];

  return (
    <Box as="section" py={24} bg="white">
      <Box maxW="7xl" mx="auto" px={{ base: 6, lg: 8 }}>
        <VStack textAlign="center" mb={16} spacing={6}>
          <Heading fontSize={{ base: "4xl", md: "5xl" }} fontWeight="300" letterSpacing="0.2em" color="gray.900">RECOGNITION</Heading>
          <Text fontSize="lg" color="gray.600" fontWeight="300" maxW="2xl" mx="auto">
            Our work has been celebrated by leading publications and industry organizations
          </Text>
        </VStack>

        <Box mb={20}>
          <Heading fontSize="2xl" fontWeight="300" letterSpacing="0.2em" color="gray.900" textAlign="center" mb={12}>AS FEATURED IN</Heading>
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(6, 1fr)" }} gap={8} alignItems="center">
            {pressFeatures?.filter((p: any) => p.type === "feature").slice(0, 6).map((feature: any) => (
              <VStack key={feature._id} textAlign="center">
                {feature.logoUrl ? (
                  <Image src={feature.logoUrl} alt={feature.publication} h={12} mx="auto" filter="grayscale(100%)" _hover={{ filter: "grayscale(0%)" }} transition="all 0.3s" />
                ) : (
                  <Text color="gray.600" fontWeight="300" letterSpacing="0.05em" fontSize="sm">{feature.publication.toUpperCase()}</Text>
                )}
              </VStack>
            ))}
          </Grid>
        </Box>

        {awards && awards.length > 0 && (
          <Box mb={20}>
            <Heading fontSize="2xl" fontWeight="300" letterSpacing="0.2em" color="gray.900" textAlign="center" mb={12}>AWARDS & HONORS</Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={8}>
              {awards.slice(0, 6).map((award: any) => (
                <VStack key={award._id} textAlign="center" p={6} bg="gray.50" spacing={3}>
                  {award.imageUrl && <Image src={award.imageUrl} alt={award.title} w={16} h={16} mx="auto" objectFit="contain" />}
                  <Heading fontSize="lg" fontWeight="300" letterSpacing="0.05em" color="gray.900">{award.title}</Heading>
                  <Text fontSize="sm" color="gray.600" fontWeight="300">{award.publication}</Text>
                  <Text fontSize="xs" color="gray.500" fontWeight="300">{new Date(award.date).getFullYear()}</Text>
                </VStack>
              ))}
            </Grid>
          </Box>
        )}

        {partners && partners.length > 0 && (
          <Box mb={20}>
            <Heading fontSize="2xl" fontWeight="300" letterSpacing="0.2em" color="gray.900" textAlign="center" mb={12}>PREFERRED PARTNERS</Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={8}>
              {partners.map((partner: any) => (
                <VStack key={partner._id} textAlign="center" spacing={3}>
                  {partner.logoUrl ? (
                    <Image src={partner.logoUrl} alt={partner.name} h={16} mx="auto" objectFit="contain" filter="grayscale(100%)" _hover={{ filter: "grayscale(0%)" }} transition="all 0.3s" />
                  ) : (
                    <Flex h={16} align="center" justify="center">
                      <Text color="gray.600" fontWeight="300" letterSpacing="0.05em" fontSize="sm">{partner.name.toUpperCase()}</Text>
                    </Flex>
                  )}
                  <Heading fontSize="sm" fontWeight="300" letterSpacing="0.05em" color="gray.900">{partner.name}</Heading>
                  <Text fontSize="xs" color="gray.500" fontWeight="300" textTransform="uppercase" letterSpacing="0.1em">{partner.type}</Text>
                </VStack>
              ))}
            </Grid>
          </Box>
        )}

        <Box mt={20} textAlign="center" bg="gray.50" p={12}>
          <Heading fontSize="2xl" fontWeight="300" letterSpacing="0.2em" color="gray.900" mb={6}>MEDIA INQUIRIES</Heading>
          <Text color="gray.600" fontWeight="300" mb={8} maxW="2xl" mx="auto">
            For press inquiries, high-resolution images, or interview requests, please contact our media relations team.
          </Text>
          <Button variant="outline" borderColor="gray.900" color="gray.900" fontWeight="300" letterSpacing="0.1em" px={8} py={4} _hover={{ bg: "gray.900", color: "white" }} transition="all 0.3s">
            DOWNLOAD PRESS KIT
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
