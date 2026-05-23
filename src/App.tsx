/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './lib/AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CycleTracker } from './pages/CycleTracker';
import { Todo } from './pages/Todo';
import { Album } from './pages/Album';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="cycle" element={<CycleTracker />} />
            <Route path="todo" element={<Todo />} />
            <Route path="album" element={<Album />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
