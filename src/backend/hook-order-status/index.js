const process = require('node:process');
const crypto = require('node:crypto');
const https = require('node:https');

const BPIUM_TEST_URL = process.env.BPIUM_TEST_URL;

async function fetchStatus() {
  return new Promise((resolve, reject) => {
    https
      .get(BPIUM_TEST_URL, (resp) => {
        // log the data
        let data = '';
        resp
          .on('data', (chunk) => {
            data += chunk;
          })
          .on('end', () => {
            try {
              const o = JSON.parse(data);
              resolve(o.value);
            } catch (e) {
              reject(e);
            }
          });
      })
      .on('error', (e) => reject(e));
  });
}

function checkSignature(body, signed) {
  var hmac = crypto.createHmac('md5', process.env.BPIUM_KEY);
  hmac.setEncoding('base64');
  hmac.write(body);
  hmac.end();
  const signature = hmac.read();
  return signature === signed;
}

module.exports.handler = async function (event, context) {
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
  const values = body.payload.values;

  return {
    statusCode: 200,
    headers: {
      'Content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      message: {
        title: 'Изменение комментария',
        text: JSON.stringify(values),
        //text: 'Комментарий заказа изменен',
      },
      values: {
        ...values,
        [process.env.ORDER_COMMENT_ID]: await fetchStatus(),
      },
    }),
  };
};
