<template>
	<img v-if="lazyLoading && src" :src="generateSrc(src)" :srcset="generateSrcSet(src)" :alt="alt || ''" loading="lazy">
	<img v-else-if="src" :data-src="generateSrc(src)" :data-srcset="generateSrcSet(src)" :alt="alt || ''" class="lazyload">
</template>

<script>
	import useDetectBrowserFeatures from '../composition/useDetectBrowserFeatures';
	import useHelpers from '../composition/useHelpers';

	export default {
		setup() {
			const { lazyLoading } = useDetectBrowserFeatures();
			const { generateSrc, generateSrcSet } = useHelpers();


			return { 
				lazyLoading,
				generateSrc,
				generateSrcSet
			}
		},
		props: {
			src: {
				type: String,
				required: true
			},
			alt: {
				type: String,
				required: false
			}
		}
	}
</script>