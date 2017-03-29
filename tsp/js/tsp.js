var computeCost = function(cities,path){
	var cost = 0.0;
	var c = cities[path[0]];
	var sx = c[0];
	var sy = c[1];
	for(var i=1,len=cities.length;i<len;++i){
		c = cities[path[i]];
		var ex = c[0];
		var ey = c[1];
		var dx = ex-sx;
		var dy = ey-sy;
		cost += Math.sqrt(dx*dx+dy*dy);
		sx = ex;
		sy = ey;
	}
	c = cities[path[0]];
	var ex = c[0];
	var ey = c[1];
	var dx = ex-sx;
	var dy = ey-sy;
	cost += Math.sqrt(dx*dx+dy*dy);
	return cost;
}

var randomPath = function(n){
	var path=[];
	for(var i=0;i<n;++i){
		path.push(i);
	}
	for(var i=0;i<n;++i){
		var j = Math.floor(Math.random()*n);
		if(i!=j){
			var tmp = path[i];
			path[i] = path[j];
			path[j] = tmp;
		}
	}
	return path;
}

var perturb = function(path){
	var i,j;
	var count = path.length;
	do{
		i = Math.floor(Math.random()*count);
		j = Math.floor(Math.random()*count);
	}while(i==j);
	
	var tmp = path[i];
	path[i] = path[j];
	path[j] = tmp;
}

function SA(){
	var cities;
	var temperature = 100.0;
	var currentCost;
	var currentPath;
	var count;
	var ALPHA = 0.999;
	var stable = 0;
	
	this.setCities = function(c){
		cities = c;
		count = cities.length;
		currentPath = randomPath(count);
		currentCost = computeCost(cities,currentPath);
	}
	
	this.findPath = function(){
		var found = false;
		if(temperature>0.0001 && stable<100){
			var path = currentPath.slice(0);
			perturb(path);
			var cost = computeCost(cities,path);
			var dc = cost - currentCost;
			if(dc<0.0 || (dc>0 && Math.exp((-dc/temperature))>Math.random())){
				currentPath = path;
				currentCost = cost;
				stable = 0;
			}
			else{
				++stable;
			}
		}
		else{
			found = true;
		}
		temperature = temperature*ALPHA;
		return {
			'path':currentPath,
			'cost':currentCost,
			'found':found
		};
	}
}

function GA(){
	var POP_SIZE = 200;
	var CROSS_PROB = 0.07;
	var MUTATE_PROB = 0.02;
	var stable = 0;
	var lastCost = 99999;
	
	var cities;
	var count;
	
	var solutions = new Array(2);
	var cur = 0;
	
	var generationInfo = {
		sum:0,
		min:99999,
		max:0.0,
		avg:0.0
	};
	
	function Solution(){
		this.path = [];
		this.cost = 0;
	}
	
	var initPop = function(){
		solutions[0]=[];
		solutions[1]=[];
		var sol = solutions[cur];
		for(var i=0;i<POP_SIZE;++i){
			var s = new Solution();
			s.path = randomPath(count);
			s.cost = computeCost(cities,s.path);
			sol.push(s);
		}
	};
	
	var findBestSol = function(){
		var sol = solutions[cur];
		var bestSol;
		generationInfo = {
			sum:0,
			min:99999,
			max:0.0,
			avg:0.0
		};
		for(var i=0;i<POP_SIZE;++i){
			var s = sol[i];
			var c = s.cost;
			if(c==0){
				c = s.cost = computeCost(cities,s.path);
			}
			generationInfo.sum += c;
			if(generationInfo.min>c){
				generationInfo.min = c;
				bestSol = s;
			}
			if(generationInfo.max<c){
				generationInfo.max = c;
			}
		}
		generationInfo.avg = generationInfo.sum/POP_SIZE;
		return bestSol;
	}
	
	this.setCities = function(c){
		cities = c;
		count = cities.length;
		initPop();
	}
	
	var selectParent = function(){
		var i = Math.floor(Math.random()*POP_SIZE);
		var n = POP_SIZE;
		var cost = 0.0;
		var sum = n*generationInfo.max - generationInfo.sum;
		while(n--){
			cost = generationInfo.max - solutions[cur][i].cost;
			if(Math.random()<(cost/sum)){
				return i;
			}
			if(++i>=POP_SIZE) i=0;
		}
		return Math.floor(Math.random()*POP_SIZE);
	}
	
	var performGA = function(){
		var newCur = (cur==0)?1:0;
		var newSol = solutions[newCur];
		newSol.splice(0,newSol.length);
		var oldSol = solutions[cur];
		var len = oldSol.length;
		for(var index=0;index<len;index+=2){
			newSol.push(new Solution());
			newSol.push(new Solution());
			var parent1 = selectParent();
			var parent2 = selectParent();
			var fp1  = oldSol[parent1].path;
			var fp2 = oldSol[parent2].path;
			var cp1 = newSol[index].path;
			var cp2 = newSol[index+1].path;
			if(Math.random()<CROSS_PROB){
                var cutpoint1;
                var cutpoint2;
				do{
					cutpoint1 = Math.floor(Math.random() * count);
					cutpoint2 = Math.floor(Math.random() * count);
				}while(cutpoint1==cutpoint2);
				
				if(cutpoint1>cutpoint2){
					var tmp = cutpoint1;
					cutpoint1 = cutpoint2;
					cutpoint2 = tmp;
				}
				
				var taken1 = {};
                var taken2 = {};
				
				for (var i = 0; i < count; i++){
					cp1.push(-1);
					cp2.push(-1);
                    if (!((i < cutpoint1) || (i > cutpoint2))){
                        cp1[i] = fp1[i];
                        cp2[i] = fp2[i];
                        taken1[fp1[i]] = true;
                        taken2[fp2[i]] = true;
                    }
                }
				
				function getNotTaken(all,taken){
					for(var i=0;i<count;++i){
						var c = all[i];
						if(!taken[c]){
							taken[c] = true;
							return c;
						}
					}
					return -1;
				}
				
				for (var i = 0; i < count; i++)  {
                    if ((i < cutpoint1) || (i > cutpoint2)){
                        cp1[i] = getNotTaken(fp2,taken1);
                        cp2[i] = getNotTaken(fp1,taken2);
                    }
                }
			}
			else{
				for (var i = 0; i < count; i++) {
					cp1.push(fp1[i]);
					cp2.push(fp2[i]);
				}
			}
			
			if(Math.random()<MUTATE_PROB){
				perturb(cp1);
				perturb(cp2);
			}
			
		}
		cur = newCur;
	}
	
	this.findPath = function(){
		var sol = findBestSol();
		if(sol.cost == lastCost){
			++stable;
		}
		else{
			lastCost = sol.cost;
			stable = 0;
		}
		performGA();
		return {
			'path':sol.path,
			'cost':sol.cost,
			'found':(generationInfo.avg>=(0.999*generationInfo.max) || stable>=100)
		};
	}
}


function ACO(){
	var LIT = 1e-30;
	var cities;
	var ants;
	var count;
	var stable = 0;
	
	//constants
	var NUM_ANTS = 20;
	var alpha = 1.0;
	var beta  = 1.0;
	var rho   = 0.9;
	var qval  = 100;
	
	var pheromone;
	var distance;
	var lastCost= 999999;
	
	function Ant(){
		this.currentCity = 0;
		this.nextCity = 0;
		this.tabu = {};
		this.cost = 0.0;
		this.path = [];
	}
	
	var initAnts = function(){
		//init ants
		ants = new Array(NUM_ANTS);
		for(var i=0;i<NUM_ANTS;++i){
			var ant = ants[i] = new Ant();
			var city = ant.currentCity = Math.floor(Math.random()*count);
			ant.tabu[city] = 1;
			ant.path.push(city);
		}
	}
	
	this.setCities = function(c){
		cities = c;
		count = cities.length;
		
		//init distance
		distance = new Array(count);
		for(var i=0;i<count;++i){
			var d = distance[i] = new Array(count);
			var from = cities[i];
			var sx = from[0];
			var sy = from[1];
			for(var j=0;j<count;++j){
				var to = cities[j];
				var ex = to[0];
				var ey = to[1];
				var dx = sx - ex;
				var dy = sy - ey;
				d[j] = Math.sqrt(dx*dx+dy*dy);
			}
		}
		
		//init pheromone
		pheromone = new Array(count);
		var basep = 1.0/count;
		for(var i=0;i<count;++i){
			var p = pheromone[i] = new Array(count);
			for(var j=0;j<count;++j){
				p[j] = basep;
			}
		}
		
		initAnts();
	}
	
	var moveAnts = function(){
		var moves = 0;
		for(var i=0;i<NUM_ANTS;++i){
			var ant = ants[i],
				tabu = ant.tabu;
			if(ant.path.length<count){
				var from = ant.currentCity;
				var	to;
				var d = 0.0;
				var tmpcache = new Array(count);
				for(to=0;to<count;++to){
					if(!tabu[to]){
						var tt = tmpcache[to] = Math.pow(pheromone[from][to],alpha)*Math.pow((1.0/distance[from][to]),beta);
						if(tt<=LIT) tt = tmpcache[to] = LIT;
						d += tt;
					}
				}
				to = 0;
				while(true){
					if(!tabu[to]){
						var p = tmpcache[to]/d;
						if (isNaN(p) || Math.random() < p){
							break;
						}
					}
					to = (to+1)%count;
				}
				ant.nextCity = to;
				tabu[to]=1;
				ant.path.push(to);
				ant.cost += distance[from][to];
				if(ant.path.length == count){
					ant.cost += distance[to][ant.path[0]];
				}
				ant.currentCity = ant.nextCity;
				++moves;
			}
		}
		return moves;
	}
	
	var evaporatePheromoneTrails = function(){
		for (var from = 0 ; from < count ; ++from) {
			for (var to = 0 ; to < count ; ++to) {
				pheromone[from][to] *= (1.0 - rho);
			}
		}
	}
	
	var intensifyPheromoneTrails = function(){
		for (var i = 0 ; i < NUM_ANTS ; i++) {
			var ant = ants[i];
			var cost = ant.cost;
			for (var city = 0 ; city < count ; city++) {
				var from = ant.path[city];
				var	to   = ant.path[((city+1)%count)];
				pheromone[from][to] += ((qval / cost) * rho);
				if (pheromone[from][to] <= LIT) pheromone[from][to] = LIT;
				pheromone[to][from] =  pheromone[from][to];
			}
		}
	}
	
	this.findPath = function(){
		var bestPath;
		var cost = 999999;
		
		while(true){
			if(moveAnts()==0){
				evaporatePheromoneTrails();
				intensifyPheromoneTrails();
				
				for(var i=0;i<NUM_ANTS;++i){
					var ant = ants[i];
					if(cost>ant.cost){
						cost = ant.cost;
						bestPath=ant.path.slice(0);
					}
				}
				initAnts();
				break;
			}
		}
		
		if(Math.abs(cost-lastCost)<=lastCost*0.01){
			++stable;
		}
		else{
			lastCost = cost;
			stable = 0;
		}
		return {
			'path':bestPath,
			'cost':cost,
			'found':(stable>=100)
		};
	}
}

function PSO(){
	var cities;
	var count;
	var stable = 0;
	var particles;
	
	var PARTICLE_NUM = 100;
	var V_MAX = 4; //max vecl
	
	var gBest = 99999;
	var lastCost = 99999;
	
	function Particle(){
		this.path = [];
		this.velocity = 0;
		this.cost = 0;
	};
	
	var initPopulation = function(){
		particles = new Array(PARTICLE_NUM);
		for(var i=0;i<PARTICLE_NUM;++i){
			var p = particles[i] = new Particle();
			p.path = randomPath(count);
			p.cost = computeCost(cities,p.path);
		}
	}
	
	this.setCities = function(c){
		cities = c;
		count = cities.length;
		initPopulation();
	}
	
	var copyPath =function(src,dst){
		var t = Math.floor(Math.random()*count);
		var targetA = src[t];
		var targetB = src[(t+1)%count];
		var indexA,indexB;
		
		for(var i=0;i<count;++i){
			var d= dst[i];
			if(d == targetA){
				indexA = i;
			}
			else if(d==targetB){
				indexB = i;
			}
		}
		var s = (indexA+1)%count;
		var tmp = dst[indexB];
		dst[indexB] = dst[s];
		dst[s] = tmp;
	}
	
	var updateParticles = function(){
		var bestPath;
		var minCost = 99999;
		var maxCost = 0;
		for(var i=0;i<PARTICLE_NUM;++i){
			var p = particles[i];
			var cost = p.cost;
			if(minCost>cost){
				minCost = cost;
				bestPath = p.path.slice(0);
			}
			if(maxCost<cost){
				maxCost = cost;
			}
			if(gBest>cost){
				gBest = cost;
			}
		}
		
		//update particles
		for(var i=0;i<PARTICLE_NUM;++i){
			var p = particles[i];
			var cost = p.cost;
			var velocity = 0;
			if(cost>minCost){
				velocity = Math.floor(V_MAX*cost/maxCost);
				if(velocity>V_MAX){
					velocity = V_MAX;
				}
				p.velocity = velocity;
				var path = p.path;
				for(var j=0;j<velocity;++j){
					perturb(path);
				}
				copyPath(bestPath,path);
				p.cost = computeCost(cities,path);
			}
		}
		return {
			'path':bestPath,
			'cost':minCost
		};
	}
	
	this.findPath = function(){
		var sol = updateParticles();
		var cost = sol.cost;
		if(Math.abs(cost-lastCost)<=lastCost*0.001){
			++stable;
		}
		else{
			lastCost = cost;
			stable = 0;
		}
	
		return {
			'path':sol.path,
			'cost':sol.cost,
			'found':(stable>=100)
		};
	}
}