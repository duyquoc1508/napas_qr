function generateQRString (objProps) {
  let result = '';
  Object.values(objProps).forEach(prop => {
    if (!prop.value) return '';
    const isObject = (typeof prop.value === 'object');
    const valueString = isObject ? generateQRString(prop.value) : String(prop.value);
    if (valueString) {
      result += prop.id;
      result += valueString.length.toString().padStart(2, '0')
      result += valueString
    }
  })
  return result;
};

module.exports = {
  generateQRString
};
