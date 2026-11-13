# Inventario de Datos y Clasificación de Información — StockPro

**Sistema:** StockPro — Plataforma Empresarial de Inventarios y Clientes  
**Versión:** 1.0  
**Fecha de Publicación:** 13 de noviembre de 2026  
**Responsables:** Especialista en Gobernanza de Datos y Especialista en Protección de Datos Personales  
**Marco de Referencia:** Ley N° 8968 (Protección de la Persona frente al Tratamiento de sus Datos Personales, Costa Rica), Guía de la Agencia de Protección de Datos de los Habitantes (Prodhab) y principios del Taller de Gobernanza de IA y Datos (FWD).

---

## 1. Propósito y Alcance del Inventario

El presente documento constituye el inventario formal de los activos de información, entidades de datos y flujos transaccionales gestionados por **StockPro**. Su objetivo primordial es identificar de forma exhaustiva qué datos se recolectan, con qué base de legitimación, dónde residen, cuál es su nivel de sensibilidad y quién asume la responsabilidad sobre su custodia y tratamiento, cumpliendo con la premisa fundamental de gobernanza:

> *«Gobernar un sistema es poder contestar por escrito: ¿Quién decide?, ¿Con qué datos?, ¿Quién responde? y ¿Cómo se corrige?»*

El alcance comprende las seis entidades relacionales persistidas en el motor de base de datos MySQL 8.0 bajo el esquema `stockpro`.

---

## 2. Inventario Detallado de Entidades y Campos Reales

### A. Entidad: Categorías (`categorias`)
Estructura relacional para la clasificación taxonómica de los artículos comerciales del comercio.

| Campo | Tipo MySQL | Nulabilidad | Restricción | Descripción de Negocio |
| :--- | :--- | :---: | :---: | :--- |
| `id_categoria` | `INT` | No | PK, Auto Increment | Identificador numérico secuencial del registro. |
| `nombre` | `VARCHAR(100)` | No | Obligatorio | Denominación comercial del rubro (ej. "Abarrotes y Granos"). |
| `descripcion` | `VARCHAR(255)` | Sí | Opcional | Alcance y notas operativas de la categoría. |
| `estado` | `BOOLEAN` | No | Default `TRUE` | Indicador de disponibilidad operativa (1 = Activa, 0 = Inactiva). |

- **Finalidad del dato:** Organización del catálogo de mercancías y segmentación de reportes de existencias.
- **Titular del dato:** La empresa operadora del sistema StockPro.

---

### B. Entidad: Proveedores (`proveedores`)
Registro de personas jurídicas y distribuidores mayoristas que abastecen las existencias del inventario.

| Campo | Tipo MySQL | Nulabilidad | Restricción | Descripción de Negocio |
| :--- | :--- | :---: | :---: | :--- |
| `id_proveedor` | `INT` | No | PK, Auto Increment | Identificador único del proveedor. |
| `nombre` | `VARCHAR(120)` | No | Obligatorio | Razón social o nombre comercial de la casa proveedora. |
| `telefono` | `VARCHAR(30)` | Sí | Opcional | Línea telefónica de contacto comercial o despachos. |
| `correo` | `VARCHAR(120)` | Sí | Opcional | Correo electrónico de ventas, facturación o pedidos. |
| `direccion` | `VARCHAR(255)` | Sí | Opcional | Dirección física de instalaciones, bodegas o centros de distribución. |

- **Finalidad del dato:** Gestión de abastecimiento, coordinación de despachos de compras y auditoría de origen de mercancías.
- **Titular del dato:** Personas jurídicas (proveedores comerciales) y enlaces de contacto profesional.

---

### C. Entidad: Productos (`productos`)
Ficha maestra de mercancías disponibles para venta, control de existencias y valoración contable base.

| Campo | Tipo MySQL | Nulabilidad | Restricción | Descripción de Negocio |
| :--- | :--- | :---: | :---: | :--- |
| `id_producto` | `INT` | No | PK, Auto Increment | Identificador único del artículo comercial. |
| `id_categoria` | `INT` | No | FK $\rightarrow$ `categorias` | Clasificación comercial asociada (`ON DELETE RESTRICT`). |
| `id_proveedor` | `INT` | No | FK $\rightarrow$ `proveedores` | Proveedor habitual que suministra el artículo (`ON DELETE RESTRICT`). |
| `nombre` | `VARCHAR(120)` | No | Obligatorio | Denominación del producto comercializable. |
| `descripcion` | `VARCHAR(255)` | Sí | Opcional | Especificaciones técnicas o notas del producto. |
| `precio` | `DECIMAL(10,2)` | No | Default `0.00` | Precio unitario de venta al público en moneda local (CRC). |
| `stock` | `INT` | No | Default `0` | Existencia física disponible en almacén (no puede ser negativo). |

- **Finalidad del dato:** Control de existencias de almacén, valorización física del inventario y prevención de desabastecimiento.
- **Titular del dato:** La empresa operadora de StockPro.

---

### D. Entidad: Clientes (`clientes`)
Padrón de compradores receptores de mercancías. StockPro implementa una arquitectura bimodal que distingue entre **personas físicas** y **empresas (personas jurídicas)**.

| Campo | Tipo MySQL | Nulabilidad | Restricción | Descripción de Negocio |
| :--- | :--- | :---: | :---: | :--- |
| `id_cliente` | `INT` | No | PK, Auto Increment | Identificador numérico único del cliente. |
| `tipo_cliente` | `VARCHAR(20)` | No | `'persona' \| 'empresa'` | Diferenciador legal del tipo de titular. |
| `nombre` | `VARCHAR(150)` | No | Obligatorio | Nombre y apellidos completos (persona física) o razón social (empresa). |
| `identificacion` | `VARCHAR(30)` | No | UNIQUE (`uk_clientes_identificacion`) | Cédula física costarricense, cédula jurídica, DIMEX o pasaporte. |
| `telefono` | `VARCHAR(30)` | Sí | Opcional | Teléfono celular o fijo para notificaciones de entrega. |
| `correo` | `VARCHAR(120)` | Sí | Opcional | Dirección de correo para comprobantes y comunicaciones. |
| `direccion` | `VARCHAR(255)` | Sí | Opcional | Domicilio de entrega o ubicación geográfica fiscal. |
| `estado` | `BOOLEAN` | No | Default `TRUE` | Estado administrativo (1 = Activo para despachos, 0 = Inactivo). |
| `fecha_registro` | `DATETIME` | No | Default `CURRENT_TIMESTAMP` | Marca temporal exacta de incorporación al sistema. |

- **Diferenciación bimodal y tratamiento jurídico:**
  - **Persona Física (`tipo_cliente = 'persona'`):** Sus datos (`nombre`, `identificacion`, `telefono`, `correo`, `direccion`) están plenamente tutelados por la **Ley N° 8968 de Costa Rica**. Se trata de personas individuales con derechos ARCO (Acceso, Rectificación, Cancelación, Oposición).
  - **Persona Jurídica (`tipo_cliente = 'empresa'`):** Su razón social y cédula jurídica constituyen información comercial de acceso público registral según el Registro Nacional de Costa Rica; sin embargo, los datos de contacto directo de sus personeros deben tratarse bajo estándares de confidencialidad comercial.
- **Finalidad del dato:** Identificación fiscal de compradores, emisión de recibos comerciales y control de despachos de inventario.

---

### E. Entidad: Movimientos (`movimientos`)
Cabecera del registro cronológico (kardex) que documenta cada entrada, salida o ajuste físico de existencias.

| Campo | Tipo MySQL | Nulabilidad | Restricción | Descripción de Negocio |
| :--- | :--- | :---: | :---: | :--- |
| `id_movimiento` | `INT` | No | PK, Auto Increment | Identificador único del movimiento operativo. |
| `id_cliente` | `INT` | Sí | FK $\rightarrow$ `clientes` | Cliente asociado en salidas de venta (NULL en entradas y ajustes). |
| `fecha` | `DATETIME` | No | Default `CURRENT_TIMESTAMP` | Marca de tiempo del suceso operativo. |
| `tipo` | `VARCHAR(20)` | No | `'entrada' \| 'salida' \| 'ajuste'` | Naturaleza de la transacción física. |
| `observacion` | `VARCHAR(255)` | Sí | Opcional | Justificación operativa redactada por el operador del almacén. |

- **Finalidad del dato:** Trazabilidad histórica inmutable de compras, ventas institucionales y auditoría física de bodegas.

---

### F. Entidad: Detalles de Movimientos (`detalle_movimientos`)
Líneas de transacción que especifican los artículos transferidos y la cantidad exacta en cada movimiento.

| Campo | Tipo MySQL | Nulabilidad | Restricción | Descripción de Negocio |
| :--- | :--- | :---: | :---: | :--- |
| `id_detalle` | `INT` | No | PK, Auto Increment | Identificador único de la línea de detalle. |
| `id_movimiento` | `INT` | No | FK $\rightarrow$ `movimientos` | Movimiento al que pertenece (`ON DELETE CASCADE`). |
| `id_producto` | `INT` | No | FK $\rightarrow$ `productos` | Producto transferido (`ON DELETE RESTRICT`). |
| `cantidad` | `INT` | No | Distinto de cero | Unidades involucradas en la operación. |

- **Finalidad del dato:** Desglose transaccional que alimenta el cálculo matemático atómico del stock.

---

## 3. Clasificación de Datos por su Naturaleza y Sensibilidad

Conforme al régimen jurídico costarricense (Ley 8968, Artículos 3 y 9) y los lineamientos del taller, se establece la siguiente matriz de clasificación objetiva:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        MAPA DE CLASIFICACIÓN                           │
├───────────────────────────────┬────────────────────────────────────────┤
│ DATOS COMERCIALES PÚBLICOS    │ Categorías, Productos, Precios         │
├───────────────────────────────┼────────────────────────────────────────┤
│ DATOS COMERCIALES OPERATIVOS  │ Movimientos, Kardex, Stock en bodega   │
├───────────────────────────────┼────────────────────────────────────────┤
│ DATOS PERSONALES RESTRINGIDOS │ Clientes Físicos (Nombre, Cédula,      │
│                               │ Teléfono, Correo, Dirección)           │
├───────────────────────────────┼────────────────────────────────────────┤
│ DATOS SENSIBLES EN SENTIDO LEY│ NINGUNO. StockPro NO recolecta salud,  │
│                               │ etnia, política, biometría ni religión │
└───────────────────────────────┴────────────────────────────────────────┘
```

### 3.1. Datos Comerciales de Acceso Irrestricto
- **Campos:** Nombres de categorías, catálogos de productos y precios de venta al público.
- **Impacto ante fuga:** Nulo o meramente competitivo.
- **Medidas requeridas:** Asegurar la integridad del catálogo contra alteraciones indebidas.

### 3.2. Datos Comerciales Confidenciales y Operativos
- **Campos:** Márgenes de inventario, stock crítico en bodega, observaciones internas de ajustes de faltantes/mermas, listas y contactos de proveedores mayoristas.
- **Impacto ante fuga:** Pérdida de ventaja comercial, exposición de relaciones de proveeduría y vulnerabilidad logística.
- **Medidas requeridas:** Restricción de acceso mediante autenticación y prohibición de exportación hacia herramientas no autorizadas.

### 3.3. Datos Personales de Acceso Restringido (Tutela Ley 8968)
- **Campos identificados:**
  - `clientes.nombre` (Persona física)
  - `clientes.identificacion` (Cédula de identidad física, pasaporte, DIMEX)
  - `clientes.telefono` (Número personal de contacto)
  - `clientes.correo` (Buzón electrónico personal)
  - `clientes.direccion` (Domicilio privado de entrega)
- **Aclaración legal indispensable:** Estos campos **NO constituyen datos sensibles** en el sentido jurídico de la Ley 8968 (el Art. 9 define datos sensibles como aquellos que revelan origen racial, convicciones religiosas, opiniones políticas, datos de salud o vida sexual). Sin embargo, son **datos personales de acceso restringido** que requieren consentimiento informado, principio de calidad, almacenamiento seguro y estricto deber de confidencialidad.

---

## 4. Ciclo de Vida de los Datos en StockPro

El siguiente esquema documenta el tránsito de los datos en la arquitectura actual:

| Fase del Ciclo | Proceso Real en StockPro | Mecanismos Existentes en Código | Estado de Cumplimiento |
| :--- | :--- | :--- | :---: |
| **1. Recolección** | Ingreso manual de datos en formularios React (`ClientesPage.jsx`, `MovimientosPage.jsx`). | Validación de formatos en frontend y rechazo de cédulas duplicadas en backend (`clienteService.js`). | **Parcial**: No existe formulario de consentimiento informado ni aviso de privacidad visible. |
| **2. Almacenamiento** | Persistencia directa en base de datos MySQL 8.0, tablas con motor `InnoDB` y codificación `utf8mb4`. | Restricciones de integridad referencial, transacciones atómicas `START TRANSACTION` / `COMMIT`. | **Parcial**: Almacenamiento en texto claro; MySQL no tiene cifrado TDE activo por defecto. |
| **3. Consulta** | Peticiones HTTP `GET` a través de la API REST hacia controladores y modelos. | Consultas preparadas parametrizadas (`pool.query(sql, params)`). | **Implementado**, pero carece de control de acceso por roles (cualquiera en red local consulta). |
| **4. Modificación** | Peticiones HTTP `PUT` y `PATCH` para actualización de datos maestros y estados. | Control de duplicados en cédula excluyendo el ID editado (`findByIdentificacion(id)`). | **Implementado**. |
| **5. Eliminación / Supresión** | Invocación HTTP `DELETE /api/clientes/:id`. | Bloqueo referencial (`RESTRICT`): Si el cliente tiene movimientos, el backend rechaza la eliminación con `HTTP 400`. Opción de desactivación lógica (`estado = 0`). | **Implementado** para integridad contable; **Pendiente** mecanismo de anonimización para derecho de supresión. |
| **6. Conservación** | Los registros permanecen indefinidamente en las tablas maestras y de movimientos. | No existe rutina de purga o archivo histórico pasivo. | **Pendiente de evaluación**: Requiere definir política de retención contable (ej. 5 años según Código de Comercio de Costa Rica). |
| **7. Destrucción / Purga** | No implementada de forma automática. | Comandos manuales `DELETE` controlados. | **No implementado**. |

---

## 5. Matriz de Cumplimiento: Ley N° 8968 y Principios de Protección

Alineado con la práctica presentada en el Taller FWD (evaluación formal basada en evidencia):

| Principio / Requisito Legal | Art. Ley 8968 | Estado Actual en StockPro | Evidencia en Código y Brecha Identificada |
| :--- | :---: | :---: | :--- |
| **Consentimiento Informado** | Art. 5 | **No implementado** | El frontend registra clientes directamente sin desplegar casilla de aceptación de términos, finalidad del tratamiento ni destino de los datos. |
| **Principio de Calidad y Veracidad** | Art. 4 | **Comprobado** | La base de datos garantiza unicidad de cédula (`uk_clientes_identificacion`) y el servicio rechaza identificaciones vacías o duplicadas. |
| **Principio de Finalidad** | Art. 4 | **Comprobado** | Los datos recolectados se utilizan exclusivamente para despachos comerciales y control de existencias. No se ceden a terceros. |
| **Derecho de Acceso** | Art. 7.1 | **Comprobado** | La API expone `GET /api/clientes` y `GET /api/clientes/:id` retornando la ficha íntegra del titular en formato JSON. |
| **Derecho de Rectificación** | Art. 7.2 | **Comprobado** | La API expone `PUT /api/clientes/:id` permitiendo corregir nombres, teléfonos, correos y domicilios de manera inmediata. |
| **Derecho de Supresión / Cancelación** | Art. 7.3 | **Mitigado Parcialmente** | El borrado físico se bloquea por protección del kardex contable (`HTTP 400`), pero se provee desactivación lógica mediante `PATCH /api/clientes/:id/estado`. Se requiere una función de anonimización. |
| **Confidencialidad y Secreto Profesional** | Art. 11 | **Documentado pero no comprobado** | Los datos no se transfieren al exterior, pero la ausencia de autenticación HTTP en la API representa un riesgo de exposición en redes locales. |
| **Seguridad de las Comunicaciones** | Art. 10 | **Pendiente de evaluación** | La conexión backend-frontend corre en HTTP plano (`http://localhost:5000`); requiere despliegue sobre TLS/HTTPS en producción. |
| **Enmascaramiento en Registros (Logs)** | Art. 10 | **No implementado** | `errorHandler.js` imprime mensajes de error en consola sin ofuscar cédulas o correos electrónicos. |

---

## 6. Las Cuatro Preguntas Fundamentales Aplicadas a los Datos

En concordancia con el marco conceptual del taller:

1. **¿Quién decide sobre los datos?**  
   Exclusivamente el personal administrativo humano debidamente autorizado del comercio. Ningún modelo de IA o proceso desatendido tiene potestad para clasificar o descartar clientes.
2. **¿Con qué datos opera el sistema?**  
   Con los datos mínimos indispensables para la facturación interna y el despacho de inventario (principio de minimización). No se recolectan datos biométricos, financieros de tarjetas ni datos de salud.
3. **¿Quién responde legal y técnicamente?**  
   La persona física o el representante legal de la empresa operadora de StockPro ante los clientes y ante la Prodhab. Técnicamente, el administrador del servidor responde por la custodia de la base de datos MySQL.
4. **¿Cómo se corrige un error o reclamo?**  
   Mediante la actualización directa en los formularios de edición de clientes (`PUT /api/clientes/:id`) o el restablecimiento de estados mediante los mecanismos de soporte administrativo habilitados.

