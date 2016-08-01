$( document ).ready( function() {

	//**********//
	//INITIALIZE//
	//**********//

	$( ".show-more-options" ).click( function() {
		if ( $( "#more-options" ).hasClass( "closed" ) ) {
			$( "#more-options" ).show();
			$( "#more-options" ).removeClass( "closed" );
			$( ".show-more-options" ).text( "Hide More Options" );
		} else {
			$( "#more-options" ).hide();
			$( "#more-options" ).addClass( "closed" );
			$( ".show-more-options" ).text( "Show More Options" );
		}
	} );

	//Set all saved values
	chrome.storage.local.get( [ "enabled" ], function( result ) {

		if ( result[ "enabled" ] !== false ) {
			//if no data saved for enabled (ex: result["enabled"] == null) by default or saved to true
			$( "#enabled" ).attr( 'checked', 'checked' );
		}

	} );

	function setEveryXLineInput() {
		chrome.storage.local.get( [ "everyXLine" ], function( result ) {

			if ( result[ "everyXLine" ] == null || result[ "everyXLine" ] < 1 ) {
				//if no data saved saved set default to 5
				$( "#everyXLine" ).val( "5" );
			} else {
				//set to saved value
				$( "#everyXLine" ).val( result[ "everyXLine" ] );
			}

		} );
	}
	setEveryXLineInput();

	chrome.storage.local.get( [ "numberBlancLines" ], function( result ) {
		if ( result[ "numberBlancLines" ] ) {
			$( "#number-blanc-lines" ).attr( 'checked', 'checked' );
		}
	} );

	chrome.storage.local.get( [ "numberParagraphsOnly" ], function( result ) {
		if ( result[ "numberParagraphsOnly" ] !== false ) {
			$( "#number-paragraphs-only" ).attr( 'checked', 'checked' );
		}
	} );

	chrome.storage.local.get( [ "numberHeaderFooter" ], function( result ) {
		if ( result[ "numberHeaderFooter" ] ) {
			$( "#number-header-footer" ).attr( 'checked', 'checked' );
		}
	} );

	chrome.tabs.query( {
		active: true,
		lastFocusedWindow: true,
		url: "*://docs.google.com/document/d/*"
	}, function( tabs ) {
		if ( tabs.length == 0 ) {
			$( ".onDocumentShow" ).hide();
			$( ".offDocumentShow" ).show();
		}
	} );

	//**********************************************//
	//REFRESH GDOCS LINE NUMBERING WITH NEW SETTINGS//
	//**********************************************//

	function refresh() {
		chrome.tabs.query( {
			url: "*://docs.google.com/document/d/*"
		}, function( tabs ) {
			for ( var i = 0; i < tabs.length; i++ ) {
				chrome.tabs.sendMessage(
					tabs[ i ].id, {
						from: 'popup',
						subject: 'refresh'
					},
					function( response ) {
						console.log( 'GDocs Line Numbering Refreshed' );
					} );
			}
		} );
	}

	$( "#refresh" ).click( function() {
		refresh();
	} );

	$( "#reloadpage" ).click( function() {
		chrome.tabs.query( {
			url: "*://docs.google.com/document/d/*"
		}, function( tabs ) {
			for ( var i = 0; i < tabs.length; i++ ) {
				chrome.tabs.reload( tabs[ i ].id );
			}
		} );
	} );


	//********************************//
	//EXTENSION SETTINGS MODIFICATIONS//
	//********************************//

	function getCurrentPageUrl() {
		chrome.tabs.query( {
			active: true,
			lastFocusedWindow: true
		}, function( tabs ) {
			return tabs[ 0 ].url;
		} );
	}

	$( "#enabled" ).change( function() {
		//Save enabled boolean
		chrome.storage.local.set( {
			"enabled": $( "#enabled" ).is( ':checked' )
		}, function() {
			console.log( 'enabled value saved locally.' );
			refresh();
		} );
	} );

	$( "#number-blanc-lines" ).change( function() {
		//Save enabled boolean
		chrome.storage.local.set( {
			"numberBlancLines": $( "#number-blanc-lines" ).is( ':checked' )
		}, function() {
			console.log( 'numberBlancLines value saved locally.' );
			refresh();
		} );
	} );

	$( "#number-header-footer" ).change( function() {
		//Save enabled boolean
		chrome.storage.local.set( {
			"numberHeaderFooter": $( "#number-header-footer" ).is( ':checked' )
		}, function() {
			console.log( 'numberHeaderFooter value saved locally.' );
			refresh();
		} );
	} );

	$( "#number-paragraphs-only" ).change( function() {
		//Save enabled boolean
		chrome.storage.local.set( {
			"numberParagraphsOnly": $( "#number-paragraphs-only" ).is( ':checked' )
		}, function() {
			console.log( 'numberParagraphsOnly value saved locally.' );
			refresh();
		} );
	} );

	$( "#everyXLine" ).change( function() {
		//Save everyXLine value
		if ( $( "#everyXLine" ).val() > 0 ) {
			chrome.storage.local.set( {
				"everyXLine": $( "#everyXLine" ).val()
			}, function() {
				console.log( 'everyXLine value saved locally.' );
				refresh();
			} );
		} else {
			setEveryXLineInput();
		}
	} );

} );

//****************//
//GOOGLE ANALYTICS//
//****************//

var _gaq = _gaq || [];
_gaq.push( [ '_setAccount', 'UA-44179721-6' ] );
_gaq.push( [ '_trackPageview' ] );

( function() {
	var ga = document.createElement( 'script' );
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName( 'script' )[ 0 ];
	s.parentNode.insertBefore( ga, s );
} )();
