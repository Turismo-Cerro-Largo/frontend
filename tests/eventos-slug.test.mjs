import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
const fuente = await readFile(new URL('../src/routes/eventos/[slug]/+page.server.ts', import.meta.url), 'utf8');
const codigo = stripTypeScriptTypes(fuente).replace(/^import .*;\r?$/gm, '').replace(/export /g, '');
function cargar(evento) {
 const consultas = [];
 const load = new Function('consultar', 'redirect', 'error', codigo + ';return load;')(
  async ruta => { consultas.push(ruta); return ruta.includes('?') ? [evento] : evento; },
  (status,location) => { throw {status,location}; },
  (status,message) => { throw {status,message}; },
 );
 return {load,consultas};
}
test('la URL numérica redirige de forma permanente al slug', async () => {
 const {load} = cargar({id:14,slug:'paseo-emprendedor'});
 await assert.rejects(load({params:{slug:'14'},request:new Request('https://ejemplo.test/eventos/14')}), e => e.status===308 && e.location==='/eventos/paseo-emprendedor');
});
test('el slug carga directamente y no redirige en bucle', async () => {
 const evento={id:14,slug:'paseo-emprendedor'};
 const {load,consultas}=cargar(evento);
 assert.deepEqual(await load({params:{slug:evento.slug},request:new Request('https://ejemplo.test')}),{evento});
 assert.deepEqual(consultas,['eventos/paseo-emprendedor']);
});
test('rechaza rutas inválidas antes de consultar la API', async () => {
 const {load,consultas}=cargar({});
 await assert.rejects(load({params:{slug:'../admin'},request:new Request('https://ejemplo.test')}),e=>e.status===404);
 assert.equal(consultas.length,0);
});
