import { Route, Routes } from 'react-router';

import PlayerPage from './pages/PlayerPage';
import HostPage from './pages/HostPage';
import ViewPage from './pages/ViewPage';

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<PlayerPage />} />
                <Route path="/host/" element={<HostPage />} />
                <Route path="/view/" element={<ViewPage />} />
            </Routes>
        </>
    );
}

export default App;
