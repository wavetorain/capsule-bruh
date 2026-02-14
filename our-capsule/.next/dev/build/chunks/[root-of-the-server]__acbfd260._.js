module.exports = [
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[project]/postcss.config.mjs [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/postcss.config.mjs', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[turbopack-node]/transforms/transforms.ts [postcss] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared utilities for our 2 transform implementations.
 */ __turbopack_context__.s([
    "fromPath",
    ()=>fromPath,
    "getReadEnvVariables",
    ()=>getReadEnvVariables,
    "toPath",
    ()=>toPath
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
const contextDir = process.cwd();
const toPath = (file)=>{
    const relPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["relative"])(contextDir, file);
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["isAbsolute"])(relPath)) {
        throw new Error(`Cannot depend on path (${file}) outside of root directory (${contextDir})`);
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"] !== '/' ? relPath.replaceAll(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"], '/') : relPath;
};
const fromPath = (path)=>{
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(/* turbopackIgnore: true */ contextDir, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"] !== '/' ? path.replaceAll('/', __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"]) : path);
};
// Patch process.env to track which env vars are read
const originalEnv = process.env;
const readEnvVars = new Set();
process.env = new Proxy(originalEnv, {
    get (target, prop) {
        if (typeof prop === 'string') {
            // We register the env var as dependency on the
            // current transform and all future transforms
            // since the env var might be cached in module scope
            // and influence them all
            readEnvVars.add(prop);
        }
        return Reflect.get(target, prop);
    },
    set (target, prop, value) {
        return Reflect.set(target, prop, value);
    }
});
function getReadEnvVariables() {
    return Array.from(readEnvVars);
}
}),
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>transform,
    "init",
    ()=>init
]);
(()=>{
    const e = new Error("Cannot find module '@vercel/turbopack/postcss'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
// @ts-ignore
var __TURBOPACK__imported__module__$5b$project$5d2f$postcss$2e$config$2e$mjs__$5b$postcss$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/postcss.config.mjs [postcss] (ecmascript)");
var __TURBOPACK__imported__module__$5b$turbopack$2d$node$5d2f$transforms$2f$transforms$2e$ts__$5b$postcss$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[turbopack-node]/transforms/transforms.ts [postcss] (ecmascript)");
;
;
;
let processor;
const init = async (ipc)=>{
    let config = __TURBOPACK__imported__module__$5b$project$5d2f$postcss$2e$config$2e$mjs__$5b$postcss$5d$__$28$ecmascript$29$__["default"];
    if (typeof config === 'function') {
        config = await config({
            env: 'development'
        });
    }
    if (typeof config === 'undefined') {
        throw new Error('PostCSS config is undefined (make sure to export an function or object from config file)');
    }
    let plugins;
    if (Array.isArray(config.plugins)) {
        plugins = config.plugins.map((plugin)=>{
            if (Array.isArray(plugin)) {
                return plugin;
            } else if (typeof plugin === 'string') {
                return [
                    plugin,
                    {}
                ];
            } else {
                return plugin;
            }
        });
    } else if (typeof config.plugins === 'object') {
        plugins = Object.entries(config.plugins).filter(([, options])=>options);
    } else {
        plugins = [];
    }
    const loadedPlugins = plugins.map((plugin)=>{
        if (Array.isArray(plugin)) {
            const [arg, options] = plugin;
            let pluginFactory = arg;
            if (typeof pluginFactory === 'string') {
                pluginFactory = require(/* turbopackIgnore: true */ pluginFactory);
            }
            if (pluginFactory.default) {
                pluginFactory = pluginFactory.default;
            }
            return pluginFactory(options);
        }
        return plugin;
    });
    processor = postcss(loadedPlugins);
};
async function transform(ipc, cssContent, name, sourceMap) {
    const { css, map, messages } = await processor.process(cssContent, {
        from: name,
        to: name,
        map: sourceMap ? {
            inline: false,
            annotation: false
        } : undefined
    });
    const assets = [];
    const filePaths = [];
    const buildFilePaths = [];
    const directories = [];
    for (const msg of messages){
        switch(msg.type){
            case 'asset':
                assets.push({
                    file: msg.file,
                    content: msg.content,
                    sourceMap: !sourceMap ? undefined : typeof msg.sourceMap === 'string' ? msg.sourceMap : JSON.stringify(msg.sourceMap)
                });
                break;
            case 'dependency':
            case 'missing-dependency':
                filePaths.push((0, __TURBOPACK__imported__module__$5b$turbopack$2d$node$5d2f$transforms$2f$transforms$2e$ts__$5b$postcss$5d$__$28$ecmascript$29$__["toPath"])(msg.file));
                break;
            case 'build-dependency':
                buildFilePaths.push((0, __TURBOPACK__imported__module__$5b$turbopack$2d$node$5d2f$transforms$2f$transforms$2e$ts__$5b$postcss$5d$__$28$ecmascript$29$__["toPath"])(msg.file));
                break;
            case 'dir-dependency':
                directories.push([
                    (0, __TURBOPACK__imported__module__$5b$turbopack$2d$node$5d2f$transforms$2f$transforms$2e$ts__$5b$postcss$5d$__$28$ecmascript$29$__["toPath"])(msg.dir),
                    msg.glob
                ]);
                break;
            case 'context-dependency':
                directories.push([
                    (0, __TURBOPACK__imported__module__$5b$turbopack$2d$node$5d2f$transforms$2f$transforms$2e$ts__$5b$postcss$5d$__$28$ecmascript$29$__["toPath"])(msg.dir),
                    '**'
                ]);
                break;
            default:
                break;
        }
    }
    ipc.sendInfo({
        type: 'dependencies',
        filePaths,
        directories,
        buildFilePaths,
        envVariables: (0, __TURBOPACK__imported__module__$5b$turbopack$2d$node$5d2f$transforms$2f$transforms$2e$ts__$5b$postcss$5d$__$28$ecmascript$29$__["getReadEnvVariables"])()
    });
    return {
        css,
        map: sourceMap ? JSON.stringify(map) : undefined,
        assets
    };
}
}),
"[project]/node_modules/picocolors/picocolors.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/picocolors/picocolors.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/tokenize.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/tokenize.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/terminal-highlight.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/terminal-highlight.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/css-syntax-error.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/css-syntax-error.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/stringifier.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/stringifier.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/stringify.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/stringify.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/symbols.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/symbols.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/node.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/node.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/comment.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/comment.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/declaration.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/declaration.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/container.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/container.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/at-rule.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/at-rule.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/document.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/document.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/nanoid/non-secure/index.cjs [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/nanoid/non-secure/index.cjs', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/source-map-js/lib/base64.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/source-map-js/lib/base64.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/source-map-js/lib/base64-vlq.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/source-map-js/lib/base64-vlq.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/source-map-js/lib/util.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/source-map-js/lib/util.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/source-map-js/lib/array-set.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/source-map-js/lib/array-set.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/source-map-js/lib/mapping-list.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/source-map-js/lib/mapping-list.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/source-map-js/lib/source-map-generator.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/source-map-js/lib/source-map-generator.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/source-map-js/lib/binary-search.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/source-map-js/lib/binary-search.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/source-map-js/lib/quick-sort.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/source-map-js/lib/quick-sort.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/source-map-js/lib/source-map-consumer.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/source-map-js/lib/source-map-consumer.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/source-map-js/lib/source-node.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/source-map-js/lib/source-node.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/source-map-js/source-map.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/source-map-js/source-map.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/previous-map.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/previous-map.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/input.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/input.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/root.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/root.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/list.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/list.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/rule.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/rule.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/fromJSON.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/fromJSON.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/map-generator.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/map-generator.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/parser.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/parser.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/parse.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/parse.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/warning.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/warning.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/result.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/result.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/warn-once.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/warn-once.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/lazy-result.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/lazy-result.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/no-work-result.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/no-work-result.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/processor.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/processor.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/postcss.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/postcss.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/postcss/lib/postcss.mjs [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/node_modules/postcss/lib/postcss.mjs', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__acbfd260._.js.map