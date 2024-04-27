const user = require("../module/user")
const express = require("express")
const jwt = require('jsonwebtoken')
const Router = express.Router()
const {body,validationResult} =require('express-validator')
let fetchuser = require("../middleware/middle")
let Isadmin = require("../middleware/admin")
const bcrypt= require('bcryptjs')
const product = require("../module/product")
const nodemailer = require("nodemailer");


require('dotenv').config();

const jwtsecret = process.env.jwtsecret 
// create user 

Router.post ('/createuser',[
body('email').isEmail(),
body('name').isLength({min:3}),
body('phone').isLength({min:10}),
body('password').isLength({min:5})
],async(req,res)=>{
    
    const salt = await bcrypt.genSalt(10)
    const secpass = await bcrypt.hash(req.body.password,salt)
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        })
        }
        try{
            let User = await user.findOne({email: req.body.email})
            if(User){
                return res.status(200).send({
                    success : false,
                    massage :"Already Register please login"
                })
            }
            
             
          User = await  user.create({
                name: req.body.name,
                email : req.body.email, 
                phone : req.body.phone, 
                
                password : secpass
            })  
            const data ={User :{id :User.id}}
 const authtoken = jwt.sign(data,jwtsecret)
return res.status(200).send({
    token :authtoken,
    success : true,
    massage :"User Register Successfully"
})
           
                
        }catch(error){
            res.status(500).send("some error ")
        }
     
})
// login
Router.post ('/login',async(req,res)=>{
      
    const {password,email,notifytoken} = req.body    
    
          if(!email){
            return res.status(200).send({
                success : false,
                massage :"enter email or password"
            })
         }
         if(!password){
            return res.status(200).send({
                success : false,
                massage :"enter email or password"
            })
         }
        
            
            try{
                 let User = await user.findOne({email: req.body.email})
              
                if(!User){
                    return res.status(200).send({
                        success : false,
                        massage :"Incorrect email or password. Please try again"
                    })
                }

                if(notifytoken){
                    User.notifytoken =notifytoken
                    User.save()
                }
                if(User.role == 5){
                    return res.status(200).send({
                        success : false,
                        massage :"user is blocked"
                    })
                }
              const passwordcompare = await bcrypt.compare(password,User.password)
              if(!passwordcompare){
                return res.status(200).send({
                    success : false,
                    massage :"Incorrect email or password. Please try again"
                })
              }
              if(user.verifytoken){

                  await user.findOneAndUpdate(
                      {email: req.body.email},
                      { $set: { verifytoken: ""  } },
                      );
                    }
                      
                const data ={User :{id :User.id}}



    const authtoken = jwt.sign(data,jwtsecret)
    return res.status(200).send({
        authtoken :authtoken,
        success : true,
        massage :"Login Successfully!"
    })
                    
            }catch(error){
                res.status(404).send(error)
            }
         
    })

    // get user
    Router.get('/getuser',fetchuser,async(req,res)=>{

        try { 
            let iid = await req.user.id
           const User = await user.findById(iid).select("-password")
            res.send(User)
        } catch (error) {
            res.status(500).send('error')
            
        }
    })

    //all users for admin
    Router.get('/getalluser/:page',fetchuser,Isadmin,async(req,res)=>{
        let keyword = req.query.keyword
        let role = req.query.role
         let args ={}
        try {
            if (keyword) args.name =   { $regex: keyword, $options: "i" } 
       
           if (role ) args.role = {$in:role}
   
            const perPage = 10;
            const page = req.params.page ? parseInt(req.params.page) : 1
            
          const User = await user.find(args).select("-password").sort({ createdAt: -1 }) 
          .skip((page - 1) * perPage)
          .limit(perPage)

          const totaluser = await user.countDocuments( args);
            res.send({User,totaluser})
        } catch (error) {
            res.status(500).send('error')
            
        }
    })

    Router.put('/changeuser/:id',fetchuser,Isadmin,async(req,res)=>{
let id = req.params.id
let role = req.body.role;
      try { 
        data = await user.findByIdAndUpdate(id ,{role:role},
            {new:true})
            
            res.json({data})
     
        } catch (error) { 
         } 
        
    })

    //change
    Router.post ('/change',fetchuser,[
        body('password').isLength({min:5}),
        body('newpassword').isLength({min:5})
        ],async(req,res)=>{
            const salt = await bcrypt.genSalt(10)
            
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({
                    errors: errors.array()
                })
            }
            
            const {newpassword,password} = req.body    
             const secnewpass = await bcrypt.hash(newpassword,salt)
            let iid = await req.user.id
                      try{
                        
                    let User = await user.findById(iid)
                     if(!User){
                        return res.status(400).json({error:"sorry don't have a user with this email"})
                    }
                  const passwordcompare = await bcrypt.compare(password,User.password)
                  if(!passwordcompare){
                     return res.status(200).json("Incorrect password; please try again")
                  }
    


                  try { 

                    User =await user.findByIdAndUpdate(User.id ,{password:secnewpass},
                        {new:true})
                    
                  res.json({User})
              } catch (error) { 
               } 
           



                  
         
                        
                }catch(error){
                    res.status(404).send(error)
                }
             
        })





        const transporter = nodemailer.createTransport({
            service:"gmail",
         
         
            auth:{
                user:process.env.Adminemail,
                pass: process.env.emailpassword
            }
        }) 


// send email Link For reset Password
Router.post("/sendpasswordlink",async(req,res)=>{
 
    const {email} = req.body;

    if(!email){
         res.status(201).json({status:201,message:"Enter Your Email",success:false})
    }

    try {
        const userfind = await user.findOne({email:email});

        let otp = Math.floor(100000 + Math.random() * 900000)

        // token generate for reset password
        const token = jwt.sign({_id:userfind._id},jwtsecret,{
            expiresIn:"300s"
        });
        const setusertoken = await user.findByIdAndUpdate({_id:userfind._id},{verifytoken:otp},{new:true});

 
        if(setusertoken){
            const mailOptions = {
                from: process.env.Adminemail,
                to:email,
                subject:"Reset Your Password - One-Time Passcode Inside",
                
                text: `We noticed you're having trouble accessing your account. No worries, we're here to help! To reset your password, please use the one-time passcode (OTP) provided below:

                OTP: [${otp}]
                
                Simply enter this OTP on the password reset page, and you'll be prompted to create a new password for your account. If you didn't request this password reset, please ignore this message or contact our support team immediately.
                
                Best Regards,
                [TAVGUN BOUTIQUE]
                [Contact us: 9664220230,Instagram: @tavgun_boutique]  `
            }

            transporter.sendMail(mailOptions,(error,info)=>{
                if(error){
                     res.status(401).json({status:401,message:"email not send",success:false})
                }else{
                     res.status(201).json({status:201,message:"Email sent Succsfully",success:true})
                }
            })

        }

    } catch (error) {
        res.status(201).json({status:201,message:"invalid user",success:false})
    }

});



// verify user for forgot password time
Router.post('/resetPasswordConfirm', async (req, res) => {
    try {
       const email = req.body.email
      const verificationCode = req.body.verificationCode
      const password = req.body.password
      const userdata = await user.findOne({ email });
    
      if (!userdata || userdata.verifytoken !== verificationCode) {
         return res.status(200).send({ success: false ,message:"invalid OTP"});
      }
    
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password,salt)
     
      userdata.password = hashedPassword;
     
      await userdata.save();
       return res.status(200).send({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ success: false, message: 'An error occurred. Please try again later.' });
    }
  });

module.exports =Router