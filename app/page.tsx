"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Upload, 
  Settings, 
  Brain,
  BookOpen,
  FileText,
  Clock,
  Target,
  TrendingUp,
  Eye,
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Menu,
  X,
  Home,
  User,
  Activity,
  BarChart3,
  Zap,
  Github,
  Sun,
  Moon
} from "lucide-react"

// Interfaces remain the same
interface TestPassage {
  title: string
  content: string
  wordCount: number
  difficulty: "basic" | "intermediate" | "advanced"
  readingTime: number
}

interface TestItem {
  id: string
  passage: TestPassage
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: "basic" | "intermediate" | "advanced"
  timeLimit?: number
}

interface TestBattery {
  id: string
  name: string
  description: string
  category: "beginner" | "intermediate" | "advanced"
  items: TestItem[]
  itemCount: number
  estimatedTime: number
  difficulty: string
}

interface TestSession {
  batteryId: string
  items: TestItem[]
  currentIndex: number
  answers: (number | undefined)[]
  startTime: number
  timeSpent: number
}

interface TestResults {
  batteryId: string
  overallScore: number
  questionsCorrect: number
  totalQuestions: number
  timeSpent: number
  categoryScores: { category: string; score: number }[]
  recommendations: string[]
}

interface ReaderSettings {
  wpm: number
  fontSize: number
  highlightMode: boolean
  pauseAtPunctuation: boolean
}

interface ReadingStats {
  wordsRead: number
  timeElapsed: number
  currentWPM: number
  averageWPM: number
  accuracy: number
  sessionsCompleted: number
  comprehensionScore: number
}

export default function ReadingPlatform() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Theme classes
  const themeClasses = {
    bg: isDarkMode ? "bg-gray-900" : "bg-white",
    cardBg: isDarkMode ? "bg-gray-800" : "bg-white",
    text: isDarkMode ? "text-white" : "text-gray-900",
    textMuted: isDarkMode ? "text-gray-400" : "text-gray-600",
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    hover: isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50",
    accent: isDarkMode ? "bg-gray-700" : "bg-gray-50",
    input: isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900",
  }

  // State management
  const [currentView, setCurrentView] = useState<"dashboard" | "reader" | "test">("reader")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [isFileUploading, setIsFileUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [text, setText] = useState("")
  const [words, setWords] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const [settings, setSettings] = useState<ReaderSettings>({
    wpm: 250,
    fontSize: 24,
    highlightMode: true,
    pauseAtPunctuation: true,
  })

  const [stats, setStats] = useState<ReadingStats>({
    wordsRead: 0,
    timeElapsed: 0,
    currentWPM: 250,
    averageWPM: 225,
    accuracy: 85,
    sessionsCompleted: 12,
    comprehensionScore: 78,
  })

  // Test related states
  const [testBatteries] = useState<TestBattery[]>([
    {
      id: "basic-comprehension",
      name: "Basic Reading Assessment",
      description: "Fundamental reading comprehension skills",
      category: "beginner",
      items: [],
      itemCount: 5,
      estimatedTime: 10,
      difficulty: "Basic"
    },
    {
      id: "intermediate-analysis",
      name: "Text Analysis Skills",
      description: "Analytical reading and inference abilities",
      category: "intermediate", 
      items: [],
      itemCount: 7,
      estimatedTime: 15,
      difficulty: "Intermediate"
    },
    {
      id: "advanced-critical",
      name: "Critical Reading",
      description: "Advanced comprehension and critical thinking",
      category: "advanced",
      items: [],
      itemCount: 10,
      estimatedTime: 25,
      difficulty: "Advanced"
    },
  ])

  const [currentTest, setCurrentTest] = useState<TestSession | null>(null)
  const [testResults, setTestResults] = useState<TestResults | null>(null)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Current word display
  const currentWord = words[currentWordIndex] || ""

  // Helper functions
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Text statistics calculation
  const calculateTextStats = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const characters = text.length
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length
    const avgWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0
    
    return {
      words,
      characters,
      sentences,
      avgWordsPerSentence
    }
  }

  // Flesch Reading Ease calculation
  const calculateFleschScore = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean)
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0)
    const syllables = words.reduce((total, word) => {
      return total + countSyllables(word)
    }, 0)

    if (words.length === 0 || sentences.length === 0) return 0

    const avgWordsPerSentence = words.length / sentences.length
    const avgSyllablesPerWord = syllables / words.length

    return Math.round(206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord)
  }

  // Count syllables in a word
  const countSyllables = (word: string): number => {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')
    const matches = word.match(/[aeiouy]{1,2}/g)
    return matches ? matches.length : 1
  }

  // Get reading level from Flesch score
  const getReadingLevel = (score: number) => {
    if (score >= 90) return { level: "Very Easy", gradeLevel: "5th grade" }
    if (score >= 80) return { level: "Easy", gradeLevel: "6th grade" }
    if (score >= 70) return { level: "Fairly Easy", gradeLevel: "7th grade" }
    if (score >= 60) return { level: "Standard", gradeLevel: "8th-9th grade" }
    if (score >= 50) return { level: "Fairly Difficult", gradeLevel: "10th-12th grade" }
    if (score >= 30) return { level: "Difficult", gradeLevel: "College level" }
    return { level: "Very Difficult", gradeLevel: "Graduate level" }
  }

  // Current text statistics
  const textStats = calculateTextStats(text)
  const fleschScore = calculateFleschScore(text)
  const readingLevel = {
    fleschScore,
    ...getReadingLevel(fleschScore)
  }

  const handleTextChange = (newText: string) => {
    setText(newText)
    if (newText.trim()) {
      const wordArray = newText.trim().split(/\s+/).filter(Boolean)
      setWords(wordArray)
      // Show upload success feedback
      if (newText.length > 50) {
        setUploadSuccess(true)
        setTimeout(() => setUploadSuccess(false), 2000)
      }
    } else {
      setWords([])
    }
    setCurrentWordIndex(0)
    setProgress(0)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === "text/plain" || file.name.endsWith('.txt')) {
        setIsFileUploading(true)
        setUploadError("")
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          handleTextChange(content)
          setIsFileUploading(false)
        }
        reader.onerror = () => {
          setUploadError("Failed to read file")
          setIsFileUploading(false)
        }
        reader.readAsText(file)
      } else {
        setUploadError("Please upload a .txt file")
        setTimeout(() => setUploadError(""), 3000)
      }
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const textFile = files.find(file => file.type === "text/plain" || file.name.endsWith('.txt'))
    
    if (textFile) {
      setIsFileUploading(true)
      setUploadError("")
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        handleTextChange(content)
        setIsFileUploading(false)
      }
      reader.onerror = () => {
        setUploadError("Failed to read file")
        setIsFileUploading(false)
      }
      reader.readAsText(textFile)
    } else {
      setUploadError("Please upload a .txt file")
      setTimeout(() => setUploadError(""), 3000)
    }
  }

  const startReading = () => {
    if (words.length === 0) return
    setIsReading(true)
    setIsPlaying(true)
    setCurrentWordIndex(0)
    setProgress(0)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const resetReading = () => {
    setCurrentWordIndex(0)
    setProgress(0)
    setIsPlaying(false)
  }

  const stopReading = () => {
    setIsReading(false)
    setIsPlaying(false)
    setCurrentWordIndex(0)
    setProgress(0)
  }

  // Reading interval effect
  useEffect(() => {
    if (isPlaying && isReading && words.length > 0) {
      const interval = 60000 / settings.wpm // milliseconds per word
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex((prev) => {
          const next = prev + 1
          if (next >= words.length) {
            setIsPlaying(false)
            setIsReading(false)
            return prev
          }
          
          const newProgress = ((next + 1) / words.length) * 100
          setProgress(newProgress)
          
          // Update stats
          setStats(prevStats => ({
            ...prevStats,
            wordsRead: next + 1,
            currentWPM: settings.wpm,
          }))
          
          return next
        })
      }, interval)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, isReading, settings.wpm, words.length])

  // Test functions
  const startTest = (batteryId: string) => {
    const battery = testBatteries.find(b => b.id === batteryId)
    if (battery) {
      setCurrentTest({
        batteryId,
        items: battery.items,
        currentIndex: 0,
        answers: new Array(battery.items.length).fill(undefined),
        startTime: Date.now(),
        timeSpent: 0
      })
    }
  }

  const handleTestAnswer = (answerIndex: number) => {
    if (!currentTest) return
    
    const newAnswers = [...currentTest.answers]
    newAnswers[currentTest.currentIndex] = answerIndex
    
    setCurrentTest({
      ...currentTest,
      answers: newAnswers
    })
  }

  const nextQuestion = () => {
    if (!currentTest) return
    
    setCurrentTest({
      ...currentTest,
      currentIndex: currentTest.currentIndex + 1
    })
  }

  const previousQuestion = () => {
    if (!currentTest) return
    
    setCurrentTest({
      ...currentTest,
      currentIndex: Math.max(0, currentTest.currentIndex - 1)
    })
  }

  const finishTest = () => {
    if (!currentTest) return
    
    const timeSpent = Date.now() - currentTest.startTime
    const questionsCorrect = currentTest.answers.reduce((count, answer, index) => {
      return (count || 0) + (answer === currentTest.items[index]?.correctAnswer ? 1 : 0)
    }, 0) || 0
    
    const overallScore = (questionsCorrect / currentTest.items.length) * 100
    
    setTestResults({
      batteryId: currentTest.batteryId,
      overallScore,
      questionsCorrect,
      totalQuestions: currentTest.items.length,
      timeSpent,
      categoryScores: [
        { category: "Comprehension", score: overallScore },
        { category: "Analysis", score: Math.max(0, overallScore - 10) },
        { category: "Inference", score: Math.max(0, overallScore - 5) }
      ],
      recommendations: [
        "Continue practicing with speed reading exercises",
        "Focus on improving comprehension accuracy",
        "Try more challenging texts to build skills"
      ]
    })
    
    setCurrentTest(null)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isReading) {
        switch (e.code) {
          case 'Space':
            e.preventDefault()
            togglePlayPause()
            break
          case 'Escape':
            e.preventDefault()
            stopReading()
            break
          case 'KeyR':
            e.preventDefault()
            resetReading()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isReading, togglePlayPause, stopReading, resetReading])

  // Main Interface
  return (
    <div className={cn("min-h-screen", themeClasses.bg)}>
      {/* GitHub-style Header */}
      <nav className={cn("sticky top-0 z-50 border-b", themeClasses.cardBg, themeClasses.border)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Github className={cn("h-6 w-6 mr-2", themeClasses.text)} />
                <span className={cn("text-lg font-semibold", themeClasses.text)}>Reable</span>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: Home },
                { id: "reader", label: "Reader", icon: BookOpen },
                { id: "test", label: "Test", icon: Brain },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCurrentView(id as any)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center",
                    currentView === id
                      ? isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700",
                    themeClasses.text
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  "hover:bg-gray-100 dark:hover:bg-gray-700",
                  themeClasses.text
                )}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              {/* Mobile menu */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={cn("p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700", themeClasses.text)}
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className={cn("md:hidden border-t", themeClasses.border, themeClasses.cardBg)}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: Home },
                { id: "reader", label: "Reader", icon: BookOpen },
                { id: "test", label: "Test", icon: Brain },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentView(id as any)
                    setIsMobileMenuOpen(false)
                  }}
                  className={cn(
                    "px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center",
                    currentView === id
                      ? isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700",
                    themeClasses.text
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" && (
          <div className="space-y-6">
            <div className="pb-6">
              <h1 className={cn("text-3xl font-bold tracking-tight", themeClasses.text)}>
                Dashboard
              </h1>
              <p className={cn("mt-2 text-base", themeClasses.textMuted)}>
                Welcome to your reading training platform.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Reading Speed", value: `${stats.currentWPM} WPM`, icon: Eye },
                { label: "Accuracy", value: `${Math.round(stats.accuracy)}%`, icon: Target },
                { label: "Sessions", value: stats.sessionsCompleted.toString(), icon: Trophy },
                { label: "Comprehension", value: `${Math.round(stats.comprehensionScore)}%`, icon: Star },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label} className={cn("border", themeClasses.cardBg, themeClasses.border)}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Icon className={cn("h-8 w-8 mr-4", themeClasses.textMuted)} />
                      <div>
                        <p className={cn("text-sm font-medium", themeClasses.textMuted)}>{label}</p>
                        <p className={cn("text-2xl font-bold", themeClasses.text)}>{value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "reader", label: "Speed Reader", description: "Train your reading speed with drag & drop", icon: BookOpen },
                { id: "test", label: "Assessment", description: "Test comprehension skills", icon: Brain },
              ].map(({ id, label, description, icon: Icon }) => (
                <Card 
                  key={id} 
                  className={cn("border cursor-pointer transition-colors", themeClasses.cardBg, themeClasses.border, themeClasses.hover)}
                  onClick={() => setCurrentView(id as any)}
                >
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Icon className={cn("h-8 w-8 mx-auto mb-4", themeClasses.textMuted)} />
                      <h3 className={cn("text-lg font-semibold mb-2", themeClasses.text)}>{label}</h3>
                      <p className={cn("text-sm", themeClasses.textMuted)}>{description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Study Participation Section */}
            <Card className={cn("border", themeClasses.cardBg, themeClasses.border)}>
              <CardHeader>
                <CardTitle className={cn("flex items-center", themeClasses.text)}>
                  <Star className="w-5 h-5 mr-2" />
                  Participate in Research Studies
                </CardTitle>
                <CardDescription className={themeClasses.textMuted}>
                  Help advance reading research by participating in our studies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className={cn("text-sm", themeClasses.textMuted)}>
                    Join our research community and contribute to understanding reading comprehension and speed. 
                    Your participation helps us develop better tools for learners worldwide.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      className={cn("flex-1", isDarkMode ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800")}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Available Studies
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <User className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </div>
                  <div className={cn("text-xs p-3 rounded-lg", themeClasses.accent)}>
                    <p className={cn("font-medium mb-1", themeClasses.text)}>Current Studies:</p>
                    <ul className={cn("space-y-1", themeClasses.textMuted)}>
                      <li>• Reading Speed vs Comprehension Analysis</li>
                      <li>• Digital vs Physical Text Processing</li>
                      <li>• Adaptive Learning Effectiveness Study</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === "reader" && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto pb-2">
              <p className="text-base text-muted-foreground">
                <strong>Reable</strong> helps you discover your true reading speed. Most people think they're slow readers, but it's often just too much distraction. Try reading one word at a time—starting at 300 words per minute is a great start. Read more, focus, and you can become a pro in reading!
              </p>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Text Readability Analyzer</h2>
              {text && (
                <Button
                  variant="outline"
                  onClick={() => setShowStats(!showStats)}
                  className="bg-background border-border hover:bg-accent"
                >
                  {showStats ? "Hide Stats" : "Show Stats"}
                </Button>
              )}
            </div>

            {/* File Upload with Drag & Drop */}
            <div 
              className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
                ${isDragOver 
                  ? 'border-primary bg-primary/10 scale-[1.02]' 
                  : uploadSuccess 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : uploadError
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-border hover:border-primary/50 bg-muted/20'
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-colors
                  ${isDragOver 
                    ? 'bg-primary text-primary-foreground' 
                    : uploadSuccess 
                    ? 'bg-green-500 text-white'
                    : uploadError
                    ? 'bg-red-500 text-white'
                    : isFileUploading
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {isFileUploading ? (
                    <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : uploadSuccess ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : uploadError ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`font-medium ${
                    isDragOver 
                      ? 'text-primary' 
                      : uploadSuccess 
                      ? 'text-green-600 dark:text-green-400'
                      : uploadError
                      ? 'text-red-600 dark:text-red-400'
                      : isFileUploading
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-foreground'
                  }`}>
                    {isFileUploading 
                      ? 'Processing file...' 
                      : uploadSuccess 
                      ? 'File uploaded successfully!'
                      : uploadError
                      ? uploadError
                      : isDragOver 
                      ? 'Drop your text file here' 
                      : 'Upload or drag & drop text file'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Supports .txt files only</p>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".txt,text/plain"
                    onChange={handleFileUpload}
                    className="sr-only"
                    disabled={isFileUploading}
                  />
                  <Button 
                    disabled={isFileUploading}
                    variant="outline" 
                    className="bg-background border-border hover:bg-accent disabled:opacity-50"
                  >
                    {isFileUploading ? 'Processing...' : 'Choose File'}
                  </Button>
                </label>
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Or paste your text here:
              </label>
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                className="w-full h-32 p-4 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Paste your text here to analyze readability..."
              />
            </div>

            {/* Compact Stats and Reading Level - Always show when text exists */}
            {text && (
              <div className="space-y-4 animate-in fade-in-50 duration-500">
                {/* Quick Stats Bar */}
                <div className="flex flex-wrap gap-4 text-sm bg-muted/30 rounded-lg p-3">
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{textStats.words}</strong> words
                  </span>
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{textStats.sentences}</strong> sentences
                  </span>
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{textStats.avgWordsPerSentence}</strong> avg/sentence
                  </span>
                  <span className="text-muted-foreground">
                    Reading Level: <strong className="text-primary">{readingLevel.level}</strong>
                  </span>
                </div>

                {/* Detailed Stats (Expandable) */}
                {showStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-3 duration-300">
                    <div className="p-3 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <h3 className="font-medium text-foreground text-sm">Words</h3>
                      <p className="text-xl font-bold text-primary">{textStats.words}</p>
                    </div>
                    <div className="p-3 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <h3 className="font-medium text-foreground text-sm">Characters</h3>
                      <p className="text-xl font-bold text-primary">{textStats.characters}</p>
                    </div>
                    <div className="p-3 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <h3 className="font-medium text-foreground text-sm">Sentences</h3>
                      <p className="text-xl font-bold text-primary">{textStats.sentences}</p>
                    </div>
                    <div className="p-3 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <h3 className="font-medium text-foreground text-sm">Flesch Score</h3>
                      <p className="text-xl font-bold text-primary">{readingLevel.fleschScore}</p>
                    </div>
                  </div>
                )}

                {/* Reading Level Analysis */}
                <div className="p-4 border border-border rounded-lg bg-background hover:bg-muted/20 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-foreground">Reading Level: {readingLevel.level}</h3>
                      <p className="text-sm text-muted-foreground">Grade Level: {readingLevel.gradeLevel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">{readingLevel.fleschScore}</p>
                      <p className="text-xs text-muted-foreground">Flesch Score</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === "test" && (
          <div className="space-y-6">
            <div className="pb-6">
              <h1 className={cn("text-3xl font-bold tracking-tight", themeClasses.text)}>
                Reading Assessment
              </h1>
              <p className={cn("mt-2 text-base", themeClasses.textMuted)}>
                Evaluate your reading comprehension with adaptive testing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testBatteries.map((battery) => (
                <Card 
                  key={battery.id} 
                  className={cn("border cursor-pointer transition-colors", themeClasses.cardBg, themeClasses.border, themeClasses.hover)}
                  onClick={() => startTest(battery.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className={cn("text-base", themeClasses.text)}>{battery.name}</CardTitle>
                      <Badge variant={battery.category === "advanced" ? "default" : "secondary"}>
                        {battery.category}
                      </Badge>
                    </div>
                    <CardDescription className={themeClasses.textMuted}>{battery.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className={cn("flex items-center text-sm", themeClasses.textMuted)}>
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{battery.estimatedTime} minutes</span>
                      </div>
                      <div className={cn("flex items-center text-sm", themeClasses.textMuted)}>
                        <FileText className="w-4 h-4 mr-2" />
                        <span>{battery.itemCount} questions</span>
                      </div>
                      <div className={cn("flex items-center text-sm", themeClasses.textMuted)}>
                        <Target className="w-4 h-4 mr-2" />
                        <span>Difficulty: {battery.difficulty}</span>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        <Brain className="w-4 h-4 mr-2" />
                        Start Assessment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {testResults && (
              <Card className={cn("border", themeClasses.cardBg, themeClasses.border)}>
                <CardHeader>
                  <CardTitle className={cn("flex items-center", themeClasses.text)}>
                    <Trophy className="w-5 h-5 mr-2" />
                    Test Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className={cn("text-3xl font-bold mb-1", themeClasses.text)}>
                        {Math.round(testResults.overallScore)}%
                      </div>
                      <p className={cn("text-sm", themeClasses.textMuted)}>Overall Score</p>
                    </div>
                    <div className="text-center">
                      <div className={cn("text-3xl font-bold mb-1", themeClasses.text)}>
                        {testResults.questionsCorrect}/{testResults.totalQuestions}
                      </div>
                      <p className={cn("text-sm", themeClasses.textMuted)}>Correct Answers</p>
                    </div>
                    <div className="text-center">
                      <div className={cn("text-3xl font-bold mb-1", themeClasses.text)}>
                        {Math.round(testResults.timeSpent / 60)}m
                      </div>
                      <p className={cn("text-sm", themeClasses.textMuted)}>Time Spent</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className={cn("font-semibold mb-2", themeClasses.text)}>Performance Breakdown</h4>
                      <div className="space-y-2">
                        {testResults.categoryScores.map((category) => (
                          <div key={category.category} className="flex justify-between items-center">
                            <span className={cn("text-sm", themeClasses.text)}>{category.category}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={category.score} className="w-20 h-2" />
                              <span className={cn("text-sm font-medium w-10 text-right", themeClasses.text)}>
                                {Math.round(category.score)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className={themeClasses.border} />

                    <div>
                      <h4 className={cn("font-semibold mb-2", themeClasses.text)}>Recommendations</h4>
                      <ul className={cn("text-sm space-y-1", themeClasses.textMuted)}>
                        {testResults.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={() => setTestResults(null)} variant="outline">
                        Close Results
                      </Button>
                      <Button 
                        onClick={() => setCurrentView("reader")} 
                        className={isDarkMode ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Practice Reading
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
