# PDF Tarot Reader

A whimsical web app that gives your PDFs a mystical tarot reading. Upload any PDF and receive a personalized "document destiny" complete with tarot cards, an aura type, and a certification stamp.

## Features

- **PDF Upload**: Drag-and-drop or click to upload (10MB limit)
- **Text Analysis**: Extracts keywords and themes from your document
- **Tarot Reading**: 3-card spread (Past/Present/Future) based on document content
- **Aura Assignment**: Discover your document's personality (Focus Goblin, Deadline Phantom, Meeting Magnet, etc.)
- **Certification Stamp**: Get officially certified (Certified Chaotic Neutral, Professionally Procrastinated, etc.)
- **PDF Export**: Download your original PDF with a custom tarot cover page
- **Animations**: Smooth card flips, hover effects, and celebration confetti

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

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## API Endpoints

- `POST /api/analyze` - Analyze PDF and generate reading
- `POST /api/render` - Render cover page and merge with original
- `GET /api/health` - Health check

## License

MIT
