var Catalog = new function () {
	var self = this;

	var imTable = {
		'CL': 'clinic', 
		'CQ': 'colloquium',
		'DC': 'discussion',
		'DS': 'independent study', // directed study
		'FM': 'film',
		'FS': 'seminar', // freshman seminar
		'IP': 'internship',
		'IS': 'independent study',
		'LB': 'lab', 
		'LC': 'lecture', 
		'LD': 'discussion',
		'LL': 'lecture/lab',
		'LO': 'LO', // cancelled?
		'PE': 'PE', 
		'PR': 'practicum', 
		'RC': 'recitation', 
		'RS': 'research',
		'SE': 'seminar',
		'ST': 'studio',
		'SX': 'thesis', // senior thesis
		'SS': 'seminar', // senior seminar
		'TS': 'test',
		'XX': 'class'
	};
	
	var catTable = {
		'C': 'corequisite',
		'N': 'concurrent'
	};

	var courses = [];
	self.listCourses = function (_courses) {
		console.log(_courses);
		courses = _courses;
		
		// Fill the rows with courses!
		document.querySelector('#courses').innerHTML = courses.map(function (crs, i) {
			var instructors = [];
			crs.sections.forEach(function (sec) {
				sec.meetings.forEach(function (mtg) {
					instructors = instructors.concat(mtg.instructors.map(function (name) { return name.join(' ').trim(); }));
				});
			});
			instructors = instructors.unique();
			
			// 
			var sectionsSaved = Courses.sectionsSaved(crs.crs_no);
		
			return '\
				<tr data-index="' + i + '" class="' + (sectionsSaved.length === 0 ? '' : (sectionsSaved.length === crs.sections.length ? 'course-saved' : 'courses-partially-saved')) + '">\
					<td class="course-entry">\
						<div class="course-head" data-action="expand">\
							<div class="course-title">\
								<b>' + colorCourseName(crs.crs_no) + ' - ' + crs.title + '</b>' + (instructors.length ? ' (<i>' + instructors.join('; ') + '</i>)' : '') + '\
							</div>' + (crs.abstr ? '<div class="course-abstr">' + crs.abstr + '</div>' : '') + '\
						</div>\
					</td>\
					<td class="course-check" data-action="save">star</td>\
				</td>';
		}).join('');
		
		// Scroll to the top.
		window.scroll(0, 0);
	};

	var actions = {
		'expand': function (row, crs) {
			
			// Get rid of the old details if it's already showing.
			var old = row.querySelector('.course-details');
			if (old) {
				old.parentNode.removeChild(old);
				return;
			}
			
			// Generate the requirements list.
			var reqs = crs.reqs ? crs.reqs.map(function (reqgrp) {
				return reqgrp.map(function (req) {
					if (req.type === 'course') {
						// The course number is funny -- FREN1***** means FREN 100 or greater. Make it more intuitive to understand.
						var crs_no = (req.crs_no + '******').substr(0, 'MATH131'.length).replace(/\*/g, 'x') + req.crs_no.substr('MATH131'.length).replace(/\*/g, ' ');
						return '<b title="with at least a ' + req.grade + '">' + colorCourseName(crs_no).trim() + '</b>' + (req.category !== 'P' ? ' (' + catTable[req.category] + ')' : '');
					}
					else if (req.type === 'exam')
						return '<b>' + req.exam + '</b> (' + req.score + ')';
				}).sort().join(', ');
			}) : [];

			// Make footnotes for the section requirements.
			var footnotes = [];
			
			// Generate the HTML.
			var details = document.createElement('div');
			details.className = 'course-details';
			details.innerHTML = '\
					' + (reqs.length ? '<div class="course-reqs"><i>Requirements</i>: [' + reqs.join('] <span style="font-variant: small-caps">or</span> [') + ']</div>' : '') + '\
					<table class="sections">\
						' + crs.sections.map(function (sec) {
											
							var instructors = [];
							sec.meetings.forEach(function (mtg) {
								instructors = instructors.concat(mtg.instructors.map(function (instr) { return instr.join(' ').trim(); }));
							});
							instructors = instructors.unique().sort();
							
							var reqs = sec.reqs ? sec.reqs.map(function (req) {
								var index = footnotes.indexOf(req);
								return 1 + index || footnotes.push(req);
							}).sort() : [];
							
							return '\
								<tr class="section-row">\
									<td class="section-head">\
										<b>Section ' + sec.sec_no + '</b><sup>' + reqs.join(',') + '</sup><br />\
										<b>' + (sec.title ? sec.title + '<br />' : '') + '</b>\
										<i>' + instructors.join('<br />') + '</i>\
									</td>\
									<td>\
										<table class="meetings">' +
									sec.meetings.map(function (mtg) {
										if (+mtg.beg_tm == 0 && (+mtg.end_tm == 0 || +mtg.end_tm == 1200))
											return '';
									
										return '\
											<tr title="' + mtg.instructors.map(function (instr) { return instr.join(' '); }).sort().join('; ') + '">\
												<td>' + (mtg.im !== 'XX' ? imTable[mtg.im] + ':' : '') + '</td>\
												<td>' + mtg.days.replace(/-/g, '') + '</td>\
												<td>' + formatTime(mtg.beg_tm, false) + '&ndash;' + formatTime(mtg.end_tm, true) + 
													(mtg.building || mtg.room ? ', ' : '') + mtg.building + ' ' + mtg.room + '\
												</td>\
											</tr>';
									}).join('') + '\
										</table>\
									</td>\
									<td class="section-dates">' + sec.beg_date + '<br />' + sec.end_date + '</td>\
									<td class="section-numbers">\
										<span>enrolled:</span> ' + sec.reg_num + '<br />\
										<span>max:</span> ' + sec.reg_max + '\
									</td>\
									<td class="section-units">' + (sec.units * (crs.crs_no.substr('MATH131  '.length, 2) === 'HM' ? 1 : 3)).toFixed(2) + '</td>\
									<td class="section-check"><input type="checkbox" checked /></td>\
								</tr>\
							';
						}).join('') + '\
					</table>\
					<div class="course-footnotes">\
					' + footnotes.map(function (footnote, i) {
						return '<sup>' + (i + 1) + '</sup>' + footnote;
					}).join('<br />') + '\
					</div>';
			
			row.querySelector('.course-entry').appendChild(details);
		},
		
		'save': function (row, crs) {
			if (Courses.sectionsSaved(crs.crs_no).length)
				Courses.removeCourse(crs);
			else
				Courses.saveCourse(crs);
			
			var sectionsSaved = Courses.sectionsSaved(crs.crs_no);
			row.className = sectionsSaved.length === 0 ? '' : (sectionsSaved.length === crs.sections.length ? 'course-saved' : 'course-partially-saved');
		}
	
	}
	
	// When a course is clicked, perform the appropriate action.
	document.querySelector('#courses').onclick = function (e) {
	
		// Get the course that was clicked on.
		var index = '';
		var el = e.target;
		var action = false;
		while (el && el.getAttribute && !(index = el.getAttribute('data-index'))) {
			action = action || el.getAttribute('data-action');
			el = el.parentNode;
		}
		
		if (index && actions[action])
			actions[action](el, courses[+index])
	};
/*
	document.querySelector('#search').onsubmit = function () {
		var cat = document.querySelector('#cat').value;
		var disc = document.querySelector('#disc').value;
		window.location.hash = '#catalog/' + cat + '/' + disc;
		return false;
	};*/
};