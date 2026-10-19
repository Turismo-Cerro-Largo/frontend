<script lang="ts">
import { onMount } from 'svelte';
import { env } from '$env/dynamic/public';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { LugarMapa } from '$lib/types/mapa';
let {lugares, vista3d=false}:{lugares:LugarMapa[];vista3d?:boolean}=$props();
let contenedor:HTMLDivElement;
let mapa=$state<mapboxgl.Map|null>(null);
let fallo=$state('');
let listo=$state(false);
onMount(()=>{
    const token=env.PUBLIC_MAPBOX_TOKEN;
    if(!token?.startsWith('pk.')) {fallo='El mapa no está configurado. Podés consultar los lugares en la lista.';return;}
    try {
        const m=new mapboxgl.Map({container:contenedor,accessToken:token,style:'mapbox://styles/mapbox/standard',center:[-54.17,-32.35],zoom:8,maxBounds:[[-55.7,-33.4],[-52.9,-31.4]],maxPitch:60});
        mapa=m;
        m.addControl(new mapboxgl.NavigationControl(),'top-right');
        m.on('load',()=>{listo=true;fallo='';});
        m.on('error',()=>{fallo='No se pudo cargar una parte del mapa. Revisá la conexión; los lugares siguen disponibles en la lista.';});
        return ()=>{mapa=null;m.remove();};
    } catch {fallo='Tu navegador no pudo iniciar el mapa interactivo. Consultá los lugares en la lista.';}
});
$effect(()=>{
    if(!mapa || !listo) return;
    mapa.easeTo({pitch:vista3d?60:0,bearing:vista3d?-20:0,duration:500});
});
$effect(()=>{
    const m=mapa;
    if(!m || !listo) return;
    const grupos=new Map<string,LugarMapa[]>();
    for(const lugar of lugares) {
        const lat=Number(lugar.latitud),lon=Number(lugar.longitud);
        if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)continue;
        const clave=`${lon},${lat}`;
        grupos.set(clave,[...(grupos.get(clave)||[]),lugar]);
    }
    const marcadores:mapboxgl.Marker[]=[];
    const bounds=new mapboxgl.LngLatBounds();
    for(const [clave,grupo] of grupos){
        const [lon,lat]=clave.split(',').map(Number);
        const contenido=document.createElement('div');
        for(const l of grupo){
            const a=document.createElement('a');a.href=`/lugares/${l.id}`;a.textContent=`${l.nombre} →`;a.style.cssText='display:block;color:#28654d;font-weight:600;padding:8px 0;';contenido.append(a);
            const p=document.createElement('p');p.textContent=`${l.categoria.nombre} · ${l.localidad}`;contenido.append(p);
        }
        const boton=document.createElement('button');boton.type='button';boton.textContent=grupo.length>1?String(grupo.length):'●';boton.setAttribute('aria-label',grupo.map(l=>l.nombre).join(', '));boton.style.cssText='background:#28654d;color:white;border:3px solid white;border-radius:50%;width:36px;height:36px;box-shadow:0 2px 8px #0005;cursor:pointer;';
        const marker=new mapboxgl.Marker({element:boton}).setLngLat([lon,lat]).setPopup(new mapboxgl.Popup({offset:22}).setDOMContent(contenido)).addTo(m);
        marcadores.push(marker);bounds.extend([lon,lat]);
    }
    if(!bounds.isEmpty())m.fitBounds(bounds,{padding:65,maxZoom:12,duration:500});
    return ()=>marcadores.forEach(m=>m.remove());
});
</script>
<div class="mapa"><div bind:this={contenedor} class="lienzo" aria-label="Mapa interactivo de lugares publicados"></div>{#if fallo}<p class="fallo" role="status">{fallo}</p>{/if}</div>
<style>.mapa{position:relative;min-height:500px;height:65vh;border-radius:16px;overflow:hidden;background:#e6ede5}.lienzo{width:100%;height:100%}.fallo{position:absolute;bottom:16px;left:16px;right:16px;padding:14px;border-radius:8px;background:white;color:#8a4120;box-shadow:0 2px 10px #0002;font-size:13px}@media(max-width:600px){.mapa{min-height:380px;height:55vh}}</style>
