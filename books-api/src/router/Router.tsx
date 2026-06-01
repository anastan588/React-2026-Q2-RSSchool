import { createBrowserRouter } from 'react-router';

import App from '@/App';
import About from '@/pages/About';
import BookDetails from '@/pages/BookDetails';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'details/:id',
        element: <BookDetails />,
      },
    ],
  },
  {
    path: '/about',
    element: <About />,
  },

  {
    path: '*',
    element: <NotFound />,
  },
]);
