const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Mapa para contar respuestas por sesión (resetearía en cada reinicio del servidor)
const respuestasPorIP = {};

app.get('/', (req, res) => {
  res.send('🧠 Artu Grower está online!');
});

app.post('/chat', async (req, res) => {
  const userIp = req.ip;
  respuestasPorIP[userIp] = respuestasPorIP[userIp] || 0;

  if (respuestasPorIP[userIp] >= 2) {
    return res.json({
      respuesta:
        "🌱 Hasta acá llegó la sabiduría de Artu.\nSi necesitás algo más puntual o info más personalizada, tocá acá que te atiende alguien del equipo 🧪🌿\n👉 https://wa.me/5493417437382"
    });
  }

  try {
    const { mensaje } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: mensaje }]
    });

    const respuesta = completion.choices[0].message.content;
    respuestasPorIP[userIp]++;

    res.json({ respuesta });
  } catch (error) {
    console.error('❌ Error al conectarse con OpenAI:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Servidor funcionando en http://localhost:${port}`);
});
