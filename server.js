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
    console.log("console here INFO");
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
    console.log(req.body, req.params.address, "hereeee");

    const { limit, goldBalance, silverBalance, totalGold, totalSilver} = req.body;
    
    //
    const user = await User.findOne({address: req.params.address});
    console.log("two, track", user);
    //run the calculation
    let alloc = (((goldBalance * 5) + silverBalance) / ((totalGold * 5 ) + totalSilver)) * limit;
    console.log(alloc, "hi there oo alloc");
    let userUpdate;
    if(!user) {
      console.log("bad oooooo geeeeh");
      userUpdate = new User({
         address: req.params.address,
         goldBalance: goldBalance,
         silverBalance: silverBalance,
         allocation: alloc,
         limit: limit 
        })

      // Update allocations for all users
      const users = await User.find();
      for(let u of users) { 
        if(u.address !== req.params.address) {
          const eachAlloc = (((u.goldBalance * 5) + u.silverBalance) / ((totalGold * 5 ) + totalSilver)) * limit;
          // Update user allocation
          await User.updateOne({address: u.address}, {
            $set: {allocation: eachAlloc}  
          });
        }
      }

      console.log("gasping here and there");
      userUpdate = await userUpdate.save();
    } else {
      console.log("incrementing ooooo, checkout");
       userUpdate = await User.findOneAndUpdate(
        { address: req.params.address }, 
        {
          $set: {
            goldBalance: goldBalance,
            silverBalance: silverBalance,
            allocation: alloc,  
            limit: limit  
          }
        },
        { new: true }
      );

        // Update allocations for all users
        const users = await User.find();
        for(let u of users) { 
          if(u.address !== req.params.address) {
            const eachAlloc = (((u.goldBalance * 5) + u.silverBalance) / ((totalGold * 5 ) + totalSilver)) * limit;
            // Update user allocation
            await User.updateOne({address: u.address}, {
              $set: {allocation: eachAlloc}  
            });
          }
        }

        console.log("Updating complete ooooooo")
    }
     
     if(userUpdate) return res.status(200).json({status: true, data: userUpdate});
  } catch (error) {
    console.log(error);
  }
});

app.post(`/updateAlloc/:address`, async function (req, res) {
  try {

    const { amount } = req.body;
    console.log("console here", amount);

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

