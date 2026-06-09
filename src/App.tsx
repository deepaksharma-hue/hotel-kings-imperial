import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone,
  MapPin,
  Clock,
  IndianRupee,
  Menu as MenuIcon,
  X,
  ChevronDown,
  Utensils,
  ImagePlus,
  Star,
  ChevronLeft,
  ChevronRight,
  Download,
  ShoppingBag,
  CheckCircle2,
  CreditCard,
  Printer,
  QrCode,
  Wallet,
  Building,
  ShieldCheck,
  Lock,
  Calendar,
} from "lucide-react";
import { TiltCard } from "./components/TiltCard";
import { MENU_DATA, REVIEWS, IMAGES, getItemImage, ROOMS_DATA } from "./data";
import logo from "../assets/logo.png";
import thadeeGopal from "../assets/thadee gopal.png";
import outerside from "../assets/outerside.png";
import Preloader from "./components/Preloader";
import CustomCursor from "./components/CustomCursor";
import Gallery, { DEFAULT_AMBIANCE_IMAGES } from "./components/Gallery";
import ReviewForm from "./components/ReviewForm";
import { AdminLoginPage, AdminDashboardPanel } from "./components/AdminPanel";
import { getDBItem, setDBItem, submitOrderOnline } from "./utils/db";
import AIAssistant from "./components/AIAssistant";

// Add WhatsApp Icon component since Lucide doesn't have it natively
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </svg>
);

// Safe LocalStorage setter helper
const safeLocalStorageSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`LocalStorage write failed for key "${key}":`, e);
  }
};

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("starters");

  type OrderItem = { name: string; price: number; quantity: number };
  const [order, setOrder] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem("hki_cart_order");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse hki_cart_order from localStorage:", e);
      return [];
    }
  });
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Order checkout flow states
  const [sidebarView, setSidebarView] = useState<"list" | "checkout" | "payment" | "success">("list");
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway" | "delivery">("dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [validationError, setValidationError] = useState("");

  // Payment & billing states
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cash">("upi");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "paid">("pending");
  const [orderId, setOrderId] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [activePrintOrder, setActivePrintOrder] = useState<any>(null);
  const [activeDetailDish, setActiveDetailDish] = useState<any>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);

  useEffect(() => {
    setDetailQuantity(1);
  }, [activeDetailDish]);

  // Table booking states
  const [tableBookingOpen, setTableBookingOpen] = useState(false);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingGuests, setBookingGuests] = useState(2);
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [bookingTime, setBookingTime] = useState("19:30");
  const [bookingArea, setBookingArea] = useState("Main Dine-in");
  const [bookingValidationError, setBookingValidationError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [isBookingReceiptOpen, setIsBookingReceiptOpen] = useState(false);
  const [activePrintBooking, setActivePrintBooking] = useState<any>(null);

  // Room booking states
  const [rooms, setRooms] = useState<any[]>(() => {
    const saved = localStorage.getItem("hki_rooms_list");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((room: any) => {
            let updated = false;
            let image = room.image;
            if (image && image.startsWith("data:") && image.length > 500000) {
              const defaultRoom = ROOMS_DATA.find(r => r.id === room.id);
              image = defaultRoom ? defaultRoom.image : "";
              updated = true;
            }
            let images = room.images;
            if (Array.isArray(images)) {
              images = images.map((img: string, idx: number) => {
                if (img && img.startsWith("data:") && img.length > 500000) {
                  const defaultRoom = ROOMS_DATA.find(r => r.id === room.id);
                  updated = true;
                  return defaultRoom && defaultRoom.images && defaultRoom.images[idx] ? defaultRoom.images[idx] : "";
                }
                return img;
              });
            }
            return updated ? { ...room, image, images } : room;
          });
        }
      } catch (e) {
        console.error("Failed to parse saved rooms, reverting to ROOMS_DATA", e);
      }
    }
    return ROOMS_DATA;
  });

  useEffect(() => {
    safeLocalStorageSet("hki_rooms_list", JSON.stringify(rooms));
    setDBItem("hki_rooms_list", rooms);
  }, [rooms]);

  useEffect(() => {
    safeLocalStorageSet("hki_cart_order", JSON.stringify(order));
    setDBItem("hki_cart_order", order);
  }, [order]);

  const [selectedDetailRoom, setSelectedDetailRoom] = useState<any | null>(null);
  const [detailActiveImageIdx, setDetailActiveImageIdx] = useState(0);

  const [roomBookingOpen, setRoomBookingOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState("Kings Deluxe Room");
  const [roomCheckIn, setRoomCheckIn] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [roomCheckOut, setRoomCheckOut] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [roomGuestsAdults, setRoomGuestsAdults] = useState(2);
  const [roomGuestsChildren, setRoomGuestsChildren] = useState(0);
  const [roomCount, setRoomCount] = useState(1);
  const [roomBookingName, setRoomBookingName] = useState("");
  const [roomBookingPhone, setRoomBookingPhone] = useState("");
  const [roomBookingValidationError, setRoomBookingValidationError] = useState("");
  const [roomBookingSuccess, setRoomBookingSuccess] = useState(false);
  const [roomBookingId, setRoomBookingId] = useState("");

  const [isRoomReceiptOpen, setIsRoomReceiptOpen] = useState(false);
  const [activePrintRoomBooking, setActivePrintRoomBooking] = useState<any>(null);

  // SMS Notification simulation state
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: "", message: "" });

  // State for Dine-in orders date & time
  const [dineInDate, setDineInDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [dineInTime, setDineInTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Admin and configuration states
  const [isAdminMode, setIsAdminMode] = useState(window.location.hash === "#admin");
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem("hki_admin_session") === "active";
  });

  const [menu, setMenu] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("hki_menu_data");
      return saved ? JSON.parse(saved) : MENU_DATA;
    } catch (e) {
      console.error("Failed to parse hki_menu_data from localStorage:", e);
      return MENU_DATA;
    }
  });

  const [orders, setOrders] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("hki_orders_data");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse hki_orders_data from localStorage:", e);
      return [];
    }
  });

  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("hki_site_settings");
      const defaults = {
        restaurantName: "Hotel King's Imperial",
        phone: "+91 78800 09493",
        whatsapp: "918218309142",
        address: "Thakur Uttam Singh Kirar Colony, Bhind, MP 477001",
        openHours: "Till Midnight",
        priceRange: "₹200–400",
        heroImage: "",
        heroTitle: "HOTEL KING'S IMPERIAL",
        heroTagline: "Crafting Nature's Best Flavors Since 202o in the Heart of Bhind.",
        heroRating: "4.8 Rating",
        signatureName: "Butter Paneer Masala",
        signatureDesc: "Rich, creamy tomato-cream gravy with aromatic spices.",
        signatureImage: "",
        todaySpecialName: "Poha & Kachori",
        todaySpecialDesc: "The perfect morning starter — Bhind's iconic breakfast.",
        todaySpecialImage: "",
        dineInTitle: "Dine-in & Delivery",
        dineInDesc: "Home Delivery Available",
        stats1Value: "100%",
        stats1Label: "Vegetarian",
        stats2Value: "4.8",
        stats2Label: "Guest Rating",
        stats3Value: "6.4k",
        stats3Label: "Happy Reviews",
        stats4Value: "2021",
        stats4Label: "Established",
        statsBgImage: "",
        footerTitle: "King's Imperial",
        footerSubtitle: "Purely Plant-Based Excellence • Since 1998",
        footerDesc: "Purely Plant-Based Excellence since 1998. Crafting the finest vegetarian flavors with authentic heritage recipes in Kirar Colony, Bhind.",
        footerWatermark: "IMPERIAL",
        paymentSettings: {
          upiId: "8218309142@ybl",
          accountName: "Hotel King's Imperial",
          bankName: "",
          accountNo: "",
          ifsc: "",
          qrImage: "",
          notes: "Scan QR or use UPI ID to pay"
        },
        socialMedia: {
          instagram: "",
          facebook: "",
          youtube: "",
          twitter: ""
        }
      };
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean up oversized images (>500KB) to prevent storage quota issues
        const cleaned = { ...parsed };
        const keysToClean = ["heroImage", "signatureImage", "todaySpecialImage", "statsBgImage"];
        keysToClean.forEach((key) => {
          if (cleaned[key] && cleaned[key].startsWith("data:") && cleaned[key].length > 500000) {
            console.warn(`Startup cleanup: Cleared large image for settings key: ${key}`);
            cleaned[key] = "";
          }
        });
        if (cleaned.paymentSettings) {
          const qr = cleaned.paymentSettings.qrImage;
          if (qr && qr.startsWith("data:") && qr.length > 500000) {
            console.warn("Startup cleanup: Cleared large QR image");
            cleaned.paymentSettings = { ...cleaned.paymentSettings, qrImage: "" };
          }
        }
        return { ...defaults, ...cleaned, paymentSettings: { ...defaults.paymentSettings, ...(cleaned.paymentSettings || {}) }, socialMedia: { ...defaults.socialMedia, ...(cleaned.socialMedia || {}) } };
      }
      return defaults;
    } catch (e) {
      console.error("Failed to parse hki_site_settings from localStorage:", e);
      return {
        restaurantName: "Hotel King's Imperial",
        phone: "+91 78800 09493",
        whatsapp: "918218309142",
        address: "Thakur Uttam Singh Kirar Colony, Bhind, MP 477001",
        openHours: "Till Midnight",
        priceRange: "₹200–400",
        heroImage: "",
        heroTitle: "HOTEL KING'S IMPERIAL",
        heroTagline: "Crafting Nature's Best Flavors Since 202o in the Heart of Bhind.",
        heroRating: "4.8 Rating",
        signatureName: "Butter Paneer Masala",
        signatureDesc: "Rich, creamy tomato-cream gravy with aromatic spices.",
        signatureImage: "",
        todaySpecialName: "Poha & Kachori",
        todaySpecialDesc: "The perfect morning starter — Bhind's iconic breakfast.",
        todaySpecialImage: "",
        dineInTitle: "Dine-in & Delivery",
        dineInDesc: "Home Delivery Available",
        stats1Value: "100%",
        stats1Label: "Vegetarian",
        stats2Value: "4.8",
        stats2Label: "Guest Rating",
        stats3Value: "6.4k",
        stats3Label: "Happy Reviews",
        stats4Value: "2021",
        stats4Label: "Established",
        statsBgImage: "",
        footerTitle: "King's Imperial",
        footerSubtitle: "Purely Plant-Based Excellence • Since 1998",
        footerDesc: "Purely Plant-Based Excellence since 1998. Crafting the finest vegetarian flavors with authentic heritage recipes in Kirar Colony, Bhind.",
        footerWatermark: "IMPERIAL",
        paymentSettings: { upiId: "8218309142@ybl", accountName: "Hotel King's Imperial", bankName: "", accountNo: "", ifsc: "", qrImage: "", notes: "Scan QR or use UPI ID to pay" },
        socialMedia: { instagram: "", facebook: "", youtube: "", twitter: "" }
      };
    }
  });

  // Memories gallery state
  const [memories, setMemories] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("hki_memories_data");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Clean up overly large base64 memories (> 500KB) to recover from quota failures
        const cleaned = parsed.filter((m: any) => {
          if (m.url && m.url.startsWith("data:") && m.url.length > 500000) {
            console.warn("Cleared large data URL memory to recover local storage quota.");
            return false;
          }
          return true;
        });
        if (cleaned.length !== parsed.length) {
          try {
            localStorage.setItem("hki_memories_data", JSON.stringify(cleaned));
          } catch {}
        }
        return cleaned;
      }
      return [];
    } catch { return []; }
  });

  useEffect(() => {
    safeLocalStorageSet("hki_memories_data", JSON.stringify(memories));
    setDBItem("hki_memories_data", memories);
  }, [memories]);

  // Ambiance gallery state
  const [ambianceImages, setAmbianceImages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("hki_ambiance_images");
      if (!saved) return DEFAULT_AMBIANCE_IMAGES;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Clean up large ambiance images (>500KB) to prevent storage quota issues
        const cleaned = parsed.filter((img: string) => {
          if (img && img.startsWith("data:") && img.length > 500000) {
            console.warn("Cleared large ambiance image (>500KB) to recover local storage quota.");
            return false;
          }
          return true;
        });
        return cleaned.length > 0 ? cleaned : DEFAULT_AMBIANCE_IMAGES;
      }
      return DEFAULT_AMBIANCE_IMAGES;
    } catch {
      return DEFAULT_AMBIANCE_IMAGES;
    }
  });

  useEffect(() => {
    safeLocalStorageSet("hki_ambiance_images", JSON.stringify(ambianceImages));
    setDBItem("hki_ambiance_images", ambianceImages);
  }, [ambianceImages]);

  // Pay on delivery state
  const [payOnDelivery, setPayOnDelivery] = useState(false);
  const [upiReceipt, setUpiReceipt] = useState("");

  // Memories lightbox state
  const [memLightbox, setMemLightbox] = useState<{ open: boolean; idx: number }>({ open: false, idx: 0 });
  const [playingVideoIdx, setPlayingVideoIdx] = useState<number | null>(null);

  useEffect(() => {
    if (memLightbox.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [memLightbox.open]);

  useEffect(() => {
    safeLocalStorageSet("hki_menu_data", JSON.stringify(menu));
    setDBItem("hki_menu_data", menu);
  }, [menu]);

  useEffect(() => {
    safeLocalStorageSet("hki_orders_data", JSON.stringify(orders));
    setDBItem("hki_orders_data", orders);
  }, [orders]);

  useEffect(() => {
    safeLocalStorageSet("hki_site_settings", JSON.stringify(siteSettings));
    setDBItem("hki_site_settings", siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminMode(window.location.hash === "#admin");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Load data from IndexedDB on mount to overwrite localStorage if available
  useEffect(() => {
    const loadFromIndexedDB = async () => {
      try {
        const savedRooms = await getDBItem("hki_rooms_list");
        if (savedRooms && Array.isArray(savedRooms)) {
          setRooms(savedRooms);
        }

        const savedMenu = await getDBItem("hki_menu_data");
        if (savedMenu) {
          setMenu(savedMenu);
        }

        const savedOrders = await getDBItem("hki_orders_data");
        if (savedOrders && Array.isArray(savedOrders)) {
          setOrders(savedOrders);
        }

        const savedSettings = await getDBItem("hki_site_settings");
        if (savedSettings) {
          setSiteSettings(savedSettings);
        }

        const savedMemories = await getDBItem("hki_memories_data");
        if (savedMemories && Array.isArray(savedMemories)) {
          setMemories(savedMemories);
        }

        const savedAmbiance = await getDBItem("hki_ambiance_images");
        if (savedAmbiance && Array.isArray(savedAmbiance)) {
          setAmbianceImages(savedAmbiance);
        }

        const savedCart = await getDBItem("hki_cart_order");
        if (savedCart && Array.isArray(savedCart)) {
          setOrder(savedCart);
        }
      } catch (e) {
        console.error("Failed to load database items on mount:", e);
      }
    };
    loadFromIndexedDB();
  }, []);

  // Poll online database for new orders every 10 seconds in Admin Mode
  useEffect(() => {
    if (!isAdminMode || !adminLoggedIn) return;
    
    let interval: NodeJS.Timeout;
    
    const pollOrders = async () => {
      const dbUrl = import.meta.env.VITE_DATABASE_URL;
      if (!dbUrl) return;

      try {
        const response = await fetch(`${dbUrl}/orders.json`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            const ordersArray = Object.values(data).sort(
              (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setOrders((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(ordersArray)) {
                console.log("Polling: synced orders list with cloud.");
                safeLocalStorageSet("hki_orders_data", JSON.stringify(ordersArray));
                return ordersArray;
              }
              return prev;
            });
          }
        }
      } catch (e) {
        console.warn("Polling: failed to sync orders with cloud database:", e);
      }
    };

    pollOrders();
    interval = setInterval(pollOrders, 10000);

    return () => clearInterval(interval);
  }, [isAdminMode, adminLoggedIn]);

  // Close lightbox on Escape key
  useEffect(() => {
    const activeMemoriesCount = memories.filter(m => m.type === "photo" || m.type === "video").length;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMemLightbox({ open: false, idx: 0 });
      }
      if (e.key === "ArrowRight") {
        setMemLightbox(prev => prev.open ? { ...prev, idx: (prev.idx + 1) % activeMemoriesCount } : prev);
      }
      if (e.key === "ArrowLeft") {
        setMemLightbox(prev => prev.open ? { ...prev, idx: (prev.idx - 1 + activeMemoriesCount) % activeMemoriesCount } : prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [memories]);

  const generateOrderId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `HKI-${randomNum}`;
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Reset checkout state when sidebar is closed
  useEffect(() => {
    if (!orderSummaryOpen) {
      setSidebarView("list");
      setValidationError("");
      setPaymentMethod("upi");
      setPaymentStatus("pending");
      setCardNo("");
      setCardExpiry("");
      setCardCvv("");
      setCardHolder("");
      setSelectedBank("");
      setPayOnDelivery(false);
      setUpiReceipt("");
    }
  }, [orderSummaryOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newImages = filesArray.map((file) => URL.createObjectURL(file as Blob));
      setUploadedImages((prev) => [...prev, ...newImages]);
    }
  };

  const addToOrder = (name: string, priceStr: string | number, quantityToAdd: number = 1) => {
    // Parse price if it's a string like '16 / 18' (just take the first one or clean it up)
    const price =
      typeof priceStr === "string"
        ? parseInt(
          priceStr
            .split("/")[0]
            .trim()
            .replace(/[^0-9]/g, ""),
          10,
        )
        : priceStr;

    if (isNaN(price)) return; // Handle edge cases where price can't be parsed

    setOrder((prev) => {
      const existing = prev.find((item) => item.name === name);
      if (existing) {
        return prev.map((item) =>
          item.name === name ? { ...item, quantity: item.quantity + quantityToAdd } : item,
        );
      }
      return [...prev, { name, price, quantity: quantityToAdd }];
    });
    setOrderSummaryOpen(true);
  };

  const removeFromOrder = (name: string) => {
    setOrder((prev) => prev.filter((item) => item.name !== name));
  };

  const updateQuantity = (name: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(name);
      return;
    }
    setOrder((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, quantity } : item
      )
    );
  };

  const clearOrder = () => setOrder([]);

  const handleBookTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName.trim()) {
      setBookingValidationError("Please enter your name.");
      return;
    }
    if (!bookingPhone.trim() || bookingPhone.trim().length < 10) {
      setBookingValidationError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!bookingDate) {
      setBookingValidationError("Please select a booking date.");
      return;
    }
    if (!bookingTime) {
      setBookingValidationError("Please select a booking time.");
      return;
    }

    setBookingValidationError("");
    const newBookingId = `HKI-B${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingId(newBookingId);

    const bookingOrder = {
      id: newBookingId,
      customerName: bookingName.trim(),
      customerPhone: bookingPhone.trim(),
      orderType: "table-booking",
      tableNumber: "",
      deliveryAddress: "",
      bookingDate,
      bookingTime,
      guests: bookingGuests,
      preferredArea: bookingArea,
      total: 0,
      paymentMethod: "none",
      paymentStatus: "confirmed",
      items: [],
      date: new Date().toISOString()
    };

    setOrders((prev) => [bookingOrder, ...prev]);
    submitOrderOnline(bookingOrder);
    setBookingSuccess(true);
    setNotification({
      show: true,
      title: `💬 SMS from ${siteSettings.restaurantName}`,
      message: `Confirmed! Table reservation ${newBookingId} for ${bookingGuests} guests on ${bookingDate} @ ${bookingTime} is successful. See you soon!`,
    });

    const msg = `*Table Reservation Confirmed!* 📅✨\n-----------------------------------------\n🆔 *Reservation ID:* ${newBookingId}\n👤 *Name:* ${bookingName.trim()}\n📞 *Phone:* ${bookingPhone.trim()}\n👥 *Guests:* ${bookingGuests} Persons\n📅 *Date:* ${bookingDate}\n🕒 *Time:* ${bookingTime}\n📍 *Area:* ${bookingArea}\n-----------------------------------------\nThank you for choosing ${siteSettings.restaurantName}! We look forward to serving you.`;

    const waUrl = `https://wa.me/${siteSettings.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  const handleBookRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomBookingName.trim()) {
      setRoomBookingValidationError("Please enter your name.");
      return;
    }
    if (!roomBookingPhone.trim() || roomBookingPhone.trim().length < 10) {
      setRoomBookingValidationError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!roomCheckIn) {
      setRoomBookingValidationError("Please select a check-in date.");
      return;
    }
    if (!roomCheckOut) {
      setRoomBookingValidationError("Please select a check-out date.");
      return;
    }

    const checkInDate = new Date(roomCheckIn);
    const checkOutDate = new Date(roomCheckOut);
    if (checkOutDate <= checkInDate) {
      setRoomBookingValidationError("Check-out date must be after check-in date.");
      return;
    }

    setRoomBookingValidationError("");
    const newRoomBookingId = `HKI-R${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomBookingId(newRoomBookingId);

    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const foundRoom = rooms.find(r => r.name === selectedRoomType || r.id === selectedRoomType);
    const roomPrice = foundRoom ? foundRoom.price : 2600;

    const totalCost = diffDays * roomCount * roomPrice;

    const roomOrderObj = {
      id: newRoomBookingId,
      customerName: roomBookingName.trim(),
      customerPhone: roomBookingPhone.trim(),
      orderType: "room-booking",
      roomType: selectedRoomType,
      checkIn: roomCheckIn,
      checkOut: roomCheckOut,
      guestsAdults: roomGuestsAdults,
      guestsChildren: roomGuestsChildren,
      roomCount,
      total: totalCost,
      paymentMethod: "cash",
      paymentStatus: "confirmed",
      items: [],
      date: new Date().toISOString()
    };

    setOrders((prev) => [roomOrderObj, ...prev]);
    submitOrderOnline(roomOrderObj);
    setRoomBookingSuccess(true);
    setNotification({
      show: true,
      title: `💬 Stay Confirmed!`,
      message: `Stay booked at Hotel King's Imperial! Room reservation ID ${newRoomBookingId} on ${roomCheckIn} is successful.`,
    });

    const msg = `*Room Reservation Confirmed!* 🏨🛎️\n-----------------------------------------\n🆔 *Booking ID:* ${newRoomBookingId}\n👤 *Name:* ${roomBookingName.trim()}\n📞 *Phone:* ${roomBookingPhone.trim()}\n🛌 *Room Type:* ${selectedRoomType}\n🔢 *Rooms Count:* ${roomCount} Room(s)\n📅 *Check-in:* ${roomCheckIn}\n📅 *Check-out:* ${roomCheckOut}\n👥 *Occupancy:* ${roomGuestsAdults} Adults + ${roomGuestsChildren} Children\n💰 *Total Price:* ₹${totalCost}\n-----------------------------------------\nThank you for choosing ${siteSettings.restaurantName}! We look forward to your comfortable stay.`;

    const waUrl = `https://wa.me/${siteSettings.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  const handleProceedToPayment = () => {
    if (!customerName.trim()) {
      setValidationError("Please enter your name.");
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setValidationError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (orderType === "dine-in") {
      if (!dineInDate) {
        setValidationError("Please select a dine-in date.");
        return;
      }
      if (!dineInTime) {
        setValidationError("Please select a dine-in time.");
        return;
      }
    }
    if (orderType === "delivery" && !deliveryAddress.trim()) {
      setValidationError("Please enter your delivery address.");
      return;
    }

    setValidationError("");
    if (!orderId) {
      setOrderId(generateOrderId());
    }

    // Pay on Delivery: skip payment screen, save directly as pending
    if (payOnDelivery) {
      const newId = orderId || generateOrderId();
      if (!orderId) setOrderId(newId);
      const podOrder = {
        id: newId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        tableNumber: orderType === "dine-in" ? tableNumber : "",
        dineInDate: orderType === "dine-in" ? dineInDate : "",
        dineInTime: orderType === "dine-in" ? dineInTime : "",
        deliveryAddress: orderType === "delivery" ? deliveryAddress : "",
        items: order,
        total: orderTotal,
        paymentMethod: "cash-on-delivery",
        paymentStatus: "pending",
        date: new Date().toISOString()
      };
      setOrders((prev) => [podOrder, ...prev]);
      submitOrderOnline(podOrder);
      setNotification({ show: true, title: "🚰 Order Placed!", message: `Order ${newId} placed with Pay on Delivery. Our team will confirm soon!` });
      try {
        window.open(getWhatsAppUrl(), "_blank");
      } catch (e) {
        console.warn("WhatsApp popup blocked by browser sandbox:", e);
      }
      setSidebarView("success");
      return;
    }

    setSidebarView("payment");
  };

  const getWhatsAppUrl = () => {
    const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const itemsText = order
      .map((item, idx) => `${idx + 1}. *${item.name}* x ${item.quantity} - ₹${item.price * item.quantity}`)
      .join("\n");

    const orderDetails = orderType === "dine-in"
      ? `🪑 *Table Number:* ${tableNumber.trim() || "Not Specified / Pay at Counter"}\n📅 *Dine-in Date:* ${dineInDate}\n🕒 *Dine-in Time:* ${dineInTime}`
      : orderType === "delivery"
        ? `📍 *Delivery Address:* ${deliveryAddress}`
        : `🛍️ *Order Type:* Takeaway`;

    const actualPaymentMethod = payOnDelivery ? "cash-on-delivery" : paymentMethod;
    const paymentText = actualPaymentMethod === "cash"
      ? `💵 *Payment Mode:* Cash / Pay at Counter (PAID)`
      : actualPaymentMethod === "cash-on-delivery"
        ? `🚐 *Payment Mode:* Cash on Delivery (Pending — Pay After Delivery)`
        : `💳 *Payment:* PAID via ${actualPaymentMethod.toUpperCase()} (Ref: ${orderId.replace("HKI-", "")}87X)`;

    const whatsappMsg = `*New Order Placed at ${siteSettings.restaurantName}!* 👑🏨\n-----------------------------------------\n🆔 *Order ID:* ${orderId}\n👤 *Customer Name:* ${customerName.trim()}\n📞 *Mobile Number:* ${customerPhone.trim()}\n🍽️ *Order Mode:* ${orderType === "dine-in" ? "Dine-in 🍽️" : orderType === "delivery" ? "Home Delivery 🚚" : "Takeaway / Pickup 🛍️"}\n${orderDetails}\n🕒 *Time:* ${dateStr}\n${paymentText}\n\n📋 *Items Ordered:*\n${itemsText}\n\n💰 *Total Amount:* *₹${orderTotal}*\n-----------------------------------------\nPlease confirm my order. Thank you!`;

    return `https://wa.me/${siteSettings.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`;
  };

  const handleSendToKitchen = () => {
    try {
      window.open(getWhatsAppUrl(), "_blank");
    } catch (e) {
      console.warn("WhatsApp popup blocked:", e);
    }
  };

  const handleProcessPayment = () => {
    if (paymentMethod === "card") {
      if (!cardNo.trim() || cardNo.replace(/\s/g, '').length < 16) {
        setValidationError("Please enter a valid 16-digit card number.");
        return;
      }
      if (!cardExpiry.trim() || !cardExpiry.includes("/")) {
        setValidationError("Please enter expiry in MM/YY format.");
        return;
      }
      if (!cardCvv.trim() || cardCvv.trim().length < 3) {
        setValidationError("Please enter CVV.");
        return;
      }
      if (!cardHolder.trim()) {
        setValidationError("Please enter cardholder name.");
        return;
      }
    } else if (paymentMethod === "netbanking") {
      if (!selectedBank) {
        setValidationError("Please select a bank.");
        return;
      }
    } else if (paymentMethod === "upi") {
      if (!upiReceipt) {
        setValidationError("Please upload the payment receipt screenshot.");
        return;
      }
    }

    setValidationError("");
    setPaymentStatus("processing");

    setTimeout(() => {
      setPaymentStatus("paid");

      // Save order as PENDING — admin must confirm
      const newOrderObj = {
        id: orderId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType: orderType,
        tableNumber: orderType === "dine-in" ? tableNumber : "",
        dineInDate: orderType === "dine-in" ? dineInDate : "",
        dineInTime: orderType === "dine-in" ? dineInTime : "",
        deliveryAddress: orderType === "delivery" ? deliveryAddress : "",
        items: order,
        total: orderTotal,
        paymentMethod: paymentMethod,
        paymentStatus: "pending", // Always pending until admin confirms
        paymentReceipt: paymentMethod === "upi" ? upiReceipt : "",
        date: new Date().toISOString()
      };
      setOrders((prev) => [newOrderObj, ...prev]);
      submitOrderOnline(newOrderObj);
      setNotification({
        show: true,
        title: `💬 Order Received!`,
        message: `Order ${orderId} placed! Awaiting confirmation from ${siteSettings.restaurantName}. WhatsApp opened.`,
      });

      // Open WhatsApp link (wrapped in try/catch to prevent blocking popup errors from halting state changes)
      try {
        window.open(getWhatsAppUrl(), "_blank");
      } catch (e) {
        console.warn("WhatsApp popup blocked by browser sandbox:", e);
      }

      setSidebarView("success");
    }, 2000);
  };

  const orderTotal = order.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const orderItemCount = order.reduce((sum, item) => sum + item.quantity, 0);



  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getTabImage = (tab: string) => {
    switch (tab) {
      case "starters":
        return IMAGES.salad;
      case "main":
        return IMAGES.paneerButterMasala;
      case "breads":
        return IMAGES.thali;
      case "platters":
        return IMAGES.poha;
      case "continental":
        return IMAGES.pizza;
      case "drinks":
        return IMAGES.drink;
      case "extras":
        return IMAGES.jalebi;
      default:
        return IMAGES.dalMakhani;
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  if (isAdminMode) {
    return (
      <div className="w-full min-h-screen bg-rose-950 font-sans text-rose-50">
        {!adminLoggedIn ? (
          <AdminLoginPage
            onLogin={() => setAdminLoggedIn(true)}
            onBack={() => { window.location.hash = ""; }}
          />
        ) : (
          <AdminDashboardPanel
            menu={menu}
            setMenu={setMenu}
            orders={orders}
            setOrders={setOrders}
            siteSettings={siteSettings}
            setSiteSettings={setSiteSettings}
            onLogout={() => setAdminLoggedIn(false)}
            onBack={() => { window.location.hash = ""; }}
            rooms={rooms}
            setRooms={setRooms}
            memories={memories}
            setMemories={setMemories}
            ambianceImages={ambianceImages}
            setAmbianceImages={setAmbianceImages}
            onPrintOrder={(orderObj) => {
              if (orderObj.orderType === "table-booking") {
                setActivePrintBooking(orderObj);
                setIsBookingReceiptOpen(true);
              } else if (orderObj.orderType === "room-booking") {
                setActivePrintRoomBooking(orderObj);
                setIsRoomReceiptOpen(true);
              } else {
                setActivePrintOrder(orderObj);
                setIsInvoiceOpen(true);
              }
            }}
          />
        )}

        {/* RENDER PRINT DIALOG DIRECTLY IN ADMIN IF NEEDED */}
        {isInvoiceOpen && createPortal(
          (() => {
            const printData = activePrintOrder || {
              id: orderId,
              customerName: "",
              customerPhone: "",
              orderType: "dine-in",
              tableNumber: "",
              deliveryAddress: "",
              total: 0,
              paymentMethod: "cash",
              items: [],
              date: new Date().toISOString()
            };

            const gstEnabled = siteSettings.gstSettings?.enabled ?? true;
            const gstInclusive = siteSettings.gstSettings?.inclusive ?? false;
            const cgstRate = siteSettings.gstSettings?.cgstRate ?? 2.5;
            const sgstRate = siteSettings.gstSettings?.sgstRate ?? 2.5;
            const totalGstRate = cgstRate + sgstRate;

            let subtotal = printData.total;
            let cgstAmount = 0;
            let sgstAmount = 0;
            let grandTotal = printData.total;

            if (gstEnabled) {
              if (gstInclusive) {
                subtotal = Number((printData.total / (1 + totalGstRate / 100)).toFixed(2));
                const totalGst = Number((printData.total - subtotal).toFixed(2));
                cgstAmount = Number((totalGst * (cgstRate / totalGstRate)).toFixed(2));
                sgstAmount = Number((totalGst - cgstAmount).toFixed(2));
              } else {
                cgstAmount = Number((printData.total * (cgstRate / 100)).toFixed(2));
                sgstAmount = Number((printData.total * (sgstRate / 100)).toFixed(2));
                grandTotal = Number((printData.total + cgstAmount + sgstAmount).toFixed(2));
              }
            }

            return (
              <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:backdrop-blur-none text-left">
                <div id="printable-invoice-modal-root" className="bg-white text-slate-800 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative border border-slate-200 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:p-0 flex flex-col gap-6">

                  <div className={`absolute right-6 top-6 md:right-10 md:top-10 border-4 ${printData.paymentMethod === 'cash' ? 'border-rose-500 text-rose-500' : printData.paymentMethod === 'cash-on-delivery' ? 'border-orange-500 text-orange-500' : 'border-emerald-500 text-emerald-500'} border-double rounded-xl px-4 py-1.5 text-xs font-black tracking-widest uppercase transform rotate-[-12deg] select-none pointer-events-none opacity-85 print:opacity-100 flex flex-col items-center leading-none z-10`}>
                    <span className="text-sm">{printData.paymentMethod === 'cash' ? 'CASH ORDER' : printData.paymentMethod === 'cash-on-delivery' ? 'PAY ON DELIVERY' : 'PAID'}</span>
                    <span className="text-[7px] font-mono mt-1 tracking-normal">
                      {printData.paymentMethod === 'cash' ? 'PAY AT COUNTER' : printData.paymentMethod === 'cash-on-delivery' ? 'PENDING PAYMENT' : `TXN: ${printData.id.replace('HKI-', '')}87X`}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsInvoiceOpen(false);
                      setActivePrintOrder(null);
                    }}
                    className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-1.5 rounded-full print:hidden z-20 cursor-pointer"
                  >
                    <X size={16} />
                  </button>

                  <div className="text-center space-y-2 pt-6 print:pt-0">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center shadow-md overflow-hidden print:border print:border-slate-300">
                        <img src={logo} alt="Logo" className="w-full h-full object-cover scale-110" />
                      </div>
                      <h2 className="text-xl font-black tracking-tight text-rose-950 font-serif">{siteSettings.restaurantName.toUpperCase()}</h2>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-none">
                      {siteSettings.address}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium leading-none">
                      Phone: {siteSettings.phone} | WhatsApp: +{siteSettings.whatsapp}
                    </p>
                    <div className="border-t border-b border-dashed border-slate-300 py-1 text-xs font-bold uppercase tracking-wider text-rose-950">
                      Tax Invoice / Receipt
                    </div>
                    {gstEnabled && siteSettings.gstSettings?.gstin && (
                      <p className="text-[9px] text-slate-500 font-bold font-mono tracking-wider leading-none mt-1">
                        GSTIN: {siteSettings.gstSettings.gstin}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-xs border-b border-slate-200 pb-4">
                    <div>
                      <span className="text-slate-400 font-semibold block">Order ID</span>
                      <strong className="text-slate-800 font-bold">{printData.id}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 font-semibold block">Date &amp; Time</span>
                      <strong className="text-slate-800 font-bold">{new Date(printData.date).toLocaleString("en-IN")}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Customer Details</span>
                      <strong className="text-slate-800 font-bold uppercase">{printData.customerName}</strong>
                      <span className="text-slate-500 block text-[10px]">{printData.customerPhone}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 font-semibold block">Order Type</span>
                      <strong className="text-slate-800 font-bold capitalize">
                        {printData.orderType === "dine-in" ? `Dine-in (Table ${printData.tableNumber || "Not Specified"}${printData.dineInDate ? ` on ${printData.dineInDate} @ ${printData.dineInTime}` : ""})` : printData.orderType === "delivery" ? "Home Delivery" : "Takeaway"}
                      </strong>
                    </div>
                    {printData.orderType === "delivery" && (
                      <div className="col-span-2 pt-1">
                        <span className="text-slate-400 font-semibold block">Delivery Address</span>
                        <p className="text-slate-600 text-[10px] leading-relaxed font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 text-left">
                          {printData.deliveryAddress}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-x-auto min-h-0">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold">
                          <th className="py-2">Item Name</th>
                          <th className="py-2 text-center">Qty</th>
                          <th className="py-2 text-right">Price</th>
                          <th className="py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printData.items.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-100 font-medium text-slate-700">
                            <td className="py-2.5 font-bold uppercase">{item.name}</td>
                            <td className="py-2.5 text-center">{item.quantity}</td>
                            <td className="py-2.5 text-right">₹{item.price}</td>
                            <td className="py-2.5 text-right font-bold">₹{item.price * item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-slate-200 pt-4 space-y-1.5 text-xs font-semibold">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal {gstEnabled && gstInclusive && "(GST Incl.)"}</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {gstEnabled ? (
                      <>
                        <div className="flex justify-between text-slate-500">
                          <span>CGST ({cgstRate}%)</span>
                          <span>₹{cgstAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>SGST ({sgstRate}%)</span>
                          <span>₹{sgstAmount.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-slate-500">
                        <span>Taxes (GST 0%)</span>
                        <span>₹0.00</span>
                      </div>
                    )}
                    <div className="flex justify-between text-rose-950 font-black text-sm border-t border-slate-100 pt-2">
                      <span>Grand Total</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                      <span>Payment Method</span>
                      <span className="text-rose-900">{printData.paymentMethod === "cash" ? "Cash (Pay at Counter)" : printData.paymentMethod === "cash-on-delivery" ? "Cash on Delivery" : `Online via ${printData.paymentMethod.toUpperCase()}`}</span>
                    </div>
                  </div>

                  <div className="text-center space-y-1 border-t border-dashed border-slate-200 pt-4 text-[10px] text-slate-400 font-medium">
                    <p className="font-bold text-rose-950 font-serif text-xs">Thank you for ordering!</p>
                    <p>Visit again: {siteSettings.restaurantName}</p>
                  </div>

                  <div className="flex gap-3 mt-2 print:hidden shrink-0">
                    <button
                      onClick={() => {
                        setIsInvoiceOpen(false);
                        setActivePrintOrder(null);
                      }}
                      className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex-grow-[2] py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer size={16} />
                      Print Receipt / Bill
                    </button>
                  </div>

                </div>
              </div>
            );
          })(),
          document.body
        )}
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {loading && <Preloader />}
      </AnimatePresence>
      <div className="w-full min-h-screen bg-rose-950 overflow-x-hidden relative font-sans select-none text-rose-50">
        {/* Background Decorative Elements */}
        <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-500/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

        {/* NAVBAR */}
        <nav
          className={`fixed left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-400 ease-in-out flex justify-between items-center px-6 md:px-8 py-4 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl ${isScrolled ? "top-4" : "top-6"}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(163,230,53,0.4)] overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-cover scale-110" />
            </div>
            <a
              href="#home"
              className="text-white font-bold text-xl md:text-2xl tracking-tight italic hidden sm:block"
            >
              {siteSettings.restaurantName.toUpperCase()}
            </a>
          </div>
          <ul className="hidden lg:flex gap-8 text-white/80 font-medium">
            {["Home", "Rooms", "Gallery", "Menu", "Reviews", "Contact"].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className="hover:text-white transition-colors relative group text-sm tracking-wide"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTableBookingOpen(true)}
              className="border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-rose-950 px-5 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Calendar size={14} /> BOOK TABLE
            </button>
            <button
              onClick={() => setOrderSummaryOpen(true)}
              className="bg-rose-400 text-rose-950 px-5 py-2.5 rounded-full font-bold text-sm tracking-wide shadow-[0_4px_15px_rgba(52,211,153,0.3)] hover:bg-rose-300 transition-colors flex items-center gap-2 cursor-pointer"
            >
              ESTIMATE{" "}
              {orderItemCount > 0 && (
                <span className="bg-rose-950 text-rose-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {orderItemCount}
                </span>
              )}
            </button>
            <button
              className="lg:hidden text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon size={28} />
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80"
                  alt="Menu Background"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-md"></div>
              </div>

              <button
                className="absolute top-6 right-6 text-white/70 hover:text-white z-20 bg-white/10 p-2 rounded-full backdrop-blur-md transition-transform duration-300 hover:rotate-90"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={32} />
              </button>

              {/* Branding */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="absolute top-10 left-6 z-20 flex flex-col items-start"
              >
                <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(163,230,53,0.4)] mb-2">
                  <span className="text-rose-950 font-black text-xl">K</span>
                </div>
                <span className="text-amber-400 font-bold tracking-[0.2em] uppercase text-[10px]">
                  {siteSettings.restaurantName}
                </span>
              </motion.div>

              <motion.div
                className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm px-8"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 },
                  },
                }}
              >
                {["Home", "Rooms", "Gallery", "Menu", "Reviews", "Contact", "Book Table", "Admin"].map(
                  (item, idx) => (
                    <motion.a
                      key={item}
                      href={item === "Admin" ? "#admin" : item === "Book Table" ? "#book-table" : `#${item.toLowerCase()}`}
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        if (item === "Book Table") {
                          e.preventDefault();
                          setTableBookingOpen(true);
                        }
                      }}
                      variants={{
                        hidden: { opacity: 0, x: -30, filter: "blur(8px)" },
                        visible: {
                          opacity: 1,
                          x: 0,
                          filter: "blur(0px)",
                          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                        },
                      }}
                      className="w-full relative py-4 border-b border-white/10 last:border-0 font-black text-4xl text-center text-white hover:text-amber-400 hover:tracking-widest tracking-tight transition-all duration-300 group"
                    >
                      {/* Subtle hover effect line */}
                      <span className="absolute left-1/2 -bottom-[1px] -translate-x-1/2 w-0 h-[2px] bg-amber-400 group-hover:w-full transition-all duration-500 ease-out"></span>
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400/20 text-lg font-bold group-hover:text-amber-400/50 transition-colors">
                        0{idx + 1}
                      </span>
                      {item}
                    </motion.a>
                  ),
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
            staggerChildren: 0.15,
          }}
          className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 mt-32 md:mt-36 space-y-6 md:space-y-12 pb-24"
        >
          {/* HERO GRID (Top section) */}
          <motion.div
            variants={itemVariant}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 relative"
          >
            {/* Main Display Box (7 columns on desktop) */}
            <div className="md:col-span-7 relative group rounded-[32px] overflow-hidden border border-white/10 shadow-2xl h-[60vh] md:h-[75vh] bg-rose-950">
              {/* Blurred backdrop of the same image to fill card borders cleanly */}
              <img
                src={siteSettings.heroImage || thadeeGopal}
                alt=""
                className="w-full h-full object-cover object-center absolute inset-0 z-0 blur-2xl opacity-40 pointer-events-none scale-110"
              />
              {/* Contained main image to prevent zoom/cropping */}
              <img
                src={siteSettings.heroImage || thadeeGopal}
                alt={siteSettings.restaurantName}
                className="w-full h-full object-contain object-center absolute inset-0 z-0 scale-110 group-hover:scale-115 transition-transform duration-700 p-2 md:p-3"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-20 pointer-events-none">
                <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] mb-4 drop-shadow-lg tracking-tighter whitespace-pre-line">
                  {siteSettings.heroTitle || "HOTEL KING'S\nIMPERIAL"}
                </h1>
                <div className="flex flex-wrap gap-2.5 mb-4">
                  <div className="inline-block bg-amber-400 text-rose-950 px-4 py-1.5 rounded-full font-bold text-xs tracking-widest uppercase shadow-lg">
                    100% Pure Vegetarian
                  </div>
                  <div className="inline-block bg-rose-600 text-white px-4 py-1.5 rounded-full font-bold text-xs tracking-widest uppercase shadow-lg border border-rose-500/20 flex items-center gap-1.5">
                    🚚 Home Delivery
                  </div>
                </div>
                <p className="text-rose-300 font-medium text-lg max-w-md">
                  {siteSettings.heroTagline || "Crafting Nature's Best Flavors Since 202o in the Heart of Bhind."}
                </p>
              </div>

              <div className="absolute top-6 right-6 z-20 backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
                <span className="text-amber-400 text-sm">⭐</span>
                <span className="text-white font-bold text-sm tracking-wide">
                  {siteSettings.heroRating || "4.8 Rating"}
                </span>
              </div>
            </div>

            {/* Right Side Cards (5 columns) */}
            <div
              id="home"
              className="md:col-span-5 grid grid-cols-1 grid-rows-2 gap-6 h-[60vh] md:h-[75vh]"
            >
              {/* Signature 1 */}
              <TiltCard className="h-full">
                <div className="h-full backdrop-blur-md bg-white/5 border border-white/10 rounded-[32px] p-6 flex flex-col justify-between group overflow-hidden relative">
                  <div className="flex justify-between items-start z-10 relative">
                    <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full">
                      Signature Dish
                    </span>
                    <span className="text-white/40 text-sm font-black">#01</span>
                  </div>
                  <div className="flex gap-4 items-center z-10 relative">
                    <div
                      className="w-24 h-24 rounded-2xl bg-cover shadow-lg border border-white/10 shrink-0 transform transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundImage: `url(${siteSettings.signatureImage || IMAGES.paneerButterMasala})`,
                      }}
                    ></div>
                    <div>
                      <h3 className="text-2xl font-bold text-white leading-tight mb-1">
                        {siteSettings.signatureName || "Butter Paneer Masala"}
                      </h3>
                      <p className="text-white/60 text-sm leading-snug">
                        {siteSettings.signatureDesc || "Rich, creamy tomato-cream gravy with aromatic spices."}
                      </p>
                    </div>
                  </div>
                  {/* Decorative background glow */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-[40px] group-hover:bg-amber-400/20 transition-colors"></div>
                </div>
              </TiltCard>

              {/* Signature 2 */}
              <TiltCard className="h-full">
                <div className="h-full backdrop-blur-md bg-white/5 border border-white/10 rounded-[32px] p-6 flex flex-col justify-between group overflow-hidden relative">
                  <div className="flex justify-between items-start z-10 relative">
                    <span className="text-xs uppercase tracking-widest text-rose-400 font-bold bg-rose-400/10 px-3 py-1 rounded-full">
                      Today's Special
                    </span>
                    <span className="text-white/40 text-sm font-black">#02</span>
                  </div>
                  <div className="flex gap-4 items-center z-10 relative">
                    <div
                      className="w-24 h-24 rounded-2xl bg-cover shadow-lg border border-white/10 shrink-0 transform transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundImage: `url(${siteSettings.todaySpecialImage || IMAGES.poha})` }}
                    ></div>
                    <div>
                      <h3 className="text-2xl font-bold text-white leading-tight mb-1">
                        {siteSettings.todaySpecialName || "Poha & Kachori"}
                      </h3>
                      <p className="text-white/60 text-sm leading-snug">
                        {siteSettings.todaySpecialDesc || "The perfect morning starter — Bhind's iconic breakfast."}
                      </p>
                    </div>
                  </div>
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-400/10 rounded-full blur-[40px] group-hover:bg-rose-400/20 transition-colors"></div>
                </div>
              </TiltCard>
            </div>
          </motion.div>

          {/* INFO BAR */}
          <motion.div
            variants={itemVariant}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              { icon: Clock, title: "Open Daily", desc: siteSettings.openHours },
              { icon: MapPin, title: siteSettings.address.split(',')[0].trim(), desc: siteSettings.address.split(',').slice(1).join(',').trim() },
              { icon: IndianRupee, title: siteSettings.priceRange || "₹200–400", desc: "Per Person" },
              {
                icon: Utensils,
                title: siteSettings.dineInTitle || "Dine-in & Delivery",
                desc: siteSettings.dineInDesc || "Home Delivery Available",
              },
            ].map((item, idx) => (
              <TiltCard key={idx}>
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 text-center flex flex-col items-center justify-center hover:bg-white/10 transition-colors shadow-2xl h-full">
                  <item.icon className="text-amber-400 w-8 h-8 mb-4 stroke-[1.5]" />
                  <h3 className="text-white font-bold mb-1 tracking-tight text-lg">
                    {item.title}
                  </h3>
                  <p className="text-rose-200/60 text-sm font-medium">
                    {item.desc}
                  </p>
                </div>
              </TiltCard>
            ))}
          </motion.div>

          {/* ABOUT (Stats equivalent) */}
          <motion.div
            variants={itemVariant}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 border-y border-white/10 py-12 md:py-16 my-8 relative overflow-hidden backdrop-blur-sm bg-white/5 rounded-[32px] px-8"
          >
            <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between z-20">
              <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">
                    {siteSettings.stats1Value || "100%"}
                  </div>
                  <div className="text-xs text-amber-400 uppercase font-bold tracking-widest">
                    {siteSettings.stats1Label || "Vegetarian"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">
                    {siteSettings.stats2Value || "4.8"}
                  </div>
                  <div className="text-xs text-amber-400 uppercase font-bold tracking-widest">
                    {siteSettings.stats2Label || "Guest Rating"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">
                    {siteSettings.stats3Value || "6.4k"}
                  </div>
                  <div className="text-xs text-amber-400 uppercase font-bold tracking-widest">
                    {siteSettings.stats3Label || "Happy Reviews"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">
                    {siteSettings.stats4Value || "2021"}
                  </div>
                  <div className="text-xs text-amber-400 uppercase font-bold tracking-widest">
                    {siteSettings.stats4Label || "Established"}
                  </div>
                </div>
              </div>
            </div>
            {/* Space for the absolute content */}
            <div className="h-32 md:h-20 w-full opacity-0">...</div>
            <div
              className="absolute right-0 top-0 h-full w-1/2 bg-cover opacity-10"
              style={{
                backgroundImage: `url(${siteSettings.statsBgImage || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400"})`
              }}
            ></div>
          </motion.div>

          {/* ROOMS & SUITES SECTION */}
          <motion.section variants={itemVariant} id="rooms" className="pt-24 pb-12">
            <div className="text-center mb-16">
              <span className="text-rose-400 text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
                LUXURY ACCOMMODATIONS
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight font-serif">
                Our Premium Rooms & Suites
              </h2>
              <p className="text-rose-200/50 text-sm max-w-lg mx-auto mt-3">
                Experience unparalleled comfort and state-of-the-art amenities at Bhind's most premium hotel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[32px] overflow-hidden flex flex-col group hover:border-amber-400/30 transition-all duration-300 shadow-xl"
                >
                  {/* Image Container */}
                  <div
                    onClick={() => {
                      setSelectedDetailRoom(room);
                      setDetailActiveImageIdx(0);
                    }}
                    className="h-60 overflow-hidden relative cursor-pointer"
                    title="Click to view details & room gallery"
                  >
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-rose-950/80 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-amber-400 text-rose-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg">
                      ₹{room.price} / Night
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <h3
                        onClick={() => {
                          setSelectedDetailRoom(room);
                          setDetailActiveImageIdx(0);
                        }}
                        className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        {room.name}
                      </h3>
                      <p className="text-xs text-rose-200/60 leading-relaxed min-h-[48px]">
                        {room.description}
                      </p>

                      {/* Room Meta Badges */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-rose-100/50 uppercase font-black tracking-wider pt-2">
                        <div className="flex items-center gap-1.5 bg-white/2 border border-white/5 p-2 rounded-xl">
                          📐 {room.size}
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/2 border border-white/5 p-2 rounded-xl">
                          🛏️ {room.bed}
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5 bg-white/2 border border-white/5 p-2 rounded-xl">
                          👥 Capacity: {room.guests}
                        </div>
                      </div>

                      {/* Amenities list */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {room.amenities.slice(0, 4).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="bg-rose-950/40 border border-rose-800/30 text-rose-300 font-bold text-[9px] px-2 py-1 rounded-md"
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 4 && (
                          <span className="bg-rose-950/40 border border-rose-800/30 text-rose-300 font-bold text-[9px] px-2 py-1 rounded-md">
                            +{room.amenities.length - 4} More
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedDetailRoom(room);
                          setDetailActiveImageIdx(0);
                        }}
                        className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs py-3 rounded-2xl transition-all duration-300 cursor-pointer text-center"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRoomType(room.name);
                          setRoomBookingOpen(true);
                        }}
                        className="flex-1 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black text-xs uppercase tracking-wider py-3 rounded-2xl transition-all duration-300 shadow-md cursor-pointer text-center"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* FULL MENU */}
          <motion.section variants={itemVariant} id="menu" className="pt-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
              <div>
                <span className="text-rose-400 text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
                  Explore
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                  Select{" "}
                  <span className="italic text-rose-100 font-light">&</span>{" "}
                  Estimate.
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-10 border-b border-white/10 pb-6">
              {Object.keys(menu).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border backdrop-blur-md ${activeTab === tab ? "bg-amber-400 border-amber-400 text-rose-950 shadow-[0_4px_15px_rgba(16,185,129,0.3)]" : "bg-white/5 border-white/10 text-rose-100 hover:bg-white/10 hover:border-white/20"}`}
                >
                  {tab === "main"
                    ? "Main Course"
                    : tab === "breads"
                      ? "Breads & Rice"
                      : tab}
                </button>
              ))}
            </div>

            <div className="w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-16"
                >
                  {(menu as any)[activeTab].map(
                    (categoryObj: any, idx: number) => (
                      <div key={idx} className="space-y-8">
                        {/* Subcategory title */}
                        <div className="flex items-center gap-4">
                          <h3 className="text-2xl font-black text-amber-400 tracking-tight capitalize bg-white/5 border border-white/10 px-6 py-2.5 rounded-2xl shadow-md">
                            {categoryObj.category}
                          </h3>
                          <div className="h-[1px] bg-white/10 flex-grow"></div>
                        </div>

                        {/* Grid of menu cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                          {categoryObj.items.map((item: any, i: number) => {
                            // Stable hash rating calculation: ranges from 4.3 to 5.0
                            const getRating = (name: string) => {
                              const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                              const val = 4.3 + (hash % 8) / 10;
                              return val > 5 ? 5 : val;
                            };
                            const rating = getRating(item.name);
                            const fullStars = Math.floor(rating);
                            const hasHalf = rating - fullStars >= 0.5;

                            // Loyalty points calculation: standard price * 1.5 rounded
                            const getLoyaltyPoints = (priceVal: string | number) => {
                              const numericPrice = typeof priceVal === 'string'
                                ? parseInt(priceVal.split('/')[0].trim().replace(/[^0-9]/g, ''), 10)
                                : priceVal;
                              return isNaN(numericPrice) ? 50 : Math.round(numericPrice * 1.5);
                            };
                            const loyaltyPoints = getLoyaltyPoints(item.price);

                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: Math.min(i * 0.05, 0.3) }}
                              >
                                <TiltCard className="h-full">
                                  <div
                                    onClick={() => setActiveDetailDish({ item, category: categoryObj.category })}
                                    role="button"
                                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[28px] overflow-hidden flex flex-col h-full shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all duration-500 hover:border-amber-400/20 group relative cursor-pointer select-none"
                                  >
                                    {/* Dish Image */}
                                    <div className="relative h-52 w-full overflow-hidden shrink-0">
                                      <img
                                        src={item.image || getItemImage(item.name, categoryObj.category)}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                      />
                                      {/* Brand Logo Watermark */}
                                      <div className="absolute top-4 left-4 bg-rose-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-amber-400">
                                        {siteSettings.restaurantName}
                                      </div>
                                      {/* Pure Veg Badge */}
                                      <div className="absolute top-4 right-4 bg-emerald-950/90 backdrop-blur-md px-2 py-2 rounded-lg border border-emerald-500/30 flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></div>
                                      </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5 md:p-6 flex flex-col flex-grow justify-between gap-4">

                                      {/* Info Block */}
                                      <div className="space-y-2">
                                        {/* Subcategory Label */}
                                        <div className="text-[10px] text-rose-300/60 uppercase font-black tracking-widest">
                                          100% Pure Veg · {categoryObj.category}
                                        </div>

                                        {/* Dish Title */}
                                        <h4 className="text-base md:text-lg font-black text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight line-clamp-1 leading-snug">
                                          {item.name}
                                        </h4>

                                        {/* Star Rating Display */}
                                        <div className="flex items-center gap-1">
                                          {[...Array(5)].map((_, starIdx) => {
                                            const isActive = starIdx < fullStars;
                                            const isHalf = starIdx === fullStars && hasHalf;
                                            return (
                                              <Star
                                                key={starIdx}
                                                size={13}
                                                className={`${isActive
                                                  ? "fill-emerald-400 text-emerald-400"
                                                  : isHalf
                                                    ? "fill-emerald-400/50 text-emerald-400/50"
                                                    : "text-white/20"
                                                  }`}
                                              />
                                            );
                                          })}
                                          <span className="text-[10px] text-white/50 font-bold ml-1">
                                            {rating.toFixed(1)}
                                          </span>
                                        </div>

                                        {/* Description if it exists */}
                                        {item.desc && (
                                          <p className="text-xs text-white/50 font-medium line-clamp-2 leading-relaxed italic">
                                            "{item.desc}"
                                          </p>
                                        )}
                                      </div>

                                      {/* Price and Action Block */}
                                      <div className="space-y-3 shrink-0">
                                        <div className="flex items-center justify-between gap-4">
                                          <div className="flex flex-col">
                                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider leading-none">MRP</span>
                                            <span className="text-xl md:text-2xl font-black text-emerald-400 mt-1 leading-none tracking-tight">
                                              ₹{item.price}
                                            </span>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              addToOrder(item.name, item.price);
                                            }}
                                            className="bg-rose-500 hover:bg-rose-400 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
                                          >
                                            <ShoppingBag size={12} /> Add
                                          </button>
                                        </div>

                                        <div className="text-[10px] text-rose-200/40 font-bold tracking-wide">
                                          Earn up to <span className="text-amber-400/60">{loyaltyPoints}</span> Loyalty points.
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TiltCard>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.section>

          {/* REVIEWS SECTION */}
          <motion.section variants={itemVariant} id="reviews" className="pt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Text / Reviews Stack */}
              <div className="flex flex-col gap-8 order-2 lg:order-1">
                <div>
                  <span className="text-rose-400 text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
                    Voices
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-6">
                    What Our
                    <br />
                    <span className="italic text-rose-100 font-light">
                      Guests Say
                    </span>
                  </h2>
                </div>

                <div className="flex flex-col gap-6">
                  {REVIEWS.slice(0, 2).map((review, i) => (
                    <TiltCard key={i}>
                      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-colors relative h-full">
                        <div className="absolute top-6 right-8 text-5xl text-amber-400/20 font-serif font-black leading-none">
                          "
                        </div>
                        <div className="flex items-center gap-4 mb-5">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl bg-rose-700/50 shadow-inner border border-white/20`}
                          >
                            {review.initial}
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg">
                              {review.name}
                            </div>
                            <div className="text-xs text-rose-300/70 uppercase tracking-widest">
                              {review.meta}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed font-medium">
                          "{review.text}"
                        </p>
                      </div>
                    </TiltCard>
                  ))}
                </div>
              </div>

              {/* Review Form */}
              <div className="order-1 lg:order-2 flex flex-col justify-center">
                <ReviewForm />
              </div>
            </div>
          </motion.section>

          {/* PREMIUM GALLERY */}
          <motion.div variants={itemVariant}>
            <Gallery images={ambianceImages} />
          </motion.div>

          {/* IMAGE UPLOAD SECTION */}
          <motion.section variants={itemVariant} id="upload-gallery" className="pt-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
              <div>
                <span className="text-rose-400 text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Community</span>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                  Share Your <span className="italic text-rose-100 font-light">Moments</span>
                </h2>
              </div>

              <div>
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 group"
                >
                  <ImagePlus size={20} className="group-hover:scale-110 transition-transform" />
                  Upload Photos
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="col-span-2 md:col-span-2 row-span-2 w-full h-full">
                <TiltCard className="w-full h-full">
                  <div className="w-full h-full rounded-[32px] overflow-hidden border border-white/10 relative group min-h-[300px] shadow-2xl">
                    <img
                      src={outerside}
                      alt="Community Moment"
                      className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-0 bg-rose-900/30 mix-blend-multiply pointer-events-none"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10 transition-all duration-500">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4 shadow-xl group-hover:scale-110 group-hover:bg-rose-500/80 transition-all">
                        <ImagePlus size={28} className="text-white drop-shadow-md" />
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tight mb-2 drop-shadow-md group-hover:text-rose-200 transition-colors">Our Community</h3>
                      <p className="text-white/90 font-medium drop-shadow-md max-w-sm group-hover:opacity-100 transition-opacity">Add photos of your visit and share the joy with the {siteSettings.restaurantName} community.</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>

              {uploadedImages.map((src, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 + idx * 0.05 }} className="col-span-1 w-full h-full aspect-square">
                  <TiltCard className="w-full h-full">
                    <div className="w-full h-full rounded-[24px] md:rounded-[32px] overflow-hidden border border-white/10 relative group">
                      <img src={src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Uploaded ${idx}`} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white/90 text-sm font-bold backdrop-blur-sm">
                        User Upload
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* OUR MEMORIES SECTION */}
          {(() => {
            const activeMemories = memories.filter(m => m.type === "photo" || m.type === "video");
            if (activeMemories.length === 0) return null;
            return (
              <motion.section variants={itemVariant} id="memories" className="pt-16">
                <div className="text-center mb-12">
                  <span className="text-rose-400 text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Our Story</span>
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                    Our <span className="italic text-rose-100 font-light">Memories</span>
                  </h2>
                  <p className="text-rose-200/50 text-sm max-w-lg mx-auto mt-3">A collection of cherished moments from Hotel King's Imperial family.</p>
                </div>
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                  {activeMemories.map((mem: any, idx: number) => (
                    <div
                      key={idx}
                      className="break-inside-avoid rounded-2xl overflow-hidden border border-white/10 group relative cursor-pointer"
                      onClick={() => {
                        setMemLightbox({ open: true, idx });
                      }}
                    >
                      {mem.type === "photo" && mem.url && (
                        <div className="relative">
                          <img src={mem.url} alt={mem.caption || `Memory ${idx + 1}`} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <div className="flex items-center gap-2 w-full">
                              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
                              </div>
                              {mem.caption && <p className="text-white text-xs font-bold truncate">{mem.caption}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                      {mem.type === "video" && mem.url && (
                        <div className="relative bg-black">
                          <div className="w-full aspect-video bg-gradient-to-br from-rose-900 to-black flex items-center justify-center relative overflow-hidden">
                            {mem.url.includes("youtube") || mem.url.includes("youtu.be") ? (
                              <img
                                src={`https://img.youtube.com/vi/${mem.url.includes("youtu.be/") ? mem.url.split("youtu.be/")[1]?.split("?")[0] : mem.url.split("v=")[1]?.split("&")[0]}/hqdefault.jpg`}
                                alt="Video thumbnail"
                                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : null}
                            <div className="relative z-10 w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                          </div>
                          {mem.caption && <p className="text-white/70 text-xs font-bold p-2 bg-black/50">{mem.caption}</p>}
                        </div>
                      )}
                      {mem.date && (
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white/60 text-[8px] font-bold px-2 py-0.5 rounded-full">
                          {new Date(mem.date).toLocaleDateString("en-IN")}
                        </div>
                      )}
                      <div className="absolute top-2 right-2 w-6 h-6 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            );
          })()}

          {/* MEMORIES LIGHTBOX MODAL */}
          {createPortal(
            <AnimatePresence>
              {(() => {
                const activeMemories = memories.filter(m => m.type === "photo" || m.type === "video");
                if (!memLightbox.open || !activeMemories[memLightbox.idx]) return null;

                const closeLightbox = () => setMemLightbox({ open: false, idx: 0 });
                const prevMem = (e?: React.MouseEvent) => {
                  e?.stopPropagation();
                  setMemLightbox(prev => ({ ...prev, idx: (prev.idx - 1 + activeMemories.length) % activeMemories.length }));
                };
                const nextMem = (e?: React.MouseEvent) => {
                  e?.stopPropagation();
                  setMemLightbox(prev => ({ ...prev, idx: (prev.idx + 1) % activeMemories.length }));
                };

                const handleDownload = async (e: React.MouseEvent) => {
                  e.stopPropagation();
                  const currentMem = activeMemories[memLightbox.idx];
                  if (!currentMem || !currentMem.url) return;

                  const url = currentMem.url;
                  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
                  
                  if (isYouTube) {
                    window.open(url, "_blank");
                    return;
                  }

                  try {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = blobUrl;
                    const extension = url.split(".").pop()?.split("?")[0] || (currentMem.type === "video" ? "mp4" : "jpg");
                    link.download = `HKI_Memory_${memLightbox.idx + 1}.${extension}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                  } catch (error) {
                    window.open(url, "_blank");
                  }
                };

                return (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-rose-950/98 backdrop-blur-xl flex items-center justify-center p-4 md:p-10" 
                    onClick={closeLightbox}
                  >
                    <button 
                      className="absolute top-8 right-8 text-white/50 hover:text-white transition-all z-[10000] bg-white/5 p-4 rounded-full hover:rotate-90 border border-white/10 cursor-pointer" 
                      onClick={closeLightbox}
                    >
                      <X size={32} />
                    </button>
                    
                    <button 
                      className="absolute top-8 right-28 text-white/50 hover:text-white transition-all z-[10000] bg-white/5 p-4 rounded-full border border-white/10 cursor-pointer flex items-center justify-center hover:scale-105" 
                      onClick={handleDownload}
                      title="Download Memory"
                    >
                      <Download size={32} />
                    </button>
        
                    <button 
                      className="absolute left-6 md:left-12 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all z-[10000] backdrop-blur-md border border-white/10 group cursor-pointer" 
                      onClick={prevMem}
                    >
                      <ChevronLeft size={48} className="group-hover:-translate-x-2 transition-transform" />
                    </button>
        
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative max-w-5xl w-full flex flex-col items-center justify-center" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      {activeMemories[memLightbox.idx].type === "photo" ? (
                        <img
                          src={activeMemories[memLightbox.idx].url}
                          alt={activeMemories[memLightbox.idx].caption || "Memory Preview"}
                          className="max-h-[70vh] w-auto object-contain rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
                        />
                      ) : (
                        <div className="w-full max-w-4xl aspect-video rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 relative">
                          {(activeMemories[memLightbox.idx].url.includes("youtube") || activeMemories[memLightbox.idx].url.includes("youtu.be")) ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${activeMemories[memLightbox.idx].url.includes("youtu.be/") ? activeMemories[memLightbox.idx].url.split("youtu.be/")[1]?.split("?")[0] : activeMemories[memLightbox.idx].url.split("v=")[1]?.split("&")[0]}?autoplay=1`}
                              className="w-full h-full absolute inset-0 border-0"
                              allowFullScreen
                              allow="autoplay; encrypted-media"
                              title={activeMemories[memLightbox.idx].caption || "Video player"}
                            />
                          ) : (
                            <video src={activeMemories[memLightbox.idx].url} controls autoPlay className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}
                      
                      {activeMemories[memLightbox.idx].caption && (
                        <p className="mt-6 text-white text-lg font-black tracking-wide bg-black/40 px-6 py-2 rounded-full border border-white/5 text-center">
                          {activeMemories[memLightbox.idx].caption}
                        </p>
                      )}
                      
                      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-white/40 text-xs font-black tracking-[0.5em] uppercase">
                        {memLightbox.idx + 1} / {activeMemories.length}
                      </div>
                    </motion.div>
        
                    <button 
                      className="absolute right-6 md:right-12 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all z-[10000] backdrop-blur-md border border-white/10 group cursor-pointer" 
                      onClick={nextMem}
                    >
                      <ChevronRight size={48} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </motion.div>
                );
              })()}
            </AnimatePresence>,
            document.body
          )}

          {/* CONTACT SECTION (The big green block from design) */}
          {/* Contact Section */}
          <motion.section variants={itemVariant} id="contact" className="py-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[400px]">
              {/* Contact Info Card */}
              <div className="col-span-1 md:col-span-5 backdrop-blur-2xl bg-amber-400 rounded-[32px] p-8 md:p-12 flex flex-col justify-center shadow-[0_20px_50px_rgba(163,230,53,0.3)] border border-amber-300">
                <span className="text-rose-950 font-black text-xs uppercase tracking-widest mb-6 block">
                  Contact Us
                </span>

                <div className="flex flex-col gap-6">
                  <a
                    href={`tel:${siteSettings.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-4 group cursor-pointer transition-transform hover:translate-x-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-950 flex items-center justify-center text-amber-400 font-bold shrink-0 shadow-lg">
                      <Phone size={20} />
                    </div>
                    <div>
                      <div className="text-rose-900/60 text-xs font-bold uppercase tracking-widest">
                        Call Us
                      </div>
                      <span className="text-rose-950 text-xl font-black">
                        {siteSettings.phone}
                      </span>
                    </div>
                  </a>

                  <a
                    href={`https://wa.me/${siteSettings.whatsapp}`}
                    target="_blank"
                    className="flex items-center gap-4 group cursor-pointer transition-transform hover:translate-x-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                      <WhatsAppIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-rose-900/60 text-xs font-bold uppercase tracking-widest">
                        Chat
                      </div>
                      <span className="text-rose-950 text-xl font-black italic">
                        WhatsApp Us Now
                      </span>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 group pt-2 border-t border-rose-950/10">
                    <div className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center text-rose-950 shrink-0 shadow-sm border border-rose-950/10">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <span className="text-rose-950 text-sm font-bold block">
                        {siteSettings.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map / Image element */}
              <div className="col-span-1 md:col-span-7 relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 h-[300px] md:h-full group">
                <div className="absolute inset-0 bg-rose-950/30 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(siteSettings.restaurantName + ", " + siteSettings.address)}&output=embed`}
                  className="w-full h-full border-none grayscale-[0.5] contrast-125 opacity-80 group-hover:opacity-100 transition-opacity"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </motion.section>
        </motion.div>

        {/* FULL WIDTH 3D FOOTER */}
        <div className="w-full relative z-20 mt-28 overflow-hidden" style={{ perspective: "1200px" }}>
          {/* Top Edge Highlight glow */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent blur-[2px] z-30"></div>

          <footer
            style={{
              transform: "rotateX(7deg) translateY(10px)",
              transformOrigin: "bottom center",
              transformStyle: "preserve-3d"
            }}
            className="w-full border-t border-amber-400/30 pt-20 pb-8 text-left bg-gradient-to-b from-rose-950/95 via-rose-950/90 to-black/95 backdrop-blur-2xl px-6 md:px-16 space-y-16 shadow-[0_-25px_60px_rgba(0,0,0,0.95)] relative"
          >
            {/* Giant Premium Branding Title inside Footer */}
            <div className="max-w-7xl mx-auto mb-14 text-center lg:text-left" style={{ transform: "translateZ(30px)" }}>
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-300 to-white leading-none">
                {siteSettings.footerTitle || "King's Imperial"}
              </h2>
              <p className="text-[10px] text-amber-400 font-black tracking-[0.4em] uppercase mt-4">
                {siteSettings.footerSubtitle || "Purely Plant-Based Excellence • Since 1998"}
              </p>
            </div>

            {/* Main Footer Grid */}
            <div style={{ transform: "translateZ(10px)" }} className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">

              {/* Column 1: Brand & Story */}
              <div
                style={{ transform: "translateZ(20px)" }}
                className="backdrop-blur-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/20 rounded-[28px] p-6 shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/[0.06] group"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center shadow-md overflow-hidden">
                      <img src={logo} alt="Logo" className="w-full h-full object-cover scale-110" />
                    </div>
                    <span className="text-white font-black text-lg tracking-tight uppercase">
                      {siteSettings.restaurantName}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">
                    {siteSettings.footerDesc || "Purely Plant-Based Excellence since 1998. Crafting the finest vegetarian flavors with authentic heritage recipes in Kirar Colony, Bhind."}
                  </p>
                  {/* Trust badges */}
                  <div className="flex gap-2.5 pt-2">
                    <span className="bg-emerald-950/80 border border-emerald-500/20 text-[9px] text-emerald-400 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                      100% Veg
                    </span>
                    <span className="bg-amber-400/10 border border-amber-400/20 text-[9px] text-amber-400 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                      Heritage
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: Navigation Links */}
              <div
                style={{ transform: "translateZ(20px)" }}
                className="backdrop-blur-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/20 rounded-[28px] p-6 shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/[0.06] group"
              >
                <div className="space-y-4">
                  <h4 className="text-xs text-amber-400 font-black uppercase tracking-widest border-b border-white/5 pb-2">
                    Navigation
                  </h4>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-white/50 font-bold">
                    <li><a href="#home" className="hover:text-amber-400 transition-colors">Home</a></li>
                    <li><a href="#menu" className="hover:text-amber-400 transition-colors">Menu</a></li>
                    <li><a href="#gallery" className="hover:text-amber-400 transition-colors">Ambiance</a></li>
                    <li><a href="#reviews" className="hover:text-amber-400 transition-colors">Reviews</a></li>
                    <li><a href="#contact" className="hover:text-amber-400 transition-colors">Contact</a></li>
                    <li>
                      <a
                        href="#admin"
                        className="hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                      >
                        <Lock size={10} /> Admin Panel
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Column 3: Timing & Highlights */}
              <div
                style={{ transform: "translateZ(20px)" }}
                className="backdrop-blur-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/20 rounded-[28px] p-6 shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/[0.06] group"
              >
                <div className="space-y-4">
                  <h4 className="text-xs text-amber-400 font-black uppercase tracking-widest border-b border-white/5 pb-2">
                    Hours & Service
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Clock size={14} className="text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] text-white/40 font-black uppercase tracking-wider">Operating Hours</div>
                        <span className="text-xs text-white/80 font-bold">{siteSettings.openHours}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Utensils size={14} className="text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] text-white/40 font-black uppercase tracking-wider">Services Offered</div>
                        <span className="text-xs text-white/80 font-bold">Dine-in, Takeaway & Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 4: Contact & Socials */}
              <div
                style={{ transform: "translateZ(20px)" }}
                className="backdrop-blur-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/20 rounded-[28px] p-6 shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/[0.06] group"
              >
                <div className="space-y-4">
                  <h4 className="text-xs text-amber-400 font-black uppercase tracking-widest border-b border-white/5 pb-2">
                    Get In Touch
                  </h4>
                  <div className="space-y-3">
                    <a
                      href={`tel:${siteSettings.phone.replace(/\s/g, "")}`}
                      className="flex items-start gap-2.5 group cursor-pointer"
                    >
                      <Phone size={14} className="text-amber-400 mt-0.5 group-hover:scale-110 transition-transform shrink-0" />
                      <div>
                        <div className="text-[10px] text-white/40 font-black uppercase tracking-wider">Call Directly</div>
                        <span className="text-xs text-white/80 font-bold group-hover:text-amber-400 transition-colors">{siteSettings.phone}</span>
                      </div>
                    </a>
                    <div className="flex items-start gap-2.5">
                      <MapPin size={14} className="text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] text-white/40 font-black uppercase tracking-wider">Find Us At</div>
                        <span className="text-xs text-white/80 font-bold leading-normal">{siteSettings.address}</span>
                      </div>
                    </div>

                    {/* Social Media Icons */}
                    {(siteSettings.socialMedia?.instagram || siteSettings.socialMedia?.facebook || siteSettings.socialMedia?.youtube || siteSettings.socialMedia?.twitter) && (
                      <div className="pt-2 border-t border-white/5">
                        <div className="text-[10px] text-white/40 font-black uppercase tracking-wider mb-2">Follow Us</div>
                        <div className="flex gap-2.5 flex-wrap">
                          {siteSettings.socialMedia?.instagram && (
                            <a href={siteSettings.socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-0.5"
                              style={{ background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}
                              title="Instagram">
                              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                            </a>
                          )}
                          {siteSettings.socialMedia?.facebook && (
                            <a href={siteSettings.socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                              className="w-9 h-9 bg-[#1877f2] rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-0.5"
                              title="Facebook">
                              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                          )}
                          {siteSettings.socialMedia?.youtube && (
                            <a href={siteSettings.socialMedia.youtube} target="_blank" rel="noopener noreferrer"
                              className="w-9 h-9 bg-[#ff0000] rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-0.5"
                              title="YouTube">
                              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" /></svg>
                            </a>
                          )}
                          {siteSettings.socialMedia?.twitter && (
                            <a href={siteSettings.socialMedia.twitter} target="_blank" rel="noopener noreferrer"
                              className="w-9 h-9 bg-black border border-white/10 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-0.5"
                              title="X (Twitter)">
                              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.749l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                          )}
                          <a href={`https://wa.me/${siteSettings.whatsapp}`} target="_blank" rel="noopener noreferrer"
                            className="w-9 h-9 bg-[#25D366] rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-0.5"
                            title="WhatsApp">
                            <WhatsAppIcon className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}
                    {!(siteSettings.socialMedia?.instagram || siteSettings.socialMedia?.facebook || siteSettings.socialMedia?.youtube) && (
                      <div className="pt-2 border-t border-white/5">
                        <div className="text-[10px] text-white/40 font-black uppercase tracking-wider mb-2">Follow Us</div>
                        <div className="flex gap-2.5">
                          <a href={`https://wa.me/${siteSettings.whatsapp}`} target="_blank" rel="noopener noreferrer"
                            className="w-9 h-9 bg-[#25D366] rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-0.5"
                            title="WhatsApp">
                            <WhatsAppIcon className="w-4 h-4" />
                          </a>
                          <span className="text-[10px] text-white/20 font-medium italic flex items-center">Social links coming soon</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom sub-footer Bar */}
            <div style={{ transform: "translateZ(15px)" }} className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <p className="text-[10px] text-white/30 font-bold">
                &copy; {new Date().getFullYear()} {siteSettings.restaurantName}. All rights reserved.
              </p>
              <div className="flex gap-4 text-[10px] text-white/20 font-black uppercase tracking-widest">
                <span>Pure Veg Excellence</span>
                <span>&bull;</span>
                <span>Kirar Colony, Bhind</span>
              </div>
            </div>

            {/* Giant Backdrop Watermark */}
            <div className="absolute inset-x-0 bottom-16 flex justify-center items-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.03] w-full">
              <span className="text-[14vw] font-black tracking-[0.15em] uppercase text-white leading-none whitespace-nowrap">
                {siteSettings.footerWatermark || "IMPERIAL"}
              </span>
            </div>
          </footer>
        </div>

        {/* Extreme Bottom Label */}
        <div className="hidden lg:block absolute top-[50%] right-[-140px] z-50 transform rotate-90 origin-center text-white/10 text-xs font-black uppercase tracking-[1em]">
          Purely Plant Based Excellence
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <AnimatePresence>
          {orderSummaryOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setOrderSummaryOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 w-full max-w-sm h-full bg-rose-950 border-l border-white/10 z-[60] shadow-2xl flex flex-col pt-6 pb-8 px-6 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4 shrink-0">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    {(sidebarView === "checkout" || sidebarView === "payment") && (
                      <button
                        onClick={() => {
                          setSidebarView(sidebarView === "payment" ? "checkout" : "list");
                          setValidationError("");
                        }}
                        className="text-white/60 hover:text-white transition-colors mr-1"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    {sidebarView === "success" ? (
                      <>
                        <ShoppingBag size={20} className="text-emerald-400" />
                        Order Placed!
                      </>
                    ) : (
                      <>
                        <Utensils size={20} className="text-amber-400" />
                        {sidebarView === "checkout" ? "Order Details" : sidebarView === "payment" ? "Payment Mode" : "Your Estimate"}
                      </>
                    )}
                  </h3>
                  <button
                    onClick={() => setOrderSummaryOpen(false)}
                    className="text-white hover:text-amber-400 transition-colors bg-white/5 p-2 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 relative px-2 pr-4 custom-scrollbar">
                  {sidebarView === "success" ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-20 h-20 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-2"
                      >
                        <CheckCircle2 size={40} />
                      </motion.div>
                      <h4 className="text-2xl font-black text-white">Order Received!</h4>
                      <p className="text-rose-200/70 text-sm max-w-[280px]">
                        Your order has been sent to us. <strong className="text-amber-400">Awaiting admin confirmation.</strong> We'll confirm via WhatsApp soon.
                      </p>
                      <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-center gap-2">
                        <span className="text-amber-400 text-xs font-black uppercase tracking-wider">⏳ Status: Pending Confirmation</span>
                      </div>

                      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-2 text-left space-y-2 relative overflow-hidden">
                        <div className="text-[10px] text-amber-400 uppercase font-black tracking-widest">Order Summary</div>
                        <div className="text-xs font-bold text-white">Order ID: {orderId}</div>
                        <div className="text-xs font-bold text-white">Mode: {orderType === "dine-in" ? "Dine-in" : orderType === "delivery" ? "Home Delivery" : "Takeaway"}</div>
                        <div className="text-xs font-medium text-rose-200/80">Items: {orderItemCount} • Total: ₹{orderTotal}</div>
                        {payOnDelivery && <div className="text-xs font-bold text-emerald-400">Payment: Cash on Delivery 🚐</div>}
                      </div>

                      <div className="w-full flex flex-col gap-2 mt-2">
                        <button
                          onClick={() => {
                            setActivePrintOrder({
                              id: orderId,
                              customerName,
                              customerPhone,
                              orderType,
                              tableNumber,
                              deliveryAddress,
                              total: orderTotal,
                              paymentMethod: payOnDelivery ? "cash-on-delivery" : paymentMethod,
                              items: order,
                              date: new Date().toISOString()
                            });
                            setIsInvoiceOpen(true);
                          }}
                          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Printer size={16} />
                          Print Invoice / Receipt
                        </button>
                        <button
                          onClick={handleSendToKitchen}
                          className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba56] text-white font-bold transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <WhatsAppIcon className="w-4.5 h-4.5" />
                          Resend to Kitchen
                        </button>
                      </div>
                    </div>
                  ) : sidebarView === "checkout" ? (
                    <div className="flex flex-col gap-5 py-2">
                      {validationError && (
                        <div className="bg-red-500/15 border border-red-500/30 text-red-200 p-3.5 rounded-xl text-xs font-bold tracking-wide">
                          ⚠️ {validationError}
                        </div>
                      )}

                      {/* Customer Name */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Your Name *</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                        />
                      </div>

                      {/* Mobile Number */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Mobile Number *</label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Enter 10-digit mobile number"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                        />
                      </div>

                      {/* Order Mode selector */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Order Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["dine-in", "takeaway", "delivery"] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => {
                                setOrderType(mode);
                                setValidationError("");
                              }}
                              className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${orderType === mode
                                ? "bg-amber-400 border-amber-400 text-rose-950 shadow-[0_2px_8px_rgba(163,230,53,0.25)]"
                                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                }`}
                            >
                              {mode === "dine-in" ? "Dine-in" : mode === "delivery" ? "Home Delivery" : "Takeaway"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Conditional inputs */}
                      {orderType === "dine-in" && (
                        <>
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Table Number (Optional)</label>
                            <input
                              type="text"
                              value={tableNumber}
                              onChange={(e) => setTableNumber(e.target.value)}
                              placeholder="e.g. 5 (Leave empty if not seated)"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Dine-in Date *</label>
                              <input
                                type="date"
                                value={dineInDate}
                                onChange={(e) => setDineInDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Dine-in Time *</label>
                              <input
                                type="time"
                                value={dineInTime}
                                onChange={(e) => setDineInTime(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {orderType === "delivery" && (
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Delivery Address *</label>
                          <textarea
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Enter complete delivery address"
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors resize-none"
                          />
                        </div>
                      )}

                      {/* Pay on Delivery Option (for delivery, takeaway, and dine-in) */}
                      {(orderType === "delivery" || orderType === "takeaway" || orderType === "dine-in") && (
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Payment Preference</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPayOnDelivery(false)}
                              className={`py-2.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${!payOnDelivery ? "bg-amber-400 border-amber-400 text-rose-950" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                }`}
                            >
                              💳 Pay Online
                            </button>
                            <button
                              type="button"
                              onClick={() => setPayOnDelivery(true)}
                              className={`py-2.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${payOnDelivery ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                }`}
                            >
                              {orderType === "dine-in" ? "💵 Pay after Dining" : "🚰 Pay on Delivery"}
                            </button>
                          </div>
                          {payOnDelivery && (
                            <p className="text-[10px] text-emerald-400/80 font-medium animate-pulse">
                              {orderType === "dine-in"
                                ? "✅ You can pay cash or UPI at the counter or table after dining."
                                : orderType === "takeaway"
                                  ? "✅ You can pay cash/UPI at the counter when picking up your order."
                                  : "✅ You can pay cash to our delivery rider upon receiving your order."}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : sidebarView === "payment" ? (
                    paymentStatus === "processing" ? (
                      <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-20">
                        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        <h4 className="text-lg font-bold text-white">Processing Payment...</h4>
                        <p className="text-rose-200/60 text-xs max-w-[250px]">Please do not close this sidebar or refresh the page.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-5 py-2">
                        {validationError && (
                          <div className="bg-red-500/15 border border-red-500/30 text-red-200 p-3.5 rounded-xl text-xs font-bold tracking-wide">
                            ⚠️ {validationError}
                          </div>
                        )}

                        {/* Total to pay info */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                          <span className="text-xs text-white/60">Amount to Pay</span>
                          <span className="text-xl font-black text-amber-400">₹{orderTotal}</span>
                        </div>

                        {/* Payment Tab Selector */}
                        <div className="grid grid-cols-4 gap-1.5 bg-white/5 p-1 rounded-xl">
                          {(["upi", "card", "netbanking", "cash"] as const).map((method) => {
                            const Icon = method === "upi" ? QrCode : method === "card" ? CreditCard : method === "netbanking" ? Building : Wallet;
                            return (
                              <button
                                key={method}
                                type="button"
                                onClick={() => {
                                  setPaymentMethod(method);
                                  setValidationError("");
                                }}
                                className={`flex flex-col items-center gap-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-tight transition-all ${paymentMethod === method
                                  ? "bg-amber-400 text-rose-950 shadow-md"
                                  : "text-white/60 hover:text-white hover:bg-white/5"
                                  }`}
                              >
                                <Icon size={14} />
                                <span>{method === "netbanking" ? "NetBank" : method}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Method specific fields */}
                        {paymentMethod === "upi" && (
                          <div className="flex flex-col items-center gap-4 py-2 animate-fade-in">
                            <div className="bg-white p-3 rounded-2xl shadow-lg border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                              {(siteSettings.paymentSettings?.qrImage) ? (
                                <img src={siteSettings.paymentSettings.qrImage} alt="UPI QR Code" className="w-36 h-36 object-contain" />
                              ) : (
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${siteSettings.paymentSettings?.upiId || '8218309142@ybl'}&pn=${encodeURIComponent(siteSettings.paymentSettings?.accountName || siteSettings.restaurantName)}&am=${orderTotal}&cu=INR&tn=${orderId}`)}`}
                                  alt="UPI QR Code"
                                  className="w-36 h-36 object-contain"
                                />
                              )}
                            </div>
                            <div className="text-center space-y-2 w-full">
                              <p className="text-xs font-bold text-amber-400">Scan QR Code to pay ₹{orderTotal}</p>
                              
                              <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-1">
                                <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">UPI Payment Details</p>
                                <p className="text-xs font-bold text-white select-all">{siteSettings.paymentSettings?.upiId || '8218309142@ybl'}</p>
                                <p className="text-[10px] text-rose-200/60 font-medium">Name: {siteSettings.paymentSettings?.accountName || siteSettings.restaurantName}</p>
                              </div>

                              {/* Upload Receipt Section */}
                              <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 text-left">
                                <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">
                                  Upload Payment Receipt *
                                </label>
                                <div className="flex items-center gap-3">
                                  <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-amber-400/50 rounded-lg p-2.5 hover:bg-white/5 transition-all cursor-pointer">
                                    <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-wider">
                                      <ImagePlus size={14} className="text-amber-400" />
                                      <span>{upiReceipt ? "Change Receipt" : "Upload Receipt"}</span>
                                    </div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          const file = e.target.files[0];
                                          if (file.size > 1.5 * 1024 * 1024) {
                                            alert("Receipt image size must be less than 1.5MB. Please choose a smaller file.");
                                            return;
                                          }
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            if (typeof reader.result === "string") {
                                              setUpiReceipt(reader.result);
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </label>
                                  {upiReceipt && (
                                    <div className="relative w-12 h-12 rounded-lg border border-white/10 overflow-hidden bg-black/40 flex items-center justify-center">
                                      <img src={upiReceipt} alt="Receipt Preview" className="w-full h-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => setUpiReceipt("")}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                      >
                                        <X size={10} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <p className="text-[8px] text-white/30 font-medium">
                                  Please upload a screenshot of your successful UPI transaction.
                                </p>
                              </div>

                              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 max-w-max mx-auto">
                                <ShieldCheck size={12} />
                                <span>UPI Payment Mode Active</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentMethod === "card" && (
                          <div className="space-y-4">
                            {/* Card Mockup */}
                            <div className="w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-amber-500/30 to-rose-500/20 border border-white/20 p-5 flex flex-col justify-between shadow-xl relative overflow-hidden backdrop-blur-md">
                              <div className="absolute top-[-20%] left-[-20%] w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>
                              <div className="flex justify-between items-start z-10">
                                <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">{siteSettings.restaurantName}</div>
                                <CreditCard size={20} className="text-white/60" />
                              </div>
                              <div className="text-base font-mono tracking-widest text-white py-1 z-10">
                                {cardNo ? cardNo : "•••• •••• •••• ••••"}
                              </div>
                              <div className="flex justify-between items-end z-10">
                                <div>
                                  <div className="text-[7px] text-white/40 uppercase font-mono">Card Holder</div>
                                  <div className="text-[10px] font-bold text-white uppercase tracking-wider truncate max-w-[130px]">
                                    {cardHolder ? cardHolder : "YOUR NAME"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[7px] text-white/40 uppercase font-mono">Expires</div>
                                  <div className="text-[10px] font-bold text-white font-mono">
                                    {cardExpiry ? cardExpiry : "MM/YY"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Card Inputs */}
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Card Number</label>
                                <input
                                  type="text"
                                  value={cardNo}
                                  onChange={(e) => {
                                    let val = e.target.value.replace(/[^0-9]/g, "");
                                    if (val.length > 16) val = val.substring(0, 16);
                                    const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                                    setCardNo(formatted);
                                  }}
                                  placeholder="0000 0000 0000 0000"
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Expiry Date</label>
                                  <input
                                    type="text"
                                    value={cardExpiry}
                                    onChange={(e) => {
                                      let val = e.target.value.replace(/[^0-9]/g, "");
                                      if (val.length > 4) val = val.substring(0, 4);
                                      if (val.length > 2) {
                                        val = val.substring(0, 2) + "/" + val.substring(2);
                                      }
                                      setCardExpiry(val);
                                    }}
                                    placeholder="MM/YY"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                                  />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">CVV</label>
                                  <input
                                    type="password"
                                    value={cardCvv}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/[^0-9]/g, "").substring(0, 3);
                                      setCardCvv(val);
                                    }}
                                    placeholder="•••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Card Holder Name</label>
                                <input
                                  type="text"
                                  value={cardHolder}
                                  onChange={(e) => setCardHolder(e.target.value)}
                                  placeholder="Cardholder Name"
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentMethod === "netbanking" && (
                          <div className="space-y-4 py-1">
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: "sbi", name: "State Bank of India", short: "SBI" },
                                { id: "hdfc", name: "HDFC Bank", short: "HDFC" },
                                { id: "icici", name: "ICICI Bank", short: "ICICI" },
                                { id: "axis", name: "Axis Bank", short: "Axis" },
                              ].map((bank) => (
                                <button
                                  key={bank.id}
                                  type="button"
                                  onClick={() => setSelectedBank(bank.name)}
                                  className={`p-3 rounded-xl border text-left flex flex-col justify-between h-14 transition-all ${selectedBank === bank.name
                                    ? "bg-amber-400/20 border-amber-400 text-white shadow-md"
                                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                                    }`}
                                >
                                  <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Popular Bank</span>
                                  <span className="text-xs font-black">{bank.short}</span>
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Other Banks</label>
                              <select
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                className="w-full bg-rose-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors"
                              >
                                <option value="">Select your bank</option>
                                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                                <option value="Punjab National Bank">Punjab National Bank</option>
                                <option value="Bank of Baroda">Bank of Baroda</option>
                                <option value="Yes Bank">Yes Bank</option>
                                <option value="IndusInd Bank">IndusInd Bank</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {paymentMethod === "cash" && (
                          <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center gap-2.5 text-amber-400 font-bold">
                              <Wallet size={18} />
                              <span className="text-xs">Pay at Counter / Cash on Delivery</span>
                            </div>
                            <p className="text-[11px] text-rose-200/80 leading-relaxed font-medium">
                              You can pay the bill amount of <strong className="text-white">₹{orderTotal}</strong> in cash at the counter (for Dine-in/Takeaway) or to our delivery rider upon receiving your order.
                            </p>
                            <div className="text-[9px] text-white/40 font-semibold tracking-wider uppercase">
                              Confirm your order below to finish.
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ) : order.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/40 gap-4">
                      <Utensils size={48} className="opacity-20" />
                      <p className="font-medium text-sm">
                        Your calculation is empty
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {order.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 relative group"
                        >
                          <div className="pr-4 flex-grow">
                            <div className="font-bold text-sm text-white mb-1">
                              {item.name}
                            </div>
                            <div className="text-amber-400 text-xs font-black flex items-center gap-2 mt-1">
                              <span>₹{item.price}</span>
                              <span className="text-white/20">|</span>
                              <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-lg">
                                <button
                                  onClick={() => updateQuantity(item.name, item.quantity - 1)}
                                  className="text-white/60 hover:text-white transition-colors px-1.5 cursor-pointer font-black text-xs"
                                >
                                  -
                                </button>
                                <span className="text-rose-100 font-bold text-xs px-1 select-none">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.name, item.quantity + 1)}
                                  className="text-white/60 hover:text-white transition-colors px-1.5 cursor-pointer font-black text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="font-black text-white">
                              ₹{item.price * item.quantity}
                            </div>
                            <button
                              onClick={() => removeFromOrder(item.name)}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase font-bold tracking-wider"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {order.length > 0 && (
                  <div className="pt-6 mt-4 border-t border-white/10 shrink-0">
                    {sidebarView !== "success" && (
                      <div className="flex justify-between items-center mb-6 px-2">
                        <span className="text-white/70 font-medium">
                          Total ({orderItemCount} items)
                        </span>
                        <span className="text-3xl font-black text-amber-400 leading-none">
                          ₹{orderTotal}
                        </span>
                      </div>
                    )}

                    {sidebarView === "success" ? (
                      <button
                        onClick={() => {
                          clearOrder();
                          setSidebarView("list");
                          setOrderSummaryOpen(false);
                        }}
                        className="w-full py-4.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-rose-950 font-black tracking-wide transition-colors shadow-[0_4px_15px_rgba(16,185,129,0.3)] text-center text-sm uppercase cursor-pointer"
                      >
                        Start New Order
                      </button>
                    ) : sidebarView === "checkout" ? (
                      <div className="flex gap-4">
                        <button
                          onClick={() => setSidebarView("list")}
                          className="flex-1 px-4 py-3.5 rounded-xl border border-white/20 text-white font-bold tracking-wide hover:bg-white/10 transition-colors text-sm cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleProceedToPayment}
                          className="flex-1 px-4 py-3.5 rounded-xl bg-amber-400 text-rose-950 font-black tracking-wide hover:bg-amber-300 transition-colors shadow-[0_4px_15px_rgba(163,230,53,0.3)] text-sm cursor-pointer"
                        >
                          Proceed to Pay
                        </button>
                      </div>
                    ) : sidebarView === "payment" ? (
                      paymentStatus === "pending" ? (
                        <div className="flex gap-4">
                          <button
                            onClick={() => {
                              setSidebarView("checkout");
                              setValidationError("");
                            }}
                            className="flex-1 px-4 py-3.5 rounded-xl border border-white/20 text-white font-bold tracking-wide hover:bg-white/10 transition-colors text-sm cursor-pointer"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleProcessPayment}
                            className="flex-1 px-4 py-3.5 rounded-xl bg-amber-400 text-rose-950 font-black tracking-wide hover:bg-amber-300 transition-colors shadow-[0_4px_15px_rgba(163,230,53,0.3)] text-sm cursor-pointer"
                          >
                            {paymentMethod === "cash" ? "Confirm Order" : "Pay Now"}
                          </button>
                        </div>
                      ) : null
                    ) : (
                      <div className="flex gap-4">
                        <button
                          onClick={clearOrder}
                          className="flex-1 px-4 py-3.5 rounded-xl border border-white/20 text-white font-bold tracking-wide hover:bg-white/10 transition-colors text-sm cursor-pointer"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setSidebarView("checkout")}
                          className="flex-1 px-4 py-3.5 rounded-xl bg-amber-400 text-rose-950 font-black tracking-wide hover:bg-amber-300 transition-colors shadow-[0_4px_15px_rgba(163,230,53,0.3)] text-sm cursor-pointer"
                        >
                          Proceed to Order
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* DISH DETAILS MODAL */}
        <AnimatePresence>
          {activeDetailDish && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
              onClick={() => setActiveDetailDish(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-rose-950/95 border border-amber-400/20 backdrop-blur-2xl p-6 md:p-8 rounded-[32px] w-full max-w-2xl shadow-2xl relative flex flex-col md:flex-row gap-8 text-left"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveDetailDish(null)}
                  className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-2 rounded-full cursor-pointer z-10 hover:rotate-90 duration-300"
                >
                  <X size={18} />
                </button>

                {/* Left Side: Large Image */}
                <div className="w-full md:w-1/2 relative h-64 md:h-80 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-md">
                  <img
                    src={activeDetailDish.item.image || getItemImage(activeDetailDish.item.name, activeDetailDish.category)}
                    alt={activeDetailDish.item.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Pure Veg Badge */}
                  <div className="absolute top-4 left-4 bg-emerald-950/90 backdrop-blur-md px-2.5 py-2.5 rounded-lg border border-emerald-500/30 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white mr-1.5"></div>
                    <span className="text-[9px] text-emerald-400 font-black tracking-wider uppercase">Veg</span>
                  </div>
                </div>

                {/* Right Side: Information & Actions */}
                <div className="flex flex-col justify-between flex-grow gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] text-rose-300/60 uppercase font-black tracking-widest">
                        100% Pure Veg &bull; {activeDetailDish.category}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase mt-1 leading-snug">
                        {activeDetailDish.item.name}
                      </h3>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 w-fit">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-white">4.8</span>
                      <span className="text-[10px] text-white/40 font-semibold">(120+ ratings)</span>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">About this dish</span>
                      <p className="text-sm text-white/70 font-medium leading-relaxed italic">
                        {activeDetailDish.item.desc || "Freshly prepared with handpicked ingredients, traditional spices, and cooked to perfection for a premium, aromatic, and rich flavor experience."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none">MRP</span>
                        <div className="text-3xl font-black text-emerald-400 mt-1 leading-none tracking-tight">
                          ₹{activeDetailDish.item.price}
                        </div>
                      </div>

                      {/* Quantity Selector inside Modal */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none">Quantity</span>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl mt-1">
                          <button
                            onClick={() => setDetailQuantity(q => Math.max(1, q - 1))}
                            className="text-white/60 hover:text-white transition-colors px-1 cursor-pointer font-black text-sm"
                          >
                            -
                          </button>
                          <span className="text-rose-100 font-bold text-sm px-1 select-none">
                            {detailQuantity}
                          </span>
                          <button
                            onClick={() => setDetailQuantity(q => q + 1)}
                            className="text-white/60 hover:text-white transition-colors px-1 cursor-pointer font-black text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addToOrder(activeDetailDish.item.name, activeDetailDish.item.price, detailQuantity);
                        setActiveDetailDish(null);
                      }}
                      className="bg-rose-500 hover:bg-rose-400 active:scale-95 text-white px-6 py-3 md:px-8 md:py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-500/25 w-full sm:w-auto justify-center"
                    >
                      <ShoppingBag size={16} /> Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TABLE RESERVATION SIDEBAR */}
        <AnimatePresence>
          {tableBookingOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => {
                  setTableBookingOpen(false);
                  setBookingSuccess(false);
                }}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 w-full max-w-sm h-full bg-rose-950 border-l border-white/10 z-[60] shadow-2xl flex flex-col pt-6 pb-8 px-6 overflow-hidden text-left"
              >
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4 shrink-0">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Calendar size={20} className="text-amber-400" /> Book Table
                  </h3>
                  <button
                    onClick={() => {
                      setTableBookingOpen(false);
                      setBookingSuccess(false);
                    }}
                    className="text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 relative px-2 pr-4 custom-scrollbar">
                  {bookingSuccess ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-10">
                      <motion.div
                        initial={{ scale: 0.5, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-2"
                      >
                        <CheckCircle2 size={40} />
                      </motion.div>
                      <h4 className="text-2xl font-black text-white">Confirmed!</h4>
                      <p className="text-rose-200/70 text-sm max-w-[280px]">
                        Your table reservation has been saved. We've opened WhatsApp to confirm with the restaurant.
                      </p>

                      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-2 text-left space-y-2 relative overflow-hidden">
                        <div className="text-[10px] text-amber-400 uppercase font-black tracking-widest">Reservation Details</div>
                        <div className="text-xs font-bold text-white">Booking ID: {bookingId}</div>
                        <div className="text-xs font-bold text-white">Name: {bookingName}</div>
                        <div className="text-xs font-bold text-white">Guests: {bookingGuests} Persons</div>
                        <div className="text-xs font-bold text-white">Date: {bookingDate} @ {bookingTime}</div>
                        <div className="text-xs font-bold text-white">Area: {bookingArea}</div>
                      </div>

                      <div className="w-full flex flex-col gap-2 mt-2">
                        <button
                          onClick={() => {
                            setActivePrintBooking({
                              id: bookingId,
                              customerName: bookingName.trim(),
                              customerPhone: bookingPhone.trim(),
                              bookingDate,
                              bookingTime,
                              guests: bookingGuests,
                              preferredArea: bookingArea,
                              paymentStatus: "confirmed",
                              date: new Date().toISOString()
                            });
                            setIsBookingReceiptOpen(true);
                          }}
                          className="bg-amber-400 hover:bg-amber-300 text-rose-950 font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl cursor-pointer w-full shadow-lg flex items-center justify-center gap-2"
                        >
                          <Printer size={14} /> Download / Print Receipt
                        </button>
                        <button
                          onClick={() => {
                            const msg = `*Table Reservation Confirmed!* 📅✨\n-----------------------------------------\n🆔 *Reservation ID:* ${bookingId}\n👤 *Name:* ${bookingName.trim()}\n📞 *Phone:* ${bookingPhone.trim()}\n👥 *Guests:* ${bookingGuests} Persons\n📅 *Date:* ${bookingDate}\n🕒 *Time:* ${bookingTime}\n📍 *Area:* ${bookingArea}\n-----------------------------------------\nThank you for choosing ${siteSettings.restaurantName}!`;
                            const waUrl = `https://wa.me/${siteSettings.whatsapp}?text=${encodeURIComponent(msg)}`;
                            try {
                              window.open(waUrl, "_blank");
                            } catch (e) {
                              console.warn("WhatsApp popup blocked:", e);
                            }
                          }}
                          className="bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl cursor-pointer w-full shadow-lg"
                        >
                          Resend Receipt on WhatsApp
                        </button>
                        <button
                          onClick={() => {
                            setTableBookingOpen(false);
                            setBookingSuccess(false);
                          }}
                          className="border border-white/10 text-rose-100/60 hover:text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl cursor-pointer w-full transition-colors"
                        >
                          Back to Home
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBookTable} className="space-y-6 text-left">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Full Name *</label>
                        <input
                          type="text"
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          placeholder="e.g. Jayshree Krishna"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Mobile Number *</label>
                        <input
                          type="tel"
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Booking Date *</label>
                          <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Booking Time *</label>
                          <input
                            type="time"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Number of Guests</label>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={bookingGuests}
                            onChange={(e) => setBookingGuests(parseInt(e.target.value) || 1)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Select Area</label>
                          <select
                            value={bookingArea}
                            onChange={(e) => setBookingArea(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                          >
                            <option value="Main Dine-in" className="bg-rose-950">Main Dine-in</option>
                            <option value="Rooftop" className="bg-rose-950">Rooftop Sky Lounge</option>
                            <option value="Family Hall" className="bg-rose-950">Family Banquet</option>
                            <option value="Garden" className="bg-rose-950">Imperial Garden</option>
                          </select>
                        </div>
                      </div>

                      {bookingValidationError && (
                        <div className="text-red-400 text-xs font-bold bg-red-400/10 border border-red-400/20 px-4 py-2.5 rounded-xl">
                          ⚠️ {bookingValidationError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="bg-amber-400 text-rose-950 hover:bg-amber-300 font-black text-xs uppercase tracking-wider py-4 rounded-xl cursor-pointer w-full shadow-lg shadow-amber-400/10 mt-6"
                      >
                        Confirm Reservation &amp; Open WhatsApp
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ROOM RESERVATION SIDEBAR */}
        <AnimatePresence>
          {roomBookingOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => {
                  setRoomBookingOpen(false);
                  setRoomBookingSuccess(false);
                }}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 w-full max-w-sm h-full bg-rose-950 border-l border-white/10 z-[60] shadow-2xl flex flex-col pt-6 pb-8 px-6 overflow-hidden text-left"
              >
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4 shrink-0">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Building size={20} className="text-amber-400" /> Book Room
                  </h3>
                  <button
                    onClick={() => {
                      setRoomBookingOpen(false);
                      setRoomBookingSuccess(false);
                    }}
                    className="text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 relative px-2 pr-4 custom-scrollbar">
                  {roomBookingSuccess ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-10">
                      <motion.div
                        initial={{ scale: 0.5, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-2"
                      >
                        <CheckCircle2 size={40} />
                      </motion.div>
                      <h4 className="text-2xl font-black text-white">Stay Booked!</h4>
                      <p className="text-rose-200/70 text-sm max-w-[280px]">
                        Your room stay booking has been successfully recorded.
                      </p>

                      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-2 text-left space-y-2 relative overflow-hidden">
                        <div className="text-[10px] text-amber-400 uppercase font-black tracking-widest">Reservation Details</div>
                        <div className="text-xs font-bold text-white">Booking ID: {roomBookingId}</div>
                        <div className="text-xs font-bold text-white">Name: {roomBookingName}</div>
                        <div className="text-xs font-bold text-white">Room Type: {selectedRoomType}</div>
                        <div className="text-xs font-bold text-white">Rooms Count: {roomCount} Room(s)</div>
                        <div className="text-xs font-bold text-white">Check-in: {roomCheckIn}</div>
                        <div className="text-xs font-bold text-white">Check-out: {roomCheckOut}</div>
                      </div>

                      <div className="w-full flex flex-col gap-2 mt-2">
                        <button
                          onClick={() => {
                            const checkInDate = new Date(roomCheckIn);
                            const checkOutDate = new Date(roomCheckOut);
                            const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                            const foundRoom = rooms.find(r => r.name === selectedRoomType || r.id === selectedRoomType);
                            const roomPrice = foundRoom ? foundRoom.price : 2600;

                            const totalCost = diffDays * roomCount * roomPrice;

                            setActivePrintRoomBooking({
                              id: roomBookingId,
                              customerName: roomBookingName.trim(),
                              customerPhone: roomBookingPhone.trim(),
                              roomType: selectedRoomType,
                              checkIn: roomCheckIn,
                              checkOut: roomCheckOut,
                              guestsAdults: roomGuestsAdults,
                              guestsChildren: roomGuestsChildren,
                              roomCount,
                              total: totalCost,
                              paymentStatus: "confirmed",
                              date: new Date().toISOString()
                            });
                            setIsRoomReceiptOpen(true);
                          }}
                          className="bg-amber-400 hover:bg-amber-300 text-rose-950 font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl cursor-pointer w-full shadow-lg flex items-center justify-center gap-2"
                        >
                          <Printer size={14} /> Download / Print Stay Pass
                        </button>

                        <button
                          onClick={() => {
                            const checkInDate = new Date(roomCheckIn);
                            const checkOutDate = new Date(roomCheckOut);
                            const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                            const foundRoom = rooms.find(r => r.name === selectedRoomType || r.id === selectedRoomType);
                            const roomPrice = foundRoom ? foundRoom.price : 2600;
                            const totalCost = diffDays * roomCount * roomPrice;

                            const msg = `*Room Reservation Confirmed!* 🏨🛎️\n-----------------------------------------\n🆔 *Booking ID:* ${roomBookingId}\n👤 *Name:* ${roomBookingName.trim()}\n📞 *Phone:* ${roomBookingPhone.trim()}\n🛌 *Room Type:* ${selectedRoomType}\n🔢 *Rooms Count:* ${roomCount} Room(s)\n📅 *Check-in:* ${roomCheckIn}\n📅 *Check-out:* ${roomCheckOut}\n👥 *Occupancy:* ${roomGuestsAdults} Adults + ${roomGuestsChildren} Children\n💰 *Total Price:* ₹${totalCost}\n-----------------------------------------\nThank you for choosing ${siteSettings.restaurantName}!`;
                            const waUrl = `https://wa.me/${siteSettings.whatsapp}?text=${encodeURIComponent(msg)}`;
                            try {
                              window.open(waUrl, "_blank");
                            } catch (e) {
                              console.warn("WhatsApp popup blocked:", e);
                            }
                          }}
                          className="bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl cursor-pointer w-full shadow-lg"
                        >
                          Resend on WhatsApp
                        </button>
                        <button
                          onClick={() => {
                            setRoomBookingOpen(false);
                            setRoomBookingSuccess(false);
                          }}
                          className="border border-white/10 text-rose-100/60 hover:text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl cursor-pointer w-full transition-colors"
                        >
                          Back to Home
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBookRoom} className="space-y-6 text-left">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Full Name *</label>
                        <input
                          type="text"
                          value={roomBookingName}
                          onChange={(e) => setRoomBookingName(e.target.value)}
                          placeholder="e.g. Jayshree Krishna"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Mobile Number *</label>
                        <input
                          type="tel"
                          value={roomBookingPhone}
                          onChange={(e) => setRoomBookingPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Selected Room Type</label>
                        <select
                          value={selectedRoomType}
                          onChange={(e) => setSelectedRoomType(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                        >
                          <option value="Kings Deluxe Room" className="bg-rose-950">Kings Deluxe Room (₹2,600/night)</option>
                          <option value="Kings Superior Room" className="bg-rose-950">Kings Superior Room (₹3,200/night)</option>
                          <option value="Kings Executive Suite" className="bg-rose-950">Kings Executive Suite (₹4,500/night)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Check-in Date *</label>
                          <input
                            type="date"
                            value={roomCheckIn}
                            onChange={(e) => setRoomCheckIn(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Check-out Date *</label>
                          <input
                            type="date"
                            value={roomCheckOut}
                            onChange={(e) => setRoomCheckOut(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Rooms</label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={roomCount}
                            onChange={(e) => setRoomCount(parseInt(e.target.value) || 1)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Adults</label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={roomGuestsAdults}
                            onChange={(e) => setRoomGuestsAdults(parseInt(e.target.value) || 1)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-white/40 font-black uppercase tracking-widest">Children</label>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={roomGuestsChildren}
                            onChange={(e) => setRoomGuestsChildren(parseInt(e.target.value) || 0)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                          />
                        </div>
                      </div>

                      {roomBookingValidationError && (
                        <div className="text-red-400 text-xs font-bold bg-red-400/10 border border-red-400/20 px-4 py-2.5 rounded-xl">
                          ⚠️ {roomBookingValidationError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="bg-amber-400 text-rose-950 hover:bg-amber-300 font-black text-xs uppercase tracking-wider py-4 rounded-xl cursor-pointer w-full shadow-lg shadow-amber-400/10 mt-6"
                      >
                        Confirm Stay Reservation
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* PRINTABLE INVOICE PORTAL */}
        {isInvoiceOpen && createPortal(
          (() => {
            const printData = activePrintOrder || {
              id: orderId,
              customerName,
              customerPhone,
              orderType,
              tableNumber,
              deliveryAddress,
              total: orderTotal,
              paymentMethod,
              items: order,
              date: new Date().toISOString()
            };

            const gstEnabled = siteSettings.gstSettings?.enabled ?? true;
            const gstInclusive = siteSettings.gstSettings?.inclusive ?? false;
            const cgstRate = siteSettings.gstSettings?.cgstRate ?? 2.5;
            const sgstRate = siteSettings.gstSettings?.sgstRate ?? 2.5;
            const totalGstRate = cgstRate + sgstRate;

            let subtotal = printData.total;
            let cgstAmount = 0;
            let sgstAmount = 0;
            let grandTotal = printData.total;

            if (gstEnabled) {
              if (gstInclusive) {
                subtotal = Number((printData.total / (1 + totalGstRate / 100)).toFixed(2));
                const totalGst = Number((printData.total - subtotal).toFixed(2));
                cgstAmount = Number((totalGst * (cgstRate / totalGstRate)).toFixed(2));
                sgstAmount = Number((totalGst - cgstAmount).toFixed(2));
              } else {
                cgstAmount = Number((printData.total * (cgstRate / 100)).toFixed(2));
                sgstAmount = Number((printData.total * (sgstRate / 100)).toFixed(2));
                grandTotal = Number((printData.total + cgstAmount + sgstAmount).toFixed(2));
              }
            }

            return (
              <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:backdrop-blur-none text-left">
                <div id="printable-invoice-modal-root" className="bg-white text-slate-800 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative border border-slate-200 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:p-0 flex flex-col gap-6">

                  {/* Rubber Stamp Graphic */}
                  <div className={`absolute right-6 top-6 md:right-10 md:top-10 border-4 ${printData.paymentMethod === 'cash' ? 'border-rose-500 text-rose-500' : printData.paymentMethod === 'cash-on-delivery' ? 'border-orange-500 text-orange-500' : 'border-emerald-500 text-emerald-500'} border-double rounded-xl px-4 py-1.5 text-xs font-black tracking-widest uppercase transform rotate-[-12deg] select-none pointer-events-none opacity-85 print:opacity-100 flex flex-col items-center leading-none z-10`}>
                    <span className="text-sm">{printData.paymentMethod === 'cash' ? 'CASH ORDER' : printData.paymentMethod === 'cash-on-delivery' ? 'PAY ON DELIVERY' : 'PAID'}</span>
                    <span className="text-[7px] font-mono mt-1 tracking-normal">
                      {printData.paymentMethod === 'cash' ? 'PAY AT COUNTER' : printData.paymentMethod === 'cash-on-delivery' ? 'PENDING PAYMENT' : `TXN: ${printData.id.replace('HKI-', '')}87X`}
                    </span>
                  </div>

                  {/* Close Button (Hide in Print) */}
                  <button
                    onClick={() => {
                      setIsInvoiceOpen(false);
                      setActivePrintOrder(null);
                    }}
                    className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-1.5 rounded-full print:hidden z-20 cursor-pointer"
                    title="Close"
                  >
                    <X size={16} />
                  </button>

                  {/* Header Section */}
                  <div className="text-center space-y-2 pt-6 print:pt-0">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center shadow-md overflow-hidden print:border print:border-slate-300">
                        <img src={logo} alt="Logo" className="w-full h-full object-cover scale-110" />
                      </div>
                      <h2 className="text-xl font-black tracking-tight text-rose-950 font-serif">{siteSettings.restaurantName.toUpperCase()}</h2>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-none">
                      {siteSettings.address}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium leading-none">
                      Phone: {siteSettings.phone} | WhatsApp: +{siteSettings.whatsapp}
                    </p>
                    <div className="border-t border-b border-dashed border-slate-300 py-1 text-xs font-bold uppercase tracking-wider text-rose-950">
                      Tax Invoice / Receipt
                    </div>
                    {gstEnabled && siteSettings.gstSettings?.gstin && (
                      <p className="text-[9px] text-slate-500 font-bold font-mono tracking-wider leading-none mt-1">
                        GSTIN: {siteSettings.gstSettings.gstin}
                      </p>
                    )}
                  </div>

                  {/* Invoice Meta Section */}
                  <div className="grid grid-cols-2 gap-y-2 text-xs border-b border-slate-200 pb-4">
                    <div>
                      <span className="text-slate-400 font-semibold block">Order ID</span>
                      <strong className="text-slate-800 font-bold">{printData.id}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 font-semibold block">Date &amp; Time</span>
                      <strong className="text-slate-800 font-bold">{new Date(printData.date).toLocaleString("en-IN")}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Customer Details</span>
                      <strong className="text-slate-800 font-bold uppercase">{printData.customerName}</strong>
                      <span className="text-slate-500 block text-[10px]">{printData.customerPhone}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 font-semibold block">Order Type</span>
                      <strong className="text-slate-800 font-bold capitalize">
                        {printData.orderType === "dine-in" ? `Dine-in (Table ${printData.tableNumber || "Not Specified"}${printData.dineInDate ? ` on ${printData.dineInDate} @ ${printData.dineInTime}` : ""})` : printData.orderType === "delivery" ? "Home Delivery" : "Takeaway"}
                      </strong>
                    </div>
                    {printData.orderType === "delivery" && (
                      <div className="col-span-2 pt-1">
                        <span className="text-slate-400 font-semibold block">Delivery Address</span>
                        <p className="text-slate-600 text-[10px] leading-relaxed font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 text-left">
                          {printData.deliveryAddress}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Table Content */}
                  <div className="flex-1 overflow-x-auto min-h-0">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold">
                          <th className="py-2">Item Name</th>
                          <th className="py-2 text-center">Qty</th>
                          <th className="py-2 text-right">Price</th>
                          <th className="py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printData.items.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-100 font-medium text-slate-700">
                            <td className="py-2.5 font-bold uppercase">{item.name}</td>
                            <td className="py-2.5 text-center">{item.quantity}</td>
                            <td className="py-2.5 text-right">₹{item.price}</td>
                            <td className="py-2.5 text-right font-bold">₹{item.price * item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total section */}
                  <div className="border-t border-slate-200 pt-4 space-y-1.5 text-xs font-semibold">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal {gstEnabled && gstInclusive && "(GST Incl.)"}</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {gstEnabled ? (
                      <>
                        <div className="flex justify-between text-slate-500">
                          <span>CGST ({cgstRate}%)</span>
                          <span>₹{cgstAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>SGST ({sgstRate}%)</span>
                          <span>₹{sgstAmount.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-slate-500">
                        <span>Taxes (GST 0%)</span>
                        <span>₹0.00</span>
                      </div>
                    )}
                    <div className="flex justify-between text-rose-950 font-black text-sm border-t border-slate-100 pt-2">
                      <span>Grand Total</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                      <span>Payment Method</span>
                      <span className="text-rose-900">{printData.paymentMethod === "cash" ? "Cash (Pay at Counter)" : printData.paymentMethod === "cash-on-delivery" ? "Cash on Delivery" : `Online via ${printData.paymentMethod.toUpperCase()}`}</span>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="text-center space-y-1 border-t border-dashed border-slate-200 pt-4 text-[10px] text-slate-400 font-medium">
                    <p className="font-bold text-rose-950 font-serif text-xs">Thank you for ordering!</p>
                    <p>Visit again: {siteSettings.restaurantName}</p>
                  </div>

                  {/* Print Button (Hide in Print) */}
                  <div className="flex gap-3 mt-2 print:hidden shrink-0">
                    <button
                      onClick={() => {
                        setIsInvoiceOpen(false);
                        setActivePrintOrder(null);
                      }}
                      className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex-grow-[2] py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer size={16} />
                      Print Receipt / Bill
                    </button>
                  </div>

                </div>
              </div>
            );
          })(),
          document.body
        )}

        {/* PRINTABLE BOOKING RECEIPT PORTAL */}
        {isBookingReceiptOpen && createPortal(
          (() => {
            const printData = activePrintBooking || {
              id: bookingId,
              customerName: bookingName,
              customerPhone: bookingPhone,
              bookingDate,
              bookingTime,
              guests: bookingGuests,
              preferredArea: bookingArea,
              paymentStatus: "confirmed",
              date: new Date().toISOString()
            };
            return (
              <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:backdrop-blur-none text-left text-slate-800">
                <div id="printable-booking-receipt-modal-root" className="bg-white text-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl relative border border-slate-200 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:p-0 flex flex-col gap-6">

                  {/* Double-bordered Confirmed Rubber Stamp */}
                  <div className="absolute right-6 top-6 md:right-10 md:top-10 border-4 border-emerald-500 text-emerald-500 border-double rounded-xl px-4 py-1.5 text-xs font-black tracking-widest uppercase transform rotate-[-12deg] select-none pointer-events-none opacity-85 print:opacity-100 flex flex-col items-center leading-none z-10">
                    <span className="text-sm">CONFIRMED</span>
                    <span className="text-[7px] font-mono mt-1 tracking-normal">
                      TABLE RESERVATION
                    </span>
                  </div>

                  {/* Close Button (Hide in Print) */}
                  <button
                    onClick={() => {
                      setIsBookingReceiptOpen(false);
                      setActivePrintBooking(null);
                    }}
                    className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-1.5 rounded-full print:hidden z-20 cursor-pointer"
                    title="Close"
                  >
                    <X size={16} />
                  </button>

                  {/* Header Section */}
                  <div className="text-center space-y-2 pt-6 print:pt-0">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center shadow-md overflow-hidden print:border print:border-slate-300">
                        <img src={logo} alt="Logo" className="w-full h-full object-cover scale-110" />
                      </div>
                      <h2 className="text-xl font-black tracking-tight text-rose-950 font-serif">{siteSettings.restaurantName.toUpperCase()}</h2>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-none">
                      {siteSettings.address}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium leading-none">
                      Phone: {siteSettings.phone} | WhatsApp: +{siteSettings.whatsapp}
                    </p>
                    <div className="border-t border-b border-dashed border-slate-300 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-950 mt-2">
                      Table Seating Pass / Receipt
                    </div>
                  </div>

                  {/* Receipt Details Box */}
                  <div className="space-y-4 border-b border-slate-200 pb-5">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                      <div className="col-span-2 pb-1 border-b border-slate-200/60 flex justify-between items-center">
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Reservation ID</span>
                          <strong className="text-rose-950 font-extrabold text-sm font-mono">{printData.id || printData.bookingId}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Status</span>
                          <span className="text-emerald-600 font-black text-xs uppercase tracking-wider">● {printData.paymentStatus || 'confirmed'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">Guest Name</span>
                        <strong className="text-slate-800 font-bold uppercase truncate block">{printData.customerName}</strong>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">Contact Number</span>
                        <strong className="text-slate-800 font-bold block">{printData.customerPhone}</strong>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">Reserved Date</span>
                        <strong className="text-amber-600 font-extrabold block">{printData.bookingDate}</strong>
                      </div>

                      <div className="text-right pt-2 border-t border-slate-100">
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">Seating Time</span>
                        <strong className="text-amber-600 font-extrabold block">{printData.bookingTime}</strong>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">No. of Guests</span>
                        <strong className="text-rose-900 font-extrabold block">{printData.guests} Persons</strong>
                      </div>

                      <div className="text-right pt-2 border-t border-slate-100">
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">Preferred Area</span>
                        <strong className="text-rose-900 font-extrabold block capitalize">{printData.preferredArea || printData.bookingArea}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Simulated barcode / QR graphics */}
                  <div className="flex flex-col items-center justify-center space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60">
                    <div className="flex items-center gap-1.5 justify-center opacity-70">
                      <div className="flex items-end h-8 gap-[1px]">
                        {[1, 2, 4, 1, 3, 1, 2, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 4, 2].map((w, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-800"
                            style={{
                              width: `${w}px`,
                              height: idx % 3 === 0 ? '100%' : '85%',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 tracking-[0.25em]">{printData.id || printData.bookingId}</span>
                  </div>

                  {/* Guidelines */}
                  <div className="text-left space-y-1.5 bg-rose-50/55 border border-rose-100 rounded-2xl p-4 text-[10px] text-rose-900 leading-relaxed font-medium">
                    <p className="font-bold text-rose-950 text-xs uppercase tracking-wider mb-1">Reservation Policy</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Please present this digital receipt or seating pass at the front desk upon arrival.</li>
                      <li>Your table will be held for a maximum of <strong>15 minutes</strong> past the scheduled booking time.</li>
                      <li>Please contact us if you are running late or wish to cancel or modify your reservation.</li>
                    </ul>
                  </div>

                  {/* Footer */}
                  <div className="text-center space-y-1 border-t border-dashed border-slate-200 pt-4 text-[10px] text-slate-400 font-medium">
                    <p className="font-bold text-rose-950 font-serif text-xs">Thank you for dining with us!</p>
                    <p>Visit again: {siteSettings.restaurantName}</p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-2 print:hidden shrink-0">
                    <button
                      onClick={() => {
                        setIsBookingReceiptOpen(false);
                        setActivePrintBooking(null);
                      }}
                      className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex-grow-[2] py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer size={16} />
                      Print / Save PDF
                    </button>
                  </div>

                </div>
              </div>
            );
          })(),
          document.body
        )}

        {/* PRINTABLE ROOM RESERVATION RECEIPT / STAY PASS PORTAL */}
        {isRoomReceiptOpen && createPortal(
          (() => {
            const printData = activePrintRoomBooking || {
              id: roomBookingId,
              customerName: roomBookingName,
              customerPhone: roomBookingPhone,
              roomType: selectedRoomType,
              checkIn: roomCheckIn,
              checkOut: roomCheckOut,
              guestsAdults: roomGuestsAdults,
              guestsChildren: roomGuestsChildren,
              roomCount,
              total: 0,
              paymentStatus: "confirmed",
              date: new Date().toISOString()
            };

            const checkInDate = new Date(printData.checkIn);
            const checkOutDate = new Date(printData.checkOut);
            const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            const foundRoom = rooms.find(r => r.name === printData.roomType || r.id === printData.roomType);
            const roomPrice = foundRoom ? foundRoom.price : 2600;

            const bookingTotal = printData.total || (diffDays * printData.roomCount * roomPrice);

            // Dynamic rubber stamp based on status
            let stampText = "CONFIRMED";
            let stampSub = "ROOM RESERVATION";
            let stampColorClass = "border-emerald-500 text-emerald-500";

            const normalizedStatus = (printData.paymentStatus || printData.status || "confirmed").toLowerCase();
            if (normalizedStatus === "checked-in" || normalizedStatus === "checked_in") {
              stampText = "CHECKED IN";
              stampSub = "STAY ACTIVE";
              stampColorClass = "border-blue-500 text-blue-500";
            } else if (normalizedStatus === "checked-out" || normalizedStatus === "checked_out") {
              stampText = "CHECKED OUT";
              stampSub = "STAY COMPLETED";
              stampColorClass = "border-indigo-500 text-indigo-500";
            } else if (normalizedStatus === "cancelled" || normalizedStatus === "canceled") {
              stampText = "CANCELLED";
              stampSub = "STAY VOIDED";
              stampColorClass = "border-rose-500 text-rose-500";
            }

            return (
              <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:backdrop-blur-none text-left text-slate-800">
                <div id="printable-room-receipt-modal-root" className="bg-white text-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl relative border border-slate-200 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:p-0 flex flex-col gap-6">

                  {/* Double-bordered Confirmed Rubber Stamp */}
                  <div className={`absolute right-6 top-6 md:right-10 md:top-10 border-4 ${stampColorClass} border-double rounded-xl px-4 py-1.5 text-xs font-black tracking-widest uppercase transform rotate-[-12deg] select-none pointer-events-none opacity-85 print:opacity-100 flex flex-col items-center leading-none z-10`}>
                    <span className="text-sm font-black">{stampText}</span>
                    <span className="text-[7px] font-mono mt-1 tracking-normal font-black">
                      {stampSub}
                    </span>
                  </div>

                  {/* Close Button (Hide in Print) */}
                  <button
                    onClick={() => {
                      setIsRoomReceiptOpen(false);
                      setActivePrintRoomBooking(null);
                    }}
                    className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-1.5 rounded-full print:hidden z-20 cursor-pointer"
                    title="Close"
                  >
                    <X size={16} />
                  </button>

                  {/* Header Section */}
                  <div className="text-center space-y-2 pt-6 print:pt-0">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center shadow-md overflow-hidden print:border print:border-slate-300">
                        <img src={logo} alt="Logo" className="w-full h-full object-cover scale-110" />
                      </div>
                      <h2 className="text-xl font-black tracking-tight text-rose-950 font-serif">{siteSettings.restaurantName.toUpperCase()}</h2>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-none">
                      {siteSettings.address}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium leading-none">
                      Phone: {siteSettings.phone} | WhatsApp: +{siteSettings.whatsapp}
                    </p>
                    <div className="border-t border-b border-dashed border-slate-300 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-950 mt-2">
                      Stay Pass & Reservation Receipt
                    </div>
                  </div>

                  {/* Receipt Details Box */}
                  <div className="space-y-4 border-b border-slate-200 pb-5">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                      <div className="col-span-2 pb-1 border-b border-slate-200/60 flex justify-between items-center">
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Stay Pass ID</span>
                          <strong className="text-rose-950 font-extrabold text-sm font-mono">{printData.id || printData.bookingId}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Status</span>
                          <span className={`font-black text-xs uppercase tracking-wider ${normalizedStatus === "cancelled" || normalizedStatus === "canceled" ? "text-rose-600" :
                            normalizedStatus === "checked-out" || normalizedStatus === "checked_out" ? "text-indigo-600" :
                              normalizedStatus === "checked-in" || normalizedStatus === "checked_in" ? "text-blue-600" : "text-emerald-600"
                            }`}>● {normalizedStatus}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">Primary Guest</span>
                        <strong className="text-slate-800 font-bold uppercase truncate block">{printData.customerName}</strong>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">Contact Number</span>
                        <strong className="text-slate-800 font-bold block">{printData.customerPhone}</strong>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">Check-In Date</span>
                        <strong className="text-rose-950 font-extrabold block">{printData.checkIn}</strong>
                        <span className="text-[9.5px] text-slate-400 font-bold">Standard 12:00 PM</span>
                      </div>

                      <div className="text-right pt-2 border-t border-slate-100">
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">Check-Out Date</span>
                        <strong className="text-rose-950 font-extrabold block">{printData.checkOut}</strong>
                        <span className="text-[9.5px] text-slate-400 font-bold">Standard 11:00 AM</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">Room Category</span>
                        <strong className="text-amber-600 font-extrabold block">{printData.roomType}</strong>
                      </div>

                      <div className="text-right pt-2 border-t border-slate-100">
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">Quantity & Nights</span>
                        <strong className="text-amber-600 font-extrabold block">
                          {printData.roomCount} Room(s) × {diffDays} Night(s)
                        </strong>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">Total Guests</span>
                        <strong className="text-slate-800 font-bold block">
                          {printData.guestsAdults} Adult(s) {printData.guestsChildren > 0 ? `+ ${printData.guestsChildren} Child` : ""}
                        </strong>
                      </div>

                      <div className="text-right pt-2 border-t border-slate-100">
                        <span className="text-slate-400 font-semibold block text-[9px] uppercase">Total Price Paid</span>
                        <strong className="text-rose-900 font-extrabold text-sm block">₹{bookingTotal}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Simulated barcode / QR graphics */}
                  <div className="flex flex-col items-center justify-center space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60">
                    <div className="flex items-center gap-1.5 justify-center opacity-70">
                      <div className="flex items-end h-8 gap-[1px]">
                        {[1, 2, 4, 1, 3, 1, 2, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 4, 2].map((w, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-800"
                            style={{
                              width: `${w}px`,
                              height: idx % 3 === 0 ? '100%' : '85%',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 tracking-[0.25em]">{printData.id || printData.bookingId}</span>
                  </div>

                  {/* Stay Guidelines */}
                  <div className="text-left space-y-1.5 bg-rose-50/55 border border-rose-100 rounded-2xl p-4 text-[10px] text-rose-900 leading-relaxed font-medium">
                    <p className="font-bold text-rose-950 text-xs uppercase tracking-wider mb-1">Stay Policy & Guidelines</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>A valid government photo ID is mandatory for all guests upon check-in.</li>
                      <li>Standard check-in is <strong>12:00 PM</strong>, check-out is <strong>11:00 AM</strong>.</li>
                      <li>Early check-in or late check-out is subject to availability and charges may apply.</li>
                      <li>For cancellations, modifications, or support, call our front desk directly.</li>
                    </ul>
                  </div>

                  {/* Footer */}
                  <div className="text-center space-y-1 border-t border-dashed border-slate-200 pt-4 text-[10px] text-slate-400 font-medium">
                    <p className="font-bold text-rose-950 font-serif text-xs">Have a Pleasant Stay at King's Imperial!</p>
                    <p>Powered by: {siteSettings.restaurantName}</p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-2 print:hidden shrink-0">
                    <button
                      onClick={() => {
                        setIsRoomReceiptOpen(false);
                        setActivePrintRoomBooking(null);
                      }}
                      className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex-grow-[2] py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer size={16} />
                      Print / Save Stay Pass
                    </button>
                  </div>

                </div>
              </div>
            );
          })(),
          document.body
        )}

        {/* ROOM DETAILS & GALLERY MODAL (MakeMyTrip Style) */}
        {selectedDetailRoom && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto text-left text-slate-800 animate-fadeIn">
            <div className="bg-rose-950 border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row text-rose-50 my-8">

              {/* Close Button */}
              <button
                onClick={() => setSelectedDetailRoom(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-black/40 hover:bg-black/60 p-2 rounded-full z-30 cursor-pointer shadow-lg border border-white/10"
                title="Close Details"
              >
                <X size={18} />
              </button>

              {/* Left Column: Interactive Image Gallery */}
              <div className="md:w-1/2 flex flex-col bg-rose-950/20 border-r border-white/5">
                {/* Main Active Image Display */}
                <div className="h-64 sm:h-80 md:h-[400px] w-full overflow-hidden relative group">
                  <img
                    src={selectedDetailRoom.images?.[detailActiveImageIdx] || selectedDetailRoom.image}
                    alt={selectedDetailRoom.name}
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-950/80 via-transparent to-black/25"></div>

                  {/* Left/Right Slideshow Navigation Arrows */}
                  {selectedDetailRoom.images && selectedDetailRoom.images.filter(Boolean).length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const count = selectedDetailRoom.images.filter(Boolean).length;
                          setDetailActiveImageIdx(prev => (prev - 1 + count) % count);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white cursor-pointer border border-white/5 hover:scale-105 transition-all"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const count = selectedDetailRoom.images.filter(Boolean).length;
                          setDetailActiveImageIdx(prev => (prev + 1) % count);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white cursor-pointer border border-white/5 hover:scale-105 transition-all"
                      >
                        <div className="rotate-180 flex items-center justify-center">
                          <ChevronLeft size={18} />
                        </div>
                      </button>
                    </>
                  )}

                  {/* Photo Count tag */}
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-white/10">
                    📷 Photo {detailActiveImageIdx + 1} of {selectedDetailRoom.images?.filter(Boolean).length || 1}
                  </div>
                </div>

                {/* Thumbnails list */}
                {selectedDetailRoom.images && selectedDetailRoom.images.filter(Boolean).length > 1 && (
                  <div className="p-4 bg-rose-950/45 flex gap-2.5 overflow-x-auto custom-scrollbar">
                    {selectedDetailRoom.images.filter(Boolean).map((imgUrl: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setDetailActiveImageIdx(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${detailActiveImageIdx === idx ? "border-amber-400 scale-105 shadow-md" : "border-white/10 opacity-60 hover:opacity-100 cursor-pointer"}`}
                      >
                        <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Room Details & Actions */}
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between gap-6 max-h-[500px] md:max-h-[500px] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase block mb-1">MakeMyTrip Verified Luxury</span>
                    <h3 className="text-2xl font-black font-serif text-white tracking-tight leading-tight">{selectedDetailRoom.name}</h3>
                    <div className="text-xl font-extrabold text-amber-400 mt-2 font-mono">
                      ₹{selectedDetailRoom.price} <span className="text-xs text-rose-200/50 font-sans font-bold">/ Night (Excl. taxes)</span>
                    </div>
                  </div>

                  <p className="text-xs text-rose-200/70 leading-relaxed font-medium">
                    {selectedDetailRoom.description}
                  </p>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <div className="bg-white/3 border border-white/5 p-3 rounded-2xl">
                      <span className="text-[8px] text-rose-200/40 uppercase font-black block tracking-wider">Room Area</span>
                      <strong className="text-xs text-white font-black">📐 {selectedDetailRoom.size}</strong>
                    </div>
                    <div className="bg-white/3 border border-white/5 p-3 rounded-2xl">
                      <span className="text-[8px] text-rose-200/40 uppercase font-black block tracking-wider">Bedding Layout</span>
                      <strong className="text-xs text-white font-black">🛏️ {selectedDetailRoom.bed}</strong>
                    </div>
                    <div className="bg-white/3 border border-white/5 p-3 rounded-2xl col-span-2">
                      <span className="text-[8px] text-rose-200/40 uppercase font-black block tracking-wider">Standard Occupancy</span>
                      <strong className="text-xs text-white font-black">👥 {selectedDetailRoom.guests}</strong>
                    </div>
                  </div>

                  {/* Full Amenities list */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] text-rose-200/40 uppercase font-black tracking-widest block">Available Room Amenities</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedDetailRoom.amenities?.map((amenity: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-white/5 border border-white/15 text-[9px] px-3 py-1 rounded-xl text-rose-200 font-bold flex items-center gap-1 shadow-sm"
                        >
                          ✔ {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-white/10 shrink-0">
                  <button
                    onClick={() => setSelectedDetailRoom(null)}
                    className="flex-1 py-3.5 border border-white/20 hover:bg-white/5 rounded-2xl text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRoomType(selectedDetailRoom.name);
                      setSelectedDetailRoom(null);
                      setRoomBookingOpen(true);
                    }}
                    className="flex-[2] bg-amber-400 hover:bg-amber-300 text-rose-950 font-black text-xs uppercase tracking-widest py-3.5 rounded-2xl transition-all duration-300 shadow-lg cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    Book Stay Now
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Real-time SMS Simulation Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 15 }}
              className="fixed top-6 right-6 z-[99999] max-w-sm w-full bg-slate-900/90 backdrop-blur-xl border border-white/20 text-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex gap-3.5 select-none cursor-pointer"
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
            >
              <div className="w-10 h-10 bg-amber-400 text-rose-950 rounded-full flex items-center justify-center shrink-0 shadow-lg text-lg font-bold">
                💬
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black tracking-wide uppercase text-amber-400">
                    {notification.title}
                  </span>
                  <span className="text-[9px] text-white/30 font-bold">Now</span>
                </div>
                <p className="text-xs font-bold text-white/90 leading-normal">
                  {notification.message}
                </p>
                <div className="mt-2 text-[9px] text-amber-400/60 font-black uppercase tracking-wider">
                  Touch to close
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Assistant Chatbot */}
        <AIAssistant menu={menu} rooms={rooms} siteSettings={siteSettings} />
      </div>
    </>
  );
}
