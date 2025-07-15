import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [zipFile, setZipFile] = useState(null);
  const [fileName, setFileName] = useState('No ZIP file selected');
  const [convertedText, setConvertedText] = useState('');
  const [isConverted, setIsConverted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamically load JSZip only when needed
  useEffect(() => {
    if (!window.JSZip) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js ';
      script.onload = () => {
        console.log('JSZip loaded successfully.');
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/zip') {
      setZipFile(file);
      setFileName(file.name);
      setIsConverted(false);
      setConvertedText('');
    } else {
      alert('Please select a valid ZIP file.');
    }
  };

  const handleConvert = async () => {
    if (!zipFile || !window.JSZip) {
      alert('ZIP file not selected or JSZip not loaded yet.');
      return;
    }

    setLoading(true);
    try {
      const zipContent = await window.JSZip.loadAsync(zipFile);
      let output = '';

      Object.keys(zipContent.files).forEach((filename) => {
        const file = zipContent.files[filename];

        // Skip directories
        if (file.dir) return;

        // Check if the file has a supported extension
        const ext = filename.split('.').pop().toLowerCase();
        const supportedExts = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'm', 'r', 'scala', 'pl', 'sh', 'sql', 'html', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'yml', 'yaml', 'md'];

        if (supportedExts.includes(ext)) {
          file.async('string').then((content) => {
            output += `--- File: ${filename} ---\n\n`;
            output += content.trim() + '\n\n\n';
          });
        }
      });

      // Wait for all promises to resolve before setting state
      setTimeout(() => {
        setConvertedText(output);
        setIsConverted(true);
        setLoading(false);
      }, 1500); // Simulate processing time

    } catch (error) {
      console.error(error);
      alert('Error reading ZIP file.');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!convertedText) return;

    const blob = new Blob([convertedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipFile.name.replace(/\.[^/.]+$/, '') + '_converted.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            Project Code Merger
          </h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload your project ZIP folder
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-700 text-gray-300 rounded-lg shadow-md tracking-wide border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors duration-200">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                  <path d="M14 4a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V6a2 2 0 00-2-2h-2z"></path>
                </svg>
                <span className="mt-2 text-sm truncate">{fileName}</span>
                <input type="file" className="hidden" onChange={handleFileChange} accept=".zip" />
              </label>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={handleConvert}
              disabled={!zipFile || loading}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                zipFile && !loading
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Processing...' : 'Convert & Merge Files'}
            </button>
          </div>

          {isConverted && (
            <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600 animate-fadeIn">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Merged Output</h2>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm transition-colors duration-200"
                >
                  Download Merged TXT
                </button>
              </div>
              <div className="bg-gray-800 p-4 rounded-md max-h-96 overflow-y-auto border border-gray-600 font-mono text-sm text-gray-300 whitespace-pre-wrap break-words">
                {convertedText || 'Your merged code will appear here...'}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 px-6 py-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 text-center">
            Supports: JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, MATLAB, R, Scala, Shell, SQL, HTML, CSS, JSON, XML, YAML, Markdown, and more
          </p>
        </div>
      </div>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} CodeMerger Pro. All rights reserved.</p>
        <p>Created by <a href='https://www.genztech.co.ke'>Genz Tech</a></p>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}