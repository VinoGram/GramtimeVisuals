import { useState } from "react";
import { toast } from "sonner";
import { CameraTrackingGallery } from "./CameraTrackingGallery";

interface Image {
  id: string;
  url: string;
  thumbnail: string;
  filename: string;
  width: number;
  height: number;
  favorite: boolean;
  selected: boolean;
}

interface Gallery {
  id: string;
  clientName: string;
  password: string;
  eventDate: string;
  eventType: string;
  coverImage: string;
  description: string;
  expiryDate: string;
  allowDownloads: boolean;
  allowFavorites: boolean;
  allowShopping: boolean;
  watermarked: boolean;
  images: Image[];
}

interface CartItem {
  imageId: string;
  productType: string;
  size?: string;
  quantity: number;
  price: number;
}

// Sample gallery data
const sampleGalleries: Gallery[] = [
  {
    id: "gallery-001",
    clientName: "Sarah & Michael",
    password: "wedding2024",
    eventDate: "June 15, 2024",
    eventType: "Wedding",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    description: "Your beautiful wedding day at The Grand Estate",
    expiryDate: "September 15, 2024",
    allowDownloads: true,
    allowFavorites: true,
    allowShopping: true,
    watermarked: false,
    images: [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920",
        thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400",
        filename: "wedding_ceremony_001.jpg",
        width: 1920,
        height: 1280,
        favorite: false,
        selected: false,
      },
      {
        id: "img-2",
        url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1920",
        thumbnail: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400",
        filename: "wedding_reception_002.jpg",
        width: 1920,
        height: 1280,
        favorite: false,
        selected: false,
      },
      {
        id: "img-3",
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920",
        thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400",
        filename: "wedding_couple_003.jpg",
        width: 1920,
        height: 1280,
        favorite: false,
        selected: false,
      },
      {
        id: "img-4",
        url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920",
        thumbnail: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400",
        filename: "wedding_details_004.jpg",
        width: 1920,
        height: 1280,
        favorite: false,
        selected: false,
      },
      {
        id: "img-5",
        url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1920",
        thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400",
        filename: "wedding_dance_005.jpg",
        width: 1920,
        height: 1280,
        favorite: false,
        selected: false,
      },
      {
        id: "img-6",
        url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1920",
        thumbnail: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400",
        filename: "wedding_rings_006.jpg",
        width: 1920,
        height: 1280,
        favorite: false,
        selected: false,
      },
    ],
  },
];

type ViewMode = "grid" | "masonry" | "slideshow";
type FilterMode = "all" | "favorites" | "selected";

export function ProGallery() {
  const [pageMode, setPageMode] = useState<'auth' | 'gallery' | 'camera-tracking'>('auth');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentGallery, setCurrentGallery] = useState<Gallery | null>(null);
  const [galleryId, setGalleryId] = useState("");
  const [password, setPassword] = useState("");
  const [images, setImages] = useState<Image[]>([]);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [showCart, setShowCart] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const gallery = sampleGalleries.find(
        (g) => g.id === galleryId && g.password === password
      );

      if (gallery) {
        setCurrentGallery(gallery);
        setImages(gallery.images);
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
    setImages([]);
    setGalleryId("");
    setPassword("");
    setSelectedImage(null);
    setCart([]);
  };

  const toggleFavorite = (imageId: string) => {
    setImages(
      images.map((img) =>
        img.id === imageId ? { ...img, favorite: !img.favorite } : img
      )
    );
    const image = images.find((img) => img.id === imageId);
    toast.success(
      image?.favorite ? "Removed from favorites" : "Added to favorites"
    );
  };

  const toggleSelect = (imageId: string) => {
    setImages(
      images.map((img) =>
        img.id === imageId ? { ...img, selected: !img.selected } : img
      )
    );
  };

  const selectAll = () => {
    const allSelected = images.every((img) => img.selected);
    setImages(images.map((img) => ({ ...img, selected: !allSelected })));
    toast.success(allSelected ? "All deselected" : "All selected");
  };

  const downloadSelected = () => {
    const selected = images.filter((img) => img.selected);
    if (selected.length === 0) {
      toast.error("Please select images to download");
      return;
    }
    toast.success(`Preparing ${selected.length} images for download...`);
    setShowDownloadOptions(false);
  };

  const downloadFavorites = () => {
    const favorites = images.filter((img) => img.favorite);
    if (favorites.length === 0) {
      toast.error("No favorites to download");
      return;
    }
    toast.success(`Preparing ${favorites.length} favorites for download...`);
    setShowDownloadOptions(false);
  };

  const downloadAll = () => {
    toast.success(`Preparing all ${images.length} images for download...`);
    setShowDownloadOptions(false);
  };

  const addToCart = (imageId: string, productType: string, price: number) => {
    setCart([...cart, { imageId, productType, quantity: 1, price }]);
    toast.success("Added to cart");
  };

  const filteredImages = images.filter((img) => {
    if (filterMode === "favorites") return img.favorite;
    if (filterMode === "selected") return img.selected;
    return true;
  });

  const favoriteCount = images.filter((img) => img.favorite).length;
  const selectedCount = images.filter((img) => img.selected).length;

  // Login Screen
  if (!isAuthenticated && pageMode === 'auth') {
    return (
      <section className="min-h-screen pt-24 pb-16 luxury-gradient-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl luxury-heading text-primary mb-6">
              CLIENT GALLERY
            </h1>
            <p className="text-lg luxury-body text-gray-600 max-w-2xl mx-auto mb-8">
              Access your private gallery to view, favorite, and download your images.
            </p>
            
            {/* Gallery Mode Selector */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => setPageMode('auth')}
                className={`luxury-button-secondary ${
                  pageMode === 'auth' ? 'bg-primary text-white' : ''
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                PRIVATE GALLERY
              </button>
              <button
                onClick={() => setPageMode('camera-tracking')}
                className={`luxury-button-secondary ${
                  pageMode === 'camera-tracking' ? 'bg-primary text-white' : ''
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                CAMERA TRACKING GALLERY
              </button>
            </div>
          </div>

          {pageMode === 'auth' && (
            <div className="max-w-md mx-auto luxury-card p-8 lg:p-12">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm luxury-subheading text-gray-600 mb-2">
                    GALLERY ID *
                  </label>
                  <input
                    type="text"
                    value={galleryId}
                    onChange={(e) => setGalleryId(e.target.value)}
                    required
                    placeholder="e.g., gallery-001"
                    className="auth-input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm luxury-subheading text-gray-600 mb-2">
                    PASSWORD *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your gallery password"
                    className="auth-input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="auth-button"
                >
                  {isLoading ? "ACCESSING..." : "ACCESS GALLERY"}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-sm luxury-subheading text-gray-600 mb-4">
                  DEMO CREDENTIALS
                </h3>
                <div className="space-y-2 text-xs luxury-body text-gray-600">
                  <p>Gallery ID: gallery-001</p>
                  <p>Password: wedding2024</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Camera Tracking Gallery
  if (pageMode === 'camera-tracking') {
    return <CameraTrackingGallery />;
  }

  // Gallery View
  return (
    <section className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-light tracking-wider text-gray-900">
                {currentGallery?.clientName}
              </h1>
              <p className="text-sm text-gray-600 font-light">
                {currentGallery?.eventType} • {currentGallery?.eventDate}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {currentGallery?.allowShopping && (
                <button
                  onClick={() => setShowCart(true)}
                  className="relative px-4 py-2 border border-gray-300 text-gray-700 text-sm font-light tracking-wide hover:bg-gray-50 transition-colors"
                >
                  🛒 Cart {cart.length > 0 && `(${cart.length})`}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-900 text-gray-900 text-sm font-light tracking-wide hover:bg-gray-900 hover:text-white transition-colors"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-900 text-white sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-white text-gray-900" : "hover:bg-gray-800"}`}
                title="Grid View"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("masonry")}
                className={`p-2 ${viewMode === "masonry" ? "bg-white text-gray-900" : "hover:bg-gray-800"}`}
                title="Masonry View"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setViewMode("slideshow");
                  setSlideshowIndex(0);
                }}
                className={`p-2 ${viewMode === "slideshow" ? "bg-white text-gray-900" : "hover:bg-gray-800"}`}
                title="Slideshow"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </button>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1 text-sm font-light ${filterMode === "all" ? "bg-white text-gray-900" : "hover:bg-gray-800"}`}
              >
                All ({images.length})
              </button>
              {currentGallery?.allowFavorites && (
                <button
                  onClick={() => setFilterMode("favorites")}
                  className={`px-3 py-1 text-sm font-light ${filterMode === "favorites" ? "bg-white text-gray-900" : "hover:bg-gray-800"}`}
                >
                  ❤️ Favorites ({favoriteCount})
                </button>
              )}
              <button
                onClick={() => setFilterMode("selected")}
                className={`px-3 py-1 text-sm font-light ${filterMode === "selected" ? "bg-white text-gray-900" : "hover:bg-gray-800"}`}
              >
                ✓ Selected ({selectedCount})
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={selectAll}
                className="px-3 py-1 text-sm font-light hover:bg-gray-800"
              >
                Select All
              </button>
              {currentGallery?.allowDownloads && (
                <button
                  onClick={() => setShowDownloadOptions(true)}
                  className="px-4 py-2 bg-white text-gray-900 text-sm font-light tracking-wide hover:bg-gray-100 transition-colors"
                >
                  DOWNLOAD
                </button>
              )}
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 border border-white text-white text-sm font-light tracking-wide hover:bg-white hover:text-gray-900 transition-colors"
              >
                SHARE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {viewMode === "slideshow" ? (
          // Slideshow View
          <div className="relative">
            <div className="aspect-video bg-black flex items-center justify-center">
              <img
                src={filteredImages[slideshowIndex]?.url}
                alt={filteredImages[slideshowIndex]?.filename}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center space-x-4 mt-6">
              <button
                onClick={() => setSlideshowIndex(Math.max(0, slideshowIndex - 1))}
                disabled={slideshowIndex === 0}
                className="px-6 py-3 bg-white text-gray-900 font-light disabled:opacity-50"
              >
                ← PREVIOUS
              </button>
              <span className="text-white font-light">
                {slideshowIndex + 1} / {filteredImages.length}
              </span>
              <button
                onClick={() =>
                  setSlideshowIndex(Math.min(filteredImages.length - 1, slideshowIndex + 1))
                }
                disabled={slideshowIndex === filteredImages.length - 1}
                className="px-6 py-3 bg-white text-gray-900 font-light disabled:opacity-50"
              >
                NEXT →
              </button>
            </div>
          </div>
        ) : (
          // Grid/Masonry View
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "columns-2 md:columns-3 lg:columns-4 gap-4"
            }
          >
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={`group relative overflow-hidden bg-gray-900 ${viewMode === "masonry" ? "mb-4" : ""}`}
              >
                <img
                  src={image.thumbnail}
                  alt={image.filename}
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                  onClick={() => setSelectedImage(image)}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(image);
                      }}
                      className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100"
                      title="View"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    {currentGallery?.allowFavorites && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(image.id);
                        }}
                        className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100"
                        title="Favorite"
                      >
                        {image.favorite ? "❤️" : "🤍"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={image.selected}
                    onChange={() => toggleSelect(image.id)}
                    className="w-5 h-5 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Favorite Badge */}
                {image.favorite && (
                  <div className="absolute top-2 right-2 text-2xl">❤️</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Lightbox Header */}
          <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="text-2xl hover:text-gray-300"
              >
                ×
              </button>
              <span className="text-sm font-light">{selectedImage.filename}</span>
            </div>
            <div className="flex items-center space-x-3">
              {currentGallery?.allowFavorites && (
                <button
                  onClick={() => toggleFavorite(selectedImage.id)}
                  className="p-2 hover:bg-gray-800 rounded"
                  title={selectedImage.favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {selectedImage.favorite ? "❤️" : "🤍"}
                </button>
              )}
              {currentGallery?.allowDownloads && (
                <button
                  onClick={() => {
                    toast.success(`Downloading ${selectedImage.filename}...`);
                  }}
                  className="px-4 py-2 bg-white text-gray-900 text-sm font-light hover:bg-gray-100"
                >
                  DOWNLOAD
                </button>
              )}
              {currentGallery?.allowShopping && (
                <button
                  onClick={() => {
                    addToCart(selectedImage.id, "Digital Download", 25);
                  }}
                  className="px-4 py-2 border border-white text-white text-sm font-light hover:bg-white hover:text-gray-900"
                >
                  ADD TO CART
                </button>
              )}
            </div>
          </div>

          {/* Lightbox Image */}
          <div className="flex-1 flex items-center justify-center p-8">
            <img
              src={selectedImage.url}
              alt={selectedImage.filename}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Lightbox Navigation */}
          <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
            <button
              onClick={() => {
                const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
                if (currentIndex > 0) {
                  setSelectedImage(filteredImages[currentIndex - 1]);
                }
              }}
              disabled={filteredImages.findIndex((img) => img.id === selectedImage.id) === 0}
              className="px-6 py-2 bg-white text-gray-900 font-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← PREVIOUS
            </button>
            <span className="text-sm font-light">
              {filteredImages.findIndex((img) => img.id === selectedImage.id) + 1} /{" "}
              {filteredImages.length}
            </span>
            <button
              onClick={() => {
                const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
                if (currentIndex < filteredImages.length - 1) {
                  setSelectedImage(filteredImages[currentIndex + 1]);
                }
              }}
              disabled={
                filteredImages.findIndex((img) => img.id === selectedImage.id) ===
                filteredImages.length - 1
              }
              className="px-6 py-2 bg-white text-gray-900 font-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              NEXT →
            </button>
          </div>
        </div>
      )}

      {/* Download Options Modal */}
      {showDownloadOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light tracking-wider text-gray-900">
                DOWNLOAD OPTIONS
              </h3>
              <button
                onClick={() => setShowDownloadOptions(false)}
                className="text-gray-500 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={downloadSelected}
                disabled={selectedCount === 0}
                className="w-full p-4 border border-gray-300 text-left hover:border-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-light text-gray-900 mb-1">Download Selected</div>
                <div className="text-sm text-gray-600 font-light">
                  {selectedCount} {selectedCount === 1 ? "image" : "images"} selected
                </div>
              </button>

              {currentGallery?.allowFavorites && (
                <button
                  onClick={downloadFavorites}
                  disabled={favoriteCount === 0}
                  className="w-full p-4 border border-gray-300 text-left hover:border-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-light text-gray-900 mb-1">Download Favorites</div>
                  <div className="text-sm text-gray-600 font-light">
                    {favoriteCount} {favoriteCount === 1 ? "favorite" : "favorites"}
                  </div>
                </button>
              )}

              <button
                onClick={downloadAll}
                className="w-full p-4 border border-gray-300 text-left hover:border-gray-900 transition-colors"
              >
                <div className="font-light text-gray-900 mb-1">Download All Images</div>
                <div className="text-sm text-gray-600 font-light">
                  {images.length} total images
                </div>
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900 font-light">
                Downloads are provided in high-resolution JPEG format. Large downloads may take a
                few minutes to prepare.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light tracking-wider text-gray-900">SHARE GALLERY</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-light tracking-wide text-gray-700 mb-2">
                  GALLERY LINK
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={`https://gramtimevisuals.com/gallery/${currentGallery?.id}`}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 font-light text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://gramtimevisuals.com/gallery/${currentGallery?.id}`
                      );
                      toast.success("Link copied to clipboard!");
                    }}
                    className="px-4 py-3 bg-gray-900 text-white font-light hover:bg-gray-800"
                  >
                    COPY
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-light tracking-wide text-gray-700 mb-3">
                  SHARE VIA
                </p>
                <div className="flex space-x-3">
                  <button className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-light hover:border-gray-900">
                    Email
                  </button>
                  <button className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-light hover:border-gray-900">
                    Facebook
                  </button>
                  <button className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-light hover:border-gray-900">
                    Twitter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-light tracking-wider text-gray-900">
                  SHOPPING CART
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-900 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 font-light mb-4">Your cart is empty</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="px-6 py-3 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800"
                  >
                    CONTINUE BROWSING
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item, index) => {
                      const image = images.find((img) => img.id === item.imageId);
                      return (
                        <div key={index} className="flex items-center space-x-4 border-b border-gray-200 pb-4">
                          <img
                            src={image?.thumbnail}
                            alt={image?.filename}
                            className="w-20 h-20 object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-light text-gray-900">{item.productType}</p>
                            <p className="text-sm text-gray-600 font-light">{image?.filename}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-light text-gray-900">${item.price}</p>
                            <button
                              onClick={() => {
                                setCart(cart.filter((_, i) => i !== index));
                                toast.success("Removed from cart");
                              }}
                              className="text-sm text-red-600 hover:text-red-800 font-light"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-light text-gray-900">TOTAL</span>
                      <span className="text-2xl font-light text-gray-900">
                        ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
                      </span>
                    </div>
                    <button className="w-full py-4 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors">
                      PROCEED TO CHECKOUT
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}