# MixMatchFrip — Rapport de livraison technique
### Mise à jour de la plateforme · Avril 2026

---

## Vue d'ensemble

Ce document présente l'ensemble des améliorations apportées à la plateforme **MixMatchFrip** lors de cette itération de développement. Chaque point traite d'une fonctionnalité nouvelle, d'une correction critique ou d'une amélioration de l'expérience utilisateur, avec une explication claire de ce qui a changé et pourquoi.

---

## 1. Affichage des produits — Images non recadrées

**Problème constaté**
Les photos de vêtements étaient recadrées de manière automatique sur toutes les pages (catalogue, fiche produit, page d'accueil), coupant parfois les manches, le bas ou les détails importants d'une pièce.

**Ce qui a été fait**
Le comportement d'affichage des images a été corrigé sur l'ensemble du site : les photos s'affichent maintenant dans leur intégralité, centrées, sans déformation. Que le vêtement soit en portrait, paysage ou carré, il est toujours visible en entier.

**Impact client**
Les clientes voient exactement ce qu'elles achètent. Cela réduit les retours liés à des attentes visuelles non satisfaites et renforce la confiance dans la qualité des articles proposés.

---

## 2. Cartes produit — Design uniforme et cohérent

**Problème constaté**
Les cartes produit avaient des hauteurs variables selon la longueur des noms d'articles, créant une grille visuellement chaotique. Les noms trop longs débordaient ou étiraient les cartes de façon irrégulière.

**Ce qui a été fait**
- Toutes les cartes d'une même rangée ont désormais exactement la même hauteur, quelle que soit la longueur du nom ou du texte.
- Les noms d'articles trop longs sont tronqués proprement sur 2 lignes avec ellipse (…), sans jamais casser la mise en page.
- Les prix sont systématiquement alignés en bas de la section info, peu importe le contenu au-dessus.
- Le fond des cartes est légèrement accentué par rapport au fond de la page — une distinction subtile qui donne du relief sans surcharger visuellement.
- L'ombre apparaît uniquement au survol, gardant la grille épurée au repos.

**Impact client**
Une grille propre et professionnelle inspire confiance. Le catalogue ressemble à celui d'une boutique haut de gamme, pas à un marché désorganisé.

---

## 3. Version mobile — Panier et cartes produit

**Problème constaté**
Sur mobile, le panier affichait les informations de manière désordonnée : prix, quantités et boutons se chevauchaient ou sortaient de l'écran. Les cartes produit du catalogue montraient des noms trop longs qui cassaient le layout.

**Ce qui a été fait**
- Le panier mobile a été entièrement reconstruit avec une grille à deux colonnes : photo à gauche, informations structurées à droite.
- Le bouton de suppression se positionne en haut à droite de chaque article, accessible sans interférer avec le reste.
- Les prix restent visibles et lisibles en toutes circonstances.
- Sur les cartes produit mobile, les noms sont tronqués intelligemment pour ne jamais déborder.

**Impact client**
La majorité des achats e-commerce se font sur mobile. Un panier lisible et ergonomique réduit l'abandon en cours de commande.

---

## 4. Tunnel de commande — Pré-remplissage pour les clients connectés

**Problème constaté**
Les clientes ayant un compte devaient re-saisir manuellement toutes leurs informations de livraison à chaque commande, même si elles avaient déjà acheté.

**Ce qui a été fait**
- Dès l'arrivée sur le formulaire d'adresse, le nom, prénom, email et téléphone du compte connecté sont automatiquement pré-remplis.
- Une case à cocher "Enregistrer cette adresse" permet à la cliente de sauvegarder sa nouvelle adresse en un clic pour les prochaines commandes.

**Impact client**
Moins de friction = plus de conversions. Une cliente qui n'a pas à tout retaper est une cliente qui finalise plus facilement son achat.

---

## 5. Tunnel de commande — Correction des erreurs bloquantes

Deux bugs critiques empêchaient la finalisation des commandes :

**Bug 1 — "Le panier est vide" pour les visiteurs non connectés**
Les visiteuses sans compte voyaient ce message d'erreur même avec des articles dans leur panier. Le système ne transmettait pas correctement l'identifiant du panier lors de la création de la commande. Corrigé : l'identifiant est maintenant toujours inclus dans la requête, que la cliente soit connectée ou non.

**Bug 2 — "Erreur lors de la création de commande" générique**
Si les tarifs d'expédition n'avaient pas été chargés correctement, le système plantait silencieusement avec un message vague. Corrigé : un message clair invite maintenant la cliente à revenir à l'étape précédente et rechoisir son mode de livraison.

**Impact client**
Ces deux bugs bloquaient des ventes. Leur correction signifie que chaque commande commencée peut maintenant être finalisée.

---

## 6. Suivi de colis — Intégration Chit Chats

**Ce qui a été fait**
Dès qu'une commande est payée, un envoi est automatiquement créé chez **Chit Chats** (le partenaire d'expédition). L'identifiant de suivi est sauvegardé sur la commande et un **lien de suivi personnalisé** est inclus dans l'email de confirmation envoyé à la cliente.

Le système calcule automatiquement :
- Le poids total du colis à partir des articles commandés
- Les dimensions estimées de l'emballage
- Le code de province correct pour l'adresse de livraison

Si Chit Chats est temporairement indisponible, la commande est quand même confirmée normalement — la robustesse du système est garantie.

**Impact client**
La cliente reçoit son lien de suivi immédiatement après le paiement, sans aucune intervention manuelle de votre part. Cela réduit les questions "où est ma commande ?" et professionnalise l'expérience post-achat.

---

## 7. Email de confirmation — Informations complètes

**Ce qui a été fait**
L'email de confirmation de commande contient maintenant toutes les informations dont la cliente a besoin :

- Récapitulatif complet des articles achetés avec prix
- Adresse de livraison confirmée
- **Lien de suivi Chit Chats** (bouton cliquable + lien texte en fallback)
- Pour les nouvelles clientes dont le compte a été créé automatiquement à la commande : **les identifiants de connexion** (email + mot de passe temporaire) avec invitation à les modifier

**Impact client**
Un seul email contient tout. La cliente est autonome dès la réception : elle sait ce qu'elle a acheté, où va son colis, et comment accéder à son compte.

---

## 8. Réinitialisation de mot de passe — Correction

**Problème constaté**
Le lien de réinitialisation de mot de passe dans l'email pointait vers le serveur backend (API) au lieu du site frontend, renvoyant une erreur 400 à l'utilisatrice. De plus, le lien expirait en 2 minutes, un délai trop court si l'email mettait du temps à arriver.

**Ce qui a été fait**
- Le lien pointe maintenant correctement vers `mixmatchfrip.com`
- La durée de validité du lien est étendue à **30 minutes**

---

## 9. Newsletter — Gestion complète

**Ce qui a été fait**
- Un formulaire d'inscription à la newsletter est fonctionnel sur le site (les inscriptions sont enregistrées en base de données)
- Dans le tableau de bord administrateur, une page dédiée liste tous les abonnés avec leur date d'inscription
- Recherche par email, compteur d'abonnés, possibilité de désinscrire manuellement
- Export CSV en un clic pour utiliser la liste dans un outil d'envoi externe (Mailchimp, etc.)

---

## 10. Tableau de bord admin — Vue clients, paniers et wishlists

**Ce qui a été fait**
Le tableau de bord administrateur dispose maintenant de deux nouvelles sections stratégiques :

**Section Clients**
- Liste de toutes les clientes avec leur nombre de commandes
- Aperçu de ce que chaque cliente a actuellement dans son **panier** (articles, quantités, valeur totale)
- Aperçu de leur **liste de souhaits** (wishlist)
- Statistiques globales : nombre de paniers actifs, valeur totale des paniers abandonnés, nombre de wishlists

**Utilisation stratégique** : cette vue permet d'envoyer des rappels personnalisés aux clientes qui ont des articles dans leur panier ou leur wishlist depuis plusieurs jours — un levier de conversion direct.

---

## 11. Espace client — Section Wishlist

**Ce qui a été fait**
Dans l'espace "Mon compte", une section **Ma liste de souhaits** affiche toutes les pièces que la cliente a sauvegardées, avec photo, marque, nom et prix. Elle peut retirer un article de sa wishlist directement depuis cette page, ou cliquer pour accéder à la fiche produit et finaliser son achat.

---

## 12. Correction du cache panier

**Problème constaté**
Une cliente qui modifiait la quantité d'un article dans son panier puis accédait au checkout voyait parfois l'ancien montant (avant la modification). Le navigateur servait une version mise en cache de l'API panier.

**Ce qui a été fait**
Le endpoint de consultation du panier envoie maintenant des headers HTTP explicites qui interdisent toute mise en cache par le navigateur. Chaque consultation du panier retourne toujours les données les plus récentes.

---

## Résumé des interventions

| # | Domaine | Type | Statut |
|---|---------|------|--------|
| 1 | Images produit | Correction | ✅ Livré |
| 2 | Cartes produit | Amélioration UI/UX | ✅ Livré |
| 3 | Mobile (panier + cartes) | Correction + Amélioration | ✅ Livré |
| 4 | Pré-remplissage checkout | Nouvelle fonctionnalité | ✅ Livré |
| 5 | Erreurs tunnel de commande | Correction critique | ✅ Livré |
| 6 | Suivi Chit Chats | Nouvelle fonctionnalité | ✅ Livré |
| 7 | Email de confirmation | Amélioration | ✅ Livré |
| 8 | Réinitialisation mot de passe | Correction | ✅ Livré |
| 9 | Newsletter | Nouvelle fonctionnalité | ✅ Livré |
| 10 | Admin — Clients/Paniers/Wishlists | Nouvelle fonctionnalité | ✅ Livré |
| 11 | Espace client — Wishlist | Nouvelle fonctionnalité | ✅ Livré |
| 12 | Cache panier | Correction | ✅ Livré |

---

## Note de déploiement

Deux migrations de base de données doivent être exécutées sur le serveur pour activer les fonctionnalités Newsletter et Suivi Chit Chats :

```bash
python manage.py migrate
```

Cela crée la table `NewsletterSubscriber` et ajoute le champ `shipment_id` sur les commandes.

---

*Document généré le 18 avril 2026 — MixMatchFrip V1*
