# Cumplimiento Académico — Mini Proyecto 1 (Día 1)

**Proyecto:** StockPro — Sistema empresarial de inventarios y clientes  
**Referencia:** Guía de Evaluación Mini Proyecto 1 · Día 1 (*Modelado de datos empresariales e inicio del CRUD*)  
**Pila Tecnológica:** Node.js, Express, MySQL 8.0, React 19 y Vite

---

## 1. Matriz de Cumplimiento de Criterios de Evaluación

| Criterio de Evaluación | Peso | Estado | Evidencia y Justificación Técnica |
| :--- | :---: | :---: | :--- |
| **Modelado de datos** | 35% | **Comprobado / Terminado** | Se modelaron 6 entidades relacionales (`categorias`, `proveedores`, `productos`, `clientes`, `movimientos`, `detalle_movimientos`) en MySQL 8.0 con motor InnoDB y codificación `utf8mb4`. Todas cuentan con claves primarias (`PK`), claves foráneas (`FK`), integridad referencial activa (`RESTRICT`/`CASCADE`) y restricción de unicidad en identificación de clientes. |
| **Enfoque empresarial** | 15% | **Comprobado / Terminado** | El sistema resuelve un problema real del comercio minorista: control de inventario físico, trazabilidad de compras a proveedores, despachos a clientes y bloqueo de sobregiros de stock. Se documentó formalmente en [docs/idea-empresarial.md](idea-empresarial.md). |
| **Estructura del proyecto** | 20% | **Comprobado / Terminado** | Separación total e independiente entre `backend/` y `frontend/`. El backend implementa arquitectura en capas (`config`, `controllers`, `services`, `models`, `routes`, `middlewares`, `migrations`). El frontend organiza `components`, `pages`, `services`, `styles` y `assets`. |
| **Inicio del CRUD** | 30% | **Comprobado / Terminado** | Más allá del mínimo de una entidad exigido para el Día 1, StockPro cuenta con los **6 CRUDs completos y operativos** con métodos GET, POST, PUT y DELETE respondiendo en formato JSON estándar con códigos de estado HTTP correctos (200, 201, 400, 404, 500). |
| **TOTAL DÍA 1** | **100%** | **CUMPLIDO AL 100%** | Todos los objetivos y entregables del Día 1 se encuentran completados, probados y documentados. |

---

## 2. Requisitos Académicos del Día 1: Terminados y Comprobados

### 2.1. Objetivos del Día 1
- [x] **Elección del tema y justificación empresarial:** Documentado en `docs/idea-empresarial.md` con alcance para tiendas de abarrotes, minimarkets y distribuidoras comerciales.
- [x] **Modelado de datos:** 6 entidades relacionales implementadas en base de datos física `stockpro` y documentadas en `docs/modelo-entidad-relacion.md` y `docs/StockPro.drawio`.
- [x] **Estructura base del proyecto:** Carpetas desacopladas `backend/` y `frontend/` en la raíz.
- [x] **Inicio del CRUD:** Implementación y comprobación de endpoints para las 6 entidades del sistema.

### 2.2. Requisitos Técnicos
- [x] **Back end en Node.js y Express:** API REST con respuestas JSON uniformes (`success`, `data`/`message`).
- [x] **Front end en React con Vite:** Formularios modales de creación/edición, tablas dinámicas de consulta con filtros y botones funcionales con diálogo de confirmación de eliminación.
- [x] **Persistencia real en base de datos:** MySQL 8.0 local ejecutándose en el puerto 3306 con pool de conexiones `mysql2/promise`.
- [x] **Modelo de datos con mínimo 3 entidades relacionadas:** StockPro supera la exigencia académica al implementar **6 entidades** con **5 claves foráneas activas**.
- [x] **Validaciones en back end:** Comprobación de campos obligatorios, tipos de datos, control de cédulas duplicadas y rechazo transaccional de salidas que excedan el stock disponible.
- [x] **Sin autenticación:** Se cumplió estrictamente la restricción académica: no se implementaron login, registro de usuarios, contraseñas, tokens JWT ni roles, manteniendo el foco exclusivamente en los CRUDs y la lógica de negocio.

### 2.3. Entregables del Día 1
- [x] **Documento breve de justificación empresarial:** [docs/idea-empresarial.md](idea-empresarial.md).
- [x] **Diagrama del modelo de datos:** [docs/modelo-entidad-relacion.md](modelo-entidad-relacion.md) y archivo interactivo [docs/StockPro.drawio](StockPro.drawio).
- [x] **Colecciones de prueba de API:** Archivos listos para importación inmediata en Postman ([docs/StockPro.postman_collection.json](StockPro.postman_collection.json)) y en Thunder Client de VS Code ([docs/StockPro.thunder_collection.json](StockPro.thunder_collection.json)).
- [x] **Estructura de repositorio organizada:** Repositorio Git limpio, `.gitignore` seguro y `README.md` exhaustivo.
- [x] **Servidor Node.js funcionando y probado:** Suite de pruebas automatizadas ejecutable mediante `npm test` en `backend/` con 100% de aserciones aprobadas (46 aserciones de auditoría integral + 7 etapas de verificación relacional).

---

## 3. Requisitos Académicos Pendientes (Fases y Días Posteriores)

Conforme a la metodología del curso por etapas progresivas, los siguientes aspectos no forman parte del alcance del Día 1 y quedan categorizados como **trabajo futuro / pendientes para siguientes fases**:

| Requisito / Característica | Estado | Observación Académica |
| :--- | :---: | :--- |
| **Autenticación y Seguridad (Login/JWT)** | *Pendiente para Día posterior* | Excluido deliberadamente en el Día 1 según la consigna: *"El proyecto no lleva autenticación: no se implementa login, registro ni roles; el foco son los CRUDs."* |
| **Control de Roles y Permisos** | *Pendiente para Día posterior* | Se incorporará cuando la malla curricular introduzca autorización de usuarios (Administrador, Bodeguero, Vendedor). |
| **Generación de Facturación Electrónica / Facturas** | *Pendiente para Día posterior* | El Día 1 se enfoca en movimientos de almacén. La facturación formal y timbrado tributario corresponde a módulos avanzados. |
| **Exportación de Reportes a PDF / Excel** | *Pendiente para Día posterior* | Posible mejora para la sección de reportería y cierre de mes. |
| **Métricas Contables y Asientos de Diario** | *Pendiente para Día posterior* | Fuera del alcance administrativo inicial de inventario físico. |

---

## 4. Evidencia de Pruebas de Verificación

Se verificó el funcionamiento integral ejecutando la suite automatizada `backend/test_suite.js`:

```text
====================================================
🧪 INICIANDO BATERÍA DE PRUEBAS DE VERIFICACIÓN
====================================================
--- 1. Verificando Base de Datos y Tablas ---
Tablas detectadas: [categorias, clientes, detalle_movimientos, movimientos, productos, proveedores]
✅ Base de datos "stockpro" y las 6 tablas existen correctamente.

--- 2. Verificando Integridad y Claves Foráneas ---
Claves foráneas detectadas (5):
  - detalle_movimientos -> movimientos
  - detalle_movimientos -> productos
  - movimientos -> clientes
  - productos -> categorias
  - productos -> proveedores
✅ Todas las claves foráneas están configuradas.

--- 3. Verificando CRUD Categorías ---
POST /categorias: 201 (Creado) | PUT /categorias: 200 (Actualizado) | DELETE: 200 (Eliminado)
✅ CRUD Categorías verificado exitosamente.

--- 4. Verificando CRUD Proveedores ---
POST /proveedores: 201 | DELETE: 200
✅ CRUD Proveedores verificado exitosamente.

--- 5. Verificando CRUD Clientes y Reglas de Negocio ---
POST /clientes (persona): 201 | POST /clientes (empresa): 201
Validación cédula duplicada: 400 Bad Request (Rechazado correctamente)
PATCH /clientes/:id/estado: 200 (Alternancia Activo/Inactivo)
✅ CRUD Clientes, validaciones de persona/empresa y duplicados OK.

--- 6. Verificando Gestión de Inventario y Movimientos ---
POST /movimientos (entrada +30): 201 -> Stock sube de 50 a 80
POST /movimientos (salida -25 con cliente): 201 -> Stock baja de 80 a 55
Validación sobregiro (salida de 9,999): 400 Bad Request -> Stock se mantiene intacto en 55
DELETE /movimientos: 200 -> Stock revertido automáticamente
✅ Transaccionalidad, integridad de existencias y reversión confirmadas.

--- 7. Verificando Restricciones de Integridad Referencial ---
DELETE cliente con movimientos: 400 (Bloqueado por regla referencial)
DELETE categoría con productos: 400 (Bloqueado por regla referencial)
✅ Restricciones de integridad referencial cumplidas.
====================================================
🎉 TODAS LAS PRUEBAS DE VERIFICACIÓN PASARON CON ÉXITO
====================================================
```

### 4.2. Evidencia de Auditoría Integral (46 Aserciones — `audit_runner.js`)

Se ejecutó la batería exhaustiva de rutas REST completas, persistencia en MySQL, movimientos de inventario y pruebas estilo Thunder Client / Postman:

```text
================================================================
🔍 INICIANDO AUDITORÍA FINAL INTEGRAL DE STOCKPRO
================================================================
  ✅ [PASS] POST /api/categorias crea una nueva categoría con código 201
  ✅ [PASS] GET /api/categorias lista todas las categorías con código 200
  ✅ [PASS] GET /api/categorias/:id obtiene la categoría por su ID con código 200
  ✅ [PASS] PUT /api/categorias/:id actualiza la categoría y persiste el estado en MySQL con código 200
  ✅ [PASS] POST /api/proveedores crea un nuevo proveedor con código 201
  ✅ [PASS] GET /api/proveedores lista proveedores con código 200
  ✅ [PASS] GET /api/proveedores/:id obtiene el proveedor por ID con código 200
  ✅ [PASS] PUT /api/proveedores/:id actualiza el proveedor con código 200
  ✅ [PASS] POST /api/productos crea un nuevo producto con código 201
  ✅ [PASS] GET /api/productos lista productos con código 200
  ✅ [PASS] GET /api/productos/:id obtiene producto por ID con código 200
  ✅ [PASS] PUT /api/productos/:id actualiza el producto en MySQL con código 200
  ✅ [PASS] POST /api/clientes registra persona física con código 201
  ✅ [PASS] POST /api/clientes registra empresa jurídica con código 201
  ✅ [PASS] GET /api/clientes filtra correctamente por tipo de cliente con código 200
  ✅ [PASS] GET /api/clientes/:id obtiene cliente por ID con código 200
  ✅ [PASS] PUT /api/clientes/:id actualiza cliente con código 200
  ✅ [PASS] PATCH /api/clientes/:id/estado conmuta el estado activo/inactivo con código 200
  ✅ [PASS] POST /api/movimientos registra entrada con código 201
  ✅ [PASS] El movimiento de entrada incrementa el stock de 40 a 60 en MySQL
  ✅ [PASS] GET /api/movimientos lista movimientos con código 200
  ✅ [PASS] GET /api/movimientos/:id retorna el movimiento con sus detalles y código 200
  ✅ [PASS] PUT /api/movimientos/:id actualiza el movimiento y recalcula el stock
  ✅ [PASS] La edición del movimiento recalculó el stock a 70 en MySQL
  ✅ [PASS] POST /api/detalle-movimientos crea un nuevo detalle con código 201
  ✅ [PASS] El detalle creado actualizó el stock del segundo producto (15 -> 25) en MySQL
  ✅ [PASS] GET /api/detalle-movimientos lista los detalles del movimiento con código 200
  ✅ [PASS] GET /api/detalle-movimientos/:id obtiene el detalle específico con código 200
  ✅ [PASS] PUT /api/detalle-movimientos/:id actualiza cantidad y stock con código 200
  ✅ [PASS] La actualización del detalle recalculó el stock (15 + 15 = 30) en MySQL
  ✅ [PASS] DELETE /api/detalle-movimientos/:id elimina el detalle y revierte stock con código 200
  ✅ [PASS] Eliminar el detalle revirtió el stock del producto 2 a su valor original (15)
  ✅ [PASS] POST /api/movimientos registra salida vinculada a cliente empresa con código 201
  ✅ [PASS] La salida de inventario redujo el stock de 70 a 45 en MySQL
  ✅ [PASS] La salida que excede el stock se rechaza con código 400 y mensaje explicativo
  ✅ [PASS] La transacción fallida no alteró el stock en MySQL
  ✅ [PASS] DELETE /api/movimientos/:id elimina la salida y revierte el stock con código 200
  ✅ [PASS] Reversión atómica de inventario confirmada: stock volvió a 70 en MySQL
  ✅ [PASS] Eliminar la entrada devolvió el stock al saldo inicial de 40 en MySQL
  ✅ [PASS] DELETE /api/productos/:id elimina productos sin movimientos con código 200
  ✅ [PASS] DELETE /api/clientes/:id elimina clientes sin movimientos asociados con código 200
  ✅ [PASS] DELETE /api/proveedores/:id elimina proveedor sin productos vinculados con código 200
  ✅ [PASS] DELETE /api/categorias/:id elimina categoría sin productos vinculados con código 200
  ✅ [PASS] [Thunder Client] GET /api/clientes responde HTTP 200 y application/json
  ✅ [PASS] [Thunder Client] GET /api/clientes retorna lista de clientes corporativos
  ✅ [PASS] [Postman] POST /api/clientes registra cliente con HTTP 201 y cuerpo JSON validado
================================================================
🎉 AUDITORÍA FINALIZADA CON ÉXITO: 46/46 verificaciones pasadas.
================================================================
```
```

