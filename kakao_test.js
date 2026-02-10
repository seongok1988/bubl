const https = require('https');

const query = encodeURIComponent('역삼동 123-45');
const KAKAO_KEY = process.env.KAKAO_REST_API_KEY || process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY
if (!KAKAO_KEY) {
  console.error('Missing KAKAO_REST_API_KEY environment variable. Set KAKAO_REST_API_KEY or NEXT_PUBLIC_KAKAO_REST_API_KEY.')
  process.exit(1)
}

const options = {
  hostname: 'dapi.kakao.com',
  path: `/v2/local/search/address.json?query=${query}`,
  method: 'GET',
  headers: {
    'Authorization': `KakaoAK ${KAKAO_KEY}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data)
      console.log(JSON.stringify(parsed, null, 2))
    } catch (e) {
      console.log(data)
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.end();
