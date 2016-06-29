var everyXLine = 5;
var index = 0;
var lineCount = $(".kix-lineview").length;

alert(lineCount);

function numberLines() {
  $(".kix-lineview").each(function() {
    index++;
    if (index%everyXLine === 0) {
      $(this).addClass("numbered");
    }
  });
}

numberLines();

//Update line count if change
function updateLineCount() {

}
setInterval(updateLineCount(), 1000);