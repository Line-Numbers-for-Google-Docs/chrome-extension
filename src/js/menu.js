import { SettingsManager, numbering, borderStyle, selection } from "./storage.js";
import { Metrics } from "./metrics.js";
import { Auth } from "./auth.js";
import { getIndexesOfSelectedLines } from "./utils.js";

export async function injectMenu() {
    const settingsManager = await SettingsManager.getInstance();
    const settings = settingsManager.settings;

    const enabledIfPremium = async () => { return await Auth.isPremium(); };

    const positiveNumberParseAndValidate = (value) => {
        if (isNaN(value)) {
            return { error: true, errorMessage: "Must be numeric." }
        }

        const number = Number(value);

        if (number <= 0) {
            return { error: true, errorMessage: "Must be strictly positive." }
        }

        return { error: false, value: number };
    }

    const positiveIntegerParseAndValidate = (value) => {
        const res = positiveNumberParseAndValidate(value);

        if (res.error) {
            return res;
        }

        const number = res.value;

        if (!Number.isInteger(number)) {
            return { error: true, errorMessage: "Must be a whole number." }
        }

        return { error: false, value: number }
    };

    const dialogMenu = new DialogMenu("Line Numbering",
        () => {
            settings.restoreLastSave();
        },
        () => {
            settings.popLastSave();
            settingsManager.store();
        });

    /**
     * Numbering section
     */

    const enableCheckbox = DialogMenu.checkBox("Show line numbering",
        () => { return settings.enabled },
        (enabled) => {
            settings.enabled = enabled;

            if (enabled) {
                Metrics.numberingEnabled();
            } else {
                Metrics.NumberingDisabled();
            }
        });

    const startAtInput = DialogMenu.input("start-at", "Start at", null,
        () => { return settings.start; },
        positiveIntegerParseAndValidate,
        (start) => { settings.start = start; });
    const countByInput = DialogMenu.input("count-by", "Count by", "(number every X line)",
        () => { return settings.step; },
        positiveIntegerParseAndValidate,
        (countBy) => { settings.step = countBy; });
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
        () => { return settings.numberBlankLines },
        (numberBlankLines) => { settings.numberBlankLines = numberBlankLines });
    const headersCheckbox = DialogMenu.checkBox(
        "Headers",
        () => { return settings.numberHeaders },
        (numberHeaders) => { settings.numberHeaders = numberHeaders });
    const footersCheckbox = DialogMenu.checkBox(
        "Footers",
        () => { return settings.numberFooters },
        (numberFooters) => { settings.numberFooters = numberFooters });
    const checkBoxGroup1 = DialogMenu.inLineGroup([blankLinesCheckbox, headersCheckbox, footersCheckbox]);

    const columnsCheckbox = DialogMenu.checkBox(
        "Columns",
        () => { return settings.numberColumns },
        (numberColumns) => { settings.numberColumns = numberColumns },
        enabledIfPremium);
    const checkBoxGroup2 = DialogMenu.inLineGroup([columnsCheckbox]);

    dialogMenu.addSection("Numbering", [enableCheckbox, numberingStyleRadioGroup, startAtInput, countByInput, checkBoxGroup1, checkBoxGroup2]);

    /**
     * Selection section
     */

    const selectionTypeRadioGroup = DialogMenu.radioGroup(["Number", "Don't Number"],
        () => {
            switch (settings.type) {
                case selection.NUMBER:
                    return 0;
                case selection.NO_NUMBER:
                    return 1;
                default:
                    return 0;
            }
        },
        (selected) => {
            switch (selected) {
                case 0:
                    settings.selectionType = selection.NUMBER;
                    break;
                case 1:
                    settings.selectionType = selection.NO_NUMBER;
                    break;
            }
        });

    const numberSelectionCheckbox = DialogMenu.checkBox(
        "Selection",
        () => { return false },
        (active, popupMenu) => {
            if (active) {
                popupMenu.hide()
                // console.log(getIndexesOfSelectedLines())

                document.body.style['pointer-events'] = 'none'
                document.querySelector('.kix-appview-editor').style['pointer-events'] = 'all'

                const selectLinesPopup = document.createElement('div')
                selectLinesPopup.classList.add('numbering-selection-popup')
                selectLinesPopup.innerHTML = 'Select a section of text to number'
                document.body.appendChild(selectLinesPopup)

                const mouseupHandler = (event) => {
                    const selection = Array.from(document.getElementsByClassName('kix-selection-overlay'))
                    if (selection.length > 0) {
                        console.log(getIndexesOfSelectedLines())

                        for (const elem of selection) {
                            elem.remove()
                        }

                        document.body.style['pointer-events'] = null
                        document.body.removeEventListener('mouseup', mouseupHandler)
                        selectLinesPopup.remove()
                        popupMenu.show()
                    }
                }

                document.body.addEventListener('mouseup', mouseupHandler)
            }
        },
        enabledIfPremium);

    // TODO: Add 'Add selection button' and list selections with checkboxes ([ ] "start of text ... end of text (l.x-y)")
    dialogMenu.addSection("Selection", [selectionTypeRadioGroup, numberSelectionCheckbox]);

    /**
     * Style Section
     */

    const hexParseAndValidate = (value) => {
        if (value[0] == "#") {
            value = value.substr(1);
        }

        if ((/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g).test(value)) {
            return { error: false, value: value }
        } else {
            return { error: true, errorMessage: "Invalid HEX color code." }
        }
    }

    const numberSize = DialogMenu.input("number-size", "Size", null,
        () => { return settings.numberSize; },
        positiveNumberParseAndValidate,
        (numberSize) => { settings.numberSize = numberSize; },
        enabledIfPremium);

    const numberColor = DialogMenu.input("number-color", "Color", "(HEX color code)",
        () => { return settings.numberColor; },
        hexParseAndValidate,
        (numberColor) => { settings.numberColor = numberColor; },
        enabledIfPremium);

    dialogMenu.addSection("Style", [numberSize, numberColor]);

    /**
     * Border Section
     */

    // const leftBorderStyle = DialogMenu.dropDown(
    //     "Left Border Style"
    // );

    // const rightBorderStyle = DialogMenu.dropDown(
    //     "Right Border Style"
    // );

    const leftBorderSectionTitle = DialogMenu.sectionTitle("Left Border");
    const leftBorderStyle = DialogMenu.radioGroup(["None", "Solid", "Double"],
        () => {
            switch (settings.leftBorderStyle) {
                case borderStyle.NONE:
                    return 0;
                case borderStyle.SOLID:
                    return 1;
                case borderStyle.DOUBLE:
                    return 2;
                default:
                    return 0;
            }
        },
        (selected) => {
            switch (selected) {
                case 0:
                    settings.leftBorderStyle = borderStyle.NONE;
                    break;
                case 1:
                    settings.leftBorderStyle = borderStyle.SOLID;
                    break;
                case 2:
                    settings.leftBorderStyle = borderStyle.DOUBLE;
                    break;
            }
        },
        enabledIfPremium);

    const rightBorderSectionTitle = DialogMenu.sectionTitle("Right Border");
    const rightBorderStyle = DialogMenu.radioGroup(["None", "Solid", "Double"],
        () => {
            switch (settings.rightBorderStyle) {
                case borderStyle.NONE:
                    return 0;
                case borderStyle.SOLID:
                    return 1;
                case borderStyle.DOUBLE:
                    return 2;
                default:
                    return 0;
            }
        },
        (selected) => {
            switch (selected) {
                case 0:
                    settings.rightBorderStyle = borderStyle.NONE;
                    break;
                case 1:
                    settings.rightBorderStyle = borderStyle.SOLID;
                    break;
                case 2:
                    settings.rightBorderStyle = borderStyle.DOUBLE;
                    break;
            }
        },
        enabledIfPremium);

    dialogMenu.addSection("Borders", [leftBorderSectionTitle, leftBorderStyle, rightBorderSectionTitle, rightBorderStyle]);

    injectMenuOpenButton(() => {
        settings.save();
        dialogMenu.render();
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

        // TODO: Add reset button, like in Format > Paragraph Style > Borders and shading
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
            </div> 
            <div class="modal-dialog-buttons">
                <button class="ln-modal-dialog-cancel" name="cancel">Cancel</button>
                <button name="apply" class="ln-modal-dialog-apply goog-buttonset-default goog-buttonset-action">Apply</button>
            </div>
        </div>`;

        const content = dialog.querySelector('.settings-content');

        const dialogSectionSelector = document.createElement('div');
        dialogSectionSelector.classList.add('dialog-title');
        content.appendChild(dialogSectionSelector);

        const sectionsDiv = document.createElement('div');
        sectionsDiv.classList.add('settings');
        content.appendChild(sectionsDiv);

        const sectionTitles = [];
        const sections = [];
        for (const generator of this.sectionGenerators) {
            const sectionTitle = document.createElement('span');
            sectionTitle.classList.add('section-title');
            sectionTitle.innerText = generator[0]; // [0] Title
            dialogSectionSelector.appendChild(sectionTitle);
            sectionTitles.push(sectionTitle);

            const section = generator[1](this); // [1] Generator function
            section.style.display = 'none';
            sectionsDiv.appendChild(section);
            sections.push(section);

            sectionTitle.onclick = function () {
                for (let i = 0; i < sections.length; i++) {
                    sections[i].style.display = 'none';
                    sectionTitles[i].classList.remove('active');
                }

                section.style.display = null;
                sectionTitle.classList.add('active');
            };
        }
        sections[0].style.display = null;
        sectionTitles[0].classList.add('active');

        Auth.isPremium().then(isPremium => {
            if (!isPremium) {
                const goPremium = document.createElement('div');
                goPremium.classList.add('go-premium');
                goPremium.innerHTML = "<p><a target='_blank' href='https://linenumbers.app/#/premium'>Go Premium</a> to enable all settings <br />and support development and costs!</p>"
                dialog.querySelector('.modal-dialog').appendChild(goPremium);
            }
        });

        const closeCross = dialog.querySelector('.modal-dialog-title-close');
        const cancelButton = dialog.querySelector('.ln-modal-dialog-cancel');
        const applyButton = dialog.querySelector('.ln-modal-dialog-apply');

        const closeAndCancel = () => { this.close(); this.cancel(); };
        const closeAndApply = () => { this.close(); this.apply(); };
        closeCross.onclick = closeAndCancel;
        cancelButton.onclick = closeAndCancel;
        applyButton.onclick = closeAndApply;

        return dialog;
    }

    show() {
        this.dialog.style.display = null
    }

    hide() {
        this.dialog.style.display = 'none'
    }

    render() {
        this.dialog = this.build();
        document.body.appendChild(this.dialog);
    }

    close() {
        document.body.removeChild(this.dialog);
    }

    addSection(title, elementGenerators) {
        const sectionGenerator = (self) => {
            const section = document.createElement('div');
            section.classList.add('dialog-section');

            for (const generator of elementGenerators) {
                section.appendChild(generator(self));
            }

            return section;
        }

        this.sectionGenerators.push([title, sectionGenerator]);
    }

    static checkBox(labelText, isChecked, onUpdate, isEnabled) {
        return (self) => {
            const checkboxInput = document.createElement('div');
            checkboxInput.classList.add('dialog-input-field');
            checkboxInput.innerHTML = `
                <div class="jfk-checkbox docs-material-gm-checkbox"></div>
                <div class="label checkbox-label">${labelText}</div>`

            const checkbox = checkboxInput.querySelector('.jfk-checkbox');
            if (isChecked()) {
                checkbox.classList.add('docs-material-gm-checkbox-checked');
            } else {
                checkbox.classList.add('docs-material-gm-checkbox-unchecked');
            }

            const registerListener = () => {
                const onclick = () => {
                    const enabled = checkbox.classList.contains('docs-material-gm-checkbox-checked');
                    if (enabled) {
                        // Disable
                        checkbox.classList.remove('docs-material-gm-checkbox-checked');
                        checkbox.classList.add('docs-material-gm-checkbox-unchecked');

                        onUpdate(false, self);
                    } else {
                        // Enable
                        checkbox.classList.remove('docs-material-gm-checkbox-unchecked');
                        checkbox.classList.add('docs-material-gm-checkbox-checked');

                        onUpdate(true, self);
                    }
                }

                const label = checkboxInput.querySelector('.label');
                checkbox.onclick = onclick;
                label.onclick = onclick;
            }

            if (isEnabled == null) {
                // Assume not enabled
                registerListener();
            } else {
                // Disable until found otherwise
                checkbox.classList.add('docs-material-gm-checkbox-disabled');
                checkboxInput.classList.add('disabled');

                isEnabled().then(isEnabled => {
                    if (isEnabled) {
                        registerListener();
                        checkbox.classList.remove('docs-material-gm-checkbox-disabled');
                        checkboxInput.classList.remove('disabled');
                    };
                });
            }

            return checkboxInput;
        }
    }

    static input(id, label, description, getValue, parseAndValidate, onUpdate, isEnabled) {
        return () => {
            const input = document.createElement('div');
            input.classList.add('dialog-input-field');
            input.innerHTML = `
                <div>
                    <label class="label">${label}</label>
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

            const registerListener = () => {
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

                        // TODO: Do something to disable applying changes if not all inputs have been validated
                        // validInput[1] = false;
                    } else {
                        onUpdate(res.value);
                    }
                });
            }

            if (isEnabled == null) {
                // Assume enabled
                registerListener();
            } else {
                // Disable until found otherwise
                input.classList.add('disabled');
                inputBox.disabled = true;
                isEnabled().then(isEnabled => {
                    if (isEnabled) {
                        registerListener();
                        input.classList.remove('disabled');
                        inputBox.disabled = false;
                    }
                });
            }

            return input;
        }
    }

    static radioGroup(labels, selected, onSelect, isEnabled) {
        return () => {
            const radioGroup = document.createElement('div');
            radioGroup.classList.add('ln-radio-button-group-controls');

            const selectedIndex = selected();

            let radioButton;
            const radios = [];
            for (let i = 0; i < labels.length; i++) {
                const label = labels[i];

                radioButton = this.radioButton(label, () => { return (i == selectedIndex); })();
                radioButton.style['padding-right'] = '24px';

                const radio = radioButton.querySelector('.jfk-radiobutton');
                radio.attributes.index = i;

                const registerListener = () => {
                    radio.onclick = () => {
                        for (const r of radios) {
                            r.classList.remove('jfk-radiobutton-checked');
                        }
                        radio.classList.add('jfk-radiobutton-checked');

                        onSelect(radio.attributes.index);
                    };
                };

                if (isEnabled == null) {
                    registerListener();
                } else {
                    radio.classList.add('jfk-radiobutton-disabled');
                    isEnabled().then(enabled => {
                        if (enabled) {
                            registerListener();
                            radio.classList.remove('jfk-radiobutton-disabled');
                        }
                    });
                }

                radios.push(radio);
                radioGroup.appendChild(radioButton);
            }
            radioButton.style.removeProperty('padding-right');

            return radioGroup;
        }
    }

    static inLineGroup(itemsGenerators) {
        return () => {
            const group = document.createElement('div');
            group.classList.add('ln-inline-group');

            let itemWrapper;
            for (const generator of itemsGenerators) {
                itemWrapper = document.createElement('div');
                itemWrapper.style.paddingRight = '15px';
                const item = generator();
                itemWrapper.appendChild(item);
                group.appendChild(itemWrapper);
            }
            itemWrapper.style.paddingRight = 0;

            return group;
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

    static dropDown(label) {
        return () => {
            const dropDown = document.createElement('div');
            dropDown.classList.add('dialog-dropdown-menu');
            dropDown.innerHTML = `
                <div class="title goog-inline-block">
                    <label>${label}</label>
                </div>
                <div class="dropdown-control goog-inline-block">
                    <div class="goog-inline-block goog-flat-menu-button">
                        <div class="goog-inline-block goog-flat-menu-button-caption" id="fsroc0:7ck" role="option" aria-selected="true" aria-setsize="3" aria-posinset="0">
                            <div class="docs-icon goog-inline-block " aria-label="Select a line dash">
                                <div class="docs-icon-img-container docs-icon-img docs-icon-line-type" aria-hidden="true">&nbsp;</div>
                            </div>
                        </div>
                        <div class="goog-inline-block goog-flat-menu-button-dropdown" aria-hidden="true">&nbsp;</div>
                    </div>
                </div>

                <div class="goog-menu goog-menu-vertical kix-bordersshadingdialog-menu" role="menu" aria-haspopup="true">
                    <div class="goog-menuitem goog-option" role="menuitemcheckbox" aria-label="Line dash: Solid" aria-checked="false" id="1jezes:7hr" style="user-select: none;">
                        <div class="goog-menuitem-content" style="user-select: none;">
                            <div class="goog-menuitem-checkbox" style="user-select: none;"></div>
                            <div style="user-select: none;">&nbsp;
                                <div style="width: 50px; margin-bottom: 4px; display: inline-block; border-top: 2px solid rgb(0, 0, 0); user-select: none;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="goog-menuitem goog-option" role="menuitemcheckbox" aria-label="Line dash: Dot" aria-checked="false" id="1jezes:7hs" style="user-select: none;">
                        <div class="goog-menuitem-content" style="user-select: none;">
                            <div class="goog-menuitem-checkbox" style="user-select: none;"></div>
                            <div style="user-select: none;">&nbsp;
                                <div style="width: 50px; margin-bottom: 4px; display: inline-block; border-top: 2px dotted rgb(0, 0, 0); user-select: none;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="goog-menuitem goog-option" role="menuitemcheckbox" aria-label="Line dash: Dash" aria-checked="false" id="1jezes:7ht" style="user-select: none;">
                        <div class="goog-menuitem-content" style="user-select: none;">
                            <div class="goog-menuitem-checkbox" style="user-select: none;"></div>
                            <div style="user-select: none;">&nbsp;
                                <div style="width: 50px; margin-bottom: 4px; display: inline-block; border-top: 2px dashed rgb(0, 0, 0); user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            `;

            return dropDown;
        }
    }

    static sectionTitle(title) {
        return () => {
            const sectionTitle = document.createElement('div');
            sectionTitle.classList.add('section-title');
            sectionTitle.innerText = title;

            return sectionTitle;
        }
    }
}