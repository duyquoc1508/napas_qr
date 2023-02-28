// create vietqr with napas standard
const _ = require('lodash');
const crc = require('crc');

const QR_TYPE = {
  STATIC: '11',
  DYNAMIC: '12'
};

const INSTRUMENT_TYPE = {
  CARD: 'QRIBFTTC',
  ACCOUNT: 'QRIBFTTA'
};

const CARD_NUMBER_PREFIX = '9704';

const CRC_ID = '63';
const CRC_LENGTH = '04';

function calculateCRC(data) {
  // Convert data to buffer
  const buffer = Buffer.from(data, 'utf8');
  // Calculate the CRC
  const result = crc.crc16ccitt(buffer, 0xffff);
  // Convert the CRC to hex string
  return result.toString(16).padStart(4, '0');
}

function buildQRProps({ qrType, bin, receiverNumber, instrumentType, amount, orderId, description }) {
  const qrProperties = {
    payloadFormatIndicator: {
      id: '00',
      value: '01'
    },
    pointOfInitiationMethod: {
      id: '01',
      value: qrType || QR_TYPE.STATIC
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
          value: INSTRUMENT_TYPE[instrumentType] || INSTRUMENT_TYPE.ACCOUNT
        }
      }
    },
    transactionCurrency: {
      id: '53',
      value: '704'
    },
    transactionAmount: {
      id: '54',
      value: amount
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

function createQRString(objProps) {
  let result = '';
  Object.values(objProps).forEach(prop => {
    if (!prop.value) return;
    const isObject = (typeof prop.value === 'object');
    const valueString = isObject ? createQRString(prop.value) : String(prop.value);
    if (valueString) {
      result += prop.id;
      result += valueString.length.toString().padStart(2, '0');
      result += valueString;
    }
  });
  return result;
}

function buildQR(params = {
  bin: '',
  receiverNumber: '',
  amount: 0,
  orderId: '',
  description: ''
}) {
  if (!params.bin || !params.receiverNumber) {
    return '';
  }
  let instrumentType = INSTRUMENT_TYPE.ACCOUNT;
  if (String(params.receiverNumber).startsWith(CARD_NUMBER_PREFIX) && _.inRange(params.receiverNumber.length, 16, 20)) {
    instrumentType = INSTRUMENT_TYPE.CARD;
  }
  const qrRawData = {
    qrType: QR_TYPE.DYNAMIC,
    bin: params.bin,
    receiverNumber: params.receiverNumber,
    instrumentType,
    amount: params.amount,
    // orderId: params.orderId,
    description: params.description
  };
  const qrProperties = buildQRProps(qrRawData);
  const rawQRString = createQRString(qrProperties);

  const qrContentNoChecksum = rawQRString + CRC_ID + CRC_LENGTH;
  const checksum = calculateCRC(qrContentNoChecksum);

  const finalQRContent = qrContentNoChecksum + checksum.toUpperCase();
  return finalQRContent;
}

module.exports = {
  buildQR
};
