import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveAuth } from "../utils/auth";


export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // Save authentication
      saveAuth(data.user, data.token);

      // Redirect based on role
      if (data.user.role === "lawyer") {
        navigate("/lawyer");
      } else {
        navigate("/client");
      }

    } catch (error) {

      console.error(error);
      alert("Server error");

    }

  };

  return (

    <div>

      <h2>ShieldKe Login</h2>

      <p>
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <br />

        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        <br />

        <button type="submit">
          Login
        </button>

      </form>

    </div>

  );

}
