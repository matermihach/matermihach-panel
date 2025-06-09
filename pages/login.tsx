import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || email === process.env.ADMIN_EMAIL) {
      if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === process.env.ADMIN_PASSWORD) {
        router.push('/add-seller');
      } else {
        alert('Wrong password');
      }
    } else {
      alert('Unauthorized');
    }
  };

  return (
    <div style={{ padding: 50 }}>
      <h2>Admin Login</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} /><br />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} /><br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}