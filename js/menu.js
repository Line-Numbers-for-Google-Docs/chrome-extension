var inserted = false;
var $subMenus = $('.goog-menuitem.apps-menuitem.goog-submenu');

// var letters = [];

$subMenus.waitUntilExists(function() {

  // var letter = $(this).find(".goog-menuitem-label").attr("aria-label").split(' ').slice(-1)[0];
  // letters.push(letter);
  // letters.sort();
  // console.log(letters);

  if (!inserted) {
    var label = $(this).find(".goog-menuitem-label").attr("aria-label");

    if (label == "Bullets & numbering t") {

      const $lineNumberingVerticalMenu = generateLineNumberingVerticalMenu();

      $('body').append($lineNumberingVerticalMenu);

      $(this).after(generateLineNumberingSubMenu(
        $lineNumberingVerticalMenu, $(this).parent()));

      inserted = true;
    }
  }

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
  return $(
    '<div class="goog-menuitem apps-menuitem" role="menuitem" style="user-select: none;">' +
      '<div class="goog-menuitem-content" style="user-select: none;">' +
        '<span class="goog-menuitem-label" style="user-select: none;">' + label + '</span>' +
      '</div>' +
    '</div>'
  );
}

/**
 * @function
 * @param {string} label serves as a description of the checkbox menu item
 * @param {boolean} checked is set to true is option is/has been selected
 */
function generateCheckboxMenuItem(label, checked) {
  return $(
    '<div class="goog-menuitem goog-option-selected apps-menuitem goog-option" role="menuitemcheckbox" aria-checked="' + checked + '" style="user-select: none;">' +
      '<div class="goog-menuitem-content" style="user-select: none;">' +
        '<div class="goog-menuitem-checkbox" style="user-select: none;"></div>' +
        '<span class="goog-menuitem-label" style="user-select: none;">' + label + '</span>' +
      '</div>' +
    '</div>'
  );
}

function generateMenuSeparator() {
  $('<div class="goog-menuseparator" aria-disabled="true" role="separator" style="user-select: none;"></div>');
}

function generateVerticalMenu() {
  return $('<div class="goog-menu goog-menu-vertical docs-material goog-menu-noaccel docs-menu-hide-mnemonics" style="user-select: none; display: none;" role="menu" aria-haspopup="true"></div>');
}


/**
 * Line Numbering Menu Generation Functions
 */

function generateLineNumberingVerticalMenu() {
  const $verticalMenu = generateVerticalMenu();

  $verticalMenu.append(generateCheckboxMenuItem("Activate", true));

  $verticalMenu.append(generateMenuSeparator());

  $verticalMenu.append(generateMenuItem("More options..."));

  return $verticalMenu;
}

function generateLineNumberingSubMenu($verticalMenu, $mainMenuContainer) {
  return generateSubMenu(
    ["", "L", "ine numbering"], $verticalMenu, $mainMenuContainer);
}
