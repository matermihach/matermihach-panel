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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

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

    const normalizedEmail = email.trim().toLowerCase();

    const snapshot = await db
      .collection('pending_sellers')
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (snapshot.empty) {
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

    const formattedExpiration = end.toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // إرسال الإيميل
    await transporter.sendMail({
      from: `"Matrimihach" <${process.env.GMAIL_USER}>`,
      to: normalizedEmail,
      subject: '🔐 Code d’activation – Matrimihach',
      html: `
        <p>Bonjour,</p>
        <p>Voici votre code d’activation pour accéder à l’application des vendeurs :</p>
        <ul>
          <li><strong>Email:</strong> ${normalizedEmail}</li>
          <li><strong>Code d’activation:</strong> ${code}</li>
          <li><strong>Date d’expiration:</strong> ${formattedExpiration}</li>
        </ul>
        <p>Veuillez entrer ce code dans l’application pour activer votre compte.</p>
        <br />
        <p>Merci,<br />L’équipe Matrimihach</p>
      `,
    });

    return res.status(200).json({
      success: true,
      code,
      expiresAt: formattedExpiration,
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: '❌ Erreur serveur lors de la génération du code.' });
  }
}