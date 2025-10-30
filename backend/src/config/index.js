/**
 * Point d'entrée central pour toutes les configurations
 * Permet d'importer toutes les configurations depuis un seul endroit
 */

const config = require('./env');
const connectDB = require('./database');

module.exports = {
  config,
  connectDB,
};
