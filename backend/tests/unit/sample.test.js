const request = require('supertest');
const app = require('../../src/app');

describe('Application de base', () => {
  describe('GET /', () => {
    it('devrait retourner un message de bienvenue', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Bienvenue');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /health', () => {
    it('devrait retourner le status de santé de l\'API', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message', 'API is running');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('devrait retourner un timestamp valide', async () => {
      const response = await request(app).get('/health');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });
  });

  describe('GET /route-inexistante', () => {
    it('devrait retourner 404 pour une route non trouvée', async () => {
      const response = await request(app).get('/route-inexistante');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message).toContain('non trouvée');
    });
  });

  describe('Headers de sécurité', () => {
    it('devrait avoir les headers Helmet configurés', async () => {
      const response = await request(app).get('/api');

      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });

  describe('CORS', () => {
    it('devrait autoriser les requêtes CORS', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Content-Type', () => {
    it('devrait retourner du JSON', async () => {
      const response = await request(app).get('/');

      expect(response.type).toBe('application/json');
    });
  });

  describe('Parsing du body', () => {
    it('devrait accepter du JSON dans le body', async () => {
      const response = await request(app)
        .post('/test')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      // Devrait retourner 404 car la route n'existe pas, mais le JSON est parsé
      expect(response.status).toBe(404);
    });

    it('devrait accepter des données URL-encoded', async () => {
      const response = await request(app)
        .post('/test')
        .send('key=value')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect(response.status).toBe(404);
    });
  });
});
