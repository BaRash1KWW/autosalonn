'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { supabase } = require('./src/supabase');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'autosalon-backend', database: 'supabase' });
});

app.get('/api/cars', async (req, res) => {
  const { data, error } = await supabase.from('cars').select('*');
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});