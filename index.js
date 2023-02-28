const qr = require('qrcode');
const { calculateCRC } = require('./libs/CRCCalculator');
const { buildQRProps } = require('./libs/qrBuilder');
const { generateQRString } = require('./libs/qrStringGenerator');

const CRC_ID = '63';
const CRC_LENGTH = '04';

// QR tĩnh đến thẻ k có amount + description + order
// qr tĩnh đến tài khoản k có amount + description + order
// qr động đên stk
const qrRawData = {
  qrType: 'DYNAMIC', // STATIC
  bin: '970416',
  receiverNumber: '224528479',
  instrumentType: 'ACCOUNT', // CARD
  amount: 10000,
  orderId: 'NPS6869',
  description: 'test chuyen khoan orderid'
};

function main() {
  const qrProperties = buildQRProps(qrRawData);
  const rawQRString = generateQRString(qrProperties);
  const qrContentNoChecksum = rawQRString + CRC_ID + CRC_LENGTH;
  const checksum = calculateCRC(qrContentNoChecksum);
  const qrString = qrContentNoChecksum + checksum.toUpperCase();
  qr.toFile(
    'qr.png',
    qrString,
    {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 2,
      color: {
      dark: '#000000',
        light: '#ffffff'
      }
    },
    function (err) {
      if (err) throw err;
      console.log('QR code created!');
    }
  );
}

main();

// 00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN6304
// 00020101021138570010A00000072701270006970403011300110123456780208QRIBFTTA53037045802VN6200630463F
