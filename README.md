# Agensy Africa

Plateforme B2B d'approvisionnement agroalimentaire. Ce dépôt contient l'API, le back-office web, l'application mobile et les documents d'exploitation.

## Démarrage

```bash
cp .env.example .env
npm install
npm run dev:api
npm run dev:web
npm run dev:mobile
```

En développement, l'API utilise des données en mémoire. En production, `DATABASE_URL` est obligatoire et les données sont persistées dans PostgreSQL. Les connecteurs externes sont isolés dans `api/src/integrations.js`.

## Déploiement

1. Créez les secrets de production à partir de `.env.example` : `DATABASE_URL`, `JWT_SECRET` (au moins 32 caractères), les origines CORS, les identifiants opérateur, le secret de webhook Jeko et les accès WhatsApp/FNE.
2. Exécutez la migration : `npm --workspace api run migrate`.
3. Construisez l'image : `docker build -t agensy-africa .`, puis déployez-la derrière un proxy HTTPS.
4. Configurez `VITE_API_URL` / `EXPO_PUBLIC_API_URL` avec l'URL HTTPS de l'API avant de construire respectivement le back-office et l'application mobile.

`docker compose up --build` permet un démarrage contrôlé avec PostgreSQL local. Ne déployez jamais le fichier `.env` dans Git.

Consultez [la documentation](docs/README.md) avant un déploiement ou un raccordement Jeko/FNE.
