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