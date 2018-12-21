// --------------------------------------------------------------------------------------------- //

"use strict";

// --------------------------------------------------------------------------------------------- //

const TaskOnLoad = [];

// --------------------------------------------------------------------------------------------- //

const CreateTextTransformEngine = (id, implementation) => {

    // ----------------------------------------------------------------------------------------- //

    const $container = document.getElementById(id);

    const $input = $container.querySelector(":scope > textarea");
    const $output = $container.querySelector(":scope > pre");
    const [$transform, $copy] = $container.querySelectorAll(":scope > button");

    // ----------------------------------------------------------------------------------------- //

    let output = "";

    // ----------------------------------------------------------------------------------------- //

    $transform.onclick = () => {

        // ------------------------------------------------------------------------------------- //

        const lines = $input.value.split("\n");

        const [out, warn] = implementation(lines);

        // ------------------------------------------------------------------------------------- //

        const result = [];

        if (warn.length > 0) {
            result.push("Warnings:");
            for (const w of warn)
                result.push(w);
            result.push("");
        }

        output = out.join(",");
        result.push("Output:");
        result.push(output);

        $output.textContent = result.join("\n");
        $copy.classList.remove("hidden");

        // ------------------------------------------------------------------------------------- //

    };

    // ----------------------------------------------------------------------------------------- //

    $copy.onclick = () => {
        const old = $input.value;
        $input.value = output;

        $input.select();
        document.execCommand("copy");

        $input.value = old;
    };

    // ----------------------------------------------------------------------------------------- //

};

// --------------------------------------------------------------------------------------------- //

// Text Transform: Links to Comma Separated Domain Array

TaskOnLoad.push(() => {

    // ----------------------------------------------------------------------------------------- //

    // There can be extra text before the link, so no start anchor
    const reDomainExtract = /https?:\/\/([^:/?#]+)/;

    const reDomainCleanup = /^www?\d*?\./;

    // ----------------------------------------------------------------------------------------- //

    const handler = (lines) => {

        const out = [];
        const warn = [];

        for (let line of lines) {
            line = line.trim();
            if (line.length === 0)
                continue;

            const dom = reDomainExtract.exec(line);

            if (dom === null) {
                warn.push('No link "' + line + '"');
                continue;
            }

            out.push(dom[1].replace(reDomainCleanup, ""));
        }

        return [out.sort(), warn];

    };

    // ----------------------------------------------------------------------------------------- //

    CreateTextTransformEngine("links-to-domains", handler);

    // ----------------------------------------------------------------------------------------- //

});

// --------------------------------------------------------------------------------------------- //

// Text Transform:  Merge Comma Separated Domain Array

TaskOnLoad.push(() => {

    // ----------------------------------------------------------------------------------------- //

    const handler = (lines) => {

        const set = new Set();
        const out = [];
        const warn = [];

        for (let line of lines) {
            line = line.trim();
            if (line.length === 0)
                continue;

            for (let d of line.split(",")) {
                d = d.trim();

                if (d.length === 0 || !d.includes(".")) {
                    warn.push('Invalid entry "' + d + '"');
                    continue;
                }

                if (set.has(d)) {
                    warn.push('Duplicate entry "' + d + '"');
                    continue;
                }

                set.add(d);
                out.push(d);
            }
        }

        return [out.sort(), warn];

    };

    // ----------------------------------------------------------------------------------------- //

    CreateTextTransformEngine("merge-domains", handler);

    // ----------------------------------------------------------------------------------------- //

});

// --------------------------------------------------------------------------------------------- //

window.onload = () => {
    for (const f of TaskOnLoad)
        f();
};

// --------------------------------------------------------------------------------------------- //
