import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LawyerProfileForm from "./components/LawyerProfileForm";
import ClientProfileForm from "./components/ClientProfileForm";

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/lawyer-profile">Lawyer Profile</Link></li>
          <li><Link to="/client-profile">Client Profile</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/lawyer-profile" element={<LawyerProfileForm />} />
        <Route path="/client-profile" element={<ClientProfileForm />} />
      </Routes>
    </Router>
  );
}

export default App;
