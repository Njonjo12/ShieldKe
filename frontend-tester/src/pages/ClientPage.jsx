import { useState } from "react";

export default function ClientPage() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState("");

  const createClient = async () => {
    const res = await fetch("http://localhost:5000/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location, phone }),
    });
    setResult(await res.text());
  };

  const getClients = async () => {
    const res = await fetch("http://localhost:5000/api/clients");
    setResult(await res.text());
  };

  return (
    <div>
      <h2>Client Profile Test</h2>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button onClick={createClient}>Create Client</button>
      <button onClick={getClients}>Fetch Clients</button>
      <pre>{result}</pre>
    </div>
  );
}
