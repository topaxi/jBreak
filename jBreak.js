﻿(function($){

var jBreak = {
	start:function(initial){
		var $jBreak = $('#jBreak').empty();
		this.$field = $('<div id="jBreakField"/>');
		$jBreak.append(this.$field);

		this.paddles = [];
		this.bonuses = [];
		this.balls   = [];

		this.fieldSize = {
			width:this.$field.width(),
			height:this.$field.height()
		};

		this.lives(this._lives);

		if(initial){
			this._cacheImages();
			this._setLevelTitle('jBreak 0.1.7');
			this._trackMouseMovement(true);
			this.$blocks = $('<div style="position:absolute;left:0;top:0;display:none"/>');

			var cookieSoundVolume = readCookie('soundVolume');
			if(cookieSoundVolume !== null)
				this._volume = cookieSoundVolume;

			if(window.location.hash == '#debug')
				console.log(this);

			this.options.showOptions();
		}
		//console.log('Playing field initialized -> %o', this);
	},
	_cacheImages:function(){
		var cache = this._imageCache;

		cache.paddle = [];
		var paddleImages = [
			'pad16x8',
			'pad32x8',
			'pad48x8',
			'pad64x8',
			'pad80x8',
			'pad96x8',
			'pad112x8',
			'pad128x8'
		];
		for(var i = paddleImages.length;i--;){
			cache.paddle[i] = $('<img src="images/paddles/'+paddleImages[i]+'.png"/>');
		}

		cache.ball = [];
		var ballImages = [
			'ball1-88',
			'ball4-88'
		];
		for(var i = ballImages.length;i--;){
			cache.ball[i] = $('<img src="images/'+ballImages[i]+'.png"/>');
		}

		cache.bonus = [];
		var bonusImages = [
			'shrink',
			'15+speed',
			'faster',
			'grow',
			'slower',
			'life',
			'powerball',
			'multiball'
		];
		for(var i = bonusImages.length;i--;){
			cache.bonus[i] = $('<img src="images/bonuses/'+bonusImages[i]+'.png"/>');
		}

		cache.block = [];
		var blockImages = [
			'Blue',
			'Blue_purpled',
			'Gray',
			'Green_greener',
			'Green_Yellowish_Light',
			'Orange',
			'Purple_bluish',
			'Purple_gay',
			'Purple_haze',
			'Red_fire',
			'Red_Pink',
			'Turkoise_2',
			'Turkoise_3',
			'Turkoise_greenisch',
			'Yellow'
		];
		for(var i = blockImages.length;i--;){
			cache.block[i] = $('<img src="images/blocks/'+blockImages[i]+'.png"/>');
		}
	},
	_setLevelTitle:function(title){
		$('#jBreakLevelTitle').remove();
		var $title = $('<div id="jBreakLevelTitle"/>').text(title);

		$('#jBreak').append($title);
	},
	lives:function(lives){
		if(lives === undefined){
			return this._lives;
		}

		this._lives = lives;

		$('#jBreakLives').remove();
		var $lives = $('<div id="jBreakLives"/>');

		for(var i = this._lives;i--;){
			$lives.append('<div class="jBreakLive"/>');
		}

		$('#jBreak').append($lives);
	},
	playSound:function(soundFile){ // I'M LEAKING LOTS OF MEMORY!!
		if(this._volume === 0 || typeof Audio === 'undefined') return;
		var audio = new Audio(soundFile);
		audio.volume = this._volume/100;
		audio.play();
	},
	addPaddle:function(position){
		var jBPaddle = new jBreak.paddle(position);
		this.paddles.push(jBPaddle);
		return jBPaddle;
	},
	hideCursor:function(hide){
		if(hide){
			$('#jBreak').css('cursor',
				'url(images/cursor/cursor.gif), url(images/cursor/cursor.ico), none');
		} else {
			$('#jBreak').css('cursor', 'default');
		}
	},
	createPaddles:function(){
		var self = this;
		this.$field.bind('click.jBreakCreatePaddles', function(e){
			e.stopPropagation(); // do not bubble
			//console.log('Creating paddles...');
			self.hideCursor(true);

			for(var i = self.paddles.length;i--;){
				var jBPaddle = self.paddles[i];
				jBPaddle.start();

				var jBPaddlePosition = jBPaddle.getPosition(),
				    fieldOffset = self.$field.offset();

				var position = (
					jBPaddlePosition.relative === 'top' ||
					jBPaddlePosition.relative === 'bottom'
						? e.pageX - fieldOffset.left
						: e.pageY - fieldOffset.top);

				jBPaddle.move(position);
			};

			self.$field.bind('click.jBreakLaunchPaddleBalls', function(){
				self._trackMouseMovement(true);
				self.bindPause();

				for(var i = self.paddles.length;i--;){
					self.paddles[i].startBalls();
				};
			});
			self.$field.unbind('click.jBreakCreatePaddles');
			//console.log('Paddles created');
		});
	},
	bindPause:function(){
		var self = this;
		$(document).bind('keydown.jBreakPause', function(e){
			if(e.keyCode === 32){
				self.togglePause();

				if(self._paused)
					self.unbindPause();
			}
		});
	},
	unbindPause:function(){
		$(document).unbind('.jBreakPause');
	},
	togglePause:function(){
		this._paused = !this._paused;

		for(var i = this.balls.length;i--;)
			this.balls[i].pause();

		for(var i = this.bonuses.length;i--;)
			this.bonuses[i].pause();

		this._trackMouseMovement(!this._paused);

		if(this._paused){
			this.destroyField();

			var $unpauseButton = $('<button>continue</button>'),
			    fieldOffset = this.$field.offset();

			this.$field.append($unpauseButton);
			$unpauseButton.css({
				position:'absolute',
				width:'64px',
				height:'24px',
				left:this._mousePosition.pageX - fieldOffset.left - 32,
				top: this._mousePosition.pageY - fieldOffset.top  - 12
			});

			var self = this;
			$unpauseButton.click(function(){
				self.togglePause();
				self.bindPause();

				$(this).remove();
			}).focus(function(){ // prevent button from beeing triggered with <return>
				$(this).blur();
			});
		} else {
			for(var i = this.paddles.length;i--;){
				this.paddles[i].start();
			}
			this.hideCursor(true);
		}
	},
	_trackMouseMovement:function(track){
		this.$field.unbind('mousemove');

		if(track){
			var self = this;
			this.$field.mousemove(function(e){
				self._mousePosition = {
					pageX:e.pageX,
					pageY:e.pageY
				};
			});
		}
	},
	destroyField:function(){
		this._trackMouseMovement(false);
		this.unbindPause();
		$(document).unbind('mousemove');
		this.hideCursor(false);
	},
	blockChecker:function(){
		var blockVal = 0,
		    blocks   = this.blocks;

		for(var y = blocks.length;y--;){
			var blocksY = blocks[y]; 
			for(var x = blocksY.length;x--;){
				if(blocksY[x])
					blockVal += blocksY[x].value;
			}
		}

		if(blockVal === 0){
			for(var i = this.balls.length;i--;)
				this.balls[i].remove();

			var paddles = this.paddles;
			for(var i = paddles.length;i--;)
				paddles[i].remove();

			this.destroyField();
			this._levelID += 1;
			this.start(false);
			this.loadLevel(this._levelID);
		}
	},
	ballChecker:function(jBPaddle){
		//console.log('Checking remaining balls...');
		if(this.balls.length === 0){
			var lives = this._lives;
			if(lives > 0){
				this.lives(lives-1);
				jBPaddle.connectBall(new jBreak.ball());
				jBPaddle.size(64); // reset size

				jBPaddle.$paddle.stop(true, true) // stop any effects on the paddle
					.css('opacity', 1); // $paddle.stop doesn't seem to restore the opacity...
			} else {
				//console.log('No remaining balls found... FAIL!')
				var self = this;

				this.destroyField();
				this.$field.find('.jBreakPaddle').effect('puff', {}, 750);
				this.$blocks.find('div').effect('drop', {direction:'down'}, 750);

				setTimeout(function(){
					for(var i = self.paddles.length;i--;){
						self.paddles[i].remove();
					};

					self.paddles = [];
					self.$blocks.remove();

					var $fail = $('<div class="fail" style="display:none">FAIL!</div>');
					self.hideCursor(false);
					self.$field.append($fail);
					var failOffset = $fail.offset();

					$fail.css('top',
						self.$field.height()/2 - $fail.height()/2 + 'px'
					).fadeIn('slow', function(){
						$(this).effect('pulsate', {times:2,mode:'hide'}, 2000, function(){
							self._levelID = 0;
							self._lives = 3;
							self.start(true); // restart game
						});
					});
				}, 1000);
			}
		}
	},
	loadLevel:function(levelID){
		levelID = (levelID !== undefined ? levelID : 0);

		var level;
		$.ajax({
			url:'getLevel.php',
			method:'get',
			data:{
				levelID:levelID
			},
			dataType:'json',
			async:false,
			success:function(data, textStatus){
				level = data.message;
			}
		});
		this.blocks = level.blocks;
		this._drawBlocks(level);
		this._setLevelTitle(level.name);

		var self = this;
		setTimeout(function(){
			self.createPaddles();

			for(var i = level.paddles.length;i--;){
				var paddle = level.paddles[i];
				var jBPaddle = self.addPaddle(paddle.position);
				if(paddle.ball)
					jBPaddle.connectBall(new self.ball());
			};
		}, 250);
	},
	_drawBlocks:function(level){
		if(this._imageCache.blocks === undefined){
			this._imageCache.blocks = {};
		}

		this.$blocks.empty();
		for(var y = this.blocks.length;y--;){
			var horizontalBlocks = this.blocks[y];
			for(var x = horizontalBlocks.length;x--;){
				var block = horizontalBlocks[x];

				if(block !== 0){
					var $block = $('<div/>');
					$block.addClass('jBreakBlock x'+x+' y'+y);

					var random = Math.ceil(Math.random()*10);
					random = (random < 10 ? '0'+random : random);

					block.sprite = (random-1)*-16;
					$block.css({
						left:x*40,
						top:y*16,
						background:
							'transparent url(images/blocks/'
								+block.theme+'.png) scroll no-repeat',
						backgroundPosition:'-40px '+block.sprite+'px'
					});

					this.$blocks.append($block);
				}
			}
		}

		this.$field.append(this.$blocks);
		this.$blocks.fadeIn('slow');
	},
	// public variables
	$field:null,
	$blocks:null,
	fieldSize:null,
	paddles:null,
	balls:null,
	bonuses:null,
	blocks:null,
	// private variables
	_imageCache:{},
	_lives:3,
	_volume:70,
	_levelID:0,
	_mousePosition:null,
	// objects
	options:null,
	paddle:function(position){
		// this references to the jBreak.paddle object!
		this._init(position);
	},
	ball:function(position){
		// this references to the jBreak.ball object!
		this._init(position);
	},
	bonus:function(jBBall,x,y,angle){
		// this references to the jBreak.bonus object!
		this._init(jBBall,x,y,angle);
	}
};

jBreak.options = {
	showOptions:function(){
		this.$options = $('<div class="optionsContainer"/>');
		this.$options.css('position', 'absolute'); // @todo remove this

		var $draggableHandle = $('<p class="draggableHandle ui-widget-header">Settings</p>');
		this.$options.prepend($draggableHandle);

		this.$options.draggable({
			containment:'#jBreakField',
			handle:'.draggableHandle',
			scroll:false
		});

		this.$optionTabs = $('<div class="options"/>');

		this.$optionTabs.append('<ul style="font-size:12px"><li><a href="#tabs-1">Sound</a></li><li><a href="#tabs-2">Level</a></li><li><a href="#tabs-3">About</a></li></ul>');
		this.$optionTabs.append(this.soundOptions());
		this.$optionTabs.append('<div id="tabs-2" style="text-align:center;height:220px">-under construction-</div>');
		this.$optionTabs.append('<div id="tabs-3" style="text-align:center;height:220px"><p>jBreak 0.1.7</p><p style="font-size:11px">Written by Damian Senn<br /><br />Graphics and Sounds<br />by <a href="http://www.helleresonnen.com/">Jan Neversil</a><br /><br />Music (coming soon)<br />by <a href="http://www.alphatronic.net/">Dani Whiler</a></p></div>');

		var $startButton = $(
			'<button class="ui-state-default ui-corner-all" style="cursor:pointer" id="jBreakStart">Start</button>'
		);
		$startButton.hover(function(){
			$startButton.addClass('ui-state-hover');
		},function(){
			$startButton.removeClass('ui-state-hover');
		});

		this.$optionTabs.append(
			$('<p class="ui-widget" style="margin-bottom:.5em;text-align:center"/>').append($startButton)
		);

		jBreak.$field.append(this.$options.append(this.$optionTabs));
		this.$optionTabs.tabs();

		$startButton.bind('click.jBreakCreatePaddles',function(e){
			e.stopPropagation();
			$('#jBreak .optionsContainer').fadeOut(750);
			jBreak.loadLevel(jBreak._levelID);
			$startButton.unbind('.jBreakCreatePaddles');
		});
		
		this.$options.fadeIn('slow');
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
				createCookie('soundVolume', ui.value, 7);
				$('#soundVolume').text(ui.value+'%');
				jBreak.playSound('sound/pling1s.ogg');
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
	$options:null,
	$optionsTabs:null
};

jBreak.paddle.prototype = {
	_init:function(position){
		//console.log('Create %s paddle..', position);
		this.$paddle = $('<div class="jBreakPaddle"/>');

		this._position = {
			x:null,
			y:null,
			relative:position
		};

		this._balls = [];

		this.$paddle.addClass(position);
		jBreak.$field.append(this.$paddle);

		this._size = {
			width:this.$paddle.width(),
			height:this.$paddle.height()
		};

		switch(position){
			default:
			case 'bottom':
				this._position.y = jBreak.fieldSize.height - this._size.height;
				this._position.x = jBreak.fieldSize.width / 2 - this._size.width / 2;
				break;
			case 'top':
				this._position.y = 0;
				this._position.x = jBreak.fieldSize.width / 2 - this._size.width / 2;
				break;
			case 'left':
				this._position.y = jBreak.fieldSize.height / 2 - this._size.width / 2;
				this._position.x = 0;
				break;
			case 'right':
				this._position.y = jBreak.fieldSize.height / 2 - this._size.height / 2;
				this._position.x = jBreak.fieldSize.width - this._size.width;
				break;
		}

		this.$paddle.css({
			left:this._position.x,
			top:this._position.y
		});
		//console.log('%s paddle created and moved to initial position -> %o', position, this);
	},
	grow:function(){
		var size = this._size;
		this.size(size.width > size.height
			? size.width  + 16
			: size.height + 16);
	},
	shrink:function(){
		var size = this._size;
		this.size(size.width > size.height
			? size.width  - 16
			: size.height - 16);
	},
	size:function(size){
		if(size === undefined)
			return this._size;

		if(size > 128 || size < 16 || size % 16 !== 0)
			return;

		var width = this._size.width, height = this._size.height;
		(width > height
			? width = size
			: height = size);

		this.$paddle.css({
			width:width+'px',
			height:height+'px',
			backgroundImage:'url(images/paddles/pad'+width+'x'+height+'.png)'
		});
		this._size = {width:width, height:height};
	},
	start:function(){
		var self = this,
		    relativePosition = this._position.relative,
		    fieldOffset = jBreak.$field.offset();

		$(document)./*jBreak.$field.*/mousemove(function(e){
			var newPosition = (relativePosition === 'top'
			               ||  relativePosition === 'bottom'
			                   ? e.pageX - fieldOffset.left
			                   : e.pageY - fieldOffset.top);

			self.move(newPosition);
		});
	},
	connectBall:function(jBBall){
		var x,y,effectDirection;

		switch(this._position.relative){
			case 'top':
				x = this._position.x
				  + this._size.width / 2
				  - jBBall.$ball.width() / 2;

				y = this._position.y
				  + this._size.height / 2
				  + jBBall.$ball.height() / 2;

				jBBall.setAngle(90);
				effectDirection = 'down';
				break;
			case 'right':
				x = this._position.x
				  - jBBalls.$ball.width();

				y = this._position.y
				  + this._size.height / 2
				  - jBBall.$ball.width() / 2;

				jBBall.setAngle(90);
				effectDirection = 'left';
				break;
			default:
			case 'bottom':
				x = this._position.x
				  + this._size.width / 2
				  - jBBall.$ball.width() / 2;

				y = this._position.y
				  - this._size.height / 2
				  - jBBall.$ball.height() / 2;

				jBBall.setAngle(-90);
				effectDirection = 'up';
				break;
			case 'left':
				x = this._position.x
				  + jBBall.$ball.width();

				y = this._position.y
				  + this._size.height / 2
				  - jBBall.$ball.width() / 2;

				jBBall.setAngle(-90);
				effectDirection = 'right';
				break;
		}

		jBBall.move(x,y);
		jBBall.$ball.show('bounce', {
			direction:effectDirection,
			distance:40,
			times:5
		}, function(){
			var position = jBBall.getPosition();

			jBBall.move(position.x,position.y);
			jBBall.ready(true);
		});
		this._balls.push(jBBall);

		//console.log('Ball %d connected to %o and moved to %d,%d', ballID, this, x, y);
	},
	startBalls:function(){
		for(var i = this._balls.length;i--;){
			var ball = this._balls[i];

			if(ball.ready()){
				ball.start();
				this._balls.remove(i);
			}
		}
	},
	move:function(position){
		var jB = jBreak,
		    jBFieldSize = jB.fieldSize,
		    relativePosition = this._position.relative;

		if(relativePosition === 'top' || relativePosition === 'bottom'){
			var x = position;
			x -= this._size.width / 2;

			if(x < 0){
				x = 0;
			} else if(x > jBFieldSize.width - this._size.width){
				x = jBFieldSize.width - this._size.width;
			}

			for(var i = this._balls.length;i--;){
				var ball = this._balls[i],
				    ballX = x
				          + this._size.width / 2
				          - ball.$ball.width() / 2;

				// @todo fix this "workaround" or maybe even kill the "bounce" effect
				var $parent = ball.$ball.parent();
				if($parent.hasClass('ui-effects-wrapper')){
					$parent.css({
						left:ballX,
						top:ball.getPosition().y
					});
					ball.getPosition().x = ballX;
				} else {
					ball.move(
						ballX,
						ball.getPosition().y);
				}
			}

			this._position.x = x;
			this.$paddle.css('left', x);
		} else {
			var y = position;
			y -= this._size.height / 2;

			if(y < 0){
				y = 0;
			} else if(y > jBFieldSize.height - this._size.height){
				y = jBFieldSize.height - this._size.height;
			}

			for(var i = this._balls.length;i--;){
				var ball  = this._balls[i],
				    ballY = y
				          + this._size.height / 2
				          - ball.$ball.height() / 2;

				var $parent = ball.$ball.parent();
				if($parent.hasClass('ui-effects-wrapper')){
					$parent.css({
						left:ball.getPosition().x,
						top:ballY
					});
					ball.getPosition().y = ballY;
				} else {
					ball.move(
						ball.getPosition().x,
						ballY);
				}
			}

			this._position.y = y;
			this.$paddle.css('top', y);
		}
	},
	remove:function(){
		var jB = jBreak;

		for(var i = jB.paddles.length;i--;){
			if(jB.paddles[i]._position.relative === this._position.relative){
				jB.paddles.remove(i);
			}
		}

		// remove connected balls
		for(var i = this._balls.length;i--;){
			var connectedBall = this._ball[i];
			for(var o = jB.balls.length;o--;){
				var jBBall = jB.balls[o];
				if(connectedBall === jBBall)
					jBBall.remove();
			}
		}

		this.$paddle.remove();
		//delete this;
	},
	getPosition:function(){
		return this._position;
	},
	// private variables
	_size:null,
	_position:null,
	_balls:null,
	_paused:false,
	// public variables
	$paddle:null
};

jBreak.ball.prototype = {
	_init:function(position){
		jBreak.balls.push(this);
		//console.log('Create ball %d -> %o', ballID, this);
		this.$ball = $('<div class="jBreakBall"/>');
		jBreak.$field.append(this.$ball);

		this._size = {
			width: this.$ball.width(),
			height:this.$ball.height()
		};

		this._position = position;
		this._speed = {
			x:null,
			y:null
		};

		this._timers = {};
	},
	start:function(){
		if(this._ready){
			this.setAngle();
			this._timer = true;
			this._toggleTimers(true);
			this._animate();
		}
	},
	ready:function(ready){
		if(ready !== undefined){
			this._ready = ready;

			return this;
		}

		return this._ready;
	},
	_toggleTimers:function(on){
		if(on){
			var self = this;
			this._timersID = setInterval(function(){
				var timers = self._timers;

				for(var i in timers){
					var timer = timers[i];
					timer.timeout -= .25;

					if(timer.timeout <= 0){
						timer.action.call(self);
						self.deleteTimer(i);
					}
				}
			}, 250);
		} else {
			clearInterval(this._timersID);
		}
	},
	setAngle:function(angle){
		if(angle !== undefined)
			this._angle = angle;

		var speed = this._angle / 360 * Math.PI;
		this._speed.x = Math.cos(speed);
		this._speed.y = Math.sin(speed);
	},
	_hitCheck:function(x,y){
		var jB = jBreak; // store jBreak in this scope to access it faster!
		var paddle = {
			top:false,
			right:false,
			bottom:false,
			left:false
		};

		// only run checks if a block could be hit
		if(y <= jB.fieldSize.height || y >= 0 || x >= 0 || x <= jB.fieldSize.width){
			var ballY = (this._speed.y > 0 ? y + this._size.height : y),
			    ballX = (this._speed.x > 0 ? x + this._size.width  : x);

			var blockX = Math.floor(ballX / 40),
			    blockY = Math.floor(ballY / 16);

			var blockExists = jB.blocks[blockY] !== undefined
			               && jB.blocks[blockY][blockX] !== undefined;

			if(blockExists){
				var block = jB.blocks[blockY][blockX];
				if(block.value > 0){
					jB.playSound('sound/pling1s.ogg');

					if(!this._pierce){
						ballX = Math.floor(ballX);
						ballY = Math.floor(ballY);

						var hHit = (ballX % 40 <= 39 && ballX % 40 >= 36 && this._speed.x < 0)
						        || (ballX % 40 <=  4 && this._speed.x > 0);
						var vHit = (ballY % 16 <= 15 && ballY % 16 >= 12 && this._speed.y < 0)
						        || (ballY % 16 <=  4 && this._speed.y > 0);

						if(vHit && hHit) // don't mirror both speeds, mirror the slower one
							(this._speed.y > this._speed.x ? hHit = false : vHit = false);

						if(vHit)
							this._speed.y *= -1;

						if(hHit)
							this._speed.x *= -1;

						/*if(!hHit && !vHit){
							console.log('ballX: %d speed: %o', ballX, this._speed);
						}*/
					}

					//console.log('I hit %d,%d', blockX,blockY);
					var $block = $('.x'+blockX+'.y'+blockY);
					var direction =
						(vHit && this._speed.y > 0 ? 'up' :
							(hHit && this._speed.x > 0 ? 'left' :
								(hHit && this._speed.x < 0 ? 'right' :
									/*vHit && this._speed.y < 0*/ 'down')));

					var rand = Math.random();
					if(block.value > 1 && !this._pierce){
						if(rand < .04)
							new jB.bonus(this,x,y,180); // spawn bonus

						$block.css({
							opacity:1-1/blockValue,
							backgroundPosition:'0 '+block.sprite+'px'
						});
						block.value -= 1;

						setTimeout(function(){
							$block.css('background-position', '-40px'+block.sprite+'px');
						}, 100);
					} else {
						if(rand < .08)
							new jB.bonus(this,x,y,180); // spawn bonus

						$block.css('background-position', '0 '+block.sprite+'px');
						$block.effect('drop', {direction:direction}, 'fast', function(){
							$block.remove();
						});
						delete jB.blocks[blockY][blockX];
						jB.blockChecker();
					}
				}
			}
		}

		// only run checks if a paddle could be hit
		if(y >= jB.fieldSize.height - 16 || y <=  8 || x <=  8 || x >= jB.fieldSize.width - 16){
			for(var i = jB.paddles.length;i--;){
				var jBPaddle = jB.paddles[i],
				    paddleMissed,
				    paddleHit,
				    angle,
				    jBPaddlePosition = jBPaddle.getPosition(),
				    jBPaddleSize = jBPaddle.size();

				switch(jBPaddlePosition.relative){
					default:
					case 'bottom':
						paddle.bottom = true;

						paddleHit = this._speed.y > 0
						         && y <= jB.fieldSize.height - 8
						         && x >= jBPaddlePosition.x - this._size.width
						         && Math.ceil(y) >= jBPaddlePosition.y - this._size.height
						         && x <= jBPaddlePosition.x + jBPaddleSize.width;

						paddleMissed = y > jB.fieldSize.height + 2;

						if(paddleHit){
							angle =
								(this._position.x - jBPaddlePosition.x + this._size.width/2)
								 * 180 / (jBPaddle._size.width / 2)
								 - 360;

							angle = Math.floor(
								(angle > -45 ? -45 :
									(angle < -315 ? -315 : angle)));

							this.setAngle(angle);
						}
						break;
					case 'top':
						paddle.top = true;

						paddleHit = this._speed.y < 0
						         && y >= 4
						         && x >= jBPaddlePosition.x - this._size.width
						         && Math.ceil(y) <= jBPaddlePosition.y + this._size.height
						         && x <= jBPaddlePosition.x + jBPaddleSize.width;

						paddleMissed = y < -10;

						if(paddleHit){
							angle =
								(this._position.x - jBPaddlePosition.x + this._size.width/2)
								 * 180 / (jBPaddle._size.width / 2)
								 - 360;

							angle = Math.floor(
								(angle > -45 ? -45 :
									(angle < -315 ? -315 : angle)));

							this.setAngle(angle*-1);
						}
						break;
					case 'left':
						paddle.left = true;

						paddleHit = this._speed.x < 0 
						         && x >= 4
						         && y >= jBPaddlePosition.y - this._size.height
						         && Math.ceil(x) <= jBPaddlePosition.x + this._size.width
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x < -10;

						if(paddleHit)
							this._speed.x *= -1;
						break;
					case 'right':
						paddle.right = true;

						paddleHit = this._speed.x > 0
						         && y >= jBPaddlePosition.y - this._size.height
						         && x <= jB.fieldSize.width - 8
						         && Math.ceil(x) >= jBPaddlePosition.x - this._size.width
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x > jB.fieldSize.width + 2;

						if(paddleHit)
							this._speed.x *= -1;
						break;
				}

				if(paddleHit){
					jB.playSound('sound/pling1s.ogg');
					this._interval -= (this._interval > 12.5 ? .20 : 0);
				} else if(paddleMissed){
					this.remove();
					jB.ballChecker(jBPaddle); // any balls left?
					return;
				}
			}
		}

		var check;

		check = x < 0 && !paddle.left
		     || x > jB.fieldSize.width - this._size.width && !paddle.right;
		if(check){
			jB.playSound('sound/pling1s.ogg');
			this._speed.x *= -1;
			this._interval -= (this._interval > 10 ? .075 : 0);
		}

		check = y < 0 && !paddle.top
		     || y > jB.fieldSize.height - this._size.height && !paddle.bottom;
		if(check){
			jB.playSound('sound/pling1s.ogg');
			this._speed.y *= -1;
			this._interval -= (this._interval > 10 ? .075 : 0);
		}
	},
	_animate:function(){
		var x = this._position.x + this._speed.x*4;
		var y = this._position.y + this._speed.y*4;

		this.move(x,y);
		this._hitCheck(x,y);

		if(this._timer){
			// setTimeout(this._animate, 15) kills the "this" reference :(
			var self = this;
			setTimeout(function(){
				self._animate();
			}, this._interval);
		}
	},
	move:function(x,y){
		this.$ball.css({left:x, top:y});
		this._position = {x:x, y:y};
	},
	interval:function(i){
		if(i !== undefined){
			this._interval = (this._interval < 10 ? 10 : i);
		} else {
			return this._interval;
		}
	},
	getPosition:function(){
		return this._position;
	},
	remove:function(){
		this._timer = false;
		this.$ball.remove();

		// delete me!
		var jBBalls = jBreak.balls;
		for(var i = jBBalls.length;i--;){
			if(jBBalls[i] === this)
				return jBBalls.remove(i);
		}

		//console.log('Ball lost. Removed %o from jBreak field!', this);
	},
	pause:function(){
		if(this._timer){
			this._timer = false;
			this._toggleTimers(false);
		} else {
			this._timer = true;
			this._toggleTimers(true);
			this._animate();
		}
	},
	pierce:function(pierce){
		this._pierce = pierce;

		this.$ball.css('background-image', (pierce
			? 'url(images/ball1-88.png)'
			: 'url(images/ball4-88.png)'
		));
	},
	clone:function(){
		var jB = jBreak,
		    ball = $.extend(true, {}, this);

		ball = $.extend(true, ball, {
			$ball:this.$ball.clone()
		});

		jB.balls.push(ball);

		jB.$field.append(ball.$ball);

		return ball;
	},
	addTimer:function(name, timer){
		this._timers[name] = timer;
	},
	deleteTimer:function(name){
		delete this._timers[name];
	},
	// private variables
	_ballID:null,
	_speed:null,
	_angle:-90,
	_position:null,
	_timer:null,
	_interval:30,
	_size:null,
	_pierce:false,
	_ready:false, // ready to start?
	_timers:null,
	_timersID:null,
	// public variables
	$ball:null
};

jBreak.bonus.prototype = {
	_init:function(jBBall,x,y,angle){
		var random, background, powerup, jB = jBreak;

		jB.bonuses.push(this);

		// 50% chance to get a bad or a good powerup
		if(Math.floor(Math.random()+.5)){
			random = Math.floor(Math.random() * this._good.length);
			powerup = this._good[random];
			//console.log('Spawning "good" %o -> %d', this, random); 
		} else {
			random = Math.floor(Math.random() * this._bad.length);
			powerup = this._bad[random];
			//console.log('Spawning "bad" %o -> %d', this, random); 
		}
		this._action = powerup.action;

		var $bonus = $('<div class="jBreakBonus"/>');

		jB.$field.append($bonus);

		this._ball = jBBall;
		
		this._position = {x:x,y:y};
		this._speed = {
			x:null,
			y:null
		};

		$bonus.css({
			left:x,
			top:y,
			position:'absolute',
			width:'24px',
			height:'24px',
			background:powerup.background
		});

		this.$bonus = $bonus;
		this.setAngle(angle);
		this._timer = true;
		this._animate();
	},
	setAngle:function(angle){
		if(angle !== undefined)
			this._angle = angle;

		var speed = this._angle / 360 * Math.PI;
		this._speed.x = Math.cos(speed);
		this._speed.y = Math.sin(speed);
	},
	_hitCheck:function(x,y){
		var jB = jBreak;
		// only run checks if a paddle could be hit
		if(y >= jB.fieldSize.height - 32 || y <=  24 || x <=  24 || x >= jB.fieldSize.width - 32){
			for(var i = jB.paddles.length;i--;){
				var jBPaddle = jB.paddles[i],
				    paddleMissed,
				    paddleHit,
				    angle,
				    jBPaddlePosition = jBPaddle.getPosition(),
				    jBPaddleSize = jBPaddle.size();

				switch(jBPaddlePosition.relative){
					default:
					case 'bottom':
						paddleHit = this._speed.y > 0
						         && y <= jB.fieldSize.height - 8
						         && x >= jBPaddlePosition.x - 24
						         && Math.ceil(y) >= jBPaddlePosition.y - 24
						         && x <= jBPaddlePosition.x + jBPaddleSize.width;

						paddleMissed = y > jB.fieldSize.height + 2;

						if(paddleHit){
							this._paddle = jBPaddle;
							return this._powerUpPaddle();
						}
						break;
					case 'top':
						paddleHit = this._speed.y < 0
						         && y >= 4
						         && x >= jBPaddlePosition.x + 24
						         && Math.ceil(y) <= jBPaddlePosition.y + 24
						         && x <= jBPaddlePosition.x + jBPaddleSize.width;

						paddleMissed = y < -10;

						if(paddleHit){
							this._paddle = jBPaddle;
							return this._powerUpPaddle();
						}
						break;
					case 'left':
						paddleHit = this._speed.x < 0 
						         && x >= 4
						         && y >= jBPaddlePosition.y + 24
						         && Math.ceil(x) <= jBPaddlePosition.x + 24
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x < -10;

						if(paddleHit){
							this._paddle = jBPaddle;
							return this._powerUpPaddle();
						}
						break;
					case 'right':
						paddleHit = this._speed.x > 0
						         && y >= jBPaddlePosition.y - 24
						         && x <= jB.fieldSize.width - 8
						         && Math.ceil(x) >= jBPaddlePosition.x - 24
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x > jB.fieldSize.width + 2;

						if(paddleHit){
							this._paddle = jBPaddle;
							return this._powerUpPaddle();
						}
						break;
				}

				if(paddleMissed){
					this.remove();
				}
			}
		}
	},
	_powerUpPaddle:function(jBPaddle){
		jBreak.playSound('sound/pling1s.ogg');

		this._action(jBPaddle);
		this.remove();
	},
	_animate:function(){
		var x = this._position.x + this._speed.x*4;
		var y = this._position.y + this._speed.y*4;

		this.move(x,y);
		this._hitCheck(x,y);

		if(this._timer){
			// setTimeout(this._animate, 15) kills the "this" reference :(
			var self = this;
			setTimeout(function(){
				self._animate();
			}, this._interval);
		}
	},
	move:function(x,y){
		this.$bonus.css({left:x, top:y});
		this._position = {x:x,y:y};
	},
	pause:function(){
		if(this._timer){
			this._timer = false;
		} else {
			this._timer = true;
			this._animate();
		}
	},
	remove:function(){
		this._timer = false;
		this.$bonus.fadeOut('slow', function(){
			$(this).remove();
		});

		var jBBonuses = jBreak.bonuses;
		for(var i = jBBonuses.length;i--;){
			if(jBBonuses[i] === this)
				return jBBonuses.remove(i);
		}
	},
	$bonus:null,
	_direction:null,
	_position:null,
	_speed:null,
	_timer:false,
	_interval:30,
	_angle:180,
	_ball:null, // the ball who triggered this bonus
	_paddle:null, // the paddle which caught this bonus
	_action:null, // will hold the function to be executed
	_bad:[
		{ // shrink paddle
			background:'url(images/bonuses/shrink.png)',
			action:function(){
				this._paddle.shrink();
			}
		},{ // ball speedup for 15 seconds
			background:'url(images/bonuses/15+speed.png)',
			action:function(){
				var ball = this._ball;

				ball.oldInterval = (ball.oldInterval
					? ball.oldInterval
					: ball.interval());

				ball.addTimer('speedUp15', {
					action:function(){
						this.interval(ball.oldInterval);
						this.oldInterval = false;
					},
					timeout:15
				});

				ball.interval(10);
			}
		},{ // permanent interval reduction
			background:'url(images/bonuses/faster.png)',
			action:function(){
				var ball = this._ball;

				ball.oldInterval -= 5;
				ball.interval(ball.interval() - 5);
			}
		},{ // pulsate paddle
			background:'blue',
			action:function(){
				this._paddle.$paddle.effect('pulsate', {times:10}, 3000);
			}
		}
	],
	_good:[
		{ // grow paddle
			background:'url(images/bonuses/grow.png)',
			action:function(){
				this._paddle.grow();
			}
		},{ // slow down ball
			background:'url(images/bonuses/slower.png)',
			action:function(){
				var ball = this._ball;
				ball.deleteTimer('speedUp15');

				if(ball.interval() < 25){
					ball.interval(25);
				}
			}
		},{ // +1 life
			background:'url(images/bonuses/life.png)',
			action:function(){
				jBreak.lives(jBreak.lives()+1);
			}
		},{ // piercing ball
			background:'url(images/bonuses/powerball.png)',
			action:function(){
				var ball = this._ball;
				
				ball.pierce(true);
				ball.addTimer('pierce', {
					action:function(){
						this.pierce(false);
					},
					timeout:7.5
				});
			}
		},{ // split triggering ball
			background:'url(images/bonuses/multiball.png)',
			action:function(){
				this._ball.clone().start();
			}
		}
	]
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to){
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

// Cookie functions from quirksmode.org
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

$(function(){
	jBreak.start(true);
});

})(jQuery);
