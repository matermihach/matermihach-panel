import { useState } from 'react';

export default function GenerateCodePage() {
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [code, setCode] = useState('');
  const [expiration, setExpiration] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateCode = async () => {
    setError('');
    setSuccess(false);
    setCode('');
    setExpiration('');
    setLoading(true);

    if (!email || !startDate || !endDate) {
      setError("⛔️ Veuillez remplir tous les champs.");
      setLoading(false);
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '30px',
      fontFamily: 'Arial',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <h2>🔐 Générer un code d’activation</h2>

      <label style={{ fontWeight: 'bold' }}>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="exemple@mail.com"
        style={{
          marginBottom: '10px',
          display: 'block',
          width: '100%',
          padding: '8px'
        }}
      />

      <label style={{ fontWeight: 'bold' }}>Date de début</label>
      <input
        type="datetime-local"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        style={{
          marginBottom: '10px',
          display: 'block',
          width: '100%',
          padding: '8px'
        }}
      />

      <label style={{ fontWeight: 'bold' }}>Date de fin</label>
      <input
        type="datetime-local"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        style={{
          marginBottom: '20px',
          display: 'block',
          width: '100%',
          padding: '8px'
        }}
      />

      <button
        onClick={handleGenerateCode}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Chargement...' : 'Générer'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

      {success && (
        <div style={{ marginTop: '20px', border: '1px solid #28a745', padding: '10px', borderRadius: '5px' }}>
          <p style={{ color: 'green' }}>✅ Code généré avec succès !</p>
          <p><strong>Code :</strong> {code}</p>
          <p><strong>Expire le :</strong> {expiration}</p>
        </div>
      )}
    </div>
  );
}