const http = require('http')
const port = 3000;
const app = require('./app')

const server = http.createServer(app)

server.listen(port,()=>{console.log("this app is runing on port "+port)})

// const express = require('express');
// const app = express();
// const authRoutes = require('./routes/auth'); // path as per your structure

// app.use(express.json());
// app.use('/api/auth', authRoutes);


const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);
