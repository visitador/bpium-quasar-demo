const process = require('node:process');
const https = require('node:https');
const crypto = require('node:crypto');

function checkSignature(body, signed) {
  var hmac = crypto.createHmac('md5', process.env.BPIUM_KEY);
  hmac.setEncoding('base64');
  hmac.write(body);
  hmac.end();
  const signature = hmac.read();
  return signature === signed;
}

const STORE_COMMENT_ID = process.env.STORE_COMMENT_ID;
const STORE_ORDER_ID = process.env.STORE_ORDER_ID;
const BPIUM_USER = process.env.BPIUM_USER;
const BPIUM_PASS = process.env.BPIUM_PASS;

function createStoreRecord(catalogId, recordCatalogId, recordId, comment) {
  const auth = new Buffer(BPIUM_USER + ':' + BPIUM_PASS).toString('base64');

  const postData = JSON.stringify({
    values: {
      [STORE_COMMENT_ID]: comment,
      [STORE_ORDER_ID]: [
        {
          catalogId: recordCatalogId,
          recordId: recordId,
        },
      ],
    },
  });

  const options = {
    hostname: process.env.BPIUM_DOMAIN,
    port: 443,
    path: `/api/v1/catalogs/${catalogId}/records`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
      Authorization: `Basic ${auth}`,
    },
  };

  const req = https.request(options, (resp) => {
    // log the data
    let data = '';
    resp.on('data', (chunk) => {
      data += chunk;
    });
    resp.on('end', () => {
      console.log('Store record created', data);
    });
  });
  req.write(postData);
  req.end();
}

const CATALOG_STORE_ID = process.env.CATALOG_STORE_ID;
const CATALOG_ORDERS_ID = process.env.CATALOG_ORDERS_ID;
const ORDER_COMMENT_ID = process.env.ORDER_COMMENT_ID;

module.exports.handler = function (event, context) {
  const signed = event.headers['X-Hook-Signature'];
  if (!checkSignature(event.body, signed)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: {
          title: 'Ошибка безопасности',
          text: 'Неверная подпись в заголовке X-Hook-Signature',
        },
      }),
    };
  }

  let body = event.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  createStoreRecord(
    CATALOG_STORE_ID,
    CATALOG_ORDERS_ID,
    body.payload.recordId,
    body.payload.values[ORDER_COMMENT_ID]
  );

  return {
    statusCode: 200,
  };
};
