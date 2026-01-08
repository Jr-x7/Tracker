const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../assets.xlsx');
console.log(`Reading file: ${filePath}`);

const fs = require('fs');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const output = {
        sheetName,
        totalRows: data.length,
        keys: data.length > 0 ? Object.keys(data[0]) : [],
        sampleData: data.slice(0, 3)
    };

    fs.writeFileSync('assets_structure.json', JSON.stringify(output, null, 2));
    console.log("Output written to assets_structure.json");

} catch (error) {
    console.error("Error reading file:", error.message);
}
