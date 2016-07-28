//**********//
//INITIALIZE//
//**********//

var everyXLine = 5;
// TODO: Add to storage
var numberHeaderFooter = false;

function updateEveryXLine() {
	chrome.storage.local.get( [ "everyXLine" ], function( result ) {
		//update everyXLine value if change
		if ( result[ "everyXLine" ] > 0 && result[ "everyXLine" ] <= 100 ) {
			everyXLine = result[ "everyXLine" ];
		} else {
			everyXLine = 5;
		}
		console.log( "Updated everyXLine to " + everyXLine );
	} );
}
updateEveryXLine();

function updateNumberHeaderFooter() {
	chrome.storage.local.get( [ "numberHeaderFooter" ], function( result ) {
		//update everyXLine value if change
		if ( result[ "numberHeaderFooter" ] ) {
			numberHeaderFooter = result[ "numberHeaderFooter" ];
		} else {
			numberHeaderFooter = false;
		}
		console.log( "Updated numberHeaderFooter to " + numberHeaderFooter );
	} );
}
updateNumberHeaderFooter();

// var lineCount = $(".kix-lineview").length;
var ln = 0;

function numberLines() {
	ln = 0;
	// console.log( "Numbering lines every " + everyXLine + " line(s)." );
	$( 'body' ).find( ".kix-lineview" ).each( function() {
		ln++;
		if ( ln % everyXLine === 0 ) {
			if ( !numberHeaderFooter && ( $( this ).closest( ".kix-page-header" ).length > 0 || $( this ).closest( ".kix-page-bottom" ).length > 0 ) ) {
				ln--;
				$( this ).removeClass( "numbered" );
			} else {
				$( this ).addClass( "numbered" ).attr( "ln-number", ln );
			}
		} else {
			$( this ).removeClass( "numbered" );
		}
	} );
}

chrome.storage.local.get( [ "enabled" ], function( result ) {
	if ( result[ "enabled" ] == true ) {
		numberLines();
	}
} );

//*****************//
//REFRESH or UPDATE//
//*****************//

function refresh() {
	$( ".numbered" ).removeClass( "numbered" );
	chrome.storage.local.get( [ "enabled" ], function( result ) {
		if ( result[ "enabled" ] == true ) {
			//If extension still enabled
			updateEveryXLine();
			updateNumberHeaderFooter();

			numberLines();
		}
	} );
}

//Refresh on load to show pages
refresh();

function autorefresh() {
	chrome.storage.local.get( [ "enabled" ], function( result ) {
		if ( result[ "enabled" ] == true ) {
			numberLines();
		}
	} );
}

setInterval( function() {
	autorefresh();
}, 1000 );

// Listen for messages from the popup
chrome.runtime.onMessage.addListener( function( msg, sender, response ) {
	// Validate the message's structure
	if ( ( msg.from === 'popup' ) && ( msg.subject === 'refresh' ) ) {
		//Run when popup notifies of a refresh
		console.log( "Force refresh requested" );
		refresh();
	}
} );


//************************//
//SELECTION LINE NUMBERING//
//************************//

//TODO: Allow numbering lines from selection
