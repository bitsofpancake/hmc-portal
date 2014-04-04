// Can't be https. (Otherwise, we won't be able to access the API.)
if (window.location.protocol === 'https:')
	window.location.replace('http://www.cs.hmc.edu/~cchu/portal/');

// Which page should be shown.
var router = {
	'catalog': function () {
		return 'catalog-browse';
	},

	'catalog/(\\d{4})/(FA|SU|SP)/([A-Z]{1,5})': function (yr, sess, disc) {
		document.querySelector('#cat').value = yr + '/' + sess;
		document.querySelector('#disc').value = disc;
		api('list/' + yr + '/' + sess + '/' + disc, listCourses);
		return 'catalog-list';
	},
	
	'schedule': function () {
		return 'schedule';
	}
};

// The main router.
window.onhashchange = function () {
	if (window.location.hash == '#')
		return;
	
	var viewName = false;
	for (var pattern in router) {
		window.location.hash.replace(new RegExp('^#' + pattern + '$'), function () {
			viewName = router[pattern].apply(window, Array.prototype.slice.call(arguments, 1));
		})
		
		// If viewName is "X-Y-Z", this sets <body>'s class to "X-view X-Y-view X-Y-Z-view".
		if (viewName) {
			var classes = [];
			var parts = viewName.split('-');
			while (parts.length)
				classes.push((classes.length ? classes[classes.length - 1] + '-' : '') + parts.shift());
			document.body.className = classes.map(function (cls) { return cls + '-view'; }).join(' ');
			return;
		}
	}
	
	// No match.
	document.body.className = '';
	window.location.hash = '#';
};
window.onhashchange();

function toSet(arrays) {
	var s = [];
	
	// Insertion sort.
	for (var i = 0; i < arrays.length; i++)
		for (var j = 0; j < arrays[i].length; j++) {
			for (var k = 0; k < s.length; k++) {
				if (s[k] === arrays[i][j])
					break;
				if (s[k] > arrays[i][j]) {
					s.splice(k, 0, arrays[i][j]);
					break;
				}
			}
			if (k == s.length)
				s.push(arrays[i][j]);
		}
	
	return s;
}

Array.prototype.unique = function () {
	return this.filter(function (x, i, a) { return a.indexOf(x) == i; });
}

var im = {
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

function colorCourseName(name) {
	var campus = name.substr('MATH131  '.length, 2);
	return campus ? name.substr(0, 'MATH131  '.length) + '<span class="crs-' + campus + '">' + campus + '</span>' : name;
}

function listCourses(courses) {
	console.log(courses);
	
	var listing = document.querySelector('#courses');
	listing.onclick = function (e) {
		// Get the row that was clicked on.
		var row = e.target;
		while (row && row.getAttribute && !row.getAttribute('data-index'))
			row = row.parentNode;
		if (!row || !row.parentNode)
			return;
		var index = row.getAttribute('data-index');
		row = row.parentNode;
		/*
		// Get rid of the old row.
		var old = document.querySelector('#courses .details');
		if (old)
			old.parentNode.removeChild(old);
		*/
		var crs = courses[+index];
		
		// Generate the requirements list.
		var reqs = crs.reqs.map(function (reqgrp) {
			return reqgrp.map(function (req) {
				if (req.type === 'course') {
					// The course number is funny -- FREN1***** means FREN 100 or greater. Make it more intuitive to understand.
					var crs_no = req.crs_no.substr(0, 'MATH131'.length).replace(/\*/g, 'x') + req.crs_no.substr('MATH131'.length).replace(/\*/g, ' ');
					return '<b>' + colorCourseName(crs_no) + '</b> (' + req.grade + (req.category !== 'P' ? ', ' + req.category : '') + ')';
				}
				else if (req.type === 'exam')
					return req.exam + ' (' + req.score + ')';
			}).sort().join(', ');
		});

		// Make footnotes for the section requirements.
		var footnotes = [];
		
		var details = document.createElement('tr');
		details.innerHTML = '\
		<td class="details">\
			' + (reqs.length ? 'Requirements: [' + reqs.join('] <span style="font-variant: small-caps">or</span> [') + ']<br />' : '') + '\
				<table style="width: 100% ">\
					' + crs.sections.map(function (sec) {
										
						var instructors = [];
						sec.meetings.forEach(function (mtg) {
							instructors = instructors.concat(mtg.instructors.map(function (name) {
								name = name.split(', '); 
								return (name[1] || '') + ' ' + name[0];
							}));
						});
						instructors = instructors.unique();
						
						var reqs = sec.reqs.map(function (req) {
							var index = footnotes.indexOf(req);
							return 1 + index || footnotes.push(req);
						});
						
						return '\
							<tr>\
								<td><b>Section ' + sec.sec_no + (sec.title ? '<br />' + sec.title : '') + '</b><sup>' + reqs.join(',') + '</sup><br /><i>' + instructors.join('<br />') + '</i></td>\
								<td>\
									<table class="sections">' +
								sec.meetings.map(function (mtg) {
									if (+mtg.beg_tm == 0 && (+mtg.end_tm == 0 || +mtg.end_tm == 1200))
										return '';
								
									return '\
										<tr title="' + mtg.instructors.sort().map(function (instr) { return instr.split(',')[0]; }).join('; ') + '">\
											<td class="' +  mtg.im + '">' + (mtg.im !== 'XX' ? im[mtg.im] + ':' : '') + '</td>\
											<td>' + mtg.days.replace(/-/g, '') + '</td>\
											<td>' + (Math.floor(mtg.beg_tm / 100) % 12 || 12) + ':' + ('00' + (mtg.beg_tm % 100)).substr(-2) + '&ndash;' +
												(Math.floor(mtg.end_tm / 100) % 12 || 12) + ':' + ('00' + (mtg.end_tm % 100)).substr(-2) + (mtg.end_tm >= 1200 ? 'pm' : 'am') + 
												(mtg.building || mtg.room ? ', ' : '') + mtg.building + ' ' + mtg.room + '\
											</td>\
										</tr>';
								}).join('') + '\
									</table>\
								</td>\
								<td>' + sec.beg_date + '<br />' + sec.end_date + '</td>\
								<td><span style="color: #666">enrolled</span>: ' + sec.reg_num + '<br /><span style="color: #666">max:</span> ' + sec.reg_max + '</td>\
								<td>' + sec.units.toFixed(2) + '</td>\
								<td><input type="checkbox" /></td>\
							</tr>\
						';
					}).join('') + '\
				</table>\
				' + footnotes.map(function (footnote, i) {
					return '<sup>' + (i + 1) + '</sup>' + footnote;
				}).join('<br />') + '\
			</td>';
		
		if (row.nextSibling)
			row.parentNode.insertBefore(details, row.nextSibling);
		else
			row.parentNode.appendChild(details);
	};

	listing.innerHTML = courses.map(function (crs, i) {
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
		//toSet(crs.sec.meetings.map(function (mtg) { return mtg.instructors; }));
	
		return '\
			<tr>\
				<td data-index="' + i + '">\
					<div>\
						<b>' + colorCourseName(crs.crs_no) + ' - ' + crs.title + '</b> (<i>' + instructors.join('; ') + '</i>)</div>\
					</div>' + (crs.abstr || '') + '\
				</td>\
				<td><input type="checkbox" /></td>\
			</td>';
		}).join('');
	/*
				<td>' + sec.units.toFixed(2) + '</td>\
				<td>' + sec.beg_date + '<br />' + sec.end_date + '</td>\
				<td><span style="color: #666">enrolled</span>: ' + sec.reg_num + '<br /><span style="color: #666">max:</span> ' + sec.reg_max + '</td>\
		return crs.sections.map(function (sec, j) {
				sec.meetings.map(function (mtg) {
					if (+mtg.beg_tm == 0 && (+mtg.end_tm == 0 || +mtg.end_tm == 1200))
						return '';
				
					return '\
							<tr title="' + mtg.instructors.sort().map(function (instr) { return instr.split(',')[0]; }).join('; ') + '">\
								<td class="' +  mtg.im + '">' + (mtg.im !== 'XX' ? {
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
								}[mtg.im] + ':' : '') + '</td>\
								<td>' + mtg.days.replace(/-/g, '') + '</td>\
								<td>' + (Math.floor(mtg.beg_tm / 100) % 12 || 12) + ':' + ('00' + (mtg.beg_tm % 100)).substr(-2) + '&ndash;' +
									(Math.floor(mtg.end_tm / 100) % 12 || 12) + ':' + ('00' + (mtg.end_tm % 100)).substr(-2) + (mtg.end_tm >= 1200 ? 'pm' : 'am') + 
									(mtg.building || mtg.room ? ', ' : '') + mtg.building + ' ' + mtg.room + '\
								</td>\
							</tr>';
				}).join('') + '\
						</table>\
					</td>\
					<td>' + sec.beg_date + '<br />' + sec.end_date + '</td>\
					<td><span style="color: #666">enrolled</span>: ' + sec.reg_num + '<br /><span style="color: #666">max:</span> ' + sec.reg_max + '</td>\
					<td>' + sec.units.toFixed(2) + '</td>\
					<td><button>Add</button></td>\
				</tr>';
		}).join('');
	}).join('');
	*/
	// Scroll to the top.
	window.scroll(0, 0);
}

document.querySelector('#search').onsubmit = function () {
	var cat = document.querySelector('#cat').value;
	var disc = document.querySelector('#disc').value;
	window.location.hash = '#catalog/' + cat + '/' + disc;
	return false;
};

function api(query, callback) {
	var req = new XMLHttpRequest();
	req.withCredentials = true;
	req.open('GET', 'http://cs.hmc.edu:41783/' + query);
	req.onreadystatechange = function () {
		if (req.readyState != 4)
			return;
			
		if (req.status != 200) {
			alert('There was an error processing your request.');
			return;
		}
		
		callback(JSON.parse(req.responseText));
	};
	req.send(null);
}
