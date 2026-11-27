import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zoomImagen } from '../src/lib/actions/zoom-imagen.ts';

class Visor extends EventTarget {
    clientHeight = 600;
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

test('la rueda amplía alrededor del cursor, limita el zoom y libera el listener', async () => {
    const visor = new Visor();
    let zoom = 1;
    const accion = zoomImagen(visor, { leer: () => zoom, cambiar: valor => zoom = valor });
    const girar = (deltaY, extras = {}) => {
        const evento = Object.assign(new Event('wheel', { cancelable: true }), { deltaY, deltaMode: 0, clientX: 100, clientY: 100, ctrlKey: false, metaKey: false, ...extras });
        visor.dispatchEvent(evento);
        return evento;
    };
    assert.equal(girar(-120).defaultPrevented, true);
    await Promise.resolve();
    assert.ok(zoom > 1);
    assert.ok(Math.abs(visor.scrollLeft - (zoom - 1) * 100) < 0.001);
    girar(-10000);
    girar(-10000);
    assert.equal(zoom, 3);
    girar(10000);
    girar(10000);
    assert.equal(zoom, 1);
    assert.equal(girar(-120, { ctrlKey: true }).defaultPrevented, false);
    assert.equal(zoom, 1);
    accion.destroy();
    assert.equal(girar(-120).defaultPrevented, false);
    assert.equal(zoom, 1);
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
