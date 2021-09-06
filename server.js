require('dotenv').config();
const http = require('http');
const app = require('./app');
const port = process.env.PORT || 4100;

const server = http.createServer(app);
server.listen(port);