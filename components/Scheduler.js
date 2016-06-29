import React from 'react';
import Schedule from './Schedule.js';

function Scheduler({ courses, schedules, scheduleIndex=0, onNext, onPrevious }) {
	if (!schedules[scheduleIndex])
		return <div>Schedule does not exist.</div>;
	
	const createCallback = (fn) => (e) => {
		e.preventDefault(); 
		fn({ courses, schedules, scheduleIndex });
	};
	return (
		<div>
			<div className="Scheduler-controls">
				<a className="Scheduler-nav" href="#" onClick={createCallback(onPrevious)}>previous</a>
				<span className="Scheduler-title"><b>{ scheduleIndex + 1 }</b> of <b>{ schedules.length }</b></span>
				<a className="Scheduler-nav" href="#" onClick={createCallback(onNext)}>next</a>
			</div>
			<div className="Scheduler-schedule">
				<Schedule courses={courses} schedule={schedules[scheduleIndex]} />
			</div>
		</div>
	);
}

export default Scheduler;