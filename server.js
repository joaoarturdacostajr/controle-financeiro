const express = require('express');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json()); // Para lidar com JSON

// Conexão com o banco de dados
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

client.connect()
  .then(() => console.log('Conectado ao banco de dados com sucesso!'))
  .catch((err) => console.error('Erro de conexão', err));

app.get('/', (req, res) => {
  res.send('API de Controle Financeiro');
});

// Endpoint para adicionar um gasto
app.post('/gastos', async (req, res) => {
  const { valor, data, referencia } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO public.gastos (valor, data, referencia) VALUES ($1, $2, $3) RETURNING *',
      [valor, data, referencia]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao adicionar gasto');
  }
});

// Endpoint para listar os gastos
app.get('/gastos', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM public.gastos ORDER BY criado_em DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao listar gastos');
  }
});

// Endpoint para filtrar gastos por data
app.get('/gastos/filtrar', async (req, res) => {
  const { data_inicio, data_fim } = req.query;
  try {
    const result = await client.query(
      'SELECT * FROM public.gastos WHERE data BETWEEN $1 AND $2 ORDER BY data DESC',
      [data_inicio, data_fim]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao filtrar gastos');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
