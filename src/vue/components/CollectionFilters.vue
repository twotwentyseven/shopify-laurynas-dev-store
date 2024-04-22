<template>
    <slot 
        :filters="filters"
        :section="section"
        :formatCurrency="formatCurrency"
        :currency="currency">

        <form :data-filter-form="section" class="filter-form ">
            
            <div class="flex justify-between items-center flex-wrap py-4 border-t border-t-neutral-200 w-full">
            <!-- <div class="flex justify-between items-center flex-wrap py-4 border-t border-t-neutral-200 w-full lg:w-auto lg:border-none lg:py-0 lg:hidden"> -->
                <a @click.prevent="filterToggle = true" class="flex items-center w-1/2 text-body-medium | lg:text-body-medium-lg" href="#">{{ content.filter_sort_btn }} <i class="ri-filter-3-fill | ml-2 text-body-large | lg:text-body-large-lg"></i></a>
                <div class="w-1/2 flex items-center justify-end | lg:hidden">
                    <a data-product-view="false" href="" class="ri-list-check | text-body-large ml-4 | transition-all duration-animation-speed" data-add-class="text-secondary-500" aria-label="list view"></a>
                    <a data-product-view="true" href="" class="ri-grid-line | text-secondary-500 text-body-large ml-4 | transition-all duration-animation-speed" data-add-class="text-secondary-500" aria-label="grid view"></a>
                </div>
                <p class="text-center w-full text-body-small pt-2 | lg:text-right lg:w-1/2 lg:pt-0">{{ filters.products_count }} Results found</p>
            </div>

            <div class="fixed bottom-0 left-0 w-full overflow-hidden z-[49] | lg:max-w-[400px] lg:w-full lg:max-h-screen lg:h-full lg:left-auto lg:pt-site-header-height-lg | duration-animation-speed transition-all" :class="[ filterToggle ? 'max-h-[800px] lg:right-0' : 'max-h-0 lg:-right-[401px]' ]">
            <!-- <div class="flex flex-col bg-neutral-900 z-[49] top-0 w-screen h-full absolute overflow-y-scroll px-4 pb-10 | | transition-all duration-animation-speed" :class="[ filterToggle ? 'max-h-[800px] lg:right-0' : 'max-h-0 lg:-right-[401px]' ]"> -->
                <div @click.prevent="filterToggle = false" :class="[filterToggle ? 'lg:max-w-[100vw] lg:max-h-[100vh]' : 'lg:max-w-0 max-h-0']" class="overlay | fixed bottom-0 max-w-[100vw] right-0 h-screen w-screen lg:max-h-[100vh] bg-black/25 cursor-pointer -z-10 | transition-all duration-animation-speed"></div>
                    <div class="modal-inner |  flex flex-col justify-between bg-neutral-900 text-secondary-900 h-full py-6 z-10 rounded-tl-2xl rounded-tr-2xl overflow-auto max-h-[calc(100vh_-_var(--site-header-height-announcement))] | lg:max-h-full lg:py-10 lg:rounded-tr-none lg:rounded-bl-2xl lg:relative" >
                        <div class="content | relative px-4 | lg:px-6"> 
                            <p class="flex items-center font-semibold text-body-large w-full py-4 mb-6 border-b border-b-neutral-200 order-1 | lg:text-body-large-lg">{{ content.filter_btn }}</p>
                            <a class="test font-semibold text-body-large absolute right-4 top-4 | lg:text-body-large-lg lg:right-[1.35rem]" @click.prevent="filterToggle = false" href="#"><span class="material-symbols-outlined | text-body-large | lg:text-body-large-lg">close</span></a>
                            <div v-for="(filter, buttonIndex) in filters.collection_filters" :key="filter.label" class="filter-group | border-b border-b-neutral-200 group w-full order-3 | ">
                                <template v-if="filter.active_values">
                                    <button
                                        :id="`${filter.label}_button`"
                                        @click.prevent="handleButtonClick(buttonIndex)"
                                        @keyup="checkShow($event, buttonIndex)"
                                        ref="filterButton" 
                                        aria-haspopup="listbox"
                                        :aria-labelledby="`${filter.label}_label ${filter.label}_button`"
                                        :aria-activedescendant="activeDescendent || false"
                                        class='filter-button | flex items-center w-full justify-between uppercase text-secondary-900 font-semibold mb-2 | | outline-none | transition-all duration-animation-speed'>
                                        <div>
                                            <span class="text-body-large | lg:text-body-large-lg ">{{ filter.label }}</span>
                                            <span v-if="filter.active_values.length > 0" class="ml-1">({{ filter.active_values.length }})</span>
                                        </div>
                                            <span class="material-symbols-outlined rotate-90 ml-2 text-body-small | | transition-all duration-animation-speed">arrow_forward_ios</span>
                                    </button>

                                    <div
                                        :id="`${filter.label}_list`"
                                        ref="filterGroup"
                                        role="listbox"
                                        :aria-labelledby="`${filter.label}_label`"
                                        @blur="handleListBlur(buttonIndex)"
                                        @focus="setupFocus(buttonIndex)"
                                        tabindex="-1"
                                        @keydown="checkHide($event, buttonIndex)"
                                        class="filter-group-display accordion-content-wrapper flex top-auto z-50 left-0 w-full rounded cursor-default |  | outline-none | transition-all duration-animation-speed | aria-expanded:grid-rows-[1fr] ">
                                        <!-- :class="filterIndex[buttonIndex] ? 'lg:max-h-16' : 'lg:max-h-0'" -->

                                        <template v-if="filter.type == 'boolean' || filter.type  == 'list'">   
                                            <template v-if="filter.label == 'Color' || filter.label == 'color' || filter.label == 'Colour' || filter.label == 'colour'">
                                                <!-- Color -->
                                                <ul class="filter-group-display__list flex-wrap flex w-[calc(100%+0.5rem)] -mx-1 overflow-hidden |">
                                                    <li 
                                                        v-for="(filter_value, index) in filter.values"
                                                        :ref="index === 0 ? 'firstItem' : index === filter.values.length - 1 ? 'lastItem' : null"
                                                        :id="`${filter.label}_option_${filter_value.value}`"
                                                        role="option"
                                                        :key="filter_value.param_name"
                                                        class="filter-group-display__list-item w-[calc(25%-0.5rem)] m-1 text-center ">
                                                        <input type="checkbox" hidden class="peer"
                                                            :name="filter_value.param_name"
                                                            :value="filter_value.value"
                                                            :id="`Filter-${filter.param_name}-${ index }`"
                                                            :checked="filter_value.active"
                                                            :disabled="filter_value.count == 0 && filter_value.active == false"
                                                            @change="handleFilterChange($event)">
                                                        <label
                                                            @click="handleClickItem($event, buttonIndex)"
                                                            :data-index="index"
                                                            class="rounded flex relative flex-col items-center py-2 cursor-pointer text-center uppercase text-secondary-900  peer-disabled:opacity-40 text-body-medium | after:hidden after:border-b after:absolute after:left-1/2 after:translate-x-[-50%] after:top-5 after:border-l after:border-b-neutral-0 after:border-l-neutral-0 after:-rotate-45 |  | peer-checked:after:block peer-checked:after:w-2 peer-checked:after:h-1 | transition-all duration-animation-speed"
                                                            :for="`Filter-${ filter.param_name }-${ index }`">
                                                            <span class="h-8 w-8 rounded-full mb-2 | " :style="'background-color:'+ filterColors[filter_value.label] +';'"></span>
                                                            {{ filter_value.label }}
                                                        </label>
                                                    </li>
                                                </ul>
                                            </template>
                                            <template v-else-if="filter.param_name.includes('.p.m.')">
                                                <!-- Metafield -->
                                                <ul class="filter-group-display__list flex-wrap flex w-[calc(100%+0.5rem)] -mx-1 overflow-hidden |">
                                                    <li v-for="(filter_value, index) in filter.values"
                                                        :ref="index === 0 ? 'firstItem' : index === filter.values.length - 1 ? 'lastItem' : null"
                                                        :id="`${filter.label}_option_${filter_value.value}`"
                                                        role="option"
                                                        :key="filter_value.param_name"
                                                        class="filter-group-display__list-item w-[calc(50%-0.5rem)] m-1 text-center | ">
                                                        <input type="checkbox" hidden class="peer"
                                                            :name="filter_value.param_name"
                                                            :value="filter_value.value"
                                                            :id="`Filter-${filter.param_name}-${ index }`"
                                                            :checked="filter_value.active"
                                                            :disabled="filter_value.count == 0 && filter_value.active == false"
                                                            @change="handleFilterChange($event)">
                                                        <label
                                                            @click="handleClickItem($event, buttonIndex)"
                                                            class="rounded block py-2 border text-body-medium-lg cursor-pointer uppercase border-secondary-900 peer-checked:bg-secondary-900 peer-checked:border-secondary-900 peer-checked:text-tertiary-900 peer-disabled:bg-neutral-200 peer-disabled:text-secondary-300 peer-disabled:border-neutral-200 | transition-all duration-animation-speed" :for="`Filter-${ filter.param_name }-${ index }`">
                                                            {{ filter_value.label }}
                                                        </label>
                                                        <!-- | lg:peer-checked:bg-neutral-0 lg:py-1 lg:px-4 lg:mr-4 lg:border lg:border-neutral-0 lg:before:hidden lg:after:hidden lg:font-normal -->
                                                    </li>
                                                </ul>
                                            </template>
                                            <template v-else>
                                                <ul class="filter-group-display__list flex-wrap flex w-[calc(100%+0.5rem)] -mx-1 overflow-hidden | ">
                                                    <li v-for="(filter_value, index) in filter.values" 
                                                        :ref="index === 0 ? 'firstItem' : index === filter.values.length - 1 ? 'lastItem' : null"
                                                        :id="`${filter.label}_option_${filter_value.value}`"
                                                        role="option"
                                                        :key="filter_value.param_name"    
                                                        class="filter-group-display__list-item w-[calc(50%-0.5rem)] m-1 text-center | ">
                                                        <input type="checkbox" hidden class="peer"
                                                            :name="filter_value.param_name"
                                                            :value="filter_value.value"
                                                            :id="`Filter-${filter.param_name}-${ index }`"
                                                            :checked="filter_value.active"
                                                            :disabled="filter_value.count == 0 && filter_value.active == false"
                                                            @change="handleFilterChange($event)">
                                                        <label
                                                        @click="handleClickItem($event, buttonIndex)"
                                                        class="rounded block py-2 border text-body-medium-lg cursor-pointer uppercase border-secondary-900 peer-checked:bg-secondary-900 peer-checked:border-secondary-900 peer-checked:text-tertiary-900 peer-disabled:bg-neutral-200 peer-disabled:text-secondary-300 peer-disabled:border-neutral-200 |  transition-all duration-animation-speed" :for="`Filter-${ filter.param_name }-${ index }`">
                                                            {{ filter_value.label }}
                                                        </label>
                                                    </li>
                                                </ul>
                                            </template>
                                            <!-- <noscript>
                                                <div class="filter-group-display__submit">
                                                    <input type="submit" value="Apply">
                                                </div>
                                            </noscript> -->
                                        </template>
                                        <template v-else>
                                            <div class="filter-group-display__price-range w-full flex overflow-hidden">
                                                <div class="filter-group-display__price-range-from flex items-center">
                                                    <label class="mr-2" :for="`Filter-${ filter.min_value.param_name }`">From</label>
                                                    <span class="">{{ currency() }}</span>

                                                    <input class="bg-transparent-500 border border-neutral-900 placeholder:text-neutral-900 rounded outline-none w-full text-body-medium-lg pl-1 pr-4 py-0.5 ml-1 mr-4 "
                                                    @click="handleClickItem($event, buttonIndex)"
                                                    @change="addOrReplaceFilter($event)"
                                                    :name="filter.min_value.param_name"
                                                    :id="'filter-'+filter.min_value.param_name"
                                                    :value="filter.min_value.value_money_without_currency"
                                                    type="number"
                                                    placeholder="-"
                                                    min="0"
                                                    :max="filter.range_max_money_without_currency"
                                                    >
                                                </div>
                                                <div class="filter-group-display__price-range-to flex items-center">
                                                    <label class="mr-2" :for="`Filter-${ filter.max_value.param_name }`">To</label>
                                                    <span>{{ currency() }}</span>

                                                    <input class="bg-transparent-500 border border-neutral-900 placeholder:text-neutral-900 rounded outline-none w-full text-body-medium-lg pl-1 pr-4 py-0.5 ml-1 mr-4 "
                                                    @click="handleClickItem($event, buttonIndex)"
                                                    @change="addOrReplaceFilter($event)"
                                                    :name="filter.max_value.param_name"
                                                    :id="'filter-'+filter.max_value.param_name"
                                                    :value="filter.max_value.value_money_without_currency"
                                                    type="number"
                                                    :placeholder="filter.range_max_money_without_currency"
                                                    min="1"
                                                    :max="filter.range_max_money_without_currency"
                                                    >

                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </template>

                                <template v-else>
                                    <button 
                                        :id="`${filter.label}_button`"
                                        @click.prevent="handleButtonClick(buttonIndex)"
                                        @keyup="checkShow($event, buttonIndex)"
                                        ref="filterButton"
                                        aria-haspopup="listbox"
                                        :aria-labelledby="`${filter.label}_label ${filter.label}_button`"
                                        :aria-activedescendant="activeDescendent || false"
                                        class="filter-button | list-none flex w-full items-center justify-between uppercase text-secondary-900 font-semibold mb-2 | ">
                                            <span class="text-body-large | lg:text-body-large-lg">Sort By</span>
                                            <span class="material-symbols-outlined rotate-90 ml-2 text-body-small |  transition-all duration-animation-speed">arrow_forward_ios</span>
                                    </button>
                                    <div
                                    :id="`${filter.label}_list`"
                                        ref="filterGroup"
                                        role="listbox"
                                        :aria-labelledby="`${filter.label}_label`"
                                        @blur="handleListBlur(buttonIndex)"
                                        @focus="setupFocus(buttonIndex)"
                                        tabindex="-1"
                                        @keydown="checkHide($event, buttonIndex)" 
                                        class="filter-group-display accordion-content-wrapper flex top-auto z-50 left-0 w-full rounded cursor-default | | outline-none | transition-all duration-animation-speed | aria-expanded:grid-rows-[1fr]">
                                        <ul class="filter-group-display__list flex-col flex  overflow-hidden | ">
                                            <li v-for="(option, index) in filter.sort_options"
                                                :ref="index === 0 ? 'firstItem' : index === filter.sort_options.length - 1 ? 'lastItem' : null"
                                                :id="`sortBy_option_${option.value}`"
                                                role="option"
                                                :key="option.value"
                                            class="filter-group-display__list-item mr-4">
                                            <input type="radio" hidden class="peer"
                                                @change="addOrReplaceFilter($event)"
                                                name="sort_by"
                                                :value="option.value"
                                                :checked="option.value == filters.sort_by || option.value == filters.default_sort_by && !filters.sort_by"
                                                :id="`Filter-${option.value}`">
                                            <label
                                                @click="handleClickItem($event, buttonIndex)"
                                                :data-index="index"
                                                class="relative block pl-6 cursor-pointer 
                                                | peer-checked:after:opacity-100 
                                                | before:rounded-full before:absolute before:left-0 before:top-1/2 before:translate-y-[-50%] before:w-4 before:h-4 before:border before:border-secondary-200 after:w-2 after:h-2 after:rounded-full after:opacity-0 after:absolute after:left-1 after:top-1/2 after:translate-y-[-50%] after:transition-all after:duration-animation-speed
                                                | peer-checked:text-secondary-900 peer-checked:font-semibold peer-disabled:bg-neutral-200 peer-disabled:text-secondary-300 peer-disabled:border-secondary-200  
                                                | peer-checked:before:border-secondary-900 peer-checked:before:bg-neutral-500 peer-checked:after:bg-secondary-900 
                                                | transition-all duration-animation-speed" :for="`Filter-${option.value}`">
                                                {{ option.name }}
                                            </label>
                                            </li>
                                        </ul>
                                    </div>
                                </template>
                                <div class="spacer | border border-black my-4"></div>
                            </div>

                            <div v-if="computedActiveFilters.length" class="active-filters flex flex-wrap w-full border-b border-b-neutral-200 pb-6 mb-4 order-2 | ">  
                            <p class="font-semibold text-body-large w-full mb-2 | lg:text-body-large-lg">{{ content.active_filters_title }}</p>
                            
                            <template v-for="filter in computedActiveFilters">
                                <template v-if="filter.type == 'price_range'">
                                    <a :key="filter.label" 
                                    v-if="filter.min_value.value != null || filter.max_value.value != null"
                                    class="active-filters__remove-filter | rounded py-1 px-2 mr-2 border bg-secondary-900 text-tertiary-900 flex items-center"
                                    @click.prevent="removePriceRangeFilter(filter)" :href="filter.url_to_remove">
                                        {{ formatCurrency(filter.min_value.value) }} - {{ formatCurrency(filter.max_value.value) }} <span class="material-symbols-outlined ml-2 text-sm transition-all duration-animation-speed">close</span>
                                    </a>
                                </template>
                                <template v-else>
                                    <a v-for="filter_value in filter.active_values"
                                        class="active-filters__remove-filter | rounded py-1 px-2 mr-2 bg-secondary-900 text-tertiary-900 flex items-center"
                                        :key="filter_value.label"
                                        :href="filter_value.url_to_remove"
                                        @click.prevent="removeFilter(filter_value.param_name+'='+filter_value.value)">
                                        {{ filter_value.label }} <span class="material-symbols-outlined ml-2 text-sm transition-all duration-animation-speed">close</span>
                                    </a>
                                </template>
                            </template>
                            
                            <div class="w-full flex justify-between mt-2">
                                <a :href="`${filters.collection_url}?sort_by=${ filters.sort_by }`" @click.prevent="clearFilters()" class="active-filters__clear text-body-medium font-semibold underline | ">Clear all</a>
                                <p class="text-body-small | ">{{ filters.products_count }} Results</p>
                            </div>
                        </div>
                    </div>
                    <div class="w-full pt-4 mt-6 shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.10)] | lg:px-6 ">
                        <div class="px-4 | lg:px-6">
                            <button @click.prevent="filterToggle = false" class="btn | bg-primary-900 text-secondary-900 w-full py-button-y px-button-x rounded-lg text-center text-button flex items-center justify-center relative cursor-pointer hover:bg-primary-400 | lg:text-button-lg  | transition-all duration-animation-speed | disabled" >View Products</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        
    </slot>

</template>

<script>
    import { computed, onBeforeMount, onMounted, onUpdated, reactive, ref, watch } from 'vue';
    
    export default {
        name:"Collection Filters",
        props: {
            filtersObject:{
                type: Object,
                default: null
            },
            filterColorOptions: {
                type: Object,
                default: null
            },
            sectionId: {
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
            },
            group: {
                type: [String, Boolean],
                default: false,
            }
        },
        setup(props) {
            // const { lazyLoading, isMobile } = useDetectBrowserFeatures();
            // const loading = ref(false)
            // 
            const moveUpDownEnabled = true

            
            const filters = ref(props.filtersObject)
            const filterColors = reactive(props.filterColorOptions)
            const section = ref(props.sectionId)

            const filterToggle = ref(false)
            const filterButton = ref([])
            const filterGroup = ref([])
            const filterIndex = ref(filters.value.collection_filters.map(item => false))
            
            const activeDescendent = ref(null)
            const firstItem = ref([])
			const lastItem = ref([])
            const SortBy = ref(null)
            const urlFilters = ref('?' || window.location.search)
            const preventHistoryUpdate = ref(false)
            const keysSoFar = ref('')
            const keyClear = ref('null')
            

            const activeFilters = ref([])
            const currentUrlParams = new URLSearchParams(window.location.search);

            const activeFiltersUrlEncoded = computed(() => {
                return activeFilters.value.join('&')
            })

            // console.log("Fitlers", filters)

            watch(activeFilters, async (newFilter, oldFilter) => {

                updateFilterHistory(activeFilters.value, preventHistoryUpdate.value);

                // section reload

                // fetch(`${window.location.pathname}?section_id=${section.value}&${activeFiltersUrlEncoded.value}`)
                // .then(response => response.text())
                // .then((responseText) => {
                
                //     // document.querySelector('#collection').innerHTML = new DOMParser().parseFromString(responseText, 'text/html').querySelector('#collection').innerHTML;
                
                // })

                if(props.group) {
                    fetch(`${window.location.pathname}?view=data&${activeFiltersUrlEncoded.value}`)
                    .then(response => response.json())
                    .then((response) => {
                        document.dispatchEvent(new CustomEvent('theorem.emit.products.' + props.group, { detail: response.products }))
                        document.dispatchEvent(new CustomEvent('theorem.emit.metafields.' + props.group, { detail: response.metafields }))
                        document.dispatchEvent(new CustomEvent('theorem.emit.pagination.' + props.group, { detail: response.pagination }))
                        filters.value = response.filters
                    })
                }

                
            })

            currentUrlParams.forEach((value, key) => {
				activeFilters.value.push(`${key}=${value}`);
			})
            
            function updateFilterHistory(filters, preventHistoryUpdate) {
				let activeFilterParams = null,_stringified = null;
				let newQueryString = '?';

				if( filters.length ) {
					_stringified = JSON.stringify(filters);
					activeFilterParams = encodeURIComponent(_stringified);
					
					filters.forEach((value) => {
						newQueryString += `${newQueryString.length > 1 ? '&' : ''}${value}`;
					});
				}

				urlFilters.value = newQueryString;
				const state = _stringified != null ? _stringified : window.location.search; 
				if( !preventHistoryUpdate ) history.pushState({ filters: state }, 'filters', newQueryString);
				preventHistoryUpdate = false;
			}

			function addOrReplaceFilter(e) {
                var key = e.target.name
                var value = e.target.value

				const filterToAdd = `${key}=${value}`;

				const found = activeFilters.value.findIndex(f => f.includes(key));
				let localActiveFiltersArray = activeFilters.value;

				if (found < 0) {
					// no matching existing entries
					setFilter(filterToAdd);
				} else {
					localActiveFiltersArray[found] = filterToAdd;
					activeFilters.value = localActiveFiltersArray;
                    updateFilterHistory(activeFilters.value, preventHistoryUpdate.value);
				}
				
			}
            
            function setFilter(filter) {
				activeFilters.value = [...activeFilters.value,filter];
			}
			
            function removeFilter(remove) {
                activeFilters.value = activeFilters.value.filter(filter => {
                    return filter != remove
                });
			}

            function removePriceRangeFilter(filter) {
				activeFilters.value = activeFilters.value.filter(f => {
					if(f.includes(filter.max_value.param_name) || f.includes(filter.min_value.param_name)) return false
					return true; 
				});
			}

			function clearFilters() {	
				activeFilters.value = activeFilters.value.filter(filter => filter.includes('page='));
			}

			function handleFilterChange(e) {
				// console.log("triggered handle filter change");
                
				const filter = `${e.target.name}=${e.target.value}`;
				if (e.target.checked) {
					setFilter(filter);
				} else {
					removeFilter(filter)
				}
			}

			// handleFilterOnInput(e){
			// 	const _this = this;
			// 	const triggerChangeAfterTyping = debounce(function(evt){
			// 		addOrReplaceFilter(e.target.name,e.target.value);
			// 	},750)
			// 	triggerChangeAfterTyping();
			// }


            function formatCurrency(value) {
                return new Intl.NumberFormat(window.locale ?? 'en-GB', { style: 'currency', currency: window.currency ?? 'GBP', minimumFractionDigits: 0}).format(value / (10 ** (window.currencyDecimals ?? 2)))
            }

            function currency() {
                return new Intl.NumberFormat(window.locale ?? 'en-GB', { style: 'currency', currency: window.currency ?? 'GBP'}).formatToParts(1).find(x => x.type === "currency").value;
            }

            function checkShow(e, index) {
				let key = e.key;

				switch (key) {
					case 'ArrowUp':
					case 'ArrowDown':
						e.preventDefault();
						expandList(index);
						// checkKeyPress(e);
						break;
					default:
						break;
				}
			}

			function checkHide(e, index) {
				let key = e.key;

				switch (key) {
					case 'Enter':
					case 'Escape':
						e.preventDefault();
						collapseList(index);
						filterGroup.value[index].focus();
						break;
					default:
						checkKeyPress(e, index);
						break;
				}
			}

			function setupFocus(index) {
				if (activeDescendent.value) {
					return;
				}

				focusFirstItem(index);
			}

			function focusFirstItem(index) {
				// console.log('focusing first item');
				if (firstItem.value[index]) {
					focusItem(firstItem.value[index]);
				}
			}

			function focusLastItem(index) {
				if (lastItem.value[index]) {
					focusItem(lastItem.value[index]);
				}
			}

			function findItemToFocus(key, index) {
				let itemList = filterGroup.value[index].querySelectorAll('[role="option"]');
				let character = key;
                let searchIndex = null;

				if (!keysSoFar.value) {
					for (let i = 0; i < itemList.length; i++) {
						if (itemList[i] === activeDescendent.value) {
							searchIndex = i;
						}
					}
				}

				keysSoFar.value += character;
				clearKeysSoFarAfterDelay();

				let nextMatch = findMatchInRange(itemList, searchIndex + 1, itemList.length);

				if (!nextMatch) {
					nextMatch = findMatchInRange(itemList, 0, searchIndex)
				}

				return nextMatch;
			}

			function clearKeysSoFarAfterDelay() {
				if (keyClear.value) {
					clearTimeout(keyClear.value);
					keyClear.value = null;
				}

				keyClear.value = setTimeout((function() {
					keysSoFar.value = '';
					keyClear.value = null;
				}).bind(this), 500);
			}

			function findMatchInRange(list, startIndex, endIndex) {
				// Find the first item starting with the keysSoFar substring, searching in
				// the specified range of items
				for (var n = startIndex; n < endIndex; n++) {
					var label = list[n].innerText;
					if (label && label.toUpperCase().indexOf(keysSoFar.value) === 0) {
					return list[n];
					}
				}
				return null;
			}

			function checkKeyPress(e, index) {
				let key = e.key;

				let nextItem = document.getElementById(activeDescendent.value);

				if (!nextItem) {
					return;
				}

				switch(key) {
					case 'PageUp':
					case 'PageDown':
						if (moveUpDownEnabled) {
							e.preventDefault();

							if (key === 'PageUp') {
								// moveUpItems();
							} else {
								// moveDownItems();
							}
						}
						break;
					case 'ArrowUp':
					case 'ArrowDown':
						e.preventDefault();

						if (moveUpDownEnabled && e.altKey) {
							if (key === 'ArrowUp') {
								// moveUpItems();
							} else {
								// moveDownItems();
							}
							return;
						}

						if (key === 'ArrowUp') {
							nextItem = nextItem.previousElementSibling;
						} else {
							nextItem = nextItem.nextElementSibling;
						}

						if (nextItem) {
							focusItem(nextItem);
						}
						break;
					case 'Home':
						e.preventDefault();
						focusFirstItem(index);
						break;
					case 'End':
						e.preventDefault();
						focusLastItem(index);
						break;
					case 'Space':
						e.preventDefault();
						toggleSelectItem();
						break;
					case 'Backspace':
					case 'Delete':
					case 'Enter':
					default:
						let itemToFocus = findItemToFocus(key, index);
						if (itemToFocus) {
							focusItem(itemToFocus);
						}
						break;


				}
			}

			function defocusItem(id) {
				
				if (!id) {
					return;
				}

				const el = document.getElementById(id);

				// if (!multiselectable) {
				// 	handleFilterSelection(filterKey, options[el.dataset.index].value, el.dataset.index);
				// }

				el.removeAttribute('data-focused');

			}

			function focusItem(el) {
				defocusItem(activeDescendent.value);

				// if (!multiselectable) {
				// 	handleFilterSelection(filterKey, options[el.dataset.index].value, el.dataset.index);
				// }

				el.setAttribute('data-focused', '');

				activeDescendent.value = el.id;
			}

			function handleButtonClick(index) {
                if (!filterIndex.value[index] && !filterButton.value[index].ariaExpanded) {
					expandList(index);
				}
                else{
                    collapseList(index)
                }

				if (filterIndex.value[index]) {
					filterIndex.value[index] = false;
				}
			}

			function collapseList(index) {
				filterButton.value[index].removeAttribute('aria-expanded');
				filterGroup.value[index].removeAttribute('aria-expanded');
			}

			function expandList(index) {
				filterButton.value[index].setAttribute('aria-expanded', 'true');
				filterGroup.value[index].setAttribute('aria-expanded', 'true');
                filterGroup.value[index].focus();
			}

			function handleClickItem(e, index) {
				focusItem(e.target);
				toggleSelectItem(e.target);
			}

			function handleListBlur(index) {
				filterIndex.value[index] = true;
				// collapseList(index);

				setTimeout(() => {
					filterIndex.value[index] = false;
				}, 300);
			}

			function toggleSelectItem(el) {
				const elIndex = el.dataset.index;

				// if (multiselectable) {
				// 	handleFilterSelection(filterKey, options[elIndex].value, elIndex);
				// }

				// else {
				// 	selectableOptions.forEach((option, index) => option.selected = el.dataset.index === index ? true : false )
				// }
			}

            const computedActiveFilters = computed(() => {
                return activeFilters.value.filter(x => !x.startsWith('page')).map(activeFilter => {

                    // console.log('activeFilter', activeFilter)

                    const activeFilterParts = activeFilter.split('=')
                    
                    const returnObject = { ...filters.value.collection_filters.find(filter => filter.param_name == activeFilterParts[0])}

                    if(returnObject.values) {
                        returnObject.active_values = returnObject.values.filter(value => value.value == activeFilterParts[1])
                    }

                    return returnObject
                })
            })

            watch(activeFilters, () => {
                activeFilters.value = activeFilters.value.filter(x => !x.startsWith('page'))
            })

        
            return {
                // data
                // lazyLoading,
                filterToggle,
                filters,
                filterColors,
                filterGroup,
                filterButton,
                filterIndex,
                section,
                moveUpDownEnabled,
                activeDescendent,
                firstItem,
                lastItem,
                keysSoFar,
                keyClear,

                activeFilters,

                // computed
                formatCurrency,
                currency,

                //methods
                handleButtonClick,
                handleClickItem,
                handleListBlur,
                checkShow,
                checkHide,
                setupFocus,
                clearFilters,
                handleFilterChange,
                removeFilter,
                addOrReplaceFilter,
                removePriceRangeFilter,

                computedActiveFilters,
            }
        }
    }
</script>