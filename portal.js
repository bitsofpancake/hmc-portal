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

var table = document.querySelector('#courses tbody');

function colorCourseName(name) {
	return name.replace(/^[A-Z]+/, function (x) { return '<b>' + x + '</b>'; }).replace(/[1-9]\d*/, function (x) { return '<b>' + x + '</b>'; }).replace(/[A-Z]{2}$/, function (school) {
		var colors = {
			'HM': 'gold',
			'PO': 'blue',
			'CM': 'red',
			'SC': 'green',
			'PZ': 'orange'
		};
		return colors[school] ? '<b style="color: ' + colors[school] + '">' + school + '</b>' : '<b>' + school + '</b>';
	});
}

function listCourses(courses) {
	console.log(courses);
	table.onclick = function (e) {
		// Get the row that was clicked on.
		var row = e.target;
		while (row.tagName !== 'TR' || !row.getAttribute('data-index')) {
			row = row.parentNode;
			if (!row)
				return;
		}
		var index = row.getAttribute('data-index').split(' ');
		var details = document.createElement('tr');
		details.innerHTML = '<td colspan="8">' + courses[index[0]].abstr + '</td>';
		
		if (row.nextSibling)
			row.parentNode.insertBefore(details, row.nextSibling);
		else
			row.parentNode.appendChild(details);
		console.log();
	};

	table.innerHTML = courses.map(function (crs, i) {
		return crs.sections.map(function (sec, j) {
			var instructors = toSet(sec.meetings.map(function (mtg) { return mtg.instructors; }));
			
			return '\
				<tr data-index="' + i + ' ' + j + '">\
					<td>' + colorCourseName(crs.crs_no) + "&#8209;" + sec.sec_no + '</td>\
					<td><b>' + crs.title + '</b>' + (sec.title ? '<br />' + sec.title : '') + '</td>\
					<td>' + instructors.join('<br />') + '</td>\
					<td>\
						<table class="sections">' + 
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
