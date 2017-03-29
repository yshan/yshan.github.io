var BS = 8; //BLORD SIZE
var CENTER = BS/2;
var BLACK = 1;
var WHITE = 2;

function pos(x,y){
	return (x-1)+(y-1)*BS;
}

function Board(){
	var data = new Array(BS*BS);
	var currentPlayer = BLACK;
	var history = [];
	
	var trogglePlayer = function(){
		currentPlayer = ((currentPlayer==BLACK)?WHITE:BLACK);
	};
	
	this.reset = function(){
		for(var i=0;i<BS*BS;++i){
			data[i] = 0;
		}
		data[pos(CENTER,CENTER)] = data[pos(CENTER+1,CENTER+1)] = WHITE;
		data[pos(CENTER,CENTER+1)] = data[pos(CENTER+1,CENTER)] = BLACK;
		currentPlayer = BLACK;
		history = [];
	};
	
	this.isGameOver = function(){
		var result = false;
		if(!this.canPutAnyChess()){
			trogglePlayer();
			if(!this.canPutAnyChess()){
				result = true;
			}
			trogglePlayer();
		}
		return result;
	}
	
	this.getChess = function(x,y){
		return data[pos(x,y)];
	};
	
	this.getPlayer = function(){
		return currentPlayer;
	}
	
	this.getChessCount = function(player){
		var b=0,w=0;
		for(var i=0;i<BS*BS;++i){
			if(data[i]==BLACK){
				++b;
			}
			else if(data[i]==WHITE){
				++w;
			}
		}
		
		if(player == BLACK){
			return b;
		}
		else if(player == WHITE){
			return w;
		}
		else{
			return [b,w];
		}
	}
	
	var check = function(x,y,dx,dy,reverse,cb){
		var found = false;
		var c = 0;
		while(true){
			x += dx;
			y += dy;
			if( x<1 || x>BS || y<1 || y>BS){
				break;
			}					
			var chess = data[pos(x,y)];
			if(chess==0){
				break;
			}
			else if(chess==currentPlayer){
				found = true;
				break;
			}
			else{
				++c;
			}
		}
		if(c>0 && found){
			if(reverse){
				for(;c>0;--c){
					x -= dx;
					y -= dy;
					data[pos(x,y)] = currentPlayer;
					cb(x,y);
				}
			}
			return true;
		}
		return false;
	};
	
	this.canPutChess = function(x,y){
		if(data[pos(x,y)]==0){
			if(check(x,y,1,1) || check(x,y,1,0) || check(x,y,1,-1) || check(x,y,0,1) || check(x,y,0,-1)
				|| check(x,y,-1,1) || check(x,y,-1,0) || check(x,y,-1,-1)){
				return true;
			}
		}
		return false;
	};
	
	this.getPutableList = function(){
		var result = [];
		for(var x=1;x<=BS;++x){
			for(var y=1;y<=BS;++y){
				if(this.canPutChess(x,y)){
					result.push([x,y]);
				}
			}
		}
		return result;
	}
	
	this.canPutAnyChess = function(){
		for(var x=1;x<=BS;++x){
			for(var y=1;y<=BS;++y){
				if(this.canPutChess(x,y)){
					return true;
				}
			}
		}
		return false;
	}
	
	this.putChess = function(x,y){
		if(data[pos(x,y)]==0){
			var changed = [];
			var saveChanged = function(tx,ty){
				changed.push([tx,ty]);
			};
			check(x,y,1,1,true,saveChanged);
			check(x,y,1,0,true,saveChanged);
			check(x,y,1,-1,true,saveChanged);
			check(x,y,0,1,true,saveChanged);
			check(x,y,0,-1,true,saveChanged);
			check(x,y,-1,-1,true,saveChanged);
			check(x,y,-1,0,true,saveChanged);
			check(x,y,-1,1,true,saveChanged);
			
			if(changed.length>0){
				data[pos(x,y)] = currentPlayer;
				changed.push([x,y]);
				history.push(changed);
				trogglePlayer();
				return true;
			}
		}
		return false;
	};
	
	this.skipPutChess = function(){
		if(!this.canPutAnyChess()){
			history.push([]);
			trogglePlayer();
			return true;
		}
		return false;
	}
	
	this.undo = function(){
		if(history.length>0){
			var flipped = (history.length%2==0?BLACK:WHITE);
			var step = history.pop();
			if(step!=null && step.length>0){
				for(var i=0;i<step.length-1;++i){ //flip
					var chess = step[i];
					data[pos(chess[0],chess[1])] = flipped;
				}
				var chess = step[step.length-1];
				data[pos(chess[0],chess[1])] = 0;
			}
			trogglePlayer();
			return true;
		}
		return false;
	};
	
	this._getData = function(){
		return data;
	}
	
	this.reset();
}
