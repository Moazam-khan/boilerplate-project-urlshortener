require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const dns = require('dns');
const urlParser = require('url');

const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

// Root route
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Test API
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

// In-memory store
let urls = [];
let counter = 1;

// POST endpoint for shortening
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;
  const parsedUrl = urlParser.parse(original_url);

  // DNS validation
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err || !/^https?:\/\//.test(original_url)) {
      return res.json({ error: 'invalid url' });
    }

    // Save and respond
    const short_url = counter++;
    urls[short_url] = original_url;

    res.json({
      original_url,
      short_url,
    });
  });
});

// GET endpoint for redirection
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = parseInt(req.params.short_url);

  const original_url = urls[short_url];
  if (original_url) {
    res.redirect(original_url);
  } else {
    res.status(404).json({ error: 'No short URL found for given input' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
