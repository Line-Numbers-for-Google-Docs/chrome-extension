// Inject line numbering css
// NOTE: This fixes problem of CSS not being injected into document if using secondary google account.
var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.extension.getURL('css/linenumbering.css');
(document.head || document.documentElement).appendChild(style);

// Variable used to switch between regular numbering and right-sided numbering
var numberlineClass = "numbered";

//**********//
//INITIALIZE//
//**********//

// Default Values
var everyXLine = 5;
var numberHeaderFooter = false;
var numberBlankLines = false;
var numberParagraphsOnly = true;
var newPageCountReset = false;
var lineBorder = false;

chrome.runtime.sendMessage({
  for: "storage",
  action: "getSettings"
});

//
// CHECKS IF EXTENSION IS ENABLED TO RUN ALL NECESSARY COMMAND //
//
chrome.storage.local.get(["enabled"], function (result) {
  if (result["enabled"] == true) {
    // Update times used number
    chrome.storage.local.get(["timesUsed"], function (result) {
      var timesUsed;
      if (
        parseInt(result["timesUsed"]) != result["timesUsed"] ||
        result["timesUsed"] == null
      ) {
        timesUsed = 1;
      } else {
        timesUsed = parseInt(result["timesUsed"]) + 1;
      }
      chrome.storage.local.set(
        {
          timesUsed: timesUsed
        },
        function () {
          console.log("timesUsed value updated to " + timesUsed);
          refresh();
        }
      );
      if (timesUsed == 88) {
        // TODO: Run popup asking to rate the extension
      }
    });

    updateEveryXLine();
    updateNumberBlankLines();
    updateNumberHeaderFooter();
    updateNumberParagraphsOnly();
    updateLineBorder();
    updateRightNumbering();
    // Number lines
    numberLines();
  }
});

function updateEveryXLine() {
  chrome.storage.local.get(["everyXLine"], function (result) {
    //update everyXLine value if change
    if (result["everyXLine"] > 0 && result["everyXLine"] <= 100) {
      everyXLine = result["everyXLine"];
    } else {
      everyXLine = 5;
    }
    console.log("Updated everyXLine to " + everyXLine);
  });
}

function updateNumberBlankLines() {
  chrome.storage.local.get(["numberBlankLines"], function (result) {
    //update everyXLine value if change
    if (result["numberBlankLines"]) {
      numberBlankLines = result["numberBlankLines"];
    } else {
      numberBlankLines = false;
    }
    console.log("Updated numberHeaderFooter to " + numberHeaderFooter);
  });
}

function updateNumberHeaderFooter() {
  chrome.storage.local.get(["numberHeaderFooter"], function (result) {
    //update everyXLine value if change
    if (result["numberHeaderFooter"]) {
      numberHeaderFooter = result["numberHeaderFooter"];
    } else {
      numberHeaderFooter = false;
    }
    console.log("Updated numberHeaderFooter to " + numberHeaderFooter);
  });
}

function updateNumberParagraphsOnly() {
  chrome.storage.local.get(["numberParagraphsOnly"], function (result) {
    //update everyXLine value if change
    if (result["numberParagraphsOnly"]) {
      numberParagraphsOnly = result["numberParagraphsOnly"];
    } else {
      numberParagraphsOnly = false;
    }
    console.log("Updated numberParagraphsOnly to " + numberParagraphsOnly);
  });
}

function updateNewPageCountReset() {
  chrome.storage.local.get(["newPageCountReset"], function (result) {
    // update newPageCountReset value if change
    if (result["newPageCountReset"]) {
      newPageCountReset = result["newPageCountReset"];
    } else {
      newPageCountReset = false;
    }
    console.log("Updated updateNewPageCountReset to " + numberParagraphsOnly);
  });
}

function updateLineBorder() {
  chrome.storage.local.get(["lineBorder"], function (result) {
    // update lineBorder value if change
    if (result["lineBorder"]) {
      lineBorder = result["lineBorder"];
    } else {
      lineBorder = false;
    }
    console.log("Updated lineBorder to " + lineBorder);
    // Add or remove line border
    if (lineBorder) {
      $("body").addClass("text-border");
    } else {
      $("body").removeClass("text-border");
    }
  });
}

function updateRightNumbering() {
  chrome.storage.local.get(["rightNumbering"], function (result) {
    // update rightNumbering value if change
    if (result["rightNumbering"]) {
      rightNumbering = result["rightNumbering"];
    } else {
      rightNumbering = false;
    }
    console.log("Updated rightNumbering to " + rightNumbering);

    if (rightNumbering) {
      numberlineClass = "numbered right";
      $(".numbered")
        .addClass("right");
    } else {
      numberlineClass = "numbered";
      $(".numbered")
        .removeClass("right");
    }
  });
}

var ln = 0;

function numberLine($lineview) {
  if (
    !numberHeaderFooter &&
    ($lineview.closest(".kix-page-header").length > 0 ||
      $lineview.closest(".kix-page-bottom").length > 0)
  ) {
    // Header/Footer?
    return false;
  } else if (
    $lineview.closest(".kix-paginated-footnoteview").length > 0
  ) {
    // Footnote
    return false;
  } else if (
    !numberBlankLines &&
    $lineview
      .find("span.kix-wordhtmlgenerator-word-node")
      .text()
      .replace(/\u200C|\s/g, "") === "" // \u200C is the encoding for &zwnj;
  ) {
    // Blank line?
    return false;
  } else if (numberParagraphsOnly && $lineview.parent().attr("id")) {
    if (
      $lineview
        .parent()
        .attr("id")
        .replace(/\.[^]*/, "") === "h"
    ) {
      // Not pragraph?
      return false;
    }
  } else if ($lineview.parents(".kix-tablerenderer").length) {
    // Part of table
    return false;
  }

  return true;
}

function numberLines() {
  console.log("Numbering lines every " + everyXLine + " line(s).");
  if (newPageCountReset) {
    $("body")
      .find(".kix-page")
      .each(function () {
        var lines = $(this).find(".kix-lineview-text-block");
        numberSelectedLines(lines);
      });
  } else {
    var lines = $("body").find(".kix-lineview-text-block"); //.filter(':parents(.kix-tablerenderer)');
    numberSelectedLines(lines);
  }
}

// Tweak this to add extra padding between numbers and text
var lnWidth = 36;

function numberSelectedLines(lines) {
  // lines should be an array of found elements to number
  ln = 0;
  // TODO: This should allow easy implementation of selection of were to start and stop line numbering
  lines.each(function () {
    var numberThisLine = numberLine($(this));
    if (numberThisLine) ln++;
    if (ln % everyXLine === 0 && numberThisLine) {
      var parent = $(this).parents('.kix-lineview').first()[0];
      var offset = parent.getBoundingClientRect().x - $(this)[0].getBoundingClientRect().x - lnWidth;

      $(this)
        .addClass(numberlineClass)
        .attr("ln-number", ln);

      $(this)[0].style.setProperty("--ln-offset", `${offset}px`);
      $(this)[0].style.setProperty("--ln-width", `${lnWidth}px`)

      console.log($(this));
    } else {
      $(this).removeClass("numbered right");
    }
  });
}

//*****************//
//REFRESH or UPDATE//
//*****************//

function refresh() {
  $(".numbered").removeClass("numbered");
  $(".numbered.right")
    .removeClass("numbered")
    .removeClass("right");
  chrome.storage.local.get(["enabled"], function (result) {
    if (result["enabled"] == true) {
      //If extension still enabled
      updateEveryXLine();
      updateNumberHeaderFooter();
      updateNumberBlankLines();
      updateNumberParagraphsOnly();
      updateNewPageCountReset();
      updateLineBorder();
      updateRightNumbering();

      numberLines();
    }
  });
}

//Refresh on load to show pages
refresh();

// function autorefresh() {
//   chrome.storage.local.get(["enabled"], function (result) {
//     if (result["enabled"] == true) {
//       numberLines();
//     }
//   });
// }

// setInterval(function () {
//   autorefresh();
// }, 1000);

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  // Validate the message's structure
  if (msg.from === "popup" && msg.subject === "refresh") {
    //Run when popup notifies of a refresh
    console.log("Force refresh requested");
    refresh();
  }
});

//************************//
//SELECTION LINE NUMBERING//
//************************//

//TODO: Allow numbering lines from selection
