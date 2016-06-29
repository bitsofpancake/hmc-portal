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

// Given a list of course/section pairs, is this schedule impossible?
function scheduleConflicts(schedule, courses) {
	for (var i = 0; i < schedule.length; i++)
		for (var j = 0; j < i; j++)
			if (sectionsConflict(courses[schedule[i][0]].sections[schedule[i][1]], 
								 courses[schedule[j][0]].sections[schedule[j][1]]))
				return true;
	return false;
}

// Use reselect library for easy memoization of the course combinations
const getSchedules = createSelector(
	state => state.scheduler.courses,
	state => state.scheduler.selectedCourses,
	(courses, selectedCourses) => {
		
		// Generate possible schedules by growing possible schedules, adding courses one at a time.
		let schedules = [[]];
		for (let courseId of selectedCourses) {
			const newSchedules = [];
			for (let schedule of schedules)
				for (let k = 0; k < courses[courseId].sections.length; k++) {
					const candidateSchedule = schedule.concat([[courseId, k]]);
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

const ActiveScheduler = connect(
	state => ({
		courses: state.scheduler.courses,
		schedules: getSchedules(state),
		scheduleIndex: state.scheduler.scheduleIndex,
		selectedCourses: state.scheduler.selectedCourses
	}),
	dispatch => ({
		onNext: ({ schedules, scheduleIndex }) => dispatch({
			type: 'SHOW_SCHEDULE',
			scheduleIndex: (scheduleIndex + 1) % schedules.length
		}),
		onPrevious: ({ schedules, scheduleIndex }) => dispatch({
			type: 'SHOW_SCHEDULE',
			scheduleIndex: (scheduleIndex - 1 + schedules.length) % schedules.length
		})
	})
)(Scheduler);

export default ActiveScheduler;