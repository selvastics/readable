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
  Zap
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
  // State management
  const [currentView, setCurrentView] = useState<"dashboard" | "reader" | "test" | "profile">("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  const handleTextChange = (newText: string) => {
    setText(newText)
    if (newText.trim()) {
      const wordArray = newText.trim().split(/\s+/).filter(Boolean)
      setWords(wordArray)
    } else {
      setWords([])
    }
    setCurrentWordIndex(0)
    setProgress(0)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/plain") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        handleTextChange(content)
      }
      reader.readAsText(file)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Reable</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    currentView === "dashboard"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Home className="w-4 h-4 inline mr-1" />
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView("reader")}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    currentView === "reader"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  Speed Reader
                </button>
                <button
                  onClick={() => setCurrentView("test")}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    currentView === "test"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Brain className="w-4 h-4 inline mr-1" />
                  Testing
                </button>
                <button
                  onClick={() => setCurrentView("profile")}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    currentView === "profile"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <User className="w-4 h-4 inline mr-1" />
                  Profile
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  setCurrentView("dashboard")
                  setIsMobileMenuOpen(false)
                }}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium w-full text-left",
                  currentView === "dashboard"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
              >
                <Home className="w-4 h-4 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentView("reader")
                  setIsMobileMenuOpen(false)
                }}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium w-full text-left",
                  currentView === "reader"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Speed Reader
              </button>
              <button
                onClick={() => {
                  setCurrentView("test")
                  setIsMobileMenuOpen(false)
                }}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium w-full text-left",
                  currentView === "test"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                Testing
              </button>
              <button
                onClick={() => {
                  setCurrentView("profile")
                  setIsMobileMenuOpen(false)
                }}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium w-full text-left",
                  currentView === "profile"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
              >
                <User className="w-4 h-4 inline mr-2" />
                Profile
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                Master Your Reading
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Enhance your reading speed and comprehension with our advanced training platform. 
                Track your progress and unlock your potential.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setCurrentView("reader")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Speed Reading
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setCurrentView("test")}
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Take Assessment
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Reading Speed</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.currentWPM} WPM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Accuracy</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(stats.accuracy)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Trophy className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.sessionsCompleted}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Star className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Comprehension</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(stats.comprehensionScore)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all cursor-pointer group" onClick={() => setCurrentView("reader")}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Speed Reading</h3>
                    <p className="text-gray-600 text-sm">
                      Train with customizable speed settings and track your progress
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all cursor-pointer group" onClick={() => setCurrentView("test")}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors">
                      <Brain className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehension Tests</h3>
                    <p className="text-gray-600 text-sm">
                      Assess your understanding with adaptive testing modules
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all cursor-pointer group" onClick={() => setCurrentView("profile")}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Analytics</h3>
                    <p className="text-gray-600 text-sm">
                      View detailed insights and track your improvement over time
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentView === "reader" && (
          <div className="space-y-6">
            {isReading ? (
              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Reading Session</h2>
                      <Badge variant="outline" className="text-sm">
                        Session {stats.sessionsCompleted + 1}
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-3 bg-gray-200" />
                  </div>

                  <div className="text-center mb-8">
                    <div
                      className={cn(
                        "font-mono font-bold text-gray-900 mb-8 transition-all duration-200 leading-relaxed",
                        settings.highlightMode && "bg-blue-100 px-6 py-4 rounded-xl shadow-sm",
                      )}
                      style={{ fontSize: `${settings.fontSize}px` }}
                    >
                      {currentWord}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                        <div className="flex items-center justify-center mb-2">
                          <Eye className="w-5 h-5 mr-2 text-blue-600" />
                          <span className="text-2xl font-bold text-blue-700">{stats.currentWPM}</span>
                        </div>
                        <p className="text-sm text-blue-600">Current WPM</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                        <div className="flex items-center justify-center mb-2">
                          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                          <span className="text-2xl font-bold text-green-700">{stats.averageWPM}</span>
                        </div>
                        <p className="text-sm text-green-600">Average WPM</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                        <div className="flex items-center justify-center mb-2">
                          <FileText className="w-5 h-5 mr-2 text-purple-600" />
                          <span className="text-2xl font-bold text-purple-700">{stats.wordsRead}</span>
                        </div>
                        <p className="text-sm text-purple-600">Words Read</p>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                        <div className="flex items-center justify-center mb-2">
                          <Clock className="w-5 h-5 mr-2 text-orange-600" />
                          <span className="text-2xl font-bold text-orange-700">{formatTime(stats.timeElapsed)}</span>
                        </div>
                        <p className="text-sm text-orange-600">Time</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                      <Button onClick={togglePlayPause} size="lg" className="px-8 bg-blue-600 hover:bg-blue-700">
                        {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                        {isPlaying ? "Pause" : "Play"}
                      </Button>
                      <Button onClick={resetReading} variant="outline" size="lg" className="px-6">
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Reset
                      </Button>
                      <Button onClick={stopReading} variant="outline" size="lg" className="px-6">
                        <Square className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Badge variant="outline" className="mr-1">Space</Badge>
                        Play/Pause
                      </span>
                      <span className="flex items-center">
                        <Badge variant="outline" className="mr-1">Esc</Badge>
                        Stop
                      </span>
                      <span className="flex items-center">
                        <Badge variant="outline" className="mr-1">R</Badge>
                        Reset
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 bg-white/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Text Input
                    </CardTitle>
                    <CardDescription>Enter or upload your text to begin speed reading</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Paste your text here..."
                      value={text}
                      onChange={(e) => handleTextChange(e.target.value)}
                      className="min-h-[150px] resize-none border-0 bg-white/80 backdrop-blur-sm"
                    />

                    <Separator />

                    <div className="text-center space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.pdf,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Text File
                      </Button>
                      <p className="text-xs text-gray-500">
                        Supports TXT, PDF, and DOCX files
                      </p>
                    </div>

                    {text && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-2">Text Statistics</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-blue-600">Words:</span>
                            <span className="font-medium ml-1">{text.split(/\s+/).filter(Boolean).length}</span>
                          </div>
                          <div>
                            <span className="text-blue-600">Characters:</span>
                            <span className="font-medium ml-1">{text.length}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-blue-600" />
                      Reading Settings
                    </CardTitle>
                    <CardDescription>Customize your reading experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="wpm-slider" className="text-sm font-medium">
                          Reading Speed
                        </Label>
                        <Badge variant="outline" className="text-sm">
                          {settings.wpm} WPM
                        </Badge>
                      </div>
                      <Slider
                        id="wpm-slider"
                        min={50}
                        max={1000}
                        step={25}
                        value={[settings.wpm]}
                        onValueChange={(value) =>
                          setSettings((prev) => ({ ...prev, wpm: value[0] }))
                        }
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Slow</span>
                        <span>Average (250)</span>
                        <span>Fast</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="font-size-slider" className="text-sm font-medium">
                          Font Size
                        </Label>
                        <Badge variant="outline" className="text-sm">
                          {settings.fontSize}px
                        </Badge>
                      </div>
                      <Slider
                        id="font-size-slider"
                        min={16}
                        max={72}
                        step={2}
                        value={[settings.fontSize]}
                        onValueChange={(value) =>
                          setSettings((prev) => ({ ...prev, fontSize: value[0] }))
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="highlight-mode" className="text-sm font-medium">
                          Highlight Mode
                        </Label>
                        <p className="text-xs text-gray-500">
                          Highlight current word for better focus
                        </p>
                      </div>
                      <Switch
                        id="highlight-mode"
                        checked={settings.highlightMode}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({ ...prev, highlightMode: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="pause-on-punctuation" className="text-sm font-medium">
                          Pause on Punctuation
                        </Label>
                        <p className="text-xs text-gray-500">
                          Brief pause at commas and periods
                        </p>
                      </div>
                      <Switch
                        id="pause-on-punctuation"
                        checked={settings.pauseAtPunctuation}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({ ...prev, pauseAtPunctuation: checked }))
                        }
                      />
                    </div>

                    <Button
                      onClick={startReading}
                      disabled={!text.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Reading Session
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {currentView === "test" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Reading Assessment</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Evaluate your reading comprehension with our adaptive testing system. 
                Choose from various difficulty levels and topics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testBatteries.map((battery) => (
                <Card key={battery.id} className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all cursor-pointer group" onClick={() => startTest(battery.id)}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="group-hover:text-blue-600 transition-colors">{battery.name}</span>
                      <Badge variant={battery.category === "advanced" ? "default" : "secondary"}>
                        {battery.category}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{battery.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{battery.estimatedTime} minutes</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>{battery.itemCount} questions</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="w-4 h-4 mr-2" />
                        <span>Difficulty: {battery.difficulty}</span>
                      </div>
                      <Button
                        className="w-full mt-4 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                        variant="outline"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Start Assessment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {testResults && (
              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-blue-600" />
                    Test Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {Math.round(testResults.overallScore)}%
                      </div>
                      <p className="text-sm text-gray-500">Overall Score</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {testResults.questionsCorrect}/{testResults.totalQuestions}
                      </div>
                      <p className="text-sm text-gray-500">Correct Answers</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {Math.round(testResults.timeSpent / 60)}m
                      </div>
                      <p className="text-sm text-gray-500">Time Spent</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Performance Breakdown</h4>
                      <div className="space-y-2">
                        {testResults.categoryScores.map((category) => (
                          <div key={category.category} className="flex justify-between items-center">
                            <span className="text-sm">{category.category}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={category.score} className="w-20 h-2" />
                              <span className="text-sm font-medium w-10 text-right">
                                {Math.round(category.score)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
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
                      <Button onClick={() => setCurrentView("reader")} className="bg-blue-600 hover:bg-blue-700">
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

        {currentView === "profile" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Progress</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Track your reading development and comprehension improvements over time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-200 rounded-lg">
                      <Eye className="h-6 w-6 text-blue-700" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Best Speed</p>
                      <p className="text-2xl font-bold text-blue-900">{Math.max(stats.currentWPM, stats.averageWPM)} WPM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-200 rounded-lg">
                      <Target className="h-6 w-6 text-green-700" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Accuracy Rate</p>
                      <p className="text-2xl font-bold text-green-900">{Math.round(stats.accuracy)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-200 rounded-lg">
                      <Trophy className="h-6 w-6 text-purple-700" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.sessionsCompleted}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-200 rounded-lg">
                      <Star className="h-6 w-6 text-orange-700" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600">Comprehension</p>
                      <p className="text-2xl font-bold text-orange-900">{Math.round(stats.comprehensionScore)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Reading Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Current Speed</span>
                        <span>{stats.currentWPM} WPM</span>
                      </div>
                      <Progress value={(stats.currentWPM / 500) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Comprehension</span>
                        <span>{Math.round(stats.comprehensionScore)}%</span>
                      </div>
                      <Progress value={stats.comprehensionScore} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Accuracy</span>
                        <span>{Math.round(stats.accuracy)}%</span>
                      </div>
                      <Progress value={stats.accuracy} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Speed Reading Session</p>
                        <p className="text-sm text-gray-600">Achieved {stats.currentWPM} WPM</p>
                      </div>
                      <Badge variant="outline">Today</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Comprehension Test</p>
                        <p className="text-sm text-gray-600">Scored {Math.round(stats.comprehensionScore)}%</p>
                      </div>
                      <Badge variant="outline">Yesterday</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Reading Goal Achieved</p>
                        <p className="text-sm text-gray-600">Completed {stats.sessionsCompleted} sessions</p>
                      </div>
                      <Badge variant="outline">This week</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
