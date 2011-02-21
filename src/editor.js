function buttonBlockCallback(color){
	return function(){
		jBreak.editor._selectedTheme = color;
	}
}

jBreak.editor = {
	start:function(){
		for(var i = jBreak.balls.length;i--;)
			jBreak.balls[i].remove();
		jBreak.balls = [];

		var $jBreak = $('#jBreak').empty().unbind().css('cursor', 'default');

		jBreak.$field = $('<div id="jBreakField"/>');
		$jBreak.append(jBreak.$field);
		jBreak._setLevelTitle('jBreak Level Editor');

		if(typeof JSON !== 'undefined' && typeof sessionStorage !== 'undefined')
			this._level = JSON.parse(sessionStorage['editorLevel']);

		if(!this._level)
			this._level = {
				blocks:[
					[],[],[],[],[],
					[],[],[],[],[],
					[],[],[],[],[],
					[],[],[],[],[],
					[],[],[],[],[]
				],
				paddles:[
					{position:'bottom','ball':true}
				],
				name:'Custom'
			};

		jBreak.lives(3);
		this._selectedTheme = 'delete';
		this._drawBlocks();
		this._enableGhostBlock(true);
		this.showOptions();
		this.bindAddBlock();
	},
	_enableGhostBlock:function(enabled){
		if(!enabled){
			jBreak.$field.unbind('mousemove');
			$('#jBreakGhostBlock').remove();

			return;
		}

		var self = this,
		    fieldOffset = jBreak.$field.offset(),
		    $ghostBlock = $('<div/>', {
		    	id:'jBreakGhostBlock',
		    	css:{
		    		width:40,
		    		height:16,
		    		opacity:.6,
		    		backgroundPosition:'0 0',
		    		position:'absolute'
		    	}
		    });

		jBreak.$field
			.append($ghostBlock)
			.mousemove(function(e){
				var x = ~~((e.pageX - fieldOffset.left) / 40),
				    y = ~~((e.pageY - fieldOffset.top) / 16);

				$ghostBlock.css({
					left:x*40,
					top:y*16,
					backgroundImage:
						'url(images/blocks/'+self._selectedTheme+'.png)',
					display:self._selectedTheme !== 'delete' ? 'block' : 'none'
				});
			});
	},
	bindAddBlock:function(){
		var fieldOffset = jBreak.$field.offset(),
		    self = this;

		jBreak.$field.click(function(e){
			var x = ~~((e.pageX - fieldOffset.left) / 40),
			    y = ~~((e.pageY - fieldOffset.top) / 16),

			    blocks = self._level.blocks,
			    blockExists = blocks[y]
			               && blocks[y][x];

			if(blockExists){
				var block = blocks[y][x],
				    $block = $('.jBreakBlock.x'+x+'.y'+y);

				if(block.theme === self._selectedTheme){
					block.value++;
					$block.text(block.value > 1 ? block.value : '');
				}
				else if(self._selectedTheme === 'delete'){
					if(--block.value){
						$block.text(block.value > 1 ? block.value : '');
					}
					else {
						delete blocks[y][x];
						$block.fadeOut();
					}
				}
				else {
					block.theme = self._selectedTheme;
					$block.css('background-image', 
						'url(images/blocks/'+block.theme+'.png)');
				}
			}
			else if(self._selectedTheme !== 'delete') {
				$('.jBreakBlock.x'+x+'.y'+y).remove();

				var $block = $('<div/>', {
					css:{
						left:x*40,
						top:y*16,
						background:
							'transparent url(images/blocks/'
								+self._selectedTheme+'.png) scroll no-repeat',
						backgroundPosition:'-40px 0',
						textAlign:'center',
						display:'none'
					},
					mouseenter:function(){
						$(this).css('background-position','0 0');
					},
					mouseleave:function(){
						$(this).css('background-position','-40px 0');
					}
				}).addClass('jBreakBlock x'+x+' y'+y);

				jBreak.$blocks.append($block.fadeIn());
				blocks[y][x] = {
					theme:self._selectedTheme,
					value:1
				};
			}
		});
	},
	showOptions:function(){
		this.$options = $('<div/>');
		var $optionWindow = draggableWindow('Toolbox',
			this.$options).css({width:'192px',position:'absolute'});

		var highlightButton = function(){
			$optionWindow.find('button')
				.css('border-color', '')
				.find('div')
				.css('background-position', '');
			$(this)
				.css('border-color', '#336')
				.find('div')
				.css('background-position', '0 0');
		};

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
			this.$options.append(
				button(buttonBlockCallback(blockImages[i]))
					.addClass('jBreakEditorBlockButton')
					.css('margin',2)
					.html('<div style="background-image:url(images/blocks/'+blockImages[i]+'.png)">')
					.click(highlightButton));

		this.$options.append(
			$('<div/>', {css:{textAlign:'center',margin:5}}).append(
				button('Remove', buttonBlockCallback('delete'))
					.css('border-color','#000')
					.click(highlightButton)
			));

		var self = this;
		this.$options.append(
			$('<div/>', {css:{textAlign:'center',margin:5}}).append(
				button('Start', function(){
					self._enableGhostBlock(false);
					$optionWindow.fadeOut(600, function(){
						$optionWindow.remove();
					});
					jBreak.$field.unbind('click');
					jBreak.loadLevel($.extend(true, {}, self._level));
					jBreak._levelID = -1;

					if(typeof JSON !== 'undefined' && typeof sessionStorage !== 'undefined')
						sessionStorage['editorLevel'] = JSON.stringify(self._level);

					$(this).unbind('click');
				})
			));

		jBreak.$field.append($optionWindow);

		$optionWindow.click(function(e){
			e.stopPropagation();
		});
		$optionWindow.fadeIn(600);
	},
	_drawBlocks:function(){
		jBreak.$blocks.hide().empty();
		for(var y = this._level.blocks.length;y--;){
			var horizontalBlocks = this._level.blocks[y];
			for(var x = horizontalBlocks.length;x--;){
				var block = horizontalBlocks[x];

				if(block){
					var $block = $('<div/>', {
						css:{
							left: x*40,
							top:  y*16,
							background:
								'transparent url(images/blocks/'
									+block.theme+'.png) scroll no-repeat',
							backgroundPosition:'-40px 0',
							textAlign:'center'
						},
						mouseenter:function(){
							$(this).css('background-position','0 0');
						},
						mouseleave:function(){
							$(this).css('background-position','-40px 0');
						},
						text:block.value > 1 ? block.value : ''
					}).addClass('jBreakBlock x'+x+' y'+y);

					jBreak.$blocks.append($block);
				}
			}
		}

		jBreak.$field.append(jBreak.$blocks);
		jBreak.$blocks.fadeIn(600);
	},
	_selectedTheme: 'delete',
	_level:         null,
	$options:       null
};
