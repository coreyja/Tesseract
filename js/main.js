jQuery(function($) {

	var width = $('canvas').parent().outerWidth()
	$('canvas').attr('width', width);

    if (typeof isconcept !== 'undefined') {
        var t = Tesseract('#Tesseract');
        t.addConceptPrereqTree(pageTitle).then(t.showArborJSGraph);
    } else {
        var courseTess = Tesseract('#TesseractCourse');
        courseTess.addCoursePrereqTree(pageTitle).then(courseTess.showArborJSGraph);
        $('a#showCourses').click(function () {
            $('a#showCourses').parent().addClass('active');
            $('a#showConcepts').parent().removeClass('active');

            $('canvas#TesseractCourse').show();
            $('canvas#TesseractConcept').hide();

            return false;
        });

        var conceptTess = Tesseract('#TesseractConcept');
        conceptTess.addCourseConceptGraph(pageTitle).then(conceptTess.showArborJSGraph);
        $('a#showConcepts').click(function () {

            $('a#showCourses').parent().removeClass('active');
            $('a#showConcepts').parent().addClass('active');

            $('canvas#TesseractCourse').hide();
            $('canvas#TesseractConcept').show();

            return false;
        });
    }

	


});