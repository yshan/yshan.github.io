function GDRegression(points,degree,regular,rate){
    var theta=[];
    var features = [];
    var learnRate = (rate==0?0.01:rate);
    var X = [];
    var Y = [];
    var m = points.length;
    var mean = [];
    var std = [];
    
    this.getTheta = function(){
        return theta.slice(0);
    }
    
    this.getModel = function(){
        return function(x1,x2){
            var y = 0;
            for(var i=0;i<theta.length;++i){
                y += theta[i] * ((features[i](x1,x2)-mean[i])/std[i]);
            }
            return y;
        };
    }
    
    var sigmoid = function(z){
        return 1.0/(1+Math.exp(-z));
    }
    
    var calcHypot = function(xx){
        var hy = 0;
        for(var i=0;i<theta.length;++i){
            hy += theta[i] * xx[i];
        }
        return sigmoid(hy);
    }
    
    this.training = function(){
        var delta = [];
        var model = this.getModel();
        var loss = 0;
        for(var i=0;i<m;++i){
            var y = Y[i];
            var hy = calcHypot(X[i]);
            loss += (-y)*Math.log(hy)-(1-y)*Math.log(1-hy);
            delta.push(hy-y);
        }
        
        for(var i=0;i<theta.length;++i){
            var diff = 0 ;
            for(var j=0;j<m;++j){
                diff += delta[j]*X[j][i];
            }
            theta[i] = theta[i] - learnRate/m*diff;
        }
        return loss/m;
    };
    
    theta.push(0);
    features.push(function(){return 1;});
    for(var i=1;i<=degree;++i){
        for(var j=0;j<=i;++j){
            theta.push(0);
            new function(ii,jj){
                features.push(function(x1,x2){
                    return Math.pow(x1,ii-jj)*Math.pow(x2,jj);
                });
            }(i,j);
        }
    }
    
    for(var i=0;i<m;++i){
        var p = points[i];
        var x1 = p[0];
        var x2 = p[1];
        var y = p[2];
        var row = [];
        for(var j=0;j<features.length;++j){
            row.push(features[j](x1,x2));
        }
        X.push(row);
        Y.push(y);
    }
    
    //norm all features
    for(var i=0;i<features.length;++i){
        var sum = X[0][i];
        var max = X[0][i];
        var min = X[0][i];
        for(var j=1;j<m;++j){
            var xx = X[j][i];
            sum += xx;
            if(max<xx) max=xx;
            if(min>xx) min=xx;
        }
        
        if(max == min){
            mean.push(0);
            std.push(1);
        }
        else{
            mean.push(sum/m);
            std.push(max-min);
        }
        
        for(var j=0;j<m;++j){
            X[j][i] = (X[j][i] - mean[i])/std[i];
        }
    }
}
