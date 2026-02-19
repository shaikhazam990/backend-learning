import React from 'react'
import '../style/form.scss'
import { Link } from 'react-router'
import Register from './register'
const Login = () => {
  return (
    <main>
        <div className="form-container">
            <h1>Login-Form</h1>
            <form>
                <input 
                    type="text"
                    name='username' 
                    placeholder='Enter username' />
                <input 
                    type="text" 
                    name='password' 
                    placeholder='Enter Password' />
                <button>Submit</button>
            </form>
            <p>Don't have an account? <Link className='toggleAuthForm' to="/register">Register</Link></p>
        </div>
    </main>
  )
}

export default Login