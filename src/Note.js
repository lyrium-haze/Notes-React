import './Note.css';
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ToDo, TodoElement } from './Todo';

const closeNote = (props, e) => {
  if(e) {
    props.closeFunc("note_unactive");
  }
  else {
    return function()
    {
      props.closeFunc("note_unactive");
    }
  }
}

function SaveBtn(props) {
  function save() {
    if (props.note.innerText == "" && props.todoEls.length == 0 && props.title.innerText == "")
        return;
    let todoArr = [];
    if (props.todoEls.length > 0) {
      for(let i = 0; i < props.todoEls.length; i++) {
        todoArr[i] = props.todoEls[i].props.text;
      }
    }
    let subject = props.subject;
    if(subject == "")
      subject = "general";
    const request = indexedDB.open("Notes", 3);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const objStore = db.createObjectStore("notes", { autoIncrement: true });
      let note = {text: props.note.innerText, todoEls: todoArr, todoElsChecked: props.checked, title:props.title.innerText, subject: props.subject};
      objStore.add(note);
    }
    request.onsuccess = (event) => {
      const db = event.target.result;
      const objectStore = db.transaction("notes", "readwrite").objectStore("notes");
      const request = objectStore.get(props.index);
      request.onsuccess = ()=> {
        const db = event.target.result;
        let note = request.result;
        if (note == undefined) {
          note = {text: props.note.innerText, todoEls: todoArr,  todoElsChecked: props.checked, title:props.title.innerText, subject: subject};
          console.log(note);
          let a = db.transaction("notes", "readwrite").objectStore("notes").add(note);
          a.onsuccess = () => {
            props.showNotification("Your note has been saved successfully")
            console.log(a.result)
            props.setIndex(a.result);
          }
        }
        else {
          note = {text: props.note.innerText, todoEls: todoArr,  todoElsChecked: props.checked, title:props.title.innerText, subject: subject};
          const updateRequest = objectStore.put(note, props.index);
          updateRequest.onsuccess = () => {
            props.showNotification("Your note has been saved successfully")
          }
    }
}
request.onerror = () => {
  console.log(`error`);
}
}
  }
  return (
    <button onClick={save} className='btn'>Save</button>
  );
}

function DeleteBtn(props) {
  function deleteNote() {
    if (props.note.innerText != '' || props.todoEls.length > 0 || props.title.innerText != '') {
    const request = indexedDB.open("Notes", 3);
    request.onsuccess = (event) => {
    const db = event.target.result;
    let transaction = db.transaction(["notes"], "readwrite");
    transaction.objectStore("notes").delete(props.index);
    transaction.oncomplete = () => {
    props.showNotification("Your note has been deleted successfully")
    props.deleteFunc(false);
  }}
}
else {
  props.showNotification("Your note has been deleted successfully")
  props.deleteFunc(false);
}
  }
  return (
    <button onClick={deleteNote} className='btn'>Delete</button>
  );
}
function CloseBtn(props) {
  return (
    <button onClick={closeNote(props)} className='btn'>Close</button>
  );
}
export default function Note(props) {
  let note = useRef(null);
  let title = useRef(null);
  const [index, setIndex] = useState(props.index);
  const [checked, changedChecked] = useState([]);
  let [deleteTodo, DeleteTodoElement] = useState([]);
  let [todoEls, AddTodoElement] = useState([]);
  const [isTodoAdded, addTodo] = useState('Add');
  const [isNoteExist, changeNoteStatus] = useState(true);
  const [active, changeActive] = useState("note_unactive");
  const [titleClass, setTitleClass] = useState('title_hidden');
  useEffect(() => {
    let loadTodo = [];
    for(let i = 0; i < props.list.length; i++) {
      let checkedStatus = '';
      if(props.checked.includes(i))
        checkedStatus = 'checked';
      loadTodo.push(<TodoElement checkedStatus={checkedStatus} text={props.list[i]} del={DeleteTodoElement} index={[index, i]} checked={checked} changedChecked={changedChecked}/>);
    }
      AddTodoElement(loadTodo);
      if(loadTodo.length > 0)
        addTodo('Delete');
      if(props.title != undefined && props.title !='')
        setTitleClass('title');
      changedChecked(props.checked);
  }, [])
  useEffect(() => {
    if(deleteTodo.length > 0) {
    const request = indexedDB.open("Notes", 3);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const objectStore = db.transaction("notes", "readwrite").objectStore("notes");
      const request = objectStore.get(deleteTodo[0]);    
    request.onsuccess = ()=> {
      const db = event.target.result;
        let note = request.result;
        if (note == undefined) {
          props.showNotification("Error")
        }
        else {
          todoEls.splice(deleteTodo[1], 1);
          let updatedTodo = [];
          for (let i = 0; i < todoEls.length; i++) {
            updatedTodo.push(todoEls[i].props.text);
          }
          note = {text: note.text, todoEls: updatedTodo};
          const updateRequest = objectStore.put(note, deleteTodo[0]);
          updateRequest.onsuccess = () => {
            props.showNotification("Your task has been deleted successfully")
          }
        }
      }
    }
  }}, [deleteTodo])
  function makeActive(e) {
    if(e.currentTarget.classList.contains("note_active"))
        return;
    changeActive("note_active");
  }
  if (isNoteExist) {
    return (
      <div onClick={makeActive} className={'note_wrapper' + " " + active}>
        <h2 ref={title} className={titleClass} spellCheck="true" aria-multiline="true" role="textbox" contentEditable="true">{props.title}</h2>
        {isTodoAdded == 'Delete' ? <ToDo todoEls={todoEls} index={index} del={DeleteTodoElement} AddTodoElement={AddTodoElement} checked={checked} changedChecked={changedChecked} /> : null}
        <div className='note' ref={note} spellCheck="true" aria-multiline="true" role="textbox" contentEditable="true">{props.text ? props.text : null}</div>
        <div className='btns-panel'>
          {active =="note_active" ? <SaveBtn setIndex={setIndex} title={title.current} note={note.current} todoEls={todoEls} index={index} showNotification={props.showNotification} subject={props.subject} checked={checked} /> : null}
          {active =="note_active" ? <DeleteBtn index={index} todoEls={todoEls} title={title.current} note={note.current} func={changeActive} deleteFunc={changeNoteStatus} showNotification={props.showNotification} /> : null}
          {active =="note_active" ? <CloseBtn  closeFunc={changeActive} /> : null}
          {active =="note_active" ?  <button onClick={() => {if(isTodoAdded == 'Add') addTodo('Delete'); else {addTodo('Add'); AddTodoElement([]);}}} className='btn'>{isTodoAdded} To-Do list</button> : null}
          {active =="note_active" && titleClass == 'title_hidden' ? <button className='btn' onClick={() => {setTitleClass('title')}}>Add Title</button> : null}
        </div>
      </div>);}
    else return null;
  }