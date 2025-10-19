import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as RadixToast from '@radix-ui/react-toast';
import { AppProvider } from './state/AppContext.jsx';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import Letters from './pages/Letters.jsx';
import EditLetter from './pages/EditLetter.jsx';
import Settings from './pages/Settings.jsx';

function App() {
  return (
    <AppProvider>
      <RadixToast.Provider swipeDirection="right">
        <Router>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/letters" element={<Letters />} />
                <Route path="/letters/:id" element={<EditLetter />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </Router>
        {/* Radix Toast viewport */}
        <RadixToast.Viewport
          className="fixed top-4 right-4 z-50 m-0 flex flex-col gap-3 w-[360px] max-w-[calc(100vw-32px)] outline-none"
        />
      </RadixToast.Provider>
    </AppProvider>
  );
}

export default App;