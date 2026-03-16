import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {

  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [role,setRole] = useState("client");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const res = await fetch("http://localhost:5000/api/auth/register", {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({
          name,
          email,
          password,
          role
        })

      });

      const data = await res.json();

      if(!res.ok){

        alert(data.message || "Registration failed");
        return;

      }

      alert("Account created successfully");

      navigate("/login");

    } catch (error) {

      console.error(error);
      alert("Server error");

    }

  };

  return (

    <div>

      <h2>ShieldKe Sign Up</h2>

      <form onSubmit={handleSubmit}>

        <input
          placeholder="Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          required
        />

        <br/>

        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <br/>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        <br/>

        <select
          value={role}
          onChange={(e)=>setRole(e.target.value)}
        >

          <option value="client">Client</option>
          <option value="lawyer">Lawyer</option>

        </select>

        <br/>

        <button type="submit">
          Register
        </button>

      </form>

    </div>

  );

}
