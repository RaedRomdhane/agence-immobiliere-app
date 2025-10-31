const fs = require('fs').promises;
const path = require('path');

/**
 * Middleware pour logger les activités utilisateur
 * Enregistre les créations de compte, connexions, etc.
 */
class ActivityLogger {
  /**
   * Crée le répertoire de logs s'il n'existe pas
   */
  static async ensureLogsDirectory() {
    const logsDir = path.join(__dirname, '../../logs');
    try {
      await fs.access(logsDir);
    } catch {
      await fs.mkdir(logsDir, { recursive: true });
    }
    return logsDir;
  }

  /**
   * Écrit une entrée dans le fichier de logs
   * @param {String} type - Type d'activité (register, login, etc.)
   * @param {Object} data - Données à logger
   */
  static async log(type, data) {
    try {
      const logsDir = await this.ensureLogsDirectory();
      const date = new Date();
      const logFile = path.join(
        logsDir,
        `activity-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}.log`
      );

      const logEntry = {
        timestamp: date.toISOString(),
        type,
        ...data,
      };

      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(logFile, logLine, 'utf8');

      // Log aussi dans la console en développement
      if (process.env.NODE_ENV !== 'production') {
        console.log('📝 Activity Log:', logEntry);
      }
    } catch (error) {
      console.error('Erreur lors de l\'écriture du log:', error);
    }
  }

  /**
   * Middleware pour logger les créations de compte
   */
  static logAccountCreation() {
    return async (req, res, next) => {
      // Sauvegarder la méthode originale res.json
      const originalJson = res.json.bind(res);

      // Surcharger res.json pour capturer la réponse
      res.json = function (data) {
        // Si la création de compte est réussie (status 201)
        if (res.statusCode === 201 && data.data && data.data._id) {
          ActivityLogger.log('account_creation', {
            userId: data.data._id,
            email: data.data.email,
            role: data.data.role,
            method: req.body.googleId ? 'google_oauth' : 'email_password',
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
          });
        }

        // Appeler la méthode originale
        return originalJson(data);
      };

      next();
    };
  }

  /**
   * Middleware pour logger les connexions
   */
  static logLogin() {
    return async (req, res, next) => {
      const originalJson = res.json.bind(res);

      res.json = function (data) {
        // Si la connexion est réussie (status 200 avec token)
        if (res.statusCode === 200 && data.data && data.data.token) {
          ActivityLogger.log('login', {
            userId: data.data.user?._id,
            email: data.data.user?.email,
            method: req.path.includes('google') ? 'google_oauth' : 'email_password',
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
          });
        }

        return originalJson(data);
      };

      next();
    };
  }

  /**
   * Middleware pour logger les tentatives échouées
   */
  static logFailedAttempt(type) {
    return async (req, res, next) => {
      const originalJson = res.json.bind(res);

      res.json = function (data) {
        // Si la réponse est une erreur (4xx ou 5xx)
        if (res.statusCode >= 400) {
          ActivityLogger.log(`failed_${type}`, {
            email: req.body.email,
            error: data.error?.message,
            statusCode: res.statusCode,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
          });
        }

        return originalJson(data);
      };

      next();
    };
  }
}

module.exports = ActivityLogger;
