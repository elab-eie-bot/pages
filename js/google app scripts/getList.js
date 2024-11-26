function doGet() {
    const spreadsheetId = '1TQcqRRY9p4Mbl4_norbMn2GnEymNGiY-7w43XFzo8TY';
    const range = 'Asistencia!A:E'; // Ajusta el rango según tus necesidades
    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Asistencia');
    const data = sheet.getRange(range).getValues();
  
    
     const filteredData = data.filter(row => {
      return row[0] && row[1] && row[2] && !row[4]; // A, B y C tienen datos, E está vacía
    });
    
    console.info(JSON.stringify(filteredData));
    
    return ContentService.createTextOutput(JSON.stringify(filteredData)).setMimeType(ContentService.MimeType.JSON);
  }
  