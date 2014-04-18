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
	
	self.export = function () {
			
		function randomColor(seed) {
			// Use a hash function (djb2) to generate a deterministic but "random" color.
			var hash = 5381 % 359;
			for (var i = 0; i < seed.length; i++)
				hash = (((hash << 5) + hash) + seed.charCodeAt(i)) % 359;
		
			return 'hsl(' + hash + ', 73%, 90%)'
			// Even though we should use "% 360" for all possible values, using 359 makes for fewer hash collisions.
		}
		
		var currentCourses = JSON.parse(localStorage.courses);
		localStorage.courses = JSON.stringify(courses.map(function (crs) {
			return {
				'name': crs.title,
				'selected': currentCourses.some(function (c) { return c.data.courseCode === crs.crs_no && c.selected; }),
				'times': crs.sections.map(function (sec) {
					var instructors = [];
					sec.meetings.forEach(function (mtg) {
						instructors = instructors.concat(mtg.instructors.map(function (instr) { return instr[1].trim(); }));
					});
					instructors = unique(instructors).sort();
					
					return crs.crs_no + '-' + sec.sec_no + ' (' + instructors.join(', ') + '): ' + sec.meetings.map(function (mtg) {
						return mtg.days.replace(/-/g, '') + ' ' + formatTime(mtg.beg_tm, true) + '-' + formatTime(mtg.end_tm, true);
					}).join(', ');
				}).join('\n'),
				'color': randomColor(crs.crs_no),
				'data': {
					'courseCode': crs.crs_no,
					'courseName': crs.title,
					'credits': crs.sections[0].units / (crs.crs_no.indexOf(' HM') > -1 ? 3 : 1)
				}
			};
		}));
	};
};