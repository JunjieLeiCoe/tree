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

    var SAKURA_COLORS = [
        'rgba(255, 183, 197, ',
        'rgba(255, 192, 203, ',
        'rgba(255, 209, 220, ',
        'rgba(255, 228, 235, ',
        'rgba(255, 240, 245, ',
        'rgba(255, 174, 185, ',
        'rgba(255, 160, 175, '
    ];

    var PETAL_COLORS = [
        '#FFB7C5',
        '#FFC0CB',
        '#FFD1DC',
        '#FFE4EB',
        '#FFAEB9',
        '#FFA0AF',
        '#FF91A4'
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
            p = this.clone();
            p.x += o.x;
            p.y += o.y;
            return p;
        },
        sub: function(o) {
            p = this.clone();
            p.x -= o.x;
            p.y -= o.y;
            return p;
        },
        div: function(n) {
            p = this.clone();
            p.x /= n;
            p.y /= n;
            return p;
        },
        mul: function(n) {
            p = this.clone();
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
        var scale = scale || 1
        var color = color || '#FF69B4';

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
            var point = heart.point, color = heart.color, 
                scale = heart.scale;
            ctx.save();
            
            var gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 30 * scale);
            gradient.addColorStop(0, '#FF69B4');
            gradient.addColorStop(0.5, '#FF1493');
            gradient.addColorStop(1, '#C71585');
            
            ctx.fillStyle = gradient;
            ctx.shadowColor = '#FF69B4';
            ctx.shadowBlur = 20;
            ctx.translate(point.x, point.y);
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
            ctx.fillStyle = color;
            ctx.shadowColor = '#FF69B4';
            ctx.shadowBlur = 10;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        drawText: function() {
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point, color = heart.color, 
                scale = heart.scale;
            ctx.save();
            ctx.strokeStyle = '#FF69B4';
            ctx.fillStyle = '#FF69B4';
            ctx.shadowColor = '#FF69B4';
            ctx.shadowBlur = 5;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.moveTo(0, 0);
            ctx.lineTo(15, 15);
            ctx.lineTo(60, 15);
            ctx.stroke();

            ctx.moveTo(0, 0);
            ctx.scale(0.75, 0.75);
            ctx.font = "bold 14px 'Georgia', serif";
            ctx.fillText("click here ♡", 23, 16);
            ctx.restore();
        },
        clear: function() {
            var ctx = this.tree.ctx, cirle = this.cirle;
            var point = cirle.point, scale = cirle.scale, radius = 26;
            var w = h = (radius * scale);
            ctx.clearRect(point.x - w, point.y - h, 4 * w, 4 * h);
        },
        hover: function(x, y) {
            var ctx = this.tree.ctx;
            var pixel = ctx.getImageData(x, y, 1, 1);
            return pixel.data[3] == 255
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
            gradient.addColorStop(0, 'rgba(101, 67, 33, 0)');
            gradient.addColorStop(0.3, 'rgba(101, 67, 33, 1)');
            gradient.addColorStop(0.7, 'rgba(101, 67, 33, 1)');
            gradient.addColorStop(1, 'rgba(101, 67, 33, 0)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.height;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(len, 0);
            ctx.lineTo(-len, 0);
            ctx.stroke();
            ctx.restore();

            if (this.length < this.width) {
                this.length += this.speed;
            }
        }
    }

    SakuraPetal = function(tree, point, size, color) {
        this.tree = tree;
        this.point = point;
        this.size = size || randomFloat(3, 8);
        this.color = color || PETAL_COLORS[random(0, PETAL_COLORS.length - 1)];
        this.alpha = randomFloat(0.6, 1);
        this.angle = randomFloat(0, Math.PI * 2);
        this.rotationSpeed = randomFloat(-0.05, 0.05);
        this.speedX = randomFloat(-1, 1);
        this.speedY = randomFloat(0.5, 2);
        this.wobbleSpeed = randomFloat(0.02, 0.05);
        this.wobblePhase = randomFloat(0, Math.PI * 2);
        this.wobbleAmount = randomFloat(0.5, 1.5);
        this.lifespan = random(200, 400);
        this.age = 0;
    }
    SakuraPetal.prototype = {
        draw: function() {
            var ctx = this.tree.ctx;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.point.x, this.point.y);
            ctx.rotate(this.angle);
            
            var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(0.4, this.color);
            gradient.addColorStop(1, this.color);
            
            ctx.fillStyle = gradient;
            ctx.shadowColor = 'rgba(255, 182, 193, 0.5)';
            ctx.shadowBlur = 3;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(
                this.size * 0.5, -this.size * 0.8,
                this.size, -this.size * 0.3,
                this.size, 0
            );
            ctx.bezierCurveTo(
                this.size, this.size * 0.3,
                this.size * 0.5, this.size * 0.8,
                0, this.size * 0.5
            );
            ctx.bezierCurveTo(
                -this.size * 0.5, this.size * 0.8,
                -this.size, this.size * 0.3,
                -this.size, 0
            );
            ctx.bezierCurveTo(
                -this.size, -this.size * 0.3,
                -this.size * 0.5, -this.size * 0.8,
                0, 0
            );
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        },
        update: function() {
            this.age++;
            this.wobblePhase += this.wobbleSpeed;
            
            this.point.x += this.speedX + Math.sin(this.wobblePhase) * this.wobbleAmount;
            this.point.y += this.speedY;
            this.angle += this.rotationSpeed;
            
            if (this.age > this.lifespan * 0.7) {
                this.alpha -= 0.02;
            }
            
            if (this.point.y > this.tree.height + 20 || 
                this.point.x < -20 || 
                this.point.x > this.tree.width + 20 ||
                this.alpha <= 0) {
                return false;
            }
            
            this.draw();
            return true;
        }
    }

    Firefly = function(tree, point) {
        this.tree = tree;
        this.point = point;
        this.size = randomFloat(2, 4);
        this.alpha = 0;
        this.targetAlpha = randomFloat(0.5, 1);
        this.color = ['255, 255, 200', '255, 240, 180', '255, 220, 150', '200, 255, 200'][random(0, 3)];
        this.angle = randomFloat(0, Math.PI * 2);
        this.speed = randomFloat(0.3, 0.8);
        this.wobblePhase = randomFloat(0, Math.PI * 2);
        this.pulsePhase = randomFloat(0, Math.PI * 2);
        this.pulseSpeed = randomFloat(0.03, 0.08);
        this.lifespan = random(150, 300);
        this.age = 0;
    }
    Firefly.prototype = {
        draw: function() {
            var ctx = this.tree.ctx;
            ctx.save();
            
            var pulseSize = this.size + Math.sin(this.pulsePhase) * this.size * 0.3;
            
            var gradient = ctx.createRadialGradient(
                this.point.x, this.point.y, 0,
                this.point.x, this.point.y, pulseSize * 3
            );
            gradient.addColorStop(0, 'rgba(' + this.color + ', ' + this.alpha + ')');
            gradient.addColorStop(0.3, 'rgba(' + this.color + ', ' + (this.alpha * 0.5) + ')');
            gradient.addColorStop(1, 'rgba(' + this.color + ', 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.point.x, this.point.y, pulseSize * 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (this.alpha * 0.8) + ')';
            ctx.beginPath();
            ctx.arc(this.point.x, this.point.y, pulseSize * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        },
        update: function() {
            this.age++;
            this.wobblePhase += 0.05;
            this.pulsePhase += this.pulseSpeed;
            
            if (this.age < 30) {
                this.alpha = Math.min(this.targetAlpha, this.alpha + 0.03);
            } else if (this.age > this.lifespan - 30) {
                this.alpha -= 0.03;
            }
            
            this.point.x += Math.cos(this.angle + Math.sin(this.wobblePhase) * 0.5) * this.speed;
            this.point.y += Math.sin(this.angle + Math.cos(this.wobblePhase) * 0.5) * this.speed;
            
            this.angle += randomFloat(-0.1, 0.1);
            
            if (this.age > this.lifespan || this.alpha <= 0) {
                return false;
            }
            
            this.draw();
            return true;
        }
    }

    CherryBlossom = function(tree, point, size) {
        this.tree = tree;
        this.point = point;
        this.size = size || randomFloat(8, 15);
        this.alpha = 0;
        this.targetAlpha = randomFloat(0.7, 1);
        this.angle = randomFloat(0, Math.PI * 2);
        this.petalCount = 5;
        this.color = PETAL_COLORS[random(0, PETAL_COLORS.length - 1)];
        this.centerColor = '#FFD700';
        this.growthPhase = 0;
        this.pulsePhase = randomFloat(0, Math.PI * 2);
    }
    CherryBlossom.prototype = {
        draw: function() {
            var ctx = this.tree.ctx;
            var currentSize = this.size * Math.min(1, this.growthPhase);
            
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.point.x, this.point.y);
            ctx.rotate(this.angle);
            
            ctx.shadowColor = 'rgba(255, 182, 193, 0.5)';
            ctx.shadowBlur = 8;
            
            for (var i = 0; i < this.petalCount; i++) {
                ctx.save();
                ctx.rotate((Math.PI * 2 / this.petalCount) * i);
                
                var gradient = ctx.createRadialGradient(0, -currentSize * 0.5, 0, 0, -currentSize * 0.5, currentSize);
                gradient.addColorStop(0, '#FFFFFF');
                gradient.addColorStop(0.3, this.color);
                gradient.addColorStop(1, this.color);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(
                    -currentSize * 0.4, -currentSize * 0.2,
                    -currentSize * 0.5, -currentSize * 0.8,
                    0, -currentSize
                );
                ctx.bezierCurveTo(
                    currentSize * 0.5, -currentSize * 0.8,
                    currentSize * 0.4, -currentSize * 0.2,
                    0, 0
                );
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            
            var pulseAmount = Math.sin(this.pulsePhase) * 0.2 + 1;
            var centerSize = currentSize * 0.25 * pulseAmount;
            
            var centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, centerSize);
            centerGradient.addColorStop(0, '#FFFFFF');
            centerGradient.addColorStop(0.5, this.centerColor);
            centerGradient.addColorStop(1, '#FFA500');
            
            ctx.fillStyle = centerGradient;
            ctx.beginPath();
            ctx.arc(0, 0, centerSize, 0, Math.PI * 2);
            ctx.fill();
            
            for (var j = 0; j < 5; j++) {
                ctx.save();
                ctx.rotate((Math.PI * 2 / 5) * j + this.pulsePhase * 0.1);
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.ellipse(0, -centerSize * 0.8, 1, centerSize * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(0, -centerSize * 1.1, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            
            ctx.restore();
        },
        grow: function() {
            if (this.growthPhase < 1) {
                this.growthPhase += 0.05;
            }
            if (this.alpha < this.targetAlpha) {
                this.alpha += 0.05;
            }
            this.pulsePhase += 0.02;
            this.draw();
            return this.growthPhase >= 1;
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
        this.fireflies = [];
        this.cherryBlossoms = [];
        this.windStrength = 0;
        this.windPhase = 0;
        
        this.initSeed();
        this.initFooter();
        this.initBranch();
        this.initBloom();
    }
    Tree.prototype = {
        initSeed: function() {
            var seed = this.opt.seed || {};
            var x = seed.x || this.width / 2;
            var y = seed.y || this.height / 2;
            var point = new Point(x, y);
            var color = seed.color || '#FF69B4';
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
            var branchs = this.opt.branch || []
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
            var numHearts = Math.max(1, Math.min(days, 500));
            
            var r = 240, x, y;
            for (var i = 0; i < numHearts; i++) {
                cache.push(this.createBloom(width, height, r, figure));
            }
            this.blooms = [];
            this.bloomsCache = cache;
        },

        toDataURL: function(type) {
            return this.canvas.toDataURL(type);
        },

        draw: function(k) {
            var s = this, ctx = s.ctx;
            var rec = s.record[k];
            if (!rec) {
                return ;
            }
            var point = rec.point,
                image = rec.image;

            ctx.save();
            ctx.putImageData(image, point.x, point.y);
            ctx.restore();
        },

        addBranch: function(branch) {
            this.branchs.push(branch);
        },

        addBranchs: function(branchs){
            var s = this, b, p1, p2, p3, r, l, c;
            for (var i = 0; i < branchs.length; i++) {
                b = branchs[i];
                p1 = new Point(b[0], b[1]);
                p2 = new Point(b[2], b[3]);
                p3 = new Point(b[4], b[5]);
                r = b[6];
                l = b[7];
                c = b[8]
                s.addBranch(new Branch(s, p1, p2, p3, r, l, c)); 
            }
        },

        removeBranch: function(branch) {
            var branchs = this.branchs;
            for (var i = 0; i < branchs.length; i++) {
                if (branchs[i] === branch) {
                    branchs.splice(i, 1);
                }
            }
        },

        canGrow: function() {
            return !!this.branchs.length;
        },
        grow: function() {
            var branchs = this.branchs;
            for (var i = 0; i < branchs.length; i++) {
                var branch = branchs[i];
                if (branch) {
                    branch.grow();
                }
            }
        },

        addBloom: function (bloom) {
            this.blooms.push(bloom);
        },

        removeBloom: function (bloom) {
            var blooms = this.blooms;
            for (var i = 0; i < blooms.length; i++) {
                if (blooms[i] === bloom) {
                    blooms.splice(i, 1);
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
            var s = this, blooms = s.bloomsCache.splice(0, num);
            for (var i = 0; i < blooms.length; i++) {
                s.addBloom(blooms[i]);
            }
            blooms = s.blooms;
            for (var j = 0; j < blooms.length; j++) {
                blooms[j].flower();
            }
        },

        snapshot: function(k, x, y, width, height) {
            var ctx = this.ctx;
            var image = ctx.getImageData(x, y, width, height); 
            this.record[k] = {
                image: image,
                point: new Point(x, y),
                width: width,
                height: height
            }
        },
        setSpeed: function(k, speed) {
            this.record[k || "move"].speed = speed;
        },
        move: function(k, x, y) {
            var s = this, ctx = s.ctx;
            var rec = s.record[k || "move"];
            var point = rec.point,
                image = rec.image,
                speed = rec.speed || 10,
                width = rec.width,
                height = rec.height; 

            i = point.x + speed < x ? point.x + speed : x;
            j = point.y + speed < y ? point.y + speed : y; 

            ctx.save();
            ctx.clearRect(point.x, point.y, width, height);
            ctx.putImageData(image, i, j);
            ctx.restore();

            rec.point = new Point(i, j);
            rec.speed = speed * 0.95;

            if (rec.speed < 2) {
                rec.speed = 2;
            }
            return i < x || j < y;
        },

        addPetal: function() {
            var x = random(this.width * 0.3, this.width * 0.8);
            var y = random(-50, this.height * 0.3);
            this.petals.push(new SakuraPetal(this, new Point(x, y)));
        },

        addFirefly: function() {
            var x = random(this.width * 0.2, this.width * 0.8);
            var y = random(this.height * 0.2, this.height * 0.7);
            this.fireflies.push(new Firefly(this, new Point(x, y)));
        },

        addCherryBlossom: function(x, y) {
            this.cherryBlossoms.push(new CherryBlossom(this, new Point(x, y)));
        },

        updateWind: function() {
            this.windPhase += 0.01;
            this.windStrength = Math.sin(this.windPhase) * 0.5 + Math.sin(this.windPhase * 2.3) * 0.3;
        },

        jump: function() {
            var s = this, blooms = s.blooms;
            
            this.updateWind();
            
            for (var i = this.petals.length - 1; i >= 0; i--) {
                this.petals[i].speedX += this.windStrength * 0.1;
                if (!this.petals[i].update()) {
                    this.petals.splice(i, 1);
                }
            }
            
            for (var i = this.fireflies.length - 1; i >= 0; i--) {
                if (!this.fireflies[i].update()) {
                    this.fireflies.splice(i, 1);
                }
            }
            
            for (var i = 0; i < this.cherryBlossoms.length; i++) {
                this.cherryBlossoms[i].grow();
            }
            
            if (blooms.length) {
                for (var i = 0; i < blooms.length; i++) {
                    blooms[i].jump();
                }
            } 
            
            if ((blooms.length && blooms.length < 3) || !blooms.length) {
                var bloom = this.opt.bloom || {},
                    width = bloom.width || this.width,
                    height = bloom.height || this.height,
                    figure = this.seed.heart.figure;
                var r = 240;
                
                for (var i = 0; i < random(1, 2); i++) {
                    blooms.push(this.createBloom(width / 2 + width, height, r, figure, null, 1, null, 1, new Point(random(-100, 600), 720), random(200, 300)));
                }
            }
            
            if (random(0, 100) < 15 && this.petals.length < 50) {
                this.addPetal();
            }
            
            if (random(0, 100) < 2 && this.fireflies.length < 15) {
                this.addFirefly();
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
        this.blossomPoints = [];
        
        for (var i = 0; i < random(2, 5); i++) {
            this.blossomPoints.push(randomFloat(0.3, 0.95));
        }
    }

    Branch.prototype = {
        grow: function() {
            var s = this, p; 
            if (s.len <= s.length) {
                p = bezier([s.point1, s.point2, s.point3], s.len * s.t);
                s.draw(p);
                
                for (var i = 0; i < s.blossomPoints.length; i++) {
                    if (Math.abs(s.len * s.t - s.blossomPoints[i]) < 0.02) {
                        var bp = bezier([s.point1, s.point2, s.point3], s.blossomPoints[i]);
                        s.tree.addCherryBlossom(bp.x + random(-15, 15), bp.y + random(-15, 15));
                        s.blossomPoints.splice(i, 1);
                        i--;
                    }
                }
                
                s.len += 1;
                s.radius *= 0.97;
            } else {
                s.tree.removeBranch(s);
                s.tree.addBranchs(s.branchs);
            }
        },
        draw: function(p) {
            var s = this;
            var ctx = s.tree.ctx;
            ctx.save();
            ctx.beginPath();
            
            var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s.radius);
            gradient.addColorStop(0, 'rgb(90, 60, 40)');
            gradient.addColorStop(0.5, 'rgb(60, 40, 25)');
            gradient.addColorStop(1, 'rgb(40, 25, 15)');
            
            ctx.fillStyle = gradient;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, s.radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    Bloom = function(tree, point, figure, color, alpha, angle, scale, place, speed) {
        this.tree = tree;
        this.point = point;
        this.baseColor = color || PETAL_COLORS[random(0, PETAL_COLORS.length - 1)];
        this.gradientColor = PETAL_COLORS[random(0, PETAL_COLORS.length - 1)];
        this.alpha = alpha || random(0.6, 1);
        this.angle = angle || random(0, 360);
        this.scale = scale || 0.1;
        this.place = place;
        this.speed = speed;
        this.figure = figure;
        this.glowPhase = randomFloat(0, Math.PI * 2);
    }
    Bloom.prototype = {
        setFigure: function(figure) {
            this.figure = figure;
        },
        flower: function() {
            var s = this;
            s.draw();
            s.scale += 0.1;
            if (s.scale > 1) {
                s.tree.removeBloom(s);
            }
        },
        draw: function() {
            var s = this, ctx = s.tree.ctx, figure = s.figure;
            s.glowPhase += 0.05;

            ctx.save();
            ctx.translate(s.point.x, s.point.y);
            ctx.scale(s.scale, s.scale);
            ctx.rotate(s.angle);
            
            var glowIntensity = Math.sin(s.glowPhase) * 5 + 10;
            ctx.shadowColor = 'rgba(255, 105, 180, 0.6)';
            ctx.shadowBlur = glowIntensity;
            
            var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
            gradient.addColorStop(0, '#FFFFFF');
            gradient.addColorStop(0.3, s.baseColor);
            gradient.addColorStop(1, s.gradientColor);
            
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < figure.length; i++) {
                var p = figure.get(i);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath();
            ctx.fill();
            
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.beginPath();
            ctx.arc(-5, -5, 4, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        },
        jump: function() {
            var s = this, height = s.tree.height;

            if (s.point.x < -20 || s.point.y > height + 20) {
                s.tree.removeBloom(s);
            } else {
                s.draw();
                s.point = s.place.sub(s.point).div(s.speed * 1.5).add(s.point);
                s.angle += 0.03;
                s.speed -= 0.5;
            }
        }
    }

    window.random = random;
    window.randomFloat = randomFloat;
    window.bezier = bezier;
    window.Point = Point;
    window.Tree = Tree;

})(window);
