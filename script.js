window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
        return window.setTimeout(callback, 1000 / 60);
    };

var loaded = false;

var init = function () {
    if (loaded) return;
    loaded = true;

    var canvas = document.getElementById('heart');
    var ctx = canvas.getContext('2d');

    var width, height;

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    var rand = Math.random;

    var heartPosition = function (rad) {
        return [
            Math.pow(Math.sin(rad), 3),
            -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))
        ];
    };

    var scaleAndTranslate = function (pos, sx, sy, dx, dy) {
        return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    var mobile = window.innerWidth < 768;
    var traceCount = mobile ? 20 : 50;
    var dr = mobile ? 0.3 : 0.1;

    var pointsOrigin = [];
    var heartPointsCount;
    var targetPoints = [];

    function createHeartPoints() {
        pointsOrigin = [];

        var baseSize = Math.min(width, height) / 3;

        for (var i = 0; i < Math.PI * 2; i += dr)
            pointsOrigin.push(scaleAndTranslate(heartPosition(i), baseSize, baseSize / 16, 0, 0));

        for (var i = 0; i < Math.PI * 2; i += dr)
            pointsOrigin.push(scaleAndTranslate(heartPosition(i), baseSize * 0.7, baseSize / 20, 0, 0));

        for (var i = 0; i < Math.PI * 2; i += dr)
            pointsOrigin.push(scaleAndTranslate(heartPosition(i), baseSize * 0.4, baseSize / 30, 0, 0));

        heartPointsCount = pointsOrigin.length;
    }

    createHeartPoints();
    window.addEventListener('resize', createHeartPoints);

    var pulse = function (kx, ky) {
        for (var i = 0; i < pointsOrigin.length; i++) {
            targetPoints[i] = [
                kx * pointsOrigin[i][0] + width / 2,
                ky * pointsOrigin[i][1] + height / 2
            ];
        }
    };

    var e = [];

    function createParticles() {
        e = [];
        for (var i = 0; i < heartPointsCount; i++) {
            var x = rand() * width;
            var y = rand() * height;

            e[i] = {
                vx: 0,
                vy: 0,
                speed: rand() + 5,
                q: ~~(rand() * heartPointsCount),
                D: 2 * (i % 2) - 1,
                force: 0.2 * rand() + 0.7,
                f: "hsla(0," + ~~(40 * rand() + 100) + "%," + ~~(60 * rand() + 20) + "%,.3)",
                trace: []
            };

            for (var k = 0; k < traceCount; k++)
                e[i].trace[k] = { x: x, y: y };
        }
    }

    createParticles();
    window.addEventListener('resize', createParticles);

    var config = {
        traceK: 0.4,
        timeDelta: 0.01
    };

    var time = 0;

    function loop() {
        var n = -Math.cos(time);
        pulse((1 + n) * .5, (1 + n) * .5);

        time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? .2 : 1) * config.timeDelta;

        ctx.fillStyle = "rgba(0,0,0,.1)";
        ctx.fillRect(0, 0, width, height);

        for (var i = e.length; i--;) {
            var u = e[i];
            var q = targetPoints[u.q];

            var dx = u.trace[0].x - q[0];
            var dy = u.trace[0].y - q[1];
            var length = Math.sqrt(dx * dx + dy * dy);
            if (length === 0) length = 0.0001;

            if (10 > length) {
                if (0.95 < rand()) {
                    u.q = ~~(rand() * heartPointsCount);
                } else {
                    if (0.99 < rand()) u.D *= -1;
                    u.q += u.D;
                    u.q %= heartPointsCount;
                    if (u.q < 0) u.q += heartPointsCount;
                }
            }

            u.vx += -dx / length * u.speed;
            u.vy += -dy / length * u.speed;

            u.trace[0].x += u.vx;
            u.trace[0].y += u.vy;

            u.vx *= u.force;
            u.vy *= u.force;

            for (var k = 0; k < u.trace.length - 1;) {
                var T = u.trace[k];
                var N = u.trace[++k];
                N.x -= config.traceK * (N.x - T.x);
                N.y -= config.traceK * (N.y - T.y);
            }

            ctx.fillStyle = u.f;
            for (var k = 0; k < u.trace.length; k++) {
                ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
            }
        }

        requestAnimationFrame(loop);
    }

    loop();

    // ❤️ Romantic Click Reveal
    canvas.addEventListener("click", function () {
        var msg = document.getElementById("message");
        if (msg) msg.classList.add("show");
    });
};

if (document.readyState === 'complete' || document.readyState === 'interactive')
    init();
else
    document.addEventListener('DOMContentLoaded', init);