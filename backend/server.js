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
// Busca su superficie y tipo constructivo.
// Luego calcula materiales y mano de obra,
// separando los resultados por componente:
//
// - Mampostería
// - Revoque
// - Contrapiso
// - Carpeta
// - Techo

app.get('/elementos/:id/calculo', (req, res) => {

    const idElemento = req.params.id;


    // -----------------------------------------------------
    // 1. BUSCAR EL ELEMENTO
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


            if (elementos.length === 0) {
                res.status(404).send('Elemento no encontrado');
                return;
            }


            const elemento = elementos[0];


            // -------------------------------------------------
            // 2. BUSCAR LOS MATERIALES
            // -------------------------------------------------

            const consultaMateriales = `
                SELECT
                    rm.componente,
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

                        const cantidadTotal = Number(
                            (
                                elemento.superficie *
                                material.rendimiento_unitario
                            ).toFixed(3)
                        );


                        return {
                            componente: material.componente,
                            nombre: material.nombre,
                            unidad_medida: material.unidad_medida,
                            cantidad_total: cantidadTotal
                        };

                    });


                    // -------------------------------------------------
                    // 3. BUSCAR LA MANO DE OBRA
                    // -------------------------------------------------

                    const consultaManoObra = `
                        SELECT
                            rmo.componente,
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

                                const horasTotales = Number(
                                    (
                                        elemento.superficie *
                                        trabajador.horas_por_unidad
                                    ).toFixed(3)
                                );


                                return {
                                    componente: trabajador.componente,
                                    nombre: trabajador.nombre,
                                    unidad_medida: trabajador.unidad_medida,
                                    horas_totales: horasTotales
                                };

                            });


                            // -------------------------------------------------
                            // 4. AGRUPAR LOS RESULTADOS POR COMPONENTE
                            // -------------------------------------------------

                            const ordenComponentes = [
                                'Mampostería',
                                'Revoque',
                                'Contrapiso',
                                'Carpeta',
                                'Techo'
                            ];


                            const componentes = [];


                            ordenComponentes.forEach(nombreComponente => {

                                const materialesComponente =
                                    materialesCalculados.filter(
                                        material =>
                                            material.componente === nombreComponente
                                    );


                                const manoObraComponente =
                                    manoObraCalculada.filter(
                                        trabajador =>
                                            trabajador.componente === nombreComponente
                                    );


                                // Solo agregamos el componente
                                // si realmente tiene datos.
                                if (
                                    materialesComponente.length > 0 ||
                                    manoObraComponente.length > 0
                                ) {

                                    componentes.push({
                                        nombre: nombreComponente,
                                        materiales: materialesComponente,
                                        mano_obra: manoObraComponente
                                    });

                                }

                            });


                            // -------------------------------------------------
                            // 5. DEVOLVER EL RESULTADO
                            // -------------------------------------------------

                            res.json({

                                elemento: {
                                    id_elemento: elemento.id_elemento,
                                    nombre: elemento.nombre,
                                    tipo_constructivo:
                                        elemento.tipo_constructivo,
                                    superficie: elemento.superficie
                                },

                                componentes: componentes

                            });

                        }
                    );

                }
            );

        }
    );

});

// =========================================================
// OBTENER LOS ELEMENTOS DE UNA OBRA
// =========================================================

// Esta ruta devuelve todos los elementos cargados
// dentro de una obra determinada.
//
// Ejemplo:
// GET http://localhost:3000/obras/1/elementos

app.get('/obras/:id/elementos', (req, res) => {

    // Tomamos el ID de la obra desde la dirección.
    const idObra = req.params.id;


    // Buscamos los elementos de esa obra
    // y también el nombre de su tipo constructivo.
    const consulta = `
        SELECT
            e.id_elemento,
            e.nombre,
            e.largo,
            e.segunda_dimension,
            e.superficie,
            tc.nombre AS tipo_constructivo,
            tc.rubro
        FROM elementos_obra e

        INNER JOIN tipos_constructivos tc
            ON e.id_tipo = tc.id_tipo

        WHERE e.id_obra = ?

        ORDER BY e.id_elemento
    `;


    conexion.query(
        consulta,
        [idObra],
        (error, resultados) => {

            if (error) {
                console.error(
                    'Error al buscar los elementos:',
                    error
                );

                res.status(500).send(
                    'Error al buscar los elementos de la obra'
                );

                return;
            }


            // Devolvemos los elementos encontrados.
            res.json(resultados);

        }
    );

});

// =========================================================
// TOTALES DE UNA OBRA
// =========================================================

// Esta ruta calcula:
//
// 1. Totales del rubro Paredes.
// 2. Totales del rubro Techo.
// 3. Totales del rubro Piso.
// 4. Totales generales de toda la obra.
//
// Aunque Piso y Techo se cargan juntos,
// acá los mostramos por separado.

app.get('/obras/:id/totales', (req, res) => {

    const idObra = req.params.id;


    // =====================================================
    // 1. MATERIALES AGRUPADOS POR RUBRO
    // =====================================================

    const consultaMaterialesPorRubro = `
        SELECT

            CASE
                WHEN rm.componente IN ('Mampostería', 'Revoque')
                    THEN 'Paredes'

                WHEN rm.componente = 'Techo'
                    THEN 'Techo'

                WHEN rm.componente IN ('Contrapiso', 'Carpeta')
                    THEN 'Piso'

                ELSE rm.componente
            END AS rubro,

            m.nombre,
            m.unidad_medida,

            ROUND(
                SUM(
                    e.superficie *
                    rm.rendimiento_unitario
                ),
                3
            ) AS cantidad_total

        FROM elementos_obra e

        INNER JOIN requerimientos_material rm
            ON e.id_tipo = rm.id_tipo

        INNER JOIN materiales m
            ON rm.id_material = m.id_material

        WHERE e.id_obra = ?

        GROUP BY
            rubro,
            m.id_material,
            m.nombre,
            m.unidad_medida

        ORDER BY rubro, m.nombre
    `;


    conexion.query(
        consultaMaterialesPorRubro,
        [idObra],
        (error, materialesPorRubro) => {

            if (error) {

                console.error(
                    'Error al calcular materiales por rubro:',
                    error
                );

                res.status(500).send(
                    'Error al calcular materiales por rubro'
                );

                return;
            }


            // =================================================
            // 2. MANO DE OBRA AGRUPADA POR RUBRO
            // =================================================

            const consultaManoObraPorRubro = `
                SELECT

                    CASE
                        WHEN rmo.componente IN ('Mampostería', 'Revoque')
                            THEN 'Paredes'

                        WHEN rmo.componente = 'Techo'
                            THEN 'Techo'

                        WHEN rmo.componente IN ('Contrapiso', 'Carpeta')
                            THEN 'Piso'

                        ELSE rmo.componente
                    END AS rubro,

                    mo.nombre,
                    mo.unidad_medida,

                    ROUND(
                        SUM(
                            e.superficie *
                            rmo.horas_por_unidad
                        ),
                        3
                    ) AS horas_totales

                FROM elementos_obra e

                INNER JOIN requerimientos_mano_obra rmo
                    ON e.id_tipo = rmo.id_tipo

                INNER JOIN mano_obra mo
                    ON rmo.id_mano_obra = mo.id_mano_obra

                WHERE e.id_obra = ?

                GROUP BY
                    rubro,
                    mo.id_mano_obra,
                    mo.nombre,
                    mo.unidad_medida

                ORDER BY rubro, mo.nombre
            `;


            conexion.query(
                consultaManoObraPorRubro,
                [idObra],
                (error, manoObraPorRubro) => {

                    if (error) {

                        console.error(
                            'Error al calcular mano de obra por rubro:',
                            error
                        );

                        res.status(500).send(
                            'Error al calcular mano de obra por rubro'
                        );

                        return;
                    }


                    // =================================================
                    // 3. MATERIALES TOTALES DE TODA LA OBRA
                    // =================================================

                    const consultaMaterialesTotales = `
                        SELECT
                            m.nombre,
                            m.unidad_medida,

                            ROUND(
                                SUM(
                                    e.superficie *
                                    rm.rendimiento_unitario
                                ),
                                3
                            ) AS cantidad_total

                        FROM elementos_obra e

                        INNER JOIN requerimientos_material rm
                            ON e.id_tipo = rm.id_tipo

                        INNER JOIN materiales m
                            ON rm.id_material = m.id_material

                        WHERE e.id_obra = ?

                        GROUP BY
                            m.id_material,
                            m.nombre,
                            m.unidad_medida

                        ORDER BY m.nombre
                    `;


                    conexion.query(
                        consultaMaterialesTotales,
                        [idObra],
                        (error, materialesTotales) => {

                            if (error) {

                                console.error(
                                    'Error al calcular materiales totales:',
                                    error
                                );

                                res.status(500).send(
                                    'Error al calcular materiales totales'
                                );

                                return;
                            }


                            // =============================================
                            // 4. MANO DE OBRA TOTAL DE TODA LA OBRA
                            // =============================================

                            const consultaManoObraTotal = `
                                SELECT
                                    mo.nombre,
                                    mo.unidad_medida,

                                    ROUND(
                                        SUM(
                                            e.superficie *
                                            rmo.horas_por_unidad
                                        ),
                                        3
                                    ) AS horas_totales

                                FROM elementos_obra e

                                INNER JOIN requerimientos_mano_obra rmo
                                    ON e.id_tipo = rmo.id_tipo

                                INNER JOIN mano_obra mo
                                    ON rmo.id_mano_obra = mo.id_mano_obra

                                WHERE e.id_obra = ?

                                GROUP BY
                                    mo.id_mano_obra,
                                    mo.nombre,
                                    mo.unidad_medida

                                ORDER BY mo.nombre
                            `;


                            conexion.query(
                                consultaManoObraTotal,
                                [idObra],
                                (error, manoObraTotal) => {

                                    if (error) {

                                        console.error(
                                            'Error al calcular mano de obra total:',
                                            error
                                        );

                                        res.status(500).send(
                                            'Error al calcular mano de obra total'
                                        );

                                        return;
                                    }


                                    // =====================================
                                    // 5. ARMAR LOS RUBROS
                                    // =====================================

                                    const nombresRubros = [
                                        'Paredes',
                                        'Techo',
                                        'Piso'
                                    ];


                                    const rubros = nombresRubros.map(
                                        nombreRubro => {

                                            const materiales =
                                                materialesPorRubro
                                                    .filter(
                                                        material =>
                                                            material.rubro ===
                                                            nombreRubro
                                                    )
                                                    .map(
                                                        material => ({
                                                            nombre:
                                                                material.nombre,

                                                            unidad_medida:
                                                                material.unidad_medida,

                                                            cantidad_total:
                                                                Number(
                                                                    material.cantidad_total
                                                                )
                                                        })
                                                    );


                                            const manoObra =
                                                manoObraPorRubro
                                                    .filter(
                                                        trabajador =>
                                                            trabajador.rubro ===
                                                            nombreRubro
                                                    )
                                                    .map(
                                                        trabajador => ({
                                                            nombre:
                                                                trabajador.nombre,

                                                            unidad_medida:
                                                                trabajador.unidad_medida,

                                                            horas_totales:
                                                                Number(
                                                                    trabajador.horas_totales
                                                                )
                                                        })
                                                    );


                                            return {
                                                nombre: nombreRubro,
                                                materiales: materiales,
                                                mano_obra: manoObra
                                            };

                                        }
                                    );


                                    // =====================================
                                    // 6. RESPUESTA FINAL
                                    // =====================================

                                    res.json({

                                        rubros: rubros,

                                        materiales:
                                            materialesTotales.map(
                                                material => ({
                                                    nombre:
                                                        material.nombre,

                                                    unidad_medida:
                                                        material.unidad_medida,

                                                    cantidad_total:
                                                        Number(
                                                            material.cantidad_total
                                                        )
                                                })
                                            ),

                                        mano_obra:
                                            manoObraTotal.map(
                                                trabajador => ({
                                                    nombre:
                                                        trabajador.nombre,

                                                    unidad_medida:
                                                        trabajador.unidad_medida,

                                                    horas_totales:
                                                        Number(
                                                            trabajador.horas_totales
                                                        )
                                                })
                                            )

                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});

// =========================================================
// LISTAR TODAS LAS OBRAS
// =========================================================

// Devuelve todas las obras guardadas en MySQL.
// Se muestran primero las más nuevas.

app.get('/obras', (req, res) => {

    const consulta = `
        SELECT
            id_obra,
            nombre,
            descripcion,
            fecha_creacion
        FROM obras
        ORDER BY id_obra DESC
    `;


    conexion.query(
        consulta,
        (error, obras) => {

            if (error) {

                console.error(
                    'Error al obtener las obras:',
                    error
                );

                res.status(500).send(
                    'Error al obtener las obras'
                );

                return;
            }


            res.json(obras);

        }
    );

});

// =========================================================
// EDITAR UN ELEMENTO
// =========================================================

// Permite modificar las dimensiones de un elemento.
// Después recalculamos la superficie.

app.put('/elementos/:id', (req, res) => {

    const idElemento = req.params.id;

    const {
        nombre,
        largo,
        segunda_dimension
    } = req.body;


    const superficie =
        Number(largo) *
        Number(segunda_dimension);


    const consulta = `
        UPDATE elementos_obra
        SET
            nombre = ?,
            largo = ?,
            segunda_dimension = ?,
            superficie = ?
        WHERE id_elemento = ?
    `;


    conexion.query(
        consulta,
        [
            nombre,
            largo,
            segunda_dimension,
            superficie,
            idElemento
        ],
        (error, resultado) => {

            if (error) {

                console.error(
                    'Error al editar el elemento:',
                    error
                );

                res.status(500).send(
                    'Error al editar el elemento'
                );

                return;
            }


            res.json({
                mensaje: 'Elemento actualizado correctamente',
                id_elemento: Number(idElemento),
                superficie: Number(superficie.toFixed(2))
            });

        }
    );

});

// =========================================================
// ELIMINAR UNA OBRA
// =========================================================

// Primero eliminamos los elementos que pertenecen a la obra.
// Después eliminamos la obra.

app.delete('/obras/:id', (req, res) => {

    const idObra = req.params.id;


    const eliminarElementos = `
        DELETE FROM elementos_obra
        WHERE id_obra = ?
    `;


    conexion.query(
        eliminarElementos,
        [idObra],
        (error) => {

            if (error) {

                console.error(
                    'Error al eliminar los elementos de la obra:',
                    error
                );

                res.status(500).send(
                    'Error al eliminar los elementos de la obra'
                );

                return;
            }


            const eliminarObra = `
                DELETE FROM obras
                WHERE id_obra = ?
            `;


            conexion.query(
                eliminarObra,
                [idObra],
                (error, resultado) => {

                    if (error) {

                        console.error(
                            'Error al eliminar la obra:',
                            error
                        );

                        res.status(500).send(
                            'Error al eliminar la obra'
                        );

                        return;
                    }


                    res.json({
                        mensaje: 'Obra eliminada correctamente'
                    });

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