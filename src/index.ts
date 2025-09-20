import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(express.json());

app.get('/', (req, res) => res.send('Servidor funcionando =)'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Servidor funcionando en: http://localhost:${PORT}`);
});
