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
/* let xciseSchema = new mongoose.Schema(
  {
  username: {type: String, required: true},
  description: String,
  duration: Number,
  date: Date,
})  */ 

let xciseSchema = new mongoose.Schema(
  {
  username: {type: String, required: true,},
  logs:[{description: String,
         duration: Number,
         date: Date}],
 // count: {type: Number, default: ()=> this.logs.length},
})  

let Xcise = mongoose.model("Xcise", xciseSchema);

app.post("/api/users", async function(req, res){
  var userInput = {
    username: req.body.username,
    };
  
  var user = new Xcise(userInput);
  await user.save();
  /* var data = Xcise.find({username:req.body.username }).select({username:1, _id:1}); */
  return res.status(200).json({"username": user.username, "_id": user['_id']});
})

// Create a user
app.post("/api/users/:_id/exercises", async function(req, res){
  
  var log = {description: req.body.description,
             duration: req.body.duration,
             date: req.body.date};
          

  
// update the excercise info.  
  var updateUser= await Xcise.findOneAndUpdate({_id: req.body[":_id"]}, { $push: { logs: log} }, /* {new: true}, */ function(err, updateUser){
    if(err) console.log(err)
    else return updateUser});
  //console.log(updateUser); 
  var logNo = await updateUser.logs.length - 1; 
  return res.status(200)
            .json({"_id":updateUser["_id"],
                   "username":updateUser.username,                                          "date": log.date.toDateString(),
                   "duration":log.duration,
                   "description":log.description})
})

// api endpoint
app.get('/api/users/:_id/logs', function(req, res){
  var id = req.params["_id"];
  var {from: fromDate, to: toDate, limit: showLimit} = req.query;
  var logs = Xcise.findById("id")
                  .where("date")
                  .gte(fromDate)
                  .lte(toDate)
                  .limit(showLimit);
  res.status(200).json(logs)
})


/* const limit = Number(req.query.limit) || 0;
  const from = req.query.from || new Date(0);
  const to = req.query.to || new Date(Date.now())

    console.log("with query");
    const log = await Log.find({
      userid: req.params.id,
      date: { $gte: from , $lte: to }
    })
    .select("-_id -userid -__v")
    .limit(limit) */

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
