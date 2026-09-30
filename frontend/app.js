// =========================================================
// LADRILLAPP - FRONTEND
// =========================================================

// Guardaremos acá el ID de la obra que cree el usuario.
let idObraActual = null;


// Guardamos los tipos constructivos que vienen de MySQL.
let tiposConstructivos = [];


// =========================================================
// CARGAR LOS TIPOS CONSTRUCTIVOS
// =========================================================

// Esta función consulta al backend para obtener
// los tipos constructivos almacenados en MySQL.

async function cargarTiposConstructivos() {

    const respuesta = await fetch('/tipos-constructivos');

    tiposConstructivos = await respuesta.json();

    const selector = document.getElementById(
        'tipoConstructivo'
    );


    // Creamos una opción dentro del selector
    // por cada tipo constructivo existente.
    tiposConstructivos.forEach(tipo => {

        const opcion = document.createElement('option');

        opcion.value = tipo.id_tipo;
        opcion.textContent = tipo.nombre;

        selector.appendChild(opcion);

    });


    cambiarNombreDimension();
}


// Ejecutamos la función cuando se abre LadrillApp.
cargarTiposConstructivos();


// =========================================================
// CREAR UNA OBRA
// =========================================================

document.getElementById('formObra')
    .addEventListener('submit', async (evento) => {

        // Evita que el formulario recargue la página.
        evento.preventDefault();


        const nombre =
            document.getElementById('nombreObra').value;

        const descripcion =
            document.getElementById('descripcionObra').value;


        // Obtenemos la fecha actual.
        const fecha = new Date()
            .toISOString()
            .split('T')[0];


        // Enviamos los datos al backend.
        const respuesta = await fetch('/obras', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                nombre: nombre,
                descripcion: descripcion,
                fecha_creacion: fecha
            })

        });


        const resultado = await respuesta.json();


        // Guardamos el ID de la obra creada.
        idObraActual = resultado.id_obra;


        document.getElementById('mensajeObra')
            .textContent =
            `Obra creada correctamente. ID: ${idObraActual}`;

    });


// =========================================================
// CAMBIAR "ALTO" O "ANCHO"
// =========================================================

// Para mamposterías necesitamos largo x alto.
// Para contrapisos necesitamos largo x ancho.

function cambiarNombreDimension() {

    const idTipo = Number(
        document.getElementById('tipoConstructivo').value
    );


    const tipo = tiposConstructivos.find(
        tipo => tipo.id_tipo === idTipo
    );


    if (!tipo) {
        return;
    }


    const etiqueta = document.getElementById(
        'labelSegundaDimension'
    );


    if (tipo.rubro === 'Contrapisos') {

        etiqueta.textContent = 'Ancho (m)';

    } else {

        etiqueta.textContent = 'Alto (m)';

    }

}


// Cada vez que cambia el tipo constructivo,
// revisamos si corresponde mostrar Alto o Ancho.

document.getElementById('tipoConstructivo')
    .addEventListener(
        'change',
        cambiarNombreDimension
    );


// =========================================================
// AGREGAR ELEMENTO
// =========================================================

document.getElementById('formElemento')
    .addEventListener('submit', async (evento) => {

        evento.preventDefault();


        // Antes de agregar un elemento debe existir una obra.
        if (idObraActual === null) {

            alert('Primero tenés que crear una obra.');

            return;
        }


        const idTipo = Number(
            document.getElementById(
                'tipoConstructivo'
            ).value
        );


        const nombre =
            document.getElementById(
                'nombreElemento'
            ).value;


        const largo = Number(
            document.getElementById('largo').value
        );


        const segundaDimension = Number(
            document.getElementById(
                'segundaDimension'
            ).value
        );


        // Guardamos el elemento en MySQL.
        const respuesta = await fetch('/elementos', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({

                id_obra: idObraActual,
                id_tipo: idTipo,
                nombre: nombre,
                largo: largo,
                segunda_dimension: segundaDimension

            })

        });


        const elementoCreado =
            await respuesta.json();


        // Después de guardar el elemento,
        // pedimos al backend que haga el cálculo.
        const respuestaCalculo = await fetch(
            `/elementos/${elementoCreado.id_elemento}/calculo`
        );


        const calculo =
            await respuestaCalculo.json();


        mostrarResultado(calculo);

    });


// =========================================================
// MOSTRAR RESULTADOS
// =========================================================

function mostrarResultado(calculo) {

    const contenedor =
        document.getElementById('contenidoResultado');


    // Comenzamos mostrando los datos del elemento.
    let html = `
        <h3>${calculo.elemento.nombre}</h3>

        <p>
            <strong>Tipo:</strong>
            ${calculo.elemento.tipo_constructivo}
        </p>

        <p>
            <strong>Superficie:</strong>
            ${calculo.elemento.superficie} m²
        </p>

        <h3>Materiales</h3>

        <ul>
    `;


    // Agregamos cada material.
    calculo.materiales.forEach(material => {

        html += `
            <li>
                ${material.nombre}:
                ${material.cantidad_total}
                ${material.unidad_medida}
            </li>
        `;

    });


    html += `
        </ul>

        <h3>Mano de obra</h3>

        <ul>
    `;


    // Agregamos cada tipo de trabajador.
    calculo.mano_obra.forEach(trabajador => {

        html += `
            <li>
                ${trabajador.nombre}:
                ${trabajador.horas_totales}
                horas
            </li>
        `;

    });


    html += '</ul>';


    // Finalmente colocamos todo dentro de la página.
    contenedor.innerHTML = html;

}