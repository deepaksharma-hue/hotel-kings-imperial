<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

A **premium, modern restaurant and hotel website** built with React + TypeScript + Vite. Features a fully functional admin panel, real-time Firebase database sync, AI-powered chatbot, table bookings, online orders, and a stunning glassmorphic UI.

---

## ✨ Features

- 🍽️ **Live Menu Management** — Admin can add, edit, delete dishes with photos and prices in real-time
- 🛒 **Online Food Ordering** — Customers can browse, add to cart, and place orders (Dine-in / Takeaway / Delivery)
- 🏠 **Room Bookings** — View and book hotel rooms with full details and amenities
- 📅 **Table Booking System** — Customers can reserve tables; admin gets live notifications
- 💰 **Online Payments** — UPI QR, Card, Net Banking, and Cash on Delivery support
- 🤖 **AI Chatbot (Gemini 2.5 Flash)** — Floating AI assistant that reads live menu, rooms, and pricing to answer customer queries
- 🔴 **Real-time Firebase Sync** — All admin changes instantly reflect for all visitors worldwide
- 🔐 **Secure Admin Panel** — Password-protected dashboard with SHA-256 hashed credentials
- 📸 **Gallery & Memories** — Ambiance gallery and memories section with admin upload support
- ⭐ **Customer Reviews** — Review submission and management system
- 💾 **Hybrid Storage** — LocalStorage + IndexedDB (100MB) + Firebase cloud sync
- 🖼️ **Auto Image Compression** — Canvas-based compression keeps images under 120KB

---

## 🚀 Tech Stack

| Technology | Usage |
|---|---|
| React 18 + TypeScript | Frontend Framework |
| Vite 6 | Build Tool |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations |
| Firebase Realtime DB | Cloud Database |
| Google Gemini 2.5 Flash | AI Chatbot |
| IndexedDB (native) | Local Offline Storage |

---

## 🛠️ Run Locally

**Prerequisites:** Node.js 18+

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/hotel-kings-imperial.git
   cd hotel-kings-imperial
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and add your credentials:
   ```env
   # Firebase Realtime Database URL (for global sync)
   VITE_DATABASE_URL="https://your-project-id-default-rtdb.firebaseio.com/"

   # Google Gemini API Key (for AI Chatbot)
   VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Admin Panel

Access the admin dashboard at `/#admin`

- **Default Username:** `admin`
- **Default Password:** `*****`
- Change your password from the Settings tab inside the admin panel.

---
---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx       # Full admin dashboard
│   │   ├── AIAssistant.tsx      # Gemini AI chatbot
│   │   ├── Gallery.tsx          # Ambiance gallery
│   │   ├── ReviewForm.tsx       # Customer reviews
│   │   └── payments/            # Payment components
│   ├── utils/
│   │   └── db.ts                # IndexedDB + Firebase helpers
│   ├── App.tsx                  # Main application
│   └── data.ts                  # Default menu and rooms data
├── assets/                      # Static images
├── public/                      # Public assets
└── .env.example                 # Environment variable template
```

---

## 📄 License

This project is proprietary. All rights reserved.


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
