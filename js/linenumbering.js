import { SettingsManager } from "./storage.js";
import { injectMenu } from "./menu.js";
import { findFirstParentWithClass } from "./utils.js";

class LineNumberer {
    constructor() {
        // Style values
        this.lnWidth = 36;
    }

    async start() {
        // TODO: Listen for changes to documents
        console.log(document.getElementsByClassName('kix-appview-editor-container')[0]);

        // Initialize a SettingsProvider to be able to fetch document settings
        this.settingsManager = await SettingsManager.getInstance();
        this.settings = this.settingsManager.settings;

        // Setup callbacks when settings change
        this.settings.onUpdate((settings) => this.render(settings));

        // Render line numbers
        this.render(this.settings);
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
                lineBlocks.push(Array.from(page.querySelectorAll(".kix-lineview-text-block")));
            }

            return lineBlocks;
        }

        return [Array.from(document.body.querySelectorAll(".kix-lineview-text-block"))];
    }

    render(settings) {
        this.clearLineNumbers();

        if (settings.enabled) {
            this.number();
        }
    }

    clearLineNumbers() {
        const numberedLines = Array.from(document.getElementsByClassName('numbered'))
        for (const node of numberedLines) {
            node.classList.remove('numbered');
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
            if (ln % step != 0) {
                continue;
            }

            const line = lines[i];
            
            // Get the offset with the parent lineview, to get the proper alignment to the edge of the document.
            // Numbers are attached to the lineview-text-block rather than the lineview for proper vertical alignment
            // with the text. But that messes with horizontal alignment with the edge of the document if lines are
            // tabbed in for example, so this offset adjusts for it.
            const parent = findFirstParentWithClass(line, "kix-lineview");
            const offset = parent.getBoundingClientRect().x - line.getBoundingClientRect().x - this.lnWidth;

            line.classList.add("numbered");
            line.setAttribute("ln-number", ln);
            line.style.setProperty("--ln-offset", `${offset}px`);
            line.style.setProperty("--ln-width", `${this.lnWidth}px`);
        }
    }

    shouldCountLine(line) {
        /**
         * Checks whether or not a line should count towards the line count.
         * 
         * @param line The DOM node of the line we want to check whether or not it should count towards the numbering.
         * 
         * @return {bool} True iff the line should count towards the numbering.
         */

        return true;
    }
    
}

export function main() {
    // Inject the menu into the page
    injectMenu();

    // Start numbering lines
    new LineNumberer().start();
}