jBreak.options = {
	showOptions:function(){
		var $optionsTabs = $('<div/>'),
		    $options = draggableWindow('Settings',
		    	$optionsTabs).css({width:'216px', position:'absolute'});

		$optionsTabs.append('<ul style="font-size:12px"><li><a href="#tabs-1">Sound</a></li><li><a href="#tabs-2">Level</a></li><li><a href="#tabs-3">About</a></li></ul>');
		$optionsTabs.append(this.soundOptions());
		$optionsTabs.append('<div id="tabs-2" style="text-align:center;height:220px">-under construction-</div>');
		$optionsTabs.append('<div id="tabs-3" style="text-align:center;height:220px"><p>jBreak @VERSION</p><p style="font-size:11px">Written by Damian Senn<br /><br />Graphics and Sounds<br />by <a href="http://www.helleresonnen.com/">Jan Neversil</a><br /><br />Music (coming soon)<br />by <a href="http://www.alphatronic.net/">Dani Whiler</a></p></div>');

		var $startButton = $(
			'<button class="ui-state-default ui-corner-all" style="cursor:pointer" id="jBreakStart">Start</button>'
		);
		$startButton.hover(function(){
			$startButton.addClass('ui-state-hover');
		},function(){
			$startButton.removeClass('ui-state-hover');
		});

		$optionsTabs.append(
			$('<p class="ui-widget" style="margin-bottom:.5em;text-align:center"/>').append($startButton)
		);

		jBreak.$field.append($options.append($optionsTabs));
		$optionsTabs.tabs();

		$startButton.bind('click.jBreakCreatePaddles',function(e){
			e.stopPropagation();
			$options.fadeOut(750);
			jBreak.loadLevel(jBreak._levelID);
			$startButton.unbind('.jBreakCreatePaddles');
		});

		this.$options = $options.fadeIn(600);
	},
	soundOptions:function(){
		var $soundOptions = $('<div id="tabs-1" style="height:220px"/>');

		var $soundVolumeControl = $('<div/>');
		var $soundVolumeSlider = $('<div/>');
		$soundVolumeControl.css('font-size','11px');
		$soundVolumeSlider.css({width:'170px',marginBottom:'8px'});
		$soundVolumeSlider.slider({
			animate:true,
			value:jBreak._volume,
			range:'min',
			min:0,
			max:100,
			slide:function(e, ui){
				jBreak._volume = ui.value;
				$('#soundVolume').text(ui.value+'%');
				jBreak.playSound('sound/pling1s.ogg');
			},
			stop:function(e, ui){
				createCookie('soundVolume', ui.value, 7);
			}
		});
		$soundVolumeControl.append($soundVolumeSlider);
		$soundVolumeControl.prepend('<p style="margin:0">Sound volume: <span id="soundVolume" style="float:right">'+jBreak._volume+'%</span></p>');
		$soundOptions.append($soundVolumeControl);

		var $musicVolumeControl = $('<div/>');
		var $musicVolumeSlider = $('<div/>');
		$musicVolumeControl.css('font-size','11px');
		$musicVolumeSlider.css('width','170px');
		$musicVolumeSlider.slider({
			animate:true,
			value:70,
			range:'min',
			min:0,
			max:100,
			slide:function(e, ui){
				//jBreak._volume = ui.value;
				$('#musicVolume').text(ui.value+'%');
			}
		}).slider('disable');
		$musicVolumeControl.append($musicVolumeSlider);
		$musicVolumeControl.prepend('<p style="margin:0">Music volume: <span id="musicVolume" style="float:right">70%</span></p>');
		$soundOptions.append($musicVolumeControl);

		return $soundOptions;
	},
	$options:null
};
