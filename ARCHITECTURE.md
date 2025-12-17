# PDF Tarot Reader - Architecture

## Overview

Upload a PDF, get a tarot-style reading, download a new PDF with the reading as page 1.

## Tech Stack

### Frontend
- **React 18 + Vite** - Fast dev, good DX
- **Framer Motion** - Animations (card flips, transitions)
- **react-dropzone** - File upload
- **pdfjs-dist** - Thumbnail previews (optional, nice-to-have)
- **TypeScript** - Yes, everywhere

### Backend
- **Node.js + Express** - Simple, gets the job done
- **multer** - File uploads (memory storage, no disk)
- **pdf-lib** - Create and merge PDFs
- **pdf-parse** - Extract text from PDFs
- **zod** - Request/response validation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │DropZone  │→ │AnalysisUI│→ │CardReveal│→ │ Export   │    │
│  │  View    │  │ Loading  │  │  View    │  │ Button   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                         API                                  │
│  POST /api/analyze    POST /api/render                       │
│       │                    │                                 │
│       ▼                    ▼                                 │
│  ┌──────────┐        ┌──────────┐                           │
│  │pdf-parse │        │ pdf-lib  │                           │
│  │ extract  │        │  merge   │                           │
│  └──────────┘        └──────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## API Design

### POST /api/analyze
Stateless. No file storage.

**Input:** `multipart/form-data` with PDF file

**Output:**
```typescript
{
  title: string;
  keywords: string[];
  aura: string;
  cards: [
    { position: "past", name: string, meaning: string },
    { position: "present", name: string, meaning: string },
    { position: "future", name: string, meaning: string }
  ]
}
```

### POST /api/render
Stateless. Takes original PDF + analysis, returns merged PDF.

**Input:** `multipart/form-data` with:
- `file`: Original PDF
- `analysis`: JSON string of analysis result

**Output:** `application/pdf` - merged PDF bytes

## Data Flow

1. User drops PDF → Frontend sends to `/api/analyze`
2. Backend extracts text (first ~3000 chars), runs keyword extraction
3. Backend generates reading (rule-based or LLM)
4. Frontend receives analysis, animates card reveal
5. User clicks Export → Frontend sends PDF + analysis to `/api/render`
6. Backend creates cover page with pdf-lib, merges with original
7. Frontend triggers download

## Component Structure

### Frontend (`/client`)
```
src/
├── main.tsx
├── App.tsx
├── views/
│   ├── UploadView.tsx      # Dropzone + initial state
│   └── ReadingView.tsx     # Cards + export
├── components/
│   ├── TarotCard.tsx       # Flip animation
│   ├── AuraBadge.tsx       # Aura label
│   ├── ExportButton.tsx    # Export + loading
│   └── DropZone.tsx        # Upload component
├── lib/
│   └── animations.ts       # Framer Motion presets
└── api/
    └── client.ts           # API calls
```

### Backend (`/server`)
```
src/
├── index.ts
├── routes/
│   ├── analyze.ts
│   └── render.ts
├── services/
│   ├── textExtractor.ts    # pdf-parse wrapper
│   ├── keywordExtractor.ts # Simple TF-IDF
│   ├── readingGenerator.ts # Card generation logic
│   └── pdfRenderer.ts      # Cover page creation
└── types/
    └── index.ts            # Shared types
```

## Key Design Decisions

### Stateless Everything
No database. No file storage. Files live in memory during request, get garbage collected after response. Simple, secure, scalable.

### Rule-Based Reading Generator (MVP)
Start with deterministic rules based on keywords. LLM integration is a nice-to-have, not MVP. Keep it predictable and fast.

### Client Holds State
Analysis result lives in React state. User wants to re-export? Frontend already has the data, just calls render again.

### Single Responsibility Endpoints
`/analyze` extracts and generates. `/render` builds and merges. Don't combine them. Keeps testing simple, allows re-renders without re-analysis.

## Animation Strategy (Framer Motion)

Keep it consistent:
- **Entrance:** fade + y-slide, 240ms, easeOut
- **Card flip:** rotateY with perspective, 500-650ms spring
- **Hover:** scale 1.02, shadow, 120ms
- **Page transitions:** AnimatePresence with exit animations

## Security Considerations

- Validate file is actually PDF (check magic bytes, not just extension)
- Cap file size (10MB default)
- Memory-only storage, auto-cleanup
- No user data persistence
- Sanitize any text that goes into the PDF

## Performance

- PDF text extraction: ~100-500ms for typical docs
- Cover page generation: ~50-100ms
- PDF merge: scales with page count, <500ms for reasonable docs
- Total roundtrip: aim for <2s on a 20-page PDF
