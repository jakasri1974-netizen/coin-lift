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
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Creator Phase 5 Imports
import CreatorProfileDashboard from './pages/CreatorProfileDashboard';
import PublicCreatorProfilePage from './pages/PublicCreatorProfilePage';

// Project Owner Phase 6 Imports
import ProjectProfileDashboard from './pages/ProjectProfileDashboard';
import PublicProjectProfilePage from './pages/PublicProjectProfilePage';

// Phase 9 Collaboration Import
import CollaborationWorkspacePage from './pages/CollaborationWorkspacePage';

// Admin Portal Imports
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import AdminLayout from './admin/components/AdminLayout';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import AdminUsersPage from './admin/pages/AdminUsersPage';
import AdminCreatorsPage from './admin/pages/AdminCreatorsPage';
import AdminProjectsPage from './admin/pages/AdminProjectsPage';
import AdminCampaignsPage from './admin/pages/AdminCampaignsPage';
import AdminLogsPage from './admin/pages/AdminLogsPage';
import AdminAgreementsPage from './admin/pages/AdminAgreementsPage';

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

  // Automatic compatibility redirect for legacy /admin/login route
  useEffect(() => {
    if (currentPath === '/admin/login') {
      handleNavigate('/login');
    }
  }, [currentPath]);

  const isAdminRoute = currentPath.startsWith('/admin') && currentPath !== '/admin/login';

  const renderAdminView = () => {
    if (currentPath === '/admin/login') {
      return null;
    }

    let AdminViewComponent = AdminDashboardPage;
    if (currentPath === '/admin/users') AdminViewComponent = AdminUsersPage;
    if (currentPath === '/admin/creators') AdminViewComponent = AdminCreatorsPage;
    if (currentPath === '/admin/projects') AdminViewComponent = AdminProjectsPage;
    if (currentPath === '/admin/campaigns') AdminViewComponent = AdminCampaignsPage;
    if (currentPath === '/admin/agreements') AdminViewComponent = AdminAgreementsPage;
    if (currentPath === '/admin/logs') AdminViewComponent = AdminLogsPage;

    return (
      <AdminProtectedRoute onNavigate={handleNavigate}>
        <AdminLayout currentAdminPath={currentPath} onNavigate={handleNavigate}>
          <AdminViewComponent onNavigate={handleNavigate} />
        </AdminLayout>
      </AdminProtectedRoute>
    );
  };

  const renderPublicPage = () => {
    // Check dynamic /creators/:id route
    if (currentPath.startsWith('/creators/') && currentPath !== '/creators/') {
      const id = currentPath.replace('/creators/', '');
      return (
        <PublicCreatorProfilePage
          creatorId={id}
          onNavigate={handleNavigate}
          onInviteCreator={setSelectedCreator}
        />
      );
    }

    // Check dynamic /projects/:id route
    if (currentPath.startsWith('/projects/') && currentPath !== '/projects/') {
      const id = currentPath.replace('/projects/', '');
      return (
        <PublicProjectProfilePage
          projectId={id}
          onNavigate={handleNavigate}
        />
      );
    }

    // Check dynamic /collaborations/:id route (Phase 9 Workspace)
    if (currentPath.startsWith('/collaborations/') && currentPath !== '/collaborations/') {
      const id = currentPath.replace('/collaborations/', '');
      return (
        <ProtectedRoute allowedRoles={['CREATOR', 'PROJECT_OWNER', 'ADMIN']} onNavigate={handleNavigate}>
          <CollaborationWorkspacePage collaborationId={id} onNavigate={handleNavigate} />
        </ProtectedRoute>
      );
    }

    switch (currentPath) {
      case '/creator/profile':
        return (
          <ProtectedRoute allowedRoles={['CREATOR']} onNavigate={handleNavigate}>
            <CreatorProfileDashboard onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case '/project/profile':
        return (
          <ProtectedRoute allowedRoles={['PROJECT_OWNER']} onNavigate={handleNavigate}>
            <ProjectProfileDashboard onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
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
    <AuthProvider>
      {isAdminRoute ? (
        renderAdminView()
      ) : (
        <div className="bg-[#04060d] text-slate-100 font-sans min-h-screen flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-300">

          {/* Public Navbar */}
          <Navbar currentPath={currentPath} onNavigate={handleNavigate} />

          {/* Main Public Page View */}
          <div className="flex-1">
            {renderPublicPage()}
          </div>

          {/* Public Footer */}
          <Footer onNavigate={handleNavigate} />

          {/* Public Detail Modals */}
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
              onNavigate={handleNavigate}
              onInvite={(creator) => {
                console.log('Invited creator to campaign:', creator);
              }}
            />
          )}

        </div>
      )}
    </AuthProvider>
  );
}
