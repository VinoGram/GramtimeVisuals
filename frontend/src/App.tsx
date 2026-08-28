import { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { Toaster } from "sonner";
import { IntroScreen } from "./components/IntroScreen";
import { Navigation } from "./components/Navigation";
import { Experience } from "./components/Experience";
import { Portfolio } from "./components/Portfolio";
import { Services } from "./components/Services";
import { About } from "./components/About";
import { Footer } from "./components/Footer";
import { Blog } from "./components/Blog";
import { Shop } from "./components/Shop";
import { ProGallery } from "./components/ProGallery";
import { VisitorCapture } from "./components/VisitorCapture";

// The intro scroll rig is calc(100vh + 3700px); we detect past-intro when scrollY exceeds 3700
const INTRO_SCROLL_HEIGHT = 3700;

export default function App() {
  const [currentSection, setCurrentSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [pastIntro, setPastIntro] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
      // intro rig = 100vh + 3700px; sticky stage is 100vh, so content starts at scrollY = 3700
      setPastIntro(scrollY >= INTRO_SCROLL_HEIGHT);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <IntroScreen />
      <VisitorCapture />
      {pastIntro && (
        <Navigation
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          isScrolled={isScrolled}
        />
      )}
      <Box as="main" bg="white">
        <Content currentSection={currentSection} setCurrentSection={setCurrentSection} />
      </Box>
      <Footer />
      <Toaster position="top-right" />
    </>
  );
}

function Content({ currentSection, setCurrentSection }: { 
  currentSection: string; 
  setCurrentSection: (section: string) => void;
}) {
  const renderSection = () => {
    switch (currentSection) {
      case "home":
        return <Experience setCurrentSection={setCurrentSection} />;
      case "portfolio":
        return <Portfolio fullPage setCurrentSection={setCurrentSection} />;
      case "services":
      case "pricing":
        return <Services fullPage />;
      case "about":
        return <About fullPage />;
      case "blog":
        return <Blog />;
      case "shop":
        return <Shop />;
      case "client-gallery":
        return <ProGallery />;
      default:
        return <Experience setCurrentSection={setCurrentSection} />;
    }
  };

  return renderSection();
}