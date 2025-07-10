import { useState } from 'react';

export default function GenerateCodePage() {
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [code, setCode] = useState('');
  const [expiration, setExpiration] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleGenerateCode = async () => {
    setError('');
    setSuccess(false);
    setEmailSent(false);
    setCode('');
    setExpiration('');

    if (!email || !startDate || !endDate) {
      setError("⛔️ Veuillez remplir tous les champs.");
      return;
    }

    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, startDate, endDate }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error('⚠️ Réponse du serveur invalide (pas en JSON)');
      }

      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');

      setSuccess(true);
      setCode(data.code);
      setExpiration(data.expiresAt);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <h2>📧 Générer un code d’activation</h2>

      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: '10px', display: 'block', width: '250px' }}
      />

      <label>Date de début</label>
      <input
        type="datetime-local"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        style={{ marginBottom: '10px', display: 'block', width: '250px' }}
      />

      <label>Date de fin</label>
      <input
        type="datetime-local"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        style={{ marginBottom: '10px', display: 'block', width: '250px' }}
      />

      <button onClick={handleGenerateCode} style={{ padding: '8px 16px' }}>Générer</button>

      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
      
      {success && (
        <div style={{ marginTop: '20px', color: 'green' }}>
          <p>✅ Code généré avec succès !</p>
          <p><strong>Code:</strong> {code}</p>
          <p><strong>Expire le:</strong> {expiration}</p>
          {emailSent && <p>📩 Email envoyé à <strong>{email}</strong></p>}
        </div>
      )}
    </div>
  );
}