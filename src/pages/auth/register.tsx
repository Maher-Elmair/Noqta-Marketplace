/**
 * Register page
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { authApi } from '@/services/api/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { ROUTES } from '@/lib/constants'
import { useTranslation } from '@/hooks/use-translation'
import { Mail, Lock, Eye, EyeOff, Loader2, User, Phone, X } from 'lucide-react'
import { TypewriterEffect } from '@/components/ui/typewriter-effect'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Validation States
  const [passwordMatch, setPasswordMatch] = useState(false)

  const { login } = useAuthStore()
  const { toast } = useToast()
  const t = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    setPasswordMatch(password === confirmPassword && password !== '')
  }, [password, confirmPassword])

  const isValid = 
    name && 
    email && 
    password.length >= 8 &&
    passwordMatch && 
    agreeTerms

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsLoading(true)

    try {
      const response = await authApi.register({
        name,
        email,
        password,
        phone: phone || undefined,
      })
      login(response.data.user, response.data.token)
      toast({
        title: t('auth.accountCreated'),
        description: t('auth.welcomeToNoqta'),
      })
      navigate(ROUTES.HOME)
    } catch (error) {
      toast({
        title: t('auth.registerFailed'),
        description:
          error instanceof Error
            ? error.message
            : t('auth.registrationError'),
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
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          
          {/* Header outside Card */}
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('auth.register')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('auth.createAccountDescription')}
            </p>
          </div>

          <Card className="border-none shadow-none sm:border sm:shadow-sm">
             <CardContent className="grid gap-4 pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('auth.name')}</Label>
                  <div className="relative">
                    <User className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder={t('auth.fullName')}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="ps-9"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="ps-9"
                      required
                    />
                  </div>
                </div>

                {/* Phone (Optional) */}
                <div className="grid gap-2">
                  <Label htmlFor="phone">
                    {t('auth.phone')} <span className="text-muted-foreground text-xs">({t('auth.optional')})</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="01xxxxxxxxx"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9+]/g, '');
                          setPhone(val);
                      }}
                      className="ps-9"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="ps-9 pe-9"
                      required
                    />
                     <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute end-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="ps-9 pe-9"
                      required
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute end-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                  </div>
                  {confirmPassword && !passwordMatch && (
                       <p className="text-xs text-destructive flex items-center gap-1">
                          <X className="h-3 w-3" /> {t('auth.passwordMismatch')}
                       </p>
                  )}
                </div>

                {/* Terms */}
                 <div className="flex items-start gap-3 mt-2">
                    <Checkbox 
                      id="terms" 
                      checked={agreeTerms}
                      onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {t('auth.agreeToTerms')} <Link to="/terms" className="text-primary hover:underline underline-offset-4">{t('auth.termsAndConditions')}</Link> {t('auth.and')} <Link to="/privacy" className="text-primary hover:underline underline-offset-4">{t('auth.privacyPolicy')}</Link>
                    </Label>
                 </div>

                <Button disabled={isLoading || !isValid} type="submit" className="w-full">
                  {isLoading && (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  )}
                  {t('auth.register')}
                </Button>
              </form>
             </CardContent>
          </Card>

          {/* Links below Card */}
          <div className="text-center text-sm">
             <Link to="/login" className="text-muted-foreground hover:text-primary hover:underline transition-colors">
               {t('auth.alreadyHaveAccountQuestion')} <span className="font-semibold text-primary ms-1">{t('auth.login')}</span>
             </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
