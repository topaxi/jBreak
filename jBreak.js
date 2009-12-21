(function($){

var jBreak = {
	start:function(initial){
		var $jBreak = $('#jBreak').empty();
		this.$field = $('<div id="jBreakField"/>');
		$jBreak.append(this.$field);

		this.paddles = [];
		this.balls = {};

		this.fieldSize = {
			width:this.$field.width(),
			height:this.$field.height()
		};

		this.lives(this._lives);

		if(initial){
			this._cacheImages();
			this.options.showOptions();
			this._setLevelTitle('jBreak 0.1.6');
		}
		//console.log('Playing field initialized -> %o', this);
	},
	_cacheImages:function(){
		var cache = this._imageCache;

		cache.paddle = [];
		var paddleImages = [
			'pad32x8',
			'pad48x8',
			'pad64x8',
			'pad80x8',
			'pad96x8'
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
	playSound:function(soundFile){
		if(typeof Audio === 'undefined') return;
		var audio = new Audio(soundFile);
		audio.volume = this._volume/100;
		audio.play();
	},
	addBall:function(jBPaddle){
		var ballID = this.countBalls();
		var ball = new jBreak.ball(ballID);
		this.balls[ballID] = ball;
		
		if(jBPaddle !== undefined)
			jBPaddle.connectBall(ballID);

		return ball;
	},
	addPaddle:function(position){
		var jBPaddle = new jBreak.paddle(position);
		this.paddles.push(jBPaddle);
		return jBPaddle;
	},
	createPaddles:function(){
		var self = this;
		this.$field.bind('click.jBreakCreatePaddles', function(e){
			e.stopPropagation(); // do not bubble
			//console.log('Creating paddles...');
			$('#jBreak').css('cursor',
				'url(images/cursor/cursor.gif), url(images/cursor/cursor.ico), none');

			self.paddles.forEach(function(jBPaddle){
				jBPaddle.start();

				var jBPaddlePosition = jBPaddle.getPosition(),
				    fieldOffset = self.$field.offset();

				var position = (
					jBPaddlePosition.relative === 'top' ||
					jBPaddlePosition.relative === 'bottom'
						? e.pageX - fieldOffset.left
						: e.pageY - fieldOffset.top);

				jBPaddle.move(jBPaddlePosition.relative, position);
			});

			self.$field.bind('click.jBreakLaunchPaddleBalls', function(){
				self.paddles.forEach(function(jBPaddle){
					jBPaddle.startBalls();
				});
			});
			self.$field.unbind('click.jBreakCreatePaddles');

			$(document).unbind('.jBreakPause');
			$(document).bind('keydown.jBreakPause', function(e){
				if(e.keyCode === 32){
					// @todo stop paddle movement too and unpause only by clicking a paddle
					for(var jBBall in self.balls){
						self.balls[jBBall].pause();
					}
				}
			});

			//console.log('Paddles created');
		});
	},
	destroyField:function(){
		this.$field.unbind('mousemove');
	},
	blockChecker:function(){
		var blockVal = 0,
		    blocks   = this.blocks;

		for(var y = blocks.length;y--;){
			for(var x = blocks[y].length;x--;){
				blockVal += blocks[y][x];
			}
		}

		if(blockVal === 0){
			for(var ball in this.balls){
				this.balls[ball].remove();
			}

			var paddles = this.paddles;
			for(var i = paddles.length;i--;){
				paddles[i].$paddle.remove();
				paddles[i].remove();
			}

			this.destroyField();
			this._levelID += 1;
			this.start(false);
			this.loadLevel(this._levelID);
			this.createPaddles();
		}
	},
	countBalls:function(){
		var i = 0;
		for(var ball in this.balls)
			i++;
		
		return i;
	},
	ballChecker:function(jBPaddle){
		//console.log('Checking remaining balls...');
		if(this.countBalls() === 0){
			var lives = this._lives;
			if(lives > 0){
				this.lives(lives-1);
				this.addBall(jBPaddle);
				jBPaddle.setSize(64); // reset size
			} else {
			//console.log('No remaining balls found... FAIL!')
				var self = this;

				this.destroyField();
				this.$field.find('.jBreakPaddle').effect('puff', {}, 750);
				this.$blocks.find('div').effect('drop', {direction:'down'}, 750);

				setTimeout(function(){
					self.paddles.forEach(function(jBPaddle){
						jBPaddle.$paddle.remove();
						jBPaddle.remove();
					});
					self.paddles = [];
					self.$blocks.remove();

					var $fail = $('<div class="fail" style="display:none">FAIL!</div>');
					$('#jBreak').css({cursor:'default'});
					self.$field.append($fail);
					var failOffset = $fail.offset();

					$fail.css({
						top:self.$field.height()/2 - $fail.height()/2 + 'px'
					}).fadeIn('slow', function(){
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

			level.paddles.forEach(function(jBPaddle){
				var paddle = self.addPaddle(jBPaddle.position);
				if(jBPaddle.ball)
					self.addBall(paddle);
			});
		}, 250);
	},
	_drawBlocks:function(level){
		if(this._imageCache.blocks === undefined){
			this._imageCache.blocks = {};
		}

		this.$blocks = $('<div style="position:absolute;left:0;top:0;display:none"/>');
		this.blocks.forEach(function(horizontalBlocks, y){
			horizontalBlocks.forEach(function(block, x){
				if(block !== 0){
					var $block = $('<div/>');
					$block.addClass('jBreakBlock x'+x+' y'+y);

					var random = Math.ceil(Math.random()*10);
					random = (random < 10 ? '0'+random : random);

					// @todo create one a sprite image for each block theme to reduce http requests
					$block.css({
						left:x*40,
						top:y*16,
						background:
							'transparent url(images/blocks/'+block.theme+'/'+random+'.png) scroll no-repeat'});
					// prefetch hit block image
					if(this._imageCache.blocks[block.theme+random] === undefined){
						this._imageCache.blocks[block.theme+random] = $('<img src="images/blocks/'+block.theme+'/'+random+'_h.png"/>');
					}

					this.$blocks.append($block);
					this.blocks[y][x] = block.value;
				}
			}, this);
		}, this);

		this.$field.append(this.$blocks);
		this.$blocks.fadeIn('slow');
	},
	// public variables
	$field:null,
	$blocks:null,
	fieldSize:null,
	paddles:null,
	balls:null,
	blocks:null,
	// private variables
	_imageCache:{},
	_lives:3,
	_volume:70,
	_levelID:0,
	// objects
	options:{
		showOptions:function(){
			this.$options = $('<div class="optionsContainer"/>');
			this.$options.css({
				position:'absolute' // @todo remove this
			});

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
			this.$optionTabs.append('<div id="tabs-3" style="text-align:center;height:220px"><p>jBreak 0.1.6</p><p style="font-size:11px">Written by Damian Senn<br /><br />Graphics and Sounds<br />by <a href="http://www.helleresonnen.com/">Jan Neversil</a><br /><br />Music (coming soon)<br />by <a href="http://www.alphatronic.net/">Dani Whiler</a></p></div>');

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
			$soundVolumeControl.css({
				fontSize:'11px'
			});
			$soundVolumeSlider.css({width:'170px',marginBottom:'8px'});
			$soundVolumeSlider.slider({
				animate:true,
				value:70,
				range:'min',
				min:0,
				max:100,
				slide:function(e, ui){
					jBreak._volume = ui.value;
					$('#soundVolume').text(ui.value+'%');
					jBreak.playSound('sound/pling1s.ogg');
				}
			});
			$soundVolumeControl.append($soundVolumeSlider);
			$soundVolumeControl.prepend('<p style="margin:0">Sound volume: <span id="soundVolume" style="float:right">70%</span></p>');
			$soundOptions.append($soundVolumeControl);

			var $musicVolumeControl = $('<div/>');
			var $musicVolumeSlider = $('<div/>');
			$musicVolumeControl.css({
				fontSize:'11px'
			});
			$musicVolumeSlider.css({width:'170px'});
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
	},
	paddle:function(position){
		// this references to the jBreak.paddle object!
		this.init(position);
	},
	ball:function(ballID, position){
		// this references to the jBreak.ball object!
		this.init(ballID, position);
	},
	bonus:function(jBBall,x,y,angle){
		// this references to the jBreak.bonus object!
		this.init(jBBall,x,y,angle);
	}
};

jBreak.paddle.prototype = {
	init:function(position){
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
		this.setSize(size.width > size.height
			? size.width  + 16
			: size.height + 16);
	},
	shrink:function(){
		var size = this._size;
		this.setSize(size.width > size.height
			? size.width  - 16
			: size.height - 16);
	},
	setSize:function(size){
		if(size > 96 || size < 32)
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

			self.move(relativePosition, newPosition);
		});
	},
	connectBall:function(ballID){
		var x,y,effectDirection,jBBall = jBreak.balls[ballID];

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
			var ball = jBreak.balls[ballID],
			    position = ball.getPosition();

			ball.move(position.x,position.y);
			ball.ready(true);
		});
		this._balls.push(ballID);

		//console.log('Ball %d connected to %o and moved to %d,%d', ballID, this, x, y);
	},
	startBalls:function(){
		var balls = jBreak.balls;
		for(var i = this._balls.length;i--;){
			var ball = balls[i];

			if(ball.ready()){
				ball.start();
				this._balls.remove(i);
			}
		}
	},
	move:function(relativePosition, position){
		var jB = jBreak,
		    jBFieldSize = jB.fieldSize,
		    jBBalls = jB.balls;

		if(relativePosition === 'top' || relativePosition === 'bottom'){
			var x = position;
			x -= this._size.width / 2;

			if(x < 0){
				x = 0;
			} else if(x > jBFieldSize.width - this._size.width){
				x = jBFieldSize.width - this._size.width;
			}

			for(var i = this._balls.length;i--;){
				var ball = jBBalls[i],
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
			this.$paddle.css({left:x});
		} else {
			var y = position;
			y -= this._size.height / 2;

			if(y < 0){
				y = 0;
			} else if(y > jBFieldSize.height - this._size.height){
				y = jBFieldSize.height - this._size.height;
			}

			for(var i = this._balls.length;i--;){
				var ball  = jBBalls[i],
				    ballY = y
				          + this._size.height / 2
				          - ball.$ball.height() / 2;

				ball.move(
					ball.getPosition().x,
					ballY);
			}

			this._position.y = y;
			this.$paddle.css({top:y});
		}
	},
	remove:function(){
		jBreak.paddles.forEach(function(jBPaddle, i, self){
			if(jBPaddle._position.relative === this._position.relative){
				self.remove(i);
			}
		}, this);

		this._balls.forEach(function(i){
			// do not use remove() here and remove the method from the Array object
			this.balls[i].remove();
		}, jBreak);

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
	// public variables
	$paddle:null
};

jBreak.ball.prototype = {
	init:function(ballID, position){
		// remember which instance we are
		this._ballID = ballID;
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
	},
	start:function(){
		if(this._ready){
			this.setAngle();
			this._timer = true;
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
				if(jB.blocks[blockY][blockX] > 0){
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

					var hitImage = $block.css('background-image')
						.replace(/\/(.*)\.png/g, '/$1_h.png');

					var rand = Math.random();
					if(jB.blocks[blockY][blockX] > 1 && !this._pierce){
						if(rand < .04)
							new jB.bonus(this,x,y,180); // spawn bonus

						var oldImage = $block.css('background-image');
						$block.css({
							opacity:1-1/jB.blocks[blockY][blockX],
							backgroundImage:hitImage
						});
						jB.blocks[blockY][blockX] -= 1;

						setTimeout(function(){
							$block.css('background-image', oldImage);
						}, 100);
					} else {
						if(rand < .08)
							new jB.bonus(this,x,y,180); // spawn bonus

						$block.css('background-image', hitImage);
						$block.effect('drop', {direction:direction}, 'fast', function(){
							$block.remove();
						});
						jB.blocks[blockY][blockX] = 0;
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
				    jBPaddlePosition = jBPaddle.getPosition();

				switch(jBPaddlePosition.relative){
					default:
					case 'bottom':
						paddle.bottom = true;

						paddleHit = this._speed.y > 0
						         && y <= jB.fieldSize.height - 8
						         && x >= jBPaddlePosition.x - this._size.width
						         && Math.ceil(y) >= jBPaddlePosition.y - this._size.height
						         && x <= jBPaddlePosition.x + jBPaddle.$paddle.width();

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
						         && x <= jBPaddlePosition.x + jBPaddle.$paddle.width();

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
						         && y <= jBPaddlePosition.y + jBPaddle.$paddle.height();

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
						         && y <= jBPaddlePosition.y + jBPaddle.$paddle.height();

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
		delete jBreak.balls[this._ballID];
		//console.log('Ball lost. Removed %o from jBreak field!', this);
		//delete this;
	},
	pause:function(){
		if(this._timer){
			this._timer = false;
		} else {
			this._timer = true;
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
		    ball = $.extend(true, {}, this),
		    ballID = jB.countBalls();

		ball = $.extend(true, ball, {
			_ballID:ballID,
			$ball:this.$ball.clone()
		});

		jB.balls[ballID] = ball;

		jBreak.$field.append(ball.$ball);

		return ball;
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
	// public variables
	$ball:null
};

jBreak.bonus.prototype = {
	init:function(jBBall,x,y,angle){
		var random, background, powerup;

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

		jBreak.$field.append($bonus);

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
			backgroundImage:powerup.background
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
				    jBPaddlePosition = jBPaddle.getPosition();

				switch(jBPaddlePosition.relative){
					default:
					case 'bottom':
						paddleHit = this._speed.y > 0
						         && y <= jB.fieldSize.height - 8
						         && x >= jBPaddlePosition.x - 24
						         && Math.ceil(y) >= jBPaddlePosition.y - 24
						         && x <= jBPaddlePosition.x + jBPaddle.$paddle.width();

						paddleMissed = y > jB.fieldSize.height + 2;

						if(paddleHit){
							return this._powerUpPaddle(jBPaddle);
						}
						break;
					case 'top':
						paddleHit = this._speed.y < 0
						         && y >= 4
						         && x >= jBPaddlePosition.x + 24
						         && Math.ceil(y) <= jBPaddlePosition.y + 24
						         && x <= jBPaddlePosition.x + jBPaddle.$paddle.width();

						paddleMissed = y < -10;

						if(paddleHit){
							return this._powerUpPaddle(jBPaddle);
						}
						break;
					case 'left':
						paddleHit = this._speed.x < 0 
						         && x >= 4
						         && y >= jBPaddlePosition.y + 24
						         && Math.ceil(x) <= jBPaddlePosition.x + 24
						         && y <= jBPaddlePosition.y + jBPaddle.$paddle.height();

						paddleMissed = x < -10;

						if(paddleHit){
							return this._powerUpPaddle(jBPaddle);
						}
						break;
					case 'right':
						paddleHit = this._speed.x > 0
						         && y >= jBPaddlePosition.y - 24
						         && x <= jB.fieldSize.width - 8
						         && Math.ceil(x) >= jBPaddlePosition.x - 24
						         && y <= jBPaddlePosition.y + jBPaddle.$paddle.height();

						paddleMissed = x > jB.fieldSize.width + 2;

						if(paddleHit){
							return this._powerUpPaddle(jBPaddle);
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
	remove:function(){
		this._timer = false;
		this.$bonus.fadeOut('slow', function(){
			$(this).remove();
		});
	},
	$bonus:null,
	_direction:null,
	_position:null,
	_speed:null,
	_timer:false,
	_interval:30,
	_angle:180,
	_ball:null, // the ball who triggered this bonus
	_action:null, // will hold the function to be executed
	_bad:[
		{ // shrink paddle
			background:'url(images/bonuses/shrink.png)',
			action:function(jBPaddle){
				jBPaddle.shrink();
			}
		},{ // ball speedup for 15 seconds
			background:'url(images/bonuses/15+speed.png)',
			action:function(){
				var ball = this._ball;

				ball.oldInterval = (ball.oldInterval
					? ball.oldInterval
					: ball.interval());

				// clear previous 
				clearTimeout(ball.speedBonusTimeoutID);
				ball.speedBonusTimeoutID = setTimeout(function(){
					ball.interval(ball.oldInterval);
					ball.oldInterval = false;
				}, 15000);

				ball.interval(10);
			}
		},{ // permanent interval reduction
			background:'url(images/bonuses/faster.png)',
			action:function(){
				var ball = this._ball;

				ball.oldInterval -= 5;
				ball.interval(ball.interval() - 5);
			}
		}
	],
	_good:[
		{ // grow paddle
			background:'url(images/bonuses/grow.png)',
			action:function(jBPaddle){
				jBPaddle.grow();
			}
		},{ // slow down ball
			background:'url(images/bonuses/slower.png)',
			action:function(){
				var ball = this._ball;
				clearTimeout(ball.speedBonusTimeoutID);

				if(ball.interval() < 25){
					ball.interval(25);
				}
			}
		},{ // +1 life
			background:'url(images/bonuses/life.png)',
			action:function(){
				jBreak.lives(jBreak.lives()+1);
			},
		},{ // piercing ball
			background:'url(images/bonuses/powerball.png)',
			action:function(){
				var ball = this._ball;
				
				clearTimeout(ball.pierceBonusTimeoutID);
				ball.pierce(true);
				ball.pierceBonusTimeoutID = setTimeout(function(){
					ball.pierce(false);
				}, 7500);
			}
		},{ // split triggering ball
			background:'url(images/bonuses/multiball.png',
			action:function(){
				this._ball.clone().start();
			}
		}
	]
};

// method to remove array indices
Array.prototype.remove = function(from, to){
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

/* Implement forEach for non SpiderMonkey browsers.
 * Implemented in: JavaScript 1.6 (Gecko 1.8b2 and later)
 *
 * Syntax: array.forEach(callback(value, index, array)[, thisObject]);
 */
if(!Array.prototype.forEach){
	Array.prototype.forEach = function(fun /*, thisp*/){
		var len = this.length >>> 0;
		if(typeof fun != "function")
			throw new TypeError();

		var thisp = arguments[1];
		for(var i = 0;i < len;i++){
			if(i in this)
				fun.call(thisp, this[i], i, this);
		}
	};
}

$(function(){
	jBreak.start(true);
});

})(jQuery);
