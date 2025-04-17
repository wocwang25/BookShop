const http = require("http")
const app = require('./app');
const PORT = 3000;

const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});