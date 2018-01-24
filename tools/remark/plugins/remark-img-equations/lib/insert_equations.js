'use strict';

// MODULES //

var logger = require( 'debug' );
var createElement = require( '@stdlib/_tools/markdown/img-svg-equation' );


// VARIABLES //

var debug = logger( 'remark-img-equations:insert_equations' );
var EQN_START = /<!-- <equation.*> -->/;
var EQN_END = /<!-- <\/equation> -->/;
var LABEL = /label="([^"]*)"/;
var ALT = /alt="([^"]*)"/;
var RAW = /raw="([^"]*)"/;


// MAIN //

/**
* Inserts an image equation element into a Markdown AST.
*
* @private
* @param {Node} node - reference node
* @param {number} index - position of `node` in `parent`
* @param {Node} parent - parent of `node`
* @throws {Error} equation comments must have a valid label
* @throws {Error} equation comments must have valid alternate text
* @throws {Error} equation comments must have valid raw equation text
* @throws {Error} equation comments must have starting and ending comments
*/
function insertEquations( node, index, parent ) {
	var newNode;
	var label;
	var html;
	var opts;
	var alt;
	var raw;

	if ( EQN_START.test( node.value ) === true ) {
		debug( 'Found an equation...' );

		label = LABEL.exec( node.value );
		if ( label === null ) {
			debug( 'Invalid node: %s', node.value );
			throw new Error( 'invalid node. Equation comments must have a valid label. Node: '+node.value+'.' );
		}
		label = label[ 1 ];
		debug( 'Label: %s', label );

		alt = ALT.exec( node.value );
		if ( alt === null ) {
			debug( 'Invalid node: %s', node.value );
			throw new Error( 'invalid node. Equation comments must have valid alternate text. Node: '+node.value+'.' );
		}
		alt = alt[ 1 ];
		debug( 'Alternate text: %s', alt );

		raw = RAW.exec( node.value );
		if ( raw === null ) {
			debug( 'Invalid node: %s', node.value );
			throw new Error( 'invalid node. Equation comments must have valid raw equation text. Node: '+node.value+'.' );
		}
		raw = raw[ 1 ];
		debug( 'Raw equation: %s', raw );

		opts = {
			'label': label,
			'raw': raw,
			'alt': alt
		};
		html = createElement( opts );
		debug( 'Generated HTML: %s', html );

		newNode = {
			'type': 'html',
			'value': html
		};

		// Case 1: insert new node between equation tags...
		if ( EQN_END.test( parent.children[ index+1 ].value ) ) {
			debug( 'Inserting new node...' );
			parent.children.splice( index+1, 0, newNode );
		}
		// Case 2: replace existing node...
		else if ( EQN_END.test( parent.children[ index+2 ].value ) ) {
			debug( 'Replacing existing node...' );
			parent.children[ index+1 ] = newNode;
		}
		else {
			debug( 'Invalid node: %s', node.value );
			throw new Error( 'invalid node. Invalid equation comment. Ensure that the Markdown file includes both starting and ending equation comments. Node: `' + node.value + '`.' );
		}
	}
}


// EXPORTS //

module.exports = insertEquations;
