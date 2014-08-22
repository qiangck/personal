/**
 * Created by rechie on 14-8-21.
 */
define(function() {
   var Game = function(id){
       this.canvasElem = document.getElementById('gameScreen');
       this.ctx = this.canvasElem.getContext('2d');
       this.resize();
   };
   Game.prototype.init = function() {

   };
   Game.prototype.draw = function () {
       console.log(this.ctx.width)
       this.ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);
       this.ctx.fillStyle = '#000';
       this.ctx.fillRect(0, 0, this.ctx.width, this.ctx.height);
       var bgImg = new Image();
       bgImg.src = 'images/tfz.jpg';
       var imgScale = 288 / 455;
       var winScale = this.ctx.width / this.ctx.height;
       var nowWidth, nowHeigh;
       if(imgScale < winScale) {
           nowWidth = this.ctx.height * imgScale;
           nowHeigh = this.ctx.height;
       } else {
           nowWidth = this.ctx.width;
           nowHeigh = this.ctx.width / imgScale;
       }
       this.ctx.drawImage(bgImg, 0, 0, nowWidth, nowHeigh);
   };
   Game.prototype.resize = function() {
       this.canvasElem.width = window.outerWidth;
       this.canvasElem.height = window.outerHeight;
       this.ctx.width = window.outerWidth;
       this.ctx.height = window.outerHeight;
       this.draw();
   }
   return Game;
});