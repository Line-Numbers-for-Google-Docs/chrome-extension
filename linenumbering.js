// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  // First, validate the message's structure
  if ((msg.from === 'popup') && (msg.subject === 'refresh')) {
    // Collect the necessary data 
    // (For your specific requirements `document.querySelectorAll(...)`
    //  should be equivalent to jquery's `$(...)`)
    alert("Refresh");

    // Directly respond to the sender (popup), 
    // through the specified callback */
    // response(domInfo);
  }
});


var everyXLine = 5;
var lineCount = $(".kix-lineview").length;
var index = 0;

function numberLines() {
  index = 0
  $('body').css({'counter-reset':'ln'});
  $('body').find(".kix-lineview").each(function() {
    index++;
    if (index%everyXLine === 0) {
      $(this).addClass("numbered");
    }
  });
}

numberLines();

//Update line count if change
setInterval(function(){
  if (lineCount != $(".kix-lineview").length) {
    alert("running");
    $(".numbered").removeClass("numbered");
    numberLines();
    lineCount = $(".kix-lineview").length;
  }
}, 1000);