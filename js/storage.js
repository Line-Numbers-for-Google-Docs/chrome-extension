//Define default values
var defaults = {
	everyXLine: 5,
	numberHeaderFooter: false,
	numberBlankLines: false,
	numberParagraphsOnly: true,
	newPageCountReset: false
};

var settingValues = Object.keys( defaults );

// ******************* //
// INITIALIZE DATABASE //
// ******************* //

var db = new Dexie( 'settings' );

db.version( 1 ).stores( {
	docSettings: 'docID, settings',
} );

// Open the database
db.open().catch( function( error ) {
	alert( 'Uh oh... IndexedDB error : ' + error );
} );

// ****************** //
// DATABASE FUNCTIONS //
// ****************** //

function saveSetting( docID, setting, value ) {
	db.docSettings
		.get( docID )
		.then( function( data ) {

			if ( data === undefined ) {
				// if doc has no data already saved
				newData = '{"docID": "' + docID + '", "settings": {"' + setting + '": "' + value + '"}}';
				newData = JSON.parse( newData );
				db.docSettings.add( newData );

			} else {
				// if doc already has saved data
				var newSettings = '{';
				var dataAdded = false;
				for ( var i = 1; i < data.settings.length; i++ ) {
					if ( data.settings[ i - 1 ].key !== setting ) {
						newSettings += data.settings[ i - 1 ];
					} else {
						// if setting being set already has value
						newSettings += '"' + setting + '": "' + value + '"';
						dataAdded = true;
					}
				}
				if ( !dataAdded ) {
					newSettings += '"' + setting + '": "' + value + '"';
				}
				newSettings += '}';
				newSettings = JSON.parse( newSettings );
				db.docSettings.put( {
					docID: docID,
					settings: newSettings
				} );
			}
		} );
}

function getSettings( docID ) {
	db.docSettings
		.get( docID )
		.then( function( data ) {
			if ( data === undefined ) {
				return defaults;
			} else {
				var settings = {};
				var setValues = Object.keys( data.settings );
				var found;
				for ( var i = 0; i < settingValues.length; i++ ) {
					found = false;
					for ( var n = 0; n < setValues.length; n++ ) {
						if ( setValues[ n ] === settingValues[ i ] ) {
							settings[ setValues[ n ] ] = data.settings[ setValues[ n ] ];
							found = true;
						}
					}
					if ( !found ) {
						settings[ settingValues[ i ] ] = defaults[ settingValues[ i ] ];
					}
				}
				console.log( settings );
				return settings;
			}
		} );
}

// getSettings( "4" );

function parseDocID( url ) {
	// regex parse
	url = url.match( /d\/.+\// )[ 0 ]; // => d/docID/
	docID = "";
	for ( i = 2; i < url.length - 1; i++ ) {
		docID += url[ i ];
	}
	return docID;
}

// MESSAGE PROCCESSING //
chrome.runtime.onMessage.addListener( function( msg, sender, sendResponse ) {
	if ( msg.for === 'storage' ) {
		var docID;
		if ( msg.action === 'saveSettings' && msg.setting !== null && msg.value !== null ) {
			docID = parseDocID( sender.url );
			sendResponse( saveSettings( docID, msg.setting, msg.value ) );
		} else if ( msg.action === 'getSettings' ) {
			docID = parseDocID( sender.url );
			sendResponse( getSettings( docID ) );
		}
	}
} );
