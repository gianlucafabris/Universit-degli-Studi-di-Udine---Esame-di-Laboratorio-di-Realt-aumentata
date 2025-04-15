import { $ as jQuery } from 'react-jquery-plugin';

import ReactDOM from 'react-dom/client';
import Experience from './Experience/Experience.js';
import './style.css';

const root = ReactDOM.createRoot(jQuery("#root")[0]);

root.render(
    <Experience />
);
