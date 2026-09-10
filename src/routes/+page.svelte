<script>
  // @ts-nocheck
</script>

<svelte:head>
  <title>CerroLargo360</title>
</svelte:head>

<section
  class="relative w-full h-[45vh] md:h-[80vh] overflow-hidden bg-slate-900 mx-auto rounded-b-2xl"
>
  <!-- Imagen de fondo -->
  <img
    class="w-full h-full object-cover"
    src="https://live.staticflickr.com/65535/24653754832_451c8bc113_b.jpg"
    alt="Sierras del Yerbal"
  />

  <!-- Hero sobre la img -->
  <div
    class="absolute inset-0 w-full h-full flex items-center md:justify-center bg-black/20"
  >
    <div
      class="flex flex-col m-5 md:m-0 w-full max-w-2xl items-start md:items-center justify-start"
    >
      <!-- Titulo-Hero -->
      <h1
        class="text-4xl md:text-6xl font-bold text-white font-Cave text-left md:text-center drop-shadow-md"
      >
        Descubre Cerro Largo
      </h1>

      <!-- Mini bio -->
      <p
        class="text-left text-sm md:text-lg md:text-center font-normal font-sans text-white/90 mt-1 md:mt-2 drop-shadow"
      >
        Naturaleza, cultura y experiencias unicas
      </p>

      <!-- Barra de busqueda -->
      <div
        class="w-full max-w-md md:max-w-xl bg-white h-10 md:h-12 mt-3 md:mt-5 gap-2 flex flex-row text-black/60 items-center justify-start rounded-lg p-1.5 shadow-lg"
      >
        <div
          class="flex items-center justify-center shrink-0 h-full w-auto pl-2"
        >
          <div class="md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
              ></path>
            </svg>
          </div>
          <div class="hidden md:block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
              ></path>
            </svg>
          </div>
        </div>

        <input
          class="text-xs md:text-base bg-transparent h-full w-full text-left outline-none border-none focus:ring-0 focus:outline-none appearance-none min-w-0 text-slate-800 placeholder:text-slate-400 p-0"
          type="text"
          placeholder="¿Que lugar, evento o servicio buscas?"
        />

        <button
          class="hidden md:flex items-center justify-center shrink-0 hover:bg-green-700 active:scale-98 transition-all cursor-pointer h-full px-6 bg-green-600 text-sm md:text-base font-medium text-white rounded-md"
        >
          Buscar
        </button>
      </div>
    </div>
  </div>
</section>
