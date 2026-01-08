import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'

// #region agent log
fetch('http://127.0.0.1:7245/ingest/fbe0bbdb-9d7a-4e37-88aa-b587899c232f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:8',message:'React main.tsx starting',data:{rootElement:!!document.getElementById("root")},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,D,E'})}).catch(()=>{});
// #endregion

try {
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/fbe0bbdb-9d7a-4e37-88aa-b587899c232f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:14',message:'Creating React root',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
  // #endregion

  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );

  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/fbe0bbdb-9d7a-4e37-88aa-b587899c232f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:24',message:'React render called successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
} catch (error: any) {
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/fbe0bbdb-9d7a-4e37-88aa-b587899c232f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:29',message:'React render FAILED',data:{error:error?.message,stack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,D,E'})}).catch(()=>{});
  // #endregion
  console.error('React render failed:', error);
}
