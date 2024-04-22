import { createApp } from 'vue';
import ProductCard from './components/ProductCard';
import CollectionFilters from './components/CollectionFilters';
import ProductCollection from './components/ProductCollection';
import StyleableDropdown from './components/StyleableDropdown'
import Paginator from './components/Paginator';

let app

window.mountCollectionListingApp = function() {
    
    // console.log('Mounting app')
    app = createApp({
        name: 'Collection Root'
    })
    app.config.compilerOptions.delimiters = ['${', '}']
    app.config.globalProperties.productCardColors = window.productCardColors;
    app.config.globalProperties.productCardContent = window.productCardContent;

    app.component('product-card', ProductCard)
    app.component('collection-filters', CollectionFilters)
    app.component('product-collection', ProductCollection)
    app.component('styleable-dropdown', StyleableDropdown)
    app.component('paginator', Paginator) 
    app.mount('#collection')
}

window.unmountCollectionListingApp = function() {
    console.log('Unmounting app')
    app.unmount()
}

mountCollectionListingApp()