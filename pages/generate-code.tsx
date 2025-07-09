import { useState } from 'react';

export default function GenerateCodePage() {
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [code, setCode] = useState('');
  const [expiration, setExpiration] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleGenerateCode = async () => {
    setError('');
    setSuccess(false);
    setCode('');
    setExpiration('');

    // ✅ تحقق من الحقول قبل الإرسال
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
        data = JSON.parse(text); // ✅ محاولة تحليل الـ JSON
      } catch (err) {
        throw new Error('⚠️ Réponse du serveur invalide (pas en JSON)');
      }

      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');

      setSuccess(true);
      setCode(data.code);
      setExpiration(data.expiresAt);
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

      <button onClick={handleGenerateCode}>Générer</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && (
        <div style={{ marginTop: '20px' }}>
          <p style={{ color: 'green' }}>✅ Code généré avec succès !</p>
          <p><strong>Code:</strong> {code}</p>
          <p><strong>Expire le:</strong> {expiration}</p>
        </div>
      )}
    </div>
  );
}