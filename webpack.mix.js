const fs = require('fs');
const path = require('path');
const mix = require('laravel-mix');

// Assets
const assets = 'assets/';


// SCSS file directory
const files = fs.readdirSync(assets);

// Source files
const vueSource = 'src/vue/';

// Mix Options
mix.options({ processCssUrls: false })
mix.options({
    fileLoaderDirs:  {
        fonts: '.'
    }
});

// Compile all SCSS to CSS
for (file of files) {

	if (file.indexOf('_') != 0) {	
	
		// If file extension is .sass or .scss
		if ((/\.s[ac]ss$/i).test(path.extname(file))) {
			mix.sass(assets + file, assets + 'style-' + file.replace('scss-','').replace('sass-','').replace(/\.s[ac]ss$/i, '.css')).options({
				postCss: [require('postcss-preset-env')({ features: { 'custom-properties': false } }), require('postcss-combine-media-query')]
			});
		}
	}

	// If file extension is .css	
	if ((/\.css$/i).test(path.extname(file))) {
		if (file.indexOf('style-') === -1) {
			if (file.indexOf('tw-') === -1) {
				mix.postCss(assets + file, assets + 'tw-' + file, [
					require('postcss-import'), 
					require('tailwindcss/nesting'), 
					require('tailwindcss')
				])
			}
		}
	}
}


// Combine all common JS files and add to footer
mix
	.combine([
		assets + 'cart.min.js',
		assets + 'js.cookie.js',
		assets + 'swiper-bundle.js',
		assets + 'cart.min.js',
		assets + 'multi-variant-options.js',
		assets + 'account-area.js',
		// assets + 'instafeed.min.js'
	], assets + 'merged.js')
	.js(vueSource + 'cart.js', assets + 'vue-cart.js').vue()
	// .js(vueSource + 'storefront-listing.js', assets + 'vue-storefront-listing.js').vue()
	.js(vueSource + 'collection-listing.js', assets + 'vue-collection-listing.js').vue()
	.js(vueSource + 'blog-listing.js', assets + 'vue-blog-listing.js').vue()
	.js(vueSource + 'global-app.js', assets + 'vue-global-app.js').vue()
	.minify( assets + 'app.js')
	.minify( assets + 'merged.js');

	

