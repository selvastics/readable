# Readable

A clean, minimalistic text readability analyzer built with Next.js 15 and TypeScript.

## What it does

Analyze text readability using the Flesch Reading Ease scoring system. Upload .txt files or paste content to get instant readability statistics and comprehension levels.

## Features

- Upload .txt files with drag & drop interface
- Paste text directly for instant analysis
- Flesch Reading Ease scoring (0-100 scale)
- Text statistics (words, sentences, characters, avg sentence length)
- Color-coded difficulty levels (Very Easy to Very Difficult)
- Clean GitHub-style minimalistic interface
- Dark/light mode toggle
- Two main sections: Reader (analysis) and Test (placeholder)

## Live Demo

Visit: **https://github.com/selvastics/readable**

## Local Development

```bash
git clone https://github.com/selvastics/readable.git
cd readable
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. Go to the **Reader** tab
2. Either upload a .txt file (drag & drop supported) or paste your text
3. Get instant readability analysis with scores and statistics
4. Use the **Test** tab for future reading comprehension features

## Readability Scale

- **90-100**: Very Easy (5th grade level)
- **80-89**: Easy (6th grade level) 
- **70-79**: Fairly Easy (7th grade level)
- **60-69**: Standard (8th-9th grade level)
- **50-59**: Fairly Difficult (10th-12th grade level)
- **30-49**: Difficult (College level)
- **0-29**: Very Difficult (Graduate level)

## Tech Stack

- Next.js 15.2.4
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- Lucide React Icons

## File Structure

```
app/           # Next.js app directory
  page.tsx     # Main application component
components/    # Reusable UI components
  ui/          # Shadcn/ui components
lib/           # Utility functions
public/        # Static assets
styles/        # Global CSS
```

Built with modern web technologies for fast, responsive performance.

MIT
