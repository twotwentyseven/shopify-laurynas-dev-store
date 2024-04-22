import { reactive, computed } from 'vue';

const state = reactive({
	isMobile: window.innerWidth < 640,
	isTablet: window.innerWidth < 1024
});


if (window.matchMedia.addEventListener) {
	
	const mobileMediaQuery = window.matchMedia('(max-width: 639px)');
	mobileMediaQuery.addEventListener('change', handleWindowResizeMobile);
	
	function handleWindowResizeMobile(e) {
		if (e.matches) {
			state.isMobile = true;
		} else {
			state.isMobile = false;
		}
	}
	
	const tabletMediaQuery = window.matchMedia('(max-width: 1023px)');
	tabletMediaQuery.addEventListener('change', handleWindowResizeTablet);
	
	function handleWindowResizeTablet(e) {
		if (e.matches) {
			state.isTablet = true;
		} else {
			state.isTablet = false;
		}
	}
	
}

export default function() {
	const lazyLoading = "loading" in HTMLImageElement.prototype;
	const isMobile = computed(() => state.isMobile);
	const isTablet = computed(() => state.isTablet);

	return {
		lazyLoading,
		isMobile,
		isTablet
	}
}