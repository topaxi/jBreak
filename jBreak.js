;(function($){

jBreak = {
	// methods
	start:function(showOptions){
		var $jBreak = $('#jBreak').empty();
		this.$field = $('<div id="jBreakField"/>');
		$jBreak.append(this.$field);

		this.paddles = [];
		this.balls = {};

		this.fieldSize = {
			width:this.$field.width(),
			height:this.$field.height()
		};

		if(showOptions){
			this.options.showOptions();
		}
		//console.log('Playing field initialized -> %o', this);
	},
	playSound:function(soundFile){
		if(!Audio) return; // return if Audio is undefined
		var audio = new Audio(soundFile);
		audio.volume = this._volume/100;
		audio.play();
	},
	addBall:function(paddleID){
		var ballID = (this.balls.length == undefined ? 0 : this.balls.length+1);
		this.balls[ballID] = new jBreak.ball(ballID);
		this.paddles[paddleID].connectBall(ballID);

		return ballID;
	},
	addPaddle:function(position){
		this.paddles.push(new jBreak.paddle(position));
		return this.paddles.length-1;
	},
	createPaddles:function(){
		var self = this;
		setTimeout(function(){
			self.$field.bind('click.jBreakCreatePaddles', function(e){
				e.stopPropagation(); // do not bubble
				//console.log('Creating paddles...');
				$('#jBreak').css({cursor:'none'});

				self.paddles.forEach(function(jBPaddle){
					jBPaddle.start();
					var position = (
						jBPaddle.position.relative == 'top' ||
						jBPaddle.position.relative == 'bottom'
							? e.pageX - this.offsetLeft
							: e.pageY - this.offsetTop);

					jBPaddle.move(jBPaddle.position.relative, position);
				}, this);

				self.$field.bind('click.jBreakLaunchPaddleBalls',function(){
					self.paddles.forEach(function(jBPaddle){
						jBPaddle.startBalls();
					});
					self.$field.unbind('click.jBreakLaunchPaddleBalls');
				});
				self.$field.unbind('click.jBreakCreatePaddles');

				$(document).unbind('.jBreakPause');
				$(document).bind('keydown.jBreakPause', function(e){
					if(e.keyCode == 32){
						for(jBBall in self.balls){
							self.balls[jBBall].pause();
						}
					}
				});

				//console.log('Paddles created');
			});
		}, 1000);
	},
	destroyField:function(){
		this.$field.unbind('mousemove');
	},
	blockChecker:function(){
		var i=0;
		this.blocks.forEach(function(horizontalBlocks, y){
			horizontalBlocks.forEach(function(block, x){
				i += block;
			}, this);
		}, this);

		if(i == 0){
			for(ball in this.balls){
				this.balls[ball].remove();
			}

			this.paddles.forEach(function(jBPaddle){
				jBPaddle.$paddle.remove();
				jBPaddle.remove();
			});

			this.destroyField();
			this._levelID += 1;
			this.start(false);
			this.loadLevel(this._levelID);
			this.createPaddles();
		}
	},
	ballChecker:function(){
		//console.log('Checking remaining balls...');
		var i = 0;
		for(ball in this.balls)
			i++;

		if(i == 0){
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
						self.start(true); // restart game
					});
				});
			}, 1000);
		} else {
			//console.log('%d remaining balls found.', i)
		}
	},
	loadLevel:function(levelID){
		var colorSchemes = [
			'Blue', 'Blue_purpled', 'Gray', 'Green_greener', 'Green_Yellowish_Light',
			'Orange', 'Purple_bluish', 'Purple_gay', 'Purple_haze', 'Red_fire',
			'Turkoise_2', 'Turkoise_3', 'Turkoise_greenisch', 'Yellow'
		];
		if(typeof levelID == 'undefined'){
			levelID = 0;
		}
		var level;
		$.ajax({
			url:'getLevel.php',
			method:'get',
			data:{levelID:levelID},
			dataType:'json',
			async:false,
			success:function(data, textStatus){
				level = data.message;
			}
		});
		this.blocks = level.blocks;
		this._drawBlocks(level);

		var self = this;
		setTimeout(function(){
			self.createPaddles();

			level.paddles.forEach(function(jBPaddle){
				var paddleID = self.addPaddle(jBPaddle.position);
				if(jBPaddle.ball)
					self.addBall(paddleID);
			});
		}, 250);
	},
	_drawBlocks:function(level){
		this.$blocks = $('<div style="position:absolute;left:0;top:0;display:none"/>');
		this.blocks.forEach(function(horizontalBlocks, y){
			horizontalBlocks.forEach(function(block, x){
				if(block !== 0){
					var $block = $('<div/>');
					$block.addClass('jBreakBlock');
					$block.addClass('x'+x);
					$block.addClass('y'+y);
					var random = Math.ceil(Math.random()*10);
					random = (random < 10 ? '0'+random : random);

					// @todo create one a sprite image for each block theme to reduce http requests
					$block.css({
						left:x*64,
						top:y*16,
						background:'transparent url(images/blocks/'+block.theme+'/'+random+'.png) scroll no-repeat'});
					// prefetch hit block image
					$('<img src="images/blocks/'+block.theme+'/'+random+'_h.png"/>').remove();
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
			this.$optionTabs.append('<div id="tabs-3" style="text-align:center;height:220px"><p>jBreak 0.1.2</p><p style="font-size:11px">Written by Damian Senn<br /><br />Graphics and Sounds<br />by <a href="http://www.helleresonnen.com/">Jan Neversil</a><br /><br />Music (coming soon)<br />by <a href="http://www.alphatronic.net/">Dani Whiler</a></p></div>');

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
				jBreak.createPaddles();
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
	}
};

jBreak.paddle.prototype = {
	// methods
	init:function(position){
		//console.log('Create %s paddle..', position);
		this.$paddle = $('<div class="jBreakPaddle"/>');

		this.position = {
			x:null,
			y:null,
			relative:position
		}

		this.balls = [];
		this.position = {};

		switch(position){
			default:
			case 'bottom':
				this.$paddle.addClass('bottom');
				this.position.y = jBreak.fieldSize.height - 8;
				this.position.x = jBreak.fieldSize.width / 2 - 32;
				break;
			case 'top':
				this.$paddle.addClass('top');
				this.position.y = 0;
				this.position.x = jBreak.fieldSize.width / 2 - 32;
				break;
			case 'left':
				this.$paddle.addClass('left');
				this.position.y = jBreak.fieldSize.height / 2 - 32;
				this.position.x = 0;
				break;
			case 'right':
				this.$paddle.addClass('right');
				this.position.y = jBreak.fieldSize.height / 2 - 32;
				this.position.x = jBreak.fieldSize.width - 8;
				break;
		}

		jBreak.$field.append(this.$paddle);

		this._size = {
			width:this.$paddle.width(),
			height:this.$paddle.height()
		};

		this.position['relative'] = position;
		this.$paddle.css({left:this.position.x,top:this.position.y});
		//console.log('%s paddle created and moved to initial position -> %o', position, this);
	},
	start:function(){
		var self = this;

		$(document)./*jBreak.$field.*/mousemove(function(e){
			var fieldOffset = jBreak.$field.offset();
			var position = (self.position.relative == 'top' || self.position.relative ==  'bottom'
			             ? e.pageX - fieldOffset.left
			             : e.pageY - fieldOffset.top);

			self.move(self.position.relative, position);
		});
	},
	connectBall:function(ballID){
		switch(this.position['relative']){
			case 'top':
				var x = this.position.x
				      + this._size.width / 2
				      - jBreak.balls[ballID].$ball.width() / 2;

				var y = this.position.y
				      + this._size.height / 2
				      + jBreak.balls[ballID].$ball.height() / 2;

				jBreak.balls[ballID].setAngle(90);
				var effectDirection = 'down';
				break;
			case 'right':
				var x = this.position.x
				      - jBreak.balls[ballID].$ball.width();

				var y = this.position.y
				      + this._size.height / 2
				      - jBreak.balls[ballID].$ball.width() / 2;

				jBreak.balls[ballID].setAngle(90);
				var effectDirection = 'left';
				break;
			default:
			case 'bottom':
				var x = this.position.x
				      + this._size.width / 2
				      - jBreak.balls[ballID].$ball.width() / 2;

				var y = this.position.y
				      - this._size.height / 2
				      - jBreak.balls[ballID].$ball.height() / 2;
				jBreak.balls[ballID].setAngle(-90);
				var effectDirection = 'up';
				break;
			case 'left':
				var x = this.position.x
				      + jBreak.balls[ballID].$ball.width();

				var y = this.position.y
				      + this._size.height / 2
				      - jBreak.balls[ballID].$ball.width() / 2;
				jBreak.balls[ballID].setAngle(-90);
				var effectDirection = 'right';
				break;
		}

		jBreak.balls[ballID].move(x,y);
		jBreak.balls[ballID].$ball.show('bounce', {direction:effectDirection,distance:40,times:5});
		this.balls.push(ballID);

		//console.log('Ball %d connected to %o and moved to %d,%d', ballID, this, x, y);
	},
	startBalls:function(){
		this.balls.forEach(function(i){
			jBreak.balls[i].start();
		}, this);
		// flush balls
		this.balls = [];
	},
	move:function(relativePosition, position){
		if(relativePosition == 'top' || relativePosition == 'bottom'){
			var x = position;
			x -= this._size.width / 2;

			if(x < 0){
				x = 0;
			} else if(x > jBreak.fieldSize.width - this._size.width){
				x = jBreak.fieldSize.width - this._size.width;
			}

			this.balls.forEach(function(i){
				var ballX = x
				          + this._size.width / 2
				          - jBreak.balls[i].$ball.width() / 2;

				jBreak.balls[i].move(
					ballX,
					jBreak.balls[i].position.y);
			}, this);

			this.position.x = x;
			this.$paddle.css({left:x});
		} else {
			var y = position;
			y -= this._size.height / 2;

			if(y < 0){
				y = 0;
			} else if(y > jBreak.fieldSize.height - this._size.height){
				y = jBreak.fieldSize.height - this._size.height;
			}

			this.balls.forEach(function(i){
				var ballY = y
				          + this._size.height / 2
				          - jBreak.balls[i].$ball.height() / 2;

				jBreak.balls[i].move(
					jBreak.balls[i].position.x,
					ballY);
			}, this);

			this.position.y = y;
			this.$paddle.css({top:y});
		}
	},
	remove:function(){
		jBreak.paddles.forEach(function(jBPaddle, i, self){
			if(jBPaddle.position.relative == this.position.relative){
				self.remove(i);
			}
		}, this);

		this.balls.forEach(function(i){
			this.balls[i].remove();
		}, jBreak);

		this.$paddle.remove();
		//delete this;
	},
	// private variables
	_size:null,
	// public variables @todo these should be private too
	position:null, //@todo getter
	$paddle:null,
	balls:null
};

jBreak.ball.prototype = {
	// methods
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

		this.position = position;
		this._speed = {
			x:null,
			y:null
		};
	},
	start:function(){
		this.setAngle();
		this._timer = true;
		this._animate();
	},
	setAngle:function(angle){
		if(angle != undefined)
			this._angle = angle;

		var speed = this._angle / 360 * Math.PI;
		this._speed.x = Math.cos(speed);
		this._speed.y = Math.sin(speed);
	},
	_hitCheck:function(x,y){
		var paddle = {
			top:false,
			right:false,
			bottom:false,
			left:false
		}

		// only run checks if a block could be hit
		if(y <= jBreak.fieldSize.height || y >= 0 || x >= 0 || x <= jBreak.fieldSize.width){
			if(this._speed.y > 0){
				var ballY = y+this._size.height;
			} else {
				var ballY = y;
			}

			if(this._speed.x > 0){
				var ballX = x+this._size.width;
			} else {
				var ballX = x;
			}
			var blockX = Math.floor(ballX / 64);
			var blockY = Math.floor(ballY / 16);

			var blockExists = jBreak.blocks[blockY] != undefined
			               && jBreak.blocks[blockY][blockX] != undefined

			if(blockExists){
				if(jBreak.blocks[blockY][blockX] > 0){
					jBreak.playSound('sound/pling1s.ogg');
					ballX = Math.floor(ballX);
					ballY = Math.floor(ballY);

					var hHit = (ballX % 64 <= 63 && ballX % 64 >= 61 && this._speed.x < 0)
					        || (ballX % 64 <=  2 && this._speed.x > 0);
					var vHit = (ballY % 16 <= 15 && ballY % 16 >= 13 && this._speed.y < 0)
					        || (ballY % 16 <=  2 && this._speed.y > 0);

					if(vHit && hHit) // don't mirror both speeds, mirror the slower one
						(this._speed.y > this._speed.x ? hHit = false : vHit = false);

					if(vHit || !hHit) // workaround, a hit must occur here...
						this._speed.y *= -1;

					if(hHit)
						this._speed.x *= -1;

					//console.log('I hit %d,%d', blockX,blockY);
					var $block = $('.x'+blockX+'.y'+blockY);
					var direction = (vHit && this._speed.y > 0 ? 'up'    : (
					                 hHit && this._speed.x > 0 ? 'left'  : (
					                 hHit && this._speed.x < 0 ? 'right' :
					               /*vHit && this._speed.y < 0*/ 'down')));

					if(jBreak.blocks[blockY][blockX] > 1){
						$block.css({'opacity':1-1/jBreak.blocks[blockY][blockX]});
						jBreak.blocks[blockY][blockX] -= 1;
					} else {
						$block.css('background-image',
							$block.css('background-image').replace(/\/(.*)\.png/g, '/$1_h.png'));
						$block.effect('drop', {direction:direction}, 'fast', function(){
							$block.remove();
						});
						jBreak.blocks[blockY][blockX] = 0;
						jBreak.blockChecker();
						return;
					}
				}
			}
		}

		// only run checks if a paddle could be hit
		if(y >= jBreak.fieldSize.height - 16 || y <=  8 || x <=  8 || x >= jBreak.fieldSize.width - 16){
			jBreak.paddles.forEach(function(jBPaddle){
				var paddleMissed;
				var paddleHit;

				switch(jBPaddle.position.relative){
					default:
					case 'bottom':
						paddle.bottom = true;

						paddleHit = this._speed.y > 0
						         && y <= jBreak.fieldSize.height - 8
						         && Math.ceil(y) >= jBPaddle.position.y - jBPaddle.$paddle.height()
						         && x >= jBPaddle.position.x
						         && x <= jBPaddle.position.x + jBPaddle.$paddle.width();

						paddleMissed = y > jBreak.fieldSize.height + 2;

						if(paddleHit){
							var angle =
								(this.position.x - jBPaddle.position.x + this._size.width/2)
								 * 180 / (jBPaddle._size.width / 2)
								 - 360;

							angle = Math.floor((angle > -45 ? -45 : (angle < -315 ? -315 : angle)));

							this.setAngle(angle);
						}
						break;
					case 'top':
						paddle.top = true;

						paddleHit = this._speed.y < 0 && y >= 4
						         && Math.ceil(y) <= jBPaddle.position.y + jBPaddle.$paddle.height()
						         && x >= jBPaddle.position.x
						         && x <= jBPaddle.position.x + jBPaddle.$paddle.width();

						paddleMissed = y < -10;

						if(paddleHit){
							var angle =
								(this.position.x - jBPaddle.position.x + this._size.width/2)
								 * 180 / (jBPaddle._size.width / 2)
								 - 360;

							angle = Math.floor((angle > -45 ? -45 : (angle < -315 ? -315 : angle)));

							this.setAngle(angle*-1);
						}
						break;
					case 'left':
						paddle.left = true;

						paddleHit = this._speed.x < 0 && x >= 4
						         && Math.ceil(x) <= jBPaddle.position.x + jBPaddle.$paddle.width()
						         && y >= jBPaddle.position.y
						         && y <= jBPaddle.position.y + jBPaddle.$paddle.height();

						paddleMissed = x < -10;

						(paddleHit ? this._speed.x *= -1 : null);
						break;
					case 'right':
						paddle.right = true;

						paddleHit = this._speed.x > 0
						         && x <= jBreak.fieldSize.width - 8
						         && Math.ceil(x) >= jBPaddle.position.x - jBPaddle.$paddle.width()
						         && y >= jBPaddle.position.y
						         && y <= jBPaddle.position.y + jBPaddle.$paddle.height();

						paddleMissed = x > jBreak.fieldSize.width + 2;

						(paddleHit ? this._speed.x *= -1 : null);
						break;
				}

				if(paddleHit){
					jBreak.playSound('sound/pling1s.ogg');
					this._interval -= (this._interval > 12.5 ? .20 : 0);
					return true;
				} else if(paddleMissed){
					jBreak.$field.effect('highlight','slow');
					this.remove();
					jBreak.ballChecker(); // any balls left?
				}
			}, this);
		}

		var check;

		check = x < 0 && !paddle.left
		     || x > jBreak.fieldSize.width - this._size.width && !paddle.right;
		if(check){
			jBreak.playSound('sound/pling1s.ogg');
			this._speed.x *= -1;
			this._interval -= (this._interval > 10 ? .075 : 0);
		}

		check = y < 0 && !paddle.top
		     || y > jBreak.fieldSize.height - this._size.height && !paddle.bottom;
		if(check){
			jBreak.playSound('sound/pling1s.ogg');
			this._speed.y *= -1;
			this._interval -= (this._interval > 10 ? .075 : 0);
		}
	},
	_animate:function(){
		var x = this.position.x + this._speed.x*4;
		var y = this.position.y + this._speed.y*4;

		this.move(x,y);
		this._hitCheck(x,y);

		if(this._timer){
			// arguments.callee kills the "this" reference :(
			var self = this;
			setTimeout(function(){
				self._animate();
			}, this._interval);
		}
	},
	move:function(x,y){
		this.$ball.css({left:x, top:y});
		this.position = {x:x, y:y};
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
	// private variables
	_ballID:null,
	_speed:null,
	_angle:-90,
	_timer:null,
	_interval:30,
	_size:null,
	// public variables @todo these should be private too
	$ball:null,
	position:null //@todo getter
};

// method to remove array indices
Array.prototype.remove = function(from, to) {
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
