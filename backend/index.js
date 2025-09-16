require('dotenv').config({
  // Load local first
  path: ['.env.local', '.env'],
  override: true, // let earlier files override later ones
});

const express = require('express');
const PORT = process.env.PORT || 4044;
const { handler } = require("./controller")

const app = express();
app.use(express.json());

// Handle root POST explicitly
app.post('/', async (req, res) => {
  console.log(req.body)
  res.send(await handler(req));

});

// Catch ALL other POST paths via RegExp (works in Express 5)
app.post(/.*/, async (req, res) => {
  console.log(req.body)
    res.send(await handler(req));

});

// Health check
app.get('/', async (req, res) => {
  res.send(await handler(req));
});

// 404 for everything else (optional)
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, (err) => {
  if (err) console.error(err);
  console.log('Server listening on PORT', PORT);
});
