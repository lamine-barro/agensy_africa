# Référentiel produit

## Objet et périmètre

Agensy Africa est une plateforme B2B d'approvisionnement agroalimentaire. Le dépôt couvre l'application mobile client, le back-office opérateur, l'API et les intégrations de paiement, de messagerie et de facturation.

La première version permet à un commerce de créer son profil, consulter le catalogue, créer une commande mono-produit, la faire valider par un opérateur, payer puis suivre sa livraison. Les montants sont réglés en XOF via Jeko ; la devise sélectionnée dans le mobile ne change que l'affichage.

## Utilisateurs et parcours client

Les clients sont des commerces formels ou informels : boutiques, restaurants et maquis, hôtels, cantines et revendeurs.

1. Le client saisit son indicatif et son numéro WhatsApp, puis valide un OTP à quatre chiffres.
2. Il complète son profil en quatre étapes : commerce, responsable, livraison et facturation.
3. Il consulte le catalogue, choisit un produit et une quantité autorisée.
4. Il indique une adresse, des instructions et un mode de livraison : immédiat, planifié ou récurrent.
5. Il envoie la commande. Un opérateur valide ou ajuste la livraison et la date.
6. Après acceptation, le client reçoit le lien de paiement Jeko, puis suit la livraison et la facture depuis l'application.

Le NCC est requis pour un commerce établi en Côte d'Ivoire. Pour un client international, l'identifiant fiscal ou registre de commerce et le pays de facturation sont requis. La recherche Mapbox aide à saisir l'adresse ; l'utilisateur peut toujours la modifier manuellement.

## Commandes et tarification

- Une commande contient un seul produit.
- La quantité doit rester entre les bornes définies par le produit.
- Le prix est calculé selon `prix unitaire × contenu de l'unité × quantité`.
- Les frais de service sont distincts des frais de livraison et des taxes.
- Le prix et les frais de livraison sont figés au moment de l'acceptation par l'opérateur.

Les statuts de commande sont `draft`, `submitted`, `adjusted`, `accepted`, `paid`, `delivered` et `cancelled`. Les transitions autorisées sont définies dans la configuration de l'application ; une commande payée ou livrée ne peut plus être annulée.

## Notifications et factures

Chaque changement important crée une notification dans l'application. WhatsApp est utilisé lorsque sa passerelle est configurée. Les notifications push ne font pas encore partie de l'implémentation.

La facturation actuellement implémentée est manuelle : après paiement, une facture passe de `pending_manual_issue` à `issued_manual`, puis éventuellement à `shared_whatsapp`. Une facture ne doit pas être présentée comme certifiée FNE tant qu'une intégration FNE réellement homologuée n'est pas déployée.

## Interface mobile

L'application est disponible en français et en anglais. Les libellés d'interface sont centralisés dans `mobile/src/i18n/`. Les composants privilégient une lecture claire, des zones tactiles larges, les icônes Lucide et des surfaces sans ombre ni dégradé.

## Hors périmètre actuel

- panier multi-produit ;
- notifications push ;
- émission et certification FNE automatisées ;
- vérification externe du NCC ;
- calcul de livraison automatisé avancé ;
- pause d'une commande récurrente.
