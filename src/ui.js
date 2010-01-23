function button(label, fn){
	if(arguments.length === 1 && typeof label === 'function'){
		fn = label;
		label = null;
	}

	if(typeof fn !== 'function')
		fn = $.noop;

	var $button = $('<button/>', {
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
	}).addClass('ui-state-default ui-corner-all');

	return $button;
}

function draggableWindow(title, $content){
	var $win = $('<div class="draggableWindow"/>'),
	    $draggableHandle = $('<p class="draggableHandle ui-widget-header">'+title+'</p>');
	$win.prepend($draggableHandle);
	$win.append($content.addClass('draggableContent ui-widget ui-widget-content ui-corner-all'));

	$win.draggable({
		containment:'#jBreakField',
		handle:'.draggableHandle',
		scroll:false
	});

	return $win;
}
