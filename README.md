# Reable - Advanced Speed Reading Platform

A comprehensive Next.js-based speed reading and comprehension training platform with integrated testing and analytics.

## Features

### 🚀 Speed Reading Engine
- **Customizable reading speeds** (50-1000 WPM)
- **Real-time progress tracking**
- **Pause at punctuation** support
- **Highlight mode** for focus training
- **Keyboard shortcuts** (Space, Escape, R)
- **Mobile-responsive design**

### 🧠 Comprehension Testing
- **Multiple test batteries**:
  - Basic Reading Comprehension
  - Advanced Text Analysis
  - Speed Reading Comprehension
- **Adaptive difficulty** progression
- **Multiple question types**:
  - Multiple choice
  - True/False
  - Short answer
  - Fill-in-the-blank
- **Real-time scoring** and analytics

### 📊 Analytics & Tracking
- **Comprehensive performance profiles**
- **Reading speed progression**
- **Comprehension category analysis**:
  - Literal comprehension
  - Inferential reasoning
  - Critical analysis
  - Vocabulary knowledge
  - Main idea identification
- **Strengths and weaknesses identification**
- **Personalized recommendations**

### 🔬 Research Integration
- **Data export** capabilities
- **Research study participation**
- **Performance analytics**
- **Comprehensive reporting**

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd reable

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

### Production Build
```bash
npm run build
npm start
```

## Usage

### Speed Reading
1. **Add text**: Paste text or upload files
2. **Set speed**: Choose from presets or enter custom WPM
3. **Configure options**: Pause at punctuation, highlight mode, font size
4. **Start reading**: Click "Start Reading Session"
5. **Take test**: Automatic comprehension test follows

### Testing
1. **Choose test battery**: Basic, Advanced, or Speed Reading
2. **Complete questions**: Adaptive difficulty based on performance
3. **View results**: Comprehensive analysis and recommendations
4. **Export data**: Download results for research participation

## File Structure
```
reable/
├── app/
│   ├── page.tsx          # Main application
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   └── ui/               # Shadcn UI components
├── lib/
│   └── utils.ts          # Utility functions
├── public/               # Static assets
├── styles/
│   └── globals.css       # Additional styles
└── package.json          # Dependencies
```

## Technology Stack
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Lucide React** - Icons
- **Radix UI** - Accessible components

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing
This platform is designed for research and educational purposes. Contributions welcome for:
- Additional test batteries
- New question types
- Performance analytics
- Research integrations

## License
MIT License - See LICENSE file for details

## Research Participation
This platform integrates with research studies. Data can be exported for analysis at [inrep-platform.com](https://inrep-platform.com)

## Support
For issues or questions, please open an issue on GitHub or contact the development team.
