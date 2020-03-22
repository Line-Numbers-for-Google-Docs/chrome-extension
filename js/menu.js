import { SettingsManager } from "./storage.js";

export async function injectMenu() {
    const commentButton = document.getElementById('docs-docos-commentsbutton');

    const lineNumberingMenu = document.createElement('div');
    lineNumberingMenu.classList.add('goog-inline-block');
    lineNumberingMenu.innerHTML = `
        <div role="button" id="lnMenu" 
        class="goog-inline-block jfk-button jfk-button-standard docs-appbar-circle-button docs-titlebar-button" 
        aria-disabled="false" aria-pressed="false" data-tooltip="Line Numbering" 
        aria-label="Line Numbering" value="undefined" style="user-select: none;">
            <div class="goog-inline-block">
                <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB3aWR0aD0iMjEwbW0iCiAgIGhlaWdodD0iMjEwbW0iCiAgIHZpZXdCb3g9IjAgMCAyMTAgMjEwIgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmc5MjYxIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjQgKDVkYTY4OWMzMTMsIDIwMTktMDEtMTQpIgogICBzb2RpcG9kaTpkb2NuYW1lPSJsaW5lbnVtYmVycy5zdmciPgogIDxkZWZzCiAgICAgaWQ9ImRlZnM5MjU1IiAvPgogIDxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBpZD0iYmFzZSIKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgICAgYm9yZGVyb3BhY2l0eT0iMS4wIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp6b29tPSIwLjM1IgogICAgIGlua3NjYXBlOmN4PSI0MDAiCiAgICAgaW5rc2NhcGU6Y3k9IjU2MCIKICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ibGF5ZXIxIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjEyODAiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iOTg3IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIzMDkiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE5MjU4Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIGlua3NjYXBlOmxhYmVsPSJMYXllciAxIgogICAgIGlua3NjYXBlOmdyb3VwbW9kZT0ibGF5ZXIiCiAgICAgaWQ9ImxheWVyMSIKICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLC04NykiPgogICAgPGcKICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDEzLjU0Nzc0NywwLDAsMTMuMDA3NzgxLC0xNi4zOTg3NjQsNzUuNjA4NTQxKSIKICAgICAgIGlkPSJnNzg3OSI+CiAgICAgIDxwYXRoCiAgICAgICAgIHN0eWxlPSJmaWxsOiM1ZjYzNjg7ZmlsbC1ydWxlOmV2ZW5vZGQiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgIGQ9Im0gMCwxMSBoIDIgdiAwLjUgSCAxIHYgMSBIIDIgViAxMyBIIDAgdiAxIEggMyBWIDEwIEggMCBaIE0gMCw2IEggMS44IEwgMCw4LjEgViA5IEggMyBWIDggSCAxLjIgTCAzLDUuOSBWIDUgSCAwIFogTSAxLDQgSCAyIFYgMCBIIDAgViAxIEggMSBaIE0gNSwxIHYgMiBoIDkgViAxIFogbSAwLDEyIGggOSBWIDExIEggNSBaIE0gNSw4IGggOSBWIDYgSCA1IFoiCiAgICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIsMikiCiAgICAgICAgIGlkPSJwYXRoNzg3NyIgLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=" alt="" />
            </div>
        </div>`;

    lineNumberingMenu.onclick = function() {showPopup();};

    commentButton.parentNode.parentNode.insertBefore(lineNumberingMenu, commentButton.parentNode);

    const settingsManager = await SettingsManager.getInstance();
    console.log(settingsManager);
    const settings = settingsManager.settings;

    const validInput = [true, true];

    const dialog = document.createElement('div');
    dialog.id = "line-numbering-dialog"
    const dialogTitle = "Line Numbering";

    dialog.innerHTML = `
    <div class="modal-dialog-bg" style="opacity: 0.75; width: 100vw; height: 100vh;" aria-hidden="true"></div>

    <div class="modal-dialog docs-dialog" tabindex="0" role="dialog" aria-labelledby="evb5a0:70g" style="left: 50%; top: 50%; transform: translate(-50%, -50%); opacity: 1;">
        <div class="modal-dialog-title modal-dialog-title-draggable">
            <span class="modal-dialog-title-text" id="evb5a0:70g" role="heading">${dialogTitle}</span>
            <span class="modal-dialog-title-close" role="button" tabindex="0" aria-label="Close" data-tooltip="Close"></span>
        </div>
        <div class="modal-dialog-content">
            <div class="modal-dialog-buttons">
                <button class="ln-modal-dialog-cancel" name="cancel">Cancel</button>
                <button name="apply" class="ln-modal-dialog-apply goog-buttonset-default goog-buttonset-action">Apply</button>
            </div>
        </div> 
    </div>`;

    const enableCheckboxSection = document.createElement('div');
    enableCheckboxSection.classList.add('dialog-section');
    enableCheckboxSection.innerHTML = `
    <div class="dialog-input-field">
        <div class="jfk-checkbox docs-material-gm-checkbox"></div>
        <div class="label">Show line numbering</div>
    </div>`
    const enableCheckbox = enableCheckboxSection.getElementsByClassName('jfk-checkbox')[0];
    if (settings.enabled) {
        enableCheckbox.classList.add('docs-material-gm-checkbox-checked');
    } else {
        enableCheckbox.classList.add('docs-material-gm-checkbox-unchecked');
    }

    enableCheckbox.onclick = toggleLineNumbering;
    enableCheckboxSection.getElementsByClassName('label')[0].onclick = toggleLineNumbering;

    function toggleLineNumbering() {
        if (settings.enabled) {
            enableCheckbox.classList.remove('docs-material-gm-checkbox-checked');
            enableCheckbox.classList.add('docs-material-gm-checkbox-unchecked');
        } else {
            enableCheckbox.classList.remove('docs-material-gm-checkbox-unchecked');
            enableCheckbox.classList.add('docs-material-gm-checkbox-checked');
        }

        settings.enabled = !settings.enabled;
    }

    const numberingSection = document.createElement('div');
    numberingSection.innerHTML = `
    <div class="dialog-title">Numbering</div>

    <div class="dialog-input-field">
        <div>
            <label>Start at</label>
        </div>
        <div style="margin-left: auto;">
            <input type="text" id="ln-start-at-input" class="kix-headerfooterdialog-input jfk-textinput">
        </div>
    </div>

    <div class="dialog-input-field">
        <div>
            <label>Count by</label>
            <br><span style="font-size: 10px">(number every X line)</span>
        </div>
        <div style="margin-left: auto;">
            <input type="text" id="ln-count-by-input" class="kix-headerfooterdialog-input jfk-textinput">
        </div>
    </div>

    <div class="kix-pagenumberdialog-header-radio-button goog-inline-block">
        <div class="kix-pagenumberdialog-control goog-inline-block">
            <div class="jfk-radiobutton jfk-radiobutton-checked" data-value="continue" role="radio" aria-checked="true" data-name="" style="user-select: none;" tabindex="0"><span class="jfk-radiobutton-radio"></span><span class="jfk-radiobutton-label"><label for="kix-pagenumberdialog-header">Continuous</label></span></div>
        </div>
        <div class="kix-pagenumberdialog-label goog-inline-block"></div>
    </div>
    <div class="kix-pagenumberdialog-header-radio-button goog-inline-block">
        <div class="kix-pagenumberdialog-control goog-inline-block">
            <div class="jfk-radiobutton jfk-radiobutton-checked" data-value="continue" role="radio" aria-checked="true" data-name="" style="user-select: none;" tabindex="0"><span class="jfk-radiobutton-radio"></span><span class="jfk-radiobutton-label"><label for="kix-pagenumberdialog-header">Restart each page</label></span></div>
        </div>
        <div class="kix-pagenumberdialog-label goog-inline-block"></div>
    </div>
    `;

    const startAtInput = numberingSection.querySelector('#ln-start-at-input');
    startAtInput.value = settings.start;

    const errorMessage = document.createElement('div');
    errorMessage.classList.add('ln-input-error');

    const countByInput = numberingSection.querySelector('#ln-count-by-input');
    countByInput.value = settings.step;
    countByInput.addEventListener('change', (event) => {
        event.target.classList.remove('input-error');
        errorMessage.remove();

        if (isNaN(event.target.value)) {
            event.target.classList.add('input-error');
            errorMessage.innerText = "Must be numeric.";
            event.target.parentNode.parentNode.parentNode.insertBefore(
                errorMessage, event.target.parentNode.parentNode.nextSibling);

            validInput[1] = false;
            return;
        }

        const countBy = Number(event.target.value);
        if (!Number.isInteger(countBy)) {
            event.target.classList.add('input-error');
            errorMessage.innerText = "Must be a whole number.";
            event.target.parentNode.parentNode.parentNode.insertBefore(
                errorMessage, event.target.parentNode.parentNode.nextSibling);
            
            validInput[1] = false;
            return;
        }

        if (countBy < 1) {
            event.target.classList.add('input-error');
            errorMessage.innerText = "Must be strictly positive.";
            event.target.parentNode.parentNode.parentNode.insertBefore(
                errorMessage, event.target.parentNode.parentNode.nextSibling);

            validInput[1] = false;
            return;
        }

        validInput[1] = true;
        settings.step = countBy;
    });

    const dialogContent = dialog.getElementsByClassName('modal-dialog-content')[0];
    dialogContent.prepend(numberingSection);
    dialogContent.prepend(enableCheckboxSection);

    const close = dialog.getElementsByClassName('modal-dialog-title-close')[0];
    close.onclick = function() {cancel()};

    const cancelButton = dialog.getElementsByClassName('ln-modal-dialog-cancel')[0];
    cancelButton.onclick = function() {cancel()};

    const applyButton = dialog.getElementsByClassName('ln-modal-dialog-apply')[0];
    applyButton.onclick = function() {apply()};

    function showPopup() {
        settings.save();
        document.body.appendChild(dialog);
    }

    function cancel() {
        hidePopup();
        settings.restoreLastSave();
    }

    function apply() {
        if (!validInput.every((valid) => valid)) {
            return;
        }

        hidePopup();
        settings.popLastSave();
        settingsManager.store();
    }

    function hidePopup() {
        document.body.removeChild(dialog);
    }
}