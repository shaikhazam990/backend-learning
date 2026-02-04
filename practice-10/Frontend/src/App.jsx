import React, { useEffect } from "react";
import axios from "axios";
import { useState } from "react";

const App = () => {
  const [notes, setNotes] = useState([]);
  function fetchData() {
    axios.get("http://localhost:9000/notes/prt").then((res) => {
      setNotes(res.data.notes);
      console.log(res.data.notes);
    });
  }
  useEffect(() => {
    fetchData();
  }, []);

  function handleSubmit(e){
    e.preventDefault()

    const title = e.target.elements.title.value
    const description = e.target.elements.description.value
        console.log(title, description)
            e.target.reset()



    axios.post("http://localhost:9000/notes/prt", {
    title:title,
    description:description
    })

    .then((res)=>{
      fetchData()
      console.log(res.data)
    })
  }

  function handleDelete(noteId){

    axios.delete(`http://localhost:9000/notes/prt/${noteId}`)

    .then((res)=>{
      console.log(res.data)
      fetchData()
    })

  }

  return (
    <>

    <form className="create-form" onSubmit={handleSubmit}>
      <input name="title" type="text" placeholder="enter title " />
      <input name="description" type="text" placeholder="enter description"/>
      <button>Create Note</button>

    </form>
      <div className="notes">
        {notes.map((note) => {
          return (
            <div className="note" key={note._id}>
              <h1 >{note.title}</h1>
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
