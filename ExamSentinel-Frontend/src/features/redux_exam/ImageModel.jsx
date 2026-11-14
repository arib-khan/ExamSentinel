import React from 'react';

const ImageModal = ({ src, onClose }) => {
    if (!src) return null;

    return (
        <div
            className="fixed inset-0 flex justify-center items-center z-[100]"
            style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={onClose}
        >
            <div className="relative max-w-full max-h-full p-4" onClick={(e) => e.stopPropagation()}>
                <img
                    src={src}
                    alt="Enlarged view"
                    className="max-w-full max-h-[90vh] object-contain rounded-md shadow-lg"
                />
                <button
                    onClick={onClose}
                    className="absolute top-2 right-4 text-white text-4xl font-light hover:text-gray-300 transition-colors"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default ImageModal;