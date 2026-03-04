# OnEasy Offer & Appointment Letter Generator
## Astro + React — Conversational Document Automation

### Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser at
http://localhost:4321
```

### Project Structure

```
src/
├── pages/
│   └── index.astro          # Main page layout
├── components/
│   ├── OfferLetterApp.jsx   # Root: side-by-side layout
│   ├── ChatAgent.jsx        # Left: conversational AI agent
│   └── DocPreview.jsx       # Right: live document preview
├── styles/
│   └── global.css           # Global styles
├── utils.js                 # Questions, number utilities
└── docxGenerator.js         # DOCX file generation (docx library)
```

### Features
- 💬 Conversational chat agent (15 structured questions)
- 📄 Live A4 document preview updates in real time
- 🟢 Green highlights for filled fields, 🔴 red for unfilled
- 💰 Auto salary breakup from Annual CTC
- 📝 Auto salary in words (Indian numbering)
- ⬇ Download proper .docx Word file when all fields filled
