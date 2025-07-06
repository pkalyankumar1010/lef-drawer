import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
    // Ignore patterns for files that shouldn't be linted
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "react-dist/**",
            "react-dist_*/**",
            "read-dist_*/**",
            "react_unbuild_code/**",
            "media/**",
            ".vscode-test-web/**",
            "**/*.min.js",
            "**/assets/*.js"
        ]
    },
    {
        files: ["**/*.ts"],
    }, 
    {
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: "module",
        },

        rules: {
            "@typescript-eslint/naming-convention": ["warn", {
                selector: "import",
                format: ["camelCase", "PascalCase"],
            }],

            curly: "warn",
            eqeqeq: "warn",
            "no-throw-literal": "warn",
            semi: "warn",
        },
    }
];