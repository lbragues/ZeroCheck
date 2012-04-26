/*
	Author: SizeOne 2012
	Use at your own risk.
	sizeonedev.wordpress.com
*/
function version(hash){
	for (var i = version_hashes.length - 1; i >= 0; i--) {
		if(hash==version_hashes[i]["hash"]){
			return version_hashes[i]["version"];
		}
	}
	return undefined;
}
	
function buildLink(base,src){
	if(src[0]=='/'){
		//site root
		var spl=base.split("://");
		base=spl[1].split("/")[0];
		return spl[0]+"://"+base+src;
	}else if(src.indexOf("http://")>=0){
		return src;
	}else{
		//base of page
		var b="";
		for (var i = base.length - 1; i >= 0; i--) {
			if(base[i]=='/'){
				break;
			}else{
				b+=base[i];
			}
		}
		if(b!=""){
			return base.replace(b,src);
		}else{
			return base+src;
		}
	}
}

function hashZerobin(list){
	var hash="";
	for (var key in list) {
			hash=Sha1.hash(hash+key+list[key]);
	}
	return hash;
}

function hashZerobinPage(list,url){
	var hash="";
	for (var key in list) {
			hash=Sha1.hash(hash+key+list[key]);
	}
	return Sha1.hash(hash+buildLink(url,"/"));
}

function collectScripts(base,html){
	//it's a bit hack but faster than loading the full document into a dom object
	var spl=html.split("\n");
	var lst={}
	var src="";
	var js="";
	var js_dump="";
	for (var i = spl.length - 1; i >= 0; i--) {
		if (spl[i]!=undefined && spl[i].indexOf("<script") >= 0) {
			//check script
			if(spl[i].indexOf(" src=\"") >= 0){
				//read js link
				src=spl[i].split(" src=\"")[1].split("\"")[0];
				js=buildLink(base,src);
				js_dump=loadHtml(js);
				lst[src]=Sha1.hash(js_dump);
			}
		}
	}
	window.localStorage.removeItem("hlist");
  	window.localStorage.setItem("hlist", JSON.stringify(lst));
	return lst;
}

function collectPageScripts(base,html){
	var spl=html.split("\n");
	var lst={}
	var src="";
	var js="";
	var js_dump="";
	for (var i = spl.length - 1; i >= 0; i--) {
		if (spl[i].indexOf("<script") >= 0) {
			//check script
			if(spl[i].indexOf(" src=\"") < 0){
				//read contents
				js=base+"#line:"+i;
				js_dump=spl[i].split(">")[1].split("<")[0];
				src="line:"+Sha1.hash(js_dump);
				lst[src]=Sha1.hash(js_dump);
			}
		}
	}
	
	//get all javascript events
	var container= document.createElement('div');
	container.innerHTML= html;
	var nodes=container.getElementsByTagName('*');
	for (var i = nodes.length - 1; i >= 0; i--) {
		var attrs=nodes[i].attributes;
		if(attrs!=null){
			for (var j = attrs.length - 1; j >= 0; j--) {
				if($.inArray(attrs[j].name.toLowerCase(),eventList)>=0){
					lst[attrs[j].name+":"+i+":"+j]=Sha1.hash(attrs[j].value);
				}
			}
		}
	}
	window.localStorage.removeItem("hslist");
  	window.localStorage.setItem("hslist", JSON.stringify(lst));
	return lst;
}

function isZerobin(html){
	var total=0;
	for (var i = matchTag.length - 1; i >= 0; i--) {
		if (html.indexOf(matchTag[i]) < 0) {
			return false;
		}
	}
	return true;
}