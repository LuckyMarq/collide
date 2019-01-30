function ResourceConfig(source){
	var config = new XMLConfig(source);
	
	this.configs = {};
	for(var i in config.children){
		var n = config.children[i];
		if(n.name == "configs"){
			for(var j in n.children){
				this.configs[n.children[j].attributes["name"]] =  new XMLConfig(n.children[j].text)
				console.log("config loaded: "+ n.children[j].text+" "+n.children[j].attributes["name"]);
			}
		}else if(n.name == "resourceConfigs"){
			for(var j in n.children){
				console.log("resource config loaded: "+ n.children[j].text);
				this.merge(new ResourceConfig(n.children[j].text))
			}
		}else{
			this[n.name] = n.children;
		}
	}
}
ResourceConfig.prototype = {
	merge: function(config){
		for(var o in config){
			if(config[o] instanceof Array){
				if(this[o]){
					for(var i in config[o]){
						this[o].push(config[o][i]);
					}
				}else{
					this[o] = config[o];
				}
			}else{
				if(this[o]){
					fillProperties(this[o],config[o]);
				}else{
					this[o] = config[o];
				}
			}
		}
	}
}

/**
* sorts an xml file into a more convienient data structure
*/
var XMLConfig = (function(){
	
	var parseValue = function(str){
		var parts = str.split(';');
		if(parts.length>1){
			for(var i = 0; i<parts.length; i++){
				parts[i] = parseValue(parts[i]);
			}
			if(typeof parts[0] == 'function'){
				try{
					//can be used to with constructors
					return parts[0].apply(new Object(),parts.slice(1));
				}catch(e){}
			}else{
				var curr = window;
				for(var i = 0; i<parts.length; i++){
					curr = curr[parts[i]];
					if(typeof curr == 'undefined'){
						return parts;
					}
				}
				return curr;
			}
			return parts;
		}else if(str=='true'){
			return true;
		}else if(str=='false'){
			return false;
		}else{
			var f = parseFloat(str);
			if(isNaN(f)){
				if(str != '' && typeof window[str] != 'undefined'){
					return window[str];
				}else{
					return str;
				}
			}else{
				return f;
			}
		}
	}
	
	var ConfigNode = function(element){
		this.attributes = {}
		this.children = []
		this.text = "";
		this.name = element.nodeName;
		
		for(var i = 0; i<element.childNodes.length; i++){
			var n = element.childNodes[i];
			if(n.parentNode == element){
				if(n.nodeType ==  Node.TEXT_NODE){
					this.text = n.data;
					this.text =this.text.replace("\n","").trim();
					this.value = parseValue(this.text);
				}else if(n.nodeType == Node.ELEMENT_NODE){
					this.children.push(new ConfigNode(n))
					if(typeof this[n.nodeName] == 'undefined')this[n.nodeName] = this.children[this.children.length -1];
				}else if(n.nodeType == Node.ATTRIBUTE_NODE){
					this.attributes[n.nodeName] = parseValue(n.nodeValue);
				}
			}
		}
		for(var i = 0; i<element.attributes.length; i++){
			this.attributes[element.attributes[i].nodeName] = parseValue(element.attributes[i].nodeValue);
		}
	}
	ConfigNode.prototype = {
		toString:function(){
			var str = this.name+'{text:"'+this.text+'" ,attributes:{'
			for(var o in this.attributes){
				str+="["+o+":"+this.attributes[o]+"]";
			}
			str+="}}"
			return str;
		},
		print:function(){
			if(this.name == 'root'){
				console.log(this.toString());
			}
			if(this.children.length>0){
				var str = "";
				for(var i in this.children){
					str+=this.children[i]; 
				}
				console.log(str);
				for(var i in this.children){
					this.children[i].print(); 
				}
			}
		},
		getFirst: function(name){
			for(var i = 0; i<this.children.length; i++){
				if(this.children[i].name == name){
					return this.children[i];
				}
			}
		}
	}
	return function(source){
		//get xml file
		var request=new XMLHttpRequest();
		request.open("GET",source,false);//synchronous loading
		request.send();
		// console.log(request.responseText)
		var xml = (new DOMParser()).parseFromString(request.responseText,'text/xml');
		
		return new ConfigNode(xml.documentElement)
	}
})();
