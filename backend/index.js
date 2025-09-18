require('dotenv').config({
  // Load local first
  path: ['.env.local', '.env'],
  override: true, // let earlier files override later ones
});

const express = require('express');
const mongoose = require('mongoose')

const PORT = process.env.PORT || 4044;
const MONGO_URL = process.env.MONGO_URL;
const { handler } = require("./controller")


mongoose.connect(MONGO_URL).then(()=>{
  console.log('successfuly connected to mongoDB Database')
}).catch((err)=>console.log(err));


const userSchema = new mongoose.Schema({
  name:String,
  surname:String
})

const UserModel = mongoose.model("users", userSchema)


const app = express();
app.use(express.json());

// Handle root POST explicitly 
app.post('/', async (req, res) => {
  console.log(req.body)
  res.send(await handler(req));

});

app.get('/getUsers', async (req,res) => {
  const userData = await UserModel.find(); 
  res.json(userData) 
})
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



