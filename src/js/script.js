var headerContainer;
var loaderContainer;
var loaderFrontMonogramContainer;
var mainContainer;
var sectionContainer;

var indexSection;
var detailsSection;
var contactSection;

var validHashes;

var currHash;

const INDEX_HASH = "Index";
const DETAILS_HASH = "Details";
const CONTACT_HASH = "Contact";

document.addEventListener("DOMContentLoaded", initialize, false);
window.addEventListener("popstate", refreshLocation, false);
window.addEventListener("resize", refreshPaddingTop, false);

function initialize() {
	indexSection = document.getElementById(INDEX_HASH);
	detailsSection = document.getElementById(DETAILS_HASH);
	contactSection = document.getElementById(CONTACT_HASH);
	
	headerContainer = document.getElementById("header-container");
	mainContainer = document.getElementById("main-container");
	sectionContainer = document.getElementById("section-container");
	loaderContainer = document.getElementById("loader-container");
	loaderFrontMonogramContainer = document.getElementById("loader-front-monogram-container");

	// Retrieve the valid hashes

	validHashes = [INDEX_HASH, CONTACT_HASH];
	data.projects.covers.forEach(function(cover) {
		validHashes.push(cover.hash);
	});
	
	// Update the location
	
	refreshLocation();
}

// Location

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

	// Read the curent window hash
	let currHash = getLocationHash();
	let currAnchor = getLocationAnchor();

	// If the hash is not valid, we set index as the default one
	if (validHashes.indexOf(currHash) < 0) {
		currHash = INDEX_HASH;
	}

	// Update the current location accordingly
	mainContainer.setAttribute("data-location", currHash);
	sectionContainer.innerHTML = '';

	// Index
	if (currHash == INDEX_HASH) {

		// Create the index section from the covers and add it to the section container
		var indexSection = createIndexSection(data.projects.covers);
		sectionContainer.appendChild(indexSection);

		// Synchronize the loader with the imgs of the section
		synchronizeLoaderWithImgs(sectionContainer);
	}
	// Contact
	else if (currHash == CONTACT_HASH) {

		// Create the contact section and add it to the section container
		var contactSection = createContactSection(data.contact);
		sectionContainer.appendChild(contactSection);
		
		// Hide the loader
		displayNoneElem(loaderContainer);
		hideElem(loaderContainer);
	}
	// Details
	else {
		// Create the details section

		
		var projectsHashes = data.projects.covers.map((cover) => {
			return cover.hash;
		});
		var currProjectIndex = projectsHashes.indexOf(currHash);

		var nbProjects = projectsHashes.length;
		var prevProjectHash = projectsHashes[((currProjectIndex - 1) % nbProjects + nbProjects) % nbProjects];
		var nextProjectHash = projectsHashes[((currProjectIndex + 1) % nbProjects + nbProjects) % nbProjects];

		var detailsSection = createDetailsSection(
			{ ...data.projects.contents[currHash], hash: currHash },
			{ ...data.projects.contents[prevProjectHash], hash: prevProjectHash },
			{ ...data.projects.contents[nextProjectHash], hash: nextProjectHash }
		);

		// Add it to the section container
		sectionContainer.appendChild(detailsSection);

		// Synchronize the loader with the imgs of the section
		synchronizeLoaderWithImgs(sectionContainer, currAnchor);
	}
}

function refreshPaddingTop() {
	sectionContainer.style.paddingTop = headerContainer.offsetHeight + "px";
}

// CSS animations

function hasTouch() {
    return "ontouchstart" in document.documentElement
           || navigator.maxTouchPoints > 0
           || navigator.msMaxTouchPoints > 0;
}

// Remove all :hover stylesheets

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

function synchronizeLoaderWithImgs(dom, anchor) {
	var imgs = dom.querySelectorAll("img");
	
	// Show the loader
	displayElem(loaderContainer);
	showElem(loaderContainer);

	let nbImgsLoaded = 0;
	let nbImgsTotal = 0;

	imgs.forEach(function(img) {
		hideElem(img);
		nbImgsTotal++;
		img.addEventListener("load", function() {
			showElem(img);
			nbImgsLoaded++;

			// Update the front loader front monogram height
			loaderFrontMonogramContainer.style.height = ((nbImgsLoaded / nbImgsTotal) * 60) + "px";

			if (nbImgsLoaded == nbImgsTotal) {

				// Keeps the monogram full a few milliseconds
				setTimeout(function() {
					
					// Add a padding to the current section of the header height
					refreshPaddingTop();
					
					let anchorElem;
					if (anchor) {
						anchorElem = document.getElementById(anchor);
						if (anchorElem == null) {
							console.error(`No anchor for '${anchor}'`);
						}
					}

					let scrollTop = (anchorElem) ? anchorElem.offsetTop - headerContainer.offsetHeight : 0;

					// Get on top !
					document.body.scrollTop = scrollTop; // For Safari
					document.documentElement.scrollTop = scrollTop; // For Chrome, Firefox, IE and Opera

					hideElem(loaderContainer);
					setTimeout(function() {
						displayNoneElem(loaderContainer);
						
						// Reset the loader front monogram height
						loaderFrontMonogramContainer.style.height = "0px";
					}, 300);
				}, 400);
			}
		}, false);
	});
}

function hideElem(el) {
	if (!el.classList.contains("opacity-0")) {
		el.classList.add("opacity-0");
	}
}

function showElem(el) {
	if (el.classList.contains("opacity-0")) {
		el.classList.remove("opacity-0");
	}
}

function displayNoneElem(el) {
	if (!el.classList.contains("display-none")) {
		el.classList.add("display-none");
	}
}

function displayElem(el) {
	if (el.classList.contains("display-none")) {
		el.classList.remove("display-none");
	}
}

// DOM Creation

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

	title.textContent = cover.hash.replace(/[^a-z0-9]/gi, " ").toUpperCase();

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
		col2.setAttribute("data-order", cover.large_img_order);

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
	
	// Paragraphs

	pargaraphs.forEach(function(paragraph) {
		let p = document.createElement("p");

		// Anchors

		paragraph = paragraph.replace(/\<\#(.*?)\>$/g, function(match, capture) {
			let div = document.createElement("div");

			div.id = capture;
			
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

				return a.outerHTML;
			}
		});
		
		p.innerHTML = paragraph;

		htmlList.push(p);
	});
	
	return htmlList;
}
