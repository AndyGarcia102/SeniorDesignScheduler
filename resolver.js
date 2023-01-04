const Users = require('./models/Users.model');
const Professors = require('./models/Professors.model');
const Group = require('./models/Group.model');
const {ApolloError} = require('apollo-server-errors');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const STUDENT_EMAIL = new RegExp(process.env.STUDENT_EMAIL);
const PROFESSOR_EMAIL = new RegExp(process.env.PROFESSOR_EMAIL_TEST);

const resolvers = {
    Query:{
        getUser: async(_,{ID}) => {
            return await Users.findById(ID);
        },
        getAllUsers: async () => {
            return await Users.find();
        },   
        getProfessor: async(_,{ID}) => {
            return await Professors.findById(ID);
        },
        getAllProfessors: async () => {
            return await Professors.find();
        },
        getAllGroups: async() => {
            return await Group.find();
        }
    },
    Mutation:{
        registerUser: async(_,{registerInput: {firstname,lastname,login, email, password, confirmpassword}}) =>{

            if (password !== confirmpassword){
                throw new ApolloError("Passwords Do Not Match");
            }
            if(password === "" || firstname === "" || lastname === "" || login === "" || email === ""){
                throw new ApolloError("Please fill in all of the Boxes!");
            }
            // See if an old user or Professor exists with Email attempting to Register
            const oldUser = await Users.findOne({email},{email:1, confirm:1, password:1, token:1, firstname:1, lastname:1});
            const oldProfessor = await Professors.findOne({email},{email:1, confirm:1, password:1, token:1, firstname:1, lastname:1});
    
            if(oldUser || oldProfessor){
                // throw an error 
                throw new ApolloError("A user is already reigstered with the email" + email, "USER_ALREADY_EXISTS");
            }

            let transport = nodemailer.createTransport({ service: "Gmail", auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD }, });

            let privilege = 0;

            if(STUDENT_EMAIL.test(email)){
                // student account creation
                privilege = 1;

                // Encrypt password using bcryptjs
                var encryptedPassword = await bcrypt.hash(password,10);
        
                // Build out mongoose model 
                const newUser = new Users({
                    firstname:firstname,
                    lastname:lastname,
                    login:login,
                    email: email.toLowerCase(),
                    password: encryptedPassword,
                    privilege: privilege,
                    confirm: 0,
                });
        
                // create JWT (attach to user model)
                const token = jwt.sign(
                    {id : newUser._id, email}, 
                    "UNSAFE_STRING", // stored in a secret file 
                    {
                        expiresIn: "2h"
                    }
                );
                
                // front end wants to see this token
                // They will attach this token to the user when logging in.
                newUser.token = token;
                
                // Save user in MongoDB
                const res = await newUser.save();

                transport.sendMail({
                    from: "group13confirmation@gmail.com",
                    to: email,
                    subject: "mySDSchedule - Please Confirm Your Account",
                    html: `<h1>Email Confirmation</h1>
                    <h2>Hello ${firstname}</h2>
                    <p>Thank you for Registering!</p>
                    <p>To activate your account please click on the link below.</p>
                    
                    </div>`,
                    // code up a confirmation
                    //<a href=https://cop4331-group13.herokuapp.com/api/confirm?confirmationcode=${token}> Click here</a>
                })
        
                return{
                    id:res.id,
                    ...res._doc
                }

            }else if(!STUDENT_EMAIL.test(email)){
                // professor account creation
                privilege = 2;
                
                // Encrypt password using bcryptjs
                var encryptedPassword = await bcrypt.hash(password,10);
        
                // Build out mongoose model 
                const newProfessor = new Professors({
                    firstname:firstname,
                    lastname:lastname,
                    login:login,
                    email: email.toLowerCase(),
                    password: encryptedPassword,
                    privilege: privilege,
                    confirm: 0,
                });
        
                // create JWT (attach to user model)
                const token = jwt.sign(
                    {id : newProfessor._id, email}, 
                    "UNSAFE_STRING", // stored in a secret file 
                    {
                        expiresIn: "2h"
                    }
                );
                
                // front end wants to see this token
                // They will attach this token to the user when logging in.
                newProfessor.token = token;
                
                // Save user in MongoDB
                const res = await newProfessor.save();

                transport.sendMail({
                    from: "group13confirmation@gmail.com",
                    to: email,
                    subject: "mySDSchedule - Please Confirm Your Account",
                    html: `<h1>Email Confirmation</h1>
                    <h2>Hello ${firstname}</h2>
                    <p>Thank you for Registering!</p>
                    <p>To activate your account please click on the link below.</p>
                    
                    </div>`,
                    //<a href=https://cop4331-group13.herokuapp.com/api/confirm?confirmationcode=${token}> Click here</a>
                })
        
                return{
                    id:res.id,
                    ...res._doc
                }

            }else{
                throw new ApolloError("Invalid Email " + email, " EMAIL IS NOT VALID");
            }
    
        },
        loginUser: async (_,{loginInput: {email, password}}) => {

            const professors = await Professors.findOne({email}, {email:1, confirm:1, password:1, token:1, firstname:1, lastname:1});
            const user = await Users.findOne({email}, {email:1, confirm:1, password:1, token:1, firstname:1, lastname:1});

            if(STUDENT_EMAIL.test(email) && user != null){
                if(user.confirm === 0){
                    throw new ApolloError("Account Not confirmed " + email + " PLEASE SEE EMAIL CONFIRMATION");
                }else{
                    // check if the entered password = encrypted password - use bcrypt
                    if(user && (await bcrypt.compare(password, user.password))){
                        // create a new token ( when you login you give user a new token )
                        const token = jwt.sign(
                            {id : user._id, email}, 
                            "UNSAFE_STRING", // stored in a secret file 
                            {
                                expiresIn: "2h"
                            }
                        );
        
                        // attach token to user model that we found if user exists 
                        user.token = token;
        
                        return {
                            id: user.id,
                            ...user._doc
                        }
        
        
                    }else{
                        // if user doesn't exists, return error
                        throw new ApolloError("Incorrect Password", "INCORRECT_PASSWORD");
                    }
                }
            }else if(PROFESSOR_EMAIL.test(email) && professors != null){
                if(professors.confirm === 0){
                    throw new ApolloError("Account Not confirmed " + email + " PLEASE SEE EMAIL CONFIRMATION");
                }else{
                    // check if the entered password = encrypted password - use bcrypt
                    if(professors && (await bcrypt.compare(password, professors.password))){
                        // create a new token ( when you login you give user a new token )
                        const token = jwt.sign(
                            {id : professors._id, email}, 
                            "UNSAFE_STRING", // stored in a secret file 
                            {
                                expiresIn: "2h"
                            }
                        );
        
                        // attach token to user model that we found if user exists 
                        professors.token = token;
        
                        return {
                            id: professors.id,
                            ...professors._doc
                        }
        
        
                    }else{
                        // if user doesn't exists, return error
                        throw new ApolloError("Incorrect Password", "INCORRECT_PASSWORD");
                    }
                }
            }else{
                throw new ApolloError("LEARN HOW TO CODE NERD");
            }
        },

        // confirm email if valid, then provide another api to actually set the api.
        confirmEmail: async(_,{confirmEmail:{email}}) => {

            // check if email is valid 
            if(STUDENT_EMAIL.test(email)){
                try{
                    // check if email is valid 
                    const isValidEmail = await Users.findOne({email}, {_id:1, email:1, firstname:1, lastname:1});
                    
                    // set up email 
                    let transport = nodemailer.createTransport({ service: "Gmail", auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD }, });

                    // send email to user. 
                    transport.sendMail({
                        from: "group13confirmation@gmail.com",
                        to: email,
                        subject: "mySDSchedule - Please Confirm Your Account",
                        html: `<h1>Email Confirmation</h1>
                        <h2>Hello ${isValidEmail.firstname} ${isValidEmail.lastname}</h2>
                        <p>Click Link to reset your password!</p>
                        <p>If you did not select to reset your password please ignore this email</p>
                        </div>`,
                        //<a href=https://cop4331-group13.herokuapp.com/api/confirm?confirmationcode=${token}> Click here</a>
                    })
                }catch(e){
                    // email is not valid 
                    throw new ApolloError("Email IS Not Valid");
                }

            }else if(PROFESSOR_EMAIL.test(email)){
                try{
                    // check if email is valid 
                    const isValidEmail = await Professors.findOne({email}, {_id:1, email:1, firstname:1, lastname:1});
                    
                    // set up email 
                    let transport = nodemailer.createTransport({ service: "Gmail", auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD }, });

                    // send email to user. 
                    transport.sendMail({
                        from: "group13confirmation@gmail.com",
                        to: email,
                        subject: "mySDSchedule - Please Confirm Your Account",
                        html: `<h1>Email Confirmation</h1>
                        <h2>Hello ${isValidEmail.firstname} ${isValidEmail.lastname}</h2>
                        <p>Click Link to reset your password!</p>
                        <p>If you did not select to reset your password please ignore this email</p>
                        </div>`,
                        //<a href=https://cop4331-group13.herokuapp.com/api/confirm?confirmationcode=${token}> Click here</a>
                    })
                }catch(e){
                    // email is not valid 
                    throw new ApolloError("Email IS Not Valid");
                }
            }
        },
        resetPassword: async(_,{resetPassword:{email,password,confirmPassword}}) =>{

            // encrypt new password and set to user.
            if(password !== confirmPassword){
                throw new ApolloError("Passwords Do Not Match!");
            }
            
            if(STUDENT_EMAIL.test(email)){
                 try{
                    // encrypt password
                    const encryptedPassword = await bcrypt.hash(password,10);
                    
                    // set password from user 
                    const setNewPassword = await Users.findOneAndUpdate({email:email}, {password: encryptedPassword, confirmpassword: encryptedPassword });

                    setNewPassword.save();
            
                }catch(e){
                     throw new ApolloError("Email is Invalid");
                 }
            }else if (PROFESSOR_EMAIL.test(email)){
                try{
                    // encrypt password
                    const encryptedPassword = await bcrypt.hash(password,10);
                    
                    // set password from user 
                    const setNewPassword = await Professors.findOneAndUpdate({email:email}, {password: encryptedPassword, confirmpassword: encryptedPassword });
                    
                    setNewPassword.save();
            
                }catch(e){
                    throw new ApolloError("Email is Invalid");
                }
            }

        },
        createProfessorSchedule: async(_,{ID,professorScheduleInput:{time}}) => {
            const date = new Date(time).toISOString();
            const isoDate = new Date(date);
            const createdDate = (await Professors.findByIdAndUpdate({_id:ID},{$push:{schedule:isoDate}})).modifiedCount;
            return createdDate;
        },
        createGroup: async (_,{groupInfo:{groupName,groupProject,projectField}}) =>{

            // create a new group Document
            const newGroup = new Group({
                groupName: groupName,
                groupProject: groupProject,
                projectField: projectField,
                memberCount: 0
            });
            

            // Save user in MongoDB
            const res = await newGroup.save();

            // return object created 
            return{
                id:res.id,
                ...res._doc
            }
        },
        addGroupMember: async(_, {ID, groupName:{name}}) =>{
            
            const groupExist = (await Group.find(({groupName:name})));
            if(groupExist){

                const query = {groupName:name};
                const update = {$push:{members:ID}, $inc:{memberCount: 1}};
                const options = {upsert:false};

                const addGroupMember = (await Group.findOneAndUpdate(query, update, options)).modifiedCount;
                return addGroupMember;
            }else{
                throw ApolloError("Group Does Not Exist!");
            }


        },
        deleteUser: async(_,{ID}) => {
            const wasDeletedUser = (await Users.deleteOne({_id:ID})).deletedCount;
            return wasDeletedUser;
        },
        deleteProfessor: async(_,{ID}) =>{
            const wasDeletedProfessor = (await Professors.deleteOne({_id:ID})).deletedCount;
            return wasDeletedProfessor;
        },
        editUser: async(_,{ID,userInput:{firstname,lastname,email,login}})=>{
            const  userEdited = (await Users.updateOne({_id:ID},{
                firstname:firstname,
                lastname:lastname,
                email:email,
                login:login
            })).modifiedCount;
            return userEdited;
        },
        editProfessor: async (_,{ID,professorInput:{firstname,lastname,email,login}})=>{
            const professorEdit = (await Professors.updateOne({_id:ID},{
                firstname:firstname,
                lastname:lastname,
                email:email,
                login:login
            })).modifiedCount;
            return professorEdit;
        }
    }
}

module.exports = resolvers;
