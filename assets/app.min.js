window.addEventListener('DOMContentLoaded',function () {

	// declare variables

	const sm = 640;
	const md = 768;
	const lg = 1024;
	const xl = 1280;

	console.log('%c T H E O R E M', 'font-weight: bold; font-size: 40px; color: #555');

	// CartJS.init(window.cart);

	// init 

	const body = document.querySelector('body');
	const navigation = document.querySelector('.site-header');

	function toggleAnimation(element) {
		// toggle remove 
		if (element.hasAttribute('data-remove-class')) {
			let removeClasses = element.dataset.removeClass
			let remClsArr = removeClasses.split(' ');
			remClsArr.map(cl => element.classList.toggle(cl));
		}

		// toggle Active
		if (element.hasAttribute('data-add-class')) {
			let activeClasses = element.dataset.addClass
			let actClsArr = activeClasses.split(' ');
			actClsArr.map(cl => element.classList.toggle(cl));
		}
		
	}

	//Smooth scroll 
	function scrollTo(element) {
		window.scroll({behavior: 'smooth', left: 0, top: element.offsetTop});
	}

	function scrolledPast(pos){
		return window.pageYOffset > pos ? true : false; 
	}
	
	// toggle content
	function toggleContent(element) {
		// set content for removal 
		if (element.hasAttribute('data-remove-content')) {
			var removeContent = element.dataset.removeContent
		}

		// set content for addition 
		if (element.hasAttribute('data-add-content')) {
			var addContent = element.dataset.addContent
		}
		
		if(element.innerHTML == removeContent) {
			element.innerHTML = addContent
		} else if (element.innerHTML == addContent) {
			element.innerHTML = removeContent
		} else {
			console.log('Content Does not match either');
		}
		
	}

	function debounce(fn,delay){
		let timeout;
		return function(...args){
			if(timeout) {clearTimeout(timeout);}
			timeout = setTimeout(() => fn(...args) ,delay);
		}
	}

	// Siblings selector 

	function getAllSiblings(element, parent) {
        const children = [...parent.children];
        return children.filter(child => child !== element);
    }

	// Match Height

	function setHeight(el, val) {
		if (typeof val === "function") val = val();
		if (typeof val === "string") el.style.height = val;
		else el.style.height = val + "px";
	}
	  
	var equalheight = function () {

		var currentTallest = 0,
			currentRowStart = 0,
			rowDivs = new Array(),
			$el,
			topPosition = 0;

		var matchHeightSelectors = Array.from(document.querySelectorAll('[data-match-height]')).map(x => x.dataset.matchHeight).filter((value, index, self) => self.indexOf(value) === index)

		matchHeightSelectors.forEach(x => {
			const selector = '[data-match-height="'+ x +'"]' 
		
			document.querySelectorAll(selector).forEach((el, i) => {

				el.style.height = "auto";
				topPosition = el.offsetTop;
				if (currentRowStart != topPosition) {
					for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
						setHeight(rowDivs[currentDiv], currentTallest)
					}
					rowDivs.length = 0;
					currentRowStart = topPosition;
					currentTallest = parseFloat(getComputedStyle(el, null).height.replace("px", ""))
					rowDivs.push(el);
				} else {
					rowDivs.push(el);
					currentTallest = (currentTallest < parseFloat(getComputedStyle(el, null).height.replace("px", ""))) ? (parseFloat(getComputedStyle(el, null).height.replace("px", ""))) : (currentTallest);
				}
				for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
					setHeight(rowDivs[currentDiv], currentTallest)
				}
			})
		})
	}

	window.addEventListener("load", function(){
		equalheight();
		
	});

	window.addEventListener("resize",debounce(equalheight,300));


	// Match Height End

	//Cart summary logic
	const cartSummary = document.querySelector("[data-cart-count]");
	if(cartSummary && !window.location.href.includes("/cart")){

		cartSummary.textContent = window.cart.item_count;	

		document.addEventListener("itemAdded",()=>{	
			$.getJSON('/cart.js', function (cart, textStatus) {
				cartSummary.textContent = cart.item_count;
			});
			cartSummary.classList.add("shake-once");
			setTimeout(()=> {cartSummary.classList.remove("shake-once")} , 600)
		})

		document.addEventListener("itemRemoved",()=>{
			$.getJSON('/cart.js', function (cart, textStatus) {
				cartSummary.textContent = cart.item_count;
			});
			cartSummary.classList.add("shake-once");
			setTimeout(()=> {cartSummary.classList.remove("shake-once")} , 600)
		})
	}

	
	const burger_menu = document.querySelector('[data-menu-icon]');
	const menu = document.querySelector('[data-nav]');

	burger_menu.addEventListener('click', toggleMenu);

	function toggleMenu(e) {
		e.preventDefault();
		toggleAnimation(menu)
		toggleAnimation(body)
		toggleAnimation(burger_menu.children[0])
		toggleAnimation(burger_menu.children[1])
		toggleAnimation(burger_menu.children[2])
	}

	//NEWSLETTER LOGIC

	let newsletterButton = document.querySelector("[data-newsletter-trigger]");
	if(newsletterButton){
		//show below fold only
		window.addEventListener("scroll",debounce(()=>{
			if(scrolledPast(window.innerHeight)){
				newsletterButton.removeAttribute("aria-hidden");
			}
			else{
				newsletterButton.setAttribute("aria-hidden",true);
			}
		},200));
		const newsletterOverlay = document.querySelector("[data-newsletter-overlay]");
		const newsletterModal = document.querySelector("[data-newsletter-modal]");
		const closeButton = document.querySelector("[data-close-newsletter-modal]")
		newsletterButton.addEventListener("click",function(e){
			toggleAnimation(newsletterOverlay);
			toggleAnimation(newsletterModal);
		})
		closeButton.addEventListener("click",function(e){
			toggleAnimation(newsletterOverlay);
			toggleAnimation(newsletterModal);
		})
		document.addEventListener("click",function(e){
			if(e.target.hasAttribute("data-newsletter-overlay") && e.target.classList.contains("visible")){
				toggleAnimation(newsletterOverlay);
				toggleAnimation(newsletterModal);
			}
		}
		)
		
	}

	//FLIP CARD LOGIC
	//Elements with classes to add: card , card-inner, card-front , cadr-back 
	Array.from(document.querySelectorAll("[data-flip-card-toggle]")).forEach(function(element){
		element.addEventListener("click",function(e){
			e.preventDefault();
			//grab the card the toggle is associated with and assign flipped
			const card = e.currentTarget.closest("[data-flip-card]");
			card.classList.toggle("flipped");
		})
	})
	// initalise global vue app so multiple sections can be add to the site to use product cards 

	function dropdownFn(dropdown) {
		if (dropdown.dataset.closeSiblings && window.innerWidth >= xl) {
			const siblings = getAllSiblings(dropdown.parentElement, dropdown.parentElement.parentElement);
			Array.from(siblings).forEach(child => {
				if(child.children[1]) {
					let activeClass = child.children[1].dataset.addClass.split(' ');
					if (child.children[1].classList.contains(activeClass[0])) {	
						toggleAnimation(child.children[0]);
						toggleAnimation(child);
						if (child.children[0]) {
							toggleAnimation(child.children[0].children[0])
						}
						if (child.children[1]) {
							toggleAnimation(child.children[0].children[0])
						}
						toggleAnimation(child.children[1])
					}
				}
			});
		}
		
		toggleAnimation(dropdown)
		dropdown.classList.toggle("expanded");
		toggleAnimation(dropdown.parentElement)
		if (dropdown.children[0]) {
			toggleAnimation(dropdown.children[0])
		}
		if (dropdown.children[1]) {
			toggleAnimation(dropdown.children[1])
		}
		if (dropdown.children[2]) {
			toggleAnimation(dropdown.children[2])
		}
		toggleAnimation(dropdown.nextElementSibling)
	}

	function headerDropdownInit() {
		var data_header_dropdown = document.querySelectorAll('[data-header-dropdown]');
		Array.from(data_header_dropdown).forEach((dropdown)=> {
			if (dropdown.classList.contains('init')) return;
			dropdown.classList.add('init')

			if(window.innerWidth >= xl) {
				dropdown.onmouseenter = () => eventHandler(event)
				dropdown.parentElement.onmouseleave = () => eventHandler(event)

				function eventHandler (event) {
					dropdownFn(dropdown)
				}
				dropdown.addEventListener('click', (e) => {
					e.preventDefault();
				});
			} else {

				dropdown.addEventListener('click', (e) => {
					e.preventDefault();
					dropdownFn(dropdown)
					
				})

			}

			// Checks if dropdown has data attr of data-close-siblings if it does and the window size is smaller than xl (1280) then it runs this with it always opens the dropdown
		})
	};

	headerDropdownInit();

	function dropdownInit() {
		var data_dropdown = document.querySelectorAll('[data-dropdown]');
		Array.from(data_dropdown).forEach((dropdown)=> {
			if (dropdown.classList.contains('init')) return;
			dropdown.classList.add('init')
			dropdown.addEventListener('click', (e) => {
				e.preventDefault();
				// Checks if dropdown has data attr of data-close-siblings if it does and the window size is smaller than xl (1280) then it runs this with it always opens the dropdown

				dropdownFn(dropdown)
			})
		})
	};

	dropdownInit();

	//Need to check if the click was inside menu

	document.addEventListener("click", (e) => {
		if( !navigation.contains(e.target) ){
			// Close all menu dropdowns 
			Array.from(navigation.querySelectorAll("[data-dropdown]")).forEach((dropdown) => {
				if(dropdown.classList.contains('expanded')){
					dropdownFn(dropdown)
				}
			})
		}
	})

	// initalise global vue app so multiple sections can be add to the site to use product cards 

	window.apps = {}

	let autoStageCounter = 1

	const appInitialise = () => {

		document.removeEventListener("vue-initialise", appInitialise) 

		// setInterval(() => {

			// create a new app for any unmounted data-vue-app elements

			document.querySelectorAll('[data-vue-app]:not([data-v-app])').forEach(element => {
				
				if(!element.id) {
					element.id = 'vue-autostage-' + autoStageCounter++
				}

				window.apps[element.id] = buildApp(element.id)
				// console.count("buildApp(element.id) count");
				console.log('%cCreated app: ' + element.id)
			})

			swiperInit();
			dropdownInit();

		// }, 500)

	}

	document.addEventListener('vue-initialise', appInitialise )
	document.dispatchEvent(new Event('vue-initialise'))

	const handleIntersection = (entries, observer) => {
        if (!entries[0].isIntersecting) return;

        observer.unobserve(productRecommendationsSection);

        const url = productRecommendationsSection.dataset.url;

        fetch(url)
        .then(response => response.text())
        .then(text => {
            const html = document.createElement('div');
            html.innerHTML = text;
            const recommendations = html.querySelector('.product-recommendations');

            if (recommendations && recommendations.innerHTML.trim().length) {
                productRecommendationsSection.innerHTML = recommendations.innerHTML;
				
				setTimeout(function(){
					document.addEventListener('vue-initialise', appInitialise )
					document.dispatchEvent(new Event('vue-initialise'))
				}, 100)
			}
        
        })
        .catch(e => {
            console.error(e);
        });
    };

    const productRecommendationsSection = document.querySelector('.product-recommendations');
    const observer = new IntersectionObserver(handleIntersection, {rootMargin: '0px 0px 200px 0px'});

    if (productRecommendationsSection) {
        observer.observe(productRecommendationsSection);
    }


	// SWIPER

	// build array of all swipers to init swiper
	function swiperInit() {
		const swipers = document.querySelectorAll('[data-swiper]')

		Array.from(swipers).forEach((swiperCarousel, index)=> {
			if (swiperCarousel.classList.contains('swiper-initialized')) return;	
			// json parse dataset
			let carouselSettings = JSON.parse(swiperCarousel.dataset.swiperSettings)
			// init swiper
			let carousel = new Swiper(swiperCarousel,  carouselSettings);
			return carousel;
			
		});
	}
	
	swiperInit()

	//Swiper event handlers for individual instances
	if(document.querySelector(".hero-banner-swiper")){
		const heroBanner = document.querySelector(".hero-banner-swiper");
		const pagination = heroBanner.querySelector(".swiper-pagination");
		
		heroBanner.swiper.on('transitionEnd', function () {
			const currentSlide = heroBanner.querySelector(".swiper-slide-active");
			const paginationColor = currentSlide.dataset.slideColorScheme;
			if (paginationColor == 'light-mode') {
				pagination.classList.remove("dark-mode")
				pagination.classList.add("light-mode")
			}
			else{
				pagination.classList.add("dark-mode")
				pagination.classList.remove("light-mode")
			}
			
		  });

	}
	//SWIPER EDUCATION PAGE SPOTLIGHT CAROUSEL

	if(document.querySelector("[data-education-spotlight-swiper]")){
		console.log("FOUND EDUCATION SPOTLIGHT");
		const educationSpotlightThumbCarousel = new Swiper("[data-education-spotlight-thumb-swiper]", {
			direction: "horizontal",
			loop: false, 
			centeredSlides: false, 
			speed: 500, 
			slidesPerView: 'auto',
			threshold: 40,
			spaceBetween: 16, 
			breakpoints: {
				768: {
				  slidesPerView: 4,
				  spaceBetween: 24, 
				},
				1024: {
				  slidesPerView: 4,
				  spaceBetween: 24, 
				},
			}, 
			autoplay: false, 
			draggable: true,
			freeMode: true,
			watchSlidesProgress: true,
			slideToClickedSlide: true
		});
		const educationSpotlightInitialSlide = document.querySelector("[data-slide-count]") ? Math.floor(parseInt(document.querySelector("[data-slide-count]").dataset.slideCount) / 2) : 0;
		
		const educationSpotlightCarousel = new Swiper("[data-education-spotlight-swiper]", {
			spaceBetween: 24,
			centeredSlides: true,
			threshold: 20,
			speed: 400,
			initialSlide: 0,
			slidesPerView: 'auto',
			navigation:
				{ 
					nextEl: '.education-spotlight-carousel .swiper-button-next',
					prevEl: '.education-spotlight-carousel .swiper-button-prev' 
				},
			breakpoints: {
				768: {
					centeredSlides:false,
				 },
				 1024: {
					centeredSlides:false,
					slidesPerView: 'auto',
					spaceBetween: 24
				 }},
			autoplay: false,
			draggable: true,
			thumbs:{
				swiper: educationSpotlightThumbCarousel
			}
		});
	
		  educationSpotlightThumbCarousel.on("click", (instance) => {
			if(instance.clickedSlide){
				Array.from(document.querySelectorAll("[data-education-spotlight-thumb-swiper] .swiper-slide")).forEach((slide,index)=>{
					slide.classList.remove('swiper-slide-thumb-active');
				  if (index === educationSpotlightThumbCarousel.clickedIndex) {
					slide.classList.add('swiper-slide-thumb-active');
				  }
				})
			}
		  })
	}

	if(document.querySelector("[data-product-main-swiper]")){
		// SWIPER PRODUCT PAGE

		const productThumbSwiper = new Swiper("[data-product-thumb-swiper]", {
			direction: "horizontal",
			loop: false, 
			spaceBetween: 8, 
			centeredSlides: false, 
			speed: 500, 
			slidesPerView: 4,
			threshold: 40,
			breakpoints: {
				768: {
					slidesPerView: 4,
				},
				1024: {
					spaceBetween: 16, 
					slidesPerView: 4,
				},
			}, 
			autoplay: false, 
			draggable: true,
			freeMode: true,
			watchSlidesProgress: true,
			slideToClickedSlide: true
		});

		const productMainSwiper = new Swiper("[data-product-main-swiper]", {
			loop: false,
			centeredSlides: false, 
			speed: 500, 
			slidesPerView: 1, 
			autoplay: false,
			draggable: true,
			thumbs: {
				swiper: productThumbSwiper,
			}
		});
	}

	

	// vimeo logic

	// all vimeos needs to be wrapped in this selector
	// Adapted to use a custom play button but native controls after the video starts 
	const vimeoPlayer = document.querySelectorAll('.video-wrapper');
	// const btnSpan = document.querySelectorAll('[data-vimeo-play]');

	if(vimeoPlayer) {
		
		Array.from(vimeoPlayer).forEach((vimeo)=>{

		let player = new Vimeo.Player(vimeo.querySelector('iframe'));
		let iframe = vimeo.querySelector("iframe");
		let playBtn = vimeo.querySelector("[data-vimeo-play]");


		player.on("pause",(e)=>{
	
			toggleAnimation(iframe);
			toggleAnimation(playBtn);
			toggleAnimation(vimeo);
	
		})

		vimeo.addEventListener('click', (e) => {	
			player.getPaused().then(function(paused) {
				if(paused){
					toggleAnimation(iframe);
					toggleAnimation(playBtn);
					toggleAnimation(vimeo);
					player.play();
				} else {
					player.pause();
			
				}
						}); 
					}
				)
			}
		);

	}

	//dynamic video popup. Relies on the dynamic-video-popup snippet or section + trigger button anywhere you want with [data-video-overlay-trigger] and [data-video-id] with the vimeo id
	//TODO: refactor at some point as this is not very graceful

	const popup = document.querySelector("[data-dynamic-video-popup]")

	if(popup){
		function closePopup() {
			popup.removeAttribute('aria-expanded');
			video.setAttribute('src', "");
		}

		//sets padding top variable based on video aspect
		function setupAspect(vimeoWrapper, activePlayer){
			Promise.all([activePlayer.getVideoWidth(), activePlayer.getVideoHeight()]).then(function(dimensions) {
				var width = dimensions[0];
				var height = dimensions[1];
				const aspect = ((height / width) * 100);
				console.log("aspect",`${aspect}%`)
				vimeoWrapper.style.setProperty('--video-aspect-ratio', `${aspect}%`);  
			});

		}

		const vimeoPlayer = popup.querySelector('.video-wrapper-dynamic');
        const video = popup.querySelector('#vimeo-video');
        const videoOverlay = popup.querySelector("[data-video-overlay]")
        const popupTrigger = document.querySelectorAll("[data-video-overlay-trigger]")
        const popupClose = popup.querySelector("[data-close-video-popup]")
        const playBtn = popup.querySelector("[data-vimeo-play]");
		let activePlayer;

        Array.from(popupTrigger).forEach((trigger) => {
            trigger.addEventListener("click", function() {
                popup.setAttribute("aria-expanded", true);
                let videoID = trigger.dataset.videoId;
                let fullUrl = `https://player.vimeo.com/video/${videoID}?api=1&player_id=banner_player&autopause=0&autoplay=0&badge=0&byline=0&portrait=0&title=0&background=0&loop=0&muted=0&controls=1`
				

				if(activePlayer){
					console.log("loading another video")
					activePlayer.loadVideo(videoID).then(() => {
						console.log("Video loaded:", videoID);
						playBtn.setAttribute("aria-pressed", true)
						videoOverlay.setAttribute("aria-pressed", true)
						setupAspect(vimeoPlayer, activePlayer)
						activePlayer.play();
					}).catch((error) => {
						console.error("Error loading video:", error);
					});
				}

				else{
					video.setAttribute('src', fullUrl);
					console.log("creating a new video")
					let player = new Vimeo.Player(video);
					activePlayer = player;

					//get video dimensions
					
					setupAspect(vimeoPlayer, activePlayer)
					playBtn.setAttribute("aria-pressed", true)
					videoOverlay.setAttribute("aria-pressed", true)
					activePlayer.play();
					console.log(player)
					player.on("pause", (e) => {
						console.log("pausing")
						playBtn.removeAttribute("aria-pressed")
						videoOverlay.removeAttribute("aria-pressed")
						
					})

					vimeoPlayer.addEventListener('click', (e) => {
						console.log(vimeoPlayer)
						player.getPaused().then(function(paused) {
							if (paused) {
								playBtn.setAttribute("aria-pressed", true)
								videoOverlay.setAttribute("aria-pressed", true)
								player.play();
							} else {
								playBtn.removeAttribute("aria-pressed")
								videoOverlay.removeAttribute("aria-pressed")
								player.pause();
	
							}
						});
					})
				}
            })
        })

		//closing mechanism

		document.addEventListener("click",function(e){
			if(e.target.classList.contains("dynamic-video-popup-overlay")){
				popup.removeAttribute('aria-expanded');
				activePlayer.unload().then(function() {
					console.log("video unloaded")
				  });
				// video.setAttribute('src', "");
			}
		})
        if (popupClose != null) {
			document.addEventListener("keydown", function (e) {
				if (e.key === "Escape") {
					popup.removeAttribute('aria-expanded');
					activePlayer.unload().then(function() {
					console.log("video unloaded")
				  });
				}
			});
            popupClose.addEventListener("click", function() {
                popup.removeAttribute('aria-expanded');
				activePlayer.unload().then(function() {
					console.log("video unloaded")
				  });
				// video.setAttribute('src', "");
            })
        }
	}


	// vimeo logic end


	//  Header Search form
	
	const searchTrigger = document.querySelectorAll('[data-search-trigger]')
	const searchForm = document.querySelector('[data-search-form]')

	Array.from(searchTrigger).forEach((button)=>button.addEventListener('click', (e) => {
		e.preventDefault();
		toggleAnimation(searchForm);
	}))
	
	

	//  Header Search form end

	// Searh page filtering
	const searchPage = document.querySelector("[data-search-results-page]");
	if(searchPage){
		const filterTriggers = searchPage.querySelectorAll("[data-search-filter]");
		Array.from(filterTriggers).forEach((button) => {
			button.addEventListener("click",function(e) {
				e.preventDefault()
				//Toggle active state
				const currentActiveFilter = searchPage.querySelector("[data-search-filter].active")
				let previousActiveCategory;
				
				if(currentActiveFilter){
					previousActiveCategory = currentActiveFilter.dataset.category;
					toggleAnimation(currentActiveFilter);
				}
				
				const activeCategory = e.target.dataset.category;
				
				if(activeCategory != previousActiveCategory){
					toggleAnimation(e.target);
				}

				const results = searchPage.querySelectorAll("div[data-category]")

				//if the same button was clicked again show everything
				if(previousActiveCategory == activeCategory){
					Array.from(results).forEach(result => {
						result.classList.remove("hidden");
					})	
				}
				else{
					Array.from(results).forEach(result => {
						const resultCategory = result.dataset.category;
						if(resultCategory == activeCategory ){
							result.classList.remove("hidden");
						}
						else{
							result.classList.add("hidden");
						}
					})
				}

				
			})
		})
	}
	
	// End of Searh page filtering


	// Quicklink nav

	const quicklinkNav = document.querySelector("[data-quicklink-nav]");

	if(quicklinkNav){
		const quicklinkNavSpacer = document.querySelector("[data-quicklink-spacer]");

		// SHOW / HIDE quicklink nav
		window.addEventListener("scroll",()=>{
			if(scrolledPast(quicklinkNav.getBoundingClientRect().bottom)){
				quicklinkNavSpacer.removeAttribute("aria-hidden");
				quicklinkNav.setAttribute("aria-expanded",true);
			}
			else{
				quicklinkNavSpacer.setAttribute("aria-hidden",true);
				quicklinkNav.removeAttribute("aria-expanded");
			}
		});
		
		const quicklinkNavLinks = document.querySelectorAll(".quicklink-nav [data-quicklink]");
        Array.from(quicklinkNavLinks).forEach(link => {
            link.addEventListener("click", function(e) {
                const section = link.dataset.quicklink;

                // toggle button and untoggle the previous one
                Array
                    .from(quicklinkNavLinks)
                    .forEach(link => {
                        if (link.hasAttribute("aria-pressed")) {
                            link.removeAttribute("aria-pressed");
                        }
                    })

                    e
                    .target
                    .setAttribute("aria-pressed", true);

                scrollTo(document.querySelector(`#${section}`));

            })
        })
	}

	// locale and currency form

	const localeSelector = document.querySelectorAll('[data-locale-selector]')
	const currencySelector = document.querySelectorAll('[data-currency-selector]')

	const localizationForm = document.querySelectorAll('[data-localization-form]')

	const localeIsoValue = document.querySelectorAll('[data-locale-iso-value]')
	const currencyIsoValue = document.querySelectorAll('[data-currency-iso-value]')

	Array.from(localeSelector).forEach((form)=>form.addEventListener('change', function() {
        localizationForm[0].submit()
    }));

	Array.from(currencySelector).forEach((form)=>form.addEventListener('change', function() {
        localizationForm[0].submit()
    }));

	Array.from(localeIsoValue).forEach((code)=>code.addEventListener('click', (e) => {
		e.preventDefault();
		localeSelector[0].value = code.dataset.localeIsoValue;
		triggerChange(localeSelector[0]);
	}));

	Array.from(currencyIsoValue).forEach((code)=>code.addEventListener('click', (e) => {
		e.preventDefault();
		currencySelector[0].value = code.dataset.currencyIsoValue;

		triggerChange(currencySelector[0]);
	}));

	function triggerChange(element) {
		let changeEvent = new Event('change');
		element.dispatchEvent(changeEvent);
	}

	// locale and currency form END

	// FAQS

	if(this.document.querySelector(".faq-template")){
		const faq_items = this.document.querySelectorAll('[data-question]');
		const category_selector = this.document.querySelectorAll('[data-category-selector]');
		const categories = this.document.querySelectorAll('[data-category]');
		const faq_error = this.document.querySelector('.faq-template .error');
		
		Array.from(category_selector).forEach((item)=>item.addEventListener('click', (e) => {
			e.preventDefault();

			const siblings = getAllSiblings(item, item.parentElement);
			Array.from(siblings).forEach(child => {
				let activeClass = child.dataset.addClass.split(' ');
				if (child.classList.contains(activeClass[0])) {
					toggleAnimation(child);
					// toggleAnimation(child.lastElementChild);
				}
			});

			let removeClass = item.dataset.removeClass.split(' ');
			if (item.classList.contains(removeClass[0])) {
				toggleAnimation(item);
				// toggleAnimation(item.lastElementChild);
			}

			var cat = item.dataset.cat
			Array.from(categories).forEach((category)=> {
				if(category.dataset.cat == cat){
					if (category.classList.contains(category.dataset.removeClass)) {
						toggleAnimation(category);
					}
				} else {
					category.classList.remove('block');
					category.classList.add('hidden');
				}
			});

			let removeSpan = document.querySelectorAll('[data-question] p span');
			return Array.from(removeSpan).forEach(element => {
				element.classList.remove('highlight');
			});

		}));

		Array.from(faq_items).forEach((item)=>item.addEventListener('click', (e) => {
			e.preventDefault();
			
			if (item.children[1].classList.contains('active')) {
				item.children[1].classList.remove('active');
			} else {
				item.children[1].classList.add('active');
			}
			toggleAnimation(item.children[1]);
		}));

		const form = document.getElementById('faq_form');
		
		if(form) {
			if (form.addEventListener){
				form.addEventListener("submit", (e) => searchSubmit(e), false);  //Modern browsers
			} else if(form.attachEvent){
				form.attachEvent('onsubmit', (e) => searchSubmit(e));            //Old IE
			}
		}

		function contains(selector, text) {
			var elements = document.querySelectorAll(selector)
			return Array.from(elements).filter(function(element) {
				if (element.parentElement.classList.contains('active')) {
					element.parentElement.classList.remove('active');
					toggleAnimation(element.parentElement);
					toggleAnimation(element.parentElement.parentElement.children[0]);
				}
				var contentLowercase = element.textContent.toLowerCase()
				return RegExp(text).test(contentLowercase);
			});
		}
		
		function searchSubmit(e){
			e.preventDefault();
			let search = document.getElementById('search_faq').value.toLowerCase()

			if (search.length >= 1) {

				faq_error.classList.remove('block');
				faq_error.classList.add('hidden');
				
				// reset span
				let removeSpan = document.querySelectorAll('[data-question] p span');
				Array.from(removeSpan).forEach(element => {
					element.outerHTML = element.outerHTML.replace( /(<([^>]+)>)/ig, '');
					
					//  element.classList.remove('highlight') 
					});

				// reset categories
				Array.from(categories).forEach((category)=> {
					let addClass = category.dataset.addClass.split(' ');
					if (category.classList.contains(addClass[0])) {
						toggleAnimation(category);
					}
				});

				// reset headings
				Array.from(category_selector).forEach((item) => {
					let addClass = item.dataset.addClass.split(' ');
					if (item.classList.contains(addClass[0])) {
						toggleAnimation(item);
						// toggleAnimation(item.lastElementChild);
					}
				});


				// find results
				let found = contains('[data-question] p', search);
				if (found.length == 0) {
					toggleAnimation(faq_error);
				}
			
				for (let i = 0; i < found.length; i++) {
					
					let elem = found[i];

					// if already active do nothing else trigger accordian to open
					if (elem.parentElement.classList.contains('active')) {
						
					} else {
						elem.parentElement.classList.add('active');
						toggleAnimation(elem.parentElement);
						// toggleAnimation(elem.parentElement.parentElement.children[0]);
					}
					// active the category headers
					Array.from(category_selector).forEach((item) => {
						if(item.dataset.cat == elem.parentElement.parentElement.dataset.cat || item.dataset.cat == elem.parentElement.parentElement.parentElement.dataset.cat){
							let addClass = item.dataset.addClass.split(' ');
							if (item.classList.contains(addClass[0])) {
								toggleAnimation(item);
								// toggleAnimation(item.lastElementChild);
							}
						}
					});

					Array.from(categories).forEach((category)=> {
						if(category.dataset.cat == elem.parentElement.parentElement.dataset.cat || category.dataset.cat == elem.parentElement.parentElement.parentElement.dataset.cat){
							let removeClass = category.dataset.removeClass.split(' ');
							if (category.classList.contains(removeClass[0])) {
								toggleAnimation(category);
							}
						}
					});

					var innerHTML = elem.innerHTML;
					var index = innerHTML.toLowerCase().indexOf(search);
					if (index >= 0) { 
						innerHTML = innerHTML.substring(0,index) + "<span class='highlight'>" + innerHTML.substring(index, index + search.length) + "</span>" + innerHTML.substring(index + search.length);
						elem.innerHTML = innerHTML;
					}
				
				
				}
				
			} else {
				
				let removeSpan = document.querySelectorAll('[data-question] p span');
				return Array.from(removeSpan).forEach(element => {
					// element.classList.remove('highlight');
					element.outerHTML = element.outerHTML.replace( /(<([^>]+)>)/ig, '');
				});
				
			}
		}
	}

	
	

	const article_content = document.querySelector('[data-article-content]');

	if (article_content) { 

		const article_image = article_content.querySelectorAll('img');
		Array.from(article_image).forEach(img => {
			if(!img.parentNode.classList.contains('article-content')){
			let imgWrapper = img.parentElement;
			img.parentElement.classList.add(`img-wrapper`);

			let alt = img.getAttribute('alt');
			let append_class = 'single';

			if (alt.toLowerCase().includes('full')) {
				append_class = 'width-full';
				img.classList.add(`${append_class}`)
				//Add placeholder
				let height = window.getComputedStyle(img).height;
				img.parentElement.style.height = height;

			}

			if (alt.toLowerCase().includes('half')) {
				img.parentElement.classList.add(`half-wrapper`);
				append_class = 'half'
				img.classList.add(`${append_class}`)
				}
	
			}
			
		})
		

	}

	const productDetails = document.querySelectorAll('[data-product-details]');
	// const productQuickButtons = document.querySelectorAll('[data-qb-button]');
	const productQuickModal = document.querySelectorAll('[data-qb-modal]');
	
	// creates a scope for the quick buy modal
	Array.from(productDetails).forEach((scope) => {
		var x = scope.dataset.productId

		const trigger = scope.querySelectorAll('[data-qb-button]')
		
		Array.from(trigger).forEach((item)=>item.addEventListener('click', (e) => {			
			e.preventDefault();
			toggleAnimation(document.querySelector('[data-qb-modal="'+x+'"]'));
			toggleAnimation(document.querySelector('[data-overlay="'+x+'"]'));
		}));

		const subscriptionToggle = scope.querySelectorAll('[data-sub-toggle]');
		
        Array.from(subscriptionToggle).forEach((item)=>item.addEventListener('click', (e) => {
            e.preventDefault();
            if (!item.classList.contains('active')) {
                Array.from(subscriptionToggle).forEach((button) => {
                    toggleAnimation(button);
                });
                toggleAnimation(document.querySelector('[data-frequency-selector="'+x+'"]'))
            }
        }));
		
	});

	// appends the modal to the body after setting up the scope.
	// This is required because the cards can sit within a transformed element and then can't be fixed to the screen
	Array.from(productQuickModal).forEach((modal) => {
		body.appendChild(modal);
	});

	
	
	
	// Share Api

	const shareButton = document.querySelector('.share-button');
	const shareDialog = document.querySelector('.share-dialog');
	const closeButton = document.querySelector('.close-button');

	if(shareButton) {

		shareButton.addEventListener('click', event => {
		if (navigator.share) { 
		navigator.share({
			title: shareButton.dataset.title,
			url: shareButton.dataset.url
			}).then(() => {
			console.log('Thanks for sharing!');
			})
			.catch(console.error);
			} else {
				toggleAnimation(shareDialog);
			}
		});

		closeButton.addEventListener('click', event => {
			toggleAnimation(shareDialog);
		});

	}

	// Copy URL

	const copyContent = document.querySelectorAll('[data-copy]');
	
	Array.from(copyContent).forEach((copy)=>copy.addEventListener('click', (e) => {
		e.preventDefault();
		// Get the text field
		var copyText = copy.querySelector("input");

		// Select the text field
		copyText.select();
		copyText.setSelectionRange(0, 99999); // For mobile devices
	  
		 // Copy the text inside the text field
		navigator.clipboard.writeText(copyText.value)
		.then(() => {
		  	console.log("successfully copied");
		})
		.catch(() => {
			console.log("something went wrong");
		});
	  
	}));

	const showPassword = document.querySelectorAll('[data-show-password]');
	
	Array.from(showPassword).forEach((password)=>password.addEventListener("change", (e) => {
		
		var scope = password.parentElement.parentElement

		var x = scope.querySelector('.password');
		
		if (x.type === 'password') {
			x.type = 'text';
		} else {
			x.type = 'password';
		}

		toggleContent(password.nextElementSibling);
	}));


	// toggle section

	// this is used in the account area to toggle between the pages/tags as well as to toggle between edit and add new address

	const toggleVisibility = document.querySelectorAll('[data-toggle-visibility]');
	const toggleWrapper = document.querySelectorAll('[data-toggle-wrapper]');

	Array.from(toggleVisibility).forEach((item)=>item.addEventListener('click', (e) => {
		// e.preventDefault();

		var selector = item.dataset.toggleVisibility

		Array.from(toggleVisibility).forEach((item)=> {
			if(item.hasAttribute('data-add-class')) {
				let addClass = item.dataset.addClass.split(' ');
				if (item.classList.contains(addClass[0])) {
					toggleAnimation(item);
				}
			}
		});
	
		Array.from(toggleWrapper).forEach((wrapper)=> {
			if(wrapper.hasAttribute('data-add-class')) {
				let addClass = wrapper.dataset.addClass.split(' ');
				if (wrapper.classList.contains(addClass[0])) {
					toggleAnimation(wrapper);
				}
			}
		});

		toggleAnimation(document.querySelector(`[data-toggle-wrapper="${selector}"]`));
		toggleAnimation(document.querySelector(`[data-toggle-visibility="${selector}"]`));
		equalheight();
		
	}));

	
	function triggerHashChange() {
		const hash = location.hash[0] == "#" ? location.hash.substring(1) : location.hash;
		if (hash) { 
			const hashSelector = document.querySelectorAll(`[data-toggle-visibility="${hash}"]`);
			hashSelector[0].click()
		}
	}

	triggerHashChange();

    window.addEventListener('hashchange', function(e) {
		triggerHashChange();
    }, false);
	

	document.addEventListener("click", function(event){ 

        if (!event.target.matches('[data-product-view]')) return;

		event && event.preventDefault();
		
		if(event.target.dataset.productView == 'false') {

			const ProductCards = document.querySelectorAll('[data-product-card]');

			Array.from(ProductCards).forEach((card)=> {
				toggleAnimation(card);
			})

			const ProductListToggle = document.querySelectorAll('[data-product-view]');
			Array.from(ProductListToggle).forEach((item)=> {
				item.dataset.productView = 'false';
				toggleAnimation(item);
			});
			event.target.dataset.productView = 'true';
		}

	});

	// Sends event to cart component to trigger open and close 
	const toggleCart = document.querySelectorAll('[data-toggle-cart]');

	Array.from(toggleCart).forEach((item)=>item.addEventListener('click', (e) => {
		document.dispatchEvent(new Event('cartTrigger'));
	}));

	
	//Apply colour to default template
	if(document.querySelector(".shopify-policy__body")){
		document.querySelector('body').style.backgroundColor = '#F6F1E7';
	}
	  
});