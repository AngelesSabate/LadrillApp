# LadrillApp

LadrillApp es una aplicación web desarrollada como Proyecto Final Integrador de Prácticas Profesionalizantes II de la Tecnicatura Superior en Desarrollo de Software.

El proyecto surge a partir de una necesidad de Arista Arquitectura y Construcción: simplificar el cálculo de materiales y horas de mano de obra necesarias para una obra.

## Funcionalidades

La aplicación permite:

- Crear una obra.
- Guardar obras en MySQL.
- Abrir obras creadas anteriormente.
- Agregar elementos constructivos.
- Editar las dimensiones de un elemento.
- Eliminar obras.
- Calcular automáticamente materiales.
- Calcular horas de mano de obra.
- Mostrar resultados por elemento.
- Mostrar resultados agrupados por rubro:
  - Paredes.
  - Techo.
  - Piso.
- Mostrar el total general de materiales y mano de obra.
- Descargar un resumen de la obra en formato TXT.

## Tipos constructivos disponibles

### Pared terminada de ladrillo hueco 12x18x33 cm

Incluye:

- Mampostería.
- Revoque grueso en ambas caras.

### Pared terminada de ladrillo común 25x12x5 cm

Incluye:

- Mampostería.
- Revoque grueso en ambas caras.

### Piso terminado y techo

A partir de una única superficie de largo por ancho se calculan por separado:

- Contrapiso de cascotes.
- Carpeta de cemento.
- Techo de chapa simplificado.

## Tecnologías utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express

### Base de datos

- MySQL

### Otras herramientas

- Visual Studio Code
- Git
- GitHub

## Estructura del proyecto

```text
LadrillApp/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   └── node_modules/
│
├── database/
│   └── ladrillapp.sql
│
├── frontend/
│   ├── index.html
│   ├── estilos.css
│   └── app.js
│
├── .gitignore
└── README.md
```

## Instalación

### 1. Requisitos

Antes de ejecutar LadrillApp se debe instalar:

- Node.js.
- MySQL Server.
- MySQL Workbench.
- Visual Studio Code, recomendado.

## 2. Descargar el proyecto

El proyecto puede descargarse desde GitHub mediante:

```text
Code
→ Download ZIP
```

También puede clonarse utilizando Git.

## 3. Crear la base de datos

Abrir MySQL Workbench.

Seleccionar:

```text
File
→ Open SQL Script
```

Abrir:

```text
database/ladrillapp.sql
```

Ejecutar el script completo.

Este archivo crea:

- La base de datos `ladrillapp`.
- Las tablas.
- Los tipos constructivos.
- Los materiales.
- Los tipos de mano de obra.
- Los rendimientos necesarios para realizar los cálculos.

## 4. Configurar la conexión con MySQL

Dentro de la carpeta:

```text
backend
```

copiar el archivo:

```text
.env.example
```

y renombrar la copia como:

```text
.env
```

Completar:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_MYSQL
DB_NAME=ladrillapp
```

El archivo `.env` no se incluye en GitHub por motivos de seguridad.

## 5. Instalar dependencias

Abrir una terminal desde la carpeta del proyecto.

Ingresar:

```powershell
cd backend
```

Ejecutar:

```powershell
npm install
```

Si PowerShell bloquea el comando `npm`, utilizar:

```powershell
npm.cmd install
```

## 6. Ejecutar LadrillApp

Desde la carpeta `backend` ejecutar:

```powershell
node server.js
```

Si la conexión es correcta se mostrará:

```text
Servidor funcionando en http://localhost:3000
Conexión con MySQL realizada correctamente.
```

Después abrir en el navegador:

```text
http://localhost:3000
```

La terminal debe permanecer abierta mientras se utiliza la aplicación.

## Uso básico

### Crear una obra

Completar:

- Nombre.
- Descripción.

Presionar:

```text
Crear obra
```

### Agregar un elemento

Seleccionar:

- Tipo constructivo.
- Nombre del elemento.
- Largo.
- Alto o ancho según corresponda.

El sistema calcula automáticamente la superficie, los materiales y la mano de obra.

### Consultar una obra guardada

En la sección:

```text
Mis obras
```

presionar:

```text
Abrir
```

### Editar un elemento

Presionar:

```text
Editar elemento
```

Modificar sus dimensiones y confirmar.

Todos los cálculos se actualizan automáticamente.

### Eliminar una obra

Presionar:

```text
Eliminar
```

y confirmar la acción.

### Descargar resumen

Presionar:

```text
Descargar resumen TXT
```

El archivo contiene:

- Elementos de la obra.
- Materiales.
- Mano de obra.
- Totales por rubro.
- Total general.

## Alcance actual

La versión actual se concentra en el cómputo técnico de materiales y horas de mano de obra.

Quedan fuera del alcance actual:

- Precios.
- Presupuesto económico.
- 15 % de imprevistos.
- Conversión a unidades comerciales.
- Interpretación automática de planos.
- Renders.
- Cronograma de obra.

Estas funcionalidades pueden incorporarse en futuras versiones.

## Autores

María de los Ángeles Sabaté  
Oriel Cardozo

Tecnicatura Superior en Desarrollo de Software  
Prácticas Profesionalizantes II  
Año 2026

Docente: Diego Galante