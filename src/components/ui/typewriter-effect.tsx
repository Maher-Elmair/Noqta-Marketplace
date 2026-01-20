import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TypewriterEffectProps {
  text: string
  className?: string
  loop?: boolean
  delay?: number
}

export function TypewriterEffect({ 
  text, 
  className,
  loop = true,
  delay = 3000 // Delay before restarting
}: TypewriterEffectProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prevText, setPrevText] = useState(text)

  if (prevText !== text) {
    setPrevText(text)
    setDisplayText('')
    setCurrentIndex(0)
  }

  useEffect(() => {
    // If typing logic
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50) // Speed control (slower for better readability)
      return () => clearTimeout(timeout)
    } 
    // If finished typing and loop is enabled
    else if (loop) {
      const timeout = setTimeout(() => {
        setDisplayText('') // Clear text
        setCurrentIndex(0) // Reset index to start from beginning
      }, delay)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, loop, delay])



  return (
    <p className={cn("text-lg text-white/90 leading-relaxed animate-in fade-in duration-500", className)}>
      {displayText}
      <span className="animate-pulse">|</span>
    </p>
  )
}
