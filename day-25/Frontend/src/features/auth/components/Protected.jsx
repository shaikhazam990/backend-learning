import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Navigate, useNavigate } from 'react-router'

const Protected = ({children}) => {

    const {user, loading} = useAuth()
    const navigate = useNavigate()

    if(!user && !loading){
       return <Navigate to={'/login'}/>
    }
    if(loading){
        return <h1>Loading...</h1>
    }
    return children

}

export default Protected