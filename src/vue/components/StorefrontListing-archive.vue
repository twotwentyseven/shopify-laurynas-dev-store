<template>
	<slot
        :getPagination="getPagination"
        :getFormValues="getFormValues"
        :getCollectionFilters="getCollectionFilters"
        :getCollection="getCollection"
        :loadingCollection="loadingCollection"
        :filteredProducts="filteredProducts"
        :lazyLoading="lazyLoading"
        :goToPage="goToPage"
        :useLoadMoreNotPagination="useLoadMoreNotPagination"
        :clearFiltersFromGroup="clearFiltersFromGroup"
		:handleFilterChange="handleFilterChange"
		:handleFilterOnInput="handleFilterOnInput"
		:addOrReplaceFilter="addOrReplaceFilter"
		:sortBy="sortBy"
		:removeFilter="removeFilter"
		:clearFilters="clearFilters"
		:totalActiveCollectionFilters="totalActiveCollectionFilters"
		:removePriceRangeFilter="removePriceRangeFilter"
		:handleAddToCartEvent="handleAddToCartEvent"
    >
    </slot>
</template>

<script>
	import { computed, onBeforeMount, onMounted, onUpdated, ref } from 'vue';
	import useDetectBrowserFeatures from '../composition/useDetectBrowserFeatures';
	import useCart from '../composition/useCart';
    import noUiSlider from 'nouislider';

	export default {
		name: "Storefront Listing",
        setup(props){
            const { lazyLoading, isMobile } = useDetectBrowserFeatures();
			const { cart, events } = useCart();

			function handleAddToCartEvent({ variant, properties = {}, event }){
				// console.log({"event was caught from card in parent":{event:event,variant:variant,properties:properties}});
				addToCart({ vid:variant.id, properties: properties }, false, event);
			}

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

            return {
                lazyLoading,
				handleAddToCartEvent
            }
        },
		props: {
			pageHandle: {
				type: String,
                required: true,
                default: 'all-products'
			},
            useLoadMoreNotPagination: {
                type: Boolean,
                default: false
            }            
		},
		data() {

			// Setup for handling the abortion of multiple fetch requests
			const controller = new AbortController();
			const signal = controller.signal;

			// Setup initial activeFilters from url params.
			const currentUrlParams = new URLSearchParams(window.location.search);
			let urlQueryStringBuilder = '?';
			let activeFilters = [];

			// update urlQueryStringBuilder with the current URL data & update the activeFilters
			currentUrlParams.forEach((value, key) => {
				activeFilters.push(`${key}=${value}`);
				urlQueryStringBuilder += `${urlQueryStringBuilder.length > 1 ? '&' : ''}${key}=${value}`;
			});			

			return {
				activeFilters,
				messages: [],
				loading: [],
				collectionFilters: [],
				collection: {},
				urlFilters: urlQueryStringBuilder || window.location.search,
				sortBy: '',
				loadingCollection: false,
				controller,
				signal,
				preventHistoryUpdate: false
			}
		},
		// Watch
		watch: {

			activeFilters: {
				handler(newFilters, oldFilters) {
						this.updateFilterHistory(this.activeFilters,this.preventHistoryUpdate);
						this.fetchCollectionData({recursiveLoad: false,onlyUpdateProducts: this.useLoadMoreNotPagination});
				},
				deep: true
			}

		},
		// Computed
		computed: {
			getPagination() {
                const defaultPaginateObject = {
                    pages:1,
                    next:false
                }
				return this.collection?.paginate || defaultPaginateObject;
			},
			totalActiveCollectionFilters(){
				return this.collectionFilters.map(f => f.active_values.length).reduce((prev,curr) => prev+curr,0);
			},
			getCollectionFilters() {
				return this.collectionFilters;
			},
			getCollection() {
				return this.collection;
			},			
			getUrlFilters() {
				// return window.location.search;
				return this.urlFilters;
			},
			filteredProducts() {
				return this.collection?.products || [];
			}
		},
		// Methods
		methods: {
			debounce(func, wait, immediate){
				let timeout;
				return function() {
					let context = this, args = arguments;
					let later = function() {
						timeout = null;
						if (!immediate) func.apply(context, args);
					};
					let callNow = immediate && !timeout;
					clearTimeout(timeout);
					timeout = setTimeout(later, wait);
					if (callNow) func.apply(context, args);
				};				
			},
            goToPage(pageNumber = null) {
                if( pageNumber == null) return
				this.addOrReplaceFilter('page',pageNumber);
            },
			queryCollectionData(options = {}) {
				const { collectionHandle = this.pageHandle, paginatePage = 1, templateView = 'all_data' } = options;

				return new Promise((resolve,reject) => {
					
					const connective = this.getUrlFilters.length ? '&' : '?';
					const filterList = `${ this.getUrlFilters }${ connective }view=${ templateView }`;
					// const filterList = `${ this.getUrlFilters }${ connective }view=${ templateView }&page=${ paginatePage }`;
					const fetchUrl = `${ window.location.origin }/collections/${ collectionHandle }${ filterList }`
					// console.log("qcdata was called with the following url:",fetchUrl);
					const data = fetch(fetchUrl,{signal:this.signal})
					.then(res => res.json())
					.then(res => {

						// Format the returned object for processing
						resolve({
							object: res,
							paginate: res.paginate,
							success: true,
							fetchAborted: false 
						})						

					}).catch(e => {

						// if the fetch was aborted, resolve with the fetchAborted flag
						if(e.code === 20) resolve({fetchAborted:true,success:true})
						
						reject({
							error:e,
							success:false
						})
					});
				});
			},
			async fetchCollectionData(options = {}) {
				
				if(this.loadingCollection) this.controller.abort();

				const _this = this;
				const { onlyUpdateProducts = false, paginatePage = 1, recursiveLoad = false } = options;
				this.loadingCollection = true;

				try {
					const queryOptions = { paginatePage:paginatePage }
					
					const currentCollectionSize = Object.keys(_this.collection).length;
					if( currentCollectionSize > 0 && onlyUpdateProducts ) queryOptions.templateView = 'product_data';

					const res = await _this.queryCollectionData(queryOptions);

					if(!res.success || res.fetchAborted) return;

					const { object, paginate, paginate: { next: hasNextPage } } = res;

					if( currentCollectionSize > 0 && onlyUpdateProducts ) {
						
						_this.collection.paginate = object.paginate;
						_this.collection.products = _this.collection.products.concat(object.products);

					} else {
						_this.collection = object;
						_this.collectionFilters = object.collection_filters;
					}

					// If recursiveload = true, and there are paginatable pages then recursively call again.
					if(hasNextPage && recursiveLoad) {
						await this.fetchCollectionData({
							onlyUpdateProducts: true,
							paginatePage: paginate.current_page + 1,
							recursiveLoad: true
						})
					}

				} catch(err) { 
					console.error(err);
				} finally {
					this.loadingCollection = false;
				}

			},
			updateFilterHistory(filters, preventHistoryUpdate = false) {
				let activeFilterParams = null,_stringified = null;
				let newQueryString = '?';

				if( filters.length ) {
					_stringified = JSON.stringify(filters);
					activeFilterParams = encodeURIComponent(_stringified);
					
					filters.forEach((value) => {
						newQueryString += `${newQueryString.length > 1 ? '&' : ''}${value}`;
					});
				}

				this.urlFilters = newQueryString;
				const state = _stringified != null ? _stringified : window.location.search; 
				if( !preventHistoryUpdate ) history.pushState({ filters: state }, 'filters', newQueryString);
				this.preventHistoryUpdate = false;				
			},
			addOrReplaceFilter(key,value) {
				const filterToAdd = `${key}=${value}`;

				const found = this.activeFilters.findIndex(f => f.includes(key));
				let localActiveFiltersArray = this.activeFilters;

				if (found < 0) {
					// no matching existing entries
					this.setFilter(filterToAdd);
				} else {
					localActiveFiltersArray[found] = filterToAdd;
					this.activeFilters = localActiveFiltersArray;
				}
				
			},
			removePriceRangeFilter(filter){
				this.activeFilters = this.activeFilters.filter(f => {
					if(f.includes(filter.max_value.param_name) || f.includes(filter.min_value.param_name)) return false
					return true; 
				});
			},
			setFilter(filter) {
				this.activeFilters = [...this.activeFilters,filter];
			},
			removeFilter(remove) {
				this.activeFilters = this.activeFilters.filter(filter => filter !== remove);
			},
			clearFilters() {
				this.sortBy = '';
				this.activeFilters = this.activeFilters.filter(filter => filter.includes('page='));
			},
			handleFilterChange(e) {
				console.log("triggered handle filter change");
				const filter = `${e.target.name}=${e.target.value}`;
				if (e.target.checked) {
					this.setFilter(filter);
				} else {
					this.removeFilter(filter);
				}
			},
			handleFilterOnInput(e){
				const _this = this;
				const triggerChangeAfterTyping = this.debounce(function(evt){
					_this.addOrReplaceFilter(e.target.name,e.target.value);
				},750)
				triggerChangeAfterTyping();
			},
			clearFiltersFromGroup(active_values = []){
				if( !Array.isArray(active_values) ) return;
                let mappedArr = active_values.map(val => `${val.param_name}=${val.value}`);
                const _this = this;
                this.activeFilters = _this.activeFilters.filter(filter => !mappedArr.includes(filter));
			},			
			getFormValues (submitEvent) {
				/* 
				* Used to process inputs from Form submissions.
				*/
				const _this = this;
				const elements = Array.from(submitEvent.target.elements);
				const inputs = elements.filter(e => e.nodeName === 'INPUT');
				let tempActiveFilters = [];

				inputs.filter(e => e.checked).forEach((ele,index) => {
					tempActiveFilters.push(`${ele.name}=${ele.value}`);
				})

				// check if any price values were submitted
				let min_value = inputs.find(e => e.id === "filter-filter.v.price.gte")
				let max_value = inputs.find(e => e.id === "filter-filter.v.price.lte")
				if( max_value != null && max_value?.value != '' ) tempActiveFilters.push(`${max_value.name}=${max_value.value}`);
				if( min_value != null && min_value?.value != '' ) tempActiveFilters.push(`${min_value.name}=${min_value.value}`);
				
				this.$nextTick(function(e){
					_this.activeFilters = tempActiveFilters;
				})
			}
		},
		// Hooks
		created() {
			// handle the back event for history state.
			window.addEventListener('popstate', (event) => {
				this.preventHistoryUpdate = true; 
				this.activeFilters = (event.state?.filters) ? JSON.parse(event.state?.filters) : [];
			});		

			this.fetchCollectionData({recursiveLoad: false});
			this.updateFilterHistory(this.activeFilters);
		},

		updated() {
			this.$nextTick(function(){ 
				const _this = this;
                let slider = document.getElementById('price-range-slider');
				const priceFilter = this.getCollectionFilters.find(f => f.type === 'price_range') || null;
				let [sliderSelectedMin,sliderSelectedMax,productsMaxPrice] = [ (priceFilter?.min_value?.value/100) || 0 , (priceFilter?.max_value?.value/100) || 0, (priceFilter?.range_max/100) || 0]
				if( sliderSelectedMax === 0) sliderSelectedMax = productsMaxPrice;

                if( !slider?.classList.contains('noUi-target') ) {

                    noUiSlider.create(slider, {
                        start: [sliderSelectedMin, sliderSelectedMax],
                        step: 1,                        
                        connect: true,
                        range: {
                            'min': 0,
                            'max': productsMaxPrice
                        }
                    });

                    slider.noUiSlider.on('set', function (values) {
						const price_min = document.getElementById('filter-filter.v.price.gte');
						const price_max = document.getElementById('filter-filter.v.price.lte');
						_this.addOrReplaceFilter(price_min.name,price_min.value);
						_this.addOrReplaceFilter(price_max.name,price_max.value);						
					});

                    slider.noUiSlider.on('change', function (values) {

						const price_min = document.getElementById('filter-filter.v.price.gte');
						const price_max = document.getElementById('filter-filter.v.price.lte');

						let start = values[0]
						let end = values[1] < productsMaxPrice ? values[1] : productsMaxPrice;

						price_min.value = start;
						price_max.value = end;
												
						_this.addOrReplaceFilter(price_min.name,price_min.value);
						_this.addOrReplaceFilter(price_max.name,price_max.value);

                    });

					const gte_input = document.getElementById('filter-filter.v.price.gte');
					const lte_input = document.getElementById('filter-filter.v.price.lte');

					const waitForTyping = this.debounce(function(options){
						const { start,end } = options;
						slider.noUiSlider.set([start,end]);
					}, 350);

					gte_input.addEventListener('input', function(e){
						waitForTyping({start:this.value,end:null});
					});

					lte_input.addEventListener('input', function(e){
						waitForTyping({start:null,end:this.value});
					});

                }

            });
		}		
	
	}


</script>