import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ClientDashboard(){

  const navigate = useNavigate();

  return(

    <div>

      <Navbar/>

      <div className="container">

        <h1>Client Dashboard</h1>

        <div style={{
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          gap:"20px"
        }}>

          <div className="card">

            <h3>Find Lawyers</h3>

            <p>
              Browse verified lawyers across Kenya and request
              a legal consultation.
            </p>

            <button
              className="primary-btn"
              onClick={()=>navigate("/lawyers")}
            >
              Browse Lawyers
            </button>

          </div>

          <div className="card">

            <h3>Your Consultations</h3>

            <p>
              Track your legal consultations and communicate
              with lawyers once accepted.
            </p>

            <button
              className="primary-btn"
              onClick={()=>navigate("/consultations")}
            >
              View Consultations
            </button>

          </div>

        </div>

      </div>

    </div>

  )

}
