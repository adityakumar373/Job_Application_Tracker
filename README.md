# 📋 Job Application Tracker

A clean, fast, and privacy-first **Job Application Tracker** built with pure HTML, CSS, and JavaScript. Track every job you apply to — from first application to final offer — all from one beautiful dashboard.

> Built for the **Digital Heroes Trial Task** by **Aditya Kumar**

---

## 🚀 Live Demo

🔗 [View Live on Vercel](#) *(add your URL here after deployment)*

---

## ✨ Features

| Feature | Description |
|---|---|
| 📋 **Applications View** | Add, edit, and delete job applications in a clean table |
| 📊 **Dashboard** | Visual bar chart, offer rate ring, and recent activity feed |
| 🔍 **Search & Filter** | Instantly search by company/role or filter by status |
| 💾 **Local Storage** | Data persists in your browser — no account needed |
| ⬇ **Export Json** | Download all your data as a `.json` backup file |
| ⬆ **Import Json** | Restore data from a previously exported file |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |
| 🌙 **Dark Mode** | Premium dark UI with glassmorphism and smooth animations |

---

## 🖼️ Screenshots

> *(Add screenshots here after deployment)*

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (Semantic) |
| Styling | Vanilla CSS (Custom Properties, Flexbox, Grid) |
| Logic | Vanilla JavaScript (ES6+) |
| Storage | Browser `localStorage` |
| Fonts | Google Fonts — Inter |
| Deployment | Vercel (Free Hobby Plan) |

---

## 📁 Project Structure

```
job-application-tracker/
├── index.html      # App structure, layout, modal, nav
├── styles.css      # Full design system — dark theme, animations
├── script.js       # All logic: CRUD, storage, export/import, charts
└── README.md       # This file
```

---

## 🏃 Run Locally

No build step needed — it's pure HTML/CSS/JS.

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/job-application-tracker.git
   ```

2. **Open in browser**
   ```bash
   # Simply open the file
   open index.html
   # Or on Windows
   start index.html
   ```

That's it. No `npm install`, no build, no server required.

---

## ☁️ Deploy to Vercel

1. Push code to a **public GitHub repository**
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Set **Framework Preset** to `Other`
5. Leave Build Command and Output Directory **empty**
6. Click **Deploy** ✅

---

## 📊 How Data Works

```
Browser Session
      │
      ▼
localStorage (persists across refreshes)
      │
      ▼
Export JSON  ──►  .json file on your computer (manual backup)
      │
      ▼
Import JSON  ──►  restore from backup file
```

> **For a production version**, data would flow to a REST API
> (Node.js + Express) → JWT Auth → PostgreSQL on AWS/Azure.

---

## 🗺️ Roadmap

- [ ] Cloud sync with Supabase (free tier)
- [ ] OAuth login via Google
- [ ] Email reminders for follow-ups
- [ ] CSV export support
- [ ] Interview notes with rich text

---

## 👤 Author

**Aditya Kumar**
📧 [adityakumar030703@gmail.com](mailto:adityakumar030703@gmail.com)

---

## ⚡ Built for Digital Heroes

[![Built for Digital Heroes](https://img.shields.io/badge/Built%20for-Digital%20Heroes-orange?style=for-the-badge)](https://digitalheroesco.com)
