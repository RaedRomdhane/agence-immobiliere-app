/**
 * Configuration Swagger pour la documentation de l'API
 */
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuration Swagger/OpenAPI
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Agence Immobilière',
      version: '1.0.0',
      description: 'Documentation complète de l\'API REST pour l\'application Agence Immobilière',
      contact: {
        name: 'Support API',
        email: 'support@agence-immobiliere.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Serveur de Production' : 'Serveur de Développement',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de l\'utilisateur',
              example: '507f1f77bcf86cd799439011',
            },
            firstName: {
              type: 'string',
              description: 'Prénom de l\'utilisateur',
              example: 'Jean',
            },
            lastName: {
              type: 'string',
              description: 'Nom de l\'utilisateur',
              example: 'Dupont',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'utilisateur',
              example: 'jean.dupont@example.com',
            },
            phone: {
              type: 'string',
              description: 'Téléphone de l\'utilisateur (format français)',
              example: '+33612345678',
            },
            role: {
              type: 'string',
              enum: ['admin', 'client'],
              description: 'Rôle de l\'utilisateur',
              example: 'client',
            },
            isActive: {
              type: 'boolean',
              description: 'Statut actif de l\'utilisateur',
              example: true,
            },
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  example: '123 Rue de la Paix',
                },
                city: {
                  type: 'string',
                  example: 'Paris',
                },
                postalCode: {
                  type: 'string',
                  example: '75001',
                },
                country: {
                  type: 'string',
                  example: 'France',
                },
              },
            },
            fullName: {
              type: 'string',
              description: 'Nom complet (propriété virtuelle)',
              example: 'Jean Dupont',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Message d\'erreur',
                },
                statusCode: {
                  type: 'integer',
                  example: 400,
                },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                      },
                      message: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Opération réussie',
            },
            data: {
              type: 'object',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Données récupérées avec succès',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1,
                },
                limit: {
                  type: 'integer',
                  example: 10,
                },
                total: {
                  type: 'integer',
                  example: 100,
                },
                totalPages: {
                  type: 'integer',
                  example: 10,
                },
                hasNextPage: {
                  type: 'boolean',
                  example: true,
                },
                hasPrevPage: {
                  type: 'boolean',
                  example: false,
                },
              },
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Requête invalide',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Unauthorized: {
          description: 'Non authentifié',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Forbidden: {
          description: 'Accès interdit',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Ressource introuvable',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Conflict: {
          description: 'Conflit de données',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Erreur interne du serveur',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Users',
        description: 'Endpoints pour la gestion des utilisateurs',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Chemins vers les fichiers contenant les annotations Swagger
};

// Générer la spécification Swagger
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Options de l'interface Swagger UI
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Agence Immobilière - Documentation',
};

module.exports = {
  swaggerSpec,
  swaggerUi,
  swaggerUiOptions,
};
