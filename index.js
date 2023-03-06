function setupPage() {
    // Listeners
    const buttonAddClass = document.getElementById('button-add-class')
    buttonAddClass.addEventListener('click', function() {
        const className = document.getElementById('input-class-name').value
        const classroom = document.getElementById('input-classroom').value
        const gradeLevel = document.getElementById('input-grade-level').value
        const students = document.getElementById('input-students').value
        
        addClass(className, classroom, gradeLevel, students)
        updateClassNav()
        setupClassButtonListeners()
        document.getElementById(`button-class-${className}`).classList.add('active') // Activate most recent class
        document.getElementById('display-class-name').innerHTML = `<h2>${className}</h2>`
        setupToolDisplay('random-student') // Populate the Tool UI
        setupSettingsModal(className)
    })

    const buttonRunTool = document.getElementById('button-run-tool')
    buttonRunTool.addEventListener('click', function () {
        let toolName = document.getElementById('tool-header').innerHTML
        if (toolName.includes('random-student')) return randomStudent()
        if (toolName.includes('shuffle-class')) return shuffleClassList()
    })

    const buttonResetFlags = document.getElementById('button-reset-flags')
    buttonResetFlags.addEventListener('click', function(){
        let toolName = (document.getElementById('tool-header').innerHTML).replaceAll('<h5>', '').replaceAll('</h5>', '')
        const className = (document.getElementById('display-class-name').innerHTML).replaceAll('<h2>', '').replaceAll('</h2>', '')
        let confirmed = confirm(`Are you sure you want to reset the flags for ${toolName} in ${className}?`)
        if (confirmed) {
            let classes = JSON.parse(localStorage.getItem('RST-classes'))
            let classData = classes.find(e => e.CLASS_NAME == className)
            let students = classData.STUDENTS
            if (toolName.includes('random-student')) students = resetFlags(students, 'RANDOM')
            if (toolName.includes('shuffle-class')) students = resetFlags(students, 'SHUFFLE')
            let classIndex = classes.map(e => e.CLASS_NAME).indexOf(className)
            classes[classIndex].STUDENTS = students
            localStorage.setItem('RST-classes', JSON.stringify(classes))
            setupToolDisplay(toolName)
        }
    })

    const buttonSaveClass = document.getElementById('button-save-class')
    buttonSaveClass.addEventListener('click', function(){ saveClass() })
    
    const buttonDeleteClass = document.getElementById('button-delete-class')
    buttonDeleteClass.addEventListener('click', function() { deleteClass() })

    const addStudentButton = document.getElementById('button-add-student')
    addStudentButton.addEventListener('click', function(){ addStudent() })

    const buttonCancelSettingsModal = document.getElementById('button-cancel-settings-modal')
    buttonCancelSettingsModal.addEventListener('click', function(){ setupSettingsModal(localStorage.getItem('RST-active-class')) })

    const buttonDeleteEverything = document.getElementById('button-delete-everything')
    buttonDeleteEverything.addEventListener('click', function() {
        const confirmed = confirm("Are you sure you want to delete EVERYTHING? This is irreversible!")
        if (confirmed) {
            localStorage.removeItem('RST-classes')
            localStorage.removeItem('RST-active-class')
            location.reload()
        }
    })

    // Class Navigation
    updateClassNav()

    setupClassButtonListeners()

    const buttonsSelectTool = document.getElementsByName('button-tool-select')
    const toolDisplay = document.getElementById('tool-display')
    toolDisplay.innerHTML = ''
    for (let index = 0; index < buttonsSelectTool.length; index++) {
        const element = buttonsSelectTool[index];
        element.addEventListener('click', function(){
            const toolName = (this.id).replace('button-tool-', '')
            for (let index = 0; index < buttonsSelectTool.length; index++) {
                const element = buttonsSelectTool[index];
                element.classList.remove('active')
            }
            this.classList.toggle('active')
            setupToolDisplay(toolName)

        })
    }
    const buttonRandomStudent = document.getElementById('button-tool-random-student')
    buttonRandomStudent.classList.add('active') // Activate Random Student
    const toolHeader = document.getElementById('tool-header')
    toolHeader.innerHTML = `<h5>random-student</h5>`
    // Set active
    const activeClass = localStorage.getItem('RST-active-class')
    if (activeClass) {
        document.getElementById(`button-class-${activeClass}`).classList.add('active') // Activate most recent class
        
        document.getElementById('display-class-name').innerHTML = `<h2>${activeClass}</h2>`
        setupToolDisplay('random-student') // Populate the Tool UI
        setupSettingsModal(activeClass)
    }
}
function addClass(className, classroom, gradeLevel, students){
    const modalDisplayAlert = document.getElementById('alert-display-modal-add-class')
    const addClassForm = document.getElementById('form-add-class')

    if (className == "" || students == "") return // Exit function because not all fields are filled out
    students = transformData(students) // Convert to JSON
    if (students.length == 0) {
        modalDisplayAlert.innerHTML = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <h4 class="alert-heading"><i class="fa-solid fa-triangle-exclamation"></i> &nbsp; Heads Up!</h4>
            <p>Please ensure you input student data like one of the below examples. If you're having trouble, you can copy and paste from a spreadsheet.</p>
            <p>FIRST,LAST,NICKNAME,BIRTHDAY</p>
            <hr>
            <p class="mb-0">John,Doe,J Money,2011/3/7</p>
            <hr>
            <p class="mb-0">John&nbsp;&nbsp;&nbsp;&nbsp;Doe&nbsp;&nbsp;&nbsp;&nbsp;Johnny&nbsp;&nbsp;&nbsp;&nbsp;Boy&nbsp;&nbsp;&nbsp;&nbsp;2011/3/7</p>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
      </div>`
      return
    }
    const classes = JSON.parse(localStorage.getItem('RST-classes')) // Parse the current Classes Database
    const icon = document.getElementById('input-icon').value

    const duplicates = alertDuplicateNameOrIcon(className, icon)
    if (duplicates) return displayAlert('danger', `<i class="fa-solid fa-triangle-exclamation"></i> &nbsp; <b>No clones allowed!</b> A class with the same ${duplicates} already exists.`, modalDisplayAlert)

    classes.push({ // Add the new class to the Database
        CLASS_NAME: className,
        CLASSROOM: classroom,
        GRADE_LEVEL: gradeLevel,
        STUDENTS: students,
        ICON: icon,
    })
    localStorage.setItem('RST-classes', JSON.stringify(classes)) // Push updated JSON to Local Storage
    $('#modal-add-class').modal('toggle') // Close the modal
    addClassForm.reset() // Clear the form
    displayAlert('success', '<i class="fa-solid fa-circle-check"></i> &nbsp; <strong>Success!</strong> Class added successfully!', null) // Display a SUCCESS alert to the user.
}
function setupLocalStorage(){
    if (localStorage.getItem('RST-classes')) return
    localStorage.setItem('RST-classes', '[]')
}
// ==========================
//         Settings
// ==========================
function setupSettingsModal(className){
    const classData = JSON.parse(localStorage.getItem('RST-classes')).find(e => e.CLASS_NAME == className)

    const settingsLabel = document.getElementById('settings-label')
    settingsLabel.innerText = `${className}`

    const inputClassName = document.getElementById('input-class-name-settings')
    inputClassName.value = className

    const selectIcon = document.getElementById('select-icon')
    selectIcon.value = classData.ICON

    const studentList = document.getElementById('student-list')
    studentList.innerHTML = ''
    
    const students = classData.STUDENTS
    for (let index = 0; index < students.length; index++) {
        const element = students[index];
        const li = document.createElement('li')
        li.classList.add('list-group-item')
        li.setAttribute('name', 'student-row')
        li.id = element.ID
        
        const idx = document.createElement('div')
        const textInputFirstName = document.createElement('input')
        const textInputLastName = document.createElement('input')
        const textInputNickName = document.createElement('input')
        const textInputBirthday = document.createElement('input')
        const div = document.createElement('div')
        const i = document.createElement('i')

        idx.innerText = `${index + 1}.)`

        textInputFirstName.classList.add('text-input-small')
        textInputLastName.classList.add('text-input-small')
        textInputNickName.classList.add('text-input-small')
        textInputBirthday.classList.add('text-input-small')

        textInputFirstName.type = 'text'
        textInputFirstName.id = `${element.ID}-first-name`
        textInputFirstName.value = element.FIRST_NAME

        textInputLastName.type = 'text'
        textInputLastName.id = `${element.ID}-last-name`
        textInputLastName.value = element.LAST_NAME

        textInputNickName.type = 'text'
        textInputNickName.id = `${element.ID}-nickname`
        textInputNickName.value = element.NICKNAME

        textInputBirthday.type = 'text'
        textInputBirthday.id = `${element.ID}-birthday`
        textInputBirthday.value = element.BIRTHDAY

        i.id = `${element.ID}-delete`
        i.classList.add('fa-solid')
        i.classList.add('fa-trash')
        i.addEventListener('click', function() { deleteStudent((this.id).replaceAll('-delete',''), className) })

        li.appendChild(idx)
        li.appendChild(textInputFirstName)
        li.appendChild(textInputLastName)
        li.appendChild(textInputNickName)
        li.appendChild(textInputBirthday)
        div.appendChild(i)
        li.appendChild(div)
        studentList.appendChild(li)
    }
}
function saveClass(className){
    const modalDisplayAlert = document.getElementById('alert-display-modal-settings')
    if (!className) className = (document.getElementById('display-class-name').innerHTML).replaceAll('<h2>', '').replaceAll('</h2>', '')
    const classes = JSON.parse(localStorage.getItem('RST-classes'))
    const classIndex = classes.map(e => e.CLASS_NAME).indexOf(className)
    const classData = classes[classIndex]
    const selectedIcon = document.getElementById('select-icon').value
    const inputClassName = document.getElementById('input-class-name-settings').value
    let students = []
    const studentRows = document.getElementsByName('student-row')
    for (let index = 0; index < studentRows.length; index++) {
        const element = studentRows[index];
        const children = element.childNodes
        const studentID = element.id

        const firstName = children[1].value
        const lastName = children[2].value
        const nickname = children[3].value
        const birthday = children[4].value
        let flags
        try { flags = classData.STUDENTS.find(e => e.ID == studentID).FLAGS }
        catch { 
            flags = {
                        RANDOM: 0, // Flags for Random Student
                        SHUFFLE: { // Flag for Shuffle Class List
                            FIRST: 0,
                            LAST: 0
                        }, 
                        GROUPS: { // Flags for Random Groups
                            TWO: 0,
                            THREE: 0,
                            FOUR: 0,
                            FIVE: 0,
                            SIX: 0,
                            SEVEN: 0,
                            EIGHT: 0,
                            NINE: 0,
                            TEN: 0
                        }
                    }
            }
        students.push({
            FIRST_NAME: firstName,
            LAST_NAME: lastName,
            NICKNAME: nickname,
            BIRTHDAY: birthday,
            ID: studentID,
            FLAGS: flags
        })
        
    }
    let duplicateNameCheck
    if (className == inputClassName) duplicateNameCheck = null
    else duplicateNameCheck = inputClassName

    let duplicateIconCheck
    if (selectedIcon == classData.ICON) duplicateIconCheck = null
    else duplicateIconCheck = selectedIcon

    const duplicates = alertDuplicateNameOrIcon(duplicateNameCheck, duplicateIconCheck)
    if (duplicates) return displayAlert('danger', `<i class="fa-solid fa-triangle-exclamation"></i> &nbsp; <b>No clones allowed!</b> A class with the same ${duplicates} already exists.`, modalDisplayAlert)

    document.getElementById('display-class-name').innerHTML = `<h2>${inputClassName}</h2>` // Set the class name header
    localStorage.setItem('RST-active-class', inputClassName)
    classes[classIndex].CLASS_NAME = inputClassName // Save the new class name
    classes[classIndex].ICON = selectedIcon // Save the icon
    classes[classIndex].STUDENTS = students // Save the students
    localStorage.setItem('RST-classes', JSON.stringify(classes))
    $('#modal-settings').modal('toggle')
    const toolName = (document.getElementById('tool-header').innerHTML).replaceAll('<h2>','').replaceAll('</h2>','')
    setupToolDisplay(toolName)
    updateClassNav()
    setupClassButtonListeners()
    displayAlert('success', '<i class="fa-solid fa-circle-check"></i> &nbsp; <strong>What a change!</strong> Class successfully modified.', null)
    document.getElementById(`button-class-${inputClassName}`).classList.add('active') // Set this class as active in the class nav
}
function deleteStudent(studentID, className){
    const classes = JSON.parse(localStorage.getItem('RST-classes'))
    const classIndex = classes.map(e => e.CLASS_NAME).indexOf(className)
    const classData = classes.find(e => e.CLASS_NAME == className)
    const studentIndex = classData.STUDENTS.map(e => e.ID).indexOf(studentID)
    classData.STUDENTS.splice(studentIndex, 1) // Remove the student from the class
    classes[classIndex] = classData
    localStorage.setItem('RST-classes', JSON.stringify(classes))
    setupSettingsModal(className)
    const toolName = (document.getElementById('tool-header').innerHTML).replaceAll('<h2>','').replaceAll('</h2>','')
    setupToolDisplay(toolName)
}
function deleteClass(className){
    className = document.getElementById('settings-label').innerText
    const classes = JSON.parse(localStorage.getItem('RST-classes'))
    const classData = classes.find(e => e.CLASS_NAME == className)
    const classIndex = classes.map(e => e.CLASS_NAME).indexOf(className)
    let confirmed = confirm(`Are you sure you want to delete ${className}`)
    if (!confirmed) return
    if (confirmed) {
        classes.splice(classIndex, 1)
        $('#modal-settings').modal('toggle')
        localStorage.setItem('RST-classes', JSON.stringify(classes))
        updateClassNav()
        setupClassButtonListeners()
        document.getElementById('tool-display').innerHTML = ``
        displayAlert('success', '<i class="fa-solid fa-circle-check"></i> &nbsp; <strong>Clean up time!</strong> Class successfully deleted.')
    }
    
}
function setupClassButtonListeners(){
    const buttonsSelectClass = document.getElementsByName('button-select-class')
    const classNameHeader = document.getElementById('display-class-name')
    for (let index = 0; index < buttonsSelectClass.length; index++) {
        const element = buttonsSelectClass[index];
        element.addEventListener('click', function(){
            const className = (this.id).replace('button-class-', '')
            for (let index = 0; index < buttonsSelectClass.length; index++) {
                const element = buttonsSelectClass[index];
                element.classList.remove('active')
            }
            this.classList.toggle('active')
            classNameHeader.innerHTML = `<h2>${className}</h2>`

            const toolName = (document.getElementById('tool-header').innerHTML).replaceAll('<h5>','').replaceAll('</h5>','')
            setupToolDisplay(toolName)
            setupSettingsModal(className)
            localStorage.setItem('RST-active-class', className)
        })
    }
}
function addStudent(){
    const studentList = document.getElementById('student-list')
    const className = (document.getElementById('display-class-name').innerHTML).replaceAll('<h2>', '').replaceAll('</h2>', '')
    const ID = generateUniqueID()
    const li = document.createElement('li')
    li.classList.add('list-group-item')
    li.setAttribute('name', 'student-row')
    li.id = ID
    
    const idx = document.createElement('div')
    const textInputFirstName = document.createElement('input')
    const textInputLastName = document.createElement('input')
    const textInputNickName = document.createElement('input')
    const textInputBirthday = document.createElement('input')
    const div = document.createElement('div')
    const i = document.createElement('i')

    const studentCount = [...studentList.childNodes].length
    idx.innerText = `${studentCount + 1}.)`

    textInputFirstName.classList.add('text-input-small')
    textInputLastName.classList.add('text-input-small')
    textInputNickName.classList.add('text-input-small')
    textInputBirthday.classList.add('text-input-small')

    textInputFirstName.type = 'text'
    textInputFirstName.id = `${ID}-first-name`

    textInputLastName.type = 'text'
    textInputLastName.id = `${ID}-last-name`

    textInputNickName.type = 'text'
    textInputNickName.id = `${ID}-nickname`

    textInputBirthday.type = 'text'
    textInputBirthday.id = `${ID}-birthday`

    i.id = `${ID}-delete`
    i.classList.add('fa-solid')
    i.classList.add('fa-trash')
    i.addEventListener('click', function() { deleteStudent((this.id).replaceAll('-delete',''), className) })

    li.appendChild(idx)
    li.appendChild(textInputFirstName)
    li.appendChild(textInputLastName)
    li.appendChild(textInputNickName)
    li.appendChild(textInputBirthday)
    div.appendChild(i)
    li.appendChild(div)
    studentList.appendChild(li)
}
// ==========================
//         Tools
// ==========================
function randomStudent(){
    let className = document.getElementById('display-class-name').innerHTML
    className = className.replace("<h2>", "").replace("</h2>", "")
    let classData = JSON.parse(localStorage.getItem('RST-classes')).find(e => e.CLASS_NAME == className)
    let students = classData.STUDENTS.filter(e => e.FLAGS.RANDOM == 0)
    if (students.length == 0) students = resetFlags(classData.STUDENTS, 'RANDOM') // Reset the flags to 0 if all students have been selected already
    let selectedStudent = randomProperty(students) // Get a random student 

    classData = setFlag(classData, selectedStudent, 'RANDOM') // Set the selected student's FLAG to 1

    let classes = JSON.parse(localStorage.getItem('RST-classes'))
    const classIndex = classes.map(e => e.CLASS_NAME).indexOf(classData.CLASS_NAME)
    classes[classIndex] = classData
    localStorage.setItem('RST-classes', JSON.stringify(classes))

    setupToolDisplay('random-student')
}
function shuffleClassList(){
    let className = document.getElementById('display-class-name').innerHTML
    className = className.replace("<h2>", "").replace("</h2>", "")
    let classData = JSON.parse(localStorage.getItem('RST-classes')).find(e => e.CLASS_NAME == className)
    let students = classData.STUDENTS
    let firstStudentId
    try { firstStudentId = Array.from(document.getElementsByName('position-first-label')).find(e => e.classList.contains('active')).id.replaceAll('-first-label','') }
    catch {}
    let lastStudentId
    try { lastStudentId = Array.from(document.getElementsByName('position-last-label')).find(e => e.classList.contains('active')).id.replaceAll('-last-label','') }
    catch {}
    if (firstStudentId && lastStudentId && firstStudentId == lastStudentId) return displayAlert('danger', `<i class="fa-solid fa-triangle-exclamation"></i> &nbsp; <b>Ut oh!</b> The first student cannot also be the last student! Please try again.`)
    if (
            students.length == students.filter(e => e.FLAGS.SHUFFLE.FIRST > 0).length || 
            students.length == students.filter(e => e.FLAGS.SHUFFLE.LAST > 0).length ||
            students.filter(e => e.FLAGS.SHUFFLE.FIRST == 0).length == 1 && students.filter(e => e.FLAGS.SHUFFLE.LAST == 0).length == 1 ||
            lastStudentId && students.length - 1 == students.filter(e => e.FLAGS.SHUFFLE.FIRST > 0).length ||
            firstStudentId && students.length - 1 == students.filter(e => e.FLAGS.SHUFFLE.LAST > 0).length
        ) students = resetFlags(students, 'SHUFFLE', [firstStudentId, lastStudentId])
    students = shuffle(students, firstStudentId, lastStudentId) // Shuffle the student list
    students[0].FLAGS.SHUFFLE.FIRST += 1
    students[students.length-1].FLAGS.SHUFFLE.LAST += 1
    classData.STUDENTS = students

    let classes = JSON.parse(localStorage.getItem('RST-classes'))
    const classIndex = classes.map(e => e.CLASS_NAME).indexOf(classData.CLASS_NAME)
    classes[classIndex] = classData
    localStorage.setItem('RST-classes', JSON.stringify(classes))

    setupToolDisplay('shuffle-class', firstStudentId, lastStudentId)
}
function randomGroups(classData, groupCount) {

}
// ==========================
//         Utilities
// ==========================
const transformData = (data) => {
    function parseStudents(data, parser, finalData) {
        for (let index = 0; index < data.length; index++) { // Loop through each line of the students
            let element = data[index]; // Pull out this students data
            element = element.split(parser) // Parse this data using the given parser ("," or "\t")
            finalData.push({ // Push the students to the new array as JSON Object
                FIRST_NAME: element[0],
                LAST_NAME: element[1],
                NICKNAME: element[2],
                BIRTHDAY: element[3],
                ID: generateUniqueID(),
                FLAGS: {
                    RANDOM: 0, // Flags for Random Student
                    SHUFFLE: { // Flag for Shuffle Class List
                        FIRST: 0,
                        LAST: 0
                    }, 
                    GROUPS: { // Flags for Random Groups
                        TWO: 0,
                        THREE: 0,
                        FOUR: 0,
                        FIVE: 0,
                        SIX: 0,
                        SEVEN: 0,
                        EIGHT: 0,
                        NINE: 0,
                        TEN: 0
                    }
                }
            })
        }
    }
    let finalData = [] // Define the final array for the transformed data
    data = data.split("\n") // Split the string by each new line
    if (data[0].includes("\t")) parseStudents(data, "\t", finalData) // Loop through each line and map the data to the appropriate fields
    if (data[0].includes(",") || data[0].includes(", ")) parseStudents(data, ",", finalData) // Loop through each line and map the data to the appropriate fields
    return finalData
}
// Function to select a random element from an array
// Source: https://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
var randomProperty = function (obj) {
    var keys = Object.keys(obj);
    return obj[keys[(keys.length * Math.random()) << 0]];
};
// Function to sum a certain value from an array of objects
// Source: https://bobbyhadz.com/blog/javascript-get-sum-of-array-object-values
function calculateSum(array, property) {
    let sum = 0;
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        sum += element.FLAGS[property]
    }
    return sum
}
// Function to reset flags
function resetFlags(students, flagToReset, exclusionList) {
    for (let index = 0; index < students.length; index++) {
        const element = students[index];
        if (flagToReset == 'RANDOM') element.FLAGS[flagToReset] = 0
        else if (flagToReset == 'SHUFFLE') {
            if (exclusionList && exclusionList.includes(element.ID)) continue
            else {
                element.FLAGS.SHUFFLE.FIRST = 0
                element.FLAGS.SHUFFLE.LAST = 0
            }
            
        }
    }
    return students
}
function setFlag(classData, selectedStudent, flagToSet) {
    const studentID = selectedStudent.ID
    const indexOfStudent = classData.STUDENTS.map(e => e.ID).indexOf(studentID)
    classData.STUDENTS[indexOfStudent].FLAGS[flagToSet] = 1
    return classData
}
function updateClassNav(){
    const navClasses = document.getElementById('nav-classes')
    navClasses.innerHTML = ''
    const classData = JSON.parse(localStorage.getItem('RST-classes'))
    if (!classData) return
    for (let index = 0; index < classData.length; index++) {
        const element = classData[index];   
        const button = document.createElement('button')
        button.type = 'button'
        button.classList.add('btn')
        button.classList.add('btn-secondary')
        button.classList.add('btn-class')
        button.name = 'button-select-class'
        button.id = `button-class-${element.CLASS_NAME}`
        button.innerHTML = `<i class="fa-solid fa-${element.ICON}"></i>`
        navClasses.appendChild(button)
    }
}
function setupToolDisplay(toolName, firstStudentId, lastStudentId) {
    const toolDisplay = document.getElementById('tool-display')
    toolDisplay.innerHTML = ''
    const toolHeader = document.getElementById('tool-header')
    toolHeader.innerHTML = ''
    toolHeader.innerHTML = `<h5>${toolName}</h5>`
    
    toolName = toolName.replace("<h5>", "").replace("</h5>", "")

    let className = document.getElementById('display-class-name').innerHTML
    className = className.replace("<h2>", "").replace("</h2>", "")

    let classData = JSON.parse(localStorage.getItem('RST-classes')).find(e => e.CLASS_NAME == className)
    
    if (className == "Select a Class...") return 
    // Random Student Tool
    if (toolName == 'random-student') {
        const ul = document.createElement('ul')
        ul.classList.add('list-group')
        for (let index = 0; index < classData.STUDENTS.length; index++) {
            const element = classData.STUDENTS[index];
            const li = document.createElement('li')
            li.classList.add('list-group-item')
            li.innerText = `${element.FIRST_NAME} ${element.LAST_NAME} (${element.NICKNAME})`
            li.style.display = 'flex'
            if (element.FLAGS.RANDOM == 1) li.classList.add('selected-student')
            ul.appendChild(li)
        }
        toolDisplay.appendChild(ul)
    } 
    // Shuffle Tool
    else if (toolName == 'shuffle-class') { 
        const ul = document.createElement('ul')
        ul.classList.add('list-group')
        for (let index = 0; index < classData.STUDENTS.length; index++) {
            const element = classData.STUDENTS[index];
            const li = document.createElement('li')
            li.classList.add('list-group-item')
            li.innerText = `${index + 1}.) ${element.FIRST_NAME} ${element.LAST_NAME} (${element.NICKNAME})`
            li.style.display = 'inline'

            const span = document.createElement('span')
            span.id = `${element.ID}-position`
            span.classList.add('first-last-buttons')
            // span.classList.add('form-check-inline')
            span.innerHTML = `
                        <input type="radio" class="btn-check" name="position-first-option" id="${element.ID}-first" autocomplete="off" style="display: none;">
                        <label class="btn btn-outline-secondary btn-sm" for="${element.ID}-first" id="${element.ID}-first-label" name="position-first-label">F</label>
                        
                        <input type="radio" class="btn-check" name="position-last-option" id="${element.ID}-last" autocomplete="off" style="display: none;">
                        <label class="btn btn-outline-secondary btn-sm" for="${element.ID}-last" id="${element.ID}-last-label" name="position-last-label">L</label>
            `
            li.appendChild(span)
            if (element.FLAGS.SHUFFLE.FIRST >= 1) li.innerHTML += `&nbsp; <span class="badge badge-primary badge-pill" name="shuffle-badge">F${element.FLAGS.SHUFFLE.FIRST}</span>`
            if (element.FLAGS.SHUFFLE.LAST >= 1) li.innerHTML += `&nbsp; <span class="badge badge-primary badge-pill last" name="shuffle-badge">L${element.FLAGS.SHUFFLE.LAST}</span>`
            ul.appendChild(li)
        }
        toolDisplay.appendChild(ul)

        const positionFirstOptions = document.getElementsByName('position-first-option')
        const positionFirstLabels = document.getElementsByName('position-first-label')
        for (let index = 0; index < positionFirstOptions.length; index++) {
            const element = positionFirstOptions[index];
            element.addEventListener('click',function() {
                const studentID = this.id.replaceAll('-first','')
                for (let index = 0; index < positionFirstLabels.length; index++) {
                    const element = positionFirstLabels[index];
                    const elementID = (element.id).replaceAll('-first-label','')
                    if (elementID == studentID) element.classList.toggle('active')
                    else element.classList.remove('active')
                    element.addEventListener('mousedown', function(event) { event.preventDefault() })
                }
            })
            element.addEventListener('mousedown', function(event) { event.preventDefault() })
        }
        const positionLastOptions = document.getElementsByName('position-last-option')
        const positionLastLabels = document.getElementsByName('position-last-label')
        for (let index = 0; index < positionLastOptions.length; index++) {
            const element = positionLastOptions[index];
            element.addEventListener('click',function() {
                const studentID = this.id.replaceAll('-last','')
                for (let index = 0; index < positionLastLabels.length; index++) {
                    const element = positionLastLabels[index];
                    const elementID = (element.id).replaceAll('-last-label','')
                    if (elementID == studentID) element.classList.toggle('active')
                    else element.classList.remove('active')
                    element.addEventListener('mousedown', function(event) { event.preventDefault() })
                }
            })
            element.addEventListener('mousedown', function(event) { event.preventDefault() })
        }
        // Ensure first and last persist
        try { document.getElementById(`${firstStudentId}-first-label`).classList.toggle('active')} catch {}
        try { document.getElementById(`${lastStudentId}-last-label`).classList.toggle('active') } catch {}
    } 
    // Random Groups Tool
    else if (toolName == 'random-groups') { 
        console.log(toolName)
    }
}
function displayAlert(alertType, innerHTML, element){
    let alertDisplay
    if (!element) alertDisplay = document.getElementById('alert-display')
    else alertDisplay = element

    alertDisplay.innerHTML = `
        <div class="alert alert-${alertType} alert-dismissible fade show" role="alert">
            ${innerHTML}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>` // Display a SUCCESS alert to the user.
}
// Function to generate a random ID
// Source: https://gist.github.com/gordonbrander/2230317
function generateUniqueID() {
    return Math.random().toString(36).substr(2, 9);
}
// Function to shuffle an array
// Source: https://javascript.info/task/shuffle
function shuffle(array, firstStudentId, lastStudentId) {
    // === First ===
    let first
    if (firstStudentId) {
        first = array.find(e => e.ID == firstStudentId)
    } else { 
        first = randomProperty(array)
        while (first.FLAGS.SHUFFLE.FIRST > 0) first = randomProperty(array)
        
    }
    const firstIndex = array.map(e => e.ID).indexOf(first.ID)
    array.splice(firstIndex, 1)

    // === Last ===
    let last 
    if (lastStudentId) {
        last = array.find(e => e.ID == lastStudentId)
    } else {
        last = randomProperty(array)
        while (last.FLAGS.SHUFFLE.LAST > 0) last = randomProperty(array)
    }
    const lastIndex = array.map(e => e.ID).indexOf(last.ID)
    array.splice(lastIndex, 1)
    // === Randomize === 
    // the rest of the class
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return [first, ...array, last]
}
// Function to check if the icon or class name is already in use
function alertDuplicateNameOrIcon(className, classIcon){
    let duplicates
    const classes = JSON.parse(localStorage.getItem('RST-classes'))
    const classNames = classes.map(e => e.CLASS_NAME)
    const classIcons = classes.map(e => e.ICON)
    if (classNames.includes(className) && classIcons.includes(classIcon)) duplicates = 'name and icon'
    else if (classNames.includes(className)) duplicates = 'name'
    else if (classIcons.includes(classIcon)) duplicates = 'icon'
    return duplicates
}
