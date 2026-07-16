import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Home from "./pages/Home";


import Login from "./pages/Login";
import Register from "./pages/Register";

import ClientDashboard from "./pages/ClientDashboard";
import LawyerDashboard from "./pages/LawyerDashboard";

import LawyersList from "./pages/LawyersList";
import Consultations from "./pages/Consultations";

import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/AdminDashboard";

import LawyerProfile from "./components/LawyerProfile";

import ClientProfile from "./components/ClientProfile";

import LawyerProfilePage from "./pages/LawyerProfilePage";

import NotificationsPage from "./pages/Notificationspage";

import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdvocateAgreement from "./pages/AdvocateAgreement";
import GlobalCallManager from "./components/GlobalCallManager";
import WelcomeOnboarding from "./components/WelcomeOnboarding";
import CallDiagnostic from "./pages/CallDiagnostic";
import VerifyEmail    from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword  from "./pages/ResetPassword";
import OAuthCallback  from "./pages/OAuthCallback";



export default function App() {

  return (

    <>

      <GlobalCallManager />

      <WelcomeOnboarding />

      <Routes>

      {/* ========================================
          PUBLIC ROUTES
      ======================================== */}
      

      
<Route path="/call-diagnostic" element={<CallDiagnostic />} />

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
  path="/verify-email"
  element={<VerifyEmail />}
/>

<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

<Route
  path="/reset-password"
  element={<ResetPassword />}
/>

<Route
  path="/oauth-callback"
  element={<OAuthCallback />}
/>

      <Route
        path="/terms-of-service"
        element={<TermsOfService />}
      />

      <Route
        path="/privacy-policy"
        element={<PrivacyPolicy />}
      />

      <Route
        path="/advocate-agreement"
        element={<AdvocateAgreement />}
      />

      {/* ========================================
          CLIENT ROUTES
      ======================================== */}

      <Route
        path="/client"
        element={

          <ProtectedRoute role="client">

            <ClientDashboard />

          </ProtectedRoute>

        }
      />

      <Route
        path="/lawyers"
        element={

          <ProtectedRoute role="client">

            <LawyersList />

          </ProtectedRoute>

        }
      />

      <Route
        path="/lawyers/:id"
        element={

          <ProtectedRoute role="client">

            <LawyerProfile />

          </ProtectedRoute>

        }
      />

      <Route
        path="/client-profile"
        element={

          <ProtectedRoute role="client">

            <ClientProfile />

          </ProtectedRoute>

        }
      />

      {/* ========================================
          CONSULTATIONS
      ======================================== */}

      <Route
        path="/consultations"
        element={

          <ProtectedRoute>

            <Consultations />

          </ProtectedRoute>

        }
      />

      <Route
        path="/notifications"
        element={

          <ProtectedRoute>

            <NotificationsPage />

          </ProtectedRoute>

        }
      />

      {/* ========================================
          LAWYER ROUTES
      ======================================== */}

      <Route
        path="/lawyer"
        element={

          <ProtectedRoute role="lawyer">

            <LawyerDashboard />

          </ProtectedRoute>

        }
      />

      <Route
        path="/lawyer-profile"
        element={

          <ProtectedRoute role="lawyer">

            <LawyerProfilePage />

          </ProtectedRoute>

        }
      />

      {/* ========================================
          ADMIN ROUTES
      ======================================== */}

      <Route
        path="/admin"
        element={

          <ProtectedRoute role="admin">

            <AdminDashboard />

          </ProtectedRoute>

        }
      />

      {/* ========================================
          404 FALLBACK
      ======================================== */}

      <Route
        path="*"
        element={<Navigate to="/" />}
      />
      

    </Routes>

    </>

  );

}