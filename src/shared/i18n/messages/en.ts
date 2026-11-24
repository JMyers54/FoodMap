import type { Messages } from "./es";

export const en = {
    prompt: {
        title: "Find restaurants near you",
        description:
            "We use your location to show the closest restaurants. We only ask while you're using the app.",
        button: "Use my location",
        searching: "Finding your location…",
    },
    errors: {
        denied: "Permission wasn't granted. Enable it in your browser and try again.",
        unavailable: "We couldn't get your location. Please try again.",
        unsupported: "Your browser doesn't allow location access.",
    },
    language: {
        label: "Language",
    },
    search: {
        placeholder: "Search restaurants",
    },
    event: {
        text: "There's an event nearby, see the details in",
        link: "Events",
    },
    results: {
        title: "Results",
        viewAll: "View all",
        hint: "Use your location to see nearby restaurants",
        loading: "Finding restaurants…",
        empty: "There are no restaurants nearby yet",
        error: "We couldn't load the restaurants",
    },
    categories: {
        restaurant: "Restaurant",
        cafe: "Cafe",
        fastFood: "Fast food",
    },
} satisfies Messages;
