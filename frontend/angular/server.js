const express = require('express');
const path = require('path');
const app = express();
const port = 4200;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Frontend listening on http://0.0.0.0:${port}`);
});
