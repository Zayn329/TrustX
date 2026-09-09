import { CheckCircle } from 'lucide-react';

export function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md flex items-center gap-4 border border-gray-200">
        <CheckCircle className="w-8 h-8 text-green-500" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">React + Vite + Tailwind + Lucide</h1>
          <p className="text-sm text-gray-600">Minimal project setup completed successfully.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
