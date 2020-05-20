// ----------------------------------------------------------------------------------------------------------------- //

"use strict";

// ----------------------------------------------------------------------------------------------------------------- //

const onLoadTasks = [];

// ----------------------------------------------------------------------------------------------------------------- //

const defaultTextTransformOptions = {
    join: ",",
};

const createTextTransform = (id, implementation) => {

    // ------------------------------------------------------------------------------------------------------------- //

    const $container = document.getElementById(id);

    const $input = $container.querySelector(":scope > textarea");
    const $output = $container.querySelector(":scope > pre");
    const [$transform, $copy] = $container.querySelectorAll(":scope > button");

    // ------------------------------------------------------------------------------------------------------------- //

    let output = "";

    // ------------------------------------------------------------------------------------------------------------- //

    $transform.onclick = () => {

        // --------------------------------------------------------------------------------------------------------- //

        const lines = $input.value.split("\n");

        const [out, warn, opt] = implementation(lines);

        // --------------------------------------------------------------------------------------------------------- //

        const result = [];

        if (warn.length > 0) {
            result.push("Warnings:");
            for (const w of warn)
                result.push(w);
            result.push("");
        }

        output = out.join(opt.join);
        result.push("Output:");
        result.push(output);

        $output.textContent = result.join("\n");
        $copy.classList.remove("hidden");

        // --------------------------------------------------------------------------------------------------------- //

    };

    // ------------------------------------------------------------------------------------------------------------- //

    $copy.onclick = () => {
        const old = $input.value;
        $input.value = output;

        $input.select();
        document.execCommand("copy");

        $input.value = old;
    };

    // ------------------------------------------------------------------------------------------------------------- //

};

// ----------------------------------------------------------------------------------------------------------------- //

// Text Transform: Links to Comma Separated Domain Array

onLoadTasks.push(() => {

    // ------------------------------------------------------------------------------------------------------------- //

    // There can be extra text before the link, so no start anchor
    const reDomainExtract = /https?:\/\/([^:/?#]+)/;

    const reDomainDuplicate = /https?:.*?https?:/;

    // TODO: What about "www.com" or similar domains?
    const reDomainCleanup = /^www?\d*?\./;

    // ------------------------------------------------------------------------------------------------------------- //

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

        return [out.sort(), warn, defaultTextTransformOptions];

    };

    // ------------------------------------------------------------------------------------------------------------- //

    createTextTransform("links-to-domains", handler);

    // ------------------------------------------------------------------------------------------------------------- //

});

// ----------------------------------------------------------------------------------------------------------------- //

// Text Transform:  Merge Comma Separated Domain Array

onLoadTasks.push(() => {

    // ------------------------------------------------------------------------------------------------------------- //

    const handler = (lines) => {

        const out = [];
        const warn = [];

        const set = new Set();

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

        return [out.sort(), warn, defaultTextTransformOptions];

    };

    // ------------------------------------------------------------------------------------------------------------- //

    createTextTransform("merge-domains", handler);

    // ------------------------------------------------------------------------------------------------------------- //

});

// ----------------------------------------------------------------------------------------------------------------- //

// Text Transform:  Unmerge Comma Separated Domain Array

// TODO: Quadratic running time, can this be optimized?

onLoadTasks.push(() => {

    // ------------------------------------------------------------------------------------------------------------- //

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

        return [out.sort(), warn, defaultTextTransformOptions];

    };

    // ------------------------------------------------------------------------------------------------------------- //

    createTextTransform("unmerge-domains", handler);

    // ------------------------------------------------------------------------------------------------------------- //

});

// ----------------------------------------------------------------------------------------------------------------- //

// Text Transform:  Unicode Escape

onLoadTasks.push(() => {

    // ------------------------------------------------------------------------------------------------------------- //

    const handler = (lines) => {

        const out = [];
        const warn = [];

        for (let line of lines) {
            const chars = line.split("");

            for (let i = 0; i < chars.length; i++) {
                const code = chars[i].charCodeAt(0);

                if (code > 0x7F)
                    chars[i] = "\\u" + code.toString(16).padStart(4, "0").toUpperCase();
            }

            out.push(chars.join(""));
        }

        return [out, warn, Object.assign({}, defaultTextTransformOptions, { join: "\n" })];

    };

    // ------------------------------------------------------------------------------------------------------------- //

    createTextTransform("unicode-escape", handler);

    // ------------------------------------------------------------------------------------------------------------- //

});

// ----------------------------------------------------------------------------------------------------------------- //

window.onload = () => {
    for (const f of onLoadTasks)
        f();
};

// ----------------------------------------------------------------------------------------------------------------- //
