// File: src/App.jsx
import { useState } from 'react';
import LandingPage from './components/Landing/LandingPage.jsx';
import ChatWindow from './components/Chat/ChatWindow.jsx';

/**
 * Root component — controls which view is active.
 * No routing library needed: a single boolean toggles Landing ↔ Chat.
 */
function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="app-root">
      {isChatOpen ? (
        <ChatWindow onBack={() => setIsChatOpen(false)} />
      ) : (
        <LandingPage onStartChat={() => setIsChatOpen(true)} />
      )}
    </div>
  );
}

export default App;
