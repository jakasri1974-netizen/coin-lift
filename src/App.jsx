import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CreatorsPage from './pages/CreatorsPage';
import ProjectsPage from './pages/ProjectsPage';
import CampaignsPage from './pages/CampaignsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProjectModal from './components/Modals/ProjectModal';
import CreatorModal from './components/Modals/CreatorModal';

export default function App() {
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

  const renderPage = () => {
    switch (currentPath) {
      case '/creators':
        return <CreatorsPage onSelectCreator={setSelectedCreator} onNavigate={handleNavigate} />;
      case '/projects':
        return <ProjectsPage onSelectProject={setSelectedProject} onNavigate={handleNavigate} />;
      case '/campaigns':
        return <CampaignsPage onSelectProject={setSelectedProject} onNavigate={handleNavigate} />;
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
    <div className="bg-[#04060d] text-slate-100 font-sans min-h-screen flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-300">
      
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
