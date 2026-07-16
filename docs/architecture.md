# Architecture

```text
Application Expo ──────┐
                        ├── API Express ── Catalogue / Commandes / Notifications
Back-office React ─────┘         │
                                  ├── Jeko : lien de paiement
                                  ├── DGI FNE : certification de facture
                                  └── WhatsApp : information client
```

## Cycle de commande

`brouillon → envoyée → acceptée → payée → livrée`

L'opérateur peut modifier le transport et la date avant l'acceptation. Une commande non payée peut être annulée. Chaque transition doit générer une notification in-app, push et WhatsApp; le premier canal est déjà persisté par l'API, les deux autres passent par les adaptateurs.

## Règles centrales

- Une commande porte sur un seul produit.
- `sous-total = prix/kg ou L × contenu de l'unité × quantité`.
- Les 2 000 FCFA de frais de service sont distincts de la livraison et des taxes.
- La quantité est bornée par chaque produit.
- Le NCC est obligatoire pour un commerce établi en Côte d'Ivoire; il doit ensuite être vérifié par un service métier avant émission réelle de FNE.
- Le prix est figé lors de l'envoi de la commande. Pour la persistance de production, enregistrer un instantané immuable du produit et de la grille tarifaire dans l'item de commande.

## À remplacer avant production

Le `store.js` en mémoire est intentionnellement une base de démonstration. Le remplacer par PostgreSQL (transactions pour changement d'état), un stockage objet privé pour les PDF FNE, une file de tâches pour les webhooks et un fournisseur de push. Les secrets ne doivent jamais atteindre le web ou l'application mobile.
