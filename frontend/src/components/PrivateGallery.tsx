import { useState } from "react";
import { toast } from "sonner";
import {
  Box, Flex, Heading, Text, Button, VStack, HStack, Grid, Image, Input
} from "@chakra-ui/react";

interface GalleryImage { id: string; url: string; thumbnail: string; filename: string; }
interface Gallery { id: string; clientName: string; password: string; eventDate: string; eventType: string; coverImage: string; images: GalleryImage[]; }

const sampleGalleries: Gallery[] = [
  {
    id: "gallery-001", clientName: "Sarah & Michael", password: "wedding2024", eventDate: "June 15, 2024", eventType: "Wedding",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    images: [
      { id: "img-1", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200", thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400", filename: "wedding_001.jpg" },
      { id: "img-2", url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200", thumbnail: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400", filename: "wedding_002.jpg" },
      { id: "img-3", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200", thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400", filename: "wedding_003.jpg" },
    ],
  },
  {
    id: "gallery-002", clientName: "Johnson Family", password: "family2024", eventDate: "July 20, 2024", eventType: "Family Portrait",
    coverImage: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800",
    images: [
      { id: "img-4", url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200", thumbnail: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400", filename: "family_001.jpg" },
      { id: "img-5", url: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1200", thumbnail: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400", filename: "family_002.jpg" },
    ],
  },
];

export function PrivateGallery() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentGallery, setCurrentGallery] = useState<Gallery | null>(null);
  const [galleryId, setGalleryId] = useState("");
  const [password, setPassword] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const gallery = sampleGalleries.find((g) => g.id === galleryId && g.password === password);
      if (gallery) {
        setCurrentGallery(gallery);
        setIsAuthenticated(true);
        toast.success(`Welcome back, ${gallery.clientName}!`);
      } else {
        toast.error("Invalid gallery ID or password. Please try again.");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentGallery(null);
    setGalleryId("");
    setPassword("");
    setSelectedImage(null);
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    toast.success(`Downloading ${filename}...`);
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename;
    link.click();
  };

  const downloadAllImages = () => {
    if (!currentGallery) return;
    toast.success(`Preparing ${currentGallery.images.length} images for download...`);
    currentGallery.images.forEach((img, index) => {
      setTimeout(() => downloadImage(img.url, img.filename), index * 500);
    });
  };

  if (!isAuthenticated) {
    return (
      <Box as="section" minH="100vh" pt={24} pb={16} bg="gray.50">
        <Box maxW="7xl" mx="auto" px={{ base: 6, lg: 8 }}>
          <VStack textAlign="center" mb={12} spacing={6}>
            <Heading fontSize={{ base: "4xl", md: "5xl" }} fontWeight="300" letterSpacing="0.2em" color="gray.900">PRIVATE VIEWING ROOM</Heading>
            <Text fontSize="lg" color="gray.600" fontWeight="300" maxW="2xl" mx="auto">
              Access your exclusive gallery to view and download your beautiful images.
            </Text>
          </VStack>

          <Box maxW="md" mx="auto" bg="white" p={{ base: 8, lg: 12 }} boxShadow="lg">
            <Box as="form" onSubmit={handleLogin}>
              <VStack spacing={6}>
                <Box w="full">
                  <Text fontSize="sm" fontWeight="300" letterSpacing="0.1em" color="gray.700" mb={2}>GALLERY ID *</Text>
                  <Input value={galleryId} onChange={(e) => setGalleryId(e.target.value)} required placeholder="e.g., gallery-001" border="1px solid" borderColor="gray.300" _focus={{ borderColor: "gray.900" }} fontWeight="300" />
                </Box>
                <Box w="full">
                  <Text fontSize="sm" fontWeight="300" letterSpacing="0.1em" color="gray.700" mb={2}>PASSWORD *</Text>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your gallery password" border="1px solid" borderColor="gray.300" _focus={{ borderColor: "gray.900" }} fontWeight="300" />
                </Box>
                <Button type="submit" w="full" py={4} bg="gray.900" color="white" fontWeight="300" letterSpacing="0.1em" disabled={isLoading} _hover={{ bg: "gray.800" }} _disabled={{ bg: "gray.400" }}>
                  {isLoading ? "ACCESSING..." : "ACCESS GALLERY"}
                </Button>
              </VStack>
            </Box>

            <Box mt={8} pt={8} borderTop="1px solid" borderColor="gray.200">
              <Text fontSize="sm" fontWeight="300" letterSpacing="0.1em" color="gray.900" mb={4}>DEMO CREDENTIALS</Text>
              <VStack spacing={2} fontSize="xs" color="gray.600" fontWeight="300" align="start">
                <Text>Gallery ID: gallery-001</Text>
                <Text>Password: wedding2024</Text>
                <Text pt={2}>Or</Text>
                <Text>Gallery ID: gallery-002</Text>
                <Text>Password: family2024</Text>
              </VStack>
            </Box>

            <Box mt={6} textAlign="center">
              <Text fontSize="sm" color="gray.600" fontWeight="300">
                Need help accessing your gallery?{" "}
                <Button variant="ghost" display="inline" p={0} h="auto" fontSize="sm" color="gray.900" _hover={{ textDecoration: "underline" }}>Contact us</Button>
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box as="section" minH="100vh" pt={24} pb={16} bg="white">
      <Box maxW="7xl" mx="auto" px={{ base: 6, lg: 8 }}>
        <Flex justify="space-between" align="start" mb={12}>
          <VStack align="start" spacing={2}>
            <Heading fontSize={{ base: "4xl", md: "5xl" }} fontWeight="300" letterSpacing="0.2em" color="gray.900">{currentGallery?.clientName}</Heading>
            <Text fontSize="lg" color="gray.600" fontWeight="300">{currentGallery?.eventType} • {currentGallery?.eventDate}</Text>
            <Text fontSize="sm" color="gray.500" fontWeight="300">{currentGallery?.images.length} images available</Text>
          </VStack>
          <Button variant="outline" borderColor="gray.900" color="gray.900" fontWeight="300" letterSpacing="0.1em" px={6} py={3} onClick={handleLogout} _hover={{ bg: "gray.900", color: "white" }}>LOGOUT</Button>
        </Flex>

        <HStack flexWrap="wrap" gap={4} mb={8}>
          <Button onClick={downloadAllImages} bg="gray.900" color="white" fontWeight="300" letterSpacing="0.1em" px={8} py={4} _hover={{ bg: "gray.800" }}>DOWNLOAD ALL IMAGES</Button>
          <Button variant="outline" borderColor="gray.900" color="gray.900" fontWeight="300" letterSpacing="0.1em" px={8} py={4} _hover={{ bg: "gray.100" }}>SELECT FAVORITES</Button>
          <Button variant="outline" borderColor="gray.900" color="gray.900" fontWeight="300" letterSpacing="0.1em" px={8} py={4} _hover={{ bg: "gray.100" }}>ORDER PRINTS</Button>
        </HStack>

        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }} gap={4}>
          {currentGallery?.images.map((image) => (
            <Box key={image.id} position="relative" aspectRatio="1" overflow="hidden" bg="gray.100" cursor="pointer" role="group" onClick={() => setSelectedImage(image.url)}>
              <Image src={image.thumbnail} alt={image.filename} w="full" h="full" objectFit="cover" transition="transform 0.5s" _groupHover={{ transform: "scale(1.1)" }} />
              <Flex position="absolute" inset={0} bg="blackAlpha.0" _groupHover={{ bg: "blackAlpha.400" }} transition="all 0.3s" align="center" justify="center">
                <Button
                  opacity={0} _groupHover={{ opacity: 1 }} transition="opacity 0.3s"
                  onClick={(e) => { e.stopPropagation(); downloadImage(image.url, image.filename); }}
                  bg="white" color="gray.900" fontWeight="300" letterSpacing="0.1em" px={6} py={3} _hover={{ bg: "gray.100" }}
                >
                  DOWNLOAD
                </Button>
              </Flex>
            </Box>
          ))}
        </Grid>

        <Box mt={16} bg="gray.50" p={8}>
          <Heading fontSize="xl" fontWeight="300" letterSpacing="0.2em" color="gray.900" mb={4}>IMPORTANT INFORMATION</Heading>
          <VStack spacing={2} fontSize="sm" color="gray.600" fontWeight="300" align="start">
            {["Your gallery will be available for 90 days from the delivery date", "All images are high-resolution and ready for printing", "You have full print release for personal use", "For commercial use, please contact us for licensing", "We recommend backing up your images immediately", "Need help? Contact us at gallery@gramtimevisuals.com"].map((note) => (
              <Text key={note}>• {note}</Text>
            ))}
          </VStack>
        </Box>
      </Box>

      {selectedImage && (
        <Flex position="fixed" inset={0} bg="blackAlpha.950" zIndex={50} align="center" justify="center" p={4} onClick={() => setSelectedImage(null)}>
          <Button position="absolute" top={6} right={6} variant="ghost" color="white" fontSize="4xl" _hover={{ color: "gray.300" }} onClick={() => setSelectedImage(null)}>×</Button>
          <Image src={selectedImage} alt="Full size" maxW="full" maxH="full" objectFit="contain" onClick={(e) => e.stopPropagation()} />
          <Button
            position="absolute" bottom={6} left="50%" transform="translateX(-50%)"
            bg="white" color="gray.900" fontWeight="300" letterSpacing="0.1em" px={8} py={4} _hover={{ bg: "gray.100" }}
            onClick={(e) => { e.stopPropagation(); const img = currentGallery?.images.find((i) => i.url === selectedImage); if (img) downloadImage(img.url, img.filename); }}
          >
            DOWNLOAD IMAGE
          </Button>
        </Flex>
      )}
    </Box>
  );
}
