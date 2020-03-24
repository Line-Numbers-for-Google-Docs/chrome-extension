import { SettingsManager } from "./storage.js";
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

            // Check for added or remove lines from a paragraph or added paragraph
            let addedCount = 0;
            let removedCount = 0;
            for (const mutation of mutationArray) {
                if (mutation.target.classList.contains('kix-paragraphrenderer')) {
                    addedCount += mutation.addedNodes.length;
                    removedCount += mutation.removedNodes.length;
                }
            }
            if (removedCount != addedCount) {
                this.render(this.settings);
                return;
            }

            for (const mutation of mutationArray) {
                const addedNodes = Array.from(mutation.addedNodes);
                const removedNodes = Array.from(mutation.removedNodes);

                // Check for removed paragraph
                for (const removedNode of removedNodes) {
                    if (removedNode.nodeType == 3) {
                        // Text node
                        continue;
                    }
                    if (removedNode.classList.contains('kix-paragraphrenderer')) {
                        this.render(this.settings);

                        return;
                    }
                }              

                // Check for line content updates which remove line number for updated lines
                if (addedNodes.length == removedNodes.length) {
                    for (let i = 0; i < addedNodes.length; i++) {
                        const addedNode = addedNodes[i];
                        if (addedNode.nodeType == 3) {
                            // Text node
                            continue;
                        }

                        const match = addedNode.querySelectorAll('.kix-lineview');
                        if (match.length > 0) {
                            const removedNode = removedNodes[i];
                            const old = removedNode.querySelectorAll('.kix-lineview.numbered');

                            if (old.length > 0) {
                                // Renumber line
                                match[0].classList.add('numbered');
                                match[0].setAttribute('ln-number', old[0].getAttribute('ln-number'));

                                if (old[0].classList.contains('visible')) {
                                    match[0].classList.add('visible');
                                }
                            }
                        }
                    }
                }
            }
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

    async render(settings) {
        // Clear backlog
        let timeout;
        while (timeout = this.renderBacklog.pop()) {
            clearTimeout(timeout);
        }

        const time = new Date().getTime();

        if (this.lastRender + 100 > time) {
            // Too many renders, last one was less than 0.1 second ago.
            const timeout = setTimeout(() => { this.render(this.settings) }, 100);
            this.renderBacklog.push(timeout);

            return;
        }

        this.clearLineNumbers();

        if (settings.enabled) {
            this.number();
        }

        this.lastRender = time;
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
            
            // Get the offset with the parent lineview, to get the proper alignment to the edge of the document.
            // Numbers are attached to the lineview-text-block rather than the lineview for proper vertical alignment
            // with the text. But that messes with horizontal alignment with the edge of the document if lines are
            // tabbed in for example, so this offset adjusts for it.
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

            line.classList.add("numbered");
            line.setAttribute("ln-number", ln);
            line.style.setProperty("--ln-top", `${top}px`);

            if (ln % step == 0) {
                line.classList.add("visible");
            }
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