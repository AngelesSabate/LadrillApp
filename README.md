# LadrillApp

Aplicación web para el cálculo de materiales y mano de obra en tareas constructivas.

Proyecto desarrollado para Prácticas Profesionalizantes II de la Tecnicatura Superior en Desarrollo de Software.

## Tecnologías utilizadas

- HTML
- CSS
- JavaScript
- Node.js
- Express
- MySQL

## Instalación

### 1. Base de datos

Abrir MySQL Workbench y ejecutar:

`database/ladrillapp.sql`

Esto crea la base de datos, las tablas y los datos iniciales.

### 2. Configurar conexión

Dentro de la carpeta `backend`, copiar:

`.env.example`

y crear un archivo llamado:

`.env`

Completar allí el usuario y contraseña de MySQL.

### 3. Instalar dependencias

Abrir una terminal dentro de `backend` y ejecutar:

```bash
npm install