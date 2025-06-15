const http = require('http');
const server = http.createServer((req, res) => {
  res.end('Backend service');
});
server.listen(5000, () => console.log('Backend running on port 5000'));
