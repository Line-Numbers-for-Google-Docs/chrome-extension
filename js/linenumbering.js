import { SettingsManager, numbering } from "./storage.js";
import { injectMenu } from "./menu.js";
import { findFirstParentWithClass } from "./utils.js";

class LineNumberer {
    constructor() {
        this.lastRender = 0;
        this.renderBacklog = [];
    }

    async start() {
        // Listen for changes to documents and number line numbering respectively
        const app = document.getElementsByClassName('kix-appview-editor-container')[0];
        const config = { attributes: false, childList: true, subtree: true };
        this.observer = new MutationObserver((mutationList, observer) => {
            const mutationArray = Array.from(mutationList);

            for (const mutation of mutationArray) {
                if (mutation.target.classList.contains('kix-lineview-content')) {
                    const line = findFirstParentWithClass(mutation.target, 'kix-lineview');
                    if (this.shouldCountLine(line)) {
                        this.numberLine(line);
                    } else {
                        this.stopCountingLine(line);
                    }

                    continue;
                }

                const addedNodes = Array.from(mutation.addedNodes);

                for (const addedNode of addedNodes) {
                    if (addedNode.nodeType == 3) {
                        // Text node
                        continue;
                    }
                    if (addedNode.classList.contains('kix-lineview') && this.shouldCountLine(addedNode)) {
                        this.numberLine(addedNode);
                    }
                    const lines = Array.from(addedNode.querySelectorAll('.kix-lineview'));
                    for (const line of lines) {
                        if (this.shouldCountLine(line)) {
                            this.numberLine(line);
                        }
                    }
                }
            }

            const lines = Array.from(document.getElementsByClassName('numbered'));
            for (let i = 0, ln = this.settings.start; i < lines.length; i++, ln++) {
                const line = lines[i];
                if (ln % this.settings.step == 0) {
                    line.classList.add('visible');
                } else {
                    line.classList.remove('visible');
                }
            }

            return;
        });
        this.observer.observe(app, config);

        // Initialize a SettingsProvider to be able to fetch document settings
        this.settingsManager = await SettingsManager.getInstance();
        this.settings = this.settingsManager.settings;

        // Setup callbacks when settings change
        this.settings.onUpdate((settings) => this.render(settings));

        // Render line numbers
        this.render(this.settings);
    }

    async stop() {
        this.observer.disconnect();
    }

    // TODO: Use this to page section numbering
    get lineBlocks() {
        /**
         * Gets the blocks of objects to number.
         * A block is a list of line objects to number in sequence.
         * Different blocks of lines are numbered independently.
         * 
         * @return list of list of line objects
         */

        if (this.resetCountOnNewPage) {
            const lineBlocks = []
            
            const pages = document.body.querySelectorAll(".kix-page");
            for (const page in pages) {
                lineBlocks.push(Array.from(page.querySelectorAll(".kix-lineview")));
            }

            return lineBlocks;
        }

        return [Array.from(document.body.querySelectorAll(".kix-lineview"))];
    }

    generateStyles(rule) {
        const style = document.createElement('style');
        style.innerHTML = rule;

        return style;
    }

    clearResetCountEachPage() {
        if (this.resetEachPageStyle != null) {
            this.resetEachPageStyle.remove();
            this.resetEachPageStyle = null;
        }
    }

    resetCountEachPage() {
        this.resetEachPageStyle = this.generateStyles(`.kix-page.docs-page {counter-reset: ln ${this.settings.start - 1}}`);

        document.body.appendChild(this.resetEachPageStyle);

        console.log("Injecting style", this.resetEachPageStyle);
    }

    async render(settings) {
        console.log("Re-rendering", this.settings);

        document.body.style['counter-reset'] = `ln ${settings.start - 1}`;

        if (this.settings.type == numbering.EACH_PAGE) {
            this.resetCountEachPage();
        } else {
            this.clearResetCountEachPage();
        }

        this.clearLineNumbers();

        if (settings.enabled) {
            this.number();
        }
    }

    clearLineNumbers() {
        const numberedLines = Array.from(document.getElementsByClassName('numbered'))
        for (const node of numberedLines) {
            node.classList.remove('numbered');
            node.classList.remove('visible');
            node.classList.remove('right');
        }
    }

    number() {
        /**
         * Number the entire documents according to the document settings.
         * 
         * Splits the lines into "blocks" of lines to each be numbered independently.
         */

        for (const lines of this.lineBlocks) {
            const consideredLines = lines.filter(line => this.shouldCountLine(line));
            this.numberLinesSequentially(consideredLines, 1, this.settingsManager.settings.step);
        }
    }

    numberLinesSequentially(lines, start=1, step=1) {
        /**
         * Display the line numbering according to the documents settings for the lines passed in as an argument.
         * 
         * Doesn't take into account any restarting of line numbering. If line numbering is required to be restarted
         * after a certain point, then this function should be called multiple times with different batches of lines.
         * 
         * @param {Array}   lines An array of the DOM objects of the lines that should be considered for numbering 
         *                        sequentially.
         * @param {Integer} start The number of the first line.
         * @param {Integer} step  The step to take when displaying the line numbers.
         *                        A step of 1 means we number every line that should be numbered.
         *                        A step of 5 will mean we only show the line number every 5 lines.
         */

        for (let i = 0, ln = start; i < lines.length; i++, ln++) {
            const line = lines[i];
            this.numberLine(line);

            if (ln % step == 0) {
                line.classList.add("visible");
            }
        }
    }

    numberLine(line) {
        line.classList.add("numbered");

        // Figure out the vertical alignment to have the number aligned with the actual text rather than the lineview.
        const textBlocks = Array.from(line.querySelectorAll(".kix-lineview-text-block"));
        let minY1 = textBlocks[0].getBoundingClientRect().y;
        let maxY2 = textBlocks[0].getBoundingClientRect().y + textBlocks[0].getBoundingClientRect().height;
        // for (const textBlock of textBlocks) {
        //     const y1 = textBlock.getBoundingClientRect().y;
        //     const y2 = y1 + textBlock.getBoundingClientRect().height;
        //     if (y1 < minY1) {
        //         minY1 = y1;
        //     }
        //     if (y2 > maxY2) {
        //         maxY2 = y2;
        //     }
        // }
        const top = minY1 + (maxY2 - minY1)/2 - line.getBoundingClientRect().y;
        line.style.setProperty("--ln-top", `${top}px`);
    }

    shouldCountLine(line) {
        /**
         * Checks whether or not a line should count towards the line count.
         * 
         * @param line The DOM node of the line we want to check whether or not it should count towards the numbering.
         * 
         * @return {bool} True iff the line should count towards the numbering.
         */

        if (!this.settings.numberBlankLines) {
            // NOTE: Use `.charCodeAt(0).toString(16)` to get HEX unicode of character in string.
            // &nbsp; => \u00A0
            // &zwnj; => \u200C
            if (line.innerText.match(/^(\u00A0|\u200C|\s)+$/g)) {
                return false;
            }
        }

        return true;
    }

    stopCountingLine(line) {
        try {
            line.classList.remove('numbered');
            line.classList.remove('visible');
        } finally {};
    }
    
}

export function main() {
    // Inject the menu into the page
    injectMenu();

    // Start numbering lines
    new LineNumberer().start();
}