const app = require('./app');
const pool = require('./config/db');

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 INICIANDO BATERÍA DE PRUEBAS DE VERIFICACIÓN');
  console.log('====================================================');

  const server = app.listen(5098);
  const BASE_URL = 'http://localhost:5098/api';

  try {
    // Limpieza preventiva de datos de pruebas previas
    await pool.query(`
      DELETE FROM detalle_movimientos 
      WHERE id_movimiento IN (
        SELECT id_movimiento FROM movimientos 
        WHERE id_cliente IN (SELECT id_cliente FROM clientes WHERE identificacion IN ('9-0011-2233', '3-101-998877'))
      )
    `);
    await pool.query(`
      DELETE FROM movimientos 
      WHERE id_cliente IN (SELECT id_cliente FROM clientes WHERE identificacion IN ('9-0011-2233', '3-101-998877'))
    `);
    await pool.query("DELETE FROM clientes WHERE identificacion IN ('9-0011-2233', '3-101-998877');");
    await pool.query(`
      DELETE FROM detalle_movimientos 
      WHERE id_producto IN (SELECT id_producto FROM productos WHERE nombre = 'Producto Test Control Stock')
    `);
    await pool.query("DELETE FROM productos WHERE nombre = 'Producto Test Control Stock';");

    // 1. Verificar existencia de la base de datos y 6 tablas
    console.log('\n--- 1. Verificando Base de Datos y Tablas ---');
    const [tables] = await pool.query('SHOW TABLES IN stockpro;');
    const tableNames = tables.map((t) => Object.values(t)[0]);
    console.log('Tablas detectadas:', tableNames);
    const expectedTables = ['categorias', 'proveedores', 'productos', 'clientes', 'movimientos', 'detalle_movimientos'];
    const missingTables = expectedTables.filter((t) => !tableNames.includes(t));
    if (missingTables.length > 0) {
      throw new Error('Faltan tablas: ' + missingTables.join(', '));
    }
    console.log('✅ Base de datos "stockpro" y las 6 tablas existen correctamente.');

    // 2. Verificar Claves Foráneas
    console.log('\n--- 2. Verificando Integridad y Claves Foráneas ---');
    const [fks] = await pool.query(`
      SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'stockpro' AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);
    console.log(`Claves foráneas detectadas (${fks.length}):`, fks.map(f => `${f.TABLE_NAME} -> ${f.REFERENCED_TABLE_NAME}`));
    if (fks.length < 5) {
      throw new Error('No se encontraron todas las claves foráneas requeridas.');
    }
    console.log('✅ Todas las claves foráneas están configuradas.');

    // 3. Test CRUD Categorías
    console.log('\n--- 3. Verificando CRUD Categorías ---');
    const resCatPost = await fetch(`${BASE_URL}/categorias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Categoría Test', descripcion: 'Descripción temporal', estado: true })
    });
    const catPostData = await resCatPost.json();
    console.log('POST /categorias:', resCatPost.status, catPostData.data.nombre);
    const testCatId = catPostData.data.id_categoria;

    const resCatPut = await fetch(`${BASE_URL}/categorias/${testCatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Categoría Test Editada', descripcion: 'Editada', estado: false })
    });
    const catPutData = await resCatPut.json();
    console.log('PUT /categorias:', resCatPut.status, catPutData.data.nombre, 'estado:', catPutData.data.estado);

    const resCatDel = await fetch(`${BASE_URL}/categorias/${testCatId}`, { method: 'DELETE' });
    console.log('DELETE /categorias:', resCatDel.status);
    console.log('✅ CRUD Categorías verificado exitosamente.');

    // 4. Test CRUD Proveedores
    console.log('\n--- 4. Verificando CRUD Proveedores ---');
    const resProvPost = await fetch(`${BASE_URL}/proveedores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Proveedor Test S.A.', telefono: '2222-3333', correo: 'test@prov.com', direccion: 'Cartago' })
    });
    const provPostData = await resProvPost.json();
    console.log('POST /proveedores:', resProvPost.status, provPostData.data.nombre);
    const testProvId = provPostData.data.id_proveedor;

    const resProvDel = await fetch(`${BASE_URL}/proveedores/${testProvId}`, { method: 'DELETE' });
    console.log('DELETE /proveedores:', resProvDel.status);
    console.log('✅ CRUD Proveedores verificado exitosamente.');

    // 5. Test CRUD Clientes (Personas, Empresas, Duplicados, Filtros, Estado)
    console.log('\n--- 5. Verificando CRUD Clientes y Reglas de Negocio ---');
    // Registrar Persona
    const resCliPersona = await fetch(`${BASE_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo_cliente: 'persona',
        nombre: 'Andrés Mora Jiménez',
        identificacion: '9-0011-2233',
        telefono: '8899-0011',
        correo: 'andres.mora@test.com',
        direccion: 'Heredia',
        estado: true
      })
    });
    const cliPersonaData = await resCliPersona.json();
    console.log('POST /clientes (persona):', resCliPersona.status, cliPersonaData.data.nombre, cliPersonaData.data.tipo_cliente);
    const testPersonaId = cliPersonaData.data.id_cliente;

    // Registrar Empresa
    const resCliEmpresa = await fetch(`${BASE_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo_cliente: 'empresa',
        nombre: 'Inversiones Tecnológicas del Norte S.A.',
        identificacion: '3-101-998877',
        telefono: '2288-7766',
        correo: 'facturacion@inversionesnorte.com',
        direccion: 'San José',
        estado: true
      })
    });
    const cliEmpresaData = await resCliEmpresa.json();
    console.log('POST /clientes (empresa):', resCliEmpresa.status, cliEmpresaData.data.nombre, cliEmpresaData.data.tipo_cliente);
    const testEmpresaId = cliEmpresaData.data.id_cliente;

    // Validación de Identificación duplicada
    const resCliDuplicado = await fetch(`${BASE_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo_cliente: 'persona',
        nombre: 'Duplicado Test',
        identificacion: '9-0011-2233' // Ya registrada
      })
    });
    const cliDupData = await resCliDuplicado.json();
    console.log('Validación cédula duplicada (debe ser 400):', resCliDuplicado.status, cliDupData.message);
    if (resCliDuplicado.status !== 400) {
      throw new Error('Falló la validación de identificación duplicada.');
    }

    // Toggle estado
    const resToggle = await fetch(`${BASE_URL}/clientes/${testPersonaId}/estado`, { method: 'PATCH' });
    const toggleData = await resToggle.json();
    console.log('PATCH /clientes/:id/estado:', resToggle.status, 'nuevo estado:', toggleData.data.estado);

    // Consulta con filtros
    const resFilterTipo = await fetch(`${BASE_URL}/clientes?tipo_cliente=empresa`);
    const filterTipoData = await resFilterTipo.json();
    console.log('Filtro por tipo=empresa cantidad:', filterTipoData.data.length);

    console.log('✅ CRUD Clientes, validaciones de persona/empresa y duplicados OK.');

    // 6. Test Inventario, Movimientos y Transaccionalidad
    console.log('\n--- 6. Verificando Gestión de Inventario y Movimientos ---');
    // Crear producto de prueba
    const resProd = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_categoria: 1,
        id_proveedor: 1,
        nombre: 'Producto Test Control Stock',
        descripcion: 'Para probar entradas y salidas',
        precio: 500.00,
        stock: 50
      })
    });
    const prodData = await resProd.json();
    const testProdId = prodData.data.id_producto;
    console.log(`Producto creado: "${prodData.data.nombre}" con stock inicial: ${prodData.data.stock}`);

    // Entrada de 30 unidades (sin cliente)
    const resEntrada = await fetch(`${BASE_URL}/movimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'entrada',
        id_cliente: null,
        observacion: 'Entrada de prueba de 30 unidades',
        detalles: [{ id_producto: testProdId, cantidad: 30 }]
      })
    });
    const entradaData = await resEntrada.json();
    console.log('POST /movimientos (entrada +30):', resEntrada.status);

    // Verificar stock (debe ser 50 + 30 = 80)
    let checkProd = await (await fetch(`${BASE_URL}/productos/${testProdId}`)).json();
    console.log(`Stock tras entrada (esperado 80): ${checkProd.data.stock}`);
    if (checkProd.data.stock !== 80) throw new Error('Stock tras entrada incorrecto');

    // Salida de 25 unidades asociada a cliente empresa
    const resSalida = await fetch(`${BASE_URL}/movimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'salida',
        id_cliente: testEmpresaId,
        observacion: 'Salida de prueba de 25 unidades a cliente',
        detalles: [{ id_producto: testProdId, cantidad: 25 }]
      })
    });
    const salidaData = await resSalida.json();
    console.log('POST /movimientos (salida -25 con cliente):', resSalida.status, 'Cliente:', salidaData.data.cliente_nombre);

    // Verificar stock (debe ser 80 - 25 = 55)
    checkProd = await (await fetch(`${BASE_URL}/productos/${testProdId}`)).json();
    console.log(`Stock tras salida (esperado 55): ${checkProd.data.stock}`);
    if (checkProd.data.stock !== 55) throw new Error('Stock tras salida incorrecto');

    // Intento de salida superior al stock disponible (debe fallar con 400 y no cambiar stock)
    const resOverSalida = await fetch(`${BASE_URL}/movimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'salida',
        id_cliente: testEmpresaId,
        observacion: 'Salida excedida',
        detalles: [{ id_producto: testProdId, cantidad: 9999 }]
      })
    });
    const overSalidaData = await resOverSalida.json();
    console.log('Salida superior al stock (debe ser 400):', resOverSalida.status, overSalidaData.message);
    if (resOverSalida.status !== 400) throw new Error('La validación de sobregiro de stock falló.');

    // Verificar que el stock no cambió tras el intento fallido
    checkProd = await (await fetch(`${BASE_URL}/productos/${testProdId}`)).json();
    console.log(`Stock se mantiene consistente en: ${checkProd.data.stock}`);
    if (checkProd.data.stock !== 55) throw new Error('El stock se modificó indebidamente tras error transaccional.');

    // Eliminación de la salida (debe revertir el stock a 55 + 25 = 80)
    const salidaId = salidaData.data.id_movimiento;
    const resDelSalida = await fetch(`${BASE_URL}/movimientos/${salidaId}`, { method: 'DELETE' });
    console.log('DELETE /movimientos (eliminar salida):', resDelSalida.status);
    checkProd = await (await fetch(`${BASE_URL}/productos/${testProdId}`)).json();
    console.log(`Stock tras eliminar salida y revertir (esperado 80): ${checkProd.data.stock}`);
    if (checkProd.data.stock !== 80) throw new Error('Reversión de stock al eliminar movimiento falló.');

    // Eliminar también la entrada de prueba
    const entradaId = entradaData.data.id_movimiento;
    await fetch(`${BASE_URL}/movimientos/${entradaId}`, { method: 'DELETE' });
    checkProd = await (await fetch(`${BASE_URL}/productos/${testProdId}`)).json();
    console.log(`Stock tras eliminar entrada y revertir (esperado 50): ${checkProd.data.stock}`);
    if (checkProd.data.stock !== 50) throw new Error('Reversión al eliminar entrada falló.');

    // Limpiar producto de prueba
    await fetch(`${BASE_URL}/productos/${testProdId}`, { method: 'DELETE' });

    // 7. Prueba de Integridad Referencial
    console.log('\n--- 7. Verificando Restricciones de Integridad Referencial ---');
    // Intentar borrar cliente con movimientos asociados (Cliente ID 3 de la semilla tiene movimientos)
    const resDelCliConMov = await fetch(`${BASE_URL}/clientes/3`, { method: 'DELETE' });
    const delCliData = await resDelCliConMov.json();
    console.log('Intento de eliminar cliente con movimientos (debe ser 400):', resDelCliConMov.status, delCliData.message);
    if (resDelCliConMov.status !== 400) throw new Error('Falló la protección de eliminación de cliente con relaciones.');

    // Intentar borrar categoría con productos (Categoría 1 tiene productos)
    const resDelCatConProd = await fetch(`${BASE_URL}/categorias/1`, { method: 'DELETE' });
    const delCatData = await resDelCatConProd.json();
    console.log('Intento de eliminar categoría con productos (debe ser 400):', resDelCatConProd.status, delCatData.message);
    if (resDelCatConProd.status !== 400) throw new Error('Falló la protección de eliminación de categoría con productos.');

    // Limpiar clientes de prueba
    await fetch(`${BASE_URL}/clientes/${testPersonaId}`, { method: 'DELETE' });
    await fetch(`${BASE_URL}/clientes/${testEmpresaId}`, { method: 'DELETE' });

    console.log('\n====================================================');
    console.log('🎉 TODAS LAS PRUEBAS DE VERIFICACIÓN PASARON CON ÉXITO');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ ERROR DURANTE LA VERIFICACIÓN:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await pool.end();
  }
}

runTestSuite();

