const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const checkAuth = require("../middleware/check-auth");

router.post("/", (req, res, next) => {
  console.log(req.body);
  User.find({ mobile: req.body.mobile })
    .exec()
    .then(user => {
      console.log("Check User");
      if (user.length >= 1) {
        const id = req.body.userid;
        User.update(
          { _id: id },
          {
            $set: {
              email: req.body.email,
              mobile: req.body.mobile,
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              businessaddress: req.body.businessaddress,
              status: req.body.status,
              usergroup: req.body.usergroup
            }
          }
        )
          .exec()
          .then(result => {
            res.status(200).json({
              message: "User Updated Successfully",
              messagecode: "1"
            });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err
            });
          });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          console.log("Create User");
          if (err) {
            console.log(err);
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
              mobile: req.body.mobile,
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              businessaddress: req.body.businessaddress,
              status: 0, //0 - not yet enabled, 1 - registration completed. Awaiting approval, 2 - approved
              usergroup: "newregistration", // initial value: newregistration, later need to assign appropriate user group
              latitude: req.body.latitude,
              longitude: req.body.longitude,
              location: req.body.location
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User created",
                  messagecode: "1"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

router.post("/checkexists", (req, res, next) => {
  console.log(req.body);
  User.find({ mobile: "91" + req.body.mobile })
    .exec()
    .then(user => {
      console.log("user = " + user);
      console.log("user length = " + user.length);
      if (user.length >= 1) {
        return res.status(200).json({
          error: "User exists",
          status: "1" //user exists
        });
      } else {
        return res.status(200).json({
          message: "User does not exist",
          status: "0" //user does not exist
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  console.log(req.body.mobile);
  User.find({ mobile: req.body.mobile })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed. User does not exist.",
          messagecode: 4 // User does not exist
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed",
            messagecode: 5 // Username or Password is incorrect
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              mobile: user[0].mobile,
              userId: user[0]._id
            },
            "cowosindia", //json web token private key
            {
              expiresIn: "365d"
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            firstname: user[0].firstname,
            userid: user[0]._id,
            mobile: user[0].mobile,
            email: user[0].email,
            businessid: user[0].businessid,
            status: user[0].status,
            usergroup: user[0].usergroup,
            latitude: user[0].latitude,
            longitude: user[0].longitude,
            location: user[0].location,
            businessname: user[0].businessname,
            token: token
          });
        }
        res.status(401).json({
          message: "Auth failed",
          messagecode: 6 //Unknown error. Please contact administrator
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get("/", (req, res, next) => {
  User.find()
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        users: docs
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.get("/getuserinfo/:userid", (req, res, next) => {
  console.log(req.params.userid);
  const id = req.params.userid;
  User.find({
    _id: id
  })
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json({
          count: doc.length,
          myuserdata: doc
        });
      } else {
        res.status(404).json({
          message: "No Records Found !"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete("/:userid", (req, res, next) => {
  User.remove({ _id: req.params.userid })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/updatebusinessid", (req, res, next) => {
  console.log(req.body);
  User.find({ _id: req.body.userid })
    .exec()
    .then(user => {
      const id = user[0]._id;
      User.update(
        { _id: id },
        {
          $set: {
            businessid: req.body.businessid,
            businessname: req.body.businessname,
            status: req.body.status
          }
        }
      )
        .exec()
        .then(result => {
          console.log(result);
          res.status(200).json({
            message: "Business User Updated Successfully",
            messagecode: 2 //2 = update
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
    });
});

//Delete all in DB.
//HIGH RISK ACTION
router.delete("/", (req, res, next) => {
  User.remove()
    .exec()
    .then(result => {
      res.status(200).json({
        message: "All Deleted"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
