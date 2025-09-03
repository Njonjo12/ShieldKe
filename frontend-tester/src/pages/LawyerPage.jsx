import { useState } from "react";

export default function LawyerPage() {
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [result, setResult] = useState("");

  const createLawyer = async () => {
    const res = await fetch("http://localhost:5000/api/lawyers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, specialization, experience }),
    });
    setResult(await res.text());
  };

  const getLawyers = async () => {
    const res = await fetch("http://localhost:5000/api/lawyers");
    setResult(await res.text());
  };

  return (
    <div>
      <h2>Lawyer Profile Test</h2>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
      <input placeholder="Experience" value={experience} onChange={(e) => setExperience(e.target.value)} />
      <button onClick={createLawyer}>Create Lawyer</button>
      <button onClick={getLawyers}>Fetch Lawyers</button>
      <pre>{result}</pre>
    </div>
  );
}
