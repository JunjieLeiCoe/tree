/*
 * Functions - modernized counter & typewriter
 */

var $win = $(window);

// Typewriter plugin
(function($) {
    $.fn.typewriter = function() {
        this.each(function() {
            var $ele = $(this), str = $ele.html(), progress = 0;
            $ele.html('');
            var timer = setInterval(function() {
                var current = str.substr(progress, 1);
                if (current == '<') {
                    progress = str.indexOf('>', progress) + 1;
                } else {
                    progress++;
                }
                $ele.html(str.substring(0, progress) + (progress & 1 ? '_' : ''));
                if (progress >= str.length) {
                    clearInterval(timer);
                }
            }, 75);
        });
        return this;
    };
})(jQuery);

// Modern counter - updates individual DOM elements
function timeElapse(date) {
    var seconds = (+new Date() - date.getTime()) / 1000;
    var days = Math.floor(seconds / (3600 * 24));
    seconds = seconds % (3600 * 24);
    var hours = Math.floor(seconds / 3600);
    seconds = seconds % 3600;
    var minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    document.getElementById('clock-days').textContent = days;
    document.getElementById('clock-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('clock-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('clock-seconds').textContent = String(seconds).padStart(2, '0');
}
