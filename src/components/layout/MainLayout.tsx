/**
 * Main Layout
 * Enterprise-style layout: TitleBar + Sidebar + Content with smooth transitions
 */
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TitleBar } from './TitleBar';

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

export function MainLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <motion.main
          key={pathname}
          initial="initial"
          animate="animate"
          variants={pageVariants}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 overflow-auto p-6 lg:p-8"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
