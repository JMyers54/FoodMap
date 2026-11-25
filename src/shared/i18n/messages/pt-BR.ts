import type { Messages } from "./es";

export const ptBR = {
    prompt: {
        title: "Encontre restaurantes perto de você",
        description:
            "Usamos sua localização para mostrar os restaurantes mais próximos. Só pedimos enquanto você usa o app.",
        button: "Usar minha localização",
        searching: "Buscando localização…",
    },
    errors: {
        denied: "Permissão não concedida. Ative-a no navegador e tente novamente.",
        unavailable: "Não conseguimos obter sua localização. Tente novamente.",
        unsupported: "Seu navegador não permite usar a localização.",
    },
    language: {
        label: "Idioma",
    },
    search: {
        placeholder: "Buscar restaurantes",
    },
    event: {
        text: "Há um evento perto, veja mais detalhes em",
        link: "Eventos",
    },
    results: {
        title: "Resultados",
        viewAll: "Ver todos",
        hint: "Use sua localização para ver restaurantes próximos",
        loading: "Buscando restaurantes…",
        empty: "Ainda não há restaurantes por perto",
        error: "Não foi possível carregar os restaurantes",
    },
    filters: {
        title: "Filtros",
        all: "Todos",
        openNow: "Aberto agora",
        hoursUnavailable: "Horários indisponíveis",
        modeLabel: "Modo de rota",
        modes: {
            walk: "A pé",
            bike: "De bicicleta",
            car: "De carro",
        },
        howToGetThere: "Como chegar",
        openInMaps: "Abrir no mapa",
        routeCalculating: "Calculando rota…",
        routeError: "Não foi possível calcular a rota",
        hideRoute: "Ocultar rota",
    },
    detail: {
        title: "Detalhes do local",
        back: "Voltar",
        address: "Endereço",
        phone: "Telefone",
        website: "Site",
        hours: "Horários",
        hoursAvailable: "Horários disponíveis",
        hoursUnavailable: "Horários indisponíveis",
        loading: "Carregando detalhes…",
        error: "Não foi possível carregar os detalhes",
        notFound: "Não encontramos este local",
        noContact: "Sem dados de contato",
    },
    categories: {
        restaurant: "Restaurante",
        cafe: "Café",
        fastFood: "Comida rápida",
        bar: "Bar",
    },
} satisfies Messages;
