import React, { useState } from "react";
import {
  X,
  Check,
  Edit,
  Trash2,
  Plus,
  LogOut,
  ShoppingBag,
  Utensils,
  Settings,
  Lock,
  User,
  Save,
  Phone,
  MapPin,
  Clock,
  Printer,
  ChevronDown,
  Calendar,
  Building,
  CreditCard,
  FileText,
  Image,
} from "lucide-react";
import OnlineCollections from "./payments/OnlineCollections";
import {
  submitOrderOnline,
  updateOrderStatusOnline,
  updateOrderDetailsOnline,
  deleteOrderOnline
} from "../utils/db";

// Secure Password hasher
export const hashPassword = async (inputPass: string) => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(inputPass);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hex;
  }
  return inputPass;
};

// Secure Password checker
const checkPassword = async (inputPass: string) => {
  const targetHash = localStorage.getItem("hki_admin_password_hash") || "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
  const hex = await hashPassword(inputPass);
  return hex === targetHash;
};

// Canvas-based Image Compression helper (reduces files to <100-150KB JPEGs)
export const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } catch (e) {
          // Fallback to original read if canvas write fails
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};


interface LoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export function AdminLoginPage({ onLogin, onBack }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const savedUsername = localStorage.getItem("hki_admin_username") || "admin";
    if (username !== savedUsername) {
      setError("Invalid username or password");
      setLoading(false);
      return;
    }

    const isValid = await checkPassword(password);
    if (isValid) {
      sessionStorage.setItem("hki_admin_session", "active");
      onLogin();
    } else {
      setError("Invalid username or password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-rose-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg mb-4 text-rose-950">
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-sans text-center">
            Admin Portal Access
          </h2>
          <p className="text-xs text-rose-200/50 mt-1 uppercase font-black tracking-widest">
            Hotel King's Imperial
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/15 border border-red-500/30 text-red-200 p-3 rounded-xl text-xs font-bold text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-1.5">
              <User size={12} /> Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-1.5">
              <Lock size={12} /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter security password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 border border-white/20 rounded-xl text-white font-bold hover:bg-white/10 transition-colors text-sm cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3 bg-amber-400 text-rose-950 font-black tracking-wide hover:bg-amber-300 rounded-xl transition-colors shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-rose-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Log In"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AdminDashboardPanelProps {
  menu: any;
  setMenu: React.Dispatch<React.SetStateAction<any>>;
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  siteSettings: any;
  setSiteSettings: React.Dispatch<React.SetStateAction<any>>;
  onLogout: () => void;
  onBack: () => void;
  onPrintOrder: (orderObj: any) => void;
  rooms: any[];
  setRooms: React.Dispatch<React.SetStateAction<any[]>>;
  memories: any[];
  setMemories: React.Dispatch<React.SetStateAction<any[]>>;
  ambianceImages: string[];
  setAmbianceImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export function AdminDashboardPanel({
  menu,
  setMenu,
  orders,
  setOrders,
  siteSettings,
  setSiteSettings,
  onLogout,
  onBack,
  onPrintOrder,
  rooms,
  setRooms,
  memories,
  setMemories,
  ambianceImages,
  setAmbianceImages,
}: AdminDashboardPanelProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "bookings" | "menu" | "settings" | "memories" | "payments" | "ambiance">("orders");

  const [storageUsage, setStorageUsage] = useState(() => {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          total += (localStorage.getItem(key) || "").length;
        }
      }
      return Math.round((total / 1024) * 10) / 10; // size in KB with 1 decimal
    } catch {
      return 0;
    }
  });

  const updateStorageUsage = () => {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          total += (localStorage.getItem(key) || "").length;
        }
      }
      setStorageUsage(Math.round((total / 1024) * 10) / 10);
    } catch {}
  };

  React.useEffect(() => {
    updateStorageUsage();
  }, [menu, orders, siteSettings, rooms, memories, ambianceImages]);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  
  // Table Bookings States
  const [bookingFilterDate, setBookingFilterDate] = useState<string>("");
  const [bookingSearchQuery, setBookingSearchQuery] = useState<string>("");
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [addingBooking, setAddingBooking] = useState<boolean>(false);
  const [newBookingForm, setNewBookingForm] = useState({
    customerName: "",
    customerPhone: "",
    guests: 2,
    bookingDate: new Date().toISOString().split("T")[0],
    bookingTime: "19:30",
    preferredArea: "Main Dine-in",
  });

  // Room Bookings States
  const [bookingSubTab, setBookingSubTab] = useState<"table" | "room" | "manage-rooms">("table");
  const [roomSearchQuery, setRoomSearchQuery] = useState<string>("");
  const [roomFilterStatus, setRoomFilterStatus] = useState<string>("all");
  const [addingRoomBooking, setAddingRoomBooking] = useState<boolean>(false);
  const [editingRoomBooking, setEditingRoomBooking] = useState<any | null>(null);
  const [newRoomForm, setNewRoomForm] = useState({
    customerName: "",
    customerPhone: "",
    roomType: "Kings Deluxe Room",
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split("T")[0];
    })(),
    guestsAdults: 2,
    guestsChildren: 0,
    roomCount: 1
  });
  
  // Menu Manager States
  const [menuTab, setMenuTab] = useState<string>("starters");
  const [editingDish, setEditingDish] = useState<{ item: any; category: string; subcategory: string; idx: number } | null>(null);
  const [addingDish, setAddingDish] = useState<{ category: string; subcategory: string } | null>(null);
  const [newDishName, setNewDishName] = useState("");
  const [newDishPrice, setNewDishPrice] = useState("");
  const [newDishDesc, setNewDishDesc] = useState("");
  const [newDishImage, setNewDishImage] = useState("");
  const [dishImageMode, setDishImageMode] = useState<"url" | "upload">("url");
  const [editingSubcategoryName, setEditingSubcategoryName] = useState<{ category: string; idx: number } | null>(null);
  const [newSubcategoryNameVal, setNewSubcategoryNameVal] = useState("");

  // Site Settings States
  const [settingsName, setSettingsName] = useState(siteSettings.restaurantName);
  const [settingsPhone, setSettingsPhone] = useState(siteSettings.phone);
  const [settingsWhatsapp, setSettingsWhatsapp] = useState(siteSettings.whatsapp);
  const [settingsAddress, setSettingsAddress] = useState(siteSettings.address);
  const [settingsHours, setSettingsHours] = useState(siteSettings.openHours);
  const [settingsPrice, setSettingsPrice] = useState(siteSettings.priceRange);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // New site settings customization states
  const [heroImage, setHeroImage] = useState(siteSettings.heroImage || "");
  const [heroImageMode, setHeroImageMode] = useState<"url" | "upload">("url");
  const [heroTitle, setHeroTitle] = useState(siteSettings.heroTitle || "");
  const [heroTagline, setHeroTagline] = useState(siteSettings.heroTagline || "");
  const [heroRating, setHeroRating] = useState(siteSettings.heroRating || "");

  const [signatureName, setSignatureName] = useState(siteSettings.signatureName || "");
  const [signatureDesc, setSignatureDesc] = useState(siteSettings.signatureDesc || "");
  const [signatureImage, setSignatureImage] = useState(siteSettings.signatureImage || "");
  const [signatureImageMode, setSignatureImageMode] = useState<"url" | "upload">("url");

  const [todaySpecialName, setTodaySpecialName] = useState(siteSettings.todaySpecialName || "");
  const [todaySpecialDesc, setTodaySpecialDesc] = useState(siteSettings.todaySpecialDesc || "");
  const [todaySpecialImage, setTodaySpecialImage] = useState(siteSettings.todaySpecialImage || "");
  const [todaySpecialImageMode, setTodaySpecialImageMode] = useState<"url" | "upload">("url");

  const [dineInTitle, setDineInTitle] = useState(siteSettings.dineInTitle || "");
  const [dineInDesc, setDineInDesc] = useState(siteSettings.dineInDesc || "");

  const [stats1Value, setStats1Value] = useState(siteSettings.stats1Value || "");
  const [stats1Label, setStats1Label] = useState(siteSettings.stats1Label || "");
  const [stats2Value, setStats2Value] = useState(siteSettings.stats2Value || "");
  const [stats2Label, setStats2Label] = useState(siteSettings.stats2Label || "");
  const [stats3Value, setStats3Value] = useState(siteSettings.stats3Value || "");
  const [stats3Label, setStats3Label] = useState(siteSettings.stats3Label || "");
  const [stats4Value, setStats4Value] = useState(siteSettings.stats4Value || "");
  const [stats4Label, setStats4Label] = useState(siteSettings.stats4Label || "");
  const [statsBgImage, setStatsBgImage] = useState(siteSettings.statsBgImage || "");
  const [statsBgImageMode, setStatsBgImageMode] = useState<"url" | "upload">("url");

  // Payment Settings States
  const [payUpiId, setPayUpiId] = useState(siteSettings.paymentSettings?.upiId || "8218309142@ybl");
  const [payAccountName, setPayAccountName] = useState(siteSettings.paymentSettings?.accountName || "");
  const [payBankName, setPayBankName] = useState(siteSettings.paymentSettings?.bankName || "");
  const [payAccountNo, setPayAccountNo] = useState(siteSettings.paymentSettings?.accountNo || "");
  const [payIfsc, setPayIfsc] = useState(siteSettings.paymentSettings?.ifsc || "");
  const [payQrImage, setPayQrImage] = useState(siteSettings.paymentSettings?.qrImage || "");
  const [payQrMode, setPayQrMode] = useState<"url" | "upload">("url");
  const [payNotes, setPayNotes] = useState(siteSettings.paymentSettings?.notes || "");

  // Social Media States
  const [smInstagram, setSmInstagram] = useState(siteSettings.socialMedia?.instagram || "");
  const [smFacebook, setSmFacebook] = useState(siteSettings.socialMedia?.facebook || "");
  const [smYoutube, setSmYoutube] = useState(siteSettings.socialMedia?.youtube || "");
  const [smTwitter, setSmTwitter] = useState(siteSettings.socialMedia?.twitter || "");

  // GST Settings States
  const [gstEnabled, setGstEnabled] = useState(siteSettings.gstSettings?.enabled ?? true);
  const [gstin, setGstin] = useState(siteSettings.gstSettings?.gstin || "23AABCH1234A1Z5");
  const [cgstRate, setCgstRate] = useState(siteSettings.gstSettings?.cgstRate ?? 2.5);
  const [sgstRate, setSgstRate] = useState(siteSettings.gstSettings?.sgstRate ?? 2.5);
  const [gstInclusive, setGstInclusive] = useState(siteSettings.gstSettings?.inclusive ?? false);

  // Footer Customization States
  const [footerTitle, setFooterTitle] = useState(siteSettings.footerTitle || "");
  const [footerSubtitle, setFooterSubtitle] = useState(siteSettings.footerSubtitle || "");
  const [footerDesc, setFooterDesc] = useState(siteSettings.footerDesc || "");
  const [footerWatermark, setFooterWatermark] = useState(siteSettings.footerWatermark || "");

  // Admin Credentials States
  const [newUsername, setNewUsername] = useState(() => localStorage.getItem("hki_admin_username") || "admin");
  const [newPassword, setNewPassword] = useState("");
  const [credSavedMessage, setCredSavedMessage] = useState(false);
  const [credErrorMessage, setCredErrorMessage] = useState("");

  // Memories States
  const [memType, setMemType] = useState<"photo" | "video">("photo");
  const [memUrl, setMemUrl] = useState("");
  const [memCaption, setMemCaption] = useState("");
  const [memUploadMode, setMemUploadMode] = useState<"url" | "upload">("url");

  // Ambiance States
  const [ambianceUrl, setAmbianceUrl] = useState("");
  const [ambianceUploadMode, setAmbianceUploadMode] = useState<"url" | "upload">("url");

  // Table Bookings Calculations
  const tableBookings = orders.filter((o) => o.orderType === "table-booking");
  const totalBookings = tableBookings.length;
  const totalBookingGuests = tableBookings.reduce((sum, b) => sum + (b.guests || 0), 0);
  const activeBookings = tableBookings.filter((b) => b.paymentStatus === "confirmed").length;

  const filteredBookings = tableBookings.filter((b) => {
    const matchesSearch = 
      (b.customerName && b.customerName.toLowerCase().includes(bookingSearchQuery.toLowerCase())) ||
      (b.customerPhone && b.customerPhone.includes(bookingSearchQuery)) ||
      (b.id && b.id.toLowerCase().includes(bookingSearchQuery.toLowerCase()));

    const matchesDate = bookingFilterDate ? b.bookingDate === bookingFilterDate : true;
    return matchesSearch && matchesDate;
  });

  // Room Bookings Calculations
  const roomBookings = orders.filter((o) => o.orderType === "room-booking");
  const totalRoomBookings = roomBookings.length;
  const activeRoomBookings = roomBookings.filter((b) => b.paymentStatus === "confirmed" || b.paymentStatus === "checked-in").length;
  const totalRoomRevenue = roomBookings
    .filter((b) => b.paymentStatus !== "cancelled")
    .reduce((sum, b) => sum + (b.total || 0), 0);

  const filteredRoomBookings = roomBookings.filter((b) => {
    const matchesSearch = 
      (b.customerName && b.customerName.toLowerCase().includes(roomSearchQuery.toLowerCase())) ||
      (b.customerPhone && b.customerPhone.includes(roomSearchQuery)) ||
      (b.id && b.id.toLowerCase().includes(roomSearchQuery.toLowerCase()));

    const matchesStatus = roomFilterStatus === "all" ? true : b.paymentStatus === roomFilterStatus;
    return matchesSearch && matchesStatus;
  });

  // Orders Actions
  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newStatus } : o))
    );
    updateOrderStatusOnline(orderId, newStatus);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      deleteOrderOnline(orderId);
    }
  };

  const handleUpdateOrderDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    // Recalculate total price
    const updatedTotal = editingOrder.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const updatedOrder = { ...editingOrder, total: updatedTotal };
    setOrders((prev) =>
      prev.map((o) =>
        o.id === editingOrder.id ? updatedOrder : o
      )
    );
    updateOrderDetailsOnline(updatedOrder);
    setEditingOrder(null);
  };

  // Booking Actions
  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingForm.customerName.trim() || !newBookingForm.customerPhone.trim()) {
      alert("Name and Phone are required.");
      return;
    }
    const newBookingId = `HKI-B${Math.floor(1000 + Math.random() * 9000)}`;
    const newBookingObj = {
      id: newBookingId,
      customerName: newBookingForm.customerName.trim(),
      customerPhone: newBookingForm.customerPhone.trim(),
      orderType: "table-booking",
      tableNumber: "",
      deliveryAddress: "",
      bookingDate: newBookingForm.bookingDate,
      bookingTime: newBookingForm.bookingTime,
      guests: newBookingForm.guests,
      preferredArea: newBookingForm.preferredArea,
      total: 0,
      paymentMethod: "none",
      paymentStatus: "confirmed",
      items: [],
      date: new Date().toISOString()
    };
    setOrders((prev) => [newBookingObj, ...prev]);
    submitOrderOnline(newBookingObj);
    setAddingBooking(false);
    setNewBookingForm({
      customerName: "",
      customerPhone: "",
      guests: 2,
      bookingDate: new Date().toISOString().split("T")[0],
      bookingTime: "19:30",
      preferredArea: "Main Dine-in",
    });
  };

  const handleUpdateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking.customerName.trim() || !editingBooking.customerPhone.trim()) {
      alert("Name and Phone are required.");
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === editingBooking.id ? editingBooking : o))
    );
    updateOrderDetailsOnline(editingBooking);
    setEditingBooking(null);
  };

  const handleDeleteBooking = (id: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      deleteOrderOnline(id);
    }
  };

  // Room Booking Actions
  const handleAddRoomBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomForm.customerName.trim() || !newRoomForm.customerPhone.trim()) {
      alert("Name and Phone are required.");
      return;
    }
    const checkInDate = new Date(newRoomForm.checkIn);
    const checkOutDate = new Date(newRoomForm.checkOut);
    if (checkOutDate <= checkInDate) {
      alert("Check-out date must be after check-in date.");
      return;
    }
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const foundRoom = rooms.find(r => r.name === newRoomForm.roomType || r.id === newRoomForm.roomType);
    const roomPrice = foundRoom ? foundRoom.price : 2600;
    
    const totalCost = diffDays * newRoomForm.roomCount * roomPrice;
    const newBookingId = `HKI-R${Math.floor(1000 + Math.random() * 9000)}`;
    const newBookingObj = {
      id: newBookingId,
      customerName: newRoomForm.customerName.trim(),
      customerPhone: newRoomForm.customerPhone.trim(),
      orderType: "room-booking",
      roomType: newRoomForm.roomType,
      checkIn: newRoomForm.checkIn,
      checkOut: newRoomForm.checkOut,
      guestsAdults: newRoomForm.guestsAdults,
      guestsChildren: newRoomForm.guestsChildren,
      roomCount: newRoomForm.roomCount,
      total: totalCost,
      paymentMethod: "cash",
      paymentStatus: "confirmed",
      items: [],
      date: new Date().toISOString()
    };
    setOrders((prev) => [newBookingObj, ...prev]);
    submitOrderOnline(newBookingObj);
    setAddingRoomBooking(false);
    setNewRoomForm({
      customerName: "",
      customerPhone: "",
      roomType: "Kings Deluxe Room",
      checkIn: new Date().toISOString().split("T")[0],
      checkOut: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
      })(),
      guestsAdults: 2,
      guestsChildren: 0,
      roomCount: 1
    });
  };

  const handleUpdateRoomBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoomBooking.customerName.trim() || !editingRoomBooking.customerPhone.trim()) {
      alert("Name and Phone are required.");
      return;
    }
    const checkInDate = new Date(editingRoomBooking.checkIn);
    const checkOutDate = new Date(editingRoomBooking.checkOut);
    if (checkOutDate <= checkInDate) {
      alert("Check-out date must be after check-in date.");
      return;
    }
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const roomPrice = (() => {
      const foundRoom = rooms.find(r => r.name === editingRoomBooking.roomType || r.id === editingRoomBooking.roomType);
      return foundRoom ? foundRoom.price : 2600;
    })();
    
    editingRoomBooking.total = diffDays * editingRoomBooking.roomCount * roomPrice;
    
    setOrders((prev) =>
      prev.map((o) => (o.id === editingRoomBooking.id ? editingRoomBooking : o))
    );
    updateOrderDetailsOnline(editingRoomBooking);
    setEditingRoomBooking(null);
  };

  const handleOrderQtyChange = (itemIdx: number, newQty: number) => {
    if (!editingOrder) return;
    if (newQty <= 0) {
      // Remove item
      const updatedItems = editingOrder.items.filter((_: any, idx: number) => idx !== itemIdx);
      setEditingOrder({ ...editingOrder, items: updatedItems });
    } else {
      const updatedItems = editingOrder.items.map((item: any, idx: number) =>
        idx === itemIdx ? { ...item, quantity: newQty } : item
      );
      setEditingOrder({ ...editingOrder, items: updatedItems });
    }
  };

  // Menu Manager Actions
  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingDish || !newDishName || !newDishPrice) return;

    const parsedPrice = parseInt(newDishPrice.replace(/[^0-9]/g, ""), 10);
    if (isNaN(parsedPrice)) return;

    const newDishObj = {
      name: newDishName,
      price: parsedPrice,
      desc: newDishDesc || undefined,
      image: newDishImage || undefined,
    };

    setMenu((prev: any) => {
      const categoryData = prev[addingDish.category] || [];
      const updatedCategoryData = categoryData.map((sub: any) => {
        if (sub.category === addingDish.subcategory) {
          return { ...sub, items: [...sub.items, newDishObj] };
        }
        return sub;
      });
      return { ...prev, [addingDish.category]: updatedCategoryData };
    });

    // Reset adding form
    setAddingDish(null);
    setNewDishName("");
    setNewDishPrice("");
    setNewDishDesc("");
    setNewDishImage("");
  };

  const handleUpdateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish || !newDishName || !newDishPrice) return;

    const parsedPrice = isNaN(Number(newDishPrice))
      ? newDishPrice // keep range text if bread
      : Number(newDishPrice);

    const updatedDishObj = {
      name: newDishName,
      price: parsedPrice,
      desc: newDishDesc || undefined,
      image: newDishImage || undefined,
    };

    setMenu((prev: any) => {
      const categoryData = prev[editingDish.category] || [];
      const updatedCategoryData = categoryData.map((sub: any) => {
        if (sub.category === editingDish.subcategory) {
          const updatedItems = sub.items.map((it: any, i: number) =>
            i === editingDish.idx ? updatedDishObj : it
          );
          return { ...sub, items: updatedItems };
        }
        return sub;
      });
      return { ...prev, [editingDish.category]: updatedCategoryData };
    });

    setEditingDish(null);
    setNewDishName("");
    setNewDishPrice("");
    setNewDishDesc("");
    setNewDishImage("");
  };

  const handleDeleteDish = (category: string, subcategory: string, itemIdx: number) => {
    if (window.confirm("Are you sure you want to delete this dish?")) {
      setMenu((prev: any) => {
        const categoryData = prev[category] || [];
        const updatedCategoryData = categoryData.map((sub: any) => {
          if (sub.category === subcategory) {
            const updatedItems = sub.items.filter((_: any, i: number) => i !== itemIdx);
            return { ...sub, items: updatedItems };
          }
          return sub;
        });
        return { ...prev, [category]: updatedCategoryData };
      });
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings = {
      ...siteSettings,
      restaurantName: settingsName,
      phone: settingsPhone,
      whatsapp: settingsWhatsapp.replace(/[^0-9]/g, ""),
      address: settingsAddress,
      openHours: settingsHours,
      priceRange: settingsPrice,
      heroImage,
      heroTitle,
      heroTagline,
      heroRating,
      signatureName,
      signatureDesc,
      signatureImage,
      todaySpecialName,
      todaySpecialDesc,
      todaySpecialImage,
      dineInTitle,
      dineInDesc,
      stats1Value,
      stats1Label,
      stats2Value,
      stats2Label,
      stats3Value,
      stats3Label,
      stats4Value,
      stats4Label,
      statsBgImage,
      footerTitle,
      footerSubtitle,
      footerDesc,
      footerWatermark,
      paymentSettings: {
        upiId: payUpiId,
        accountName: payAccountName,
        bankName: payBankName,
        accountNo: payAccountNo,
        ifsc: payIfsc,
        qrImage: payQrImage,
        notes: payNotes,
      },
      socialMedia: {
        instagram: smInstagram,
        facebook: smFacebook,
        youtube: smYoutube,
        twitter: smTwitter,
      },
      gstSettings: {
        enabled: gstEnabled,
        gstin: gstin,
        cgstRate: Number(cgstRate),
        sgstRate: Number(sgstRate),
        inclusive: gstInclusive,
      },
    };
    setSiteSettings(updatedSettings);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredSavedMessage(false);
    setCredErrorMessage("");

    if (!newUsername.trim()) {
      setCredErrorMessage("Username cannot be empty");
      return;
    }
    if (newPassword.length < 4) {
      setCredErrorMessage("Password must be at least 4 characters long");
      return;
    }

    try {
      const hexHash = await hashPassword(newPassword);
      try {
        localStorage.setItem("hki_admin_username", newUsername.trim());
        localStorage.setItem("hki_admin_password_hash", hexHash);
      } catch (storageErr) {
        setCredErrorMessage("Failed to save. Browser LocalStorage quota is full (5MB limit reached). Please clean up some memories.");
        return;
      }
      setCredSavedMessage(true);
      setNewPassword("");
      setTimeout(() => setCredSavedMessage(false), 3000);
    } catch (err) {
      setCredErrorMessage("Failed to update credentials. Please try again.");
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "pending":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "preparing":
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      case "out-for-delivery":
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-400";
      case "delivered":
        return "bg-teal-500/10 border-teal-500/30 text-teal-400";
      case "cancelled":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      default:
        return "bg-white/5 border-white/10 text-white/50";
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "all") return true;
    return o.paymentStatus === orderFilter;
  });

  return (
    <div className="min-h-screen bg-rose-950 flex flex-col font-sans">
      {/* Header bar */}
      <header className="border-b border-white/10 bg-rose-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-400 rounded-lg flex items-center justify-center shadow-md text-rose-950 font-black">
            K
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white leading-tight">
              {siteSettings.restaurantName}
            </h1>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest leading-none">
              Console Dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-white/20 hover:bg-white/5 text-white/80 hover:text-white rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer"
          >
            Live Site
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("hki_admin_session");
              onLogout();
            }}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Log Out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-[24px] p-4 flex flex-row md:flex-col gap-2 overflow-x-auto">
          {[
            { id: "orders", label: "Orders Management", icon: ShoppingBag },
            { id: "payments", label: "Online Collections", icon: CreditCard },
            { id: "bookings", label: "Table Bookings", icon: Calendar },
            { id: "menu", label: "Menu Editor", icon: Utensils },
            { id: "memories", label: "Our Memories", icon: Building },
            { id: "ambiance", label: "Ambiance Gallery", icon: Image },
            { id: "settings", label: "Website Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left py-3.5 px-4 rounded-xl text-xs font-bold flex items-center gap-3 transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-amber-400 text-rose-950 shadow-md font-black"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Console Workspace */}
        <main className="md:col-span-9 space-y-6">
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">Orders Pipeline</h3>
                  <p className="text-xs text-rose-200/50 mt-1">
                    Manage real-time order requests, billing status, and items modifications.
                  </p>
                </div>
                {/* Filter list */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "All" },
                    { id: "paid", label: "Paid" },
                    { id: "pending", label: "Pending" },
                    { id: "preparing", label: "Preparing" },
                    { id: "out-for-delivery", label: "Out" },
                    { id: "delivered", label: "Delivered" },
                    { id: "cancelled", label: "Cancelled" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setOrderFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                        orderFilter === filter.id
                          ? "bg-amber-400 border-amber-400 text-rose-950"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-16 text-center text-white/30 space-y-2 border border-dashed border-white/10 rounded-2xl">
                  <ShoppingBag size={48} className="mx-auto opacity-20" />
                  <p className="font-bold text-sm">No orders found</p>
                  <p className="text-xs">Placed orders will appear here dynamically.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 uppercase font-black tracking-widest text-[9px]">
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Details</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-white/2 text-white/80 transition-colors">
                          <td className="py-4 px-4 font-bold text-white">{o.id}</td>
                          <td className="py-4 px-4 font-medium">
                            <span className="block font-bold text-white uppercase">{o.customerName}</span>
                            <span className="text-[10px] text-white/40">{o.customerPhone}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="block font-bold capitalize text-amber-400">
                              {o.orderType === "dine-in" ? `Dine-in (Table ${o.tableNumber}${o.dineInDate ? ` on ${o.dineInDate} @ ${o.dineInTime}` : ""})` : o.orderType === "delivery" ? "Home Delivery" : o.orderType === "table-booking" ? `Table Booking (${o.guests} Guests on ${o.bookingDate} @ ${o.bookingTime})` : "Takeaway"}
                            </span>
                            <span className="text-[10px] text-white/40">
                              {new Date(o.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} • {o.orderType === "table-booking" ? `Reserved ${o.preferredArea}` : `${o.items.length} items`}
                            </span>
                            {o.paymentReceipt && (
                              <button
                                onClick={() => setEditingOrder(JSON.parse(JSON.stringify(o)))}
                                className="mt-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md hover:bg-emerald-500/20 transition-all cursor-pointer w-fit"
                              >
                                <FileText size={10} /> Receipt Attached
                              </button>
                            )}
                          </td>
                          <td className="py-4 px-4 font-black text-white text-sm">₹{o.total}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusBg(o.paymentStatus)}`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end items-center gap-1.5">
                              {/* Status Quick changer */}
                              <div className="relative group/select">
                                <select
                                  value={o.paymentStatus}
                                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                  className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-2.5 pr-6 py-1.5 text-[10px] font-bold uppercase text-white tracking-wide hover:bg-white/10 focus:outline-none cursor-pointer"
                                >
                                  <option value="pending" className="bg-rose-950 text-white">Pending</option>
                                  <option value="preparing" className="bg-rose-950 text-white">Preparing</option>
                                  <option value="paid" className="bg-rose-950 text-white">Paid</option>
                                  <option value="out-for-delivery" className="bg-rose-950 text-white">Out for Delivery</option>
                                  <option value="delivered" className="bg-rose-950 text-white">Delivered</option>
                                  <option value="cancelled" className="bg-rose-950 text-white">Cancelled</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-2.5 text-white/40 pointer-events-none" />
                              </div>

                              <button
                                onClick={() => setEditingOrder(JSON.parse(JSON.stringify(o)))}
                                className="p-2 border border-white/10 hover:border-white/20 text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                                title="Edit items/details"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => onPrintOrder(o)}
                                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg transition-all cursor-pointer"
                                title="Print Invoice"
                              >
                                <Printer size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(o.id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer"
                                title="Delete Order"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TABLE & ROOM BOOKINGS TAB */}
          {activeTab === "bookings" && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-xl space-y-6">
              
              {/* Toggle Sub-tabs */}
              <div className="flex gap-4 border-b border-white/10 pb-2 shrink-0">
                <button
                  onClick={() => setBookingSubTab("table")}
                  className={`pb-2.5 px-4 font-black uppercase text-xs tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${bookingSubTab === "table" ? "border-amber-400 text-amber-400" : "border-transparent text-rose-100/40 hover:text-white"}`}
                >
                  <Calendar size={14} /> Table Bookings
                </button>
                <button
                  onClick={() => setBookingSubTab("room")}
                  className={`pb-2.5 px-4 font-black uppercase text-xs tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${bookingSubTab === "room" ? "border-amber-400 text-amber-400" : "border-transparent text-rose-100/40 hover:text-white"}`}
                >
                  <Building size={14} /> Room Reservations
                </button>
                <button
                  onClick={() => setBookingSubTab("manage-rooms")}
                  className={`pb-2.5 px-4 font-black uppercase text-xs tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${bookingSubTab === "manage-rooms" ? "border-amber-400 text-amber-400" : "border-transparent text-rose-100/40 hover:text-white"}`}
                >
                  <Settings size={14} /> Manage Room Types
                </button>
              </div>

              {bookingSubTab === "table" ? (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-white">Table Reservations</h3>
                      <p className="text-[10px] text-rose-200/50 mt-0.5">
                        Manage table bookings, seating requests, and reservation statuses.
                      </p>
                    </div>
                    <button
                      onClick={() => setAddingBooking(true)}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-rose-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus size={14} /> Add Walk-in Booking
                    </button>
                  </div>

                  {/* Reservation Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Total Bookings</span>
                      <div className="text-2xl font-black text-white">{totalBookings}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Active Bookings</span>
                      <div className="text-2xl font-black text-amber-400">{activeBookings}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Total Guests Reserved</span>
                      <div className="text-2xl font-black text-rose-400">{totalBookingGuests} Persons</div>
                    </div>
                  </div>

                  {/* Filters & Search Row */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/2 p-4 rounded-2xl border border-white/5">
                    <div className="w-full sm:w-1/2 relative">
                      <input
                        type="text"
                        placeholder="Search by ID, Name or Mobile..."
                        value={bookingSearchQuery}
                        onChange={(e) => setBookingSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/50"
                      />
                    </div>
                    <div className="w-full sm:w-auto flex items-center gap-2">
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Filter Date:</span>
                      <input
                        type="date"
                        value={bookingFilterDate}
                        onChange={(e) => setBookingFilterDate(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50"
                      />
                      {bookingFilterDate && (
                        <button
                          onClick={() => setBookingFilterDate("")}
                          className="text-white/40 hover:text-white text-xs cursor-pointer underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bookings Table */}
                  {filteredBookings.length === 0 ? (
                    <div className="py-16 text-center text-white/30 space-y-2 border border-dashed border-white/10 rounded-2xl">
                      <Calendar size={48} className="mx-auto opacity-20" />
                      <p className="font-bold text-sm">No reservations found</p>
                      <p className="text-xs">Any customer table bookings will appear here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-white/40 uppercase font-black tracking-widest text-[9px]">
                            <th className="py-3 px-4">Booking ID</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Date &amp; Time</th>
                            <th className="py-3 px-4">Guests &amp; Area</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-white/2 text-white/80 transition-colors">
                              <td className="py-4 px-4 font-bold text-white">{b.id}</td>
                              <td className="py-4 px-4 font-medium">
                                <span className="block font-bold text-white uppercase">{b.customerName}</span>
                                <span className="text-[10px] text-white/40">{b.customerPhone}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="block font-bold text-amber-400">{b.bookingDate}</span>
                                <span className="text-[10px] text-white/40">@{b.bookingTime}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="block font-bold text-white">{b.guests} Guests</span>
                                <span className="text-[10px] text-white/40">{b.preferredArea}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusBg(b.paymentStatus)}`}>
                                  {b.paymentStatus}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex justify-end items-center gap-1.5">
                                  <select
                                    value={b.paymentStatus}
                                    onChange={(e) => {
                                      const updatedStatus = e.target.value;
                                      setOrders((prev) =>
                                        prev.map((o) => (o.id === b.id ? { ...o, paymentStatus: updatedStatus } : o))
                                      );
                                    }}
                                    className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-2.5 pr-6 py-1.5 text-[10px] font-bold uppercase text-white tracking-wide hover:bg-white/10 focus:outline-none cursor-pointer"
                                  >
                                    <option value="confirmed" className="bg-rose-950 text-white">Confirmed</option>
                                    <option value="completed" className="bg-rose-950 text-white">Completed</option>
                                    <option value="cancelled" className="bg-rose-950 text-white">Cancelled</option>
                                  </select>

                                  <button
                                    onClick={() => onPrintOrder(b)}
                                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all cursor-pointer"
                                    title="Print Reservation Receipt"
                                  >
                                    <Printer size={12} />
                                  </button>
                                  <button
                                    onClick={() => setEditingBooking(b)}
                                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all cursor-pointer"
                                    title="Edit Reservation"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBooking(b.id)}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer"
                                    title="Delete Booking"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : bookingSubTab === "room" ? (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-white">Room Reservations</h3>
                      <p className="text-[10px] text-rose-200/50 mt-0.5">
                        Manage luxury suite and deluxe room bookings.
                      </p>
                    </div>
                    <button
                      onClick={() => setAddingRoomBooking(true)}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-rose-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus size={14} /> Add Walk-in Room Booking
                    </button>
                  </div>

                  {/* Room Reservations Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Total Booked</span>
                      <div className="text-2xl font-black text-white">{totalRoomBookings} Bookings</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Active / Checked-In</span>
                      <div className="text-2xl font-black text-amber-400">{activeRoomBookings} Active</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Estimated Room Revenue</span>
                      <div className="text-2xl font-black text-rose-400">₹{totalRoomRevenue}</div>
                    </div>
                  </div>

                  {/* Room Filters & Search */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/2 p-4 rounded-2xl border border-white/5">
                    <div className="w-full sm:w-1/2 relative">
                      <input
                        type="text"
                        placeholder="Search by Booking ID, Guest Name or Contact..."
                        value={roomSearchQuery}
                        onChange={(e) => setRoomSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/50"
                      />
                    </div>
                    <div className="w-full sm:w-auto flex items-center gap-2">
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest text-nowrap">Filter Status:</span>
                      <select
                        value={roomFilterStatus}
                        onChange={(e) => setRoomFilterStatus(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50 cursor-pointer"
                      >
                        <option value="all" className="bg-rose-950">All Statuses</option>
                        <option value="confirmed" className="bg-rose-950">Confirmed</option>
                        <option value="checked-in" className="bg-rose-950">Checked-in</option>
                        <option value="checked-out" className="bg-rose-950">Checked-out</option>
                        <option value="cancelled" className="bg-rose-950">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Room Bookings Table */}
                  {filteredRoomBookings.length === 0 ? (
                    <div className="py-16 text-center text-white/30 space-y-2 border border-dashed border-white/10 rounded-2xl">
                      <Building size={48} className="mx-auto opacity-20" />
                      <p className="font-bold text-sm">No room reservations found</p>
                      <p className="text-xs">Room bookings will appear here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-white/40 uppercase font-black tracking-widest text-[9px]">
                            <th className="py-3 px-4">Booking ID</th>
                            <th className="py-3 px-4">Guest Info</th>
                            <th className="py-3 px-4">Stay Dates</th>
                            <th className="py-3 px-4">Room Details</th>
                            <th className="py-3 px-4">Total Price</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredRoomBookings.map((b) => {
                            const checkInDate = new Date(b.checkIn);
                            const checkOutDate = new Date(b.checkOut);
                            const nights = Math.ceil(Math.abs(checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
                            
                            return (
                              <tr key={b.id} className="hover:bg-white/2 text-white/80 transition-colors">
                                <td className="py-4 px-4 font-bold text-white">{b.id}</td>
                                <td className="py-4 px-4 font-medium">
                                  <span className="block font-bold text-white uppercase">{b.customerName}</span>
                                  <span className="text-[10px] text-white/40">{b.customerPhone}</span>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="block font-bold text-amber-400">{b.checkIn} to {b.checkOut}</span>
                                  <span className="text-[10px] text-white/40">({nights} {nights === 1 ? 'Night' : 'Nights'})</span>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="block font-bold text-white">{b.roomType}</span>
                                  <span className="text-[10px] text-rose-200/50">{b.roomCount} {b.roomCount === 1 ? 'Room' : 'Rooms'} • {b.guestsAdults}A + {b.guestsChildren}C</span>
                                </td>
                                <td className="py-4 px-4 font-extrabold text-white">₹{b.total}</td>
                                <td className="py-4 px-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                    b.paymentStatus === 'checked-in' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                    b.paymentStatus === 'checked-out' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                    getStatusBg(b.paymentStatus)
                                  }`}>
                                    {b.paymentStatus}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex justify-end items-center gap-1.5">
                                    <select
                                      value={b.paymentStatus}
                                      onChange={(e) => {
                                        const updatedStatus = e.target.value;
                                        setOrders((prev) =>
                                          prev.map((o) => (o.id === b.id ? { ...o, paymentStatus: updatedStatus } : o))
                                        );
                                      }}
                                      className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-2.5 pr-6 py-1.5 text-[10px] font-bold uppercase text-white tracking-wide hover:bg-white/10 focus:outline-none cursor-pointer"
                                    >
                                      <option value="confirmed" className="bg-rose-950 text-white">Confirmed</option>
                                      <option value="checked-in" className="bg-rose-950 text-white">Checked-in</option>
                                      <option value="checked-out" className="bg-rose-950 text-white">Checked-out</option>
                                      <option value="cancelled" className="bg-rose-950 text-white">Cancelled</option>
                                    </select>

                                    <button
                                      onClick={() => onPrintOrder(b)}
                                      className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all cursor-pointer"
                                      title="Print Room Stay Pass"
                                    >
                                      <Printer size={12} />
                                    </button>
                                    <button
                                      onClick={() => setEditingRoomBooking(b)}
                                      className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all cursor-pointer"
                                      title="Edit Reservation"
                                    >
                                      <Edit size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBooking(b.id)}
                                      className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer"
                                      title="Delete Booking"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <ManageRoomTypesTab rooms={rooms} setRooms={setRooms} />
              )}
            </div>
          )}

          {/* MENU TAB */}
          {activeTab === "menu" && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">Website Menu Manager</h3>
                  <p className="text-xs text-rose-200/50 mt-1">
                    Manage food categories, items, prices, descriptions, and list availability.
                  </p>
                </div>
              </div>

              {/* Menu Categories Tab selector */}
              <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                {Object.keys(menu).map((catKey) => (
                  <button
                    key={catKey}
                    onClick={() => setMenuTab(catKey)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                      menuTab === catKey
                        ? "bg-amber-400 border-amber-400 text-rose-950 font-black"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {catKey === "main" ? "Main Course" : catKey === "breads" ? "Breads & Rice" : catKey}
                  </button>
                ))}
              </div>

              {/* Category section mapping */}
              <div className="space-y-8">
                {menu[menuTab]?.map((subcategoryObj: any, subIdx: number) => (
                  <div key={subIdx} className="space-y-4">
                    <div className="flex justify-between items-center border-l-2 border-amber-400 pl-3">
                      {editingSubcategoryName?.category === menuTab && editingSubcategoryName?.idx === subIdx ? (
                        <div className="flex items-center gap-2 animate-fadeIn">
                          <input
                            type="text"
                            value={newSubcategoryNameVal}
                            onChange={(e) => setNewSubcategoryNameVal(e.target.value)}
                            className="bg-white/5 border border-white/20 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                          <button
                            onClick={() => {
                              if (!newSubcategoryNameVal.trim()) return;
                              setMenu((prev: any) => {
                                const categoryData = prev[menuTab] || [];
                                const updatedCategoryData = categoryData.map((sub: any, i: number) => {
                                  if (i === subIdx) {
                                    return { ...sub, category: newSubcategoryNameVal.trim() };
                                  }
                                  return sub;
                                });
                                return { ...prev, [menuTab]: updatedCategoryData };
                              });
                              setEditingSubcategoryName(null);
                            }}
                            className="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-all flex items-center justify-center cursor-pointer"
                            title="Confirm rename"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingSubcategoryName(null)}
                            className="p-1.5 bg-white/5 text-white/60 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group/title">
                          <h4 className="text-sm font-black text-white uppercase tracking-wider">
                            {subcategoryObj.category}
                          </h4>
                          <button
                            onClick={() => {
                              setEditingSubcategoryName({ category: menuTab, idx: subIdx });
                              setNewSubcategoryNameVal(subcategoryObj.category);
                            }}
                            className="p-1 text-white/40 hover:text-amber-400 transition-colors opacity-0 group-hover/title:opacity-100 focus:opacity-100 cursor-pointer"
                            title="Rename Category"
                          >
                            <Edit size={12} />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setAddingDish({ category: menuTab, subcategory: subcategoryObj.category });
                          setNewDishName("");
                          setNewDishPrice("");
                          setNewDishDesc("");
                          setNewDishImage("");
                        }}
                        className="px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={12} /> Add Dish
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {subcategoryObj.items.map((item: any, itemIdx: number) => (
                        <div
                          key={itemIdx}
                          className="flex justify-between items-center bg-white/5 border border-white/5 hover:border-white/10 p-4 rounded-2xl relative transition-all group"
                        >
                          <div className="space-y-1 pr-6 flex-1">
                            <h5 className="font-bold text-white text-xs uppercase tracking-tight truncate">
                              {item.name}
                            </h5>
                            <span className="text-emerald-400 font-bold text-xs">
                              ₹{item.price}
                            </span>
                            {item.desc && (
                              <p className="text-[10px] text-white/40 leading-snug line-clamp-1 italic">
                                "{item.desc}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingDish({
                                  item,
                                  category: menuTab,
                                  subcategory: subcategoryObj.category,
                                  idx: itemIdx,
                                });
                                setNewDishName(item.name);
                                setNewDishPrice(String(item.price));
                                setNewDishDesc(item.desc || "");
                                setNewDishImage(item.image || "");
                                setDishImageMode((item.image || "").startsWith("data:") ? "upload" : "url");
                              }}
                              className="p-2 border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-lg transition-all cursor-pointer"
                              title="Edit item details"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteDish(menuTab, subcategoryObj.category, itemIdx)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Storage Usage Bar */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">💾 Browser Database Storage Space</h3>
                    <p className="text-[10px] text-rose-200/50 mt-0.5">
                      Your website edits and high-resolution uploads are saved securely in IndexedDB and synced online (Max limit: 100,000 KB).
                    </p>
                  </div>
                  <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg">
                    {storageUsage} KB / 100,000 KB
                  </span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (storageUsage / 100000) * 100)}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      storageUsage > 80000
                        ? "bg-red-500"
                        : storageUsage > 50000
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                  />
                </div>
                {storageUsage > 90000 && (
                  <p className="text-[10px] text-red-400 font-bold flex items-center gap-1.5 animate-pulse mt-1">
                    ⚠️ Storage is almost full! Please clear some memories or ambiance photos to free up space.
                  </p>
                )}
              </div>

              {/* General Settings */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-xl space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white">General Information</h3>
                  <p className="text-xs text-rose-200/50 mt-1">Change the general information of your restaurant.</p>
                </div>

                {settingsSavedMessage && (
                  <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 p-3.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                    <Check size={16} /> All settings saved successfully!
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Restaurant Name</label>
                      <input type="text" required value={settingsName} onChange={(e) => setSettingsName(e.target.value)} placeholder="e.g. Hotel King's Imperial" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-1"><Phone size={12} /> Contact Phone</label>
                      <input type="text" required value={settingsPhone} onChange={(e) => setSettingsPhone(e.target.value)} placeholder="e.g. +91 78800 09493" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">WhatsApp Number</label>
                      <input type="text" required value={settingsWhatsapp} onChange={(e) => setSettingsWhatsapp(e.target.value)} placeholder="e.g. 918218309142" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      <span className="text-[9px] text-white/30 block">Prefix country code, e.g. 91xxxxxxxxxx</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-1"><Clock size={12} /> Operating Hours</label>
                      <input type="text" required value={settingsHours} onChange={(e) => setSettingsHours(e.target.value)} placeholder="e.g. Till Midnight" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-1"><MapPin size={12} /> Address</label>
                    <textarea required value={settingsAddress} onChange={(e) => setSettingsAddress(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Price Range</label>
                    <input type="text" required value={settingsPrice} onChange={(e) => setSettingsPrice(e.target.value)} placeholder="e.g. ₹200–400" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                  </div>
                  <div className="pt-2 text-right">
                    <button type="submit" className="px-5 py-2.5 bg-amber-400 text-rose-950 font-bold hover:bg-amber-300 rounded-xl transition-colors shadow-md text-xs flex items-center gap-2 inline-flex cursor-pointer">
                      <Save size={14} /> Save All Settings
                    </button>
                  </div>

                  {/* Hero Customization Section */}
                  <div className="border-t border-white/10 pt-5 space-y-4">
                    <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">🌟 Homepage Hero Section</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Hotel Name in Hero</label>
                        <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="e.g. HOTEL KING'S IMPERIAL" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Hero Tagline</label>
                        <input type="text" value={heroTagline} onChange={(e) => setHeroTagline(e.target.value)} placeholder="Tagline below title" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Hero Rating Badge</label>
                        <input type="text" value={heroRating} onChange={(e) => setHeroRating(e.target.value)} placeholder="e.g. 4.8 Rating" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Hero Image</label>
                          <button type="button" onClick={() => setHeroImageMode(m => m === "url" ? "upload" : "url")} className="text-[9px] text-amber-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 cursor-pointer">
                            Switch to {heroImageMode === "url" ? "Upload" : "URL"}
                          </button>
                        </div>
                        {heroImageMode === "url" ? (
                          <input type="text" value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="Hero image URL (leave blank for default)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                        ) : (
                          <input type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const compressed = await compressImage(file);
                                setHeroImage(compressed);
                              } catch (err) {
                                console.error("Failed to compress image:", err);
                                alert("Failed to process image.");
                              }
                            }
                          }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[8px] file:font-black file:bg-white/10 file:text-white" />
                        )}
                        {heroImage && (
                          <div className="flex items-center gap-3 mt-1">
                            <img src={heroImage} alt="Hero Preview" className="w-16 h-12 rounded border border-white/20 object-cover" />
                            <button type="button" onClick={() => setHeroImage("")} className="text-[9px] text-rose-400 font-bold hover:text-rose-300">Clear Image</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 text-right">
                      <button type="submit" className="px-5 py-2.5 bg-amber-400 text-rose-950 font-bold hover:bg-amber-300 rounded-xl transition-colors shadow-md text-xs flex items-center gap-2 inline-flex cursor-pointer">
                        <Save size={14} /> Save All Settings
                      </button>
                    </div>
                  </div>

                  {/* Featured Dishes Section */}
                  <div className="border-t border-white/10 pt-5 space-y-5">
                    <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">🍛 Featured Homepage Cards</h4>
                    
                    {/* Signature Dish */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                      <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">1. Signature Dish Card</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Dish Name</label>
                          <input type="text" value={signatureName} onChange={(e) => setSignatureName(e.target.value)} placeholder="e.g. Butter Paneer Masala" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Dish Description</label>
                          <input type="text" value={signatureDesc} onChange={(e) => setSignatureDesc(e.target.value)} placeholder="Description text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Dish Image</label>
                            <button type="button" onClick={() => setSignatureImageMode(m => m === "url" ? "upload" : "url")} className="text-[9px] text-amber-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 cursor-pointer">
                              Switch to {signatureImageMode === "url" ? "Upload" : "URL"}
                            </button>
                          </div>
                          {signatureImageMode === "url" ? (
                            <input type="text" value={signatureImage} onChange={(e) => setSignatureImage(e.target.value)} placeholder="Dish image URL" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                          ) : (
                            <input type="file" accept="image/*" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressImage(file);
                                  setSignatureImage(compressed);
                                } catch (err) {
                                  console.error("Failed to compress image:", err);
                                  alert("Failed to process image.");
                                }
                              }
                            }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[8px] file:font-black file:bg-white/10 file:text-white" />
                          )}
                          {signatureImage && (
                            <div className="flex items-center gap-3 mt-1">
                              <img src={signatureImage} alt="Signature Preview" className="w-16 h-12 rounded border border-white/20 object-cover" />
                              <button type="button" onClick={() => setSignatureImage("")} className="text-[9px] text-rose-400 font-bold hover:text-rose-300">Clear Image</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Today's Special */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                      <span className="text-[10px] text-rose-400 font-black uppercase tracking-widest">2. Today's Special Card (Chef's Special)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Special Dish Name</label>
                          <input type="text" value={todaySpecialName} onChange={(e) => setTodaySpecialName(e.target.value)} placeholder="e.g. Poha & Kachori" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Special Description</label>
                          <input type="text" value={todaySpecialDesc} onChange={(e) => setTodaySpecialDesc(e.target.value)} placeholder="Description text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Special Image</label>
                            <button type="button" onClick={() => setTodaySpecialImageMode(m => m === "url" ? "upload" : "url")} className="text-[9px] text-amber-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 cursor-pointer">
                              Switch to {todaySpecialImageMode === "url" ? "Upload" : "URL"}
                            </button>
                          </div>
                          {todaySpecialImageMode === "url" ? (
                            <input type="text" value={todaySpecialImage} onChange={(e) => setTodaySpecialImage(e.target.value)} placeholder="Special image URL" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                          ) : (
                            <input type="file" accept="image/*" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressImage(file);
                                  setTodaySpecialImage(compressed);
                                } catch (err) {
                                  console.error("Failed to compress image:", err);
                                  alert("Failed to process image.");
                                }
                              }
                            }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[8px] file:font-black file:bg-white/10 file:text-white" />
                          )}
                          {todaySpecialImage && (
                            <div className="flex items-center gap-3 mt-1">
                              <img src={todaySpecialImage} alt="Special Preview" className="w-16 h-12 rounded border border-white/20 object-cover" />
                              <button type="button" onClick={() => setTodaySpecialImage("")} className="text-[9px] text-rose-400 font-bold hover:text-rose-300">Clear Image</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 text-right">
                      <button type="submit" className="px-5 py-2.5 bg-amber-400 text-rose-950 font-bold hover:bg-amber-300 rounded-xl transition-colors shadow-md text-xs flex items-center gap-2 inline-flex cursor-pointer">
                        <Save size={14} /> Save All Settings
                      </button>
                    </div>
                  </div>

                  {/* Info Cards & Metrics Section */}
                  <div className="border-t border-white/10 pt-5 space-y-4">
                    <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">📊 Info Cards & Stats Banner</h4>
                    
                    {/* Dine-in & Delivery Text Customization */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">Dine-in & Delivery Info Card</span>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Card Title</label>
                        <input type="text" value={dineInTitle} onChange={(e) => setDineInTitle(e.target.value)} placeholder="e.g. Dine-in & Delivery" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Card Description</label>
                        <input type="text" value={dineInDesc} onChange={(e) => setDineInDesc(e.target.value)} placeholder="e.g. Home Delivery Available" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                    </div>

                    {/* Stats Boxes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Stat 1 */}
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2">
                        <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest block border-b border-white/5 pb-1">Stat Box 1</span>
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Value</label>
                          <input type="text" value={stats1Value} onChange={(e) => setStats1Value(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[11px] focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Label</label>
                          <input type="text" value={stats1Label} onChange={(e) => setStats1Label(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[11px] focus:outline-none" />
                        </div>
                      </div>

                      {/* Stat 2 */}
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2">
                        <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest block border-b border-white/5 pb-1">Stat Box 2</span>
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Value</label>
                          <input type="text" value={stats2Value} onChange={(e) => setStats2Value(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[11px] focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Label</label>
                          <input type="text" value={stats2Label} onChange={(e) => setStats2Label(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[11px] focus:outline-none" />
                        </div>
                      </div>

                      {/* Stat 3 */}
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2">
                        <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest block border-b border-white/5 pb-1">Stat Box 3</span>
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Value</label>
                          <input type="text" value={stats3Value} onChange={(e) => setStats3Value(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[11px] focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Label</label>
                          <input type="text" value={stats3Label} onChange={(e) => setStats3Label(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[11px] focus:outline-none" />
                        </div>
                      </div>

                      {/* Stat 4 */}
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2">
                        <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest block border-b border-white/5 pb-1">Stat Box 4</span>
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Value</label>
                          <input type="text" value={stats4Value} onChange={(e) => setStats4Value(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[11px] focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Label</label>
                          <input type="text" value={stats4Label} onChange={(e) => setStats4Label(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[11px] focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Stats Banner Background Image */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Stats Banner Background Image (Optional)</label>
                        <button type="button" onClick={() => setStatsBgImageMode(m => m === "url" ? "upload" : "url")} className="text-[9px] text-amber-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 cursor-pointer">
                          Switch to {statsBgImageMode === "url" ? "Upload" : "URL"}
                        </button>
                      </div>
                      {statsBgImageMode === "url" ? (
                        <input type="text" value={statsBgImage} onChange={(e) => setStatsBgImage(e.target.value)} placeholder="Background image URL" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      ) : (
                        <input type="file" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImage(file);
                              setStatsBgImage(compressed);
                            } catch (err) {
                              console.error("Failed to compress image:", err);
                              alert("Failed to process image.");
                            }
                          }
                        }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[8px] file:font-black file:bg-white/10 file:text-white" />
                      )}
                      {statsBgImage && (
                        <div className="flex items-center gap-3 mt-1">
                          <img src={statsBgImage} alt="Background Preview" className="w-16 h-12 rounded border border-white/20 object-cover" />
                          <button type="button" onClick={() => setStatsBgImage("")} className="text-[9px] text-rose-400 font-bold hover:text-rose-300">Clear Background Image</button>
                        </div>
                      )}
                    </div>
                    <div className="pt-2 text-right">
                      <button type="submit" className="px-5 py-2.5 bg-amber-400 text-rose-950 font-bold hover:bg-amber-300 rounded-xl transition-colors shadow-md text-xs flex items-center gap-2 inline-flex cursor-pointer">
                        <Save size={14} /> Save All Settings
                      </button>
                    </div>
                  </div>

                  {/* Payment Settings */}
                  <div className="border-t border-white/10 pt-5 space-y-4">
                    <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">💳 Payment / UPI Settings</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">UPI ID *</label>
                        <input type="text" value={payUpiId} onChange={(e) => setPayUpiId(e.target.value)} placeholder="e.g. 8218309142@ybl" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors font-mono" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Account Holder Name</label>
                        <input type="text" value={payAccountName} onChange={(e) => setPayAccountName(e.target.value)} placeholder="e.g. Hotel King's Imperial" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Bank Name</label>
                        <input type="text" value={payBankName} onChange={(e) => setPayBankName(e.target.value)} placeholder="e.g. Yes Bank" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Account Number</label>
                        <input type="text" value={payAccountNo} onChange={(e) => setPayAccountNo(e.target.value)} placeholder="Bank account number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors font-mono" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">IFSC Code</label>
                        <input type="text" value={payIfsc} onChange={(e) => setPayIfsc(e.target.value)} placeholder="e.g. YESB0001234" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors font-mono" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Payment Notes</label>
                        <input type="text" value={payNotes} onChange={(e) => setPayNotes(e.target.value)} placeholder="e.g. Scan QR or use UPI ID" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                    </div>

                    {/* QR Image */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Custom QR Image (optional)</label>
                        <button type="button" onClick={() => setPayQrMode(m => m === "url" ? "upload" : "url")} className="text-[9px] text-amber-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 cursor-pointer">
                          Switch to {payQrMode === "url" ? "Upload" : "URL"}
                        </button>
                      </div>
                      {payQrMode === "url" ? (
                        <input type="text" value={payQrImage} onChange={(e) => setPayQrImage(e.target.value)} placeholder="QR image URL (leave blank to auto-generate)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      ) : (
                        <input type="file" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImage(file);
                              setPayQrImage(compressed);
                            } catch (err) {
                              console.error("Failed to compress image:", err);
                              alert("Failed to process image.");
                            }
                          }
                        }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[8px] file:font-black file:bg-white/10 file:text-white" />
                      )}
                      {payQrImage && (
                        <div className="flex items-center gap-3 mt-1">
                          <img src={payQrImage} alt="QR Preview" className="w-16 h-16 rounded border border-white/20 object-contain bg-white p-1" />
                          <button type="button" onClick={() => setPayQrImage("")} className="text-[9px] text-rose-400 font-bold hover:text-rose-300">Clear QR</button>
                        </div>
                      )}
                      <p className="text-[9px] text-white/30">If blank, QR code will be auto-generated using your UPI ID with the order amount filled automatically.</p>
                    </div>
                    <div className="pt-2 text-right">
                      <button type="submit" className="px-5 py-2.5 bg-amber-400 text-rose-950 font-bold hover:bg-amber-300 rounded-xl transition-colors shadow-md text-xs flex items-center gap-2 inline-flex cursor-pointer">
                        <Save size={14} /> Save All Settings
                      </button>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="border-t border-white/10 pt-5 space-y-4">
                    <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">📱 Social Media Links</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Instagram URL</label>
                        <input type="url" value={smInstagram} onChange={(e) => setSmInstagram(e.target.value)} placeholder="https://instagram.com/yourpage" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Facebook URL</label>
                        <input type="url" value={smFacebook} onChange={(e) => setSmFacebook(e.target.value)} placeholder="https://facebook.com/yourpage" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">YouTube URL</label>
                        <input type="url" value={smYoutube} onChange={(e) => setSmYoutube(e.target.value)} placeholder="https://youtube.com/@yourchannel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">X (Twitter) URL</label>
                        <input type="url" value={smTwitter} onChange={(e) => setSmTwitter(e.target.value)} placeholder="https://x.com/yourhandle" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                    </div>
                    <div className="pt-2 text-right">
                      <button type="submit" className="px-5 py-2.5 bg-amber-400 text-rose-950 font-bold hover:bg-amber-300 rounded-xl transition-colors shadow-md text-xs flex items-center gap-2 inline-flex cursor-pointer">
                        <Save size={14} /> Save All Settings
                      </button>
                    </div>
                  </div>

                  {/* GST Settings */}
                  <div className="border-t border-white/10 pt-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">📊 GST Billing Settings</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={gstEnabled} onChange={(e) => setGstEnabled(e.target.checked)} className="rounded border-white/10 text-amber-400 focus:ring-0 focus:ring-offset-0 bg-white/5 w-4 h-4 cursor-pointer" />
                        <span className="text-[10px] text-white/80 font-bold uppercase tracking-wide">Enable GST Billing</span>
                      </label>
                    </div>

                    {gstEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">GSTIN Number</label>
                          <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="e.g. 23AABCH1234A1Z5" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors font-mono" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">CGST Rate (%)</label>
                          <input type="number" step="0.01" value={cgstRate} onChange={(e) => setCgstRate(parseFloat(e.target.value) || 0)} placeholder="e.g. 2.5" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">SGST Rate (%)</label>
                          <input type="number" step="0.01" value={sgstRate} onChange={(e) => setSgstRate(parseFloat(e.target.value) || 0)} placeholder="e.g. 2.5" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                        </div>
                        <div className="space-y-2 flex flex-col justify-end pb-1">
                          <label className="flex items-center gap-2.5 cursor-pointer bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-all">
                            <input type="checkbox" checked={gstInclusive} onChange={(e) => setGstInclusive(e.target.checked)} className="rounded border-white/10 text-amber-400 focus:ring-0 focus:ring-offset-0 bg-white/5 w-4.5 h-4.5 cursor-pointer" />
                            <div>
                              <span className="text-[10px] text-white font-bold block uppercase tracking-wide">Inclusive of GST</span>
                              <span className="text-[8px] text-white/40 block leading-tight mt-0.5">Check if menu prices already include GST. Uncheck to add GST on top of menu prices.</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Page (Footer) Settings */}
                  <div className="border-t border-white/10 pt-5 space-y-4">
                    <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">🔻 Bottom Page (Footer) Settings</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Footer Giant Branding Title</label>
                        <input type="text" value={footerTitle} onChange={(e) => setFooterTitle(e.target.value)} placeholder="e.g. King's Imperial" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Footer Subtitle / Tagline</label>
                        <input type="text" value={footerSubtitle} onChange={(e) => setFooterSubtitle(e.target.value)} placeholder="e.g. Purely Plant-Based Excellence • Since 1998" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Giant Backdrop Watermark</label>
                        <input type="text" value={footerWatermark} onChange={(e) => setFooterWatermark(e.target.value)} placeholder="e.g. IMPERIAL" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Footer Description / Story</label>
                        <textarea value={footerDesc} onChange={(e) => setFooterDesc(e.target.value)} rows={3} placeholder="e.g. Purely Plant-Based Excellence since 1998. Crafting..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors resize-none" />
                      </div>
                    </div>
                    <div className="pt-2 text-right">
                      <button type="submit" className="px-5 py-2.5 bg-amber-400 text-rose-950 font-bold hover:bg-amber-300 rounded-xl transition-colors shadow-md text-xs flex items-center gap-2 inline-flex cursor-pointer">
                        <Save size={14} /> Save All Settings
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 text-right">
                    <button type="submit" className="px-6 py-3 bg-amber-400 text-rose-950 font-black tracking-wide hover:bg-amber-300 rounded-xl transition-colors shadow-lg text-xs flex items-center gap-2 inline-flex cursor-pointer">
                      <Save size={16} /> Save All Settings
                    </button>
                  </div>
                </form>
              </div>

              {/* Admin Credentials Settings */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-xl space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">🔑 Admin Credentials</h3>
                  <p className="text-xs text-rose-200/50 mt-1">Update your admin panel login username and security password.</p>
                </div>

                {credSavedMessage && (
                  <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 p-3.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-fadeIn">
                    <Check size={16} /> Admin credentials updated successfully!
                  </div>
                )}
                {credErrorMessage && (
                  <div className="bg-red-500/15 border border-red-500/30 text-red-200 p-3.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-fadeIn">
                    ⚠️ {credErrorMessage}
                  </div>
                )}

                <form onSubmit={handleSaveCredentials} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">New Username</label>
                      <input type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="e.g. admin" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">New Password</label>
                      <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors" />
                    </div>
                  </div>

                  <div className="pt-2 text-right">
                    <button type="submit" className="px-6 py-3 bg-amber-400 text-rose-950 font-black tracking-wide hover:bg-amber-300 rounded-xl transition-colors shadow-lg text-xs flex items-center gap-2 inline-flex cursor-pointer">
                      <Lock size={16} /> Update Credentials
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MEMORIES TAB */}
          {activeTab === "memories" && (
            <div className="space-y-6">
              {/* Add Memory */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-xl space-y-5">
                <h3 className="text-xl font-black text-white">📸 Add Memory</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(["photo", "video"] as const).map(t => (
                    <button key={t} type="button" onClick={() => setMemType(t)} className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${memType === t ? "bg-amber-400 border-amber-400 text-rose-950" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}>
                      {t === "photo" ? "📷 Photo" : "🎬 Video / YouTube"}
                    </button>
                  ))}
                </div>

                {memType === "photo" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Photo</label>
                      <button type="button" onClick={() => setMemUploadMode(m => m === "url" ? "upload" : "url")} className="text-[9px] text-amber-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 cursor-pointer">
                        Switch to {memUploadMode === "url" ? "Upload" : "URL"}
                      </button>
                    </div>
                    {memUploadMode === "url" ? (
                      <input type="text" value={memUrl} onChange={(e) => setMemUrl(e.target.value)} placeholder="Photo URL https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none" />
                    ) : (
                      <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file);
                            setMemUrl(compressed);
                          } catch (err) {
                            console.error("Failed to compress image:", err);
                            alert("Failed to process image.");
                          }
                        }
                      }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[8px] file:font-black file:bg-white/10 file:text-white" />
                    )}
                  </div>
                )}

                {memType === "video" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Video</label>
                      <button type="button" onClick={() => setMemUploadMode(m => m === "url" ? "upload" : "url")} className="text-[9px] text-amber-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 cursor-pointer">
                        Switch to {memUploadMode === "url" ? "Upload" : "URL"}
                      </button>
                    </div>
                    {memUploadMode === "url" ? (
                      <input type="text" value={memUrl} onChange={(e) => setMemUrl(e.target.value)} placeholder="YouTube / Video URL https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none" />
                    ) : (
                      <input type="file" accept="video/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 1.5 * 1024 * 1024) {
                            alert("Video size must be less than 1.5MB. Please choose a smaller file or use a YouTube link.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => setMemUrl(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[8px] file:font-black file:bg-white/10 file:text-white" />
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Caption (Optional)</label>
                  <input type="text" value={memCaption} onChange={(e) => setMemCaption(e.target.value)} placeholder="Add a caption..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!memUrl.trim()) return;
                    const newMem = { type: memType, url: memUrl.trim(), caption: memCaption.trim(), date: new Date().toISOString() };
                    setMemories(prev => [newMem, ...prev]);
                    setMemUrl(""); setMemCaption("");
                  }}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus size={14} /> Add to Memories
                </button>
              </div>

              {/* Memories Grid */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-xl">
                <h3 className="text-lg font-black text-white mb-5">All Memories ({memories.length})</h3>
                {memories.length === 0 ? (
                  <div className="text-center py-12 text-white/30">
                    <div className="text-4xl mb-3">📷</div>
                    <p className="text-sm font-bold">No memories added yet.</p>
                    <p className="text-xs">Add photos, videos or links above to showcase them on the website.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {memories.map((mem: any, idx: number) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 group">
                        {mem.type === "photo" && mem.url && (
                          <img src={mem.url} alt={mem.caption || `Memory ${idx+1}`} className="w-full h-32 object-cover" />
                        )}
                        {mem.type === "video" && (
                          <div className="w-full h-32 bg-black/50 flex items-center justify-center">
                            <span className="text-3xl">🎬</span>
                          </div>
                        )}
                        {mem.type === "link" && (
                          <div className="w-full h-32 bg-white/5 flex items-center justify-center">
                            <span className="text-3xl">🔗</span>
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-[10px] text-white/70 font-bold truncate">{mem.caption || mem.url}</p>
                          <p className="text-[9px] text-white/30">{mem.type} • {new Date(mem.date).toLocaleDateString("en-IN")}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this memory?")) {
                              setMemories(prev => prev.filter((_, i) => i !== idx));
                            }
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AMBIANCE TAB */}
          {activeTab === "ambiance" && (
            <div className="space-y-6">
              {/* Add Ambiance Image */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-xl space-y-5">
                <h3 className="text-xl font-black text-white">🖼️ Add Ambiance Photo</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Image Source</label>
                    <button type="button" onClick={() => setAmbianceUploadMode(m => m === "url" ? "upload" : "url")} className="text-[9px] text-amber-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 cursor-pointer">
                      Switch to {ambianceUploadMode === "url" ? "Upload" : "URL"}
                    </button>
                  </div>
                  {ambianceUploadMode === "url" ? (
                    <input type="text" value={ambianceUrl} onChange={(e) => setAmbianceUrl(e.target.value)} placeholder="Photo URL https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none" />
                  ) : (
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressImage(file);
                          setAmbianceUrl(compressed);
                        } catch (err) {
                          console.error("Failed to compress image:", err);
                          alert("Failed to process image.");
                        }
                      }
                    }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[8px] file:font-black file:bg-white/10 file:text-white" />
                  )}
                </div>

                {ambianceUrl && (
                  <div className="flex items-center gap-3">
                    <img src={ambianceUrl} alt="Preview" className="w-24 h-16 object-cover rounded border border-white/20" />
                    <button type="button" onClick={() => setAmbianceUrl("")} className="text-xs text-rose-400 font-bold hover:text-rose-300">Clear</button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (!ambianceUrl.trim()) return;
                    setAmbianceImages(prev => [ambianceUrl.trim(), ...prev]);
                    setAmbianceUrl("");
                  }}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus size={14} /> Add to Ambiance
                </button>
              </div>

              {/* Ambiance Grid */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-xl">
                <h3 className="text-lg font-black text-white mb-5">Ambiance Gallery Photos ({ambianceImages.length})</h3>
                {ambianceImages.length === 0 ? (
                  <div className="text-center py-12 text-white/30">
                    <div className="text-4xl mb-3">🖼️</div>
                    <p className="text-sm font-bold">No photos in the gallery.</p>
                    <p className="text-xs">Add photos to show them on the website gallery.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {ambianceImages.map((src, idx) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 group h-32">
                        <img src={src} alt={`Ambiance Gallery ${idx+1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this photo from Ambiance Gallery?")) {
                              setAmbianceImages(prev => prev.filter((_, i) => i !== idx));
                            }
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === "payments" && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-xl">
              <OnlineCollections
                orders={orders}
                setOrders={setOrders}
                onPrintOrder={onPrintOrder}
              />
            </div>
          )}
        </main>
      </div>

      {/* EDIT ORDER DETAILS MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-rose-950 border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col gap-6 text-left max-h-[90vh]">
            <button
              onClick={() => setEditingOrder(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                Edit Order: {editingOrder.id}
              </h4>
              <p className="text-[10px] text-rose-200/50 mt-1 uppercase font-black tracking-widest">
                Edit customer metadata and item quantities.
              </p>
            </div>

            <form onSubmit={handleUpdateOrderDetails} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {/* Customer details fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Customer Name</label>
                  <input
                    type="text"
                    value={editingOrder.customerName}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Customer Mobile</label>
                  <input
                    type="text"
                    value={editingOrder.customerPhone}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerPhone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Order Mode Inputs */}
              {editingOrder.orderType === "dine-in" ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Table Number</label>
                    <input
                      type="text"
                      value={editingOrder.tableNumber}
                      onChange={(e) => setEditingOrder({ ...editingOrder, tableNumber: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Dine-in Date</label>
                    <input
                      type="date"
                      value={editingOrder.dineInDate || ""}
                      onChange={(e) => setEditingOrder({ ...editingOrder, dineInDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Dine-in Time</label>
                    <input
                      type="time"
                      value={editingOrder.dineInTime || ""}
                      onChange={(e) => setEditingOrder({ ...editingOrder, dineInTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              ) : editingOrder.orderType === "delivery" ? (
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Delivery Address</label>
                  <textarea
                    value={editingOrder.deliveryAddress}
                    onChange={(e) => setEditingOrder({ ...editingOrder, deliveryAddress: e.target.value })}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              ) : editingOrder.orderType === "table-booking" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Booking Date</label>
                    <input
                      type="date"
                      value={editingOrder.bookingDate || ""}
                      onChange={(e) => setEditingOrder({ ...editingOrder, bookingDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Booking Time</label>
                    <input
                      type="time"
                      value={editingOrder.bookingTime || ""}
                      onChange={(e) => setEditingOrder({ ...editingOrder, bookingTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Guests Count</label>
                    <input
                      type="number"
                      value={editingOrder.guests || 1}
                      onChange={(e) => setEditingOrder({ ...editingOrder, guests: parseInt(e.target.value) || 1 })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Preferred Area</label>
                    <select
                      value={editingOrder.preferredArea || "Main Dine-in"}
                      onChange={(e) => setEditingOrder({ ...editingOrder, preferredArea: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Main Dine-in" className="bg-rose-950">Main Dine-in</option>
                      <option value="Rooftop" className="bg-rose-950">Rooftop Sky Lounge</option>
                      <option value="Family Hall" className="bg-rose-950">Family Banquet Hall</option>
                      <option value="Garden" className="bg-rose-950">Imperial Garden</option>
                    </select>
                  </div>
                </div>
              ) : null}

              {/* Items modification */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block">Dishes in Order</label>
                
                {editingOrder.items.length === 0 ? (
                  <p className="text-center py-4 text-xs text-white/30 italic">No dishes in this order. Add or cancel order.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {editingOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-white/5 p-3 border border-white/5 rounded-xl text-xs">
                        <div className="flex-1 min-w-0 pr-4">
                          <strong className="block text-white truncate uppercase tracking-tight">{item.name}</strong>
                          <span className="text-[10px] text-amber-400/80">₹{item.price} each</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-white/10 rounded-lg bg-black/20 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleOrderQtyChange(idx, item.quantity - 1)}
                              className="px-2.5 py-1 text-white/60 hover:text-white hover:bg-white/5 transition-colors font-bold"
                            >
                              -
                            </button>
                            <span className="px-2.5 text-white font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleOrderQtyChange(idx, item.quantity + 1)}
                              className="px-2.5 py-1 text-white/60 hover:text-white hover:bg-white/5 transition-colors font-bold"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-black text-white w-14 text-right">₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Receipt Display */}
              {editingOrder.paymentReceipt && (
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <label className="text-[10px] text-white/40 font-black uppercase tracking-widest block">Uploaded Payment Receipt</label>
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 p-2 max-w-xs mx-auto group">
                    <img
                      src={editingOrder.paymentReceipt}
                      alt="Payment Receipt"
                      className="w-full h-auto rounded-xl object-contain max-h-56"
                    />
                    <a
                      href={editingOrder.paymentReceipt}
                      download={`receipt-${editingOrder.id}.png`}
                      className="absolute bottom-4 right-4 bg-amber-400 hover:bg-amber-300 text-rose-950 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-lg cursor-pointer"
                    >
                      <Plus size={10} /> Download Receipt
                    </a>
                  </div>
                </div>
              )}

              {/* Action row */}
              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="flex-1 py-3 border border-white/20 hover:bg-white/5 rounded-xl text-white font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black tracking-wide rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW DISH MODAL */}
      {addingDish && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-rose-950 border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl relative flex flex-col gap-6 text-left">
            <button
              onClick={() => setAddingDish(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                Add New Dish
              </h4>
              <p className="text-[10px] text-rose-200/50 mt-1 uppercase font-black tracking-widest">
                Category: {addingDish.category} &middot; Group: {addingDish.subcategory}
              </p>
            </div>

            <form onSubmit={handleAddDish} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  placeholder="e.g. Garlic Fried Rice"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Price (INR) *</label>
                <input
                  type="text"
                  required
                  value={newDishPrice}
                  onChange={(e) => setNewDishPrice(e.target.value)}
                  placeholder="e.g. 240"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Description</label>
                <textarea
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  placeholder="e.g. Sautéed with roasted garlic and green scallions"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Dish Image</label>
                  <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={() => setDishImageMode("url")}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all cursor-pointer ${dishImageMode === "url" ? "bg-amber-400 text-rose-950" : "text-white/50"}`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setDishImageMode("upload")}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all cursor-pointer ${dishImageMode === "upload" ? "bg-amber-400 text-rose-950" : "text-white/50"}`}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                {dishImageMode === "url" ? (
                  <input
                    type="text"
                    value={newDishImage}
                    onChange={(e) => setNewDishImage(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressImage(file);
                          setNewDishImage(compressed);
                        } catch (err) {
                          console.error("Failed to compress image:", err);
                          alert("Failed to process image.");
                        }
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-white/10 file:text-white"
                  />
                )}

                {newDishImage && (
                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="w-10 h-10 rounded overflow-hidden border border-white/10 shrink-0">
                      <img src={newDishImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[8px] text-white/40 truncate font-mono flex-1">{newDishImage.startsWith("data:") ? "Direct Upload" : newDishImage}</p>
                    <button
                      type="button"
                      onClick={() => setNewDishImage("")}
                      className="text-[9px] text-rose-400 hover:text-rose-300 font-bold uppercase cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAddingDish(null)}
                  className="flex-1 py-3 border border-white/20 hover:bg-white/5 rounded-xl text-white font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black tracking-wide rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Add to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DISH DETAILS MODAL */}
      {editingDish && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-rose-950 border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl relative flex flex-col gap-6 text-left">
            <button
              onClick={() => setEditingDish(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                Edit Dish Details
              </h4>
              <p className="text-[10px] text-rose-200/50 mt-1 uppercase font-black tracking-widest">
                Category: {editingDish.category} &middot; Group: {editingDish.subcategory}
              </p>
            </div>

            <form onSubmit={handleUpdateDish} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  placeholder="e.g. Paneer Butter Masala"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Price *</label>
                <input
                  type="text"
                  required
                  value={newDishPrice}
                  onChange={(e) => setNewDishPrice(e.target.value)}
                  placeholder="e.g. 280"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Description</label>
                <textarea
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  placeholder="Enter dish description"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Dish Image</label>
                  <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={() => setDishImageMode("url")}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all cursor-pointer ${dishImageMode === "url" ? "bg-amber-400 text-rose-950" : "text-white/50"}`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setDishImageMode("upload")}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all cursor-pointer ${dishImageMode === "upload" ? "bg-amber-400 text-rose-950" : "text-white/50"}`}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                {dishImageMode === "url" ? (
                  <input
                    type="text"
                    value={newDishImage}
                    onChange={(e) => setNewDishImage(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressImage(file);
                          setNewDishImage(compressed);
                        } catch (err) {
                          console.error("Failed to compress image:", err);
                          alert("Failed to process image.");
                        }
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-white/10 file:text-white"
                  />
                )}

                {newDishImage && (
                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="w-10 h-10 rounded overflow-hidden border border-white/10 shrink-0">
                      <img src={newDishImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[8px] text-white/40 truncate font-mono flex-1">{newDishImage.startsWith("data:") ? "Direct Upload" : newDishImage}</p>
                    <button
                      type="button"
                      onClick={() => setNewDishImage("")}
                      className="text-[9px] text-rose-400 hover:text-rose-300 font-bold uppercase cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="flex-1 py-3 border border-white/20 hover:bg-white/5 rounded-xl text-white font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black tracking-wide rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD BOOKING MODAL */}
      {addingBooking && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-rose-950 border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col gap-6 text-left max-h-[90vh]">
            <button
              onClick={() => setAddingBooking(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                Add Walk-in Booking
              </h4>
              <p className="text-[10px] text-rose-200/50 mt-1 uppercase font-black tracking-widest">
                Manually record a table reservation.
              </p>
            </div>

            <form onSubmit={handleAddBooking} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newBookingForm.customerName}
                  onChange={(e) => setNewBookingForm({ ...newBookingForm, customerName: e.target.value })}
                  placeholder="e.g. Jayshree Krishna"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Customer Phone *</label>
                <input
                  type="text"
                  required
                  value={newBookingForm.customerPhone}
                  onChange={(e) => setNewBookingForm({ ...newBookingForm, customerPhone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Booking Date *</label>
                  <input
                    type="date"
                    required
                    value={newBookingForm.bookingDate}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, bookingDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Booking Time *</label>
                  <input
                    type="time"
                    required
                    value={newBookingForm.bookingTime}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, bookingTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Guests Count</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={newBookingForm.guests}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, guests: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Preferred Area</label>
                  <select
                    value={newBookingForm.preferredArea}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, preferredArea: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Main Dine-in" className="bg-rose-950">Main Dine-in</option>
                    <option value="Rooftop" className="bg-rose-950">Rooftop Sky Lounge</option>
                    <option value="Family Hall" className="bg-rose-950">Family Banquet</option>
                    <option value="Garden" className="bg-rose-950">Imperial Garden</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAddingBooking(false)}
                  className="flex-1 py-3 border border-white/20 hover:bg-white/5 rounded-xl text-white font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black tracking-wide rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} /> Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BOOKING MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-rose-950 border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col gap-6 text-left max-h-[90vh]">
            <button
              onClick={() => setEditingBooking(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                Edit Reservation: {editingBooking.id}
              </h4>
              <p className="text-[10px] text-rose-200/50 mt-1 uppercase font-black tracking-widest">
                Modify reservation metadata and details.
              </p>
            </div>

            <form onSubmit={handleUpdateBooking} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Customer Name</label>
                <input
                  type="text"
                  required
                  value={editingBooking.customerName}
                  onChange={(e) => setEditingBooking({ ...editingBooking, customerName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Customer Phone</label>
                <input
                  type="text"
                  required
                  value={editingBooking.customerPhone}
                  onChange={(e) => setEditingBooking({ ...editingBooking, customerPhone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Booking Date</label>
                  <input
                    type="date"
                    required
                    value={editingBooking.bookingDate}
                    onChange={(e) => setEditingBooking({ ...editingBooking, bookingDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Booking Time</label>
                  <input
                    type="time"
                    required
                    value={editingBooking.bookingTime}
                    onChange={(e) => setEditingBooking({ ...editingBooking, bookingTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Guests Count</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={editingBooking.guests}
                    onChange={(e) => setEditingBooking({ ...editingBooking, guests: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Preferred Area</label>
                  <select
                    value={editingBooking.preferredArea}
                    onChange={(e) => setEditingBooking({ ...editingBooking, preferredArea: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Main Dine-in" className="bg-rose-950">Main Dine-in</option>
                    <option value="Rooftop" className="bg-rose-950">Rooftop Sky Lounge</option>
                    <option value="Family Hall" className="bg-rose-950">Family Banquet</option>
                    <option value="Garden" className="bg-rose-950">Imperial Garden</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="flex-1 py-3 border border-white/20 hover:bg-white/5 rounded-xl text-white font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black tracking-wide rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ROOM BOOKING MODAL */}
      {addingRoomBooking && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-rose-950 border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col gap-6 text-left max-h-[90vh]">
            <button
              onClick={() => setAddingRoomBooking(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                Add Walk-in Room Booking
              </h4>
              <p className="text-[10px] text-rose-200/50 mt-1 uppercase font-black tracking-widest">
                Manually record a stay reservation.
              </p>
            </div>

            <form onSubmit={handleAddRoomBooking} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Guest Name *</label>
                <input
                  type="text"
                  required
                  value={newRoomForm.customerName}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, customerName: e.target.value })}
                  placeholder="e.g. Jayshree Krishna"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={newRoomForm.customerPhone}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, customerPhone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Room Type *</label>
                <select
                  value={newRoomForm.roomType}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, roomType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Kings Deluxe Room">Kings Deluxe Room (₹2,600/night)</option>
                  <option value="Kings Superior Room">Kings Superior Room (₹3,200/night)</option>
                  <option value="Kings Executive Suite">Kings Executive Suite (₹4,500/night)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Check-in Date *</label>
                  <input
                    type="date"
                    required
                    value={newRoomForm.checkIn}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, checkIn: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Check-out Date *</label>
                  <input
                    type="date"
                    required
                    value={newRoomForm.checkOut}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, checkOut: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Rooms</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={newRoomForm.roomCount}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, roomCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Adults</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={newRoomForm.guestsAdults}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, guestsAdults: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Children</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    required
                    value={newRoomForm.guestsChildren}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, guestsChildren: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAddingRoomBooking(false)}
                  className="flex-1 py-3 border border-white/20 hover:bg-white/5 rounded-xl text-white font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black tracking-wide rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} /> Confirm Stay Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROOM BOOKING MODAL */}
      {editingRoomBooking && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-rose-950 border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col gap-6 text-left max-h-[90vh]">
            <button
              onClick={() => setEditingRoomBooking(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                Edit Room Reservation: {editingRoomBooking.id}
              </h4>
              <p className="text-[10px] text-rose-200/50 mt-1 uppercase font-black tracking-widest">
                Modify stay duration and occupancy metrics.
              </p>
            </div>

            <form onSubmit={handleUpdateRoomBooking} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Guest Name</label>
                <input
                  type="text"
                  required
                  value={editingRoomBooking.customerName}
                  onChange={(e) => setEditingRoomBooking({ ...editingRoomBooking, customerName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={editingRoomBooking.customerPhone}
                  onChange={(e) => setEditingRoomBooking({ ...editingRoomBooking, customerPhone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Room Type</label>
                <select
                  value={editingRoomBooking.roomType}
                  onChange={(e) => setEditingRoomBooking({ ...editingRoomBooking, roomType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Kings Deluxe Room">Kings Deluxe Room (₹2,600/night)</option>
                  <option value="Kings Superior Room">Kings Superior Room (₹3,200/night)</option>
                  <option value="Kings Executive Suite">Kings Executive Suite (₹4,500/night)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={editingRoomBooking.checkIn}
                    onChange={(e) => setEditingRoomBooking({ ...editingRoomBooking, checkIn: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Check-out Date</label>
                  <input
                    type="date"
                    required
                    value={editingRoomBooking.checkOut}
                    onChange={(e) => setEditingRoomBooking({ ...editingRoomBooking, checkOut: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Rooms</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={editingRoomBooking.roomCount}
                    onChange={(e) => setEditingRoomBooking({ ...editingRoomBooking, roomCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Adults</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={editingRoomBooking.guestsAdults}
                    onChange={(e) => setEditingRoomBooking({ ...editingRoomBooking, guestsAdults: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Children</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    required
                    value={editingRoomBooking.guestsChildren}
                    onChange={(e) => setEditingRoomBooking({ ...editingRoomBooking, guestsChildren: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingRoomBooking(null)}
                  className="flex-1 py-3 border border-white/20 hover:bg-white/5 rounded-xl text-white font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black tracking-wide rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface ManageRoomTypesTabProps {
  rooms: any[];
  setRooms: React.Dispatch<React.SetStateAction<any[]>>;
}

export function ManageRoomTypesTab({ rooms, setRooms }: ManageRoomTypesTabProps) {
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [quickPriceEdit, setQuickPriceEdit] = useState<string | null>(null); // room id being quick-price-edited
  const [quickPriceVal, setQuickPriceVal] = useState<number>(0);

  // Local edit states
  const [roomName, setRoomName] = useState("");
  const [roomPrice, setRoomPrice] = useState(0);
  const [roomSize, setRoomSize] = useState("");
  const [roomBed, setRoomBed] = useState("");
  const [roomGuests, setRoomGuests] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [roomAmenities, setRoomAmenities] = useState("");

  // Gallery images states - max 6 photos
  const [roomImages, setRoomImages] = useState<string[]>([]);
  const [imageInputModes, setImageInputModes] = useState<("url" | "upload")[]>(new Array(6).fill("url"));

  // Add New Room form states
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState<number>(2000);
  const [newSize, setNewSize] = useState("");
  const [newBed, setNewBed] = useState("");
  const [newGuests, setNewGuests] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAmenities, setNewAmenities] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newImageMode, setNewImageMode] = useState<"url" | "upload">("url");

  const handleEditClick = (room: any) => {
    setEditingRoom(room);
    setRoomName(room.name);
    setRoomPrice(room.price);
    setRoomSize(room.size);
    setRoomBed(room.bed);
    setRoomGuests(room.guests);
    setRoomDesc(room.description || "");
    setRoomAmenities((room.amenities || []).join(", "));
    const imgs = [...(room.images || [])];
    while (imgs.length < 6) imgs.push("");
    setRoomImages(imgs);
    setImageInputModes(new Array(6).fill("url"));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    const updatedRooms = rooms.map(r => {
      if (r.id === editingRoom.id) {
        const cleanedImages = roomImages.map(img => img.trim()).filter(Boolean);
        return {
          ...r,
          name: roomName.trim(),
          price: Number(roomPrice) || 0,
          size: roomSize.trim(),
          bed: roomBed.trim(),
          guests: roomGuests.trim(),
          description: roomDesc.trim(),
          amenities: roomAmenities.split(",").map(s => s.trim()).filter(Boolean),
          image: cleanedImages[0] || r.image,
          images: cleanedImages
        };
      }
      return r;
    });
    setRooms(updatedRooms);
    setEditingRoom(null);
  };

  const handleDeleteRoom = (roomId: string, roomName: string) => {
    if (window.confirm(`Are you sure you want to delete "${roomName}"? This cannot be undone.`)) {
      setRooms(prev => prev.filter(r => r.id !== roomId));
    }
  };

  const handleQuickPriceSave = (roomId: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, price: Number(quickPriceVal) || 0 } : r));
    setQuickPriceEdit(null);
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newId = `room-${Date.now()}`;
    const newRoom = {
      id: newId,
      name: newName.trim(),
      price: Number(newPrice) || 0,
      size: newSize.trim() || "N/A",
      bed: newBed.trim() || "N/A",
      guests: newGuests.trim() || "2 Adults",
      description: newDesc.trim(),
      amenities: newAmenities.split(",").map(s => s.trim()).filter(Boolean),
      image: newImage.trim() || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
      images: newImage.trim() ? [newImage.trim()] : [],
      category: "standard",
    };
    setRooms(prev => [...prev, newRoom]);
    // Reset form
    setNewName(""); setNewPrice(2000); setNewSize(""); setNewBed(""); setNewGuests(""); setNewDesc(""); setNewAmenities(""); setNewImage(""); setNewImageMode("url");
    setShowAddForm(false);
  };

  const handleImageChange = (idx: number, val: string) => {
    const nextImgs = [...roomImages];
    nextImgs[idx] = val;
    setRoomImages(nextImgs);
  };

  const handleImageUpload = async (idx: number, file: File) => {
    try {
      const compressed = await compressImage(file);
      handleImageChange(idx, compressed);
    } catch (err) {
      console.error("Failed to compress image:", err);
      alert("Failed to process image.");
    }
  };

  const toggleImageMode = (idx: number) => {
    const nextModes = [...imageInputModes];
    nextModes[idx] = nextModes[idx] === "url" ? "upload" : "url";
    setImageInputModes(nextModes);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-white">Manage Hotel Room Types</h3>
          <p className="text-[10px] text-rose-200/50 mt-0.5">
            Edit pricing, add new categories, configure details and photo gallery.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${showAddForm ? "bg-white/10 text-white border border-white/20" : "bg-amber-400 text-rose-950 hover:bg-amber-300"}`}
        >
          <Plus size={14} /> {showAddForm ? "Cancel" : "Add New Room"}
        </button>
      </div>

      {/* ADD NEW ROOM FORM */}
      {showAddForm && (
        <div className="backdrop-blur-md bg-amber-400/5 border border-amber-400/20 rounded-2xl p-6 shadow-xl">
          <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider mb-4">🏨 New Room Category</h4>
          <form onSubmit={handleAddRoom} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Room Name *</label>
                <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Kings Presidential Suite" className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Price per Night (₹) *</label>
                <input type="number" required min={0} value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Room Size</label>
                <input type="text" value={newSize} onChange={e => setNewSize(e.target.value)} placeholder="e.g. 350 sq. ft." className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Bedding</label>
                <input type="text" value={newBed} onChange={e => setNewBed(e.target.value)} placeholder="e.g. 1 King Bed" className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Guest Capacity</label>
                <input type="text" value={newGuests} onChange={e => setNewGuests(e.target.value)} placeholder="e.g. 2 Adults + 1 Child" className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Amenities (comma separated)</label>
                <input type="text" value={newAmenities} onChange={e => setNewAmenities(e.target.value)} placeholder="AC, TV, Wi-Fi, Breakfast" className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Description</label>
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} placeholder="Room description..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none resize-none" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Cover Image</label>
                <button type="button" onClick={() => setNewImageMode(m => m === "url" ? "upload" : "url")} className="text-[8px] text-amber-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 cursor-pointer">
                  Switch to {newImageMode === "url" ? "Upload" : "URL"}
                </button>
              </div>
              {newImageMode === "url" ? (
                <input type="text" value={newImage} onChange={e => setNewImage(e.target.value)} placeholder="Image URL https://..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none" />
              ) : (
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const compressed = await compressImage(file);
                      setNewImage(compressed);
                    } catch (err) {
                      console.error("Failed to compress image:", err);
                      alert("Failed to process image.");
                    }
                  }
                }} className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[8px] file:font-black file:bg-white/10 file:text-white" />
              )}
              {newImage && (
                <div className="flex items-center gap-3 mt-1">
                  <img src={newImage} alt="Preview" className="w-16 h-12 rounded-lg object-cover border border-white/20" />
                  <button type="button" onClick={() => setNewImage("")} className="text-[9px] text-rose-400 font-bold cursor-pointer">Clear</button>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-2.5 border border-white/20 hover:bg-white/5 rounded-xl text-white font-bold text-xs cursor-pointer">Cancel</button>
              <button type="submit" className="flex-[2] py-2.5 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus size={13} /> Add Room Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ROOMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((room) => (
          <div key={room.id} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col group hover:border-amber-400/20 transition-all duration-300">
            <div className="h-40 overflow-hidden relative">
              <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950/90 via-rose-950/20 to-transparent" />
              {/* Price badge - prominent */}
              <div className="absolute top-3 left-3 bg-amber-400 text-rose-950 font-black text-[11px] px-3 py-1 rounded-full shadow-md">
                ₹{room.price.toLocaleString("en-IN")} / Night
              </div>
              {/* Delete button */}
              <button
                onClick={() => handleDeleteRoom(room.id, room.name)}
                className="absolute top-3 right-3 w-7 h-7 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md"
                title="Delete room"
              >
                <Trash2 size={12} />
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider leading-tight">{room.name}</h4>
                <p className="text-[10px] text-rose-200/60 leading-normal line-clamp-2">{room.description}</p>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-white/5 border border-white/5 text-[8.5px] px-2 py-0.5 rounded text-white/50">📐 {room.size}</span>
                  <span className="bg-white/5 border border-white/5 text-[8.5px] px-2 py-0.5 rounded text-white/50">🛏️ {room.bed}</span>
                  <span className="bg-white/5 border border-white/5 text-[8.5px] px-2 py-0.5 rounded text-white/50">👥 {room.guests}</span>
                </div>
              </div>

              {/* Quick Price Edit */}
              {quickPriceEdit === room.id ? (
                <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-3 space-y-2">
                  <label className="text-[9px] text-amber-400 font-black uppercase tracking-widest">Quick Price Edit (₹ / Night)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={quickPriceVal}
                      onChange={e => setQuickPriceVal(Number(e.target.value))}
                      className="flex-1 bg-white/10 border border-amber-400/30 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                      autoFocus
                    />
                    <button onClick={() => handleQuickPriceSave(room.id)} className="px-3 py-1.5 bg-amber-400 text-rose-950 font-black text-[10px] rounded-lg cursor-pointer hover:bg-amber-300 transition-colors">
                      <Check size={12} />
                    </button>
                    <button onClick={() => setQuickPriceEdit(null)} className="px-3 py-1.5 bg-white/10 text-white font-black text-[10px] rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setQuickPriceEdit(room.id); setQuickPriceVal(room.price); }}
                    className="py-2 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    ₹ Edit Price
                  </button>
                  <button
                    onClick={() => handleEditClick(room)}
                    className="py-2 border border-white/10 hover:border-amber-400/30 hover:bg-amber-400 hover:text-rose-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Edit size={11} /> Full Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-16 text-white/30">
          <div className="text-5xl mb-3">🏨</div>
          <p className="text-sm font-bold">No room types configured yet.</p>
          <p className="text-xs">Click "Add New Room" above to get started.</p>
        </div>
      )}

      {/* FULL EDIT MODAL */}
      {editingRoom && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-rose-950 border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col gap-6 text-left my-8">
            <button
              onClick={() => setEditingRoom(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full cursor-pointer z-10"
            >
              <X size={16} />
            </button>

            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                ✏️ Configure: {editingRoom.name}
              </h4>
              <p className="text-[10px] text-rose-200/50 mt-1 uppercase font-black tracking-widest">
                Edit pricing, details, and photo gallery
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Room Name *</label>
                  <input type="text" required value={roomName} onChange={e => setRoomName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400/40" />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-amber-400 font-black uppercase tracking-widest">💰 Price per Night (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={roomPrice}
                    onChange={e => setRoomPrice(Number(e.target.value))}
                    className="w-full bg-amber-400/10 border border-amber-400/30 rounded-lg px-3.5 py-2 text-sm text-amber-400 font-black focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Room Size</label>
                  <input type="text" required value={roomSize} onChange={e => setRoomSize(e.target.value)} placeholder="e.g. 350 sq. ft." className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Bedding</label>
                  <input type="text" required value={roomBed} onChange={e => setRoomBed(e.target.value)} placeholder="e.g. 1 King Bed" className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none" />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Guest Capacity</label>
                  <input type="text" required value={roomGuests} onChange={e => setRoomGuests(e.target.value)} placeholder="e.g. 2 Adults + 1 Child" className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none" />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Amenities (Comma separated)</label>
                  <input type="text" value={roomAmenities} onChange={e => setRoomAmenities(e.target.value)} placeholder="e.g. Air Conditioning, Flat Screen TV, Wi-Fi" className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none" />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Description</label>
                  <textarea value={roomDesc} onChange={e => setRoomDesc(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none resize-none" />
                </div>
              </div>

              {/* Photo gallery management */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <h5 className="text-xs font-black text-white uppercase tracking-wider">Photo Gallery (Up to 6 Images)</h5>
                <p className="text-[9px] text-rose-200/40 uppercase font-semibold">Image 1 is used as the primary cover card.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {roomImages.map((imgUrl, idx) => (
                    <div key={idx} className="bg-white/5 p-3 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-white/60 uppercase">Photo {idx + 1}</span>
                        <button type="button" onClick={() => toggleImageMode(idx)} className="text-[8px] font-bold uppercase text-amber-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 cursor-pointer">
                          Switch to {imageInputModes[idx] === "url" ? "Upload" : "URL"}
                        </button>
                      </div>

                      {imageInputModes[idx] === "url" ? (
                        <input type="text" value={imgUrl} onChange={e => handleImageChange(idx, e.target.value)} placeholder="Image URL https://..." className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none" />
                      ) : (
                        <input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload(idx, file); }} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[8px] file:font-black file:uppercase file:bg-white/10 file:text-white" />
                      )}

                      {imgUrl && (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded overflow-hidden border border-white/10 shrink-0">
                            <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[8px] text-white/40 truncate font-mono flex-1">{imgUrl.startsWith("data:") ? "Base64 Upload" : imgUrl}</p>
                          <button type="button" onClick={() => handleImageChange(idx, "")} className="text-[9px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer">Clear</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setEditingRoom(null)} className="flex-1 py-3 border border-white/20 hover:bg-white/5 rounded-xl text-white font-bold text-xs cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] py-3 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black tracking-wide rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                  <Save size={14} /> Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


