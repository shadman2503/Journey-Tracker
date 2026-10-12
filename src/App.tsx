import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { DashboardPage } from '@/pages/DashboardPage';
import { SyllabusPage } from '@/pages/SyllabusPage';
import { StudyLogPage } from '@/pages/StudyLogPage';
import { MockTestsPage } from '@/pages/MockTestsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { MistakesPage } from '@/pages/MistakesPage';
import { JourneyPage } from '@/pages/JourneyPage';
import { useAppStore } from '@/stores/useAppStore';
import { ToastContainer } from '@/components/common/ToastContainer';

export const App: React.FC = () => {
  const { theme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <div className='min-h-screen flex flex-col bg-background text-foreground'>
        {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
        <a
          href='#main-content'
          className='sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        >
          Skip to main content
        </a>

        <Navbar />
        <main
          id='main-content'
          tabIndex={-1}
          className='flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6 focus:outline-none'
        >
          <Routes>
            <Route path='/' element={<DashboardPage />} />
            <Route path='/syllabus' element={<SyllabusPage />} />
            <Route path='/study-log' element={<StudyLogPage />} />
            <Route path='/mock-tests' element={<MockTestsPage />} />
            <Route path='/analytics' element={<AnalyticsPage />} />
            <Route path='/mistakes' element={<MistakesPage />} />
            <Route path='/journey' element={<JourneyPage />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </main>
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
};

export default App;
