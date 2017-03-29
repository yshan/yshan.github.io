var INFINITE = 999999;
var MIN_NODES = 10000;
var MIN_TICK = 1000;

var EVAL_SCORES =[500 ,-150 ,30 ,10 ,10 ,30 ,-150 ,500 ,
				 -150,-250 ,0  ,0  ,0  ,0  ,-250 ,-150,
				 30  ,0    ,1  ,2  ,2  ,1  ,0    ,30  ,
				 10  ,0    ,2  ,16 ,16 ,2  ,0    ,10  ,
				 10  ,0    ,2  ,16 ,16 ,2  ,0    ,10  ,
				 30  ,0    ,1  ,2  ,2  ,1  ,0    ,30  ,
				 -150,-250 ,0  ,0  ,0  ,0  ,-250 ,-150,
				 500 ,-150 ,30 ,10 ,10 ,30 ,-150 ,500 ];

var BONUS_SCORE = 30;
var LIBERTY_SCORE = 8;

function Brain(){
	var nodeCount = 0;
	var defaultdepth = 6;
	var maxdepth;
	var finaldepth = 18;
	
	var heuristic = function(board,player){
		++nodeCount; //update counter
		var	c1=0,c2=0;
		var s1=0,s2=0;
		var data = board._getData();
		for(var x=1;x<=BS;++x){
			for(var y=1;y<=BS;++y){
				var i = (x-1)+(y-1)*BS;
				var chess = data[i];
				if(chess == 0){
					continue;
				}
				var liberty = 0;
				for(var dx=-1;dx<=1;++dx){
					for(var dy=-1;dy<=1;++dy){
						var tx = x+dx;
						var ty = y+dy;
						var t = (tx-1)+(ty-1)*BS;
						if(tx>=1 && tx<=BS && ty>=1 && ty<=BS && data[t]==0){
							++liberty;
						}
					}
				}
				if(chess == player){
					++c1;
					s1 += EVAL_SCORES[i];
					s1 -= liberty*LIBERTY_SCORE;
				}
				else{
					++c2;
					s2 += EVAL_SCORES[i];
					s2 -= liberty*LIBERTY_SCORE;
				}
			}
		}
		
		if(c1 == 0) return -INFINITE;
		if(c2 == 0) return INFINITE;
		if(c1+c2 == BS*BS){
			if(c1>c2) return INFINITE;
			else if(c2>c1) return -INFINITE;
		}
		
		//corner check
		var checkCorner = function(arr){
			var corner = arr[0];
			var cornerChess = data[corner];
			if(cornerChess!=0){
				//calc the adjust chess score
				for(var i=1;i<=3;++i){
					var chess = data[arr[i]];
					if(chess == 0){
						continue;
					}
					else if(chess == player){
						s1 -= EVAL_SCORES[arr[i]];
					}
					else{
						s2 -= EVAL_SCORES[arr[i]];
					}
				}
				//calc the bonus: x direction
				var tmp = corner;
				for(var i=0;i<BS-2;++i){
					tmp += arr[4];
					if(data[tmp]!=cornerChess){
						break;
					}
					if(player == cornerChess){
						s1 += BONUS_SCORE;
					}
					else{
						s2 += BONUS_SCORE;
					}
				}
				//calc the bonus: y direction
				tmp = corner;
				for(var i=0;i<BS-2;++i){
					tmp += (arr[5]*BS);
					if(data[tmp]!=cornerChess){
						break;
					}
					if(player == cornerChess){
						s1 += BONUS_SCORE;
					}
					else{
						s2 += BONUS_SCORE;
					}
				}
			}
		};
		checkCorner([0,1,8,9,1,1]);
		checkCorner([7,6,14,15,-1,1]);
		checkCorner([56,48,49,57,1,-1]);
		checkCorner([63,54,55,62,-1,-1]);
		
		//console.debug("c1:"+c1+",c2:"+c2+",s1:"+s1+",s2:"+s2);
		return (s1-s2);
	};
	
	var exactscore = function(board,player){
		++nodeCount;
		var bw = board.getChessCount();
		var score = 0;
		if(bw[0]>bw[1]){
			score = INFINITE;
		}
		else if(bw[0]<bw[1]){
			score = -INFINITE;
		}
		if(player ==  WHITE){
			score = -score;
		}
		return score;
	}
	
	var getHeuristicValue = function(board,player,step){
		board.putChess(step[0],step[1]);
		var score = heuristic(board,player);
		board.undo();
		return score;
	}
	
	var hsearch = function(board, player, depth,alpha,beta){
		if(depth == 0){
			return {'score':heuristic(board,player),'step':[]};
		}
		var max = (board.getPlayer() == player);
		var score = max?(-INFINITE-1):(INFINITE+1);
		var steps = board.getPutableList();
		var bestStep = [0,0];
		if(steps.length>0){
			//sort the steps for better cut
			var heuristics ={};
			for(var i=0;i<steps.length;++i){
				var step = steps[i];
				heuristics[step]=getHeuristicValue(board,player,step);
			}
			steps.sort(function(a,b){
				return max?(heuristics[b]-heuristics[a]):(heuristics[a]-heuristics[b]);
			});
			
			if(depth == 1){
				var step = steps[0];
				score = heuristics[step];
				bestStep[0] = step[0];
				bestStep[1] = step[1];
			}
			else{
				for(var i=0;i<steps.length;++i){
					var step = steps[i];
					board.putChess(step[0],step[1]);
					var ret = hsearch(board, player,depth-1,alpha,beta);
					board.undo();
					if(depth == maxdepth){ //only output the first level
						console.debug("eval step:"+step+",score:"+ret.score+",depth:"+depth);
					}
					if(max){
						if(ret.score>score) {
							score = ret.score;
							bestStep[0] = step[0];
							bestStep[1] = step[1];
						}
						alpha = (alpha>score?alpha:score);
						if(alpha>=beta){ //beta cutoff
							break;
						}
					}
					else{
						if(ret.score<score) {
							score = ret.score;
							bestStep[0] = step[0];
							bestStep[1] = step[1];
						}
						beta = (beta<score?beta:score);
						if(alpha>=beta){ //alpha cutoff
							break;
						}
					}
				}
			}
		}
		else{
			if(!board.isGameOver()){
				board.skipPutChess();
				var ret = hsearch(board, player,depth,alpha,beta);
				score = ret.score;
				bestStep = [];
				board.undo();
			}
			else{
				score = exactscore(board,player);
				bestStep = [];
			}
		}
		return {'score':score,'step':bestStep};
	}
	
	var esearch = function(board, player, depth,alpha,beta){
		if(depth == 0){
			return {'score':exactscore(board,player),'step':[]};
		}
		var max = (board.getPlayer() == player);
		var score = max?(-INFINITE-1):(INFINITE+1);
		var steps = board.getPutableList();
		var bestStep = [0,0];
		if(steps.length>0){
			for(var i=0;i<steps.length;++i){
				var step = steps[i];
				board.putChess(step[0],step[1]);
				var ret = esearch(board, player,depth-1,alpha,beta);
				board.undo();
				if(depth == maxdepth){ //only output the first level
					console.debug("eval step:"+step+",score:"+ret.score+",depth:"+depth);
				}
				if(max){
					if(ret.score>score) {
						score = ret.score;
						bestStep[0] = step[0];
						bestStep[1] = step[1];
					}
					alpha = (alpha>score?alpha:score);
					if(alpha>=beta){ //beta cutoff
						break;
					}
				}
				else{
					if(ret.score<score) {
						score = ret.score;
						bestStep[0] = step[0];
						bestStep[1] = step[1];
					}
					beta = (beta<score?beta:score);
					if(alpha>=beta){ //alpha cutoff
						break;
					}
				}
			}
		}
		else{
			if(!board.isGameOver()){
				board.skipPutChess();
				var ret = esearch(board, player,depth,alpha,beta);
				score = ret.score;
				bestStep = [];
				board.undo();
			}
			else{
				score = exactscore(board,player);
				bestStep = [];
			}
		}
		return {'score':score,'step':bestStep};
	}

	this.setLevel= function(sd,fd){
		defaultdepth=sd;
		finaldepth=fd;
	}
	
	this.findBestStep = function(board){
		var steps = board.getPutableList();
		var cc = board.getChessCount();
		var player = board.getPlayer();
		var chessCount = cc[0]+cc[1];
		if(steps.length<=0){
			return [];
		}
		//if chess count is less than (BS-2)^2 , take the random strategy
		if(chessCount<=((BS-4)*(BS-4))){ //random select
			console.debug("random strategy");
			var radSteps = [];
			for(var i=0;i<steps.length;++i){
				var step = steps[i];
				if(step[0]>=3 && step[0]<=(BS-2) && step[1]>=3 && step[1]<=(BS-2)){
					radSteps.push(step);
				}
			}
			if(radSteps.length>0){
				var ri = Math.floor((Math.random()*radSteps.length));
				return radSteps[ri];
			}
		}
		if(chessCount>=BS*BS-finaldepth){ //exact search
			console.debug("exact strategy");
			maxdepth = BS*BS - chessCount;
			console.debug("try depth:"+maxdepth);
			nodeCount = 0;
			var tick = (new Date()).getTime();
			result = esearch(board,player,maxdepth,-INFINITE,INFINITE);
			tick = (new Date()).getTime()-tick;
			console.debug("best step:"+result.step+",eval nodeCount:"+nodeCount+",cost:"+tick+" ms");
			if(result.score!=(-INFINITE)){
				return result.step;
			}
		}
		//heuristic search
		console.debug("heuristic strategy");
		maxdepth = defaultdepth;
		var result;
		console.debug("try depth:"+maxdepth);
		nodeCount = 0;
		var tick = (new Date()).getTime();
		result = hsearch(board,player,maxdepth,-INFINITE,INFINITE);
		tick = (new Date()).getTime()-tick;
		console.debug("best step:"+result.step+",eval nodeCount:"+nodeCount+",cost:"+tick+" ms");
		return result.step;
	}
}