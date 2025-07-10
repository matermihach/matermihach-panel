import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

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

    const cleanedEmail = email.trim().toLowerCase();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: '⛔️ Format de date invalide.' });
    }

    if (start >= end) {
      return res.status(400).json({
        error: '⛔️ La date de fin doit être postérieure à la date de début.',
      });
    }

    const snapshot = await db
      .collection('pending_sellers')
      .where('email', '==', cleanedEmail)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        error: '⛔️ Cet email n’est pas inscrit. Veuillez enregistrer le vendeur d’abord.',
      });
    }

    const code = uuidv4();

    await db.collection('activation_codes').add({
      email: cleanedEmail,
      code,
      createdAt: admin.firestore.Timestamp.fromDate(start),
      expiresAt: admin.firestore.Timestamp.fromDate(end),
    });

    // ✅ إعداد الإيميل
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_SENDER_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const formattedDate = end.toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const mailOptions = {
      from: `"Matrimihach" <${process.env.GMAIL_SENDER_EMAIL}>`,
      to: cleanedEmail,
      subject: '🔑 Votre code d’activation',
      html: `
        <div style="font-family: Arial; line-height: 1.6;">
          <h2>Bonjour,</h2>
          <p>Voici votre <strong>code d’activation</strong> pour accéder à l’application :</p>
          <p style="font-size: 18px; font-weight: bold; color: green;">${code}</p>
          <p>Ce code est valable jusqu’au : <strong>${formattedDate}</strong></p>
          <p style="margin-top:20px;">Merci,</p>
          <p>L’équipe Ma Trémihaš 🍀</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      code,
      expiresAt: formattedDate,
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: '❌ Erreur serveur lors de la génération du code.' });
  }
}