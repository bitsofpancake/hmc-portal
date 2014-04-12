var Data = new function () {
	var self = this;
	
	var courses = DB_PREFIX + 'courses' in localStorage ? JSON.parse(localStorage[DB_PREFIX + 'courses']) : [];
	var schedules = DB_PREFIX + 'schedules' in localStorage ? JSON.parse(localStorage[DB_PREFIX + 'schedules']) : [];
	function saveCourses() { localStorage[DB_PREFIX + 'courses'] = JSON.stringify(courses); }
	function saveSchedules() { localStorage[DB_PREFIX + 'schedules'] = JSON.stringify(schedules); }
	
	self.getCourses = function () { return courses; };
	self.getSchedules = function () { return schedules; };
	
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
	
	self.saveSchedule = function (schedule) {
		schedules.push(schedule);
		saveSchedules();
	};
	/*
	self.removeSchedule = function (schedule) {
		schedules = schedules.filter(function (course) {
			return course.crs_no != crs.crs_no;
		});
		saveSchedules();
	};*/
};