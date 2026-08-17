import { useState } from "react";

export function ClientPortal() {
  const [activeTab, setActiveTab] = useState("galleries");
  const [user] = useState({ name: "John Doe", email: "john@example.com" });

  const tabs = [
    { id: "galleries", label: "My Galleries" },
    { id: "bookings", label: "Bookings" },
    { id: "orders", label: "Orders" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <section className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light tracking-wider text-gray-900 mb-4">
            WELCOME BACK
          </h1>
          <p className="text-lg text-gray-600 font-light">
            {user?.name || user?.email}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-12">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-light tracking-wide transition-colors ${
                  activeTab === tab.id
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "galleries" && <GalleriesTab />}
          {activeTab === "bookings" && <BookingsTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "profile" && <ProfileTab />}
        </div>
      </div>
    </section>
  );
}

function GalleriesTab() {
  const [galleries] = useState([
    {
      _id: "1",
      title: "Wedding at Villa Tuscany",
      description: "Your beautiful wedding day captured in timeless elegance",
      previewImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
      status: "ready",
      imageCount: 150
    },
    {
      _id: "2",
      title: "Engagement Session",
      description: "Romantic moments in the golden hour",
      previewImage: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop",
      status: "preparing",
      imageCount: 0
    }
  ]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {galleries?.map((gallery) => (
          <div key={gallery._id} className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-video bg-gray-100">
              <img
                src={gallery.previewImage}
                alt="Gallery preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-light tracking-wide text-gray-900 mb-2">
                {gallery.title}
              </h3>
              <p className="text-sm text-gray-600 font-light mb-4">
                {gallery.description}
              </p>
              <div className="flex justify-between items-center mb-4">
                <span className={`text-xs font-light ${
                  gallery.status === "ready" ? "text-green-600" : 
                  gallery.status === "preparing" ? "text-yellow-600" : "text-gray-600"
                }`}>
                  {gallery.status === "ready" ? "Ready" : 
                   gallery.status === "preparing" ? "Processing" : "Delivered"}
                </span>
                {gallery.imageCount > 0 && (
                  <span className="text-xs text-gray-500 font-light">
                    {gallery.imageCount} images
                  </span>
                )}
              </div>
              <button className={`w-full py-2 text-sm font-light tracking-wide transition-colors ${
                gallery.status === "ready" 
                  ? "text-gray-900 hover:text-gray-600" 
                  : "text-gray-400 cursor-not-allowed"
              }`}>
                {gallery.status === "ready" ? "VIEW GALLERY →" : "COMING SOON"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Gallery Access */}
      <div className="mt-16 bg-white p-8 rounded-lg">
        <h3 className="text-xl font-light tracking-wider text-gray-900 mb-6">
          ACCESS PRIVATE GALLERY
        </h3>
        <p className="text-gray-600 font-light mb-6">
          Have an access code for a private gallery? Enter it below to view your images.
        </p>
        <div className="flex gap-4 max-w-md">
          <input
            type="text"
            placeholder="Enter access code"
            className="flex-1 px-4 py-3 border border-gray-300 focus:border-gray-900 focus:outline-none font-light"
          />
          <button className="px-6 py-3 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors">
            ACCESS
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingsTab() {
  const [bookings] = useState([
    {
      _id: "1",
      sessionType: "Wedding Photography",
      sessionDate: "2024-06-15",
      duration: 8,
      location: "Villa Tuscany, Italy",
      packageTier: "luxury",
      investment: 15000,
      paymentStatus: "deposit",
      status: "confirmed",
      contractSigned: true
    }
  ]);

  return (
    <div className="space-y-6">
      {bookings?.map((booking) => (
        <div key={booking._id} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-light tracking-wide text-gray-900 mb-1">
                {booking.sessionType}
              </h3>
              <p className="text-sm text-gray-600 font-light">
                {new Date(booking.sessionDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} • {booking.duration} {booking.duration === 1 ? 'hour' : 'hours'}
              </p>
            </div>
            <span className={`px-3 py-1 text-xs font-light rounded ${
              booking.status === "confirmed" ? "bg-green-100 text-green-800" :
              booking.status === "inquiry" ? "bg-blue-100 text-blue-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-500 font-light">Venue:</span>
              <p className="text-gray-900 font-light">{booking.location}</p>
            </div>
            <div>
              <span className="text-gray-500 font-light">Package:</span>
              <p className="text-gray-900 font-light">
                {booking.packageTier.charAt(0).toUpperCase() + booking.packageTier.slice(1)} Collection
              </p>
            </div>
            <div>
              <span className="text-gray-500 font-light">Investment:</span>
              <p className="text-gray-900 font-light">${booking.investment.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-500 font-light">Payment:</span>
              <p className="text-gray-900 font-light">
                {booking.paymentStatus === "paid" ? "Paid in Full" :
                 booking.paymentStatus === "deposit" ? "Deposit Paid" : "Pending"}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className={booking.contractSigned ? "text-green-600" : "text-yellow-600"}>
                {booking.contractSigned ? "✓ Contract Signed" : "⚠ Contract Pending"}
              </span>
            </div>
            <button className="text-sm text-gray-900 font-light tracking-wide hover:text-gray-600">
              VIEW DETAILS →
            </button>
          </div>
        </div>
      ))}

      {/* Booking CTA */}
      <div className="bg-gray-900 text-white p-8 rounded-lg text-center">
        <h3 className="text-xl font-light tracking-wider mb-4">
          READY FOR YOUR NEXT SESSION?
        </h3>
        <p className="text-gray-300 font-light mb-6">
          Let's create something extraordinary together
        </p>
        <button className="px-8 py-3 bg-white text-gray-900 font-light tracking-wide hover:bg-gray-100 transition-colors">
          BOOK NEW SESSION
        </button>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders] = useState([
    {
      _id: "order123456789",
      _creationTime: Date.now() - 86400000,
      status: "shipped",
      total: 850,
      trackingNumber: "1Z999AA1234567890",
      items: [
        {
          productId: "prod1234",
          customizations: "Wedding Album - Leather Bound",
          quantity: 1,
          price: 850
        }
      ]
    }
  ]);

  return (
    <div className="space-y-6">
      {orders?.map((order) => (
        <div key={order._id} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-light tracking-wide text-gray-900 mb-1">
                Order #{order._id.slice(-8).toUpperCase()}
              </h3>
              <p className="text-sm text-gray-600 font-light">
                Placed {new Date(order._creationTime).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 text-xs font-light rounded ${
                order.status === "delivered" ? "bg-green-100 text-green-800" :
                order.status === "shipped" ? "bg-blue-100 text-blue-800" :
                order.status === "processing" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <p className="text-lg font-light text-gray-900 mt-2">
                ${order.total.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-900 font-light">
                    {item.customizations || `Product ${item.productId.slice(-4)}`}
                  </span>
                  <span className="text-gray-500 ml-2">× {item.quantity}</span>
                </div>
                <span className="text-gray-900 font-light">
                  ${(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {order.trackingNumber && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-light">
                  Tracking: {order.trackingNumber}
                </span>
                <button className="text-sm text-gray-900 font-light tracking-wide hover:text-gray-600">
                  TRACK PACKAGE →
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Shop CTA */}
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <h3 className="text-xl font-light tracking-wider text-gray-900 mb-4">
          BROWSE OUR ATELIER
        </h3>
        <p className="text-gray-600 font-light mb-6">
          Discover fine art prints, luxury albums, and exclusive collections
        </p>
        <button className="px-8 py-3 border border-gray-900 text-gray-900 font-light tracking-wide hover:bg-gray-900 hover:text-white transition-all duration-300">
          VISIT SHOP
        </button>
      </div>
    </div>
  );
}

function ProfileTab() {
  const [user] = useState({ name: "John Doe", email: "john@example.com" });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    company: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Mock update
      console.log('Profile updated:', formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-light tracking-wider text-gray-900">
            PROFILE INFORMATION
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-gray-900 font-light tracking-wide hover:text-gray-600"
          >
            {isEditing ? "CANCEL" : "EDIT"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-light tracking-wide text-gray-700 mb-2">
                NAME
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 focus:border-gray-900 focus:outline-none font-light disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-light tracking-wide text-gray-700 mb-2">
                EMAIL
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 font-light bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-light tracking-wide text-gray-700 mb-2">
                PHONE
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 focus:border-gray-900 focus:outline-none font-light disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-light tracking-wide text-gray-700 mb-2">
                COMPANY
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 focus:border-gray-900 focus:outline-none font-light disabled:bg-gray-50"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors"
              >
                SAVE CHANGES
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Account Settings */}
      <div className="bg-white p-8 rounded-lg shadow-sm mt-8">
        <h3 className="text-xl font-light tracking-wider text-gray-900 mb-6">
          ACCOUNT SETTINGS
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-900 font-light">Email Notifications</span>
            <button className="text-sm text-gray-600 hover:text-gray-900">
              Manage →
            </button>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-900 font-light">Privacy Settings</span>
            <button className="text-sm text-gray-600 hover:text-gray-900">
              Configure →
            </button>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-900 font-light">Download My Data</span>
            <button className="text-sm text-gray-600 hover:text-gray-900">
              Request →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
