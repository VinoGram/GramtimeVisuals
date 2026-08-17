import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface Image {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  category: string;
}

interface HandPosition {
  x: number;
  y: number;
  isDetected: boolean;
}

const sampleImages: Image[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400",
    title: "Elegant Wedding",
    category: "Wedding"
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1920",
    thumbnail: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400",
    title: "Reception Moments",
    category: "Wedding"
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920",
    thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400",
    title: "Couple Portrait",
    category: "Portrait"
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920",
    thumbnail: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400",
    title: "Wedding Details",
    category: "Details"
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1920",
    thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400",
    title: "First Dance",
    category: "Wedding"
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1920",
    thumbnail: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400",
    title: "Wedding Rings",
    category: "Details"
  }
];

export function CameraTrackingGallery() {
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [handPosition, setHandPosition] = useState<HandPosition>({ x: 0, y: 0, isDetected: false });
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [imagePositions, setImagePositions] = useState<Record<string, { x: number; y: number; rotation: number }>>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Initialize camera and hand tracking
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraEnabled(true);
        toast.success("Camera tracking enabled! Move your hand to interact with images.");
        startHandTracking();
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      toast.error("Camera access required for hand tracking feature.");
    }
  };

  // Simple hand tracking using color detection (basic implementation)
  const startHandTracking = () => {
    const detectHand = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Simple hand detection based on skin color (basic implementation)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let handX = 0;
      let handY = 0;
      let pixelCount = 0;
      
      // Look for skin-colored pixels (simplified)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Basic skin color detection
        if (r > 95 && g > 40 && b > 20 && 
            Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
            Math.abs(r - g) > 15 && r > g && r > b) {
          
          const pixelIndex = i / 4;
          const x = pixelIndex % canvas.width;
          const y = Math.floor(pixelIndex / canvas.width);
          
          handX += x;
          handY += y;
          pixelCount++;
        }
      }
      
      if (pixelCount > 1000) { // Minimum threshold for hand detection
        const avgX = handX / pixelCount;
        const avgY = handY / pixelCount;
        
        // Convert to screen coordinates
        const galleryRect = galleryRef.current?.getBoundingClientRect();
        if (galleryRect) {
          const screenX = (avgX / canvas.width) * galleryRect.width;
          const screenY = (avgY / canvas.height) * galleryRect.height;
          
          setHandPosition({
            x: screenX,
            y: screenY,
            isDetected: true
          });
          
          // Check for image interaction
          checkImageInteraction(screenX, screenY);
        }
      } else {
        setHandPosition(prev => ({ ...prev, isDetected: false }));
      }
      
      animationFrameRef.current = requestAnimationFrame(detectHand);
    };
    
    detectHand();
  };

  // Check if hand is interacting with images
  const checkImageInteraction = (x: number, y: number) => {
    const images = document.querySelectorAll('.trackable-image');
    images.forEach((img, index) => {
      const rect = img.getBoundingClientRect();
      const galleryRect = galleryRef.current?.getBoundingClientRect();
      
      if (galleryRect) {
        const relativeX = x;
        const relativeY = y;
        const imgX = rect.left - galleryRect.left;
        const imgY = rect.top - galleryRect.top;
        
        if (relativeX >= imgX && relativeX <= imgX + rect.width &&
            relativeY >= imgY && relativeY <= imgY + rect.height) {
          
          const imageId = sampleImages[index].id;
          setHoveredImage(imageId);
          
          // Add floating effect
          setImagePositions(prev => ({
            ...prev,
            [imageId]: {
              x: (relativeX - imgX - rect.width / 2) * 0.1,
              y: (relativeY - imgY - rect.height / 2) * 0.1,
              rotation: Math.sin(Date.now() * 0.01) * 5
            }
          }));
        }
      }
    });
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsCameraEnabled(false);
    setHandPosition({ x: 0, y: 0, isDetected: false });
    toast.info("Camera tracking disabled.");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <section className="min-h-screen pt-24 pb-16 luxury-gradient-subtle">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl luxury-heading text-primary mb-6">
            INTERACTIVE GALLERY
          </h1>
          <p className="text-lg luxury-body text-secondary max-w-2xl mx-auto mb-8">
            Experience our portfolio with cutting-edge camera tracking technology. 
            Enable your camera and use hand gestures to interact with images.
          </p>
          
          {/* Camera Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={isCameraEnabled ? stopCamera : initializeCamera}
              className={`luxury-button-primary ${isCameraEnabled ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
              {isCameraEnabled ? '📹 DISABLE TRACKING' : '📹 ENABLE CAMERA TRACKING'}
            </button>
            
            {isCameraEnabled && (
              <div className="flex items-center space-x-2 text-sm luxury-body">
                <div className={`w-3 h-3 rounded-full ${handPosition.isDetected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{handPosition.isDetected ? 'Hand Detected' : 'Move your hand in view'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Camera Feed (Hidden) */}
        <div className="hidden">
          <video ref={videoRef} autoPlay muted playsInline />
          <canvas ref={canvasRef} />
        </div>

        {/* Hand Cursor */}
        {isCameraEnabled && handPosition.isDetected && (
          <div
            className="fixed w-8 h-8 pointer-events-none z-50 transition-all duration-100"
            style={{
              left: `${handPosition.x}px`,
              top: `${handPosition.y + 100}px`, // Offset for header
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-full h-full bg-accent rounded-full shadow-lg animate-pulse border-2 border-primary">
              <div className="w-2 h-2 bg-primary rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        <div 
          ref={galleryRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative"
        >
          {sampleImages.map((image, index) => {
            const position = imagePositions[image.id] || { x: 0, y: 0, rotation: 0 };
            const isHovered = hoveredImage === image.id;
            
            return (
              <div
                key={image.id}
                className={`trackable-image group relative overflow-hidden luxury-card transition-all duration-500 cursor-pointer ${
                  isHovered ? 'scale-105 shadow-2xl' : 'hover:scale-102'
                }`}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) rotate(${position.rotation}deg)`,
                  zIndex: isHovered ? 10 : 1
                }}
                onClick={() => setSelectedImage(image)}
                onMouseEnter={() => !isCameraEnabled && setHoveredImage(image.id)}
                onMouseLeave={() => !isCameraEnabled && setHoveredImage(null)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.thumbnail}
                    alt={image.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isHovered ? 'scale-110 brightness-110' : 'group-hover:scale-105'
                    }`}
                  />
                </div>
                
                {/* Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent transition-all duration-500 ${
                  isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-light text-luxury-beige-50 mb-2 tracking-wide">
                      {image.title}
                    </h3>
                    <p className="text-sm text-luxury-beige-200 tracking-wider uppercase">
                      {image.category}
                    </p>
                  </div>
                </div>

                {/* Interactive Glow Effect */}
                {isHovered && isCameraEnabled && (
                  <div className="absolute inset-0 border-2 border-accent animate-pulse rounded-lg"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        {isCameraEnabled && (
          <div className="mt-12 text-center">
            <div className="luxury-card p-6 max-w-2xl mx-auto">
              <h3 className="text-xl luxury-heading text-primary mb-4">
                HOW TO USE CAMERA TRACKING
              </h3>
              <div className="space-y-2 luxury-body text-secondary">
                <p>✋ Hold your hand up in front of the camera</p>
                <p>👆 Move your hand to hover over images</p>
                <p>🖼️ Images will respond to your hand movements</p>
                <p>👆 Tap on images to view them in full size</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-accent transition-colors z-10"
            >
              ✕
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-2xl font-light text-white mb-2">
                {selectedImage.title}
              </h3>
              <p className="text-accent tracking-wider uppercase">
                {selectedImage.category}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}