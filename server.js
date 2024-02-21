// import modules
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/Users");



const app = express();

app.use(express.urlencoded({ extended: true }));

//parse application/json
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());




app.get(`/info/:address`, async function (req, res, next) {
  try {
    console.log("console here");
    const user = await User.findOne({address: req.params.address});
    if(!user) return res.status(201).json({status: false, message: "this user isnt updated"})

    return res.status(200).json({status: true, data: user});
  } catch (error) {
    // return res.status(400).json({status: false, message: error})
    console.log(error);
  }
});

app.post(`/addAlloc/:address`, async function (req, res) {
  try {
    console.log(req.body, "hereeee");
    const {limit, goldBalance, silverBalance, totalGold, totalSilver} = req.body;
    if(!limit) return res.status(201).json({status: false, message: "Limit is needed"});
    if(!goldBalance) return res.status(201).json({status: false, message: "Goldbalance is needed"});
    if(!totalGold) return res.status(201).json({status: false, message: "total Gold is needed"});
    if(!silverBalance) return res.status(201).json({status: false, message: "silver Balance is needed"});
    if(!totalSilver) return res.status(201).json({status: false, message: "totalSilver is needed"});
    

    //run the calculation
    const alloc = (((goldBalance * 5) + silverBalance) / ((totalGold * 5 ) + totalSilver)) * limit;
    console.log(alloc, "hi there oo");
    let userUpdate;
    if(!req.params.address) {
      userUpdate = new User({
         address: req.params.address,
         allocation: alloc,
         limit: limit 
        })
      userUpdate = await userUpdate.save();
    } else {
       userUpdate = await User.findOneAndUpdate(
        {address: req.params.address},
        {
         $inc: {
           allocation: alloc,
         },
         $set: {
           limit: limit 
         }
        }, 
        {new: true})
    }
     
     if(userUpdate) return res.status(200).json({status: true, data: userUpdate});
  } catch (error) {
    console.log(error);
  }
});

app.post(`/updateAlloc/:address`, async function (req, res) {
  try {
    console.log("console here");

    const { amount } = req.body;
    if(!req.params.address) return res.status(201).json({status: false, message: "address is needed to execute this function"});
    
    const userUpdate = await User.findOneAndUpdate(
      {address: req.params.address},
      {
       $inc: {
         allocation: -amount,
       }
      }, 
      {new: true})
      if(userUpdate) return res.status(200).json({status: true, data: userUpdate});

  } catch (error) {
    console.log(error);
  }
});




//ini my database
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "BlackFin",
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });


// get port
const port = process.env.PORT || 8000;

// listen to request
app.listen(port, () => {
  console.log(`App is Listening ${port}`);
});

