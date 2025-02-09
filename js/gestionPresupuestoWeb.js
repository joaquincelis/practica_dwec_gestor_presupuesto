"use strict"
import * as gestionP from "./gestionPresupuesto.js";



// Cargar escuchadores

document.getElementById("actualizarpresupuesto").addEventListener('click', actualizarPresupuestoWeb);
document.getElementById("anyadirgasto").addEventListener('click', nuevoGastoWeb);
document.getElementById("anyadirgasto-formulario").addEventListener('click', nuevoGastoWebFormulario);
document.getElementById("formulario-filtrado").addEventListener('submit', filtrarGastoWeb);
document.getElementById("guardar-gastos").addEventListener('click', guardarGastosWeb);
document.getElementById("cargar-gastos").addEventListener('click', cargarGastosWeb);
document.getElementById("cargar-gastos-api").addEventListener('click', cargarGastosApi);

// FUNCIONES

function mostrarDatoEnId(idElemento, valor) {
    document.getElementById(idElemento).innerHTML = `<p>${valor}</p>`;
}

function mostrarGastoWeb(idElemento, gasto) {

    let elemento = document.getElementById(idElemento); // Captura del div con id dado

    let divGasto = document.createElement("div");
    divGasto.className = "gasto";

    elemento.append(divGasto);

    let divDesc = document.createElement("div");
    divDesc.className = "gasto-descripcion";
    divDesc.textContent = `${gasto.descripcion}`;      

    let divFech = document.createElement("div");        
    divFech.className = "gasto-fecha";
    divFech.textContent = new Date(gasto.fecha).toLocaleString();              //  <--------------------------------------------

    let divVal = document.createElement("div");
    divVal.className = "gasto-valor";
    divVal.textContent = `${gasto.valor}`;

    let divEtiq = document.createElement("div");
    divEtiq.className = "gasto-etiquetas";

    // Generar los span de etiquetas iterando la prop etiquetas del objeto gasto
    for (let etiqueta of gasto.etiquetas) {
        let spanE = document.createElement("span");
        spanE.className = "gasto-etiquetas-etiqueta";
        spanE.textContent = ` ${etiqueta}`;
        divEtiq.append(spanE);

        // Crear evt borrar en span de etiquetas y el objeto manejador evt asociado
        let handler1 = new BorrarEtiquetasHandle();
        handler1.gasto = gasto;         // Referencia al objeto gasto en la propiedad gasto
        handler1.etiqueta = etiqueta;   // Referencia a la etiqueta en la propiedad etiqueta
        spanE.addEventListener("click", handler1); // Cargar escuchador en la etiqueta
    }

    // Crear la estructura pedida, con divs para mostrar las prop y el str de spanEtiquetas
    divGasto.append(divDesc, divFech, divVal, divEtiq);



    // Agrega botones en caso de que el id dado sea el del listado de gastos    
    if (idElemento === 'listado-gastos-completo') {
        // Crear boton de editar un gasto y el objeto manejador evt asociado
        let editorBtn = document.createElement("button");
        editorBtn.className = 'gasto-editar';
        editorBtn.textContent = 'Editar';

        let editorHandler = new EditarHandle();
        editorHandler.gasto = gasto;                  // Referencia al objeto gasto en la propiedad gasto
        editorBtn.addEventListener('click', editorHandler);     // Cargar escuchador

        // Crear boton de borrar un gasto y el objeto manejador evt asociado
        let borradorBtn = document.createElement("button");
        borradorBtn.className = 'gasto-borrar'
        borradorBtn.textContent = 'Borrar';

        let borradorHandler = new BorrarHandle();
        borradorHandler.gasto = gasto;              // Referencia al objeto gasto en la propiedad gasto
        borradorBtn.addEventListener('click', borradorHandler);     // Cargar escuchador


        // Crear boton de borrar un gasto API y el objeto manejador evt asociado
        let borradorAPIBtn = document.createElement("button");
        borradorAPIBtn.className = 'gasto-borrar-api'
        borradorAPIBtn.textContent = 'Borrar (API)';

        let borradorAPIHandler = new BorrarApiHandle();
        borradorAPIHandler.gasto = gasto;
        borradorAPIBtn.addEventListener('click', borradorAPIHandler);


        //Crear el boton de editar gasto por formulario
        let editFormBtn = document.createElement("button");
        editFormBtn.className = 'gasto-editar-formulario';
        editFormBtn.id = `gasto-editar-formulario-${gasto.id}`;
        editFormBtn.textContent = 'Editar (Formulario)';

        let formEditHandler = new EditarHandleFormulario();
        formEditHandler.gasto = gasto;
        editFormBtn.addEventListener('click', formEditHandler);


        // Colgar los botones al final del div .gasto
        divGasto.append(editorBtn, borradorBtn, borradorAPIBtn, editFormBtn);

    }

}

function mostrarGastosAgrupadosWeb(idElemento, agrup, periodo) {
    let elemento = document.getElementById(idElemento); // captura del div con id dado
    elemento.innerHTML = "";   // Vaciar el elemento              <--------------------------------   PRÁCTICA 10  ------------------------------------/
    let gastosAgrupados = ""; // contenedor de los datos agrupados con los pares clave-valor
    for (let key in agrup) {
        gastosAgrupados +=
            `<div class='agrupacion-dato'>
        <span class='agrupacion-dato-clave'> ${key}: </span>
        <span class='agrupacion-dato-valor'> ${agrup[key]} </span>
        </div>
        `;
    }
    // insertar toda la estructura en el div
    elemento.innerHTML +=
        `<div class='agrupacion'> 
            <h1>Gastos agrupados por ${periodo} </h1>
            ${gastosAgrupados}
        </div>
        `;

    // Estilos                      <---------------------------------------------------------   PRÁCTICA 10  ----------------------------------------
    elemento.style.width = "33%";
    elemento.style.display = "inline-block";
    // Crear elemento <canvas> necesario para crear la gráfica
    // https://www.chartjs.org/docs/latest/getting-started/
    let chart = document.createElement("canvas");
    // Variable para indicar a la gráfica el período temporal del eje X
    // En función de la variable "periodo" se creará la variable "unit" (anyo -> year; mes -> month; dia -> day)
    let unit = "";
    switch (periodo) {
        case "anyo":
            unit = "year";
            break;
        case "mes":
            unit = "month";
            break;
        case "dia":
        default:
            unit = "day";
            break;
    }

    // Creación de la gráfica
    // La función "Chart" está disponible porque hemos incluido las etiquetas <script> correspondientes en el fichero HTML
    const myChart = new Chart(chart.getContext("2d"), {
        // Tipo de gráfica: barras. Puedes cambiar el tipo si quieres hacer pruebas: https://www.chartjs.org/docs/latest/charts/line.html
        type: 'bar',
        data: {
            datasets: [
                {
                    // Título de la gráfica
                    label: `Gastos por ${periodo}`,
                    // Color de fondo
                    backgroundColor: "#555555",
                    // Datos de la gráfica
                    // "agrup" contiene los datos a representar. Es uno de los parámetros de la función "mostrarGastosAgrupadosWeb".
                    data: agrup
                }
            ],
        },
        options: {
            scales: {
                x: {
                    // El eje X es de tipo temporal
                    type: 'time',
                    time: {
                        // Indicamos la unidad correspondiente en función de si utilizamos días, meses o años
                        unit: unit
                    }
                },
                y: {
                    // Para que el eje Y empieza en 0
                    beginAtZero: true
                }
            }
        }
    });
    // Añadimos la gráfica a la capa
    elemento.append(chart);

}

//------------------------------------------------------------------------------------------------------------------------------------------------------------------

function repintar() {
    // Mostrar el presupuesto en div#presupuesto
    document.getElementById("presupuesto").innerHTML = "";
    mostrarDatoEnId("presupuesto", gestionP.mostrarPresupuesto());

    // Mostrar los gastos totales en div#gastos-totales
    document.getElementById("gastos-totales").innerHTML = "";
    mostrarDatoEnId("gastos-totales", gestionP.calcularTotalGastos());

    // Mostrar el balance total en div#balance-total
    document.getElementById("balance-total").innerHTML = "";
    mostrarDatoEnId("balance-total", gestionP.calcularBalance());

    // Limpiar divs de gastos agrupados                                     <----------     PRÁCTICA 9 ------------------------------
    document.getElementById("agrupacion-dia").innerHTML = "";
    document.getElementById("agrupacion-mes").innerHTML = "";
    document.getElementById("agrupacion-anyo").innerHTML = "";

    // Mostrar gastos agrupados por periodos: dia - mes - anyo
    mostrarGastosAgrupadosWeb("agrupacion-dia", gestionP.agruparGastos("dia"), "día");
    mostrarGastosAgrupadosWeb("agrupacion-mes", gestionP.agruparGastos("mes"), "mes");
    mostrarGastosAgrupadosWeb("agrupacion-anyo", gestionP.agruparGastos("anyo"), "año");

    // Limpiar divs de gastos filtrados
    document.getElementById("listado-gastos-filtrado-1").innerHTML = "";      //  <----------     CORRECCIONES FINALES   ------------------------------
    document.getElementById("listado-gastos-filtrado-2").innerHTML = "";
    document.getElementById("listado-gastos-filtrado-3").innerHTML = "";  
    document.getElementById("listado-gastos-filtrado-4").innerHTML = "";  


    // Borrar el contenido de div#listado-gastos-completo y repintar
    document.getElementById("listado-gastos-completo").innerHTML = "";
    for (let gasto of gestionP.listarGastos()) {
        mostrarGastoWeb('listado-gastos-completo', gasto);
    }

}

function actualizarPresupuestoWeb() {
    // Actualiza el presupuesto
    gestionP.actualizarPresupuesto(parseFloat(prompt("Introduzca un nuevo presupuesto:")));

    // Limpia y vuelve a pintar con los datos actuales incluyendo los cambios en el presupuesto
    repintar();
}

function nuevoGastoWeb() {
    // Pedir al usuario la información necesaria para crear un nuevo gasto
    const descripcion = prompt("Introduzca la descripción del nuevo gasto: ");
    const valor = parseFloat(prompt("Introduzca el valor del nuevo gasto: "));
    const fecha = Date.parse(prompt("Introduzca la fecha del nuevo gasto: "));
    const etiquetas = prompt("Introduzca las etiquetas del nuevo gasto separadas por , : ").split(',');

    // Crear un nuevo gasto
    gestionP.anyadirGasto(new gestionP.CrearGasto(descripcion, valor, fecha, etiquetas));

    // Limpia y vuelve a pintar con los nuevos datos
    repintar();
}

function EditarHandle() {
    this.handleEvent = function () {
        // Pedir al usuario la información necesaria para editar el gasto
        this.gasto.actualizarDescripcion(prompt("Introduzca la descripción nueva: "));
        this.gasto.actualizarValor(parseFloat(prompt("Introduzca el valor nuevo: ")));
        this.gasto.actualizarFecha(Date.parse(prompt("Introduzca la fecha nueva: ")));
        let etiquetas = prompt("Introduzca las nuevas etiquetas: ");
        if (typeof etiquetas != "undefined") {
            this.gasto.anyadirEtiquetas(etiquetas.split(','))
        }

        // Llamar a la función repintar para que se muestre la lista de gastos con los datos actualizados de la edición
        repintar();
    }
}

function BorrarHandle() {
    this.handleEvent = function (e) {
        // Borrar objeto gasto
        gestionP.borrarGasto(this.gasto.id);

        // Llamar a la función repintar para que se muestre la lista de gastos con los datos actualizados tras el borrado
        repintar();
    }
}

function BorrarEtiquetasHandle() {
    this.handleEvent = function (e) {
        // Borrar etiqueta sobre la que se actúa
        this.gasto.borrarEtiquetas(this.etiqueta);

        // Llamar a la función repintar para que se muestre la lista de gastos con los datos actualizados tras el borrado
        repintar();
    }

}



// _______________________________________________________________________________________________________________________________________


function nuevoGastoWebFormulario() {
    //Clonar el formulario desde el template y acceder a <form>
    let formulario = document.getElementById("formulario-template").content.cloneNode(true).querySelector("form");
    //Insertar el formulario en la página
    document.getElementById("controlesprincipales").append(formulario);

    //Cancelar el boton de añadir gasto
    document.getElementById('anyadirgasto-formulario').disabled = true;

    //Crear el objeto manejador de eventos del boton enviar
    let submitHandler = new SubmitHandle();
    formulario.addEventListener('submit', submitHandler);

    //Creación del objeto manejador de eventos del boton cancelar
    let cancelarHandler = new CancelarHandle();
    cancelarHandler.formulario = formulario;
    formulario.querySelector("button.cancelar").addEventListener('click', cancelarHandler);

    // Crear el objeto manejador de eventos del boton .gasto-enviar-api           <----- PRÁCTICA 9 -------------------------------
    let submitApiHandler = new SubmitApiHandle();
    submitApiHandler.formulario = formulario;
    formulario.querySelector("button.gasto-enviar-api").addEventListener('click', submitApiHandler);
}

function SubmitHandle() {
    this.handleEvent = function (e) {
        //Prevenir el comportamiento por defecto del formulario
        e.preventDefault();

        //Obtener datos del formulario
        let descripcion = e.currentTarget.descripcion.value;
        let valor = parseFloat(e.currentTarget.valor.value);
        let fecha = e.currentTarget.fecha.value;
        let etiquetas = e.currentTarget.etiquetas.value;

        //Introducir las etiquetas en el array etiquetas (Si estan definidas)
        if (typeof etiquetas !== 'undefined') {
            etiquetas = etiquetas.split(",");
        }

        //Crear el gasto con los datos recogidos
        let gasto = new gestionP.CrearGasto(descripcion, valor, fecha, [etiquetas]);

        //Añadir el gasto a la lista
        gestionP.anyadirGasto(gasto);

        //Llamar a la función repintar
        repintar();

        //Borrado de formulario
        e.currentTarget.remove();

        //Activar el boton de añadir gasto de nuevo
        document.getElementById('anyadirgasto-formulario').disabled = false;
    }
}

function CancelarHandle() {
    this.handleEvent = function () {
        //Eliminar el formulario creado.
        this.formulario.remove();

        //Activación del boton de añadir gastos de nuevo.
        document.getElementById("anyadirgasto-formulario").disabled = false;
    }
}

// ___________________________________________________________________________________________________________



function EditarHandleFormulario() {
    this.handleEvent = function (e) {
        //Clonar el formulario del template y acceder a <form>
        let formulario = document.getElementById("formulario-template").content.cloneNode(true).querySelector("form");
        //Insertar el formulario en la página
        // document.getElementById(`gasto-${this.gasto.id}`).append(formulario);
        e.currentTarget.parentElement.append(formulario);


        //Deshabilitar el boton de editar gasto
        document.getElementById(`gasto-editar-formulario-${this.gasto.id}`).disabled = true;

        //Capturar los datos del gasto y asignarlos al formulario
        formulario.descripcion.value = this.gasto.descripcion;
        formulario.valor.value = this.gasto.valor;
        let fecha = new Date(this.gasto.fecha);
        let fechaFormateda = fecha.toISOString().substring(0, 10);
        formulario.fecha.value = fechaFormateda;
        //Extraer del array etiquetas del gasto las etiquetas
        let etiquetasC = "";
        this.gasto.etiquetas.forEach((etiqueta, index) => {
            if (this.gasto.etiquetas.length - 1 === index) {
                etiquetasC += etiqueta;
            }
            else {
                etiquetasC += etiqueta + ", ";
            }
        });
        formulario.etiquetas.value = etiquetasC;

        //Crear el objeto manejador de eventos del boton cancelar
        let cancelarHandler = new CancelarEditHandle();
        cancelarHandler.formulario = formulario;
        cancelarHandler.gasto = this.gasto;
        formulario.querySelector("button.cancelar").addEventListener('click', cancelarHandler);

        //Crear el objeto manejador de eventos del boton enviar
        let submitHandler = new SubmitEditHandle();
        submitHandler.gasto = this.gasto;
        formulario.addEventListener('submit', submitHandler);

        // Crear el objeto manejador de eventos del boton .gasto-enviar-api                 <----------------   PRÁCTICA 9 ---------------------
        let editApiHandler = new EditApiHandle();
        editApiHandler.formulario = formulario;
        editApiHandler.gasto = this.gasto;
        formulario.querySelector("button.gasto-enviar-api").addEventListener('click', editApiHandler);

    }

    function SubmitEditHandle() {
        this.handleEvent = function (e) {

            //Prevenir el comportamiento por defecto del formulario
            e.preventDefault();

            //Actualizar las propiedades del gasto
            this.gasto.actualizarDescripcion(e.currentTarget.descripcion.value);
            this.gasto.actualizarValor(parseFloat(e.currentTarget.valor.value));
            this.gasto.actualizarFecha(e.currentTarget.fecha.value);

            //Comprobar si las nuevas etiquetas están definidas e introducirlas en array etiquetas para editar gasto.etiquetas
            let etiquetas = e.currentTarget.etiquetas.value;
            if (typeof etiquetas !== "undefined") {
                etiquetas = etiquetas.split(",");
            }
            this.gasto.etiquetas = etiquetas;

            //Llamar a la función repintar
            repintar();
        }
    }

    function CancelarEditHandle() {
        this.handleEvent = function () {
            //Borrar el formulario
            this.formulario.remove();

            //Habilitar el boton de editar gastos
            document.getElementById(`gasto-editar-formulario-${this.gasto.id}`).disabled = false;
        }
    }

}

function filtrarGastoWeb(e) {
    //Prevenir el evento por defecto
    e.preventDefault();

    //Recoger datos del formulario
    const formulario = document.getElementById("formulario-filtrado")
    const filtroDescripcion = formulario.elements["formulario-filtrado-descripcion"].value;
    const filtroValorMin = parseFloat(formulario.elements["formulario-filtrado-valor-minimo"].value);
    const filtroValorMax = parseFloat(formulario.elements["formulario-filtrado-valor-maximo"].value);
    const filtroFechaDesde = formulario.elements["formulario-filtrado-fecha-desde"].value;
    const filtroFechaHasta = formulario.elements["formulario-filtrado-fecha-hasta"].value;
    const filtroEtiqTiene = formulario.elements["formulario-filtrado-etiquetas-tiene"].value;

    //Crear el objeto de condiciones de filtrado
    const filtroObj = {
        descripcionContiene: (filtroDescripcion === "") ? undefined : filtroDescripcion,
        valorMinimo: (isNaN(filtroValorMin)) ? undefined : filtroValorMin,
        valorMaximo: (isNaN(filtroValorMax)) ? undefined : filtroValorMax,
        fechaDesde: (filtroFechaDesde === "") ? undefined : filtroFechaDesde,
        fechaHasta: (filtroFechaHasta === "") ? undefined : filtroFechaHasta,
        etiquetasTiene: (filtroEtiqTiene === "") ? undefined : filtroEtiqTiene
    }

    //Devolver un array de etiquetas válidas si el campo formulario-filtrado-etiquetas-tiene tiene datos
    if (typeof filtroObj.etiquetasTiene !== "undefined") {
        filtroObj.etiquetasTiene = gestionP.transformarListadoEtiquetas(filtroObj.etiquetasTiene);
    }

    //Filtrar gastos
    let gastosFiltrados = gestionP.filtrarGastos(filtroObj);

    //Borrar el listado de gastos anterior y mostrar los gastos filtrados actualizados
    document.getElementById("listado-gastos-completo").innerHTML = "";

    for (let gasto of gastosFiltrados) {
        mostrarGastoWeb("listado-gastos-completo", gasto);
    }
}

// ------------------------- Almacenando datos en el navegador  ---------------------------------------------------

function guardarGastosWeb(e) {
    //Pasar a JSON el listado de gastos y almacenarlo en localStorage
    localStorage.GestorGastosDWEC = JSON.stringify(gestionP.listarGastos());
}

function cargarGastosWeb(e) {
    //Carga el listado de gastos desde la clave de almacenamiento
    //Si localStorage no tiene la clave, carga un array vacío

    let gastosLocal = [];
    if (localStorage.hasOwnProperty("GestorGastosDWEC")) gastosLocal = JSON.parse(localStorage.getItem('GestorGastosDWEC'));
    gestionP.cargarGastos(gastosLocal);

    //Llamar a repintar
    repintar();
}


//      PRACTICA 9   ----    Manejadores de evt    <--------------------------------------------------------------------------------------

// Función manejadora de eventos del evento click del botón cargar-gastos-api

async function cargarGastosApi() {
    // Comprobar el valor del campo del nombre y si esta vacío volver a solicitar al usuario
    if (document.getElementById("nombre_usuario").value.length === 0) {
        const usuario = prompt("Introduzca el nombre de usuario");
        document.getElementById("nombre_usuario").value = usuario;
    }

    // Obtener mediante fetch el listado de gastos a través de la API de servidor (método de petición GET)
    // La URL se crea con el valor introducido en el campo nombre_usuario
    let response = await fetch(
        `https://suhhtqjccd.execute-api.eu-west-1.amazonaws.com/latest/${document.getElementById("nombre_usuario").value}`,
        { method: 'GET' })

    // Comprobar estado de respuesta
    // Si es OK, formatear los datos y llamar a la función cargarGastos para actualizar el array de gastos
    // Llamar a la función repintar para que se muestren correctamente en el HTML
    if (response.ok) {
        const gastosJSON = await response.json();
        gestionP.cargarGastos(gastosJSON);
        repintar();
    }
    else {
        console.log(`Error de HTTP -> ${response.status}`);
    }
}


// Función de primera clase creadora del objeto manejador borradorAPIHandler de los botones .gasto-borrar-api 

function BorrarApiHandle() {
    this.handleEvent = async function () {
        // Comprobar el valor del campo del nombre y si esta vacío volver a solicitar al usuario
        if (document.getElementById("nombre_usuario").value.length === 0) {
            const usuario = prompt("Introduzca el nombre de usuario");
            document.getElementById("nombre_usuario").value = usuario;
        }
        // Borrar el gasto actual mediante fetch en la API (método de petición DELETE)
        // La URL se crea con el valor introducido en el campo nombre_usuario y el id del gasto actual
        let response = await fetch(
            `https://suhhtqjccd.execute-api.eu-west-1.amazonaws.com/latest/${document.getElementById("nombre_usuario").value}/${this.gasto.gastoId}`, {
            method: 'DELETE'
        });
        // Llamar a la función cargarGastosApi para actualizar la lista en la página
        if (response.ok) {
            cargarGastosApi();
        }
        else {
            console.log(`Error de HTTP -> ${response.status}`);
        }



    }
}


// Función de primera clase creadora del objeto manejador submitApiHandler del botón .gasto-enviar-api

function SubmitApiHandle() {
    this.handleEvent = async function () {
        // Comprobar el valor del campo del nombre y si esta vacío volver a solicitar al usuario
        if (document.getElementById("nombre_usuario").value.length === 0) {
            const usuario = prompt("Introduzca el nombre de usuario");
            document.getElementById("nombre_usuario").value = usuario;
        }

        // Obtener los datos del futuro gasto desde el valor de los inputs del formulario y crear un objeto con esos valores
        let gasto = {
            descripcion: this.formulario.descripcion.value,
            valor: this.formulario.valor.value,
            fecha: this.formulario.fecha.value,
            etiquetas: (typeof this.formulario.etiquetas.value !== "undefined") ? this.formulario.etiquetas.value.split(",") : undefined,
            id: id
        }

        // Subir el gasto actual mediante fetch a la API (método de petición POST). Línea inicial + cabecera + cuerpo de la petición
        // Formateo del objeto al incluirlo en el cuerpo de la petición
        let response = await fetch(
            `https://suhhtqjccd.execute-api.eu-west-1.amazonaws.com/latest/${document.getElementById("nombre_usuario").value}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(gasto)
        });
        // Llamar a la función cargarGastosApi para actualizar la lista en la página
        if (response.ok) {
            id++;
            cargarGastosApi();
        }
    }
}

// Función de primera clase creadora del objeto manejador editApiHandler del botón .gasto-enviar-api

function EditApiHandle() {
    this.handleEvent = async function () {
        // Comprobar el valor del campo del nombre y si esta vacío volver a solicitar al usuario
        if (document.getElementById("nombre_usuario").value.length === 0) {
            const usuario = prompt("Introduzca el nombre de usuario");
            document.getElementById("nombre_usuario").value = usuario;
        }

        // Actualizar los datos del gasto
        this.gasto.actualizarDescripcion(this.formulario.descripcion.value);
        this.gasto.actualizarValor(this.formulario.valor.value);
        this.gasto.actualizarFecha(this.formulario.fecha.value);
        this.gasto.etiquetas = (typeof this.formulario.etiquetas.value !== "undefined") ? this.formulario.etiquetas.value.split(",") : this.gasto.etiquetas;


        // Editar el gasto actual mediante fetch a la API (método de petición PUT)
        // Formateo del objeto al incluirlo en el cuerpo de la petición
        let response = await fetch(
            `https://suhhtqjccd.execute-api.eu-west-1.amazonaws.com/latest/${document.getElementById("nombre_usuario").value}/${this.gasto.gastoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(this.gasto)
        });
        // Llamar a la función cargarGastosApi para actualizar la lista en la página
        if (response.ok) {
            cargarGastosApi();
        }
        else {
            console.log(`Error de HTTP -> ${response.status}`);
        }
    }
}



export {
    mostrarDatoEnId,
    mostrarGastoWeb,
    mostrarGastosAgrupadosWeb
}

