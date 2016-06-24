import React from 'react';
import { commas, formatTime } from '../util.js';

const imTable = {
	'CL': 'clinic',
	'CQ': 'colloquium',
	'DC': 'discussion',
	'DS': 'independent study', // directed study
	'FM': 'film',
	'FS': 'seminar', // freshman seminar
	'IP': 'internship',
	'IS': 'independent study',
	'LB': 'lab',
	'LC': 'lecture',
	'LD': 'discussion',
	'LL': 'lecture/lab',
	'LO': 'LO', // cancelled?
	'PE': 'PE',
	'PR': 'practicum',
	'RC': 'recitation',
	'RS': 'research',
	'SE': 'seminar',
	'ST': 'studio',
	'SX': 'thesis', // senior thesis
	'SS': 'seminar', // senior seminar
	'TS': 'test',
	'XX': 'class'
};

const catTable = {
	'C': 'corequisite',
	'N': 'concurrent'
};

function CourseList({ courses, checkedCourses, onCourseClick, onCourseCheck, onCourseUncheck }) {
	if (!courses)
		return null;
		
	return (
		<table>
			<tbody id="courses">
				{ courses.map((course) => (
					<Course
						course={course}
						checked={checkedCourses.includes(course.crs_no)}
						expanded={true}
						onClick={onCourseClick}
						onCheck={onCourseCheck} 
						onUncheck={onCourseUncheck} 
					/>
				))}
			</tbody>
		</table>
	);
};

function Course({ course, checked, expanded, onClick, onCheck, onUncheck }) {
	var instructors = new Set();
	course.sections.forEach(function (sec) {
		sec.meetings.forEach(function (mtg) {
			mtg.instructors.forEach(function (name) {
				instructors.add(name.join(' ').trim());
			});
		});
	});
	instructors.delete('Staff');
	
	return (
		<tr className={ checked ? 'course-saved' : '' }>
			<td className="course-check" onClick={checked ? (e => onUncheck(course)) : (e => onCheck(course))}></td>
			<td className="course-entry">
				<div className="course-head" onClick={() => onClick(course)}>
					<div className="course-title">
						<b><CourseCode code={ course.crs_no } />: { course.title }</b>
						{ instructors.size ? <span> (<i>{ Array.from(instructors).join('; ') }</i>)</span> : null }
					</div>
					{ course.abstr ? <div className="course-abstr">{ course.abstr }</div> : null }
				</div>
				{ expanded ? <CourseDetails {...course} /> : null }
			</td>
		</tr>
	);
}

function CourseDetails(course) {

	// Make footnotes for the section requirements.
	var footnotes = [];
	
	return (
		<div className="course-details">
			<CourseRequirements reqgrps={course.reqs} />
			<table className="sections">
				<tbody>
					{ course.sections.map(function (sec) {
					
						var instructors = new Set();
						sec.meetings.forEach(function (mtg) {
							mtg.instructors.forEach(function (instr) {
								instructors.add(instr.join(' ').trim());
							});
						});
						instructors.delete('Staff');

						var reqs = sec.reqs ? sec.reqs.map(function (req) {
							var index = footnotes.indexOf(req);
							return 1 + index || footnotes.push(req);
						}).sort() : [];

						return (
							<tr className="section-row">
								<td className="section-head">
									<b>Section { sec.sec_no }</b>{ reqs.length ? <sup>{ commas(reqs, ',') }</sup> : null }<br />
									{ sec.title ? <div><b>{ sec.title }</b></div> : null }
									{ instructors.size ? <i>{ commas(Array.from(instructors), <br />) }</i> : null }
								</td>
								<td>
									<table className="meetings">
										<tbody>
											{ sec.meetings.map(function (mtg) {
												if (+mtg.beg_tm == 0 && (+mtg.end_tm == 0 || +mtg.end_tm == 1200))
													return null;

												return (
													<tr title={ mtg.instructors.map((instr) => instr.join(' ')).sort().join('; ') }>
														<td>{ mtg.im !== 'XX' ? imTable[mtg.im] + ':' : '' }</td>
														<td>{ mtg.days.replace(/-/g, '') }</td>
														<td>{ formatTime(mtg.beg_tm, false) }&ndash;{ formatTime(mtg.end_tm, true) + (mtg.building || mtg.room ? ', ' : '') + mtg.building + ' ' + mtg.room }</td>
													</tr>
												);
											}) }
										</tbody>
									</table>
								</td>
								<td className="section-dates">{ sec.beg_date }<br />{ sec.end_date }</td>
								<td className="section-numbers">
									<span>enrolled:</span> { sec.reg_num }<br />
									<span>max:</span> { sec.reg_max }
								</td>
								<td className="section-units">{ (sec.units * (course.crs_no.substr('MATH131  '.length, 2) === 'HM' ? 1 : 3)).toFixed(2) }</td>
							</tr>
						);
					}) }
				</tbody>
			</table>
			<div className="course-footnotes">
				{ commas(footnotes.map((footnote, i) => <span><sup>{ i + 1 }</sup>{ footnote }</span>), <br />) }
			</div>
		</div>
	);
}

function CourseRequirements({ reqgrps }) {
	if (!reqgrps || !reqgrps.length)
		return null;
	
	return (
		<div className="course-reqs">
			<i>Requirements</i>: {
				commas(
					reqgrps.map((reqgrp) => <CourseRequirementGroup reqgrp={reqgrp} />),
					<span style={{ fontVariant: 'small-caps' }}> or </span>
				)
			}
		</div> 
	);
}

function CourseRequirementGroup({ reqgrp }) {
	return <span>[{ commas(reqgrp.map((req) => <CourseRequirement {...req} />)) }]</span>
}

function CourseRequirement(req) {
	if (req.type === 'course') {
		// Sometimes the course code has asterisks to denote wildcard. Make it more intuitive to understand.
		// This isn't perfect, since PHYS024X can include PYHS024A but will display as just PHYS024. But
		// the database often says PHYS100XX to mean PHYS100 from any college...
		let crs_no = req.crs_no + '******';
		const code = crs_no.substr(0, 'ABCD123'.length);
		const campus = crs_no.substr('ABCD123'.length);
		crs_no = code.replace(/\*/g, 'x') + campus.replace(/\*/g, '');
		
		return (
			<span>
				<b title={ 'with at least a ' + req.grade }>
					<CourseCode code={ crs_no } />
				</b> 
				{ req.category !== 'P' ? ' (' + catTable[req.category] + ')' : '' }
			</span>
		);
	}
	
	else if (req.type === 'exam')
		return <span><b>{ req.exam }</b> ({ req.score })</span>;
}

function CourseCode({ code }) {
	var campus = code.substr('MATH131  '.length, 2);
	if (campus)
		return (
			<span>
				{ code.substr(0, 'MATH131  '.length) }
				<span className={ 'crs-' + campus }>{ campus }</span>
			</span>
		);
	return <span>{ code.trim() }</span>;
}

export default CourseList;