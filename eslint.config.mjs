import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.strict,

  // Hard rule 13: `agentation` (dev-only UI feedback) must never be imported
  // outside components/dev/**. The build-time check:devtools guard is the
  // second line of defence. See docs/CONTRIBUTING.md#dev-tools.
  {
    rules: {
      // `noUncheckedIndexedAccess` makes indexed access T | undefined, so
      // terse non-null assertions after bounds-checks are intentional here.
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["agentation", "agentation-mcp", "agentation/*"],
              message:
                "Import dev tooling only from components/dev/**. It must never reach the production bundle.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["components/dev/**"],
    rules: { "no-restricted-imports": "off" },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
