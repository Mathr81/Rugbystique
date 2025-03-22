function toEuropeanFormat(dateString) {
    // Convertit la date du format YYYY-MM-DD au format DD/MM/YYYY
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  
  function toISOFormat(dateString) {
    // Convertit la date du format DD/MM/YYYY au format YYYY-MM-DD
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }
  
  module.exports = {
    toEuropeanFormat,
    toISOFormat
  };
  