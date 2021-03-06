import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';

import App from './containers/App.js';

// Can't be https. (Otherwise, we would run into security issues trying to access the API.)
if (window.location.protocol === 'https:')
	window.location.replace('http://www.cs.hmc.edu/~cchu/portal/');

// update({ a: { b: c }}, ['a', 'b'], fn) == { a: { b: (typeof fn === 'function' ? fn(c) : fn) }}
function update(obj, keys, fn) {
	if (typeof keys === 'string')
		keys = keys.split('.');
	if (!keys.length)
		return typeof fn === 'function' ? fn(obj) : fn;
	
	if (keys.length === 1 && fn === null) {
		const newObj = Object.assign({}, obj);
		delete newObj[keys[0]];
		return newObj;
	}
	
	//return { ...obj, [keys[0]]: update(obj[keys[0]], keys.slice(1), fn) };
	const newObj = Object.assign({}, obj);
	newObj[keys[0]] = update(obj[keys[0]], keys.slice(1), fn);
	return newObj;
}

const store = createStore(function (state, action) {
	if (!state) {
		return {
			view: 'home', // the current view; one of [home, catalog, scheduler]
			loading: 0,
		
			// The catalog view.
			catalog: {
				courses: null, // courses to display
				expandedCourses: [] // currently expanded
			},
		
			// The scheduler view.
			scheduler: {
				courses: {}, // a dictionary of saved courses
				selectedCourses: [], // a list of selected courses
				scheduleIndex: 0, // index of current schedule
				showCourseNumber: true,
				// selectedSections
				savedSchedules: {},
				loadedSchedule: null
			},
		};
	}

	switch (action.type) {
		// Logistics stuff.
		case 'CHANGE_VIEW':
			state = update(state, 'catalog.courses', null);
			state = update(state, 'view', action.view);
			return state;
		case 'START_LOADING':
			return update(state, 'loading', loading => loading + 1);
		case 'FINISH_LOADING':
			return update(state, 'loading', loading => loading - 1);
		
		// Catalog.
		case 'LOAD_COURSES':
			return update(state, 'catalog.courses', action.courses);
		case 'EXPAND_COURSE':
			return update(state, 'catalog.expandedCourses', [action.course.id]);
		case 'UNEXPAND_COURSE':
			return update(state, 'catalog.expandedCourses', expandedCourses => expandedCourses.filter(id => id !== action.course.id));
		
		// Scheduler.
		case 'SAVE_COURSE':
			return update(state, 'scheduler.courses.' + action.course.id, action.course);
		case 'UNSAVE_COURSE':
			return update(state, 'scheduler.courses.' + action.course.id, null);
		case 'UNSAVE_ALL_COURSES':
			return update(state, 'scheduler.courses', {});
		
		case 'CHANGE_DISPLAY_OPTION':
			
		case 'SHOW_SCHEDULE':
			return update(state, 'scheduler.scheduleIndex', action.scheduleIndex);
		case 'SAVE_SCHEDULE':
			return update(state, 'scheduler.savedSchedules.' + action.name, action.schedule);
		case 'UNSAVE_SCHEDULE':
			return update(state, 'scheduler.savedSchedules.' + action.name, null);
		case 'LOAD_SCHEDULE':
			return update(state, 'scheduler.loadedSchedule', action.schedule);
		case 'UNLOAD_SCHEDULE':
			return update(state, 'scheduler.loadedSchedule', null);
		
		case 'SELECT_COURSE':
			state = update(state, 'scheduler.selectedCourses', selectedCourses => [...selectedCourses, action.course.id]);
			state = update(state, 'scheduler.scheduleIndex', 0);
			return state;
		case 'UNSELECT_COURSE':
			state = update(state, 'scheduler.selectedCourses', selectedCourses => selectedCourses.filter(id => id !== action.course.id));
			state = update(state, 'scheduler.scheduleIndex', 0);
			return state;
		
		default:
			console.warn('Action not found: ' + action.type);
			return state;
	}
	
}, JSON.parse(sessionStorage.getItem('state')), window.devToolsExtension && window.devToolsExtension());

// Hacky state preservation for easier debugging
store.subscribe(() => sessionStorage.setItem('state', JSON.stringify(store.getState())));

render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('mount')
);

// Which page should be shown.
var router = {
	'schedules': () => store.dispatch({ type: 'CHANGE_VIEW', view: 'scheduler' }),
	'catalog': () => store.dispatch({ type: 'CHANGE_VIEW', view: 'home' }),

	'catalog/(\\d{4})/(FA|SU|SP)/([A-Z]{1,5})': function (yr, sess, disc) {
		store.dispatch({ type: 'CHANGE_VIEW', view: 'catalog' });
		store.dispatch({ type: 'START_LOADING' });

		api(
			yr + '/' + sess + '?disc=' + disc,
			courses => {
				// Temporarily augment each course with an ID
				courses.forEach(course => {
					course.id = course.crs_no.replace(/\./g, '$') + '#';
				});
			
				store.dispatch({ type: 'LOAD_COURSES', courses });
				store.dispatch({ type: 'FINISH_LOADING' });
			}
		);
	},
	
	/*
	'schedules/([A-Za-z0-9=-]+)': function (schedule) {
		setTimeout(function () {
			Scheduler.draw(JSON.parse(atob(schedule)));
		}, 100);
		return 'schedule';
	},
	
	'catalog/saved': function () {
		Catalog.listCourses(Data.getCourses());
		return 'catalog-list';
	}*/
};

// The main router. Checks the hash and shows the correct view.
window.onhashchange = function () {
	
	// Try each pattern until one matches.
	var found = false;
	for (var pattern in router) {
		window.location.hash.replace(new RegExp('^#' + pattern + '$'), function () {
			router[pattern].apply(window, Array.prototype.slice.call(arguments, 1));
			found = true;
		})
		
		if (found)
			return;
	}
	
	// No match.
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
