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
				<div>
					<span>Schedule <b id="page-number">{ scheduleIndex + 1 }</b> of <b id="page-count">{ schedules.length }</b></span>
				</div>
				
				<ul>
					<li><a href="#" onClick={createCallback(onNext)}>next</a></li>
					<li><a href="#" onClick={createCallback(onPrevious)}>previous</a></li>
				</ul>
				
				<ul>
					<li><a href="#">save</a></li>
					<li><a href="#">print</a></li>
				</ul>
			</div>
			<div className="Scheduler-schedule">
				<Schedule courses={courses} schedule={schedules[scheduleIndex]} />
			</div>
		</div>
	);
}

export default Scheduler;