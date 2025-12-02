import React, { FC, useCallback, useEffect } from 'react';
import { ConversionOptions } from '../services/geminiService';
import { CloseIcon } from './icons';

interface OptionsModalProps {
    options: ConversionOptions;
    setOptions: React.Dispatch<React.SetStateAction<ConversionOptions>>;
    onClose: () => void;
}

const OptionToggle: FC<{ id: keyof ConversionOptions; label: string; description: string; checked: boolean; onChange: (id: keyof ConversionOptions, checked: boolean) => void; }> = ({ id, label, description, checked, onChange }) => (
    <div className="relative flex items-start py-4">
        <div className="min-w-0 flex-1 text-sm">
            <label htmlFor={id} className="font-medium text-slate-700 dark:text-slate-200">{label}</label>
            <p className="text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="ml-3 flex items-center h-5">
            <input
                id={id}
                name={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(id, e.target.checked)}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-800"
            />
        </div>
    </div>
);

const OptionsModal: FC<OptionsModalProps> = ({ options, setOptions, onClose }) => {
    const handleOptionChange = (optionId: keyof ConversionOptions, isChecked: boolean) => {
        setOptions(prev => ({ ...prev, [optionId]: isChecked }));
    };

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);


    return (
        <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="options-modal-title"
        >
            <div
                className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full"
                onClick={(e) => e.stopPropagation()} // Prevent closing modal on inner click
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 id="options-modal-title" className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Conversion Options
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        aria-label="Close options modal"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-6 divide-y divide-slate-200 dark:divide-slate-700">
                    <OptionToggle
                        id="strictFormatting"
                        label="Strict Formatting"
                        description="Prioritize preserving the exact visual layout and spacing."
                        checked={options.strictFormatting}
                        onChange={handleOptionChange}
                    />
                    <OptionToggle
                        id="mathPriority"
                        label="Prioritize Math Conversion"
                        description="Ensure highest accuracy for mathematical equations (MathML)."
                        checked={options.mathPriority}
                        onChange={handleOptionChange}
                    />
                    <OptionToggle
                        id="noImagePlaceholders"
                        label="Omit Image Placeholders"
                        description="Ignore image commands and do not create placeholders."
                        checked={options.noImagePlaceholders}
                        onChange={handleOptionChange}
                    />
                </div>

                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-right sm:px-6 rounded-b-lg">
                    <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 sm:text-sm"
                        onClick={onClose}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OptionsModal;