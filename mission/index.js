let selectElem = document.querySelector('select');
let logo = document.querySelector('img');

selectElem.addEventListener('change', changeTheme);

function changeTheme() {
    let current = selectElem.value;
    // We target the :root by using document.documentElement
    let root = document.documentElement;

    if (current === 'dark') {
        // Switch variables to Dark Mode colors
        root.style.setProperty('--primary-text', '#ffffff');
        root.style.setProperty('--byui-blue', '#0076bd'); 
        document.body.style.backgroundColor = '#121212';
        
        
        logo.setAttribute('src', 'byui-logo-white.png');
    } else {
        // Switch variables back to Light Mode (Black and Blue)
        root.style.setProperty('--primary-text', '#000000');
        root.style.setProperty('--byui-blue', '#003366');
        document.body.style.backgroundColor = '#ffffff';
        
        logo.setAttribute('src', 'byui-logo-blue.webp' );
    }
}