var Options = jBreak.Options = {
	showOptions:function(){
		var $optionsTabs = $('<div/>')
		  , $options     = draggableWindow('Settings',
		    	$optionsTabs).css({width:'216px', position:'absolute'});

		$optionsTabs.append('<ul style="font-size:12px"><li><a href="#tabs-1">Sound</a></li><li><a href="#tabs-2">Level</a></li><li><a href="#tabs-3">About</a></li></ul>');
		$optionsTabs.append(this.soundOptions());
		$optionsTabs.append(this.levelOptions());
		$optionsTabs.append('<div id="tabs-3" style="text-align:center;height:220px"><p>jBreak @VERSION</p><p style="font-size:11px">Written by Damian Senn<br /><br />Graphics and Sounds<br />by <a href="http://www.helleresonnen.com/">Jan Neversil</a><br /><br />Music (coming soon)<br />by <a href="http://www.alphatronic.net/">Dani Whiler</a></p></div>');

		var $startButton = button('Start', function(e){
			e.stopPropagation();
			$options.fadeOut(600);
			jBreak.loadLevel(jBreak._levelID);
			$startButton.attr('disabled','disabled');
		});

		$optionsTabs.append(
			$('<p class="ui-widget" style="margin-bottom:.5em;text-align:center"/>')
				.append($startButton)
		);

		$jBreakField.append($options.append($optionsTabs));
		$optionsTabs.tabs();


		this.$options = $options.fadeIn(600);
	},
	soundOptions:function(){
		var $soundOptions = $('<div id="tabs-1" style="height:220px"/>');
		
		if(typeof Audio === 'undefined')
			return $soundOptions.append('<p>Your browser does not support audio!</p>');

		if(typeof localStorage !== 'undefined'){
			if(localStorage['soundVolume'] !== null)
				jBreak.volume(localStorage['soundVolume'] >>> 0);
		}
		else {
			var cookieSoundVolume = Cookie.get('soundVolume');
			if(cookieSoundVolume !== undefined)
				jBreak.volume(cookieSoundVolume >>> 0);
		}


		var $soundVolumeControl = $('<div/>')
		  , $soundVolumeSlider  = $('<div/>')
		;

		$soundVolumeControl.css('font-size','11px');
		$soundVolumeSlider.css({width:'170px',marginBottom:'8px'});
		$soundVolumeSlider.slider({
			animate:true,
			value:jBreak._volume,
			range:'min',
			min:0,
			max:100,
			slide:function(e, ui){
				jBreak.volume(ui.value);
				$('#soundVolume').text(ui.value+'%');
				jBreak.playSound('sound/pling1s.ogg');
			},
			stop:function(e, ui){
				if(localStorage)
					localStorage['soundVolume'] = ui.value;
				else
					Cookie.set('soundVolume', ui.value, 7);
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
	levelOptions:function(){
		var $levelOptions = $('<div id="tabs-2" style="text-align:center;height:220px"/>');
		$levelOptions.append(button('Start level editor', function(){
			Editor.start();
		}));

		$levelOptions.append('<p>-under construction-</p>');

		return $levelOptions;
	}
};
