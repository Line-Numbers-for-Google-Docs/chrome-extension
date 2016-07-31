//**********//
//INITIALIZE//
//**********//

// Default Values
var everyXLine = 5;
var numberHeaderFooter = false;
var numberBlancLines = false;
var numberParagraphsOnly = true;

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

function updateNumberBlancLines() {
	chrome.storage.local.get( [ "numberBlancLines" ], function( result ) {
		//update everyXLine value if change
		if ( result[ "numberBlancLines" ] ) {
			numberHeaderFooter = result[ "numberBlancLines" ];
		} else {
			numberBlancLines = false;
		}
		console.log( "Updated numberHeaderFooter to " + numberHeaderFooter );
	} );
}
updateNumberBlancLines();

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

function updateNumberParagraphsOnly() {
	chrome.storage.local.get( [ "numberParagraphsOnly" ], function( result ) {
		//update everyXLine value if change
		if ( result[ "numberParagraphsOnly" ] ) {
			numberParagraphsOnly = result[ "numberParagraphsOnly" ];
		} else {
			numberParagraphsOnly = false;
		}
		console.log( "Updated numberParagraphsOnly to " + numberParagraphsOnly );
	} );
}
updateNumberParagraphsOnly();

// var lineCount = $(".kix-lineview").length;
var ln = 0;

function numberLine( $lineview ) {
	if ( !numberHeaderFooter && ( $lineview.closest( ".kix-page-header" ).length > 0 || $lineview.closest( ".kix-page-bottom" ).length > 0 ) ) {
		// Header Footer?
		return false;
	} else if ( !numberBlancLines && $lineview.find( "span.kix-wordhtmlgenerator-word-node" ).text().replace( /\s/g, "" ) === "" ) {
		// Blanc Lines?
		return false;
	} else if ( numberParagraphsOnly && $lineview.parent().attr( "id" ) !== undefined ) {
		if ( $lineview.parent().attr( "id" ).replace( /\.[^]*/, "" ) === "h" ) {
			// Not Pragraph?
			return false;
		}
	}

	return true;
}

function numberLines() {
	ln = 0;
	// console.log( "Numbering lines every " + everyXLine + " line(s)." );
	$( 'body' ).find( ".kix-lineview" ).each( function() {
		var numberThisLine = numberLine( $( this ) );
		if ( numberThisLine ) ln++;
		if ( ln % everyXLine === 0 && numberThisLine ) {
			$( this ).addClass( "numbered" ).attr( "ln-number", ln );
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
			updateNumberBlancLines();
			updateNumberParagraphsOnly();

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
