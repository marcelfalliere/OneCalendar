jQuery.webshims.register('form-datalist', function($, webshims, window, document, undefined){
	var doc = document;	

	/*
	 * implement propType "element" currently only used for list-attribute (will be moved to dom-extend, if needed)
	 */
	webshims.propTypes.element = function(descs){
		webshims.createPropDefault(descs, 'attr');
		if(descs.prop){return;}
		descs.prop = {
			get: function(){
				var elem = descs.attr.get.call(this);
				if(elem){
					elem = document.getElementById(elem);
					if(elem && descs.propNodeName && !$.nodeName(elem, descs.propNodeName)){
						elem = null;
					}
				}
				return elem || null;
			},
			writeable: false
		};
	};
	
	
	/*
	 * Implements datalist element and list attribute
	 */
	
	(function(){
		var formsCFG = $.webshims.cfg.forms;
		var listSupport = Modernizr.input.list;
		if(listSupport && !formsCFG.customDatalist){return;}
		
			var initializeDatalist =  function(){
				
				
			if(!listSupport){
				webshims.defineNodeNameProperty('datalist', 'options', {
					prop: {
						writeable: false,
						get: function(){
							var elem = this;
							var select = $('select', elem);
							var options;
							if(select[0]){
								options = select[0].options;
							} else {
								options = $('option', elem).get();
								if(options.length){
									webshims.warn('you should wrap your option-elements for a datalist in a select element to support IE and other old browsers.');
								}
							}
							return options;
						}
					}
				});
			}
				
			var inputListProto = {
				//override autocomplete
				autocomplete: {
					attr: {
						get: function(){
							var elem = this;
							var data = $.data(elem, 'datalistWidget');
							if(data){
								return data._autocomplete;
							}
							return ('autocomplete' in elem) ? elem.autocomplete : elem.getAttribute('autocomplete');
						},
						set: function(value){
							var elem = this;
							var data = $.data(elem, 'datalistWidget');
							if(data){
								data._autocomplete = value;
								if(value == 'off'){
									data.hideList();
								}
							} else {
								if('autocomplete' in elem){
									elem.autocomplete = value;
								} else {
									elem.setAttribute('autocomplete', value);
								}
							}
						}
					}
				}
			};
			
//			if(formsCFG.customDatalist && (!listSupport || !('selectedOption') in $('<input />')[0])){
//				//currently not supported x-browser (FF4 has not implemented and is not polyfilled )
//				inputListProto.selectedOption = {
//					prop: {
//						writeable: false,
//						get: function(){
//							var elem = this;
//							var list = $.prop(elem, 'list');
//							var ret = null;
//							var value, options;
//							if(!list){return ret;}
//							value = $.prop(elem, 'value');
//							if(!value){return ret;}
//							options = $.prop(list, 'options');
//							if(!options.length){return ret;}
//							$.each(options, function(i, option){
//								if(value == $.prop(option, 'value')){
//									ret = option;
//									return false;
//								}
//							});
//							return ret;
//						}
//					}
//				};
//			}
			
			if(!listSupport){
				inputListProto['list'] = {
					attr: {
						get: function(){
							var val = webshims.contentAttr(this, 'list');
							return (val == null) ? undefined : val;
						},
						set: function(value){
							var elem = this;
							webshims.contentAttr(elem, 'list', value);
							webshims.objectCreate(shadowListProto, undefined, {input: elem, id: value, datalist: $.prop(elem, 'list')});
						}
					},
					initAttr: true,
					reflect: true,
					propType: 'element',
					propNodeName: 'datalist'
				};
			} else {
				//options only return options, if option-elements are rooted: but this makes this part of HTML5 less backwards compatible
				if(!($('<datalist><select><option></option></select></datalist>').prop('options') || []).length ){
					webshims.defineNodeNameProperty('datalist', 'options', {
						prop: {
							writeable: false,
							get: function(){
								var options = this.options || [];
								if(!options.length){
									var elem = this;
									var select = $('select', elem);
									if(select[0] && select[0].options && select[0].options.length){
										options = select[0].options;
									}
								}
								return options;
							}
						}
					});
				}
				inputListProto['list'] = {
					attr: {
						get: function(){
							var val = webshims.contentAttr(this, 'list');
							if(val != null){
								this.removeAttribute('list');
							} else {
								val = $.data(this, 'datalistListAttr');
							}
							
							return (val == null) ? undefined : val;
						},
						set: function(value){
							var elem = this;
							$.data(elem, 'datalistListAttr', value);
							webshims.objectCreate(shadowListProto, undefined, {input: elem, id: value, datalist: $.prop(elem, 'list')});
						}
					},
					initAttr: true,
					reflect: true,
					propType: 'element',
					propNodeName: 'datalist'
				};
			}
				
				
			webshims.defineNodeNameProperties('input', inputListProto);
			
			if($.event.customEvent){
				$.event.customEvent.updateDatalist = true;
				$.event.customEvent.updateInput = true;
				$.event.customEvent.datalistselect = true;
			} 
			webshims.addReady(function(context, contextElem){
				contextElem
					.filter('datalist > select, datalist, datalist > option, datalist > select > option')
					.closest('datalist')
					.triggerHandler('updateDatalist')
				;
				
			});
			
			
		};
		
		
		/*
		 * ShadowList
		 */
		var listidIndex = 0;
		
		var noDatalistSupport = {
			submit: 1,
			button: 1,
			reset: 1, 
			hidden: 1,
			
			//ToDo
			range: 1,
			date: 1
		};
		var lteie6 = ($.browser.msie && parseInt($.browser.version, 10) < 7);
		var globStoredOptions = {};
		var getStoredOptions = function(name){
			if(!name){return [];}
			if(globStoredOptions[name]){
				return globStoredOptions[name];
			}
			var data;
			try {
				data = JSON.parse(localStorage.getItem('storedDatalistOptions'+name));
			} catch(e){}
			globStoredOptions[name] = data || [];
			return data || [];
		};
		var storeOptions = function(name, val){
			if(!name){return;}
			val = val || [];
			try {
				localStorage.setItem( 'storedDatalistOptions'+name, JSON.stringify(val) );
			} catch(e){}
		};
		
		var getText = function(elem){
			return (elem.textContent || elem.innerText || $.text([ elem ]) || '');
		};
		
		var shadowListProto = {
			_create: function(opts){
				
				if(noDatalistSupport[$.prop(opts.input, 'type')]){return;}
				var datalist = opts.datalist;
				var data = $.data(opts.input, 'datalistWidget');
				if(datalist && data && data.datalist !== datalist){
					data.datalist = datalist;
					data.id = opts.id;
					
					data.shadowList.prop('className', 'datalist-polyfill '+ (data.datalist.className || '') + ' '+ data.datalist.id +'-shadowdom');
					if(formsCFG.positionDatalist){
						data.shadowList.insertAfter(opts.input);
					} else {
						data.shadowList.appendTo('body');
					}
					$(data.datalist)
						.unbind('updateDatalist.datalistWidget')
						.bind('updateDatalist.datalistWidget', $.proxy(data, '_resetListCached'))
					;
					data._resetListCached();
					return;
				} else if(!datalist){
					if(data){
						data.destroy();
					}
					return;
				} else if(data && data.datalist === datalist){
					return;
				}
				listidIndex++;
				var that = this;
				this.hideList = $.proxy(that, 'hideList');
				this.timedHide = function(){
					clearTimeout(that.hideTimer);
					that.hideTimer = setTimeout(that.hideList, 9);
				};
				this.datalist = datalist;
				this.id = opts.id;
				this.hasViewableData = true;
				this._autocomplete = $.attr(opts.input, 'autocomplete');
				$.data(opts.input, 'datalistWidget', this);
				this.shadowList = $('<div class="datalist-polyfill '+ (this.datalist.className || '') + ' '+ this.datalist.id +'-shadowdom' +'" />');
				
				if(formsCFG.positionDatalist || $(opts.input).hasClass('position-datalist')){
					this.shadowList.insertAfter(opts.input);
				} else {
					this.shadowList.appendTo('body');
				}
				
				this.index = -1;
				this.input = opts.input;
				this.arrayOptions = [];
				
				this.shadowList
					.delegate('li', 'mouseenter.datalistWidget mousedown.datalistWidget click.datalistWidget', function(e){
						var items = $('li:not(.hidden-item)', that.shadowList);
						var select = (e.type == 'mousedown' || e.type == 'click');
						that.markItem(items.index(e.currentTarget), select, items);
						if(e.type == 'click'){
							that.hideList();
							if(formsCFG.customDatalist){
								$(opts.input).trigger('datalistselect');
							}
						}
						return (e.type != 'mousedown');
					})
					.bind('focusout', this.timedHide)
				;
				
				opts.input.setAttribute('autocomplete', 'off');
				
				$(opts.input)
					.attr({
						//role: 'combobox',
						'aria-haspopup': 'true'
					})
					.bind('input.datalistWidget', function(){
						if(!that.triggeredByDatalist){
							that.changedValue = false;
							that.showHideOptions();
						}
					})
					
					.bind('keydown.datalistWidget', function(e){
						var keyCode = e.keyCode;
						var activeItem;
						var items;
						if(keyCode == 40 && !that.showList()){
							that.markItem(that.index + 1, true);
							return false;
						}
						
						if(!that.isListVisible){return;}
						
						 
						if(keyCode == 38){
							that.markItem(that.index - 1, true);
							return false;
						} 
						if(!e.shiftKey && (keyCode == 33 || keyCode == 36)){
							that.markItem(0, true);
							return false;
						} 
						if(!e.shiftKey && (keyCode == 34 || keyCode == 35)){
							items = $('li:not(.hidden-item)', that.shadowList);
							that.markItem(items.length - 1, true, items);
							return false;
						} 
						if(keyCode == 13 || keyCode == 27){
							if (keyCode == 13){
								activeItem = $('li.active-item:not(.hidden-item)', that.shadowList);
								that.changeValue( $('li.active-item:not(.hidden-item)', that.shadowList) );
							}
							that.hideList();
							if(formsCFG.customDatalist && activeItem && activeItem[0]){
								$(opts.input).trigger('datalistselect');
							}
							return false;
						}
					})
					.bind('focus.datalistWidget', function(){
						if($(this).hasClass('list-focus')){
							that.showList();
						}
					})
					.bind('mousedown.datalistWidget', function(){
						if($(this).is(':focus')){
							that.showList();
						}
					})
					.bind('blur.datalistWidget', this.timedHide)
				;
				
				
				$(this.datalist)
					.unbind('updateDatalist.datalistWidget')
					.bind('updateDatalist.datalistWidget', $.proxy(this, '_resetListCached'))
				;
				
				this._resetListCached();
				
				if(opts.input.form && (opts.input.name || opts.input.id)){
					$(opts.input.form).bind('submit.datalistWidget'+opts.input.id, function(){
						if(!$(opts.input).hasClass('no-datalist-cache') && that._autocomplete != 'off'){
							var val = $.prop(opts.input, 'value');
							var name = (opts.input.name || opts.input.id) + $.prop(opts.input, 'type');
							if(!that.storedOptions){
								that.storedOptions = getStoredOptions( name );
							}
							if(val && that.storedOptions.indexOf(val) == -1){
								that.storedOptions.push(val);
								storeOptions(name, that.storedOptions );
							}
						}
					});
				}
				$(window).bind('unload.datalist'+this.id+' beforeunload.datalist'+this.id, function(){
					that.destroy();
				});
			},
			destroy: function(){
				var autocomplete = $.attr(this.input, 'autocomplete');
				$(this.input)
					.unbind('.datalistWidget')
					.removeData('datalistWidget')
				;
				this.shadowList.remove();
				$(document).unbind('.datalist'+this.id);
				$(window).unbind('.datalist'+this.id);
				if(this.input.form && this.input.id){
					$(this.input.form).unbind('submit.datalistWidget'+this.input.id);
				}
				this.input.removeAttribute('aria-haspopup');
				if(autocomplete === undefined){
					this.input.removeAttribute('autocomplete');
				} else {
					$(this.input).attr('autocomplete', autocomplete);
				}
			},
			_resetListCached: function(e){
				var that = this;
				var forceShow;
				this.needsUpdate = true;
				this.lastUpdatedValue = false;
				this.lastUnfoundValue = '';

				if(!this.updateTimer){
					if(window.QUnit || (forceShow = (e && document.activeElement == that.input))){
						that.updateListOptions(forceShow);
					} else {
						webshims.ready('WINDOWLOAD', function(){
							that.updateTimer = setTimeout(function(){
								that.updateListOptions();
								that = null;
								listidIndex = 1;
							}, 200 + (100 * listidIndex));
						});
					}
				}
			},
			updateListOptions: function(_forceShow){
				this.needsUpdate = false;
				clearTimeout(this.updateTimer);
				this.updateTimer = false;
				this.shadowList
					.css({
						fontSize: $.css(this.input, 'fontSize'),
						fontFamily: $.css(this.input, 'fontFamily')
					})
				;
				this.searchStart = formsCFG.customDatalist && $(this.input).hasClass('search-start');
				
				var list = [];
				
				var values = [];
				var allOptions = [];
				var rElem, rItem, rOptions, rI, rLen, item;
				for(rOptions = $.prop(this.datalist, 'options'), rI = 0, rLen = rOptions.length; rI < rLen; rI++){
					rElem = rOptions[rI];
					if(rElem.disabled){return;}
					rItem = {
						value: $(rElem).val() || '',
						text: $.trim($.attr(rElem, 'label') || getText(rElem)),
						className: rElem.className || '',
						style: $.attr(rElem, 'style') || ''
					};
					if(!rItem.text){
						rItem.text = rItem.value;
					} else if(rItem.text != rItem.value){
						rItem.className += ' different-label-value';
					}
					values[rI] = rItem.value;
					allOptions[rI] = rItem;
				}
				
				if(!this.storedOptions){
					this.storedOptions = ($(this.input).hasClass('no-datalist-cache') || this._autocomplete == 'off') ? [] : getStoredOptions((this.input.name || this.input.id) + $.prop(this.input, 'type'));
				}
				
				this.storedOptions.forEach(function(val, i){
					if(values.indexOf(val) == -1){
						allOptions.push({value: val, text: val, className: 'stored-suggest', style: ''});
					}
				});
				
				for(rI = 0, rLen = allOptions.length; rI < rLen; rI++){
					item = allOptions[rI];
					list[rI] = '<li class="'+ item.className +'" style="'+ item.style +'" tabindex="-1" role="listitem"><span class="option-label">'+ item.text +'</span> <span class="option-value">'+item.value+'</span></li>';
				}
				
				this.arrayOptions = allOptions;
				this.shadowList.html('<div class="datalist-outer-box"><div class="datalist-box"><ul role="list">'+ list.join("\n") +'</ul></div></div>');
				
				if($.fn.bgIframe && lteie6){
					this.shadowList.bgIframe();
				}
				
				if(_forceShow || this.isListVisible){
					this.showHideOptions();
				}
			},
			showHideOptions: function(_fromShowList){
				var value = $.prop(this.input, 'value').toLowerCase();
				//first check prevent infinite loop, second creates simple lazy optimization
				if(value === this.lastUpdatedValue || (this.lastUnfoundValue && value.indexOf(this.lastUnfoundValue) === 0)){
					return;
				}
				
				this.lastUpdatedValue = value;
				var found = false;
				var startSearch = this.searchStart;
				var lis = $('li', this.shadowList);
				if(value){
					this.arrayOptions.forEach(function(item, i){
						var search;
						if(!('lowerText' in item)){
							if(item.text != item.value){
								item.lowerText = item.value.toLowerCase() + item.text.toLowerCase();
							} else {
								item.lowerText = item.text.toLowerCase();
							}
						}
						search = item.lowerText.indexOf(value);
						search = startSearch ? !search : search !== -1;
						if(search){
							$(lis[i]).removeClass('hidden-item');
							found = true;
						} else {
							$(lis[i]).addClass('hidden-item');
						}
					});
				} else if(lis.length) {
					lis.removeClass('hidden-item');
					found = true;
				}
				
				this.hasViewableData = found;
				if(!_fromShowList && found){
					this.showList();
				}
				if(!found){
					this.lastUnfoundValue = value;
					this.hideList();
				}
			},
			setPos: function(){
				this.shadowList.css({marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: 0});
				var css = (formsCFG.positionDatalist) ? $(this.input).position() : webshims.getRelOffset(this.shadowList, this.input);
				css.top += $(this.input).outerHeight();
				css.width = $(this.input).outerWidth() - (parseInt(this.shadowList.css('borderLeftWidth'), 10)  || 0) - (parseInt(this.shadowList.css('borderRightWidth'), 10)  || 0);
				this.shadowList.css({marginTop: '', marginLeft: '', marginRight: '', marginBottom: ''}).css(css);
				return css;
			},
			showList: function(){
				if(this.isListVisible){return false;}
				if(this.needsUpdate){
					this.updateListOptions();
				}
				this.showHideOptions(true);
				if(!this.hasViewableData){return false;}
				this.isListVisible = true;
				var that = this;
				var resizeTimer;
				
				that.setPos();
				that.shadowList.addClass('datalist-visible').find('li.active-item').removeClass('active-item');
				
				$(document).unbind('.datalist'+that.id).bind('mousedown.datalist'+that.id +' focusin.datalist'+that.id, function(e){
					if(e.target === that.input ||  that.shadowList[0] === e.target || $.contains( that.shadowList[0], e.target )){
						clearTimeout(that.hideTimer);
						setTimeout(function(){
							clearTimeout(that.hideTimer);
						}, 9);
					} else {
						that.timedHide();
					}
				});
				$(window)
					.unbind('.datalist'+that.id)
					.bind('resize.datalist'+that.id +' orientationchange.datalist '+that.id +' emchange.datalist'+that.id, function(){
						clearTimeout(resizeTimer);
						resizeTimer = setTimeout(function(){
							that.setPos();
						}, 9);
					})
				;
				clearTimeout(resizeTimer);
				return true;
			},
			hideList: function(){
				if(!this.isListVisible){return false;}
				var that = this;
				var triggerChange = function(e){
					if(that.changedValue){
						$(that.input).trigger('change');
					}
					that.changedValue = false;
				};
				
				that.shadowList.removeClass('datalist-visible list-item-active');
				that.index = -1;
				that.isListVisible = false;
				if(that.changedValue){
					that.triggeredByDatalist = true;
					webshims.triggerInlineForm && webshims.triggerInlineForm(that.input, 'input');
					if($(that.input).is(':focus')){
						$(that.input).one('blur', triggerChange);
					} else {
						triggerChange();
					}
					that.triggeredByDatalist = false;
				}
				$(document).unbind('.datalist'+that.id);
				$(window)
					.unbind('.datalist'+that.id)
					.bind('resize.datalist'+that.id +' orientationchange.datalist '+that.id +' emchange.datalist'+that.id, function(){
						that.shadowList.css({top: 0, left: 0});
						$(window).unbind('.datalist'+that.id);
					})
				;
				return true;
			},
			scrollIntoView: function(elem){
				var ul = $('ul', this.shadowList);
				var div = $('div.datalist-box', this.shadowList);
				var elemPos = elem.position();
				var containerHeight;
				elemPos.top -=  (parseInt(ul.css('paddingTop'), 10) || 0) + (parseInt(ul.css('marginTop'), 10) || 0) + (parseInt(ul.css('borderTopWidth'), 10) || 0);
				if(elemPos.top < 0){
					div.scrollTop( div.scrollTop() + elemPos.top - 2);
					return;
				}
				elemPos.top += elem.outerHeight();
				containerHeight = div.height();
				if(elemPos.top > containerHeight){
					div.scrollTop( div.scrollTop() + (elemPos.top - containerHeight) + 2);
				}
			},
			changeValue: function(activeItem){
				if(!activeItem[0]){return;}
				var newValue = $('span.option-value', activeItem).text();
				var oldValue = $.prop(this.input, 'value');
				if(newValue != oldValue){
					$(this.input)
						.prop('value', newValue)
						.triggerHandler('updateInput')
					;
					this.changedValue = true;
				}
			},
			markItem: function(index, doValue, items){
				var activeItem;
				var goesUp;
				
				items = items || $('li:not(.hidden-item)', this.shadowList);
				if(!items.length){return;}
				if(index < 0){
					index = items.length - 1;
				} else if(index >= items.length){
					index = 0;
				}
				items.removeClass('active-item');
				this.shadowList.addClass('list-item-active');
				activeItem = items.filter(':eq('+ index +')').addClass('active-item');
				
				if(doValue){
					this.changeValue(activeItem);
					this.scrollIntoView(activeItem);
				}
				this.index = index;
			}
		};
		
		//init datalist update
		initializeDatalist();
	})();
	
});jQuery.webshims.register('form-extend', function($, webshims, window, doc, undefined, options){
	"use strict";
	var Modernizr = window.Modernizr;
	var modernizrInputTypes = Modernizr.inputtypes;
	if(!Modernizr.formvalidation || webshims.bugs.bustedValidity){return;}
	var typeModels = webshims.inputTypes;
	var validityRules = {};
	
	webshims.addInputType = function(type, obj){
		typeModels[type] = obj;
	};
	
	webshims.addValidityRule = function(type, fn){
		validityRules[type] = fn;
	};
	
	webshims.addValidityRule('typeMismatch',function (input, val, cache, validityState){
		if(val === ''){return false;}
		var ret = validityState.typeMismatch;
		if(!('type' in cache)){
			cache.type = (input[0].getAttribute('type') || '').toLowerCase();
		}
		
		if(typeModels[cache.type] && typeModels[cache.type].mismatch){
			ret = typeModels[cache.type].mismatch(val, input);
		}
		return ret;
	});
	
	var overrideNativeMessages = options.overrideMessages;	
	
	var overrideValidity = (!modernizrInputTypes.number || !modernizrInputTypes.time || !modernizrInputTypes.range || overrideNativeMessages);
	var validityProps = ['customError','typeMismatch','rangeUnderflow','rangeOverflow','stepMismatch','tooLong','patternMismatch','valueMissing','valid'];
	
	var validityChanger = (overrideNativeMessages)? ['value', 'checked'] : ['value'];
	var validityElements = [];
	var testValidity = function(elem, init){
		if(!elem){return;}
		var type = (elem.getAttribute && elem.getAttribute('type') || elem.type || '').toLowerCase();
		
		if(!overrideNativeMessages && !typeModels[type]){
			return;
		}
		
		if(overrideNativeMessages && !init && type == 'radio' && elem.name){
			$(doc.getElementsByName( elem.name )).each(function(){
				$.prop(this, 'validity');
			});
		} else {
			$.prop(elem, 'validity');
		}
	};
	
	var oldSetCustomValidity = {};
	['input', 'textarea', 'select'].forEach(function(name){
		var desc = webshims.defineNodeNameProperty(name, 'setCustomValidity', {
			prop: {
				value: function(error){
					error = error+'';
					var elem = (name == 'input') ? $(this).getNativeElement()[0] : this;
					desc.prop._supvalue.call(elem, error);
					
					if(webshims.bugs.validationMessage){
						webshims.data(elem, 'customvalidationMessage', error);
					}
					if(overrideValidity){
						webshims.data(elem, 'hasCustomError', !!(error));
						testValidity(elem);
					}
				}
			}
		});
		oldSetCustomValidity[name] = desc.prop._supvalue;
	});
		
	
	if(overrideValidity || overrideNativeMessages){
		validityChanger.push('min');
		validityChanger.push('max');
		validityChanger.push('step');
		validityElements.push('input');
	}
	if(overrideNativeMessages){
		validityChanger.push('required');
		validityChanger.push('pattern');
		validityElements.push('select');
		validityElements.push('textarea');
	}
	
	if(overrideValidity){
		var stopValidity;
		validityElements.forEach(function(nodeName){
			
			var oldDesc = webshims.defineNodeNameProperty(nodeName, 'validity', {
				prop: {
					get: function(){
						if(stopValidity){return;}
						var elem = (nodeName == 'input') ? $(this).getNativeElement()[0] : this;
						
						var validity = oldDesc.prop._supget.call(elem);
						
						if(!validity){
							return validity;
						}
						var validityState = {};
						validityProps.forEach(function(prop){
							validityState[prop] = validity[prop];
						});
						
						if( !$.prop(elem, 'willValidate') ){
							return validityState;
						}
						stopValidity = true;
						var jElm 			= $(elem),
							cache 			= {type: (elem.getAttribute && elem.getAttribute('type') || '').toLowerCase(), nodeName: (elem.nodeName || '').toLowerCase()},
							val				= jElm.val(),
							customError 	= !!(webshims.data(elem, 'hasCustomError')),
							setCustomMessage
						;
						stopValidity = false;
						validityState.customError = customError;
						
						if( validityState.valid && validityState.customError ){
							validityState.valid = false;
						} else if(!validityState.valid) {
							var allFalse = true;
							$.each(validityState, function(name, prop){
								if(prop){
									allFalse = false;
									return false;
								}
							});
							
							if(allFalse){
								validityState.valid = true;
							}
							
						}
						
						$.each(validityRules, function(rule, fn){
							validityState[rule] = fn(jElm, val, cache, validityState);
							if( validityState[rule] && (validityState.valid || !setCustomMessage) && (overrideNativeMessages || (typeModels[cache.type] && typeModels[cache.type].mismatch)) ) {
								oldSetCustomValidity[nodeName].call(elem, webshims.createValidationMessage(elem, rule));
								validityState.valid = false;
								setCustomMessage = true;
							}
						});
						if(validityState.valid){
							oldSetCustomValidity[nodeName].call(elem, '');
							webshims.data(elem, 'hasCustomError', false);
						} else if(overrideNativeMessages && !setCustomMessage && !customError){
							$.each(validityState, function(name, prop){
								if(name !== 'valid' && prop){
									oldSetCustomValidity[nodeName].call(elem, webshims.createValidationMessage(elem, name));
									return false;
								}
							});
						}
						return validityState;
					},
					writeable: false
					
				}
			});
		});

		validityChanger.forEach(function(prop){
			webshims.onNodeNamesPropertyModify(validityElements, prop, function(s){
				testValidity(this);
			});
		});
		
		if(doc.addEventListener){
			var inputThrottle;
			var testPassValidity = function(e){
				if(!('form' in e.target)){return;}
				var form = e.target.form;
				clearTimeout(inputThrottle);
				testValidity(e.target);
				if(form && overrideNativeMessages){
					$('input', form).each(function(){
						if(this.type == 'password'){
							testValidity(this);
						}
					});
				}
			};
			
			doc.addEventListener('change', testPassValidity, true);
			
			if(overrideNativeMessages){
				doc.addEventListener('blur', testPassValidity, true);
				doc.addEventListener('keydown', function(e){
					if(e.keyCode != 13){return;}
					testPassValidity(e);
				}, true);
			}
			
			doc.addEventListener('input', function(e){
				clearTimeout(inputThrottle);
				inputThrottle = setTimeout(function(){
					testValidity(e.target);
				}, 290);
			}, true);
		}
		
		var validityElementsSel = validityElements.join(',');	
		
		webshims.addReady(function(context, elem){
			$(validityElementsSel, context).add(elem.filter(validityElementsSel)).each(function(){
				$.prop(this, 'validity');
			});
		});
		
		
		if(overrideNativeMessages){
			webshims.ready('DOM form-message', function(){
				webshims.activeLang({
					register: 'form-core',
					callback: function(){
						$('input, select, textarea')
							.getNativeElement()
							.each(function(){
								if(webshims.data(this, 'hasCustomError')){return;}
								var elem = this;
								var validity = $.prop(elem, 'validity') || {valid: true};
								var nodeName;
								if(validity.valid){return;}
								nodeName = (elem.nodeName || '').toLowerCase();
								$.each(validity, function(name, prop){
									if(name !== 'valid' && prop){
										oldSetCustomValidity[nodeName].call(elem, webshims.createValidationMessage(elem, name));
										return false;
									}
								});
							})
						;
					}
				});
			});
		}
		
	} //end: overrideValidity
	
	webshims.defineNodeNameProperty('input', 'type', {
		prop: {
			get: function(){
				var elem = this;
				var type = (elem.getAttribute('type') || '').toLowerCase();
				return (webshims.inputTypes[type]) ? type : elem.type;
			}
		}
	});
	
	
});jQuery.webshims.register('form-number-date-api', function($, webshims, window, document, undefined){
	"use strict";
	
	//ToDo
	if(!webshims.getStep){
		webshims.getStep = function(elem, type){
			var step = $.attr(elem, 'step');
			if(step === 'any'){
				return step;
			}
			type = type || getType(elem);
			if(!typeModels[type] || !typeModels[type].step){
				return step;
			}
			step = typeProtos.number.asNumber(step);
			return ((!isNaN(step) && step > 0) ? step : typeModels[type].step) * typeModels[type].stepScaleFactor;
		};
	}
	if(!webshims.addMinMaxNumberToCache){
		webshims.addMinMaxNumberToCache = function(attr, elem, cache){
			if (!(attr+'AsNumber' in cache)) {
				cache[attr+'AsNumber'] = typeModels[cache.type].asNumber(elem.attr(attr));
				if(isNaN(cache[attr+'AsNumber']) && (attr+'Default' in typeModels[cache.type])){
					cache[attr+'AsNumber'] = typeModels[cache.type][attr+'Default'];
				}
			}
		};
	}
	
	var nan = parseInt('NaN', 10),
		doc = document,
		typeModels = webshims.inputTypes,
		isNumber = function(string){
			return (typeof string == 'number' || (string && string == string * 1));
		},
		supportsType = function(type){
			return ($('<input type="'+type+'" />').prop('type') === type);
		},
		getType = function(elem){
			return (elem.getAttribute('type') || '').toLowerCase();
		},
		isDateTimePart = function(string){
			return (isNumber(string) || (string && string == '0' + (string * 1)));
		},
		addMinMaxNumberToCache = webshims.addMinMaxNumberToCache,
		addleadingZero = function(val, len){
			val = ''+val;
			len = len - val.length;
			for(var i = 0; i < len; i++){
				val = '0'+val;
			}
			return val;
		},
		EPS = 1e-7,
		typeBugs = webshims.bugs.valueAsNumberSet || webshims.bugs.bustedValidity
	;
	
	webshims.addValidityRule('stepMismatch', function(input, val, cache, validityState){
		if(val === ''){return false;}
		if(!('type' in cache)){
			cache.type = getType(input[0]);
		}
		//stepmismatch with date is computable, but it would be a typeMismatch (performance)
		if(cache.type == 'date'){
			return false;
		}
		var ret = (validityState || {}).stepMismatch, base;
		if(typeModels[cache.type] && typeModels[cache.type].step){
			if( !('step' in cache) ){
				cache.step = webshims.getStep(input[0], cache.type);
			}
			
			if(cache.step == 'any'){return false;}
			
			if(!('valueAsNumber' in cache)){
				cache.valueAsNumber = typeModels[cache.type].asNumber( val );
			}
			if(isNaN(cache.valueAsNumber)){return false;}
			
			addMinMaxNumberToCache('min', input, cache);
			base = cache.minAsNumber;
			if(isNaN(base)){
				base = typeModels[cache.type].stepBase || 0;
			}
			
			ret =  Math.abs((cache.valueAsNumber - base) % cache.step);
							
			ret = !(  ret <= EPS || Math.abs(ret - cache.step) <= EPS  );
		}
		return ret;
	});
	
	
	
	[{name: 'rangeOverflow', attr: 'max', factor: 1}, {name: 'rangeUnderflow', attr: 'min', factor: -1}].forEach(function(data, i){
		webshims.addValidityRule(data.name, function(input, val, cache, validityState) {
			var ret = (validityState || {})[data.name] || false;
			if(val === ''){return ret;}
			if (!('type' in cache)) {
				cache.type = getType(input[0]);
			}
			if (typeModels[cache.type] && typeModels[cache.type].asNumber) {
				if(!('valueAsNumber' in cache)){
					cache.valueAsNumber = typeModels[cache.type].asNumber( val );
				}
				if(isNaN(cache.valueAsNumber)){
					return false;
				}
				
				addMinMaxNumberToCache(data.attr, input, cache);
				
				if(isNaN(cache[data.attr+'AsNumber'])){
					return ret;
				}
				ret = ( cache[data.attr+'AsNumber'] * data.factor <  cache.valueAsNumber * data.factor - EPS );
			}
			return ret;
		});
	});
	
	webshims.reflectProperties(['input'], ['max', 'min', 'step']);
	
	
	//IDLs and methods, that aren't part of constrain validation, but strongly tight to it
	var valueAsNumberDescriptor = webshims.defineNodeNameProperty('input', 'valueAsNumber', {
		prop: {
			get: function(){
				var elem = this;
				var type = getType(elem);
				var ret = (typeModels[type] && typeModels[type].asNumber) ? 
					typeModels[type].asNumber($.prop(elem, 'value')) :
					(valueAsNumberDescriptor.prop._supget && valueAsNumberDescriptor.prop._supget.apply(elem, arguments));
				if(ret == null){
					ret = nan;
				}
				return ret;
			},
			set: function(val){
				var elem = this;
				var type = getType(elem);
				if(typeModels[type] && typeModels[type].numberToString){
					//is NaN a number?
					if(isNaN(val)){
						$.prop(elem, 'value', '');
						return;
					}
					var set = typeModels[type].numberToString(val);
					if(set !==  false){
						$.prop(elem, 'value', set);
					} else {
						webshims.warn('INVALID_STATE_ERR: DOM Exception 11');
					}
				} else {
					valueAsNumberDescriptor.prop._supset && valueAsNumberDescriptor.prop._supset.apply(elem, arguments);
				}
			}
		}
	});
	
	var valueAsDateDescriptor = webshims.defineNodeNameProperty('input', 'valueAsDate', {
		prop: {
			get: function(){
				var elem = this;
				var type = getType(elem);
				return (typeModels[type] && typeModels[type].asDate && !typeModels[type].noAsDate) ? 
					typeModels[type].asDate($.prop(elem, 'value')) :
					valueAsDateDescriptor.prop._supget && valueAsDateDescriptor.prop._supget.call(elem) || null;
			},
			set: function(value){
				var elem = this;
				var type = getType(elem);
				if(typeModels[type] && typeModels[type].dateToString && !typeModels[type].noAsDate){
					
					if(value === null){
						$.prop(elem, 'value', '');
						return '';
					}
					var set = typeModels[type].dateToString(value);
					if(set !== false){
						$.prop(elem, 'value', set);
						return set;
					} else {
						webshims.warn('INVALID_STATE_ERR: DOM Exception 11');
					}
				} else {
					return valueAsDateDescriptor.prop._supset && valueAsDateDescriptor.prop._supset.apply(elem, arguments) || null;
				}
			}
		}
	});
	
	var typeProtos = {
		
		number: {
			mismatch: function(val){
				return !(isNumber(val));
			},
			step: 1,
			//stepBase: 0, 0 = default
			stepScaleFactor: 1,
			asNumber: function(str){
				return (isNumber(str)) ? str * 1 : nan;
			},
			numberToString: function(num){
				return (isNumber(num)) ? num : false;
			}
		},
		
		range: {
			minDefault: 0,
			maxDefault: 100
		},
		
		date: {
			mismatch: function(val){
				if(!val || !val.split || !(/\d$/.test(val))){return true;}
				var valA = val.split(/\u002D/);
				if(valA.length !== 3){return true;}
				var ret = false;
				$.each(valA, function(i, part){
					if(!isDateTimePart(part)){
						ret = true;
						return false;
					}
				});
				if(ret){return ret;}
				if(valA[0].length !== 4 || valA[1].length != 2 || valA[1] > 12 || valA[2].length != 2 || valA[2] > 33){
					ret = true;
				}
				return (val !== this.dateToString( this.asDate(val, true) ) );
			},
			step: 1,
			//stepBase: 0, 0 = default
			stepScaleFactor:  86400000,
			asDate: function(val, _noMismatch){
				if(!_noMismatch && this.mismatch(val)){
					return null;
				}
				return new Date(this.asNumber(val, true));
			},
			asNumber: function(str, _noMismatch){
				var ret = nan;
				if(_noMismatch || !this.mismatch(str)){
					str = str.split(/\u002D/);
					ret = Date.UTC(str[0], str[1] - 1, str[2]);
				}
				return ret;
			},
			numberToString: function(num){
				return (isNumber(num)) ? this.dateToString(new Date( num * 1)) : false;
			},
			dateToString: function(date){
				return (date && date.getFullYear) ? date.getUTCFullYear() +'-'+ addleadingZero(date.getUTCMonth()+1, 2) +'-'+ addleadingZero(date.getUTCDate(), 2) : false;
			}
		}
//		,time: {
//			mismatch: function(val, _getParsed){
//				if(!val || !val.split || !(/\d$/.test(val))){return true;}
//				val = val.split(/\u003A/);
//				if(val.length < 2 || val.length > 3){return true;}
//				var ret = false,
//					sFraction;
//				if(val[2]){
//					val[2] = val[2].split(/\u002E/);
//					sFraction = parseInt(val[2][1], 10);
//					val[2] = val[2][0];
//				}
//				$.each(val, function(i, part){
//					if(!isDateTimePart(part) || part.length !== 2){
//						ret = true;
//						return false;
//					}
//				});
//				if(ret){return true;}
//				if(val[0] > 23 || val[0] < 0 || val[1] > 59 || val[1] < 0){
//					return true;
//				}
//				if(val[2] && (val[2] > 59 || val[2] < 0 )){
//					return true;
//				}
//				if(sFraction && isNaN(sFraction)){
//					return true;
//				}
//				if(sFraction){
//					if(sFraction < 100){
//						sFraction *= 100;
//					} else if(sFraction < 10){
//						sFraction *= 10;
//					}
//				}
//				return (_getParsed === true) ? [val, sFraction] : false;
//			},
//			step: 60,
//			stepBase: 0,
//			stepScaleFactor:  1000,
//			asDate: function(val){
//				val = new Date(this.asNumber(val));
//				return (isNaN(val)) ? null : val;
//			},
//			asNumber: function(val){
//				var ret = nan;
//				val = this.mismatch(val, true);
//				if(val !== true){
//					ret = Date.UTC('1970', 0, 1, val[0][0], val[0][1], val[0][2] || 0);
//					if(val[1]){
//						ret += val[1];
//					}
//				}
//				return ret;
//			},
//			dateToString: function(date){
//				if(date && date.getUTCHours){
//					var str = addleadingZero(date.getUTCHours(), 2) +':'+ addleadingZero(date.getUTCMinutes(), 2),
//						tmp = date.getSeconds()
//					;
//					if(tmp != "0"){
//						str += ':'+ addleadingZero(tmp, 2);
//					}
//					tmp = date.getUTCMilliseconds();
//					if(tmp != "0"){
//						str += '.'+ addleadingZero(tmp, 3);
//					}
//					return str;
//				} else {
//					return false;
//				}
//			}
//		}
//		,'datetime-local': {
//			mismatch: function(val, _getParsed){
//				if(!val || !val.split || (val+'special').split(/\u0054/).length !== 2){return true;}
//				val = val.split(/\u0054/);
//				return ( typeProtos.date.mismatch(val[0]) || typeProtos.time.mismatch(val[1], _getParsed) );
//			},
//			noAsDate: true,
//			asDate: function(val){
//				val = new Date(this.asNumber(val));
//				
//				return (isNaN(val)) ? null : val;
//			},
//			asNumber: function(val){
//				var ret = nan;
//				var time = this.mismatch(val, true);
//				if(time !== true){
//					val = val.split(/\u0054/)[0].split(/\u002D/);
//					
//					ret = Date.UTC(val[0], val[1] - 1, val[2], time[0][0], time[0][1], time[0][2] || 0);
//					if(time[1]){
//						ret += time[1];
//					}
//				}
//				return ret;
//			},
//			dateToString: function(date, _getParsed){
//				return typeProtos.date.dateToString(date) +'T'+ typeProtos.time.dateToString(date, _getParsed);
//			}
//		}
	};
	
	if(typeBugs || !supportsType('range') || !supportsType('time')){
		typeProtos.range = $.extend({}, typeProtos.number, typeProtos.range);
//		typeProtos.time = $.extend({}, typeProtos.date, typeProtos.time);
//		typeProtos['datetime-local'] = $.extend({}, typeProtos.date, typeProtos.time, typeProtos['datetime-local']);
	}
	
	if(typeBugs || !supportsType('number')){
		webshims.addInputType('number', typeProtos.number);
	}
	
	if(typeBugs || !supportsType('range')){
		webshims.addInputType('range', typeProtos.range);
	}
	if(typeBugs || !supportsType('date')){
		webshims.addInputType('date', typeProtos.date);
	}
//	if(typeBugs || !supportsType('time')){
//		webshims.addInputType('time', typeProtos.time);
//	}

//	if(typeBugs || !supportsType('datetime-local')){
//		webshims.addInputType('datetime-local', typeProtos['datetime-local']);
//	}
		
});/* number-date-ui */
/* https://github.com/aFarkas/webshim/issues#issue/23 */
jQuery.webshims.register('form-number-date-ui', function($, webshims, window, document, undefined, options){
	"use strict";
	
	var triggerInlineForm = webshims.triggerInlineForm;
	var modernizrInputTypes = Modernizr.inputtypes;
	var adjustInputWithBtn = (function(){
		var fns = {"padding-box": "innerWidth", "border-box": "outerWidth", "content-box": "width"};
		var boxSizing = Modernizr.prefixed && Modernizr.prefixed("boxSizing");
		var getWidth = function(input){
			var widthFn = "width";
			if(boxSizing){
				widthFn = fns[input.css(boxSizing)] || widthFn;
			}
			
			return {
				w: input[widthFn](),
				add: widthFn == "width"
			};
			
		};
		
		
		return function(input, button){
			var inputDim = getWidth(input);
			if(!inputDim.w){return;}
			var controlDim = {
				mL: (parseInt(button.css('marginLeft'), 10) || 0),
				w: button.outerWidth()
			};
			inputDim.mR = (parseInt(input.css('marginRight'), 10) || 0);
			if(inputDim.mR){
				input.css('marginRight', 0);
			}
			//is inside
			if( controlDim.mL <= (controlDim.w * -1) ){
				button.css('marginRight',  Math.floor(Math.abs(controlDim.w + controlDim.mL) + inputDim.mR));
				input.css('paddingRight', (parseInt(input.css('paddingRight'), 10) || 0) + Math.abs(controlDim.mL));
				if(inputDim.add){
					input.css('width', Math.floor(inputDim.w + controlDim.mL));
				}
			} else {
				button.css('marginRight', inputDim.mR);
				input.css('width',  Math.floor(inputDim.w - controlDim.mL - controlDim.w));
			}
		};
	})();
	
	
	var defaultDatepicker = {};
	var labelID = 0;
	var emptyJ = $([]);
	var isCheckValidity;
	var replaceInputUI = function(context, elem){
		$('input', context).add(elem.filter('input')).each(function(){
			var type = $.prop(this, 'type');
			if(replaceInputUI[type]  && !webshims.data(this, 'shadowData')){
				replaceInputUI[type]($(this));
			}
		});
	};
	//set date is extremly slow in IE so we do it lazy
	var lazySetDate = function(elem, date){
		if(!options.lazyDate){
			elem.datepicker('setDate', date);
			return;
		}
		var timer = $.data(elem[0], 'setDateLazyTimer');
		if(timer){
			clearTimeout(timer);
		}
		$.data(elem[0], 'setDateLazyTimer', setTimeout(function(){
			elem.datepicker('setDate', date);
			$.removeData(elem[0], 'setDateLazyTimer');
			elem = null;
		}, 0));
	};
	
	if(options.lazyDate === undefined){
		try {
			options.lazyDate = ($.browser.msie && webshims.browserVersion < 9) || ($(window).width() < 500 && $(window).height() < 500);
		} catch(er){}
	}
	
	var copyAttrs = {
		tabindex: 1,
		tabIndex: 1,
		title: 1,
		"aria-required": 1,
		"aria-invalid": 1
	};
	if(!options.copyAttrs){
		options.copyAttrs = {};
	}
	
	webshims.extendUNDEFProp(options.copyAttrs, copyAttrs);
	
	
	var focusAttrs = copyAttrs;
	
	replaceInputUI.common = function(orig, shim, methods){
		if(Modernizr.formvalidation){
			orig.bind('firstinvalid', function(e){
				if(!webshims.fromSubmit && isCheckValidity){return;}
				orig.unbind('invalid.replacedwidgetbubble').bind('invalid.replacedwidgetbubble', function(evt){
					if(!e.isInvalidUIPrevented() && !evt.isDefaultPrevented()){
						webshims.validityAlert.showFor( e.target );
						e.preventDefault();
						evt.preventDefault();
					}
					orig.unbind('invalid.replacedwidgetbubble');
				});
			});
		}
		var i, prop;
		var focusElement = $('input, span.ui-slider-handle', shim);
		var attrs = orig[0].attributes;
		for(i in options.copyAttrs){
			if ((prop = attrs[i]) && prop.specified) {
				if(focusAttrs[i] && focusElement[0]){
					focusElement.attr(i, prop.nodeValue);
				} else {
					shim[0].setAttribute(i, prop.nodeValue);
				}
			}
		}
		
		var id = orig.attr('id'),
			attr = (options.calculateWidth) ? 
				{
					css: {
						marginRight: orig.css('marginRight'),
						marginLeft: orig.css('marginLeft')
					},
					outerWidth: orig.outerWidth()
					
				} :
				{},
			curLabelID
		;
		attr.label =  (id) ? $('label[for="'+ id +'"]', orig[0].form) : emptyJ
		curLabelID =  webshims.getID(attr.label);
		
		shim.addClass(orig[0].className);
		webshims.addShadowDom(orig, shim, {
			data: methods || {},
			shadowFocusElement: $('input.input-datetime-local-date, span.ui-slider-handle', shim)[0],
			shadowChilds: focusElement
		});
		
		orig
			.after(shim)
			.hide()
		;
		
		if(orig[0].form){
			$(orig[0].form).bind('reset', function(e){
				if(e.originalEvent && !e.isDefaultPrevented()){
					setTimeout(function(){orig.prop( 'value', orig.prop('value') );}, 0);
				}
			});
		}
		if(shim.length == 1 && !$('*', shim)[0]){
			shim.attr('aria-labelledby', curLabelID);
			attr.label.bind('click', function(){
				shim.focus();
				return false;
			});
		}
		return attr;
	};
	
	if(Modernizr.formvalidation){
		['input', 'form'].forEach(function(name){
			var desc = webshims.defineNodeNameProperty(name, 'checkValidity', {
				prop: {
					value: function(){
						isCheckValidity = true;
						var ret = desc.prop._supvalue.apply(this, arguments);
						isCheckValidity = false;
						return ret;
					}
				}
			});
		});
	}
	//date and datetime-local implement if we have to replace
	if(!modernizrInputTypes['date'] /*||!modernizrInputTypes['datetime-local']*/ || options.replaceUI){
		
		
		var datetimeFactor = {
			trigger: [0.595,0.395],
			normal: [0.565,0.425]
		};
		var subPixelCorrect = (!$.browser.msie || webshims.browserVersion > 6) ? 0 : 0.45;
		
		var configureDatePicker = function(elem, datePicker, change, _wrapper){
			var stopFocusout;
			var focusedOut;
			var resetFocusHandler = function(){
				data.dpDiv.unbind('mousedown.webshimsmousedownhandler');
				stopFocusout = false;
				focusedOut = false;
			};
			var data = datePicker
				.bind('focusin', function(){
					resetFocusHandler();
					data.dpDiv.unbind('mousedown.webshimsmousedownhandler').bind('mousedown.webshimsmousedownhandler', function(){
						stopFocusout = true;
					});
				})
				.bind('focusout blur', function(e){
					if(stopFocusout){
						focusedOut = true;
						e.stopImmediatePropagation();
					}
				})
				.datepicker($.extend({
					onClose: function(){
						if(focusedOut && datePicker.not(':focus')){
							resetFocusHandler();
							datePicker.trigger('focusout');
							datePicker.triggerHandler('blur');
						} else {
							resetFocusHandler();
						}
					}
				}, defaultDatepicker, options.datepicker, elem.data('datepicker')))
				.bind('change', change)
				.data('datepicker')
			;
			data.dpDiv.addClass('input-date-datepicker-control');
			
			if(_wrapper){
				webshims.triggerDomUpdate(_wrapper[0]);	
			}
			['disabled', 'min', 'max', 'value', 'step', 'data-placeholder'].forEach(function(name){
				var val = elem.prop(name);
				if(val !== "" && (name != 'disabled' || !val)){
					elem.prop(name, val);
				}
			});
			return data;
		};
		
//		replaceInputUI['datetime-local'] = function(elem){
//			if(!$.fn.datepicker){return;}
//			
//			var date = $('<span role="group" class="input-datetime-local"><input type="text" class="input-datetime-local-date" /><input type="time" class="input-datetime-local-time" /></span>'),
//				attr  = this.common(elem, date, replaceInputUI['datetime-local'].attrs),
//				datePicker = $('input.input-datetime-local-date', date),
//				datePickerChange = function(e){
//						
//						var value = datePicker.prop('value') || '', 
//							timeVal = ''
//						;
//						if(options.lazyDate){
//							var timer = $.data(datePicker[0], 'setDateLazyTimer');
//							if(timer){
//								clearTimeout(timer);
//								$.removeData(datePicker[0], 'setDateLazyTimer');
//							}
//						}
//						
//						if(value){
//							timeVal = $('input.input-datetime-local-time', date).prop('value') || '00:00';
//							try {
//								value = $.datepicker.parseDate(datePicker.datepicker('option', 'dateFormat'), value);
//								value = (value) ? $.datepicker.formatDate('yy-mm-dd', value) : datePicker.prop('value');
//							} catch (e) {value = datePicker.prop('value');}
//						} 
//						value = (!value && !timeVal) ? '' : value + 'T' + timeVal;
//						replaceInputUI['datetime-local'].blockAttr = true;
//						elem.prop('value', value);
//						replaceInputUI['datetime-local'].blockAttr = false;
//						e.stopImmediatePropagation();
//						triggerInlineForm(elem[0], 'input');
//						triggerInlineForm(elem[0], 'change');
//					},
//				data = configureDatePicker(elem, datePicker, datePickerChange, date)
//			;
//			
//			
//			$('input.input-datetime-local-time', date).bind('change', function(e){
//				var timeVal = $.prop(this, 'value');
//				var val = ['', ''];
//				if(timeVal){
//					val = elem.prop('value').split('T');
//					if((val.length < 2 || !val[0])){
//						val[0] = $.datepicker.formatDate('yy-mm-dd', new Date());
//					}
//					val[1] = timeVal;
//					
//					if (timeVal) {
//						try {
//							datePicker.prop('value', $.datepicker.formatDate(datePicker.datepicker('option', 'dateFormat'), $.datepicker.parseDate('yy-mm-dd', val[0])));
//						} catch (e) {}
//					}
//				}
//				val = (!val[0] && !val[1]) ? '' : val.join('T');
//				replaceInputUI['datetime-local'].blockAttr = true;
//				elem.prop('value', val);
//				replaceInputUI['datetime-local'].blockAttr = false;
//				e.stopImmediatePropagation();
//				triggerInlineForm(elem[0], 'input');
//				triggerInlineForm(elem[0], 'change');
//			});
//			
//			
//			
//			date.attr('aria-labelledby', attr.label.attr('id'));
//			attr.label.bind('click', function(){
//				datePicker.focus();
//				return false;
//			});
//			
//			if(attr.css){
//				date.css(attr.css);
//				if(attr.outerWidth){
//					date.outerWidth(attr.outerWidth);
//					var width = date.width();
//					var widthFac = (data.trigger[0]) ? datetimeFactor.trigger : datetimeFactor.normal;
//					datePicker.outerWidth(Math.floor((width * widthFac[0]) - subPixelCorrect), true);
//					$('input.input-datetime-local-time', date).outerWidth(Math.floor((width * widthFac[1]) - subPixelCorrect), true);
//					if(data.trigger[0]){
//						adjustInputWithBtn(datePicker, data.trigger);
//					}
//				}
//			}
//			
//			
//		};
//		
//		replaceInputUI['datetime-local'].attrs = {
//			disabled: function(orig, shim, value){
//				$('input.input-datetime-local-date', shim).prop('disabled', !!value);
//				$('input.input-datetime-local-time', shim).prop('disabled', !!value);
//			},
//			step: function(orig, shim, value){
//				$('input.input-datetime-local-time', shim).attr('step', value);
//			},
//			//ToDo: use min also on time
//			min: function(orig, shim, value){
//				if(value){
//					value = (value.split) ? value.split('T') : [];
//					try {
//						value = $.datepicker.parseDate('yy-mm-dd', value[0]);
//					} catch(e){value = false;}
//				}
//				if(!value){
//					value = null;
//				}
//				$('input.input-datetime-local-date', shim).datepicker('option', 'minDate', value);
//				
//			},
//			//ToDo: use max also on time
//			max: function(orig, shim, value){
//				if(value){
//					value = (value.split) ? value.split('T') : [];
//					try {
//						value = $.datepicker.parseDate('yy-mm-dd', value[0]);
//					} catch(e){value = false;}
//				}
//				if(!value){
//					value = null;
//				}
//				$('input.input-datetime-local-date', shim).datepicker('option', 'maxDate', value);
//			},
//			value: function(orig, shim, value){
//				var dateValue;
//				if(value){
//					value = (value.split) ? value.split('T') : [];
//					try {
//						dateValue = $.datepicker.parseDate('yy-mm-dd', value[0]);
//					} catch(e){dateValue = false;}
//				}
//				if(dateValue){
//					if(!replaceInputUI['datetime-local'].blockAttr){
//						lazySetDate($('input.input-datetime-local-date', shim), dateValue);
//					}
//					$('input.input-datetime-local-time', shim).prop('value', value[1] || '00:00');
//				} else {
//					$('input.input-datetime-local-date', shim).prop('value', value[0] || '');
//					$('input.input-datetime-local-time', shim).prop('value', value[1] || '');
//				}
//					
//				
//			}
//		};
			
		
		replaceInputUI.date = function(elem){
			
			if(!$.fn.datepicker){return;}
			var date = $('<input class="input-date" type="text" />'),
				attr  = this.common(elem, date, replaceInputUI.date.attrs),
				change = function(e){
					
					replaceInputUI.date.blockAttr = true;
					var value;
					if(options.lazyDate){
						var timer = $.data(date[0], 'setDateLazyTimer');
						if(timer){
							clearTimeout(timer);
							$.removeData(date[0], 'setDateLazyTimer');
						}
					}
					try {
						value = $.datepicker.parseDate(date.datepicker('option', 'dateFormat'), date.prop('value') );
						value = (value) ? $.datepicker.formatDate( 'yy-mm-dd', value ) : date.prop('value');
					} catch(e){
						value = date.prop('value');
					}
					elem.prop('value', value);
					replaceInputUI.date.blockAttr = false;
					e.stopImmediatePropagation();
					triggerInlineForm(elem[0], 'input');
					triggerInlineForm(elem[0], 'change');
				},
				data = configureDatePicker(elem, date, change)
				
			;
						
			if(attr.css){
				date.css(attr.css);
				if(attr.outerWidth){
					date.outerWidth(attr.outerWidth);
				}
				if(data.trigger[0]){
					adjustInputWithBtn(date, data.trigger);
				}
			}
			
		};
		
		
		replaceInputUI.date.attrs = {
			disabled: function(orig, shim, value){
				$.prop(shim, 'disabled', !!value);
			},
			min: function(orig, shim, value){
				try {
					value = $.datepicker.parseDate('yy-mm-dd', value);
				} catch(e){value = false;}
				if(value){
					$(shim).datepicker('option', 'minDate', value);
				}
			},
			max: function(orig, shim, value){
				try {
					value = $.datepicker.parseDate('yy-mm-dd', value);
				} catch(e){value = false;}
				if(value){
					$(shim).datepicker('option', 'maxDate', value);
				}
			},
			'data-placeholder': function(orig, shim, value){
				var hintValue = (value || '').split('-');
				var dateFormat;
				if(hintValue.length == 3){
					value = $(shim).datepicker('option','dateFormat').replace('yy', hintValue[0]).replace('mm', hintValue[1]).replace('dd', hintValue[2]);
				} 
				$.prop(shim, 'placeholder', value);
			},
			value: function(orig, shim, value){
				if(!replaceInputUI.date.blockAttr){
					try {
						var dateValue = $.datepicker.parseDate('yy-mm-dd', value);
					} catch(e){var dateValue = false;}
					
					if(dateValue){
						lazySetDate($(shim), dateValue);
					} else {
						$.prop(shim, 'value', value);
					}
				}
			}
		};
	}
	if (!modernizrInputTypes.range || options.replaceUI) {
		replaceInputUI.range = function(elem){
			if(!$.fn.slider){return;}
			var range = $('<span class="input-range"><span class="ui-slider-handle" role="slider" tabindex="0" /></span>'),
				attr  = this.common(elem, range, replaceInputUI.range.attrs),
				change = function(e, ui){
					if(e.originalEvent){
						replaceInputUI.range.blockAttr = true;
						elem.prop('value', ui.value);
						replaceInputUI.range.blockAttr = false;
						triggerInlineForm(elem[0], 'input');
						triggerInlineForm(elem[0], 'change');
					}
				}
			;
			
			$('span', range)
				.attr('aria-labelledby', attr.label.attr('id'))
			;
			attr.label.bind('click', function(){
				$('span', range).focus();
				return false;
			});
			
			if(attr.css){
				range.css(attr.css);
				if(attr.outerWidth){
					range.outerWidth(attr.outerWidth);
				}
			}
			range.slider($.extend(true, {}, options.slider, elem.data('slider'))).bind('slide', change);
			
			['disabled', 'min', 'max', 'step', 'value'].forEach(function(name){
				var val = elem.attr(name);
				var shadow;
				if(name == 'value' && !val){
					
					shadow = elem.getShadowElement();
					if(shadow){
						val = ($(shadow).slider('option', 'max') - $(shadow).slider('option', 'min')) / 2;
					}
				}
				if(val != null){
					elem.attr(name, val);
				}
			});
		};
		
		replaceInputUI.range.attrs = {
			disabled: function(orig, shim, value){
				value = !!value;
				$(shim).slider( "option", "disabled", value );
				$('span', shim)
					.attr({
						'aria-disabled': value+'',
						'tabindex': (value) ? '-1' : '0'
					})
				;
			},
			min: function(orig, shim, value){
				value = (value) ? value * 1 || 0 : 0;
				$(shim).slider( "option", "min", value );
				$('span', shim).attr({'aria-valuemin': value});
			},
			max: function(orig, shim, value){
				value = (value || value === 0) ? value * 1 || 100 : 100;
				$(shim).slider( "option", "max", value );
				$('span', shim).attr({'aria-valuemax': value});
			},
			value: function(orig, shim, value){
				value = $(orig).prop('valueAsNumber');
				if(!isNaN(value)){
					if(!replaceInputUI.range.blockAttr){
						$(shim).slider( "option", "value", value );
					}
					$('span', shim).attr({'aria-valuenow': value, 'aria-valuetext': value});
				}
			},
			step: function(orig, shim, value){
				value = (value && $.trim(value)) ? value * 1 || 1 : 1;
				$(shim).slider( "option", "step", value );
			}
		};
	}
	
	if(!webshims.bugs.valueAsNumberSet && (options.replaceUI || !Modernizr.inputtypes.date /*|| !Modernizr.inputtypes["datetime-local"]*/ || !Modernizr.inputtypes.range)){
		var reflectFn = function(val){
			if(webshims.data(this, 'hasShadow')){
				$.prop(this, 'value', $.prop(this, 'value'));
			}
		};
		
		webshims.onNodeNamesPropertyModify('input', 'valueAsNumber', reflectFn);
		webshims.onNodeNamesPropertyModify('input', 'valueAsDate', reflectFn);
	}
	
	$.each(['disabled', 'min', 'max', 'value', 'step', 'data-placeholder'], function(i, attr){
		webshims.onNodeNamesPropertyModify('input', attr, function(val){
				var shadowData = webshims.data(this, 'shadowData');
				if(shadowData && shadowData.data && shadowData.data[attr] && shadowData.nativeElement === this){
					shadowData.data[attr](this, shadowData.shadowElement, val);
				}
			}
		);
	});
	if(!options.availabeLangs){
		options.availabeLangs = 'af ar ar-DZ az bg bs ca cs da de el en-AU en-GB en-NZ eo es et eu fa fi fo fr fr-CH gl he hr hu hy id is it ja ko kz lt lv ml ms nl no pl pt-BR rm ro ru sk sl sq sr sr-SR sv ta th tr uk vi zh-CN zh-HK zh-TW'.split(' ');
	}
	
	var getDefaults = function(){
		if(!$.datepicker){return;}
		
		webshims.activeLang({
			langObj: $.datepicker.regional, 
			module: 'form-number-date-ui', 
			callback: function(langObj){
				var datepickerCFG = $.extend({}, defaultDatepicker, langObj, options.datepicker);
				
				
				if(datepickerCFG.dateFormat && options.datepicker.dateFormat != datepickerCFG.dateFormat ){
					$('input.hasDatepicker')
						.filter('.input-date, .input-datetime-local-date')
						.datepicker('option', 'dateFormat', datepickerCFG.dateFormat)
						.getNativeElement()
						.filter('[data-placeholder]')
						.attr('data-placeholder', function(i, val){
							return val;
						})
					;
				}
				$.datepicker.setDefaults(datepickerCFG);
			}
		});
		$(document).unbind('jquery-uiReady.langchange input-widgetsReady.langchange');
	};
	
	$(document).bind('jquery-uiReady.langchange input-widgetsReady.langchange', getDefaults);
	getDefaults();
	
	//implement set/arrow controls
(function(){
	var supportsType = (function(){
		var types = {};
		return function(type){
			if(type in types){
				return types[type];
			}
			return (types[type] = ($('<input type="'+type+'" />')[0].type === type));
		};
	})();
	
	if(supportsType('number')/* && supportsType('time')*/){return;}
	var doc = document;
	var options = webshims.cfg["forms-ext"];
	var typeModels = webshims.inputTypes;
	
	var getNextStep = function(input, upDown, cache){
		
		cache = cache || {};
		
		if( !('type' in cache) ){
			cache.type = $.prop(input, 'type');
		}
		if( !('step' in cache) ){
			cache.step = webshims.getStep(input, cache.type);
		}
		if( !('valueAsNumber' in cache) ){
			cache.valueAsNumber = typeModels[cache.type].asNumber($.prop(input, 'value'));
		}
		var delta = (cache.step == 'any') ? typeModels[cache.type].step * typeModels[cache.type].stepScaleFactor : cache.step,
			ret
		;
		webshims.addMinMaxNumberToCache('min', $(input), cache);
		webshims.addMinMaxNumberToCache('max', $(input), cache);
		
		if(isNaN(cache.valueAsNumber)){
			cache.valueAsNumber = typeModels[cache.type].stepBase || 0;
		}
		//make a valid step
		if(cache.step !== 'any'){
			ret = Math.round( ((cache.valueAsNumber - (cache.minAsnumber || 0)) % cache.step) * 1e7 ) / 1e7;
			if(ret &&  Math.abs(ret) != cache.step){
				cache.valueAsNumber = cache.valueAsNumber - ret;
			}
		}
		ret = cache.valueAsNumber + (delta * upDown);
		//using NUMBER.MIN/MAX is really stupid | ToDo: either use disabled state or make this more usable
		if(!isNaN(cache.minAsNumber) && ret < cache.minAsNumber){
			ret = (cache.valueAsNumber * upDown  < cache.minAsNumber) ? cache.minAsNumber : isNaN(cache.maxAsNumber) ? cache.valueAsNumber : cache.maxAsNumber;
		} else if(!isNaN(cache.maxAsNumber) && ret > cache.maxAsNumber){
			ret = (cache.valueAsNumber * upDown > cache.maxAsNumber) ? cache.maxAsNumber : isNaN(cache.minAsNumber) ? cache.valueAsNumber : cache.minAsNumber;
		} else {
			ret = Math.round( ret * 1e7)  / 1e7;
		}
		return ret;
	};
	
	webshims.modules["form-number-date-ui"].getNextStep = getNextStep;
	
	var doSteps = function(input, type, control){
		if(input.disabled || input.readOnly || $(control).hasClass('step-controls')){return;}
		$.prop(input, 'value',  typeModels[type].numberToString(getNextStep(input, ($(control).hasClass('step-up')) ? 1 : -1, {type: type})));
		$(input).unbind('blur.stepeventshim');
		triggerInlineForm(input, 'input');
		
		
		if( doc.activeElement ){
			if(doc.activeElement !== input){
				try {input.focus();} catch(e){}
			}
			setTimeout(function(){
				if(doc.activeElement !== input){
					try {input.focus();} catch(e){}
				}
				$(input)
					.one('blur.stepeventshim', function(){
						triggerInlineForm(input, 'change');
					})
				;
			}, 0);
			
		}
	};
	
	
	if(options.stepArrows){
		var stepDisableEnable = {
			// don't change getter
			set: function(value){
				var stepcontrols = webshims.data(this, 'step-controls');
				if(stepcontrols){
					stepcontrols[ (this.disabled || this.readonly) ? 'addClass' : 'removeClass' ]('disabled-step-control');
				}
			}
		};
		webshims.onNodeNamesPropertyModify('input', 'disabled', stepDisableEnable);
		webshims.onNodeNamesPropertyModify('input', 'readonly', $.extend({}, stepDisableEnable));
	}
	var stepKeys = {
		38: 1,
		40: -1
	};
	webshims.addReady(function(context, contextElem){
		//ui for numeric values
		if(options.stepArrows){
			$('input', context).add(contextElem.filter('input')).each(function(){
				var type = $.prop(this, 'type');
				if(!typeModels[type] || !typeModels[type].asNumber || !options.stepArrows || (options.stepArrows !== true && !options.stepArrows[type]) || supportsType(type) || $(elem).hasClass('has-step-controls')){return;}
				var elem = this;
				var controls = $('<span class="step-controls" unselectable="on"><span class="step-up" /><span class="step-down" /></span>')	
					.insertAfter(elem)
					.bind('selectstart dragstart', function(){return false;})
					.bind('mousedown mousepress', function(e){
						doSteps(elem, type, e.target);
						return false;
					})
					.bind('mousepressstart mousepressend', function(e){
						$(e.target)[e.type == 'mousepressstart' ? 'addClass' : 'removeClass']('mousepress-ui');
					})
				;
				var mwheelUpDown = function(e, d){
					if(elem.disabled || elem.readOnly){return;}
					$.prop(elem, 'value',  typeModels[type].numberToString(getNextStep(elem, d, {type: type})));
					triggerInlineForm(elem, 'input');
					return false;
				};
				var jElm = $(elem)
					.addClass('has-step-controls')
					.attr({
						readonly: elem.readOnly,
						disabled: elem.disabled,
						autocomplete: 'off',
						role: 'spinbutton'
					})
					.bind(($.browser.msie) ? 'keydown' : 'keypress', function(e){
						if(elem.disabled || elem.readOnly || !stepKeys[e.keyCode]){return;}
						$.prop(elem, 'value',  typeModels[type].numberToString(getNextStep(elem, stepKeys[e.keyCode], {type: type})));
						triggerInlineForm(elem, 'input');
						return false;
					})
				;
				
				if($.fn.mwheelIntent){
					jElm.add(controls).bind('mwheelIntent', mwheelUpDown);
				} else {
					jElm
						.bind('focus', function(){
							jElm.add(controls).unbind('.mwhellwebshims')
								.bind('mousewheel.mwhellwebshims', mwheelUpDown)
							;
						})
						.bind('blur', function(){
							$(elem).add(controls).unbind('.mwhellwebshims');
						})
					;
				}
				webshims.data(elem, 'step-controls', controls);
				if(options.calculateWidth){
					adjustInputWithBtn(jElm, controls);
					controls.css('marginTop', (jElm.outerHeight() - controls.outerHeight())  / 2 );
				}
			});
		}
	});
})();

	
	webshims.addReady(function(context, elem){
		$(document).bind('jquery-uiReady.initinputui input-widgetsReady.initinputui', function(e){
			if($.datepicker || $.fn.slider){
				if($.datepicker && !defaultDatepicker.dateFormat){
					defaultDatepicker.dateFormat = $.datepicker._defaults.dateFormat;
				}
				replaceInputUI(context, elem);
			}
			if($.datepicker && $.fn.slider){
				$(document).unbind('.initinputui');
			} else if(!webshims.modules["input-widgets"].src){
				webshims.warn('jQuery UI Widget factory is already included, but not datepicker or slider. configure src of $.webshims.modules["input-widgets"].src');
			}
		});
	});
	
});

