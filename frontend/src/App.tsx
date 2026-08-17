import { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { Toaster } from "sonner";
import { IntroScreen } from "./components/IntroScreen";
import { Navigation } from "./components/Navigation";
import { Experience } from "./components/Experience";
import { Portfolio } from "./components/Portfolio";
import { Services } from "./components/Services";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Blog } from "./components/Blog";
import { Shop } from "./components/Shop";
import { PrivateGallery } from "./components/PrivateGallery";
import { ConsultationBooking } from "./components/ConsultationBooking";

export default function App() {
  const [currentSection, setCurrentSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box minH="100vh" bg="white">
      {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}
      <Navigation 
        currentSection={currentSection} 
        setCurrentSection={setCurrentSection}
        isScrolled={isScrolled}
      />
      
      <Box as="main">
        <Content currentSection={currentSection} setCurrentSection={setCurrentSection} />
      </Box>

      <Footer />
      <Toaster position="top-right" />
    </Box>
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
        return <Portfolio fullPage />;
      case "services":
      case "pricing":
        return <Services fullPage />;
      case "about":
        return <About fullPage />;
      case "contact":
        return <Contact />;
      case "blog":
        return <Blog />;
      case "shop":
        return <Shop />;
      case "private-gallery":
        return <PrivateGallery />;
      case "consultation":
        return <ConsultationBooking />;
      default:
        return <Experience setCurrentSection={setCurrentSection} />;
    }
  };

  return renderSection();
}