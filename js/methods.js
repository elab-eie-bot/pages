// Este archivo contiene las funciones para manejar la lógica de la aplicación

// Función para recargar el contenedor de estadísticas
async function reloadStatsContainer() {
  try {
    const data = await getCounts(); // Obtener los datos actualizados
    const container = document.getElementById('stats-container');
    container.innerHTML = ''; // Limpiar el contenedor
    createGroupStats(10, data.PendingRecords, data.AttendedRecords); // Crear estadísticas actualizadas
  } catch (error) {
    console.error("Error al recargar el contenedor de estadísticas:", error);
  }
}

// Función para recargar el contenedor de mensajes
async function reloadMessagesContainer() {
  try {
    const messages = await getGroups(); // Obtener los mensajes actualizados
    const container = document.getElementById('messages-container');
    container.innerHTML = ''; // Limpiar el contenedor
    messages.forEach(msg => createMessage(msg.id, msg.title, msg.body, msg.comments)); // Crear mensajes actualizados
  } catch (error) {
    console.error("Error al recargar el contenedor de mensajes:", error);
  }
}

// Configurar intervalos para recargar los contenedores periódicamente
setInterval(reloadStatsContainer, 10000); // Recargar cada 10 segundos
setInterval(reloadMessagesContainer, 10000); // Recargar cada 10 segundos

// Función para hacer la solicitud GET y obtener los grupos
// de Google Sheets
async function getGroups() {
  try {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbykDGdJMBaVQ9hrxXuv7N5jfaSRvLAupX7NOeN2TPT2JBoV9mZSQ-qQZgPIhvuQ5_k4/exec';
    const response = await fetch(scriptUrl);

    if (!response.ok) {
      throw new Error("Error en la solicitud");
    }

    const data = await response.json();

    // Crear la constante messages
    const messages = data.map(row => ({
      id: row[0],
      title: row[1], // Columna B
      body: row[2],   // Columna C
      comments: row[3]
      
    }));

    // Filtrar y ordenar messages
    const filteredMessages = messages.filter(mgs => mgs.body.trim() !== "");
    filteredMessages.sort((a, b) => a.id - b.id);

    return filteredMessages; // Retornar la constante messages

  } catch (error) {
    console.error("Error al obtener los datos:", error);
    return []; // Retornar un arreglo vacío en caso de error
  }
}

// Función para hacer la solicitud GET para obtener los conteos
// de registros de Google Sheets
async function getCounts() {
  try {
    // URL del script de Google Apps Script: Sistema-Turnos-Get-Stats
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbwOYGrKG_blKSAcPoTAInMBLmP7MueUYUyr_xTQi5_ivP6pgf9hpi8TN-YUfB7rHnOz/exec';
    const response = await fetch(scriptUrl);

    if (!response.ok) {
      throw new Error("Error en la solicitud");
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error al obtener los datos:", error);
    return []; // Retornar un arreglo vacío en caso de error
  }
}

// Función para hacer la solicitud POST para actualizar la fecha en Google Sheets
async function updateDateById(id) {
  try {
    console.log("Update group: ", id);
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzj5S6XaKWABESLs4GAcTKre10_XbuUOOFK5vZW20Pvk0Qxvz_6w0zEeIzObsXKXhad/exec';
    const formDataString = `id=${encodeURIComponent(id)}`;
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: formDataString
    });

    if (!response.ok) {
      throw new Error("Error en la solicitud de actualización");
    }

    const result = await response.json();
    console.log(result); // Verifica la respuesta del servidor
  } catch (error) {
    console.error("Error al actualizar la fecha:", error);
  }
}

// Función para crear el elemento de estadísticas
// y agregarlo al contenedor
function createGroupStats(registered, pending, attended) {
  const nav = document.createElement('nav');
  nav.className = "level";

  const stats = [
    { heading: 'Grupos Registrados', title: registered },
    { heading: 'Grupos Pendientes', title: pending },
    { heading: 'Grupos Atendidos', title: attended },
  ];

  stats.forEach(stat => {
    const levelItem = document.createElement('div');
    levelItem.className = "level-item has-text-centered";

    const innerDiv = document.createElement('div');

    const headingElement = document.createElement('p');
    headingElement.className = "heading";
    headingElement.textContent = stat.heading;

    const titleElement = document.createElement('p');
    titleElement.className = "title";
    titleElement.textContent = stat.title;

    innerDiv.appendChild(headingElement);
    innerDiv.appendChild(titleElement);
    levelItem.appendChild(innerDiv);
    nav.appendChild(levelItem);
  });

  const container = document.getElementById('stats-container'); // Cambia a tu contenedor
  if (container) {
    container.prepend(nav);
  } else {
    console.error('No se encontró el contenedor especificado.');
  }
}

// Función para crear un mensaje
function createMessage(id, title, body, comments) {
  const article = document.createElement('article');
  article.className = "message is-info"; // Cambiar a "is-dark" si prefieres

  const header = document.createElement('div');
  header.className = "message-header";
  header.innerHTML = `<p>${title}</p>`; // Solo muestra el título
  

  const bodyDiv = document.createElement('div');
  bodyDiv.className = "message-body";
  bodyDiv.innerHTML = `${body}:<br>${comments}`;

  // Crear un párrafo oculto que contiene el ID
  const hiddenParagraph = document.createElement('p');
  hiddenParagraph.style.display = 'none'; // Ocultar el párrafo
  hiddenParagraph.textContent = id; // Almacena el ID en el párrafo oculto
  hiddenParagraph.id = 'message-id'

  article.appendChild(header);
  article.appendChild(bodyDiv);
  article.appendChild(hiddenParagraph); // Agregar el párrafo oculto al artículo

  document.getElementById('messages-container').appendChild(article);
}


// Función para eliminar el primer mensaje y actualizar la fecha
async function deleteFirstMessage() {
  const messageContainer = document.getElementById('messages-container');
  const firstMessage = messageContainer.querySelector('article'); // Seleccionar el primer mensaje

  if (firstMessage) {
    // Obtener el ID del primer mensaje (está en un párrafo oculto)
    const messageId = firstMessage.querySelector('#message-id').textContent;

    // Enviar la solicitud de actualización a Google Apps Script
    await updateDateById(messageId); // Llamar a la función para actualizar la fecha en Google Sheets

    // Eliminar el primer mensaje
    messageContainer.removeChild(firstMessage);

    console.log("Primer mensaje eliminado y fecha actualizada.");
    window.location.reload();
  } else {
    console.log("No hay mensajes para eliminar.");
  }
}

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

  const data = await getCounts();
  const messages = await getGroups(); // Esperar a que se obtengan los mensajes
  createGroupStats(10, data.PendingRecords, 0); // Puedes cambiar estos números según los datos reales

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
  deleteButton.addEventListener('click', deleteFirstMessage);
});
