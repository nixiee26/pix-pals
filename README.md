# Focus Buddy — Cozy Anti-Procrastination & Deep Work Studio

> **"A cute pixel-art game that quietly helps you become more disciplined."**

Focus Buddy is a complete, production-ready cross-platform productivity application designed around a cozy pixel-art aesthetic inspired by warm study desks, gentle companions, and ambient soundscapes. It combines study planning, anti-procrastination nudges, hard distraction blocking, personal vision boards, gamified XP/coins progression, and in-game reward unlockables.

---

## 🌟 Key Features

1. **Faithful Cozy Pixel-Art Design**:
   - Inspired directly by the reference mocks: scenic study desk with sleeping calico cat, twilight window sky, ivy vines, laptop, warm mug, and potted plants.
   - Retro pixel font styling (`Press Start 2P`, `VT323`, and modern `Plus Jakarta Sans`).
   - Authentic pixel cards, beveled borders, and tactile retro drop-shadows.

2. **Companion Mascot System**:
   - Selectable companions: **Calico Cat**, **Tabby Cat**, **Lop-eared Bunny**, **Steady Turtle**, **Star Buddy**, and **Mini Bear**.
   - Non-distracting, contextual micro-reactions: quietly studying with glasses during focus, sleeping during breaks with floating `Zz`, and celebrating session completion.

3. **Resilient Focus Timer & Modes**:
   - **Pomodoro** (25 min focus cycles with short/long breaks).
   - **Deep Work** (45 min, 60 min, 90 min blocks).
   - **Custom Presets** with goal, subject, topic, and task attachment.
   - Wall-clock timestamp tracking (`Date.now()`) resilient to browser throttling and tab minimize events.

4. **Anti-Procrastination System**:
   - Tracks the exact delay in minutes between **Planned Start** and **Actual Start**.
   - Gentle, non-judgmental nudges: *"You planned to focus 27 minutes ago."*
   - Predefined friction busters:
     - *Too tired* → Suggests shorter light-focus session.
     - *Don't know where to start* → Prompts writing down the smallest first action.
     - *Distracted* → Prompts activating hard distraction shields immediately.
     - *Task feels difficult* → Suggests breaking it into a 10-minute starter task.

5. **Hard Distraction Blocking Architecture**:
   - Common `BlockingService` abstraction with unified interface.
   - **Web Extension Provider**: Bundled Manifest V3 extension in `/extension` using Chrome's `declarativeNetRequest` and `webNavigation` APIs to intercept domains and redirect to a cozy pixel-art block screen.
   - **Android & iOS Specifications**: Outlines OS-level integration patterns (AccessibilityService / Screen Time FamilyControls).
   - **Active Session Lock**: Users **cannot** edit, unblock, or alter the blocklist during an active session.
   - **Emergency Unlock**: Requires intentional confirmation typing, logs the interruption, deducts -15 XP & -10 Coins, while safely protecting the user's daily streak.

6. **Web Audio Procedural Soundscapes**:
   - Procedurally synthesizes high-fidelity audio client-side with zero external network dependencies:
     - 🌧️ Rain on Window (filtered noise + randomized raindrops)
     - 🔥 Cozy Fireplace (warm low-pass rumble + ember crackle pops)
     - 🌊 Ocean Waves (LFO sweeping band-pass noise)
     - 🍃 Forest Whisper (modulated wind resonance)
     - 📻 Brown Noise (deep relaxing lo-fi background)
   - Custom user audio upload support with 1.5s smooth fade-in and fade-out.

7. **Study Planner**:
   - Strict 4-tier hierarchy: **Subject → Topic → Task → Planned Focus Session**.
   - Deadlines, priorities (High, Medium, Low), estimated durations, and direct *"Focus on this task"* launcher.

8. **Interactive Dream Vision Board**:
   - Freeform drag-and-drop workspace with customizable positioning.
   - Upload personal goal images, add motivational quotes, milestone cards, target dates, and custom color accents.
   - Pin cards to display as subtle reminders inside the focus room.
   - **100% private to the user by default**.

9. **Gamification & Reward Bazaar**:
   - Balanced XP and Level progression curve.
   - Virtual coins with **daily reward cap** (preventing artificial timer farming).
   - In-app store categories: Cozy Room Themes, Retro Timer Skins, Ambient Audio Packs, Vision Board Decors, and Companion Accessories.
   - Purchased items become permanently owned and equippable.

10. **Data Privacy, Cloud Sync & Backups**:
    - Local-first architecture (instant offline capability).
    - Google Sign-In and email session simulation.
    - 1-click **JSON Data Export** and **JSON Data Restore**.
    - Safe reset progress modal with typed confirmation.

---

## 🛠️ Technology Stack

- **Framework**: React 18+ with TypeScript
- **Bundler & Tooling**: Vite
- **Styling**: Tailwind CSS with custom pixel tokens & Google Fonts
- **Audio Engine**: HTML5 Web Audio API Procedural Synthesizer
- **Icons**: Lucide Icons (`lucide-react`)
- **Animations**: Canvas Confetti (`canvas-confetti`)
- **Browser Extension**: Manifest V3 DeclarativeNetRequest

---

## 🚀 How to Run the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```
Production assets will be compiled into `dist/`.

---

## 🔌 Installing the Distraction Blocker Browser Extension (Optional)

To enable real, browser-level domain blocking for external websites (e.g. YouTube, Reddit, Instagram):
1. Open Google Chrome, Brave, or Microsoft Edge.
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked**.
5. Select the `extension/` folder in this repository.
6. The extension is now active and synchronized via `postMessage` with Focus Buddy!

---

## 📁 Project Structure

```
├── extension/                     # Manifest V3 Chrome/Edge extension
│   ├── manifest.json              # DeclarativeNetRequest permissions
│   ├── background.js              # Service worker handling dynamic rules
│   ├── content.js                 # Bridge between webpage & extension
│   └── blocked.html               # Pixel-art distraction redirect page
├── src/
│   ├── components/
│   │   ├── auth/AuthModal.tsx
│   │   ├── layout/Sidebar.tsx
│   │   ├── layout/BottomNav.tsx
│   │   ├── layout/TopStudySceneHeader.tsx
│   │   ├── mascot/PixelMascot.tsx
│   │   └── onboarding/OnboardingModal.tsx
│   ├── services/
│   │   ├── audioEngine.ts         # Procedural Web Audio synthesizer
│   │   ├── blockingService.ts     # Multi-platform blocking coordinator
│   │   ├── gamification.ts        # XP, coins, streaks & achievements
│   │   └── storage.ts             # Local-first persistence & JSON backup
│   ├── types/
│   │   └── index.ts               # Domain TypeScript interfaces
│   ├── views/
│   │   ├── HomeView.tsx           # Home Dashboard (Reference 1)
│   │   ├── PlannerView.tsx        # Study Planner (Subject/Topic/Task)
│   │   ├── FocusView.tsx          # Minimal Focus Room & Timer
│   │   ├── ProgressView.tsx       # Analytics & Procrastination Metrics
│   │   ├── StoreView.tsx          # Cozy Reward Bazaar
│   │   └── ProfileView.tsx        # Companion & Settings Manager
│   ├── App.tsx                    # Main Orchestrator
│   ├── index.css                  # Pixel styles & typography
│   └── main.tsx                   # Entry point
├── index.html
├── package.json
└── tailwind.config.js
```
