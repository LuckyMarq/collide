function getExponentInterpolator(ex){
	return function(x1,x2,p){
		return x1 + (x2-x1)*Math.pow(p,ex);
	}
}

function linearInterpolation(a,b,u){
	return a + (b-a)*u;
}

function getInverseExponentInterpolator(ex){
	return function(x1,x2,p){
		return x1 + (x2-x1)*(1-Math.pow(p,ex));
	}
}

function randomInterpolation(x1,x2,p){
	return x1 + (x2-x1)*Math.random();
}