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
			this._setLevelTitle('jBreak @VERSION');
			this._trackMouseMovement(true);
			this.$blocks = $('<div id="jBreakBlocks"/>');

			var cookieSoundVolume = readCookie('soundVolume');
			if(cookieSoundVolume !== null)
				this._volume = parseInt(cookieSoundVolume);

			this.options.showOptions();

			if(window.location.hash == '#debug')
				console.log(window['jBreak'] = this);

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
		for(var i = paddleImages.length;i--;)
			cache.paddle[i] = $('<img src="images/paddles/'+paddleImages[i]+'.png"/>');

		cache.ball = [];
		var ballImages = [
			'ball1-88',
			'ball4-88'
		];
		for(var i = ballImages.length;i--;)
			cache.ball[i] = $('<img src="images/'+ballImages[i]+'.png"/>');

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
		for(var i = bonusImages.length;i--;)
			cache.bonus[i] = $('<img src="images/bonuses/'+bonusImages[i]+'.png"/>');

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
		for(var i = blockImages.length;i--;)
			cache.block[i] = $('<img src="images/blocks/'+blockImages[i]+'.png"/>');
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

		for(var i = this._lives;i--;)
			$lives.append('<div class="jBreakLive"/>');

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
		if(hide)
			$('#jBreak').css('cursor',
				'url(images/cursor/cursor.gif), url(images/cursor/cursor.ico), none');
		else
			$('#jBreak').css('cursor', 'default');
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
			}

			self.$field.bind('click.jBreakLaunchPaddleBalls', function(){
				self._trackMouseMovement(true);
				self.bindPause();

				for(var i = self.paddles.length;i--;)
					self.paddles[i].startBalls();
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
			for(var i = this.paddles.length;i--;)
				this.paddles[i].start();

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
			for(var x = blocksY.length;x--;)
				if(blocksY[x])
					blockVal += blocksY[x].value;
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
					for(var i = self.paddles.length;i--;)
						self.paddles[i].remove();

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
			}
		}, 250);
	},
	_drawBlocks:function(level){
		if(this._imageCache.blocks === undefined)
			this._imageCache.blocks = {};

		this.$blocks.empty();
		for(var y = this.blocks.length;y--;){
			var horizontalBlocks = this.blocks[y];
			for(var x = horizontalBlocks.length;x--;){
				var block = horizontalBlocks[x];

				if(block !== 0){
					var $block = $('<div/>');
					$block.addClass('jBreakBlock x'+x+' y'+y);

					if(block.sprite === undefined){
						var random = Math.ceil(Math.random()*10);
						random = (random < 10 ? '0'+random : random);

						block.sprite = (random-1)*-16;
					}

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
	_mousePosition:null
};