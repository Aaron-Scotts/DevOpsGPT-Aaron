# DevOpsGPT - Evaluation Finale

Projet realise par Aaron Scotts dans le cadre de l'evaluation Software Engineering & DevOps.

---

## Exercice 1 : Conception Logicielle

### 1. Diagramme de contexte

Le systeme DevOpsGPT est compose de trois elements principaux.
L'utilisateur envoie un message depuis l'interface web. Ce message est transmis au backend qui le transfère a l'API GPT-4 d'OpenAI. La reponse est ensuite sauvegardee dans la base de donnees Redis avant d'etre affichee a l'utilisateur.

    Utilisateur --> [DevOpsGPT Backend] --> API GPT-4
                          |
                       [Redis]

### 2. Organigramme

Voici les etapes quand un utilisateur envoie un message :

    1. Reception du message de l'utilisateur
    2. Le message contient-il des insultes ?
       - Oui : afficher un message d'erreur, fin du traitement
       - Non : continuer
    3. Envoi du message a l'API GPT-4
    4. Sauvegarde de la reponse dans Redis
    5. Affichage de la reponse a l'utilisateur

### 3. Dictionnaire de donnees

Table Message :

    Nom          | Type      | Description
    -------------|-----------|--------------------------------------------
    id           | String    | Identifiant unique du message (UUID)
    contenu      | String    | Texte du message envoye par l'utilisateur
    role         | String    | Emetteur du message : "user" ou "assistant"
    date_envoi   | DateTime  | Date et heure d'envoi du message
    session_id   | String    | Identifiant de la session de conversation

---

## Exercice 2 : Git et Docker

### 1. User Story

En tant qu'utilisateur, je veux pouvoir souscrire a un abonnement Premium, afin de beneficier d'un acces illimite aux fonctionnalites avancees de l'application.

### 2. Commandes Git

Creer la branche et faire un commit :

    git checkout -b feature-premium-subscription
    git add .
    git commit -m "feat: add premium subscription system"

Fusionner sur main et creer le tag :

    git checkout main
    git merge feature-premium-subscription
    git tag v1.0.0

Pousser le tag sur GitHub :

    git push origin v1.0.0

### 3. Dockerfiles

Le fichier backend/Dockerfile utilise l'image node:22-alpine, definit /app comme repertoire de travail, installe uniquement les dependances de production et lance node index.js sur le port 3000.

Le fichier frontend/Dockerfile fait de meme mais installe toutes les dependances (y compris devDependencies) et lance npm run dev sur le port 5173.

### 4. Docker Compose

Le fichier docker-compose.yml a la racine orchestre trois services :
- chat-api : construit depuis ./backend, expose le port 3000, se connecte a Redis via la variable REDIS_URL
- chat-ui : construit depuis ./frontend, expose le port 5173, depends_on chat-api
- cache : image redis:7-alpine, expose le port 6379

Pour lancer l'application :

    docker compose up --build

---

## Exercice 3 : CI/CD avec GitHub Actions

### 1. Workflow

Le fichier .github/workflows/main.yml se declenche sur deux evenements :
- un push sur la branche main
- la creation d'un tag commencant par "v"

Le job test-and-deploy tourne sur ubuntu-latest et execute les etapes suivantes :
1. Recuperer le code avec actions/checkout@v4
2. Installer Node.js 22 avec actions/setup-node@v4
3. Lancer npm install dans le dossier backend
4. Lancer npm test dans le dossier backend
5. Si le declencheur est un tag, executer le deploiement

L'etape de deploiement utilise la condition :

    if: startsWith(github.ref, 'refs/tags/v')

### 2. Gestion du secret OPENAI_API_KEY

Question A : Pour enregistrer le secret sur GitHub, il faut aller dans l'onglet Settings du depot, puis dans "Secrets and variables" > "Actions", et cliquer sur "New repository secret". On saisit OPENAI_API_KEY comme nom et la valeur de la cle.

Question B : Pour injecter le secret dans le workflow, on utilise la syntaxe suivante dans le fichier YAML :

    - name: Deploiement
      if: startsWith(github.ref, 'refs/tags/v')
      run: echo "Deploiement en cours..."
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

Le secret n'est jamais ecrit en clair dans le code. GitHub l'injecte au moment de l'execution et le masque dans les logs.

