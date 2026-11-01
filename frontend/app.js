
// guarda id que crea el usuario
let idObraActual = null;


// guarda los elementos constructivos que vienen de MySQL.
let tiposConstructivos = [];


// ===========================
// CARGAR TIPOS CONSTRUCTIVOS
// ===========================

// funcion que consulta al backend para obtener los elementos constructivos almacenados en MySQL.

async function cargarTiposConstructivos() {

    const respuesta = await fetch('/tipos-constructivos');

    tiposConstructivos = await respuesta.json();

    const selector = document.getElementById(
        'tipoConstructivo'
    );


    // crea una opción dentro del selector por cada elemento de construccion existente.
    tiposConstructivos.forEach(tipo => {

        const opcion = document.createElement('option');

        opcion.value = tipo.id_tipo;
        opcion.textContent = tipo.nombre;

        selector.appendChild(opcion);

    });


    cambiarNombreDimension();
}


// ejecuta la función cuando se abre LadrillApp.
cargarTiposConstructivos();
cargarObrasGuardadas();


// ===============
// CREAR UNA OBRA
// ===============

document.getElementById('formObra')
    .addEventListener('submit', async (evento) => {

        //evita que se recarge la pagina con el formulario
        evento.preventDefault();


        const nombre = document.getElementById('nombreObra').value;
        const descripcion = document.getElementById('descripcionObra').value;

        const elementoMensaje = document.getElementById('mensajeObra');

        elementoMensaje.textContent = '';


const hoy = new Date();
const fecha =
    hoy.getFullYear() +
    '-' +
    String(hoy.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(hoy.getDate()).padStart(2, '0');
    

try {
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

        if (!respuesta.ok || resultado.error){
            elementoMensaje.textContent = resultado.error || 'El nombre de la obra ya existe';
            return;
        }

        idObraActual = resultado.id_obra;

        elementoMensaje.textContent = 'Obra creada correctamente.';

        cargarElementosObra();
        cargarTotalesObra();
        cargarObrasGuardadas();

    } catch (error) {
        console.error('Error de servidor', error);
        elementoMensaje.textContent = 'Hubo un error al conectar con el servidor'
    }

});
        

// ===========================
// CAMBIAR "ALTO" O "ANCHO"
// ==========================

// largo x alto para paredes
// largo x ancho para techos y pisos

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


if (tipo.rubro === 'Pisos y techos') {

    etiqueta.textContent = 'Ancho (m)';

} else {

    etiqueta.textContent = 'Alto (m)';

}

}

// revisa si el cambio largo o ancho es correcto

document.getElementById('tipoConstructivo')
    .addEventListener(
        'change',
        cambiarNombreDimension
    );


// =================
// AGREGAR ELEMENTO
// ==================

document.getElementById('formElemento')
    .addEventListener('submit', async (evento) => {

        evento.preventDefault();


        // ver si existe obra
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


        // guarda el elemento en MySQL.
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


await respuesta.json();


// actualiza todos los elementos de obra y totales

await cargarElementosObra();
await cargarTotalesObra();

});




// ======================================
// MOSTRAR TODOS LOS ELEMENTOS DE LA OBRA
// =======================================

async function cargarElementosObra() {

    // Si todavía no hay una obra seleccionada, no hace ninguna consulta.
    if (!idObraActual) {
        return;
    }


    const listaElementos =
        document.getElementById('listaElementos');


    try {

        // -------------------------------------------------
        // 1. BUSCAR LOS ELEMENTOS DE LA OBRA
        // -------------------------------------------------

        const respuesta = await fetch(
            `/obras/${idObraActual}/elementos`
        );

        const elementos = await respuesta.json();


        // Si la obra todavía no tiene elementos.
        if (elementos.length === 0) {

            listaElementos.innerHTML =
                '<p>La obra todavía no tiene elementos cargados.</p>';

            return;
        }


        // -------------------------------------------------
        // 2. BUSCAR EL CÁLCULO COMPLETO DE CADA ELEMENTO
        // -------------------------------------------------

const calculos = await Promise.all(

    elementos.map(async elemento => {

        const respuestaCalculo = await fetch(
            `/elementos/${elemento.id_elemento}/calculo`
        );

        const calculo =
            await respuestaCalculo.json();


        // guarda el calculo y los datos originales
        // para luego editar sus medidas
        return {
            calculo: calculo,
            datos: elemento
        };

    })

);


        // -------------------------------------------------
        // 3. MOSTRAR TODOS LOS ELEMENTOS
        // -------------------------------------------------

        let html = '';


        calculos.forEach(item => {

            const calculo = item.calculo;
            const datosElemento = item.datos;
            html += `
                <div class="elemento-obra">

                    <h3>
                        ${calculo.elemento.nombre}
                    </h3>

                    <p>
                        <strong>Tipo:</strong>
                        ${calculo.elemento.tipo_constructivo}
                    </p>

                    <p>
                        <strong>Superficie:</strong>
                        ${calculo.elemento.superficie} m²
                    </p>

                    <button
    type="button"
    class="botonEditarElemento"
    data-id="${calculo.elemento.id_elemento}"
    data-nombre="${calculo.elemento.nombre}"
    data-largo="${datosElemento.largo}"
    data-segunda="${datosElemento.segunda_dimension}"
    data-rubro="${datosElemento.rubro}"
>
    Editar elemento
</button>

            `;


            // recorre componentes de elementos
            calculo.componentes.forEach(componente => {

                html += `
                    <h4>${componente.nombre}</h4>

                    <p>
                        <strong>Materiales:</strong>
                    </p>

                    <ul>
                `;


                // recorre materiales
                componente.materiales.forEach(material => {

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

                    <p>
                        <strong>Mano de obra:</strong>
                    </p>

                    <ul>
                `;


                // recorre mano de obra
                componente.mano_obra.forEach(trabajador => {

                    html += `
                        <li>
                            ${trabajador.nombre}:
                            ${trabajador.horas_totales}
                            horas
                        </li>
                    `;

                });


                html += `
                    </ul>
                `;

            });


            // Línea para separar un elemento del siguiente
            html += `
                    <hr>
                </div>
            `;

        });


        listaElementos.innerHTML = html;

// -------------------------------------------------
// 4. BOTONES PARA EDITAR ELEMENTOS
// -------------------------------------------------

const botonesEditar =
    document.querySelectorAll('.botonEditarElemento');


botonesEditar.forEach(boton => {

    boton.addEventListener(
        'click',
        async () => {

            const idElemento =
                Number(boton.dataset.id);

            const nombreActual =
                boton.dataset.nombre;

            const largoActual =
                Number(boton.dataset.largo);

            const segundaActual =
                Number(boton.dataset.segunda);

            const rubro =
                boton.dataset.rubro;


           
            const nuevoNombre = prompt(
                'Nombre del elemento:',
                nombreActual
            );

            // al cancelar no cambiar nada
            if (nuevoNombre === null) {
                return;
            }


            const nuevoLargo = prompt(
                'Largo (m):',
                largoActual
            );

            if (nuevoLargo === null) {
                return;
            }


            // Para paredes mostramos Alto.
            // Para piso/techo mostramos Ancho.
            let textoSegundaDimension = 'Alto (m):';

            if (rubro === 'Pisos y techos') {
                textoSegundaDimension = 'Ancho (m):';
            }


            const nuevaSegundaDimension = prompt(
                textoSegundaDimension,
                segundaActual
            );

            if (nuevaSegundaDimension === null) {
                return;
            }


            // Enviamos los nuevos datos al backend.
            const respuesta = await fetch(
                `/elementos/${idElemento}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({

                        nombre: nuevoNombre,

                        largo:
                            Number(nuevoLargo),

                        segunda_dimension:
                            Number(nuevaSegundaDimension)

                    })
                }
            );


            if (!respuesta.ok) {

                alert(
                    'No se pudo modificar el elemento.'
                );

                return;
            }


            alert(
                'Elemento modificado correctamente.'
            );


            // Recalculamos todo lo que se muestra.
            await cargarElementosObra();
            await cargarTotalesObra();

        }
    );

});


    } catch (error) {

        console.error(
            'Error al cargar los elementos de la obra:',
            error
        );

        listaElementos.innerHTML =
            '<p>Error al cargar los elementos.</p>';

    }

}

// ===============================
// MOSTRAR LOS TOTALES DE LA OBRA
// ===============================

async function cargarTotalesObra() {

    // si no hay obra seleccionada no hacer nada
    if (!idObraActual) {
        return;
    }


    const contenedor =
        document.getElementById('contenidoTotales');


    try {

        const respuesta = await fetch(
            `/obras/${idObraActual}/totales`
        );


        const totales = await respuesta.json();


        let html = `
            <h3>Totales por rubro</h3>
        `;


        // ========================
        // 1. MOSTRAR CADA RUBRO
        // =======================

        totales.rubros.forEach(rubro => {

            // no mostrar rubro si no tiene datos
            if (
                rubro.materiales.length === 0 &&
                rubro.mano_obra.length === 0
            ) {
                return;
            }


            html += `
                <div class="rubro-total">

                    <h4>${rubro.nombre}</h4>

                    <p>
                        <strong>Materiales:</strong>
                    </p>

                    <ul>
            `;


            rubro.materiales.forEach(material => {

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

                    <p>
                        <strong>Mano de obra:</strong>
                    </p>

                    <ul>
            `;


            rubro.mano_obra.forEach(trabajador => {

                html += `
                    <li>
                        ${trabajador.nombre}:
                        ${trabajador.horas_totales}
                        horas
                    </li>
                `;

            });


            html += `
                    </ul>

                </div>
            `;

        });


        // ============================
        // 2. MOSTRAR EL TOTAL GENERAL
        // ============================

        html += `
            <hr>

            <h3>Total general de la obra</h3>

            <p>
                <strong>Materiales:</strong>
            </p>

            <ul>
        `;


        totales.materiales.forEach(material => {

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

            <p>
                <strong>Mano de obra:</strong>
            </p>

            <ul>
        `;


        totales.mano_obra.forEach(trabajador => {

            html += `
                <li>
                    ${trabajador.nombre}:
                    ${trabajador.horas_totales}
                    horas
                </li>
            `;

        });


        html += `
            </ul>
        `;


        contenedor.innerHTML = html;


    } catch (error) {

        console.error(
            'Error al cargar los totales:',
            error
        );

        contenedor.innerHTML =
            '<p>Error al cargar los totales de la obra.</p>';
    }

}

// ========================
// MOSTRAR OBRAS GUARDADAS
// ========================

// obtiene todas las obras creadas anteriormente de mysql

async function cargarObrasGuardadas() {

    const selectObras = document.getElementById('selectObras');

    try {

        const respuesta = await fetch('/obras');
        const obras = await respuesta.json();

        let htmlOpciones = '<option value="">Seleccione una obra</option>';


        if (obras.length === 0) {
            listaObras.innerHTML =
                '<option value="">No hay obras guardadas</option>';
            return;
        }

        obras.forEach(obra => {

            htmlOpciones += `
                <option value="${obra.id_obra}">${obra.nombre}</option>  
            `;
        });


        selectObras.innerHTML = htmlOpciones;

    } catch (error) {
        console.error('Error al cargar las obras:', error);
        listaObras.innerHTML = '<option value="">Error al cargar las obras</option>'
    }
}

        // Agrega boton "abrir" a la obra seleccionada en el select
document.getElementById('botonAbrirObra').addEventListener('click', async () => {
    
    const selectObras = document.getElementById('selectObras');
    const idObra = Number(selectObras.value);

    if(!idObra){
        alert('Por favor, seleccione una obra de la lista');
        return;
    }

    await abrirObra(idObra);
})

        // Agrega boton "eliminar" a la obra seleccionada en el select
document.getElementById('botonEliminarObra').addEventListener('click', async () => {
    
    const selectObras = document.getElementById('selectObras');
    const idObra = Number(selectObras.value);

    if(!idObra){
        alert('Seleccione una obra para eliminar');
        return;
    }

    try {
        const respuesta = await fetch(`/obras/${idObra}`, {
            method: 'DELETE'
        });

        if(!respuesta.ok){
            alert('No se pudo eliminar la obra');
            return;
        }

        //si eliminamos la obra que estaba abierta, limpia la interfaz
        if(idObraActual === idObra) {
            idObraActual = null;
            document.getElementById('listaElementos').innerHTML = '';
                document.getElementById('contenidoTotales').innerHTML = '';
                document.getElementById('mensajeObra').textContent = '';
        }

        // recarga select para mostrar cambios
        await cargarObrasGuardadas();
        alert('Obra eliminada correctamente');

    } catch (error) {
        console.error('Error al eliminar la obra:', error);
        alert('Ocurrio un error al intentar eliminar la obra')
    }
});

// ========================
// ABRIR UNA OBRA GUARDADA
// ========================

async function abrirObra(idObra){
    idObraActual = idObra;

    document.getElementById('mensajeObra').textContent = 
    `Obra abierta correctamente.`;

    await cargarElementosObra();
    await cargarTotalesObra();
}

// =========================================================
// DESCARGAR RESUMEN TXT
// =========================================================

document.getElementById('botonDescargarTxt')
    .addEventListener(
        'click',
        async () => {

            // Tiene que haber una obra seleccionada.
            if (!idObraActual) {

                alert(
                    'Primero tenés que crear o abrir una obra.'
                );

                return;
            }


            try {

                // -------------------------------------------------
                // 1. BUSCAR LOS ELEMENTOS DE LA OBRA
                // -------------------------------------------------

                const respuestaElementos = await fetch(
                    `/obras/${idObraActual}/elementos`
                );

                const elementos =
                    await respuestaElementos.json();


                // -------------------------------------------------
                // 2. BUSCAR LOS CÁLCULOS DE CADA ELEMENTO
                // -------------------------------------------------

                const calculos = await Promise.all(

                    elementos.map(async elemento => {

                        const respuesta = await fetch(
                            `/elementos/${elemento.id_elemento}/calculo`
                        );

                        return await respuesta.json();

                    })

                );


                // -------------------------------------------------
                // 3. BUSCAR LOS TOTALES
                // -------------------------------------------------

                const respuestaTotales = await fetch(
                    `/obras/${idObraActual}/totales`
                );

                const totales =
                    await respuestaTotales.json();


                // -------------------------------------------------
                // 4. ARMAR EL TEXTO DEL ARCHIVO
                // -------------------------------------------------

                let texto = '';

                texto += 'LADRILLAPP\n';
                texto += '==============================\n\n';

                texto += `ID de obra: ${idObraActual}\n\n`;

                texto += 'ELEMENTOS DE LA OBRA\n';
                texto += '==============================\n\n';


                calculos.forEach(calculo => {

                    texto +=
                        `${calculo.elemento.nombre}\n`;

                    texto +=
                        `Tipo: ${calculo.elemento.tipo_constructivo}\n`;

                    texto +=
                        `Superficie: ${calculo.elemento.superficie} m2\n\n`;


                    calculo.componentes.forEach(
                        componente => {

                            texto +=
                                `${componente.nombre.toUpperCase()}\n`;


                            texto += 'Materiales:\n';


                            componente.materiales.forEach(
                                material => {

                                    texto +=
                                        `- ${material.nombre}: ` +
                                        `${material.cantidad_total} ` +
                                        `${material.unidad_medida}\n`;

                                }
                            );


                            texto += 'Mano de obra:\n';


                            componente.mano_obra.forEach(
                                trabajador => {

                                    texto +=
                                        `- ${trabajador.nombre}: ` +
                                        `${trabajador.horas_totales} horas\n`;

                                }
                            );


                            texto += '\n';

                        }
                    );


                    texto +=
                        '------------------------------\n\n';

                });


                // -------------------------------------------------
                // 5. TOTALES POR RUBRO
                // -------------------------------------------------

                texto += '\nTOTALES POR RUBRO\n';
                texto += '==============================\n\n';


                totales.rubros.forEach(rubro => {

                    if (
                        rubro.materiales.length === 0 &&
                        rubro.mano_obra.length === 0
                    ) {
                        return;
                    }


                    texto +=
                        `${rubro.nombre.toUpperCase()}\n\n`;


                    texto += 'Materiales:\n';


                    rubro.materiales.forEach(
                        material => {

                            texto +=
                                `- ${material.nombre}: ` +
                                `${material.cantidad_total} ` +
                                `${material.unidad_medida}\n`;

                        }
                    );


                    texto += '\nMano de obra:\n';


                    rubro.mano_obra.forEach(
                        trabajador => {

                            texto +=
                                `- ${trabajador.nombre}: ` +
                                `${trabajador.horas_totales} horas\n`;

                        }
                    );


                    texto += '\n';

                });


                // -------------------------------------------------
                // 6. TOTAL GENERAL
                // -------------------------------------------------

                texto += '\nTOTAL GENERAL DE LA OBRA\n';
                texto += '==============================\n\n';


                texto += 'Materiales:\n';


                totales.materiales.forEach(
                    material => {

                        texto +=
                            `- ${material.nombre}: ` +
                            `${material.cantidad_total} ` +
                            `${material.unidad_medida}\n`;

                    }
                );


                texto += '\nMano de obra:\n';


                totales.mano_obra.forEach(
                    trabajador => {

                        texto +=
                            `- ${trabajador.nombre}: ` +
                            `${trabajador.horas_totales} horas\n`;

                    }
                );


                // -------------------------------------------------
                // 7. CREAR Y DESCARGAR EL ARCHIVO
                // -------------------------------------------------

                const archivo = new Blob(
                    [texto],
                    {
                        type: 'text/plain;charset=utf-8'
                    }
                );


                const url =
                    URL.createObjectURL(archivo);


                const enlace =
                    document.createElement('a');


                enlace.href = url;

                enlace.download =
                    `ladrillapp-obra-${idObraActual}.txt`;


                document.body.appendChild(enlace);

                enlace.click();

                document.body.removeChild(enlace);

                URL.revokeObjectURL(url);

            } catch (error) {

                console.error(
                    'Error al generar el archivo TXT:',
                    error
                );

                alert(
                    'No se pudo generar el archivo.'
                );

            }

        }
    );