import './App.css';
import './variables.css';
import { useState, useEffect } from 'react';
import Note from './Note';
import Subjects from './Subjects';

function Welcome () {
  return (
  <h2 id="welcome"> Hi! Click on the '+' button to add your first note :)</h2>
  );
}
function Theme(props) {
 function changeTheme() {
  if (props.theme == "") {
    props.themeFunc("dark-theme");
    localStorage.setItem('theme', "dark-theme");
   }
   else {
    props.themeFunc("");
    localStorage.setItem('theme', "");
   }
  }
  return (
  <label className="switch tooltip" data-tooltip="Switch theme">
    <input onChange={changeTheme} className="cb" type="checkbox"/>
    <span className="slider round"></span>
    </label>
  );
}
function Con(props) {
  if (props.length < 1)
    return <Welcome/>
  else return <div></div>;
}

function makeData(key, value) {
  return {key, value};
}
let loadHeandler = function() { 
  return new Promise((resolve, reject) => {
  let data = [];
  const open = indexedDB.open("Notes", 3);
  open.onerror = () => {
    console.log("Error opening");
    resolve ("");
  };
  open.onupgradeneeded = (event) => {
    const db = event.target.result;
    const objStore = db.createObjectStore("notes", { autoIncrement: true });
    // let note = {text: props.note.innerText, todoEls: todoArr, todoElsChecked: props.checked, title:props.title.innerText, subject: props.subject};
    // objStore.add(note);
  }
  open.onsuccess = (event) => {
  const db = event.target.result;
  const transaction = db.transaction(["notes"]);
  const object_store = transaction.objectStore("notes");
  const result = object_store.getAll()
  result.onsuccess = () => {
  if (result.result.length == 0) {
    resolve([]);
    return;
  }
  const request = object_store.openCursor();

  request.onerror = function() {
  console.err("error fetching data");
  };
  request.onsuccess = function(event) {
  let cursor = event.target.result;
  if (cursor) {
      let key = cursor.primaryKey;
      let value = cursor.value;
      data.push(makeData(key, value));
      cursor.continue();
  }
  else {
    resolve (data);
  }
    };
    request.onerror = () => {
      console.log("Error opening");
      resolve ("");
    };
  }
}
  });
}
  
 function App() {
  let [savedNotes, getNote] = useState([]);
  const [notes, addNote] = useState([]);
  let [allNotes, setAllNotes] = useState([]);
  let relevantNotes = [];
  const [selectedValue, setSelectedValue] = useState('');
  let length = notes.length;
  useEffect(() => {
    loadHeandler('general').then(a => {
      if(a.length > 0) {
        setAllNotes(a);
        relevantNotes = a.filter(note => note.value.subject == 'general');
        getNote(relevantNotes);
      }
      }
    );
  }, [])
  useEffect(() => {
    if (savedNotes.length > 0 || selectedValue != '') {
      const oldNotes = savedNotes.reverse().map((note) => (<Note list={note.value.todoEls} checked={note.value.todoElsChecked} key={note.key} text={note.value.text} title={note.value.title} index={note.key} subject={selectedValue} showNotification={showNotification} />
      ));
      addNote(oldNotes);
    }
  }, [savedNotes]);
  useEffect(() => {
    if (selectedValue != '') {
      relevantNotes = allNotes.filter(note => note.value.subject == selectedValue);
      getNote(relevantNotes);
    }

  }, [selectedValue])
  const [message, setMessage] = useState(""); 
  const [isVisible, setIsVisible] = useState(false); 
  const showNotification = (text) => {
    setMessage(text);
    setIsVisible(true);
    setTimeout(() => {setIsVisible(false)}, 3000); 
  };
  const [theme, setTheme] = useState(""); 
  useEffect(() => {
  if (localStorage.getItem('theme'))
    setTheme(localStorage.getItem('theme'));
}, [])
  return (
    <div className={"App" + " " + theme}>
      <header className="App-header ctrl-panel">
      <button className='add btn' onClick={() => {addNote([<Note list={[]} checked={[]} key={Date.now()} index={-1} showNotification={showNotification} title='' subject={selectedValue} />, ...notes])}}
      ><span className="plus">+</span></button>
      <Subjects selectedValue={selectedValue} setSelectedValue={setSelectedValue} showNotification={showNotification} />
      <Theme theme={theme} themeFunc={setTheme} />
      </header>
      <div className='notes'>{notes}
      </div>
      <Con length={length}/>
      <div className="sheet"></div>
      {isVisible ? <div className="notification">{message}</div> : null}
      <div className='bg'></div>
    </div>
  );
}

export default App;
