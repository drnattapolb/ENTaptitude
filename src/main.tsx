import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { testFirestoreConnection } from './firebase';

// Verify Firestore cloud database connection on application boot
testFirestoreConnection();

createRoot(document.getElementById('root')!).render(<App />);
