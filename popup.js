$(document).ready(function(){

  //INITIALIZE
  //Set all saved values
  chrome.storage.local.get(["enabled"], function (result) {
    console.log(JSON.stringify(result));
    if (result["enabled"] == false) {
      //if no data saved for enabled keep default html unchecked
    } else {
      //if no data saved for enabled (result["enabled"] == null) by default or saved to true
      $("#enabled").attr('checked', 'checked');
    }
  });
  chrome.storage.local.get(["everyXLine"], function (result) {
    console.log(JSON.stringify(result));
    if (result["everyXLine"] == null || result["everyXLine"] < 1 || result["everyXLine"] > 100) {
      //if no data saved saved set default to 5
      $("#everyXLine").val("5");
    } else {
      //set to saved value
      $("#everyXLine").val( result["everyXLine"] );
    }
  });

  //EXTENSION SETTINGS MODIFICATIONS
  $("#enabled").change(function(){
    //Save enabled boolean
    chrome.storage.local.set({ "enabled": $("#enabled").is(':checked') }, function(){
      console.log('Data saved locally.');
    });
  });

  $("#everyXLine").change(function(){
    //Save everyXLine value
    if ($("#everyXLine").val() > 0 && $("#everyXLine").val() <= 100){
      chrome.storage.local.set({ "everyXLine": $("#everyXLine").val() }, function(){
        console.log('Data saved locally.');
      });
    }
  });

  //REFRESH GDOCS LINE NUMBERING WITH NEW SETTINGS
  function refresh(){
    chrome.tabs.query({
      url: "*://docs.google.com/document/d/*"
    }, function(tabs) {
      for (var i = 0; i < tabs.length; i++) {
        chrome.tabs.sendMessage(
          tabs[i].id, 
          {from: 'popup', subject: 'refresh'}, 
        function(response) {
          console.log('GDocs Line Numbering Refreshed');
        });
      }
    });
  }

  $("#refresh").click(function(){
    refresh();
  });

});