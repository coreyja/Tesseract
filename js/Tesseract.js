/**
 * Tesseract
 *
 * Graphing Extension for Semantic Media Wiki
 *
 * Created by Corey on 2/14/14.
 */

var Tesseract;
var TESSERACT_BASE_URL = 'http://semanticwiki.csse.rose-hulman.edu';

(function($) {

    // Setting this function to Tesseract will make Tesseract a global variable, accessible from outside this jQuery closure
    Tesseract = function Tesseract(canvasTag) {
        var that = {};
        
        // Declare all the variables of the Tesseract object here
        that.nodeData = { nodes: {}, edges: {} };
        that.canvasTag = canvasTag;

        // Keeping this for a sample of how to do functions
        that.toString = function toString() {
            return 'Tesseract Object using canvas "' + that.canvasTag + '"';
        }

        that.getASKQuery = function(query) {
            return new Promise(function(resolve, reject){
                $.ajax({
                    url: TESSERACT_BASE_URL + '/api.php',
                    data: {
                        'action': 'ask',
                        'query': query,
                        'format': 'json'
                    },
                    success: function(data) {
                        resolve(data['query']['results']);
                    },
                    error: function (data) {
                        reject(new Error("ASK Query failed"));
                    }
                });

            });
        }

        that.getCourseData = function(course) {
            var query = '[[Category:Courses]][[Course Number::~' +  course + ']]|?Has concepts|?Has departments|?Has prerequisites|?Has corequisites';

            return that.getASKQuery(query).then(function (data){
                // Get only the first item in the list, as we only want one course
                return data[course];
            });

        }

        that.getConceptData = function(concept) {
            var query = '[[Category:Concepts]][[' +  concept + ']]|?Has concepts';

            return that.getASKQuery(query).then(function (data){
                // Get only the first item in the list, as we only want one concept
                return data[concept];
            });
        }



        that.addConceptNodes = function(pages) {

            for (var page in pages) {
                that.nodeData['nodes'][pages[page]['fulltext']] = {
                    shape: 'IDontWantAFuckingDot',
                    label: pages[page]['fulltext'],
                    link: pages[page]['fullurl'],
                    color: 'red'
                }
            }

            return pages;
        }

        that.addCourseNode = function(courseData) {

            that.nodeData['nodes'][courseData.fulltext] = {
                shape: 'IDontWantAFuckingDot',
                label: courseData.fulltext,
                link: courseData.fullurl,
                color: that.getColorByDepartment(courseData['printouts']['Has departments'][0]['fulltext'])
            }

            return courseData;
        }

        that.addNode = function(nodeData) {

            that.nodeData['nodes'][nodeData.fulltext] = {
                shape: 'IDontWantAFuckingDot',
                label: nodeData.fulltext,
                link: nodeData.fullurl,
                color: 'red'
            }

            return nodeData;
        }

        that.addCoursePrereqEdges = function (courseData) {
            var course = courseData['fulltext']
            var prereqs = courseData['printouts']['Has prerequisites'];

            that.nodeData['edges'][course] = that.nodeData['edges'][course] || {};
            for (var i = 0; i < prereqs.length; i++){
                if (prereqs[i]['fulltext'] == '') {
                    continue;
                }

                that.nodeData['edges'][course][prereqs[i]['fulltext']] = {
                    directed: true,
                    color: "#000"
                };
            }

            return courseData;
        }

        that.addCourseCoreqEdges = function (courseData) {
            var course = courseData['fulltext']
            var prereqs = courseData['printouts']['Has corequisites'];

            that.nodeData['edges'][course] = that.nodeData['edges'][course] || {};
            for (var i = 0; i < prereqs.length; i++){
                if (prereqs[i]['fulltext'] == '') {
                    continue;
                }

                that.nodeData['edges'][course][prereqs[i]['fulltext']] = {
                    directed: false,
                    color: "#008b0a"
                };
            }

            return courseData;
        }

        that.addConceptPrereqEdges = function (conceptData) {
            var concept = conceptData['fulltext'];
            var concepts = conceptData['printouts']['Has concepts'];


            that.nodeData.edges[concept] = {};
            for (var i = 0; i < concepts.length; i++) {

                that.nodeData.edges[concept][concepts[i]['fulltext']] = {
                    directed: true,
                    color: '#000'
                };
            }

            return conceptData;
        }

        that.addConceptGraphEdges = function (conceptData) {
            var concept = conceptData['fulltext'];
            var concepts = conceptData['printouts']['Has concepts'];


            that.nodeData.edges[concept] = that.nodeData.edges[concept] || {};
            for (var i = 0; i < concepts.length; i++) {
                // If the concept isn't in the Nodes don't add the edges
                if (!(concepts[i]['fulltext'] in that.nodeData.nodes)) {
                    continue;
                }

                that.nodeData.edges[concept][concepts[i]['fulltext']] = {
                    directed: true,
                    color: '#000'
                };
            }

            return conceptData;
        }

        that.addCoursePrereqTree = function (course) {

            // Get the course data
            var courseDataPromise = that.getCourseData(course);

            var promises = [];

            // Add the course to the Node list
            promises.push(courseDataPromise.then(that.addCourseNode));

            // Add all the edges for this Course
            promises.push(courseDataPromise.then(that.addCoursePrereqEdges));
            promises.push(courseDataPromise.then(that.addCourseCoreqEdges));

            // Recurse on all the Prereqs
            promises.push(courseDataPromise.then(function (courseData) {
                var prereqs = courseData['printouts']['Has prerequisites'];
                var coreqs = courseData['printouts']['Has corequisites'];

                var promises = [];

                for (var i = 0; i < prereqs.length; i++){
                    promises.push(that.addCoursePrereqTree(prereqs[i]['fulltext']));
                }

                for (var i = 0; i < coreqs.length; i++){
                    promises.push(that.addCoursePrereqTree(coreqs[i]['fulltext']));
                }

                return Promise.all(promises);
            }));

            return Promise.all(promises);
        }

        that.addConceptPrereqTree = function (concept) {
            // Get the concept data
            var conceptDataPromise = that.getConceptData(concept);

            var promises = [];


            promises.push(conceptDataPromise.then(function (conceptData){
                // Add the concept to the Node list
                that.addNode(conceptData);

                // Add all the edges for this concept
                return that.addConceptPrereqEdges(conceptData);
            }));

            // Recurse on all the Prereqs
            promises.push(conceptDataPromise.then(function (conceptData) {
                var concepts = conceptData['printouts']['Has concepts'];

                var promises = [];

                for (var i = 0; i < concepts.length; i++){
                    promises.push(that.addConceptPrereqTree(concepts[i]['fulltext']));
                }

                return Promise.all(promises);
            }));

            return Promise.all(promises);
        }

        that.addCourseConceptGraph = function (course) {
            // Get the course data
            var courseDataPromise = that.getCourseData(course);

            // Add all of the concept nodes
            return courseDataPromise.then(function (courseData){
                var concepts = courseData['printouts']['Has concepts'];

                that.addConceptNodes(concepts);

                var promises = [];

                for (var i = 0; i < concepts.length; i++){
                    promises.push(that.getConceptData(concepts[i]['fulltext']).then(that.addConceptGraphEdges));
                }

                return Promise.all(promises);
            });

        }

        that.showArborJSGraph = function () {
            var sys = arbor.ParticleSystem(1000, 400, 0.5);


            var count = 0;

            for (var i in that.nodeData.nodes) {
                if (that.nodeData.nodes.hasOwnProperty(i)) {
                    count++;
                }
            }

            if (count === 1) {
                sys.parameters({friction: 1.0});
            }

            sys.renderer = Renderer(that.canvasTag);

            sys.graft(that.nodeData);
        }

        // TODO: Add the rest of the majors to this function
        that.getColorByDepartment = function (dep) {
            if (dep === "Major in Computer Science"){
                dep = 'Computer Science'
            }

            var colors = {
                "Computer Science": "red",
                "Mathematics": "blue",
                "Mechanical Engineering": "green"
            };

            return colors[dep];
        }

        return that;

    }

   
})(jQuery);