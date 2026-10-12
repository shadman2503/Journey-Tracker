# DUET 2027 Journey Tracker

A comprehensive, local-first web application designed for tracking, analyzing, and visualizing preparation progress for the Dhaka University of Engineering & Technology (DUET) admission test.

Turn an overwhelming syllabus into a visible, measurable, and motivating daily preparation journey.

---

## Key Features

### 1. Unified Dashboard
- **DUET 2027 Countdown Banner:** Compact countdown timer showing days, hours, minutes, and seconds until the target admission date with dynamic preparation phase badges.
- **Top Metric Cards:** Instant visibility into overall syllabus completion percentage, active study streak, total preparation hours, and questions solved.
- **Subject Mastery Grid:** High-level mastery distribution across all 5 exam subjects (Mathematics, Physics, Chemistry, English, Computer Science).
- **Interactive Study Heatmap:** GitHub-style preparation activity heatmap visualizing daily study consistency, duration, and question volume over time.
- **Diagnostic Widgets:** Quick overview of weak area alerts, due revision items, recent mock test trajectory, and unresolved mistakes.

### 2. Comprehensive Syllabus Explorer
- **Complete DUET Syllabus:** Structured hierarchy across subjects, sections, chapters, and topics.
- **5-Stage Topic Progress Tracking:** Categorize every syllabus topic as `Not Started`, `Learning`, `Practicing`, `Strong`, or `Needs Revision`.
- **Search & Filter:** Instant topic search across English and Bengali topic titles with status filter tabs.
- **Topic Revision Notes:** Attach personal study reflections, formula reminders, and revision notes to any topic.

### 3. Study Session Logger & History
- **Session Recording:** Log study sessions with subject, specific syllabus topic, duration (minutes), questions solved, accuracy percentage, and study notes.
- **Session History:** Chronological list of study logs with search, subject filtering, date sorting, and instant edit/delete capabilities.
- **Consistency Tracking:** Track current streak, best streak, and total active study days.

### 4. Mock Test Tracker & Comparison
- **Comprehensive Score Tracking:** Record full-length or subject-specific mock tests with total questions, correct answers, wrong answers, net score, negative marking deduction, and time spent.
- **Performance Trajectory:** Visual score trendline with benchmark target reference lines.
- **Side-by-Side Comparison:** Select any two mock exams to compare scores, accuracy deltas, question attempts, and time efficiency side-by-side.

### 5. Mistake Notebook & Pattern Detection
- **Error Classification:** Categorize errors by type (Conceptual Error, Calculation Slip, Formula Mistake, Careless Oversight, Question Misread, Time Management).
- **Actionable Reflections:** Record what went wrong and the correct concept or solution for each question.
- **Resolution Workflow:** Track mistake statuses (`Unresolved`, `In Review`, `Mastered & Fixed`) with spaced repetition review dates.
- **Recurring Mistake Hotspots:** Algorithmic detection of frequent error patterns by subject and mistake category to target high-risk weak points.

### 6. Weak Area Diagnostic & Revision Engine
- **Intelligent Weakness Scoring:** Automatically detects struggling topics by combining low practice accuracy, unresolved mistake counts, low syllabus status, and overdue revision time.
- **Weakness Urgency Levels:** Classifies topics into `Critical Weakness`, `Moderate Weakness`, `Needs Attention`, or `Solid`.
- **Actionable Revision Queue:** Generates smart spaced-repetition revision recommendations prioritizing high-weight topics.

### 7. Journey Timeline & Milestones
- **Automated Milestone Detection:** Automatically celebrates major milestones (e.g. first study session, 25%/50%/75%/100% syllabus coverage, streak milestones, and mock test score personal bests).
- **Custom Milestone Logging:** Create custom milestones with custom dates, celebration icons, and personal reflection notes.
- **Chronological Timeline:** Visual roadmap illustrating the entire preparation journey from start to target exam day.

### 8. Analytics & Long-Term Performance
- **Consistency Metrics:** Detailed analysis of weekly study frequency, average daily study volume, and question pace.
- **Subject Time Allocation:** Visual distribution of study hours across Mathematics, Physics, Chemistry, English, and CSE.
- **Cumulative Prep Growth:** Dual-axis visualization showing preparation hours and question volume growth over time.
- **Accuracy Comparison:** Comparison between practice session accuracy and exam-condition mock test accuracy.

### 9. Privacy-First Local Storage & Backup
- **100% Local-First:** All preparation logs, test scores, mistakes, and progress data are stored entirely within your browser via IndexedDB (Dexie). No external server dependencies or tracking.
- **One-Click Backup & Restore:** Export your entire preparation database to a clean JSON file anytime. Import backups seamlessly to restore or migrate data between devices.
- **Database Reset:** Safely wipe and reinitialize your local database whenever needed.

### 10. Design & Accessibility
- **Modern Obsidian Theme:** Crafted with a dark cosmic palette (`#0c0e14`) paired with a warm apricot-gold (`#F6C07A`) primary accent.
- **Collapsible Vertical Sidebar:** Clean desktop navigation sidebar and mobile slide-out drawer with dedicated top header controls.
- **Responsive Experience:** Fully responsive layout tested and optimized across mobile (375px+), tablet, and desktop viewports.
- **Accessibility:** Keyboard navigable with visible focus states, ARIA dialog accessibility, and compliant color contrast.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Framework & Core** | React 19, TypeScript, Vite 6 |
| **Routing** | React Router v7 |
| **Styling & UI** | Tailwind CSS v3, Radix UI primitives, Lucide React icons, clsx, tailwind-merge |
| **State Management** | Zustand v5 |
| **Data Validation** | Zod v3 |
| **Date Utilities** | date-fns v4 |
| **Charts & Visuals** | Recharts v2 |
| **Storage Engine** | Dexie v4 (IndexedDB wrapper) with `dexie-react-hooks` |
| **Testing** | Vitest v3, React Testing Library, jsdom |

---

## Architecture

The codebase follows a modular, decoupled layered architecture:

```
src/
├── components/          # Presentation Layer: reusable UI widgets, dialogs, charts, cards
│   ├── analytics/       # Recharts visualizations & trend graphs
│   ├── backup/          # JSON data backup, restore, and reset modal
│   ├── common/          # Sidebar, Header, ToastContainer, etc.
│   ├── dashboard/       # Dashboard overview widgets & countdown banner
│   ├── milestones/      # Journey milestone cards & creation dialog
│   ├── mistake/         # Mistake notebook, review deck, and insights
│   ├── mock/            # Mock test cards, recording form, and comparison modal
│   ├── revision/        # Revision recommendation cards & widgets
│   ├── study/           # Study session logger & activity heatmap
│   ├── syllabus/        # Subject tabs, topic cards, and notes modal
│   ├── timeline/        # Chronological preparation timeline nodes
│   ├── ui/              # Base UI primitives (buttons, badges, progress bars)
│   └── weakArea/        # Weak area diagnostic cards & radar charts
├── domain/              # Pure Domain Logic Layer: zero UI/DB dependencies
│   ├── activityHeatmap.ts
│   ├── calculations.ts
│   ├── countdown.ts
│   ├── longTermAnalytics.ts
│   ├── milestones.ts
│   ├── mistake.ts
│   ├── mockTest.ts
│   ├── performanceAnalytics.ts
│   ├── progress.ts
│   ├── revisionRecommendations.ts
│   ├── streak.ts
│   ├── studySession.ts
│   ├── syllabusData.ts
│   ├── timeline.ts
│   └── weakArea.ts
├── hooks/               # Custom React hooks (accessibility, media queries)
├── pages/               # Route Views: Dashboard, Syllabus, StudyLog, Mistakes, MockTests, Analytics, Journey
├── repositories/        # Repository Layer: abstract interfaces decoupling storage from business logic
├── services/            # Application Services: backupService, calculations, orchestration
├── storage/             # Local IndexedDB database setup using Dexie
└── stores/              # Client State Stores powered by Zustand
```

---

## Getting Started

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shadman2503/Journey-Tracker.git
   cd Journey-Tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Launch the local Vite development server with hot-reload |
| `npm run build` | Compile TypeScript and bundle production assets to `dist/` |
| `npm run preview` | Locally preview the compiled production build |
| `npm run test` | Run the complete Vitest test suite |
| `npm run test:watch` | Run Vitest in interactive watch mode |
| `npm run typecheck` | Run the TypeScript compiler (`tsc --noEmit`) to verify types |

---

## Testing

Testing is powered by **Vitest** and **React Testing Library**. All core business logic, domain calculations, and critical UI interactions are thoroughly tested.

Run all tests:
```bash
npm run test
```

Current test coverage includes **74 test suites and 536 tests passing** covering:
- Domain calculation algorithms (streaks, syllabus progress percentages, weak area detection, revision scoring).
- Mock test metrics, negative marking calculations, and trend aggregation.
- Mistake filtering, categorization, and recurrence detection.
- Data backup, export serialization, and schema validation.
- Modal accessibility, keyboard navigation, and focus trapping.

---

## Deployment

The application is pre-configured for seamless deployment to **Vercel** (or any static hosting provider such as Netlify, Cloudflare Pages, or GitHub Pages):

1. Connect your repository on **[vercel.com](https://vercel.com)**.
2. Select the **Vite** framework preset:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Single-Page Application (SPA) routing is handled automatically via `vercel.json` rewrites.

---

## Developer

**Shadman Shoumik**  
- **GitHub:** [@shadman2503](https://github.com/shadman2503)  
- **Repository:** [Journey-Tracker](https://github.com/shadman2503/Journey-Tracker)

---

## License

This project is open source and available under the [MIT License](LICENSE).

