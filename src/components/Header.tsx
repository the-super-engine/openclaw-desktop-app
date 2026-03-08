import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

interface HeaderProps {
  step: string
  darkMode: boolean
  onToggleTheme: () => void
  onLanguageChange: (lang: string) => void
}

const steps = ['welcome', 'env', 'install', 'config', 'done']

export default function Header({ step, darkMode, onToggleTheme, onLanguageChange }: HeaderProps) {
  const { t, i18n } = useTranslation()
  const currentIdx = steps.indexOf(step)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{t('appName')}</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-1">
            {steps.map((s, i) => (
              <motion.div
                key={s}
                className="flex items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i <= currentIdx
                      ? 'bg-blue-500 scale-110'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
                {i < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-0.5 rounded transition-colors ${
                      i < currentIdx ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-600'
                    }`}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLanguageChange(i18n.language === 'zh' ? 'en' : 'zh')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {i18n.language === 'zh' ? 'EN' : '中文'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  )
}
