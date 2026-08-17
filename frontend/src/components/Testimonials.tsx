import { Box, Flex, Heading, Text, Button, VStack, Grid, Image } from "@chakra-ui/react";

export function Testimonials() {
  // Static placeholder — replace with real data source as needed
  const testimonials: any[] = [];

  return (
    <Box as="section" py={24} bg="gray.50">
      <Box maxW="7xl" mx="auto" px={{ base: 6, lg: 8 }}>
        <VStack textAlign="center" mb={16} spacing={6}>
          <Heading fontSize={{ base: "4xl", md: "5xl" }} fontWeight="300" letterSpacing="0.2em" color="gray.900">CLIENT EXPERIENCES</Heading>
          <Text fontSize="lg" color="gray.600" fontWeight="300" maxW="2xl" mx="auto">
            The trust our clients place in us is the foundation of everything we do
          </Text>
        </VStack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={8}>
          {testimonials?.map((testimonial: any) => (
            <VStack key={testimonial._id} bg="white" p={8} textAlign="center" spacing={4}>
              {testimonial.imageUrl && (
                <Box w={20} h={20} borderRadius="full" overflow="hidden">
                  <Image src={testimonial.imageUrl} alt={testimonial.clientName} w="full" h="full" objectFit="cover" />
                </Box>
              )}
              <Flex justify="center">
                {[...Array(5)].map((_, i) => (
                  <Text key={i} fontSize="lg" color={i < testimonial.rating ? "yellow.400" : "gray.300"}>★</Text>
                ))}
              </Flex>
              <Text as="blockquote" color="gray.600" fontWeight="300" fontStyle="italic" lineHeight="1.8">
                "{testimonial.content}"
              </Text>
              <VStack spacing={1}>
                <Text as="cite" color="gray.900" fontWeight="300" letterSpacing="0.05em" fontStyle="normal">{testimonial.clientName}</Text>
                {testimonial.clientTitle && <Text fontSize="sm" color="gray.500" fontWeight="300">{testimonial.clientTitle}</Text>}
                <Text fontSize="xs" color="gray.400" fontWeight="300" letterSpacing="0.1em">{testimonial.sessionType?.toUpperCase()}</Text>
              </VStack>
            </VStack>
          ))}
        </Grid>

        <Box mt={16} textAlign="center">
          <Heading fontSize="2xl" fontWeight="300" letterSpacing="0.2em" color="gray.900" mb={8}>HEAR FROM OUR CLIENTS</Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8} maxW="4xl" mx="auto">
            {testimonials?.filter((t: any) => t.videoUrl).slice(0, 2).map((testimonial: any) => (
              <Box key={testimonial._id} aspectRatio="16/9" bg="gray.100" borderRadius="md" overflow="hidden">
                <Box as="video" src={testimonial.videoUrl} controls w="full" h="full" objectFit="cover" poster={testimonial.imageUrl || "/api/placeholder/600/400"} />
              </Box>
            ))}
          </Grid>
        </Box>

        <VStack mt={16} textAlign="center" spacing={6}>
          <Text color="gray.600" fontWeight="300" maxW="2xl" mx="auto">
            Ready to create your own unforgettable experience? We would be honored to be part of your story.
          </Text>
          <Button bg="gray.900" color="white" fontWeight="300" letterSpacing="0.1em" px={8} py={4} _hover={{ bg: "gray.800" }} transition="all 0.3s">
            START YOUR JOURNEY
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
