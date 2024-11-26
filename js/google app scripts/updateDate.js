function doPost(e) {
  const spreadsheetId = '1TQcqRRY9p4Mbl4_norbMn2GnEymNGiY-7w43XFzo8TY';
  const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
  
  // Obtener el cuerpo de la solicitud en formato texto
  const params = e.postData.contents;  // El contenido es texto plano

  // Dividir la cadena de texto en parámetros clave-valor
  const data = {};
  params.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    data[key] = decodeURIComponent(value);  // Decodificar para manejar caracteres especiales
  });

  // Acceder al valor de `id` (la fecha la tomaremos del sistema)
  const id = data.id;  // id es el valor recibido

  // Obtener la fecha actual del sistema
  const currentDate = new Date();  // Fecha actual del sistema

  // Imprimir para depuración
  Logger.log('Received ID: ' + id);
  Logger.log('Current Date: ' + currentDate);

  const rowData = sheet.getDataRange().getValues(); // Obtener todos los datos de la hoja

  // Buscar el ID en la columna A (primer columna)
  for (let i = 0; i < rowData.length; i++) {
    // Comparar el valor de la columna A con el id recibido. Aseguramos que ambas sean del mismo tipo
    if (rowData[i][0] == id) {  // Cambié la comparación a "==" para permitir que se comparen correctamente números y cadenas
      sheet.getRange(i + 1, 5).setValue(currentDate);  // Actualiza la columna D con la fecha actual
      return ContentService.createTextOutput('Fecha actualizada con éxito');
    }
  }

  return ContentService.createTextOutput('ID no encontrado');
}
