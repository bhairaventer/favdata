const user = require("../module/user");
const usermodule = require("../module/user");
const express = require("express");
const jwt = require('jsonwebtoken');
const Router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchuser = require("../middleware/middle");
const Isadmin = require("../middleware/admin");
const bcrypt = require('bcryptjs');
const product = require("../module/product");
const nodemailer = require("nodemailer");

require('dotenv').config();

const jwtsecret = process.env.jwtsecret;

// create user
Router.post('/createuser', [
    body('email').isEmail(),
    body('name').isLength({ min: 3 }),
    body('phone').isLength({ min: 10 }),
    body('password').isLength({ min: 5 })
], async (req, res) => {
    console.log(req.body)
    const salt = await bcrypt.genSalt(10);
    const secpass = await bcrypt.hash(req.body.password, salt);
    const errors = validationResult(req);
    
 
        let User = await user.findOne({ email: req.body.email });
        if (User) {
            return res.status(200).send({
                success: false,
                message: "Already Registered, please login"
            });
        }
        User = await user.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: secpass
        });
        const data = { User: { id: User.id } };
        const authtoken = jwt.sign(data, jwtsecret);
        return res.status(200).send({
            token: authtoken,
            success: true,
            message: "User Registered Successfully"
        });
    
});

function getSecondsUntil3AM() {
    const now = new Date();
    const target = new Date(now);
    target.setHours(3, 0, 0, 0); // Set target to 3 AM of the current day

    if (now.getHours() >= 3) {
        // If current time is past 3 AM, set target to 3 AM of the next day
        target.setDate(target.getDate() + 1);
    }

    return Math.floor((target - now) / 1000); // Return the difference in seconds
}

// login
Router.post('/login', async (req, res) => {
    const { password, email, notifytoken } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            success: false,
            message: "Enter email and password"
        });
    }

    try {
        const user = await usermodule.findOne({ email }); // Use usermodule model

        if (!user) {
            return res.status(201).send({
                success: false,
                message: "Incorrect email or password. Please try again"
            });
        }

        if (notifytoken) {
            user.notifytoken = notifytoken;
            await user.save();
        }

        if (user.role === 5) {
            return res.status(201).send({
                success: false,
                message: "User is blocked"
            });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(201).send({
                success: false,
                message: "Incorrect email or password. Please try again"
            });
        }

        if (user.verifytoken) {
            await usermodule.findOneAndUpdate(
                { email },
                { $set: { verifytoken: "" } }
            );
        }
        const secondsUntil3AM = getSecondsUntil3AM();
        const tokenExpiration = secondsUntil3AM; // Time in seconds until 3 AM
        const data = { User: { id: user.id } };
        const authtoken = jwt.sign(data, jwtsecret, { expiresIn: tokenExpiration });

        return res.status(200).send({
            authtoken,
            success: true,
            message: "Login Successfully!"
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error"
        });
    }
});

// get user
Router.get('/getuser', fetchuser, async (req, res) => {
    try {
        let iid = await req.user.id;
        const User = await user.findById(iid).select("-password");
        if (!User) {
            return res.send({ success: false });
        }
        res.send(User);
    } catch (error) {
        res.status(500).send('Error occurred');
    }
});

// all users for admin
Router.get('/getalluser', fetchuser, Isadmin, async (req, res) => {
    let keyword = req.query.keyword;
    let role = req.query.role;
    let args = {};
    try {
        if (keyword) args.name = { $regex: keyword, $options: "i" };
        if (role) args.role = { $in: role };
        const User = await user.find(args).select("-password").sort({ createdAt: -1 });
        const totaluser = await user.countDocuments(args);
        res.send({ User, totaluser });
    } catch (error) {
        res.status(500).send('Error occurred');
    }
});

Router.put('/changeuser/:id', fetchuser, Isadmin, async (req, res) => {
    const id = req.params.id;
    const { role, canEdit, canAdd, canDelete } = req.body;

    try {
        // Fetch the user document to check existing fields
        const existingUser = await user.findById(id);
        if (!existingUser) return res.status(404).send('User not found');

        // Prepare the fields to update
        const updateFields = {};

        // Check and set fields based on their presence in the request and document
        if (role !== undefined) updateFields.role = role;
        if (canEdit !== undefined) updateFields.canEdit = canEdit;
        if (canAdd !== undefined) updateFields.canAdd = canAdd;
        if (canDelete !== undefined) updateFields.canDelete = canDelete;
console.log(updateFields)
        // Update user with $set operator
        const updatedUser = await user.findByIdAndUpdate(id, { $set: updateFields }, { new: true, runValidators: true });
         res.json({ updatedUser });
    } catch (error) {
        res.status(500).send('Error occurred');
    }
});




// change
Router.post('/change', fetchuser, [
    body('password').isLength({ min: 5 }),
    body('newpassword').isLength({ min: 5 })
], async (req, res) => {
    const salt = await bcrypt.genSalt(10);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const { newpassword, password } = req.body;
    const secnewpass = await bcrypt.hash(newpassword, salt);
    let iid = await req.user.id;
    try {
        let User = await user.findById(iid);
        if (!User) {
            return res.status(400).json({ error: "Sorry, no user found with this email" });
        }
        const passwordcompare = await bcrypt.compare(password, User.password);
        if (!passwordcompare) {
            return res.status(200).json("Incorrect password; please try again");
        }
        try {
            User = await user.findByIdAndUpdate(User.id, { password: secnewpass }, { new: true });
            return res.status(200).json("Success! Your password has been updated");
        } catch (error) {
            res.status(500).send('Error occurred');
        }
    } catch (error) {
        res.status(404).send('Error occurred');
    }
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.Adminemail,
        pass: process.env.emailpassword
    }
});

// send email link for reset password
Router.post("/sendpasswordlink", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: 400, message: "Enter Your Email", success: false });
    }
    try {
        const userfind = await user.findOne({ email: email });
        let otp = Math.floor(100000 + Math.random() * 900000);
        const token = jwt.sign({ _id: userfind._id }, jwtsecret, { expiresIn: "300s" });
        const setusertoken = await user.findByIdAndUpdate({ _id: userfind._id }, { verifytoken: otp }, { new: true });

        if (setusertoken) {
            const mailOptions = {
                from: process.env.Adminemail,
                to: email,
                subject: "Reset Your Password - One-Time Passcode Inside",
                text: `We noticed you're having trouble accessing your account. No worries, we're here to help! To reset your password, please use the one-time passcode (OTP) provided below:

                OTP: [${otp}]
                
                Simply enter this OTP on the password reset page, and you'll be prompted to create a new password for your account. If you didn't request this password reset, please ignore this message or contact our support team immediately.
                
                Best Regards,`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(401).json({ status: 401, message: "Email not sent", success: false });
                } else {
                    return res.status(200).json({ status: 200, message: "Email sent successfully", success: true });
                }
            });
        }
    } catch (error) {
        res.status(400).json({ status: 400, message: "Invalid user", success: false });
    }
});

// verify user for forgot password
Router.post('/resetPasswordConfirm', async (req, res) => {
    try {
        const email = req.body.email;
        const verificationCode = req.body.verificationCode;
        const password = req.body.password;
        const userdata = await user.findOne({ email });

        if (!userdata || userdata.verifytoken !== verificationCode) {
            return res.status(400).send({ success: false, message: "Invalid OTP" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        userdata.password = hashedPassword;
        await userdata.save();
        return res.status(200).send({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, message: 'An error occurred. Please try again later.' });
    }
});

module.exports = Router;
