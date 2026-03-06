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

    // ============================================================
    // Vibrant anime sakura palette
    // ============================================================
    var SAKURA_PINK = [
        {r: 255, g: 183, b: 197, a: 0.85},
        {r: 255, g: 200, b: 212, a: 0.82},
        {r: 252, g: 170, b: 192, a: 0.78},
        {r: 255, g: 218, b: 225, a: 0.90},
        {r: 248, g: 160, b: 185, a: 0.72},
        {r: 255, g: 192, b: 205, a: 0.85},
        {r: 255, g: 230, b: 236, a: 0.92},
        {r: 245, g: 148, b: 178, a: 0.75}
    ];

    // ============================================================
    // Point
    // ============================================================
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

    // ============================================================
    // Heart
    // ============================================================
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

    // ============================================================
    // Seed (clickable heart - unchanged)
    // ============================================================
    Seed = function(tree, point, scale, color) {
        this.tree = tree;
        var scale = scale || 1;
        var color = color || '#c8a0a0';

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
            gradient.addColorStop(0, '#e0c0c0');
            gradient.addColorStop(0.5, '#c8a0a0');
            gradient.addColorStop(1, '#b08888');

            ctx.fillStyle = gradient;

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
            var point = cirle.point, scale = cirle.scale, radius = cirle.radius;
            ctx.save();
            ctx.fillStyle = '#c8a0a0';
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
            ctx.strokeStyle = '#a08888';
            ctx.fillStyle = '#a08888';
            ctx.lineWidth = 1;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.moveTo(0, 0);
            ctx.lineTo(15, 15);
            ctx.lineTo(55, 15);
            ctx.stroke();

            ctx.scale(0.75, 0.75);
            ctx.font = "12px Georgia, serif";
            ctx.fillText("click", 25, 13);
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

    // ============================================================
    // Footer (unchanged)
    // ============================================================
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
            gradient.addColorStop(0, 'rgba(80, 60, 50, 0)');
            gradient.addColorStop(0.15, 'rgba(80, 60, 50, 0.6)');
            gradient.addColorStop(0.5, 'rgba(65, 50, 42, 0.85)');
            gradient.addColorStop(0.85, 'rgba(80, 60, 50, 0.6)');
            gradient.addColorStop(1, 'rgba(80, 60, 50, 0)');

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

    // ============================================================
    // SakuraPetal - larger, more visible, notch shape
    // ============================================================
    SakuraPetal = function(tree, x, y) {
        this.tree = tree;
        this.x = x;
        this.y = y;

        var colorData = SAKURA_PINK[random(0, SAKURA_PINK.length - 1)];
        this.color = colorData;

        this.size = randomFloat(5, 13);
        this.rotation = randomFloat(0, Math.PI * 2);
        this.rotationSpeed = randomFloat(-0.03, 0.03);
        this.rotation3D = {
            x: randomFloat(0, Math.PI * 2),
            y: randomFloat(0, Math.PI * 2),
            speedX: randomFloat(-0.02, 0.02),
            speedY: randomFloat(-0.02, 0.02)
        };

        this.speedY = randomFloat(0.3, 1.0);
        this.speedX = randomFloat(-0.3, 0.3);
        this.swayPhase = randomFloat(0, Math.PI * 2);
        this.swaySpeed = randomFloat(0.012, 0.03);
        this.swayAmount = randomFloat(0.4, 1.0);

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

            var s = this.size;
            var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 1.2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            gradient.addColorStop(0.25, 'rgba(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ', 0.9)');
            gradient.addColorStop(1, 'rgba(' + (this.color.r - 15) + ',' + (this.color.g - 12) + ',' + (this.color.b - 8) + ', 0.65)');

            ctx.fillStyle = gradient;

            // Sakura petal with notch at tip
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.3);
            ctx.bezierCurveTo(
                s * 0.9, -s * 0.85,
                s * 1.1, s * 0.15,
                s * 0.08, s * 0.65
            );
            ctx.lineTo(0, s * 0.5);
            ctx.lineTo(-s * 0.08, s * 0.65);
            ctx.bezierCurveTo(
                -s * 1.1, s * 0.15,
                -s * 0.9, -s * 0.85,
                0, -s * 0.3
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

    // ============================================================
    // SakuraFlower - anime style with glow & notched petals
    // ============================================================
    SakuraFlower = function(tree, x, y, size) {
        this.tree = tree;
        this.x = x;
        this.y = y;
        this.size = size || randomFloat(8, 17);
        this.rotation = randomFloat(0, Math.PI * 2);
        this.alpha = 0;
        this.targetAlpha = randomFloat(0.82, 1.0);
        this.petalCount = 5;
        this.growthPhase = 0;
        this.done = false;

        var baseColor = SAKURA_PINK[random(0, SAKURA_PINK.length - 1)];
        this.petalColor = baseColor;
        this.centerColor = {r: 255, g: 235, b: 195};
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

            // Glow effect during growth phase
            if (!this.done) {
                ctx.shadowBlur = 16;
                ctx.shadowColor = 'rgba(255, 175, 195, 0.35)';
            }

            var s = currentSize;

            // Draw 5 sakura petals with notch
            for (var i = 0; i < this.petalCount; i++) {
                ctx.save();
                ctx.rotate((Math.PI * 2 / this.petalCount) * i);

                var gradient = ctx.createLinearGradient(0, 0, 0, -s);
                gradient.addColorStop(0, 'rgba(255, 252, 250, 0.92)');
                gradient.addColorStop(0.25, 'rgba(' + this.petalColor.r + ',' + this.petalColor.g + ',' + this.petalColor.b + ', 0.88)');
                gradient.addColorStop(0.7, 'rgba(' + (this.petalColor.r - 5) + ',' + (this.petalColor.g - 5) + ',' + (this.petalColor.b - 3) + ', 0.8)');
                gradient.addColorStop(1, 'rgba(' + (this.petalColor.r - 15) + ',' + (this.petalColor.g - 12) + ',' + (this.petalColor.b - 8) + ', 0.7)');

                ctx.fillStyle = gradient;

                // Classic sakura petal - wide base, notched tip
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(
                    -s * 0.52, -s * 0.35,
                    -s * 0.54, -s * 0.88,
                    -s * 0.07, -s * 0.97
                );
                ctx.lineTo(0, -s * 0.87);   // notch center
                ctx.lineTo(s * 0.07, -s * 0.97);
                ctx.bezierCurveTo(
                    s * 0.54, -s * 0.88,
                    s * 0.52, -s * 0.35,
                    0, 0
                );
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // Reset shadow for center
            ctx.shadowBlur = 0;

            // Warm golden center
            var cs = s * 0.2;
            var cg = ctx.createRadialGradient(0, 0, 0, 0, 0, cs);
            cg.addColorStop(0, 'rgba(255, 250, 225, 0.95)');
            cg.addColorStop(0.5, 'rgba(' + this.centerColor.r + ',' + this.centerColor.g + ',' + this.centerColor.b + ', 0.85)');
            cg.addColorStop(1, 'rgba(225, 195, 150, 0.65)');

            ctx.fillStyle = cg;
            ctx.beginPath();
            ctx.arc(0, 0, cs, 0, Math.PI * 2);
            ctx.fill();

            // Tiny stamen dots
            ctx.fillStyle = 'rgba(215, 175, 115, 0.6)';
            for (var j = 0; j < 4; j++) {
                var a = (Math.PI * 2 / 4) * j + this.rotation * 0.5;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * cs * 1.4, Math.sin(a) * cs * 1.4, 0.7, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        },

        grow: function() {
            if (this.done) {
                this.draw();
                return true;
            }
            if (this.growthPhase < 1) {
                this.growthPhase += 0.04;
            }
            if (this.alpha < this.targetAlpha) {
                this.alpha += 0.03;
            }
            this.draw();
            if (this.growthPhase >= 1 && this.alpha >= this.targetAlpha) {
                this.done = true;
            }
            return this.done;
        }
    }

    // ============================================================
    // Tree
    // ============================================================
    Tree = function(canvas, width, height, opt) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.opt = opt || {};
        this.record = {};
        this.petals = [];
        this.flowers = [];
        this.wind = 0;
        this.windTarget = 0;
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
            this.blooms = [];
            this.bloomsCache = [];
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
            var x = random(this.width * 0.2, this.width * 0.9);
            var y = random(-40, -10);
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

            // More petals for that anime atmosphere
            if (random(0, 100) < 20 && this.petals.length < 55) {
                this.addPetal();
            }
        }
    }

    // ============================================================
    // Branch - smooth tapered strokes instead of circles
    // ============================================================
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
        this.prevPoint = null;

        // More flowers along each branch
        this.flowerPoints = [];
        var flowerCount = random(4, 8);
        for (var i = 0; i < flowerCount; i++) {
            this.flowerPoints.push(randomFloat(0.3, 0.98));
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
                            fp.x + randomFloat(-15, 15),
                            fp.y + randomFloat(-15, 15)
                        );
                        this.flowerPoints.splice(i, 1);
                    }
                }

                this.len += 1;
                this.radius *= 0.97;
            } else {
                // Add flower cluster at branch tips (leaf branches)
                if (this.branchs.length === 0) {
                    var tip = bezier([this.point1, this.point2, this.point3], 1);
                    var tipCount = random(3, 6);
                    for (var j = 0; j < tipCount; j++) {
                        this.tree.addFlower(
                            tip.x + randomFloat(-20, 20),
                            tip.y + randomFloat(-20, 20)
                        );
                    }
                }

                this.tree.removeBranch(this);
                this.tree.addBranchs(this.branchs);
            }
        },

        draw: function(p) {
            var ctx = this.tree.ctx;
            var lineW = Math.max(this.radius * 2, 0.8);

            if (this.prevPoint) {
                ctx.save();
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                ctx.beginPath();
                ctx.moveTo(this.prevPoint.x, this.prevPoint.y);
                ctx.lineTo(p.x, p.y);

                if (lineW > 20) {
                    // Trunk - 3-layer depth (dark edge → mid → light center)
                    ctx.lineWidth = lineW;
                    ctx.strokeStyle = 'rgb(40, 28, 22)';
                    ctx.stroke();

                    ctx.lineWidth = lineW * 0.68;
                    ctx.strokeStyle = 'rgb(58, 42, 34)';
                    ctx.stroke();

                    ctx.lineWidth = lineW * 0.22;
                    ctx.strokeStyle = 'rgb(80, 60, 48)';
                    ctx.stroke();
                } else if (lineW > 6) {
                    // Medium branch - 2-layer
                    ctx.lineWidth = lineW;
                    ctx.strokeStyle = 'rgb(48, 35, 28)';
                    ctx.stroke();

                    ctx.lineWidth = lineW * 0.45;
                    ctx.strokeStyle = 'rgb(68, 50, 40)';
                    ctx.stroke();
                } else {
                    // Thin twig - single warm brown
                    ctx.lineWidth = lineW;
                    ctx.strokeStyle = 'rgb(72, 54, 43)';
                    ctx.stroke();
                }

                ctx.restore();
            }

            this.prevPoint = p;
        }
    }

    // ============================================================
    // Bloom (heart particles - updated colors)
    // ============================================================
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
            gradient.addColorStop(0, 'rgba(255, 248, 245, 0.88)');
            gradient.addColorStop(0.4, 'rgba(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ', 0.72)');
            gradient.addColorStop(1, 'rgba(' + (this.color.r - 12) + ',' + (this.color.g - 12) + ',' + (this.color.b - 8) + ', 0.55)');

            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < this.figure.length; i++) {
                var p = this.figure.get(i);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath();
            ctx.fill();

            // Small highlight
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.ellipse(-4, -6, 2.5, 2, -0.3, 0, Math.PI * 2);
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
