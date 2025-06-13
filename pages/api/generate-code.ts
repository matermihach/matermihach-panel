// pages/api/generate-code.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

const db = admin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, duration } = req.body;

  if (!email || !duration) return res.status(400).json({ error: 'Données manquantes' });

  const code = uuidv4();
  const expiresAt = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + Number(duration) * 60 * 60 * 1000)
  );

  try {
    await db.collection('activation_codes').add({
      email,
      code,
      expiresAt,
      createdAt: admin.firestore.Timestamp.now(),
    });

    return res.status(200).json({ success: true, code });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la génération du code' });
  }
}