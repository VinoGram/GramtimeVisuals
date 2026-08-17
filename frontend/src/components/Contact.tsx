import { useState } from "react";
import { toast } from "sonner";
import {
  Box, Heading, Text, Button, VStack, Grid, GridItem, Input, Textarea
} from "@chakra-ui/react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", sessionType: "", message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Inquiry sent! We'll respond within 24 hours.");
    setFormData({ name: "", email: "", phone: "", sessionType: "", message: "" });
    setSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputStyles = {
    bg: "white",
    border: "1px solid",
    borderColor: "gray.300",
    fontWeight: "300",
    _focus: { borderColor: "black", outline: "none" },
  };

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #CBD5E0",
    background: "white",
    fontWeight: 300,
    fontSize: "1rem",
    outline: "none",
    appearance: "none",
    cursor: "pointer",
  };

  return (
    <Box minH="100vh" pt={24} pb={16} bg="gray.50">
      <Box maxW="7xl" mx="auto" px={{ base: 6, lg: 8 }}>
        <VStack textAlign="center" mb={16} spacing={6}>
          <Heading fontSize={{ base: "3xl", md: "4xl" }} fontFamily="heading" fontWeight="300" letterSpacing="0.2em" color="black">
            BEGIN YOUR JOURNEY
          </Heading>
          <Text fontSize="lg" color="gray.600" fontWeight="300" maxW="2xl" mx="auto" lineHeight="1.8">
            We would be honored to create something extraordinary together. Share your vision with us and let's begin this beautiful journey.
          </Text>
        </VStack>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={16}>
          <GridItem>
            <Box bg="white" p={{ base: 8, lg: 12 }}>
              <Heading fontSize="2xl" fontWeight="300" letterSpacing="0.1em" color="black" mb={8}>
                TELL US ABOUT YOUR VISION
              </Heading>

              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} w="full">
                    <GridItem>
                      <Text fontSize="sm" fontWeight="300" letterSpacing="0.1em" color="gray.700" mb={2}>NAME *</Text>
                      <Input name="name" value={formData.name} onChange={handleChange} required {...inputStyles} />
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" fontWeight="300" letterSpacing="0.1em" color="gray.700" mb={2}>EMAIL *</Text>
                      <Input type="email" name="email" value={formData.email} onChange={handleChange} required {...inputStyles} />
                    </GridItem>
                  </Grid>

                  <Box w="full">
                    <Text fontSize="sm" fontWeight="300" letterSpacing="0.1em" color="gray.700" mb={2}>PHONE</Text>
                    <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} {...inputStyles} />
                  </Box>

                  <Box w="full">
                    <Text fontSize="sm" fontWeight="300" letterSpacing="0.1em" color="gray.700" mb={2}>SESSION TYPE *</Text>
                    <select name="sessionType" value={formData.sessionType} onChange={handleChange} required style={selectStyle}>
                      <option value="">Select a session type</option>
                      <option value="wedding">Wedding</option>
                      <option value="engagement">Engagement</option>
                      <option value="portrait">Portrait</option>
                      <option value="family">Family</option>
                      <option value="corporate">Corporate</option>
                      <option value="event">Event</option>
                      <option value="bespoke">Bespoke Experience</option>
                    </select>
                  </Box>

                  <Box w="full">
                    <Text fontSize="sm" fontWeight="300" letterSpacing="0.1em" color="gray.700" mb={2}>TELL US ABOUT YOUR VISION *</Text>
                    <Textarea
                      name="message" value={formData.message} onChange={handleChange} rows={6}
                      bg="white" border="1px solid" borderColor="gray.300" _focus={{ borderColor: "black" }}
                      fontWeight="300" placeholder="Share your story, inspiration, and what makes this moment special to you..."
                      resize="none" required
                    />
                  </Box>

                  <Button
                    type="submit" w="full" py={4} bg="black" color="white" fontWeight="300"
                    letterSpacing="0.1em" loading={submitting} _hover={{ bg: "gray.800" }} transition="all 0.3s"
                  >
                    SEND INQUIRY
                  </Button>
                </VStack>
              </Box>
            </Box>
          </GridItem>

          <GridItem>
            <VStack spacing={12}>
              <Box bg="white" p={{ base: 8, lg: 12 }} w="full">
                <Heading fontSize="xl" fontWeight="300" letterSpacing="0.1em" color="black" mb={6}>STUDIO LOCATIONS</Heading>
                <VStack spacing={8} align="start">
                  <Box>
                    <Heading fontSize="lg" fontWeight="300" color="black" mb={2}>Accra, Ghana</Heading>
                    <Text color="gray.600" fontWeight="300" lineHeight="1.6">
                      Gramtime Visuals Studio<br />
                      East Legon, Accra<br />
                      +233 XX XXX XXXX
                    </Text>
                  </Box>
                  <Box>
                    <Heading fontSize="lg" fontWeight="300" color="black" mb={2}>On Location</Heading>
                    <Text color="gray.600" fontWeight="300" lineHeight="1.6">
                      Available nationwide<br />
                      and for destination shoots<br />
                      Contact us to discuss
                    </Text>
                  </Box>
                </VStack>
              </Box>

              <Box bg="black" color="white" p={{ base: 8, lg: 12 }} w="full">
                <Heading fontSize="xl" fontWeight="300" letterSpacing="0.1em" mb={6}>WHAT TO EXPECT</Heading>
                <VStack spacing={4} align="start" fontSize="sm" fontWeight="300">
                  <Text>✓ Response within 24 hours</Text>
                  <Text>✓ Complimentary consultation call</Text>
                  <Text>✓ Custom proposal tailored to your vision</Text>
                  <Text>✓ Dedicated planning support</Text>
                  <Text>✓ Gallery delivery within 4-6 weeks</Text>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
}
