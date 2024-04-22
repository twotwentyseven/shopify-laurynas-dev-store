// Function to detect user's operating system
function detectOS() {
    const userAgent = window.navigator.userAgent.toLowerCase();

    if (userAgent.includes("win")) {
        return "windows";
    } else if (userAgent.includes("mac")) {
        return "mac";
    } else {
        return "unknown";
    }
}

// Function to detect user's browser
function detectBrowser() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    console.log("USER AGENT: ", userAgent)

    if (userAgent.includes("firefox")) {
        return "firefox";
    } else if (userAgent.includes("chrome")) {
        return "chrome";
    } else if (userAgent.includes("edg")) { // Including Microsoft Edge (Chromium-based)
        return "edge";
    } else {
        return "unknown";
    }
}

// Normalize header font for windows chrome and edge

// function normalizeFont() {
// 	const os = detectOS();
// 	const browser = detectBrowser();
// 	const fontHeadlineElements = document.querySelectorAll('.font-headline');
// 	console.log("checking if normalization is needed..")
// 	console.log("OS: ",os,"BROWSER: " , browser)
// 	// console.log(fontHeadlineElements)

// 	if (os === "windows" && (browser === "chrome" || browser === "edge")) {
// 		console.log("Normalizing font")
// 		fontHeadlineElements.forEach(element => {
// 			element.style.fontFamily = "RP-WinChromeEdge, sans-serif";
// 		});
// 	}
// }
// normalizeFont();

// Debounce
//Prevents frequent function calls on things like resize events etc..  


// resize element

function elementHeight(el) {
    if (window.innerWidth < md) {
        el.style.height = window.innerHeight + 'px';
    } else {
        el.style.height = 'auto'
    }
}

// resize element end

//ACCORDION CARD TOGGLE LOGIC ( if you have some spotlight cards/container that should reveal content after a click on a trigger button ) 
	// Array.from(document.querySelectorAll("[data-spotlight-card]")).forEach(function(element){
		
    //     element.querySelector("[data-spotlight-card-toggle]").addEventListener("click",function(e){
			
    //         e.preventDefault();
    //         toggleAnimation(element.querySelector("[data-spotlight-card-content-wrapper]"));
    //         toggleAnimation(element.querySelector("[data-spotlight-card-overlay]"));
    //         toggleAnimation(element.querySelector("[data-spotlight-card-content]"));
			
    //     })
    // })

    // mailchimp form

	let mcForm = document.querySelectorAll(".mc-form");
	let mcSuccess = document.querySelectorAll(".mc-message.success");
	let mcFail = document.querySelectorAll(".mc-message.error");

	document.MC_callback = function(response) {

		if(response.result == "success") {
			// show success meassage
			Array.from(mcForm).forEach((form)=> {
				toggleAnimation(form);
				Array.from(mcSuccess).forEach((msg)=> {
					if (msg.classList.contains('hidden')) {
						toggleAnimation(msg);
						msg.innerHTML = response.msg
					}
				});
				Array.from(mcFail).forEach((msg)=> {
					if (msg.classList.contains('block')) {
						toggleAnimation(msg);
					}
				});
			});
			
		} else {
			// show error message
			Array.from(mcFail).forEach((msg)=> {
				if (msg.classList.contains('hidden')) {
					toggleAnimation(msg);
					msg.innerHTML = response.msg
				}
			});
		}
	}

	var serializeForm = function (form) {
		var obj = {};
		var formData = new FormData(form);
		for (var key of formData.keys()) {
			obj[key] = formData.get(key);
		}
		return obj;
	};

	
	Array.from(mcForm).forEach((item)=>item.addEventListener("submit", (e) => {
		e.preventDefault();	

		// generate script
		this._script = document.createElement("script");
		this._script.type = "text/javascript";	

		var formData = serializeForm(e.target)
		
		const searchParams = new URLSearchParams();
		Object.keys(formData).forEach(key => searchParams.append(key, formData[key]))
		
		this._script.src = e.target.action + '&' + searchParams.toString() + '&c=document.MC_callback'
		
		// append script to head    
		document.getElementsByTagName("head")[0].appendChild(this._script);	
	}));



    if(window.accessToken) {

		var feed = new Instafeed({
			accessToken: window.accessToken,
			limit: window.limit,
			template: window.instagramTemplate,
			after: () => {
				document.querySelectorAll("#instafeed [data-placeholder]").forEach(item => item.remove() )
			}
		});
		// feed.run() when scroll to #instafeed
		var observerInsta = new IntersectionObserver(function(entries) {
			if (entries[0].isIntersecting === true) {
		feed.run();
				observerInsta.unobserve(document.querySelector('#instafeed'));
			}
		}, { threshold: [0] });
		observerInsta.observe(document.querySelector('#instafeed'));



	}

    // const searchParamsPrev = window.location.search.slice(1);
	// const filterForm = document.querySelector('[data-filter-form]'); // the whole wrapper
	// const formInputs = filterForm.querySelectorAll('input') // all the inputs
	// const collectionSection = document.querySelector('[data-collection]'); // the sections to be async loaded
	// const sectionId = filterForm.dataset.filterForm // section Id

	// Array.from(formInputs).forEach((input)=>input.addEventListener("change", (e) => {
	// 	console.log('clicked', sectionId);
		
	// 	let formData = new FormData(filterForm);
	// 	let searchParams = new URLSearchParams(formData).toString();
	// 	history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);

	// 	// fetch new section
	// 	fetch(`${window.location.pathname}?section_id=${sectionId}&${searchParams}`)
	// 	.then(response => response.text())
	// 	.then((responseText) => {
	// 		unmountCollectionListingApp()
	// 		document.querySelector('#collection').innerHTML = new DOMParser().parseFromString(responseText, 'text/html').querySelector('#collection').innerHTML;
	// 		mountCollectionListingApp()
	// 	})
	// })); 