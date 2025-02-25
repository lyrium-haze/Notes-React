import React from "react";
import { useState, useEffect, useRef } from "react";
export default function Subjects(props) {
  const [subjects, setSubjects] = useState([]);
  useEffect(() => {
    if (localStorage.getItem("subjects") != null) {
      const loadedSubjects = JSON.parse(localStorage.getItem("subjects"));
      if (loadedSubjects.values.length > 0) {
        let parsedSubjects = [];
        loadedSubjects.values.forEach((el) => {
          parsedSubjects.push(
            <option key={Date.now()} value={el}>
              {el}
            </option>
          );
          setSubjects(parsedSubjects);
        });
      }
    }
  }, []);
  return (
    <div className="sbj-panel">
      <select
        value={props.selectedValue}
        onChange={(e) => props.setSelectedValue(e.target.value)}
        id="subject"
      >
        <option value="general">General</option>
        {subjects}
      </select>
      <SubjectsAdder
        subjects={subjects}
        setSubjects={setSubjects}
        selectedValue={props.selectedValue}
        showNotification={props.showNotification}
      />
    </div>
  );
}

function SubjectsAdder(props) {
  const [sbjFormClass, setSbjFormClass] = useState("subject-form_hidden");
  let title = useRef("");
  function addSubject(e) {
    e.preventDefault();
    let values = props.subjects.map((item) => item.props.value);
    if (
      !values.includes(title.current.value) &&
      title.current.value != "General"
    ) {
      props.setSubjects([
        ...props.subjects,
        <option key={Date.now()} value={title.current.value}>
          {title.current.value}
        </option>,
      ]);
      values.push(title.current.value);
      localStorage.setItem("subjects", JSON.stringify({ values }));
      props.showNotification("Subject has been saved successfully");
    } else console.log("Error");
  }
  function deleteSubject() {
    if (props.selectedValue == "general" || props.selectedValue == "") return;
    if (
      window.confirm(
        "Are you sure you want to delete this subject? This action will delete all notes in this subject as well!"
      )
    ) {
      let updatedSubjects = [];
      updatedSubjects = props.subjects.filter((subject) => {
        return subject.props.value != props.selectedValue;
      });
      props.setSubjects(updatedSubjects);
      updatedSubjects = updatedSubjects.map((item) => item.props.value);
      localStorage.setItem(
        "subjects",
        JSON.stringify({ values: updatedSubjects })
      );
      props.showNotification("Subject has been deleted successfully");
    }
  }
  return (
    <div className="subjects-adder">
      <button
        onClick={() =>
          sbjFormClass == "subject-form_hidden"
            ? setSbjFormClass("")
            : setSbjFormClass("subject-form_hidden")
        }
        id="add_subject"
        className="action_btn"
      >
        Add subject
      </button>
      <button
        onClick={deleteSubject}
        id="delete_subject"
        className="action_btn"
      >
        Delete subject
      </button>
      <form
        onSubmit={(e) => addSubject(e)}
        name="subject"
        className={sbjFormClass}
        id="subject-form"
        action=""
      >
        <input
          name="title"
          ref={title}
          placeholder="Subject name"
          type="text"
        />
        <button id="subject-form__btn" type="submit">
          {" "}
          Confirm
        </button>
      </form>
    </div>
  );
}
