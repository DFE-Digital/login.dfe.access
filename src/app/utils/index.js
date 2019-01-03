const leftPad = (value, length, paddingValue) => {
  const temp = new Array(length + 1).join(paddingValue) + value;
  return temp.substr(temp.length - length);
};

const formatDate = (date) => {
  if (date === undefined) {
    return undefined;
  }

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();

  const pad = (value) => leftPad(value, 2, '0');

  return `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:${pad(seconds)}Z`;
};

module.exports = {
  leftPad,
  formatDate,
};
