<?php
/*
 * Tesseract Extension
 * By: CSSE 374 Team 5
 *
 * This extension adds an XML tag which adds the Tesseract to the current page,
 * with the settings specified by the user.
 */
 
$wgHooks['ParserFirstCallInit'][] = 'TesseractParserInit';
 
// Hook our callback function into the parser
function TesseractParserInit( Parser $parser ) {
	// When the parser sees the <sample> tag, it executes 
	// the wfSampleRender function (see below)
	$parser->setHook( 'tesseract', 'TesseractRender' );

    // Always return true from this function. The return value does not denote
    // success or otherwise have meaning - it just must always be true.
	return true;
}
 
// Execute 
function TesseractRender( $input, array $args, Parser $parser, PPFrame $frame ) {

	// Nothing exciting here, just escape the user-provided
	// input and throw it back out again
	return htmlspecialchars( $input . 'TESSERACT!!!!' );
}


?>