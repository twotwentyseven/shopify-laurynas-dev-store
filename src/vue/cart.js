import { createApp } from 'vue';
import Cart from './components/Cart';
import ProductCard from './components/ProductCard';
import StyleableDropdown from './components/StyleableDropdown'
import useHelpers from './composition/useHelpers';
import useDetectBrowserFeatures from './composition/useDetectBrowserFeatures';
import LazyImage from './components/LazyImage';

const app = createApp({
	setup() {
		const { lazyLoading } = useDetectBrowserFeatures();
		const { generateSrc, generateSrcSet } = useHelpers();

		return {
			lazyLoading,
			generateSrc,
			generateSrcSet,
		}
	},
	name: 'Shopify Popout Cart',
	data() {
		return {
			mounted: false
		}
	},
	methods: {
		handleMounted() {
			this.mounted = true
		}
	}
});


app.config.compilerOptions.delimiters = ['${', '}'];
app.component('cart', Cart);
app.component('lazy-image', LazyImage);
app.component('product-card', ProductCard);
app.component('styleable-dropdown', StyleableDropdown);

app.mount('#vue-cart');