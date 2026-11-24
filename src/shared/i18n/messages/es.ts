export const es = {
    prompt: {
        title: "Encuentra restaurantes cerca de ti",
        description:
            "Usa tu ubicación para mostrarte los restaurantes más cercanos. Solo la pedimos mientras usas la app.",
        button: "Usar mi ubicación",
        searching: "Buscando ubicación…",
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
    categories: {
        restaurant: "Restaurante",
        cafe: "Café",
        fastFood: "Comida rápida",
    },
};

export type Messages = typeof es;
