import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

declare global {
  interface Window {
    electronAPI?: {
      openExternal: (url: string) => Promise<void>
    }
  }
}

interface DoneProps {
  onRestart: () => void
}

export default function Done({ onRestart }: DoneProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        className="max-w-lg text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <motion.h2
          className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {t('configSuccess')}
        </motion.h2>

        <motion.p
          className="text-slate-600 dark:text-slate-400 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          OpenClaw 已安装并配置完成。您可以在终端运行 <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">openclaw</code> 开始使用。
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={() => window.electronAPI?.openExternal('https://docs.openclaw.ai')}
            className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('openclawDocs')}
          </motion.button>
          <motion.button
            onClick={onRestart}
            className="px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            重新配置
          </motion.button>
        </motion.div>

        <motion.div
          className="mt-12 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-left text-sm text-slate-600 dark:text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">常用命令：</p>
          <ul className="space-y-1 font-mono text-xs">
            <li><code>openclaw run "你好"</code> - 运行对话</li>
            <li><code>openclaw gateway start</code> - 启动网关（飞书等）</li>
            <li><code>openclaw dashboard</code> - 打开控制面板</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  )
}
