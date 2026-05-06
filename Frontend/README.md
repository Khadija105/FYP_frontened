# 🎨 Artellect AI - Premium Art Platform UI

A production-quality React frontend application for a modern art marketplace with AI-powered features. Built with React, Vite, Tailwind CSS, Framer Motion, and Zustand.

![Artellect AI](https://img.shields.io/badge/Artellect_AI-v1.0-blueviolet?logo=react&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-React%2BTailwind%2BFramer%2BZustand-blue)

---

## ✨ Features

### 🎯 Core Pages
- **Landing Page** - Hero section with smooth animations and featured artworks carousel
- **Browse Gallery** - Advanced filtering by category, tags, price, and sort options
- **Artwork Details** - Full artwork information with artist profile and story sections
- **Room Mockup Preview** - Interactive room visualization with artwork placement
- **Artist Profile** - Artist showcase with biography, followers, and artwork grid
- **AI Chat Assistant** - Conversational AI for personalized art recommendations
- **Shopping Cart** - Full cart management with checkout and coupon support
- **Artist Dashboard** - Analytics, revenue tracking, and listing management
- **Admin Panel** - Content moderation and user management

### 🎨 Design Features
- ✅ **Smooth Animations** - Framer Motion for all transitions and interactions
- ✅ **Dark/Light Mode** - Togglable theme with localStorage persistence
- ✅ **Multi-Language Support** - English, Chinese, Hindi, Arabic (UI only)
- ✅ **Responsive Design** - Mobile, tablet, and desktop optimized
- ✅ **Glassmorphism** - Modern frosted glass UI effects
- ✅ **Skeleton Loaders** - Beautiful loading states across the app
- ✅ **Premium Polish** - Apple-level UI/UX with attention to detail

### 🧠 State Management
- **Zustand Stores** for:
  - Theme management (dark/light mode)
  - Language selection
  - Shopping cart
  - Authentication
  - Chat sessions
  - UI state

### 🔌 Mock Services
- Simulated API calls with realistic delays
- Artwork and artist data management
- Admin operations (user/artwork management)
- Dashboard analytics
- Chatbot responses with suggestions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (20+ recommended)
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd /home/sadka/Desktop/FYP

# Install dependencies
npm install

# Start development server
npm run dev

# The app will open at http://localhost:5173
```

### Build for Production

```bash
# Build the project
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Project Structure

```
src/
├── pages/               # Page components (Landing, Browse, etc.)
├── components/
│   ├── common/         # Shared components (Header, Cards, etc.)
│   └── ui/             # Base UI components (Button, Input, etc.)
├── layouts/            # Layout wrappers (MainLayout)
├── hooks/              # Custom React hooks
├── store/              # Zustand stores
├── services/           # Mock API services
├── data/               # Mock data files
├── types/              # TypeScript type definitions
├── App.tsx             # Main app with routing
├── main.tsx            # Entry point
└── index.css           # Global styles with Tailwind

public/
└── rooms/              # Room mockup images

Config Files:
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
├── tsconfig.json       # TypeScript configuration
└── .eslintrc.cjs       # ESLint configuration
```

---

## 🎯 Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Landing | Home page with hero and featured artworks |
| `/login` | Login | User login page |
| `/register` | Register | User registration page |
| `/browse` | Browse | Gallery with advanced filters |
| `/artwork/:id` | ArtworkDetail | Individual artwork page |
| `/artist/:id` | ArtistProfile | Artist profile and collection |
| `/room-mockup` | RoomMockup | Interactive room visualization |
| `/chat` | Chat | AI assistant chatbot |
| `/cart` | Cart | Shopping cart and checkout |
| `/dashboard` | Dashboard | Artist analytics and management |
| `/admin` | AdminPanel | Admin content management |

---

## 🎨 UI Components

### Base Components (`components/ui/`)
- **Button** - Animated button with multiple variants
- **Card** - Reusable card container with hover effects
- **Badge** - Status badges with color variants
- **Input** - Form input with validation
- **Spinner** - Animated loading spinner
- **SkeletonLoader** - Shimmer loading placeholders
- **Pagination** - Page navigation with math

### Common Components (`components/common/`)
- **Header** - Navigation header with language/theme toggle
- **Footer** - Footer with links
- **ArtworkCard** - Artwork display card
- **ArtistCard** - Artist profile card
- **Modal** - Animated modal dialog

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Framer Motion** | Animations |
| **Zustand** | State management |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client (mocked) |

---

## 🎬 Animations

### Used Animations
- Page transitions (fade + slide)
- Hover effects (scale, elevation)
- Skeleton loaders (pulsing)
- Modal animations (spring physics)
- Layout animations
- Staggered item animations
- Smooth scrolling
- Drag & drop (room mockup)

### Framer Motion Features
```typescript
// Hover animations
whileHover={{ y: -4, scale: 1.02 }}

// Tap animations
whileTap={{ scale: 0.98 }}

// Exit animations
exit={{ opacity: 0 }}

// Stagger effects
variants={{
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}}
```

---

## 🔐 Mock Authentication

The app comes with pre-configured mock auth:

```typescript
// Default credentials (any email/password works)
Email: alex@example.com
Password: password

// Auth is stored in Zustand store
// Real backend integration ready - just replace services/api.ts
```

---

## 🧩 State Management Examples

### Dark Mode Toggle
```typescript
import { useDarkMode } from './hooks';

const { isDark, toggleDarkMode } = useDarkMode();
```

### Shopping Cart
```typescript
import { useCartStore } from './store';

const addToCart = useCartStore((state) => state.addToCart);
const total = useCartStore((state) => state.getTotal());
```

### Chat Sessions
```typescript
import { useChatStore } from './store';

const { currentSession, addMessage, botResponse } = useChatStore();
```

---

## 🎯 Mock Data

Mock data includes:
- **8 Sample Artworks** with full details
- **4 Featured Artists** with profiles
- **6 Room Images** for mockup preview
- **5 Revenue Data Points** for dashboard
- **5 Listing Items** for artist dashboard

All data is stored in `src/data/mockData.ts` and can be easily replaced with real API calls.

---

## 🔄 API Integration

To integrate with real backend:

1. Replace mock functions in `src/services/api.ts`
2. Update store actions to use real API calls
3. Modify component data fetching (useEffect hooks)

Example:
```typescript
// Before (Mock)
const artworks = await artworkAPI.getAll();

// After (Real API)
const artworks = await axios.get('/api/artworks');
```

---

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

---

## 📱 Responsive Breakpoints

- **Mobile**: 0px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

All components are fully responsive with Tailwind's mobile-first approach.

---

## 🎨 Customization

### Change Primary Color
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    600: '#your-color-here'
  }
}
```

### Modify Animations
Framer Motion configs are in component props:
```typescript
transition={{ duration: 0.5 }}
```

### Update Theme Colors
Dark mode colors in `tailwind.config.js`:
```javascript
dark: {
  bg: "#0f0f0f",
  card: "#1a1a1a",
}
```

---

## 📊 Performance

- **Lazy Loading** - Code splitting with React Router
- **Image Optimization** - Placeholder images from Unsplash
- **CSS Optimization** - Tailwind purges unused styles in production
- **Bundle Size** - ~200KB gzipped (with all animations)

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Push to GitHub, connect to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

---

## 🐛 Development

### Available Scripts

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Debug Mode
Edit any `.tsx` file and save to see hot module replacement in action.

---

## 📝 Notes

- This is a **frontend-only** application
- No backend or database is included
- All data is mocked and stored in-memory
- Perfect for demos, prototypes, and presentations
- Easy to integrate with real backend APIs

---

## 🎓 Learning Resources

The codebase demonstrates:
- Modern React patterns (hooks, context)
- TypeScript best practices
- Tailwind CSS advanced usage
- Framer Motion animations
- State management with Zustand
- React Router v7 navigation
- Component composition and reusability

---

## 📄 License

This project is ready for your portfolio and presentations!

---

## 🤝 Support

For frontend-only modifications and enhancements, all components are well-commented and follow industry best practices.

---

## 🎯 What's Next?

To extend this application:
1. **Add Backend** - Connect to Node.js/FastAPI backend
2. **Real Authentication** - Implement JWT tokens
3. **Database** - Add PostgreSQL/MongoDB integration
4. **Payment** - Stripe/Razorpay integration
5. **File Upload** - Implement artwork upload functionality
6. **Real Chat** - WebSocket integration for live chat
7. **Notifications** - Push notifications system
8. **Analytics** - Real analytics tracking

---

**Built with ❤️ for premium user experiences**

Enjoy exploring Artellect AI! 🎨✨
