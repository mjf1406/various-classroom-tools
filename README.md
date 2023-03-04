# [Various Classroom Tools](https://mjf1406.github.io/various-classroom-tools/index.html)
A suite of tools related to randomly picking students in various ways from a single class. This is meant for the teacher only and is not intended to be shared with parents or students.

## Tools
### 1. Random Student Picker
- This tools randomly picks a student from the class and then marks them as picked to ensure students who have been picked will not be picked again until all other students have been picked.
### 2. Random Groups
- Attempts to ensure that students don't get grouped up too much within the same group size. E.G. if Mark and Sarah were partners when the group size was 2, they can still be in the same group when the group size is 3, but if the group size remains 2, the site will avoid grouping them again.
- Each student is assigned an icon, so if another student has that icon next to their name, it means they have been grouped with that student already within this 'instance'.
### 3. Shuffle Class List
- This tool randomly orders the students and it ensures that each student gets a chance to go first at least once before picking a completely random student to be first again. It also ensures that a student will not be last twice within the same 'instance'. 
- Students who have been first within this 'instance' have a blue F badge next to their name, while students who have been last within this 'instance' have a red L badge.

## Future
- Use Firebase to keep it online?
- Is browser-based with no login okay?

## To-do List
*(?) denotes an item I am considering.*
- UI
  - [x] Find a new color for the class list and tool backgrounds
  - [x] Info button that opens a modal with 
    - [x] links to the Github  
    - [x] a little about me
- Shuffle Class Tool
  - [x] Checkboxes to set First or Last for specific student
  - [ ] (?) Dropdown to set the place of a student
  - [x] Prevent the same student being selected as first and last
- Class Settings
  - [x] Ability to change the class name
  - [x] Ability to change the class icon
  - [ ] (?) Add an undo button
  - [ ] (?) Set class to defaults?
- Add Class
  - [x] Prevent duplicate names
  - [x] Prevent duplicate icons
- Theme Switcher
  - [ ] Light Theme
  - [ ] Dark Theme
