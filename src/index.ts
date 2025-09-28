import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();
const app = express();
import bcrypt from 'bcrypt';




app.use(express.json());
app.use("/auth", authRoutes);

app.get('/', (req, res) => res.send('Servidor funcionando =)'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en: http://localhost:${PORT}`);
});
