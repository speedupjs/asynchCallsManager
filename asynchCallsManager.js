var speedupjs=speedupjs||{};

if(!speedupjs.asynchCallsManager){	
			speedupjs.asynchCallsManager=function(obj){
					if(this instanceof arguments.callee){
						this.initCaller={};
						this._sequence=obj.sequence||[];
						this._onAllDone=obj.onAllDone;
						this._onBegin=obj.onBegin;
						this._openRequest=0;
						this._currentIndex=-1;
						this._receiver=obj.receiver||window;
						this._sequence=obj.sequence;
						this._dataObj={};
						this._callObj=this._cloneObj(obj.methodPool,'receiver');
						for(var each in this._callObj){
							this._callObj[each]._dstnce=0;
							this._callObj[each].nextJob={_onsuccess:[],_onerror:[],_oncomplete:[]};
							this._callObj[each].dependsOn=[];
						}
						for(var i=0,l=this._sequence.length;i<l;i++){
							this._updateDependency(this._sequence[i].name,this._sequence[i].dependsOn);
						}
						for(var each in obj.data){
							this.setDataByKey(each,obj.data[each]);
						}
				
					}
					else{
						throw {
							name:"error instantiating",
							level:"critical",
							message:"new operator missing",
							toString:function(){ return this.name+": "+this.message;}
						};
					}
			};
			speedupjs.asynchCallsManager.prototype._cloneObj=function(ele,excludeKey){
			var tmp;
			if(typeof(ele)=='object' && ele){
			tmp={};
			for(var each in ele){
			if(ele.hasOwnProperty(each)){
			if(each == excludeKey){
			tmp[each]=ele[each];
			}
			else{
			tmp[each]=this._cloneObj(ele[each],excludeKey);				
			}
			}
			}
			}else{
			tmp=ele;
			}
			return tmp;
			};
			speedupjs.asynchCallsManager.prototype._buildQueue=function(par,job){
			if(par){
			var tmp=par.split(".");
			var cO=this._callObj;
			var cur=cO[tmp[0]];
			var state="_on"+tmp[1];
			if(cur && cur.nextJob[state]){
			if(cur.nextJob[state].indexOf(job)==-1){
			cur.nextJob[state].push(job);
			}			
			}else{
			throw {
			name:"error",
			level:"critical",
			message:"cannot find method "+par+" in methodPool",
			toString:function(){ return this.name+": "+this.message;}
			};
			}
			}
			};
			
			speedupjs.asynchCallsManager.prototype._updateDependency=function(name,dependsOn){
			var cur=this._callObj[name];
			var tmp;
			dependsOn=dependsOn||[];
			if(cur){
			this.initCaller[name]=true;
			for(var i=0;i<dependsOn.length;i++){
			if(dependsOn[i] && dependsOn[i].length){
			var tmp={
			_curDist:0
			};
			delete this.initCaller[name];
			if(dependsOn[i] instanceof Array){
			tmp._dstnce=dependsOn[i].length;
			for(var j=0,ele=dependsOn[i];j<ele.length;j++){
			tmp[ele[j]]=true;
			this._buildQueue(ele[j],name);
			}
			cur.dependsOn.push(tmp);
			}
			else if(typeof(dependsOn[i])==='string'){
			tmp._dstnce=1;
			tmp[dependsOn[i]]=true;
			this._buildQueue(dependsOn[i],name);
			cur.dependsOn.push(tmp);
			}
			else{
			throw {
			name:"error",
			level:"wrong format",
			message:"dependency for job "+name+" supplied in wrong format",
			toString:function(){ return this.name+": "+this.message;}
			};
			}
			
			}
			}
			}else{
			throw {
			name:"error",
			level:"Not Found",
			message:"Job "+name+" not found in methodpool",
			toString:function(){ return this.name+": "+this.message;}
			};			
			}	
			};
			
			speedupjs.asynchCallsManager.prototype.reset=function(){
			this._openRequest=0;
			for(var each in this._callObj){
			if(this._callObj.hasOwnProperty(each)){
			this._callObj[each].isReached=false;
			var cur=this._callObj[each].dependsOn;
			for(var i=0;i<cur.length;i++){
			cur[i]._curDist=0;
			}
			}
			}
			
			};
			speedupjs.asynchCallsManager.prototype.begin=function(){
			this._beginTimeStamp=Date.now();
			this.reset();
			var recvr= this._onBegin.receiver||this._receiver;
			if(this._onBegin.job){
			this._onBegin.job.call(recvr,this);
			}
			this._openRequest+=Object.keys(this.initCaller).length;
			for(var each in this.initCaller){
			var jobRecvr=this._callObj[each].receiver|| this._receiver;
			this._callObj[each].isReached=true;
			this._callObj[each].job.call(jobRecvr,this,each);
			}
			};
			speedupjs.asynchCallsManager.prototype.getJobCompletionTime=function(){
			return (this._jobCompletionTime-this._beginTimeStamp)+" ms";
			};
			speedupjs.asynchCallsManager.prototype.addJob=function(name,job,o){
			var _callObj=this._callObj;
			_callObj[name]=job;
			_callObj[name].dependsOn=[];
			_callObj[name]._dstnce=0;
			_callObj[name].nextJob={_onsuccess:[],_onerror:[],_oncomplete:[]};
			this._sequence.push({name:name,dependsOn:o.dependsOn});
			this._updateDependency(name,o.dependsOn);
			};
			speedupjs.asynchCallsManager.prototype.setDataByKey=function(key,value){
			this._dataObj[key]=value;
			};
			speedupjs.asynchCallsManager.prototype.getDataByKey=function(key){
			return this._dataObj[key];
			};
			speedupjs.asynchCallsManager.prototype.getCurrentJobName=function(jobName){
			return jobName;
			};
			speedupjs.asynchCallsManager.prototype._job=function(o,name,prev){
			if(!o.isReached && o.job){
			var recvr= o.receiver||this._receiver;
			for(var i=0;i<o.dependsOn.length;i++){
			if(o.dependsOn[i][prev]){
			if(o.dependsOn[i]._dstnce==(++o.dependsOn[i]._curDist)){
			o.isReached=true;
			o.dependsOn[i]._curDist=0;
			this._openRequest++;
			o.job.call(recvr,this,name);
			}
			}
			}
			}
			
			
			};
			
			speedupjs.asynchCallsManager.prototype._next=function(jobQueue,prev){
			for(var i=0;i<jobQueue.length;i++){
			this._job(this._callObj[jobQueue[i]],jobQueue[i],prev);
			}
			};
			speedupjs.asynchCallsManager.prototype.success=function(cur,d){
			var cO=this._callObj[cur];
			var recvr= cO.receiver||this._receiver;
			if(cO.success){
			cO.success.apply(recvr,[this,cur,d]);
			}
			if(cO.complete){
			cO.complete.apply(recvr,[this,cur,d]);
			}
			this._next(cO.nextJob._onsuccess,cur+".success");
			this._next(cO.nextJob._oncomplete,cur+".complete");
			this.isAllDone();
			};
			speedupjs.asynchCallsManager.prototype.error=function(cur,d){
			var cO=this._callObj[cur];
			var recvr= cO.receiver||this._receiver;
			if(cO.error){
			cO.error.apply(recvr,[this,cur,d]);
			}
			if(cO.complete){
			cO.complete.apply(recvr,[this,cur,d]);
			}	
			this._next(cO.nextJob._onerror,cur+".error");
			this._next(cO.nextJob._oncomplete,cur+".complete");
			this.isAllDone();
			};
			speedupjs.asynchCallsManager.prototype.isAllDone=function(){
			if((--this._openRequest)==0){
			if(this._onAllDone && this._onAllDone.job){
			this._jobCompletionTime=Date.now();
			this._onAllDone.job.apply(this._receiver,[this,this._onAllDone]);	
			}
			}
			};
			
			speedupjs.asynchCallsManager.prototype._setProperty=function(id,prop,val,isRoot){
			if(isRoot){
			this[prop]=val;
			}
			else{
			if(this._callObj[id]){
			this._callObj[id][prop]=val;
			}
			else{
			throw{
			name:"error",
			message:"member with name "+id+" not found",
			toString:function(){return this.name+": "+this.message;}
			};
			}
			}
			
			};
			speedupjs.asynchCallsManager.prototype.setSuccessHandler=function(name,fn){
			this._setProperty(name, "success", fn);
			};
			speedupjs.asynchCallsManager.prototype.setErrorHandler=function(name,fn){
			this._setProperty(name, "error", fn);
			};
			speedupjs.asynchCallsManager.prototype.setJob=function(name,fn){
			this._setProperty(name, "job", fn);
			};
			speedupjs.asynchCallsManager.prototype.setOnComplete=function(name,fn){
			this._setProperty(name, "onComplete", fn);
			};
			speedupjs.asynchCallsManager.prototype.setReceiverByJob=function(name,o){
			this._setProperty(name, "receiver", o);
			};
			speedupjs.asynchCallsManager.prototype.setReceiver=function(o){
			this._setProperty(null, "_receiver", o,true);
			};

}
