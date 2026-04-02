const fs = require('fs');
const path = require('path');

const files = [
    'Admin.ejs', 'AddUser.ejs', 'userdisplay.ejs', 'messagesdisplay.ejs', 'message_reply.ejs'
].map(f => path.join('c:/Users/lenovo/Downloads/online-test-managementsystem/Views', f));

const newLink = `            <li>
                <a href="/admin/questions">
                    <i class='bx bx-question-mark'></i>
                    <span class="links_name">Question Bank</span>
                </a>
            </li>\n`;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if link already exists
    if (!content.includes('/admin/questions')) {
        content = content.replace('<li class="log_out">', newLink + '            <li class="log_out">');
        fs.writeFileSync(file, content);
        console.log(`Updated ${path.basename(file)}`);
    } else {
        console.log(`Already updated ${path.basename(file)}`);
    }
});
