const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Book1.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const statuses = [...new Set(data.map(d => d.Status))];
console.log("Unique Statuses:", statuses);
