import { useState } from "react";
import { toast } from "sonner";
import { apiService } from "../services/api-production";

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// Sample gallery data removed — auth now uses real backend

type ViewMode = "grid" | "masonry" | "slideshow";
type FilterMode = "all" | "favorites" | "selected";

export function ProGallery() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentGallery, setCurrentGallery] = useState<Gallery | null>(null);
  const [galleryId, setGalleryId] = useState("");
  const [clientName, setClientName] = useState("");
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
  const [pinRequired, setPinRequired] = useState(false);
  const [pin, setPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const authResponse = await apiService.authenticateGallery(galleryId, password);
      if (authResponse.gallery) {
        const freshData = await apiService.getGallery(authResponse.gallery.id);
        const gallery = freshData.gallery ?? freshData;
        setCurrentGallery(gallery);
        setImages((gallery.images || []).map((img: any) => ({ ...img, favorite: img.favorite ?? false, selected: false })));
        setIsAuthenticated(true);
        if (gallery.allowDownloads) setPinRequired(true);
        toast.success(`Welcome, ${gallery.clientName}!`);
      }
    } catch {
      toast.error("Invalid Gallery ID or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    try {
      const token = localStorage.getItem('gallery_token');
      const res = await fetch(`${API}/gallery/${currentGallery?.id}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        setPinVerified(true);
        setPinRequired(false);
        toast.success('PIN verified — downloads unlocked!');
      } else {
        setPinError('Invalid PIN. Please check the email sent to you.');
      }
    } catch {
      setPinError('Verification failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentGallery(null);
    setImages([]);
    setClientName("");
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

  const authInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    color: "white",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <section style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a0a 0%, #0d1f10 50%, #0a0a0a 100%)", paddingTop: "96px", paddingBottom: "64px" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 24px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80" }} />
              <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: 600, letterSpacing: "0.3em" }}>ACCRA, GHANA</span>
            </div>
            <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "20px" }}>
              <span style={{ color: "white" }}>GRAMTIME</span><br />
              <span style={{ color: "#4ade80" }}>VISUALS</span>
            </h1>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.5)", maxWidth: "480px", margin: "0 auto 32px", lineHeight: 1.7, fontWeight: 300 }}>
              Access your private gallery to view, favorite, and download your images.
            </p>


          </div>

          {/* Auth card */}
          <div style={{ maxWidth: "440px", margin: "0 auto", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: "20px", padding: "40px 36px", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>GALLERY ID *</label>
                <input
                  type="text"
                  value={galleryId}
                  onChange={(e) => setGalleryId(e.target.value)}
                  required
                  placeholder="e.g. gallery-1234567890"
                  style={authInputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(74,222,128,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>PASSWORD *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={authInputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(74,222,128,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: isLoading ? "rgba(74,222,128,0.5)" : "#4ade80",
                  color: "#000",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  letterSpacing: "0.12em",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.2s",
                }}
              >
                {isLoading ? "ACCESSING..." : "ACCESS GALLERY"}
              </button>
            </form>


          </div>

        </div>
      </section>
    );
  }

  // PIN verification modal
  if (pinRequired && isAuthenticated) {
    return (
      <section className="min-h-screen pt-24 pb-16" style={{ background: 'linear-gradient(135deg,#0f0f0f,#0d2818)' }}>
        <div className="max-w-md mx-auto px-6" style={{ paddingTop: '80px' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 16, padding: '40px 36px' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: '#4ade80', marginBottom: 8 }}>GRAMTIME VISUALS</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 8 }}>Enter Download PIN</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                A 6-digit PIN was sent to your email when your payment was approved. Enter it below to unlock downloads.
              </p>
            </div>
            <form onSubmit={verifyPin}>
              <input
                type="text"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                style={{
                  width: '100%', padding: '14px', textAlign: 'center',
                  fontSize: 28, fontWeight: 900, letterSpacing: '0.4em',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(74,222,128,0.3)',
                  borderRadius: 10, color: '#4ade80', outline: 'none',
                  fontFamily: 'monospace', marginBottom: 12,
                }}
              />
              {pinError && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{pinError}</p>}
              <button type="submit" style={{
                width: '100%', padding: '13px', background: '#4ade80', color: '#000',
                border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14,
                letterSpacing: '0.05em', cursor: 'pointer', marginBottom: 12,
              }}>VERIFY PIN</button>
              <button type="button" onClick={() => setPinRequired(false)} style={{
                width: '100%', padding: '11px', background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer',
              }}>Skip — Browse Without Downloads</button>
            </form>
          </div>
        </div>
      </section>
    );
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
              {currentGallery?.allowDownloads && pinVerified && (
                <button
                  onClick={() => setShowDownloadOptions(true)}
                  className="px-4 py-2 bg-white text-gray-900 text-sm font-light tracking-wide hover:bg-gray-100 transition-colors"
                >
                  DOWNLOAD
                </button>
              )}
              {currentGallery?.allowDownloads && !pinVerified && (
                <button
                  onClick={() => setPinRequired(true)}
                  className="px-4 py-2 border border-white text-white text-sm font-light tracking-wide hover:bg-white hover:text-gray-900 transition-colors"
                >
                  UNLOCK DOWNLOADS
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
              {currentGallery?.allowDownloads && pinVerified && (
                <button
                  onClick={() => { toast.success(`Downloading ${selectedImage.filename}...`); }}
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