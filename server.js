require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Criar pool de conexão com o PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railway fornece essa variável automaticamente
  ssl: { rejectUnauthorized: false } // Necessário para Railway
});

app.use(express.json());

// Teste de conexão
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'API está rodando!', time: result.rows[0] });
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    res.status(500).json({ error: 'Erro ao conectar ao banco de dados' });
  }
});

// Endpoint para adicionar um gasto
app.post('/gastos', async (req, res) => {
  const { valor, data, referencia } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO public.gastos (valor, data, referencia) VALUES ($1, $2, $3) RETURNING *',
      [valor, data, referencia]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao adicionar gasto:', err);
    res.status(500).json({ error: 'Erro ao adicionar gasto' });
  }
});

// Endpoint para listar os gastos
app.get('/gastos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.gastos ORDER BY data DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao listar gastos:', err);
    res.status(500).json({ error: 'Erro ao listar gastos' });
  }
});

// Endpoint para filtrar gastos por data
app.get('/gastos/filtrar', async (req, res) => {
  const { data_inicio, data_fim } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM public.gastos WHERE data BETWEEN $1 AND $2 ORDER BY data DESC',
      [data_inicio, data_fim]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao filtrar gastos:', err);
    res.status(500).json({ error: 'Erro ao filtrar gastos' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

