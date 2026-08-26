# AI Projects Hub - Modern Web Application

A fast, lightweight, and modern web application development workspace initialized with **Vite 6**, **React 19**, **Vanilla CSS design system**, and **Git version control**.

---

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```
The application will be served locally at `http://localhost:3000`.

### 2. Build for Production
```bash
npm run build
```
Generates an optimized static bundle in the `dist/` folder.

### 3. Preview Production Build
```bash
npm run preview
```

---

## 📁 Project Structure

```text
Ai Projects/
├── .git/                      # Git version control
├── .gitignore                 # Standard node/vite gitignore
├── README.md                  # Project documentation
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration
├── index.html                 # Main entry HTML
├── public/                    # Static assets (favicons, manifest)
└── src/                       # Application source code
    ├── index.css              # Design system tokens, variables, & resets
    ├── App.css                # Component and layout styling
    ├── main.jsx               # React bootstrap entry point
    ├── App.jsx                # Root layout component
    ├── components/            # Reusable UI component modules
    │   ├── Header.jsx
    │   ├── Hero.jsx
    │   └── Features.jsx
    └── assets/                # Visual media assets
```

---

## 🎨 Design System
- **Colors**: Cyber Violet, Emerald, Cyan with dark-mode-first HSL palette.
- **Glassmorphism**: Backdrop blur with subtle borders and glow effects.
- **Typography**: Inter & Outfit (loaded from Google Fonts).
- **Icons**: Lucide Icons.
