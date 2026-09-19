import { useState } from 'react'
import './App.css'
import ServerSelector from './components/ServerSelector'
import { AnnouncerProvider } from './context/AnnouncerContext';
import Message from './components/Message';
import SubmitButton from './components/SubmitButton';
import SubmitFeedback from './components/SubmitFeedback';
import User from './components/User';
import Login from './components/login';

function App() {

  return (
    <Login>
      <AnnouncerProvider>
        <div className='app-container'>
          <h1>Discord Announcer Bot</h1>
          <ServerSelector/>
          <Message />
          <User />
          <SubmitButton />
          <SubmitFeedback />
        </div>
      </AnnouncerProvider>
    </Login>
  )
}

export default App