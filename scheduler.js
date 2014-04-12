var Scheduler = new function () {
	var self = this;

	function randomColor(seed) {
		// Use a hash function (djb2) to generate a deterministic but "random" color.
		var hash = 5381 % 359;
		for (var i = 0; i < seed.length; i++)
			hash = (((hash << 5) + hash) + seed.charCodeAt(i)) % 359;
	
		return 'hsl(' + hash + ', 73%, 90%)'
		// Even though we should use "% 360" for all possible values, using 359 makes for fewer hash collisions.
	}
	
	// Converts a time string to a fraction (e.g. 1030 => 10.5)
	function timeToDecimal(time) {
		return Math.floor(time / 100) + (time % 100) / 60;
	}
	
	var days = Array.prototype.slice.call(document.querySelectorAll('.day'));
	var beginHour = 8 - 0.5; // Starts at 8am
	
	var schedules = [];
	var current = 0;
	self.load = function (_schedules) {
		schedules = _schedules;
		if (schedules.length) {
			current = 0;
			self.draw(schedules[0], true);
			updateUI();
		}
		else
			alert('No schedules are possible :(');
	};
	
	function updateUI() {
		document.querySelector('#page-number').innerHTML = schedules.length ? current + 1 : 0;
		document.querySelector('#page-count').innerHTML = schedules.length;
		document.querySelector('#page-left').className = current <= 0 ? 'disabled' : '';
		document.querySelector('#page-right').className = current + 1 >= schedules.length ? 'disabled' : '';
	}
	
	function showSavedSchedules() {
		var ss = document.querySelector('#saved-schedules');
		ss.innerHTML = '';
		
		Data.getSchedules().forEach(function (schedule) {
			var li = document.createElement('li');
			var a = document.createElement('a');
			a.href = '#schedules/' + btoa(JSON.stringify(schedule.schedule));
			a.innerHTML = schedule.name;
			li.appendChild(a);
			ss.appendChild(li);
		});
	}
	showSavedSchedules();
	
	document.querySelector('#page-left').onclick = function () { if (current > 0) { self.draw(schedules[--current], true); updateUI(); } return false; };
	document.querySelector('#page-right').onclick = function () { if (current + 1 < schedules.length) { self.draw(schedules[++current], true); updateUI(); } return false; };
	document.querySelector('#schedule-print').onclick = function () { window.print(); return false; };
	document.querySelector('#schedule-save').onclick = function () { 
		Data.saveSchedule({
			'name': prompt('What would you like to call this schedule?') || 'Untitled ' + (new Date()).toDateString().substr(4),
			'schedule': schedules[current]
		});
		showSavedSchedules();
		return false;
	};
	updateUI();

	self.draw = function (schedule, generated) {
		var hourHeight = document.querySelector('#schedule li').offsetHeight;
		
		// Clear the schedule
		days.forEach(function (day) {
			while (day.firstChild)
				day.removeChild(day.firstChild);
		});
		
		document.querySelector('#controls').className = generated ? 'generated' : 'saved';
		
		if (!schedule.length)
			return;
		
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
					div.style.backgroundColor = randomColor(crs.crs_no);
					div.title = crs.title;
					if (true)
						div.innerHTML = '<b>' + crs.crs_no + '-' + sec.sec_no + '</b><br />' + mtg.instructors.map(function (instr) { return instr[1] }).join(', ') + '<br />' + formatTime(mtg.beg_tm, true) + ' - ' + formatTime(mtg.end_tm, true);
						
						/*(options.showSections && timeSlot.section ? 
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
		
	self.generate = function (courses, optional) {
		
		// Generate possible schedules.
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

}