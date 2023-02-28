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
  bin: '970405',
  receiverNumber: '9704051078942458',
  instrumentType: 'CARD', // CARD
  amount: 180000,
  // orderId: 'NPS6869',
  description: 'thanh toan don hang'
};

function main() {
  const qrProperties = buildQRProps(qrRawData);
  const rawQRString = generateQRString(qrProperties);
  const qrContentNoChecksum = rawQRString + CRC_ID + CRC_LENGTH;
  const checksum = calculateCRC(qrContentNoChecksum);
  console.log(checksum)
  const qrString = qrContentNoChecksum + checksum.toUpperCase();
  console.log(qrString)
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
