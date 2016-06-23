import React from 'react';
import Schedule from './Schedule.js';

function Scheduler({ courses, schedules, currentSchedule=0, onNext, onPrevious }) {
	if (!schedules[currentSchedule])
		return <div>Schedule does not exist.</div>;
	
	const createCallback = (fn) => (e) => {
		e.preventDefault(); 
		fn({ courses, schedules, currentSchedule });
	};
	return (
		<div>
			<div id="controls" className="generated">
				<div id="title">
					<span className="show-generated">Schedule <b id="page-number">{ currentSchedule + 1 }</b> of <b id="page-count">{ schedules.length }</b></span>
					<span className="show-saved">Schedule <b id="page-number">1</b> of <b id="page-count">1</b></span>
				</div>
				
				<ul id="actions">
					<li className="show-generated"><a id="schedule-save" href="#">save</a></li>
					<li className="show-saved"><a id="schedule-unsave" href="#">unsave</a></li>
					<li className="show-saved"><a id="schedule-rename" href="#">rename</a></li>
					<li><a id="schedule-print" href="#">print</a></li>
				</ul>
				
				<ul id="pages">
					<li><a id="page-right" href="#" onClick={createCallback(onNext)}>next</a></li>
					<li><a id="page-left" href="#" onClick={createCallback(onPrevious)}>previous</a></li>
				</ul>
			</div>
			<Schedule courses={courses} schedule={schedules[currentSchedule]} />
		</div>
	);
}

export default Scheduler;