import React from 'react';
import { formatTime, timeToDecimal, randomColor } from '../util.js';

// TODO: make these props.
const beginHour = 8; // Starts at 8am
const endHour = 21; // End at 9pm
const scheduleHeight = 6;
const heightUnit = 'in'; // the units `scheduleHeight` is expressed in.

const hourHeight = scheduleHeight / (endHour - beginHour + 1);
const timeToPosition = (hr) => (hr - beginHour + 0.5) * hourHeight + heightUnit;
const timeToHeight = (hr) => hr * hourHeight + heightUnit;

function Schedule({ schedule, courses }) {
	
	const hours = [];
	for (let hour = beginHour; hour <= endHour; hour++)
		hours.push((
			<div className="Schedule-hour" style={{ top: timeToPosition(hour) }}>
				{ formatTime(hour * 100, true, false) }
			</div>
		));
	
	// Add each course
	const days = 'UMTWRFS'.split('').map(() => []);
	schedule.forEach(function ([crs, sec]) {
		const course = courses[crs];
		const section = courses[crs].sections[sec];
		
		// Each meeting
		section.meetings.forEach(function (meeting) {
		
			// Each day.
			meeting.days.split('').forEach(function (d, i) {
				if (d !== '-')
					days[i].push((
						<Meeting crs={course} sec={section} mtg={meeting} />
					));
			});
		});
	});
	
	return (
		<table className="Schedule">
			<tbody>
				<tr>
					<th className="Schedule-cell"></th>
					<th className="Schedule-cell">Monday</th>
					<th className="Schedule-cell">Tuesday</th>
					<th className="Schedule-cell">Wednesday</th>
					<th className="Schedule-cell">Thursday</th>
					<th className="Schedule-cell">Friday</th>
				</tr>
				<tr>
					<td className="Schedule-cell" style={{ height: scheduleHeight + heightUnit }}>{ hours }</td>
					{ days.slice(1, 6).map(day => <td className="Schedule-cell">{ day }</td>) }
				</tr>
			</tbody>
		</table>
	);
}

function Meeting({ crs, sec, mtg }) {
	return (
		<div className="Meeting" title={crs.title} style={{
			top: timeToPosition(timeToDecimal(mtg.beg_tm)),
			height: timeToHeight(timeToDecimal(mtg.end_tm) - timeToDecimal(mtg.beg_tm)),
			backgroundColor: randomColor(crs.crs_no)
		}}>
			<div className="Meeting-contents">
				<b>{ crs.crs_no }-{ sec.sec_no }</b><br />
				{ mtg.instructors.map((instr) => instr[1]).join(', ') }<br />
				{ formatTime(mtg.beg_tm, false) }&ndash;{ formatTime(mtg.end_tm, true) }
			</div>
		</div>
	);
}

export default Schedule;