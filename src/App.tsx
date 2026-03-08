import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import Welcome from './components/Welcome'
import EnvCheck from './components/EnvCheck'
import InstallStep from './components/InstallStep'
import ConfigWizard from './components/ConfigWizard'
import Done from './components/Done'
import Header from './components/Header'

type Step = 'welcome' | 'env' | 'install' | 'config' | 'done'

function App() {
  const { i18n } = useTranslation()
  const [step, setStep] = useState<Step>('welcome')
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const handleNext = (nextStep?: Step) => {
    if (nextStep) {
      setStep(nextStep)
    } else {
      const order: Step[] = ['welcome', 'env', 'install', 'config', 'done']
      const idx = order.indexOf(step)
      if (idx < order.length - 1) setStep(order[idx + 1])
    }
  }

  const handleBack = () => {
    const order: Step[] = ['welcome', 'env', 'install', 'config', 'done']
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Header
        step={step}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onLanguageChange={(lang) => i18n.changeLanguage(lang)}
      />

      <main className="flex-1 overflow-auto pt-16">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Welcome onNext={() => handleNext('env')} />
            </motion.div>
          )}
          {step === 'env' && (
            <motion.div
              key="env"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EnvCheck onNext={() => handleNext('install')} onBack={handleBack} />
            </motion.div>
          )}
          {step === 'install' && (
            <motion.div
              key="install"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InstallStep onNext={() => handleNext('config')} onBack={handleBack} />
            </motion.div>
          )}
          {step === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ConfigWizard onNext={() => handleNext('done')} onBack={handleBack} />
            </motion.div>
          )}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Done onRestart={() => setStep('welcome')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
