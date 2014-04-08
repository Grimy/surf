// Helpers {{{

function foreach(list, callback) {
	for (var i = 0, l = list.length; i < l; i++)
		callback(list[i], i, list);
}

function isEditable(element) {
	return element.nodeName.toLowerCase() == "textarea"
		|| element.nodeName.toLowerCase() == "input"
		|| element.nodeName.toLowerCase() == "embed"
		|| document.designMode == "on"
		|| element.contentEditable == "true";
}

function on_top(r, element) {
	var x = (r.left + r.right) / 2;
	var y = (r.top + r.bottom) / 2;
	return document.elementFromPoint(x, y);
}

function isVisible(element) {
	if (!element.offsetWidth || !element.offsetHeight)
		return false;
	var height = document.documentElement.clientHeight;
	var rects = element.getClientRects();
	for (var i = 0, l = rects.length; i < l; i++) {
		var r = rects[i];
		var in_viewport = r.top > 0 ? r.top <= height : r.bottom > 0;
		if (in_viewport && on_top(r) === element)
			return true;
	}
	return false;
}

function $(selector) {
	return document.querySelectorAll(selector);
}

// }}}

function scroll(px) { return function() { window.scrollBy(0, px) } }
function right() { window.scrollBy(+30, 0) }
function left()  { window.scrollBy(-30, 0) }
function prev()  { window.history.back() }
function next()  { window.history.forward() }
function reload()       { window.location.reload() }
function force_reload() { window.location.reload(true) }
function insert() {
	(document.getElementsByTagName['textarea']
	 || document.getElementsByTagName['input']).focus();
}

var bindings = {
	// Navigation
	'h': prev,
	'l': next,
	'r': reload,
	'S-r': force_reload,

	// Scrolling
	'S-h': left,
	'S-l': right,
	'j':   scroll(+24),
	'k':   scroll(-24),
	'C-j': scroll(+876),
	'C-k': scroll(-876),
	' ':   scroll(+876),
	'S- ': scroll(-876),
	'g':   scroll(-1e7),
	'S-g': scroll(+1e7),

	// Other
	'i': insert,
	'f': hints,
	'upf': hide_hints,
}

var hintchars = 'azeqsd';

function keydown(event) {
	// if we're on an editable element, we probably don't want to catch
	// keypress, we just want to write the typed character.
	if (isEditable(event.target))
		return;

	var key = (event.type == 'keyup'    ? 'up' : '') +
	          (isEditable(event.target) ? 'i_' : '') +
	          (event.ctrlKey            ? 'C-' : '') +
	          (event.shiftKey           ? 'S-' : '') +
	          (event.altKey             ? 'A-' : '') +
	          String.fromCharCode(event.keyCode).toLowerCase();
	console.log(key);

	if (hints.visible && hintchars.indexOf(key) >= 0) {
		hints.input += key;
		for (var id in hints.labels)
			hints.labels[id].className = id.match("^" + hints.input) ?
				'_surf_highlight' : '_surf_label';
		event.stopPropagation();
		event.preventDefault();
		return false;
	}
	if (bindings[key]) {
		bindings[key]();
		event.stopPropagation();
		event.preventDefault();
		return false;
	}
}

window.addEventListener("keydown", keydown, true);
window.addEventListener("keyup",   keydown, true);

window.addEventListener("mouseup", function(event) {
	if (event.button > 3)
		prev();
});

function hints() {
	if (hints.visible) return;
	hints.visible = true;
	hints.input   = "";
	hints.labels  = {};
	hints.hrefs   = {};
	var n = 0;

	foreach(document.getElementsByTagName("a"), function(a) {
		if (!a.href || !isVisible(a))
			return;
		var hint = (n++).toString(6).replace(/./g,
			function(digit) { return hintchars[digit]; });
		hints.hrefs[hint] = a.href;
		var label = document.createElement("span");
		label.innerHTML = hint;
		label.className = '_surf_label';
		hints.labels[hint] = label;
		a.parentNode.insertBefore(label, a);
	});
	// for(var id in hints.labels)
		// hints.labels[id].style.visibility = "visible";
}

function hide_hints() {
	for (var id in hints.labels)
		hints.labels[id].parentNode.removeChild(hints.labels[id]);
	hints.visible = false;
	var href = hints.hrefs[hints.input];
	if (!href) return;
	// window.open(href, href)
	window.location.href = href;
}

