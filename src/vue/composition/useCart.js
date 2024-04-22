import { computed, reactive } from "vue";

const state = reactive({
	cart: window.cart,
	cartFreeShipping: window.cartFreeShipping || false,
	eventListenersInitialiased: false,
	events: {
		itemAdded: new Event('itemAdded')
	}
});

function setupCartEventHandler() {
	if (!state.eventListenersInitialiased) {
		$(document).on('cart.requestComplete', function(event,cart) {
			state.cart = { ...cart };
		});

		state.eventListenersInitialiased = true;
	}
}

export default function() {
	const cart = computed(() => state.cart);
	const cartFreeShipping = computed(() => state.cartFreeShipping);
	const events = computed(() => state.events);

	setupCartEventHandler();

	return {
		cart,
		cartFreeShipping,
		events
	}


	
}