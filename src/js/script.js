var headerContainer;
var loaderContainer;
var loaderFrontMonogramContainer;
var mainContainer;
var sectionContainer;

var rowsNbCols;
var nbProjects;

var indexSection;
var detailsSection;
var contactSection;

var nbImgsTotal;
var nbImgsLoaded

var validHashes;
var currHash;
var prevHash;

const INDEX_HASH = "Index";
const DETAILS_HASH = "Details";
const CONTACT_HASH = "Contact";

document.addEventListener("DOMContentLoaded", initialize, false);
window.addEventListener("popstate", updateLocation, false);
window.addEventListener("resize", updateCurrSectionPaddingTop, false);

function initialize() {
	indexSection = document.getElementById(INDEX_HASH);
	detailsSection = document.getElementById(DETAILS_HASH);
	contactSection = document.getElementById(CONTACT_HASH);
	
	headerContainer = document.getElementById("header-container");
	loaderContainer = document.getElementById("loader-container");
	loaderFrontMonogramContainer = document.getElementById("loader-front-monogram-container");
	mainContainer = document.getElementById("main-container");
	sectionContainer = document.getElementById("section-container");

	// Retrieve the valid hashes

	validHashes = [INDEX_HASH, CONTACT_HASH];
	projects.order.forEach(function(projectName) {
		validHashes.push(projects.list[projectName].hash);
	});

	currHash = INDEX_HASH;

	// Set some constants

	rowsNbCols = [4, 4, 4];
	nbProjects = projects.order.length;

	// Update the location

	updateLocation();
}

// Location

function updateLocation() {

	// Read the curent window hash
	currHash = window.location.hash.substr(1);

	// If the hash is not valid, we set index as the default one
	if (validHashes.indexOf(currHash) < 0) {
		currHash = INDEX_HASH;
	}

	// Update the current location accordingly
	mainContainer.setAttribute("data-location", currHash);
	sectionContainer.innerHTML = "";

	// Index
	if (currHash == INDEX_HASH) {

		// Create the covers from the projects
		var coversDivs = [];
		projects.order.forEach(function(projectName) {
			coversDivs.push(
				createCoverDiv(projects.list[projectName])
			);
		});

		// Create the index section from the covers and add it to the section container
		var indexSection = createIndexSection(coversDivs, rowsNbCols);
		sectionContainer.appendChild(indexSection);

		// Synchronize the loader with the imgs of the section
		synchronizeLoaderWithImgs(sectionContainer);
	}
	// Contact
	else if (currHash == CONTACT_HASH) {

		// Create the contact section and add it to the section container
		var contactSection = createContactSection(contact);
		sectionContainer.appendChild(contactSection);
		
		// Hide the loader
		displayNoneElem(loaderContainer);
		hideElem(loaderContainer);
	}
	// Details
	else {
		// Create the details section
		var detailsSection = createDetailsSection(
			projects.list[currHash],
			projects.list[projects.order[(((projects.order.indexOf(currHash) - 1) % nbProjects) + nbProjects) % nbProjects]],
			projects.list[projects.order[(((projects.order.indexOf(currHash) + 1) % nbProjects) + nbProjects) % nbProjects]]
		);

		// Add it to the section container
		sectionContainer.appendChild(detailsSection);

		// Synchronize the loader with the imgs of the section
		synchronizeLoaderWithImgs(sectionContainer);
	}
}

function updateCurrSectionPaddingTop() {
	document.getElementById(currHash).style.paddingTop = headerContainer.offsetHeight + "px";
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

function synchronizeLoaderWithImgs(elem, callback) {
	var imgs = elem.querySelectorAll("img");

	// Show the loader
	displayElem(loaderContainer);
	showElem(loaderContainer);


	nbImgsLoaded = 0;
	nbImgsTotal = 0;

	imgs.forEach(function(img) {
		hideElem(img);
		nbImgsTotal++;
		img.addEventListener("load", function() {
			showElem(img);
			nbImgsLoaded++;

			// Update the front loader front monogram height
			loaderFrontMonogramContainer.style.height = ((nbImgsLoaded / nbImgsTotal) * 60) + "px";

			if (nbImgsLoaded == nbImgsTotal) {
				
				// Reset the loader front monogram height
				loaderFrontMonogramContainer.style.height = "0px";

				// Add a padding to the current section of the header height
				updateCurrSectionPaddingTop();

				// Get on top !
				document.body.scrollTop = 0; // For Safari
				document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

				hideElem(loaderContainer);
				setTimeout(function() {
					displayNoneElem(loaderContainer);
				}, 300);
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

function createIndexSection(content, rowsNbCols) {
	var indexSection = document.createElement("section");
	var gridDiv = document.createElement("div");
	
	var rowIdx = 0;
	var colIdx = 0;

	while (colIdx < content.length) {
		const nbCols = rowsNbCols[rowIdx];

		let rowDiv = document.createElement("div");
		rowDiv.classList.add("row");

		for (let j = 0; j < nbCols && colIdx < content.length; j++) {
			let colDiv = document.createElement("div");
			colDiv.classList.add("col");

			colDiv.appendChild(content[colIdx]);
			rowDiv.appendChild(colDiv);
			
			colIdx++;
		}

		gridDiv.appendChild(rowDiv);
		
		rowIdx++;
	}
	
	indexSection.id = INDEX_HASH;
	indexSection.appendChild(gridDiv);

	return indexSection;
}

function createCoverDiv(project) {
	var coverDiv = document.createElement("div");
	var titleSpan = document.createElement("span");
	var coverImg = document.createElement("img");
	var linkA = document.createElement("a");
	
	// Title

	titleSpan.textContent = project.title;

	coverDiv.appendChild(titleSpan);

	// Image

	coverImg.src = "src/img/" + project.hash + "/0.jpg";
	coverImg.classList.add("cover-img");

	// Link

	linkA.classList.add("cover-link");
	linkA.href = "#" + project.hash
	linkA.appendChild(coverImg);

	coverDiv.appendChild(linkA);

	// Container

	coverDiv.classList.add("cover");

	return coverDiv;
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

	var htmlList = parseHTMLFromText(contact.text, null);
	
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
		
		paragraph = paragraph.replace(/\[(.*?)\]/g, function(match, capture) {
			if (capture.indexOf(".mp4") == capture.length - 4) {
				let video = document.createElement("video");
				let source = document.createElement("source");

				source.src = "src/img/" + hash + "/" + capture;
				source.type = "video/mp4";

				video.controls = true;
				video.appendChild(source);
				
				return video.outerHTML;
			}
			else {
				let img = document.createElement("img");
				let a = document.createElement("a");

				img.src = "src/img/" + hash + "/" + capture;

				a.href = "src/img/" + hash + "/" + capture;
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