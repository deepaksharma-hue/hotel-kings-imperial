<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3b78f93e-eb13-4c04-9754-20725ec124c6

## Run Locally

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
- Change your password from the Settings tab inside the admin 

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
