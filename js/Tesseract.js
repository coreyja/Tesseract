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
        if (!(this instanceof Tesseract)){
            throw('Tesseract Constructor called without "new"');
        }
        // Declare all the variables of the Tesseract object here
        this.nodeData = { nodes: {}, edges: {} };
        this.canvasTag = canvasTag;

    }

    // Keeping this for a sample of how to do functions
    Tesseract.prototype.toString = function toString() {
        return 'Tesseract Object using canvas "' + this.canvasTag + '"';
    }

    Tesseract.prototype.getASKQuery = function(query) {
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

    Tesseract.prototype.getCourseData = function(course) {
        var query = '[[Category:Courses]][[Course Number::~' +  course + ']]|?Has concepts|?Has departments|?Has prerequisites|?Has corequisites';

        return this.getASKQuery(query).then(function (data){
            // Get only the first item in the list, as we only want one course
            return data[course];
        });

    }

    Tesseract.prototype.getConceptData = function(concept) {
        var query = '[[Category:Concepts]][[' +  concept + ']]|?Has concepts';

        return this.getASKQuery(query).then(function (data){
            // Get only the first item in the list, as we only want one concept
            return data[concept];
        });
    }



    Tesseract.prototype.addConceptNodes = function(pages) {

        for (var page in pages) {
            this.nodeData['nodes'][page] = {
                shape: 'dot',
                label: page,
                link: pages[page]['fullurl'],
                color: 'red'
            }
        }

        return pages;
    }

    Tesseract.prototype.addCourseNode = function(courseData) {

        this.nodeData['nodes'][courseData.fulltext] = {
            shape: 'dot',
            label: courseData.fulltext,
            link: courseData.fullurl,
            color: this.getColorByDepartment(courseData['printouts']['Has departments'][0]['fulltext'])
        }

        return courseData;
    }

    Tesseract.prototype.addCoursePrereqEdges = function (courseData) {
        var course = courseData['fulltext']
        var prereqs = courseData['printouts']['Has prerequisites'];

        for (var i = 0; i < prereqs.length; i++){
            if (prereqs[i]['fulltext'] == '') {
                continue;
            }
            this.nodeData['edges'][course] = {};
            this.nodeData['edges'][course][prereqs[i]['fulltext']] = {
                directed: true,
                color: "#000"
            };
        }

        return courseData;
    }

    Tesseract.prototype.addCoursePrereqTree = function (course) {
        console.log(course);
        // Get the course data
        var courseDataPromise = this.getCourseData(course);
        console.log(course);

        var promises = [];

        // Add the course to the Node list
        promises.push(courseDataPromise.then(this.addCourseNode));

        // Add all the edges for this Course
        promises.push(courseDataPromise.then(this.addCoursePrereqEdges));

        // Recurse on all the Prereqs
        promises.push(courseDataPromise.then(function (courseData) {
            var prereqs = courseData['printouts']['Has prerequisites'];

            var promises = [];

            for (var i = 0; i < prereqs.length; i++){
                promises.push(this.addCoursePrereqTree(prereqs[i]['fulltext']));
            }

            return Promise.all(promises);
        }));

        return Promise.all(promises);
    }

    // TODO: Add the rest of the majors to this function
    Tesseract.prototype.getColorByDepartment = function (dep) {
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
})(jQuery);