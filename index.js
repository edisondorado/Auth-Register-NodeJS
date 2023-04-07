import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';

import { registerValidation } from './validations/auth.js';

import UserModel from './models/User.js';

mongoose
    .connect('mongodb+srv://<username>:<password>@<cluster>.mongodb.net/blog?retryWrites=true&w=majority')
    .then(() => console.log('DB Initialized'))
    .catch((err) => console.log("DB Error", err));

const app = express();
app.use(express.json());

app.post('/auth/login', async (req, res) => {
    try{ 
        const user = await UserModel.findOne({ email: req.body.email });

        if(!user){
            return res.status(404).json({
                message: "Email or password aren't right",
            });
        }

        const isValidPass = await bcrypt.compare(req.body.password,user._doc.passwordHash);

        if(!isValidPass){
            return res.status(404).json({
                message: "Email or password aren't right",
            });
        }

        const token = jwt.sign({
            _id: user._id,
        }, 
        'iogagsdfdssd', 
        {
            expiresIn: '30d',
        });
        
        const { passwordHash, ... userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch(err) {
        console.log(err)
        res.status(500).json({
            message: 'Can\'t auth'
        });
    }
})

app.post('/auth/register', registerValidation, async (req, res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json(errors.array());
        }

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash,
        });

        const user = await doc.save();

        const token = jwt.sign({
            _id: user._id,
        }, 
        'iogagsdfdssd', 
        {
            expiresIn: '30d',
        });

        const { passwordHash, ... userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (err){
        console.log(err)
        res.status(500).json({
            message: 'Can\'t register'
        });
    }
});

app.listen(2000, (err) =>{
    if(err){
        return console.log(err);
    }

    console.log("Server initialized");
});