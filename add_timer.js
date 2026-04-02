const fs = require('fs');
const path = require('path');

const exams = [
    'phymoc.html',
    'moc.html',
    'chymock.html'
].map(f => path.join('c:/Users/lenovo/Downloads/online-test-managementsystem/public/HTML', f));

const timerHTML = `
            <div style="float: right; text-align: right; background: #fff; padding: 10px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: -10px;">
                <span style="font-size: 14px; color: #7f8c8d; display: block; margin-bottom: 5px;">Time Remaining</span>
                <span id="exam-timer" style="font-size: 24px; font-weight: bold; color: #e74c3c; font-family: monospace;">60:00</span>
            </div>`;

const timerScript = `
<script>
    var timeLeft = 60 * 60; // 60 minutes
    function startTimer() {
        var timerDisplay = document.getElementById('exam-timer');
        var timerInterval = setInterval(function() {
            var m = Math.floor(timeLeft / 60);
            var s = timeLeft % 60;
            m = m < 10 ? '0' + m : m;
            s = s < 10 ? '0' + s : s;
            if (timerDisplay) {
                timerDisplay.innerText = m + ':' + s;
                if (timeLeft <= 300) { // last 5 minutes
                    timerDisplay.style.color = 'red';
                    timerDisplay.style.animation = 'blink 1s infinite alternate';
                }
            }
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                window.autoSubmitting = true;
                alert('Time is up! Submitting exam automatically.');
                submitAnswers();
            } else {
                timeLeft--;
            }
        }, 1000);
    }
    window.addEventListener('load', startTimer);
</script>
<style>
@keyframes blink { from { opacity: 1; } to { opacity: 0.5; } }
</style>
`;

exams.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Inject timer HTML into header
    if (!content.includes('id="exam-timer"')) {
        content = content.replace('<header>', '<header>' + timerHTML);
    }
    
    // Inject timer Script before closing body
    if (!content.includes('startTimer()')) {
        content = content.replace('</body>', timerScript + '\n</body>');
    }
    
    fs.writeFileSync(file, content);
    console.log('Added timer to ' + path.basename(file));
});
