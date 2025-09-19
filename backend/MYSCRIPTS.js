
const { handler } = require("./controller")

const userSchema = new mongoose.Schema({
  name:String,
  surname:String
})

const UserModel = mongoose.model("users", userSchema)



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
