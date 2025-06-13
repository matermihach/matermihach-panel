import { useState } from 'react';

export default function GenerateCodePage() {
  const [email, setEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
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
        body: JSON.stringify({ email, expiresAt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');

      setSuccess(true);
      setCode(data.code);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('✅ Code copié !');
  };

  return (
    <div style={{ padding: 30, fontFamily: 'Arial' }}>
      <h2>🎫 Générer un code d’activation</h2>

      <input
        type="email"
        placeholder="Adresse e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: 10, display: 'block', width: 250 }}
      />

      <input
        type="datetime-local"
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
        style={{ marginBottom: 10, display: 'block', width: 250 }}
      />

      <button onClick={handleGenerateCode}>Générer</button>

      {success && (
        <div style={{ marginTop: 20 }}>
          <p style={{ color: 'green' }}>
            ✅ Code généré: <strong>{code}</strong>
          </p>
          <p>
            📆 Expire à : <strong>{expiresAt}</strong>
          </p>
          <button onClick={handleCopy}>📋 Copier le code</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
    </div>
  );
}