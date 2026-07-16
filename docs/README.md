# Documentation Agensy Africa

Cette documentation décrit l'état effectif du produit et de son exploitation. Le code reste la source de vérité pour les comportements précis.

- [Référentiel produit](product.md) : périmètre, parcours et règles métier.
- [Architecture](architecture.md) : composants, données et intégrations.
- [API HTTP v1](api.md) : routes, authentification et flux de commande.
- [Déploiement](deployment.md) : configuration locale et prérequis de production.

## Principes de maintenance

- Mettre à jour ce dossier dans le même changement que le comportement concerné.
- Ne documenter comme disponible que ce qui est implémenté et configuré.
- Conserver les décisions produit dans `product.md`, les contrats dans `api.md` et les procédures dans `deployment.md`.
