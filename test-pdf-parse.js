// Simple test file for pdf-parse
const fs = require('fs');
const path = require('path');

// Try different import methods
async function testPdfParse() {
  try {
    console.log('=== Testing pdf-parse module ===');
    
    // Test with require
    console.log('\n1. Testing with require:');
    const pdfParseRequire = require('pdf-parse');
    console.log('Type:', typeof pdfParseRequire);
    console.log('Keys:', Object.keys(pdfParseRequire));
    
    // Test with dynamic import
    console.log('\n2. Testing with dynamic import:');
    const pdfParseImport = await import('pdf-parse');
    console.log('Type:', typeof pdfParseImport);
    console.log('Keys:', Object.keys(pdfParseImport));
    
    // Try to find a sample PDF file
    const files = fs.readdirSync('.');
    const pdfFile = files.find(f => f.endsWith('.pdf'));
    
    if (pdfFile) {
      console.log(`\nFound PDF file: ${pdfFile}`);
      const dataBuffer = fs.readFileSync(pdfFile);
      
      // Try parsing with require version
      try {
        console.log('\nParsing with require version:');
        const result1 = await pdfParseRequire(dataBuffer);
        console.log('Success! Text length:', result1.text.length);
      } catch (e) {
        console.error('Error parsing with require version:', e);
        
        // Try with new
        try {
          console.log('\nTrying with new keyword:');
          if (pdfParseRequire.PDFParse) {
            const parser = new pdfParseRequire.PDFParse();
            const result = await parser.parse(dataBuffer);
            console.log('Success with new PDFParse! Text length:', result.text.length);
          }
        } catch (e2) {
          console.error('Error with new PDFParse:', e2);
        }
      }
      
      // Try parsing with import version
      try {
        console.log('\nParsing with import version:');
        const parseFunction = pdfParseImport.default || pdfParseImport;
        const result2 = await parseFunction(dataBuffer);
        console.log('Success! Text length:', result2.text.length);
      } catch (e) {
        console.error('Error parsing with import version:', e);
      }
    } else {
      console.log('\nNo PDF file found for testing. Place a PDF file in the project root.');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPdfParse();