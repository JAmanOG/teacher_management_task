export const baseUrl = process.env.NEXT_NODE_ENV === 'development' 
? 'http:teacher-management-gydfaaesaaebe8hr.centralindia-01.azurewebsites.net/api/v1' // Adjust port to match your backend
: process.env.NEXT_BASE_URL || '';

