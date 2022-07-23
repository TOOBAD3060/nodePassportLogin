const express=require("express")
const router= express.Router();
const bcrypt= require("bcryptjs")
const passport= require("passport")
//User model
const User= require("../models/User")

// login page
 router.get("/login",(req,res)=>{
     res.render("login")
 })

 // register page
 router.get("/register",(req,res)=>{
    res.render("register")
})

// Register handle
router.post("/register",(req,res)=>{
    const {name, email, password, password2}= req.body;
    let errors=[];

    // check required fields
    if(!name || !email || !password || !password2){
        errors.push({msg: "pls fill in all fields"})
    }

    // check passwords match

    if(password !== password2){
        errors.push({msg:"Passwords do not match"})
    }

    // Check password length
    if(password.length<6){
        errors.push({msg:"Password should be at least 6 characters"})
    }

    if(errors.length > 0){
        res.render("register",{
            errors,
            name,
            email,
            password,
            password2
        })
        
    }
    else{
        // validation passes
        User.findOne({email:email},(err,foundUser)=>{
            if(foundUser){
                // User exists
                errors.push({msg:"Email is already register"})
                res.render("register",{
                    errors,
                    name,
                    email,
                    password,
                    password2
                })
                        
                }
            else{
                const newUser= new User({
                    name,
                    email,
                    password
                });

            // Hash password
            bcrypt.genSalt(10,(err,salt)=>{
         bcrypt.hash(newUser.password,salt,(err,hashed)=>{
            if(err){
                console.log(err)
            }
            else{
                //set password to hashed
                newUser.password=hashed
                //save user
                newUser.save((err)=>{
                    if(!err){
                        req.flash("success_msg","You're now registered and can log in")
                        res.redirect("/users/login")
                    }
                });
                
            }
         })
            })
                
            }
        })
    }
})

//login handle
router.post("/login",(req,res,next)=>{
    passport.authenticate("local",{
        successRedirect: "/dashboard",
        failureRedirect:"/users/login",
        failureFlash:true
    })(req,res,next)
})


//logout hande

router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(!err){
            req.flash("success_msg","You're logged out")
            res.redirect("/users/login")
        }
    });
   
})

module.exports=router;
