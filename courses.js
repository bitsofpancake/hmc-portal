var Courses = new function () {
	var self = this;
	
	var courses = self.courses = [];
	self.sectionsSaved = function (crs_no) {
		for (var i = 0; i < courses.length; i++)
			if (courses[i].crs_no === crs_no)
				return courses[i].sections;
		return [];
	};
	
	self.removeCourse = function (crs) {
		courses = self.courses = courses.filter(function (course) {
			return course.crs_no != crs.crs_no;
		});
	};
	
	self.saveCourse = function (crs) {
		courses.push(crs);
	};
};