// A Database

var db = new Dexie( 'settings' );

// Define a schema
db.version( 1 ).stores( {
	mainSettings: 'option, value',
	docSettings: 'doc_id, option, value',
} );


// Open the database
db.open().catch( function( error ) {
	alert( 'Uh oh... IndexedDB error : ' + error );
} );

console.log( roughSizeOfObject( db ) );
