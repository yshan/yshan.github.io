var INF = 10000;

function DijkstraFinder(graph,source,dest){
    var graph = graph;
    var source = source;
    var dest = dest;
    var nodeCount = graph.length;
    var dist = new Array(nodeCount);
    var prev = new Array(nodeCount);
    var Q = new Array(nodeCount);
    var current;
    
    for(var i=0;i<nodeCount;++i){
        dist[i] = INF;
        prev[i] = -1;
        Q[i] = i;
    }
   
    dist[source] = 0;
    this.travel = function(){
        if(Q.length>0){
            //find the minum distance node
            var md = INF+1;
            var mi = -1;
            var u = -1;
            for(var i=0;i<Q.length;++i){
                var d = dist[Q[i]];
                if(md>d){
                    u = Q[i];
                    md = d;
                    mi = i;
                }
            }
            current = u;
            if(md == INF || u == dest){
                return false;
            }
            Q.splice(mi,1);
            var gg = graph[u];
            for(var v=0;v<nodeCount;++v){
                if(gg[v]>0){
                    var alt = md + gg[v];
                    if(alt<dist[v]){
                        dist[v] = alt;
                        prev[v] = u;
                    }
                }                
            }
            return true;
        }
        return false;
    }
    
    this.getShorestDistance = function(){
        return dist[dest]==INF?-1:dist[dest];
    }
    
    this.getCurrentNode = function(){
        return current;
    }
    
    this.getShorestPath = function(){
        var path = [];
        path.push(dest);
        var n = dest;
        while(true){
            n = prev[n];
            if(n<0){
                break;
            }
            path.push(n);
        }
        return path;
    }
}