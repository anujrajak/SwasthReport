module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/Pathology/patho-client/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/de429__pnpm_a0487cc0._.js",
  "chunks/[root-of-the-server]__0c2bdb23._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/Pathology/patho-client/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];