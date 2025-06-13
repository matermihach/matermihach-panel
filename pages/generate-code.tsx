// pages/generate-code.tsx

import { useState } from 'react';
import admin from '../lib/firebase-admin';

const db = admin.firestore();

export default function GenerateCodePage() {
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState(1); // باليوم
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateCode = async () => {
    setError('');
    setSuccess(false);

    try {
      const code = Math.random().toString(36).substr(2, 8).toUpperCase(); // كود عشوائي
      const expiresAt = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      );

      await db.collection('activation_codes').doc(email).set({
        email,
        code,
        expiresAt,
        createdAt: admin.firestore.Timestamp.now(),
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء توليد الكود');
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>توليد كود تفعيل</h2>
      <input
        type="email"
        placeholder="البريد الإلكتروني للبائع"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', marginBottom: 10 }}
      />
      <input
        type="number"
        placeholder="مدة الصلاحية (أيام)"
        value={duration}
        onChange={(e) => setDuration(parseInt(e.target.value))}
        style={{ display: 'block', marginBottom: 10 }}
      />
      <button onClick={handleGenerateCode}>🔐 توليد الكود</button>

      {success && <p style={{ color: 'green' }}>✅ تم توليد الكود بنجاح!</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}