function doGet() {
    const spreadsheetId = '1TQcqRRY9p4Mbl4_norbMn2GnEymNGiY-7w43XFzo8TY'; //
    const range = 'Asistencia!A:E'; // Ajusta el rango según tus necesidades
    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Asistencia');
    const data = sheet.getRange(range).getValues();
  
    // Inicializa contadores
    let totalRecords = 0;      // Registros con datos en A, B y C
    let attempRecords = 0;     // Registros con datos en A, B, C y D
    let pendingRecords = 0;     // Registros con datos en A, B y C pero sin datos en D
  
    // Recorre los datos, comenzando desde la fila 2 (índice 1)
    for (let i = 1; i < data.length; i++) { // Comienza en 1 para excluir la fila de encabezados
      const row = data[i];
  
      // Verifica si hay datos en las columnas A, B y C
      if (row[0] && row[1] && row[2]) { // A, B y C tienen datos
        totalRecords++; // Incrementa el total de registros
  
        if (row[4]) { // Columna D tiene datos
          attempRecords++; // Incrementa los registros atendidos
        } else { // Columna D está vacía
          pendingRecords++; // Incrementa los registros pendientes
        }
      }
    }
  
    // Crea un objeto con los resultados
    const result = {
      TotalRecords: totalRecords,
      AttempRecords: attempRecords,
      PendingRecords: pendingRecords
    };
  
    console.log(result)
  
    // Devuelve el resultado como JSON
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  