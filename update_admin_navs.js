const fs = require('fs');
const path = require('path');

const files = [
    'Admin.ejs', 'AddUser.ejs', 'userdisplay.ejs', 'messagesdisplay.ejs', 'message_reply.ejs'
].map(f => path.join('c:/Users/lenovo/Downloads/online-test-managementsystem/Views', f));

const dropdownHTML = `
            <div class="profile-details" onclick="toggleAdminDropdown()" style="cursor: pointer; position: relative;">
                <img src="/IMAGES/user-icon.png" alt="Admin" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 10px;">
                <span class="admin_name" style="margin-right: 5px;">Admin</span>
                <i class='bx bx-chevron-down'></i>
                
                <div id="adminDropdown" class="admin-dropdown" style="display: none; position: absolute; top: 60px; right: 0; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 150px; z-index: 100;">
                    <ul style="list-style: none; padding: 5px 0; margin: 0;">
                        <li><a href="/logout" style="display: block; padding: 10px 20px; color: #e63946; text-decoration: none; font-size: 15px;"><i class='bx bx-log-out' style="vertical-align: middle; margin-right: 8px; font-size: 18px;"></i> Log Out</a></li>
                    </ul>
                </div>
            </div>
            <script>
                function toggleAdminDropdown() {
                    const dropdown = document.getElementById('adminDropdown');
                    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                }
                
                window.addEventListener('click', function(e) {
                    const profileDetails = document.querySelector('.profile-details');
                    const dropdown = document.getElementById('adminDropdown');
                    if (profileDetails && dropdown && !profileDetails.contains(e.target)) {
                        dropdown.style.display = 'none';
                    }
                });
            </script>`;

files.forEach(file => {
    if (!fs.existsSync(file)) {
        console.log(`File missing: ${file}`);
        return;
    }
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Regex to match the old profile-details div
    // We match from <div class="profile-details"> until its closing </div>
    const regex = /<div class="profile-details">[\s\S]*?<\/div>/;
    
    if (regex.test(content) && !content.includes('toggleAdminDropdown')) {
        content = content.replace(regex, dropdownHTML);
        fs.writeFileSync(file, content);
        console.log(`Updated ${path.basename(file)}`);
    } else {
        console.log(`Profile details already updated or not found in ${path.basename(file)}`);
    }
});
