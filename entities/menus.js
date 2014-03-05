function menuButton(x,y,z,width,height,text,size,font,color){
	this.x = x;
	this.y = y;
	this.z = z;
	this.width = width;
	this.height = height;
	var canvas = document.createElement('canvas');
	canvas.width = width*2;
	canvas.height = height*2;
	var gfx = canvas.getContext('2d');
	gfx.fillStyle = 'rgba(0,0,0,255)';
	gfx.fillRect(0,0,width*2,height*2);
	gfx.fillStyle = color;
	gfx.textAlign = 'center';
	gfx.textBaseline = "middle";
	gfx.font = (size*2)+"px "+font;
	gfx.fillText('test text',width,height)
	this.glInit = function(manager){
		var gl = manager.gl;
		this.texture = gl.createTexture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);

		gl.bindTexture(gl.TEXTURE_2D, null);
	}
}
menuButton.prototype = fillProperties(new GLDrawable(),
	{
		draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
			manager.strokeRect(this.x+this.width/2,this.y+this.height/2,this.z,this.width,this.height,0,1,1,1,1);
			
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			manager.bindProgram('basic_texture');
			manager.setArrayBufferAsProgramAttribute('primitive_rect','basic_texture','vertexPosition');
			manager.setArrayBufferAsProgramAttribute('sprite_texture_coords','basic_texture','textureCoord');
			
			mvMatrix.translate(this.x+this.width/2,this.y+this.height/2,this.z || 0);
			mvMatrix.scale(this.width,this.height,1);
			manager.setMatrixUniforms('basic_texture',pMatrix,mvMatrix.current);
			
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			var prog = manager.getProgram('basic_texture');
			gl.uniform1i(prog.samplerUniform, 0);
			gl.uniform1f(prog.alpha,1)
			gl.uniform1f(prog.tintWeight,0);
			gl.uniform3f(prog.tint,0,0,0);
			
			gl.drawArrays(gl.TRIANGLE_FAN,0,4);
		}
	});