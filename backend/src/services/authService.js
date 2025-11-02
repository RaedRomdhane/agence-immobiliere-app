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
   * Connecter un utilisateur avec Google OAuth (Login uniquement)
   * @param {Object} profile - Profil Google
   * @param {String} profile.id - Google ID
   * @param {String} profile.displayName - Nom complet
   * @param {Array} profile.emails - Emails
   * @param {String} profile.emails[].value - Email
   * @returns {Promise<Object>} Utilisateur existant
   */
  static async loginWithGoogle(profile) {
    const email = profile.emails[0].value;

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });

    if (user) {
      // Mettre à jour le googleId et l'avatar si l'utilisateur existe
      let needsUpdate = false;
      
      if (!user.googleId) {
        user.googleId = profile.id;
        needsUpdate = true;
      }
      
      // Mettre à jour l'avatar si disponible
      const avatar = profile.photos && profile.photos.length > 0 
        ? profile.photos[0].value 
        : null;
      
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
      }
      
      return user;
    }

    // L'utilisateur n'existe pas - rejeter la connexion Google
    throw ApiError.unauthorized(
      'Aucun compte trouvé avec cet email. Veuillez vous inscrire d\'abord avec votre email.'
    );
  }

  /**
   * Créer un nouveau compte avec Google OAuth (Signup uniquement)
   * @param {Object} profile - Profil Google
   * @param {String} profile.id - Google ID
   * @param {String} profile.displayName - Nom complet
   * @param {Array} profile.emails - Emails
   * @param {String} profile.emails[].value - Email
   * @returns {Promise<Object>} Utilisateur créé
   */
  static async signupWithGoogle(profile) {
    const email = profile.emails[0].value;

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });

    if (user) {
      // L'utilisateur existe déjà - rejeter l'inscription
      throw ApiError.conflict(
        'Un compte existe déjà avec cet email. Veuillez vous connecter.'
      );
    }

    // Créer un nouvel utilisateur
    // Diviser le displayName en firstName et lastName
    const nameParts = profile.displayName.split(' ');
    const firstName = nameParts[0] || 'Utilisateur';
    const lastName = nameParts.slice(1).join(' ') || 'Google';

    // Récupérer la photo de profil Google
    const avatar = profile.photos && profile.photos.length > 0 
      ? profile.photos[0].value 
      : null;

    user = await User.create({
      firstName,
      lastName,
      email,
      googleId: profile.id,
      avatar, // Sauvegarder l'avatar Google
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
   * Enregistre un utilisateur via Google OAuth (Compatibilité - utilise loginWithGoogle)
   * @deprecated Utiliser loginWithGoogle ou signupWithGoogle à la place
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

    // L'utilisateur n'existe pas - rejeter la connexion Google
    throw ApiError.unauthorized(
      'Aucun compte trouvé avec cet email. Veuillez vous inscrire d\'abord avec votre email.'
    );
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
   * @param {Boolean} rememberMe - Si true, token valide 30 jours, sinon 7 jours
   * @returns {String} JWT token
   */
  static generateToken(user, rememberMe = false) {
    const jwt = require('jsonwebtoken');
    
    // Si rememberMe est true, le token expire dans 30 jours, sinon 7 jours
    const expiresIn = rememberMe ? '30d' : '7d';
    
    return jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'votre-secret-jwt-super-securise',
      {
        expiresIn,
      }
    );
  }

  /**
   * Génère un token de réinitialisation de mot de passe et envoie l'email
   * @param {String} email - Email de l'utilisateur
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  static async forgotPassword(email) {
    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Ne pas divulguer si l'email existe ou non (sécurité)
    if (!user) {
      // Retourner un succès même si l'email n'existe pas
      return {
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      };
    }

    // Générer un token sécurisé
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hasher le token avant de le stocker
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Enregistrer le token hashé et sa date d'expiration (1 heure)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 heure
    await user.save({ validateBeforeSave: false });

    // Créer l'URL de réinitialisation
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Préparer l'email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p>Bonjour ${user.firstName},</p>
            
            <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte <strong>${process.env.APP_NAME || 'Agence Immobilière'}</strong>.</p>
            
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <center>
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </center>
            
            <p style="color: #666; font-size: 14px;">Ou copiez ce lien dans votre navigateur :</p>
            <p style="background: #fff; padding: 10px; border: 1px solid #ddd; word-break: break-all; font-size: 12px;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Important :</strong>
              <ul>
                <li>Ce lien est valide pendant <strong>1 heure</strong></li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                <li>Votre mot de passe actuel restera inchangé tant que vous n'en créerez pas un nouveau</li>
              </ul>
            </div>
            
            <p>Cordialement,<br>L'équipe ${process.env.APP_NAME || 'Agence Immobilière'}</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoyer l'email
    try {
      const transporter = this.getEmailTransporter();
      const info = await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'Agence Immobilière'}" <${process.env.SMTP_FROM || 'noreply@example.com'}>`,
        to: user.email,
        subject: '🔒 Réinitialisation de votre mot de passe',
        html: emailHtml,
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Email de réinitialisation envoyé:', {
          to: user.email,
          messageId: info.messageId,
          previewURL: nodemailer.getTestMessageUrl(info),
        });
      }

      return {
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      };
    } catch (error) {
      // En développement, on log l'erreur mais on continue
      // (problème SSL avec Ethereal)
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  Erreur SMTP (ignorée en dev):', error.message);
        console.log('📧 Token de réinitialisation créé pour:', user.email);
        console.log('🔗 Lien de réinitialisation:', resetUrl);
        
        // Retourner quand même un succès en développement
        return {
          message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
          devInfo: {
            warning: 'Email non envoyé (erreur SMTP en développement)',
            resetUrl: resetUrl,
          }
        };
      }
      
      // En production, nettoyer le token et propager l'erreur
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      throw ApiError.internal('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  }

  /**
   * Réinitialise le mot de passe avec un token valide
   * @param {String} token - Token de réinitialisation (non hashé)
   * @param {String} newPassword - Nouveau mot de passe
   * @returns {Promise<Object>} Résultat
   */
  static async resetPassword(token, newPassword) {
    // Hasher le token reçu pour le comparer avec celui en DB
    const crypto = require('crypto');
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Trouver l'utilisateur avec ce token et vérifier qu'il n'a pas expiré
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw ApiError.badRequest('Token invalide ou expiré');
    }

    // Mettre à jour le mot de passe (sera automatiquement hashé par le middleware pre-save)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return {
      message: 'Mot de passe réinitialisé avec succès',
    };
  }
}

module.exports = AuthService;
