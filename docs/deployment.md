# Déploiement et configuration

## Variables d'environnement

Les variables documentées dans `.env.example` sont la référence locale.

| Variable | Rôle |
|---|---|
| `NODE_ENV`, `PORT`, `PUBLIC_BASE_URL` | Exécution de l'API |
| `DATABASE_URL`, `DATABASE_SSL`, `DATABASE_SSL_REJECT_UNAUTHORIZED` | PostgreSQL |
| `JWT_SECRET` | Signature des sessions, au moins 32 caractères |
| `CORS_ORIGINS` | Origines autorisées du back-office |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Connexion opérateur |
| `JEKO_PAYMENT_URL`, `JEKO_WEBHOOK_SECRET` | Paiement et vérification du webhook |
| `WHATSAPP_WEBHOOK_URL` | OTP et notifications WhatsApp |
| `FNE_API_URL`, `FNE_API_TOKEN` | Futur raccordement FNE ; non utilisé par la facturation manuelle |
| `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` | Jeton Mapbox public pour le mobile |
| `ALLOW_DEMO_OTP` | Développement local uniquement ; interdit en production |

## Lancement local

```bash
cp .env.example .env
npm install
npm run dev:api
npm run dev:web
npm run dev:mobile
```

Sur téléphone, définir `EXPO_PUBLIC_API_URL=http://ADRESSE_IP_LOCALE:4000`. L'émulateur Android utilise habituellement `http://10.0.2.2:4000`.

## Préparation de production

1. Placer les secrets dans le gestionnaire de secrets de l'hébergeur, jamais dans Git ou le bundle mobile.
2. Configurer PostgreSQL, puis exécuter `npm --workspace api run migrate`.
3. Déployer derrière HTTPS et limiter `CORS_ORIGINS` aux domaines connus.
4. Configurer et tester le webhook Jeko avec son secret HMAC.
5. Vérifier l'envoi OTP et WhatsApp avec la passerelle retenue.
6. Tester le parcours complet : OTP, profil, commande, ajustement, paiement webhook, facture manuelle et livraison.

La certification FNE automatisée et les notifications push nécessitent un travail d'intégration supplémentaire avant activation.
