/**
 * Footer component
 */


import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useTranslation } from '@/hooks/use-translation'

import { useAuthStore } from '@/stores/auth-store'

export function Footer() {
  const t = useTranslation()

  const { user, isAuthenticated } = useAuthStore()

  const getProfilePath = () => {
    if (!user) return ROUTES.LOGIN
    switch (user?.role) {
      case 'buyer': return ROUTES.BUYER.PROFILE
      case 'seller': return ROUTES.SELLER.PROFILE
      case 'admin': return ROUTES.ADMIN.PROFILE
      default: return ROUTES.HOME
    }
  }

  const sellerLink = isAuthenticated ? getProfilePath() : ROUTES.REGISTER

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800 mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About Section */}
          <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-start">
            <Link to={ROUTES.HOME} className="text-2xl font-bold text-white tracking-tight">
              {t('common.appName')}
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              {t('footer.aboutText')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-start">
            <h3 className="font-semibold mb-6 text-zinc-100 tracking-wide">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to={ROUTES.HOME}
                  className="hover:text-white transition-colors duration-200"
                >
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link
                  to="/vendors"
                  className="hover:text-white transition-colors duration-200"
                >
                  {t('nav.vendors')}
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.BUYER.SEARCH}
                  className="hover:text-white transition-colors duration-200"
                >
                  {t('nav.search')}
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.HOME}
                  className="hover:text-white transition-colors duration-200"
                >
                  {t('nav.categories')}
                </Link>
              </li>
              {isAuthenticated && user?.role === 'buyer' && (
                <li>
                  <Link
                    to={ROUTES.BUYER.FAVORITES}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {t('nav.favorites')}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* For Sellers */}
          <div className="text-center md:text-start">
            <h3 className="font-semibold mb-6 text-zinc-100 tracking-wide">
              {t('footer.forSellers')}
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to={sellerLink}
                  className="hover:text-white transition-colors duration-200"
                >
                  {t('footer.startSelling')}
                </Link>
              </li>
              <li>
                <Link
                  to={sellerLink}
                  className="hover:text-white transition-colors duration-200"
                >
                  {t('footer.manageProducts')}
                </Link>
              </li>
              <li>
                <Link
                  to={sellerLink}
                  className="hover:text-white transition-colors duration-200"
                >
                  {t('footer.createSellerAccount')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-start">
            <h3 className="font-semibold mb-6 text-zinc-100 tracking-wide">
              {t('footer.contactUs')}
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-1 md:gap-3">
                <span className="font-medium text-zinc-300 min-w-[60px]">{t('footer.email')}:</span>
                <span className="text-zinc-500">support@noqta.com</span>
              </li>
              <li className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-1 md:gap-3">
                <span className="font-medium text-zinc-300 min-w-[60px]">{t('footer.phone')}:</span>
                <span className="text-zinc-500">+966 50 123 4567</span>
              </li>
              <li className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-1 md:gap-3">
                <span className="font-medium text-zinc-300 min-w-[60px]">{t('footer.address')}:</span>
                <span className="text-zinc-500">{t('footer.addressValue')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-900 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-zinc-600 text-center md:text-left">
              &copy; {new Date().getFullYear()} {t('common.appName')}. {t('footer.rights')}.
            </p>
            <div className="flex items-center gap-8 text-sm text-zinc-500">
              <Link
                to={ROUTES.HOME}
                className="hover:text-white transition-colors duration-200"
              >
                {t('footer.privacyPolicy')}
              </Link>
              <Link
                to={ROUTES.HOME}
                className="hover:text-white transition-colors duration-200"
              >
                {t('footer.termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
