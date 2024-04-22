<template>
	<slot
        :getPagination="getPagination"
        :getFormValues="getFormValues"
        :getBlogFilters="getBlogFilters"
        :getBlog="getBlog"
        :loadingBlog="loadingBlog"
        :filteredArticles="filteredArticles"
        :lazyLoading="lazyLoading"
        :goToPage="goToPage"
		:totalActiveBlogFilters="totalActiveBlogFilters"
        :useLoadMoreNotPagination="useLoadMoreNotPagination"
        :clearFiltersFromGroup="clearFiltersFromGroup"
		:handleFilterChange="handleFilterChange"
		:handleFilterOnInput="handleFilterOnInput"
		:addOrReplaceFilter="addOrReplaceFilter"
		:sortBy="sortBy"
		:removeFilter="removeFilter"
		:clearFilters="clearFilters"
    >
    </slot>
</template>

<script>
	import { computed, onBeforeMount, onMounted, onUpdated, ref } from 'vue';
	import useDetectBrowserFeatures from '../composition/useDetectBrowserFeatures';

	export default {
		name: "Blog Listing",
        setup(props){
            const { lazyLoading, isMobile } = useDetectBrowserFeatures();

            return {
                lazyLoading,
            }
        },

        props: {
			pageHandle: {
				type: String,
                required: true,
                default: 'recipes'
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
			let pagination = 1;

			// update urlQueryStringBuilder with the current URL data & update the activeFilters
			currentUrlParams.forEach((value, key) => {

				if (key != 'page') {
					activeFilters.push(`${key}`);
					urlQueryStringBuilder += `${urlQueryStringBuilder.length > 1 ? '&' : ''}${key}`;
				} else {
					activeFilters.push(`${key}=${value}`);
					pagination = parseInt(value);
					// urlQueryStringBuilder += `${urlQueryStringBuilder.length > 1 ? '&': ''}${key}=${value}`;
				}
			});			

			return {
				activeFilters,
				pagination,
				messages: [],
				loading: [],
				blogFilters: [],
				blog: {},
				urlFilters: urlQueryStringBuilder || window.location.search,
				sortBy: '',
				loadingBlog: false,
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
						this.fetchBlogData({recursiveLoad: false,onlyUpdateProducts: this.useLoadMoreNotPagination});
				},
				deep: true
			}

		},

        computed: {
			getPagination() {
                const defaultPaginateObject = {
                    pages:1,
                    next:false
                }
				return this.blog?.paginate || defaultPaginateObject;
			},
			totalActiveBlogFilters(){
				return this.blogFilters.map(f => f.active_values.length).reduce((prev,curr) => prev+curr,0);
			},
			getBlogFilters() {
				return this.blogFilters;
			},
			getBlog() {
				return this.blog;
			},			
			getUrlFilters() {
				// return window.location.search;
				if(this.urlFilters.includes('page')){
					let processedFilters = this.urlFilters.split('page=');
					console.log(processedFilters[1]);
					let index = processedFilters[1].split('').indexOf('&');
					console.log(processedFilters[1].split(''));
					let filterEnd = processedFilters[1].split('');
					if (index > -1) {
						filterEnd.splice(0, index + 1);
					}
					let finalFilters = processedFilters[0] + filterEnd.join('');

					return finalFilters;
				} else {
					return this.urlFilters;
				}
			},
			filteredArticles() {
				return this.blog?.articles || [];
			}
		},

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
			queryBlogData(options = {}) {
				const { blogHandle = this.pageHandle, paginatePage = this.pagination, templateView = 'all_data' } = options;

				return new Promise((resolve,reject) => {
					
					const connective = '?';
					let tempArray = this.activeFilters.filter(element => {
						if (!element.includes('page')) {
							return true;
						}
					});
				
					console.log('temp', tempArray);
                    const preconnect = tempArray.length > 0 ? '/tagged/' : '' 
					const filterList = `${preconnect}${ tempArray.length > 0 ? this.getUrlFilters.replace('?', '').replaceAll('&','+') : '' }${ connective }view=${ templateView }&page=${ this.pagination }`;
					// const filterList = `${ this.getUrlFilters }${ connective }view=${ templateView }&page=${ paginatePage }`;
					const fetchUrl = `${ window.location.origin }/blogs/${ blogHandle }${ filterList }`
					console.log("qcdata was called with the following url:",fetchUrl);
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
			async fetchBlogData(options = {}) {
				
				if(this.loadingBlog) this.controller.abort();

				const _this = this;
				const { onlyUpdateArticles = false, paginatePage = this.pagination, recursiveLoad = false } = options;
				this.loadingBlog = true;

				try {
					const queryOptions = { paginatePage:paginatePage }
					
					const currentBlogSize = Object.keys(_this.blog).length;
					if( currentBlogSize > 0 && onlyUpdateArticles ) queryOptions.templateView = 'article_data';

					const res = await _this.queryBlogData(queryOptions);

					if(!res.success || res.fetchAborted) return;

					const { object, paginate, paginate: { next: hasNextPage } } = res;

					if( currentBlogSize > 0 && onlyUpdateArticles ) {
						
						_this.blog.paginate = object.paginate;
						_this.blog.articles = _this.blog.articles.concat(object.articles);

					} else {
						_this.blog = object;
						_this.blogFilters = object.blog_filters;
					}

					// If recursiveload = true, and there are paginatable pages then recursively call again.
					if(hasNextPage && recursiveLoad) {
						await this.fetchBlogData({
							onlyUpdateArticles: true,
							paginatePage: paginate.current_page + 1,
							recursiveLoad: true
						})
					}

				} catch(err) { 
					console.error(err);
				} finally {
					this.loadingBlog = false;
				}

			},
			updateFilterHistory(filters, preventHistoryUpdate = false) {
				let activeFilterParams = null,_stringified = null;
				let newQueryString = '?';
				let newPageQueryString = '';

				console.log(filters)

				if( filters.length ) {
					_stringified = JSON.stringify(filters);
					activeFilterParams = encodeURIComponent(_stringified);
					
					filters.forEach((key, value) => {
						console.log(key, value);
						if (key != 'page') {
							newQueryString += `${newQueryString.length > 1 ? '&' : ''}${key}`;
						} else {
							pagination = parseInt(value);
							newPageQueryString == `&${key}=${value}`;
						}
					});

				}

				this.urlFilters = newQueryString;
				this.paginationFilters = newPageQueryString;
				const state = _stringified != null ? _stringified : window.location.search; 
				if( !preventHistoryUpdate ) history.pushState({ filters: state }, 'filters', newQueryString + newPageQueryString);
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

				if (key == 'page') {
					this.pagination = parseInt(value);
				}
				
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
				const filter = `${e.target.name}`;
				if (e.target.checked) {
					this.setFilter(filter);
					this.pagination = 1
					this.addOrReplaceFilter('page',1);
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
				// need to review to see why it doesn't work
				if( !Array.isArray(active_values) ) return;
                let mappedArr = active_values.map(val => `${val.param_name}`);
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

			this.fetchBlogData({recursiveLoad: false});
			this.updateFilterHistory(this.activeFilters);
		},

		updated() {
			this.$nextTick(function(){ 
				const _this = this;

				// Fetch all the details element.
				const details = document.querySelectorAll(".filter-group");

				if (window.innerWidth > 768) {

					// Add the onclick listeners.
					details.forEach((targetDetail) => {
						targetDetail.addEventListener("click", () => {
							// Close all the details that are not targetDetail.
							details.forEach((detail) => {
								if (detail !== targetDetail) {
									detail.removeAttribute("open");
								}
							});
						});
					});

				} else {
					details.forEach((targetDetail) => {
						targetDetail.addEventListener("click", (e) => {
							e.stopPropagation();
						});
					});
				}

				// Collection Mobile Filters

				// const filter_bar = document.querySelector('.j-filter-bar');

				// filter_bar.addEventListener('click', (e) => {
				// 	e.preventDefault();
				// 	details.forEach((detail) => {
				// 		detail.setAttribute("open", true);
				// 	});
				// });

				// new SimpleBar(document.querySelector('.filter-form'));

            });
		}
    }
</script>