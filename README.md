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
- [Documentación Académica](#documentación-académica)
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
- **CSS3 Personalizado en `styles/`**: Identidad visual corporativa basada en morado (`#6d28d9`), superficies blancas y tipografía *Plus Jakarta Sans*, con diseño adaptable a computadoras y dispositivos móviles.

### Backend
- **Node.js**: Entorno de ejecución en servidor.
- **Express 5** (`express`): Framework para la construcción de la API REST en formato JSON.
- **MySQL2** (`mysql2/promise`): Conexión directa mediante pool con promesas y transacciones atómicas.
- **CORS** (`cors`): Middleware para control de acceso de origen cruzado.
- **Dotenv** (`dotenv`): Gestión de variables de entorno mediante archivo `.env`.

### Base de Datos
- **MySQL Server 8.0**: Motor de base de datos relacional InnoDB, codificación `utf8mb4` y cotejamiento `utf8mb4_unicode_ci`.

---

## Arquitectura y Estructura del Proyecto

El proyecto implementa una arquitectura desacoplada y organizada por capas de responsabilidad:

```text
StockPro/
├── database/
│   └── stockpro.sql             # Script SQL de creación de base de datos, tablas y datos semilla
├── docs/                        # Documentación académica y técnica formal
│   ├── idea-empresarial.md      # Justificación empresarial y contexto del problema
│   ├── modelo-entidad-relacion.md # Diccionario de datos y especificación ER
│   ├── cumplimiento-academico.md # Matriz de evaluación Mini Proyecto 1 (Día 1)
│   └── StockPro.drawio          # Diagrama ER interactivo editable en draw.io
├── backend/
│   ├── .env                     # Variables de entorno locales (ignorado en Git)
│   ├── .env.example             # Plantilla de variables de entorno sin credenciales
│   ├── app.js                   # Configuración de Express, middlewares y rutas
│   ├── server.js                # Inicio del servidor HTTP y verificación de base de datos
│   ├── package.json             # Dependencias y scripts de backend (start, dev, test)
│   ├── test_suite.js            # Batería de pruebas automatizadas de endpoints e inventario
│   ├── config/                  # Conexión y configuración de MySQL (pool mysql2)
│   ├── controllers/             # Operaciones y respuestas HTTP (req, res, next)
│   ├── services/                # Lógica empresarial y reglas de validación
│   ├── models/                  # Representación de entidades y consultas SQL directas
│   ├── routes/                  # Definición de routers y endpoints REST
│   ├── middlewares/             # Manejador centralizado de errores y rutas 404
│   └── migrations/              # Trazabilidad de cambios estructurales (DDL)
└── frontend/
    ├── index.html               # Documento principal HTML
    ├── package.json             # Dependencias y scripts de ejecución de React
    ├── vite.config.js           # Configuración de Vite con proxy hacia http://localhost:5000
    └── src/
        ├── App.jsx              # Estructura de navegación principal y sistema de alertas Toast
        ├── main.jsx             # Punto de entrada de la aplicación React
        ├── assets/              # Imágenes y recursos estáticos
        ├── styles/              # Hojas de estilo visuales (index.css, App.css)
        ├── components/          # Componentes reutilizables (Sidebar, Navbar, Modal, ConfirmDialog, Toast)
        ├── pages/               # Vistas de cada módulo (Dashboard, Categorías, Productos, etc.)
        └── services/            # Servicios cliente HTTP hacia la API REST
```

### Flujo de Datos en el Backend:
1. **Ruta (`routes/`):** Recibe la petición HTTP y la canaliza al controlador.
2. **Controlador (`controllers/`):** Extrae parámetros y cuerpo, delega la operación al servicio y envía la respuesta HTTP adecuada.
3. **Servicio (`services/`):** Aplica las reglas de negocio (validaciones, control de duplicados, cálculo de existencias) y coordina con los modelos.
4. **Modelo (`models/`):** Ejecuta las sentencias SQL en MySQL a través del pool de conexiones con soporte transaccional.
5. **Middlewares (`middlewares/`):** Capturan y estandarizan los errores con códigos HTTP coherentes (400, 404, 500).

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

### Tablas Implementadas

1. **`categorias`**: Clasificación taxonómica (`id_categoria`, `nombre`, `descripcion`, `estado`).
2. **`proveedores`**: Datos de distribuidores (`id_proveedor`, `nombre`, `telefono`, `correo`, `direccion`).
3. **`productos`**: Artículos comerciales (`id_producto`, `id_categoria`, `id_proveedor`, `nombre`, `descripcion`, `precio`, `stock`).
4. **`clientes`**: Compradores personas o empresas (`id_cliente`, `tipo_cliente`, `nombre`, `identificacion` UNIQUE, `telefono`, `correo`, `direccion`, `estado`, `fecha_registro`).
5. **`movimientos`**: Cabeceras de transacciones (`id_movimiento`, `id_cliente` NULL permitido, `fecha`, `tipo`, `observacion`).
6. **`detalle_movimientos`**: Renglones por producto (`id_detalle`, `id_movimiento`, `id_producto`, `cantidad`).

---

## Funcionamiento del Inventario

El sistema asegura la consistencia de las existencias mediante las siguientes reglas:

- **Entrada (`entrada`):** Incrementa las existencias del producto en almacén (`+ cantidad`). No exige cliente.
- **Salida (`salida`):** Reduce las existencias del producto (`- cantidad`). Puede vincularse a un cliente registrado.
  - *Validación:* Si la cantidad solicitada supera el stock disponible en almacén, el backend cancela la operación con error `400` impidiendo stock negativo.
- **Ajuste Interno (`ajuste`):** Permite correcciones físicas derivadas de inventarios periódicos. Admite variaciones de aumento o reducción, validando siempre que el stock final no sea inferior a cero.
- **Transaccionalidad Atómica:** Operaciones multi-ítem ejecutadas con `START TRANSACTION` y bloqueo `FOR UPDATE`. Ante cualquier fallo, se ejecuta `ROLLBACK` total.
- **Reversión de Inventario:** Al actualizar o eliminar un movimiento o detalle, el sistema revierte primero el efecto anterior sobre el stock antes de aplicar los nuevos valores o dar de baja el registro.

---

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/oscarguidorosales101-png/StockPro.git
cd StockPro
```

### 2. Crear la base de datos en MySQL
Ejecute el script ubicado en `database/stockpro.sql`:
```bash
mysql -u root -p < database/stockpro.sql
```

### 3. Configurar variables de entorno del backend
Cree un archivo `.env` en la carpeta `backend/` a partir de `.env.example`:
```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env` con las credenciales locales de su MySQL:
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
En otra terminal:
```bash
cd frontend
npm install
```

### 6. Iniciar el servidor Backend
```bash
cd backend
npm start
```
> El servidor backend escuchará en `http://localhost:5000` e imprimirá la confirmación de conexión a MySQL.

### 7. Iniciar la aplicación Frontend
```bash
cd frontend
npm run dev
```
> La interfaz estará disponible en `http://localhost:3000`. Las peticiones `/api/*` se reenvían al backend mediante el proxy de Vite.

---

## Configuración de MySQL

La conexión se gestiona en [backend/config/db.js](file:///c:/Users/Foward/Desktop/mini-proyecto/StockPro/backend/config/db.js) mediante las siguientes variables:

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `PORT` | Puerto HTTP del servidor Express | `5000` |
| `DB_HOST` | Host del servidor MySQL | `127.0.0.1` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_USER` | Usuario autorizado con permisos en MySQL | `root` |
| `DB_PASSWORD` | Contraseña del usuario local | *(definir en .env)* |
| `DB_NAME` | Nombre de la base de datos relacional | `stockpro` |

---

## API REST

| Módulo | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Salud** | `GET` | `/api/health` | Estado del servicio y verificación de conexión a MySQL |
| **Categorías** | `GET` | `/api/categorias` | Lista categorías con total de productos asociados |
| | `GET` | `/api/categorias/:id` | Consulta una categoría por ID |
| | `POST` | `/api/categorias` | Registra una nueva categoría |
| | `PUT` | `/api/categorias/:id` | Actualiza nombre, descripción o estado |
| | `DELETE` | `/api/categorias/:id` | Elimina categoría (protegida si contiene productos) |
| **Proveedores**| `GET` | `/api/proveedores` | Lista proveedores |
| | `GET` | `/api/proveedores/:id` | Consulta un proveedor por ID |
| | `POST` | `/api/proveedores` | Registra un nuevo proveedor |
| | `PUT` | `/api/proveedores/:id` | Actualiza información del proveedor |
| | `DELETE` | `/api/proveedores/:id` | Elimina proveedor (protegido si tiene productos) |
| **Productos** | `GET` | `/api/productos` | Lista productos con nombre de categoría y proveedor |
| | `GET` | `/api/productos/:id` | Consulta un producto por ID |
| | `POST` | `/api/productos` | Registra producto validando categoría y proveedor |
| | `PUT` | `/api/productos/:id` | Actualiza datos del producto |
| | `DELETE` | `/api/productos/:id` | Elimina producto (protegido si tiene movimientos) |
| **Clientes** | `GET` | `/api/clientes` | Consulta clientes con filtros (`search`, `tipo_cliente`, `estado`) |
| | `GET` | `/api/clientes/:id` | Consulta un cliente por ID |
| | `POST` | `/api/clientes` | Registra persona o empresa validando cédula única |
| | `PUT` | `/api/clientes/:id` | Actualiza datos del cliente |
| | `PATCH` | `/api/clientes/:id/estado` | Alterna estado activo/inactivo |
| | `DELETE` | `/api/clientes/:id` | Elimina cliente (protegido si tiene movimientos) |
| **Movimientos**| `GET` | `/api/movimientos` | Consulta movimientos con filtros (`tipo`, cliente, fechas) |
| | `GET` | `/api/movimientos/:id` | Detalle completo de movimiento y sus productos |
| | `POST` | `/api/movimientos` | Registra movimiento y actualiza stock transaccionalmente |
| | `PUT` | `/api/movimientos/:id` | Modifica movimiento revirtiendo impacto anterior |
| | `DELETE` | `/api/movimientos/:id` | Elimina movimiento y revierte el stock |
| **Detalles** | `GET` | `/api/detalle-movimientos` | Lista líneas de detalle individuales |
| | `GET` | `/api/detalle-movimientos/:id` | Consulta un renglón de detalle por ID |
| | `POST` | `/api/detalle-movimientos` | Agrega un renglón a un movimiento recalculando stock |
| | `PUT` | `/api/detalle-movimientos/:id` | Actualiza cantidad recalculando el stock del producto |
| | `DELETE` | `/api/detalle-movimientos/:id` | Elimina un detalle y revierte su impacto |

---

## Pruebas Automatizadas

El proyecto incluye dos suites automatizadas de integración y auditoría integral en `backend/`:
- `backend/test_suite.js`: Verificación relacional de 7 etapas con control transaccional de stock.
- `backend/audit_runner.js`: Auditoría exhaustiva de 46 aserciones que valida todas las rutas REST (GET, GET/:id, POST, PUT, DELETE) en las seis entidades, persistencia de formularios y pruebas HTTP estilo Postman/Thunder Client.

Para ejecutarlas:
```bash
cd backend
npm test          # Ejecuta ambas suites de prueba consecutivamente
npm run audit     # Ejecuta la auditoría integral de 46 aserciones
```

Verifica:
1. Existencia de base de datos `stockpro` y sus 6 tablas.
2. Claves foráneas e integridad referencial en el catálogo de MySQL.
3. Operaciones CRUD (GET, GET/:id, POST, PUT, DELETE) en las seis entidades.
4. Rechazo de cédulas duplicadas (`HTTP 400`).
5. Aumento de existencias en entradas y reducción en salidas.
6. Rechazo de salidas sobregiradas (`HTTP 400`) y conservación del stock sin cambios parciales.
7. Reversión íntegra de inventario al eliminar movimientos o detalles.
8. Bloqueo de eliminación de entidades con relaciones dependientes.
9. Llamadas cliente REST estilo Postman y Thunder Client respondiendo HTTP 200/201 en JSON.

---

## Documentación Académica y Colecciones de API

En la carpeta [`docs/`](docs/) se encuentran disponibles los entregables académicos del proyecto y colecciones listas para importar:

- [docs/idea-empresarial.md](docs/idea-empresarial.md): Justificación empresarial, contexto del negocio, objetivos y beneficios operativos.
- [docs/modelo-entidad-relacion.md](docs/modelo-entidad-relacion.md): Diccionario de datos exhaustivo, claves foráneas, reglas de negocio y diagrama Mermaid.
- [docs/StockPro.drawio](docs/StockPro.drawio): Diagrama Entidad-Relación editable en formato XML estándar de draw.io.
- [docs/cumplimiento-academico.md](docs/cumplimiento-academico.md): Matriz de correspondencia con los criterios y rúbrica de evaluación del Mini Proyecto 1 (Día 1).
- [docs/StockPro.postman_collection.json](docs/StockPro.postman_collection.json): Colección de endpoints REST exportada y lista para importar directamente en **Postman**.
- [docs/StockPro.thunder_collection.json](docs/StockPro.thunder_collection.json): Colección de endpoints lista para importar en la extensión **Thunder Client** de Visual Studio Code.(Día 1).

---

## Alcance del Sistema

- **Orientación:** Gestión administrativa y operativa de inventarios, catálogo de artículos, proveedores y clientes en pequeñas y medianas empresas.
- **Límites de la fase actual:** No incluye módulos de autenticación de usuarios (login con contraseñas o tokens), gestión de roles, facturación electrónica tributaria ni contabilidad formal (reservados para etapas académicas posteriores).
