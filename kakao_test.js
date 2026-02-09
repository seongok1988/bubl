const https = require('https');

const query = encodeURIComponent('역삼동 123-45');
const options = {
  hostname: 'dapi.kakao.com',
  path: `/v2/local/search/address.json?query=${query}`,
  method: 'GET',
  headers: {
    'Authorization': 'KakaoAK 306ada6405de7dfb3fa6a24e1397885e'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    // ...existing code...
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.end();
