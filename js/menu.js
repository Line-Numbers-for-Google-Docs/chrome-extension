// var letters = [];
// TODO: Move local storage variable names to global variables
chrome.storage.local.get( ["enabled", "everyXLine", "numberBlankLines", "numberHeaderFooter", "numberParagraphsOnly", "newPageCountReset", "lineBorder"], function( results ) {

  console.log(results);
  
  var inserted = false;
  var $subMenus = $('.goog-menuitem.apps-menuitem.goog-submenu');

  $subMenus.waitUntilExists(function() {

    // var letter = $(this).find(".goog-menuitem-label").attr("aria-label").split(' ').slice(-1)[0];
    // letters.push(letter);
    // letters.sort();
    // console.log(letters);

    if (!inserted) {
      var label = $(this).find(".goog-menuitem-label").attr("aria-label");

      if (label == "Bullets & numbering t") {

        const $lineNumberingVerticalMenu = generateLineNumberingVerticalMenu(results);

        $('body').append($lineNumberingVerticalMenu);

        $(this).after(generateLineNumberingSubMenu(
          $lineNumberingVerticalMenu, $(this).parent()));

        inserted = true;
      }
    }

  });
});

/**
 * @function
 * @param {array} label should be in the following format [pre, mnemonic, post], 
 *        such that label = pre + mnemonic + post
 * @param {DOMElement} $verticalMenu is the vertical menu to be opened on hover
 * @param {DOMElement} mainMenuContainer is the parent menu which when closed 
 *        has to close all children menu
 */
function generateSubMenu(labelArr, $verticalMenu, $mainMenuContainer) {
  const pre      = labelArr[0];
  const mnemonic = labelArr[1];
  const post     = labelArr[2];

  const label = pre + mnemonic + post;

  var $subMenu = $(
    '<div class="goog-menuitem apps-menuitem goog-submenu" role="menuitem" aria-disabled="false" aria-haspopup="true" style="user-select: none;">' + 
      '<div class="goog-menuitem-content" style="user-select: none;">' + 
        '<div class="docs-icon goog-inline-block goog-menuitem-icon" aria-hidden="true" style="user-select: none;">' + 
          '<div class="docs-icon-img-container docs-icon-img docs-icon-list-number" style="user-select: none;"></div>' + 
        '</div>' + 
        '<span aria-label="' + label + ' ' +  mnemonic.toLowerCase() + '" class="goog-menuitem-label" style="user-select: none;">' + 
          pre + '<span class="goog-menuitem-mnemonic-hint" style="user-select: none;">' + mnemonic + '</span>' + post + 
        '</span>' +
        '<span class="goog-submenu-arrow" style="user-select: none;">►</span>' +
      '</div>' + 
    '</div>');

  /**
   * Menu Toggling
   */

  $subMenu.hover(
    function() {
      $(this).addClass("goog-menuitem-highlight");
      setTimeout(showVerticalMenu, 300, $verticalMenu, $(this));
    }, function() {
      $(this).removeClass("goog-menuitem-highlight");
      setTimeout(hideVerticalMenu, 300, $verticalMenu, $(this));
    }
  );

  $verticalMenu.hover(
    function() {
      $subMenu.addClass("goog-menuitem-highlight");
    }, function() {
      if ($(".goog-menu.goog-menu-vertical:hover").length > 0) {
        $subMenu.removeClass("goog-menuitem-highlight");
        setTimeout(hideVerticalMenu, 300, $(this), $subMenu);
      }
    }
  );

  /**
   * Force hide menu
   */

  $("#docs-menubars .menu-button").hover(function() {
    if ($(this).text() != "Format") {
      forceHideVerticalMenu($verticalMenu, $subMenu);
    }
  }, function() {});

  $mainMenuContainer.children(".goog-menuitem.goog-submenu").not($subMenu).hover(function(e) {
    $subMenu.removeClass("goog-menuitem-highlight");
    setTimeout(hideVerticalMenu, 200, $verticalMenu, $subMenu);
  }, function() {});

  $verticalMenu.click(function() {
    forceHideVerticalMenu($verticalMenu, $subMenu);
  });

  $verticalMenu.contextmenu(function() {
    forceHideVerticalMenu($verticalMenu, $subMenu);
  });

  $(document).click(function() {
    forceHideVerticalMenu($verticalMenu, $subMenu);
  });

  $subMenu.click(function() {
    showVerticalMenu($verticalMenu, $subMenu);
  });

  return $subMenu;
}

function showVerticalMenu($verticalMenu, $parentMenu) {
  if ($parentMenu.hasClass("goog-menuitem-highlight")) {
    $verticalMenu.css('left', $parentMenu.offset().left + $parentMenu.outerWidth());
    $verticalMenu.css('top', $parentMenu.offset().top);
    $verticalMenu.show();
  }
}

function hideVerticalMenu($verticalMenu, $parentMenu) {
  if (!$parentMenu.hasClass("goog-menuitem-highlight")) {
    $verticalMenu.hide();
  }
}

function forceHideVerticalMenu($verticalMenu, $parentMenu) {
  $parentMenu.removeClass("goog-menuitem-highlight");
  hideVerticalMenu($verticalMenu, $parentMenu);
}

/**
 * @function
 * @param {string} label serves as a description of the menu item
 */
function generateMenuItem(label) {
  const $menuItem = $(
    '<div class="goog-menuitem apps-menuitem" role="menuitem" style="user-select: none;">' +
      '<div class="goog-menuitem-content" style="user-select: none;">' +
        '<span class="goog-menuitem-label" style="user-select: none;">' + label + '</span>' +
      '</div>' +
    '</div>'
  );

  $menuItem.hover(function() {
    $(this).addClass("goog-menuitem-highlight");
  }, function() {
    $(this).removeClass("goog-menuitem-highlight");
  });

  return $menuItem;
}

/**
 * @function
 * @param {string} label serves as a description of the checkbox menu item
 * @param {boolean} checked is set to true is option is/has been selected
 */
function generateCheckboxMenuItem(label, checked) {
  var $checkboxMenuItem = $(
    '<div class="goog-menuitem apps-menuitem goog-option" role="menuitemcheckbox" aria-checked="' + checked + '" style="user-select: none;">' +
      '<div class="goog-menuitem-content" style="user-select: none;">' +
        '<div class="goog-menuitem-checkbox" style="user-select: none;"></div>' +
        '<span class="goog-menuitem-label" style="user-select: none;">' + label + '</span>' +
      '</div>' +
    '</div>'
  );

  if (checked) {
    $checkboxMenuItem.addClass('goog-option-selected');
  }

  $checkboxMenuItem.hover(function() {
    $(this).addClass("goog-menuitem-highlight");
  }, function() {
    $(this).removeClass("goog-menuitem-highlight");
  });

  $checkboxMenuItem.click(function() {
    var isChecked = $(this).hasClass("goog-option-selected");
    if (isChecked) {
      $(this).removeClass("goog-option-selected");
      $(this).attr('aria-checked', false);
      $(this).uncheckCallback();
    } else {
      $(this).addClass("goog-option-selected");
      $(this).attr('aria-checked', true);
      $(this).checkCallback();
    }
  });

  return $checkboxMenuItem;
}

$.fn.uncheck = function(callback) {
  // data is the argument passed to doSomething
  return this.each(function() {
    this.uncheckCallback = callback;
  });
};

$.fn.uncheckCallback = function() {
  this.each(function() {
    this.uncheckCallback();
  });
};

$.fn.check = function(callback) {
  return this.each(function() {
    this.checkCallback = callback;
  });
};

$.fn.checkCallback = function() {
  this.each(function() {
    this.checkCallback();
  });
};

function generateMenuSeparator() {
  return $('<div class="goog-menuseparator" aria-disabled="true" role="separator" style="user-select: none;"></div>');
}

function generateVerticalMenu() {
  return $('<div class="goog-menu goog-menu-vertical docs-material goog-menu-noaccel docs-menu-hide-mnemonics" style="user-select: none; display: none;" role="menu" aria-haspopup="true"></div>');
}

function generateDialogBackground() {
  return $('<div class="modal-dialog-bg" style="opacity: 0.75; width: 100vw; height: 100vh;" aria-hidden="true"></div>');
}

/**
 * @function
 * @param {string} title the title of the dialog
 * @param {function} applyCallback the function will run when apply button is
 *        clicked
 */
function generateDialog(title, applyCallback) {
  const $dialog = $(
    '<div class="modal-dialog docs-dialog" tabindex="0" role="dialog" style="position: fixed; top: 50%; left: 50%;transform: translate(-50%, -50%); opacity: 1;">' + 
      '<div class="modal-dialog-title modal-dialog-title-draggable">' +
        '<span class="modal-dialog-title-text" id=":703" role="heading">' + title + '</span>' +
        '<span class="modal-dialog-title-close" role="button" tabindex="0" aria-label="Close"></span>' +
      '</div>' +
      '<div class="modal-dialog-content">' +
        '<div class="kix-columnoptionsdialog-content">' +
          '<div class="kix-columnoptionsdialog-content-left-side goog-inline-block">' +
            // Options will be inserted here 
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="modal-dialog-buttons">' +
        '<button name="apply" class="goog-buttonset-default goog-buttonset-action">Apply</button>' +
        '<button name="cancel">Cancel</button>' +
      '</div>' +
    '</div>'
  ).add(generateDialogBackground());

  $dialog.find(".modal-dialog-title-close").click(function() {
    $dialog.remove();
  });

  $dialog.find("button[name='apply']").click(function() {
    $dialog.remove();
  });

  $dialog.find("button[name='cancel']").click(function() {
    $dialog.remove();
  })

  return $dialog;
}

jQuery.fn.outerHTML = function() {
  return jQuery('<div />').append(this.eq(0).clone()).html();
};

function generateCheckboxControl(checked) {
  const $checkBox = $(
    '<div class="kix-columnoptionsdialog-control goog-inline-block kix-columnoptionsdialog-line-between">' +
      '<div class="jfk-checkbox goog-inline-block" role="checkbox" dir="ltr" tabindex="0" aria-labelledby="kix-columnoptionsdialog-line-between-label" style="user-select: none;">' +
        '<div class="jfk-checkbox-checkmark" role="presentation"></div>' +
      '</div>' +
    '</div>'
  );

  const $checkBoxInner = $checkBox.find(".jfk-checkbox");
  const uncheckedClass = "jfk-checkbox-unchecked";
  const checkedClass = "jfk-checkbox-checked";

  if (checked) {
    $checkBoxInner.addClass(checkedClass);
  } else {
    $checkBoxInner.addClass(uncheckedClass);
  }

  $checkBox.click(function() {
    if ($checkBoxInner.hasClass(checkedClass)) {
      $checkBoxInner.removeClass(checkedClass);
      $checkBoxInner.addClass(uncheckedClass);
    } else {
      $checkBoxInner.removeClass(uncheckedClass);
      $checkBoxInner.addClass(checkedClass);
    }
  });

  return $checkBox;
}

function generateTextInput(value) {
  const $input = $(
    '<div class="kix-columnoptionsdialog-control goog-inline-block">' +
      '<input type="text" class="kix-columnoptionsdialog-column-spacing jfk-textinput" id="kix-columnoptionsdialog-column-spacing">' + 
    '</div>'
  );

  $input.find(".jfk-textinput").val(value);

  return $input;
}

function addOptionToDialog($dialog, optionLabel, $optionControl) {
  const $option = $(
    '<div class="kix-columnoptionsdialog-section">' +
      '<div class="kix-columnoptionsdialog-title goog-inline-block">' +
        '<label for="kix-columnoptionsdialog-number-of-columns">' + optionLabel + '</label>' +
      '</div>' +
      // $optionControl will be added here
    '</div>'
  );

  $option.append($optionControl);

  $dialog.find(".kix-columnoptionsdialog-content-left-side.goog-inline-block")
    .append($option);

  return $dialog;
}

/**
 * Line Numbering Menu Generation Functions
 */

function generateLineNumberingVerticalMenu(results) {
  const $verticalMenu = generateVerticalMenu();

  console.log(results);

  const enabled = results["enabled"] == null ? false : results["enabled"];
  const newPageCountReset = results["newPageCountReset"] == null ? false : results["newPageCountRests"];

  const $noNumbersMenuItem = generateCheckboxMenuItem("None", !enabled);
  const $entireDocNumbersMenuItem = generateCheckboxMenuItem("Number entire document", enabled);

  $noNumbersMenuItem.uncheck(function() {
    chrome.storage.local.set({"enabled": false});
    // TODO: $entireDocNumbersMenuItem visually check
  });
  $noNumbersMenuItem.check(function() {
    chrome.storage.local.set({"enabled": true});
    // TODO: $entireDocNumbersMenuItem visually uncheck
  });

  $entireDocNumbersMenuItem.uncheck(function() {
    chrome.storage.local.set({"enabled": true});
    // TODO: $noNumbersMenuItem visually uncheck
  });
  $entireDocNumbersMenuItem.check(function() {
    chrome.storage.local.set({"enabled": false});
    // TODO: $noNumbersMenuItem visually check
  });

  $verticalMenu.append($noNumbersMenuItem);
  $verticalMenu.append($entireDocNumbersMenuItem);
  // $verticalMenu.append(generateMenuItem("Number selection"));

  $verticalMenu.append(generateMenuSeparator());

  $verticalMenu.append(generateCheckboxMenuItem("Continuous", !newPageCountReset));
  $verticalMenu.append(generateCheckboxMenuItem("Restart Each Page", newPageCountReset));
  // $verticalMenu.append(generateCheckboxMenuItem("Restart Each Section", false));

  $verticalMenu.append(generateMenuSeparator());

  $verticalMenu.append(generateCheckboxMenuItem("Suppress for current paragraph", false));
  $verticalMenu.append(generateCheckboxMenuItem("Suppress for current selection", false));

  $verticalMenu.append(generateMenuSeparator());

  const $moreOptionsMenuItem = generateMenuItem("More options...");
  $moreOptionsMenuItem.click(function() {
    $('body').append(generateLineNumberingOptionsDialog());
  });
  $verticalMenu.append($moreOptionsMenuItem);

  return $verticalMenu;
}

function generateLineNumberingSubMenu($verticalMenu, $mainMenuContainer) {
  return generateSubMenu(
    ["", "L", "ine numbering"], $verticalMenu, $mainMenuContainer);
}

function generateLineNumberingOptionsDialog() {
  const $dialog = generateDialog(
    "Line numbering options", 
    lineNumberingOptionsApplyCallback()
  );

  addOptionToDialog($dialog, "Count by", generateTextInput(1));
  addOptionToDialog($dialog, "Number blank lines", generateCheckboxControl(true));
  addOptionToDialog($dialog, "Add number/content divider", generateCheckboxControl(false));

  return $dialog;
}

function lineNumberingOptionsApplyCallback() {
  // TODO: Implement
}
