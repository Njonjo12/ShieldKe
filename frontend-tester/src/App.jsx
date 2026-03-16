import { Routes,Route,Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ClientDashboard from "./pages/ClientDashboard";
import LawyerDashboard from "./pages/LawyerDashboard";

import LawyersList from "./pages/LawyersList";
import Consultations from "./pages/Consultations";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App(){

  return(

    <Routes>

      <Route path="/" element={<Navigate to="/login"/>}/>

      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>

      <Route
        path="/client"
        element={
          <ProtectedRoute role="client">
            <ClientDashboard/>
          </ProtectedRoute>
        }
      />

      <Route
        path="/lawyers"
        element={
          <ProtectedRoute role="client">
            <LawyersList/>
          </ProtectedRoute>
        }
      />

      <Route
        path="/consultations"
        element={
          <ProtectedRoute>
            <Consultations/>
          </ProtectedRoute>
        }
      />

      <Route
        path="/lawyer"
        element={
          <ProtectedRoute role="lawyer">
            <LawyerDashboard/>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login"/>}/>

    </Routes>

  )

}
