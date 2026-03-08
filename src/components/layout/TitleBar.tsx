/**
 * TitleBar - Enterprise style with subtle gradient
 */
import { useState, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';
import appLogo from '@/assets/logo.png';
import { invokeIpc } from '@/lib/api-client';

const isMac = window.electron?.platform === 'darwin';

export function TitleBar() {
  if (isMac) {
    return (
      <div className="drag-region h-11 shrink-0 border-b border-border/60 bg-background/95 backdrop-blur-sm" />
    );
  }

  return <WindowsTitleBar />;
}

function WindowsTitleBar() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    invokeIpc('window:isMaximized').then((val) => setMaximized(val as boolean));
  }, []);

  const handleMinimize = () => invokeIpc('window:minimize');
  const handleMaximize = () => {
    invokeIpc('window:maximize').then(() =>
      invokeIpc('window:isMaximized').then((val) => setMaximized(val as boolean))
    );
  };
  const handleClose = () => invokeIpc('window:close');

  return (
    <div className="drag-region flex h-11 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-4">
      <div className="no-drag flex items-center gap-3">
        <img src={appLogo} alt="开放龙虾宝-桌面版" className="h-5 w-auto" />
        <span className="text-sm font-medium text-foreground/90">
          开放龙虾宝-桌面版
        </span>
      </div>

      <div className="no-drag flex h-full">
        {[
          { Icon: Minus, onClick: handleMinimize, title: 'Minimize' },
          {
            Icon: Square,
            onClick: handleMaximize,
            title: maximized ? 'Restore' : 'Maximize',
          },
          { Icon: X, onClick: handleClose, title: 'Close' },
        ].map(({ Icon, onClick, title }) => (
          <button
            key={title}
            onClick={onClick}
            className="flex h-full w-11 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
            title={title}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
