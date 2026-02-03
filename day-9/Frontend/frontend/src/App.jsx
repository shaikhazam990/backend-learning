import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
const App = () => {
  const [notes, setNotes] = useState([]);

    function fetchData(){
    axios.get("http://localhost:3000/api/notes").then((res) => {
      setNotes(res.data.notes);
    });
    }

    function handleSubmit(e){
      e.preventDefault()

     const title = e.target.title.value;
     const description = e.target.description.value;

     console.log(title,description);

     axios.post("http://localhost:3000/api/notes",{
      title:title,
      description:description
     })
     .then(res => {
      console.log(res.data);
      fetchData()
      
     })

     
      
    }

    function handleDeleteNote(noteId){
      axios.delete(`http://localhost:3000/api/notes/${noteId}`)
      .then(res=>{
        console.log(res.data)
        fetchData()
      })
    }



  useEffect(() => {
    fetchData()
  }, []);

  return (
    <>
    <form className="note-create-form" onSubmit={handleSubmit} >
      <input name="title" type="text"  placeholder="Enter tilte"/>
      <input name="description" type="text" placeholder="Enter description" />
      <button>Submit</button>

    </form>
        <div className="notes">
      {notes.map((note) => {
        return (
          <div className="note">
            <h1>{note.title}</h1>
            <p>{note.description}</p>
            <button onClick={()=>{handleDeleteNote(note._id)}} >Delete</button>
          </div>
        );
      })}
    </div>
    </>
  );
};

export default App;
