import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zoomImagen } from '../src/lib/actions/zoom-imagen.ts';

class Visor extends EventTarget {
    scrollLeft = 0;
    scrollTop = 0;
    setPointerCapture() {}
    getBoundingClientRect() { return { left: 0, top: 0 }; }
    dedo(tipo, id, x, y) {
        this.dispatchEvent(Object.assign(new Event(tipo), { pointerId: id, pointerType: 'touch', clientX: x, clientY: y }));
    }
}

test('dos dedos amplían la foto y respetan los límites del zoom', async () => {
    const visor = new Visor();
    let zoom = 1;
    const accion = zoomImagen(visor, { leer: () => zoom, cambiar: valor => zoom = valor });
    visor.dedo('pointerdown', 1, 100, 100);
    visor.dedo('pointerdown', 2, 200, 100);
    visor.dedo('pointermove', 2, 300, 100);
    await Promise.resolve();
    assert.equal(zoom, 2);
    assert.equal(visor.scrollLeft, 200);
    visor.dedo('pointermove', 2, 1000, 100);
    assert.equal(zoom, 3);
    visor.dedo('pointermove', 2, 110, 100);
    assert.equal(zoom, 1);
    accion.destroy();
});

test('el arrastre mueve la foto y una cancelación libera el gesto', () => {
    const visor = new Visor();
    const accion = zoomImagen(visor, { leer: () => 2, cambiar: () => {} });
    visor.dedo('pointerdown', 1, 100, 100);
    visor.dedo('pointermove', 1, 70, 60);
    assert.equal(visor.scrollLeft, 30);
    assert.equal(visor.scrollTop, 40);
    visor.dedo('pointercancel', 1, 70, 60);
    visor.dedo('pointermove', 1, 0, 0);
    assert.equal(visor.scrollLeft, 30);
    accion.destroy();
});
