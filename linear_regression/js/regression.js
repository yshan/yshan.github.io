function GDRegression(m){
	var theta=[];
	var learnRate = 0.01;
	var scale = [1,100.0,10000.0,10000000.0];
	
	var val = function(x,i){
		if(i==0){
			return 1;
		}
		else if(i==1){
			return x;
		}
		else{
			return Math.pow(x,i);
		}
	}
	
	this.getTheta = function(){
		return theta.slice(0);
	}
	
	this.getModel = function(){
		return function(x){
			var y = 0;
			for(var i=0;i<theta.length;++i){
				y += theta[i] * val(x,i)/scale[i];
			}
			return y;
		};
	}
	
	this.trainExamples = function(examples){
		var m = examples.length;
		var delta = [];
		var model = this.getModel();
		var loss = 0;
		for(var i=0;i<m;++i){
			var example = examples[i];
			var x = example[0];
			var y = example[1];
			var d = model(x)-y;
			loss += d*d;
			delta.push(d);
		}
		
		for(var i=0;i<theta.length;++i){
			var diff = 0 ;
			for(var j=0;j<m;++j){
				var x = examples[j][0];
				diff += (delta[j]*val(x,i)/scale[i]);
			}
			theta[i] = theta[i] - learnRate/m*diff;
		}
		
		return loss;
	};
	
	for(var i=0;i<m+1;++i){
		theta.push(0);
	}
}

function NERegression(mc){
	var theta=new Array(mc+1);
	var val = function(x,i){
		if(i==0){
			return 1;
		}
		else if(i==1){
			return x;
		}
		else{
			return Math.pow(x,i);
		}
	}
	this.trainExamples = function(examples){
		var xa = [];
		var ya = [];
		var m = examples.length;
		for(var i=0;i<m;++i){
			var e = examples[i];
			var x = e[0];
			var y = e[1];
			var xx = [];
			for(var j=0;j<mc+1;++j){
				xx.push(val(x,j));
			}
			xa.push(xx);
			ya.push(y);
		}
		var X = $M(xa);
		var Y = $V(ya);
		var XT  = X.transpose();
		var result = XT.multiply(X).inv().multiply(XT).multiply(Y);
		for(var i=0;i<mc+1;++i){
			theta[i] = result.e(i+1);
		}
	}
	this.getModel = function(){
		return function(x){
			var y = 0;
			for(var i=0;i<theta.length;++i){
				y += theta[i] * val(x,i);
			}
			return y;
		};
	}
}