// Simpler test for pdf-parse
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Try to read the PDF file
const dataBuffer = fs.readFileSync('test.pdf');

// Log the module
console.log('PDF Parse module type:', typeof pdfParse);
console.log('PDF Parse module keys:', Object.keys(pdfParse));

// Try all possible ways to use the module
async function testAllWays() {
  console.log('\n=== Testing all ways to use pdf-parse ===');
  
  try {
    // Way 1: Direct call
    console.log('\nWay 1: Direct call');
    const result = await pdfParse(dataBuffer);
    console.log('Success! Text:', result.text);
    return; // If this works, return early
  } catch (e) {
    console.error('Way 1 failed:', e.message);
  }

  try {
    // Way 2: Default export
    console.log('\nWay 2: Default export');
    const result = await pdfParse.default(dataBuffer);
    console.log('Success! Text:', result.text);
    return; // If this works, return early
  } catch (e) {
    console.error('Way 2 failed:', e.message);
  }

  try {
    // Way 3: Use PDFParse as constructor
    console.log('\nWay 3: Use PDFParse as constructor');
    const parser = new pdfParse.PDFParse(dataBuffer);
    const result = await parser.parse();
    console.log('Success! Text:', result.text);
    return; // If this works, return early
  } catch (e) {
    console.error('Way 3 failed:', e.message);
  }

  try {
    // Way 4: Use PDFParse as function
    console.log('\nWay 4: Use PDFParse as function');
    const result = await pdfParse.PDFParse(dataBuffer);
    console.log('Success! Text:', result.text);
    return; // If this works, return early
  } catch (e) {
    console.error('Way 4 failed:', e.message);
  }
  
  console.log('\nAll attempts failed :(');
}

testAllWays();