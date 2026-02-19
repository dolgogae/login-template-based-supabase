/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [require.resolve("./base"), "plugin:@next/eslint-plugin-next/recommended"],
  rules: {
    "@next/next/no-html-link-for-pages": "error",
  },
};
