import { SettingsManager, numbering } from "./storage.js";

export async function injectMenu() {
    const settingsManager = await SettingsManager.getInstance();
    const settings = settingsManager.settings;

    const dialogMenu = new DialogMenu("Line Numbering", 
        () => {
            settings.restoreLastSave();
        },
        () => {
            settings.popLastSave();
            settingsManager.store();
        });
    
    // Enable section
    const enableCheckbox = DialogMenu.checkBox("Show line numbering", 
        () => {return settings.enabled}, (enabled) => {settings.enabled = enabled});
    dialogMenu.addSection(null, [enableCheckbox]);

    // Numbering section
    const positiveIntegerParseAndValidate = (value) => {
        if (isNaN(value)) {
            return {error: true, errorMessage: "Must be numeric."}
        }

        const countBy = Number(value);
        if (!Number.isInteger(countBy)) {
            return {error: true, errorMessage: "Must be a whole number."}
        }

        if (countBy < 1) {
            return {error: true, errorMessage: "Must be strictly positive."}
        }

        return {error: false, value: countBy}
    };

    const startAtInput = DialogMenu.input("start-at", "Start at", null, 
        () => {return settings.start;},
        positiveIntegerParseAndValidate,
        (start) => {settings.start = start;});
    const countByInput = DialogMenu.input("count-by", "Count by", "(number every X line)", 
        () => {return settings.step;},
        positiveIntegerParseAndValidate,
        (countBy) => {settings.step = countBy;});
    const numberingStyleRadioGroup = DialogMenu.radioGroup(["Continuous", "Restart Each Page"], 
        () => {
            switch (settings.type) {
                case numbering.CONTINUOUS:
                    return 0;
                case numbering.EACH_PAGE:
                    return 1;
                default:
                    return 0;
            }
        },
        (selected) => {
            switch (selected) {
                case 0:
                    settings.type = numbering.CONTINUOUS;
                    break;
                case 1:
                    settings.type = numbering.EACH_PAGE;
                    break;
            }
        });
    const blankLinesCheckbox = DialogMenu.checkBox(
        "Blank lines", 
        () => {return settings.numberBlankLines}, 
        (numberBlankLines) => {settings.numberBlankLines = numberBlankLines});
    dialogMenu.addSection("Numbering", [numberingStyleRadioGroup, startAtInput, countByInput, blankLinesCheckbox]);

    injectMenuOpenButton(() => {
        settings.save();
        dialogMenu.show();
    });
}

function injectMenuOpenButton(showPopup) {
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

    lineNumberingMenu.onclick = showPopup;

    commentButton.parentNode.parentNode.insertBefore(lineNumberingMenu, commentButton.parentNode);
}

class DialogMenu {
    constructor(title, cancel, apply) {
        this.title = title;
        this.cancel = cancel;
        this.apply = apply;
        this.sectionGenerators = []; // functions to generate sections
    }

    build() {
        const dialog = document.createElement('div');
        dialog.id = "line-numbering-dialog"

        dialog.innerHTML = `
        <div class="modal-dialog-bg" style="opacity: 0.75; width: 100vw; height: 100vh;" aria-hidden="true"></div>

        <div class="modal-dialog docs-dialog" tabindex="0" role="dialog" aria-labelledby="evb5a0:70g" style="left: 50%; top: 50%; transform: translate(-50%, -50%); opacity: 1;">
            <div class="modal-dialog-title modal-dialog-title-draggable">
                <span class="modal-dialog-title-text" id="evb5a0:70g" role="heading">${this.title}</span>
                <span class="modal-dialog-title-close" role="button" tabindex="0" aria-label="Close" data-tooltip="Close"></span>
            </div>
            <div class="modal-dialog-content">
                <div class="settings-content">
                </div>
                <div class="modal-dialog-buttons">
                    <button class="ln-modal-dialog-cancel" name="cancel">Cancel</button>
                    <button name="apply" class="ln-modal-dialog-apply goog-buttonset-default goog-buttonset-action">Apply</button>
                </div>
            </div> 
        </div>`;

        const content = dialog.querySelector('.settings-content');

        for (const generator of this.sectionGenerators) {
            content.appendChild(generator());
        }

        const closeCross = dialog.querySelector('.modal-dialog-title-close');
        const cancelButton = dialog.querySelector('.ln-modal-dialog-cancel');
        const applyButton = dialog.querySelector('.ln-modal-dialog-apply');

        const closeAndCancel = () => {this.close(); this.cancel();};
        const closeAndApply = () => {this.close(); this.apply();};
        closeCross.onclick = closeAndCancel;
        cancelButton.onclick = closeAndCancel;
        applyButton.onclick = closeAndApply;

        return dialog;
    }

    show() {
        this.dialog = this.build();
        document.body.appendChild(this.dialog);
    }

    close() {
        document.body.removeChild(this.dialog);
    }

    addSection(title, elementGenerators) {
        const sectionGenerator = () => {
            const section = document.createElement('div');
            section.classList.add('dialog-section');
            if (title != null) {
                section.innerHTML = '<div class="dialog-title">Numbering</div>'
            }

            for (const generator of elementGenerators) {
                section.appendChild(generator());
            }

            return section;
        }

        this.sectionGenerators.push(sectionGenerator);
    }

    static checkBox(labelText, isChecked, onUpdate) {
        return () => {
            const checkboxInput = document.createElement('div');
            checkboxInput.classList.add('dialog-input-field');
            checkboxInput.innerHTML = `
                <div class="jfk-checkbox docs-material-gm-checkbox"></div>
                <div class="label">${labelText}</div>`

            const checkbox = checkboxInput.querySelector('.jfk-checkbox');
            if (isChecked()) {
                checkbox.classList.add('docs-material-gm-checkbox-checked');
            } else {
                checkbox.classList.add('docs-material-gm-checkbox-unchecked');
            }

            const onclick = () => {
                const enabled = checkbox.classList.contains('docs-material-gm-checkbox-checked');
                if (enabled) {
                    // Disable
                    checkbox.classList.remove('docs-material-gm-checkbox-checked');
                    checkbox.classList.add('docs-material-gm-checkbox-unchecked');

                    onUpdate(false);
                } else {
                    // Enable
                    checkbox.classList.remove('docs-material-gm-checkbox-unchecked');
                    checkbox.classList.add('docs-material-gm-checkbox-checked');

                    onUpdate(true);
                }
            }

            const label = checkboxInput.querySelector('.label');
            checkbox.onclick = onclick;
            label.onclick = onclick;

            return checkboxInput;
        }
    }

    static input(id, label, description, getValue, parseAndValidate, onUpdate) {
        return () => {
            const input = document.createElement('div');
            input.classList.add('dialog-input-field');
            input.innerHTML = `
                <div>
                    <label>${label}</label>
                </div>
                <div style="margin-left: auto;">
                    <input type="text" class="kix-headerfooterdialog-input jfk-textinput">
                </div>`

            if (description != null) {
                const div = input.querySelector('div');
                const span = document.createElement('span');
                span.style['font-size'] = '10px';
                span.innerText = description;
                
                div.appendChild(document.createElement('br'));
                div.appendChild(span);
            }

            const inputBox = input.querySelector('.jfk-textinput');
            inputBox.value = getValue();

            inputBox.addEventListener('change', (event) => {
                const errorMessageId = `error-message-${id}`;

                event.target.classList.remove('input-error');
                const errorMessage = event.target.parentNode.parentNode.parentNode.querySelector(`#${errorMessageId}`);
                if (errorMessage != null) {
                    errorMessage.remove();
                }

                const value = event.target.value;

                const res = parseAndValidate(value);

                if (res.error) {
                    event.target.classList.add('input-error');

                    const errorMessage = document.createElement('div');
                    errorMessage.classList.add('ln-input-error');
                    errorMessage.id = errorMessageId;
                    errorMessage.innerText = res.errorMessage;
                    event.target.parentNode.parentNode.parentNode.insertBefore(
                        errorMessage, event.target.parentNode.parentNode.nextSibling);
                    
                    // TODO: Do something to disable applying changes.
                    // validInput[1] = false;
                } else {
                    onUpdate(res.value);
                }
            });

            return input;
        }
    }

    static radioGroup(labels, selected, onSelect) {
        return () => {
            const radioGroup = document.createElement('div');
            radioGroup.classList.add('ln-radio-button-group-controls');

            const selectedIndex = selected();

            let radioButton;
            const radios = [];
            for (let i = 0; i < labels.length; i++) {
                const label = labels[i];

                radioButton = this.radioButton(label, () => {return (i == selectedIndex);})();
                radioButton.style['padding-right'] = '24px';
                
                const radio = radioButton.querySelector('.jfk-radiobutton');
                radio.attributes.index = i;
                radio.onclick = () => {
                    for (const r of radios) {
                        r.classList.remove('jfk-radiobutton-checked');
                    }
                    radio.classList.add('jfk-radiobutton-checked');

                    onSelect(radio.attributes.index);
                };

                radios.push(radio);
                radioGroup.appendChild(radioButton);
            }
            radioButton.style.removeProperty('padding-right');

            return radioGroup;
        }
    }

    static radioButton(label, selected) {
        return () => {
            const radioButton = document.createElement('div');
            radioButton.classList.add('goog-inline-block');
            radioButton.innerHTML = `
                <div class="ln-control goog-inline-block">
                    <div class="jfk-radiobutton">
                        <span class="jfk-radiobutton-radio"></span>
                        <span class="jfk-radiobutton-label">
                            <label for="kix-pagenumberdialog-footer">${label}</label>
                        </span>
                    </div>
                </div>`

            if (selected()) {
                radioButton.querySelector('.jfk-radiobutton').classList.add('jfk-radiobutton-checked');
            }

            return radioButton;
        }
    }
}