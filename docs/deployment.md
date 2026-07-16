# Déploiement et intégrations

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `PORT` | Port HTTP de l'API |
| `PUBLIC_BASE_URL` | URL publique de l'API |
| `JEKO_PAYMENT_URL` | Point de départ du checkout Jeko |
| `FNE_API_URL`, `FNE_API_TOKEN` | API DGI FNE et jeton Bearer de production |
| `WHATSAPP_WEBHOOK_URL` | Passerelle WhatsApp approuvée |
| `DATABASE_URL` | PostgreSQL de production, obligatoire lorsque `NODE_ENV=production` |
| `JWT_SECRET` | Secret de signature des sessions, 32 caractères minimum |
| `CORS_ORIGINS` | Liste séparée par des virgules des frontends autorisés |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Identifiants de l'espace opérateur |
| `JEKO_WEBHOOK_SECRET` | Secret HMAC utilisé pour vérifier `X-Jeko-Signature` |

## Checklist avant mise en production

1. Installer PostgreSQL, appliquer `api/migrations/001_initial.sql` et activer des sauvegardes chiffrées testées.
2. Configurer HTTPS, `CORS_ORIGINS` limité aux domaines Agensy et une gestion de secrets.
3. Obtenir et tester les identifiants Jeko; vérifier les webhooks, montants et idempotency keys.
4. Réaliser l'homologation DGI/FNE : environnement de test, spécimens, validation de l'interfaçage et clé de production.
5. Ne publier une FNE qu'après réponse certifiée; stocker son numéro annuel, QR code, visuel et PDF. Suivre le sticker FNE de 20 FCFA TTC séparément.
6. Mettre en place observabilité, alertes d'échec de certification, journal d'audit et politique de rétention des données.
7. Vérifier le flux complet : OTP WhatsApp, commande, paiement webhook Jeko signé, FNE et livraison.

## Lancement local

```bash
npm install
npm run dev:api
npm run dev:web
npm run dev:mobile
```

Le mobile sur téléphone a besoin de `EXPO_PUBLIC_API_URL=http://ADRESSE_IP_LOCALE:4000`. L'émulateur Android utilise normalement `http://10.0.2.2:4000`.

Pour les binaires de diffusion, utiliser EAS Build après avoir créé les identifiants Apple et Android d'Agensy. Ne jamais embarquer les clés Jeko ou FNE dans le bundle mobile : l'application appelle uniquement l'API Agensy.
