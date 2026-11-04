/**
 * StockPro — Batería de Auditoría Final Integral
 * 
 * Verifica:
 * 1. Todas las rutas GET, GET por ID, POST, PUT y DELETE en las 6 entidades.
 * 2. Persistencia en MySQL correspondiente a formularios de creación y edición.
 * 3. Actualización y consistencia de stock en movimientos (entrada, salida, ajuste, sobregiro, reversión).
 * 4. Verificación de llamadas HTTP estilo Postman/Thunder Client en GET y POST.
 */

const app = require('./app');
const pool = require('./config/db');

async function runAudit() {
  console.log('================================================================');
  console.log('🔍 INICIANDO AUDITORÍA FINAL INTEGRAL DE STOCKPRO');
  console.log('================================================================');

  const PORT = 5099;
  const server = app.listen(PORT);
  const BASE = `http://localhost:${PORT}/api`;

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  function assert(condition, message) {
    results.total++;
    if (condition) {
      results.passed++;
      console.log(`  ✅ [PASS] ${message}`);
      results.details.push({ status: 'PASS', message });
    } else {
      results.failed++;
      console.error(`  ❌ [FAIL] ${message}`);
      results.details.push({ status: 'FAIL', message });
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // 0. Limpieza inicial preventiva de datos de pruebas previas
    console.log('\n--- 0. Limpieza preventiva de datos de prueba ---');
    await pool.query(`
      DELETE FROM detalle_movimientos 
      WHERE id_producto IN (SELECT id_producto FROM productos WHERE nombre LIKE 'TEST_AUDIT_%')
         OR id_movimiento IN (SELECT id_movimiento FROM movimientos WHERE observacion LIKE 'TEST_AUDIT_%')
    `);
    await pool.query(`DELETE FROM movimientos WHERE observacion LIKE 'TEST_AUDIT_%'`);
    await pool.query(`
      DELETE FROM clientes 
      WHERE identificacion IN ('TEST-001-AUDIT', 'TEST-002-AUDIT', 'TEST-003-AUDIT')
         OR nombre LIKE 'TEST_AUDIT_%'
    `);
    await pool.query(`DELETE FROM productos WHERE nombre LIKE 'TEST_AUDIT_%'`);
    await pool.query(`DELETE FROM proveedores WHERE nombre LIKE 'TEST_AUDIT_%'`);
    await pool.query(`DELETE FROM categorias WHERE nombre LIKE 'TEST_AUDIT_%'`);
    console.log('  Base de datos limpia y lista para la auditoría.');

    // =========================================================================
    // SECCIÓN 1: AUDITORÍA DE RUTAS REST COMPLETAS EN LAS 6 ENTIDADES
    // =========================================================================
    console.log('\n--- 1. AUDITORÍA RUTAS: Categorías (GET, GET/:id, POST, PUT, DELETE) ---');
    // POST
    const resCatPost = await fetch(`${BASE}/categorias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'TEST_AUDIT_Cat_Crear',
        descripcion: 'Descripción categoría de prueba',
        estado: true
      })
    });
    const catPostData = await resCatPost.json();
    assert(resCatPost.status === 201 && catPostData.success && catPostData.data.id_categoria,
      'POST /api/categorias crea una nueva categoría con código 201');
    const catId = catPostData.data.id_categoria;

    // GET all
    const resCatGetAll = await fetch(`${BASE}/categorias`);
    const catGetAllData = await resCatGetAll.json();
    assert(resCatGetAll.status === 200 && Array.isArray(catGetAllData.data) && catGetAllData.data.some(c => c.id_categoria === catId),
      'GET /api/categorias lista todas las categorías con código 200');

    // GET by ID
    const resCatGetById = await fetch(`${BASE}/categorias/${catId}`);
    const catGetByIdData = await resCatGetById.json();
    assert(resCatGetById.status === 200 && catGetByIdData.data.nombre === 'TEST_AUDIT_Cat_Crear',
      'GET /api/categorias/:id obtiene la categoría por su ID con código 200');

    // PUT
    const resCatPut = await fetch(`${BASE}/categorias/${catId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'TEST_AUDIT_Cat_Editada',
        descripcion: 'Descripción actualizada',
        estado: false
      })
    });
    const catPutData = await resCatPut.json();
    assert(resCatPut.status === 200 && catPutData.data.nombre === 'TEST_AUDIT_Cat_Editada' && catPutData.data.estado === 0,
      'PUT /api/categorias/:id actualiza la categoría y persiste el estado en MySQL con código 200');

    // DELETE (se prueba después de crear/eliminar dependencias)

    console.log('\n--- 2. AUDITORÍA RUTAS: Proveedores (GET, GET/:id, POST, PUT, DELETE) ---');
    // POST
    const resProvPost = await fetch(`${BASE}/proveedores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'TEST_AUDIT_Prov_Crear',
        telefono: '+506 2200-9988',
        correo: 'audit_prov@empresa.com',
        direccion: 'Calle Principal 123'
      })
    });
    const provPostData = await resProvPost.json();
    assert(resProvPost.status === 201 && provPostData.success && provPostData.data.id_proveedor,
      'POST /api/proveedores crea un nuevo proveedor con código 201');
    const provId = provPostData.data.id_proveedor;

    // GET all
    const resProvGetAll = await fetch(`${BASE}/proveedores`);
    const provGetAllData = await resProvGetAll.json();
    assert(resProvGetAll.status === 200 && Array.isArray(provGetAllData.data) && provGetAllData.data.some(p => p.id_proveedor === provId),
      'GET /api/proveedores lista proveedores con código 200');

    // GET by ID
    const resProvGetById = await fetch(`${BASE}/proveedores/${provId}`);
    const provGetByIdData = await resProvGetById.json();
    assert(resProvGetById.status === 200 && provGetByIdData.data.nombre === 'TEST_AUDIT_Prov_Crear',
      'GET /api/proveedores/:id obtiene el proveedor por ID con código 200');

    // PUT
    const resProvPut = await fetch(`${BASE}/proveedores/${provId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'TEST_AUDIT_Prov_Editado',
        telefono: '+506 2200-7766',
        correo: 'audit_prov_editado@empresa.com',
        direccion: 'Avenida Segunda 456'
      })
    });
    const provPutData = await resProvPut.json();
    assert(resProvPut.status === 200 && provPutData.data.nombre === 'TEST_AUDIT_Prov_Editado',
      'PUT /api/proveedores/:id actualiza el proveedor con código 200');

    console.log('\n--- 3. AUDITORÍA RUTAS: Productos (GET, GET/:id, POST, PUT, DELETE) ---');
    // POST
    const resProdPost = await fetch(`${BASE}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_categoria: catId,
        id_proveedor: provId,
        nombre: 'TEST_AUDIT_Prod_Crear',
        descripcion: 'Producto de prueba para auditoría',
        precio: 2500.50,
        stock: 40
      })
    });
    const prodPostData = await resProdPost.json();
    assert(resProdPost.status === 201 && prodPostData.success && prodPostData.data.id_producto,
      'POST /api/productos crea un nuevo producto con código 201');
    const prodId = prodPostData.data.id_producto;

    // GET all
    const resProdGetAll = await fetch(`${BASE}/productos`);
    const prodGetAllData = await resProdGetAll.json();
    assert(resProdGetAll.status === 200 && Array.isArray(prodGetAllData.data) && prodGetAllData.data.some(p => p.id_producto === prodId),
      'GET /api/productos lista productos con código 200');

    // GET by ID
    const resProdGetById = await fetch(`${BASE}/productos/${prodId}`);
    const prodGetByIdData = await resProdGetById.json();
    assert(resProdGetById.status === 200 && prodGetByIdData.data.nombre === 'TEST_AUDIT_Prod_Crear',
      'GET /api/productos/:id obtiene producto por ID con código 200');

    // PUT
    const resProdPut = await fetch(`${BASE}/productos/${prodId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_categoria: catId,
        id_proveedor: provId,
        nombre: 'TEST_AUDIT_Prod_Editado',
        descripcion: 'Descripción modificada',
        precio: 2990.00,
        stock: 40
      })
    });
    const prodPutData = await resProdPut.json();
    assert(resProdPut.status === 200 && prodPutData.data.nombre === 'TEST_AUDIT_Prod_Editado' && Number(prodPutData.data.precio) === 2990,
      'PUT /api/productos/:id actualiza el producto en MySQL con código 200');

    console.log('\n--- 4. AUDITORÍA RUTAS: Clientes (GET, GET/:id, POST, PUT, PATCH, DELETE) ---');
    // POST Persona
    const resCliPerPost = await fetch(`${BASE}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo_cliente: 'persona',
        nombre: 'TEST_AUDIT_Persona_Nombre',
        identificacion: 'TEST-001-AUDIT',
        telefono: '+506 8877-6655',
        correo: 'persona.audit@test.com',
        direccion: 'San José Centro',
        estado: true
      })
    });
    const cliPerData = await resCliPerPost.json();
    assert(resCliPerPost.status === 201 && cliPerData.data.id_cliente,
      'POST /api/clientes registra persona física con código 201');
    const cliPersonaId = cliPerData.data.id_cliente;

    // POST Empresa
    const resCliEmpPost = await fetch(`${BASE}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo_cliente: 'empresa',
        nombre: 'TEST_AUDIT_Empresa_S.A.',
        identificacion: 'TEST-002-AUDIT',
        telefono: '+506 2233-4455',
        correo: 'empresa.audit@test.com',
        direccion: 'Parque Empresarial Forum 1',
        estado: true
      })
    });
    const cliEmpData = await resCliEmpPost.json();
    assert(resCliEmpPost.status === 201 && cliEmpData.data.tipo_cliente === 'empresa',
      'POST /api/clientes registra empresa jurídica con código 201');
    const cliEmpresaId = cliEmpData.data.id_cliente;

    // GET all con filtros
    const resCliGetAll = await fetch(`${BASE}/clientes?tipo_cliente=empresa`);
    const cliGetAllData = await resCliGetAll.json();
    assert(resCliGetAll.status === 200 && cliGetAllData.data.every(c => c.tipo_cliente === 'empresa'),
      'GET /api/clientes filtra correctamente por tipo de cliente con código 200');

    // GET by ID
    const resCliGetById = await fetch(`${BASE}/clientes/${cliPersonaId}`);
    const cliGetByIdData = await resCliGetById.json();
    assert(resCliGetById.status === 200 && cliGetByIdData.data.identificacion === 'TEST-001-AUDIT',
      'GET /api/clientes/:id obtiene cliente por ID con código 200');

    // PUT
    const resCliPut = await fetch(`${BASE}/clientes/${cliPersonaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo_cliente: 'persona',
        nombre: 'TEST_AUDIT_Persona_Modificada',
        identificacion: 'TEST-001-AUDIT',
        telefono: '+506 8877-0000',
        correo: 'persona.mod@test.com',
        direccion: 'Cartago Centro',
        estado: true
      })
    });
    const cliPutData = await resCliPut.json();
    assert(resCliPut.status === 200 && cliPutData.data.nombre === 'TEST_AUDIT_Persona_Modificada',
      'PUT /api/clientes/:id actualiza cliente con código 200');

    // PATCH estado
    const resCliPatch = await fetch(`${BASE}/clientes/${cliPersonaId}/estado`, { method: 'PATCH' });
    const cliPatchData = await resCliPatch.json();
    assert(resCliPatch.status === 200 && cliPatchData.data.estado === 0,
      'PATCH /api/clientes/:id/estado conmuta el estado activo/inactivo con código 200');

    console.log('\n--- 5. AUDITORÍA RUTAS: Movimientos (GET, GET/:id, POST, PUT, DELETE) ---');
    // POST Movimiento de Entrada
    const resMovEntrada = await fetch(`${BASE}/movimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'entrada',
        id_cliente: null,
        observacion: 'TEST_AUDIT_Movimiento_Entrada',
        detalles: [
          { id_producto: prodId, cantidad: 20 }
        ]
      })
    });
    const movEntradaData = await resMovEntrada.json();
    assert(resMovEntrada.status === 201 && movEntradaData.data.id_movimiento,
      'POST /api/movimientos registra entrada con código 201');
    const movEntradaId = movEntradaData.data.id_movimiento;

    // Verificar stock incrementado en MySQL (40 + 20 = 60)
    let prodCheck = await (await fetch(`${BASE}/productos/${prodId}`)).json();
    assert(prodCheck.data.stock === 60,
      'El movimiento de entrada incrementa el stock de 40 a 60 en MySQL');

    // GET all
    const resMovGetAll = await fetch(`${BASE}/movimientos`);
    const movGetAllData = await resMovGetAll.json();
    assert(resMovGetAll.status === 200 && Array.isArray(movGetAllData.data) && movGetAllData.data.some(m => m.id_movimiento === movEntradaId),
      'GET /api/movimientos lista movimientos con código 200');

    // GET by ID
    const resMovGetById = await fetch(`${BASE}/movimientos/${movEntradaId}`);
    const movGetByIdData = await resMovGetById.json();
    assert(resMovGetById.status === 200 && Array.isArray(movGetByIdData.data.detalles) && movGetByIdData.data.detalles.length === 1,
      'GET /api/movimientos/:id retorna el movimiento con sus detalles y código 200');

    // PUT Movimiento (modificar observación y detalles de 20 a 30)
    const resMovPut = await fetch(`${BASE}/movimientos/${movEntradaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'entrada',
        id_cliente: null,
        observacion: 'TEST_AUDIT_Movimiento_Entrada_Editado',
        detalles: [
          { id_producto: prodId, cantidad: 30 }
        ]
      })
    });
    const movPutData = await resMovPut.json();
    assert(resMovPut.status === 200 && movPutData.data.observacion === 'TEST_AUDIT_Movimiento_Entrada_Editado',
      'PUT /api/movimientos/:id actualiza el movimiento y recalcula el stock');

    // Verificar stock recalculado en MySQL (40 original + 30 = 70)
    prodCheck = await (await fetch(`${BASE}/productos/${prodId}`)).json();
    assert(prodCheck.data.stock === 70,
      'La edición del movimiento recalculó el stock a 70 en MySQL');

    console.log('\n--- 6. AUDITORÍA RUTAS: Detalle Movimientos (GET, GET/:id, POST, PUT, DELETE) ---');
    // Para probar detalleMovimiento directamente, creamos un segundo producto de prueba
    const resProd2 = await fetch(`${BASE}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_categoria: catId,
        id_proveedor: provId,
        nombre: 'TEST_AUDIT_Prod_2',
        descripcion: 'Segundo producto para detalle',
        precio: 1000,
        stock: 15
      })
    });
    const prod2Data = await resProd2.json();
    const prod2Id = prod2Data.data.id_producto;

    // POST /detalle-movimientos (agregar producto 2 al movimiento de entrada con cantidad 10)
    const resDetPost = await fetch(`${BASE}/detalle-movimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_movimiento: movEntradaId,
        id_producto: prod2Id,
        cantidad: 10
      })
    });
    const detPostData = await resDetPost.json();
    assert(resDetPost.status === 201 && detPostData.data.id_detalle,
      'POST /api/detalle-movimientos crea un nuevo detalle con código 201');
    const detalleId = detPostData.data.id_detalle;

    // Verificar que stock del producto 2 subió de 15 a 25
    let prod2Check = await (await fetch(`${BASE}/productos/${prod2Id}`)).json();
    assert(prod2Check.data.stock === 25,
      'El detalle creado actualizó el stock del segundo producto (15 -> 25) en MySQL');

    // GET all detalles
    const resDetGetAll = await fetch(`${BASE}/detalle-movimientos?id_movimiento=${movEntradaId}`);
    const detGetAllData = await resDetGetAll.json();
    assert(resDetGetAll.status === 200 && detGetAllData.data.length === 2,
      'GET /api/detalle-movimientos lista los detalles del movimiento con código 200');

    // GET detalle by ID
    const resDetGetById = await fetch(`${BASE}/detalle-movimientos/${detalleId}`);
    const detGetByIdData = await resDetGetById.json();
    assert(resDetGetById.status === 200 && detGetByIdData.data.id_detalle === detalleId,
      'GET /api/detalle-movimientos/:id obtiene el detalle específico con código 200');

    // PUT detalle (cambiar cantidad de 10 a 15)
    const resDetPut = await fetch(`${BASE}/detalle-movimientos/${detalleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_producto: prod2Id,
        cantidad: 15
      })
    });
    assert(resDetPut.status === 200,
      'PUT /api/detalle-movimientos/:id actualiza cantidad y stock con código 200');
    prod2Check = await (await fetch(`${BASE}/productos/${prod2Id}`)).json();
    assert(prod2Check.data.stock === 30,
      'La actualización del detalle recalculó el stock (15 + 15 = 30) en MySQL');

    // DELETE detalle (debe revertir el stock de prod 2 a 15)
    const resDetDel = await fetch(`${BASE}/detalle-movimientos/${detalleId}`, { method: 'DELETE' });
    assert(resDetDel.status === 200,
      'DELETE /api/detalle-movimientos/:id elimina el detalle y revierte stock con código 200');
    prod2Check = await (await fetch(`${BASE}/productos/${prod2Id}`)).json();
    assert(prod2Check.data.stock === 15,
      'Eliminar el detalle revirtió el stock del producto 2 a su valor original (15)');

    // =========================================================================
    // SECCIÓN 2: AUDITORÍA DE MOVIMIENTOS, SALIDAS Y REGLAS DE NEGOCIO
    // =========================================================================
    console.log('\n--- 7. AUDITORÍA DE STOCK: Salidas con Cliente y Sobregiro ---');
    // Salida asociada a empresa (debe restar 25 al producto 1: 70 - 25 = 45)
    const resMovSalida = await fetch(`${BASE}/movimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'salida',
        id_cliente: cliEmpresaId,
        observacion: 'TEST_AUDIT_Venta_Institucional_Empresa',
        detalles: [
          { id_producto: prodId, cantidad: 25 }
        ]
      })
    });
    const movSalidaData = await resMovSalida.json();
    assert(resMovSalida.status === 201 && movSalidaData.data.cliente_nombre === 'TEST_AUDIT_Empresa_S.A.',
      'POST /api/movimientos registra salida vinculada a cliente empresa con código 201');
    const movSalidaId = movSalidaData.data.id_movimiento;

    prodCheck = await (await fetch(`${BASE}/productos/${prodId}`)).json();
    assert(prodCheck.data.stock === 45,
      'La salida de inventario redujo el stock de 70 a 45 en MySQL');

    // Intento de salida superior al stock disponible (sobregiro: pedir 9999 cuando hay 45)
    const resSobregiro = await fetch(`${BASE}/movimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'salida',
        id_cliente: cliEmpresaId,
        observacion: 'TEST_AUDIT_Intento_Sobregiro',
        detalles: [
          { id_producto: prodId, cantidad: 9999 }
        ]
      })
    });
    const sobregiroData = await resSobregiro.json();
    assert(resSobregiro.status === 400 && sobregiroData.message.includes('Stock insuficiente'),
      'La salida que excede el stock se rechaza con código 400 y mensaje explicativo');

    // Verificar que stock permanece en 45 tras el rechazo
    prodCheck = await (await fetch(`${BASE}/productos/${prodId}`)).json();
    assert(prodCheck.data.stock === 45,
      'La transacción fallida no alteró el stock en MySQL');

    // DELETE del movimiento de salida (debe revertir la resta y regresar a 45 + 25 = 70)
    const resMovDel = await fetch(`${BASE}/movimientos/${movSalidaId}`, { method: 'DELETE' });
    assert(resMovDel.status === 200,
      'DELETE /api/movimientos/:id elimina la salida y revierte el stock con código 200');
    prodCheck = await (await fetch(`${BASE}/productos/${prodId}`)).json();
    assert(prodCheck.data.stock === 70,
      'Reversión atómica de inventario confirmada: stock volvió a 70 en MySQL');

    // Eliminar también el movimiento de entrada para dejar stock en 40 original
    await fetch(`${BASE}/movimientos/${movEntradaId}`, { method: 'DELETE' });
    prodCheck = await (await fetch(`${BASE}/productos/${prodId}`)).json();
    assert(prodCheck.data.stock === 40,
      'Eliminar la entrada devolvió el stock al saldo inicial de 40 en MySQL');

    // =========================================================================
    // SECCIÓN 3: AUDITORÍA DE ELIMINACIONES RESTANTES (DELETE en 6 entidades)
    // =========================================================================
    console.log('\n--- 8. AUDITORÍA DE ELIMINACIONES RESTANTES ---');
    // DELETE productos
    const resProdDel1 = await fetch(`${BASE}/productos/${prodId}`, { method: 'DELETE' });
    const resProdDel2 = await fetch(`${BASE}/productos/${prod2Id}`, { method: 'DELETE' });
    assert(resProdDel1.status === 200 && resProdDel2.status === 200,
      'DELETE /api/productos/:id elimina productos sin movimientos con código 200');

    // DELETE clientes
    const resCliDel1 = await fetch(`${BASE}/clientes/${cliPersonaId}`, { method: 'DELETE' });
    const resCliDel2 = await fetch(`${BASE}/clientes/${cliEmpresaId}`, { method: 'DELETE' });
    assert(resCliDel1.status === 200 && resCliDel2.status === 200,
      'DELETE /api/clientes/:id elimina clientes sin movimientos asociados con código 200');

    // DELETE proveedor
    const resProvDel = await fetch(`${BASE}/proveedores/${provId}`, { method: 'DELETE' });
    assert(resProvDel.status === 200,
      'DELETE /api/proveedores/:id elimina proveedor sin productos vinculados con código 200');

    // DELETE categoría
    const resCatDel = await fetch(`${BASE}/categorias/${catId}`, { method: 'DELETE' });
    assert(resCatDel.status === 200,
      'DELETE /api/categorias/:id elimina categoría sin productos vinculados con código 200');

    // =========================================================================
    // SECCIÓN 4: COMPROBACIÓN DE ENDPOINTS ESTILO POSTMAN / THUNDER CLIENT
    // =========================================================================
    console.log('\n--- 9. COMPROBACIÓN DE ENDPOINTS (Postman / Thunder Client) ---');
    // Simular llamada exacta de Thunder Client: GET /api/clientes?tipo_cliente=empresa
    const tcGetRes = await fetch(`${BASE}/clientes?tipo_cliente=empresa`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ThunderClient/1.2 (StockPro-Auditor)'
      }
    });
    const tcGetData = await tcGetRes.json();
    assert(tcGetRes.status === 200 && tcGetRes.headers.get('content-type').includes('application/json'),
      '[Thunder Client] GET /api/clientes responde HTTP 200 y application/json');
    assert(Array.isArray(tcGetData.data) && tcGetData.data.length >= 1,
      '[Thunder Client] GET /api/clientes retorna lista de clientes corporativos');

    // Simular llamada exacta de Postman: POST /api/clientes
    const pmPostRes = await fetch(`${BASE}/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'PostmanRuntime/7.39.0'
      },
      body: JSON.stringify({
        tipo_cliente: 'persona',
        nombre: 'TEST_AUDIT_Postman_Cliente',
        identificacion: 'TEST-003-AUDIT',
        telefono: '+506 8800-1122',
        correo: 'postman.audit@correo.com',
        direccion: 'Prueba Postman Collections',
        estado: true
      })
    });
    const pmPostData = await pmPostRes.json();
    assert(pmPostRes.status === 201 && pmPostData.success === true && pmPostData.data.identificacion === 'TEST-003-AUDIT',
      '[Postman] POST /api/clientes registra cliente con HTTP 201 y cuerpo JSON validado');

    // Limpieza del registro Postman
    await fetch(`${BASE}/clientes/${pmPostData.data.id_cliente}`, { method: 'DELETE' });

    console.log('\n================================================================');
    console.log(`🎉 AUDITORÍA FINALIZADA CON ÉXITO: ${results.passed}/${results.total} verificaciones pasadas.`);
    console.log('================================================================\n');

    return results;
  } catch (error) {
    console.error('\n❌ ERROR EN LA AUDITORÍA:', error.message);
    throw error;
  } finally {
    server.close();
    await pool.end();
  }
}

runAudit()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

