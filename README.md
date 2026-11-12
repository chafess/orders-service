# Service Orders (port 8084)

Microservice REST de gestion des commandes pour la plateforme e-commerce MSOA.
Technologies : Node.js, Express, SQLite (better-sqlite3).

## Responsabilité
Orders gère le cycle de vie des commandes (création, consultation, statut, annulation)
et orchestre le scénario « passer une commande ». Il ne gère ni le stock, ni les
paiements, ni l'expédition.

## Prérequis
- Node.js 18 ou plus
- npm

## Installation
```bash
git clone https://github.com/chafess/orders-service.git
cd orders-service
npm install
```

## Lancement
```bash
npm run dev     # développement (nodemon)
npm start       # production
```
Le service écoute sur http://localhost:8084 (test : `/health`).
La base `data/orders.db` est créée automatiquement à partir de `data/schema.sql`
et `data/seed.sql`.

## Configuration
Les URL des services voisins sont dans `src/config.js` (modifiables par variables
d'environnement) :

| Variable | Défaut |
|---|---|
| CATALOG_URL | http://localhost:8082 |
| INVENTORY_URL | http://localhost:8083 |
| SHIPPING_URL | http://localhost:8086 |

## Connexion au frontend
Dans `src/config/backend.js` du frontend :
```js
const BACKEND_MODE = {
  AUTH: "mock",
  CATALOG: "rest",
  INVENTORY: "rest",
  ORDERS: "rest",
  PAYMENTS: "mock",
  SHIPPING: "mock"
};
```
Orders dépend de Catalog et Inventory : ils doivent tourner aussi
(vrais services, ou stubs dans `stubs/` : `node stubs/fakeCatalog.js`,
`node stubs/fakeInventory.js`).

## Endpoints

| Méthode | Endpoint | Description | Codes |
|---|---|---|---|
| GET | /api/orders?userId={id} | Commandes d'un utilisateur | 200, 400 |
| GET | /api/orders/{id} | Détail d'une commande | 200, 404 |
| POST | /api/orders | Créer une commande | 201, 400, 404, 409, 503 |
| PATCH | /api/orders/{id}/status | Changer le statut | 200, 400, 404, 409 |
| POST | /api/orders/{id}/cancel | Annuler une commande | 200, 404, 409, 503 |

Statuts : `PENDING_PAYMENT → PAID → SHIPPED → DELIVERED`, et `CANCELLED`
(possible seulement depuis `PENDING_PAYMENT` ou `PAID`).

## Communications interservices

| Appel | Service | Endpoint | Objectif |
|---|---|---|---|
| Orders → Catalog | 8082 | GET /products/{id} | Prix réels (le frontend n'est pas source de vérité) |
| Orders → Inventory | 8083 | POST /api/inventory/reserve | Réserver le stock à la création |
| Orders → Inventory | 8083 | POST /api/inventory/release | Libérer le stock à l'annulation ou en compensation |
| Orders → Shipping | 8086 | GET /api/shipments/order/{id} | Refuser l'annulation si déjà expédiée |
| Payments → Orders | 8084 | PATCH /api/orders/{id}/status | Passer la commande à `PAID` |
| Shipping → Orders | 8084 | PATCH /api/orders/{id}/status | Aligner le statut sur l'expédition |

Les appels sortants ont un timeout de 3 s ; si un service est injoignable,
Orders répond 503 et ne crée rien. Si l'enregistrement en base échoue après
la réservation, le stock est libéré (compensation, principe de la Saga).

## Données
Base propre au service (data ownership) : tables `orders` et `order_items`
(schéma fourni par l'enseignant). Les prix et noms sont figés dans la ligne
de commande (snapshot).


## Limites
L'isolation des utilisateurs repose sur le filtre `userId`. Une amélioration serait
de valider le token auprès du service Auth.
