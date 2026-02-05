import React from 'react'
import axios from "axios"
import { useState } from 'react'
import { useEffect } from 'react'

const App = () => {
  const [notes, setNotes] = useState([])
  function fetchData(){
    axios.get("http://localhost:3100/demo/note")
    .then((res)=>{
      setNotes(res.data.notes)
    })
  }

  useEffect(()=>{
    fetchData()
  }, [])

    function handleSubmit(e){
      e.preventDefault()

      const title = e.target.elements.title.value
      const description = e.target.elements.description.value
      const image = e.target.elements.image.value

      console.log(title, description,image)
      e.target.reset()

      axios.post("http://localhost:3100/demo/note",{
        title:title,
        description:description,
        image:image
      })
      .then(()=>{
        // setNotes(res.data)
        fetchData()
      })
    }

    function handleDelete(noteId){
      console.log(noteId)
      axios.delete(`http://localhost:3100/demo/note/${noteId}`)
      .then(()=>{
        // setNotes(res.data)
        fetchData()
      })


    }




  return (
    <>
    <form className='create-form' onSubmit={handleSubmit}>
      <input name='title' type="text" placeholder='Enter title' />
      <input name='description' type="text" placeholder='Enter description' />
      <input name='image' type="text" placeholder='Enter image url' />
      <button>Create</button>
    </form>
    <div className='notes'>
      {notes.map((note)=>{
        return <div key={note.title} className='note'>
          <h1>{note.title}</h1>
          <p>{note.description}</p>
          <img src={note.image}alt="" />
          <button onClick={()=>{handleDelete(note._id)}} >Delete</button>
        </div>
      })}
    </div>

    </>
  )
}

export default App