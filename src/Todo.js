import './Todo.css';
import React from 'react';
import { useState, useRef } from 'react';
function TodoElement(props) {
  let [checked, changeChecked] = useState(props.checkedStatus);
  let [isTodoElementExist, changeTodoStatus] = useState(true);
  function deleteTodo() {
    props.del(props.index);
    changeTodoStatus(false);
  }
  function changeCheckedTodo() {
    if(checked == '') {
      changeChecked('checked')
      props.changedChecked(prev => [...prev, props.index[1]])
    }
    else {
      changeChecked('');
      props.changedChecked(prev => prev.filter(item => item !== props.index[1]));
    }
  }
  if(isTodoElementExist == true) {
    return (
        <li onClick={changeCheckedTodo} className={checked}>{props.text} <span onClick={deleteTodo} className='close'>&#10007;</span></li>
    )
  }
  else return null;
}
function ToDo(props) {
    let text = useRef(null);
return (
    <div>
      <div id="myDIV" class="header">
        <input ref={text} type="text" id="myInput" placeholder="Write task here..."/>
        <span onClick={() => {props.AddTodoElement([...props.todoEls, <TodoElement checked={props.checked} checkedStatus='' text={text.current.value} index={[props.index, props.todoEls.length]} key={props.todoEls.length+1} del={props.del} changedChecked={props.changedChecked} />]);}} className="addBtn">Add</span>
      </div>
      <ul id="myUL">{props.todoEls}</ul>
    </div>
)}
export { ToDo, TodoElement }