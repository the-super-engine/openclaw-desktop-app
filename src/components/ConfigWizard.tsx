import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

declare global {
  interface Window {
    electronAPI?: {
      readConfig: () => Promise<{ success: boolean; config: object | null }>
      writeConfig: (config: object) => Promise<{ success: boolean }>
      openExternal: (url: string) => Promise<void>
    }
  }
}

interface ConfigWizardProps {
  onNext: () => void
  onBack: () => void
}

type ModelProvider = 'minimax' | 'deepseek'

export default function ConfigWizard({ onNext, onBack }: ConfigWizardProps) {
  const { t } = useTranslation()
  const [provider, setProvider] = useState<ModelProvider>('minimax')
  const [minimaxKey, setMinimaxKey] = useState('')
  const [deepseekKey, setDeepseekKey] = useState('')
  const [feishuAppId, setFeishuAppId] = useState('')
  const [feishuSecret, setFeishuSecret] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (window.electronAPI) {
        const { success, config } = await window.electronAPI.readConfig()
        if (success && config && typeof config === 'object') {
          const c = config as Record<string, unknown>
          const env = c.env as Record<string, string> | undefined
          if (env?.MINIMAX_API_KEY) setMinimaxKey(env.MINIMAX_API_KEY)
          const auth = c.auth as Record<string, unknown> | undefined
          const profiles = auth?.profiles as Record<string, Record<string, unknown>> | undefined
          if (profiles?.['deepseek:default']?.apiKey) {
            setDeepseekKey(String(profiles['deepseek:default'].apiKey))
          }
        }
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      let config: Record<string, unknown> = {}
      if (window.electronAPI) {
        const { success, config: existing } = await window.electronAPI.readConfig()
        if (success && existing && typeof existing === 'object') {
          config = { ...(existing as Record<string, unknown>) }
        }
      }

      config.env = config.env || {}
      const env = config.env as Record<string, string>
      if (minimaxKey) env.MINIMAX_API_KEY = minimaxKey

      config.auth = config.auth || {}
      const auth = config.auth as Record<string, unknown>
      auth.profiles = auth.profiles || {}
      const profiles = auth.profiles as Record<string, Record<string, unknown>>
      if (deepseekKey) {
        profiles['deepseek:default'] = {
          provider: 'deepseek',
          mode: 'api_key',
          apiKey: deepseekKey,
        }
      }

      config.agents = config.agents || {}
      const agents = config.agents as Record<string, unknown>
      agents.defaults = agents.defaults || {}
      const defaults = agents.defaults as Record<string, unknown>
      defaults.model = defaults.model || {}
      const model = defaults.model as Record<string, string>
      model.primary = provider === 'minimax' ? 'minimax/abab6.5s-chat' : 'deepseek/deepseek-chat'

      if (feishuAppId || feishuSecret) {
        config.channels = config.channels || {}
        const channels = config.channels as Record<string, unknown>
        channels.feishu = {
          appId: feishuAppId,
          appSecret: feishuSecret,
        }
      }

      if (window.electronAPI) {
        const { success } = await window.electronAPI.writeConfig(config)
        if (!success) setError(t('configFailed'))
      }
      onNext()
    } catch {
      setError(t('configFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center px-6 py-12">
      <motion.div
        className="max-w-2xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8 text-center">
          {t('configure')}
        </h2>

        {/* 飞书配置 - 高优先级 */}
        <motion.div
          className="mb-8 p-6 rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500 text-white">
              优先配置
            </span>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t('feishuPriority')}</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{t('feishuDesc')}</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('feishuAppId')}
              </label>
              <input
                type="text"
                value={feishuAppId}
                onChange={(e) => setFeishuAppId(e.target.value)}
                placeholder="cli_xxxxxxxx"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('feishuSecret')}
              </label>
              <input
                type="password"
                value={feishuSecret}
                onChange={(e) => setFeishuSecret(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => window.electronAPI?.openExternal('https://open.feishu.cn/app')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('getFeishuCreds')} →
            </button>
          </div>
        </motion.div>

        {/* 模型配置 */}
        <motion.div
          className="mb-8 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">{t('modelConfig')}</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('defaultModel')}</p>
              <div className="flex gap-4">
                <motion.button
                  onClick={() => setProvider('minimax')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    provider === 'minimax'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="font-medium text-slate-800 dark:text-slate-100">{t('minimax')}</span>
                  <span className="block text-xs text-slate-500 mt-1">默认</span>
                </motion.button>
                <motion.button
                  onClick={() => setProvider('deepseek')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    provider === 'deepseek'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="font-medium text-slate-800 dark:text-slate-100">{t('deepseek')}</span>
                  <span className="block text-xs text-emerald-500">{t('recommended')}</span>
                </motion.button>
              </div>
            </div>
            {provider === 'minimax' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Minimax API Key
                </label>
                <input
                  type="password"
                  value={minimaxKey}
                  onChange={(e) => setMinimaxKey(e.target.value)}
                  placeholder={t('enterApiKey')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    window.electronAPI?.openExternal('https://api.minimax.chat/')
                  }}
                  className="text-xs text-blue-500 mt-1 inline-block"
                >
                  {t('minimaxDocs')}
                </a>
              </motion.div>
            )}
            {provider === 'deepseek' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  DeepSeek API Key
                </label>
                <input
                  type="password"
                  value={deepseekKey}
                  onChange={(e) => setDeepseekKey(e.target.value)}
                  placeholder={t('enterApiKey')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    window.electronAPI?.openExternal('https://platform.deepseek.com/')
                  }}
                  className="text-xs text-blue-500 mt-1 inline-block"
                >
                  {t('deepseekDocs')}
                </a>
              </motion.div>
            )}
          </div>
        </motion.div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between">
          <motion.button
            onClick={onBack}
            className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('back')}
          </motion.button>
          <motion.button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/30 disabled:opacity-50"
            whileHover={!saving ? { scale: 1.02 } : {}}
            whileTap={!saving ? { scale: 0.98 } : {}}
          >
            {saving ? '保存中...' : t('finish')}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
