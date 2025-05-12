/**
 * Este archivo incluye los métodos que utiliza la página de profesores para actualizarse correctamente.
 * 
 * @file profesores.js
 */

/**
 * @function reloadStatsContainer
 * @description Esta función obtiene las estadísticas actuales y actualiza el contenedor de estadísticas en la página.
 * @returns {void}
 * @throws {error} Si hay un error al obtener las estadísticas o al actualizar el contenedor.
 */
async function reloadStatsContainer() {
  try {
    // Obtener estadísticas
    var stats = await getCount();

    // Actualizar el contenedor
    const container = document.getElementById('stats-container');

    // Vaciar el contenedor
    container.innerHTML = '';

    // Crear nuevo contenedor con las estadísticas actualizadas
    createGroupStats(stats.TotalOptions, stats.OpenRequests);
  } catch (error) {
    console.error("Error al recargar el contenedor de estadísticas:", error);
  }
}

/**
 * Obtener todos los mensajes actuales y recargar el contenedor de mensajes
 * 
 * @function reloadMessagesContainer
 * @returns {void}
 * @throws {error} Si hay un error al obtener los mensajes o al actualizar el contenedor.
 */
async function reloadMessagesContainer() {
  try {
    // Obtener los mensajes actualizados
    const messages = await getGroups();
    const container = document.getElementById('messages-container');

    // Limpiar el contenedor de mensajes
    container.innerHTML = '';

    // Crear mensajes actualizados
    messages.forEach(msg => createMessage(msg.id, msg.title, msg.body, msg.comments));
  } catch (error) {
    console.error("Error al recargar el contenedor de mensajes:", error);
  }
}

// Configurar intervalos para recargar los contenedores periódicamente
setInterval(reloadStatsContainer, 50000); // Recargar cada 10 segundos
setInterval(reloadMessagesContainer, 50000); // Recargar cada 10 segundos

/** 
 * Obtener las solicitudes actuales de Google Sheets
 * 
 * @function getGroups
 * @returns {void}
 * @throws {error} Si hay un error al obtener los datos de Google Sheets.
*/
async function getGroups() {
  try {
    // Llamar al script correcto de Google App Scripts
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzL8mQcHxcwcr5-FFKROOlu64w8294lOFNl9w2SDYUObq9ttfLclJPzcb1UOoOZOdLF/exec';
    const response = await fetch(scriptUrl);

    // Si se presenta algún error al llamarlo, indicarlo
    if (!response.ok) {
      throw new Error("Error en la solicitud");
    }

    const data = await response.json();

    // Crear la constante messages
    const messages = data.map(row => ({
      id: row[1],
      title: row[2], // Columna B
      body: row[3],   // Columna C
      comments: row[4]
      
    }));

    // Filtrar y ordenar messages
    const filteredMessages = messages.filter(mgs => mgs.body.trim() !== "");
    filteredMessages.sort((a, b) => a.id - b.id);

    // Retornar la constante messages
    return filteredMessages;

  } catch (error) {
    console.error("Error al obtener los datos:", error);
    return []; // Retornar un arreglo vacío en caso de error
  }
}

/**
 * Obtener la cantidad de solicitudes actuales
 * @function getCount
 * @returns {void}
 * @throws {error} Si hay un error al obtener los datos de Google Sheets.
 */
async function getCount() {
  var stats = {};
  try {
    // Esperar a que se obtenga la respuesta de Google Apps Script
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwelWA-J3V2vvNPoQyY4_M_ID2pMzJfBvSQm_NgvWWbgk13wQ7R96RxzENKoLi-5r3C/exec';
    const response = await fetch(scriptURL);
    const options = await response.json(); // Obtener los datos de fetch
    
    // Esperar a que se obtengan los mensajes
    const messages = await getGroups(); // Obtener los mensajes

    // Crear parámetros del objeto stats
    stats.TotalOptions = options.length;  // Total de opciones
    stats.OpenRequests = messages.length;  // Total de mensajes abiertos

    return stats; // Devolver los stats calculados
  } catch (error) {
    console.error('Error obteniendo los datos:', error);
    return stats; // En caso de error, devolver el objeto stats vacío
  }
}

async function deleteRowById(id) {
  try {
    console.log("Eliminar fila con ID: ", id); // Verifica el valor del ID
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbxErtRwNLn41PeN3_GOMtnu4kVAxygi5TJ9MxL_h0M02OUGviPAsIHTPbABb_LU042x/exec';
    const formDataString = `id=${encodeURIComponent(id)}`; // Enviar ID como parámetro
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded" // Enviar como formulario URL codificado
      },
      body: formDataString // Enviar el ID
    });

    if (!response.ok) {
      throw new Error("Error en la solicitud de eliminación");
    }

    const result = await response.text(); // Obtener respuesta como texto
    console.log(result); // Verifica la respuesta del servidor
  } catch (error) {
    console.error("Error al eliminar la fila:", error);
  }
}


/**
 * Crear elemento de estadísticas y agregarlas al contenedor
 * 
 * @function createGroupStats
 * @param {*} pending Cantidad de grupos pendientes, determinada por la cantidad de mesas con solicitudes abiertas
 * @returns {void}
 * @throws {error} Si hay un error al crear el elemento de estadísticas.
 */
function createGroupStats(registered, pending) {
  const nav = document.createElement('nav');
  nav.className = "level";

  // Crear los elementos de estadísticas
  const stats = [
    { heading: 'Grupos Pendientes', title: pending },
  ];

  // Agregar cada estadística al contenedor
  stats.forEach(stat => {
    const levelItem = document.createElement('div');
    levelItem.className = "level-item has-text-centered";

    const innerDiv = document.createElement('div'); // Crear un div interno para el encabezado y el título

    // Crear el encabezado
    const headingElement = document.createElement('p');
    headingElement.className = "heading"; // Asignar la clase "heading"
    headingElement.textContent = stat.heading; // Asignar el texto del encabezado

    // Crear el título
    const titleElement = document.createElement('p');
    titleElement.className = "title"; // Asignar la clase "title"
    titleElement.textContent = stat.title; // Asignar el texto del título

    // Agregar el encabezado y el título al div interno, y luego agregar el div interno al elemento de nivel
    innerDiv.appendChild(headingElement);
    innerDiv.appendChild(titleElement);
    levelItem.appendChild(innerDiv);
    nav.appendChild(levelItem);
  });

  const container = document.getElementById('stats-container'); // Obtener el contenedor de estadísticas
  
  // Limpiar el contenedor antes de agregar el nuevo nav
  if (container) {
    container.prepend(nav);
  } else {
    console.error('No se encontró el contenedor especificado.');
  }
}

/**
 * Crear un mensaje y agregarlo al contenedor de mensajes
 * 
 * @function createMessage
 * @param {*} id ID del mensaje
 * @param {*} title Título del mensaje
 * @param {*} body Cuerpo del mensaje
 * @param {*} comments Comentarios del mensaje
 * @returns {void} 
 * @throws {error} Si hay un error al crear el mensaje.
 */
function createMessage(id, title, body, comments) {
  // Crear el artículo
  const article = document.createElement('article');
  article.className = "message is-info"; // Agregar la clase "message is-info"

  // Crear el encabezado
  const header = document.createElement('div');
  header.className = "message-header"; // Agregar la clase "message-header"
  header.innerHTML = `<p>${title}</p>`; // Solo muestra el título
  
  // Crear el cuerpo del mensaje
  const bodyDiv = document.createElement('div');
  bodyDiv.className = "message-body"; // Agregar la clase "message-body"
  bodyDiv.innerHTML = `${body}:<br>${comments}`; // Mostrar el cuerpo del mensaje y los comentarios

  // Crear un párrafo oculto que contiene el ID
  const hiddenParagraph = document.createElement('p');
  hiddenParagraph.style.display = 'none'; // Ocultar el párrafo
  hiddenParagraph.textContent = id; // Almacena el ID en el párrafo oculto
  hiddenParagraph.id = 'message-id'; // Asignar un ID al párrafo oculto

  article.appendChild(header); // Agregar el encabezado al artículo
  article.appendChild(bodyDiv); // Agregar el cuerpo al artículo
  article.appendChild(hiddenParagraph); // Agregar el párrafo oculto al artículo

  // Agregar el artículo al contenedor de mensajes
  document.getElementById('messages-container').appendChild(article);
}

/**
 * Esperar a que el DOM esté completamente cargado antes de ejecutar el código
 * 
 * @function DOMContentLoaded
 * @returns {void}
 * @throws {error} Si hay un error al cargar el DOM o al obtener los mensajes.
 */
document.addEventListener("DOMContentLoaded", async function () {
  const loadingElement = document.getElementById('loading');

  loadingElement.style.display = 'block';

  const bodyChildren = document.body.children;
  for (let i = 0; i < bodyChildren.length; i++) {
    const child = bodyChildren[i];
    if (child !== loadingElement) {
      child.style.display = 'none'; // Ocultar otros elementos
    }
  }

  const messages = await getGroups(); // Esperar a que se obtengan los mensajes

  // Cargar estadísticas
  var stats = await getCount();
  createGroupStats(stats.TotalOptions, stats.OpenRequests); // Puedes cambiar estos números según los datos reales

  console.log(messages); // Para verificar que se obtienen los mensajes

  messages.forEach(msg => createMessage(msg.id, msg.title, msg.body, msg.comments));

  loadingElement.style.display = 'none';

  for (let i = 0; i < bodyChildren.length; i++) {
    const child = bodyChildren[i];
    if (child !== loadingElement) {
      child.style.display = ''; // Restablecer el estilo para mostrar el elemento
    }
  }
  // Agregar evento al botón de eliminar
  const deleteButton = document.getElementById('delete-group-button');
  deleteButton.addEventListener('click', () => {
    deleteRowById(2); // Enviar como string si el ID en la hoja es texto
    reloadMessagesContainer();
    reloadStatsContainer();
  });
});

  function toggleSoundIcon() {
    const icon = document.getElementById("sound-icon");
    const isVolume = icon.src.includes("volume.png");

    icon.src = isVolume ? "imgs/mute.png" : "imgs/volume.png";
  };