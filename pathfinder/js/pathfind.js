var INF = 99999;
var DIR = [[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];

function BFS(){
	this.findPath = function(sx,sy,ex,ey,maze,size){
		var cost = new Array(maze.length);
		var next = new Array(maze.length);
		for(var i=0;i<maze.length;++i){
			cost[i] = INF;
		}
	
		var extend = function(c){
			var x = c%size;
			var	y = (c-x)/size;
			var result = [];
			for(var d=0;d<DIR.length;++d){
				var dd = DIR[d];
				var dx = dd[0], dy = dd[1];
				var nx = x+dx;
				var ny = y+dy;
				var distance;
				var extraCheck;
				if(d>3){
					distance = 1.4;
					extraCheck = (maze[nx+y*size]>=0 || maze[x+ny*size]>=0);
				}
				else{
					distance = 1;
					extraCheck = true;
				}
				if(nx>=0 && nx<size && ny>=0 && ny<size){
					var index = nx+ny*size;
					if(extraCheck && maze[index]>=0){
						if(cost[index]>cost[c]+distance){
							cost[index] = cost[c]+distance;
							next[index] = c;
							result.push(index);
						}
					}
				}
			}
			return result;
		};
		var openlist = [];
		var start = sx + size*sy;
		var end = ex + size*ey;
		cost[start] = 0;
		openlist.unshift(start);
		while(openlist.length>0){
			var current = openlist.pop();
			var extended = extend(current);
			for(var i=0;i<extended.length;++i){
				var e = extended[i];
				if(e==end){
					var path = [];
					var point = end;
					while(point!=start){
						path.unshift(point);
						point = next[point];
					}
					path.unshift(start);
					return path;
				}
				openlist.unshift(e);
			}
		}
		return [];
	}
}

function GREED(){
	this.findPath = function(sx,sy,ex,ey,maze,size){
		var start = sx + size*sy;
		var end = ex + size*ey;
		var include = new Array(maze.length);
		var prev = new Array(maze.length);
		for(var i=0;i<maze.length;++i){
			include[i]=1;
		}
		
		var extend = function(c){
			var x = c%size;
			var	y = (c-x)/size;
			var result = [];
			for(var d=0;d<DIR.length;++d){
				var dd = DIR[d];
				var dx = dd[0], dy = dd[1];
				var nx = x+dx;
				var ny = y+dy;
				var extraCheck = (d<=3)||(maze[nx+y*size]>=0 || maze[x+ny*size]>=0);
				if(nx>=0 && nx<size && ny>=0 && ny<size){
					var index = nx+ny*size;
					if(extraCheck && maze[index]>=0 && include[index]){
						var estimated = Math.abs(ex-nx)+Math.abs(ey-ny);
						result.push([index,estimated]);
					}
				}
			}
			return result;
		}
		
		var current = start;
		var currentPath = {};
		while(true){
			currentPath[current]=1;
			var moves = extend(current);
			if(moves.length>0){
				moves.sort(function(a,b){
					return a[1]-b[1];
				});
				if(moves[0][1]==0){ //find
					prev[end] = current;
					break;
				}
				var found = false;
				for(var i=0;i<moves.length;++i){
					var move = moves[i][0];
					if(!currentPath[move]){
						prev[move] = current;
						current = move;
						found = true;
						break;
					}
				}
				if(found){
					continue;
				}
			}
			if(current==start){ //failed
				return [];
			}
			include[current]=0;
			delete currentPath[current];
			current = prev[current];
		}

		var path = [];
		var point = end;
		while(point>=0 && point!=start){
			path.unshift(point);
			point = prev[point];
		}
		path.unshift(start);
		return path;
	}
}

function ASTAR(){
	
	this.findPath = function(sx,sy,ex,ey,maze,size){
		var start = sx + size*sy;
		var end = ex + size*ey;
	
		function Node(n,p,cost){
			this.index = n;
			var x = n%size;
			var y = (n-x)/size;
			var dx = ex-x;
			var dy = ey-y;
			this.h = Math.sqrt(dx*dx+dy*dy);
			if(p){
				this.g = p.g+cost;
				this.prev = p;
			}
			else{
				this.g = 0;
				this.prev = null;
			}
			this.f = this.g+this.h;
		}
		
		var extend = function(pnode){
			var c = pnode.index;
			var x = c%size;
			var	y = (c-x)/size;
			var result = [];
			for(var d=0;d<DIR.length;++d){
				var dd = DIR[d];
				var dx = dd[0], dy = dd[1];
				var nx = x+dx;
				var ny = y+dy;
				var distance;
				var extraCheck;
				if(d>3){
					distance = 1.4;
					extraCheck = (maze[nx+y*size]>=0 || maze[x+ny*size]>=0);
				}
				else{
					distance = 1;
					extraCheck = true;
				}
				if(nx>=0 && nx<size && ny>=0 && ny<size){
					var index = nx+ny*size;
					if(extraCheck && maze[index]>=0){
						var n = new Node(index,pnode,distance);
						result.push(n);
					}
				}
			}
			return result;
		}
				
		function OpenList(){
			var fList = []; //binary heap
			var indexSet ={};
			
			var sink = function(n){
				var length = fList.length;
				var element = fList[n];
				var swap = null;
				while(true){
					var child2n = 2*(n+1),child1n=child2n-1;
					var minest = n;
					if(child1n<length){
						if(fList[child1n].f<fList[minest].f){
							minest = child1n;
						}
					}
					if(child2n<length){
						if(fList[child2n].f<fList[minest].f){
							minest = child2n;
						}
					}
					if(minest!=n){
						fList[n]= fList[minest];
						fList[minest] = element;
						n = minest;
					}
					else{
						break;
					}
				}
			}
			
			var bubble = function(n){
				var element = fList[n];
				while(n>0){
					var parentn = (n%2==0)?(n/2-1):((n+1)/2-1);
					var parent = fList[parentn];
					if(parent.f>element.f){
						fList[parentn] = element;
						fList[n] = parent;
						n = parentn;
					}
					else{
						break;
					}
				}
			}
			
			this.searchNode = function(nindex){
				if(indexSet.hasOwnProperty(nindex)){
					return indexSet[nindex];
				}
				return null;
			}
			
			this.popNode = function(){
				var node = null;
				if(fList.length>0){
					if(fList.length<=2){
						node = fList.shift();
					}
					else{
						node = fList[0];
						fList[0] = fList.pop();
						sink(0);
					}
				}
				if(node){
					delete indexSet[node.index];
				}
				return node;
			}
			
			this.isEmpty = function(){
				for(var t in indexSet){
					return false;
				}
				return true;
			}
			
			this.insertNode = function(node){
				var nindex = node.index;
				indexSet[nindex] = node;
				fList.push(node);
				bubble(fList.length-1);
			}
			
			this.removeNode = function(nindex){
				var node = indexSet[nindex];
				delete indexSet[nindex];
				var length = fList.length;
				for(var i=0;i<length;++i){
					if(fList[i].index == nindex){
						var end = fList.pop();
						if(i!=length-1){
							fList[i] = end;
							if(end.f<node.f){
								bubble(i);
							}
							else{
								sink(i);
							}
						}
						return;
					}
				}
			}
		}
		
		var openlist = new OpenList();
		var closed = {};
		
		var startnode = new Node(start);
		openlist.insertNode(startnode);
		
		var found = false;
		var parentnode =null;
		
		while(!openlist.isEmpty()){
			parentnode = openlist.popNode();
			var parent = parentnode.index;
			if(parent == end){ //find
				found = true;
				break;
			}
			closed[parent] = 1;
			
			var nodes= extend(parentnode);
			for(var i=0;i<nodes.length;++i){
				var node = nodes[i];
				if(closed[node.index]){
					continue;
				}
				var opennode = openlist.searchNode(node.index);
				if(opennode){
					if(opennode.g>node.g){
						openlist.removeNode(node.index);
						openlist.insertNode(node);
					}
				}
				else{
					openlist.insertNode(node);
				}
			}
		}
		
		if(found){
			var path = [];
			var node = parentnode;
			while(node.prev!=null){
				path.push(node.index);
				node = node.prev;
			}
			path.push(start);
			return path;
		}
		return [];
	}
}

function GA(){
	var POP_SIZE = 200;
	var CROSS_PROB = 0.07;
	var MUTATE_PROB = 0.01;
	
	function Solution(){
		this.moves = [];
		this.fitness = 0;
	}
	
	this.findPath = function(sx,sy,ex,ey,maze,size){
		var solutions = new Array(2);
		var cur = 0;
		var sum = 0.0;
		var min = 999;
		var max = 0.0;
		var avg = 0.0;
		var bestSol = 0;
	
		var initPop = function(){
			solutions[0]=[];
			solutions[1]=[];
			var sol = solutions[cur];
			for(var i=0;i<POP_SIZE;++i){
				var s = new Solution();
				for(var j=0;j<size*3;++j){
					s.moves.push(Math.floor(Math.random()*8));
				}
				sol.push(s);
			}
		};
		
		var computeFitness = function(moves){
			var x=sx, y=sy;
			var path ={};
			for(var i=0;i<moves.length;++i){
				var m = moves[i];
				if(m<0){
					break;
				}
				var dd = DIR[m];
				var dx = dd[0];
				var dy = dd[1];
				var nx = x +dx;
				var ny = y +dy;
				var extraCheck = (m<=3)||(maze[nx+y*size]>=0 || maze[x+ny*size]>=0);
				var badmoves = true;
				if(nx>=0 && nx<size && ny>=0 && ny<size){
					var index = nx+ny*size;
					if(maze[index]==0){
						if(extraCheck && !path[index]){
							badmoves = false;
							path[index]=1;
							x=nx;
							y=ny;
						}
					}
					else if(nx==ex && ny==ey){
						return 100;
					}
				}
				if(badmoves){
					moves.splice(i,1);
					moves.push(-1);
					--i;
				}
			}
			var dx = ex -x;
			var dy = ey -y;
			var fitness = 100-(100*Math.sqrt(dx*dx+dy*dy)/(size*1.4));
			if(fitness<0){
				fitness = 0;
			}
			return fitness;
		}
		
		var computePopFitness = function(){
			var sol = solutions[cur];
			sum = 0.0;
			min = 999;
			max = 0.0;
			avg = 0.0;
			bestSol = 0;
			for(var i=0;i<sol.length;++i){
				var s = sol[i];
				var f = computeFitness(s.moves);
				if(f<min){
					min = f ;
				}
				if(f>max){
					max = f;
					bestSol = i;
				}
				sum += f;
				s.fitness = f;
			}
			avg = sum/(sol.length);
		};
		
		var mutate = function(x){
			if(x<0 || Math.random()<MUTATE_PROB){
				return Math.floor(Math.random()*8);
			}
			return x;
		}
		
		var selectParent = function(){
			var i = Math.floor(Math.random()*POP_SIZE);
			var count = POP_SIZE;
			var select = 0.0;
			while(count--){
				select = solutions[cur][i].fitness;
				if(Math.random()<(select/sum)){
					return i;
				}
				if(++i>=POP_SIZE) i=0;
			}
			return Math.floor(Math.random()*POP_SIZE);
		}
		
		var traceBest = function(){
			var sol = solutions[cur][bestSol];
			var moves = sol.moves;
			var x=sx, y=sy;
			var result = [x+y*size];
			for(var i=0;i<moves.length;++i){
				var m = moves[i];
				if(m<0){
					continue;
				}
				var dd = DIR[m];
				var dx = dd[0];
				var dy = dd[1];
				var nx = x +dx;
				var ny = y +dy;
				if(nx>=0 && nx<size && ny>=0 && ny<size){
					var index = nx+ny*size;
					if(maze[index]==0){
						x=nx;
						y=ny;
						result.push(index);
					}
					else if(nx==ex && ny==ey){
						result.push(index);
						return result;
					}
				}
			}
			return result;
		}
		
		var performGA = function(){
			var newCur = (cur==0)?1:0;
			var newSol = solutions[newCur];
			newSol.splice(0,newSol.length);
			var oldSol = solutions[cur];
			var len = oldSol.length;
			var ops = oldSol[0].moves.length;
			for(var i=0;i<len;i+=2){
				newSol.push(new Solution());
				newSol.push(new Solution());
				var parent1 = selectParent();
				var parent2 = selectParent();
				var crossover;
				if(Math.random()<CROSS_PROB){
					crossover = Math.floor(Math.random()*ops);
				}
				else{
					crossover = ops;
				}
				for(var j=0;j<ops;++j){
					if(j<crossover){
						newSol[i].moves[j]=mutate(oldSol[parent1].moves[j]);
						newSol[i+1].moves[j]=mutate(oldSol[parent2].moves[j]);
					}
					else{
						newSol[i].moves[j]=mutate(oldSol[parent2].moves[j]);
						newSol[i+1].moves[j]=mutate(oldSol[parent1].moves[j]);
					}
				}
			}
			cur = newCur;
		}
	
		initPop();
		var found = false;
		var generate = 0;
		while(generate<1000){
			computePopFitness();
			if((generate++)%50==0){
				console.log("generate:"+generate+",avg="+avg+",min="+min+",max="+max);
			}
			if(max>=100){ //found
				found = true;
				break;
			}
			if(avg>=(0.999*max)){
				break;
			}
			performGA();
		};
		
		if(found){
			return traceBest();
		}
		return[];
	}
}

