import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CreatorsPage from './pages/CreatorsPage';
import ProjectsPage from './pages/ProjectsPage';
import CampaignsPage from './pages/CampaignsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MessagesPage from './pages/MessagesPage';
import AgreementsPage from './pages/AgreementsPage';
import CampaignAnalyticsPage from './pages/CampaignAnalyticsPage';
import CreatorAnalyticsPage from './pages/CreatorAnalyticsPage';
import ProjectModal from './components/Modals/ProjectModal';
import CreatorModal from './components/Modals/CreatorModal';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, isAuthenticated, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path) => {
    if (path.startsWith('/#')) {
      const targetPath = '/';
      if (currentPath !== targetPath) {
        window.history.pushState({}, '', path);
        setCurrentPath(targetPath);
      }
    } else {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Redirect authenticated user away from auth pages (/login, /signup) to /dashboard
  useEffect(() => {
    if (isAuthenticated && (currentPath === '/login' || currentPath === '/signup')) {
      handleNavigate('/dashboard');
    }
  }, [isAuthenticated, currentPath]);

  // Protect dashboard, messages, agreements, and analytics routes for unauthenticated users
  useEffect(() => {
    if (!loading && !isAuthenticated && (
      currentPath === '/dashboard' ||
      currentPath === '/messages' ||
      currentPath === '/agreements' ||
      currentPath.startsWith('/analytics') ||
      currentPath.includes('/analytics') ||
      currentPath === '/creator-dashboard' ||
      currentPath === '/project-dashboard'
    )) {
      handleNavigate('/login');
    }
  }, [isAuthenticated, loading, currentPath]);

  if (loading) {
    return (
      <div className="bg-[#FAF8FF] min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-purple-900 tracking-wide uppercase">Initializing CrypLift Workspace...</p>
      </div>
    );
  }

  const renderPage = () => {
    const basePath = currentPath.split('?')[0];

    if (basePath.startsWith('/campaigns/') && basePath.endsWith('/analytics')) {
      return <CampaignAnalyticsPage onNavigate={handleNavigate} />;
    }

    switch (basePath) {
      case '/creators':
        return <CreatorsPage onSelectCreator={setSelectedCreator} onNavigate={handleNavigate} />;
      case '/projects':
        return <ProjectsPage onSelectProject={setSelectedProject} onNavigate={handleNavigate} />;
      case '/campaigns':
        return <CampaignsPage onSelectProject={setSelectedProject} onNavigate={handleNavigate} />;
      case '/dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case '/messages':
        return <MessagesPage onNavigate={handleNavigate} />;
      case '/agreements':
        return <AgreementsPage onNavigate={handleNavigate} />;
      case '/analytics/creator':
        return <CreatorAnalyticsPage onNavigate={handleNavigate} />;
      case '/creator-dashboard':
        return <DashboardPage onNavigate={handleNavigate} targetRoleFilter="creator" />;
      case '/project-dashboard':
        return <DashboardPage onNavigate={handleNavigate} targetRoleFilter="project" />;
      case '/login':
        return <LoginPage onNavigate={handleNavigate} />;
      case '/signup':
        return <SignupPage onNavigate={handleNavigate} />;
      case '/':
      default:
        return (
          <Home
            onNavigate={handleNavigate}
            onSelectProject={setSelectedProject}
            onSelectCreator={setSelectedCreator}
          />
        );
    }
  };

  return (
    <div className="bg-[#FAF8FF] text-slate-900 font-sans min-h-screen flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-700">
      
      {/* 1. Navbar (Sticky header across all routes) */}
      <Navbar currentPath={currentPath} onNavigate={handleNavigate} />

      {/* Main Page View */}
      <div className="flex-1">
        {renderPage()}
      </div>

      {/* 13. Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Modals */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onApply={(project) => {
            console.log('Applied for project campaign:', project);
          }}
        />
      )}

      {selectedCreator && (
        <CreatorModal
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
          onInvite={(creator) => {
            console.log('Invited creator to campaign:', creator);
          }}
        />
      )}

    </div>
  );
}
