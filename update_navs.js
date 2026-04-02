const fs = require('fs');
const path = require('path');

const files = [
    'gate_home.html', 'Jee_home.html', 'Neet_resources.html', 'UserDetails.html',
    'scroll.html', 'NeetHome.html', 'Jee_resources.html', 'GATE.html', 'faq.html', 'aboutus.html'
].map(f => path.join('c:/Users/lenovo/Downloads/online-test-managementsystem/public/HTML', f));

const dropdownHTML = `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="padding: 0; background: none;">
                <img src="/IMAGES/user-icon.png" alt="Profile" width="38px" style="border-radius: 50%;">
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown" style="background-color: white; min-width: 180px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-top: -5px; padding: 5px 0;">
                <li><a class="dropdown-item" href="/dir_profile" style="color: #333; line-height: normal; font-size: 15px; text-transform: none; padding: 10px 20px;"><i class="fa fa-user" style="margin-right: 10px; font-size: 18px; width: 20px; text-align: center;"></i> My Information</a></li>
                <li><hr class="dropdown-divider" style="margin: 0;"></li>
                <li><a class="dropdown-item" href="/logout" style="color: #e63946; line-height: normal; font-size: 15px; text-transform: none; padding: 10px 20px;"><i class='bx bx-log-out' style="margin-right: 10px; font-size: 20px; vertical-align: middle; width: 20px; text-align: center;"></i> Log Out</a></li>
            </ul>
        </li>`;

const bootstrapJs = `\n<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>\n`;
const bootstrapCss = `\n<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">\n`;

files.forEach(file => {
    if (!fs.existsSync(file)) {
        console.log(`File missing: ${file}`);
        return;
    }
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Match the classic <li> with user-icon.
    const userImgRegex = /<li>\s*<a href="\/dir_profile">\s*<img src="[^"]*user-icon\.png"[^>]*>\s*<\/a>\s*<\/li>/g;
    const logoutRegex = /\s*<li>\s*<a href="\/?(logout)?">\s*<i class='bx bx-log-out'[^>]*><\/i>\s*<span [^>]*>Log out<\/span>\s*<\/a>\s*<\/li>/g;
    
    let modified = false;

    if (userImgRegex.test(content)) {
        content = content.replace(userImgRegex, dropdownHTML);
        modified = true;
    }
    
    if (logoutRegex.test(content)) {
        content = content.replace(logoutRegex, '');
        modified = true;
    }

    if (modified) {
        if (!content.includes('bootstrap.bundle.min.js')) {
            if (content.includes('</body>')) {
                content = content.replace('</body>', bootstrapJs + '</body>');
            } else {
                content = content.replace('</html>', bootstrapJs + '</html>');
            }
        }
        
        if (!content.includes('bootstrap.min.css')) {
            content = content.replace('</head>', bootstrapCss + '</head>');
        }
        
        fs.writeFileSync(file, content);
        console.log(`Successfully updated ${path.basename(file)}`);
    } else {
        console.log(`Profile icon already updated or not found in ${path.basename(file)}`);
    }
});
