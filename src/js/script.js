const INDEX_HASH = "Index";
const DETAILS_HASH = "Details";
const CONTACT_HASH = "Contact";

let global = {};

document.addEventListener("DOMContentLoaded", initialize, false);
window.addEventListener("popstate", refreshLocation, false);
window.addEventListener("resize", refreshPaddingTop, false);

function initialize() {
	global.indexSection = document.getElementById(INDEX_HASH);
	global.detailsSection = document.getElementById(DETAILS_HASH);
	global.contactSection = document.getElementById(CONTACT_HASH);
	
	global.main = document.getElementById("main");
	global.headerContainer = document.getElementById("header-container");
	global.sectionContainer = document.getElementById("section-container");
	global.loaderContainer = document.getElementById("loader-container");
	global.loaderFrontMonogramContainer = document.getElementById("loader-front-monogram-container");

	// Retrieve the valid hashes

	global.validHashes = [INDEX_HASH, CONTACT_HASH];
	data.projects.covers.forEach(function(cover) {
		global.validHashes.push(cover.hash);
	});

	removeHoverIfHasTouch();
	
	refreshLocation();
}

/*----------------------*/
/*		Location		*/
/*----------------------*/

function getLocationHash() {
	let anchorIdx = window.location.hash.indexOf('.');
	if (anchorIdx > -1) {
		return window.location.hash.substring(1, anchorIdx);
	}
	return window.location.hash.substring(1);
}

function getLocationAnchor() {
	let anchorIdx = window.location.hash.indexOf('.');
	if (anchorIdx > -1) {
		return window.location.hash.substring(anchorIdx + 1);
	}
}

function refreshLocation() {
	let currHash = getLocationHash();
	let currAnchor = getLocationAnchor();

	if (global.validHashes.indexOf(currHash) < 0) {
		currHash = INDEX_HASH;
	}
	
	global.main.setAttribute("data-location", currHash);
	global.sectionContainer.innerHTML = '';

	if (currHash == INDEX_HASH) {

		const indexSection = createIndexSection(data.projects.covers);
		global.sectionContainer.appendChild(indexSection);

		handleContentLoading(global.sectionContainer);
	}
	else if (currHash == CONTACT_HASH) {

		const contactSection = createContactSection(data.contact);
		global.sectionContainer.appendChild(contactSection);

		preventContentLoading();
	}
	else {
		const orderedProjectHashes = data.projects.covers.map((cover) => {
			return cover.hash;
		}).filter((hash, pos, arr) => {
			// Removes duplicates
			return arr.indexOf(hash) === pos;
		});
		var currProjectIndex = orderedProjectHashes.indexOf(currHash);

		const nbProjects = orderedProjectHashes.length;
		var prevProjectHash = orderedProjectHashes[((currProjectIndex - 1) % nbProjects + nbProjects) % nbProjects];
		var nextProjectHash = orderedProjectHashes[((currProjectIndex + 1) % nbProjects + nbProjects) % nbProjects];

		const detailsSection = createDetailsSection(
			{ ...data.projects.contents[currHash], hash: currHash },
			{ ...data.projects.contents[prevProjectHash], hash: prevProjectHash },
			{ ...data.projects.contents[nextProjectHash], hash: nextProjectHash }
		);

		global.sectionContainer.appendChild(detailsSection);

		handleContentLoading(global.sectionContainer, currAnchor);
	}
}

function refreshPaddingTop() {
	global.sectionContainer.style.paddingTop = global.headerContainer.offsetHeight + "px";
}

/*------------------*/
/*		Loader		*/
/*------------------*/

function handleContentLoading(elements, anchor) {
	var imgs = elements.querySelectorAll("img");
	
	// Show the loader
	displayElement(global.loaderContainer);
	showElement(global.loaderContainer);

	let nbImgsLoaded = 0;
	let nbImgsTotal = 0;

	imgs.forEach(function(img) {

		hideElement(img);
		nbImgsTotal++;

		img.addEventListener("load", function() {

			showElement(img);
			nbImgsLoaded++;

			// Update the loader state
			global.loaderFrontMonogramContainer.style.height = ((nbImgsLoaded / nbImgsTotal) * 60) + "px";

			if (nbImgsLoaded == nbImgsTotal) {

				// Keeps the monogram full a few milliseconds
				setTimeout(function() {
					
					refreshPaddingTop();
					
					let anchorElem;
					if (anchor) {
						anchorElem = document.getElementById(anchor);
						if (anchorElem == null) {
							console.error(`No anchor for '${anchor}'`);
						}
					}

					let scrollTop = (anchorElem) ? anchorElem.offsetTop - global.headerContainer.offsetHeight : 0;

					// Get on top !
					document.body.scrollTop = scrollTop;
					document.documentElement.scrollTop = scrollTop;

					hideElement(global.loaderContainer);
					setTimeout(function() {
						// Hide the loader
						displayNoneElement(global.loaderContainer);
						
						// Reset the loader state
						global.loaderFrontMonogramContainer.style.height = "0px";
					}, 300);
				}, 200);
			}
		}, false);
	});
}

function preventContentLoading() {
	displayNoneElement(global.loaderContainer);
	hideElement(global.loaderContainer);
}

// Elements' style related functions

function hideElement(element) {
	if (!element.classList.contains("opacity-0")) {
		element.classList.add("opacity-0");
	}
}

function showElement(element) {
	if (element.classList.contains("opacity-0")) {
		element.classList.remove("opacity-0");
	}
}

function displayNoneElement(element) {
	if (!element.classList.contains("display-none")) {
		element.classList.add("display-none");
	}
}

function displayElement(element) {
	if (element.classList.contains("display-none")) {
		element.classList.remove("display-none");
	}
}

/*--------------------------*/
/*		DOM generation		*/
/*--------------------------*/

function createIndexSection(covers) {
	var indexSection = document.createElement("section");
	var grid = document.createElement("div");

	var coverIdx = 0;
	while (coverIdx < covers.length) {
		let row = document.createElement("div");
		row.classList.add("row");

		let colIdx = 0
		while (colIdx < 4 && coverIdx < covers.length) {
			let cover = covers[coverIdx];

			let cols = createCoverCols(cover);

			row.append(...cols);

			colIdx += cols.length;
			coverIdx++;
		}

		grid.appendChild(row);
	}
	
	indexSection.id = INDEX_HASH;
	indexSection.appendChild(grid);

	return indexSection;
}

function createCoverCols(cover) {
	var cols = [];

	var col = document.createElement("div");
	var div = document.createElement("div");
	var link = document.createElement("a");
	var title = document.createElement("span");
	var img = document.createElement("img");
	
	col.classList.add("col");
	div.classList.add("cover");

	link.classList.add("cover-link");
	link.href = "#" + cover.hash + ((cover.anchor) ? "." + cover.anchor : "");

	var titleText = cover.hash.replace(/[^a-z0-9]/gi, " ");
	if (titleText.length > 12) {
		titleText = titleText.replace(' ', "<br/>");
	}
	title.innerHTML = titleText;

	img.src = "media/img/" + cover.hash + "/" + cover.img;
	img.classList.add("cover-img");

	div.appendChild(title);
	div.appendChild(link);
	link.appendChild(img);
	col.appendChild(div);

	cols.push(col);

	if (cover.large_img) {
		var col2 = col.cloneNode(false);
		var div2 = div.cloneNode(false);
		var link2 = link.cloneNode(false);
		var title2 = title.cloneNode(true);
		var img2 = img.cloneNode(false);

		col.setAttribute("data-type", "bis");
		col2.setAttribute("data-type", "double");
		col2.setAttribute("data-position", cover.large_img_position);

		img2.src = "media/img/" + cover.hash + "/" + cover.large_img;
		img2.classList.add("cover-img");

		div2.appendChild(title2);
		div2.appendChild(link2);
		link2.appendChild(img2);
		col2.appendChild(div2);

		cols.push(col2);
	}

	return cols;
}

function createDetailsSection(project, prevProject, nextProject) {
	var detailsSection = document.createElement("section");
	var detailsDiv = document.createElement("div");
	
	// Title

	var titleH1 = document.createElement("h1");

	titleH1.textContent = project.title;

	detailsDiv.appendChild(titleH1);
	
	// Content
	
	var htmlList = parseHTMLFromText(project.details, project.hash);
	
	htmlList.forEach(function(htmlElem) {
		detailsDiv.appendChild(htmlElem);
	});

	// Nav
	
	var projectNav = document.createElement("nav");

	var prevProjectA = document.createElement("a");
	var nextProjectA = document.createElement("a");
	
	prevProjectA.href = "#" + prevProject.hash;
	nextProjectA.href = "#" + nextProject.hash;
	
	prevProjectA.innerHTML = "&#8249;&emsp;" + prevProject.title;
	nextProjectA.innerHTML = nextProject.title + "&emsp;&#8250;";
	
	projectNav.appendChild(prevProjectA);
	projectNav.appendChild(nextProjectA);

	detailsDiv.appendChild(projectNav);
	
	// Container
	
	detailsDiv.id = project.hash;
	detailsDiv.classList.add("details");

	detailsSection.id = DETAILS_HASH;
	detailsSection.appendChild(detailsDiv);

	return detailsSection;
}

function createContactSection(contact) {
	var contactSection = document.createElement("section");
	var contactDiv = document.createElement("div");
	
	contactDiv.classList.add("contact");

	var htmlList = parseHTMLFromText(contact.content, null);
	
	htmlList.forEach(function(elem) {
		contactDiv.appendChild(elem);
	});

	contactSection.id = CONTACT_HASH;
	contactSection.appendChild(contactDiv);

	return contactSection;
}

function parseHTMLFromText(text, hash) {
	var htmlList = [];
	
	var pargaraphs = text.split("\t").join("").split("\n\n");

	function setContentAttribute(element, value) {
		if (!element.hasAttribute('data-content')) {
			element.setAttribute('data-content', value);
		}
	}
	
	// Paragraphs

	pargaraphs.forEach(function(paragraph) {
		let p = document.createElement("p");

		// Anchors

		paragraph = paragraph.replace(/\<\#(.*?)\>$/g, function(match, capture) {
			let div = document.createElement("div");

			div.id = capture;

			setContentAttribute(p, 'anchor');
			
			return div.outerHTML;
		});

		// Link

		paragraph = paragraph.replace(/\{(.*?)\}/g, function(match, capture) {
			let a = document.createElement("a");

			a.innerHTML = capture.split("@")[0];
			a.href = capture.split("@")[1];
			a.target = "_blank";
			
			return a.outerHTML;
		});
		
		// Bold

		paragraph = paragraph.replace(/\*(.*?)\*/g, function(match, capture) {
			let b = document.createElement("b");

			b.innerHTML = capture;
			
			return b.outerHTML;
		});

		// Italic
		
		paragraph = paragraph.replace(/\~(.*?)\~/g, function(match, capture) {
			let i = document.createElement("i");

			i.innerHTML = capture;
			
			return i.outerHTML;
		});

		// Image and Video
		
		paragraph = paragraph.replace(/\[(.*?)(?:,(.*?))?\]/g, function(match, src, align) {
			if (src.indexOf(".mp4") == src.length - 4) {
				let video = document.createElement("video");
				let source = document.createElement("source");

				source.src = "media/img/" + hash + "/" + src;
				source.type = "video/mp4";

				video.controls = true;
				video.appendChild(source);

				if (align) {
					video.setAttribute('data-align', align);
				}

				setContentAttribute(p, 'video');

				return video.outerHTML;
			}
			else {
				let img = document.createElement("img");
				let a = document.createElement("a");

				img.src = "media/img/" + hash + "/" + src;

				if (align) {
					img.setAttribute('data-align', align);
				}

				a.href = "media/img/" + hash + "/" + src;
				a.target = "_blank";
				
				a.appendChild(img);

				setContentAttribute(p, 'img');

				return a.outerHTML;
			}
		});
		
		p.innerHTML = paragraph;

		htmlList.push(p);
	});
	
	return htmlList;
}

/*------------------*/
/*		Utility		*/
/*------------------*/

function removeHoverIfHasTouch() {
	var hasTouch = function() {
		return "ontouchstart" in document.documentElement
			|| navigator.maxTouchPoints > 0
			|| navigator.msMaxTouchPoints > 0;
	};
	if (hasTouch()) {
		try {
			for (var si in document.styleSheets) {
				var styleSheet = document.styleSheets[si];
				if (!styleSheet.rules) continue;

				for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
					if (!styleSheet.rules[ri].selectorText) continue;

					if (styleSheet.rules[ri].selectorText.match(":hover")) {
						styleSheet.deleteRule(ri);
					}
				}
			}
		} catch (ex) {}
	}
}