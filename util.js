export function formatTime(time, ampm=true, minutes=true) {
	return (Math.floor(time / 100) % 12 || 12) + (minutes ? ':' + ('00' + (time % 100)).substr(-2) : '') + (ampm ? (time >= 1200 ? 'pm' : 'am') : '');
};

// Converts a time string to a fraction (e.g. 1030 => 10.5)
export function timeToDecimal(time) {
	return Math.floor(time / 100) + (time % 100) / 60;
};

export function randomColor(seed) {
	// Use a hash function (djb2) to generate a deterministic but "random" color.
	var hash = 5381 % 359;
	for (var i = 0; i < seed.length; i++)
		hash = (((hash << 5) + hash) + seed.charCodeAt(i)) % 359;

	return 'hsl(' + hash + ', 73%, 90%)'
	// Even though we should use "% 360" for all possible values, using 359 makes for fewer hash collisions.
}

export function commas(list, delim=', ') {
	return list.slice(0, 1).concat(list.slice(1).map((el) => [delim, el]));
};