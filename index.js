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

let respuestasIA = 0; // Variable temporal (por sesión completa del servidor)

app.post('/api/chat', async (req, res) => {
  const { mensaje } = req.body;

  const respuestas = {
    '1': '📦 Tenemos fertilizantes, sustratos, iluminación y más. ¿Qué estás buscando?',
    '2': '🌱 Tips de cultivo: regá con pH controlado, usá maceta aireada, respetá el fotoperiodo.',
    '3': '🔥 Promo de la semana: Kit autocultivo con descuento. Válido hasta el domingo.',
    '4': null // se resuelve por IA
  };

  // ✅ Si el mensaje coincide con uno programado
  if (respuestas[mensaje]) {
    return res.json({ respuesta: respuestas[mensaje] });
  }

  // 🔐 Si ya se usaron 2 respuestas IA → dar mensaje de cierre
  if (respuestasIA >= 2) {
    return res.json({
      respuesta:
        "🧠 ¡Hasta acá llegó la sabiduría de Artu!\nSi necesitás algo más puntual o info más personalizada, tocá acá y te atiende alguien del equipo 🌱👨‍🔬\n👉 [Hablar por WhatsApp](https://wa.me/5493417437382?text=Hola%20Growroom%2C%20quiero%20hablar%20con%20alguien%20del%20equipo)"
    });
  }

  // 🤖 Si no es un mensaje programado y todavía quedan respuestas IA, responder con OpenAI
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: mensaje }]
    });

    const respuestaIA = completion.choices[0].message.content;

    respuestasIA += 1; // ☑️ Se suma una respuesta usada

    return res.json({ respuesta: respuestaIA });

  } catch (err) {
    console.error('❌ Error con la IA:', err.message);
    return res.json({ respuesta: '❌ Ups, hubo un error con el bot. Probá más tarde o escribinos por WhatsApp.' });
  }
});


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
;

app.listen(3000, () => console.log('✅ Bot híbrido corriendo en http://localhost:3000'));
