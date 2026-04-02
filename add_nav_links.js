const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'Views/home_1.ejs',
    'Views/Contactus.ejs',
    'Views/UserProfile.ejs',
    'public/HTML/gate_home.html',
    'public/HTML/Jee_home.html',
    'public/HTML/Neet_resources.html',
    'public/HTML/UserDetails.html',
    'public/HTML/scroll.html',
    'public/HTML/NeetHome.html',
    'public/HTML/Jee_resources.html',
    'public/HTML/GATE.html',
    'public/HTML/faq.html',
    'public/HTML/aboutus.html'
].map(f => path.join('c:/Users/lenovo/Downloads/online-test-managementsystem', f));

const injectionString = `
            <li><a href="/my-progress" class="nav_item">My Progress</a></li>
            <li><a href="/leaderboard" class="nav_item">Leaderboard</a></li>
            <li class="nav-item dropdown">`;

filesToUpdate.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Only inject if the dropdown exists and the new links aren't there yet
    if (content.includes('<li class="nav-item dropdown">') && !content.includes('/my-progress')) {
        content = content.replace('<li class="nav-item dropdown">', injectionString);
        fs.writeFileSync(file, content);
        console.log('Updated ' + path.basename(file));
    } else {
        console.log('Skipped ' + path.basename(file));
    }
});
