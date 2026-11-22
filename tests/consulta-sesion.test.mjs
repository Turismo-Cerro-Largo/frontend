import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearConsultaSesion, requiereCuenta } from '../src/lib/server/consulta-sesion.ts';

const valida = (nombre = 'Ana') => ({ cuenta: { id: 1, nombre, rol: 'TURISTA' }, status: 200, bloqueada: false });

test('las páginas públicas reutilizan la sesión hasta 30 segundos', async () => {
    let llamadas = 0, reloj = 1000;
    const consultar = crearConsultaSesion(async () => { llamadas++; return valida(); }, () => reloj);
    await consultar('sesion-a'); await consultar('sesion-a'); assert.equal(llamadas, 1);
    reloj += 30_000; await consultar('sesion-a'); assert.equal(llamadas, 2);
});
test('las comprobaciones frescas no reutilizan la caché', async () => {
    let llamadas = 0;
    const consultar = crearConsultaSesion(async () => { llamadas++; return valida(); });
    await consultar('a'); await consultar('a', true); await consultar('a', true); assert.equal(llamadas, 3);
});
test('agrupa consultas simultáneas del mismo ID sin mezclar sesiones', async () => {
    let llamadas = 0;
    const consultar = crearConsultaSesion(async token => { llamadas++; return valida(token); });
    const resultados = await Promise.all([consultar('a'), consultar('a'), consultar('b')]);
    assert.equal(llamadas, 2); assert.equal(resultados[0].cuenta.nombre, 'a'); assert.equal(resultados[2].cuenta.nombre, 'b');
});
test('una revocación comprobada invalida también el resultado público anterior', async () => {
    let revocada = false;
    const consultar = crearConsultaSesion(async () => revocada ? { cuenta: null, status: 401, bloqueada: false } : valida());
    await consultar('a'); revocada = true;
    assert.equal((await consultar('a', true)).cuenta, null);
    assert.equal((await consultar('a')).cuenta, null);
});
test('no almacena errores ni comparte objetos mutables entre peticiones', async () => {
    let llamadas = 0;
    const consultar = crearConsultaSesion(async () => { llamadas++; return llamadas === 1 ? { cuenta: null, status: 503, bloqueada: false } : valida(); });
    await consultar('a'); const cuenta = await consultar('a'); cuenta.cuenta.nombre = 'Cambiado';
    assert.equal((await consultar('a')).cuenta.nombre, 'Ana'); assert.equal(llamadas, 2);
});
test('un fallo de red libera la consulta en curso para poder reintentar', async () => {
    let llamadas = 0;
    const consultar = crearConsultaSesion(async () => { if (++llamadas === 1) throw new Error('red'); return valida(); });
    await assert.rejects(consultar('a'));
    assert.equal((await consultar('a')).status, 200);
});
test('solo consulta para documentos, datos y acciones de páginas', () => {
    const caso = { ruta: '/lugares/[id]', pathname: '/lugares/1', aceptaHtml: true, datos: false, accion: false };
    assert.equal(requiereCuenta(caso), true);
    assert.equal(requiereCuenta({ ...caso, aceptaHtml: false, datos: true }), true);
    assert.equal(requiereCuenta({ ...caso, ruta: '/api/[...path]', pathname: '/api/recursos/1' }), false);
    assert.equal(requiereCuenta({ ...caso, ruta: null, pathname: '/foto.png' }), false);
    assert.equal(requiereCuenta({ ...caso, ruta: '/sitemap.xml', pathname: '/sitemap.xml', aceptaHtml: false }), false);
    assert.equal(requiereCuenta({ ...caso, ruta: '/(dashboard)/turista', aceptaHtml: false }), true);
    assert.equal(requiereCuenta({ ...caso, aceptaHtml: false, accion: true }), true);
});
