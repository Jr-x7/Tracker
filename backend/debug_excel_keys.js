const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Book1.xlsx');
console.log(`Reading: ${filePath}`);

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

if (data.length > 0) {
    const firstRow = data[0];
    console.log("First Row Keys (wrapped in quotes to show whitespace):");
    Object.keys(firstRow).forEach(key => {
        console.log(`'${key}': '${firstRow[key]}'`);
    });
} else {
    console.log("No data found.");
}
