/**
 * Wrapper pour les fonctions asynchrones dans Express
 * Capture automatiquement les erreurs et les passe au middleware d'erreur
 * 
 * @param {Function} fn - Fonction asynchrone à wrapper
 * @returns {Function} - Fonction wrappée
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
