import Navbar from "../components/Navbar";

export default function Home() {

  return (

    <div>

      <Navbar />

      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
          background: "linear-gradient(135deg,#006B3F,#111)"
        }}
      >

        <h1 style={{ color: "white", fontSize: "48px" }}>
          ShieldKe
        </h1>

        <p style={{ color: "white", fontSize: "20px" }}>
          Connecting Kenyans to trusted legal services
        </p>

        <button
          className="primary-btn"
          style={{ marginTop: "20px" }}
        >
          Find a Lawyer
        </button>

      </div>

    </div>

  );

}
