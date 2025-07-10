import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

function generateRandomCode(length: number = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const rawEmail = req.body.email || '';
    const email = rawEmail.trim().toLowerCase();
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    if (!email || !startDate || !endDate) {
      return res.status(400).json({ error: 'Champs manquants' });
    }

    const pendingRef = db.collection('pending_sellers');
    const snapshot = await pendingRef.where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Cet email n’est pas inscrit. Veuillez enregistrer le vendeur d’abord.' });
    }

    const activationCode = generateRandomCode();

    await db.collection('activation_codes').add({
      email,
      code: activationCode,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(endDate),
    });

    // إرسال الإيميل
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Votre code d’activation – ما ترميهاش',
      text: `Bonjour,\n\nVoici votre code d’activation : ${activationCode}\n\nCe code est valable jusqu’au : ${new Date(endDate).toLocaleString()}\n\nCordialement,\nÉquipe ما ترميهاش.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      code: activationCode,
      expiresAt: new Date(endDate).toLocaleString(),
    });

  } catch (err: any) {
    console.error('Erreur API:', err.message);
    return res.status(500).json({ error: 'Erreur serveur: ' + err.message });
  }
}