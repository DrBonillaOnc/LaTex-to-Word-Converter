import React, { useState, useCallback } from 'react';
import { convertLatexToHtml, ConversionOptions } from './services/geminiService';
import Header from './components/Header';
import Loader from './components/Loader';
import { UploadIcon, ConvertIcon, DownloadIcon, SettingsIcon } from './components/icons';
import OptionsModal from './components/OptionsModal';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface AppError {
    title: string;
    message: string;
}

const App: React.FC = () => {
    const [latexContent, setLatexContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [docxHtml, setDocxHtml] = useState<string | null>(null);
    const [error, setError] = useState<AppError | null>(null);
    const [fileName, setFileName] = useState<string>('converted-document');
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState<boolean>(false);
    const [conversionOptions, setConversionOptions] = useState<ConversionOptions>({
        strictFormatting: true,
        mathPriority: false,
        noImagePlaceholders: false,
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.tex')) {
                setError({ title: 'Invalid File Type', message: 'Please upload a valid .tex file.' });
                return;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                 setError({ title: 'File Too Large', message: `Please upload a file smaller than ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.` });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setLatexContent(content);
                setFileName(file.name);
                setError(null);
                setDocxHtml(null);
            };
            reader.onerror = () => {
                setError({ title: 'File Read Error', message: 'An error occurred while trying to read the selected file.'});
            };
            reader.readAsText(file);
        }
    };

    const handleConvert = useCallback(async () => {
        if (!latexContent.trim()) {
            setError({ title: 'Input Required', message: 'Please enter LaTeX content or upload a file.' });
            return;
        }

        setIsLoading(true);
        setError(null);
        setDocxHtml(null);

        try {
            const resultHtml = await convertLatexToHtml(latexContent, conversionOptions);
            setDocxHtml(resultHtml);
        } catch (err) {
            console.error(err);
            const genericError: AppError = { 
                title: 'An Unknown Error Occurred', 
                message: 'Something went wrong. Please try again or check the console for details.' 
            };

            if (err instanceof Error) {
                if (err.message.includes('API Key')) {
                    setError({ title: 'API Error', message: 'There is an issue with the API configuration. Please contact support.' });
                } else if (err.message.includes('could not convert')) {
                    setError({ title: 'Conversion Failed', message: 'The model could not process your LaTeX code. Please check it for significant syntax errors.' });
                } else if (err.message.includes('Failed to communicate') || err.message.toLowerCase().includes('fetch')) {
                     setError({ title: 'Network Error', message: 'Could not connect to the conversion service. Please check your internet connection.' });
                } else {
                    setError(genericError);
                }
            } else {
                 setError(genericError);
            }
        } finally {
            setIsLoading(false);
        }
    }, [latexContent, conversionOptions]);

    const handleDownload = () => {
        if (!docxHtml) return;
        
        const finalHtml = `
            <!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Export HTML To Doc</title></head>
            <body>${docxHtml}</body>
            </html>`;

        const blob = new Blob([finalHtml], {
            type: 'application/msword',
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const downloadFileName = fileName.endsWith('.tex') ? fileName.replace(/\.tex$/, '.doc') : `${fileName}.doc`;
        a.download = downloadFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <Header />
            <main className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
                <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 md:p-8">
                    
                    <div className="mb-6">
                        <label htmlFor="latex-input" className="block text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">
                            Your LaTeX Document
                        </label>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Paste your LaTeX code below or upload a <code>.tex</code> file.
                        </p>
                        <textarea
                            id="latex-input"
                            value={latexContent}
                            onChange={(e) => {
                                setLatexContent(e.target.value);
                                setDocxHtml(null);
                                setError(null);
                            }}
                            placeholder="e.g., \documentclass{article}..."
                            className="w-full h-64 p-4 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-y"
                        />
                    </div>

                    <div className="flex items-center justify-center mb-6">
                        <span className="text-sm text-slate-400 dark:text-slate-500">OR</span>
                    </div>

                    <div className="flex justify-center mb-8">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-indigo-600 dark:text-indigo-400 font-semibold py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm inline-flex items-center transition-all duration-200">
                           <UploadIcon />
                           <span className="ml-2">Upload .tex File</span>
                           <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".tex" onChange={handleFileChange} />
                        </label>
                    </div>

                    {error && (
                        <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md mb-6" role="alert">
                            <p className="font-bold">{error.title}</p>
                            <p>{error.message}</p>
                        </div>
                    )}
                    
                    <div className="mt-6 text-center border-t border-slate-200 dark:border-slate-700 pt-6">
                        {isLoading ? (
                            <Loader />
                        ) : docxHtml ? (
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">Conversion Successful!</p>
                                <button
                                    onClick={handleDownload}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-900 transition-all duration-200 transform hover:scale-105 inline-flex items-center"
                                >
                                    <DownloadIcon />
                                    <span className="ml-2">Download .doc File</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <button
                                    onClick={handleConvert}
                                    disabled={!latexContent.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-all duration-200 transform hover:scale-105 inline-flex items-center"
                                >
                                    <ConvertIcon />
                                    <span className="ml-2">Convert to Word</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOptionsModalOpen(true)}
                                    className="inline-flex items-center justify-center px-4 py-3 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-colors"
                                    aria-label="Conversion options"
                                >
                                    <SettingsIcon />
                                    <span className="ml-2 hidden sm:inline">Options</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                 <footer className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
                    <p>Powered by Gemini. Conversion quality may vary.</p>
                </footer>
            </main>
            {isOptionsModalOpen && (
                <OptionsModal 
                    options={conversionOptions}
                    setOptions={setConversionOptions}
                    onClose={() => setIsOptionsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default App;
