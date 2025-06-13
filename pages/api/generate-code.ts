import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

const db = admin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, startDate, endDate } = req.body;

  if (!email || !startDate || !endDate) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  const code = uuidv4();

  try {
    await db.collection('activation_codes').add({
      email,
      code,
      startAt: admin.firestore.Timestamp.fromDate(new Date(startDate)),
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(endDate)),
      createdAt: admin.firestore.Timestamp.now(),
    });

    return res.status(200).json({
      success: true,
      code,
      expiresAt: new Date(endDate).toLocaleString('fr-FR'),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la génération du code' });
  }
}