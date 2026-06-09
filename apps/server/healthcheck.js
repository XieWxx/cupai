const http = require('http');
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/bsd/sync/ready',
  timeout: 5000
};
const req = http.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const body = JSON.parse(data);
      if (body.ready) { process.exit(0); }
      else { process.exit(1); }
    } catch (e) { process.exit(1); }
  });
});
req.on('error', () => process.exit(1));
req.on('timeout', () => { req.destroy(); process.exit(1); });
