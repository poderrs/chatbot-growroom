const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const respuestas = require('./respuestas.json');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { mensaje } = req.body;
  const msg = mensaje.trim().toLowerCase();

  // Opciones programadas
  if (msg === 'menu' || msg === 'inicio') {
    return res.json({ respuesta: respuestas.menu });
  }
  if (respuestas[msg]) {
    return res.json({ respuesta: respuestas[msg] + "\n\n" + respuestas.menu });
  }

  // Respuesta IA para todo lo demás
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Sos ArturoBot, un asistente de cultivo en Argentina.' },
        { role: 'user', content: mensaje }
      ],
    });
    const respuestaIa = completion.choices[0].message.content;
    return res.json({ respuesta: respuestaIa + "\n\n" + respuestas.menu });
  } catch (error) {
    console.error('Error IA:', error.message);
    return res.json({ respuesta: "❌ Perdón, hubo un error procesando tu consulta. Intentá de nuevo.\n\n" + respuestas.menu });
  }
});

app.listen(3000, () => console.log('✅ Bot híbrido corriendo en http://localhost:3000'));
