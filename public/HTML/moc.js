function submitAnswers() {
    var subject = document.querySelector('h1').innerText.replace('MOCK TEST', '').trim();
    var answers = window.dynamicAnswers || [];
    var explanations = window.dynamicExplanations || [];
    var total = answers.length;
    var score = 0;

    if (total === 0) {
        alert("No questions configured for this exam.");
        return false;
    }

    // Validation
    for (var i = 1; i <= total; i++) {
        var userAns = document.forms['quizForm']['q' + i].value;
        if (!userAns && !window.autoSubmitting) {
            alert('You missed question ' + i);
            return false;
        }
    }

    // Check answers and build feedback
    var feedbackHTML = '';
    for (var i = 1; i <= total; i++) {
        var userAns = document.forms['quizForm']['q' + i].value;
        var correctAns = answers[i - 1];
        var explanation = explanations[i - 1];
        
        var status = (userAns == correctAns) ? 
            '<span style="color:#2ecc71; font-weight:bold;">✔ Correct</span>' : 
            '<span style="color:#e74c3c; font-weight:bold;">✘ Incorrect</span>';
            
        var correction = (userAns == correctAns) ? '' : 
            ' — Correct answer: <strong style="color:#2c3e50;">(' + correctAns.toUpperCase() + ')</strong>';

        feedbackHTML += '<div style="margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:15px;">' +
                        '<div style="display:flex; align-items:center;">' +
                        '<span style="display:inline-block; width:40px; font-weight:bold; color:#7f8c8d;">#' + i + '</span>' +
                        status + correction + '</div>' +
                        '<div style="margin-top:8px; padding:10px; background:#f9f9f9; border-left:4px solid #3498db; font-size:0.95em; color:#555;">' +
                        '<strong>Explanation:</strong> ' + explanation +
                        '</div></div>';
        
        if (userAns == correctAns) score++;
    }

    // Display results
    var results = document.getElementById('results');
    var scorePercentage = (score / total) * 100;
    var certificateBtn = '';
    
    if (scorePercentage >= 80) {
        certificateBtn = '<div style="margin-top:20px;">' +
                         '<button onclick="generateCertificate(\'' + subject + '\', ' + score + ', ' + total + ')" style="padding: 12px 25px; background-color: #f1c40f; color: #2c3e50; border: none; font-weight: bold; border-radius: 5px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><i class="fa fa-certificate"></i> Download Premium Certificate</button>' +
                         '</div>';
    }

    results.innerHTML = '<div style="background:white; padding:25px; border-radius:8px; box-shadow:0 4px 15px rgba(0,0,0,0.1); margin-bottom:30px; font-family: sans-serif;">' +
                        '<h2 style="margin-top:0; color:#2c3e50; border-bottom:2px solid #3498db; padding-bottom:10px;">Exam Results — ' + subject + '</h2>' +
                        '<p style="font-size:1.2em; font-weight:bold;">Score: <span style="color:#3498db;">' + score + '</span> / ' + total + ' (' + Math.round(scorePercentage) + '%)</p>' +
                        certificateBtn +
                        '<div style="margin-top:20px;">' +
                        feedbackHTML +
                        '</div>' +
                        '<div style="text-align: center; margin-top: 30px;">' +
                        '<a href="/home_1" style="display: inline-block; padding: 12px 25px; background-color: #3498db; color: white; text-decoration: none; font-weight: bold; border-radius: 5px; font-family: sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🏠 Back to Home</a>' +
                        '</div>' +
                        '</div>';

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Send score to server
    fetch('/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: score, total: total, exam_name: subject.trim() })
    })
    .catch(err => console.error('Error saving score:', err));

    return false;
}

function generateCertificate(subject, score, total) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape'
    });

    // Branded Certificate Design
    doc.rect(10, 10, 277, 190, 'S'); // Outer border
    doc.setLineWidth(1.5);
    doc.rect(15, 15, 267, 180, 'S'); // Inner border

    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(52, 152, 219); // Blue
    doc.text("Certificate of Achievement", 148.5, 60, null, null, "center");

    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80); // Dark grey
    doc.text("This is to certify that you have successfully completed the", 148.5, 90, null, null, "center");
    
    doc.setFontSize(25);
    doc.setFont("helvetica", "bolditalic");
    doc.text(subject + " Mock Examination", 148.5, 110, null, null, "center");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.text("with a remarkable score of", 148.5, 130, null, null, "center");

    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(46, 204, 113); // Green
    doc.text(score + " / " + total, 148.5, 150, null, null, "center");

    doc.setFontSize(15);
    doc.setTextColor(127, 140, 141); // Grey
    doc.text("Date: " + new Date().toLocaleDateString(), 148.5, 175, null, null, "center");

    doc.setFontSize(12);
    doc.text("Online Test Management System", 148.5, 185, null, null, "center");

    doc.save(subject + "_Certificate.pdf");
}