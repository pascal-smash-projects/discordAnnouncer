import { useState } from 'react'
import './App.css'
import ServerSelector from './components/ServerSelector'
import { AnnouncerProvider } from './context/AnnouncerContext';
import Message from './components/Message';
import SubmitButton from './components/SubmitButton';

function App() {
  const [selections, setSelections] = useState({});

  return (
    <AnnouncerProvider>
      <div className='app-container'>
        <h1>Discord Announcer Bot</h1>
        <ServerSelector
          selections={selections}
          onSelectionsChange={setSelections}
        />
        <Message />
        <SubmitButton />
      </div>
    </AnnouncerProvider>
  )
}

export default App