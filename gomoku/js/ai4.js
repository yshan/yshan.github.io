var PD={
	'A1':0,
	'D2':1,
	'D3':2,
	'D4':3,
	'A2':4,
	'A3':5,
	'A2_A2':6,
	'A3_A3':7,
	'D4_A3':8,
	'D4_D4':9,
	'A4':10,
	'A5':11
};

//pattern value
var PV=[
	0,1,2,4,8,16,32,64,128,256,512,1024
];

//first side
var FS=[0,1,2,3,7,9,12,14,18,19,20,22];
//last side
var LS=[0,4,5,11,6,8,10,13,15,16,17,21];

//direction
var LR=0,UD=1,RD=2,RU=3;
var DIR=[[1,0],[0,1],[1,1],[1,-1]];

var HASHES = new Array(DS);
(function(){
	for(var i=0;i<DS;++i){
		HASHES[i] = Math.floor(Math.random()*12345)+17;
	}
})();

function Pattern(){
	this.dir = new Array(4);
	this.threat = 0;
	this.maxdir;
	this.value = 0;
}

function Cell(){
	this.avail = false;
	this.pb = null;
	this.pw = null;
	this.depth = 0;
	this.prev = null;
	
	this.patterns = function(player){
		if(player==BLACK){
			return [this.pb,this.pw];
		}
		else{
			return [this.pw,this.pb];
		}
	}
}

function Brain(){
	var cells;
	var data;
	var currentHash;
	
	this.setLevel= function(level){
	};
	
	var checkAvail = function(index){
		if(data[index] == 0){
			var directions =[1,-1,BT,-BT,BT+1,-BT-1,BT-1,1-BT];
			for(var i=0;i<8;++i){
				var s = index;
				var dd = directions[i];
				for(var d=0;d<2;++d){
					s += dd;
					var c = data[s];
					if(c<0){
						break;
					}
					else if(c>0){
						return true;
					}
				}
			}
		}
		return false;
	}
	
	var check = function(index,side,dx,dy){
		var result = PD.A1;
		var num =1 ;
		var c1=0,c2=0;
		var s1=0,s2=0;
		
		for(var i=1;i<=4;++i){
			var t = index+(-i)*dx+(-i)*dy*(BT);
			if(data[t]<0){
				break;
			}
			var chess = data[t];
			if(chess == side){
				c1 = s1 = -i;
				++num;
			}
			else if(chess == 0)	{
				s1 = -i;
			}
			else{
				break;
			}
		}
	
		for(var i=1;i<=4;++i){
			var t = index+i*dx+i*dy*(BT);
			if(data[t]<0){
				break;
			}
			var chess = data[t];
			if(chess == side){
				c2 = s2 = i;
				++num;
			}
			else if(chess == 0){
				s2 = i;
			}
			else{
				break;
			}
		}
		
		var ls = s2-s1+1;
		if(ls>=5 && num>1){
			if(c2-c1>4) {//len is too long,cut to 5
				var maxnum = 0;
				var cc1,cc2;
				for(var i=c1;i<=c2-4;++i)
				{
					var temp_num_count = 1,ccc1,ccc2;
					var first = true;
					for(var j=i;j<=i+4;++j)
					{
						var t = index + j*dx + j*dy*(BT);
						if(data[t] == side)	{
							++temp_num_count;
							if(first){
								ccc2 = ccc1 = j;
								first = false;
							}
							else{
								ccc2 = j;
							}
						}
					}
					if(ccc1>0) ccc1 = 0;
					if(ccc2<0) ccc2 = 0;

					
					if(temp_num_count>maxnum){
						maxnum = temp_num_count;
						cc1 = ccc1;
						cc2 = ccc2;
					}
					else if (temp_num_count == maxnum){
						if(ccc2-ccc1<cc2-cc1){
							cc1 = ccc1;
							cc2 = ccc2;
						}
					}
				}
				num = maxnum;
				c1 = cc1;
				c2 = cc2;
				if(c1>0) c1=0;
				if(c2<0) c2=0;
			}//end if(c2-c1>4)
			
			var lc = c2-c1+1;
			
			var alive = false;
			var t1 = index+(c1-1)*dx+(c1-1)*dy*(BT);
			var t2 = index+(c2+1)*dx+(c2+1)*dy*(BT);
			if(data[t1]>=0 && data[t2]>=0){
				alive = (data[t1]==0 || data[t1]==side)	&& (data[t2]==0 || data[t2]==side);
			}
			
			switch(num)
			{
			case 5:
				result=PD.A5;
				break;
			case 4:
				result = (ls>5 && lc==4 && alive) ? PD.A4 : PD.D4;
				break;
			case 3:
				result = (ls>5 && lc<=4 && alive) ? PD.A3 : PD.D3;
				break;
			case 2:
				if(ls>5 && alive)
				{
					if(lc == 2)
					{
						result = PD.A2;
					}
					else if(lc == 3)
					{
						result = PD.D2;
					}
				}
				break;
			}
		}
		return result;
	}
	
	var getPattern= function(index,player){
		var result = new Array(12);
		var pattern = new Pattern;
		for(var i=0;i<12;++i){
			result[i]=0;
		}
		var maxdir=-1;
		var maxthreat = -1;
		for(var d=0;d<4;++d){
			var ddd = DIR[d];
			var dx = ddd[0],dy=ddd[1];
			var r = check(index,player,dx,dy);
			if(r==PD.A4 || r==PD.D4){
				maxdir = d;
				maxthreat = 4;
			}
			else if(maxthreat<4 && r==PD.A3){
				maxdir = d;
				maxthreat = 3;
			}
			pattern.dir[d] = r;
			result[r]++;
		}
		pattern.maxdir = maxdir;
		
		var a3 = result[PD.A3];
		var d4 = result[PD.D4];
		if(result[PD.A2]>=2){
			result[PD.A2_A2]++;
		}
		if(a3>=2){
			result[PD.A3_A3]++;
		}
		if(d4>=2){
			result[PD.D4_D4]++;
		}
		else if(d4>=1 && a3>=1){
			result[PD.D4_A3]++;
		}
		
		var p = 0;
		var max = 0;
		for(var j=11;j>=0;--j){
			if(result[j]!=0){
				p |= PV[j];
				if(max==0){
					max = j;
					pattern.threat = j;
				}
			}
		}
		pattern.value = p;
		return pattern;
	}
	
	var updateCell = function(index){
		var c = new Cell();
		if(data[index]==0){
			c.avail = checkAvail(index);
			if(c.avail){
				c.pb = getPattern(index,BLACK);
				c.pw = getPattern(index,WHITE);
			}
		}
		var prev = cells[index];
		if(prev){
			c.prev = prev;
			c.depth = prev.depth+1;
		}
		cells[index] = c;
	}
	
	var undoCell = function(index){
		var c = cells[index];
		if(c && c.prev){
			cells[index] = c.prev;
		}
	}
	
	var visitNeighbors= function(index,update){
		var directions =[1,-1,BT,-BT,BT+1,-BT-1,BT-1,1-BT];
		var takeAction = update?updateCell:undoCell;
		for(var i=0;i<8;++i){
			var s = index;
			var dd = directions[i];
			for(var d=0;d<4;++d){
				s += dd;
				var c = data[s];
				if(c<0){
					break;
				}
				takeAction(index);
			}
		}
	}
	
	var makeMove = function(player,step){
		var index = step[0]+step[1]*BT;
		data[index] = player;
		currentHash += (player*HASHES[index]);
		updateCell(index);
		visitNeighbors(index,true);
	}
	
	var undoMove = function(step){
		var index = step[0]+step[1]*BT;
		currentHash -= (data[index]*HASHES[index]);
		data[index] = 0;
		undoCell(index);
		visitNeighbors(index,false);
	}
	
	var defend = function(player,step){
		var steps = [];
		var steps_a4=[];
		var steps_d4=[];
		var x = step[0];
		var y = step[1];
		var index = x+y*BT;
		var c = cells[index].prev;
		var pd = (player==BLACK)?c.pw:c.pb;
		var d = pd.maxdir;
		if(d<0){
			d = 0;
		}
		var dd = DIR[d];
		var dx = dd[0],dy = dd[1];
		
		var f = function(dx,dy){
			for(var i=1;i<=4;++i){
				var sx = x+i*dx;
				var sy = y+i*dy;
				var j = sx+sy*(BS+2);
				if(data[j]<0){
					break;
				}
				if(data[j]==0){
					var c = cells[j];
					var pd = (player==BLACK)?c.pw:c.pb;
					var s = pd.value;
					if(s&PV[PD.A5]){
						steps=[[sx,sy]];
						return false;
					}
					if(s&PV[PD.A4]){
						steps_a4.push([sx,sy]);
					}
					else if(ss&PV[PD.D4]){
						steps_d4.push([sx,sy]);
					}
				}
			}
			return true;
		};
		
		if(f(dx,dy) && f(-dx,-dy)){
		}
		
		if(steps.length>0){
			return steps;
		}
		else if(steps_a4.length>1){
			return steps_a4;
		}
		else{
			return steps_a4.concat(steps_d4);
		}
	}
	
	var vcf = function(player,depth,result,parentStep,memo){
		if(memo.hasOwnProperty(currentHash)){
			return memo[currentHash];
		}
		var steps = [];
		var broken = false;
		for(var x=1;x<=BS;++x){
			for(var y=1;y<=BS;++y){
				var index = x+y*BT;
				var c = cells[index];
				if(c.avail){
					var patterns = c.patterns(player);
					var pm = patterns[0], pd = patterns[1];
					var p = pm.value;
					if((p&PV[PD.D4]) || (p&PV[PD.A4])){
						steps.push([x,y]);
					}
					if(pm.threat==PD.A5){
						result.push([x,y]);
						memo[currentHash] = true;
						return true;
					}
					if(pd.threat==PD.A5){
						broken = true;
					}
				}
			}
		}
		if(!broken){
			for(var i=0;i<steps.length;++i){
				var step = steps[i];
				if(parentStep){
					var dx = parentStep[0]-step[0];
					var dy = parentStep[1]-step[1];
					if(dx<0) dx = -dx;
					if(dy<0) dy = -dy;
					var distance = dx>dy?dx:dy;
					if(distance>6){
						continue;
					}
				}
				//console.debug("VCF try step:"+step+",depth:"+depth);
				makeMove(player,step);
				var opStep = defend(3-player,step)[0];
				makeMove(3-player,opStep);
				var find = vcf(player,depth+1,result,step,memo);
				undoMove(opStep);
				undoMove(step);
				if(find){
					result.push(step);
					memo[currentHash] = true;
					return true;
				}
			}
		}
		memo[currentHash] = false;
		return false;
	}
	
	var greed = function(player){
		var steps = [];
		var maxscore = {};
		var totalscore = {};
		for(var x=1;x<=BS;++x){
			for(var y=1;y<=BS;++y){
				var index = x+y*(BT);
				var c = cells[index];
				if(c.avail){
					var step = [x,y];
					var patterns = c.patterns(player);
					var fs = FS[patterns[0].threat];
					var ls = LS[patterns[1].threat];
					var score = (fs>ls)?fs:ls;
					var ts = fs+ls;
					if(ts>0){
						maxscore[step]= score;
						totalscore[step] = ts;
						steps.push(step);
					}
				}
			}
		}
		
		steps.sort(function(a,b){
			var s = maxscore[b]-maxscore[a];
			if(s!=0){
				return s;
			}
			s = totalscore[b]-totalscore[a];
			if(s!=0){
				return s;
			}
			return Math.random()-0.5;
		});
		
		return steps;
	}
	
	this.scan = function(board){
		data = board.getData();
		cells = new Array(DS);
		currentHash = 0;
		histories={};
		
		for(var i=0;i<DS;++i){
			updateCell(i);
			if(data[i]>0){
				currentHash += (HASHES[i]*data[i]);
			}
		}
		return cells;
	}

	this.findBestStep = function(board){
		var tick = (new Date()).getTime();
		var player = board.getPlayer();
		this.scan(board);
		var steps = greed(player);
		return steps[0];
	}
}