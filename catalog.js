function Catalog() {
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

	self.listCourses = function (courses) {
		window.courses = courses;
		console.log(courses);
		
		// Fill the rows with courses!
		document.querySelector('#courses').innerHTML = courses.map(function (crs, i) {
			var instructors = [];
			crs.sections.forEach(function (sec) {
				sec.meetings.forEach(function (mtg) {
					instructors = instructors.concat(mtg.instructors.map(function (name) {
						name = name.split(', '); 
						return (name[1] || '') + ' ' + name[0];
					}));
				});
			});
			instructors = instructors.unique();
		
			return '\
				<tr>\
					<td class="course-entry">\
						<div class="course-head" data-index="' + i + 'x">\
							<div class="course-title">\
								<b>' + colorCourseName(crs.crs_no) + ' - ' + crs.title + '</b> (<i>' + instructors.join('; ') + '</i>)\
							</div>' + (crs.abstr ? '<div class="course-abstr">' + crs.abstr + '</div>' : '') + '\
						</div>\
					</td>\
					<td class="course-check"><input type="checkbox" /></td>\
				</td>';
		}).join('');
		
		// When a course is clicked, expand the details.
		document.querySelector('#courses').onclick = function (e) {
		
			// Get the course that was clicked on.
			var index = '';
			var row = e.target;
			while (row && row.className !== 'course-entry') {
				index = index || row.getAttribute('data-index');
				row = row.parentNode;
			}
			if (!index)
				return;
			var crs = courses[parseInt(index, 10)];
			
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
								instructors = instructors.concat(mtg.instructors.map(function (name) {
									name = name.split(', '); 
									return (name[1] || '') + ' ' + name[0];
								}));
							});
							instructors = instructors.unique();
							
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
											<tr title="' + mtg.instructors.sort().map(function (instr) { return instr.split(',')[0]; }).join('; ') + '">\
												<td>' + (mtg.im !== 'XX' ? imTable[mtg.im] + ':' : '') + '</td>\
												<td>' + mtg.days.replace(/-/g, '') + '</td>\
												<td>' + (Math.floor(mtg.beg_tm / 100) % 12 || 12) + ':' + ('00' + (mtg.beg_tm % 100)).substr(-2) + '&ndash;' +
													(Math.floor(mtg.end_tm / 100) % 12 || 12) + ':' + ('00' + (mtg.end_tm % 100)).substr(-2) + (mtg.end_tm >= 1200 ? 'pm' : 'am') + 
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
									<td class="section-check"><input type="checkbox" /></td>\
								</tr>\
							';
						}).join('') + '\
					</table>\
					<div class="course-footnotes">\
					' + footnotes.map(function (footnote, i) {
						return '<sup>' + (i + 1) + '</sup>' + footnote;
					}).join('<br />') + '\
					</div>';
			
			row.appendChild(details);
		};
			
		// Scroll to the top.
		window.scroll(0, 0);
	};

	document.querySelector('#search').onsubmit = function () {
		var cat = document.querySelector('#cat').value;
		var disc = document.querySelector('#disc').value;
		window.location.hash = '#catalog/' + cat + '/' + disc;
		return false;
	};
}