const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser'); 
const mongoose = require("mongoose");


app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Connect to database
let myURI = process.env['MONGO-URI'];
var urlShort = mongoose.connect(myURI, { UseNewUrlParser: true, UseUnifiedTopology: true});

//create schema
let xciseSchema = new mongoose.Schema(
  {
  username: {type: String, required: true},
  description: String,
  duration: Number,
  date: Date,
})  

let Xcise = mongoose.model("Xcise", xciseSchema);

app.post("/api/users", async function(req, res){
  var userInput = {
    username: req.body.username,
    };
  console.log(req.body.username);
  var user = new Xcise(userInput);
  await user.save();
  /* var data = Xcise.find({username:req.body.username }).select({username:1, _id:1}); */
  return res.status(200).json({"username": user.username, "_id": user['_id']})
})

// Create a user
app.post("/api/users/:_id/exercises", async function(req, res){
  var userInput = {
    _id: req.body[":_id"],
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
  };

  
// update the excercise info.  
  await Xcise.updateOne(
    {_id: userInput["_id"]}, req.body);
  var updateUser = await Xcise.findById(req.body[":_id"]); 
  return res.status(200).json({"_id":updateUser["_id"],
                               "username":updateUser.username,
                               "date":updateUser.date.toDateString(),
                               "duration":updateUser.duration,
                               "description":updateUser.description}) 
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
