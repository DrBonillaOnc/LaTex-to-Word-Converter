
import React from 'react';
import { DocumentIcon } from './icons';

const Header: React.FC = () => {
    return (
        <header className="bg-white dark:bg-slate-800/50 shadow-md backdrop-blur-sm">
            <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 md:px-8">
                <div className="flex items-center">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white">
                        <DocumentIcon />
                    </div>
                    <div className="ml-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                            LaTeX to Word Converter
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Powered by Gemini
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
