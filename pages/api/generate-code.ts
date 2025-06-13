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

  try {
    // 🔐 تحقق من وجود الإيميل في pending_sellers
    const snapshot = await db
      .collection('pending_sellers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(400).json({ error: '⛔️ Cet email n’est pas inscrit. Veuillez enregistrer le vendeur d’abord.' });
    }

    const code = uuidv4();
    const expiresAt = admin.firestore.Timestamp.fromDate(new Date(endDate));
    const createdAt = admin.firestore.Timestamp.fromDate(new Date(startDate));

    await db.collection('activation_codes').add({
      email,
      code,
      expiresAt,
      createdAt,
    });

    return res.status(200).json({
      success: true,
      code,
      expiresAt: new Date(endDate).toLocaleString('fr-FR'),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur lors de la génération du code.' });
  }
}