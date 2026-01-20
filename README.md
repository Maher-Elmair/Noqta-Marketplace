# Noqta - Multi-Vendor Marketplace Platform

A production-ready, scalable, multi-vendor marketplace platform built with React, TypeScript, and modern web technologies.

## 🎯 Core Concept

Noqta is not just an e-commerce website. It is a smart multi-vendor marketplace focused on:
- **Trust** - Building confidence between buyers and sellers
- **Discovery** - Smart search and recommendation systems
- **Empowering small sellers** - Tools and features for small businesses
- **High-quality buyer experience** - Intuitive, accessible, and delightful UX

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library built on Radix UI
- **React Router** - Client-side routing

### State Management
- **Zustand** - Lightweight state management for:
  - Authentication & role switching
  - Cart logic
  - Favorites/wishlist
  - UI preferences
- **React Query (TanStack Query)** - Server state management for:
  - Products
  - Categories
  - Orders
  - Analytics
  - Caching & synchronization

### UI Components
- **shadcn/ui** - Composable, accessible components
- **Radix UI** - Unstyled, accessible primitives
- **Lucide React** - Beautiful icon library

## 📁 Project Structure

```
src/
├── app/                    # Application entry point
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── common/             # Shared components (ProductCard, etc.)
│   ├── layouts/            # Page layouts (MainLayout)
│   └── states/             # Empty/error/loading states
├── features/               # Feature-based modules (future expansion)
├── hooks/                  # Custom React hooks (use-products, use-categories)
├── lib/                    # Utilities and helpers
├── pages/                  # Page components
│   ├── auth/               # Login, Register
│   ├── buyer/              # Buyer pages
│   ├── seller/             # Seller dashboard
│   └── admin/              # Admin panel
├── services/               # API services (mock data)
│   ├── api/                # API clients
│   └── mock-data.ts        # Mock data for development
├── stores/                 # Zustand stores
├── types/                  # TypeScript types & interfaces
└── constants/              # App constants
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Noqta
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 👥 User Roles

### Guest
- Browse products and categories
- View product details
- No login required

### Buyer
- All guest features
- Search products with smart filters
- Add to cart (grouped by seller)
- Manage favorites/wishlist
- View order history
- Track orders

### Seller
- Seller activation flow
- Dashboard with analytics
- Product management (CRUD)
- Order management
- Sales reports
- Pricing & coupon tools

### Admin
- Full platform overview
- Category management
- User management
- Order monitoring
- Reports & analytics
- System alerts

## 🔐 Test Accounts

For testing purposes, use these accounts:

- **Buyer**: `buyer@noqta.com` / `password`
- **Seller**: `seller@noqta.com` / `password`
- **Admin**: `admin@noqta.com` / `password`

## 🌍 Internationalization

Noqta supports:
- **Arabic (RTL)** - Primary language
- **English (LTR)** - Secondary language

Language and RTL/LTR direction are managed through Zustand and applied automatically to the document.

## 🎨 Theming

The platform supports:
- Light mode
- Dark mode
- System preference

Theme preference is persisted and applied automatically.

## 📦 Key Features

### Smart Search
- Intent-aware search
- Typo correction (ready for implementation)
- Context-based suggestions
- Dynamic filters

### Recommendations
- Similar products
- Frequently bought together
- Trending products
- Personalized suggestions

### Cart System
- Seller-grouped items
- Quantity management
- Persistent storage
- Smart suggestions

### State Management
- Persistent cart (localStorage)
- Persistent favorites (localStorage)
- Persistent auth (localStorage)
- Persistent UI preferences (localStorage)

## 🔧 Development

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Consistent component structure
- Clear separation of concerns

### Component Guidelines
- Use shadcn/ui components where possible
- All components should be accessible
- Support RTL/LTR layouts
- Handle loading, error, and empty states

### API Integration
Currently using mock APIs. To integrate with a real backend:
1. Update services in `src/services/api/`
2. Replace mock data with actual API calls
3. Update error handling as needed

## 📝 Notes

- This is a production-ready foundation, not a demo
- Architecture is designed for long-term growth
- Code is modular and maintainable
- Easy onboarding for new developers
- No biological metaphors - clear, conventional naming

## 🚧 Future Enhancements

- Real backend integration
- Payment gateway integration
- Advanced recommendation algorithms
- Real-time notifications
- Advanced analytics
- Mobile app (React Native)
- PWA support

## 📄 License

[Add your license here]

## 👨‍💻 Contributing

[Add contribution guidelines here]

---

Built with ❤️ for empowering small sellers and creating trust in e-commerce.
