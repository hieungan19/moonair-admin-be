var admin = require('firebase-admin');
var fcm = require('@diavrank/fcm-notification');
var serviceAccount = require('../config/push_noti.json');
const certPath = admin.credential.cert(serviceAccount);
var FCM = new fcm(certPath);

exports.sendPushNoti = (req, res, next) => {
  try {
    let message = {
      data: {
        invoiceId: '123',
      },
      notification: {
        title: 'Title name',
        body: 'Test body..',
      },
      token: req.body.fcm_token,
    };
    console.log('body', req.body);
    FCM.send(message, function (err, response) {
      if (err) {
        return res.status(500).send({
          message: err,
        });
      } else {
        return res.status(200).send({
          message: 'Noti sent.',
        });
      }
    });
  } catch (err) {
    throw err;
  }
};
