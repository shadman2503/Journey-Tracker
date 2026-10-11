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
        <Navbar />
        <main className='flex-1 container mx-auto px-4 py-6'>
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
      </div>
    </BrowserRouter>
  );
};

export default App;
