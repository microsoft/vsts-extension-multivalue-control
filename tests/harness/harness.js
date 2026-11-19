// Emulates the Azure DevOps iframe host (VSS SDK, AMD externals, work item form service) for the control bundle.
(function () {
    const cfg = Object.assign(
        {
            FieldName: "Custom.Field",
            Values: "",
            AllowCustom: false,
            LabelDisplayLength: undefined,
            value: "",
            allowedValues: [],
            readOnly: false,
            isPicklist: false,
            invalid: false,
            fieldExists: true,
        },
        JSON.parse(new URLSearchParams(location.search).get("cfg") || "{}")
    );

    const state = {
        value: cfg.value,
        setCalls: [],
        saveCalls: 0,
        resizes: [],
        warnings: [],
        provider: null,
    };

    const origWarn = console.warn;
    console.warn = function () {
        state.warnings.push(Array.prototype.join.call(arguments, " "));
        origWarn.apply(console, arguments);
    };

    const fireFieldChanged = (name, value) => {
        state.provider.onFieldChanged({ changedFields: { [name]: value } });
    };

    const service = {
        getFieldValue: async () => state.value,
        setFieldValue: async (name, value) => {
            state.setCalls.push(value);
            state.value = value;
            // The real host echoes our own change back as a field-changed event.
            setTimeout(() => fireFieldChanged(name, value), 0);
            return true;
        },
        getFields: async () => [
            { referenceName: cfg.fieldExists ? cfg.FieldName : "Other.Field", readOnly: cfg.readOnly },
        ],
        getInvalidFields: async () => (cfg.invalid ? [{ referenceName: cfg.FieldName }] : []),
        getAllowedFieldValues: async () => cfg.allowedValues,
        beginSaveWorkItem: (onSuccess) => {
            state.saveCalls++;
            if (onSuccess) {
                onSuccess();
            }
        },
    };

    class DelayedFunction {
        constructor(context, ms, name, callback) {
            this._ms = ms;
            this._callback = callback;
            this._timer = null;
        }
        reset() {
            this.cancel();
            this._timer = setTimeout(this._callback, this._ms);
        }
        cancel() {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }

    const modules = {
        "TFS/WorkItemTracking/ExtensionContracts": {},
        "TFS/WorkItemTracking/Services": {
            WorkItemFormService: { getService: () => Promise.resolve(service) },
        },
        "TFS/WorkItemTracking/RestClient": {
            getClient: () => ({
                getField: async () => ({ name: "Test Field", isPicklist: cfg.isPicklist }),
            }),
        },
        "VSS/Utils/Core": { DelayedFunction },
        "VSS/Utils/UI": { BrowserCheckUtils: { isSafari: () => false } },
    };

    // The webpack bundle is an anonymous AMD module whose externals are the VSS/TFS modules above.
    window.define = function (deps, factory) {
        factory.apply(null, deps.map((d) => modules[d]));
    };

    window.VSS = {
        getConfiguration: () => ({
            witInputs: {
                FieldName: cfg.FieldName,
                Values: cfg.Values,
                AllowCustom: cfg.AllowCustom,
                LabelDisplayLength: cfg.LabelDisplayLength,
            },
        }),
        getContribution: () => ({ id: "test.multivalue-form-control" }),
        // The extension registers a factory; the host calls it once to get the handlers.
        register: (id, factory) => {
            state.provider = factory();
        },
        resize: (width, height) => {
            state.resizes.push({ width, height });
        },
    };

    // Minimal jQuery surface used by multivalue.ts.
    window.$ = (target) => ({
        bind: (event, handler) => target.addEventListener(event, handler),
    });
    window.$.noop = () => {};

    window.__mv = {
        state,
        service,
        fireFieldChanged: (value) => {
            state.value = value;
            fireFieldChanged(cfg.FieldName, value);
        },
        fireOtherFieldChanged: () => fireFieldChanged("Other.Field", "x"),
        start: () => state.provider.onLoaded({}),
    };
})();
