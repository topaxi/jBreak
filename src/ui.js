function button(label, fn){
	if(fn === undefined && typeof label === 'function'){
		fn    = label;
		label = null;
	}

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
		click: typeof fn === 'function' ? fn : $.noop
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
