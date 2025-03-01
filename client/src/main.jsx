import React from 'react'
import { createRoot } from 'react-dom/client'
import './style/index.css'
import App from './App.jsx'
import './style/App.css'
import './style/elements.css'
import './style/fonts.css'
import {createBrowserRouter, RouterProvider} from "react-router";

const router = createBrowserRouter([
    {
        path: "/*",
        element:<App/>,
    },
]);

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)
