getDepartmentColor = function(dep) {

	if (dep === "Major in Computer Science"){
		dep = 'Computer Science'
	}

	var colors = {
		"Computer Science": "red",
		"Mathematics": "blue",
		"Mechanical Engineering": "green"
	};

	return colors[dep];

};

getAndDisplayCourses = function() {
	$.ajax({
		url: '/api.php',
		data: {
			'action': 'ask',
			'query': '[[Category:Courses]]|?Has courses|?Has departments',
			'format': 'json',
		},
		success: function(data) {


			var sys = arbor.ParticleSystem(1000, 400, 0.5);
			sys.parameters({gravity:true});
			sys.renderer = Renderer("#tesseract");

			data = data['query']['results'];

			var nodeData = {
				nodes: {},
				edges: {},
			};

			for (course in data) {

				$.ajax({
					url: '/api.php',
				});

				prereqs = data[course]['printouts']['Has courses'];
				dep = data[course]['printouts']['Has departments'][0]['fulltext'];

				output = [];

				nodeData['nodes'][course] = {
					color: getDepartmentColor(dep),
					shape: 'IDontWantAFuckingDot',
					label: course,
					link: data[course]['fullurl'],
				};

				for (i = 0; i < prereqs.length; i++){
					if (prereqs[i]['fulltext'] == '') {
						continue;
					}
					nodeData['edges'][course] = {};
					nodeData['edges'][course][prereqs[i]['fulltext']] = {
						directed: true,
						color: "#000",
					};
				}

			}

			sys.graft(nodeData);



		},
	});
}

var started = 0;

nodeData = {
	nodes: {},
	edges: {},
};

getAndDisplayPrereqTree = function (course) {
	started++;

	$.ajax({
		url: '/api.php',
		data: {
			'action': 'ask',
			'query': '[[Category:Courses]][[Course Number::~' +  course + ']]|?Has prerequisites|?Has corequisites|?Has departments',
			'format': 'json',
		},
		success: function(data) {

			data = data['query']['results'];

			for (course in data) {

				prereqs = data[course]['printouts']['Has prerequisites'];
				coreqs = data[course]['printouts']['Has corequisites'];
				dep = data[course]['printouts']['Has departments'][0]['fulltext'];

				output = [];

				nodeData['nodes'][course] = {
					color: getDepartmentColor(dep),
					shape: 'IDontWantAFuckingDot',
					label: course,
					link: data[course]['fullurl'],
				};

				for (i = 0; i < prereqs.length; i++){
					if (prereqs[i]['fulltext'] == '') {
						continue;
					}

					if (! (prereqs[i]['fulltext'] in nodeData['nodes'])){
						console.log('Recurze');
						getAndDisplayPrereqTree(prereqs[i]['fulltext']);
					}
					

					nodeData['edges'][course] = {};
					nodeData['edges'][course][prereqs[i]['fulltext']] = {
						directed: true,
						color: "#000",
					};
				}

				for (i = 0; i < coreqs.length; i++){
					if (coreqs[i]['fulltext'] == '') {
						continue;
					}

					if (! (coreqs[i]['fulltext'] in nodeData['nodes'])){
						console.log('Recurze');
						getAndDisplayPrereqTree(coreqs[i]['fulltext']);
					}
					

					nodeData['edges'][course] = {};
					nodeData['edges'][course][coreqs[i]['fulltext']] = {
						directed: true,
						color: "#088e00",
					};
				}

			}

			started--;

			if (started === 0) {
				var sys = arbor.ParticleSystem(1000, 400, 0.5);
				if (Object.keys(nodeData['nodes']).length === 1) {
				   //Stop single nodes bouncing all over the place
				   sys.parameters({ friction: '1.0' });
				}
				sys.renderer = Renderer("#tesseractCourse");

				sys.graft(nodeData);
			}



		},
	});


}

getAndDisplayPrereqConceptTree = function (course) {
	started++;

	$.ajax({
		url: '/api.php',
		data: {
			'action': 'ask',
			'query': '[[Category:Courses]][[Course Number::~' +  course + ']]|?Has concepts|?Has departments',
			'format': 'json',
		},
		success: function(data) {

			// Move the data array to where the actual data is
			data = data['query']['results'];

			
			// Run over all the courses in data
			for (course in data) {

				// Get the concepts from the data
				concepts = data[course]['printouts']['Has concepts'];

				// Loop over all the concepts and call the helper on each one and create a node for it
				for (i = 0; i < concepts.length; i++){
					if (concepts[i]['fulltext'] == '') {
						continue;
					}

					//Call the helper for each concept
					getAndDisplayPrereqConceptTreeHelper(concepts[i]['fulltext']);

					// Create the actual node
					nodeData['nodes'][concepts[i]['fulltext']] = {
						color: 'red',
						shape: 'IDontWantAFuckingDot',
						label: concepts[i]['fulltext'],
						link: concepts[i]['fullurl'],
					};
					
				}

			}

			// Decrease the started counter since we are done
			started--;

			// Once all the started ajax's are done, initialize the Tesseract
			if (started === 0) {
				var sys = arbor.ParticleSystem(1000, 400, 0.5);
				sys.parameters({gravity:true});
				sys.renderer = Renderer("#tesseractConcept");

				sys.graft(nodeData);
			}



		},
	});


}

getAndDisplayPrereqConceptTreeHelper = function (concept) {
	started++;

	$.ajax({
		url: '/api.php',
		data: {
			'action': 'ask',
			'query': '[[Category:Concepts]][[' +  concept + ']]|?Has concepts',
			'format': 'json',
		},
		success: function(data) {


			data = data['query']['results'];

			

			for (concept in data) {


				prereqs = data[concept]['printouts']['Has concepts'];

				output = [];

				// Create the edges for each pre-req found
				nodeData['edges'][concept] = {};
				for (i = 0; i < prereqs.length; i++){
					if (prereqs[i]['fulltext'] == '') {
						continue;
					}

					// Only add the edge if the node is already there
					// Which means the concept is related to the original course
					if ((prereqs[i]['fulltext'] in nodeData['nodes'])){
						nodeData['edges'][course][prereqs[i]['fulltext']] = {
							directed: true,
							color: "#000",
						};
					}
					
				}

			}

			// Decrease the started counter since we are done
			started--;

			// Once all the started ajax's are done, initialize the Tesseract
			if (started === 0) {
				var sys = arbor.ParticleSystem(1000, 400, 0.5);
				if (nodeData['nodes'].length != 1) {
					sys.parameters({gravity:true});
				}
				
				sys.renderer = Renderer("#tesseractConcept");

				sys.graft(nodeData);
			}



		},
	});


}

getAndDisplayConceptPrereqTree = function (concept) {
	started++;

	$.ajax({
		url: '/api.php',
		data: {
			'action': 'ask',
			'query': '[[Category:Concepts]][[' +  concept + ']]|?Has concepts',
			'format': 'json',
		},
		success: function(data) {

			data = data['query']['results'];

			for (concept in data) {

				// Get the pre-reqs
				prereqs = data[concept]['printouts']['Has concepts'];

				// Create nodes
				nodeData['nodes'][course] = {
					color: 'red',
					shape: 'IDontWantAFuckingDot',
					label: course,
					link: data[course]['fullurl'],
				};

				// Loop over all the pre-reqs
				for (i = 0; i < prereqs.length; i++){
					if (prereqs[i]['fulltext'] == '') {
						continue;
					}

					// If the node doesn't exist recurse
					if (! (prereqs[i]['fulltext'] in nodeData['nodes'])){
						getAndDisplayConceptPrereqTree(prereqs[i]['fulltext']);
					}
					
					// Create the edges
					nodeData['edges'][course] = {};
					nodeData['edges'][course][prereqs[i]['fulltext']] = {
						directed: true,
						color: "#000",
					};
				}

			}

			// Decrease the started counter since we are done
			started--;

			// Once all the started ajax's are done, initialize the Tesseract
			if (started === 0) {
				var sys = arbor.ParticleSystem(1000, 400, 0.5);
				sys.parameters({gravity:true});
				sys.renderer = Renderer("#tesseract");

				sys.graft(nodeData);
			}



		},
	});


}

jQuery(function($) {

	// Set the width of the canvas objects to the width of their parent
	var width = $('canvas').parent().outerWidth()
	$('canvas').attr('width', width);


	// Do the correct call based on what page we are on
	if (coursenumber == 'Tesseract'){
		getAndDisplayCourses();
	} else if (typeof isConcept !== 'undefined') {
		getAndDisplayConceptPrereqTree(coursenumber);
	} else {
		getAndDisplayPrereqTree(coursenumber);
	}

	
	// On Click Listener for Course Tab
	$('a#showCourses').click(function () {
		// Reset the Node data
		nodeData = {
			nodes: {},
			edges: {},
		};
		getAndDisplayPrereqTree(coursenumber);

		$('a#showCourses').parent().addClass('active');
		$('a#showConcepts').parent().removeClass('active');

		$('canvas#tesseractCourse').show();
		$('canvas#tesseractConcept').hide();

		return false;
	});

	// On Click Listener For Concepts Tab
	$('a#showConcepts').click(function () {
		// Reset the Node data
		nodeData = {
			nodes: {},
			edges: {},
		};
		getAndDisplayPrereqConceptTree(coursenumber);

		$('a#showCourses').parent().removeClass('active');
		$('a#showConcepts').parent().addClass('active');

		$('canvas#tesseractCourse').hide();
		$('canvas#tesseractConcept').show();

		return false;
	});

});