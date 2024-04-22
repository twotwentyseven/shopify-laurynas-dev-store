/*


	Adds customisable multi-variant options (radio or select), Cart.js powered AJAX, and Recharge Selling Groups to standard product forms

	Usage:

		Add a standard product variant select to your product form, then add the following attributes:

			data-multi-option='{{ product | json | escape }}' 
			name="id"
			id="product-selector-{{ product.id }}"             (you may change this, although it must be unique)

		Optionally, you may also set the following data attributes:

			data-multi-option-scope      (sets the scope of how far the script will look to update attributes on page, such as price, compare-at-price, button state.  defaults to 'form')
			data-option-x-type           (replace x with the 1-index of the option, and set value to either 'radio' or 'select')
			data-option-x-target         (replace x with the 1-index of the option, and set value to a css selector where you want the option selector to be appended to)
				

		i.e.

			<select 
				name="id" 
				id="product-selector-{{ product.id }}"
				data-multi-option='{{ product | json | escape }}' 
				data-multi-option-scope=".product-section"
				data-option-1-type="radio"
				data-option-1-target=".colour-options"
				data-option-2-type="select"
				data-option-2-target=".size-options">
			...
			</select>

		Add data-price and data-compare-at-price to any element which you want to update the price (on variant change) - this will overwrite the innerHTML of this element.  Money will be formatted as per Shopify.money_format

		Add data-backorder to any element you want to show/hide if variant is out of stock

		Add data-cart-add-async to any button that you wish to do an AJAX call to the cart using Cart.js

			- Script will look for all data contained within the closest 'form' and send that, including:
				
				name=id
				name=quantity
				name=properties[xxx]


*/



window.productSelectCallback = function(variant, selector) {

    // console.log(variant, selector)

    const scope = selector.variantIdField.closest(selector.variantIdField.dataset.multiOptionScope || 'form')

    if (variant) {

        const dataset = Object.assign({}, selector.variantIdField.selectedOptions[0].dataset)
        
        Object.entries(dataset).forEach(([key, value]) => {
            scope.querySelectorAll('[data-' + key + '_output]').forEach(function(domElement){ domElement.innerHTML = value })
        })

      	let variantPrice = variant.price

      	const selectedSellingPlan = scope.querySelector('[name="properties[selling_plan]"]')

      	if(selectedSellingPlan && selectedSellingPlan.value && selectedSellingPlan.dataset.sellingGroups) {
            console.log('selling plan', selectedSellingPlan.value)
      		// Find matching selling plan
      		const selectedSellingGroups = JSON.parse(selectedSellingPlan.dataset.sellingGroups)
      		const sellingPlan = selectedSellingGroups[0].selling_plans.find(function(x) { return x.id == selectedSellingPlan.value})
      		if(sellingPlan && sellingPlan.price_adjustments && sellingPlan.price_adjustments[0]) {
      			let priceAdjustment = sellingPlan.price_adjustments[0]
      			if(priceAdjustment.value_type == 'percentage') {
      				variantPrice -= variantPrice * (priceAdjustment.value / 100)
      			} else if(priceAdjustment.value_type == 'price') {
      				variantPrice = priceAdjustment.value
      			} else if(priceAdjustment.value_type == 'fixed_amount') {
      				variantPrice -= priceAdjustment.value
      			}
      		}
      	}

        if (variant.available) {

            scope.querySelectorAll('[name=add]').forEach(function(domElement){ 
                domElement.parentElement.classList.remove('disabled') 
                domElement.disabled = false
                domElement.innerHTML = 'Add to cart'
            })

            let variantInventory = dataset.stock

            scope.querySelectorAll('[data-inventory]').forEach(function(domElement){ 
            
                domElement.dataset.inventory = variantInventory 
                if(domElement.dataset.lowStockWarning && variantInventory > domElement.dataset.lowStockWarning) {
                    domElement.classList.remove('hidden')
                    domElement.classList.add('flex')
                } else {
                    domElement.classList.add('hidden')
                    domElement.classList.remove('flex')
                }
            
            })

        } else {

            scope.querySelectorAll('[name=add]').forEach(function(domElement){ 
                domElement.parentElement.classList.add('disabled')  
                domElement.disabled = true
                domElement.innerHTML = 'Sold out'
            })
        }

        scope.querySelectorAll('[data-price]').forEach(function(domElement){ domElement.innerHTML = Shopify.formatMoney(variantPrice, Shopify.money_format) })
        
        
        if ( variant.compare_at_price > variantPrice ) {
            scope.querySelectorAll('[data-compare-at-price]').forEach(function(domElement){ 
                domElement.innerHTML = Shopify.formatMoney(variant.compare_at_price, Shopify.money_format) 
                domElement.classList.remove('hidden')
            })
        } else {
            scope.querySelectorAll('[data-compare-at-price]').forEach(function(domElement){ 
                domElement.innerHTML = ''
                domElement.classList.add('hidden')
            })
        }   

    } else {

        scope.querySelectorAll('[data-price]').forEach(function(domElement){ domElement.innerHTML = '' })
        scope.querySelectorAll('[data-compare-at-price]').forEach(function(domElement){ 
            domElement.innerHTML = ''
            domElement.classList.add('hidden')
        })
        
        scope.querySelectorAll('[data-backorder]').forEach(function(domElement){ domElement.classList.add('hidden') })

        scope.querySelectorAll('[name=add]').forEach(function(domElement){ 
            
            domElement.parentElement.classList.add('disabled') 
            domElement.disabled = true
            domElement.innerHTML = 'Unavailable'
        })
    }

}


document.addEventListener('DOMContentLoaded', function(event) {

    document.querySelectorAll('[data-multi-option]').forEach(function(domElement){ 
        
        if(domElement.id && domElement.dataset.multiOption && JSON.parse(domElement.dataset.multiOption)) {

            const selector = new Shopify.OptionSelectors(domElement.id, { product: JSON.parse(domElement.dataset.multiOption), onVariantSelected: window.productSelectCallback, enableHistoryState: true });    

        	const scope = domElement.closest(domElement.dataset.multiOptionScope || 'form')

        	const sellingPlan = scope.querySelector('[name="properties[selling_plan]"]')

        	if(sellingPlan) {
        		sellingPlan.onchange = function() { selector.fireOnChangeForFirstDropdown() }
        	}

        }
    })

    document.addEventListener("click", function(event){ 

        if (!event.target.matches('[data-sub-toggle]')) return;

        event && event.preventDefault()

        const domElement = event.target
        const scope = domElement.closest('form')        
        const sellingPlan = scope.querySelector('[name="properties[selling_plan]"]')

        if (domElement.hasAttribute('data-one-time')) {
            // if one time was clicked set selling plan to empty
            sellingPlan.value = ''
        }
        
        // if (domElement.hasAttribute('data-subscribe')) {
            // if subscribe do something if required.
            // could be used to trigger a one time popup?
        // }

        // update selling plan select with new option
        sellingPlan.dispatchEvent(new Event('change'));

    })


    document.addEventListener("click", function(event){ 
        
        if (!event.target.matches('[data-cart-add-async]')) return;
        event && event.preventDefault()

        const domElement = event.target
        const scope = domElement.closest('form')
        const subscriptionSelected = scope.querySelector('[name=subscription]')?.value
        const variantId = scope.querySelector('[name=id]').value
        const quantity = scope.querySelector('[name=quantity]').value
        let properties = {}
        scope.querySelectorAll('[name^=properties]').forEach(function(propertyElement) {
            const propertyNameMatch = propertyElement.name.match(/properties\[(.*)\]/)
            if(propertyNameMatch[1]) {
                
                if (propertyNameMatch[1] == 'selling_plan') {
                    if (subscriptionSelected === 'true') {
                        console.log(subscriptionSelected);
                        properties[propertyNameMatch[1]] = propertyElement.value
                        console.log(propertyElement.name, propertyNameMatch[1])
                    }
                } else {
                    properties[propertyNameMatch[1]] = propertyElement.value
                }
            }
        })
        console.log("properties:", properties)
        CartJS.addItem(variantId, quantity, properties, {
            "success": function(data, textStatus, jqXHR) {
                // Add optional callback mechanism here?
                // alert('Added!');
                console.log("updating cart button",data)
                
                document.querySelectorAll('.j-qb-toggle').forEach(function(draw){ 
                    draw.parentElement.parentElement.classList.remove('active');
                });

                document.dispatchEvent(new Event("itemAdded"));
                
            },
            "error": function(jqXHR, textStatus, errorThrown) {
                // Add optional callback mechanism here?
                // alert('Error: ' + errorThrown + '!');
            }
        });


    })

    document.addEventListener("click", function(event){ 

        if (!event.target.matches('[data-cart-add-bundle-async]')) return;

        event && event.preventDefault()

        const domElement = event.target
        const scope = domElement.closest('form')

        const items = scope.querySelector('[bundle]').value
        // console.log("ITEMS NOT PARSED: ",items)
        // console.log("ITEMS PARSED: ", JSON.parse(items))

        CartJS.addItems(JSON.parse(items));


    })


    document.addEventListener("click", function(event){ 

        if (!event.target.matches('[data-qty-btn]')) return;

        event && event.preventDefault()
        const domElement = event.target
        const scope = domElement.closest('form')
        const quantity = scope.querySelector('[name=quantity]')

        if (domElement.hasAttribute('data-increment')) {
            quantity.value = ++quantity.value
        }

        if (domElement.hasAttribute('data-decrement') && quantity.value != 1) {
            quantity.value = --quantity.value
        }

    
    })
  
})


function floatToString(t, e)
{
    var o = t.toFixed(e).toString();
    return o.match(/^\.\d+/) ? "0" + o : o
}
"undefined" == typeof window.Shopify && (window.Shopify = {}), Shopify.each = function(t, e)
{
    for (var o = 0; o < t.length; o++) e(t[o], o)
}, Shopify.map = function(t, e)
{
    for (var o = [], i = 0; i < t.length; i++) o.push(e(t[i], i));
    return o
}, Shopify.arrayIncludes = function(t, e)
{
    for (var o = 0; o < t.length; o++)
        if (t[o] == e) return !0;
    return !1
}, Shopify.uniq = function(t)
{
    for (var e = [], o = 0; o < t.length; o++) Shopify.arrayIncludes(e, t[o]) || e.push(t[o]);
    return e
}, Shopify.isDefined = function(t)
{
    return void 0 !== t
}, Shopify.getClass = function(t)
{
    return Object.prototype.toString.call(t).slice(8, -1)
}, Shopify.extend = function(t, e)
{
    function o()
    {}
    o.prototype = e.prototype, t.prototype = new o, (t.prototype.constructor = t).baseConstructor = e, t.superClass = e.prototype
}, Shopify.locationSearch = function()
{
    return window.location.search
}, Shopify.locationHash = function()
{
    return window.location.hash
}, Shopify.replaceState = function(t)
{
    window.history.replaceState(
    {}, document.title, t)
}, Shopify.urlParam = function(t)
{
    var e = RegExp("[?&]" + t + "=([^&#]*)").exec(Shopify.locationSearch());
    return e && decodeURIComponent(e[1].replace(/\+/g, " "))
}, Shopify.newState = function(t, e)
{
    return (Shopify.urlParam(t) ? Shopify.locationSearch().replace(RegExp("(" + t + "=)[^&#]+"), "$1" + e) : "" === Shopify.locationSearch() ? "?" + t + "=" + e : Shopify.locationSearch() + "&" + t + "=" + e) + Shopify.locationHash()
}, Shopify.setParam = function(t, e)
{
    Shopify.replaceState(Shopify.newState(t, e))
}, Shopify.Product = function(t)
{
    Shopify.isDefined(t) && this.update(t)
}, Shopify.Product.prototype.update = function(t)
{
    for (property in t) this[property] = t[property]
}, Shopify.Product.prototype.optionNames = function()
{
    return "Array" == Shopify.getClass(this.options) ? this.options : []
}, Shopify.Product.prototype.optionValues = function(o)
{
    if (!Shopify.isDefined(this.variants)) return null;
    var t = Shopify.map(this.variants, function(t)
    {
        var e = "option" + (o + 1);
        return t[e] == undefined ? null : t[e]
    });
    return null == t[0] ? null : Shopify.uniq(t)
}, Shopify.Product.prototype.getVariant = function(i)
{
    var r = null;
    return i.length != this.options.length || Shopify.each(this.variants, function(t)
    {
        for (var e = !0, o = 0; o < i.length; o++)
        {
            t["option" + (o + 1)] != i[o] && (e = !1)
        }
        1 != e || (r = t)
    }), r
}, Shopify.Product.prototype.getVariantById = function(t)
{
    for (var e = 0; e < this.variants.length; e++)
    {
        var o = this.variants[e];
        if (t == o.id) return o
    }
    return null
}, Shopify.money_format = "${{amount}}", Shopify.formatMoney = function(t, e)
{
    function n(t, e)
    {
        return void 0 === t ? e : t
    }

    function o(t, e, o, i)
    {
        if (e = n(e, 2), o = n(o, ","), i = n(i, "."), isNaN(t) || null == t) return 0;
        var r = (t = (t / 100).toFixed(e)).split(".");
        return r[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + o) + (r[1] ? i + r[1] : "")
    }
    "string" == typeof t && (t = t.replace(".", ""));
    var i = "",
        r = /\{\{\s*(\w+)\s*\}\}/,
        a = e || this.money_format;
    switch (a.match(r)[1])
    {
        case "amount":
            i = o(t, 2);
            break;
        case "amount_no_decimals":
            i = o(t, 0);
            break;
        case "amount_with_comma_separator":
            i = o(t, 2, ".", ",");
            break;
        case "amount_with_space_separator":
            i = o(t, 2, " ", ",");
            break;
        case "amount_with_period_and_space_separator":
            i = o(t, 2, " ", ".");
            break;
        case "amount_no_decimals_with_comma_separator":
            i = o(t, 0, ".", ",");
            break;
        case "amount_no_decimals_with_space_separator":
            i = o(t, 0, " ");
            break;
        case "amount_with_apostrophe_separator":
            i = o(t, 2, "'", ".")
    }
    return a.replace(r, i)
}, Shopify.OptionSelectors = function(t, e)
{
    return this.selectorDivClass = "selector-wrapper", 
        this.selectorClass = "single-option-selector", 
        this.variantIdFieldIdSuffix = "-variant-id", 
        this.variantIdField = null, 
        this.historyState = null, 
        this.selectors = [], 
        this.selectorsOptions = {},
        this.domIdPrefix = t, 
        this.product = new Shopify.Product(e.product), 
        this.onVariantSelected = Shopify.isDefined(e.onVariantSelected) ? e.onVariantSelected : function() {}, 
        this.replaceSelector(t), 
        this.initDropdown(), 
        e.enableHistoryState && (this.historyState = new Shopify.OptionSelectors.HistoryState(this)), 
        !0
}, Shopify.OptionSelectors.prototype.initDropdown = function()
{
    var t = {
        initialLoad: !0
    };
    if (!this.selectVariantFromDropdown(t))
    {
        var e = this;
        setTimeout(function()
        {
            e.selectVariantFromParams(t) || e.fireOnChangeForFirstDropdown.call(e, t)
        })
    }
}, Shopify.OptionSelectors.prototype.fireOnChangeForFirstDropdown = function(t)
{
    this.selectors[0].element.onchange(t)
}, Shopify.OptionSelectors.prototype.selectVariantFromParamsOrDropdown = function(t)
{
    this.selectVariantFromParams(t) || this.selectVariantFromDropdown(t)
}, Shopify.OptionSelectors.prototype.replaceSelector = function(t)
{
    var e = document.getElementById(t),
        o = e.parentNode;
    Shopify.each(this.buildSelectors(), function(t,i)
    {
        const scope = e.closest(e.dataset.multiOptionScope || 'form')

        let selectorTarget = e.dataset['option-' + (i + 1) + 'Target'] || false

        if(selectorTarget) {
            selectorTarget = scope.querySelector(selectorTarget)
            selectorTargetParent = selectorTarget.parentNode
            selectorTarget.appendChild(t)
        } else {
            selectorTarget = e
            selectorTargetParent = o
            selectorTargetParent.insertBefore(t, selectorTarget)
        }

    }), e.style.display = "none", this.variantIdField = e
}, Shopify.OptionSelectors.prototype.selectVariantFromDropdown = function(t)
{
    var e = document.getElementById(this.domIdPrefix).querySelector("[selected]");
    if (e || (e = document.getElementById(this.domIdPrefix).querySelector('[selected="selected"]')), !e) return !1;
    var o = e.value;
    return this.selectVariant(o, t)
}, Shopify.OptionSelectors.prototype.selectVariantFromParams = function(t)
{
    var e = Shopify.urlParam("variant");
    return this.selectVariant(e, t)
}, Shopify.OptionSelectors.prototype.selectVariant = function(t, e)
{
    var o = this.product.getVariantById(t);
    if (null == o) return !1;
    for (var i = 0; i < this.selectors.length; i++)
    {
        var r = this.selectors[i].element,
            n = o[r.getAttribute("data-option")];
        null != n && this.optionExistInSelect(r, n) && (r.value = n)
    }
    return "undefined" != typeof jQuery ? jQuery(this.selectors[0].element).trigger("change", e) : this.selectors[0].element.onchange(e), !0
}, Shopify.OptionSelectors.prototype.optionExistInSelect = function(t, e)
{
    for (var o = 0; o < t.options.length; o++)
        if (t.options[o].value == e) return !0
}, Shopify.OptionSelectors.prototype.insertSelectors = function(t, e)
{
    Shopify.isDefined(e) && this.setMessageElement(e), this.domIdPrefix = "product-" + this.product.id + "-variant-selector";
    var o = document.getElementById(t);
    Shopify.each(this.buildSelectors(), function(t, i)
    {
        o.appendChild(t)
    })
}, Shopify.OptionSelectors.prototype.buildSelectors = function()
{
    for (var t = 0; t < this.product.optionNames().length; t++)
    {
        var e = new Shopify.SingleOptionSelector(this, t, this.product.optionNames()[t], this.product.optionValues(t));
        e.element.disabled = !1, this.selectors.push(e)
    }
    var i = this.selectorDivClass,
        r = this.product.optionNames();
    return Shopify.map(this.selectors, function(t)
    {
        var e = document.createElement("div");
        
        // removed if logic so that single variants get labels pull setAttr from if statement
        e.setAttribute("class", i)
        // if (e.setAttribute("class", i), 1 < r.length)
        // {
            
            var o = document.createElement("label");
            o.htmlFor = t.element.id, o.innerHTML = t.name, e.appendChild(o)
        // }
        
        var customOutput = ''
        if (t.customElement != undefined) {
            var customOutput = e.appendChild(t.customElement)
        }
        
        return e.appendChild(t.element), customOutput, e
    })
}, Shopify.OptionSelectors.prototype.selectedValues = function()
{
    for (var t = [], e = 0; e < this.selectors.length; e++)
    {
        var o = this.selectors[e].element.value;

        if(!o) {
            o = this.selectors[e].element.querySelector(':checked').value
        }

        t.push(o)
    }
    return t
}, Shopify.OptionSelectors.prototype.updateSelectors = function(t, e)
{
    var o = this.selectedValues(),
        i = this.product.getVariant(o);
    i ? (this.variantIdField.disabled = !1, this.variantIdField.value = i.id) : this.variantIdField.disabled = !0, this.onVariantSelected(i, this, e), null != this.historyState && this.historyState.onVariantChange(i, this, e)

    var product = this.product

    function optionIsAvailable(index, option) {

        let adjustedSelectedOptions = Object.assign([], o)
        
        adjustedSelectedOptions[index] = option

        let output = product.variants.some((variant) => {
            return variant.available && variant.options.reduce((output, option, key) => {
                return typeof adjustedSelectedOptions[key] != 'undefined' && option == adjustedSelectedOptions[key] && output
            }, true)
        })

        return output
    }


    this.selectors.forEach((selector, index) => {
        if(selector.element.tagName.toLowerCase() == 'div') {
            selector.element.querySelectorAll('input').forEach(element => {
                if(optionIsAvailable(index, element.value)) {
                    element.nextSibling.classList.remove('disabled')
                } else {
                    element.nextSibling.classList.add('disabled')
                }
            })
        }
        // if(selector.element.tagName)
    })




}, Shopify.OptionSelectorsFromDOM = function(t, e)
{
    var o = e.optionNames || [],
        i = e.priceFieldExists || !0,
        r = e.delimiter || "/",
        n = this.createProductFromSelector(t, o, i, r);
    e.product = n, Shopify.OptionSelectorsFromDOM.baseConstructor.call(this, t, e)
}, Shopify.extend(Shopify.OptionSelectorsFromDOM, Shopify.OptionSelectors), Shopify.OptionSelectorsFromDOM.prototype.createProductFromSelector = function(t, n, a, s)
{
    if (!Shopify.isDefined(a)) a = !0;
    if (!Shopify.isDefined(s)) s = "/";
    var e = document.getElementById(t),
        o = e.childNodes,
        p = (e.parentNode, n.length),
        l = [];
    Shopify.each(o, function(t)
    {
        if (1 == t.nodeType && "option" == t.tagName.toLowerCase())
        {
            var e = t.innerHTML.split(new RegExp("\\s*\\" + s + "\\s*"));
            0 == n.length && (p = e.length - (a ? 1 : 0));
            var o = e.slice(0, p),
                i = a ? e[p] : "",
                r = (t.getAttribute("value"),
                {
                    available: !t.disabled,
                    id: parseFloat(t.value),
                    price: i,
                    option1: o[0],
                    option2: o[1],
                    option3: o[2]
                });
            l.push(r)
        }
    });
    var i = {
        variants: l
    };
    if (0 == n.length)
    {
        i.options = [];
        for (var r = 0; r < p; r++) i.options[r] = "option " + (r + 1)
    }
    else i.options = n;
    return i
}, 
Shopify.SingleOptionSelector = 

// function(o, i, t, e)
// {
//     this.multiSelector = o, this.values = e, this.index = i, this.name = t, this.element = document.createElement("select");
//     for (var r = 0; r < e.length; r++)
//     {
//         var n = document.createElement("option");
//         n.value = e[r], n.innerHTML = e[r], this.element.appendChild(n)
//     }
//     return this.element.setAttribute("class", this.multiSelector.selectorClass), 
//     this.element.setAttribute("data-option", "option" + (i + 1)), 
//     this.element.id = o.domIdPrefix + "-option-" + i, 
//     this.element.onchange = function(t, e)
//     {
//         e = e ||
//         {}, o.updateSelectors(i, e)
//     }, !0
// }, 


function(multiSelector, index, name, values) {

    const selectorDom = document.getElementById(multiSelector.domIdPrefix)
    const selectorType = selectorDom.dataset['option-' + (index + 1) + 'Type'] || 'select'

    this.multiSelector = multiSelector;
    this.values = values;
    this.index = index;
    this.name = name;

    switch(selectorType) {

        case 'radio':
            this.element = document.createElement('div');
            for (var i = 0; i < values.length; i++) {
                var opt = document.createElement('input');
                opt.type = "radio"
                opt.name = multiSelector.domIdPrefix + '-option-'+ index;
                opt.checked = i == 0
                opt.id = multiSelector.domIdPrefix + '-option-'+ index + '-' + i;
                opt.value = values[i];
                this.element.appendChild(opt);
                var label = document.createElement('label');
                label.htmlFor = multiSelector.domIdPrefix + '-option-'+ index + '-' + i;
                label.innerHTML = values[i];
                this.element.appendChild(label);
               
            }
            this.element.setAttribute('class', this.multiSelector.selectorClass);
            this.element.id = multiSelector.domIdPrefix + '-option-' + (index + 1);
            this.element.onchange = function(name, values) {
                values = values || {}
                multiSelector.updateSelectors(index, values);
            };
            break;

        case 'select':
        default:
            this.element = document.createElement('select');
            for (var i = 0; i < values.length; i++) {
                var opt = document.createElement('option');
                opt.value = values[i];
                opt.innerHTML = values[i];
                this.element.appendChild(opt);
            }
            this.customElement = document.createElement('div')
            var customerTrigger = document.createElement('div')
            customerTrigger.setAttribute('class', 'selectCustom-trigger')
            customerTrigger.innerHTML = values[0]
            this.customElement.appendChild(customerTrigger)
            var customElementInner = document.createElement('div')
            customElementInner.setAttribute('class', 'selectCustom-options')
            this.customElement.appendChild(customElementInner)
            for (var i = 0; i < values.length; i++) {
                var customOpt = document.createElement('div')
                customOpt.setAttribute('data-value', values[i])
                customOpt.setAttribute('class', 'selectCustom-option')
                customOpt.innerHTML = values[i];
                customElementInner.appendChild(customOpt);
            }

            this.element.setAttribute('class', this.multiSelector.selectorClass + ' js-selectNative selectNative');
            this.customElement.setAttribute('class', 'selectCustom js-selectCustom')
            this.customElement.setAttribute('aria-hidden', true)
            this.element.id = multiSelector.domIdPrefix + '-option-' + (index + 1);
            this.customElement.id = multiSelector.domIdPrefix + '-custom-option-' + (index + 1);
            this.element.onchange = function(name, values) {
                values = values || {}
                multiSelector.updateSelectors(index, values);
            };
            break;
    }

    return true

},



Shopify.Image = {
    preload: function(t, e)
    {
        for (var o = 0; o < t.length; o++)
        {
            var i = t[o];
            this.loadImage(this.getSizedImageUrl(i, e))
        }
    },
    loadImage: function(t)
    {
        (new Image).src = t
    },
    switchImage: function(t, e, o)
    {
        if (t && e)
        {
            var i = this.imageSize(e.src),
                r = this.getSizedImageUrl(t.src, i);
            o ? o(r, t, e) : e.src = r
        }
    },
    imageSize: function(t)
    {
        var e = t.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);
        return null !== e ? e[1] : null
    },
    getSizedImageUrl: function(t, e)
    {
        if (null == e) return t;
        if ("master" == e) return this.removeProtocol(t);
        var o = t.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?.*)?$/i);
        if (null == o) return null;
        var i = t.split(o[0]),
            r = o[0];
        return this.removeProtocol(i[0] + "_" + e + r)
    },
    removeProtocol: function(t)
    {
        return t.replace(/http(s)?:/, "")
    }
}, Shopify.OptionSelectors.HistoryState = function(t)
{
    this.browserSupports() && this.register(t)
}, Shopify.OptionSelectors.HistoryState.prototype.register = function(t)
{
    window.addEventListener("popstate", function()
    {
        t.selectVariantFromParamsOrDropdown(
        {
            popStateCall: !0
        })
    })
}, Shopify.OptionSelectors.HistoryState.prototype.onVariantChange = function(t, e, o)
{
    this.browserSupports() && (!t || o.initialLoad || o.popStateCall || Shopify.setParam("variant", t.id))
}, Shopify.OptionSelectors.HistoryState.prototype.browserSupports = function()
{
    return window.history && window.history.replaceState
};


/* Features to make the selectCustom work for mouse users.

- Toggle custom select visibility when clicking the "box"
- Update custom select value when clicking in a option
- Navigate through options when using keyboard up/down
- Pressing Enter or Space selects the current hovered option
- Close the select when clicking outside of it
- Sync both selects values when selecting a option. (native or custom)
*/


// function hybridSoloInit(elSelect) {

//     const elSelectNative = elSelect.getElementsByClassName("js-selectNative")[0];
//     const elSelectCustom = elSelect.getElementsByClassName("js-selectCustom")[0];
    
//     if (!elSelectCustom) return

//     const elSelectCustomBox = elSelectCustom.children[0];
//     const elSelectCustomOpts = elSelectCustom.children[1];
//     const customOptsList = Array.from(elSelectCustomOpts.children);
//     const optionsCount = customOptsList.length;
//     const defaultLabel = elSelectCustomBox.getAttribute("data-value");
  
//     let optionChecked = "";
//     let optionHoveredIndex = -1;
  
//     // Toggle custom select visibility when clicking the box
//     elSelectCustomBox.addEventListener("click", (e) => {
//       const isClosed = !elSelectCustom.classList.contains("isActive");
  
//       if (isClosed) {
//         openSelectCustom();
//       } else {
//         closeSelectCustom();
//       }
//     });
  
//     function openSelectCustom() {
//       elSelectCustom.classList.add("isActive");
//       // Remove aria-hidden in case this was opened by a user
//       // who uses AT (e.g. Screen Reader) and a mouse at the same time.
//       elSelectCustom.setAttribute("aria-hidden", false);
  
//       if (optionChecked) {
//         const optionCheckedIndex = customOptsList.findIndex(
//           (el) => el.getAttribute("data-value") === optionChecked
//         );
//         updateCustomSelectHovered(optionCheckedIndex);
//       }
  
//       // Add related event listeners
//       document.addEventListener("click", watchClickOutside);
//       document.addEventListener("keydown", supportKeyboardNavigation);
//     }
  
//     function closeSelectCustom() {
//       elSelectCustom.classList.remove("isActive");
  
//       elSelectCustom.setAttribute("aria-hidden", true);
  
//       updateCustomSelectHovered(-1);
  
//       // Remove related event listeners
//       document.removeEventListener("click", watchClickOutside);
//       document.removeEventListener("keydown", supportKeyboardNavigation);
//     }
  
//     function updateCustomSelectHovered(newIndex) {
//       const prevOption = elSelectCustomOpts.children[optionHoveredIndex];
//       const option = elSelectCustomOpts.children[newIndex];
  
//       if (prevOption) {
//         prevOption.classList.remove("isHover");
//       }
//       if (option) {
//         option.classList.add("isHover");
//       }
  
//       optionHoveredIndex = newIndex;
//     }
  
//     function updateCustomSelectChecked(value, text) {
//       const prevValue = optionChecked;
//       const elPrevOption = elSelectCustomOpts.querySelector(
//         `[data-value="${prevValue}"`
//       );
//       const elOption = elSelectCustomOpts.querySelector(`[data-value="${value}"`);
  
//       if (elPrevOption) {
//         elPrevOption.classList.remove("isActive");
//       }
  
//       if (elOption) {
//         elOption.classList.add("isActive");
//       }
  
//       elSelectCustomBox.textContent = text;
//       optionChecked = value;
//     }
  
//     function watchClickOutside(e) {
//       const didClickedOutside = !elSelectCustom.contains(event.target);
//       if (didClickedOutside) {
//         closeSelectCustom();
//       }
//     }
  
//     function supportKeyboardNavigation(e) {
//       // press down -> go next
//       if (event.keyCode === 40 && optionHoveredIndex < optionsCount - 1) {
//         let index = optionHoveredIndex;
//         e.preventDefault(); // prevent page scrolling
//         updateCustomSelectHovered(optionHoveredIndex + 1);
//       }
  
//       // press up -> go previous
//       if (event.keyCode === 38 && optionHoveredIndex > 0) {
//         e.preventDefault(); // prevent page scrolling
//         updateCustomSelectHovered(optionHoveredIndex - 1);
//       }
  
//       // press Enter or space -> select the option
//       if (event.keyCode === 13 || event.keyCode === 32) {
//         e.preventDefault();
  
//         const option = elSelectCustomOpts.children[optionHoveredIndex];
//         const value = option && option.getAttribute("data-value");
  
//         if (value) {
//           elSelectNative.value = value;
//           updateCustomSelectChecked(value, option.textContent);
//         }
//         closeSelectCustom();
//       }
  
//       // press ESC -> close selectCustom
//       if (event.keyCode === 27) {
//         closeSelectCustom();
//       }
//     }
  
//     // Update selectCustom value when selectNative is changed.
//     console.log(elSelectNative, elSelectCustom);

//     elSelectNative.addEventListener("change", (e) => {
//         const value = e.target.value;
//         console.log('value', value);
//         const elRespectiveCustomOption = elSelectCustomOpts.querySelectorAll(
//             `[data-value="${value}"]`
//         )[0];
  
//       updateCustomSelectChecked(value, elRespectiveCustomOption.textContent);
//     });
  
//     // Update selectCustom value when an option is clicked or hovered
//     customOptsList.forEach(function (elOption, index) {
//       elOption.addEventListener("click", (e) => {
//         const value = e.target.getAttribute("data-value");

//         // console.log(value)
//         // console.log(elSelectNative.value)
  
//         // Sync native select to have the same value
//         elSelectNative.value = value;

//         //adding to update the Shopify options
//         elSelectNative.onchange && elSelectNative.onchange();
        
//         updateCustomSelectChecked(value, e.target.textContent);
//         closeSelectCustom();
//       });
  
//       elOption.addEventListener("mouseenter", (e) => {
//         updateCustomSelectHovered(index);
//       });
  
//       // TODO: Toggle these event listeners based on selectCustom visibility
//     });
//   }
  
//   function hybridSelectInit() {
//     const allSelectsInPage = document.getElementsByClassName("selector-wrapper");

    
//     for (let i = 0; i < allSelectsInPage.length; i++) {
//       hybridSoloInit(allSelectsInPage[i]);
//     }
//   }

//   document.addEventListener('DOMContentLoaded', function(event) {
  
//     hybridSelectInit();
    
//   });
