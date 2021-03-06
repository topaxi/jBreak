var $jBreak
  , $jBreakField
  , $document  = $(document)
  , jBreak     = {
	start:function(){
		$jBreak = $('#jBreak').empty();

		$jBreakField = $('<div id="jBreakField"/>');
		$jBreak.append($jBreakField);

		this.paddles = [];
		this.bonuses = [];
		this.balls   = [];
		this.bullets = [];

		this.fieldSize = {
			width:  $jBreakField.width(),
			height: $jBreakField.height()
		};

		this.lives(3);

		this._cacheImages();
		this._setLevelTitle('jBreak @VERSION');
		this._trackMouseMovement(true);
		this.$blocks = $('<div id="jBreakBlocks"/>');

		Options.showOptions();

		if(window.location.hash == '#debug')
			console.log(window['jBreak'] = this);
	},
	_cacheImages:function(){
		var cache        = this._imageCache
		  , paddleImages = [
		    	'pad16x8',
		    	'pad32x8',
		    	'pad48x8',
		    	'pad64x8',
		    	'pad80x8',
		    	'pad96x8',
		    	'pad112x8',
		    	'pad128x8'
		    ]
		  , ballImages = [
		    	'ball1-88',
		    	'ball4-88'
		    ]
		  , bonusImages = [
		    	'shrink',
		    	'15+speed',
		    	'faster',
		    	'grow',
		    	'slower',
		    	'life',
		    	'powerball',
		    	'multiball'
		    ]
		  , blockImages = [
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
		    ]
		  , i
		 ;

		cache.paddle = [];
		for(i = paddleImages.length;i--;)
			cache.paddle[i] = $('<img src="images/paddles/'+paddleImages[i]+'.png"/>');

		cache.ball = [];
		for(i = ballImages.length;i--;)
			cache.ball[i] = $('<img src="images/'+ballImages[i]+'.png"/>');

		cache.bonus = [];
		for(i = bonusImages.length;i--;)
			cache.bonus[i] = $('<img src="images/bonuses/'+bonusImages[i]+'.png"/>');

		cache.block = [];
		for(i = blockImages.length;i--;)
			cache.block[i] = $('<img src="images/blocks/'+blockImages[i]+'.png"/>');
	},
	_setLevelTitle:function(title){
		$('#jBreakLevelTitle', $jBreak).remove();

		$jBreak.append($('<div id="jBreakLevelTitle"/>').text(title));
	},
	lives:function(lives){
		if(lives === undefined)
			return this._lives;
		else if(lives < 0)
			return this.gameOver();

		this._lives = lives;

		$('#jBreakLives', $jBreak).remove();
		var $lives = $('<div id="jBreakLives"/>');

		for(;lives--;)
			$lives.append('<div class="jBreakLive"/>');

		$jBreak.append($lives);
	},
	playSound:function(soundFile){ // I'M LEAKING LOTS OF MEMORY!!
		if(this._volume === 0 || typeof Audio === 'undefined')
			return;

		var audio = new Audio(soundFile);
		audio.volume = this._volume/100;
		audio.play();
	},
	volume:function(volume){
		if(volume === undefined)
			return this._volume;

		this._volume = volume;
	},
	_hideCursor:function(hide){
		if(hide)
			$jBreak.css('cursor',
				'url(images/cursor/cursor.gif), url(images/cursor/cursor.ico), none');
		else
			$jBreak.css('cursor', 'default');
	},
	_createPaddles:function(paddles){
		var self = this;

		for(var i = paddles.length;i--;){
			var paddle   = paddles[i]
			  , jBPaddle = new Paddle(paddle.position)
			;

			self.paddles.push(jBPaddle);

			if(paddle.ball)
				jBPaddle.connectBall(new Ball());
		}
		
		$jBreakField.unbind('click.jBreakLaunchPaddleBalls');
		$jBreakField.bind('click.jBreakCreatePaddles', function(e){
			e.stopPropagation(); // do not bubble
			self._hideCursor(true);

			var paddles = self.paddles;

			for(var i = paddles.length;i--;){
				var jBPaddle = paddles[i];
				jBPaddle.start();

				var jBPaddlePosition = jBPaddle.getPosition()
				  , fieldOffset      = $jBreakField.offset()
				;

				var position = (
					jBPaddlePosition.relative === 'top' ||
					jBPaddlePosition.relative === 'bottom'
						? e.pageX - fieldOffset.left
						: e.pageY - fieldOffset.top);

				jBPaddle.move(position);
			}

			$jBreakField.one('click', function(){
				self._trackMouseMovement(true);
				self._bindPause();
			});

			$jBreakField.bind('click.jBreakLaunchPaddleBalls', function(){
				for(var i = paddles.length;i--;)
					paddles[i].startBalls();
			});

			$jBreakField.unbind('click.jBreakCreatePaddles');
		});
	},
	_bindPause:function(){
		$document.bind('keydown.jBreakPause', function(e){
			if(e.keyCode === 32 || e.keyCode === 80){
				jBreak.togglePause(true);
			}
		});
	},
	_unbindPause:function(){
		$document.unbind('.jBreakPause');
	},
	togglePause:function(paused){
		var self = this;
		self._destroyField();

		paused = self._paused = paused || !self._paused;

		for(var i = self.balls.length;i--;)
			self.balls[i].pause(paused);

		for(var i = self.bullets.length;i--;)
			self.bullets[i].pause(paused);

		for(var i = self.bonuses.length;i--;)
			self.bonuses[i].pause(paused);

		for(var i = self.paddles.length;i--;)
			self.paddles[i].pause(paused);

		self._trackMouseMovement(!paused);

		if(paused){
			var $unpauseButton = $('<button>continue</button>').appendTo($jBreakField),
			    fieldOffset    = $jBreakField.offset(),
			    buttonLeft     = self._mousePosition.pageX - fieldOffset.left - 32,
			    buttonTop      = self._mousePosition.pageY - fieldOffset.top  - 12;

			$unpauseButton.css({
				position:'absolute',
				width:'64px',
				height:'24px',
				left:(buttonLeft > self.fieldSize.width ? self.fieldSize.width-64 :
					(buttonLeft < 0 ? 0 :
						buttonLeft)),
				top: (buttonTop > self.fieldSize.height ? self.fieldSize.height-24 :
					(buttonTop < 0 ? 0 :
						buttonTop))
			});

			$unpauseButton.click(function(){
				$unpauseButton.remove();

				self.togglePause(false);
			}).focus(function(){ // prevent button from beeing triggered with <return>
				$unpauseButton.blur();
			});
		}
		else {
			for(var i = self.paddles.length;i--;)
				self.paddles[i].start();

			self._hideCursor(true);
			self._bindPause();
		}
	},
	_trackMouseMovement:function(track){
		$document.unbind('.jBreakMouseTrack');

		if(track){
			var mousePosition = this._mousePosition;
			$document.bind('mousemove.jBreakMouseTrack', function(e){
				mousePosition.pageX = e.pageX;
				mousePosition.pageY = e.pageY;
			});
		}
	},
	_destroyField:function(){
		this._trackMouseMovement(false);
		this._unbindPause();
		this._hideCursor(false);
	},
	blockChecker:function(){
		var blockVal = 0
		  , blocks   = this.blocks
		;

		for(var y = blocks.length;y--;){
			var blocksY = blocks[y]; 
			for(var x = blocksY.length;x--;)
				if(blocksY[x])
					blockVal += blocksY[x].value;
		}

		if(blockVal === 0){
			this._destroyField();

			if(++this._levelID)
				this.loadLevel(this._levelID);
			else
				Editor.start();
		}
	},
	ballChecker:function(jBPaddle){
		if(this.balls.length === 0){
			if(this._lives > 0){
				jBPaddle.connectBall(new Ball());
				jBPaddle.size(64); // reset size

				jBPaddle.$el.stop(true, true) // stop any effects on the paddle
					.css('opacity', 1); // $el.stop doesn't seem to restore the opacity...
			}

			this.lives(this._lives-1);
		}
	},
	gameOver:function(){
		var self = this;

		if(self._levelID < 0)
			return Editor.start();

		self._destroyField();
		$jBreakField.find('.jBreakPaddle').effect('puff', {}, 600);
		self.$blocks.find('div').effect('drop', {direction:'down'}, 600);

		setTimeout(function(){
			for(var i = self.paddles.length;i--;)
				self.paddles[i].remove();

			self.paddles = [];
			self.$blocks.remove();

			var $fail = $('<div class="fail" style="display:none">FAIL!</div>');
			self._hideCursor(false);
			$jBreakField.append($fail);
			var failOffset = $fail.offset();

			$fail.css('top',
				$jBreakField.height()/2 - $fail.height()/2 + 'px'
			).fadeIn(600, function(){
				$fail.effect('pulsate', {times:2,mode:'hide'}, 2000, function(){
					self._levelID = 0;
					self._lives = 3;
					self.start(); // restart game
				});
			});
		}, 1000);
	},
	loadLevel:function(levelID){
		var level, self = this;

		levelID = (levelID !== undefined ? levelID : 0);

		// clear previous level first
		for(var i = self.balls.length;i--;)
			self.balls[i].remove();
		self.balls = [];

		for(var i = self.paddles.length;i--;)
			self.paddles[i].remove();
		self.paddles = [];

		for(var i = self.bonuses.length;i--;)
			self.bonuses[i].remove();
		self.bonuses = [];

		for(var i = self.bullets.length;i--;)
			self.bullets[i].remove();
		self.bullets = [];

		if(typeof levelID === 'object')
			level = levelID;
		else
			$.ajax({
				url:'level/'+ levelID,
				method:'get',
				dataType:'json',
				async:false,
				success:function(data, textStatus){
					level = data.message;
				}
			});

		setTimeout(function(){
			self.blocks = level.blocks;
			self._drawBlocks();
			self._setLevelTitle(level.name);
			self._createPaddles(level.paddles);
		}, 250);
	},
	_drawBlocks:function(){
		var blocks = this.blocks;

		this.$blocks.hide().empty();
		for(var y = blocks.length;y--;){
			var horizontalBlocks = blocks[y];
			for(var x = horizontalBlocks.length;x--;){
				var block = horizontalBlocks[x];

				if(block){
					var $block = $('<div/>');
					$block.addClass('jBreakBlock x'+x+' y'+y);

					if(block.sprite === undefined){
						var random = Math.ceil(Math.random()*10);
						random = (random < 10 ? '0'+random : random);

						block.sprite = (random-1)*-16;
					}

					$block.css({
						left: x*40,
						top:  y*16,
						background:
							'transparent url(images/blocks/'
								+block.theme+'.png) scroll no-repeat',
						backgroundPosition: '-40px '+block.sprite+'px'
					});

					block.$el = $block;

					this.$blocks.append($block);
				}
			}
		}

		$jBreakField.append(this.$blocks);
		this.$blocks.fadeIn(600);
	},

	// private variables
	_imageCache:    {},
	_volume:        70,
	_levelID:        0,
	_mousePosition: {}
};
