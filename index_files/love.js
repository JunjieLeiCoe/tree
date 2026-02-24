(function(window){

    function random(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    function randomFloat(min, max) {
        return min + Math.random() * (max - min);
    }

    function bezier(cp, t) {  
        var p1 = cp[0].mul((1 - t) * (1 - t));
        var p2 = cp[1].mul(2 * t * (1 - t));
        var p3 = cp[2].mul(t * t); 
        return p1.add(p2).add(p3);
    }  

    function inheart(x, y, r) {
        var z = ((x / r) * (x / r) + (y / r) * (y / r) - 1) * ((x / r) * (x / r) + (y / r) * (y / r) - 1) * ((x / r) * (x / r) + (y / r) * (y / r) - 1) - (x / r) * (x / r) * (y / r) * (y / r) * (y / r);
        return z < 0;
    }

    var SAKURA_PINK = [
        {r: 255, g: 183, b: 197, a: 0.9},
        {r: 255, g: 192, b: 203, a: 0.85},
        {r: 255, g: 209, b: 220, a: 0.9},
        {r: 252, g: 182, b: 193, a: 0.88},
        {r: 255, g: 175, b: 189, a: 0.9},
        {r: 248, g: 200, b: 210, a: 0.85}
    ];

    Point = function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    Point.prototype = {
        clone: function() {
            return new Point(this.x, this.y);
        },
        add: function(o) {
            var p = this.clone();
            p.x += o.x;
            p.y += o.y;
            return p;
        },
        sub: function(o) {
            var p = this.clone();
            p.x -= o.x;
            p.y -= o.y;
            return p;
        },
        div: function(n) {
            var p = this.clone();
            p.x /= n;
            p.y /= n;
            return p;
        },
        mul: function(n) {
            var p = this.clone();
            p.x *= n;
            p.y *= n;
            return p;
        }
    }

    Heart = function() {
        var points = [], x, y, t;
        for (var i = 10; i < 30; i += 0.2) {
            t = i / Math.PI;
            x = 16 * Math.pow(Math.sin(t), 3);
            y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            points.push(new Point(x, y));
        }
        this.points = points;
        this.length = points.length;
    }
    Heart.prototype = {
        get: function(i, scale) {
            return this.points[i].mul(scale || 1);
        }
    }

    Seed = function(tree, point, scale, color) {
        this.tree = tree;
        var scale = scale || 1;
        var color = color || '#e8a4b8';

        this.heart = {
            point  : point,
            scale  : scale,
            color  : color,
            figure : new Heart(),
        }

        this.cirle = {
            point  : point,
            scale  : scale,
            color  : color,
            radius : 5,
        }
    }
    Seed.prototype = {
        draw: function() {
            this.drawHeart();
            this.drawText();
        },
        addPosition: function(x, y) {
            this.cirle.point = this.cirle.point.add(new Point(x, y));
        },
        canMove: function() {
            return this.cirle.point.y < (this.tree.height + 20); 
        },
        move: function(x, y) {
            this.clear();
            this.drawCirle();
            this.addPosition(x, y);
        },
        canScale: function() {
            return this.heart.scale > 0.2;
        },
        setHeartScale: function(scale) {
            this.heart.scale *= scale;
        },
        scale: function(scale) {
            this.clear();
            this.drawCirle();
            this.drawHeart();
            this.setHeartScale(scale);
        },
        drawHeart: function() {
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point, scale = heart.scale;
            
            ctx.save();
            ctx.translate(point.x, point.y);
            
            var gradient = ctx.createRadialGradient(0, -5 * scale, 0, 0, -5 * scale, 25 * scale);
            gradient.addColorStop(0, '#ffccd5');
            gradient.addColorStop(0.5, '#e8a4b8');
            gradient.addColorStop(1, '#d4849b');
            
            ctx.fillStyle = gradient;
            ctx.shadowColor = 'rgba(232, 164, 184, 0.4)';
            ctx.shadowBlur = 15;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < heart.figure.length; i++) {
                var p = heart.figure.get(i, scale);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        drawCirle: function() {
            var ctx = this.tree.ctx, cirle = this.cirle;
            var point = cirle.point, color = cirle.color, 
                scale = cirle.scale, radius = cirle.radius;
            ctx.save();
            ctx.fillStyle = '#e8a4b8';
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        drawText: function() {
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point, scale = heart.scale;
            
            ctx.save();
            ctx.strokeStyle = '#c9929e';
            ctx.fillStyle = '#c9929e';
            ctx.lineWidth = 1;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.moveTo(0, 0);
            ctx.lineTo(15, 15);
            ctx.lineTo(55, 15);
            ctx.stroke();

            ctx.scale(0.8, 0.8);
            ctx.font = "13px Georgia, serif";
            ctx.fillText("click here", 22, 14);
            ctx.restore();
        },
        clear: function() {
            var ctx = this.tree.ctx, cirle = this.cirle;
            var point = cirle.point, scale = cirle.scale, radius = 30;
            var w = h = (radius * scale);
            ctx.clearRect(point.x - w, point.y - h, 4 * w, 4 * h);
        },
        hover: function(x, y) {
            var ctx = this.tree.ctx;
            var pixel = ctx.getImageData(x, y, 1, 1);
            return pixel.data[3] == 255;
        }
    }

    Footer = function(tree, width, height, speed) {
        this.tree = tree;
        this.point = new Point(tree.seed.heart.point.x, tree.height - height / 2);
        this.width = width;
        this.height = height;
        this.speed = speed || 2;
        this.length = 0;
    }
    Footer.prototype = {
        draw: function() {
            var ctx = this.tree.ctx, point = this.point;
            var len = this.length / 2;

            ctx.save();
            var gradient = ctx.createLinearGradient(point.x - len, point.y, point.x + len, point.y);
            gradient.addColorStop(0, 'rgba(92, 64, 51, 0)');
            gradient.addColorStop(0.2, 'rgba(92, 64, 51, 0.8)');
            gradient.addColorStop(0.5, 'rgba(74, 52, 42, 1)');
            gradient.addColorStop(0.8, 'rgba(92, 64, 51, 0.8)');
            gradient.addColorStop(1, 'rgba(92, 64, 51, 0)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.height;
            ctx.lineCap = 'round';
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.moveTo(-len, 0);
            ctx.lineTo(len, 0);
            ctx.stroke();
            ctx.restore();

            if (this.length < this.width) {
                this.length += this.speed;
            }
        }
    }

    SakuraPetal = function(tree, x, y) {
        this.tree = tree;
        this.x = x;
        this.y = y;
        
        var colorData = SAKURA_PINK[random(0, SAKURA_PINK.length - 1)];
        this.color = colorData;
        
        this.size = randomFloat(4, 9);
        this.rotation = randomFloat(0, Math.PI * 2);
        this.rotationSpeed = randomFloat(-0.03, 0.03);
        this.rotation3D = {
            x: randomFloat(0, Math.PI * 2),
            y: randomFloat(0, Math.PI * 2),
            speedX: randomFloat(-0.02, 0.02),
            speedY: randomFloat(-0.02, 0.02)
        };
        
        this.speedY = randomFloat(0.4, 1.2);
        this.speedX = randomFloat(-0.3, 0.3);
        this.swayPhase = randomFloat(0, Math.PI * 2);
        this.swaySpeed = randomFloat(0.015, 0.035);
        this.swayAmount = randomFloat(0.3, 0.8);
        
        this.alpha = colorData.a;
        this.fadeStart = tree.height * randomFloat(0.7, 0.9);
    }
    
    SakuraPetal.prototype = {
        draw: function() {
            var ctx = this.tree.ctx;
            var scaleX = Math.cos(this.rotation3D.x) * 0.5 + 0.5;
            var scaleY = Math.cos(this.rotation3D.y) * 0.3 + 0.7;
            
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(scaleX, scaleY);
            
            var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 1.2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(0.3, 'rgba(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ', 0.85)');
            gradient.addColorStop(1, 'rgba(' + (this.color.r - 20) + ',' + (this.color.g - 15) + ',' + (this.color.b - 10) + ', 0.7)');
            
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            ctx.moveTo(0, -this.size * 0.3);
            ctx.bezierCurveTo(
                this.size * 0.8, -this.size * 0.8,
                this.size * 1.1, this.size * 0.2,
                0, this.size * 0.7
            );
            ctx.bezierCurveTo(
                -this.size * 1.1, this.size * 0.2,
                -this.size * 0.8, -this.size * 0.8,
                0, -this.size * 0.3
            );
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        },
        
        update: function(wind) {
            this.swayPhase += this.swaySpeed;
            this.x += this.speedX + Math.sin(this.swayPhase) * this.swayAmount + wind * 0.5;
            this.y += this.speedY;
            
            this.rotation += this.rotationSpeed;
            this.rotation3D.x += this.rotation3D.speedX;
            this.rotation3D.y += this.rotation3D.speedY;
            
            if (this.y > this.fadeStart) {
                this.alpha -= 0.008;
            }
            
            if (this.y > this.tree.height + 20 || this.alpha <= 0 || 
                this.x < -50 || this.x > this.tree.width + 50) {
                return false;
            }
            
            this.draw();
            return true;
        }
    }

    SakuraFlower = function(tree, x, y, size) {
        this.tree = tree;
        this.x = x;
        this.y = y;
        this.size = size || randomFloat(6, 12);
        this.rotation = randomFloat(0, Math.PI * 2);
        this.alpha = 0;
        this.targetAlpha = randomFloat(0.75, 0.95);
        this.petalCount = 5;
        this.growthPhase = 0;
        
        var baseColor = SAKURA_PINK[random(0, SAKURA_PINK.length - 1)];
        this.petalColor = baseColor;
        this.centerColor = {r: 255, g: 210, b: 140};
    }
    
    SakuraFlower.prototype = {
        draw: function() {
            var ctx = this.tree.ctx;
            var currentSize = this.size * Math.min(1, this.growthPhase);
            
            if (currentSize < 0.5) return;
            
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            for (var i = 0; i < this.petalCount; i++) {
                ctx.save();
                ctx.rotate((Math.PI * 2 / this.petalCount) * i);
                
                var gradient = ctx.createLinearGradient(0, 0, 0, -currentSize);
                gradient.addColorStop(0, 'rgba(255, 245, 238, 0.9)');
                gradient.addColorStop(0.4, 'rgba(' + this.petalColor.r + ',' + this.petalColor.g + ',' + this.petalColor.b + ', 0.85)');
                gradient.addColorStop(1, 'rgba(' + (this.petalColor.r - 15) + ',' + (this.petalColor.g - 10) + ',' + (this.petalColor.b - 5) + ', 0.8)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(
                    -currentSize * 0.35, -currentSize * 0.3,
                    -currentSize * 0.4, -currentSize * 0.85,
                    0, -currentSize
                );
                ctx.bezierCurveTo(
                    currentSize * 0.4, -currentSize * 0.85,
                    currentSize * 0.35, -currentSize * 0.3,
                    0, 0
                );
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            
            var centerSize = currentSize * 0.22;
            var centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, centerSize);
            centerGradient.addColorStop(0, 'rgba(255, 250, 230, 1)');
            centerGradient.addColorStop(0.6, 'rgba(' + this.centerColor.r + ',' + this.centerColor.g + ',' + this.centerColor.b + ', 0.9)');
            centerGradient.addColorStop(1, 'rgba(210, 160, 90, 0.8)');
            
            ctx.fillStyle = centerGradient;
            ctx.beginPath();
            ctx.arc(0, 0, centerSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        },
        
        grow: function() {
            if (this.growthPhase < 1) {
                this.growthPhase += 0.04;
            }
            if (this.alpha < this.targetAlpha) {
                this.alpha += 0.03;
            }
            this.draw();
            return this.growthPhase >= 1;
        }
    }

    Cat = function(tree, x, y, color, isPlayful, name) {
        this.tree = tree;
        this.x = x;
        this.y = y;
        this.color = color;
        this.isPlayful = isPlayful;
        this.name = name;
        
        this.size = randomFloat(18, 24);
        this.direction = random(0, 1) ? 1 : -1;
        this.speed = isPlayful ? randomFloat(1.2, 2.5) : randomFloat(0.3, 0.6);
        this.baseY = y;
        
        this.animPhase = randomFloat(0, Math.PI * 2);
        this.animSpeed = isPlayful ? randomFloat(0.15, 0.25) : randomFloat(0.05, 0.08);
        
        this.jumpPhase = 0;
        this.isJumping = false;
        this.jumpHeight = 0;
        
        this.tailPhase = randomFloat(0, Math.PI * 2);
        this.earWiggle = 0;
        
        this.idleTime = 0;
        this.maxIdleTime = isPlayful ? random(60, 150) : random(200, 500);
        this.isIdle = !isPlayful;
        
        this.minX = 80;
        this.maxX = tree.width - 80;
        
        if (color === 'gold') {
            this.bodyColor = {r: 218, g: 165, b: 105};
            this.lightColor = {r: 238, g: 195, b: 145};
            this.darkColor = {r: 178, g: 130, b: 75};
        } else {
            this.bodyColor = {r: 150, g: 155, b: 165};
            this.lightColor = {r: 185, g: 190, b: 200};
            this.darkColor = {r: 110, g: 115, b: 125};
        }
    }
    
    Cat.prototype = {
        draw: function() {
            var ctx = this.tree.ctx;
            var bounce = this.isIdle ? 0 : Math.sin(this.animPhase) * 2;
            var legOffset = this.isIdle ? 0 : Math.sin(this.animPhase * 2) * 3;
            
            ctx.save();
            ctx.translate(this.x, this.y - this.jumpHeight);
            ctx.scale(this.direction, 1);
            
            var s = this.size;
            
            ctx.fillStyle = 'rgb(' + this.darkColor.r + ',' + this.darkColor.g + ',' + this.darkColor.b + ')';
            
            ctx.save();
            ctx.translate(-s * 0.8, -s * 0.1);
            ctx.rotate(Math.sin(this.tailPhase) * 0.4);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-s * 0.3, -s * 0.5, -s * 0.6, -s * 0.3);
            ctx.quadraticCurveTo(-s * 0.8, -s * 0.1, -s * 0.7, s * 0.1);
            ctx.quadraticCurveTo(-s * 0.5, s * 0.2, -s * 0.2, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            
            ctx.fillStyle = 'rgb(' + this.darkColor.r + ',' + this.darkColor.g + ',' + this.darkColor.b + ')';
            ctx.beginPath();
            ctx.ellipse(-s * 0.25, s * 0.35 + legOffset, s * 0.12, s * 0.25, 0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-s * 0.55, s * 0.35 - legOffset, s * 0.12, s * 0.25, -0.1, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.ellipse(s * 0.25, s * 0.35 - legOffset, s * 0.12, s * 0.25, -0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(s * 0.45, s * 0.35 + legOffset, s * 0.12, s * 0.25, 0.1, 0, Math.PI * 2);
            ctx.fill();
            
            var bodyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
            bodyGradient.addColorStop(0, 'rgb(' + this.lightColor.r + ',' + this.lightColor.g + ',' + this.lightColor.b + ')');
            bodyGradient.addColorStop(0.7, 'rgb(' + this.bodyColor.r + ',' + this.bodyColor.g + ',' + this.bodyColor.b + ')');
            bodyGradient.addColorStop(1, 'rgb(' + this.darkColor.r + ',' + this.darkColor.g + ',' + this.darkColor.b + ')');
            
            ctx.fillStyle = bodyGradient;
            ctx.beginPath();
            ctx.ellipse(0, bounce, s * 0.7, s * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
            
            var headX = s * 0.55;
            var headY = -s * 0.15 + bounce;
            
            var headGradient = ctx.createRadialGradient(headX, headY, 0, headX, headY, s * 0.5);
            headGradient.addColorStop(0, 'rgb(' + this.lightColor.r + ',' + this.lightColor.g + ',' + this.lightColor.b + ')');
            headGradient.addColorStop(0.6, 'rgb(' + this.bodyColor.r + ',' + this.bodyColor.g + ',' + this.bodyColor.b + ')');
            headGradient.addColorStop(1, 'rgb(' + this.darkColor.r + ',' + this.darkColor.g + ',' + this.darkColor.b + ')');
            
            ctx.fillStyle = headGradient;
            ctx.beginPath();
            ctx.ellipse(headX, headY, s * 0.4, s * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'rgb(' + this.bodyColor.r + ',' + this.bodyColor.g + ',' + this.bodyColor.b + ')';
            
            ctx.beginPath();
            ctx.moveTo(headX - s * 0.25, headY - s * 0.25);
            ctx.lineTo(headX - s * 0.35, headY - s * 0.55 + Math.sin(this.earWiggle) * 2);
            ctx.lineTo(headX - s * 0.08, headY - s * 0.3);
            ctx.closePath();
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(headX + s * 0.25, headY - s * 0.25);
            ctx.lineTo(headX + s * 0.35, headY - s * 0.55 + Math.sin(this.earWiggle + 0.5) * 2);
            ctx.lineTo(headX + s * 0.08, headY - s * 0.3);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = 'rgb(' + Math.max(0, this.bodyColor.r - 60) + ',' + Math.max(0, this.bodyColor.g - 50) + ',' + Math.max(0, this.bodyColor.b - 40) + ')';
            ctx.beginPath();
            ctx.moveTo(headX - s * 0.28, headY - s * 0.32);
            ctx.lineTo(headX - s * 0.32, headY - s * 0.45);
            ctx.lineTo(headX - s * 0.15, headY - s * 0.32);
            ctx.closePath();
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(headX + s * 0.28, headY - s * 0.32);
            ctx.lineTo(headX + s * 0.32, headY - s * 0.45);
            ctx.lineTo(headX + s * 0.15, headY - s * 0.32);
            ctx.closePath();
            ctx.fill();
            
            var eyeY = headY - s * 0.05;
            ctx.fillStyle = '#2d2d2d';
            ctx.beginPath();
            ctx.ellipse(headX - s * 0.12, eyeY, s * 0.08, s * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(headX + s * 0.12, eyeY, s * 0.08, s * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = this.color === 'gold' ? '#d4a520' : '#7ab8d4';
            ctx.beginPath();
            ctx.ellipse(headX - s * 0.12, eyeY, s * 0.06, s * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(headX + s * 0.12, eyeY, s * 0.06, s * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.ellipse(headX - s * 0.12, eyeY, s * 0.03, s * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(headX + s * 0.12, eyeY, s * 0.03, s * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(headX - s * 0.14, eyeY - s * 0.03, s * 0.02, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(headX + s * 0.1, eyeY - s * 0.03, s * 0.02, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#e8b4b4';
            ctx.beginPath();
            ctx.ellipse(headX, headY + s * 0.1, s * 0.06, s * 0.04, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(headX - s * 0.05, headY + s * 0.12);
            ctx.lineTo(headX - s * 0.25, headY + s * 0.08);
            ctx.moveTo(headX - s * 0.05, headY + s * 0.14);
            ctx.lineTo(headX - s * 0.25, headY + s * 0.16);
            ctx.moveTo(headX + s * 0.05, headY + s * 0.12);
            ctx.lineTo(headX + s * 0.25, headY + s * 0.08);
            ctx.moveTo(headX + s * 0.05, headY + s * 0.14);
            ctx.lineTo(headX + s * 0.25, headY + s * 0.16);
            ctx.stroke();
            
            ctx.restore();
        },
        
        update: function() {
            this.tailPhase += 0.08;
            this.earWiggle += 0.05;
            
            if (this.isJumping) {
                this.jumpPhase += 0.12;
                this.jumpHeight = Math.sin(this.jumpPhase) * (this.isPlayful ? 25 : 12);
                if (this.jumpPhase >= Math.PI) {
                    this.isJumping = false;
                    this.jumpPhase = 0;
                    this.jumpHeight = 0;
                }
            }
            
            if (this.isIdle) {
                this.idleTime++;
                if (this.idleTime > this.maxIdleTime) {
                    this.isIdle = false;
                    this.idleTime = 0;
                    this.direction = random(0, 1) ? 1 : -1;
                    if (this.isPlayful && random(0, 100) < 40) {
                        this.isJumping = true;
                    }
                }
            } else {
                this.animPhase += this.animSpeed;
                this.x += this.speed * this.direction;
                
                if (this.x > this.maxX) {
                    this.x = this.maxX;
                    this.direction = -1;
                    if (this.isPlayful && random(0, 100) < 30) {
                        this.isJumping = true;
                    }
                } else if (this.x < this.minX) {
                    this.x = this.minX;
                    this.direction = 1;
                    if (this.isPlayful && random(0, 100) < 30) {
                        this.isJumping = true;
                    }
                }
                
                if (this.isPlayful) {
                    if (random(0, 100) < 0.5) {
                        this.isIdle = true;
                        this.maxIdleTime = random(40, 100);
                    }
                    if (random(0, 100) < 0.3 && !this.isJumping) {
                        this.isJumping = true;
                    }
                } else {
                    if (random(0, 100) < 0.8) {
                        this.isIdle = true;
                        this.maxIdleTime = random(150, 400);
                    }
                }
            }
            
            this.draw();
        }
    }

    Tree = function(canvas, width, height, opt) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.opt = opt || {};
        this.record = {};
        this.petals = [];
        this.flowers = [];
        this.cats = [];
        this.wind = 0;
        this.windTarget = 0;
        this.windPhase = 0;
        
        this.initSeed();
        this.initFooter();
        this.initBranch();
        this.initBloom();
        this.initCats();
    }
    
    Tree.prototype = {
        initSeed: function() {
            var seed = this.opt.seed || {};
            var x = seed.x || this.width / 2;
            var y = seed.y || this.height / 2;
            var point = new Point(x, y);
            var color = seed.color || '#e8a4b8';
            var scale = seed.scale || 1;
            this.seed = new Seed(this, point, scale, color);
        },

        initFooter: function() {
            var footer = this.opt.footer || {};
            var width = footer.width || this.width;
            var height = footer.height || 5;
            var speed = footer.speed || 2;
            this.footer = new Footer(this, width, height, speed);
        },

        initBranch: function() {
            var branchs = this.opt.branch || [];
            this.branchs = [];
            this.addBranchs(branchs);
        },

        initBloom: function() {
            var bloom = this.opt.bloom || {};
            var cache = [],
                width = bloom.width || this.width,
                height = bloom.height || this.height,
                figure = this.seed.heart.figure;
            
            var together = new Date(config.date);
            var now = new Date();
            var days = Math.floor((now.getTime() - together.getTime()) / (24 * 60 * 60 * 1000));
            var numHearts = Math.max(1, Math.min(days, 400));
            
            var r = 240;
            for (var i = 0; i < numHearts; i++) {
                cache.push(this.createBloom(width, height, r, figure));
            }
            this.blooms = [];
            this.bloomsCache = cache;
        },

        initCats: function() {
            var groundY = this.height - 25;
            
            this.cats.push(new Cat(this, 200, groundY, 'gold', false, 'Chill Gold'));
            this.cats.push(new Cat(this, 350, groundY, 'gold', true, 'Playful Gold'));
            
            this.cats.push(new Cat(this, 500, groundY, 'silver', true, 'Silver 1'));
            this.cats.push(new Cat(this, 650, groundY, 'silver', true, 'Silver 2'));
            this.cats.push(new Cat(this, 800, groundY, 'silver', true, 'Silver 3'));
        },

        toDataURL: function(type) {
            return this.canvas.toDataURL(type);
        },

        draw: function(k) {
            var rec = this.record[k];
            if (!rec) return;
            this.ctx.save();
            this.ctx.putImageData(rec.image, rec.point.x, rec.point.y);
            this.ctx.restore();
        },

        addBranch: function(branch) {
            this.branchs.push(branch);
        },

        addBranchs: function(branchs) {
            for (var i = 0; i < branchs.length; i++) {
                var b = branchs[i];
                var p1 = new Point(b[0], b[1]);
                var p2 = new Point(b[2], b[3]);
                var p3 = new Point(b[4], b[5]);
                this.addBranch(new Branch(this, p1, p2, p3, b[6], b[7], b[8]));
            }
        },

        removeBranch: function(branch) {
            for (var i = 0; i < this.branchs.length; i++) {
                if (this.branchs[i] === branch) {
                    this.branchs.splice(i, 1);
                    break;
                }
            }
        },

        canGrow: function() {
            return !!this.branchs.length;
        },
        
        grow: function() {
            for (var i = 0; i < this.branchs.length; i++) {
                if (this.branchs[i]) {
                    this.branchs[i].grow();
                }
            }
        },

        addBloom: function(bloom) {
            this.blooms.push(bloom);
        },

        removeBloom: function(bloom) {
            for (var i = 0; i < this.blooms.length; i++) {
                if (this.blooms[i] === bloom) {
                    this.blooms.splice(i, 1);
                    break;
                }
            }
        },

        createBloom: function(width, height, radius, figure, color, alpha, angle, scale, place, speed) {
            var x, y;
            while (true) {
                x = random(20, width - 20);
                y = random(20, height - 20);
                if (inheart(x - width / 2, height - (height - 40) / 2 - y, radius)) {
                    return new Bloom(this, new Point(x, y), figure, color, alpha, angle, scale, place, speed);
                }
            }
        },
        
        canFlower: function() {
            return !!this.blooms.length;
        },
        
        flower: function(num) {
            var blooms = this.bloomsCache.splice(0, num);
            for (var i = 0; i < blooms.length; i++) {
                this.addBloom(blooms[i]);
            }
            for (var j = 0; j < this.blooms.length; j++) {
                this.blooms[j].flower();
            }
        },

        snapshot: function(k, x, y, width, height) {
            var image = this.ctx.getImageData(x, y, width, height);
            this.record[k] = {
                image: image,
                point: new Point(x, y),
                width: width,
                height: height
            };
        },
        
        setSpeed: function(k, speed) {
            this.record[k || "move"].speed = speed;
        },
        
        move: function(k, x, y) {
            var rec = this.record[k || "move"];
            var point = rec.point,
                image = rec.image,
                speed = rec.speed || 10,
                width = rec.width,
                height = rec.height;

            var i = point.x + speed < x ? point.x + speed : x;
            var j = point.y + speed < y ? point.y + speed : y;

            this.ctx.save();
            this.ctx.clearRect(point.x, point.y, width, height);
            this.ctx.putImageData(image, i, j);
            this.ctx.restore();

            rec.point = new Point(i, j);
            rec.speed = speed * 0.95;
            if (rec.speed < 2) rec.speed = 2;
            
            return i < x || j < y;
        },

        addPetal: function() {
            var x = random(this.width * 0.25, this.width * 0.85);
            var y = random(-30, -10);
            this.petals.push(new SakuraPetal(this, x, y));
        },

        addFlower: function(x, y) {
            this.flowers.push(new SakuraFlower(this, x, y));
        },

        updateWind: function() {
            this.windPhase += 0.008;
            if (random(0, 100) < 1) {
                this.windTarget = randomFloat(-1.5, 1.5);
            }
            this.wind += (this.windTarget - this.wind) * 0.02;
            this.wind += Math.sin(this.windPhase) * 0.1;
        },

        jump: function() {
            this.updateWind();
            
            for (var i = this.petals.length - 1; i >= 0; i--) {
                if (!this.petals[i].update(this.wind)) {
                    this.petals.splice(i, 1);
                }
            }
            
            for (var i = 0; i < this.flowers.length; i++) {
                this.flowers[i].grow();
            }
            
            for (var i = 0; i < this.blooms.length; i++) {
                this.blooms[i].jump();
            }
            
            for (var i = 0; i < this.cats.length; i++) {
                this.cats[i].update();
            }
            
            if ((this.blooms.length && this.blooms.length < 3) || !this.blooms.length) {
                var bloom = this.opt.bloom || {};
                var width = bloom.width || this.width;
                var height = bloom.height || this.height;
                var figure = this.seed.heart.figure;
                var r = 240;
                
                for (var i = 0; i < random(1, 2); i++) {
                    this.blooms.push(this.createBloom(
                        width / 2 + width, height, r, figure, 
                        null, 1, null, 1, 
                        new Point(random(-100, 600), 720), 
                        random(200, 300)
                    ));
                }
            }
            
            if (random(0, 100) < 12 && this.petals.length < 35) {
                this.addPetal();
            }
        }
    }

    Branch = function(tree, point1, point2, point3, radius, length, branchs) {
        this.tree = tree;
        this.point1 = point1;
        this.point2 = point2;
        this.point3 = point3;
        this.radius = radius;
        this.length = length || 100;
        this.len = 0;
        this.t = 1 / (this.length - 1);
        this.branchs = branchs || [];
        
        this.flowerPoints = [];
        var flowerCount = random(2, 4);
        for (var i = 0; i < flowerCount; i++) {
            this.flowerPoints.push(randomFloat(0.4, 0.95));
        }
    }

    Branch.prototype = {
        grow: function() {
            if (this.len <= this.length) {
                var p = bezier([this.point1, this.point2, this.point3], this.len * this.t);
                this.draw(p);
                
                for (var i = this.flowerPoints.length - 1; i >= 0; i--) {
                    if (Math.abs(this.len * this.t - this.flowerPoints[i]) < 0.03) {
                        var fp = bezier([this.point1, this.point2, this.point3], this.flowerPoints[i]);
                        this.tree.addFlower(
                            fp.x + randomFloat(-12, 12),
                            fp.y + randomFloat(-12, 12)
                        );
                        this.flowerPoints.splice(i, 1);
                    }
                }
                
                this.len += 1;
                this.radius *= 0.97;
            } else {
                this.tree.removeBranch(this);
                this.tree.addBranchs(this.branchs);
            }
        },
        
        draw: function(p) {
            var ctx = this.tree.ctx;
            
            ctx.save();
            ctx.beginPath();
            
            var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, this.radius * 1.2);
            gradient.addColorStop(0, 'rgb(82, 56, 45)');
            gradient.addColorStop(0.6, 'rgb(62, 42, 32)');
            gradient.addColorStop(1, 'rgb(52, 35, 28)');
            
            ctx.fillStyle = gradient;
            ctx.arc(p.x, p.y, this.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
    }

    Bloom = function(tree, point, figure, color, alpha, angle, scale, place, speed) {
        this.tree = tree;
        this.point = point;
        this.figure = figure;
        
        var baseColor = SAKURA_PINK[random(0, SAKURA_PINK.length - 1)];
        this.color = baseColor;
        this.alpha = alpha || randomFloat(0.7, 0.95);
        this.angle = angle || randomFloat(0, Math.PI * 2);
        this.scale = scale || 0.1;
        this.place = place;
        this.speed = speed;
    }
    
    Bloom.prototype = {
        flower: function() {
            this.draw();
            this.scale += 0.1;
            if (this.scale > 1) {
                this.tree.removeBloom(this);
            }
        },
        
        draw: function() {
            var ctx = this.tree.ctx;
            
            ctx.save();
            ctx.translate(this.point.x, this.point.y);
            ctx.scale(this.scale, this.scale);
            ctx.rotate(this.angle);
            ctx.globalAlpha = this.alpha;
            
            var gradient = ctx.createRadialGradient(0, -5, 0, 0, -5, 18);
            gradient.addColorStop(0, 'rgba(255, 250, 245, 0.95)');
            gradient.addColorStop(0.4, 'rgba(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ', 0.85)');
            gradient.addColorStop(1, 'rgba(' + (this.color.r - 20) + ',' + (this.color.g - 20) + ',' + (this.color.b - 15) + ', 0.75)');
            
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < this.figure.length; i++) {
                var p = this.figure.get(i);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath();
            ctx.fill();
            
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.ellipse(-4, -6, 3, 2.5, -0.3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        },
        
        jump: function() {
            if (this.point.x < -20 || this.point.y > this.tree.height + 20) {
                this.tree.removeBloom(this);
            } else {
                this.draw();
                this.point = this.place.sub(this.point).div(this.speed * 1.5).add(this.point);
                this.angle += 0.025;
                this.speed -= 0.5;
            }
        }
    }

    window.random = random;
    window.randomFloat = randomFloat;
    window.bezier = bezier;
    window.Point = Point;
    window.Tree = Tree;

})(window);
