import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
const fuente = await readFile(new URL('../src/routes/geocodificacion-inversa/+server.ts', import.meta.url),'utf8');
const codigo=stripTypeScriptTypes(fuente).replace(/^import .*;\r?$/gm,'').replace(/export /g,'');
const json=(data,init={})=>new Response(JSON.stringify(data),{...init,headers:{'Content-Type':'application/json',...init.headers}});
function handler(proveedor=async()=>json({address:{country_code:'uy',road:'18 de Julio',house_number:'854',city:'Melo'}})){
 let llamadas=0;
 const GET=new Function('env','json','fetch',codigo+';return GET;')({},json,async(...args)=>{llamadas++;return proveedor(...args);});
 return {GET,llamadas:()=>llamadas};
}
const evento=(rol,query='lat=-32.36673&lon=-54.16706')=>({locals:{cuenta:rol?{id:1,rol}:null},url:new URL('https://ejemplo.test/geocodificacion-inversa?'+query)});
test('solicita sesión y no consulta el proveedor sin permiso',async()=>{
 const h=handler();
 assert.equal((await h.GET(evento(null))).status,401);
 assert.equal((await h.GET(evento('TURISTA'))).status,403);
 assert.equal(h.llamadas(),0);
});
for(const rol of ['ORGANIZADOR','ADMINISTRADOR'])test(rol+' recibe calle, número y localidad',async()=>{
 const h=handler(),r=await h.GET(evento(rol));
 assert.equal(r.status,200);
 assert.deepEqual(await r.json(),{direccion:'18 de Julio 854',localidades:['Melo']});
 assert.equal(h.llamadas(),1);
});
test('rechaza coordenadas inválidas antes de llamar al proveedor',async()=>{
 const h=handler();
 assert.equal((await h.GET(evento('ORGANIZADOR','lat=foo&lon=-54'))).status,400);
 assert.equal(h.llamadas(),0);
});
test('una falla del proveedor se informa como servicio no disponible',async()=>{
 const h=handler(async()=>{throw Error('red');});
 assert.equal((await h.GET(evento('ORGANIZADOR'))).status,503);
});
test('reutiliza la dirección ya consultada sin otra llamada al proveedor',async()=>{
 const h=handler();await h.GET(evento('ORGANIZADOR'));await h.GET(evento('ORGANIZADOR'));
 assert.equal(h.llamadas(),1);
});
const clienteFuente=await readFile(new URL('../src/lib/localidades/direccion-mapa.ts',import.meta.url),'utf8');
const clienteCodigo=stripTypeScriptTypes(clienteFuente).replace(/export /g,'');
test('completa calle y localidad sin mover el marcador ni sobrescribir cambios manuales',async()=>{
 const valores={direccion:'',localidad:'',estado:''};
 let busqueda,opciones;
 const crear=new Function('fetch','setTimeout',clienteCodigo+';return crearBusquedaDireccion;')(async(_url,init)=>{
  opciones=init;busqueda.editarDireccion();valores.direccion='Dirección manual';
  return json({direccion:'18 de Julio 854',localidades:['Melo']});
 },fn=>{fn();return 0;});
 busqueda=crear({localidades:()=>['Melo'],direccion:v=>valores.direccion=v,localidad:v=>valores.localidad=v,estado:v=>valores.estado=v});
 await busqueda.buscar(-54.16706,-32.36673);
 assert.equal(valores.direccion,'Dirección manual');
 assert.equal(valores.localidad,'Melo');
 assert.equal(opciones.credentials,'same-origin');
 assert.equal(opciones.cache,'no-store');
});
