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
const xciseSchema = new mongoose.Schema(
  {
  username: {type: String, required: true},
  count: {type: Number, default:0},
  logs: [{description: String,
         duration: Number,
         date: Date}],
 
})  

let Xcise = mongoose.model("Xcise", xciseSchema);

app.post("/api/users", async function(req, res){
  var userInput = {
    username: req.body.username,
    };
  
  var user = new Xcise(userInput);
  await user.save();
  
  return res.status(200).json({"username": user.username, "_id": user['_id']});
})

// get all user endpoint
app.get("/api/users", async (req,res) => 
  {var userData = await Xcise.find().select({"username": 1, "_id":1});     
  return res.send(userData);
  });

// Create a user
app.post("/api/users/:_id/exercises", async function(req, res){
  var inputDate;
  if (req.body.date === "") inputDate = new Date(Date.now())
  else inputDate = req.body.date;    
  
 
  var log = await {description: req.body.description,
             duration: req.body.duration,
             date: inputDate};

  var userId = await req.body[":_id"];
  
// update the excercise info.  
  var updateUser = await Xcise.findOneAndUpdate({_id: userId}, {$push: { logs: log}, $inc: {count: 1} }, {new: true}, function(err, updateUser){
    if(err) console.log(err)
    else return updateUser});
 
  
  return res.status(200)
            .json({"_id":updateUser["_id"],
                   "username":updateUser.username,                                                     "date": new Date(log.date).toDateString(),
                   "duration":log.duration,
                   "description":log.description})
})

// logs api endpoint
app.get('/api/users/:_id/logs', async function(req, res){
  var showLimit = Number(req.query.limit);
  var fromDate = req.query.from || new Date(0);
  var toDate = req.query.to || new Date(Date.now());

  console.log(`${fromDate}, ${toDate}`);
  
  /* const logs = await Xcise.find({
      _id: req.params["_id"],
      "logs.date": { $gte: fromDate , $lte: toDate }
    })
    .select({"username":1, "count":1, "_id":1, "logs":1})
    .limit(showLimit) */ 
    
  var logs = await Xcise.where("_id")
                  .eq(req.params["_id"])
                  .where("logs.date")
                  .gte(fromDate)
                  .lte(toDate)
                  .select({"username":1, "count":1, "_id":1, "logs":1})
                  .limit(showLimit);
  
  return res.status(200).send(logs)
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
