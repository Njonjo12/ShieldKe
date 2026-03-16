import { useNavigate } from "react-router-dom";

export default function Navbar() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const goHome = () => {

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "lawyer") {
      navigate("/lawyer");
    } else {
      navigate("/client");
    }

  };

  const logout = () => {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/login");

  };

  return (

    <nav
      style={{
        background: "#000",
        color: "white",
        padding: "14px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >

      <h2
        style={{ margin: 0, cursor: "pointer" }}
        onClick={goHome}
      >
        Shield<span style={{ color: "#006B3F" }}>Ke</span>
      </h2>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>

        {user && (
          <span>Welcome {user.name}</span>
        )}

        <button
          style={{
            background: "#BB0000",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
          onClick={logout}
        >
          Logout
        </button>

      </div>

    </nav>

  );

}
