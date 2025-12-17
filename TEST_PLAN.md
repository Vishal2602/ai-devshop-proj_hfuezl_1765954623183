# Test Plan - PDF Tarot Reader

**QA Tester:** Quinn
**Date:** 2025-12-17
**Project:** proj_hfuezl_1765954623183

---

## Overview

This test plan covers the PDF Tarot Reader application - a web app that accepts PDF uploads, extracts text, generates tarot-style readings, and exports merged PDFs with a cover page.

**Stack:** React + Vite (frontend), Express + Node.js (backend)

---

## 1. PDF Upload (DropZone Component)

### 1.1 Happy Path Tests

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| U1 | Upload valid PDF via drag-and-drop | File accepted, analysis begins | P0 |
| U2 | Upload valid PDF via file browser click | File accepted, analysis begins | P0 |
| U3 | Upload PDF exactly 10MB | File accepted, analysis begins | P1 |
| U4 | Upload small PDF (< 100KB) | File accepted, analysis begins | P1 |

### 1.2 Edge Cases & Error Handling

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| U5 | Upload file > 10MB | Error: "File is too large. Maximum size is 10MB." | P0 |
| U6 | Upload non-PDF file (.txt, .doc, .jpg) | Error: "Please upload a PDF file." | P0 |
| U7 | Upload file with .pdf extension but wrong MIME type | Server rejects: "Only PDF files are allowed" | P1 |
| U8 | Upload empty file (0 bytes) | Error handling, graceful failure | P1 |
| U9 | Upload multiple files at once | Only first file accepted (multiple: false) | P2 |
| U10 | Drag file over dropzone then drag away | Dropzone returns to default state | P2 |
| U11 | Upload while analysis in progress (isLoading=true) | Dropzone disabled, no new upload accepted | P1 |

### 1.3 Security Tests

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| U12 | Upload PDF with embedded JavaScript | File processed, no JS execution | P0 |
| U13 | Upload password-protected PDF | Error: "Could not extract text... encrypted" | P1 |
| U14 | Upload corrupted PDF file | Graceful error handling | P1 |
| U15 | Upload PDF with malformed metadata | Extraction handles gracefully, falls back to first line for title | P2 |

---

## 2. Text Extraction (textExtractor.js)

### 2.1 Happy Path Tests

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| T1 | Extract text from standard text PDF | Text extracted, title from metadata | P0 |
| T2 | Extract text from PDF without metadata title | Title from first line of text | P0 |
| T3 | Extract text from multi-page PDF (>5 pages) | Only first 5 pages processed (max: 5) | P1 |

### 2.2 Edge Cases

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| T4 | PDF with < 10 characters of text | 422 error: "Could not extract text from PDF" | P0 |
| T5 | Scanned PDF (image-based, no OCR) | 422 error: "document may be scanned or encrypted" | P0 |
| T6 | PDF with very long first line (>100 chars) | Title truncated to 80 characters | P1 |
| T7 | PDF with special characters in title | Title cleaned (regex removes non-word chars) | P2 |
| T8 | PDF with unicode text | Text extracted correctly | P2 |
| T9 | PDF with text exceeding MAX_TEXT_LENGTH (3000 chars) | Text truncated to 3000 characters | P1 |

---

## 3. Keyword Extraction (keywordExtractor.js)

### 3.1 Happy Path Tests

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| K1 | Extract keywords from normal text | Top 10 keywords by frequency returned | P0 |
| K2 | Categorize technical document | Returns "technical" category | P1 |
| K3 | Categorize business document | Returns "business" category | P1 |

### 3.2 Edge Cases

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| K4 | Text with only stop words | Empty keywords array | P1 |
| K5 | Text with words < 4 characters | Short words filtered out | P2 |
| K6 | Text with no category match | Returns "general" category | P1 |
| K7 | Text with numbers | Numbers included in keyword extraction | P2 |
| K8 | All uppercase text | Correctly lowercased and processed | P2 |

---

## 4. Tarot Reading Generation (readingGenerator.js)

### 4.1 Happy Path Tests

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| R1 | Generate reading for valid analysis | 3 cards (past/present/future), aura, certification | P0 |
| R2 | Same document produces same reading | Seeded random ensures consistency | P0 |
| R3 | Different documents produce different readings | Hash-based seed varies by content | P1 |

### 4.2 Edge Cases

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| R4 | Empty title | Reading generated with empty title | P2 |
| R5 | Empty keywords array | Reading generated successfully | P2 |
| R6 | Very long text for hashing | Only first 500 chars + title used for seed | P2 |

---

## 5. API Endpoints

### 5.1 POST /api/analyze

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| A1 | Valid PDF upload | 200 with {title, keywords, category, aura, certification, cards} | P0 |
| A2 | No file provided | 400: "No PDF file provided" | P0 |
| A3 | Unreadable PDF | 422: "Could not extract text from PDF" | P0 |
| A4 | Server error during processing | 500: "Failed to analyze PDF" | P1 |
| A5 | Response validation (Zod) | All required fields present and typed correctly | P0 |

### 5.2 POST /api/render

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| RN1 | Valid PDF + analysis | 200 with merged PDF bytes | P0 |
| RN2 | No file provided | 400: "No PDF file provided" | P0 |
| RN3 | No analysis JSON | 400: "No analysis data provided" | P0 |
| RN4 | Invalid analysis JSON | 400: "Invalid analysis JSON" | P1 |
| RN5 | Missing cards in analysis | 400: "Invalid analysis: missing cards" | P1 |
| RN6 | Missing aura in analysis | 400: "Invalid analysis: missing aura" | P1 |
| RN7 | PDF rendering error | 500: "Failed to render PDF" | P1 |

### 5.3 GET /api/health

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| H1 | Health check | 200 with {status: "ok", timestamp} | P0 |

---

## 6. PDF Rendering (pdfRenderer.js)

### 6.1 Happy Path Tests

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| P1 | Render cover page with all elements | Title, cards, aura badge, certification stamp, footer | P0 |
| P2 | Merge cover with original PDF | Cover page prepended, original pages follow | P0 |
| P3 | Match original page dimensions | Cover page uses same width/height as original | P1 |

### 6.2 Edge Cases

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| P4 | Very long document title | Title truncated to 50 chars with ellipsis | P1 |
| P5 | Very long card names | Card names truncated to 18 chars | P2 |
| P6 | Long card meanings | Wrapped to multiple lines, max 5 lines displayed | P2 |
| P7 | Encrypted PDF (ignoreEncryption: true) | PDF loaded and processed | P1 |
| P8 | Non-standard page dimensions | Cover page adapts to original dimensions | P2 |

---

## 7. Frontend Components

### 7.1 TarotCard Component

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| C1 | Card renders with name and meaning | All text visible, proper styling | P0 |
| C2 | Card flip animation | 600ms spring rotateY animation | P1 |
| C3 | Card hover interaction | 1.02 scale, shadow ramp, 120ms | P1 |
| C4 | Card entrance animation | Fade + y-slide, 240ms easeOut | P1 |

### 7.2 AuraBadge Component

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| AB1 | Badge displays aura name | Aura text visible | P0 |
| AB2 | Badge styling matches design | Purple background, gold accent | P1 |

### 7.3 ExportButton & Export Flow

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| E1 | Click export with valid data | PDF download triggered | P0 |
| E2 | Export progress indicator | Animated gradient progress bar | P1 |
| E3 | Export success | Confetti celebration animation | P1 |
| E4 | Export timeout (60s) | Error: "Export took too long" | P1 |
| E5 | Network error during export | Error with retry option | P1 |
| E6 | Exported filename format | "{original}_tarot_reading.pdf" | P1 |
| E7 | Special characters in filename | Sanitized (non-alphanumeric removed) | P2 |

### 7.4 PreviewStrip Component

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| PS1 | Show thumbnails for pages | Up to 5 page thumbnails displayed | P2 |
| PS2 | Loading state | Skeleton placeholders during load | P2 |

---

## 8. Error Handling & Retry Logic

### 8.1 useAnalysis Hook

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| ER1 | Network failure, retry | Up to 2 retries with exponential backoff | P0 |
| ER2 | Timeout (30s) | Request aborted, error displayed | P1 |
| ER3 | Cancel during analysis | AbortController cancels request | P1 |
| ER4 | PDF_UNREADABLE error | No retry, immediate error | P1 |
| ER5 | Invalid response structure | Validation fails, error displayed | P1 |

### 8.2 useExport Hook

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| EX1 | Network failure, retry | 1 retry attempt | P1 |
| EX2 | Timeout (60s) | Request aborted, error displayed | P1 |
| EX3 | Missing analysis data | Immediate error, no API call | P1 |
| EX4 | Empty blob response | Error: "Received invalid file" | P1 |

---

## 9. Animations & UI

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| AN1 | Card entrance animation | 240ms duration, easeOut timing | P1 |
| AN2 | Card flip animation | ~600ms spring, rotateY with perspective | P1 |
| AN3 | Hover micro-interactions | 1.02 scale, shadow ramp, 120ms | P1 |
| AN4 | Progress bar animation | Animated gradient, percentage count-up | P1 |
| AN5 | Confetti on success | Burst animation on export complete | P1 |
| AN6 | Page transitions | AnimatePresence smooth transitions | P2 |

---

## 10. Mobile Responsiveness

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| M1 | Mobile viewport (375px) | UI adapts, no horizontal scroll | P2 |
| M2 | Tablet viewport (768px) | Layout adjusts appropriately | P2 |
| M3 | Touch interactions | Dropzone works with touch | P2 |

---

## 11. Security & Input Validation

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| S1 | XSS via filename | Filename sanitized in export | P0 |
| S2 | XSS via PDF title | Title cleaned in extraction | P1 |
| S3 | Large payload attack | 10MB limit enforced server-side | P0 |
| S4 | MIME type spoofing | Server validates actual content type | P1 |
| S5 | Memory exhaustion | Memory storage, no disk persistence | P1 |

---

## 12. LocalStorage (storage.js)

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| L1 | Save last reading | Reading stored with filename | P2 |
| L2 | Add to history | Reading added to history array | P2 |
| L3 | LocalStorage full | Graceful handling, no crash | P2 |

---

## Test Environment Requirements

- Node.js 18+
- Modern browser (Chrome, Firefox, Safari, Edge)
- Sample PDFs: text-based, scanned, encrypted, large (>10MB), corrupt
- Network throttling tools for timeout testing
- Mobile device emulators for responsive testing

---

## Test Execution Summary

| Category | Total Tests | P0 | P1 | P2 |
|----------|-------------|----|----|-----|
| PDF Upload | 15 | 5 | 6 | 4 |
| Text Extraction | 9 | 3 | 4 | 2 |
| Keyword Extraction | 8 | 2 | 3 | 3 |
| Reading Generation | 6 | 2 | 1 | 3 |
| API Endpoints | 12 | 6 | 5 | 1 |
| PDF Rendering | 8 | 2 | 3 | 3 |
| Frontend Components | 13 | 4 | 7 | 2 |
| Error Handling | 9 | 1 | 8 | 0 |
| Animations | 6 | 0 | 5 | 1 |
| Mobile | 3 | 0 | 0 | 3 |
| Security | 5 | 2 | 3 | 0 |
| LocalStorage | 3 | 0 | 0 | 3 |
| **TOTAL** | **97** | **27** | **45** | **25** |

---

## Execution Priority

1. **P0 (Critical):** Must pass before release - core upload, analysis, rendering, export
2. **P1 (High):** Important features - error handling, animations, edge cases
3. **P2 (Medium):** Nice-to-have - mobile, preview, history

---

*Test Plan by: Quinn (QA Tester)*
*Date: 2025-12-17*
