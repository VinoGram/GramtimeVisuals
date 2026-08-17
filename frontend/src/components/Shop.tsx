import { useState } from "react";
import {
  Box, Flex, Heading, Text, Button, VStack, HStack, Grid, Image
} from "@chakra-ui/react";

export function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState<string | undefined>();

  const [products] = useState([
    { _id: "1", name: "Golden Hour Wedding Print", description: "Limited edition fine art print capturing the magic of golden hour wedding moments", imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop", price: 450, type: "print", category: "wedding", specifications: { dimensions: "24x36 inches", material: "Archival Paper" } },
    { _id: "2", name: "Portrait Lightroom Presets", description: "Professional preset collection for stunning portrait photography", imageUrl: "https://images.unsplash.com/photo-1554048612-b6a482b224b8?w=400&h=400&fit=crop", price: 89, type: "preset", category: "portrait", specifications: undefined },
    { _id: "3", name: "Luxury Wedding Album", description: "Handcrafted leather-bound album with premium paper and custom design", imageUrl: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=400&fit=crop", price: 1200, type: "album", category: "wedding", specifications: { dimensions: "12x12 inches", material: "Italian Leather" } },
  ]);

  const categories = ["all", "wedding", "portrait", "landscape", "editorial"];
  const types = [{ id: "print", label: "Fine Art Prints" }, { id: "digital", label: "Digital Collections" }, { id: "album", label: "Luxury Albums" }, { id: "preset", label: "Lightroom Presets" }];

  const FilterBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <Button variant="ghost" onClick={onClick} px={6} py={2} fontSize="sm" fontWeight="300" letterSpacing="0.1em" color={active ? "gray.900" : "gray.600"} borderBottom={active ? "2px solid" : "2px solid transparent"} borderColor={active ? "gray.900" : "transparent"} borderRadius={0} _hover={{ color: "gray.900" }} transition="all 0.3s">
      {children}
    </Button>
  );

  return (
    <Box as="section" minH="100vh" pt={24} pb={16} bg="white">
      <Box maxW="7xl" mx="auto" px={{ base: 6, lg: 8 }}>
        <VStack textAlign="center" mb={16} spacing={6}>
          <Heading fontSize={{ base: "4xl", md: "5xl" }} fontWeight="300" letterSpacing="0.2em" color="gray.900">ATELIER</Heading>
          <Text fontSize="lg" color="gray.600" fontWeight="300" maxW="2xl" mx="auto">
            Curated collections of fine art prints, luxury albums, and exclusive digital products for discerning collectors and fellow artists
          </Text>
        </VStack>

        <Box mb={12}>
          <Flex flexWrap="wrap" justify="center" gap={4} mb={8}>
            <FilterBtn active={!selectedType} onClick={() => setSelectedType(undefined)}>ALL PRODUCTS</FilterBtn>
            {types.map((t) => <FilterBtn key={t.id} active={selectedType === t.id} onClick={() => setSelectedType(t.id)}>{t.label.toUpperCase()}</FilterBtn>)}
          </Flex>
          <Flex flexWrap="wrap" justify="center" gap={4}>
            {categories.map((cat) => (
              <Button key={cat} variant="ghost" onClick={() => setSelectedCategory(cat)} px={4} py={1} fontSize="xs" fontWeight="300" letterSpacing="0.1em" color={selectedCategory === cat ? "gray.900" : "gray.600"} bg={selectedCategory === cat ? "gray.100" : "transparent"} _hover={{ color: "gray.900" }} transition="all 0.3s">
                {cat.toUpperCase()}
              </Button>
            ))}
          </Flex>
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }} gap={8}>
          {products?.map((product) => (
            <Box key={product._id} cursor="pointer" role="group">
              <Box aspectRatio="1" bg="gray.100" mb={4} overflow="hidden">
                <Image src={product.imageUrl || "/api/placeholder/400/400"} alt={product.name} w="full" h="full" objectFit="cover" transition="transform 0.7s" _groupHover={{ transform: "scale(1.1)" }} />
              </Box>
              <VStack textAlign="center" spacing={2}>
                <Heading fontSize="lg" fontWeight="300" letterSpacing="0.05em" color="gray.900" _groupHover={{ color: "gray.600" }} transition="colors 0.3s">{product.name}</Heading>
                <Text fontSize="sm" color="gray.600" fontWeight="300" lineHeight="1.6" noOfLines={2}>{product.description}</Text>
                <Flex justify="space-between" align="center" w="full">
                  <Text fontSize="lg" fontWeight="300" color="gray.900">${product.price.toLocaleString()}</Text>
                  <Text fontSize="xs" color="gray.500" fontWeight="300" textTransform="uppercase" letterSpacing="0.1em">{product.type}</Text>
                </Flex>
                {product.specifications && (
                  <Text fontSize="xs" color="gray.500" fontWeight="300">
                    {product.specifications.dimensions}{product.specifications.material ? ` • ${product.specifications.material}` : ""}
                  </Text>
                )}
              </VStack>
            </Box>
          ))}
        </Grid>

        <Box mt={24} bg="gray.50" p={12}>
          <VStack textAlign="center" mb={12} spacing={6}>
            <Heading fontSize="3xl" fontWeight="300" letterSpacing="0.2em" color="gray.900">SIGNATURE COLLECTIONS</Heading>
            <Text color="gray.600" fontWeight="300" maxW="2xl" mx="auto">Limited edition collections featuring our most celebrated work, available exclusively through our atelier</Text>
          </VStack>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={12}>
            {[{ title: "ETERNAL MOMENTS", desc: "A curated selection of our most timeless wedding imagery, printed on museum-quality archival paper", src: "/api/placeholder/600/450", alt: "Eternal Moments Collection" }, { title: "URBAN ELEGANCE", desc: "Contemporary portraiture that captures the sophistication of modern luxury lifestyle", src: "/api/placeholder/600/450", alt: "Urban Elegance Collection" }].map(({ title, desc, src, alt }) => (
              <VStack key={title} textAlign="center" spacing={4}>
                <Box aspectRatio="4/3" bg="gray.200" w="full">
                  <Image src={src} alt={alt} w="full" h="full" objectFit="cover" />
                </Box>
                <Heading fontSize="xl" fontWeight="300" letterSpacing="0.1em" color="gray.900">{title}</Heading>
                <Text color="gray.600" fontWeight="300">{desc}</Text>
                <Button variant="outline" borderColor="gray.900" color="gray.900" fontWeight="300" letterSpacing="0.1em" px={6} py={3} _hover={{ bg: "gray.900", color: "white" }} transition="all 0.3s">EXPLORE COLLECTION</Button>
              </VStack>
            ))}
          </Grid>
        </Box>

        <VStack mt={24} textAlign="center" spacing={4}>
          <Heading fontSize="3xl" fontWeight="300" letterSpacing="0.2em" color="gray.900">BESPOKE COMMISSIONS</Heading>
          <Text color="gray.600" fontWeight="300" maxW="3xl" mx="auto">Commission exclusive artwork tailored to your space and vision. Our bespoke service includes consultation, custom sizing, and premium framing options.</Text>
          <Button bg="gray.900" color="white" fontWeight="300" letterSpacing="0.1em" px={8} py={4} _hover={{ bg: "gray.800" }}>INQUIRE ABOUT COMMISSIONS</Button>
        </VStack>
      </Box>
    </Box>
  );
}
