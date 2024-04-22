# theorem-shopify-theme


data-elementName is how we target elements through javascript

# Class and style structure. 

<div class="Element-name | Mobile-styles | Tablet-styles | Desktop-styles | Before-&-After-styles | Transition-styles" data-add-class="classes-to-add" data-remove-class="class-to-remove"></div>

Element-name: the elements name can be shared across multiple elements
Responsive styles: starting with mobile up
Include pipes to section up classes types.
data-add-class & data-remove-class will be triggered when using the toggleAnimation(element) function which will accept a list of classes seperated with a space (' ').

classes and ids should be skewer case "this-is-a-class"

section and block schema/json ids should use underscores "this_is_schema"

# Swiper

Swiper - swiper settings are passed through as an object and parsed in app.js, all handles need to be wrapped in double quotes. important data attr are data-swiper & data-swiper-settings

# Responsive Image

Responive image make use of `<picture>` and serve the correct size image

# Video

TBC videos using files

# Giftcards

TBC need to pass through the correct properties when using CartJS

