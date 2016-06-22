import React from 'react';
import { render } from 'react-dom';
//import { createStore } from 'redux';

import Categories from './components/Categories.js';
import CourseList from './components/CourseList.js';
import Scheduler from './components/Scheduler.js';

// Can't be https. (Otherwise, we would run into security issues trying to access the API.)
if (window.location.protocol === 'https:')
	window.location.replace('http://www.cs.hmc.edu/~cchu/portal/');
/*
var store = createStore(function (state = { courses: [], schedules: [] }, action) {
	if (action.type === 'TOGGLE_COURSE') {
		if (!state.courses.contains(course))
			state.courses.push()
		
	}
});

function addCourse(course) {
	return {
		type: 'TOGGLE_COURSE',
		course
	};
}*/
var courses = {};

// Which page should be shown.
var router = {
	'catalog': function () {
		return 'catalog-browse';
	},

	'catalog/(\\d{4})/(FA|SU|SP)/([A-Z]{1,5})': function (yr, sess, disc) {
	/*	document.querySelector('#cat').value = yr + '/' + sess;
		document.querySelector('#disc').value = disc;*/
		api(yr + '/' + sess + '?disc=' + disc, (data) => {
			render(
				<CourseList
					courses={data}
					onCourseClick={() => null}
					onCourseSave={(course) => courses[course.crs_no] = course}
				/>, document.getElementById('courselist'));
		});
		return 'catalog-list';
	},
	
	'schedules': function () {
		setTimeout(function () {
			//Scheduler.load(Scheduler.generate(Data.getCourses(), []));
			console.log(courses);
			const schedule = [];
			for (let crs_no in courses)
				schedule.push([crs_no, 0]);
			
			render(
				<Scheduler
					courses={courses}
					schedules={[schedule]}
					currentSchedule={0}
				/>,
				document.querySelector('#scheduler-container')
			);
		}, 100);
		return 'schedule';
	},
	
	'schedules/([A-Za-z0-9=-]+)': function (schedule) {
		setTimeout(function () {
			Scheduler.draw(JSON.parse(atob(schedule)));
		}, 100);
		return 'schedule';
	},
	
	'catalog/saved': function () {
		Catalog.listCourses(Data.getCourses());
		return 'catalog-list';
	}
};

render(<Categories />, document.querySelector('#categories-container'));

// The main router. Checks the hash and shows the correct view.
window.onhashchange = function () {
	
	// Try each pattern until one matches.
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
	window.location.hash = '#catalog';
};

// Route the current hash value.
window.onhashchange();

function api(query, callback) {
	var req = new XMLHttpRequest();
	req.open('GET', 'http://localhost:41783/' + query);
	req.onreadystatechange = function () {
		if (req.readyState != 4)
			return;
			
		if (req.status != 200) {
			alert('There was an error processing your request.');
			return;
		}
		
		callback(JSON.parse(req.responseText).data);
	};
	req.send(null);
}
