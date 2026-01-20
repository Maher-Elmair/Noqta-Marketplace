/**
 * Theme toggle component - Direct toggle between light and dark
 */

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { useTranslation } from '@/hooks/use-translation'

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore()
  const t = useTranslation()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={t('theme.toggle')}
      title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  )
}

