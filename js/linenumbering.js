import { SettingsManager, numbering, borderStyle } from "./storage.js";
import { Metrics } from "./metrics.js";
import { injectMenu } from "./menu.js";
import { findFirstParentWithClass } from "./utils.js";

class LineNumberer {
    constructor() {
        // Used to listen for changes to documents and number line numbering respectively
        this.observerConnected = false;
        this.observer = new MutationObserver((mutationList, observer) => {
            const mutationArray = Array.from(mutationList);

            for (const mutation of mutationArray) {
                // Special case for headers and footers
                if (mutation.target.classList.contains('kix-lineview-content')) {
                    const line = findFirstParentWithClass(mutation.target, 'kix-lineview');
                    if (this.shouldCountLine(line)) {
                        this.numberLine(line);
                    } else {
                        this.stopCountingLine(line);
                    }

                    continue;
                }

                const removedNodes = Array.from(mutation.removedNodes);
                for (const removedNode of removedNodes) {
                    // Borders
                    try {
                        if (removedNode.classList.contains('ln-document-right-border')) {
                            const pageContent = mutation.target;
                            const paragraphs = pageContent.querySelectorAll('.kix-paragraphrenderer');
                            paragraphs[paragraphs.length - 1].classList.add('ln-document-right-border');
                        }
                        if (removedNode.classList.contains('ln-document-left-border')) {
                            const pageContent = mutation.target;
                            pageContent.querySelector('.kix-paragraphrenderer').classList.add('ln-document-left-border');
                        }
                    } catch(e) {
                        console.warn(e);
                    }
                }

                const addedNodes = Array.from(mutation.addedNodes);

                for (const addedNode of addedNodes) {
                    if (addedNode.nodeType == 3) {
                        // Text node
                        continue;
                    }

                    // Line numbering
                    if (addedNode.classList.contains('kix-lineview') && this.shouldCountLine(addedNode)) {
                        this.numberLine(addedNode);
                    }
                    const lines = Array.from(addedNode.querySelectorAll('.kix-lineview'));
                    for (const line of lines) {
                        if (this.shouldCountLine(line)) {
                            this.numberLine(line);
                        }
                    }

                    // Borders
                    if (addedNode.classList.contains('ln-document-right-border')) {
                        addedNode.classList.remove('ln-document-right-border');
                    }
                    if (addedNode.classList.contains('ln-document-left-border')) {
                        addedNode.classList.remove('ln-document-left-border');
                    }

                    if (addedNode.classList.contains('kix-paragraphrenderer')) {
                        try {
                            const pageContent = addedNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

                            if (pageContent.parentNode.classList.contains('kix-page-content-wrapper')) {
                                const paragraphs = pageContent.querySelectorAll('.kix-paragraphrenderer');
                                
                                paragraphs[0].classList.add('ln-document-left-border');
                                paragraphs[paragraphs.length - 1].classList.add('ln-document-right-border');
                            }
                        } catch(e) {
                            console.warn(e);
                        }
                    }
                }
            }

            const lineBlocks = []
            if (this.settings.type == numbering.EACH_PAGE) {        
                const pages = Array.from(document.body.querySelectorAll(".kix-page"));
                for (const page of pages) {
                    lineBlocks.push(Array.from(page.querySelectorAll(".numbered")));
                }
            } else {
                lineBlocks.push(Array.from(document.getElementsByClassName('numbered')))
            }

            for (const lines of lineBlocks) {
                for (let i = 0, ln = this.settings.start; i < lines.length; i++, ln++) {
                    const line = lines[i];
                    if (ln % this.settings.step == 0) {
                        line.classList.add('visible');
                    } else {
                        line.classList.remove('visible');
                    }
                }
            }
            
            return;
        });
    }

    async start() {
        // Initialize a SettingsProvider to be able to fetch document settings
        this.settingsManager = await SettingsManager.getInstance();
        this.settings = this.settingsManager.settings;

        // Setup callbacks when settings change
        this.settings.onUpdate((settings) => this.render(settings));

        // Render line numbers
        this.render(this.settings);
    }

    connectMutationObserver() {
        if (!this.observerConnected) {
            const app = document.getElementsByClassName('kix-appview-editor-container')[0];
            const config = { attributes: false, childList: true, subtree: true };
            this.observer.observe(app, config);
            this.observerConnected = true;
        }
    }

    disconnectMutationObserver() {
        if (this.observerConnected) {
            this.observer.disconnect();
            this.observerConnected = false;
        }
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

        if (this.settings.type == numbering.EACH_PAGE) {
            const lineBlocks = []
            
            const pages = Array.from(document.body.querySelectorAll(".kix-page"));
            for (const page of pages) {
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
        if (this.resetEachPageStyle == null) {
            this.resetEachPageStyle = this.generateStyles(`.kix-page.docs-page {counter-reset: ln ${this.settings.start - 1}}`);
            document.body.appendChild(this.resetEachPageStyle);
        }
    }

    hideNumbers() {
        if (this.hideNumbersStyle == null) {
            this.hideNumbersStyle = this.generateStyles('.kix-lineview.numbered::before {display: none}');
            document.body.appendChild(this.hideNumbersStyle);
        }
    }

    showNumbers() {
        if (this.hideNumbersStyle != null) {
            this.hideNumbersStyle.remove();
            this.hideNumbersStyle = null;
        } 
    }

    addDocumentBorders() {
        const pages = Array.from(document.body.querySelectorAll('.kix-page.docs-page'));

        for (const page of pages) {
            const paragraphs = Array.from(page.querySelectorAll('.kix-paragraphrenderer'));

            if (paragraphs.length > 0) {
                paragraphs[0].classList.add('ln-document-left-border');
                paragraphs[paragraphs.length - 1].classList.add('ln-document-right-border');
            }

        }
    }

    // Try to avoid calling this as much as possible, trigger of full re-render of the line numbers.
    async render(settings) {
        this.hideNumbers();

        document.body.style['counter-reset'] = `ln ${settings.start - 1}`;
        document.body.style.setProperty('--ln-size', `${settings.numberSize}pt`);
        document.body.style.setProperty('--ln-color', `#${settings.numberColor}`);

        let leftBorderStyle = 'none';
        let leftBorderSize = '1px';
        switch (this.settings.leftBorderStyle) {
            case borderStyle.NONE:
                leftBorderStyle = 'none';
                break;
            case borderStyle.SOLID:
                leftBorderStyle = 'solid';
                leftBorderSize = '1px';
                break;
            case borderStyle.DOUBLE:
                leftBorderStyle = 'double';
                leftBorderSize = '3px';
                break;

        }
        document.body.style.setProperty('--ln-left-border-style', leftBorderStyle);
        document.body.style.setProperty('--ln-left-border-size', leftBorderSize);

        let rightBorderStyle = 'none';
        let rightBorderSize = '1px';
        switch (this.settings.rightBorderStyle) {
            case borderStyle.NONE:
                rightBorderSize = 'none';
                break;
            case borderStyle.SOLID:
                rightBorderStyle = 'solid';
                rightBorderSize = '1px';
                break;
            case borderStyle.DOUBLE:
                rightBorderStyle = 'double';
                rightBorderSize = '3px';
                break;

        }
        document.body.style.setProperty('--ln-right-border-style', rightBorderStyle);
        document.body.style.setProperty('--ln-right-border-size', rightBorderSize);

        this.clearResetCountEachPage();
        if (this.settings.type == numbering.EACH_PAGE) {
            this.resetCountEachPage();
        }

        this.clearLineNumbers();

        if (settings.enabled) {
            this.connectMutationObserver();
            this.number();
        } else {
            this.disconnectMutationObserver();
        }

        this.addDocumentBorders();

        this.showNumbers();
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
            this.numberLinesSequentially(consideredLines, this.settingsManager.settings.start, this.settingsManager.settings.step);
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
        
        if (line.style.direction) {
            if (line.style.direction == 'rtl') {
                line.classList.add('right');
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

        if (!this.settings.numberBlankLines) {
            // NOTE: Use `.charCodeAt(0).toString(16)` to get HEX unicode of character in string.
            // &nbsp; => \u00A0
            // &zwnj; => \u200C
            if (line.innerText.match(/^(\u00A0|\u200C|\s)+$/g)) {
                return false;
            }
        }

        if (!this.settings.numberHeaders) {
            if (line.parentNode.parentNode.parentNode.classList.contains('kix-page-header')) {
                return false;
            }
        }

        if (!this.settings.numberFooters) {
            if (line.parentNode.parentNode.parentNode.classList.contains('kix-page-bottom')) {
                return false;
            }
        }

        if (!this.settings.numberColumns) {
            const column = line.parentNode.parentNode.parentNode.parentNode.parentNode.previousSibling;
            if (column != null && column.classList.contains('kix-page-column')) {
                return false;
            }
        }

        if (line.parentNode.parentNode.classList.contains('kix-cellrenderer')) {
            return false;
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

export async function main() {
    // Inject the menu into the page
    injectMenu();

    // Start numbering lines
    const ln = new LineNumberer();
    await ln.start();

    // Record document loaded
    Metrics.documentLoaded(ln.settings.enabled);
}