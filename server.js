const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");

const mongoose = require("mongoose");
const User = require("./models/User");
const Pet = require("./models/Pet")
const Manipulation = require("./models/Manipulation")
const jwt = require("jsonwebtoken");
const secret = "hshsghjlGhiGIGiuVH"
const cookieParser = require("cookie-parser");

const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);


app.use(cors({credentials:true,origin:"http://localhost:3000"}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

mongoose.connect("mongodb+srv://VetClinicApi:30zOgAm7THsNOmpX@vetclinicdata.gqlpko0.mongodb.net/ClinicData")

app.post("/register", async(req,res)=>{
    const {email, password} = req.body;
    try{
        const userDoc = await User.create(
            {
                email,
                password:bcrypt.hashSync(password,salt)
            }
        )
        res.status(200).json(userDoc);
    }catch(error){
        if(error.code === 11000){
            res.status(400).json("User with given email already exists!")
        }else
        res.status(400).json(error);
    }
})


app.post("/login", async(req,res)=>{
    const {email,password} = req.body;
    const userDoc = await User.findOne({email});
    if(userDoc){
        const passCorrect = bcrypt.compareSync(password,userDoc.password);
        if(passCorrect){
            jwt.sign({email, id:userDoc._id, isAdmin:userDoc.isAdmin},secret,{},(err,token)=>{
                if(err) throw(err);
                res.cookie("token",token,{secure:true,sameSite:"none"}).status(200).json({
                    id:userDoc._id,
                    email,
                    isAdmin:userDoc.isAdmin
                });
            })
        }else{
            res.status(400).json("Wrong password!")
        }
    }else{
        res.status(400).json("Wrong email!")
    }
});

app.post("/logout",async(req,res)=>{
    res.cookie("token","").json("ok")
});

app.get("/users", async(req,res)=>{
    const {token} = req.cookies;
    jwt.verify(token,secret,async (error,data)=>{
        if(error){
            res.status(400).json(error);
        }
        else if(data?.isAdmin){
            const users = await User.find({"isAdmin":false},{"password":0,"isAdmin":0})
            res.json(users);
        }else{
            const users = await User.find({"_id":data.id},{"password":0,"isAdmin":0})
            res.json(users);
        }
    })
});

app.get("/admin",async(req,res)=>{
    const {token} = req.cookies;
    if(!token) return res.json(false)
    jwt.verify(token,secret,async (error,data)=>{
        if(error){
            throw(error)
        }
        res.json(data.isAdmin);
    })
})

app.get("/users/:id", async(req,res)=>{
    const {id} = req.params;
    const {token} = req.cookies;
    if(!token) return res.status(400).json("Unauthorized request")
    jwt.verify(token,secret,async (error,data)=>{
        if(error){
            throw(error)
        }
        if(data.isAdmin || data.id===id){
            const userDoc = await User.find({_id:id},{password:0,_id:0,isAdmin:0});
            const petDoc = await Pet.find({owner_id:id});
            const combinedData = {userData:userDoc[0], petData:petDoc}
            res.json(combinedData);
        }
        else res.status(400).json("Wrong id request!")
    })
})
    
app.post("/addpet",async(req,res)=>{
    const {token} = req.cookies;
    if(!token) return res.status(400).json("Unauthorized request")
    jwt.verify(token,secret, async(error,data)=>{
        if(error){
            throw(error)
        }
        const {id,name,species,breed,sex,birthday,weight} = req.body
        const petDoc = await Pet.create({
            owner_id:id,
            name,
            species,
            breed,
            sex,
            birthday,
            weight
        })
        res.status(200).json("ok")
    })
})

app.get("/profile", (req,res)=>{
    const {token} = req.cookies;
    jwt.verify(token,secret,{},(error,data)=>{
      if(error) return res.json(undefined)
      res.json(data);
    });
});

app.get("/pet/:id", async(req,res)=>{
    const {id} = req.params;
    const {token} = req.cookies;
    if(!token) return res.status(400).json("Unauthorized request")
    if(!id) return res.status(400).json("Wrond petId")
    jwt.verify(token,secret,{},async(error,data)=>{
        if(error) throw(error)
        const petDoc = await Pet.findById(id);
        const manipulationDoc = await Manipulation.find({"pet_id":id});
        const combinedData = {petData:petDoc, manipulations:manipulationDoc}
        if(data.isAdmin || JSON.stringify(data.id) === JSON.stringify(petDoc.owner_id)){
            return res.json(combinedData)
        }
        })
})

app.post("/addManipulation", async(req,res)=>{
    const {token} = req.cookies;
    if(!token) return res.status(400).json("Unauthorized request")
    jwt.verify(token,secret,{},async (error,data)=>{
        if(error) return res.status(400).json("Unauthorized request")
        if(data.isAdmin){
            const {date,petId, weight, temp, purpose, desc, recommendation} = req.body
            const manipulationDoc = await Manipulation.create({
                pet_id:petId,
                date,
                weight,
                temp,
                purpose,
                doctor:data.id,
                desc,
                recommendation,
            })
            res.status(200).json("ok");
        }else{
            res.status(400).json("Unauthorized request")
        }
        
    });
})

app.listen(PORT,()=>{
    console.log(`running on port ${PORT}`);
})