var INFINITE = 999999;

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

var FSCORE=[
	[0,0,'A1'],
	[1,5,'D2'],
	[1,5,'D3'],
	[1,5,'D4'],
	[1,10,'A2'],
	[1,15,'A3'],
	[1,30,'A2_A2'],
	[2,500,'A3_A3'],
	[2,1500,'D4_A3'],
	[2,2000,'D4_D4'],
	[2,2000,'A4'],
	[3,INFINITE,'A5']
];

var LSCORE=[
	[0,0,'A1'],
	[1,5,'D2'],
	[1,5,'D3'],
	[3,14000,'D4'],
	[1,10,'A2'],
	[2,1000,'A3'],
	[1,30,'A2_A2'],
	[2,1200,'A3_A3'],
	[3,15000,'D4_A3'],
	[3,20000,'D4_D4'],
	[3,20000,'A4'],
	[4,INFINITE]
];


function offset(pos,dx,dy){
	var t = pos%BS;
	var x = t+1;
	var y = (pos-t)/BS+1;
	x += dx;
	y += dy;
	if(x>=1 && x<=BS && y>=1 && y<=BS){
		return (x-1)+(y-1)*BS;
	}
	return -1;
}

function Brain(){
	var nodeCount = 0;
	var defaultdepth = 6;
	var maxdepth;
	var data;
	var pattern;
	var neighbors;
	
	var heuristic = function(player){
		++nodeCount; //update counter
		
		var s1=[0,0];
		var s2=[0,0];
		
		for(var i=0;i<BS*BS;++i){
			if(data[i]==player){
				var s = FSCORE[pattern[i]];
				if(s[0]>s1[0]){
					s1[0] = s[0];
					s1[1] = s[1];
				}
				else if(s[0]==s1[0]){
					if(s1[0]<2){
						s1[1] += s[1];
					}
					else{
						s1[1] = (s[1]>s1[1]?s[1]:s1[1]);
					}
				}
			}
			else if(data[i]!=0){
				var s = LSCORE[pattern[i]];
				if(s[0]>s2[0]){
					s2[0] = s[0];
					s2[1] = s[1];
				}
				else if(s[0]==s2[0]){
					if(s2[0]<2){
						s2[1] += s[1];
					}
					else{
						s2[1] = (s[1]>s2[1]?s[1]:s2[1]);
					}
				}
			}
		}
		
		if(s1[0]==s2[0]){
			if(s1[0]<2){
				return s1[1]-s2[1];
			}
			else{
				return s1[1]>s2[1]?s1[1]:-s2[1];
			}
		}
		else if(s1[0]>s2[0]){
			return s1[1];
		}
		else{
			return -s2[1];
		}
		return 0;
	};
	
	var check = function(index,side,dx,dy){
		var result = PD.A1;
		var num =1 ;
		var c1=0,c2=0;
		var s1=0,s2=0;
		
		for(var i=1;i<=4;++i){
			var t = offset(index,-i*dx,-i*dy);
			if(t<0){
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
			var t = offset(index,i*dx,i*dy);
			if(t<0){
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
					var temp_num_count = 0,ccc1,ccc2;
					var first = true;
					for(var j=i;j<=i+4;++j)
					{
						var t = index + j*dx + j*dy*BS;
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
			var t1 = offset(index,(c1-1)*dx,(c1-1)*dy);
			var t2 = offset(index,(c2+1)*dx,(c2+1)*dy);
			if(t1>=0 && t2>=0){
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
				if(ls>5)
				{
					if(lc == 2 && alive)
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
	
	var updatePattern = function(index){
		var player = data[index];
		if(player==0){
			return -1;
		}
		var result = new Array(12);
		for(var i=0;i<12;++i){
			result[i]=0;
		}
		result[check(index,player,1,0)]++;
		result[check(index,player,0,1)]++;
		result[check(index,player,1,1)]++;
		result[check(index,player,1,-1)]++;
		
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
		
		for(var j=11;j>=0;--j){
			if(result[j]!=0){
				return j;
			}
		}
	}
	
	var updateNeighbors = function(index){
		var flag = (data[index]==0)?-1:1;
		for(var dx=-2;dx<=2;++dx){
			for(var dy=-2;dy<=2;++dy){
				var j = offset(index,dx,dy);
				if(j>=0){
					neighbors[j] += flag;
				}
			}
		}
	}
	
	var updateNeighborsPattern = function(index){
		var f = function(dx,dy){
			for(var i=1;i<=4;++i){
				var j = offset(index,i*dx,i*dy);
				if(j>=0 && data[j]!=0){
					pattern[j] = updatePattern(j);
				}
			}
		};
		
		f(1,0);f(-1,0);
		f(0,1);f(0,-1);
		f(1,1);f(-1,-1);
		f(1,-1);f(-1,1);
	}
	
	var makeMove = function(player,step){
		data[step] = player;
		pattern[step] = updatePattern(step);
		updateNeighbors(step);
		updateNeighborsPattern(step);
		return pattern[step];
	}
	
	var undoMove = function(step){
		data[step] = 0;
		pattern[step] = -1 ;
		updateNeighbors(step);
		updateNeighborsPattern(step);
	}
	
	var getHeuristicValue = function(player,step){
		makeMove(player,step);
		var score = heuristic(player);
		undoMove(step);
		return score;
	}
	
	var getPutableList= function(){
		var steps = [];
		for(var i=0;i<BS*BS;++i){
			if(neighbors[i]>0 && data[i]==0){
				steps.push(i);
			}
		}
		return steps;
	}
	
	var hsearch = function(player,depth,alpha,beta){
		if(depth == 0){
			return {'score':heuristic(player),'step':[]};
		}
		var score = -INFINITE-1;
		var steps = getPutableList();
		var bestStep = [];
		if(steps.length>0){
			//sort the steps for better cut
			var heuristics ={};
			for(var i=0;i<steps.length;++i){
				var step = steps[i];
				heuristics[step]=getHeuristicValue(player,step);
			}
			steps.sort(function(a,b){
				return heuristics[b]-heuristics[a];
			});
			
			if(depth == 1){
				bestStep = [steps[0]];
				score = heuristics[bestStep];
				for(var i=1;i<steps.length;++i){
					var step = steps[i];
					if(heuristics[step]==score){
						bestStep.push(step);
					}
					else{
						break;
					}
				}
			}
			else{
				for(var i=0;i<steps.length && i<10;++i){
					var step = steps[i];
					var p = makeMove(player,step);
					var ret;
					if(p!=PD.A5){
						ret = hsearch(3-player,depth-1,-beta,-alpha);
						ret.score = -ret.score;
					}
					else{
						ret = {'score':INFINITE,'step':[step]};
					}
					undoMove(step);
					if(depth == maxdepth){ //only output the first level
						console.debug("eval step:"+step+"["+sop(step)+"],score:"+ret.score+",depth:"+depth);
					}
					if(ret.score>score){
						score = ret.score;
						bestStep = [step];
					}
					else if(ret.score == score){
						bestStep.push(step);
					}
					if(ret.score>=beta){
						break;
					}
					if(ret.score>=alpha){ 
						alpha = ret.score;
					}
				}
			}
		}
		else{
			score = heuristic(player);
			bestStep = [];
		}
		return {'score':score,'step':bestStep};
	}

	this.setLevel= function(sd){
		defaultdepth=sd;
	}
	
	this.getScore = function(board){
		pattern = new Array(BS*BS);
		neighbors = new Array(BS*BS);
		data = board._getData();
		var player = board.getPlayer();
		for(var i=0;i<BS*BS;++i){
			pattern[i]=-1;
			neighbors[i] = 0;
		}
		for(var i=0;i<BS*BS;++i){
			if(data[i]!=0){
				pattern[i] = updatePattern(i);
				updateNeighbors(i);
			}
		}
		var steps = getPutableList();
		var heuristics ={};
		for(var i=0;i<steps.length;++i){
			var step = steps[i];
			heuristics[step]=getHeuristicValue(player,step);
		}
		return heuristics;
	}
	
	this.getPattern = function(board){
		pattern = new Array(BS*BS);
		data = board._getData();
		for(var i=0;i<BS*BS;++i){
			pattern[i]=-1;
		}
		for(var i=0;i<BS*BS;++i){
			if(data[i]!=0){
				pattern[i] = updatePattern(i);
			}
		}
		return pattern;
	}
	
	this.findBestStep = function(board){
		pattern = new Array(BS*BS);
		neighbors = new Array(BS*BS);
		data = board._getData();
		var player = board.getPlayer();
		for(var i=0;i<BS*BS;++i){
			pattern[i]=-1;
			neighbors[i] = 0;
		}
		for(var i=0;i<BS*BS;++i){
			if(data[i]!=0){
				pattern[i] = updatePattern(i);
				updateNeighbors(i);
			}
		}
		maxdepth = defaultdepth;
		var result;
		console.debug("try depth:"+maxdepth);
		nodeCount = 0;
		var tick = (new Date()).getTime();
		result = hsearch(player,maxdepth,-INFINITE,INFINITE);
		tick = (new Date()).getTime()-tick;
		var s;
		if(result.score == -INFINITE){
			result = hsearch(player,1,-INFINITE,INFINITE);
			s=result.step[0];
		}
		else{
			if(result.step.length>1){
				var ri = Math.floor((Math.random()*result.step.length));
				s=result.step[ri];
			}
			else{
				s=result.step[0];
			}
		}
		var step=sop(s);
		console.debug("best step:"+s+"["+step+"],eval nodeCount:"+nodeCount+",cost:"+tick+" ms");
		return step;
	}
}