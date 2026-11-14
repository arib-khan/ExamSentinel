// import React, { useState } from 'react';
// import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
// import Image from "/PeriodicTable.png"

// export default function PeriodicTableViewer() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [zoom, setZoom] = useState(1);
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

//   const handleZoomIn = () => {
//     setZoom(prev => Math.min(prev + 0.2, 3));
//   };

//   const handleZoomOut = () => {
//     setZoom(prev => Math.max(prev - 0.2, 0.5));
//   };

//   const handleResetZoom = () => {
//     setZoom(1);
//     setPosition({ x: 0, y: 0 });
//   };

//   const handleMouseDown = (e) => {
//     if (zoom > 1) {
//       setIsDragging(true);
//       setDragStart({
//         x: e.clientX - position.x,
//         y: e.clientY - position.y
//       });
//     }
//   };

//   const handleMouseMove = (e) => {
//     if (isDragging && zoom > 1) {
//       setPosition({
//         x: e.clientX - dragStart.x,
//         y: e.clientY - dragStart.y
//       });
//     }
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       {/* Toggle Button */}
//       <button
//         onClick={() => setIsOpen(true)}
//         className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
//       >
//         <Maximize2 size={20} />
//         View Periodic Table
//       </button>

//       {/* Modal Overlay */}
//       {isOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
//           {/* Control Panel */}
//           <div className="absolute top-4 right-4 flex gap-2 z-10">
//             <button
//               onClick={handleZoomOut}
//               className="bg-white hover:bg-gray-100 p-3 rounded-lg shadow-lg transition-colors"
//               title="Zoom Out"
//             >
//               <ZoomOut size={24} />
//             </button>
//             <button
//               onClick={handleResetZoom}
//               className="bg-white hover:bg-gray-100 px-4 py-3 rounded-lg shadow-lg transition-colors font-medium"
//               title="Reset Zoom"
//             >
//               {Math.round(zoom * 100)}%
//             </button>
//             <button
//               onClick={handleZoomIn}
//               className="bg-white hover:bg-gray-100 p-3 rounded-lg shadow-lg transition-colors"
//               title="Zoom In"
//             >
//               <ZoomIn size={24} />
//             </button>
//             <button
//               onClick={() => {
//                 setIsOpen(false);
//                 handleResetZoom();
//               }}
//               className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg shadow-lg transition-colors"
//               title="Close"
//             >
//               <X size={24} />
//             </button>
//           </div>

//           {/* Image Container */}
//           <div
//             className="w-full h-full overflow-hidden flex items-center justify-center"
//             onMouseMove={handleMouseMove}
//             onMouseUp={handleMouseUp}
//             onMouseLeave={handleMouseUp}
//           >
//             <img
//               src={Image}
//               alt="Periodic Table of Elements"
//               className="max-w-none select-none"
//               style={{
//                 transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
//                 cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
//                 transition: isDragging ? 'none' : 'transform 0.2s ease-out'
//               }}
//               onMouseDown={handleMouseDown}
//               draggable={false}
//             />
//           </div>

//           {/* Instructions */}
//           <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-6 py-3 rounded-lg shadow-lg">
//             <p className="text-sm text-gray-700">
//               {zoom > 1 ? 'Click and drag to pan • ' : ''}Use zoom buttons to magnify • Press close to exit
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function PeriodicTableViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    handleResetZoom();
  };

  return (
    <>
      {/* Toggle Button - Compact version for sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer px-2 py-2 rounded-md shadow flex items-center gap-2 transition-colors text-sm  justify-center"
        title="View Periodic Table"
      >
        <Maximize2 size={16} />
        Periodic Table
      </button>

      {/* Full Screen Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-[9999] flex items-center justify-center">
          {/* Control Panel */}
          <div className="absolute top-4 right-4 flex gap-2 z-[10000]">
            <button
              onClick={handleZoomOut}
              className="bg-amber-700 hover:bg-amber-600 p-2 rounded-lg shadow-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={24} />
            </button>
            <button
              onClick={handleResetZoom}
              className="bg-amber-700 hover:bg-amber-600 px-2 py-2 rounded-lg shadow-lg transition-colors font-medium min-w-[80px]"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="bg-amber-700 hover:bg-amber-600 p-2 rounded-lg shadow-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={24} />
            </button>
            <button
              onClick={handleClose}
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg shadow-lg transition-colors"
              title="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Title */}
          <div className="absolute top-4 left-4 z-[10000]">
            {/* <h2 className="text-white text-xl font-semibold bg-black bg-opacity-50 px-4 py-2 rounded-lg">
              Periodic Table of Elements
            </h2> */}
          </div>

          {/* Image Container */}
          <div
            className="w-full h-full overflow-hidden flex items-center justify-center cursor-default"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src="/PeriodicTable.png"
              alt="Periodic Table of Elements"
              className="max-w-none select-none"
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                maxHeight: '90vh',
                maxWidth: '95vw'
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
          </div>


        </div>
      )}
    </>
  );
}