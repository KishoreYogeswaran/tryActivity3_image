# TRY Activity 3 - Image Prompt Writing Web App

A Next.js web application for practicing AI image prompt writing skills.

## Features

- **Step 1: Prompt Writing** - Users write prompts based on workplace scenarios
- **Step 2: Feedback System** - AI evaluates prompts with detailed feedback
  - Score out of 5 based on rubrics
  - Up to 3 attempts allowed
  - Model prompt shown after 3rd attempt if score < 5
- **Step 3: Image Generation** - Display generated image with qualified prompt

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Upload a JSON activity file (generated from tryActivity3_image)
2. Read the scenario and write your prompt
3. Submit for evaluation
4. Get feedback and improve (up to 3 attempts)
5. Generate image with qualified prompt

## Project Structure

```
tryactivity3_webapp/
├── app/
│   ├── page.tsx              # Landing page (file upload)
│   ├── activity/
│   │   └── page.tsx          # Activity page
│   ├── api/
│   │   ├── evaluate/
│   │   │   └── route.ts      # Prompt evaluation API
│   │   └── generate-image/
│   │       └── route.ts      # Image generation API
│   └── globals.css           # Global styles with brand colors
├── components/
│   └── ActivityFlow.tsx      # Main activity flow component
└── README.md
```

## Brand Colors

- Background: #FFF8F2
- Card: #FFFFFF
- Input: #FFF3E6
- Section: #FFD8A8
- Primary: #E85D05

## Technologies

- Next.js 15
- TypeScript
- Tailwind CSS
- Groq SDK (GPT-OSS-120B for evaluation)
- Google Gemini 3 Pro Image (for image generation)
