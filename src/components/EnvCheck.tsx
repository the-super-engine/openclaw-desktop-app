import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

declare global {
  interface Window {
    electronAPI?: {
      checkNode: () => Promise<{ installed: boolean; version: string | null }>
      checkOpenClaw: () => Promise<{ installed: boolean; version: string | null }>
      openExternal: (url: string) => Promise<void>
    }
  }
}

interface EnvCheckProps {
  onNext: () => void
  onBack: () => void
}

export default function EnvCheck({ onNext, onBack }: EnvCheckProps) {
  const { t } = useTranslation()
  const [nodeStatus, setNodeStatus] = useState<{ installed: boolean; version: string | null } | null>(null)
  const [openclawStatus, setOpenclawStatus] = useState<{ installed: boolean; version: string | null } | null>(null)

  useEffect(() => {
    const check = async () => {
      if (window.electronAPI) {
        const [node, openclaw] = await Promise.all([
          window.electronAPI.checkNode(),
          window.electronAPI.checkOpenClaw(),
        ])
        setNodeStatus(node)
        setOpenclawStatus(openclaw)
      } else {
        setNodeStatus({ installed: true, version: '20.0.0' })
        setOpenclawStatus({ installed: false, version: null })
      }
    }
    check()
  }, [])

  const nodeOk = nodeStatus?.installed ?? false
  const openclawOk = openclawStatus?.installed ?? false
  const canProceed = nodeOk

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        className="max-w-xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8 text-center">
          {t('checkEnv')}
        </h2>

        <div className="space-y-4">
          <motion.div
            className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
              nodeOk
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
            }`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    nodeOk ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{t('nodeRequired')}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {nodeStatus ? (nodeOk ? `${t('nodeInstalled')}: ${nodeStatus.version}` : t('nodeNotInstalled')) : '检测中...'}
                  </p>
                </div>
              </div>
              {!nodeOk && (
                <motion.button
                  onClick={() => window.electronAPI?.openExternal('https://nodejs.org/')}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('downloadNode')}
                </motion.button>
              )}
            </div>
          </motion.div>

          <motion.div
            className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
              openclawOk
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    openclawOk ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
                  }`}
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">OpenClaw</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {openclawStatus ? (openclawOk ? `${t('openclawInstalled')}: ${openclawStatus.version}` : t('openclawNotInstalled')) : '检测中...'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

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
            disabled={!canProceed}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              canProceed
                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                : 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed'
            }`}
            whileHover={canProceed ? { scale: 1.02 } : {}}
            whileTap={canProceed ? { scale: 0.98 } : {}}
          >
            {t('next')}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
