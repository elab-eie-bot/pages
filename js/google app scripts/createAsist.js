function doPost(e) {
  // Obtener los datos del formulario
  var params = e.parameter;

  // Definir la hoja de cálculo donde se guardarán los datos
  var sheet = SpreadsheetApp.openById('1TQcqRRY9p4Mbl4_norbMn2GnEymNGiY-7w43XFzo8TY').getSheetByName('Asistencia');

  // Obtener el último número registrado en la columna A (sin contar la primera fila)
  var lastRow = sheet.getLastRow();
  var lastId = 0;

  // Verificar si hay registros previos (sin contar la primera fila)
  if (lastRow > 1) {
    // Obtener todos los valores de la columna A, comenzando desde la segunda fila
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    lastId = Math.max.apply(null, ids.flat());
  }

  // Generar el nuevo ID (último ID + 1)
  var newId = lastId + 1;

  // Obtener los datos del formulario
  var mesa = params['Numero de mesa']; // Este es el valor de la mesa (columna B)
  var ayudaRevisión = params['Ayuda o revision']; // Ayuda o Revisión (columna C)
  var detalles = params['Notas']; // Detalles (columna D)

  // Validar si la mesa ya existe y si la columna E está vacía
  var data = sheet.getDataRange().getValues(); // Obtener todos los datos de la hoja
  for (var i = 1; i < data.length; i++) { // Comenzar desde la segunda fila
    var existingMesa = data[i][1]; // Columna B (índice 1)
    var fechaAtencion = data[i][4]; // Columna E (índice 4)

    if (existingMesa === mesa && fechaAtencion === '') {
      // Si ya existe una mesa con la misma información y la fecha de atención está vacía, no insertar
      return ContentService.createTextOutput("Error: Ya existe un registro para esta mesa sin fecha de atención.");
    }
  }

  // Si pasa la validación, insertar el nuevo registro
  sheet.appendRow([newId, mesa, ayudaRevisión, detalles, '']); // Deja la columna E vacía

  // Retornar una respuesta al usuario
  return ContentService.createTextOutput("Datos registrados correctamente.");
}
