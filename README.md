# 🚀 Consistency OS (NoZeroDay)

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Checked-47A248?logo=mongodb)](https://www.mongodb.com/)

**Consistency OS** is a premium, gamified habit-tracking platform designed to help you maintain your daily streaks and build a "No Zero Day" lifestyle. Built with a focus on visual excellence, performance, and deep engagement.

---

## 🎯 Mission: The "No Zero Day" Philosophy

The core mission of this project is to eliminate "Zero Days"—days where you do nothing towards your goals. By providing visual feedback, gamified rewards, and a clear consistency roadmap, **Consistency OS** transforms habit-building from a chore into a rewarding journey.

---

## ✨ Key Features

### 📊 Advanced Visualization
- **Dynamic Heatmaps**: GitHub-style contribution graphs for every habit, providing a macro view of your consistency.
- **Weekly Progress Charts**: High-fidelity charts (via Recharts) that track your completion rates and trends.
- **Micro-Animations**: Smooth, professional transitions powered by **Framer Motion**.

### 🎮 Gamification Engine
- **XP & Leveling System**: Earn experience points for every completed habit and level up your "Consistency Profile."
- **Badges & Achievements**: Unlock milestones like "7 Day Streak," "1000 XP," and "Habit Master."
- **Celebratory UI**: Real-time **Canvas Confetti** bursts to celebrate your wins.

### 🛡️ Admin & Guardrails
- **System Admin Dashboard**: A centralized hub for monitoring global platform metrics, user engagement, and system health.
- **Protected Routes**: Secure dashboard and profile areas with JWT-based authentication.
- **Cloudinary Integration**: Robust image and asset management for user profiles and badges.

---

## 🛠️ Tech Stack

### Frontend & UI
- **Framework**: Next.js 16.1.6 (App Router)
- **Library**: React 19.2.3
- **Styling**: Tailwind CSS 4 & Lucide React (Icons)
- **Animations**: Framer Motion
- **Visuals**: Recharts, React Calendar Heatmap, React Tooltip

### Backend & Infrastructure
- **Database**: MongoDB with Mongoose (ODM)
- **Auth**: JWT (JSON Web Tokens) & Bcryptjs
- **Assets**: Cloudinary
- **Deployment**: Optimized for Vercel

---

## 📦 Getting Started

### Prerequisites
- **Node.js** (v20 or higher recommended)
- **MongoDB** (Local or Atlas instance)
- **Cloudinary Account** (For image uploads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/consistency-os.git
   cd consistency-os
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory (see [Environment Variables](#-environment-variables) below).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Required keys in your `.env.local` file:

```env
# Database
MONGO_URI=mongodb+srv://your-uri-here

# Authentication
JWT_SECRET=your-secure-random-secret

# Assets (Cloudinary)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Public URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🛡️ Admin System Setup

To initialize the platform and create your master administrator account, run the following setup command:

```bash
# Locally:
curl http://localhost:3000/api/admin/setup

# Live Version:
# curl https://your-app-domain.vercel.app/api/admin/setup
```

---

## 📂 Project Structure

```bash
├── src/
│   ├── app/           # Next.js App Router (Pages & API Routes)
│   ├── components/    # Atomic UI components & layout sections
│   ├── lib/           # Shared utilities (DB, Auth, Gamification logic)
│   ├── models/        # Mongoose Schemas (User, Habit, Challenge)
│   └── styles/        # Global CSS & Tailwind configuration
├── public/            # Static assets and icons
└── scripts/           # Maintenance and testing scripts
```

---

## 📜 License & Contributions

Distributed under the **MIT License**. Contributions are welcome! Feel free to open a PR or report issues.

---
*Built with ❤️ for those who refuse to have a Zero Day.*