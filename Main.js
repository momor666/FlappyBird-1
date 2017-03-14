var canvas, ctx, width, height, frames = 0, score = 0, best = localStorage.getItem("best") || 0, currentState, states = {
	Splash : 0,        
	Game : 1,
	Score : 2,
	Pause : 3
};
var bird = {
	x : 80,
	y : 100,
	animation : [0, 1, 2, 1],
	rotation : 0,
	velocity : 0,
	frame : 0,
	radius: 8,
	gravity : 0.25,
	_jump : 4.6,
	jump : function() {
		sound_flap.play();
		this.velocity = -this._jump;
	},
	update : function() {
		var n = currentState === states.Splash ? 10 : 5;
		this.frame += frames % n === 0 ? 1 : 0;
		this.frame %= this.animation.length;
		if (currentState == states.Splash) {
			this.y = height - 200 + 20 * Math.cos(frames/10);
			this.rotation = 0;
		} else {				
			// change to the score state when bird touches the ground
			if (this.y >= height - s_fg.height) {
				this.y = height - s_fg.height;				
				if (currentState === states.Game) {
					currentState = states.Score;
					sound_hit.play();
				}
				// sets velocity to jump speed for correct rotation
				this.velocity = this._jump;
			}else {	
				if (this.y<5){
					this.y = 5;		
				}				
				this.velocity += this.gravity;
				this.y += this.velocity;	
			}
			// when bird lack upward momentum increment the rotation
			// angle
			if (this.velocity >= this._jump) {
				this.frame = 1;
				this.rotation = Math.min(Math.PI/2, this.rotation + 0.3);
			} else {
				this.rotation = -0.3;
			}
			
		}
	},
	draw : function(ctx) {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation);		
		var n = this.animation[this.frame];
		s_birds[n].draw(ctx, -s_birds[n].width, -s_birds[n].height / 2,
				s_birds[n].width * 2, s_birds[n].height * 2);
		ctx.beginPath();
		//ctx.arc(-s_birds[n].width+8,-s_birds[n].height / 2+6,this.radius,0,2*Math.PI);
		ctx.stroke();
		ctx.restore();
	}
};
var pipes = {
	_pipes: [],
	reset: function(){
		this._pipes = [];
	},
	update : function() {
		if(frames %80 === 0){
			var _y = height - (s_pipeSouth.height+s_fg.height+200+110*Math.random());
			this._pipes.push({
				x:350,
				y:_y,
				width: s_pipeSouth.width,
				height: s_pipeSouth.height
			});		
		}
		for(var i = 0,len = this._pipes.length;i<len;i++){
			var p = this._pipes[i];		
			p.x -= 2;
			if(i ===0){
				if( (p.x+p.width+20) === bird.x){
					score++;
					sound_score.play();
				} 
				var cx = Math.min(Math.max(bird.x,p.x),p.x+p.width);
				var cy1 = Math.min(Math.max(bird.y,p.y),p.y+p.height);
				var cy2 = Math.min(Math.max(bird.y,p.y+p.height+60),p.y+2*p.height+60);
				var dx = bird.x-7.9-cx;
				var dy1 = bird.y-cy1;
				var dy2 = bird.y-cy2;
				d1 = dx*dx+dy1*dy1;
				d2 = dx*dx+dy2*dy2;
				var r = bird.radius*bird.radius;
				if(r>d1 || r>d2){
					sound_hit.play();
					currentState = states.Score;
				}
			}
			if(p.x <-26){
				this._pipes.splice(i,1);		
				i--;
				len--;
			}
		}
	},
	draw : function(ctx) {		
		for(var i = 0,len = this._pipes.length; i<len; i++){
			var p = this._pipes[i];
			s_pipeSouth.draw(ctx, p.x, p.y);
			s_pipeNorth.draw(ctx, p.x, p.y+60+p.height);
		}
	}		
};
var s_birds, s_bg, s_fg, s_pipeNorth, s_pipeSouth, s_text, s_score, s_splash, s_buttons, s_numberS, s_numberB,s_medal, sound_flap, sound_hit, sound_score;
var scale = 1;
function Sprite(img, x, y, width, height) {
	this.img = img;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

};
var fgPos = 0;
/*
 * Sprite.prototype.draw = function(ctx, x, y, w, h) { ctx .drawImage(this.img,
 * this.x, this.y, this.width, this.height, x, y, w, h); };
 */

Sprite.prototype.draw = function(ctx, x, y) {
	ctx.drawImage(this.img, this.x, this.y, this.width, this.height, x, y,
			this.width, this.height);
};
function init(img) {
	s_birds = [new Sprite(img, 264, 64, 17, 12),
			new Sprite(img, 264, 90, 17, 12), new Sprite(img, 223, 124, 17, 12)];
	s_bg = new Sprite(img, 0, 0, 143, 255);
	s_bg.color = "#70C5CF";
	s_fg = new Sprite(img, 146, 0, 154, 55);
	s_pipeNorth = new Sprite(img, 330, 0, 26, 255);
	s_pipeSouth = new Sprite(img, 302, 0, 26, 255);
	s_text = {
		FlappyBird : new Sprite(img, 146, 173, 96, 22),
		GameOver : new Sprite(img, 146, 199, 94, 19),
		GetReady : new Sprite(img, 146, 221, 86, 20)
	};
	s_buttons = {
		Rate : new Sprite(img, 246, 150, 40, 14),
		Menu : new Sprite(img, 246, 118, 40, 14),
		Share : new Sprite(img, 246, 182, 40, 14),
		Score : new Sprite(img, 246, 166, 40, 14),
		Ok : new Sprite(img, 246, 134, 40, 14),
		Start : new Sprite(img, 246, 198, 40, 14),
		Pause : new Sprite(img, 287, 58, 13, 24),
		Play : new Sprite(img, 287, 84, 13, 24)
	}
	s_score = new Sprite(img, 146, 58, 113, 58);
	s_splash = new Sprite(img, 172, 122, 38, 49);
	s_numberS = new Sprite(img, 360, 132, 6, 7);		
	s_numberB = new Sprite(img, 359, 169, 7, 10);
	s_numberS.draw = s_numberB.draw = function(ctx, x, y, num) {
		num = num.toString();
		step = this.width+1
		for (var i = 0, len = num.length; i < len; i++) {
			var n = parseInt(num[i]);			
			ctx.drawImage(img, this.x + step*n, this.y, this.width, this.height,
				x, y, this.width, this.height)
			x += step;
		}
	};
	s_medal = new Sprite(img,362,95,22,21);	
	sound_flap = new Audio('res/wav/flap.wav');
	sound_hit = new Audio('res/wav/hurt.wav');
	sound_score = new Audio('res/wav/score.wav');
	sound_background = new Audio('res/wav/videoplayback.m4a')
}

function onpress(evt){
	// get event position
	var mx = evt.offsetX, my = evt.offsetY;
	if (mx == null || my == null) {
		mx = evt.touches[0].clientX;
		my = evt.touches[0].clientY;
	}	
	switch(currentState){
		case states.Splash:
			currentState = states.Game;
			bird.jump();
			break;
		case states.Game:						
			// check if within Pause button
			if (pauseBtn.x < mx && mx < pauseBtn.x + pauseBtn.width &&
				pauseBtn.y < my && my < pauseBtn.y + pauseBtn.height
			) {				
				currentState = states.Pause;				
			}					
			bird.jump();				
			break;
		case states.Pause:
			// check if within Play button
			if (playBtn.x < mx && mx < playBtn.x + playBtn.width &&
				playBtn.y < my && my < playBtn.y + playBtn.height
			) {				
				currentState = states.Game;				
			}		
			justPaused = true;
			break;
		case states.Score:		
			// check if within ok Btn
			if (okBtn.x < mx && mx < okBtn.x + okBtn.width &&
				okBtn.y < my && my < okBtn.y + okBtn.height
			) {
				pipes.reset();
				currentState = states.Splash;
				score = 0;
			}
			break;
	}
}
function main() {
	canvas = document.createElement("canvas");
	width = window.innerWidth;
	height = window.innerHeight;
	var evt = "touchStart";	
	if (width >= 500) {
		width = 320;
		height = 480;
		canvas.style.border = "1px solid #000";
		evt = "mousedown";
	}
	document.addEventListener(evt,onpress);
	
	canvas.width = width;
	canvas.height = height;
	ctx = canvas.getContext("2d");
	currentState = states.Splash;

	document.body.appendChild(canvas);
	var img = new Image();
	img.onload = function() {
		console.log("test");
		init(this);
		
		okBtn = {
			x: (width - s_buttons.Ok.width)/2,
			y: height - 200,
			width: s_buttons.Ok.width,
			height: s_buttons.Ok.height
		}
		pauseBtn = {
			x: width - 50,
			y: 10,
			width: s_buttons.Pause.width,
			height: s_buttons.Pause.height
		}
		playBtn = {
			x: width - 50,
			y: 10,
			width: s_buttons.Play.width,
			height: s_buttons.Play.height
		}
		run();
	}
	img.src = "res/sprites.png";

}
function run() {
	var loop = function() {
		update();
		render();
		/*
		 * RequestAnimationFrame Instead, the browser provides asynchronous
		 * mechanisms for us to “do a little work”, then let the browser UI do
		 * it’s job, then have it callback to us at a later time to “do a little
		 * more work”.
		 * 
		 * In older browsers, we might have used setInterval or setTimeout to
		 * call our update method a set number of frames per second, but in
		 * modern browsers we should be using requestAnimationFrame to hook into
		 * the browser’s native refresh loop:
		 */
		window.requestAnimationFrame(loop, canvas); // request the next frame
	}
	window.requestAnimationFrame(loop, canvas);// start the first frame
}

function update() {	
	frames++;
	sound_background.play();
	if(currentState === states.Game){
		pipes.update();	
		bird.update();		
	}else if(currentState == states.Score){		
		best = Math.max(best, score);
		localStorage.setItem("best", best);		
	}else if(currentState == states.Splash){
		fgPos = (fgPos - 2) % 12;
		bird.update();
	}		
}

function render() {
	ctx.fillStyle = s_bg.color;
	ctx.fillRect(0, 0, width, height);
	s_bg.draw(ctx, 0, height - s_bg.height);
	s_bg.draw(ctx, width - s_bg.width - 40, height - s_bg.height);
	s_bg.draw(ctx, width - s_bg.width, height - s_bg.height);
	bird.draw(ctx);
	pipes.draw(ctx);
	s_fg.draw(ctx, fgPos, height - s_fg.height);
	s_fg.draw(ctx, fgPos + s_fg.width, height - s_fg.height);
	s_fg.draw(ctx, fgPos + s_fg.width + 30, height - s_fg.height);
	var width2 = width/2
	if(currentState === states.Splash){
		s_splash.draw(ctx,width2-s_splash.width/2,height-300);
		s_text.GetReady.draw(ctx,width2-s_text.GetReady.width/2,height-400);
	}
	else if(currentState === states.Score){
		s_text.GameOver.draw(ctx,width2-s_text.GameOver.width,height-400);
		s_score.draw(ctx, width2 - s_score.width/2, height-340);
		s_buttons.Ok.draw(ctx, okBtn.x, okBtn.y);		
		// draw score and best inside the score board			
		s_numberB.draw(ctx, width2+25, height-323, score);
		s_numberB.draw(ctx, width2+25, height-300, best);
		s_medal.draw(ctx,width2- s_score.width/2 +15, height-318)
	}
	else if(currentState == states.Pause){
		s_numberB.draw(ctx, 50, 10, score);
		s_buttons.Play.draw(ctx, playBtn.x, playBtn.y);
	}
	else {
		// draw score to top of canvas
		s_numberB.draw(ctx, 50, 10, score);
		s_buttons.Pause.draw(ctx, pauseBtn.x, pauseBtn.y);
	}
}

main();