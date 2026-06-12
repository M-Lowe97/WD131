document.getElementById("rollButton").addEventListener("click", event => {

    const images = document.querySelectorAll("#gameboard img");



    images.forEach(image => {
        if(isDieUnlocked(image)) {
            image.src = "assets/die_rolling.gif";
        }
        
    })

    setTimeout(() =>{
        images.forEach(image =>{
            if(isDieUnlocked(image)) {
                image.src = "assets/white_dice_" + (Math.floor(Math.random() * 6 ) + 1) +".gif";
            }
            
        });
    }, 2000);


});

function isDieUnlocked(dieImage) {
    const checkBoxes = document.querySelectorAll("#gameboard input");

    const unchecked = Array.from(checkBoxes)
                            .filter(checkBox => !checkBox.checked);

    return unchecked.find(unchecked => unchecked.className === dieImage.className);
}