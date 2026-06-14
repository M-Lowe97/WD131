let characterLevel = document.getElementById("level");
let characterHp = document.getElementById("hp");

const character = {

    levelUp() {
        let currentLevel = parseInt(characterLevel.textContent);
        let currentHp = parseInt(characterHp.textContent);

        currentHp += 20;
        currentLevel += 1;

        characterHp.textContent = currentHp;
        characterLevel.textContent = currentLevel;

    },

    attacked() {
        let currentHp = parseInt(characterHp.textContent);

        currentHp -= 20;
        characterHp.textContent = currentHp;

        if (currentHp <= 0) {
            alert("Harold is dead.")
            characterHp.textContent = 0;
        };

    }
};

const buttons = document.querySelectorAll(".buttons");


buttons[0].addEventListener('click', () => {
    character.attacked();
})

buttons[1].addEventListener('click', () => {
    character.levelUp();
})