# Idea Empresarial y Justificación del Sistema — StockPro

## 1. Identificación del Negocio y Contexto Operativo

**StockPro** es una plataforma web empresarial diseñada específicamente para resolver los desafíos operativos y administrativos de pequeñas empresas, comercios minoristas y distribuidoras locales (tiendas de abarrotes, minimarkets, panaderías, depósitos y comercios de conveniencia).

En el entorno comercial actual, los pequeños negocios suelen operar bajo esquemas informales o semi-manuales, registrando inventarios en libretas de apuntes o en hojas de cálculo aisladas (Excel). Esta metodología genera problemáticas críticas que comprometen la rentabilidad y la continuidad de la empresa:

1. **Descuadres constantes de inventario:** Falta de correlación entre lo que figura en papel y las existencias físicas reales en bodega.
2. **Ventas y salidas a ciegas:** Se compromete mercancía o se realizan despachos de productos con stock insuficiente, provocando incumplimientos a clientes o desabastecimiento imprevisto.
3. **Ausencia de trazabilidad en los movimientos:** No existe un historial que precise si una salida correspondió a una venta, a una merma o a un ajuste interno, ni a qué cliente específico se despachó.
4. **Cartera de clientes desorganizada:** Registro duplicado de personas y empresas con números de cédula incorrectos, dificultando la cobranza, el seguimiento y la fidelización.
5. **Relación desvinculada con proveedores:** Dificultad para identificar oportunamente qué proveedor suministra cada producto al momento de reponer mercancía.

---

## 2. Propuesta de Valor de StockPro

StockPro transforma la gestión artesanal en una operación empresarial organizada, ágil y confiable. El sistema ofrece una **gestión integral en tiempo real** que conecta en un único flujo operativo a proveedores, catálogo de productos, clientes y movimientos de almacén, garantizando la consistencia matemática y transaccional del inventario.

### Pilares de la Solución:
- **Transaccionalidad garantizada:** Cada entrada o salida actualiza el stock de forma atómica en la base de datos MySQL; si una operación no puede completarse, se cancela por completo sin dejar registros a medias.
- **Protección contra stock negativo:** El sistema valida antes de cada salida que el almacén cuente con existencias suficientes, bloqueando intentos de sobreventa.
- **Segmentación de clientes:** Manejo nativo de personas individuales y personas jurídicas (empresas), validando que las identificaciones sean únicas para evitar duplicidades.
- **Alertas tempranas de reposición:** Monitoreo visual de artículos con stock crítico (≤ 5 unidades) o bajo (≤ 15 unidades) para evitar quiebres de inventario.
- **Interfaz clara y profesional:** Diseño basado en una paleta morado y blanco, optimizado para que los encargados de bodega o dependientes operen con rapidez sin requerir capacitaciones extensas.

---

## 3. Objetivos del Sistema

### Objetivo General
Desarrollar e implementar un sistema empresarial de administración de inventarios y clientes que centralice las operaciones de entrada, salida y ajuste de mercancías mediante una arquitectura cliente-servidor desacoplada (React y Node.js/Express) respaldada por una base de datos relacional MySQL transaccional.

### Objetivos Específicos
1. **Modelar y estructurar el catálogo de productos:** Clasificar los bienes comerciales mediante categorías y vincular cada artículo a su respectivo proveedor autorizado.
2. **Administrar una cartera unificada de clientes:** Registrar clientes bajo las modalidades de personas naturales o empresas, permitiendo la búsqueda rápida, el filtrado y el control del estado activo/inactivo.
3. **Controlar el flujo de movimientos de almacén:** Registrar de forma multi-ítem las entradas, salidas y ajustes internos, permitiendo asociar clientes opcionales a las salidas de mercancía.
4. **Asegurar la integridad referencial y de existencias:** Aplicar restricciones de base de datos (`FOREIGN KEY`, `RESTRICT`, `CASCADE`) y transacciones SQL con bloqueo de registros (`FOR UPDATE`) para evitar descuadres o borrado accidental de datos históricos.
5. **Exponer una API REST estandarizada:** Proveer endpoints HTTP completos (GET, POST, PUT, DELETE) con respuestas homogéneas en formato JSON y manejo centralizado de errores.

---

## 4. Perfil del Negocio y Usuarios Destinatarios

| Segmento | Descripción |
| :--- | :--- |
| **Tipo de Empresa** | Pequeños y medianos comercios de retail, distribuidoras de productos de consumo masivo, ferreterías, cafeterías, panaderías y depósitos de materiales. |
| **Administrador / Dueño de Negocio** | Supervisa los indicadores del Dashboard, audita los últimos movimientos, gestiona proveedores y analiza el valor de los inventarios. |
| **Encargado de Bodega / Inventario** | Registra el ingreso de mercancías procedentes de compras a proveedores y ejecuta conteos físicos con ajustes internos. |
| **Vendedor / Despachador** | Consulta la disponibilidad física de los productos y emite salidas asociándolas a los clientes respectivos. |

---

## 5. Beneficios Cuantificables

- **Eliminación del 100% de ventas sobregiradas:** El sistema bloquea de raíz cualquier despacho que supere la cantidad física disponible.
- **Reducción del 80% en tiempo de consulta de stock:** Localización instantánea de artículos por nombre, código de categoría o proveedor en la interfaz.
- **Historial auditable:** Cada modificación en el almacén queda registrada con fecha, hora, tipo de operación, observación y desglose por producto.
- **Protección de datos históricos:** Imposibilidad de eliminar categorías, proveedores o clientes que mantengan transacciones o productos activos en el sistema.

