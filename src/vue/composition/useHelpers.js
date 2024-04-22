function generateSrcSet(url) {
	if (!url) return '';

	const widths = [180,360,540,720,900,1080,1296,1512,1728,1944,2160,2376,2592,2808,3024];

	const fileTypes = new RegExp(/\.(gif|jpe?g|tiff?|png|webp|avif|bmp)/, 'i');

	return widths.reduce((srcset, width, index) => {
		const fileType = url.match(fileTypes)[0];

		if (url.includes('no-image-')) return url;

		return `${srcset} ${url.replace(fileType, `_${width}x${fileType}`)} ${width}w${index < widths.length ? "," : ""}`;
	}, '');
}

function generateSrc(url) {
	if (!url) return '';
	if (url.includes('no-image-')) return url;

	const fileTypes = new RegExp(/\.(gif|jpe?g|tiff?|png|webp|avif|bmp)/, 'i');
	const fileType = url.match(fileTypes)[0];

	return url.replace(fileType, `_300x${fileType}`);
}

function decodeVariantID(variant) {       
	let decoded_variant = atob(variant);
	return decoded_variant.replace('gid://shopify/ProductVariant/', '');
}

function decodeProductID(product) {       
	let decoded_id = atob(product);
	return decoded_id.replace('gid://shopify/Product/', '');
}

export default function useHelpers() {
	
	return {
		generateSrc,
		generateSrcSet,
		decodeProductID,
		decodeVariantID
	}
}