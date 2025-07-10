import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: true,
  },
};

const db = admin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Méthode non autorisée.' });
    }

    const { email, startDate, endDate } = req.body;

    if (!email || !startDate || !endDate) {
      return res.status(400).json({
        error: '⛔️ Données manquantes. Merci de remplir tous les champs.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: '⛔️ Format de date invalide.',
      });
    }

    if (start >= end) {
      return res.status(400).json({
        error: '⛔️ La date de fin doit être postérieure à la date de début.',
      });
    }

    const snapshot = await db
      .collection('pending_sellers')
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (snapshot.empty) {
      // 👇 للتشخيص: نطبع كل الإيميلات المسجلة حاليًا
      const debugSnapshot = await db.collection('pending_sellers').get();
      const allEmails = debugSnapshot.docs.map(doc => doc.data().email);
      console.warn('Aucun vendeur trouvé pour:', normalizedEmail);
      console.log('Emails existants dans Firestore:', allEmails);

      return res.status(404).json({
        error: '⛔️ Cet email n’est pas inscrit. Veuillez enregistrer le vendeur d’abord.',
      });
    }

    const code = uuidv4();

    await db.collection('activation_codes').add({
      email: normalizedEmail,
      code,
      createdAt: admin.firestore.Timestamp.fromDate(start),
      expiresAt: admin.firestore.Timestamp.fromDate(end),
    });

    return res.status(200).json({
      success: true,
      code,
      expiresAt: end.toLocaleString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: '❌ Erreur serveur lors de la génération du code.' });
  }
}