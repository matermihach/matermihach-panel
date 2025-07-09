// /pages/api/generate-code.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

const db = admin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const { email, startDate, endDate } = req.body;

  // ✅ التحقق من القيم الفارغة
  if (!email || !startDate || !endDate) {
    return res.status(400).json({
      error: '⛔️ Données manquantes. Merci de remplir tous les champs.',
    });
  }

  // ✅ تحويل التواريخ والتحقق من صحتها
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

  try {
    // ✅ التحقق من وجود الإيميل في pending_sellers
    const snapshot = await db
      .collection('pending_sellers')
      .where('email', '==', email.trim().toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        error: '⛔️ Cet email n’est pas inscrit. Veuillez enregistrer le vendeur d’abord.',
      });
    }

    // ✅ توليد الكود
    const code = uuidv4();

    // ✅ حفظ في Firestore
    await db.collection('activation_codes').add({
      email: email.trim().toLowerCase(),
      code,
      createdAt: admin.firestore.Timestamp.fromDate(start),
      expiresAt: admin.firestore.Timestamp.fromDate(end),
    });

    // ✅ إرسال الرد
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
    console.error('❌ Erreur lors de la génération du code :', error);
    return res.status(500).json({
      error: '❌ Erreur serveur lors de la génération du code.',
    });
  }
}