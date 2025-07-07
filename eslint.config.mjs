import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals", 
    "next/typescript",
    "prettier"
  ),
  {
    rules: {
      // React/Next.js specific rules
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "@next/next/no-page-custom-font": "off",
      
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "off", // Turn off any warnings for build
      "@typescript-eslint/no-require-imports": "error",
      
      // General code quality
      "prefer-const": "error",
      "no-var": "error",
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      
      // Import organization
      "import/order": [
        "error",
        {
          "groups": [
            "builtin",
            "external", 
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          "newlines-between": "always",
          "alphabetize": {
            "order": "asc",
            "caseInsensitive": true
          }
        }
      ]
    }
  }
];

export default eslintConfig;
