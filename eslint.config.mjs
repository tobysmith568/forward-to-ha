import tobysmith568 from "@tobysmith568/eslint-config";

const eslintConfig = [
  ...tobysmith568.recommended,
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/coverage/**"]
  }
];

export default eslintConfig;
