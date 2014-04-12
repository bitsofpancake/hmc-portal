var Data = new function () {
	var self = this;
	
	var courses = DB_PREFIX + 'courses' in localStorage ? JSON.parse(localStorage[DB_PREFIX + 'courses']) : [];
	function saveCourses() {
		localStorage[DB_PREFIX + 'courses'] = JSON.stringify(courses);
	}
	
	self.getCourses = function () {
		return courses;
	};
	
	self.sectionsSaved = function (crs_no) {
		for (var i = 0; i < courses.length; i++)
			if (courses[i].crs_no === crs_no)
				return courses[i].sections;
		return [];
	};
	
	self.removeCourse = function (crs) {
		courses = courses.filter(function (course) {
			return course.crs_no != crs.crs_no;
		});
		saveCourses();
	};
	
	self.saveCourse = function (crs) {
		courses.push(crs);
		saveCourses();
	};
};