import { useState } from "react";
import {
  Box, Flex, Heading, Text, Button, VStack, HStack, Grid
} from "@chakra-ui/react";

export function PriceList() {
  const [showPDFViewer, setShowPDFViewer] = useState(false);

  const pricingPackages = [
    {
      category: "Wedding Photography",
      packages: [
        { name: "Essential Collection", price: "$5,000", features: ["6 hours of coverage", "1 photographer", "300+ edited images", "Online gallery", "Print release"] },
        { name: "Prestige Collection", price: "$10,000", features: ["10 hours of coverage", "2 photographers", "600+ edited images", "Engagement session included", "Premium album (50 pages)", "Online gallery", "Print release"] },
        { name: "Luxury Collection", price: "$20,000", features: ["Full day coverage", "2 photographers + assistant", "1000+ edited images", "Engagement & bridal session", "Luxury album (100 pages)", "Parent albums (2)", "Online gallery", "Print release", "Drone coverage"] },
      ],
    },
    {
      category: "Portrait Photography",
      packages: [
        { name: "Individual Session", price: "$1,500", features: ["2 hours session", "2 outfit changes", "50+ edited images", "Online gallery", "Print release"] },
        { name: "Family Session", price: "$2,500", features: ["3 hours session", "Multiple locations", "100+ edited images", "Online gallery", "Print release", "Wall art credit ($500)"] },
      ],
    },
    {
      category: "Corporate Photography",
      packages: [
        { name: "Headshots Package", price: "$3,000", features: ["Up to 20 people", "Professional lighting setup", "2 edited images per person", "Same-day delivery available", "Commercial usage rights"] },
        { name: "Brand Photography", price: "$5,000+", features: ["Full day coverage", "Multiple locations", "200+ edited images", "Commercial usage rights", "Social media optimization", "Rush delivery available"] },
      ],
    },
    {
      category: "Event Photography",
      packages: [
        { name: "Half Day Coverage", price: "$2,500", features: ["4 hours coverage", "1 photographer", "200+ edited images", "Online gallery", "Print release"] },
        { name: "Full Day Coverage", price: "$4,500", features: ["8 hours coverage", "2 photographers", "400+ edited images", "Online gallery", "Print release", "Highlight video"] },
      ],
    },
  ];

  const addOns = [
    { name: "Additional Hour", price: "$500" }, { name: "Second Photographer", price: "$1,000" },
    { name: "Engagement Session", price: "$1,500" }, { name: "Premium Album (50 pages)", price: "$2,000" },
    { name: "Parent Album", price: "$800" }, { name: "Drone Coverage", price: "$1,200" },
    { name: "Highlight Video (3-5 min)", price: "$2,500" }, { name: "Raw Files", price: "$1,500" },
    { name: "Rush Delivery (2 weeks)", price: "$1,000" }, { name: "Travel (per day)", price: "$500+" },
  ];

  const downloadPriceList = () => {
    let content = "LUXURY PHOTOGRAPHY - PRICE LIST\n\n";
    pricingPackages.forEach((cat) => {
      content += `\n${cat.category.toUpperCase()}\n${"=".repeat(50)}\n\n`;
      cat.packages.forEach((pkg) => {
        content += `${pkg.name} - ${pkg.price}\n`;
        pkg.features.forEach((f) => { content += `  • ${f}\n`; });
        content += "\n";
      });
    });
    content += `\nADD-ONS\n${"=".repeat(50)}\n\n`;
    addOns.forEach((a) => { content += `${a.name} - ${a.price}\n`; });
    content += `\n\nNOTES:\n• All prices are in USD\n• 50% deposit required to secure booking\n• Travel fees apply for destinations outside NYC/LA\n• Custom packages available upon request\n• Prices subject to change\n`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Luxury_Photography_Price_List_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box as="section" minH="100vh" pt={24} pb={16} bg="white">
      <Box maxW="7xl" mx="auto" px={{ base: 6, lg: 8 }}>
        <VStack textAlign="center" mb={16} spacing={6}>
          <Heading fontSize={{ base: "4xl", md: "5xl" }} fontWeight="300" letterSpacing="0.2em" color="gray.900">INVESTMENT GUIDE</Heading>
          <Text fontSize="lg" color="gray.600" fontWeight="300" maxW="3xl" mx="auto" mb={2}>
            Transparent pricing for exceptional photography services. Each package is designed to provide outstanding value while maintaining our commitment to quality and artistry.
          </Text>
          <HStack spacing={4} justify="center">
            <Button onClick={() => setShowPDFViewer(true)} bg="gray.900" color="white" fontWeight="300" letterSpacing="0.1em" px={8} py={4} _hover={{ bg: "gray.800" }}>VIEW FULL PRICE LIST (PDF)</Button>
            <Button onClick={downloadPriceList} variant="outline" borderColor="gray.900" color="gray.900" fontWeight="300" letterSpacing="0.1em" px={8} py={4} _hover={{ bg: "gray.900", color: "white" }}>DOWNLOAD PRICE LIST</Button>
          </HStack>
        </VStack>

        <VStack spacing={16}>
          {pricingPackages.map((cat, idx) => (
            <Box key={idx} w="full">
              <Heading fontSize="3xl" fontWeight="300" letterSpacing="0.2em" color="gray.900" mb={8} textAlign="center">{cat.category.toUpperCase()}</Heading>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={8}>
                {cat.packages.map((pkg, pkgIdx) => (
                  <Box key={pkgIdx} bg="gray.50" p={8} _hover={{ boxShadow: "lg" }} transition="box-shadow 0.3s">
                    <Heading fontSize="xl" fontWeight="300" letterSpacing="0.2em" color="gray.900" mb={2}>{pkg.name}</Heading>
                    <Text fontSize="3xl" fontWeight="300" color="gray.900" mb={6}>{pkg.price}</Text>
                    <VStack spacing={3} align="start">
                      {pkg.features.map((f, fi) => (
                        <HStack key={fi} align="start" fontSize="sm" color="gray.600" fontWeight="300">
                          <Text>✓</Text><Text>{f}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                ))}
              </Grid>
            </Box>
          ))}
        </VStack>

        <Box mt={16} bg="gray.50" p={12}>
          <Heading fontSize="3xl" fontWeight="300" letterSpacing="0.2em" color="gray.900" mb={8} textAlign="center">AVAILABLE ADD-ONS</Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} maxW="5xl" mx="auto">
            {addOns.map((addon, idx) => (
              <Flex key={idx} justify="space-between" align="center" bg="white" p={4}>
                <Text color="gray.900" fontWeight="300">{addon.name}</Text>
                <Text color="gray.900" fontWeight="300">{addon.price}</Text>
              </Flex>
            ))}
          </Grid>
        </Box>

        <Box mt={16} maxW="4xl" mx="auto">
          <Heading fontSize="2xl" fontWeight="300" letterSpacing="0.2em" color="gray.900" mb={6} textAlign="center">IMPORTANT INFORMATION</Heading>
          <Box bg="gray.900" color="white" p={8}>
            <VStack spacing={4} fontSize="sm" fontWeight="300" align="start">
              {["All prices are in USD and subject to change", "A 50% non-refundable deposit is required to secure your booking date", "The remaining balance is due 7 days before the event", "Travel fees apply for destinations outside of New York and Los Angeles", "Custom packages and bespoke experiences available upon request", "All packages include professional editing and high-resolution digital files", "Images delivered within 4-6 weeks via online gallery", "Rush delivery available for additional fee"].map((note) => (
                <Text key={note}>• {note}</Text>
              ))}
            </VStack>
          </Box>
        </Box>

        <VStack mt={16} textAlign="center" spacing={4}>
          <Heading fontSize="2xl" fontWeight="300" letterSpacing="0.2em" color="gray.900">READY TO BEGIN?</Heading>
          <Text color="gray.600" fontWeight="300">Contact us to discuss your vision and receive a custom proposal</Text>
          <Button bg="gray.900" color="white" fontWeight="300" letterSpacing="0.1em" px={8} py={4} _hover={{ bg: "gray.800" }}>SCHEDULE CONSULTATION</Button>
        </VStack>
      </Box>

      {showPDFViewer && (
        <Box position="fixed" inset={0} bg="blackAlpha.500" display="flex" alignItems="center" justifyContent="center" zIndex={50} p={4}>
          <Flex bg="white" maxW="6xl" w="full" h="90vh" direction="column">
            <Flex justify="space-between" align="center" p={6} borderBottom="1px solid" borderColor="gray.200">
              <Heading fontSize="2xl" fontWeight="300" letterSpacing="0.2em" color="gray.900">PRICE LIST</Heading>
              <Button variant="ghost" onClick={() => setShowPDFViewer(false)} fontSize="2xl" color="gray.500" _hover={{ color: "gray.900" }}>×</Button>
            </Flex>
            <Box flex={1} overflowY="auto" p={6}>
              <Box bg="gray.50" p={8} textAlign="center">
                <Text color="gray.600" fontWeight="300" mb={4}>PDF Viewer: Place your PDF file in the public folder and update the path below</Text>
                <Text fontSize="sm" color="gray.500" fontWeight="300" mb={6}>To use a real PDF, add your price list PDF to: /public/price-list.pdf</Text>
                <Flex border="2px dashed" borderColor="gray.300" p={12} minH="500px" align="center" justify="center" bg="white">
                  <VStack spacing={4}>
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#9ca3af" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <Text color="gray.600" fontWeight="300">Your PDF will be displayed here</Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="300">Add your PDF file to enable viewing</Text>
                  </VStack>
                </Flex>
              </Box>
            </Box>
            <Flex p={6} borderTop="1px solid" borderColor="gray.200" justify="center" gap={4}>
              <Button onClick={downloadPriceList} bg="gray.900" color="white" fontWeight="300" letterSpacing="0.1em" px={8} py={3} _hover={{ bg: "gray.800" }}>DOWNLOAD PDF</Button>
              <Button onClick={() => setShowPDFViewer(false)} variant="outline" borderColor="gray.900" color="gray.900" fontWeight="300" letterSpacing="0.1em" px={8} py={3} _hover={{ bg: "gray.100" }}>CLOSE</Button>
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  );
}
