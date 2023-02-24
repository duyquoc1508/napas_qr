const crc = require('crc');
const qr = require('qrcode');

const QR_TYPE = {
  STATIC: '11',
  DYNAMIC: '12'
};
const INSTRUMENT_TYPE = {
  CARD: 'QRIBFTTC',
  ACCOUNT: 'QRIBFTTA'
};
const CRC_ID = '63';
const CRC_LENGTH = '04';

function calculateCRC(data) {
  // Convert data to buffer
  const buffer = Buffer.from(data, 'utf8');
  // Calculate the CRC
  const result = crc.crc16ccitt(buffer, 0xffff);
  // Convert the CRC to hex string
  return result.toString(16);
}

function buildQRProps({ qrType, bin, receiverNumber, instrumentType, amount, orderId, description }) {
  const qrProperties = {
    payloadFormatIndicator: {
      id: '00',
      value: '01'
    },
    pointOfInitiationMethod: {
      id: '01',
      value: QR_TYPE[qrType]
    },
    merchantAccountInformation: {
      id: '38',
      value: {
        guid: {
          id: '00',
          value: 'A000000727'
        },
        paymentNetwork: {
          id: '01',
          value: {
            beneficiaryId: {
              id: '00',
              value: bin
            },
            receiverNumber: {
              id: '01',
              value: receiverNumber
            }
          }
        },
        servicesCode: {
          id: '02',
          value: INSTRUMENT_TYPE[instrumentType]
        }
      }
    },
    transactionCurrency: {
      id: '53',
      value: '704'
    },
    transactionAmount: {
      id: '54',
      value: `${amount}`
    },
    countryCode: {
      id: '58',
      value: 'VN'
    },
    additionalDataFieldTemplate: {
      id: '62',
      value: {
        order: {
          id: '01',
          value: orderId
        },
        purposeOfTx: {
          id: '08',
          value: description
        }
      }
    }
    // merchantCategoryCode,
    // tipOrConvenienceIndicator,
    // valueOfConvenienceFeeFixed,
    // valueOfConvenienceFeePercentage,
    // merchantName,
    // merchantCity,
    // postalCode,
    // crc,
    // merchantInformationLanguageTemplate,
    // rfuForEMVCo,
    // unreservedTemplates,
  };
  return qrProperties;
}

function createQRString (data) {
  let result = '';
  for (const [_, value] of Object.entries(data)) {
    if (!value.value) continue;
    result += value.id;
    const isObject = (typeof value.value === 'object');
    const valueString = isObject ? createQRString(value.value) : value.value;
    result += valueString.length.toString().padStart(2, '0');
    result += valueString;
  }
  return result;
};

const qrRawData = {
  qrType: 'DYNAMIC', // STATIC
  bin: '970416',
  receiverNumber: '224528479',
  instrumentType: 'ACCOUNT', // CARD
  amount: 18000,
  // orderId: 'NPS6869',
  description: 'thanh toan don hang'
};

const qrProperties = buildQRProps(qrRawData);
const rawQRString = createQRString(qrProperties);

const qrContentNoChecksum = rawQRString + CRC_ID + CRC_LENGTH;
const checksum = calculateCRC(qrContentNoChecksum);

const result = qrContentNoChecksum + checksum.toUpperCase();
console.log('qrString >>>', result);

qr.toFile(
  'qr.png',
  result,
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
