import React from 'react';
import { connect } from 'react-redux';
import CourseList from '../components/CourseList.js';
/*
function SavedCourses({ courses, selectedCourses, onSelectCourse, onUnselectCourse }) {
	return (
		<CourseList
			courses={Object.keys(courses).map(id => courses[id])}
			checkedCourses={selectedCourses}
			expandedCourses={[]}
			onCourseClick={() => null}
			onCourseCheck={onSelectCourse}
			onCourseUncheck={onUnselectCourse}
		/>
	)
}
*/
const SavedCourses = connect(
	state => ({
		courses: Object.keys(state.scheduler.courses).map(id => state.scheduler.courses[id]),
		checkedCourses: state.scheduler.selectedCourses,
		expandedCourses: []
	}),
	dispatch => ({
		onCourseCheck: course => dispatch({ type: 'SELECT_COURSE', course }),
		onCourseUncheck: course => dispatch({ type: 'UNSELECT_COURSE', course }),
	})
)(CourseList);

export default SavedCourses;