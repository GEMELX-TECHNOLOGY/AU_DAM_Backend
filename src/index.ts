import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import rolRoutes from "./routes/rolRoutes";
import userRoutes from "./routes/userRoutes"
import catalogoRoutes from "./routes/catalogoRoutes";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/auth", authRoutes);
app.use('/users', userRoutes);
app.use('/roles', rolRoutes);
app.use('/catalogo', catalogoRoutes);


app.get("/", (req, res) => res.send("Servidor funcionando =)"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en: http://localhost:${PORT}`);
});

