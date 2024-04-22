import { reactive, computed } from 'vue';

const STOREFRONT_ACCESS_TOKEN = 'c5c7a944c0f67f3282977d5fa6c91d8f';

const state = reactive({
	currencyCode: 'GBP'
});

export default function useStorefrontAPI(url) {
	const GRAPHQL_URL = `${url}/api/2021-07/graphql.json`

	function createRequest(body) {
		return {
			async: true,
			crossDomain: true,
			method: 'POST',
			headers: {
				'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
				'Content-Type': 'application/graphql',
			},
			body
		}
	}

	// send a GraphQL Query
	async function query(body, name = '') {
		const __query = `query ${name} ${body}`;
		return fetch(GRAPHQL_URL, createRequest(__query));
	}

	// send a GraphQL Mutation
	async function mutation(body, name = '') {
		const __mutation = `mutation ${name} ${body}`;
		return fetch(GRAPHQL_URL, createRequest(__mutation));
	}

	// get products by collection
	async function getProductsByCollection({ handle, perPage = 50, cursor }) {

		return query(`{
			collectionByHandle(handle: "${handle}") {
				products(first: ${perPage}${cursor ? ', after: "' + cursor + '"' : ''}) {
					pageInfo {
						hasNextPage
						hasPreviousPage
					}
					edges {
						cursor
						node {
							availableForSale
							compareAtPriceRange {
								maxVariantPrice {
									amount
									currencyCode
								}
								minVariantPrice {
									amount
									currencyCode
								}
							}
							description
							handle
							id
							images(first: 2) {
							  edges {
								node {
									altText
								  	id
								  	originalSrc
									transformedSrc(preferredContentType: WEBP)
								}
							  }
							}
							priceRange {
								maxVariantPrice {
									amount
									currencyCode
								}
								minVariantPrice {
									amount
									currencyCode
								}
							}
							tags
							title
							totalInventory
							variants(first: 50) {
								edges {
									node {
										availableForSale
										compareAtPriceV2 {
											amount
											currencyCode
										}
										id
										image {
											altText
											id
											originalSrc
											transformedSrc(preferredContentType: WEBP)
										}
										priceV2 {
											amount
											currencyCode
										}
										selectedOptions {
											name
											value
										}
										title
										available
									}
								}
							}
							vendor
						}
					}
				}
			}
		}`, 'getProductsByCollection')
			.then(res => res.json())
			.then(res => {
				
				console.log('res', res);
				const { products } = res.data.collectionByHandle;
				const { edges } = products;

				return {
					products: normalizeProducts(products.edges.map(edge => edge.node)),
					hasNextPage: products.pageInfo.hasNextPage,
					nextCursor: edges[edges.length - 1].cursor,
					success: true
				};
			})
			.catch(err => {
				console.error(err);

				return {
					success: false
				}
			});
	}

	// get products by handle
	async function getProductsByHandle(handles) {
		let queryString = ``;

		handles.forEach((handle, index) => {
			queryString += generateProductQuery(handle, index);
		});

		return query(`{
			${queryString}
		}`, 'getProductsByHandle')
			.then(res => res.json())
			.then(res => {
				const products = [];

				for (let key in res.data) {
					products.push(res.data[key]);
				}

				return {
					products: products.map(product => normalizeProduct(product)),
					success: true
				};
			})
			.catch(err => {
				console.error(err);

				return {
					success: false
				}
			});
	}

	function generateProductQuery(handle, index) {
		return `
			product${index}: productByHandle(handle: "${handle}") {
				availableForSale
				compareAtPriceRange {
					maxVariantPrice {
						amount
						currencyCode
					}
					minVariantPrice {
						amount
						currencyCode
					}
				}
				description
				handle
				id
				images(first: 2) {
					edges {
					node {
						altText
						id
						originalSrc
						transformedSrc(preferredContentType: WEBP)
					}
					}
				}
				priceRange {
					maxVariantPrice {
						amount
						currencyCode
					}
					minVariantPrice {
						amount
						currencyCode
					}
				}
				tags
				title
				totalInventory
				variants(first: 50) {
					edges {
						node {
							availableForSale
							compareAtPriceV2 {
								amount
								currencyCode
							}
							id
							image {
								altText
								id
								originalSrc
								transformedSrc(preferredContentType: WEBP)
							}
							priceV2 {
								amount
								currencyCode
							}
							selectedOptions {
								name
								value
							}
							title
						}
					}
				}
				vendor
			}
		`;
	}

	function getNavigatorLanguage() {
		if (navigator.languages && navigator.languages.length) {
		  return navigator.languages[0];
		} else {
		  return navigator.userLanguage || navigator.language || navigator.browserLanguage || 'en';
		}
	}

	// add properties to the product object for easier access
	function normalizeProducts(products) {
		return products.map(product => normalizeProduct(product));
	}

	function normalizeProduct(product) {
		const currency = product.priceRange.minVariantPrice.currencyCode;
		const images = product.images.edges.map(edge => edge.node);
		const variants = product.variants.edges.map(edge => edge.node);

		state.currencyCode = currency;

		return {
			...product,
			images,
			url: '/products/' + product.handle, 
			maxPrice: product.priceRange.maxVariantPrice.amount,
			minPrice: product.priceRange.minVariantPrice.amount,
			compareAtPrice: product.compareAtPriceRange.minVariantPrice.amount,
			price: product.priceRange.minVariantPrice.amount,
			formattedCompareAtPrice: new Intl.NumberFormat(getNavigatorLanguage(), { style: 'currency', currency }).format(product.compareAtPriceRange.minVariantPrice.amount),
			formattedPrice: new Intl.NumberFormat(getNavigatorLanguage(), { style: 'currency', currency }).format(product.priceRange.minVariantPrice.amount),
			variants: normalizeVariants(variants)
		}
	}

	// 
	function normalizeVariants(variants) {
		return variants.map(variant => {
			const currency = variant.priceV2.currencyCode;

			return {
				...variant,
				compareAtPrice: variant.compareAtPriceV2?.amount || null,
				price: variant.priceV2.amount,
				formattedCompareAtPrice: variant.compareAtPriceV2?.amount ? new Intl.NumberFormat(getNavigatorLanguage(), { style: 'currency', currency }).format(variant.compareAtPriceV2.amount) : null,
				formattedPrice: new Intl.NumberFormat(getNavigatorLanguage(), { style: 'currency', currency }).format(variant.priceV2.amount),
				vid: atob(variant.id).replace('gid://shopify/ProductVariant/', '')
			}

		});
	}

	function formatPrice(amount) {
		return new Intl.NumberFormat(getNavigatorLanguage(), { style: 'currency', currency: state.currencyCode }).format(amount)
	}

	const currencyCode = computed(() => state.currencyCode);

	return {
		query,
		mutation,
		getProductsByCollection,
		getProductsByHandle,
		normalizeProducts,
		normalizeVariants,
		currencyCode,
		getNavigatorLanguage,
		formatPrice
	}
}