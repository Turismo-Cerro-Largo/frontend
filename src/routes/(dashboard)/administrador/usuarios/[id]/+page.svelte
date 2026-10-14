<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    type Usuario = {
        id: number;
        nombres: string;
        apellidos: string;
        email: string;
        departamento: string | null;
        rol: 'TURISTA' | 'ADMINISTRADOR';
        creado_en: string;
        telefono: string | null;
        fecha_nacimiento: string | null;
        genero: string | null;
        cedula: string | null;
        _count: { comentarios: number; favoritos: number };
    };
    let usuario = $state<Usuario | null>(null);
    let cargando = $state(true);
    let error = $state('');
    const fecha = (v: string | null) => (v ? new Date(v).toLocaleDateString('es-UY', { timeZone: 'UTC' }) : 'No indicado');
    onMount(() => {
        const controller = new AbortController();
        async function cargar() {
            try {
                const id = page.params.id;
                const respuesta = await fetch(`/api/admin/usuarios/${encodeURIComponent(id ?? '')}`, { credentials: 'include', signal: controller.signal });
                if (!respuesta.ok)
                    throw new Error(
                        respuesta.status === 404
                            ? 'Usuario no encontrado.'
                            : respuesta.status === 403
                              ? 'No tenés permisos para consultar esta ficha.'
                              : `No se pudo cargar el usuario (${respuesta.status}).`
                    );
                usuario = await respuesta.json();
            } catch (e) {
                if (!controller.signal.aborted) error = e instanceof Error ? e.message : 'Error de conexión';
            } finally {
                if (!controller.signal.aborted) cargando = false;
            }
        }
        void cargar();
        return () => controller.abort();
    });
</script>

<svelte:head><title>Detalle de usuario | Cerro Largo 360</title></svelte:head>
<section class="mx-auto w-full max-w-5xl space-y-6 pb-8 text-[#26382e]">
    <a href="/administrador/usuarios" class="inline-block text-sm font-semibold text-[#477967] hover:underline">← Volver a usuarios</a>
    {#if cargando}<p class="rounded-xl bg-white p-6">Cargando usuario…</p>{:else if error}<p role="alert" class="rounded-xl bg-red-50 p-6 text-red-700">
            {error}
        </p>{:else if usuario}
        <header class="rounded-2xl border border-[#e0e6df] bg-white p-6 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wider text-[#718178]">Perfil de usuario #{usuario.id}</p>
            <h1 class="mt-2 text-3xl font-semibold">{usuario.nombres} {usuario.apellidos}</h1>
            <p class="mt-1 text-sm text-slate-500">{usuario.email}</p>
            <span class="mt-3 inline-block rounded-full bg-[#e4f0e7] px-3 py-1 text-sm font-medium text-[#38634a]">{usuario.rol === 'TURISTA' ? 'Turista' : 'Administrador'}</span>
        </header>
        <div class="grid gap-5 md:grid-cols-2">
            <div class="rounded-2xl border border-[#e0e6df] bg-white p-6">
                <h2 class="mb-4 text-lg font-semibold">Datos personales</h2>
                <dl class="space-y-3 text-sm">
                    {#each [{ l: 'Nombres', v: usuario.nombres }, { l: 'Apellidos', v: usuario.apellidos }, { l: 'Correo', v: usuario.email }, { l: 'Cédula', v: usuario.cedula ?? 'No indicada' }, { l: 'Teléfono', v: usuario.telefono ?? 'No indicado' }, { l: 'Departamento', v: usuario.departamento ?? 'No indicado' }, { l: 'Género', v: usuario.genero ?? 'No indicado' }, { l: 'Fecha de nacimiento', v: fecha(usuario.fecha_nacimiento) }, { l: 'Fecha de registro', v: fecha(usuario.creado_en) }] as item}<div
                            class="flex flex-wrap justify-between gap-x-4 border-b border-slate-100 pb-2"
                        >
                            <dt class="text-slate-500">{item.l}</dt>
                            <dd class="font-medium">{item.v}</dd>
                        </div>{/each}
                </dl>
            </div>
            <div class="space-y-5">
                <div class="rounded-2xl border border-[#e0e6df] bg-white p-6">
                    <h2 class="mb-4 text-lg font-semibold">Actividad</h2>
                    <div class="grid grid-cols-2 gap-3">
                        <a
                            href={`/administrador/usuarios/${usuario.id}/comentario`}
                            class="group rounded-xl bg-[#f4f8f3] p-4 transition-colors hover:bg-[#e4f0e7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#477967]"
                            aria-label={`Ver ${usuario._count.comentarios} comentarios de ${usuario.nombres} ${usuario.apellidos}`}
                        >
                            <p class="text-3xl font-semibold">{usuario._count.comentarios}</p>
                            <p class="text-sm text-slate-500 group-hover:text-[#38634a]">Comentarios →</p>
                        </a>
                        <a
                            href={`/administrador/usuarios/${usuario.id}/favoritos`}
                            class="group rounded-xl bg-[#f4f8f3] p-4 transition-colors hover:bg-[#e4f0e7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#477967]"
                            aria-label={`Ver ${usuario._count.favoritos} favoritos de ${usuario.nombres} ${usuario.apellidos}`}
                        >
                            <p class="text-3xl font-semibold">{usuario._count.favoritos}</p>
                            <p class="text-sm text-slate-500 group-hover:text-[#38634a]">Favoritos →</p>
                        </a>
                    </div>
                </div>
                <div class="rounded-2xl border border-[#e0e6df] bg-white p-5 text-sm text-slate-600">
                    <p class="font-semibold text-[#26382e]">Consulta administrativa</p>
                    <p class="mt-2">
                        Esta vista es de solo lectura. El modelo actual no tiene estado de cuenta para bloquear o activar usuarios. Tampoco se habilita el cambio de rol sin reglas
                        de seguridad adicionales.
                    </p>
                </div>
            </div>
        </div>
    {/if}
</section>
