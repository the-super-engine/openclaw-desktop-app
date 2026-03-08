import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

declare global {
  interface Window {
    electronAPI?: {
      checkOpenClaw: () => Promise<{ installed: boolean; version: string | null }>
      installOpenClaw: () => Promise<{ success: boolean; output: string }>
    }
  }
}

interface InstallStepProps {
  onNext: () => void
  onBack: () => void
}

export default function InstallStep({ onNext, onBack }: InstallStepProps) {
  const { t } = useTranslation()
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [output, setOutput] = useState('')

  const handleInstall = async () => {
    setInstalling(true)
    setError(null)
    setOutput('')
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.installOpenClaw()
        setOutput(result.output)
        if (result.success) {
          setInstalled(true)
        } else {
          setError(result.output || '安装失败')
        }
      } else {
        setInstalled(true)
      }
    } catch (err: unknown) {
      const e = err as { output?: string }
      setError(e?.output || '安装失败')
    } finally {
      setInstalling(false)
    }
  }

  useEffect(() => {
    const check = async () => {
      if (window.electronAPI) {
        const { installed: ok } = await window.electronAPI.checkOpenClaw()
        if (ok) setInstalled(true)
      }
    }
    check()
  }, [])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        className="max-w-xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8 text-center">
          {t('installOpenClaw')}
        </h2>

        <motion.div
          className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {installed ? (
            <div className="text-center py-8">
              <motion.div
                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                OpenClaw 已安装完成
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-2">可以继续配置</p>
            </div>
          ) : (
            <>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-center">
                将执行 <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">npm install -g openclaw@latest</code>
              </p>
              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              {output && (
                <pre className="mb-4 p-4 rounded-lg bg-slate-900 text-slate-100 text-xs overflow-auto max-h-40">
                  {output}
                </pre>
              )}
              <motion.button
                onClick={handleInstall}
                disabled={installing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!installing ? { scale: 1.01 } : {}}
                whileTap={!installing ? { scale: 0.99 } : {}}
              >
                {installing ? t('installing') : t('installNow')}
              </motion.button>
            </>
          )}
        </motion.div>

        <div className="mt-8 flex justify-between">
          <motion.button
            onClick={onBack}
            className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('back')}
          </motion.button>
          <motion.button
            onClick={onNext}
            disabled={!installed}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              installed
                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                : 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed'
            }`}
            whileHover={installed ? { scale: 1.02 } : {}}
            whileTap={installed ? { scale: 0.98 } : {}}
          >
            {t('next')}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
