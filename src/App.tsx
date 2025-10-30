import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./pages/auth/Login";
import { SignUp } from "./pages/auth/SignUp";
import { FreelancerDashboard } from "./pages/dashboard/FreelancerDashboard";
import { ClientDashboard } from "./pages/dashboard/ClientDashboard";
import { DashboardLayout } from "./components/layout/DashboardLayout";

// Import all page components
import { Projects } from "./pages/Projects";
import { Proposals } from "./pages/Proposals";
import { Messages } from "./pages/Messages";
import { Invoices } from "./pages/Invoices";
import { Reviews } from "./pages/Reviews";
import { Notifications } from "./pages/Notifications";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { BrowseFreelancers } from "./pages/BrowseFreelancers";
import { PopulateData } from "./pages/PopulateData";

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [forceLoaded, setForceLoaded] = useState(false);

  console.log('App render - loading:', loading, 'user:', !!user, 'profile:', !!profile, 'forceLoaded:', forceLoaded);

  // Force loading to false after 15 seconds as a safety measure
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Force setting loaded to true');
      setForceLoaded(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  if (loading && !forceLoaded) {
    console.log('Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
          <p className="text-sm text-gray-500 mt-2">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated but profile is still loading, show loading
  if (user && !profile && !forceLoaded) {
    console.log('User authenticated but profile loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Profile...</p>
          <p className="text-sm text-gray-500 mt-2">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (currentPath === "/signup") {
      return <SignUp />;
    }
    return <Login />;
  }

  // Define route components based on path and user role
  const renderPage = () => {
    const path = currentPath;

    if (path === "/dashboard" || path === "/") {
      // If profile is null, default to freelancer dashboard
      const userRole = profile?.role || 'freelancer';
      return userRole === "freelancer" ? (
        <FreelancerDashboard />
      ) : (
        <ClientDashboard />
      );
    }

    if (path === "/projects") {
      return <Projects />;
    }

    if (path === "/freelancers") {
      return <BrowseFreelancers />;
    }

    if (path === "/proposals" && (profile?.role === "freelancer" || !profile)) {
      return <Proposals />;
    }

    if (path === "/messages") {
      return <Messages />;
    }

    if (path === "/invoices") {
      return <Invoices />;
    }

    if (path === "/reviews") {
      return <Reviews />;
    }

    if (path === "/notifications") {
      return <Notifications />;
    }

    if (path === "/profile") {
      return <Profile />;
    }

    if (path === "/populate-data") {
      return <PopulateData />;
    }

    if (path === "/settings") {
      return <Settings />;
    }

    // Default to dashboard if path not recognized
    const userRole = profile?.role || 'freelancer';
    return userRole === "freelancer" ? (
      <FreelancerDashboard />
    ) : (
      <ClientDashboard />
    );
  };

  return (
    <DashboardLayout currentPath={currentPath}>{renderPage()}</DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
