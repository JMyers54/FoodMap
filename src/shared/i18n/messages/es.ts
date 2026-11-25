export const es = {
    prompt: {
        title: "Encuentra restaurantes cerca de ti",
        description:
            "Usa tu ubicación para mostrarte los restaurantes más cercanos. Solo la pedimos mientras usas la app.",
        button: "Usar mi ubicación",
        searching: "Buscando ubicación…",
        retry: "Reintentar",
    },
    errors: {
        denied: "No se concedió permiso. Puedes activarlo en el navegador y volver a intentarlo.",
        unavailable: "No pudimos obtener tu ubicación. Inténtalo de nuevo.",
        unsupported: "Tu navegador no permite usar la ubicación.",
    },
    language: {
        label: "Idioma",
    },
    search: {
        placeholder: "Buscar restaurantes",
    },
    options: {
        title: "Opciones",
        open: "Abrir opciones",
        close: "Cerrar opciones",
        account: "Mi cuenta",
        ranking: "Ranking mejor calificados",
        comingSoon: "Próximamente",
    },
    event: {
        text: "Tienes un evento cerca, para más detalle en",
        link: "Eventos",
    },
    results: {
        title: "Resultados",
        viewAll: "Ver todos",
        hint: "Usa tu ubicación para ver los restaurantes cercanos",
        loading: "Buscando restaurantes…",
        empty: "Todavía no hay restaurantes cerca",
        error: "No pudimos cargar los restaurantes",
    },
    filters: {
        title: "Filtros",
        all: "Todos",
        openNow: "Abierto ahora",
        hoursUnavailable: "Horarios no disponibles",
        modeLabel: "Modo de ruta",
        modes: {
            walk: "A pie",
            bike: "En bici",
            car: "En coche",
        },
        howToGetThere: "Cómo llegar",
        openInMaps: "Abrir en mapas",
        routeCalculating: "Calculando ruta…",
        routeError: "No se pudo calcular la ruta",
        hideRoute: "Ocultar ruta",
    },
    detail: {
        title: "Ficha del local",
        back: "Volver",
        address: "Dirección",
        phone: "Teléfono",
        website: "Sitio web",
        hours: "Horarios",
        hoursAvailable: "Horarios disponibles",
        hoursUnavailable: "Horarios no disponibles",
        loading: "Cargando ficha…",
        error: "No se pudo cargar la ficha",
        notFound: "No encontramos este local",
        noContact: "Sin datos de contacto",
    },
    map: {
        loadError: "No pudimos cargar el mapa. Revisa tu conexión e inténtalo de nuevo.",
        retry: "Reintentar",
    },
    categories: {
        restaurant: "Restaurante",
        cafe: "Café",
        fastFood: "Comida rápida",
        bar: "Bar",
    },
};

export type Messages = typeof es;
