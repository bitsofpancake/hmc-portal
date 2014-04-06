//function Scheduler() {
	function randomColor(seed) {
		// Use a hash function (djb2) to generate a deterministic but "random" color.
		var hash = 5381;
		for (var i = 0; i < seed.length; i++)
			hash = ((hash << 5) + hash) + seed.charCodeAt(i);
	
		return 'hsl(' + (hash % 360) + ', 73%, 90%)'
	}
	
	// Converts a time string to a fraction (e.g. 1030 => 10.5)
	function timeToDecimal(time) {
		return Math.floor(time / 100) + (time % 100) / 60;
	}
	
	var days = Array.prototype.slice.call(document.querySelectorAll('.day'));
	var beginHour = 8 - 0.5; // Starts at 8am

	function drawSchedule(schedule) {
		var hourHeight = document.querySelector('#schedule li').offsetHeight;
		
		// Clear the schedule
		days.forEach(function (day) {
			while (day.firstChild)
				day.removeChild(day.firstChild);
		});
		
		// Add each course
		schedule.forEach(function (crs) {
			var sec = crs[0].sections[crs[1]];
			var crs = crs[0];
			
			// Each meeting
			sec.meetings.forEach(function (mtg) {
			
				// Each day.
				mtg.days.split('').forEach(function (d, i) {
					// Skip days without class and weekends.
					if (d === '-' || d === 'S' || d === 'U')
						return;
							
					var div = document.createElement('div');
					div.style.top = hourHeight * (timeToDecimal(mtg.beg_tm) - beginHour) + 'px';
					div.style.backgroundColor = randomColor(crs.title);
					div.innerHTML = '<b>' + crs.title + '-' + sec.sec_no + '</b>'/*(options.showSections && timeSlot.section ? 
							timeSlot.section.replace(/^([^(]+)\((.*)\)/, function (_, code, profs) {
								return '<b>' + code + '</b><br />' + profs;
							}) 
							: '<b>' + timeSlot.course.name + '</b>') + 
						'<br />' + formatHours(timeSlot.from) + ' - ' + formatHours(timeSlot.to);*/
					
					days[i - 1].appendChild(div);
					
					// Vertically center
					var supposedHeight = (timeToDecimal(mtg.end_tm) - timeToDecimal(mtg.beg_tm)) * hourHeight;
					var paddingHeight = (supposedHeight - div.offsetHeight) / 2;
					div.style.padding = paddingHeight + 'px 0';
					div.style.height = (supposedHeight - paddingHeight * 2) + 'px';		
				});
			});
		});
	}
		
	function generateSchedules(courses, optional) {
	/*
		// Take one section from each course and filter those that conflict.
		var schedules = [];
		var state = courses.map(function () { return 0; }); // Array of 0s.
		while (true) {
		
			// Check this possibility.
			var schedule = courses.map(function (course, i) { return [course, state[i]]; };
			if (!scheduleConflicts(schedule))
				schedules.push(schedule);
			
			// Increment state.
			var incremented = false;
			for (var i = 0; i < courses.length; i++) {
				if (state[i] < courses[i].sections.length - 1) {
					state[i]++;
					incremented = true;
					break;
				} else
					state[i] = 0;
			}
			
			// We've enumerated all possibilities.
			if (!incremented)
				break;
		}*/
		
		var schedules = [[]];
		for (var i = 0; i < courses.length; i++) {
			var newSchedules = [];
			for (var j = 0; j < schedules.length; j++)
				for (var k = 0; k < courses[i].sections.length; k++) {
					var possibleSchedule = schedules[j].concat([[courses[i], k]]);
					if (!scheduleConflicts(possibleSchedule))
						newSchedules.push(possibleSchedule);
				}
				
			schedules = newSchedules;
			if (schedules.length == 0)
				return { 'length': 0, 'conflicting': courses[i] };
		}
		
		// Add on the optional classes.
		// If schedules = [[A], [B]] and optional = [C, D], then make 
		// schedules = [[A], [B], [AC], [BC], [AD], [BD], [ACD], [BCD]].
		for (var i = 0; i < optional.length; i++) {
			var newSchedules = [];
			for (var j = 0; j < schedules.length; j++)
				for (var k = 0; k < optional[i].sections.length; k++) {
					var possibleSchedule = schedules[j].concat([[optional[i], k]]);
					if (!scheduleConflicts(possibleSchedule)) {
						schedules[j].redundant = true;
						newSchedules.push(possibleSchedule);
					}
				}
			schedules = schedules.concat(newSchedules);
		}
		
		// Filter out redundant schedules -- if [AC] is possible, no need to have just [A].
		return schedules.filter(function (schedule) { return !schedule.redundant; });
	}
	
	// Given two list of meetings, do two classes conflict?
	// (Two events conflict if one begins while the other is in progress.)
	function sectionsConflict(sec1, sec2) {
	
		// Do dates overlap?
		if ((sec1.beg_date <= sec2.beg_date && sec2.beg_date < sec1.end_date) ||
		    (sec2.beg_date <= sec1.beg_date && sec1.beg_date < sec2.end_date))
			
			// Do meetings overlap?
			for (var i = 0; i < sec1.meetings.length; i++)
				for (var j = 0; j < sec2.meetings.length; j++) {
					var mtg1 = sec1.meetings[i];
					var mtg2 = sec2.meetings[j];
					for (var day = 0; day < 7; day++)
						if (mtg1.days[day] !== '-' && mtg2.days[day] !== '-' &&
						    ((+mtg1.beg_tm <= +mtg2.beg_tm && +mtg2.beg_tm < +mtg1.end_tm) ||
							 (+mtg2.beg_tm <= +mtg1.beg_tm && +mtg1.beg_tm < +mtg2.end_tm)))
								return true;
				}
				
		return false;
	}
	
	// Given a list of course/section pairs, is this schedule viable?
	function scheduleConflicts(schedule) {
		for (var i = 0; i < schedule.length; i++)
			for (var j = 0; j < i; j++)
				if (sectionsConflict(schedule[i][0].sections[schedule[i][1]], 
				                     schedule[j][0].sections[schedule[j][1]]))
					return true;
		return false;
	}

//}