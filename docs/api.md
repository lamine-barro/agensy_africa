# API HTTP v1

Base locale : `http://localhost:4000`. Toutes les réponses sont JSON. Les routes privées exigent `Authorization: Bearer <accessToken>`. En développement seulement, activez `ALLOW_DEMO_OTP=true` pour récupérer le code OTP dans la réponse; ce mécanisme est refusé en production.

| Méthode | Route | Usage |
|---|---|---|
| `GET` | `/health` | Sonde de service |
| `GET` | `/v1/products?q=` | Catalogue, filtre optionnel |
| `POST` | `/v1/auth/request-otp` | Demande d'OTP WhatsApp |
| `POST` | `/v1/auth/verify-otp` | Création de session |
| `PUT` | `/v1/customers/:id/profile` | Profil commercial |
| `GET/POST` | `/v1/orders` | Liste ou création d'un brouillon |
| `POST` | `/v1/orders/:id/submit` | Envoi à l'opérateur |
| `POST` | `/v1/admin/orders/:id/accept` | Validation et lien Jeko |
| `POST` | `/v1/webhooks/jeko` | Webhook de paiement, signature HMAC `X-Jeko-Signature` obligatoire |
| `POST` | `/v1/admin/orders/:id/deliver` | Marquage livré |
| `GET` | `/v1/invoices` | FNE du client |

## Créer puis envoyer une commande

```json
POST /v1/orders
{
  "customerId": "customer_2250700000000",
  "productId": "rice",
  "quantity": 2,
  "deliveryAddress": { "label": "Cocody, Abidjan" },
  "schedule": { "type": "asap" },
  "instructions": "Appeler avant livraison"
}
```

La réponse contient le prix détaillé. L'envoi se fait ensuite avec `POST /v1/orders/:id/submit`.

## Sécurité

Les clients reçoivent une session signée après validation OTP. Les ressources sont filtrées par propriétaire; les routes `/admin` exigent un rôle opérateur. Le webhook Jeko ne traite aucune transaction sans signature HMAC valide. Les identifiants opérateur, secrets et URL des prestataires sont uniquement configurés côté serveur.
