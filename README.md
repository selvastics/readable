# Readable

A minimal, clean text readability analyzer built with Next.js and TypeScript.

## What is Readable?

A simple tool to analyze text readability using the Flesch Reading Ease scoring system. Upload text files or paste content to get instant readability statistics and comprehension levels.

## Features

- Upload .txt files with drag & drop
- Paste text directly for analysis
- Flesch Reading Ease scoring (0-100 scale)
- Text statistics (words, sentences, characters)
- Reading difficulty levels (Very Easy to Very Difficult)
- Clean, minimal GitHub-style interface
- Dark/light mode toggle
- Test section for future comprehension features

## Getting Started

Requirements:
- Node.js 18+
- npm or pnpm

Install and run:
```sh
git clone https://github.com/selvastics/readable.git
cd readable
npm install
npm run dev
```

## Usage

1. Open the app in your browser
2. Upload a .txt file or paste your text
3. Get instant readability scores and statistics
4. Use the analysis to improve content accessibility

## Readability Scale

- 90-100: Very Easy (5th grade)
- 80-89: Easy (6th grade)
- 70-79: Fairly Easy (7th grade)
- 60-69: Standard (8th-9th grade)
- 50-59: Fairly Difficult (10th-12th grade)
- 30-49: Difficult (College level)
- 0-29: Very Difficult (Graduate level)

## File Structure

```
app/         # Main app code
components/  # UI components
lib/         # Utility functions
public/      # Static assets
styles/      # CSS
```

## License

MIT
