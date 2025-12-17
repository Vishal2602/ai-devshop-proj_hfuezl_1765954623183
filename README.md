# PDF Tarot Reader

A whimsical web application that transforms your PDFs into mystical tarot readings. Upload any document and receive a personalized 3-card tarot spread with aura assignment and certification stamp.

## Features

- **PDF Upload**: Drag-and-drop interface with file validation (10MB limit)
- **Text Analysis**: Extracts keywords using TF-IDF style frequency analysis
- **3-Card Tarot Reading**: Past, Present, and Future cards based on document content
- **Aura Assignment**: 10 unique aura types (Focus Goblin, Deadline Phantom, Meeting Magnet, etc.)
- **Certification Stamp**: Fun certifications (Certified Chaotic Neutral, Professionally Procrastinated, etc.)
- **PDF Export**: Merges a cover page with your original document
- **Smooth Animations**: Framer Motion powered card flips, transitions, and confetti celebration

## Tech Stack

### Frontend
- React 19 + Vite 7
- Framer Motion for animations
- react-dropzone for file uploads
- pdfjs-dist for PDF thumbnails

### Backend
- Node.js + Express
- pdf-parse for text extraction
- pdf-lib for PDF generation and merging
- Zod for validation

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
```

### Development

```bash
# Start frontend (from root)
npm run dev

# Start backend (from server/)
cd server && npm start
```

### Production Build

```bash
npm run build
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Analyzes PDF and returns reading data |
| `/api/render` | POST | Renders and merges PDF with cover page |
| `/api/health` | GET | Health check endpoint |

## License

MIT
