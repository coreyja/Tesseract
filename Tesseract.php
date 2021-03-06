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
	// $input will most likely be null since we will use the self closing XML tag

	// Create a string to return as the HTML
	$toReturn = "";

	// Add the conditional IE import to the return string
	$toReturn .= '<!--[if IE]><script type="text/javascript" src="//cdn.jsdelivr.net/excanvas/r3/excanvas.compiled.js"></script><![endif]-->';

	// Add the css import for Tesseract styling
	$toReturn .= '<link rel="stylesheet" href="/extensions/Tesseract/css/style.css">';

    $toReturn .= '<h2>Tesseract</h2>';

	if ($args['isconcept'] == "true") {
	    $toReturn .= '<canvas id="Tesseract" width="1000" height="600" ></canvas>';
	} else {
	    // Add the tabs that go on top of the Tesseract
        $toReturn .= '<ul class="tabs"><li class="tab active"><a href="#" id="showCourses">Show Courses</a></li><li class="tab"><a href="#" id="showConcepts">Show Concepts</a></li></ul>';

        // Add the actual Canvas that the Tesseract will display inside
        $toReturn .= '<canvas id="TesseractCourse" width="1000" height="600"></canvas>';
        $toReturn .= '<canvas id="TesseractConcept" width="1000" height="600" style="display: none;"></canvas>';
	}

	foreach( $args as $name => $value ) {
		$toReturn .= '<script>' . htmlspecialchars( $name ). ' = "' . htmlspecialchars( $value ) . '";</script>';
	}

	// Put the title as the course number for js to read.
	$toReturn .= '<script> pageTitle = "' . $parser->getTitle() . '";</script>';

    // Add the Promises Polyfill
    $toReturn .= '<script src="http://s3.amazonaws.com/es6-promises/promise-0.1.1.min.js"></script>';

	// Add the js import for the Tesseract
	$toReturn .= '<script src="/extensions/Tesseract/js/arbor.js"></script><script src="/extensions/Tesseract/js/graphics.js"></script><script src="/extensions/Tesseract/js/renderer.js"></script><script src="/extensions/Tesseract/js/Tesseract.js"></script><script src="/extensions/Tesseract/js/main.js"></script>';

	return $toReturn;
}


?>