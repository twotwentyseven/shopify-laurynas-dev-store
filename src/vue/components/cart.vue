<template>
	<!-- 
	:upsellProductsLoaded="upsellProductsLoaded"
	:upsellProducts="upsellProducts"
	:generateSrc="generateSrc"
	:generateSrcSet="generateSrcSet"
	-->
	<slot
		:cart="cart"
		:open="open"
		:cartCount="cartCount"
		:toggleOpen="toggleOpen"
		:formattedPrice="formattedPrice"
		:freeShippingThreshold="freeShippingThreshold"
		:formattedFreeShippingDifference="formattedFreeShippingDifference"
		:freeShippingDifference="freeShippingDifference"
		:freeShippingPercentage="freeShippingPercentage"
		:hasFreeShipping="hasFreeShipping"
		:addToCart="addToCart"
		:updateAddToCartButton="updateAddToCartButton"
		:updateQtyLocally="updateQtyLocally"
		:updateQtyInCart="updateQtyInCart"
		:increment="increment"
		:decrement="decrement"
		:remove="remove"
		:addClass="addClass"
		:over18="over18"
		:requiresAgeConsent="requiresAgeConsent"
		:handleAgeConsent="handleAgeConsent"
		:updateQty="updateQty"
		:proceedToCheckout="proceedToCheckout"
		:cartNote="cartNote"
		:updateCartNote="updateCartNote"
		:formatCurrency="formatCurrency">
		
		<a v-if="popup" href="#" @click.prevent="toggleOpen" :class="[open ? 'max-w-[100vw]' : 'max-w-0']" class="overlay | fixed bottom-0 right-0 h-screen w-screen bg-black/25 cursor-pointer z-50 | transition-all duration-animation-speed" aria-label="close cart"></a>	
		
		<div class="cart-wrapper mx-auto w-full overflow-y-scroll flex flex-col | transition-all duration-animation-speed justify-center | lg:flex-row" :class="[{'fixed z-50 h-full top-0 pt-site-header-height lg:pt-site-header-height-lg': popup}, open ? 'right-0' : '-right-[100vw]', colours.bg_color, colours.text_color]">
			
			<form action="/cart" method="post" class="h-full w-full flex flex-col justify-between px-4 py-10 order-2 | lg:order-1 lg:px-container-gutter-lg lg:max-w-[1000px]">
				
				<div class="cart-main">

					<slot name="cart_header">

						<div class="cart-header flex justify-center mb-4" :class="[colours.border_color_accent]">
							<div class="title | font-headline text-center text-headline-1 mb-4 font-semibold | lg:text-headline-1-lg">{{ content.title }}</div>		
							<a v-if="popup" href="#" @click.prevent="toggleOpen" class="close-icon j-toggle-cart" aria-label="close cart"><span class="material-symbols-outlined text-body-medium lg:text-body-large">Close</span></a>
						</div>

						
						<div class="shipping-indicator mb-4 p-6 text-center rounded-2xl bg-primary-900" :class="[colours.border_color_accent]" v-if="showFreeShipping">
							<slot name="free_shipping_calc">
								<div class="postage_calc" :class="{ complete: hasFreeShipping }">

									<p class="mb-3 text-body-large font-semibold text-left | lg:text-body-large-lg" v-if="!hasFreeShipping && freeShippingThreshold > 0">{{ content.free_shipping_msg_start }} <span> {{ formatCurrency(formattedFreeShippingDifference) }}</span> {{ content.free_shipping_msg_end }}</p>
									<p class="mb-3 text-body-large font-semibold text-left | lg:text-body-large-lg" v-if="hasFreeShipping && freeShippingThreshold > 0"><strong>{{ content.free_shipping_qualified }}</strong></p>
									<p class="text-body-large font-semibold text-center | lg:text-body-large-lg" v-else>{{ content?.free_delivery_override }} </p>
									

									<div v-if="freeShippingThreshold > 0" class="percentage-wrapper relative rounded-md h-1.5 bg-secondary-200 w-full">
										<span class="percentage absolute top-0 left-0 rounded-md w-full h-1.5 bg-secondary-900 | transition-all duration-animation-speed" :style="{ maxWidth: freeShippingPercentage + '%' }"></span>
									</div>

								</div>
							</slot>
						</div>

					</slot>

					<slot name="cart_contents">
						
						<template v-if="cart.items.length">

							<div class="cart-contents">
			
								<div class="cart-item | border-b pb-4 mb-4" :class="[colours.border_color_accent]" v-for="(line_item, index) in cart.items">

									<div class="flex">

										<a :href="line_item.url" class="image basis-16 shrink-0 h-16">

											<img class="h-full w-full object-cover" :src="line_item.image" :srcset="line_item.image" loading="lazy" :alt="line_item.image.alt">

										</a>
				
										<div class="details ml-6 w-full">
				
											<div class="product-title | flex justify-between mb-2 items-start uppercase text-body-large font-semibold | lg:text-body-large-lg">
												<!-- loop through options if there are more than 0 options and the first option is not title -->
												{{ line_item.product_title }}
												<p class="price | font-semibold text-body-large | lg:text-body-large-lg">{{ formatCurrency(line_item.line_price) }}</p>
												
											</div>

											<div class="variant-options" v-if="line_item.options_with_values.length > 0 && line_item.options_with_values[0].value != 'Default Title' " >
												<div v-for="option in line_item.options_with_values" class="option-wrapper | text-body-medium flex justify-start gap-1 mb-2 | lg:text-body-medium-lg">
													<div class="label | text-body-medium font-semibold uppercase | lg:text-body-medium-lg ">{{option.name}}:</div>
													<div class="option | uppercase">{{option.value}}</div>
												</div>
												<div v-if="line_item.selling_plan_allocation" class="delivery-frequency | font-bold">{{ line_item?.selling_plan_allocation?.selling_plan?.name }}</div>
												<!-- <p class="line-item-json">{{ line_item }}</p> -->
												<!-- <p class="line-item-json">{{ line_item.selling_plan_allocation.selling_plan.name }}</p> -->
											</div>

											<!-- <div v-if="line_item.variant_title" class="variant-title | mb-2 text-body-medium | lg:text-body-medium-lg">{{ line_item.variant_title }}</div> -->

											<div class="qty-wrapper flex justify-between w-full mt-4">
												<!-- <label class="w-full font-semibold uppercase text-body-small block mb-1 | lg:text-body-small-lg">Quantity</label> -->
												<div class="flex">
													<a href="#" class="decrement qty-btn | py-2 px-4 border rounded" :class="[colours.border_color]" @click.prevent="decrement(index)">-</a>
													<input class="mx-2 border rounded bg-transparent-500 w-full text-center text-body-small outline-none | lg:mx-4" :class="[colours.border_color]" name="quantity" type="number" data-qty-selector v-model="line_item.quantity">
													<a href="#" class="increment qty-btn | py-2 px-4 border rounded" :class="[colours.border_color]" @click.prevent="increment(index)">+</a>
												</div>

												<button class="remove | ml-4 " @click.prevent="addClass($event, 'clicked', { forward: false }); remove(index);" :data-id="line_item.id" aria-label="Remove item from cart">
														<span class="material-symbols-outlined text-headline-5 | lg:text-headline-5">delete</span>
												</button>

												<!-- <div class="qty-selection">

													<select class="quantity" @change="updateQty($event, index)" :value="line_item.quantity">
														<option value="1">1</option>
														<option value="2">2</option>
														<option value="3">3</option>
														<option value="4">4</option>
														<option value="5">5</option>
														<option value="6">6</option>
														<option value="7">7</option>
														<option value="8">8</option>
														<option value="9">9</option>
														<option value="10">10</option>
													</select>

												</div> -->
											</div>
			
										</div>

									</div>

								
			
								</div>


								<div class="order-note-container border-b mb-4 pb-4" :class="[colours.border_color_accent]" v-if="showOrderNote">

									<p class="mb-2 text-body-medium flex justify-between font-semibold | lg:text-body-medium-lg">{{ content.order_note_title }}</p>							
						
									<textarea name="note" class="w-full py-field-y px-field-x border" :class="[colours.border_color, colours.bg_color]" id="CartNote" :placeholder="content.order_note_msg" @change="updateCartNote($event)" :value="cartNote"></textarea>

								</div>

								<div class="price-container">		

									<p class="total | mb-2 text-headline-4 flex justify-end gap-2 font-headline | lg:text-headline-4-lg">{{ content.total }} <span>-</span> <span>{{ formatCurrency(cart.total_price) }}</span></p>
									<p class="note | mb-4 text-body-small | lg:text-body-small-lg">{{ content.discount_msg }}</p>

								</div>

							</div> <!-- cart-contents -->

						</template>

						<template v-if="cart.items.length == 0">
							
							<slot name="empty_cart">
								
								<div class="no-cart-items">

									<p class="message text-center mb-4">{{ content.empty_cart_msg }}</p>

									<div class="btn-flex">
										<a :href="content.collection_url" class="btn | w-full py-button-y px-button-x rounded-lg text-center text-button font-headline flex items-center justify-center relative cursor-pointer | lg:text-button-lg | transition-all duration-animation-speed" :class="[colours.btn_color, colours.btn_text_color, colours.btn_hover_color, colours.btn_hover_text_color]">{{ content.continue_shopping_btn }}</a>
									</div>				

								</div>
							</slot>

						</template>

					</slot>
				
				</div>

				<template v-if="cart.item_count > 0" >
					<slot name="cart_footer">
						
						<div class="cart-footer pb-6">
		
							<div class="btn-flex">
		
								<button type="submit" name="checkout" class="btn w-full py-button-y px-button-x rounded-lg text-center text-button font-headline flex items-center justify-center relative cursor-pointer | lg:text-button-lg | transition-all duration-animation-speed" :class="[colours.btn_color, colours.btn_text_color, colours.btn_hover_color, colours.btn_hover_text_color]" v-on:click.prevent="proceedToCheckout">{{ content.btn_text }}</button>

								<slot name="additional_checkouts"></slot>

								<a class="text-center underline mt-4 block" :href="content.collection_url">{{ content.continue_shopping_btn }}</a>
		
							</div>
		
						</div> <!-- cart-footer -->

					</slot>
				</template>

			</form> <!-- form -->

			<slot name="cart_upsells" :cart="cart"></slot>
			

		</div>
	</slot>
</template>

<script>

	import { computed, nextTick, onBeforeMount, onBeforeUpdate, onMounted, onUpdated, reactive, ref, watch } from 'vue';
	import useCart from '../composition/useCart';
	import useHelpers from '../composition/useHelpers';
	// import useStorefrontAPI from '../composition/useStorefrontAPI';
	

	export default {

		name: "Cart",
		props: {
			popup: {
				type: Boolean,
				default: false
			},
			// showUpsells: {
			// 	type: Boolean,
			// 	required: false,
			// 	default: false
			// },
			// upsellCollectionHandle: {
			// 	type: String,
			// 	required: false
			// },
			// upsellProductsToShow: {
			// 	type: Number,
			// 	required: false
			// },
			// upsellProductHandles: {
			// 	type: Array,
			// 	required: false
			// },
			showFreeShipping: {
				type: Boolean,
				required: false,
				default: true
			},
			freeShippingThreshold: {
				type: Number,
				required: true
			},
			showOrderNote: {
				type: Boolean,
				default: false
			},
			shopUrl: {
				type: String,
				require: true
			},
			colours:{
                type: Object,
                default: null
            },
			content:{
                type: Object,
                default: null
            }
		},

		created() {
            // document.addEventListener('cartTrigger', this.toggleOpen)
        },


		setup(props) {
			const { cart, events } = useCart();
			const open = ref(false)
			const cartNote = ref(cart.value.note);
			const cartCount = computed(() => (cart.value.item_count));

			document.querySelector("[data-cart-count]").textContent = cartCount.value;
			// const cartCount = ref(cart.value.item_count);
			
			// const { decodeProductID, generateSrc, generateSrcSet } = useHelpers();
			// const { getProductsByCollection, getProductsByHandle } = useStorefrontAPI(props.shopUrl);

			const over18 = ref(false);

			const requiresAgeConsent = computed(() => {
				for (let item of cart.value.items) {
					if (item.properties && item.properties._tags) {
						if (item.properties._tags.includes('Over18') || item.properties._tags.includes('over18')) {
							return true;
						}
					}
				}

				return false;
			});

			/* == Shadow Cart ============================================================ */
			/* == Used to obtain current (stale) input values ============================ */
			const shadowCart = ref({ ...cart.value, items: { ...cart.value.items } });


			/* == Temp Qtys ============================================================== */
			/* == Used to store temp input values before submitting to CartJS ============ */
			const tempQtys = ref({});
			

			/* == Upsell Product Data ==================================================== */
			// const upsellProductsLoaded = ref(false);
			// const __upsellProducts = ref([]);
			// const __hasNextPage = ref(false);
			// const __nextCursor = ref(null);
			
			/* == Filtered Upsell Products =============================================== */
			// const filteredUpsellProducts = computed(() => {
			// 	return __upsellProducts.value.filter(product => {
			// 		let match = false;

			// 		for (let item of cart.value.items) {
			// 			// console.log(item.product_id, item.handle, decodeProductID(product.id), product.handle);
			// 			if (item.product_id.toString() === decodeProductID(product.id)) {
			// 				match = true;
			// 			}
			// 		}

			// 		return !match;
			// 	});
			// });

			watch(cartCount, (newCount, oldCount) => {
				console.log('new:', newCount, 'old:', oldCount);
				//Update cart count
				document.querySelector("[data-cart-count]").classList.add("shake-once");
				document.querySelector("[data-cart-count]").textContent = cartCount.value;
				setTimeout(()=> {document.querySelector("[data-cart-count]").classList.remove("shake-once")} , 600)
				// document.querySelector("[data-cart-count]").classList.remove("shake-once");
				// if (newCount != oldCount) {
				// 	open.value = true				
				// }
			})


			/* == Cart Total ============================================================= */
			const formattedPrice = computed(() => (cart.value.total_price / 100).toFixed(2));
			
			
			/* == Free Shipping Data ===================================================== */
			let freeShippingDifference;
			let formattedFreeShippingDifference;
			let freeShippingPercentage;
			let hasFreeShipping;

			if (props.showFreeShipping && props.freeShippingThreshold) {
				freeShippingDifference = computed(() => Math.max(0, props.freeShippingThreshold * 100 - cart.value.total_price));
				formattedFreeShippingDifference = computed(() => Number.isInteger(freeShippingDifference.value) ? freeShippingDifference.value : (freeShippingDifference.value).toFixed(2));
				freeShippingPercentage = computed(() => Math.min(100, (1 / props.freeShippingThreshold * cart.value.total_price)));

				
			} else {
				freeShippingDifference = ref(undefined);
				formattedFreeShippingDifference = ref(undefined);
				freeShippingPercentage = ref(undefined);
			}

			if (props.showFreeShipping && typeof freeShippingDifference.value !== 'undefined' && freeShippingDifference.value == 0) {
					hasFreeShipping = ref(true);
				} else {
					hasFreeShipping = ref(false);
				}

			watch(freeShippingDifference, (newVal) => {
				console.log("switched values")
				if (props.showFreeShipping && typeof freeShippingDifference.value !== 'undefined' && newVal == 0) {
					hasFreeShipping.value = true;
				} else {
					hasFreeShipping.value = false;
				}
			})
		
			/* == Methods ======================================================== */
			/* =================================================================== */

			function toggleOpen() {
				// open.value = !open.value
			}

			function updateCartNote(e){
				cartNote.value = e.target.value;
				CartJS.setNote(cartNote.value, {
                    "success": function(data, textStatus, jqXHR) {
                        console.log('Success');
                    },
                    "error": function(jqXHR, textStatus, errorThrown) {
                        console.log('Failed');
                    }
                });
			}


			function formatCurrency(value) {
                return new Intl.NumberFormat(window.locale ?? 'en-GB', { style: 'currency', currency: window.currency ?? 'GBP', minimumFractionDigits: 2}).format(value / (10 ** (window.currencyDecimals ?? 2)))
            }

            function currency() {
                return new Intl.NumberFormat(window.locale ?? 'en-GB', { style: 'currency', currency: window.currency ?? 'GBP'}).formatToParts(1).find(x => x.type === "currency").value;
            }

			/* == Vibrate if feature is available ================================ */
			function vibrate(ms) {
				if (window.navigator.vibrate) {
					window.navigator.vibrate(ms);
				}
			}

			/* == Update the Shadow Cart  ======================================== */
			function updateShadowCart() {
				shadowCart.value = { ...cart.value, items: { ...cart.value.items } }
			}

			/* == Add Product to Cart ============================================ */
			function addToCart({ vid, qty = 1, properties = {} }, callback, $event) {
				if (!vid) {
					throw Error('A Variant ID (vid) must be provided');
				} else {
					CartJS.addItem(vid, qty, properties, {
						success: function(data, textStatus, jqXHR) {
							console.log('Item added to basket');

							if (callback) {
								callback(null, data, $event);
							}

							// Dispatch an event ('itemAdded') that can be listened
							// to anywhere in the theme (including app.js)
							document.dispatchEvent(events.value.itemAdded);
						},

						error: function(jqXHR, textStatus, errorThrown) {
							console.log('CartJS error originating from addToCart');

							if (callback) {
								callback(jqXHR, null, $event);
							} else {
								console.log(jqXHR);
								console.error(errorThrown, $event);
							}
						}
					})
				}
			}

			/* == Update Button Text ============================================= */
			function updateAddToCartButton(err, data, e) {
				const originalContent = e.target.innerHTML;

				if (err) {
					e.target.innerHTML= 'Error';
				} else {
					e.target.innerHTML = 'Added!';
				}

				setTimeout(function() {
					e.target.innerHTML = originalContent;
				}, 1500);
			}
	
			/* == Update Qty Locally to limit AJAX Requests ====================== */
			function updateQtyLocally (e, index, vid) {
				
				tempQtys[vid] = {
					qty: e.target.value,
					lastUpdated: Date.now(),
					originalQty: shadowCart.items[index].quantity
				}

				setTimeout(function() {
					// has been updated again since so this will get re-called
					if (!tempQtys.value[vid] || tempQtys.value[vid].lastUpdated > Date.now() - 200 || tempQtys.value[vid].updatingCart) return;
					
					// lock the item from further updates until ajax update is complete
					tempQtys.value[vid].updatingCart = true;
					
					// blurring will trigger the ajax update
					e.target.disabled = true;

				}, 1000);

				
			}

			/* == Update Qty via CartJS ========================================== */
			function updateQtyInCart(e, index, vid) {
				if (!tempQtys[vid]) return;

				function cleanup(data) {
					e.target.disabled = false;
					e.target.focus();

					if (!data) {
						// Return the value back to the original
						e.target.value = tempQtys.value[vid].originalQty;
					}

					// remove local data
					delete tempQtys.value[vid];
				}

				
				CartJS.updateItem(index + 1, tempQtys.value[vid].qty, {}, {
					success: function(data, textStatus, jqXHR) {
						cleanup(data);
						updateShadowCart();
						vibrate(100);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						// Todo: retry
						cleanup();
					}
				});
				
			}

			/* == Increment Quantity ============================================= */
			function increment(index) {
				const currentQty = cart.value.items[index].quantity;

				CartJS.updateItem(index + 1, currentQty + 1, {}, {
					success: function(data) {
						updateShadowCart();
						vibrate(100);
					}
				});

			}

			/* == Decrement Quantity ============================================= */
			function decrement(index) {
				const currentQty = cart.value.items[index].quantity;

				CartJS.updateItem(index + 1, currentQty - 1, {}, {
					success: function(data) {
						updateShadowCart();
						vibrate(100);
					}
				});

			}

			/* == Remove Item ==================================================== */
			function remove(index) {
				CartJS.updateItem(index + 1, 0, {}, {
					success: function(data) {
						updateShadowCart();
						vibrate(100);
					}
				});
			}

			function updateQty(e, index) {
                if (Number.isNaN(parseInt(e.target.value, 10))) return;

                cart.value.items[index].quantity = parseInt(e.target.value, 10);

                console.log('qty', cart.value.items[index].quantity);

                CartJS.updateItem(index + 1, parseInt(e.target.value, 10), {}, {
					success: function(data, textStatus, jqXHR) {
						vibrate(100);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						// Todo: retry
	
					}
				});

            }

			/* == Update Age Consent ============================================= */
			function handleAgeConsent(e) {
				if (e.target.checked) {
					over18.value = true;
				} else {
					over18.value = false;
				}
			}

			/* == Add class on event for animation purposes ====================== */
			function addClass(e, className, { forward = true, duration = 500, elem = undefined }) {
				
				if (elem) {
					$(elem).addClass(className);
				} else {
					$(e.target).addClass(className);
				}
				
				if (!forward) {
					setTimeout(function () {
						if (elem) {
							$(elem).removeClass(className);
						} else {
							$(e.target).removeClass(className);
						}
					}, duration);
				}
			}

			/* == Redirect to Checkout =========================================== */
			function proceedToCheckout() {

				CartJS.setNote(cartNote.value,{
                    "success": function(data, textStatus, jqXHR) {
                        console.log('Success');
                        window.location = '/checkout';
                    },
                    "error": function(jqXHR, textStatus, errorThrown) {
                        alert('Failed to add cart note, please amend and try again.');
                    }
                });

			}
			
			/* == Get Upsell Products ============================================ */

			async function getUpsellProductData(cursor) {
				try {
					const { products = [], hasNextPage, nextCursor, success } = await getProductsByCollection({ handle: props.upsellCollectionHandle, perPage: props.upsellProductsToShow, cursor });
					
					if (props.upsellProductHandles && props.upsellProductHandles.length) {
						var { products: featuredProducts = [], success: featuredSuccess } = await getProductsByHandle(props.upsellProductHandles);
					}
					
					if (!featuredProducts) {
						var featuredProducts = [];
					}

					if (!success && !featuredSuccess) return;

					// update state
					upsellProductsLoaded.value = true;
					__upsellProducts.value = [...featuredProducts, ...products];
					__hasNextPage.value = hasNextPage;
					__nextCursor.value = nextCursor;

				} catch(err) {
					console.log('right here')
					console.error(err);
					// do something here like put up a toast
				}
			}

			/* == Upsell Carousel ============================================ */
			// function initCarousel() {
				// $('.j-upsell-carousel').slick({
				// 	infinite: false,
				// 	arrows: true,
				// 	dots: false,
				// 	slidesToShow: 1,
				// 	slidesToScroll: 1,
				// 	variableWidth: true
				// });
			// }

			/* == Required to update carousel with latest products =========== */
			// function destroyCarousel() {
				// if ($('.j-upsell-carousel.slick-initialized').length) {
				// 	$('.j-upsell-carousel').slick('unslick');
				// }
			// }

			/* == Keep product heights consistent ============================ */
			// function matchUpsellTextHeights() {
				// $('.j-upsell-meta').matchHeight();
			// }


			// onBeforeMount(async () => {
				// await getUpsellProductData();
			// });

			// onUpdated(() => {
			
				// nextTick(() => {
				// 	matchUpsellTextHeights();
				// 	destroyCarousel();
				// 	initCarousel();
				// 	matchUpsellTextHeights();
				// });
			// })

			return {
				// data
				cart,
				open,
				cartCount,
				freeShippingThreshold: props.freeShippingThreshold,
				over18,
				cartNote,
				updateCartNote,

				// computed
				requiresAgeConsent,
				formattedPrice,
				formattedFreeShippingDifference,
				freeShippingDifference,
				freeShippingPercentage,
				hasFreeShipping,
				// upsellProductsLoaded,
				// upsellProducts: filteredUpsellProducts,

				// methods
				// generateSrc,
				// generateSrcSet,
				addToCart,
				toggleOpen,
				updateAddToCartButton,
				updateQtyLocally,
				updateQtyInCart,
				increment,
				decrement,
				remove,
				handleAgeConsent,
				addClass,
				updateQty,
				proceedToCheckout,
				formatCurrency
			}
		}
	}
</script>