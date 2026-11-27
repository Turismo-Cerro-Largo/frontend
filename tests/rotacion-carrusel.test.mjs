import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rotacionCarrusel } from '../src/lib/actions/rotacion-carrusel.ts';

function escenario(t) {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const previos = Object.fromEntries(['window', 'document'].map(clave => [clave, Object.getOwnPropertyDescriptor(globalThis, clave)]));
    const documento = Object.assign(new EventTarget(), { hidden: false, activeElement: null, modal: false, querySelector() { return this.modal ? {} : null; } });
    const movimiento = Object.assign(new EventTarget(), { matches: false });
    const nodo = Object.assign(new EventTarget(), { foco: false, video: false, contains() { return this.foco; }, querySelectorAll() { return this.video ? [{ paused: false, ended: false }] : []; } });
    globalThis.document = documento;
    globalThis.window = { matchMedia: () => movimiento };
    let avances = 0;
    let pausa = false;
    const opciones = { avanzar: () => avances++, pausada: () => pausa, total: 3, reducirMovimiento: () => pausa = true };
    const accion = rotacionCarrusel(nodo, opciones);
    t.after(() => {
        accion.destroy();
        for (const [clave, descriptor] of Object.entries(previos)) {
            if (descriptor) Object.defineProperty(globalThis, clave, descriptor);
            else delete globalThis[clave];
        }
    });
    return { nodo, documento, movimiento, accion, opciones, avances: () => avances, pausar: valor => pausa = valor };
}

test('el carrusel avanza cada ocho segundos y se detiene al desmontar', t => {
    const e = escenario(t);
    t.mock.timers.tick(7999);
    assert.equal(e.avances(), 0);
    t.mock.timers.tick(1);
    assert.equal(e.avances(), 1);
    t.mock.timers.tick(8000);
    assert.equal(e.avances(), 2);
    e.accion.destroy();
    t.mock.timers.tick(16000);
    assert.equal(e.avances(), 2);
});

test('no avanza mientras se arrastra, se reproduce un video o hay un modal abierto', t => {
    const e = escenario(t);
    e.nodo.dispatchEvent(new Event('pointerdown'));
    t.mock.timers.tick(16000);
    assert.equal(e.avances(), 0);
    e.documento.dispatchEvent(new Event('pointerup'));
    e.documento.modal = true;
    t.mock.timers.tick(8000);
    assert.equal(e.avances(), 0);
    e.documento.modal = false;
    e.nodo.video = true;
    t.mock.timers.tick(8000);
    assert.equal(e.avances(), 0);
    e.nodo.video = false;
    t.mock.timers.tick(8000);
    assert.equal(e.avances(), 1);
});

test('respeta pausa manual, pestaña oculta y movimiento reducido', t => {
    const e = escenario(t);
    e.pausar(true);
    e.accion.update(e.opciones);
    t.mock.timers.tick(8000);
    assert.equal(e.avances(), 0);
    e.pausar(false);
    e.documento.hidden = true;
    e.documento.dispatchEvent(new Event('visibilitychange'));
    t.mock.timers.tick(8000);
    assert.equal(e.avances(), 0);
    e.documento.hidden = false;
    e.movimiento.matches = true;
    e.movimiento.dispatchEvent(new Event('change'));
    t.mock.timers.tick(8000);
    assert.equal(e.avances(), 0);
});
