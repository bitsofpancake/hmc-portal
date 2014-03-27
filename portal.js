
// Can't be https. (Otherwise, we won't be able to access the API.)
if (window.location.protocol === 'https:')
	window.location.replace('http://www.cs.hmc.edu/~cchu/portal/');

// The main router.
window.onhashchange = function () {
	var parts = window.location.hash.substr(1).split('/');
	switch (parts.shift()) {
		case 'list':
			var yr = +parts.shift();
			var sess = parts.shift();
			var disc = parts.shift();
			if (['FA', 'SU', 'SP'].indexOf(sess) == -1 || !/^[A-Z]{1,10}$/.test(disc)) {
				document.querySelector('#search button').onclick();
				break;
			}
			
			document.querySelector('#cat').value = yr + '/' + sess;
			document.querySelector('#disc').value = disc;
			api('list/' + yr + '/' + sess + '/' + disc, listCourses);
			return;
		
	}
	
	// Main page.
	
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
function listCourses(courses) {
	console.log(courses);
	table.innerHTML = courses.map(function (crs) {
		return crs.sections.map(function (sec) {
			var instructors = toSet(sec.meetings.map(function (mtg) { return mtg.instructors; }));
			
			return '\
				<tr>\
					<td>' + crs.crs_no.replace(/^[A-Z]+/, function (x) { return '<b>' + x + '</b>'; }).replace(/[1-9]\d*/, function (x) { return '<b>' + x + '</b>'; }).replace(/[A-Z]{2}$/, function (school) {
						var colors = {
							'HM': 'gold',
							'PO': 'blue',
							'CM': 'red',
							'SC': 'green',
							'PZ': 'orange'
						};
						return colors[school] ? '<b style="color: ' + colors[school] + '">' + school + '</b>' : '<b>' + school + '</b>';
					}) + "&#8209;" + sec.sec_no + '</td>\
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
					<td>' + sec.units + '</td>\
					<td><button>Add</button></td>\
				</tr>';
		}).join('');
	}).join('');
}

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

document.querySelector('#search button').onclick = function () {
	var cat = document.querySelector('#cat').value;
	var disc = document.querySelector('#disc').value;
	window.location.hash = '#list/' + cat + '/' + disc;
};
