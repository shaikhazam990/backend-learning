import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
const App = () => {
  const [notes, setNotes] = useState([]);
  console.log("hello");
  function fetchData() {
    axios.get("http://localhost:3000/prac/notes").then((res) => {
      setNotes(res.data.notes);
    });
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleSubmit(e){
    e.preventDefault()
  
    const title = e.target.elements.title.value
    const description = e.target.elements.description.value


    console.log(title,description)
    e.target.reset()

    axios.post("http://localhost:3000/prac/notes" , {
      title:title,
      description:description
    })
    .then((res)=>{
      console.log(res.data)
      fetchData()

    })





  }

  function handleDelete(noteId){

    axios.delete(`http://localhost:3000/prac/notes/${noteId}`)
    .then((res)=>{
      console.log(res.data)
      fetchData()
    })

  }


  return (
    <>
    <form className="create-form" onSubmit={handleSubmit} >
      <input name="title" type="text" placeholder="Enter title" />
      <input name="description" type="text" placeholder="Enter description" />
      <button>Create Note</button>
    </form>
      <div className="notes">
        {notes.map((note) => {
          return (
            <div key={note.title} className="note">
              <h1>{note.title}</h1>
              <p>{note.description}</p>
              <button onClick={()=>{handleDelete(note._id)}} >Delete</button>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default App;
