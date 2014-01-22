getDepartmentColor = function(dep) {
	if (dep == "Major in Computer Science"){
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
			'query': '[[Category:Courses]]|?Has courses|?Department',
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

				output = [];

				nodeData['nodes'][course] = {
					color: 'red',
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

var nodeData = {
	nodes: {},
	edges: {},
};

getAndDisplayPrereqTree = function (course) {
	started++;

	$.ajax({
		url: '/api.php',
		data: {
			'action': 'ask',
			'query': '[[Category:Courses]][[Course Number::~' +  course + ']]|?Has courses|?Department',
			'format': 'json',
		},
		success: function(data) {


			// var sys = arbor.ParticleSystem(1000, 400, 0.5);
			// sys.parameters({gravity:true});
			// sys.renderer = Renderer("#tesseract");

			data = data['query']['results'];

			

			for (course in data) {

				// $.ajax({
				// 	url: '/api.php',
				// });

				prereqs = data[course]['printouts']['Has courses'];
				dep = data[course]['printouts']['Has departments'][0];

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

			}

			started--;

			if (started === 0) {
				var sys = arbor.ParticleSystem(1000, 400, 0.5);
				sys.parameters({gravity:true});
				sys.renderer = Renderer("#tesseract");

				sys.graft(nodeData);
			}



		},
	});


}

getAndDisplayCourse = function(course) {
	console.log("How many times?");	

	$.ajax({
		url: '/api.php',
		data: {
			'action': 'ask',
			'query': '[[Category:Courses]][[Course Number::~' +  course + ']]|?Has courses|?Department' ,
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

				output = [];

				nodeData['nodes'][course] = {
					color: 'red',
					shape: 'IDontWantAFuckingDot',
					label: course,
					link: data[course]['fullurl'],
				};

				for (i = 0; i < prereqs.length; i++){
					if (prereqs[i]['fulltext'] == '') {
						continue;
					}

					var prereqTitle = prereqs[i]['fulltext'];
					var prereqURL = prereqs[i]['fullurl'];

					nodeData['edges'][course] = {};
					nodeData['edges'][course][prereqTitle] = {
						directed: true,
						color: "#000",
					};

					nodeData['nodes'][prereqTitle] = {
						color: 'red',
						shape: 'IDontWantAFuckingDot',
						label: prereqTitle,
						link: prereqURL,
					};
				}

			}

			sys.graft(nodeData);



		},
	});
}

clearCanvas = function() {
	var canvas = $('#tesseract').get(0);
	var ctx = canvas.getContext("2d");

	ctx.clearRect(0,0,canvas.width,canvas.height)
}

getAndDisplayConcepts = function() {
	$.ajax({
		url: '/api.php',
		data: {
			'action': 'ask',
			'query': '[[Category:Concepts]]|?Has concepts',
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

			for (concept in data) {
				related = data[concept]['printouts']['Has concepts'];

				output = [];

				nodeData['nodes'][concept] = {
					shape: 'dot',
					label: concept,
					link: data[concept]['fullurl'],
					color: 'red',
				};

				for (i = 0; i < related.length; i++){
					nodeData['edges'][concept] = {};
					nodeData['edges'][concept][related[i]['fulltext']] = {

						color: "#000",
					};
				}

			}

			sys.graft(nodeData);



		},
	});
}

jQuery(function($) {

	var width = $('canvas#tesseract').parent().outerWidth()
	$('canvas#tesseract').attr('width', width);


	if (coursenumber == 'Tesseract'){
		getAndDisplayCourses();
	} else {
		getAndDisplayPrereqTree(coursenumber);
	}

	

	$('a#showCourses').click(function () {
		clearCanvas();
		getAndDisplayCourses();

		$('a#showCourses').parent().addClass('active');
		$('a#showConcepts').parent().removeClass('active');

		return false;
	});

	$('a#showConcepts').click(function () {
		clearCanvas();
		getAndDisplayConcepts();

		$('a#showCourses').parent().removeClass('active');
		$('a#showConcepts').parent().addClass('active');

		return false;
	});

});