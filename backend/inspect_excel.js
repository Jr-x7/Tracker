const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Book1.xlsx');
console.log(`Reading file: ${filePath}`);

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`Total Rows: ${data.length}`);
console.log("First 3 Rows of Data:");
data.slice(0, 3).forEach((row, index) => {
    console.log(`Row ${index}:`, JSON.stringify(row, null, 2));
});
