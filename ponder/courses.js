

const aCourse = {
    name: 'Dynamic Web Fundamentals',
    code: "WDD131",
    sections: [
        { sectionNum: 1, roomNum: "STC 353", enrolled: 26, days: "TTh", instructor: "Bro T"},
        { sectionNum: 2, roomNum: "STC 347", enrolled: 28, days: "TTh", instructor: "Sis A"}
        ],
    
    enrollStudent: function(sectionNum) {
        
        this.sections.forEach(function(section) {
            if(section.sectionNum == sectionNum){
                section.enrolled++;
                return;
            }
        });
    }

    //alternative this.section.find(section => section.sectionNum == sectionNum).enrolled++;
}

    function sectionTemplate(section) {
        return `<tr>
        <td>${section.sectionNum}</td>
        <td>${section.roomNum}</td>
        <td>${section.enrolled}</td>
        <td>${section.days}</td>
        <td>${section.instructor}</td></tr>`
}

function renderSections(sections) {
const html = sections.map(sectionTemplate);
document.querySelector("#sections").innerHTML = html.join("");
}

renderSections(aCourse.sections);

document.querySelector("#enrollStudent").addEventListener("click", function () {
    const sectionNum = document.querySelector("#sectionNumber").value;
    aCourse.enrollStudent(sectionNum);
    renderSections(aCourse.sections);
});
