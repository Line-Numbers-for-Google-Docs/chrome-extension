function getIndexesOfSelectedLines() {
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

(() => {
    const t0 = performance.now();
    getIndexesOfSelectedLines()
    const t1 = performance.now();
    console.log("Call to getIndexesOfSelectedLines took " + (t1 - t0) + " milliseconds.")
})();
