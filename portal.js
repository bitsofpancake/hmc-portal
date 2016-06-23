import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';

import Categories from './components/Categories.js';
import CourseList from './components/CourseList.js';
import ActiveScheduler from './containers/ActiveScheduler.js';

// Can't be https. (Otherwise, we would run into security issues trying to access the API.)
if (window.location.protocol === 'https:')
	window.location.replace('http://www.cs.hmc.edu/~cchu/portal/');

// update({ a: { b: c }}, ['a', 'b'], fn) == { a: { b: fn(c) }}
function update(obj, keys, fn) {
	if (!keys.length)
		return fn(obj);
	
	//return { ...obj, [keys[0]]: update(obj[keys[0]], keys.slice(1), fn) };
	const newObj = Object.assign({}, obj);
	newObj[keys[0]] = update(obj[keys[0]], keys.slice(1), fn);
	return newObj;
}

const store = createStore(function (state, action) {
	if (!state) {
		return {
			view: '', // the current view; one of [home, catalog, scheduler]
			loading: false,
		
			// The catalog view.
			catalog: {
				courses: {}, // courses to display
				currentlyExpanded: null // currently expanded
			},
		
			// The scheduler view.
			scheduler: {
				courses: {}, // a dictionary of saved courses
				selectedCourses: [], // a list of selected courses
				scheduleIndex: 0 // index of current schedule
			}
		};
	}

	if (action.type === 'SAVE_COURSE') {
		state = update(state, ['scheduler', 'courses', action.course.crs_no], _ => action.course);
		state = update(state, ['scheduler', 'selectedCourses'], selectedCourses => [...selectedCourses, action.course.crs_no]);
		state = update(state, ['scheduler', 'scheduleIndex'], _ => 0);
		return state;
	}
	
	if (action.type === 'VIEW_SCHEDULE')
		return update(state, ['scheduler', 'scheduleIndex'], _ => action.scheduleIndex);
	
	console.warn('Action not found: ' + action.type);
	return state;
}, null, window.devToolsExtension && window.devToolsExtension());

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
					onCourseSave={course => store.dispatch({
						type: 'SAVE_COURSE',
						course
					})}
				/>, document.getElementById('courselist'));
		});
		return 'catalog-list';
	},
	
	'schedules': function () {
		setTimeout(function () {
			render(
				<Provider store={store}>
					<ActiveScheduler />
				</Provider>,
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
