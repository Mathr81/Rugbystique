module.exports = function convertToISO(date, time) {
    // Split the date string into year, month, and day
    const [year, month, day] = date.split('-');
   
    // Split the time string into hours and minutes
    const [hours, minutes] = time.split(':');
   
    // Create a new Date object with the specified date and time
    const newDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
   
    // Convert the new Date object to an ISO 8601 formatted string
    const isoDate = newDate.toISOString();
   
    return isoDate;
   }