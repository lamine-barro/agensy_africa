# Architecture

```text
Application Expo ──────┐
                        ├── API Express ── PostgreSQL ou mémoire en développement
Back-office React ─────┘         │
                                  ├── Jeko : lien de paiement et webhook signé
                                  ├── WhatsApp : OTP et notifications configurables
                                  └── FNE : adaptateur présent, non raccordé au flux de facture actuel
```

## Composants

- `mobile/` : application Expo iOS/Android, localisation et i18n FR/EN.
- `web/` : back-office React destiné aux opérateurs.
- `api/` : API Express, autorisation par jeton signé et règles de commande.
- `api/src/database.js` : persistance PostgreSQL lorsque `DATABASE_URL` est défini ; mémoire en développement sinon.
- `api/src/integrations.js` : adaptateurs Jeko, WhatsApp et FNE.

## Flux de commande

`draft → submitted → adjusted? → accepted → paid → delivered`

Le client crée et soumet une commande. L'opérateur peut l'ajuster ou l'accepter. L'acceptation crée un lien Jeko. Le webhook Jeko valide le paiement, crée une facture manuelle en attente et notifie le client. L'opérateur émet ensuite la facture et peut préparer son partage WhatsApp.

## Limites importantes

- Le lien Jeko est actuellement construit par l'adaptateur ; la confirmation de paiement dépend du webhook signé.
- Les notifications sont persistées dans l'application ; WhatsApp dépend de `WHATSAPP_WEBHOOK_URL` et les push ne sont pas implémentées.
- L'adaptateur FNE est un point d'extension. Il n'est pas appelé par le flux de facture manuel.
- Les secrets, jetons et URL de prestataires restent exclusivement côté serveur, sauf le jeton Mapbox public destiné au mobile.
