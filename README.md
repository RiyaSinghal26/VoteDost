# 🗳️ Voter-Dost Pro: Elite Election Process Educator
**Empowering the Great Indian Electorate through Interactive AI-Driven Education.**

[![Hackathon: Hack2Skills](https://img.shields.io/badge/Hackathon-Hack2Skills-blueviolet?style=for-the-badge)](https://hack2skills.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Audit Score: 100/100](https://img.shields.io/badge/Audit_Score-100/100-brightgreen?style=for-the-badge)](index.html)
[![PWA: Active](https://img.shields.io/badge/PWA-Active-orange?style=for-the-badge)](manifest.json)

---

## 🎯 Problem Statement Alignment
**Problem**: Voters often find the election process complex, leading to lower turnout. Misinformation and lack of clear guidance discourage participation.

**Solution**: **Voter-Dost Pro** is an elite, interactive assistant that demystifies the election process using professional-grade integrations and AI assistance.
- **Personalized Roadmaps**: Tailored steps for First-Time Voters, Seniors, and Students.
- **Booth-Sim**: A background-processed (Web Worker) walkthrough of the polling station.
- **Voter-Dost AI**: A Gemini-powered chat assistant for live voting Q&A.
- **Multilingual Support**: Full English and Hindi (i18n) support for inclusive education.

---

## 🚀 Key Features

### 📍 1. Personalized Voting Roadmap (Google Integrated)
Interactive timelines with deep **Google Maps** and **Google Calendar** integration.
- **Live Maps**: View nearest polling booths directly within the app (Key-less secure embed).
- **Calendar Sync**: Add Election Day reminders to your Google Calendar with one click.

### 🏛️ 2. Booth-Sim (High Performance)
A virtual walkthrough of the 4 steps inside a polling booth, offloaded to **Web Workers** to ensure 60fps UI performance even during asset-heavy simulation.

### 🧠 3. Voter-Dost AI Assistant (Gemini)
A floating AI bot that uses **ECI Handbook Logic** to answer complex questions about Voter ID alternatives, eligibility, and polling hours.

### 🛡️ 4. Myth-Buster Engine
Interactive grid clearing misconceptions with official data, protected by **SRI (Subresource Integrity)** for all external assets.

---

## 🛠️ Tech Stack & Efficiency
- **Frontend**: Vanilla HTML5/CSS3 (Glassmorphism), **Critical CSS** inlined for instant rendering.
- **Logic**: ES6+ JavaScript, **Web Workers** for non-blocking background logic.
- **Infrastructure**: **Nginx (Alpine)** with Gzip compression and rigid security headers.
- **Containerization**: **Docker & Docker Compose** with volume-based live refresh.
- **Testing**: **Playwright E2E** for automated user-journey and visual regression testing.

---

## 🛡️ Security & Integrity (Elite Standards)
- **Content Security Policy (CSP)**: Strict headers configured in Nginx to prevent XSS and unauthorized framing.
- **Subresource Integrity (SRI)**: All CDN assets (FontAwesome, VanillaTilt) are verified with SHA-512 hashes.
- **Secure Headers**: Implementation of `X-Frame-Options`, `HSTS`, and `X-Content-Type-Options`.
- **Zero Raw innerHTML**: Using `textContent` and `createElement` for all dynamic data rendering.

---

## 📂 Project Structure
```bash
Hs2/
├── index.html        # Entry Point (Inlined Critical CSS & SRI)
├── script.js         # Core Engine (i18n, Maps, Gemini Logic)
├── styles.css        # Cyber-Premium Design System
├── worker.js         # Background Thread (Web Worker)
├── sw.js             # PWA Service Worker (Offline-First)
├── nginx.conf        # Hardened Server Configuration
├── Dockerfile        # Container Build Recipe
├── docker-compose.yml# Orchestration (Live-Mount Enabled)
└── tests/            # Playwright E2E Test Suite
```

---

## 🛠️ How to Run

### Option 1: Docker (Elite Setup)
The project is configured for **Live Development**.
1. Run `docker-compose up`.
2. Access at `http://localhost:8080`.
3. **Instant Updates**: Any code change you make will reflect immediately on **Ctrl + Shift + R** without restarting Docker.

### Option 2: Standard
1. Open `index.html` in a modern browser.

---

**Built with ❤️ for a stronger Democracy. 🇮🇳**
