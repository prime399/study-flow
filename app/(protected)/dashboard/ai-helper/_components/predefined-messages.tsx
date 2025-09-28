/**
 * Predefined message suggestions for users
 * Provides quick-start options for common queries
 */

import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"

export const PREDEFINED_MESSAGES = [
  // Focus & Concentration
  "How can I improve my study focus and avoid distractions?",
  "What techniques can help me concentrate better during long study sessions?",
  "How do I deal with mental fatigue while studying?",
  
  // Study Techniques & Methods
  "What's the best study technique for me based on my study patterns?",
  "Should I use active recall or spaced repetition for better retention?",
  "How can I make my study sessions more effective and productive?",
  "What's the optimal study session length for maximum learning?",
  
  // Time Management & Planning
  "Help me create a personalized study schedule based on my habits",
  "How can I better manage my time between different subjects?",
  "What's the best way to prioritize my study topics?",
  "How do I balance study time with breaks for optimal performance?",
  
  // Performance Analysis
  "Analyze my study completion rate and suggest improvements",
  "What patterns in my study data should I be concerned about?",
  "How does my study performance compare to optimal practices?",
  "What are my biggest study challenges based on my statistics?",
  
  // Motivation & Habits
  "How can I stay motivated when my completion rate is low?",
  "What strategies help build consistent daily study habits?",
  "How do I overcome procrastination and study resistance?",
  "What rewards system would work best for my study goals?",
  
  // Health & Wellness
  "How can I prevent burnout while maintaining good study habits?",
  "What's the ideal balance between study time and rest?",
  "How does my current study schedule affect my well-being?",
  "Tips for maintaining energy levels throughout study sessions",
] as const

interface PredefinedMessagesProps {
  onMessageSelect: (message: string) => void
  isLoading: boolean
}

// Organize messages by category for better UX
const MESSAGE_CATEGORIES = [
  {
    title: "🎯 Focus & Concentration",
    messages: PREDEFINED_MESSAGES.slice(0, 3),
    color: "border-blue-200 hover:border-blue-300",
  },
  {
    title: "📚 Study Techniques",
    messages: PREDEFINED_MESSAGES.slice(3, 7),
    color: "border-green-200 hover:border-green-300",
  },
  {
    title: "⏰ Time Management",
    messages: PREDEFINED_MESSAGES.slice(7, 11),
    color: "border-purple-200 hover:border-purple-300",
  },
  {
    title: "📊 Performance Analysis",
    messages: PREDEFINED_MESSAGES.slice(11, 15),
    color: "border-orange-200 hover:border-orange-300",
  },
  {
    title: "💪 Motivation & Habits",
    messages: PREDEFINED_MESSAGES.slice(15, 19),
    color: "border-pink-200 hover:border-pink-300",
  },
  {
    title: "🌱 Health & Wellness",
    messages: PREDEFINED_MESSAGES.slice(19),
    color: "border-emerald-200 hover:border-emerald-300",
  },
] as const

export function PredefinedMessages({ onMessageSelect, isLoading }: PredefinedMessagesProps) {
  return (
    <div className="flex h-full flex-col items-center justify-start py-6 text-center">
      <div className="mb-6">
        <Bot className="mx-auto mb-3 h-12 w-12 text-primary" />
        <h3 className="mb-2 text-xl font-semibold text-foreground">
          How can I help you study better?
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Choose from popular questions below or ask me anything about study techniques, 
          time management, and personalized advice based on your study patterns.
        </p>
      </div>
      
      <div className="w-full max-w-4xl space-y-6 overflow-y-auto">
        {MESSAGE_CATEGORIES.map((category) => (
          <div key={category.title} className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground text-left">
              {category.title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {category.messages.map((message) => (
                <Button
                  key={message}
                  variant="outline"
                  className={`h-auto whitespace-normal text-left text-sm p-3 transition-colors ${category.color}`}
                  onClick={() => onMessageSelect(message)}
                  disabled={isLoading}
                >
                  {message}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 space-y-2 text-center">
        <div className="text-xs text-muted-foreground">
          💡 Tip: The more specific your question, the better I can help!
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
          <span>Powered by</span>
          <span className="font-semibold text-primary">Heroku Inference</span>
          <span>•</span>
          <span>AI Study Assistant</span>
        </div>
      </div>
    </div>
  )
}