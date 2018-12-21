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
    const $button = $container.querySelector(":scope > button");

    // ----------------------------------------------------------------------------------------- //

    $button.onclick = () => {

        // ------------------------------------------------------------------------------------- //

        const lines = $input.value.split("\n").map(x => x.trim());

        const [out, warn] = implementation(lines);

        // ------------------------------------------------------------------------------------- //

        out.sort();
        warn.sort();

        const result = [];

        if (warn.length > 0) {
            result.push("Could not process these lines:");
            for (const w of warn)
                result.push(w);
            result.push("");
        }

        result.push("Output:");
        result.push(out.join(","));

        $output.textContent = result.join("\n");

        // ------------------------------------------------------------------------------------- //

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

        for (const l of lines) {
            if (l.length === 0)
                continue;

            const dom = reDomainExtract.exec(l);

            if (dom === null) {
                warn.push(l);
                continue;
            }

            out.push(dom[1].replace(reDomainCleanup, ""));
        }

        return [out, warn];

    };

    // ----------------------------------------------------------------------------------------- //

    CreateTextTransformEngine("links-to-domains", handler);

    // ----------------------------------------------------------------------------------------- //

});

// --------------------------------------------------------------------------------------------- //

window.onload = () => {
    for (const f of TaskOnLoad)
        f();
};

// --------------------------------------------------------------------------------------------- //
