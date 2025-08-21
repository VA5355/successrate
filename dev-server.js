const { createServer } = require('https');
const { parse } = require('url');
const fs = require('fs');
const next = require('next');

const dev = true;
const hostname = '192.168.1.4'; // or 'localhost'
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./ssl.key/server.key'),
  cert: fs.readFileSync('./ssl.crt/server.crt'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, () => {
    console.log(`> Dev HTTPS server ready at https://${hostname}:${port}`);
  });
});
