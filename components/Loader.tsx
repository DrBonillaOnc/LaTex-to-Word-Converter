
import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-t-4 border-slate-200 dark:border-slate-600 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 dark:text-slate-300 font-semibold">
                Converting your document...
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                This may take a moment for large files.
            </p>
        </div>
    );
};

export default Loader;
