import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: [".next/**", "node_modules/**", "public/sw.js"],
    },
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        files: ["**/*.ts", "**/*.tsx"],
    },
    {
        files: ["src/**/*.ts", "src/**/*.tsx"],
        plugins: {
            boundaries,
        },
        settings: {
            "boundaries/elements": [
                {
                    type: "presentation",
                    pattern: "src/domain/*/*/presentation",
                    partialMatch: false,
                    capture: ["subsystem", "module"],
                },
                {
                    type: "business",
                    pattern: "src/domain/*/*/business",
                    partialMatch: false,
                    capture: ["subsystem", "module"],
                },
                {
                    type: "data",
                    pattern: "src/domain/*/*/data",
                    partialMatch: false,
                    capture: ["subsystem", "module"],
                },
                {
                    type: "app",
                    pattern: "src/app",
                    partialMatch: false,
                },
                {
                    type: "platform",
                    pattern: "src/platform/*",
                    partialMatch: false,
                    capture: ["name"],
                },
                {
                    type: "shared",
                    pattern: "src/shared",
                    partialMatch: false,
                },
            ],
        },
        rules: {
            "boundaries/dependencies": [
                2,
                {
                    default: "allow",
                    policies: [
                        {
                            from: { element: { type: "presentation" } },
                            disallow: { to: { element: { types: ["data", "platform"] } } },
                        },
                        {
                            from: { element: { type: "business" } },
                            disallow: { to: { element: { types: ["presentation", "platform"] } } },
                        },
                        {
                            from: { element: { type: "data" } },
                            disallow: { to: { element: { types: ["presentation", "business"] } } },
                        },
                        {
                            from: { element: { type: "app" } },
                            disallow: { to: { element: { types: ["business", "data", "platform"] } } },
                        },
                        {
                            from: { element: { type: "shared" } },
                            disallow: {
                                to: {
                                    element: {
                                        types: ["app", "presentation", "business", "data", "platform"],
                                    },
                                },
                            },
                        },
                        {
                            from: { element: { type: "platform" } },
                            disallow: {
                                to: {
                                    element: {
                                        types: ["app", "presentation", "business", "data"],
                                    },
                                },
                            },
                        },
                    ],
                },
            ],
        },
    },
];

export default eslintConfig;
