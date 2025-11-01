const User = require('../models/User');
const nodemailer = require('nodemailer');
const ApiError = require('../utils/ApiError');

/**
 * Service d'authentification
 * Gère l'inscription, l'envoi d'emails de bienvenue, etc.
 */
class AuthService {
  /**
   * Configure le transporteur d'email (Nodemailer)
   * @returns {nodemailer.Transporter}
   */
  static getEmailTransporter() {
    // En développement, utiliser Ethereal (fake SMTP)
    // En production, utiliser un vrai service SMTP (Gmail, SendGrid, etc.)
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    // En développement, utiliser console (ou Ethereal si configuré)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Enregistre un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @param {String} userData.firstName - Prénom
   * @param {String} userData.lastName - Nom
   * @param {String} userData.email - Email
   * @param {String} userData.password - Mot de passe (sera hashé automatiquement)
   * @param {String} [userData.phone] - Téléphone
   * @param {String} [userData.role] - Rôle (par défaut: client)
   * @returns {Promise<Object>} Utilisateur créé (sans le mot de passe)
   * @throws {ApiError} Si l'email existe déjà
   */
  static async register(userData) {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw ApiError.conflict('Cet email est déjà utilisé');
    }

    // Créer l'utilisateur
    // Le password sera automatiquement hashé par le pre-save hook du modèle
    const user = await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      role: userData.role || 'client',
    });

    // Envoyer l'email de bienvenue
    try {
      await this.sendWelcomeEmail(user);
    } catch (emailError) {
      // Log l'erreur mais ne bloque pas l'inscription
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
    }

    // Retourner l'utilisateur sans le mot de passe
    return user;
  }

  /**
   * Enregistre un utilisateur via Google OAuth
   * @param {Object} profile - Profil Google
   * @param {String} profile.id - Google ID
   * @param {String} profile.displayName - Nom complet
   * @param {Array} profile.emails - Emails
   * @param {String} profile.emails[].value - Email
   * @returns {Promise<Object>} Utilisateur créé ou existant
   */
  static async registerWithGoogle(profile) {
    const email = profile.emails[0].value;

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });

    if (user) {
      // Mettre à jour le googleId si l'utilisateur existe
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
      return user;
    }

    // Créer un nouvel utilisateur
    // Diviser le displayName en firstName et lastName
    const nameParts = profile.displayName.split(' ');
    const firstName = nameParts[0] || 'Utilisateur';
    const lastName = nameParts.slice(1).join(' ') || 'Google';

    user = await User.create({
      firstName,
      lastName,
      email,
      googleId: profile.id,
      role: 'client',
      // Pas de mot de passe pour les utilisateurs Google OAuth
      // On génère un mot de passe aléatoire pour satisfaire la validation
      password: Math.random().toString(36).slice(-12) + 'Aa1!',
    });

    // Envoyer l'email de bienvenue
    try {
      await this.sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
    }

    return user;
  }

  /**
   * Envoie un email de bienvenue à l'utilisateur
   * @param {Object} user - Utilisateur
   * @returns {Promise<void>}
   */
  static async sendWelcomeEmail(user) {
    const transporter = this.getEmailTransporter();

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Agence Immobilière'}" <${process.env.SMTP_FROM || 'noreply@agence-immo.com'}>`,
      to: user.email,
      subject: `Bienvenue sur ${process.env.APP_NAME || 'Agence Immobilière'} !`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏠 Bienvenue ${user.firstName} !</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${user.fullName}</strong>,</p>
            
            <p>Merci de vous être inscrit(e) sur <strong>${process.env.APP_NAME || 'Agence Immobilière'}</strong> !</p>
            
            <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
            <ul>
              <li>🔍 Rechercher des biens immobiliers</li>
              <li>❤️ Ajouter des favoris</li>
              <li>📅 Prendre des rendez-vous</li>
              <li>💬 Contacter nos agents</li>
            </ul>
            
            <center>
              <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" class="button">
                Se connecter
              </a>
            </center>
            
            <p>Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:${process.env.CONTACT_EMAIL || 'contact@agence-immo.com'}">${process.env.CONTACT_EMAIL || 'contact@agence-immo.com'}</a>.</p>
            
            <p>À très bientôt,<br>
            <strong>L'équipe ${process.env.APP_NAME || 'Agence Immobilière'}</strong></p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Agence Immobilière'}. Tous droits réservés.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Bienvenue ${user.firstName} !
        
        Bonjour ${user.fullName},
        
        Merci de vous être inscrit(e) sur ${process.env.APP_NAME || 'Agence Immobilière'} !
        
        Votre compte a été créé avec succès. Vous pouvez maintenant :
        - Rechercher des biens immobiliers
        - Ajouter des favoris
        - Prendre des rendez-vous
        - Contacter nos agents
        
        Connectez-vous sur : ${process.env.APP_URL || 'http://localhost:3000'}/login
        
        Si vous avez des questions, contactez-nous à ${process.env.CONTACT_EMAIL || 'contact@agence-immo.com'}.
        
        À très bientôt,
        L'équipe ${process.env.APP_NAME || 'Agence Immobilière'}
      `,
    };

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);

    // Log en développement
    if (process.env.NODE_ENV !== 'production') {
      console.log('Email de bienvenue envoyé:', {
        to: user.email,
        messageId: info.messageId,
        // URL Ethereal pour prévisualiser l'email (si Ethereal est utilisé)
        previewURL: nodemailer.getTestMessageUrl(info),
      });
    }

    return info;
  }

  /**
   * Génère un token JWT pour l'utilisateur
   * @param {Object} user - Utilisateur
   * @returns {String} JWT token
   */
  static generateToken(user) {
    const jwt = require('jsonwebtoken');
    
    return jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'votre-secret-jwt-super-securise',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );
  }
}

module.exports = AuthService;
