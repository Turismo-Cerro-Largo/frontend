import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compile } from 'svelte/compiler';

for (const archivo of [
    'src/lib/components/inicio/HomeDescubre.svelte',
    'src/lib/components/turista/ImagenAmpliable.svelte',
    'src/lib/components/turista/Galeria.svelte',
    'src/routes/mapa/+page.svelte',
    'src/routes/(dashboard)/administrador/eventos/[id]/+page.svelte',
]) {
    test(`${archivo} no genera manejadores inline de carga o error`, async () => {
        const fuente = await readFile(new URL(`../${archivo}`, import.meta.url), 'utf8');
        const resultado = compile(fuente, { filename: archivo, generate: 'server' });
        assert.ok(!resultado.js.code.includes('this.__e=event'));
    });
}

test('el SVG integrado es un recurso estático sin contenido ejecutable', async () => {
    const svg = await readFile(new URL('../static/cerro-largo-360-mapa-localidades-v2.svg', import.meta.url), 'utf8');
    assert.doesNotMatch(svg, /<script\b|<foreignObject\b|\son[a-z]+\s*=|javascript:/i);
});
