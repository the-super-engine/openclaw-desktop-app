/**
 * Star Office UI - Pixel office dashboard
 * Lazy-loaded; backend starts only when user navigates here
 */
import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { invokeIpc } from '@/lib/api-client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

type Status = 'idle' | 'installing' | 'starting' | 'ready' | 'error';

export function Office() {
  const { t } = useTranslation(['office', 'common']);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  const ensureReady = async () => {
    setError(null);
    try {
      const installed = await invokeIpc<boolean>('starOffice:isInstalled');
      if (!installed) {
        setStatus('installing');
        const install = await invokeIpc<{ success: boolean; error?: string }>('starOffice:install');
        if (!install.success) {
          throw new Error(install.error || 'Install failed');
        }
      }
      setStatus('starting');
      const start = await invokeIpc<{ success: boolean; url?: string; error?: string }>('starOffice:start');
      if (!start.success) {
        throw new Error(start.error || 'Start failed');
      }
      setIframeUrl(start.url || 'http://127.0.0.1:19000');
      setStatus('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus('error');
    }
  };

  useEffect(() => {
    ensureReady();
    return () => {
      // Keep backend running for quick return; user can restart app to fully stop
    };
  }, []);

  const handleRetry = () => {
    setStatus('idle');
    setIframeUrl(null);
    ensureReady();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{t('office:title')}</h1>
          {status === 'ready' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(iframeUrl || '', '_blank')}
              className="gap-1.5"
            >
              <ExternalLink className="h-4 w-4" />
              {t('office:openInBrowser')}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-muted/30">
        <AnimatePresence mode="wait">
          {status === 'installing' && (
            <motion.div
              key="installing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-4"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t('office:installing')}</p>
            </motion.div>
          )}

          {status === 'starting' && (
            <motion.div
              key="starting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-4"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t('office:starting')}</p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-4 px-4"
            >
              <p className="text-center text-sm text-destructive">{error}</p>
              <Button onClick={handleRetry} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                {t('common:actions.retry')}
              </Button>
              <p className="text-sm text-muted-foreground">{t('office:installHint')}</p>
            </motion.div>
          )}

          {status === 'ready' && iframeUrl && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              <iframe
                src={iframeUrl}
                title="Star Office"
                className="h-full w-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
