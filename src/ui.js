function button(label, fn){
	if(arguments.length === 1 && typeof label === 'function'){
		fn = label;
		label = null;
	}

	if(typeof fn !== 'function')
		fn = $.noop;

	var $button = $('<button/>', {
		'class':'ui-state-default ui-corner-all',
		text:label,
		css:{
			cursor:'pointer'
		},
		mouseenter:function(){
			$button.addClass('ui-state-hover');
		},
		mouseleave:function(){
			$button.removeClass('ui-state-hover');
		},
		click:fn
	});

	return $button;
}

function draggableWindow(title, $content){
	var $draggableHandle = $('<p/>')
	    	.addClass('draggableHandle ui-widget-header')
	    	.text(title);

	return $('<div class="draggableWindow"/>')
		.prepend($draggableHandle)
		.append($content.addClass(
			'draggableContent ui-widget ui-widget-content ui-corner-all'))
		.draggable({
			containment:'#jBreakField',
			handle:$draggableHandle,
			scroll:false
		});
}
