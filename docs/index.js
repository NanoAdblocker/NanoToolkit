// --------------------------------------------------------------------------------------------- //

"use strict";

// --------------------------------------------------------------------------------------------- //

const TaskOnLoad = [];

// --------------------------------------------------------------------------------------------- //

// Text Transform: Links to Comma Separated Domain Array

TaskOnLoad.push(() => {

    // ----------------------------------------------------------------------------------------- //

    const $container = document.getElementById("links-to-domains");

    const $input = $container.querySelector(":scope > textarea");
    const $output = $container.querySelector(":scope > pre");
    const $button = $container.querySelector(":scope > button");

    // ----------------------------------------------------------------------------------------- //

    // There can be extra text before the link, so no start anchor
    const reDomainExtract = /https?:\/\/([^:/?#]+)/;

    const reDomainCleanup = /^www?\d*?\./;

    // ----------------------------------------------------------------------------------------- //

    $button.onclick = () => {

        // ------------------------------------------------------------------------------------- //

        const out = [];
        const warn = [];

        // ------------------------------------------------------------------------------------- //

        const links = $input.value.split("\n").map(x => x.trim());

        for (const l of links) {
            if (l.length === 0)
                continue;

            const dom = reDomainExtract.exec(l);

            if (dom === null) {
                warn.push(l);
                continue;
            }

            out.push(dom[1].replace(reDomainCleanup, ""));
        }

        // ------------------------------------------------------------------------------------- //

        out.sort();
        warn.sort();

        const result = [];

        if (warn.length > 0) {
            result.push("Could not process these links:");
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

});

// --------------------------------------------------------------------------------------------- //

window.onload = () => {
    for (const f of TaskOnLoad)
        f();
};

// --------------------------------------------------------------------------------------------- //
