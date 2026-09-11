// $lib/hooks/isMobile.svelte.ts
export function isMobile(breakpoint = 767) {
    let matches = $state(false);

    $effect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
        matches = mq.matches;

        function onChange(e: MediaQueryListEvent) {
            matches = e.matches;
        }
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    });

    return {
        get current() {
            return matches;
        },
    };
}