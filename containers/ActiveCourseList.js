import React from 'react';
import CourseList from '../components/CourseList.js';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';


const ActiveCourseList = connect(
	state => ({
		courses: state.catalog.courses
	}),
	dispatch => ({
		onCourseClick: () => null,
		onCourseSave: course => dispatch({
			type: 'SAVE_COURSE',
			course
		})
	})
)(CourseList);

export default ActiveCourseList;