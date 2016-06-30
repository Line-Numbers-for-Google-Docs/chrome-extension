//**********//
//INITIALIZE//
//**********//

var everyXLine = 5

chrome.storage.local.get(["everyXLine"], function (result) {
  //update everyXLine value if change
  if (result["everyXLine"] != null && result["everyXLine"] > 0 && result["everyXLine"] <= 100) {
    everyXLine = result["everyXLine"];
  }
});

// var lineCount = $(".kix-lineview").length;
var ln = 0;

function numberLines() {
  ln = 0
  console.log("Numbering lines every " + everyXLine + " line(s).");
  $('body').find(".kix-lineview").each(function() {
    ln++;
    if (ln%everyXLine === 0) {
      $(this).addClass("numbered").attr("ln-number", ln);
    }
  });
}

chrome.storage.local.get(["enabled"], function (result) {
  if (result["enabled"] == true) {
    numberLines();
  }
});

//*****************//
//REFRESH or UPDATE//
//*****************//

function refresh() {
  $(".numbered").removeClass("numbered");
  chrome.storage.local.get(["enabled"], function (result) {
    if (result["enabled"] == true) {
      //If extension still enabled
      chrome.storage.local.get(["everyXLine"], function (result) {
        //update everyXLine value if change
        if (result["everyXLine"] == null || result["everyXLine"] < 1 || result["everyXLine"] > 100) {
          everyXLine = 5;
          numberLines();
        } else {
          everyXLine = result["everyXLine"];
          console.log("Updated everyXLine to " + everyXLine);
          numberLines();
        }
      });
    }
  });
}

//Refresh on load to show pages
refresh();

function autorefresh(){
  chrome.storage.local.get(["enabled"], function (result) {
    if (result["enabled"] == true) {
      ln = 0
      $('body').find(".kix-lineview").each(function() {
        ln++;
        if (ln%everyXLine === 0) {
          $(this).addClass("numbered").attr("ln-number", ln);
        } else {
          $(this).removeClass("numbered");
        }
      });
    }
  });
}

setInterval(function(){autorefresh();}, 1000);

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  // Validate the message's structure
  if ((msg.from === 'popup') && (msg.subject === 'refresh')) {
    //Run when popup notifies of a refresh
    console.log("Force refresh requested");
    refresh();
  }
});


//************************//
//SELECTION LINE NUMBERING//
//************************//

//TODO: Allow numbering lines from selection
