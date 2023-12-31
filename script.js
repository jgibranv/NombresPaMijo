import {CombiUni, CombiDuo} from "./clases.js";

var apellido = "";
// const arrNombres = ["Dante", "Magnus", "Franz", "Marco", "Dominik", "Leo", "Bastian", "Ezzio", "Drakken", "Bjorn", "Anton", "Giovanni", "Luka", "Ander", "Tiago", "Bruno"];
const arrNombres = [];
arrNombres.sort();
var filtroEstado = "Todo"; // Valor para utilizar en el filtro de la tabla. Valores: Todo, Activos, Rechazados
const arrCombi = []; // arreglo en donde se depositan los objetos de que representan todas las combinaciones de los nombres, incluyendo las combinaciones de un nombre
var tabla = document.getElementById("combinaciones"); //Obtiene la tabla donde se muestran los nombres
var msg = new SpeechSynthesisUtterance(); // Objeto del api para reproducir el texto en audio
msg.pitch = 0.5; // From 0 to 2
msg.lang = 'es-mx';

function crea_arreglo_objetos() {
	arrCombi.length = 0; // Inicia el arreglo vacio
	// Agrega los primeros nombres unicos al arreglo de objetos arrCombi
	arrNombres.forEach(function(nombre, indice){
		arrCombi[indice] = new CombiUni(nombre);
	});

	// Agrega las combinaciones al arreglo arrCombi
	// El total de objetos agregados es igual al total de nombres * total de nombres menos uno entre dos. n*(n-1)/2
	// Esto con el fin de evitar incluir combinaciones repetidas (en las combinaciones no importa el orden de los elementos)
	for (var i=0; i<arrNombres.length; i++) {
		for (var j=0; j<arrNombres.length; j++) {
			if ( j > i ) { // Esta expresion evita que se repitan los elementos
				arrCombi.push(new CombiDuo(arrNombres[i], arrNombres[j]));
			}
		}
	}
}
crea_arreglo_objetos();

// Muestra los nombres en el card
function muestra_nombres() {
	var htmlNombres = "";
	arrNombres.forEach(function(nombre, indice) {
		htmlNombres += "<div class='input-group'><div class='input-group-text' id='btnGroupAddon'>"+nombre+"</div><button class='btnX' id='btnX"+indice+"'>x</button></div> ";
	});
	document.getElementById("nombres").innerHTML = htmlNombres;
}

// Pone los nombres en la tabla mientras arregla los renglones correspondientes
function crea_tabla(tab) {
	arrCombi.forEach(function(objeto, indice){
		var tbody = tab.getElementsByTagName("tbody")[0];
		var row = tbody.insertRow(-1);
		row.id = "tr"+indice;
		var celda1 = row.insertCell(0);
		var celda2 = row.insertCell(1);
		var celda3 = row.insertCell(2);
		var celda4 = row.insertCell(3);

		if (objeto instanceof CombiUni) {
			celda1.innerHTML = indice+1+"<button id='habla"+indice+"' class='habla btn btn-sm btn-light'>¡Habla!</button>";
			celda2.innerHTML = objeto.nombre;
		}
		if (objeto instanceof CombiDuo) {
			celda1.innerHTML = indice+1+ " <button type='button' id='cambiaOrden"+indice+"' class='cambio btn btn-light bi bi-arrow-left-right'></button> <button id='habla"+indice+"' class='habla btn btn-sm btn-light'>¡Habla!</button>";
			celda2.innerHTML = objeto.pNombre;
			celda3.innerHTML = objeto.sNombre;
		}

		carga_botones(objeto, indice);
	});
}
crea_tabla(tabla);

// Escucha los clicks a los botones de la tabla y ejecuta la funcion correspondiente al boton
tabla.addEventListener('click', (event) => {
	const isButton = event.target.nodeName === 'BUTTON';
	if (!isButton) {
	return;
	}
	// Cambia el orden de las combinaciones de dos nombres
	if (event.target.classList.contains("cambio")) {
		cambia_orden(event.target.id);
	}
	// Cambia el estatus de las combinaciones de un nombre
	if (event.target.classList.contains("cambiaEstatusUOrden")) {
		cambia_estatus_unico_orden(event.target.id);
	}
	// Cambia el estatus del primer orden de las combinaciones de dos nombres
	if (event.target.classList.contains("cambiaEstatusPOrden")) {
		cambia_estatus_primer_orden(event.target.id);
	}
	// Cambia el estatus del segundo orden de las combinaciones de dos nombres
	if (event.target.classList.contains("cambiaEstatusSOrden")) {
		cambia_estatus_segundo_orden(event.target.id);
	}
	if (event.target.classList.contains("habla")) {
		habla(event.target.id);
	}
})
// Cambia el orden de las combinaciones de dos nombres
function cambia_orden(id) {
	var id = id.slice(11);
	var celda1 = document.getElementById('tr'+id).cells[1].innerHTML;
	var celda2 = document.getElementById('tr'+id).cells[2].innerHTML;
	var celdaTemp = "";
	celdaTemp = document.getElementById('tr'+id).cells[1].innerHTML;
	document.getElementById('tr'+id).cells[1].innerHTML = document.getElementById('tr'+id).cells[2].innerHTML;
	document.getElementById('tr'+id).cells[2].innerHTML = celdaTemp;
}

// Cambia el estatus de las combinaciones de un nombre
function cambia_estatus_unico_orden(id) {
	var id = id.slice(16);
	arrCombi[id].activo ? arrCombi[id].activo=false : arrCombi[id].activo=true
	carga_botones(arrCombi[id], id);

	// Colorea el renglon si el nombre ha sido rechazado
	if ( arrCombi[id].activo == false ) {
		document.getElementById("tr"+id).classList.add('table-danger');
	} else {
		if ( document.getElementById("tr"+id).classList.contains("table-danger") ) {
			document.getElementById("tr"+id).classList.remove("table-danger");
		}
	}
}
// Cambia el estatus del primer orden de las combinaciones de dos nombres
function cambia_estatus_primer_orden(id) {
	var id = id.slice(16);
	arrCombi[id].primerOrdenActivo ? arrCombi[id].primerOrdenActivo=false : arrCombi[id].primerOrdenActivo=true
	carga_botones(arrCombi[id], id);

	// Colorea el renglon si ambos ordenes de la combinacion han sido rechazados
	if (arrCombi[id].primerOrdenActivo == false && arrCombi[id].segundoOrdenActivo == false ) {
		document.getElementById("tr"+id).classList.add("table-danger");
	} else if( arrCombi[id].primerOrdenActivo == false || arrCombi[id].segundoOrdenActivo == false ) {
		if (document.getElementById("tr"+id).classList.contains("table-danger")) {
			document.getElementById("tr"+id).classList.remove("table-danger");
		}
		document.getElementById("tr"+id).classList.add("table-warning");
	}else {
		if (document.getElementById("tr"+id).classList.contains("table-danger")) {
			document.getElementById("tr"+id).classList.remove("table-danger");
		}
		if (document.getElementById("tr"+id).classList.contains("table-warning")) {
			document.getElementById("tr"+id).classList.remove("table-warning");
		}
	}
}
// Cambia el estatus del segundo orden de las combinaciones de dos nombres
function cambia_estatus_segundo_orden(id) {
	var id = id.slice(16);
	arrCombi[id].segundoOrdenActivo ? arrCombi[id].segundoOrdenActivo=false : arrCombi[id].segundoOrdenActivo=true
	carga_botones(arrCombi[id], id);

	// Colorea el renglon si ambos ordenes de la combinacion han sido rechazados
	if (arrCombi[id].primerOrdenActivo == false && arrCombi[id].segundoOrdenActivo == false ) {
		document.getElementById("tr"+id).classList.add("table-danger");
	} else if( arrCombi[id].primerOrdenActivo == false || arrCombi[id].segundoOrdenActivo == false ) {
		if (document.getElementById("tr"+id).classList.contains("table-danger")) {
			document.getElementById("tr"+id).classList.remove("table-danger");
		}
		document.getElementById("tr"+id).classList.add("table-warning");
	}else {
		if (document.getElementById("tr"+id).classList.contains("table-danger")) {
			document.getElementById("tr"+id).classList.remove("table-danger");
		}
		if (document.getElementById("tr"+id).classList.contains("table-warning")) {
			document.getElementById("tr"+id).classList.remove("table-warning");
		}
	}
}

// Reproduce el audio del nombre
function habla(id) {
	var id = id.slice(5);
	var celda1 = document.getElementById('tr'+id).cells[1].innerHTML;
	var celda2 = document.getElementById('tr'+id).cells[2].innerHTML;
	msg.text = celda1+" "+celda2+" "+apellido;
	window.speechSynthesis.speak(msg);
}

// Carga los botones de activar o rechazar las combinaciones de nombres
function carga_botones(objeto, id) {
	if (objeto instanceof CombiUni){
		if(objeto.activo) {
			document.getElementById('tr'+id).cells[3].innerHTML = "<button type='button' id='btnCambiaEstatus"+id+"' class='cambiaEstatusUOrden btn btn-outline-danger btn-sm'>Rechazar</button>";
		} else {
			document.getElementById('tr'+id).cells[3].innerHTML = "<button type='button' id='btnCambiaEstatus"+id+"' class='cambiaEstatusUOrden btn btn-outline-success btn-sm'>Activar</button>";
		}
	}

	if (objeto instanceof CombiDuo){
		var contCelda4 = "";
		if(objeto.primerOrdenActivo) {
			contCelda4 += " <button type='button' id='btnCambiaEstatus"+id+"' class='cambiaEstatusPOrden btn btn-outline-danger btn-sm'>Rechazar Primer Orden</button>";
		} else {
			contCelda4 += " <button type='button' id='btnCambiaEstatus"+id+"' class='cambiaEstatusPOrden btn btn-outline-success btn-sm'>Activar Primer Orden</button>";
		}
		if(objeto.segundoOrdenActivo) {
			contCelda4 += " <button type='button' id='btnCambiaEstatus"+id+"' class='cambiaEstatusSOrden btn btn-outline-danger btn-sm'>Rechazar Segundo Orden</button>";
		} else {
			contCelda4 += " <button type='button' id='btnCambiaEstatus"+id+"' class='cambiaEstatusSOrden btn btn-outline-success btn-sm'>Activar Segundo Orden</button>";
		}
		document.getElementById('tr'+id).cells[3].innerHTML = contCelda4;
	}
}

document.getElementById("buscador").addEventListener("keyup", filtra);

// Filtra la tabla en base al texto que se dio en el cajon pero tambien en base al filtro del boton que esta al lado
function filtra() {
	var input, filtro, table, tr, td1, td2, i, txtValue1, txtValue2;
	input = document.getElementById("buscador");
	filtro = input.value.toUpperCase();
	table = document.getElementById("combinaciones");
	tr = table.getElementsByTagName("tr");

	// Loop through all table rows, and hide those who don't match the search query
	for (i = 0; i < tr.length; i++) {
		td1 = tr[i].getElementsByTagName("td")[1];
		td2 = tr[i].getElementsByTagName("td")[2];
		if (td1) {
			txtValue1 = td1.textContent || td1.innerText;
			txtValue2 = td2.textContent || td2.innerText;
			if (txtValue1.toUpperCase().indexOf(filtro) > -1 || txtValue2.toUpperCase().indexOf(filtro) > -1) {
				switch (filtroEstado) {
				case "Todo":1
					tr[i].style.display = "";
					break;
				case "Activos":
					if( arrCombi[i-1] instanceof CombiUni && arrCombi[i-1].activo == true) {
						tr[i].style.display = "";
					} else if( arrCombi[i-1] instanceof CombiDuo && ( arrCombi[i-1].primerOrdenActivo == true || arrCombi[i-1].segundoOrdenActivo == true )) {
						tr[i].style.display = "";
					} else {
						tr[i].style.display = "none";
					}
					break;
				case "Rechazados":
					if( arrCombi[i-1] instanceof CombiUni && arrCombi[i-1].activo == false) {
						tr[i].style.display = "";
					} else if( arrCombi[i-1] instanceof CombiDuo && ( arrCombi[i-1].primerOrdenActivo == false && arrCombi[i-1].segundoOrdenActivo == false )) {
						tr[i].style.display = "";
					} else {
						tr[i].style.display = "none";
					}
					break;
				}
			} else {
				tr[i].style.display = "none";
			}
		}
	}
}

// Los siguientes 3 addEventListener cambian el valor de filtroEstado segun el boton que se haya seleccionado
document.getElementById("filtraTodo").addEventListener('click', function() {
	filtroEstado = "Todo";
	filtra();
})
document.getElementById("filtraActivos").addEventListener('click', function() {
	filtroEstado = "Activos";
	filtra();
})
document.getElementById("filtraRechazados").addEventListener('click', function() {
	filtroEstado = "Rechazados";
	filtra();
})

// Corrobora que el navegador soporte texto a habla
if ('speechSynthesis' in window) {
 // Speech Synthesis supported
}else{
  // Speech Synthesis Not Supported
  alert("Sorry, your browser doesn't support text to speech!");
}

// Esucha al boton que guarda el apellido dado por el usuario
document.getElementById("btnApellido").addEventListener('click', function() {
	apellido = document.getElementById("apellido").value;
	document.getElementById("tituloApellido").innerHTML = apellido;
	alert("Apellido guardado\n"+apellido);
});

document.getElementById("agregarNombre").addEventListener('click', agregar_nombre);

function agregar_nombre() {
	let nom = document.getElementById("inputNombre").value;
	if ( nom ) {
		nom = nom.toLowerCase();
		nom = nom.charAt(0).toUpperCase() + nom.slice(1);
		var tab = document.getElementById('combinaciones');
		arrNombres[arrNombres.length] = nom;
		document.getElementById("inputNombre").value = "";
		arrNombres.sort();
		muestra_nombres();
		crea_arreglo_objetos();
		tab.getElementsByTagName('tbody')[0].innerHTML = "";
		crea_tabla(tab);
	}
}

document.getElementById("nombres").addEventListener('click', eliminar_nombre);

function eliminar_nombre(e) {
	if ( e.target.classList.contains("btnX") ) {
		let id = e.target.id.slice(4);
		var tab = document.getElementById('combinaciones');
		arrNombres[id];
		arrNombres.splice(id, 1);
		muestra_nombres();
		crea_arreglo_objetos();
		tab.getElementsByTagName('tbody')[0].innerHTML = "";
		crea_tabla(tab);
	}
}
