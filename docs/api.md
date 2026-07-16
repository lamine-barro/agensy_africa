# API HTTP v1

Base locale : `http://localhost:4000`. Les réponses sont JSON. Les routes privées attendent `Authorization: Bearer <accessToken>`.

En développement, `ALLOW_DEMO_OTP=true` ajoute le code OTP à la réponse de demande. Cette option est refusée en production.

## Routes publiques

| Méthode | Route | Usage |
|---|---|---|
| `GET` | `/health` | État du service et mode de persistance |
| `GET` | `/assets/:filename` | Image produit |
| `GET` | `/assets/branding/:key` | Ressource de marque |
| `GET` | `/v1/config` | Configuration applicative |
| `GET` | `/v1/branding` | Métadonnées de marque |
| `GET` | `/v1/products?q=` | Catalogue et filtre optionnel |
| `GET` | `/v1/products/:id` | Produit |
| `POST` | `/v1/auth/request-otp` | Demande d'OTP WhatsApp |
| `POST` | `/v1/auth/verify-otp` | Validation OTP et création de session |
| `POST` | `/v1/webhooks/jeko` | Confirmation de paiement, signature `X-Jeko-Signature` requise |

## Routes client authentifiées

| Méthode | Route | Usage |
|---|---|---|
| `PUT` | `/v1/customers/:id/profile` | Mettre à jour le profil du client propriétaire |
| `GET` | `/v1/orders` | Lister ses commandes |
| `GET` | `/v1/orders/:id` | Consulter une commande autorisée |
| `POST` | `/v1/orders` | Créer un brouillon |
| `POST` | `/v1/orders/:id/submit` | Soumettre un brouillon |
| `POST` | `/v1/orders/:id/cancel` | Annuler une commande non payée et non livrée |
| `GET` | `/v1/invoices` | Lister ses factures |
| `GET` | `/v1/notifications` | Lister ses notifications |

## Routes opérateur ou administrateur

| Méthode | Route | Usage |
|---|---|---|
| `POST` | `/v1/admin/auth/login` | Ouvrir une session opérateur |
| `POST` | `/v1/admin/orders/:id/accept` | Accepter une commande et créer le lien Jeko |
| `POST` | `/v1/admin/orders/:id/adjust` | Ajuster les frais et la date de livraison |
| `POST` | `/v1/admin/orders/:id/deliver` | Marquer une commande payée comme livrée |
| `POST` | `/v1/admin/invoices/:id/issue` | Enregistrer une facture manuelle émise |
| `POST` | `/v1/admin/invoices/:id/whatsapp-share` | Préparer le partage WhatsApp d'une facture émise |

## Exemple de création de commande

```json
POST /v1/orders
{
  "productId": "rice",
  "quantity": 2,
  "deliveryAddress": { "label": "Cocody, Abidjan" },
  "schedule": { "type": "asap" },
  "instructions": "Appeler avant livraison"
}
```

La commande est créée au statut `draft`. Le client l'envoie ensuite avec `POST /v1/orders/:id/submit`.

## Sécurité

Les ressources client sont filtrées par propriétaire. Les routes d'administration exigent le rôle `operator` ou `admin`. Les limites de débit protègent l'OTP et la connexion opérateur. Le webhook Jeko rejette toute signature HMAC invalide.
