function addTimers(self) {
	var timers = {}
	  , interval
	;

	self.toggleTimers = toggleTimers;
	self.addTimer     = addTimer;
	self.deleteTimer  = deleteTimer;
	self.triggerTimer = triggerTimer;
	self.getTimer     = getTimer;

	function toggleTimers(on){
		clearInterval(interval);

		if(on){
			interval = setInterval(function(){
				for(var i in timers){
					var timer = timers[i];
					timer.timeout -= .25;

					if(timer.timeout <= 0){
						timer.action.call(self);
						deleteTimer(i);
					}
				}
			}, 250);
		}
	}

	function addTimer(name, timer){
		if(timer) timers[name] = timer
		else      timers       = name;
	}

	function deleteTimer(name){
		delete timers[name];
	}
	
	function triggerTimer(name){
		if(name){
			timers[name].action.call(self);
			deleteTimer(name);
		}
		else {
			for(var i in timers){
				timers[i].action.call(self);
				deleteTimer(i);
			}
		}
	}

	function getTimer(name){
		return name ? timers[name] : timers;
	}
}
