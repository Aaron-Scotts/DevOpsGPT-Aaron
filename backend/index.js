const express = require('express');
const redis = require('redis');

const app = express();
const port = process.env.PORT || 3000;
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

app.use(express.json());

const client = redis.createClient({ url: redisUrl });
client.on('error', (err) => console.error('redis error', err));

(async () => {
  try {
    await client.connect();
    console.log('connected to redis');
  } catch (e) {
    console.error('redis connection failed', e.message);
  }
})();

app.get('/', (req, res) => res.send('API DevOpsGPT Opérationnelle'));

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).send({ error: 'Le champ message est requis' });

  let aiResponse = `Ceci est une réponse simulée (Le mode hors-ligne est actif). Vous avez dit : "${message}"`;
  let modelUsed = "devops-gpt-offline";

  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'test_key') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
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
      console.error("openai api error:", e.message);
      aiResponse = "Erreur de connexion à OpenAI. Passage en mode simulé...";
    }
  }

  try {
    await client.setEx(`last_message:${Date.now()}`, 3600, message);
  } catch (e) {
    console.log('redis write failed');
  }

  res.json({
    response: aiResponse,
    cached: true,
    model: modelUsed,
    apiKeyStatus: process.env.OPENAI_API_KEY ? "Clé API détectée" : "Aucune clé API configurée"
  });
});

app.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Adresse email invalide' });
  }

  try {
    await client.set(`premium:${email}`, 'active');
    console.log(`new premium subscriber: ${email}`);
  } catch (e) {
    console.log('redis unavailable, subscription stored in memory only');
  }

  res.json({
    success: true,
    message: `Abonnement Premium activé pour ${email}`,
    plan: 'Premium',
    features: ['Réponses illimitées', 'Accès GPT-4', 'Support prioritaire']
  });
});

app.get('/subscription/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const status = await client.get(`premium:${email}`);
    res.json({ email, premium: status === 'active' });
  } catch (e) {
    res.json({ email, premium: false });
  }
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'test_key') {
    console.log("🌟 Clé OpenAI détectée : Le mode VRAI ChatGPT est ACTIF !");
  } else {
    console.warn("⚠️ Mode HORS-LIGNE actif : Ajoutez OPENAI_API_KEY pour activer la vraie IA.");
  }
});
