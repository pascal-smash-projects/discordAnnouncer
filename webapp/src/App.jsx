import { useState } from 'react'
import './App.css'
import ServerSelector from './components/ServerSelector'
import { AnnouncerProvider } from './context/AnnouncerContext';
import Message from './components/Message';
import SubmitButton from './components/SubmitButton';
import SubmitFeedback from './components/SubmitFeedback';

function App() {

  return (
    <AnnouncerProvider>
      <div className='app-container'>
        <h1>Discord Announcer Bot</h1>
        <ServerSelector/>
        <Message />
        <SubmitButton />
        <SubmitFeedback />
      </div>
    </AnnouncerProvider>
  )
}

export default App