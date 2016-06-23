import React from 'react';
import Scheduler from '../components/Scheduler.js';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

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
function scheduleConflicts(schedule, courses) {
	for (var i = 0; i < schedule.length; i++)
		for (var j = 0; j < i; j++)
			if (sectionsConflict(courses[schedule[i][0]].sections[schedule[i][1]], 
								 courses[schedule[j][0]].sections[schedule[j][1]]))
				return true;
	return false;
}

// Use reselect library for easy memoization of the course combinations
const selectCourses = state => state.courses;
const selectSelectedCourses = state => state.selectedCourses;
const selectSchedules = createSelector(
	selectCourses,
	selectSelectedCourses,
	(courses, selectedCourses) => {
		
		// Generate possible schedules by growing possible schedules, adding courses one at a time.
		let schedules = [[]];
		for (let course of selectedCourses) {
			const newSchedules = [];
			for (let schedule of schedules)
				for (let k = 0; k < courses[course].sections.length; k++) {
					const candidateSchedule = schedule.concat([[course, k]]);
					if (!scheduleConflicts(candidateSchedule, courses))
						newSchedules.push(candidateSchedule);
				}
				
			schedules = newSchedules;
			if (schedules.length == 0)
				return [];
		}
		
		return schedules;
	}
);

/*
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
*/

const ActiveScheduler = connect(
	function (state) {
		return {
			courses: state.courses,
			schedules: selectSchedules(state),
			currentSchedule: state.currentSchedule
		}
	},
	function (dispatch) {
		return {
			onNext: () => {
				dispatch({ type: 'VIEW_NEXT_SCHEDULE' });
			},
			onPrevious: () => {
				dispatch({ type: 'VIEW_PREVIOUS_SCHEDULE' });
			}
		};
	}
)(Scheduler);

export default ActiveScheduler;