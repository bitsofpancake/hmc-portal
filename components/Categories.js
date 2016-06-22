import React from 'react';

const categories = {
	'Arts and Humanities': {
		'ARCN': 'Art Conservation',
		'ARHI': 'Art History',
		'ART': 'Studio Art',
		"CLAS": 'Classics',
		"DANC": 'Dance',
		"ENGL": 'English',
		"LAMS": 'Late Antique/Medieval Studies',
		"LIT": 'Literature',
		"MUS": 'Music',
		"PHIL": 'Philosophy',
		"THEA": 'Theatre'
	},
	
	'Math and Science': {
		'AISS': 'Accelerated Integrated Science Sequence',
		'AS': 'Aerospace Studies',
		'ASTR': 'Astronomy',
		'BIOL': 'Biology',
		'CHEM': 'Chemistry',
		"CSCI": 'Computer Science',
		"CSMT": 'Computer Science/Mathematics',
		"ENGR": 'Engineering',
		"GEOL": 'Geology',
		"MATH": 'Mathematics',
		"MOBI": 'Molecular Biology',
		"NEUR": 'Neuroscience',
		"PHYS": 'Physics',
	},

	'Social Science': {
		'ANTH': 'Anthropology',
		"ECON": 'Economics',
		"HIST": 'History',
		"IR": 'International Relations',
		"LGCS": 'Linguistics and Cognitive Science',
		"POLI": 'Politics',
		"PSYC": 'Psychology',
		"SOC": 'Sociology'
	},
	
	'Language': {
		'ARBC': 'Arabic',
		"CHIN": 'Chinese',
		"CHLT": 'Chican@/Latin@ Translation',
		"CHNT": 'Chinese in Translation',
		"FREN": 'French',
		"GERM": 'German',
		"GRMT": 'German in Translation',
		"ITAL": 'Italian',
		"JAPN": 'Japanese',
		"KORE": 'Korean',
		"PORT": 'Portuguese',
		"RUSS": 'Russian',
		"RUST": 'Russian in Translation',
		"SPAN": 'Spanish',
		"SPNT": 'Spanish in Translation'
	},
	
	'Anthro': {
		'AFRI': 'Africana Studies',
		'AMST': 'American Studies',
		'ASAM': 'Asian American Studies',
		'ASIA': 'Asian Studies',
		"CHST": 'Chicana/Chicano-Latina/Latino Studies',
		"FGSS": 'Feminism, Gender, and Sexuality Studies',
		"GFS": 'Gender and Feminist Studies',
		"GWS": 'Gender and Women\'s Studies'
	},
	
	'Other': {
		"CL": 'Core Lab',
		"CORE": 'Core',
		"CREA": 'Creative Studies',
		"EA": 'Environmental Analysis',
		"EDUC": 'Education',
		"FHS": 'Freshman Humanities Seminar',
		"FLAN": 'Foreign Languages',
		"GOVT": 'Government',
		"HMSC": 'Humanities Major: Culture',
		"HSID": 'History of Ideas',
		"HUM": 'Humanities',
		"ID": 'Interdisciplinary Studies',
		"IE": 'Integrative Experience',
		"IIS": 'International/Intercultural Studies',
		"LAST": 'Latin American Studies',
		"LGST": 'Legal Studies',
		"MCSI": 'Monroe Center, Social Inquiry',
		"MES": 'Middle Eastern Studies',
		"MGT": 'Management',
		"MILS": 'Military Science',
		"MLLC": 'Modern Language, Literature, and Culture',
		"MS": 'Media Studies',
		"ONT": 'Ontario Program',
		"ORST": 'Organizational Studies',
		"OSCI": 'Interdisciplinary/Other Science',
		"PE": 'Physical Education',
		"POST": 'Political Studies',
		"PP": 'Politics and Policy',
		"PPA": 'Public Policy Analysis',
		"PPE": 'Philosophy, Politics, and Economics',
		"REL": 'Religion',
		"RLIT": 'Romance Literatures',
		"RLST": 'Religious Studies',
		"SPCH": 'Speech',
		"SPE": 'School of Politics and Economics',
		"STS": 'Science, Technology, Society',
		"THES": 'Senior Thesis',
		"WRIT": 'Writing'
	}
};

function Categories() {
	return (
		<ul id="categories" className="view catalog-view">
			<li><a href="#catalog/saved">Saved Courses</a></li>
			{ Object.keys(categories).map((cat) => <Category cat={cat} disciplines={categories[cat]} />) }
		</ul>
	);
}

function Category({ cat, disciplines }) {
	return (
		<li>
			<span>{ cat }</span>
			<ul>
				{ Object.keys(disciplines).map((disc) => <Discipline disc={disc} description={disciplines[disc]} />) }
			</ul>
		</li>
	);
}

function Discipline({ disc, description }) {
	return <li><a href={'#catalog/' + YEAR + '/' + SESS + '/' + disc}>{ disc }: { description }</a></li>;
}

export default Categories;