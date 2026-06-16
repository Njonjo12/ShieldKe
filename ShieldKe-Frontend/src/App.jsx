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

export default function App() {

  return (

    <Routes>

      {/* ========================================
          PUBLIC ROUTES
      ======================================== */}

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

  );

}