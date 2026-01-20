/**
 * Login page
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { authApi } from '@/services/api/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { ROUTES } from '@/lib/constants'
import { useTranslation } from '@/hooks/use-translation'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { TypewriterEffect } from '@/components/ui/typewriter-effect'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()
  const { toast } = useToast()
  const t = useTranslation()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authApi.login({ email, password })
      login(response.data.user, response.data.token)
      toast({
        title: t('auth.loginSuccess'),
        description: t('common.welcome'),
      })

      // Redirect based on role
      if (response.data.user.role === 'buyer') {
        navigate(ROUTES.HOME)
      } else if (response.data.user.role === 'seller') {
        navigate(ROUTES.SELLER.DASHBOARD)
      } else if (response.data.user.role === 'admin') {
        navigate(ROUTES.ADMIN.DASHBOARD)
      } else {
        navigate(ROUTES.HOME)
      }
    } catch (error) {
      toast({
        title: t('auth.loginFailed'),
        description:
          error instanceof Error
            ? error.message
            : t('errors.genericErrorDescription'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-2">
      {/* Left Column - Visual */}
      <div className="hidden md:flex md:h-[350px] lg:h-full flex-col justify-between bg-zinc-900 text-white relative overflow-hidden">
         <div className="absolute inset-0">
             <img 
              src="/assets/images/auth/photo-auth.jpg" 
              alt="Noqta Authentication Background" 
              className="h-full w-full object-cover opacity-90"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
         </div>
        
        <div className="relative z-20 flex flex-col justify-center h-full p-10 text-white max-w-lg mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold leading-tight tracking-tighter">
                {t('common.appName')}
              </h2>
               {/* Fixed Height Container to prevent layout shift */}
               <div className="min-h-[140px] flex items-start w-full">
                  <TypewriterEffect text={t('home.storyText')} className="text-start block w-full" />
               </div>
            </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 bg-background lg:p-10">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          
          {/* Header outside Card */}
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('auth.login')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('auth.welcomeBack')}
            </p>
          </div>

          <Card className="border-none shadow-none sm:border sm:shadow-sm">
             <CardContent className="grid gap-4 pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t('auth.password')}</Label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                      >
                        {t('auth.forgotPassword')}
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 pr-9"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </div>
                  <Button disabled={isLoading} className="w-full mt-2">
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t('auth.login')}
                  </Button>
              </form>
             </CardContent>
          </Card>

          {/* Links below Card */}
          <div className="text-center text-sm">
             <Link to="/register" className="text-muted-foreground hover:text-primary hover:underline transition-colors">
                 {t('auth.dontHaveAccount')} <span className="font-semibold text-primary ms-1">{t('auth.register')}</span>
             </Link>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground text-center">
             <p className="font-semibold mb-1">Demo Accounts:</p>
             <div className="grid grid-cols-1 gap-1">
                <span>buyer@noqta.com / password</span>
                <span>seller@noqta.com / password</span>
                <span>admin@noqta.com / password</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
