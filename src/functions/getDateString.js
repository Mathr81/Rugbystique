module.exports = function getDateString() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Add 1 because the getMonth() function returns a zero-based value
    const day = date.getDate();
   
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
   }