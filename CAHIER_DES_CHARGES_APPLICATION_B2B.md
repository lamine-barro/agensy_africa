# Agensy Africa — Cahier des charges fonctionnel de l’application B2B

## 1. Vision du produit

Agensy Africa est une plateforme d’approvisionnement en produits agroalimentaires destinée aux professionnels (B2B) en Côte d’Ivoire, dans la sous-région et à l’international. L’application mobile permet aux commerces de commander, planifier, payer et suivre leurs approvisionnements, avec un accompagnement opérationnel d’Agensy.

Elle répond notamment aux attentes suivantes :

- paiement bancaire et Mobile Money ;
- facturation électronique certifiée via la Facture normalisée électronique (FNE) de la Direction générale des Impôts (DGI) ;
- prévisibilité et traçabilité des approvisionnements ;
- stabilité mensuelle des prix ;
- qualité homogène des produits ;
- service de livraison intégré.

> Les achats effectués depuis l’application sont toujours réglés en FCFA via Jeko, même si l’utilisateur choisit une autre devise d’affichage.



## 2. Cibles

L’application s’adresse aux responsables de commerces formels ou informels :

- boutiques ;
- supérettes ;
- restaurants ;
- maquis ;
- cantines ;
- hôtels ;
- boulangeries ;
- revendeurs de quartier ;
- acheteurs internationaux.



## 3. Principes d’expérience

- Application mobile simple, commerciale et rassurante.
- Navigation sans menu dans le footer (barre de navigation inférieure).
- Les informations essentielles restent accessibles à travers les écrans, actions contextuelles et l’espace compte.
- Présentation visuelle soignée : produits illustrés clairement, libellés lisibles et bénéfices adaptés au type de commerce.
- Notifications de suivi disponibles dans l’application, en push et sur WhatsApp.



## 4. Inscription et onboarding



### 4.1 Création de compte

Le client télécharge l’application et s’inscrit avec son numéro WhatsApp. La vérification du numéro est réalisée par OTP.

### 4.2 Profil commerce

Après validation du numéro, l’utilisateur complète son profil professionnel avec :

- statut du commerce : formel ou informel ;
- géolocalisation du commerce (uniquement CIV si non si nternationnal, choisir pays et donner details de livraison pertinente);
- type de commerce ;
- nom du commerce ;
- nom et prénom du responsable ;
- rôle/fonction du responsable ;
- logo ou photo du commerce.

Pour un commerce établi en Côte d’Ivoire, le numéro de compte contribuable (NCC) doit être collecté et vérifié avant l’émission d’une facture B2B. Pour un client international, les informations d’identification et de contact exigées par la FNE sont collectées en lieu et place du NCC.

### 4.3 Écran de bienvenue après création du compte

L'écran de bienvenue intervient **après** la validation complète du profil professionnel, et non avant la connexion. Il confirme que le compte est prêt, rappelle les bénéfices Agensy (approvisionnement fiable, prix garantis, livraison suivie et facturation B2B) puis propose deux actions : `Découvrir le catalogue` ou `Aller à mon accueil`.

### 4.4 Parcours de référence mobile (normatif)

Le parcours ci-dessous remplace toute description contradictoire des formulaires d'inscription. Il doit rester séquentiel, court et reprendre l'utilisateur là où il s'est arrêté.

| Étape | Objectif | Champs et interactions | Règle de validation |
|---|---|---|---|
| 1. WhatsApp | Identifier le titulaire du compte | Indicatif pays séparé (`+225` par défaut) et numéro local ; le numéro complet est traité au format international | Numéro international valide |
| 2. OTP | Prouver la possession du numéro | Code à **4 chiffres**, quatre champs séparés, passage automatique à la case suivante et collage pris en charge | Les 4 chiffres sont obligatoires ; expiration 5 minutes |
| 3. Commerce | Qualifier le client B2B | Nom du commerce, type de commerce sous forme de choix, statut formel/informel | Les trois champs sont obligatoires |
| 4. Responsable | Identifier le contact opérationnel | Nom complet, fonction, e-mail professionnel facultatif ; le WhatsApp vérifié devient le canal de notification | Nom et fonction obligatoires |
| 5. Livraison | Créer l'adresse habituelle sans friction | Zone Côte d'Ivoire/international, ville, adresse/quartier, repère facultatif ; recherche et suggestions Mapbox, bouton de géolocalisation et saisie manuelle | Zone, ville et adresse obligatoires |
| 6. Facturation | Collecter le minimum fiscal adapté | NCC pour la Côte d'Ivoire ; identifiant fiscal/registre et pays de facturation pour l'international | Le champ fiscal adapté à la zone est obligatoire |
| 7. Bienvenue | Confirmer que le compte est opérationnel | Bénéfices récapitulés, accès catalogue ou accueil | Profil professionnel validé |

L'assistant affiche une progression de quatre étapes métier : **Commerce → Responsable → Livraison → Facturation**. Chaque écran ne présente que les champs utiles à cette étape, possède un bouton Retour à partir de la deuxième étape et empêche le passage suivant tant que les champs obligatoires ne sont pas complets.

Les coordonnées Mapbox servent uniquement à suggérer et normaliser une adresse. L'utilisateur garde toujours la maîtrise de l'adresse enregistrée, peut la corriger manuellement, et un repère libre est prévu pour les livreurs. La latitude/longitude sélectionnée peut être stockée avec l'adresse, mais ne remplace jamais son libellé lisible.

## 5. Accueil

L’écran principal comprend :

1. En-tête : logo Agensy à gauche ; icône de notifications et accès au compte client à droite.
2. Bloc principal « Nouvelle commande » : point d’entrée clair pour démarrer une commande.
3. Suggestions : produits récemment consultés, commandés ou pertinents selon le profil du commerce.
4. Aperçu des commandes : liste limitée des commandes récentes, avec un bouton « Voir toutes ».
5. Catalogue de produits disponibles.

Les statuts visibles pour une commande sont :

- Brouillon ;
- Envoyée ;
- Acceptée ;
- Payée ;
- Livrée.



## 6. Catalogue produits

Chaque produit est présenté sur une carte claire et attractive contenant au minimum :

- illustration  ;
- nom du produit ;
- description commerciale simple ;
- pertinence ou cas d’usage selon le type de commerce ;
- prix dans l’unité de mesure courante du produit ;
- mention « prix Agensy garanti mensuellement » ;
- origine (champ libre : exemple, « Coopérative de femmes à Mayo » ou « Plantation familiale Konaté à Abengourou ») ;
- réglementation (champ libre, basé sur le référentiel international en vigueur) ;
- référentiel applicable ;
- quantité minimale et quantité maximale commandables.



### Produits initiaux

Les unités de vente, bornes et prix unitaires ci-dessous sont des paramètres de lancement proposés pour le B2B. Les prix de référence sont exprimés en FCFA par kg ou par litre, hors frais de livraison et de service ; ils doivent rester configurables dans le back-office.

1. Riz local (sac de 25 kg ; minimum : 1 sac ; maximum : 20 sacs ; prix de référence : 450 FCFA/kg)
2. Huile de palme (bidon de 20 L ; minimum : 1 bidon ; maximum : 20 bidons ; prix de référence : 1 000 FCFA/L)
3. Attiéké (sac de 10 kg ; minimum : 1 sac ; maximum : 20 sacs ; prix de référence : 350 FCFA/kg)
4. Banane plantain (sac de 25 kg ; minimum : 1 sac ; maximum : 20 sacs ; prix de référence : 500 FCFA/kg)
5. Igname (sac de 50 kg ; minimum : 1 sac ; maximum : 10 sacs ; prix de référence : 450 FCFA/kg)
6. Gari (sac de 25 kg ; minimum : 1 sac ; maximum : 10 sacs ; prix de référence : 600 FCFA/kg)
7. Manioc frais (sac de 50 kg ; minimum : 1 sac ; maximum : 10 sacs ; prix de référence : 300 FCFA/kg)
8. Farine de manioc (sac de 25 kg ; minimum : 1 sac ; maximum : 10 sacs ; prix de référence : 600 FCFA/kg)
9. Maïs (sac de 50 kg ; minimum : 1 sac ; maximum : 10 sacs ; prix de référence : 250 FCFA/kg)
10. Patate douce (sac de 25 kg ; minimum : 1 sac ; maximum : 20 sacs ; prix de référence : 500 FCFA/kg)
11. Piment frais (caisse de 10 kg ; minimum : 1 caisse ; maximum : 20 caisses ; prix de référence : 2 200 FCFA/kg)
12. Gingembre frais (sac de 25 kg ; minimum : 1 sac ; maximum : 10 sacs ; prix de référence : 1 500 FCFA/kg)
13. Pâte d’arachide (seau de 5 kg ; minimum : 1 seau ; maximum : 20 seaux ; prix de référence : 1 800 FCFA/kg)
14. Huile d’arachide (bidon de 5 L ; minimum : 1 bidon ; maximum : 20 bidons ; prix de référence : 1 800 FCFA/L)
15. Arachides grillées (carton de 5 kg ; minimum : 1 carton ; maximum : 20 cartons ; prix de référence : 1 800 FCFA/kg)
16. Ananas frais (caisse de 12 kg ; minimum : 1 caisse ; maximum : 30 caisses ; prix de référence : 600 FCFA/kg)
17. Mangue fraîche (caisse de 20 kg ; minimum : 1 caisse ; maximum : 20 caisses ; prix de référence : 500 FCFA/kg)
18. Poudre de cacao (sac de 25 kg ; minimum : 1 sac ; maximum : 10 sacs ; prix de référence : 5 000 FCFA/kg)
19. Miel (seau de 5 kg ; minimum : 1 seau ; maximum : 20 seaux ; prix de référence : 3 500 FCFA/kg)
20. Coco sec (sac de 25 kg ; minimum : 1 sac ; maximum : 20 sacs ; prix de référence : 800 FCFA/kg)
21. Mangue séchée (carton de 5 kg ; minimum : 1 carton ; maximum : 20 cartons ; prix de référence : 5 000 FCFA/kg)
22. Ananas séché (carton de 5 kg ; minimum : 1 carton ; maximum : 20 cartons ; prix de référence : 6 000 FCFA/kg)
23. Banane séchée (carton de 5 kg ; minimum : 1 carton ; maximum : 20 cartons ; prix de référence : 4 500 FCFA/kg)
24. Bissap / hibiscus séché (sac de 25 kg ; minimum : 1 sac ; maximum : 10 sacs ; prix de référence : 2 500 FCFA/kg)
25. Gingembre séché (sac de 25 kg ; minimum : 1 sac ; maximum : 10 sacs ; prix de référence : 3 500 FCFA/kg)
26. Noix de cajou brutes (sac de 25 kg ; minimum : 1 sac ; maximum : 10 sacs ; prix de référence : 400 FCFA/kg)
27. Fèves de cacao (sac de 65 kg ; minimum : 1 sac ; maximum : 10 sacs ; prix de référence : 1 200 FCFA/kg)
28. Beurre de karité (seau de 25 kg ; minimum : 1 seau ; maximum : 10 seaux ; prix de référence : 3 000 FCFA/kg)

Le prix des produits d’une commande est calculé automatiquement à partir du prix de référence actif : `prix unitaire (kg ou L) × contenu de l’unité de vente × nombre d’unités commandées`. L’application affiche le sous-total produits, puis ajoute séparément les frais de livraison, les frais de service Agensy et les taxes applicables. Seul le prix actif au moment de l’envoi de la commande est conservé dans la commande et repris sur la facture.

## 7. Création d’une commande

L’utilisateur peut créer trois types de commandes :

- **Dès que possible** ;
- **Planifiée** à une date précise ;
- **Récurrente**, à fréquence hebdomadaire ou mensuelle.

Chaque commande porte sur un seul produit. Pour commander plusieurs produits, le client crée une commande distincte pour chacun d’eux.

Pour chaque commande, il peut :

- sélectionner le produit et la quantité, dans les bornes minimales et maximales définies ;
- modifier la géolocalisation de livraison, indépendamment de celle enregistrée dans son profil ;
- ajouter des instructions particulières ;
- envoyer la commande pour validation.

Pour une commande planifiée, la date souhaitée est obligatoire. Pour une commande récurrente, le client choisit explicitement une fréquence hebdomadaire ou mensuelle. Ces paramètres sont affichés dans le récapitulatif avant l'envoi.



## 8. Validation et tarification

Avant l’envoi final, le client accède à une page de validation qui détaille :

- prix d’achat des produits ;
- frais de livraison estimés ;
- frais de service Agensy : **2 000 FCFA par commande** ;
- total estimatif de la commande.

Les frais de livraison sont calculés automatiquement à partir de paramètres tels que :

- lieu de livraison ;
- type de produits ;
- période ;
- volume/quantité ;
- type de véhicule requis.

Cette estimation est soumise à la validation d’un opérateur Agensy dans le back-office. L’opérateur peut ajuster le prix du transport et/ou la date de livraison avant acceptation.

## 9. Validation humaine et paiement

### Phase actuelle : facture manuelle

Tant que l'intégration DGI/FNE n'est pas homologuée, la facture est générée manuellement par l'équipe Agensy après confirmation du paiement. Le back-office enregistre son numéro et, si disponible, son lien PDF, puis ouvre WhatsApp avec un message prérempli vers le client. Le partage est tracé avec les statuts `à émettre manuellement`, `émise manuellement` et `partagée sur WhatsApp`. Aucune facture ne doit être présentée comme certifiée FNE pendant cette phase.

Après envoi, la commande est en attente de validation par un opérateur Agensy. L’application affiche un compte à rebours de 24 heures.

- Si la commande est acceptée, le client est informé dans l’application, par notification push et via WhatsApp.
- Si un opérateur apporte un ajustement (transport ou date de livraison), le compte à rebours est réinitialisé et le client est notifié.
- Une fois la commande acceptée, un lien de paiement Jeko est mis à disposition.
- Après paiement, le statut passe à « Commande payée ».
- Après paiement, l’application transmet les données de vente à la plateforme FNE de la DGI pour certification.
- La FNE certifiée est mise à disposition au format PDF dans l’application et envoyée au client sur WhatsApp.



### 9.1 Facturation normalisée électronique (FNE)

Agensy émet ses factures de vente B2B via son système de facturation, puis les fait certifier par la plateforme FNE de la DGI au moyen de l’API officielle. La certification est obligatoire avant la mise à disposition de la facture au client.

Chaque FNE certifiée doit comporter les éléments réglementaires délivrés par la DGI :

- le QR code de vérification ;
- le visuel FNE ;
- le numéro officiel de facture, dans une série annuelle ininterrompue.

Pour chaque facture, l’application transmet au minimum à la FNE :

- le type de facture et le mode de paiement ;
- le type de transaction B2B, ou B2F pour un client international ;
- l’identité, le NCC du client B2B ivoirien, son téléphone et son e-mail ;
- le point de vente et l’établissement Agensy ;
- la désignation du produit, sa quantité, son unité de mesure, son prix unitaire hors taxes, la TVA applicable et les éventuelles remises ou taxes spécifiques.

L’intégration doit utiliser l’API REST de la DGI, au format JSON et avec une authentification sécurisée par jeton Bearer. Avant la mise en production, Agensy s’inscrit sur la plateforme FNE, réalise les tests requis, transmet les spécimens de factures à la DGI et obtient la validation de l’interfaçage ainsi que sa clé API de production.

En cas d’annulation ou de réduction après émission, l’application génère une facture d’avoir, totale ou partielle, référencée à la facture d’origine. Le coût du sticker électronique FNE est de 20 FCFA TTC par facture et doit être suivi dans le back-office. Le timbre de quittance, lorsqu’il est applicable, reste distinct du sticker FNE.

## 10. Gestion des commandes

Dans son espace commandes, le client peut :

- consulter l’historique et le détail de chaque commande ;
- suivre les statuts de commande ;
- suspendre temporairement une commande récurrente ;
- annuler une commande tant qu’elle n’a pas été payée.



## 11. Compte et paramètres

L’espace compte permet notamment de :

- mettre à jour les informations du commerce et du responsable ;
- gérer les préférences de notification ;
- consulter et télécharger ses FNE certifiées ;
- recevoir automatiquement chaque FNE certifiée dans l’application et via WhatsApp ;
- changer la langue de l’application ;
- changer la devise d’affichage des produits.



## 12. Notifications

Les changements importants de statut doivent être notifiés par trois canaux :

- notification dans l’application ;
- notification push ;
- message WhatsApp.

Les principaux événements sont : commande envoyée, demande d’ajustement, commande acceptée, lien de paiement disponible, paiement confirmé, facture disponible et commande livrée.
