function Graham(nodes,nc){
    var points =[];
    
    var init = function(){
        //First scan find the lowest y in nodes
        var lownode = 0;
        var lx= nodes[0][0],ly = nodes[0][1];
        for(var i=1;i<nc;++i){
            var n = nodes[i];
            if(n[1]>ly || (n[1]==ly && n[0]>lx)){
                lx = n[0];
                ly = n[1];
                lownode = i;
            }
        }
        
        //calc the degree with the lowest point
        var degrees = new Array(nc);
        for(var i=0;i<nc;++i){
            var d = 0.0;
            if(i!=lownode){
                var n = nodes[i];
                if(n[0]==lx){
                    d = Math.PI/2;
                }
                else{
                    d = Math.atan(1.0*(n[1]-ly)/(n[0]-lx));
                    if(d<0) d=d+Math.PI;
                }
            }
            degrees[i] = d;
        }
        
        for(var i=0;i<nc;++i){
            points.push(i);
        }
        
        //sort all the points with degree
        points.sort(function(a,b){
			return degrees[a]-degrees[b];
		});
        
        points.unshift(points[nc-1]);
    }
    
    var ccw = function(p1,p2,p3){
        var n1 = nodes[p1];
        var n2 = nodes[p2];
        var n3 = nodes[p3];
        return (n2[0] - n1[0])*(n3[1] - n1[1]) - (n2[1] - n1[1])*(n3[0] - n1[0])
    }
    
    var M = 1;
    var index = 1;

    this.scan = function(){
        if(index>nc){
            return false;
        }
        if(index==1){
            ++index;
            return true;
        }
        
        while(ccw(points[M-1], points[M], points[index]) <= 0){
            if(M>1){
                --M;
            }
            else if(index==nc){
                break;
            }
            else{
                ++index;
            }
        }
        
        M++;
        var t = points[M];
        points[M] = points[index];
        points[index] =t;
        ++index;
        return true;
    }
    
    this.getConvexHull = function(){
        return points.slice(1,M+1);
    }
    
    init();
}