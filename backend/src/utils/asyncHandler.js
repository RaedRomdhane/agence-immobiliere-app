/**
 * Wrapper pour les fonctions async/await
 * Évite d'avoir à écrire try/catch dans chaque route
 * @param {Function} fn - Fonction asynchrone à wrapper
 * @returns {Function} Middleware Express
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
