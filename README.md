# Évaluation Finale : Software Engineering & DevOps
**Sujet : Lancement du projet "DevOpsGPT"**
**Durée : 3h00 | Documents et internet autorisés | Travail individuel**

## Contexte
Vous avez été recruté(e) par l'entreprise OpenDevOps. Votre première mission est d'aider à concevoir et déployer leur toute nouvelle application web : **DevOpsGPT**. 
Ce TP est divisé en 3 parties indépendantes. Si vous bloquez sur une question, passez à la suivante !

**⚠️ Consignes :**  
**Pour commencer :** Vous devez obligatoirement partir du code source fourni dans ce dépôt. Pour cela, cliquez sur le bouton **"Fork"** en haut à droite pour copier ce projet sur votre compte GitHub, ou téléchargez-le en cliquant sur **"Code" > "Download ZIP"**.  
**Pour le rendu :** Vous rendrez le lien vers votre dépôt GitHub public (fortement recommandé pour l'exercice 3) ou une archive `.zip` contenant vos fichiers finaux.  
Pensez à bien nommer vos fichiers et à vérifier que votre archive ou repos contient vos schémas, vos fichiers Docker, votre fichier YAML et un fichier contenant vos réponses aux questions ouvertes.  
Les captures d'écran sont autorisées et même vivement encouragées.

---

## Exercice 1 : Conception Logicielle (6 points)
*Ici, pas de code. Vous pouvez utiliser un outil comme draw.io, un document Word, ou même faire les schémas sur papier et les prendre en photo.*

**1. Diagramme de Contexte (2 pts)**
Faites un schéma simple montrant le système "DevOpsGPT" :
- L' **Utilisateur** (qui envoie des questions et reçoit des réponses).
- L' **API GPT-4** (à qui on envoie le texte pour générer la réponse).
- La **Base de données** (où l'on sauvegarde les historiques).

**2. Organigramme / Flowchart (3 pts)**
Dessinez l'algorithme (les étapes de fonctionnement) quand un utilisateur envoie un message. Représentez les étapes suivantes avec des blocs et des flèches :
- Réception du message de l'utilisateur.
- Le message contient-il des insultes ? (Filtre de modération).
- Envoi du message à l'API.
- Sauvegarde de la réponse dans la Base de données.
- Affichage de la réponse à l'utilisateur.

**3. Dictionnaire de données (1 pt)**
Faites un tableau listant les informations (attributs) que l'on doit stocker pour un `Message`. 
*Exemple de colonnes attendues : Nom de la donnée (ex: Contenu), Type (ex: Texte/String), Description.*
Trouvez au moins 4 attributs pertinents.

---

## Exercice 2 : Git et Docker (7 points)

**1. Méthodologie et Git (2 pts)**
L'équipe utilise la méthode **Scrum**. On vous demande de développer le système d' **"Abonnement Premium"**.
- **Question A :** Rédigez cette fonctionnalité sous forme de "User Story" (format : *En tant que... je veux... afin de...*).
- **Question B :** Donnez les commandes Git exactes à taper dans le terminal pour :
  1. Créer une nouvelle feature nommée `feature-premium-subscription` et faire un commit.
  2. Une fois le travail terminé et fusionné sur `main`, créer un **tag de version** nommé `v1.0.0`.
  3. Pousser ce tag sur le serveur GitHub.

**2. Dockerisation (3 pts)**
Le projet est divisé en deux dossiers : `frontend` (l'interface) et `backend` (l'API). Vous devez créer deux fichiers Dockerfiles :
- **Dans le dossier `backend/` :** Créez un `Dockerfile` qui utilise `node:22-alpine`, définit le dossier de travail sur `/app`, installe les dépendances et lance `node index.js` sur le port `3000`.
- **Dans le dossier `frontend/` :** Créez un `Dockerfile` similaire qui installe les dépendances et lance `npm run dev` pour le développement.

**3. Orchestration avec Docker Compose (2 pts)**
À la racine du projet, créez un fichier `docker-compose.yml` qui lance :
- Le service `chat-api` (construit à partir du dossier `./backend`) sur le port `3000`.
- Le service `chat-ui` (construit à partir du dossier `./frontend`) sur le port `5173`.
- Le service `cache` (utilise l'image `redis:7-alpine`) sur le port `6379`.
- Assurez-vous que l'API et l'UI peuvent communiquer entre elles.

---

## Exercice 3 : CI/CD avec GitHub Actions (7 points)

Vous voulez que GitHub vérifie le code à chaque modification, mais ne déploie l'application que lorsqu'une **nouvelle version (Tag)** est publiée.

**1. Le Workflow CI/CD (5 pts)**
Créez l'arborescence de dossiers `.github/workflows/` et placez-y un fichier `main.yml`.
Écrivez ce fichier YAML en respectant ces consignes :
- Le workflow se déclenche lors d'un `push` sur la branche `main` **ET** lors de la création d'un tag commençant par `v` (ex: `v1.0.0`).
- Il contient un job nommé `test-and-deploy` qui tourne sur `ubuntu-latest`.
- Les étapes (`steps`) du job sont :
  1. Récupérer le code (utiliser l'action `actions/checkout@v4`).
  2. Installer Node.js version 22 (utiliser `actions/setup-node@v4`).
  3. Lancer la commande : `npm install`.
  4. Lancer la commande : `npm test`.
  5. Simuler un déploiement avec la commande `echo "Déploiement en cours..."` **UNIQUEMENT** si le push est un tag.

**2. Sécurité et Secrets (2 pts)**
Votre code a besoin d'une clé secrète (`OPENAI_API_KEY`) pour se connecter à l'intelligence artificielle, mais il est strictement interdit de l'écrire en clair dans votre code.
- **Question A :** Sur l'interface web de GitHub, expliquez où vous devez cliquer pour enregistrer ce secret de manière sécurisée ( captures d'écran autorisées ).
- **Question B :** Quelle est la syntaxe exacte pour injecter ce secret dans votre fichier `.github/workflows/main.yml` ? (Exemple : comme variable d'environnement dans l'étape de déploiement).
