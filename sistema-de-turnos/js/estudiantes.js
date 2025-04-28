/**
 * Este archivo incluye los métodos que utiliza la página de estudiantes para enviar solicitudes correctamente.
 * 
 * @file estudiantes.js
 */

/**
 * Función para cargar las opciones del menú desplegable desde Google Apps Script.
 * 
 * @function loadDropdownOptions
 * @returns {void}
 * @throws {error} Si hay un error al obtener los datos de Google Sheets.
 */
  function loadDropdownOptions() {
    // Obtener los datos de Google Sheets a través de Google Apps Script
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwelWA-J3V2vvNPoQyY4_M_ID2pMzJfBvSQm_NgvWWbgk13wQ7R96RxzENKoLi-5r3C/exec';
    fetch(scriptURL)
      .then(response => response.json())
      .then(function(data) {
        const jsonData = data;
        getTables(jsonData); // Cargar las opciones una vez que se obtienen los datos
      })
      .catch(error => console.error("Error fetching dropdown data:", error));
  }
  
/**
 * Obtener las mesas disponibles desde el json y generar el menú desplegable.
 * 
 * @function getTables
 * @param {*} jsonData Información de las mesas obtenida desde Google Sheets.
 * @returns {void}
 */
  function getTables(jsonData) {
    let options = "";
    for (let mesa in jsonData) {
      options += `<a href="#" class="dropdown-item">${jsonData[mesa]}</a>`;
    }
    
    const tables = document.querySelector(".dropdown-content");
    tables.innerHTML = options; // Poblar el dropdown
  
    // Add click event listener to each dropdown item
    addDropdownItemListeners();
  }

/**
 * Añadir event listeners a los elementos del menú desplegable.
 * 
 * @function addDropdownItemListeners
 * @returns {void}
 */
  function addDropdownItemListeners() {
    const dropdownItems = document.querySelectorAll(".dropdown-item");
  
    dropdownItems.forEach((item) => {
      item.addEventListener("click", function (event) {
        event.preventDefault();
        selectTable(item);
      });
    });
  }

/**
 * Manejar la selección de la mesa y el envío del formulario.
 * 
 * @function selectTable
 * @param {HTMLElement} item Elemento del menú desplegable que fue seleccionado.
 * @returns {void}
 */
  function selectTable(item) {
    const selectedTable = item.textContent.trim();
    document.querySelector(".dropdown-trigger button span").textContent = selectedTable;
    document.getElementById("dropdown-menu3").classList.remove("is-active");
  }

/**
 * Abrir el menú desplegable y cargar las opciones.
 * 
 * @function openDropdown
 * @returns {void}
 */
  function openDropdown() {
    document.getElementById("dropdown-menu3").classList.toggle("is-active");
    loadDropdownOptions(); // Recargar las opciones al abrir el menú
  }

/**
 * Manejar el envío del formulario y la validación de datos. 
 * 
 * @function handleFormSubmission
 * @param {Event} event Evento de envío del formulario.
 * @returns {void}
 */
  function handleFormSubmission(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    
    // Obtener elementos del DOM
    const messageElement = document.getElementById("message");
    const submitButton = document.getElementById("submit-button");
    const form = document.getElementById("form");
  
    // Mostrar mensaje de progreso de envío
    messageElement.textContent = "Enviando...";
    messageElement.style.display = "block";
    submitButton.disabled = true;
  
    // Obtener la mesa seleccionada y los detalles del formulario
    let ayudaRevisión = document.querySelector('input[name="Ayuda o revision"]:checked')?.value || "";
    let detalles = document.querySelector('textarea[name="Notas"]').value;
    const selectedTable = document.querySelector(".dropdown-trigger button span").textContent.trim();
  
    // Validar que se haya seleccionado una mesa
    if (!selectedTable) {
      showMessage(messageElement, "Por favor, selecciona una mesa.", "red");
      submitButton.disabled = false;
      return;
    }
  
    // Prepararse para el envío de datos
    let formData = new FormData();
    formData.append("Numero de mesa", selectedTable);
    formData.append("Ayuda o revision", ayudaRevisión);
    formData.append("Notas", detalles);
  
    // Enviar los datos del formulario a Google Apps Script
    submitFormData(formData, messageElement, submitButton, form);
  }
  
/**
 * Enviar los datos del formulario a Google Apps Script.
 * 
 * @param {*} formData Datos del formulario a enviar.
 * @param {*} messageElement Elemento para mostrar mensajes al profesor.
 * @param {*} submitButton Elemento del botón de envío.
 * @param {*} form Formulario.
 * @returns {void}
 * @throws {error} Si hay un error al enviar los datos.
 */
  function submitFormData(formData, messageElement, submitButton, form) {
    // Cargar el script de Google Apps Script
    fetch('https://script.google.com/macros/s/AKfycbyFBRuxbXbuOJnsIdTGgX9vhFzdIDQaldkcspRFBDyur9jCbunAHXssne3tzxJJA3xz2A/exec', { 
      method: 'POST',
      body: formData
    })
    .then(response => response.text())
    .then(data => {
      // Indicar que el envío fue exitoso
      showMessage(messageElement, "Datos enviados correctamente!", "green");
      submitButton.disabled = false;
      form.reset();
      document.querySelector(".dropdown-trigger button span").textContent = "Seleccionar mesa"; // Resetear dropdown
  
      setTimeout(() => {
        messageElement.style.display = "none";
      }, 1000);
    })
    .catch(error => {
      console.error(error);
      showMessage(messageElement, "Ocurrió un error al enviar el formulario.", "red");
      submitButton.disabled = false;
    });
  }
  
  // Añadir display de mensaje
  function showMessage(messageElement, text, color) {
    messageElement.textContent = text;
    messageElement.style.backgroundColor = color;
    messageElement.style.color = "white";
    messageElement.style.display = "block";
  }
  
  // Establecer el evento de clic para abrir el menú desplegable
  document.getElementById("form").addEventListener("submit", handleFormSubmission);
  