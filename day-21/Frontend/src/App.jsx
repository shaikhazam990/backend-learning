import React from 'react'
import { RouterProvider } from 'react-router'
import {router} from './app.routes'
import { AuthProvider } from './features/auth/auth.context'
import './features/shared/globle.scss'
import { PostContextProvider } from './features/post/post.context'


const App = () => {
  return (
    <AuthProvider>
      <PostContextProvider>
        <RouterProvider router={router}/>
      </PostContextProvider>
    </AuthProvider>

  )
}

export default App