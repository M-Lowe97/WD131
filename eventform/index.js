const form = document.querySelector("#event-form");
const type = document.querySelector("#type");
const idInput = document.querySelector("#idInput");
const codeInput = document.querySelector("#codeInput");
const output = document.querySelector("#output")


function updateCodeField() {
    const value = type.value;

    if(type.value === "student") {
        idInput.hidden = false;
        idNumber.required = true;
        codeInput.hidden = true;
        eventCode.required = false;
    } else if(type.value === "guest") {
        idInput.hidden = true;
        idNumber.required = false;
        codeInput.hidden = false;
        eventCode.required = true;
    } else {
        idInput.hidden = true;
        idNumber.required = true;
        codeInput.hidden = true;
        eventCode.required = false;
    }
}

type.addEventListener("change", updateCodeField);
updateCodeField();

function isPastDate(value) {
  const today = new Date();
  const chosen = new Date(value);
  return chosen < today;
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    output.textContent = "";

    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
    const person = type.value
    const eventDate = form.eventDate.value;
    const idNumber = form.idNumber.value.trim();
    const eventCode = form.eventCode.value.trim();

    console.log(eventCode)

    if(person === "student" && idNumber.length !== 9) {
        output.textContent = "Student I# must be 9 digits."
        return;
    }

    if(person === "guest" && eventCode !== "EVENT131") {
        output.textContent = "Invalid Event Code."
        return;
    }

    if (isPastDate(eventDate)) {
        output.textContent = "Please choose a later date."
        return;
    }

    if (person === "student" && idNumber === 0) {
        output.textContent = "Error: I# not detected."
        return;
    }

    output.innerHTML = `
    <h2>Ticket Created</h2>
    <p></p>
    <p>${firstName} ${lastName}</p>
    <p></p>
    <p>${eventDate}</p>
    `;

    form.reset();
    updateCodeField;
});