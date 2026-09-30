// =========================================================
// LADRILLAPP - BACKEND
// Primera conexión entre Node.js y MySQL
// =========================================================

// Importamos Express.
// Express nos permite crear el servidor de la aplicación.
const express = require('express');

// Importamos mysql2.
// Esta librería permite conectar Node.js con MySQL.
const mysql = require('mysql2');

// Importamos path para poder indicar dónde está
// la carpeta que contiene nuestra interfaz.
const path = require('path');

// Permite leer las variables guardadas en el archivo .env.
require('dotenv').config();

// Creamos nuestra aplicación de Express.
const app = express();

// Permite que Express pueda leer datos enviados en formato JSON.
app.use(express.json());

// Indicamos que la carpeta "frontend" contiene
// los archivos que verá el usuario en el navegador.
app.use(express.static(
    path.join(__dirname, '../frontend')
));

// Elegimos el puerto 3000 para ejecutar el servidor.
const PORT = 3000;


// =========================================================
// CONEXIÓN CON LA BASE DE DATOS
// =========================================================

// =========================================================
// CONEXIÓN CON MYSQL
// =========================================================

// Los datos de conexión se obtienen del archivo .env.
// De esta manera no dejamos la contraseña escrita
// directamente dentro del código fuente.

const conexion = mysql.createConnection({

    host: process.env.DB_HOST,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME

});


// Intentamos conectarnos con MySQL.
conexion.connect((error) => {

    // Si ocurre un error, lo mostramos en la terminal.
    if (error) {
        console.error('Error al conectar con MySQL:', error);
        return;
    }

    // Si no hubo errores, mostramos este mensaje.
    console.log('Conexión con MySQL realizada correctamente.');
});


// =========================================================
// RUTA DE PRUEBA
// =========================================================

// Cuando alguien entra a http://localhost:3000/
// el servidor devuelve este mensaje.
app.get('/', (req, res) => {

    res.send('Backend de LadrillApp funcionando');

});


// =========================================================
// CONSULTA DE TIPOS CONSTRUCTIVOS
// =========================================================

// Esta ruta consulta la tabla tipos_constructivos.
//
// Cuando alguien entra a:
// http://localhost:3000/tipos-constructivos
//
// Node.js consulta MySQL y devuelve los resultados.
app.get('/tipos-constructivos', (req, res) => {

    const consulta = 'SELECT * FROM tipos_constructivos';

    conexion.query(consulta, (error, resultados) => {

        // Si ocurre un error en la consulta,
        // devolvemos un mensaje de error.
        if (error) {
            res.status(500).send('Error al consultar la base de datos');
            return;
        }

        // Si la consulta salió bien,
        // devolvemos los datos en formato JSON.
        res.json(resultados);

    });

});

// =========================================================
// CREAR UNA OBRA
// =========================================================

// Esta ruta permite guardar una nueva obra en la base de datos.
//
// Método: POST
// Dirección: http://localhost:3000/obras
//
// Espera recibir un JSON con:
// nombre
// descripcion
// fecha_creacion

app.post('/obras', (req, res) => {

    // Extraemos los datos enviados desde el navegador o desde una herramienta de prueba.
    const { nombre, descripcion, fecha_creacion } = req.body;

    // Consulta SQL para insertar una nueva obra.
    const consulta = `
        INSERT INTO obras (nombre, descripcion, fecha_creacion)
        VALUES (?, ?, ?)
    `;

    // Ejecutamos la consulta enviando los valores por separado.
    // Los signos ? se reemplazan por estos valores.
    conexion.query(
        consulta,
        [nombre, descripcion, fecha_creacion],
        (error, resultado) => {

            // Si ocurre un error al guardar la obra, lo informamos.
            if (error) {
                console.error('Error al crear la obra:', error);
                res.status(500).send('Error al crear la obra');
                return;
            }

            // Si salió bien, devolvemos un mensaje junto con
            // el ID que MySQL generó automáticamente.
            res.json({
                mensaje: 'Obra creada correctamente',
                id_obra: resultado.insertId
            });

        }
    );

});

// =========================================================
// AGREGAR UN ELEMENTO A UNA OBRA
// =========================================================

// Esta ruta permite guardar una pared o contrapiso
// dentro de una obra ya existente.
//
// Método: POST
// Dirección: http://localhost:3000/elementos
//
// Espera recibir:
// id_obra
// id_tipo
// nombre
// largo
// segunda_dimension

app.post('/elementos', (req, res) => {

    // Tomamos los datos enviados.
    const {
        id_obra,
        id_tipo,
        nombre,
        largo,
        segunda_dimension
    } = req.body;


    // Calculamos la superficie.
    // Para una pared será largo x alto.
    // Para un contrapiso será largo x ancho.
    const superficie = largo * segunda_dimension;


    // Preparamos la consulta SQL.
    const consulta = `
        INSERT INTO elementos_obra
        (
            id_obra,
            id_tipo,
            nombre,
            largo,
            segunda_dimension,
            superficie
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;


    // Ejecutamos la consulta.
    conexion.query(
        consulta,
        [
            id_obra,
            id_tipo,
            nombre,
            largo,
            segunda_dimension,
            superficie
        ],
        (error, resultado) => {

            // Si ocurre un error, lo mostramos.
            if (error) {
                console.error('Error al guardar el elemento:', error);

                res.status(500).send(
                    'Error al guardar el elemento'
                );

                return;
            }


            // Si salió bien, devolvemos los datos principales.
            res.json({
                mensaje: 'Elemento agregado correctamente',
                id_elemento: resultado.insertId,
                superficie: superficie
            });

        }
    );

});

// =========================================================
// CALCULAR MATERIALES Y MANO DE OBRA DE UN ELEMENTO
// =========================================================

// Esta ruta recibe el ID de un elemento ya guardado.
//
// Ejemplo:
// http://localhost:3000/elementos/1/calculo
//
// Node.js busca:
// - la superficie del elemento
// - el tipo constructivo
//
// Después consulta los rendimientos de materiales y mano de obra
// y calcula las cantidades totales.

app.get('/elementos/:id/calculo', (req, res) => {

    // Tomamos el ID del elemento desde la URL.
    const idElemento = req.params.id;


    // -----------------------------------------------------
    // 1. BUSCAMOS EL ELEMENTO
    // -----------------------------------------------------

    const consultaElemento = `
        SELECT
            e.id_elemento,
            e.nombre,
            e.superficie,
            e.id_tipo,
            tc.nombre AS tipo_constructivo
        FROM elementos_obra e
        INNER JOIN tipos_constructivos tc
            ON e.id_tipo = tc.id_tipo
        WHERE e.id_elemento = ?
    `;


    conexion.query(
        consultaElemento,
        [idElemento],
        (error, elementos) => {

            if (error) {
                console.error('Error al buscar el elemento:', error);
                res.status(500).send('Error al buscar el elemento');
                return;
            }


            // Si no existe ese elemento, devolvemos un mensaje.
            if (elementos.length === 0) {
                res.status(404).send('Elemento no encontrado');
                return;
            }


            // Como buscamos por ID, usamos el primer resultado.
            const elemento = elementos[0];


            // -------------------------------------------------
            // 2. BUSCAMOS LOS MATERIALES
            // -------------------------------------------------

            const consultaMateriales = `
                SELECT
                    m.nombre,
                    m.unidad_medida,
                    rm.rendimiento_unitario
                FROM requerimientos_material rm
                INNER JOIN materiales m
                    ON rm.id_material = m.id_material
                WHERE rm.id_tipo = ?
            `;


            conexion.query(
                consultaMateriales,
                [elemento.id_tipo],
                (error, materiales) => {

                    if (error) {
                        console.error('Error al buscar materiales:', error);
                        res.status(500).send('Error al buscar materiales');
                        return;
                    }


                    // Calculamos la cantidad total de cada material.
                    const materialesCalculados = materiales.map(material => {

                        return {
                            nombre: material.nombre,
                            unidad_medida: material.unidad_medida,
                            // Calculamos la cantidad y redondeamos a 3 decimales.
                            // Esto evita resultados como 73.19999999999999.
                            cantidad_total: Number(
                                (
                                    elemento.superficie *
                                    material.rendimiento_unitario
                                ).toFixed(3)
                            )
                        };

                    });


                    // ---------------------------------------------
                    // 3. BUSCAMOS LA MANO DE OBRA
                    // ---------------------------------------------

                    const consultaManoObra = `
                        SELECT
                            mo.nombre,
                            mo.unidad_medida,
                            rmo.horas_por_unidad
                        FROM requerimientos_mano_obra rmo
                        INNER JOIN mano_obra mo
                            ON rmo.id_mano_obra = mo.id_mano_obra
                        WHERE rmo.id_tipo = ?
                    `;


                    conexion.query(
                        consultaManoObra,
                        [elemento.id_tipo],
                        (error, manoObra) => {

                            if (error) {
                                console.error(
                                    'Error al buscar mano de obra:',
                                    error
                                );

                                res.status(500).send(
                                    'Error al buscar mano de obra'
                                );

                                return;
                            }


                            // Calculamos las horas totales.
                            const manoObraCalculada = manoObra.map(trabajador => {

                                return {
                                    nombre: trabajador.nombre,
                                    unidad_medida: trabajador.unidad_medida,
                                    // Calculamos las horas y redondeamos a 3 decimales.
                                    horas_totales: Number(
                                        (
                                            elemento.superficie *
                                            trabajador.horas_por_unidad
                                        ).toFixed(3)
                                    )
                                };

                            });


                            // -----------------------------------------
                            // 4. DEVOLVEMOS TODO EL RESULTADO
                            // -----------------------------------------

                            res.json({
                                elemento: {
                                    id_elemento: elemento.id_elemento,
                                    nombre: elemento.nombre,
                                    tipo_constructivo:
                                        elemento.tipo_constructivo,
                                    superficie: elemento.superficie
                                },

                                materiales: materialesCalculados,

                                mano_obra: manoObraCalculada
                            });

                        }
                    );

                }
            );

        }
    );

});

// =========================================================
// INICIAR EL SERVIDOR
// =========================================================

app.listen(PORT, () => {

    console.log(`Servidor funcionando en http://localhost:${PORT}`);

});