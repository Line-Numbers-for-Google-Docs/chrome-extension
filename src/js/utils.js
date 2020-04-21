export function findFirstParentWithClass(node, className) {
    /**
     * Return the closest parent of a DOM object with a given class name.
     * 
     * @param {DOMObject} node      The DOM object for which we are looking for a parent with a matching class on.
     * @param {String}    className The class the parent of the object should have to classify to be returned.
     * 
     * @return The closest parent of a DOM object with a given class name or null if none is found.
     */

    let cur = node.parentNode;
    while (cur != null && cur != document.documentElement) {
        if (cur.classList.contains(className)) {
            return cur
        }

        cur = cur.parentNode;
    }

    return null;
}

export function getIndexesOfSelectedLines() {
    const selectionOverlays = Array.from(document.getElementsByClassName('kix-selection-overlay'));
    // TODO: Check if parentNode is always lineview or if going further up might be required.
    const firstSelectedLineView = selectionOverlays[0].parentNode;
    const lastSelectedLineView = selectionOverlays[selectionOverlays.length - 1].parentNode;

    // TODO: Check with header and footer
    const lineViews = Array.from(document.getElementsByClassName('kix-lineview'));

    let firstIndex;
    let lastIndex;

    let index = 1;
    for (const lineView of lineViews) {
        if (lineView == firstSelectedLineView) {
            firstIndex = index;
        }

        index += lineView.textContent.replace(/(\u200C)/g, "").length +
            lineView.querySelectorAll('.kix-embeddedobject-view').length;

        if (lineView == lastSelectedLineView) {
            lastIndex = index;
        }
    }

    return [firstIndex, lastIndex];
}