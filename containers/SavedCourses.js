import React from 'react';
import { connect } from 'react-redux';
import CourseList from '../components/CourseList.js';

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

SavedCourses = connect(
	state => ({
		courses: state.scheduler.courses,
		selectedCourses: state.scheduler.selectedCourses
	}),
	dispatch => ({
		onSelectCourse: course => dispatch({ type: 'SELECT_COURSE', course }),
		onUnselectCourse: course => dispatch({ type: 'UNSELECT_COURSE', course }),
	})
)(SavedCourses);

export default SavedCourses;