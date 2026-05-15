let menuButton = document.getElementsByClassName("menu-btn")[0];

//event listener
menuButton.addEventListener("click", handleMenuButtonClick);

function handleMenuButtonClick(event) {
    console.log(event)
    // toggle on/off the menu display

    //grab nav
    let nav = document.querySelector("nav")
    //toggle hide class on/off
    nav.classList.toggle('hide')

    menuButton.classList.toggle('change');
}