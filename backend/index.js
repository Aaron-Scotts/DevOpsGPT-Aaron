const express = require('express');
const redis = require('redis');

const app = express();
const port = process.env.PORT || 3000;
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

app.use(express.json());

// Configuration du client Redis
const client = redis.createClient({ url: redisUrl });
client.on('error', (err) => console.error('❌ Erreur Client Redis', err));

(async () => {
  try {
    await client.connect();
    console.log('✅ Connecté au cache Redis');
  } catch (e) {
    console.error('⚠️ Impossible de se connecter à Redis (Vérifiez le docker-compose)', e.message);
  }
})();

app.get('/', (req, res) => res.send('API DevOpsGPT Opérationnelle'));

// Route de discussion (Mixte : Simulé ou Vrai API OpenAI)
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).send({ error: 'Le champ message est requis' });

  let aiResponse = `Ceci est une réponse simulée (Le mode hors-ligne est actif). Vous avez dit : "${message}"`;
  let modelUsed = "devops-gpt-offline";

  // Si une clé API est configurée, on tente de faire un vrai appel à OpenAI
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'test_key') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Modèle rapide et peu coûteux
          messages: [{ role: "user", content: message }]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        aiResponse = data.choices[0].message.content;
        modelUsed = "gpt-4o-mini";
      } else {
        console.error("Réponse inattendue de l'API OpenAI:", data);
      }
    } catch (e) {
      console.error("❌ Erreur lors de l'appel à l'API OpenAI:", e.message);
      aiResponse = "Erreur de connexion à OpenAI. Passage en mode simulé...";
    }
  }

  // Sauvegarde dans le cache Redis
  try {
    await client.setEx(`last_message:${Date.now()}`, 3600, message);
  } catch (e) {
    console.log('⚠️ Échec de l\'écriture dans le cache Redis');
  }

  res.json({
    response: aiResponse,
    cached: true,
    model: modelUsed,
    apiKeyStatus: process.env.OPENAI_API_KEY ? "Clé API détectée" : "Aucune clé API configurée"
  });
});

app.listen(port, () => {
  console.log(`🚀 Serveur Backend en cours d'exécution sur le port ${port}`);
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'test_key') {
    console.log("🌟 Clé OpenAI détectée : Le mode VRAI ChatGPT est ACTIF !");
  } else {
    console.warn("⚠️ Mode HORS-LIGNE actif : Ajoutez OPENAI_API_KEY pour activer la vraie IA.");
  }
});
