"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const zlib = require("node:zlib");
const webpack = require("webpack");
const { chromium } = require("playwright");
const createConfig = require("../webpack.config");

const root = path.resolve(__dirname, "..");
const contributionId = "mock.multivalue-form-control";

const platformScript = `
window.mockState = { value: "Windows", saves: 0 };
window.$ = function (target) {
    return { bind: function (event, callback) { target.addEventListener(event, callback); } };
};
window.$.noop = function () {};
const service = {
    getFieldValue: async () => mockState.value,
    getAllowedFieldValues: async () => ["Windows", "Linux", "Mac"],
    getFields: async () => [{ referenceName: "Custom.Platform", readOnly: false }],
    getInvalidFields: async () => [],
    setFieldValue: async (field, value) => {
        mockState.value = value;
        parent.postMessage({ mockFieldChanged: true, field, value }, location.origin);
    },
    beginSaveWorkItem: () => { mockState.saves++; }
};
class DelayedFunction {
    constructor(context, delay, name, callback) { this.delay = delay; this.callback = callback; }
    reset() { this.cancel(); this.timer = setTimeout(this.callback, this.delay); }
    cancel() { clearTimeout(this.timer); }
}
const modules = {
    "TFS/WorkItemTracking/Services": { WorkItemFormService: { getService: async () => service } },
    "TFS/WorkItemTracking/ExtensionContracts": {},
    "TFS/WorkItemTracking/RestClient": { getClient: () => ({ getField: async () => ({}) }) },
    "VSS/Utils/Core": { DelayedFunction },
    "VSS/Utils/UI": { BrowserCheckUtils: { isSafari: () => false } }
};
window.define = function (dependencies, factory) {
    modules["dist/src/multivalue"] = factory(...dependencies.map(name => {
        if (!(name in modules)) throw new Error("Unmocked AMD dependency: " + name);
        return modules[name];
    }));
};
window.define.amd = {};
window.require = function (dependencies, callback) {
    const complete = () => callback(...dependencies.map(name => modules[name]));
    if (dependencies.includes("dist/src/multivalue") && !("dist/src/multivalue" in modules)) {
        const script = document.createElement("script");
        script.src = "/dist/src/multivalue.js";
        script.onload = complete;
        script.onerror = () => { throw new Error("Bundle failed to load"); };
        document.head.appendChild(script);
    } else {
        complete();
    }
};
window.require.config = function () {};
`;

function hostHtml() {
    return `<!DOCTYPE html><html><body>
<script>
window.mockHost = { ready: false, failed: null, value: "Windows", started: performance.now() };
let messageId = 1000;
function invokeFrame(methodName, params) {
    document.querySelector("iframe").contentWindow.postMessage(JSON.stringify({
        id: messageId++, jsonrpc: "2.0", instanceId: ${JSON.stringify(contributionId)}, methodName, params
    }), location.origin);
}
addEventListener("message", event => {
    if (event.origin !== location.origin || event.source !== document.querySelector("iframe").contentWindow) return;
    if (event.data.mockFieldChanged) {
        mockHost.value = event.data.value;
        invokeFrame("onFieldChanged", [{ changedFields: { [event.data.field]: event.data.value } }]);
        return;
    }
    if (typeof event.data !== "string") return;
    const message = JSON.parse(event.data);
    if (!message.instanceId) return;
    let result = null;
    if (message.methodName === "initialHandshake") {
        result = {
            pageContext: {
                webContext: { host: { uri: location.origin + "/", relativeUri: "/" } },
                microsoftAjaxConfig: { cultureInfo: {} },
                coreReferences: { scripts: [{ isCoreModule: true, url: "/mock-platform.js" }], stylesheets: [] },
                moduleLoaderConfig: {}, diagnostics: { bundlingEnabled: false }
            },
            initialConfig: { witInputs: { FieldName: "Custom.Platform", AllowCustom: false } },
            contribution: { id: ${JSON.stringify(contributionId)} },
            extensionContext: { baseUri: location.origin + "/" }
        };
    } else if (message.methodName === "notifyLoadSucceeded") {
        mockHost.ready = true;
        mockHost.readyMs = performance.now() - mockHost.started;
        invokeFrame("onLoaded", [{}]);
    } else if (message.methodName === "notifyLoadFailed") {
        mockHost.failed = message.params;
    }
    event.source.postMessage(JSON.stringify({
        id: message.id, jsonrpc: "2.0", result, handshakeToken: message.handshakeToken
    }), event.origin);
});
</script>
<iframe title="Multivalue control" src="/dist/multivalue.html" style="width:600px;height:450px;border:0"></iframe>
</body></html>`;
}

async function buildBaseline(directory) {
    const config = createConfig({}, { mode: "production" });
    config.devtool = "inline-source-map";
    config.output.path = directory;
    const compiler = webpack(config);
    try {
        await new Promise((resolve, reject) => compiler.run((error, stats) => {
            if (error) return reject(error);
            if (stats.hasErrors()) return reject(new Error(stats.toString({ all: false, errors: true })));
            resolve();
        }));
    } finally {
        await new Promise((resolve, reject) => compiler.close(error => error ? reject(error) : resolve()));
    }
}

async function main() {
    assert.equal(createConfig({}, { mode: "production" }).devtool, false);
    assert.equal(createConfig({}, { mode: "development" }).devtool, "inline-source-map");
    assert.equal(createConfig().devtool, "inline-source-map");
    const fixedBundle = fs.readFileSync(path.join(root, "dist/src/multivalue.js"));
    assert.ok(!fixedBundle.includes(Buffer.from("sourceMappingURL=data:")));
    assert.ok(!fixedBundle.includes(Buffer.from("webpack-dev-server/client")));
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "multivalue-loading-"));
    let browser;
    let server;
    try {
        await buildBaseline(path.join(temporary, "baseline"));
        const baselineBundle = fs.readFileSync(path.join(temporary, "baseline/src/multivalue.js"));
        assert.ok(baselineBundle.includes(Buffer.from("sourceMappingURL=data:")));
        const bundles = { baseline: zlib.gzipSync(baselineBundle), fixed: zlib.gzipSync(fixedBundle) };
        assert.ok(fixedBundle.length < baselineBundle.length * 0.3);
        assert.ok(bundles.fixed.length < bundles.baseline.length * 0.3);
        console.log(JSON.stringify({
            baseline: { bytes: baselineBundle.length, gzipBytes: bundles.baseline.length },
            fixed: { bytes: fixedBundle.length, gzipBytes: bundles.fixed.length }
        }, null, 2));
        let variant = "fixed";
        server = http.createServer((request, response) => {
            const pathname = new URL(request.url, "http://localhost").pathname;
            response.setHeader("Cache-Control", "no-store");
            if (pathname === "/") {
                response.setHeader("Content-Type", "text/html");
                return response.end(hostHtml());
            }
            if (pathname === "/mock-platform.js") {
                response.setHeader("Content-Type", "application/javascript");
                return response.end(platformScript);
            }
            if (pathname === "/dist/src/multivalue.js") {
                response.setHeader("Content-Type", "application/javascript");
                response.setHeader("Content-Encoding", "gzip");
                response.setHeader("Content-Length", bundles[variant].length);
                return response.end(bundles[variant]);
            }
            const allowed = {
                "/dist/multivalue.html": "dist/multivalue.html",
                "/dist/multi-selection.css": "dist/multi-selection.css",
                "/dist/libs/VSS.SDK.min.js": "dist/libs/VSS.SDK.min.js",
                "/dist/libs/es6-promise.min.js": "dist/libs/es6-promise.min.js"
            };
            if (!(pathname in allowed)) {
                response.writeHead(404);
                return response.end();
            }
            response.setHeader("Content-Type", pathname.endsWith(".html") ? "text/html" :
                pathname.endsWith(".css") ? "text/css" : "application/javascript");
            response.end(fs.readFileSync(path.join(root, allowed[pathname])));
        });
        await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
        const url = `http://127.0.0.1:${server.address().port}`;
        browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "chrome" });
        const profiles = [
            { name: "unthrottled", latency: 0, throughput: -1 },
            { name: "bandwidth-250-kbit", latency: 20, throughput: 250000 / 8 },
            { name: "latency-1000-ms", latency: 1000, throughput: 10000000 / 8 },
            { name: "3G", latency: 2000, throughput: 400000 / 8 }
        ];
        for (const profile of profiles) {
            const measurements = {};
            for (const current of ["baseline", "fixed"]) {
                variant = current;
                const context = await browser.newContext();
                try {
                    await context.route("https://spoprod-a.akamaihd.net/**", route => route.abort());
                    const page = await context.newPage();
                    const errors = [];
                    page.on("pageerror", error => errors.push(error.message));
                    const session = await context.newCDPSession(page);
                    await session.send("Network.enable");
                    await session.send("Network.setCacheDisabled", { cacheDisabled: true });
                    await session.send("Network.emulateNetworkConditions", {
                        offline: false, latency: profile.latency,
                        downloadThroughput: profile.throughput, uploadThroughput: profile.throughput
                    });
                    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
                    await page.waitForFunction(() => window.mockHost.ready || window.mockHost.failed, null, { timeout: 120000 });
                    const state = await page.evaluate(() => window.mockHost);
                    assert.equal(state.failed, null);
                    measurements[current] = state.readyMs;
                    const control = page.frameLocator("iframe");
                    await control.locator(".tag-text").filter({ hasText: "Windows" }).waitFor();
                    if (current === "fixed" && profile.name === "unthrottled") {
                        await control.locator(".AddBtn").click();
                        await control.locator(".ms-Checkbox-label").filter({ hasText: "Linux" }).click();
                        await page.waitForFunction(() => window.mockHost.value === "Windows;Linux");
                        await control.locator(".customTagPicker").filter({ hasText: "Windows" }).locator(".closeIconcustom").click();
                        await page.waitForFunction(() => window.mockHost.value === "Linux");
                        await control.locator(".AddBtn").click();
                        await control.locator(".AddBtn").press("Control+s");
                        const frame = page.frames().find(candidate => candidate.url().includes("multivalue.html"));
                        assert.equal(await frame.evaluate(() => window.mockState.saves), 1);
                        await page.screenshot({ path: path.join(temporary, "control-desktop.png") });
                        await page.setViewportSize({ width: 390, height: 844 });
                        await page.locator("iframe").evaluate(element => element.style.width = "100%");
                        await page.screenshot({ path: path.join(temporary, "control-mobile.png") });
                    }
                    assert.deepEqual(errors, []);
                    console.log(`${profile.name} ${current}: readiness ${state.readyMs.toFixed(0)} ms`);
                } finally {
                    await context.close();
                }
            }
            if (profile.name === "bandwidth-250-kbit" || profile.name === "3G") {
                assert.ok(measurements.fixed < measurements.baseline * 0.6,
                    `${profile.name}: expected a substantial startup improvement`);
            }
        }
        console.log(`Loading and field interaction checks passed. Screenshots: ${temporary}`);
    } finally {
        if (browser) await browser.close();
        if (server) await new Promise(resolve => server.close(resolve));
        fs.rmSync(path.join(temporary, "baseline"), { recursive: true, force: true });
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});