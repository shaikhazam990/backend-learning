import React from 'react'
import axios from "axios"
import { useState } from 'react'

const App = () => {
  const [notes, setNotes] = useState([])

  axios.get("http://localhost:9000/notes/prt").then((res)=>{
    setNotes(res.data.notes)

  })
  return (
    <>
    <div className='notes'>
      {Map.notes(note=>{
        return <div className='note'>
        <h1>{note.title}</h1>
        <p>{note.description}</p>

        </div>
      })}

    </div>
    
    </>
  )
}

export default App