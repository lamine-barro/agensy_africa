# Documentation Agensy Africa

## Contenu

- [Architecture](architecture.md) : composants, flux et règles métier.
- [API](api.md) : contrat HTTP pour le mobile et le back-office.
- [Déploiement](deployment.md) : variables, sécurité et mise en production.

## Périmètre de la première version

Le produit couvre l'onboarding WhatsApp/OTP, le profil B2B, le catalogue de 28 produits, une commande mono-produit, sa validation humaine, le paiement Jeko, le suivi, les notifications et la préparation de la FNE. Les intégrations réglementées ne sont jamais simulées comme si elles étaient certifiées : elles sont indiquées `pending_configuration` tant que les clés de production ne sont pas installées.

## Mobile : React Native + Expo

Le dossier `mobile/` utilise React Native via Expo, un choix adapté à une application B2B iOS/Android performante : rendu natif, accès aux notifications, caméra et géolocalisation, puis builds signés via EAS. La nouvelle architecture React Native est activée (`newArchEnabled`). Les listes produit et commandes utilisent `FlatList`; conserver cette approche (pagination API, images redimensionnées et cache) lorsque le catalogue grandira.

### Internationalisation

Tous les libellés produits par l’application mobile sont centralisés dans `mobile/src/i18n/fr.js` et `mobile/src/i18n/en.js`. `translate()` prend en charge l’interpolation et les pluriels, tandis que `formatMoney()` applique la langue et la devise sélectionnées. Ajouter une langue consiste à créer un dictionnaire complet puis à l’enregistrer dans `mobile/src/i18n/index.js`; aucun texte d’interface ne doit être écrit directement dans les écrans.
