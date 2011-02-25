var Cookie = (function(document, undefined){
	// Cookie object based on the cookie functions on quirksmode.org
	var Cookie = {
		set:function(name,value,days){
			if(days !== undefined){
				var date = new Date();
				date.setTime(date.getTime()+(days*24*60*60*1000));
				var expires = "; expires="+date.toGMTString();
			}
			else var expires = "";

			document.cookie = name+"="+value+expires+"; path=/";
		},
		get:function(name){
			var nameEQ = name + "="
			  , ca = document.cookie.split(';')
			;

			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
			}
		},
		remove:function(name){
			this.create(name,"",-1);
		}
	};

	return Cookie;
})(window.document);
