import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Divider,
  Link,
  Fade,
  ScaleFade,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiStar,
  FiCamera,
  FiDollarSign,
  FiTag,
  FiCalendar,
  FiUser,
  FiEdit3,
  FiShoppingBag,
  FiImage,
  FiMail,
  FiMenu,
  FiPhone,
  FiMapPin,
} from 'react-icons/fi';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

interface NavigationProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
  isScrolled: boolean;
}

export function Navigation({ currentSection, setCurrentSection, isScrolled }: NavigationProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems = [
    { id: "home", label: "Experience", icon: FiStar },
    { id: "portfolio", label: "Portfolio", icon: FiCamera },
    { id: "services", label: "Investment", icon: FiDollarSign },
    { id: "pricing", label: "Pricing", icon: FiTag },
    { id: "consultation", label: "Book Consultation", icon: FiCalendar },
    { id: "about", label: "About", icon: FiUser },
    { id: "blog", label: "Journal", icon: FiEdit3 },
    { id: "shop", label: "Shop", icon: FiShoppingBag },
    { id: "private-gallery", label: "Client Gallery", icon: FiImage },
    { id: "contact", label: "Inquire", icon: FiMail },
  ];

  return (
    <>
      <MotionBox
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        transition={{ duration: 0.3 }}
        animate={{
          backgroundColor: isScrolled 
            ? 'rgba(0, 0, 0, 0.9)' 
            : 'rgba(0, 0, 0, 0)',
          backdropFilter: isScrolled ? 'blur(20px)' : 'blur(0px)',
        }}
        borderBottom={isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'}
      >
        <Flex
          maxW="7xl"
          mx="auto"
          px={{ base: 6, lg: 8 }}
          py={4}
          align="center"
          justify="space-between"
          h="80px"
        >
          {/* Logo */}
          <MotionBox
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="unstyled"
              onClick={() => {
                setCurrentSection("home");
                onClose();
              }}
              _hover={{ color: 'elegant.green' }}
            >
              <Text
                fontSize="2xl"
                fontFamily="heading"
                fontWeight="300"
                letterSpacing="0.2em"
                color="elegant.white"
                textTransform="uppercase"
              >
                GRAMTIME VISUALS
              </Text>
            </Button>
          </MotionBox>

          {/* Hamburger Menu Button */}
          <MotionBox
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IconButton
              aria-label="Open menu"
              icon={<FiMenu />}
              variant="ghost"
              color="elegant.white"
              fontSize="24px"
              onClick={onOpen}
              _hover={{
                bg: 'rgba(255, 255, 255, 0.1)',
                transform: 'rotate(90deg)',
              }}
              transition="all 0.3s ease"
            />
          </MotionBox>
        </Flex>
      </MotionBox>

      {/* Elegant Drawer Menu */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(10px)" />
        <DrawerContent
          bg="rgba(0, 0, 0, 0.95)"
          backdropFilter="blur(30px)"
          border="1px solid rgba(255, 255, 255, 0.1)"
          borderRadius="20px 0 0 20px"
        >
          <DrawerCloseButton
            color="elegant.white"
            fontSize="18px"
            _hover={{ color: 'elegant.green', transform: 'rotate(90deg)' }}
            transition="all 0.3s ease"
          />
          
          <DrawerHeader>
            <Text
              fontSize="xl"
              fontFamily="heading"
              color="elegant.white"
              letterSpacing="0.15em"
              textAlign="center"
              mt={4}
            >
              NAVIGATION
            </Text>
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={2} align="stretch">
              <AnimatePresence>
                {navItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const isActive = currentSection === item.id;
                  
                  return (
                    <MotionBox
                      key={item.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant="ghost"
                        w="full"
                        h="60px"
                        justifyContent="flex-start"
                        px={6}
                        py={4}
                        borderRadius="12px"
                        bg={isActive ? 'rgba(34, 197, 94, 0.2)' : 'transparent'}
                        border={isActive ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid transparent'}
                        color={isActive ? 'elegant.green' : 'elegant.white'}
                        _hover={{
                          bg: 'rgba(34, 197, 94, 0.1)',
                          borderColor: 'rgba(34, 197, 94, 0.3)',
                          transform: 'translateX(8px)',
                          color: 'elegant.green',
                        }}
                        transition="all 0.3s ease"
                        onClick={() => {
                          setCurrentSection(item.id);
                          onClose();
                        }}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <HStack spacing={4} w="full">
                          <MotionBox
                            animate={{
                              scale: hoveredItem === item.id ? 1.2 : 1,
                              rotate: hoveredItem === item.id ? 12 : 0,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <IconComponent size={20} />
                          </MotionBox>
                          <Text
                            fontSize="sm"
                            fontWeight="300"
                            letterSpacing="0.1em"
                            textTransform="uppercase"
                          >
                            {item.label}
                          </Text>
                        </HStack>
                      </Button>
                    </MotionBox>
                  );
                })}
              </AnimatePresence>

              <Divider 
                my={6} 
                borderColor="rgba(255, 255, 255, 0.2)" 
                opacity={0.6}
              />

              {/* Contact Info */}
              <VStack spacing={4} align="center" py={4}>
                <Text
                  fontSize="sm"
                  color="rgba(255, 255, 255, 0.7)"
                  letterSpacing="0.1em"
                  textAlign="center"
                >
                  CAPTURING LIFE'S PRECIOUS MOMENTS
                </Text>
                
                <HStack spacing={6}>
                  {[
                    { icon: FiPhone, href: "tel:+1234567890" },
                    { icon: FiMail, href: "mailto:hello@gramtimevisuals.com" },
                    { icon: FiMapPin, href: "#location" },
                  ].map((social, index) => {
                    const IconComponent = social.icon;
                    return (
                      <MotionBox
                        key={index}
                        whileHover={{ scale: 1.2, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Link href={social.href} isExternal>
                          <IconButton
                            aria-label="Contact"
                            icon={<IconComponent />}
                            variant="ghost"
                            color="rgba(255, 255, 255, 0.6)"
                            _hover={{
                              color: 'elegant.green',
                              bg: 'rgba(34, 197, 94, 0.1)',
                            }}
                            size="sm"
                          />
                        </Link>
                      </MotionBox>
                    );
                  })}
                </HStack>
              </VStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}