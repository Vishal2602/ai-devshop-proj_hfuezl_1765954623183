# PDF Tarot Reader - Project Plan

## Project Overview

**Project Name:** PDF Tarot Reader
**Project ID:** proj_hfuezl_1765954623183
**Description:** A web application that generates mystical tarot-style readings for uploaded PDF documents, creating shareable augmented PDFs with personality insights.

### The Concept

Upload any PDF and receive a three-card tarot reading that treats your document like a person:
- **Past:** What this document is really about
- **Present:** What it's trying to achieve
- **Future:** What will likely go wrong next (with a funny warning)

Each PDF also receives an "aura" classification (e.g., Focus Goblin, Deadline Phantom, Meeting Magnet) and a certification stamp like "Certified Chaotic Neutral."

---

## MVP Features

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| 1 | PDF Upload | P0 | Drag-and-drop file upload with instant feedback |
| 2 | Text Extraction | P0 | Extract title and top keywords from document |
| 3 | Tarot Generation | P0 | Generate 3 tarot cards with interpretations |
| 4 | Cover Page Creation | P0 | New first page with cards and certification stamp |
| 5 | PDF Export | P0 | Merged PDF download with cover prepended |
| 6 | Animated Reveal | P1 | Card flip animations and transitions |
| 7 | Preview Thumbnails | P2 | Optional page thumbnail strip |

---

## Technical Architecture

### Tech Stack

**Frontend**
- React + Vite
- Framer Motion (animations)
- react-dropzone (upload)
- pdfjs-dist (preview thumbnails)

**Backend**
- Node.js + Express
- multer (file uploads)
- pdf-lib (PDF creation/merging)
- pdf-parse (text extraction)
- zod (request validation)

### API Design

```
POST /api/analyze
  Input: PDF file (multipart/form-data)
  Output: { title, keywords, aura, cards: [{name, meaning}] }

POST /api/render
  Input: PDF file + analysis JSON
  Output: application/pdf (merged PDF bytes)
```

Both endpoints are stateless. Files stored in memory/temp and deleted immediately after processing.

### Folder Structure

```
/
├── client/
│   └── src/
│       ├── views/
│       ├── components/
│       ├── lib/
│       └── api/
├── server/
│   └── src/
│       ├── routes/
│       ├── services/
│       └── pdf/
├── package.json
└── PROJECT_PLAN.md
```

---

## Milestones

### Milestone 1: Foundation
**Goal:** Project scaffolding and basic infrastructure

- [ ] Initialize monorepo structure (client + server)
- [ ] Set up Vite + React frontend with TypeScript
- [ ] Set up Express backend with TypeScript
- [ ] Configure ESLint/Prettier
- [ ] Create basic health check endpoint
- [ ] Verify dev environment works end-to-end

**Exit Criteria:** Both client and server run locally, communicate successfully

---

### Milestone 2: PDF Processing Pipeline
**Goal:** Core PDF analysis functionality

- [ ] Implement file upload with multer
- [ ] Add zod validation for requests
- [ ] Integrate pdf-parse for text extraction
- [ ] Build keyword extraction logic (TF-IDF or simple frequency)
- [ ] Create `/api/analyze` endpoint
- [ ] Unit tests for extraction logic

**Exit Criteria:** Upload a PDF, receive structured analysis JSON

---

### Milestone 3: Tarot Generation Engine
**Goal:** Generate meaningful readings from document analysis

- [ ] Define tarot card deck (names, base meanings)
- [ ] Define aura types with classification rules
- [ ] Build card selection algorithm based on keywords
- [ ] Generate Past/Present/Future interpretations
- [ ] Add humorous "warning" generator for Future card
- [ ] Create certification stamp logic

**Exit Criteria:** Analysis returns complete reading with cards, aura, and stamp

---

### Milestone 4: PDF Rendering
**Goal:** Create beautiful cover pages and merge with originals

- [ ] Set up pdf-lib for page creation
- [ ] Design cover page layout (tarot card positions, typography)
- [ ] Render tarot cards as vector graphics
- [ ] Add aura badge and certification stamp
- [ ] Optional: QR code linking back to app
- [ ] Implement page merging (cover + original pages)
- [ ] Create `/api/render` endpoint

**Exit Criteria:** Download a complete merged PDF with tarot cover

---

### Milestone 5: Frontend Core UI
**Goal:** Functional upload and results interface

- [ ] Build UploadView with react-dropzone
- [ ] Create upload progress indicator
- [ ] Build ReadingView layout (3-card spread)
- [ ] Display aura badge and interpretation text
- [ ] Add ExportButton with loading state
- [ ] Handle file download from render endpoint
- [ ] Error states and user feedback

**Exit Criteria:** Complete user flow works without animations

---

### Milestone 6: Animation Polish
**Goal:** Delightful, smooth interactions

- [ ] Card entrance animation (fade + y-slide, 240ms)
- [ ] Card flip reveal (rotateY, 500-650ms spring)
- [ ] Hover micro-interactions (1.02 scale, shadow, 120ms)
- [ ] Progress bar animation (gradient + percentage)
- [ ] Success celebration (confetti/stamp pop)
- [ ] Page transitions with AnimatePresence
- [ ] layoutId for card stacked-to-spread animation

**Exit Criteria:** All animations implemented per spec, feel polished

---

### Milestone 7: Preview & Refinement
**Goal:** Optional features and final polish

- [ ] PreviewStrip component with pdfjs-dist thumbnails
- [ ] Loading skeleton states
- [ ] Mobile responsiveness
- [ ] Accessibility review (keyboard nav, screen readers)
- [ ] Performance optimization
- [ ] Error boundary implementation

**Exit Criteria:** Production-ready application

---

## Core User Flow

```
1. User visits app
2. User drops PDF on upload zone
3. Frontend shows upload progress
4. API extracts text and keywords (/api/analyze)
5. API returns three-card reading + aura
6. Frontend animates card reveal sequence
7. User views their document's "fortune"
8. User clicks Export
9. API generates cover page and merges (/api/render)
10. Frontend shows loading, then downloads result
11. User has shareable PDF with tarot cover
```

---

## Animation Specifications

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Card entrance | fade + translateY | 240ms | easeOut |
| Card flip | rotateY with perspective | 500-650ms | spring |
| Hover state | scale(1.02) + shadow | 120ms | ease |
| Progress bar | gradient sweep + count-up | continuous | linear |
| Success | confetti burst / stamp pop | 400ms | spring |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large PDF processing time | Medium | High | Limit file size, process first N pages only |
| Poor keyword extraction | Medium | Medium | Tune algorithm, consider LLM fallback |
| PDF rendering complexity | Low | High | Use proven pdf-lib patterns, test edge cases |
| Animation performance | Low | Medium | Use GPU-accelerated transforms only |
| Browser compatibility | Low | Low | Test in Chrome, Firefox, Safari |

---

## Out of Scope (MVP)

These features are explicitly **not** included in MVP:
- User accounts / authentication
- Reading history / saved documents
- Social sharing integrations
- Multiple language support
- Custom tarot deck themes
- LLM-powered interpretations (keep rule-based for MVP)
- Backend file storage (stateless only)

---

## Success Metrics

- Upload to export flow completes in < 10 seconds for typical documents
- Animations run at 60fps on modern devices
- Generated readings feel entertaining and relevant
- Exported PDFs render correctly in major PDF viewers
- Zero data persistence (privacy by design)

---

## Next Steps

1. Review and approve this plan
2. Begin Milestone 1: Foundation
3. Daily standups to track progress
4. Demo at end of each milestone

---

*Plan created by: Chris (Product Manager)*
*Project ID: proj_hfuezl_1765954623183*
