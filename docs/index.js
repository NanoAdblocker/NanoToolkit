// --------------------------------------------------------------------------------------------- //

"use strict";

// --------------------------------------------------------------------------------------------- //

const TaskOnLoad = [];

// --------------------------------------------------------------------------------------------- //

const CreateTextTransform = (id, implementation) => {

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

    const reDomainDuplicate = /https?:.*?https?:/;

    // TODO: What about "www.com" or similar domains?
    const reDomainCleanup = /^www?\d*?\./;

    // ----------------------------------------------------------------------------------------- //

    const handler = (lines) => {

        const out = [];
        const warn = [];

        for (let line of lines) {
            line = line.trim();
            if (line.length === 0)
                continue;

            if (reDomainDuplicate.test(line))
                warn.push('Two links (second one ignored) "' + line + '"');

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

    CreateTextTransform("links-to-domains", handler);

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

        let count = 0;

        for (let line of lines) {
            line = line.trim();
            if (line.length === 0)
                continue;

            count++;

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

        if (count === 1)
            warn.push("Only one array found!");

        return [out.sort(), warn];

    };

    // ----------------------------------------------------------------------------------------- //

    CreateTextTransform("merge-domains", handler);

    // ----------------------------------------------------------------------------------------- //

});

// --------------------------------------------------------------------------------------------- //

// Text Transform:  Unmerge Comma Separated Domain Array

// TODO: Quadratic running time, can this be optimized?

TaskOnLoad.push(() => {

    // ----------------------------------------------------------------------------------------- //

    const handler = (lines) => {

        const out = [];
        const warn = [];

        let count = 0;
        let arr = null;

        for (let line of lines) {
            line = line.trim();
            if (line.length === 0)
                continue;

            count++;

            if (arr === null) {
                arr = line.split(",");
                arr = arr.map(x => x.trim());
                continue;
            }

            for (let d of line.split(",")) {
                d = d.trim();

                const index = arr.indexOf(d);
                if (index === -1) {
                    warn.push('No entry "' + d + '"');
                    continue;
                }

                arr.splice(index, 1);
            }
        }

        if (count === 1)
            warn.push("Only one array found!");

        if (count > 0) {
            for (const d of arr)
                out.push(d);
        }

        return [out.sort(), warn];

    };

    // ----------------------------------------------------------------------------------------- //

    CreateTextTransform("unmerge-domains", handler);

    // ----------------------------------------------------------------------------------------- //

});

// --------------------------------------------------------------------------------------------- //

window.onload = () => {
    for (const f of TaskOnLoad)
        f();
};

// --------------------------------------------------------------------------------------------- //
