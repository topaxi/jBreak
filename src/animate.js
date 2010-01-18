function animate(){
	var x = this._position.x + this._speed.x*4;
	var y = this._position.y + this._speed.y*4;

	this.move(x,y)._hitCheck(x,y);

	if(this._timer)
		this._timerID = setTimeout(this._animate, this._interval);
}

function move(x,y){
	this.$el.css({left:x, top:y});
	this._position = {x:x,y:y}

	return this;
}
