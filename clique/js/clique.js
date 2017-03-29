function bf(graph){
	var result = [];
	var maxSize = 0;
	var selection = new Array(graph.length);
	var bestSelection = [];
	var nc = graph.length;
	
	var select = function(index,size){
		if(size+nc-index<=maxSize){
			return;
		}
		var g = graph[index];
		var selected = true;
		for(var i=0;i<index;++i){
			if(selection[i]==1 && g[i]==0){
				selected = false;
				break;
			}
		}
		if(selected){
			selection[index] = 1;
			if(index<nc-1){
				select(index+1,size+1);
			}
			else if(size+1>maxSize){
				maxSize = size+1;
				bestSelection = selection.slice(0);
			}
		}
		selection[index] = 0;
		if(index<nc-1){
			select(index+1,size);
		}
		else if(size>maxSize){
			maxSize = size;
			bestSelection = selection.slice(0);
		}
	}
	select(0,0);
	
	for(var i=0;i<bestSelection.length;++i){
		if(bestSelection[i]==1){
			result.push(i);
		}
	}
	return result;
}

function dfs(graph){
	var maxSize = 0;
	var nc = graph.length;
	var bestSelection = [];
	
	var select = function(size,canidate,selection){
		if(canidate.length+size<maxSize){
			return;
		}
		if(canidate.length==0){
			if(size>maxSize){
				maxSize = size;
				bestSelection = selection.slice(0);
			}
			return;
		}
		for(var i=0;i<canidate.length;++i){
			var newcanidate = [];
			var n1 = canidate[i];
			var g = graph[n1];
			for(var j=i+1;j<canidate.length;++j){
				var n2 = canidate[j];
				if(g[n2] == 1){
					newcanidate.push(n2);
				}
			}
			selection.push(n1);
			select(size+1,newcanidate,selection);
			selection.pop();
		}
	}
	
	for(var i=0;i<nc;++i){
		var canidate = [];
		var g = graph[i];
		for(var j=i+1;j<nc;++j){
			if(g[j]==1){
				canidate.push(j);
			}
		}
		select(1,canidate,[i]);
	}
	return bestSelection;
}

function mcq(graph){
	var Q = []; //vertix collection
	var QMax = []; //the maxium clique collectios
	var nc = graph.length; //vertiex count
	var degrees = new Array(nc); //degree of all nodes
	var V = new Array(nc); //all vertiex
	var N = {}; //color
	var maxdegree = -1;
	for(var i=0;i<nc;++i){
		degrees[i] = 0;
		V[i] = i;
	}
	//get all vertix degree
	for(var i=0;i<nc;++i){
		var g = graph[i];
		for(var j=i;j<nc;++j){
			if(g[j]==1){
				++degrees[i];
				++degrees[j];
			}
		}
		if(degrees[i]>maxdegree){
			maxdegree = degrees[i];
		}
	}
	//sort vertices descend by degree
	V.sort(function(v1,v2){
		return degrees[v2]-degrees[v1];
	});
	
	for(var i=0;i<maxdegree;++i){
		N[V[i]] = i+1;
	}
	for(var i=maxdegree;i<nc;++i){
		N[V[i]] = maxdegree+1;
	}
	
	var sort = function(R,NNN){
		var maxno = 0;
		var C=[[],[]];
		while(R.length>0){
			var p = R[0];
			var g = graph[p];
			var k =0;
			while(1){
				var Ck = C[k];
				var found = false;
				if(Ck){
					for(var i=0;i<Ck.length;++i){
						if(g[Ck[i]]==1){
							found = true;
							break;
						}
					}
				}
				if(found){
					++k;
				}
				else{
					break;
				}
			}
			if(k>maxno){
				maxno = k;
				C[k]=[];
			}
			NNN[p]=k+1;
			C[k].push(p);
			R.shift();
		}
		for(var k=0;k<=maxno;++k){
			var Ck = C[k];
			for(var j=0;j<Ck.length;++j){
				R.push(Ck[j]);
			}
		}
	}
	
	var expand = function(R,NN){
		while(R.length>0){
			var p = R[R.length-1];
			if(Q.length+NN[p]>QMax.length){
				Q.push(p);
				var Rp = [];
				var g = graph[p];
				for(var i=0;i<R.length;++i){
					var n = R[i];
					if(g[n]==1){
						Rp.push(n);
					}
				}
				if(Rp.length>0){
					var NNN = {}
					sort(Rp,NNN);
					expand(Rp,NNN);
				}
				else if(Q.length>QMax.length){
					QMax = Q.slice(0);
				}
				Q.pop();
			}
			R.pop();
		}
	}
	
	expand(V,N);
	return QMax;
}