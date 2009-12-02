jBreak = {
	// methods
	start:function(){
		//var $jBreak = $('<div id="jBreak"/>');
		this.$field = $('#jBreak').empty();

		this.paddles = [];
		this.balls = {};

		this.fieldSize = {
			width:this.$field.width(),
			height:this.$field.height()
		};

		// will be destroyed on game start
		/*var self = this;
		this.$field.resizable({
			minHeight: 400,
			minWidth:  256,
			grid:        8,
			resize:function(){
				self.fieldSize.width = self.$field.width();
				self.fieldSize.height = self.$field.height();

				self.paddles.forEach(function(jBPaddle){
					switch(jBPaddle.position.relative){
						case 'top':
							jBPaddle.setPosition('left',0,false);
							jBPaddle.setPosition('top',self.fieldSize.width / 2,true);
							break;
						default:
						case 'bottom':
							jBPaddle.setPosition('left',self.fieldSize.height,false);
							jBPaddle.setPosition('bottom',self.fieldSize.width / 2,true);
							break;
						case 'left':
							jBPaddle.setPosition('top',0,false);
							jBPaddle.setPosition('left',self.fieldSize.height / 2,true);
							break;
						case 'right':
							jBPaddle.setPosition('top',self.fieldSize.width,false);
							jBPaddle.setPosition('right',self.fieldSize.height / 2,true);
							break;
					}
				});
			}
		});*/

		this.options.showOptions();
		this.createPaddles();
		this.drawBlocks();
		//console.log('Playing field initialized -> %o', this);
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
		//console.log('Creating paddles...');
		var self = this;
		var $startButton = self.options.$options.find('#jBreakStart');
		$startButton.bind('click.jBreakCreatePaddles',function(){
			$('#jBreak .optionsContainer').fadeOut(750, function(){
				self.$field.bind('click.jBreakCreatePaddles',function(e){
					e.stopPropagation(); // do not bubble
					//self.$field.resizable('destroy'); // game started, destroy resizable ui
					self.$field.css({cursor:'none'});

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
				});
			});
		});
		//console.log('Paddles created');

		var self = this;
		$(document).keydown(function(e){
			if(e.keyCode == 32){
				for(jBBall in self.balls){
					if(self.balls[jBBall]._timer){
						self.balls[jBBall]._timer = false;
					} else {
						self.balls[jBBall]._timer = true;
						self.balls[jBBall]._animate();
					}
				}
			}
		});
	},
	ballChecker:function(){
		//console.log('Checking remaining balls...');
		var i = 0;
		for(ball in this.balls){
			i++;
		}

		if(i == 0){
			//console.log('No remaining balls found... FAIL!')
			var self = this;

			this.$field.unbind('mousemove');
			this.$field.find('.jBreakPaddle').effect('puff', {}, 750);
			this.$blocks.find('div').effect('puff', {}, 750); // this is painfully slow on other browsers than chromium ^^

			setTimeout(function(){
				self.paddles.forEach(function(jBPaddle){
					jBPaddle.$paddle.remove();
					jBPaddle.remove();
				});
				self.paddles = [];
				self.$blocks.remove();

				var $fail = $('<div class="fail" style="display:none">FAIL!</div>');
				self.$field.css({cursor:'default'});
				self.$field.append($fail);
				var failOffset = $fail.offset();

				$fail.css({
					top:self.$field.height()/2 - $fail.height()/2 + 'px'
				}).fadeIn('slow', function(){
					$(this).effect('pulsate', {times:2,mode:'hide'}, 2000, function(){
						self.start(); // restart game
					});
				});
			}, 1000);
		} else {
			//console.log('%d remaining balls found.', i)
		}
	},
	// test
	drawBlocks:function(){
		this.$blocks = $('<div style="position:absolute;left:32px;top:32px;display:none"/>');
		this.blocks = [
			//0  1  2  3  4  5  6  7  8
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1], // 2
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1], // 3
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1], // 4
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1], // 5
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1], // 6
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1], // 7
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 8
		];

		this.blocks.forEach(function(horizontalBlocks, y){
			horizontalBlocks.forEach(function(block, x){
				if(block > 0){
					var $block = $('<div style="width:62px;height:14px;border:1px solid gray;background-color:black;position:absolute"/>');
					$block.css({textAlign:'center',color:'white',fontSize:'11px'});
					$block.append(x+'.'+y);
					$block.addClass('jBreakBlock');
					$block.addClass(x+'_'+y);
					$block.css({left:x*64,top:y*16});
					this.$blocks.append($block);
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
				containment:'#jBreak',
				handle:'.draggableHandle',
				scroll:false
			});

			this.$optionTabs = $('<div class="options"/>');

			this.$optionTabs.append('<ul style="font-size:12px"><li><a href="#tabs-1">Player</a><li><a href="#tabs-2">Ball</a></li><li><a href="#tabs-3">Level</a></li></ul></ul>');
			this.$optionTabs.append(this.playerOptions());
			this.$optionTabs.append(this.ballOptions());
			this.$optionTabs.append('<div id="tabs-3" style="text-align:center;height:220px">-under construction-</div>');

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
			this.$options.fadeIn('slow');

			// default stuff
			var paddleID = jBreak.addPaddle('bottom');
			jBreak.addBall(paddleID);
		},
		playerOptions:function(){
			var $playerOptions = $('<div id="tabs-1" style="height:220px"/>');
			var $paddlePositions = $('<div style="border:1px solid black;width:51px;position:relative;margin:auto"/>');

			$paddlePositions.append('<input class="option position paddleTop" name="top" style="display:block;margin:auto;margin-top:3px" type="checkbox"/>');
			$paddlePositions.append('<input class="option position paddleRight" name="right" style="position:absolute;right:1px" type="checkbox"/>');
			$paddlePositions.append('<input class="option position paddleLeft" name="left" type="checkbox"/>');
			$paddlePositions.append('<input class="option position paddleBottom" name="bottom" style="display:block;margin:auto;margin-bottom:3px" type="checkbox" checked="checked" disabled="disabled"/>');

			$paddlePositions.find('.option.position').each(function(i, el){
				var $el = $(el);
				var position = this.name;

				$el.click(function(){
					var checked = ($el.attr('checked') ? true : false);
					if(!checked){
						jBreak.paddles.forEach(function(jBPaddle){
							if(jBPaddle.position.relative == position){
								jBPaddle.remove();
								return false;
							}
						});
					} else {
						jBreak.addPaddle($el.attr('name'));
					}
				});
			});

			$playerOptions.append('<p>Paddles:</p>');
			$playerOptions.append($paddlePositions);
			return $playerOptions;
		},
		ballOptions:function(){
			var $ballOptions = $('<div id="tabs-2" style="height:220px;text-align:center">-under construction-</div>');
			return $ballOptions;
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

		jBreak.$field.mousemove(function(e){
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
	// @todo remove/refactor this method as it's only a hack for resizing, this function is ~3x slower than this.move()
	setPosition:function(relativePosition, position, withBall){
		if(relativePosition == 'top' || relativePosition == 'bottom'){
			var x = position;
			x -= this._size.width / 2;

			if(x < 0){
				x = 0;
			} else if(x > jBreak.fieldSize.width - this._size.width){
				x = jBreak.fieldSize.width - this._size.width;
			}

			if(withBall){
				this.balls.forEach(function(i){
					var ballX = x
					          + this._size.width / 2
					          - jBreak.balls[i].$ball.width() / 2;

					if(relativePosition == 'bottom'){
						var ballY = this.position.y
						          - this._size.height / 2
						          - jBreak.balls[i].$ball.height() / 2;
					}

					jBreak.balls[i].move(
						ballX,
						(ballY ? ballY : jBreak.balls[i].position.y));
				}, this);
			}

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

			if(withBall){
				this.balls.forEach(function(i){
					var ballY = y
					          + this._size.height / 2
					          - jBreak.balls[i].$ball.height() / 2;

					if(relativePosition == 'right'){
						var ballX = this.position.x
						          - jBreak.balls[i].$ball.width();
					}

					jBreak.balls[i].move(
						(ballX ? ballX : jBreak.balls[i].position.x),
						ballY);
				}, this);
			}

			this.position.y = y;
			this.$paddle.css({top:y});
		}
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
		if(angle != undefined){
			this._angle = angle;
		}

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
		if(y <= jBreak.fieldSize.height - 32 || y >= 32 || x >= 32 || x <= jBreak.fieldSize.width - 32){
			if(this._speed.y > 0){
				var ballY = y-(32-this._size.height);
			} else {
				var ballY = y-32; // @todo by ds: check division by 0..?
			}

			if(this._speed.x > 0){
				var ballX = x-(32-this._size.width);
			} else {
				var ballX = x-32;
			}
			var blockX = Math.floor(ballX / 64);
			var blockY = Math.floor(ballY / 16);

			var blockExists = jBreak.blocks[blockX] != undefined
			               && jBreak.blocks[blockX][blockY] != undefined

			if(blockExists){
				if(jBreak.blocks[blockX][blockY] > 0){
					ballX = Math.floor(ballX);
					ballY = Math.floor(ballY);

					var hHit = (ballX % 64 <= 63 && ballX % 64 >= 61 && this._speed.x < 0)
					        || (ballX % 64 <=  2 && this._speed.x > 0);
					var vHit = (ballY % 16 <= 15 && ballY % 16 >= 13 && this._speed.y < 0)
					        || (ballY % 16 <=  2 && this._speed.y > 0);

					/*if(!vHit && !hHit){
						// something went wrong...
						console.log('X: %d S: %d', ballX % 64, this._speed.x);
						console.log('Y: %d S: %d', ballY % 16, this._speed.y);
						console.log('vHit %d, hHit %d', vHit, hHit);
						console.log('---');
					}*/

					if(vHit)
						this._speed.y *= -1;

					if(hHit)
						this._speed.x *= -1;

					//console.log('I hit %d,%d', blockX,blockY);
					$block = $('.'+blockX+'_'+blockY);
					$block.effect('puff', {}, 'fast', function(){
						$block.remove();
					});
					jBreak.blocks[blockX][blockY] = 0;
					return;
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

						(paddleHit ? this._speed.y *= -1 : null);
						break;
					case 'top':
						paddle.top = true;

						paddleHit = this._speed.y < 0 && y >= 4
						         && Math.ceil(y) <= jBPaddle.position.y + jBPaddle.$paddle.height()
						         && x >= jBPaddle.position.x
						         && x <= jBPaddle.position.x + jBPaddle.$paddle.width();

						paddleMissed = y < -10;

						(paddleHit ? this._speed.y *= -1 : null);
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
					this._interval -= (this._interval > 12.5 ? .25 : 0);
					return true;
				} else if(paddleMissed){
					jBreak.$field.effect('highlight','slow');
					this.remove();
				}
			}, this);
		}

		var check;

		check = x < 0 && !paddle.left
		     || x > jBreak.fieldSize.width - this._size.width && !paddle.right;
		if(check){
			this._speed.x *= -1;
			this._interval -= (this._interval > 10 ? .075 : 0);
		}

		check = y < 0 && !paddle.top
		     || y > jBreak.fieldSize.height - this._size.height && !paddle.bottom;
		if(check){
			this._speed.y *= -1;
			this._interval -= (this._interval > 10 ? .075 : 0);
		}
	},
	_animate:function(){
		var x = this.position.x + this._speed.x*4;
		var y = this.position.y + this._speed.y*4;

		this._hitCheck(x,y);
		this.move(x,y);

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
		jBreak.ballChecker(); // any balls left?
		//delete this;
	},
	// private variables
	_ballID:null,
	_speed:null,
	_angle:-90,
	_timer:null,
	_interval:33,
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
	jBreak.start();
});
