var db = new Dexie( 'settings' );

db.version( 1 ).stores( {
	defaultSettings: 'option, value',
	docSettings: 'docID, options',
} );

// Open the database
db.open().catch( function( error ) {
	alert( 'Uh oh... IndexedDB error : ' + error );
} );

// Set all default values
var defaultValues = [ {
	option: "everyXLine",
	value: 5
}, {
	option: "numberblankLines",
	value: false
}, {
	option: "numberParagraphsOnly",
	value: true
}, {
	option: "numberHeaderFooter",
	value: false
}, {
	option: "numberBlankLines",
	value: false
} ];

db.defaultSettings.bulkAdd( defaultValues );
db.defaultSettings.bulkPut( defaultValues );

function defaultSetting() {
	db.defaultSettings
		.get( "numberBlankLines" )
		.then( function( settings ) {
			console.log( settings );
			return settings;
		} );
}

console.log( defaultSetting() ); // TODO: Make this not return undefined
