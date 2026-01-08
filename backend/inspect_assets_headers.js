const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\PnRIn\\OneDrive\\Desktop\\TRACKER\\assets.xlsx';

if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
}

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Get headers (first row)
const headers = [];
const range = XLSX.utils.decode_range(sheet['!ref']);
for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: C })];
    headers.push(cell ? cell.v : undefined);
}

console.log("EXACT HEADERS IN ASSETS.XLSX:");
console.log(JSON.stringify(headers, null, 2));

// Print first row of data to see values
const data = XLSX.utils.sheet_to_json(sheet).slice(0,1);
console.log("\nSAMPLE DATA:");
console.log(JSON.stringify(data, null, 2));
