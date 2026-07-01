const fs = require("fs");
const path = require("path");
const Module = require("module");
const ts = require("typescript");

const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");

const storage = new Map();
const localStorage = {
  getItem(key) {
    return storage.has(key) ? storage.get(key) : null;
  },
  setItem(key, value) {
    storage.set(key, String(value));
  },
  removeItem(key) {
    storage.delete(key);
  },
  clear() {
    storage.clear();
  },
};

global.window = { localStorage };
global.localStorage = localStorage;

function resolveCandidate(filePath) {
  const attempts = [
    filePath,
    `${filePath}.ts`,
    `${filePath}.tsx`,
    `${filePath}.js`,
    `${filePath}.jsx`,
    path.join(filePath, "index.ts"),
    path.join(filePath, "index.tsx"),
    path.join(filePath, "index.js"),
    path.join(filePath, "index.jsx"),
    `${filePath}.json`,
  ];

  return attempts.find((candidate) => fs.existsSync(candidate));
}

function rewriteSpecifier(fromFile, specifier) {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) {
    return specifier;
  }

  const targetBase = specifier.startsWith("@/")
    ? path.join(srcRoot, specifier.slice(2))
    : path.resolve(path.dirname(fromFile), specifier);

  const resolved = resolveCandidate(targetBase);
  if (!resolved) {
    return specifier;
  }

  let relative = path.relative(path.dirname(fromFile), resolved).replace(/\\/g, "/");
  if (!relative.startsWith(".")) {
    relative = `./${relative}`;
  }
  return relative;
}

function rewriteImports(filePath, source) {
  return source.replace(/from\s+(["'])([^"']+)\1/g, (match, quote, specifier) => {
    const rewritten = rewriteSpecifier(filePath, specifier);
    return `from ${quote}${rewritten}${quote}`;
  });
}

function compileTs(filePath, source) {
  const rewritten = rewriteImports(filePath, source);
  return ts.transpileModule(rewritten, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2023,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      resolveJsonModule: true,
      skipLibCheck: true,
      sourceMap: false,
    },
    fileName: filePath,
  }).outputText;
}

require.extensions[".ts"] = function registerTs(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  module._compile(compileTs(filename, source), filename);
};

require.extensions[".tsx"] = require.extensions[".ts"];

const tests = [
  path.join(srcRoot, "lib", "search.test.ts"),
  path.join(srcRoot, "store", "shortlistStore.test.ts"),
  path.join(srcRoot, "store", "compareStore.test.ts"),
  path.join(srcRoot, "lib", "profiles.test.ts"),
];

for (const testFile of tests) {
  require(testFile);
}

console.log(`Ran ${tests.length} test files.`);