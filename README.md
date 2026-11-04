# StockPro — Sistema Empresarial de Inventarios y Clientes

StockPro es una plataforma web desarrollada para pequeñas empresas y comercios minoristas (abarrotes, minimarkets, tiendas de conveniencia y distribuidores locales) enfocada en la administración centralizada de inventarios, catálogo de productos, proveedores, clientes y movimientos de mercancía con control transaccional estricto.

---

## Tabla de Contenidos

- [Presentación](#presentación)
- [Funcionalidades del Sistema](#funcionalidades-del-sistema)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Arquitectura y Estructura del Proyecto](#arquitectura-y-estructura-del-proyecto)
- [Modelo de Datos](#modelo-de-datos)
- [Funcionamiento del Inventario](#funcionamiento-del-inventario)
- [Instalación y Configuración](#instalación-y-configuración)
- [Configuración de MySQL](#configuración-de-mysql)
- [API REST](#api-rest)
- [Pruebas Automatizadas](#pruebas-automatizadas)
- [Alcance del Sistema](#alcance-del-sistema)

---

## Presentación

### Problema que Resuelve
Muchos comercios gestionan sus inventarios mediante hojas de cálculo o anotaciones manuales. Esto suele provocar descuadres de inventario, falta de registro sobre quién entregó o recibió la mercancía, errores en las salidas sin disponibilidad física, clientes duplicados y pérdida de tiempo al consultar existencias.

### Objetivo Principal
Brindar un sistema confiable, ágil y con integridad referencial que permita registrar productos, clasificar proveedores, gestionar clientes individuales o corporativos, y auditar con precisión cada entrada, salida o ajuste interno de inventario, asegurando que las existencias nunca queden en estados inconsistentes.

### Tipo de Negocio
Diseñado para pequeñas tiendas, almacenes comerciales, distribuidoras locales, ferreterías, cafeterías y negocios de venta al detalle que requieran un control claro de sus existencias físicas y su cartera de clientes.

---

## Funcionalidades del Sistema

El sistema cuenta con siete módulos activos:

| Módulo | Descripción y Funcionalidad |
| :--- | :--- |
| **Panel Principal (Dashboard)** | Resumen general con indicadores clave (KPI): productos totales, stock global acumulado, clientes activos e historial reciente. Incluye una tabla de alertas tempranas para artículos con stock crítico (≤ 5 unidades) o bajo (≤ 15 unidades). |
| **Categorías** | Organización taxonómica de los artículos. Permite crear, listar, editar y cambiar el estado (activa/inactiva) de las categorías. Protege la eliminación si existen productos asociados. |
| **Proveedores** | Registro de empresas y personas distribuidoras con nombre, teléfono, correo electrónico y dirección física. Muestra el número de productos abastecidos por cada proveedor. |
| **Productos** | Catálogo general con asignación obligatoria a categoría y proveedor existentes, descripción, precio unitario y existencias en almacén. Integra búsqueda por texto y filtros combinados. |
| **Clientes** | Administración de clientes clasificados en dos modalidades: **Personas** y **Empresas**. Permite alta, edición, alternancia de estado activo/inactivo con un clic, validación de identificación única (sin duplicados) y filtros por tipo y estado. |
| **Movimientos de Inventario** | Registro de operaciones de mercancía de tres tipos: **Entrada**, **Salida** y **Ajuste Interno**. Admite vincular un cliente (opcional) y registrar múltiples productos en una misma transacción. |
| **Detalles de Movimientos** | Desglose y auditoría individual de cada línea de producto afectada por un movimiento. Permite consultar el impacto neto en stock, modificar cantidades o dar de baja ítems recalculando el stock del producto. |

---

## Tecnologías Utilizadas

### Frontend
- **React 19** (`react`, `react-dom`): Biblioteca para la interfaz de componentes interactiva.
- **Vite 8** (`vite`, `@vitejs/plugin-react`): Herramienta de compilación rápida y servidor de desarrollo con proxy inverso a la API.
- **Lucide React** (`lucide-react`): Conjunto de iconos vectoriales limpios y coherentes.
- **CSS3 Personalizado**: Identidad visual corporativa basada en morado (`#6d28d9`), superficies blancas y tipografía *Plus Jakarta Sans*, con diseño adaptable a computadoras y dispositivos móviles.

### Backend
- **Node.js**: Entorno de ejecución en servidor.
- **Express 5** (`express`): Framework para la construcción de la API REST en formato JSON.
- **MySQL2** (`mysql2/promise`): Cliente de MySQL con soporte de pool de conexiones y transacciones atómicas.
- **CORS** (`cors`): Middleware para control de acceso de origen cruzado.
- **Dotenv** (`dotenv`): Gestión de variables de entorno mediante archivo `.env`.

### Base de Datos
- **MySQL Server 8.0**: Motor de base de datos relacional InnoDB, codificación `utf8mb4` y cotejamiento `utf8mb4_unicode_ci`.

---

## Arquitectura y Estructura del Proyecto

El repositorio mantiene una separación clara entre base de datos, lógica de backend y aplicación frontend:

```text
StockPro/
├── database/
│   └── stockpro.sql             # Script SQL de creación de base de datos, tablas y datos semilla
├── backend/
│   ├── .env.example             # Plantilla de variables de entorno sin credenciales reales
│   ├── package.json             # Dependencias y scripts de ejecución del backend
│   ├── test_suite.js            # Suite de pruebas automatizadas de base de datos y endpoints
│   └── src/
│       ├── app.js               # Punto de entrada, configuración de middlewares y servidor Express
│       ├── config/
│       │   └── db.js            # Configuración del pool de conexión a MySQL
│       ├── controllers/         # Controladores que procesan solicitudes y respuestas HTTP
│       ├── models/              # Modelos que ejecutan consultas SQL y transacciones de inventario
│       └── routes/              # Definición de rutas REST por módulo
└── frontend/
    ├── index.html               # Documento principal HTML
    ├── package.json             # Dependencias y scripts de ejecución del frontend
    ├── vite.config.js           # Configuración de Vite con proxy hacia http://localhost:5000
    └── src/
        ├── App.jsx              # Estructura de navegación principal y sistema de alertas
        ├── index.css            # Estilos del sistema de diseño empresarial
        ├── components/          # Componentes reutilizables (Sidebar, Navbar, Modal, ConfirmDialog, Toast)
        ├── pages/               # Páginas de cada módulo (Dashboard, Categorías, Productos, etc.)
        └── services/            # Servicios de consumo HTTP hacia la API REST
```

---

## Modelo de Datos

La base de datos se denomina `stockpro` y está compuesta por seis tablas vinculadas mediante restricciones de integridad referencial:

```text
categorias (1) ──────────< productos (N) >────────── (1) proveedores
                               │
                               │ (1)
                               │
                               v (N)
                     detalle_movimientos
                               ^ (N)
                               │
                               │ (1)
                               │
clientes (1) <opt>───────< movimientos (N)
```

### Descripción de las Tablas

1. **`categorias`**: Almacena las agrupaciones de artículos (`id_categoria`, `nombre`, `descripcion`, `estado`).
2. **`proveedores`**: Datos de contacto de empresas o distribuidores abastecedores (`id_proveedor`, `nombre`, `telefono`, `correo`, `direccion`).
3. **`productos`**: Catálogo de bienes comerciales (`id_producto`, `id_categoria`, `id_proveedor`, `nombre`, `descripcion`, `precio`, `stock`).
4. **`clientes`**: Personas o empresas receptoras de mercancía (`id_cliente`, `tipo_cliente`, `nombre`, `identificacion`, `telefono`, `correo`, `direccion`, `estado`, `fecha_registro`). La columna `identificacion` posee restricción de unicidad (`UNIQUE`).
5. **`movimientos`**: Cabecera de operaciones de almacén (`id_movimiento`, `id_cliente`, `fecha`, `tipo`, `observacion`). La clave foránea `id_cliente` permite valores nulos (`NULL`) para registrar operaciones internas o compras.
6. **`detalle_movimientos`**: Renglones de productos que integran cada movimiento (`id_detalle`, `id_movimiento`, `id_producto`, `cantidad`).

---

## Funcionamiento del Inventario

El sistema asegura la consistencia de las existencias mediante las siguientes reglas:

- **Entrada (`entrada`):** Incrementa las existencias del producto en almacén (`+ cantidad`). No exige vincular cliente.
- **Salida (`salida`):** Reduce las existencias del producto (`- cantidad`). Puede vincularse a un cliente registrado.
  - *Validación:* Si la cantidad solicitada supera el stock disponible en almacén, el backend cancela la operación y responde con código de error `400` indicando el producto y la disponibilidad física restante.
- **Ajuste Interno (`ajuste`):** Permite correcciones físicas derivadas de inventarios periódicos. Admite variaciones de aumento o reducción, validando siempre que el stock final resultante no sea inferior a cero.
- **Transaccionalidad Atómica:** Las operaciones que involucran múltiples productos se ejecutan dentro de una transacción (`START TRANSACTION`). Si alguno de los artículos incumple una validación, se ejecuta un `ROLLBACK` completo, impidiendo actualizaciones parciales.
- **Reversión de Inventario:** Al actualizar o eliminar un movimiento o detalle, el sistema revierte primero el efecto anterior sobre el stock antes de registrar los nuevos valores o dar de baja el registro.

---

## Instalación y Configuración

Siga estos pasos ordenados para desplegar el proyecto localmente:

### 1. Clonar el repositorio
```bash
git clone https://github.com/oscarguidorosales101-png/StockPro.git
cd StockPro
```

### 2. Crear la base de datos en MySQL
Inicie su cliente de MySQL o consola y ejecute el script ubicado en `database/stockpro.sql`:

```bash
mysql -u root -p < database/stockpro.sql
```
> El script creará la base de datos `stockpro`, sus seis tablas, índices y datos iniciales de prueba.

### 3. Configurar variables de entorno del backend
Cree un archivo `.env` en la carpeta `backend/` tomando como referencia `.env.example`:

```bash
cp backend/.env.example backend/.env
```

Abra `backend/.env` y complete los valores de conexión a su servidor local de MySQL:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contrasena_mysql
DB_NAME=stockpro
```

### 4. Instalar dependencias del backend
```bash
cd backend
npm install
```

### 5. Instalar dependencias del frontend
En otra ventana de terminal:
```bash
cd frontend
npm install
```

### 6. Iniciar el servidor Backend
```bash
cd backend
npm start
```
> El servidor backend iniciará en `http://localhost:5000` y mostrará la confirmación de conexión a MySQL.

### 7. Iniciar la aplicación Frontend
```bash
cd frontend
npm run dev
```
> La interfaz estará disponible en `http://localhost:3000`. Las peticiones `/api/*` se canalizan automáticamente hacia el backend a través del proxy de Vite.

---

## Configuración de MySQL

La conexión a la base de datos se administra de forma centralizada en [backend/src/config/db.js](file:///c:/Users/Foward/Desktop/mini-proyecto/StockPro/backend/src/config/db.js) utilizando las siguientes variables de entorno:

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `PORT` | Puerto HTTP donde escucha el backend Express | `5000` |
| `DB_HOST` | Dirección del host del servidor MySQL | `127.0.0.1` |
| `DB_PORT` | Puerto de escucha de MySQL | `3306` |
| `DB_USER` | Usuario autorizado con permisos en la base de datos | `root` |
| `DB_PASSWORD` | Contraseña del usuario en el servidor local de MySQL | *(definir en .env)* |
| `DB_NAME` | Nombre de la base de datos relacional | `stockpro` |

---

## API REST

Todas las respuestas de la API utilizan el formato JSON y devuelven un atributo booleano `success` junto con `data` o `message`.

### Rutas Disponibles

| Módulo | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Salud** | `GET` | `/api/health` | Estado del servicio y prueba de conexión a la base de datos |
| **Categorías** | `GET` | `/api/categorias` | Lista todas las categorías con total de productos asociados |
| | `GET` | `/api/categorias/:id` | Obtiene una categoría por su identificador |
| | `POST` | `/api/categorias` | Registra una nueva categoría |
| | `PUT` | `/api/categorias/:id` | Actualiza nombre, descripción o estado de una categoría |
| | `DELETE` | `/api/categorias/:id` | Elimina una categoría (protegida si tiene productos) |
| **Proveedores**| `GET` | `/api/proveedores` | Lista todos los proveedores |
| | `GET` | `/api/proveedores/:id` | Obtiene un proveedor por su ID |
| | `POST` | `/api/proveedores` | Registra un nuevo proveedor |
| | `PUT` | `/api/proveedores/:id` | Actualiza información del proveedor |
| | `DELETE` | `/api/proveedores/:id` | Elimina un proveedor (protegido si tiene productos) |
| **Productos** | `GET` | `/api/productos` | Lista productos con nombre de categoría y proveedor |
| | `GET` | `/api/productos/:id` | Obtiene un producto por su ID |
| | `POST` | `/api/productos` | Crea un producto con validación de categoría y proveedor |
| | `PUT` | `/api/productos/:id` | Actualiza datos del producto |
| | `DELETE` | `/api/productos/:id` | Elimina un producto (protegido si tiene movimientos) |
| **Clientes** | `GET` | `/api/clientes` | Consulta clientes con filtros (`search`, `tipo_cliente`, `estado`) |
| | `GET` | `/api/clientes/:id` | Obtiene un cliente por su ID |
| | `POST` | `/api/clientes` | Registra cliente (`persona` o `empresa`) con validación única de cédula |
| | `PUT` | `/api/clientes/:id` | Actualiza datos del cliente |
| | `PATCH` | `/api/clientes/:id/estado` | Alterna el estado entre activo e inactivo |
| | `DELETE` | `/api/clientes/:id` | Elimina cliente (protegido si tiene movimientos) |
| **Movimientos**| `GET` | `/api/movimientos` | Consulta movimientos con filtros (`tipo`, `id_cliente`, fechas) |
| | `GET` | `/api/movimientos/:id` | Detalle completo de un movimiento y sus renglones |
| | `POST` | `/api/movimientos` | Registra movimiento y actualiza existencias de forma transaccional |
| | `PUT` | `/api/movimientos/:id` | Modifica movimiento revirtiendo el impacto anterior |
| | `DELETE` | `/api/movimientos/:id` | Elimina movimiento y revierte las existencias modificadas |
| **Detalles** | `GET` | `/api/detalle-movimientos` | Lista líneas de detalle con datos de producto y movimiento |
| | `GET` | `/api/detalle-movimientos/:id` | Obtiene un renglón de detalle específico |
| | `POST` | `/api/detalle-movimientos` | Agrega una línea a un movimiento existente recalculando stock |
| | `PUT` | `/api/detalle-movimientos/:id` | Actualiza un detalle recalculando el stock del producto |
| | `DELETE` | `/api/detalle-movimientos/:id` | Elimina un detalle y revierte su impacto en inventario |

### Ejemplo: Registro de Movimiento (`POST /api/movimientos`)

**Cuerpo de la petición (JSON):**
```json
{
  "tipo": "salida",
  "id_cliente": 1,
  "observacion": "Entrega de pedido #104",
  "detalles": [
    { "id_producto": 1, "cantidad": 5 },
    { "id_producto": 3, "cantidad": 2 }
  ]
}
```

**Respuesta exitosa (HTTP 201):**
```json
{
  "success": true,
  "message": "Movimiento registrado e inventario actualizado exitosamente.",
  "data": {
    "id_movimiento": 4,
    "id_cliente": 1,
    "fecha": "2026-11-04 10:00:00",
    "tipo": "salida",
    "observacion": "Entrega de pedido #104",
    "cliente_nombre": "Carlos Alberto Méndez Rojas",
    "detalles": [
      {
        "id_detalle": 6,
        "id_producto": 1,
        "producto_nombre": "Arroz Grano Entero 1kg",
        "cantidad": 5
      }
    ]
  }
}
```

---

## Pruebas Automatizadas

El proyecto incluye un script de prueba de integración de extremo a extremo ubicado en [backend/test_suite.js](file:///c:/Users/Foward/Desktop/mini-proyecto/StockPro/backend/test_suite.js).

### Ejecutar las pruebas
Desde la carpeta `backend`:
```bash
npm test
```

### Aspectos que verifica la suite:
1. Existencia real de la base de datos `stockpro` y de las 6 tablas requeridas.
2. Configuración íntegra de las claves foráneas en el catálogo de MySQL.
3. Operaciones CRUD (Crear, Consultar, Actualizar, Eliminar) en categorías y proveedores.
4. Registro de clientes diferenciando personas y empresas, validación de rechazo de identificaciones duplicadas (`HTTP 400`) y cambio de estado activo/inactivo.
5. Entrada de mercancía y comprobación de aumento de existencias en el producto.
6. Salida de mercancía asociada a un cliente y comprobación de reducción de existencias.
7. Rechazo transaccional (`HTTP 400`) ante intentos de salida con cantidad superior al stock disponible, confirmando que las existencias no sufren modificaciones parciales.
8. Reversión íntegra de stock al eliminar o anular movimientos.
9. Protección de integridad referencial: bloqueo de borrado de categorías con productos o clientes con historial de movimientos.

---

## Alcance del Sistema

- **Orientación:** StockPro está diseñado exclusivamente para la administración comercial de inventarios, almacenes, catálogo de artículos, proveedores y clientes.
- **Límites del alcance actual:** No incluye módulos de autenticación de usuarios (login/registro con contraseñas o tokens), gestión de roles o permisos, facturación electrónica tributaria ni contabilidad formal.
- **Documentación adicional:** La documentación académica o entregables formales de evaluación del curso se gestionan de manera independiente a este repositorio de código.

