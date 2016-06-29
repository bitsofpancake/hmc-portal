import React from 'react';
import CourseList from '../components/CourseList.js';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';


const ActiveCourseList = connect(
	state => ({
		courses: state.catalog.courses,
		checkedCourses: Object.keys(state.scheduler.courses)
	}),
	dispatch => ({
		onCourseClick: () => null,
		onCourseCheck: course => {
			dispatch({ type: 'SAVE_COURSE', course });
			dispatch({ type: 'SELECT_COURSE', course });
		},
		onCourseUncheck: course => {
			dispatch({ type: 'UNSELECT_COURSE', course });
			dispatch({ type: 'UNSAVE_COURSE', course });
		},
	})
)(CourseList);

export default ActiveCourseList;