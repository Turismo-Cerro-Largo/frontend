<script lang="ts">
    import { page } from '$app/state';
    import { slide } from 'svelte/transition';
    let reducirMovimiento = $state(false);
    $effect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const actualizar = () => {
            reducirMovimiento = media.matches;
        };
        actualizar();
        media.addEventListener('change', actualizar);
        return () => media.removeEventListener('change', actualizar);
    });
    let { claro = false }: { claro?: boolean } = $props();
    let abierto = $state(false);
    let saliendo = $state(false);
    let mensaje = $state('');
    let contenedor: HTMLDivElement;
    let boton = $state<HTMLButtonElement>();
    const cuenta = $derived(page.data.cuenta);
    $effect(() => {
        page.url.pathname;
        abierto = false;
    });
    function cerrar(event: PointerEvent) {
        if (contenedor && !contenedor.contains(event.target as Node)) abierto = false;
    }
    function teclado(event: KeyboardEvent) {
        if (event.key === 'Escape' && abierto) {
            abierto = false;
            boton?.focus();
        }
    }
    async function salir() {
        saliendo = true;
        mensaje = '';
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (!res.ok) throw new Error();
            window.location.assign('/');
        } catch {
            mensaje = 'No pudimos cerrar la sesión. Intentá nuevamente.';
            saliendo = false;
        }
    }
</script>

<svelte:window onpointerdown={cerrar} onkeydown={teclado} />
<div class="cuenta" class:claro class:abierto class:autenticada={!!cuenta} bind:this={contenedor}>
    {#if cuenta}
        <button class="acceso" bind:this={boton} aria-expanded={abierto} onclick={() => (abierto = !abierto)}>
            {#if cuenta.foto}<img src={cuenta.foto} alt="" />{:else}<span class="avatar">{cuenta.nombre.charAt(0).toUpperCase()}</span>{/if}
            <span class="nombre">{cuenta.nombre}</span><span class="flecha" aria-hidden="true">⌄</span>
        </button>
        {#if abierto}
            <nav class="opciones" aria-label="Mi cuenta" transition:slide={{ duration: reducirMovimiento ? 0 : 180 }}>
                {#if cuenta.rol === 'TURISTA'}
                    <a href="/turista/perfil">Editar perfil</a>
                    <a href="/turista/favoritos">Mis favoritos</a>
                    <a href="/turista/valoraciones">Mis valoraciones</a>
                {:else}
                    <a href={cuenta.rol === 'ADMINISTRADOR' ? '/administrador' : '/organizador'}>Mi panel</a>
                {/if}
                <button onclick={salir} disabled={saliendo}>{saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}</button>
                {#if mensaje}<p role="alert">{mensaje}</p>{/if}
            </nav>
        {/if}
    {:else}<a class="acceso" href="/login">Ingresar <span aria-hidden="true">→</span></a>{/if}
</div>

<style>
    .cuenta {
        position: relative;
        color: white;
        font-size: 13px;
    }
    .cuenta.autenticada {
        width: 170px;
        flex-shrink: 0;
    }
    .cuenta.claro {
        color: #233c35;
    }
    .acceso {
        display: flex;
        width: 100%;
        box-sizing: border-box;
        align-items: center;
        gap: 9px;
        border: 1px solid currentColor;
        border-radius: 999px;
        padding: 8px 15px;
        min-height: 44px;
        color: inherit;
        background: transparent;
        text-decoration: none;
        cursor: pointer;
    }
    .nombre {
        flex: 1;
        min-width: 0;
        text-align: left;
        overflow-wrap: anywhere;
    }
    img,
    .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        object-fit: cover;
    }
    .avatar {
        display: grid;
        place-items: center;
        background: #dce8dd;
        color: #245c4e;
    }
    .opciones {
        position: absolute;
        right: 0;
        top: calc(100% - 1px);
        width: 100%;
        box-sizing: border-box;
        max-width: calc(100vw - 32px);
        padding: 5px;
        background: white;
        color: #233c35;
        box-shadow: 0 10px 16px #00000012;
        border: 1px solid #dce5de;
        border-top: 0;
        border-radius: 0 0 18px 18px;
        z-index: 60;
    }
    .opciones a,
    .opciones button {
        display: block;
        width: 100%;
        text-align: left;
        padding: 11px 9px;
        box-sizing: border-box;
        white-space: normal;
        overflow-wrap: anywhere;
        border-radius: 8px;
        text-decoration: none;
        color: inherit;
        background: transparent;
        border: 0;
        cursor: pointer;
    }
    .opciones a:hover,
    .opciones button:hover {
        background: #edf3ed;
    }
    .opciones p {
        padding: 8px;
        color: #a22;
    }
    .acceso:focus-visible,
    .opciones a:focus-visible,
    .opciones button:focus-visible {
        outline: 3px solid #87b89b;
        outline-offset: 3px;
    }
    .avatar,
    img {
        flex-shrink: 0;
    }
    .flecha {
        transition: transform 180ms ease;
    }
    .abierto .flecha {
        transform: rotate(180deg);
    }
    .abierto .acceso {
        background: white;
        color: #233c35;
        border-color: #dce5de;
        border-radius: 18px 18px 0 0;
    }
    @media (prefers-reduced-motion: reduce) {
        .flecha {
            transition: none;
        }
    }
    @media (max-width: 600px) {
        .cuenta.autenticada {
            width: 155px;
        }
        .acceso {
            padding: 7px 9px;
            gap: 5px;
        }
    }
</style>
