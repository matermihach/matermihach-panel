// pages/generate-code.tsx
import { useState } from 'react';

export default function GenerateCodePage() {
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState(1); // durée en heures
  const [success, setSuccess] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleGenerateCode = async () => {
    setError('');
    setSuccess(false);
    setCode('');

    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, duration }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');

      setSuccess(true);
      setCode(data.code);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>🎫 Générer un code d’activation</h2>

      <input
        type="email"
        placeholder="Adresse e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: 10, display: 'block' }}
      />

      <input
        type="number"
        placeholder="Durée (en heures)"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        style={{ marginBottom: 10, display: 'block' }}
      />

      <button onClick={handleGenerateCode}>Générer</button>

      {success && <p style={{ color: 'green' }}>✅ Code généré: <strong>{code}</strong></p>}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
    </div>
  );
}