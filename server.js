const mongoose = require("mongoose");
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const typeDefs = require("./typeDefs");
const resolvers = require("./resolver");
const path = require("path");
require('dotenv').config();

async function startServer(){
    const app = express();
    
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins:[ApolloServerPluginDrainHttpServer({httpServer})]
    });

    await server.start();

    app.set('view engine', 'ejs');
    
    app.use(
        '/graphql',
        cors(),
        bodyParser.json(),
        expressMiddleware(server),
    );

    app.use(express.static("Web/client/public/index.html"));
        

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Mongoose Connected...");
    await new Promise((resolve) => httpServer.listen({port:process.env.PORT}, resolve));

    console.log(`🚀 Server ready at`+process.env.PORT);

 }

startServer();

