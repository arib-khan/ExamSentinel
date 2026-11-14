// // import React, { useState } from 'react';
// // import { X, Calculator, Delete, Divide, Minus, Plus, Equal } from 'lucide-react';

// // export default function ExamCalculator() {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [display, setDisplay] = useState('0');
// //   const [memory, setMemory] = useState(null);
// //   const [operation, setOperation] = useState(null);
// //   const [waitingForOperand, setWaitingForOperand] = useState(false);
// //   const [history, setHistory] = useState([]);

// //   const inputDigit = (digit) => {
// //     if (waitingForOperand) {
// //       setDisplay(String(digit));
// //       setWaitingForOperand(false);
// //     } else {
// //       setDisplay(display === '0' ? String(digit) : display + digit);
// //     }
// //   };

// //   const inputDecimal = () => {
// //     if (waitingForOperand) {
// //       setDisplay('0.');
// //       setWaitingForOperand(false);
// //     } else if (display.indexOf('.') === -1) {
// //       setDisplay(display + '.');
// //     }
// //   };

// //   const clear = () => {
// //     setDisplay('0');
// //     setMemory(null);
// //     setOperation(null);
// //     setWaitingForOperand(false);
// //   };

// //   const clearEntry = () => {
// //     setDisplay('0');
// //   };

// //   const backspace = () => {
// //     const newDisplay = display.slice(0, -1);
// //     setDisplay(newDisplay || '0');
// //   };

// //   const performOperation = (nextOperation) => {
// //     const inputValue = parseFloat(display);

// //     if (memory === null) {
// //       setMemory(inputValue);
// //     } else if (operation) {
// //       const currentValue = memory || 0;
// //       const newValue = calculate(currentValue, inputValue, operation);

// //       setDisplay(String(newValue));
// //       setMemory(newValue);

// //       // Add to history
// //       setHistory(prev => [...prev.slice(-4), `${currentValue} ${operation} ${inputValue} = ${newValue}`]);
// //     }

// //     setWaitingForOperand(true);
// //     setOperation(nextOperation);
// //   };

// //   const calculate = (firstOperand, secondOperand, operation) => {
// //     switch (operation) {
// //       case '+':
// //         return firstOperand + secondOperand;
// //       case '-':
// //         return firstOperand - secondOperand;
// //       case '×':
// //         return firstOperand * secondOperand;
// //       case '÷':
// //         return secondOperand !== 0 ? firstOperand / secondOperand : 0;
// //       case '%':
// //         return firstOperand % secondOperand;
// //       default:
// //         return secondOperand;
// //     }
// //   };

// //   const toggleSign = () => {
// //     const newDisplay = parseFloat(display) * -1;
// //     setDisplay(String(newDisplay));
// //   };

// //   const percentage = () => {
// //     const value = parseFloat(display) / 100;
// //     setDisplay(String(value));
// //   };

// //   const scientificOperation = (op) => {
// //     const value = parseFloat(display);
// //     let result;

// //     switch (op) {
// //       case 'sqrt':
// //         result = Math.sqrt(value);
// //         break;
// //       case 'square':
// //         result = value * value;
// //         break;
// //       case 'cube':
// //         result = value * value * value;
// //         break;
// //       case 'sin':
// //         result = Math.sin(value * Math.PI / 180);
// //         break;
// //       case 'cos':
// //         result = Math.cos(value * Math.PI / 180);
// //         break;
// //       case 'tan':
// //         result = Math.tan(value * Math.PI / 180);
// //         break;
// //       case 'log':
// //         result = Math.log10(value);
// //         break;
// //       case 'ln':
// //         result = Math.log(value);
// //         break;
// //       case '1/x':
// //         result = 1 / value;
// //         break;
// //       case 'exp':
// //         result = Math.exp(value);
// //         break;
// //       case 'pi':
// //         result = Math.PI;
// //         break;
// //       case 'e':
// //         result = Math.E;
// //         break;
// //       default:
// //         return;
// //     }

// //     setDisplay(String(result));
// //     setHistory(prev => [...prev.slice(-4), `${op}(${value}) = ${result}`]);
// //   };

// //   const Button = ({ children, onClick, className = '', variant = 'default' }) => {
// //     const baseClass = "h-14 rounded-lg font-semibold transition-all active:scale-95 text-lg";
// //     const variants = {
// //       default: "bg-gray-700 hover:bg-gray-600 text-white",
// //       operator: "bg-orange-500 hover:bg-orange-600 text-white",
// //       equals: "bg-green-600 hover:bg-green-700 text-white",
// //       function: "bg-blue-600 hover:bg-blue-700 text-white text-sm",
// //       clear: "bg-red-600 hover:bg-red-700 text-white"
// //     };

// //     return (
// //       <button
// //         onClick={onClick}
// //         className={`${baseClass} ${variants[variant]} ${className}`}
// //       >
// //         {children}
// //       </button>
// //     );
// //   };

// //   return (
// //     <>
// //       {/* Toggle Button */}
// //       <button
// //         onClick={() => setIsOpen(true)}
// //         className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md shadow flex items-center gap-2 transition-colors text-sm w-full justify-center"
// //         title="Open Calculator"
// //       >
// //         <Calculator size={16} />
// //         Calculator
// //       </button>

// //       {/* Calculator Modal */}
// //       {isOpen && (
// //         <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
// //           <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
// //             {/* Header */}
// //             <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
// //               <h2 className="text-white font-semibold flex items-center gap-2">
// //                 <Calculator size={20} />
// //                 Scientific Calculator
// //               </h2>
// //               <button
// //                 onClick={() => setIsOpen(false)}
// //                 className="text-gray-400 hover:text-white transition-colors"
// //                 title="Close Calculator"
// //               >
// //                 <X size={24} />
// //               </button>
// //             </div>

// //             {/* History */}
// //             {history.length > 0 && (
// //               <div className="bg-gray-900 px-4 py-2 max-h-20 overflow-y-auto">
// //                 {history.map((item, index) => (
// //                   <div key={index} className="text-gray-400 text-xs font-mono">
// //                     {item}
// //                   </div>
// //                 ))}
// //               </div>
// //             )}

// //             {/* Display */}
// //             <div className="bg-gray-900 px-6 py-6">
// //               <div className="text-right">
// //                 {memory !== null && operation && (
// //                   <div className="text-gray-500 text-sm mb-1">
// //                     {memory} {operation}
// //                   </div>
// //                 )}
// //                 <div className="text-white text-4xl font-light break-all">
// //                   {display}
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Calculator Buttons */}
// //             <div className="p-4 space-y-2">
// //               {/* Scientific Functions Row 1 */}
// //               <div className="grid grid-cols-5 gap-2">
// //                 <Button variant="function" onClick={() => scientificOperation('sin')}>sin</Button>
// //                 <Button variant="function" onClick={() => scientificOperation('cos')}>cos</Button>
// //                 <Button variant="function" onClick={() => scientificOperation('tan')}>tan</Button>
// //                 <Button variant="function" onClick={() => scientificOperation('sqrt')}>√</Button>
// //                 <Button variant="function" onClick={() => scientificOperation('square')}>x²</Button>
// //               </div>

// //               {/* Scientific Functions Row 2 */}
// //               <div className="grid grid-cols-5 gap-2">
// //                 <Button variant="function" onClick={() => scientificOperation('log')}>log</Button>
// //                 <Button variant="function" onClick={() => scientificOperation('ln')}>ln</Button>
// //                 <Button variant="function" onClick={() => scientificOperation('exp')}>eˣ</Button>
// //                 <Button variant="function" onClick={() => scientificOperation('pi')}>π</Button>
// //                 <Button variant="function" onClick={() => scientificOperation('e')}>e</Button>
// //               </div>

// //               {/* Main Calculator Grid */}
// //               <div className="grid grid-cols-4 gap-2">
// //                 {/* Row 1 */}
// //                 <Button variant="clear" onClick={clear}>C</Button>
// //                 <Button variant="clear" onClick={clearEntry}>CE</Button>
// //                 <Button onClick={backspace}>
// //                   <Delete size={20} />
// //                 </Button>
// //                 <Button variant="operator" onClick={() => performOperation('÷')}>
// //                   ÷
// //                 </Button>

// //                 {/* Row 2 */}
// //                 <Button onClick={() => inputDigit(7)}>7</Button>
// //                 <Button onClick={() => inputDigit(8)}>8</Button>
// //                 <Button onClick={() => inputDigit(9)}>9</Button>
// //                 <Button variant="operator" onClick={() => performOperation('×')}>
// //                   ×
// //                 </Button>

// //                 {/* Row 3 */}
// //                 <Button onClick={() => inputDigit(4)}>4</Button>
// //                 <Button onClick={() => inputDigit(5)}>5</Button>
// //                 <Button onClick={() => inputDigit(6)}>6</Button>
// //                 <Button variant="operator" onClick={() => performOperation('-')}>
// //                   −
// //                 </Button>

// //                 {/* Row 4 */}
// //                 <Button onClick={() => inputDigit(1)}>1</Button>
// //                 <Button onClick={() => inputDigit(2)}>2</Button>
// //                 <Button onClick={() => inputDigit(3)}>3</Button>
// //                 <Button variant="operator" onClick={() => performOperation('+')}>
// //                   +
// //                 </Button>

// //                 {/* Row 5 */}
// //                 <Button onClick={toggleSign}>+/−</Button>
// //                 <Button onClick={() => inputDigit(0)}>0</Button>
// //                 <Button onClick={inputDecimal}>.</Button>
// //                 <Button variant="equals" onClick={() => performOperation('=')}>
// //                   =
// //                 </Button>
// //               </div>

// //               {/* Additional Operations */}
// //               <div className="grid grid-cols-3 gap-2">
// //                 <Button variant="function" onClick={percentage}>%</Button>
// //                 <Button variant="function" onClick={() => scientificOperation('1/x')}>1/x</Button>
// //                 <Button variant="function" onClick={() => scientificOperation('cube')}>x³</Button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }
// import React, { useState } from 'react';
// import { X, Calculator, Delete, Minimize2, Maximize2 } from 'lucide-react';

// export default function ExamCalculator({ onToggleLayout }) {
//   const [isOpen, setIsOpen] = useState(true);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [display, setDisplay] = useState('0');
//   const [memory, setMemory] = useState(null);
//   const [operation, setOperation] = useState(null);
//   const [waitingForOperand, setWaitingForOperand] = useState(false);
//   const [history, setHistory] = useState([]);

//   const inputDigit = (digit) => {
//     if (waitingForOperand) {
//       setDisplay(String(digit));
//       setWaitingForOperand(false);
//     } else {
//       setDisplay(display === '0' ? String(digit) : display + digit);
//     }
//   };

//   const inputDecimal = () => {
//     if (waitingForOperand) {
//       setDisplay('0.');
//       setWaitingForOperand(false);
//     } else if (display.indexOf('.') === -1) {
//       setDisplay(display + '.');
//     }
//   };

//   const clear = () => {
//     setDisplay('0');
//     setMemory(null);
//     setOperation(null);
//     setWaitingForOperand(false);
//   };

//   const clearEntry = () => {
//     setDisplay('0');
//   };

//   const backspace = () => {
//     const newDisplay = display.slice(0, -1);
//     setDisplay(newDisplay || '0');
//   };

//   const performOperation = (nextOperation) => {
//     const inputValue = parseFloat(display);

//     if (memory === null) {
//       setMemory(inputValue);
//     } else if (operation) {
//       const currentValue = memory || 0;
//       const newValue = calculate(currentValue, inputValue, operation);

//       setDisplay(String(newValue));
//       setMemory(newValue);

//       setHistory(prev => [...prev.slice(-4), `${currentValue} ${operation} ${inputValue} = ${newValue}`]);
//     }

//     setWaitingForOperand(true);
//     setOperation(nextOperation);
//   };

//   const calculate = (firstOperand, secondOperand, operation) => {
//     switch (operation) {
//       case '+':
//         return firstOperand + secondOperand;
//       case '-':
//         return firstOperand - secondOperand;
//       case '×':
//         return firstOperand * secondOperand;
//       case '÷':
//         return secondOperand !== 0 ? firstOperand / secondOperand : 0;
//       case '%':
//         return firstOperand % secondOperand;
//       default:
//         return secondOperand;
//     }
//   };

//   const toggleSign = () => {
//     const newDisplay = parseFloat(display) * -1;
//     setDisplay(String(newDisplay));
//   };

//   const percentage = () => {
//     const value = parseFloat(display) / 100;
//     setDisplay(String(value));
//   };

//   const scientificOperation = (op) => {
//     const value = parseFloat(display);
//     let result;

//     switch (op) {
//       case 'sqrt':
//         result = Math.sqrt(value);
//         break;
//       case 'square':
//         result = value * value;
//         break;
//       case 'cube':
//         result = value * value * value;
//         break;
//       case 'sin':
//         result = Math.sin(value * Math.PI / 180);
//         break;
//       case 'cos':
//         result = Math.cos(value * Math.PI / 180);
//         break;
//       case 'tan':
//         result = Math.tan(value * Math.PI / 180);
//         break;
//       case 'log':
//         result = Math.log10(value);
//         break;
//       case 'ln':
//         result = Math.log(value);
//         break;
//       case '1/x':
//         result = 1 / value;
//         break;
//       case 'exp':
//         result = Math.exp(value);
//         break;
//       case 'pi':
//         result = Math.PI;
//         break;
//       case 'e':
//         result = Math.E;
//         break;
//       default:
//         return;
//     }

//     setDisplay(String(result));
//     setHistory(prev => [...prev.slice(-4), `${op}(${value}) = ${result}`]);
//   };

//   const handleOpen = () => {
//     setIsOpen(true);
//     if (onToggleLayout) {
//       onToggleLayout(false); // Hide layout when calculator opens
//     }
//   };

//   const handleClose = () => {
//     setIsOpen(false);
//     if (onToggleLayout) {
//       onToggleLayout(true); // Show layout when calculator closes
//     }
//   };

//   const toggleFullscreen = () => {
//     setIsFullscreen(!isFullscreen);
//   };

//   const Button = ({ children, onClick, className = '', variant = 'default' }) => {
//     const baseClass = "h-14 rounded-lg font-semibold transition-all active:scale-95 text-lg";
//     const variants = {
//       default: "bg-gray-700 hover:bg-gray-600 text-white",
//       operator: "bg-orange-500 hover:bg-orange-600 text-white",
//       equals: "bg-green-600 hover:bg-green-700 text-white",
//       function: "bg-blue-600 hover:bg-blue-700 text-white text-sm",
//       clear: "bg-red-600 hover:bg-red-700 text-white"
//     };

//     return (
//       <button
//         onClick={onClick}
//         className={`${baseClass} ${variants[variant]} ${className}`}
//       >
//         {children}
//       </button>
//     );
//   };

//   return (
//     <>
//       {/* Toggle Button */}
//       {/* <button
//         onClick={handleOpen}
//         className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md shadow flex items-center gap-2 transition-colors text-sm w-full justify-center"
//         title="Open Calculator"
//       >
//         <Calculator size={16} />
//         Calculator
//       </button> */}

//       {/* Calculator Modal */}
//       {isOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
//           <div
//             className={`bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isFullscreen ? 'w-full h-full max-w-none' : 'w-full max-w-md'
//               }`}
//           >
//             {/* Header */}
//             <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
//               <h2 className="text-white font-semibold flex items-center gap-2">
//                 <Calculator size={20} />
//                 Scientific Calculator
//               </h2>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={toggleFullscreen}
//                   className="text-gray-400 hover:text-white transition-colors p-2"
//                   title={isFullscreen ? "Minimize" : "Maximize"}
//                 >
//                   {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
//                 </button>
//                 <button
//                   onClick={handleClose}
//                   className="text-gray-400 hover:text-white transition-colors"
//                   title="Close Calculator"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>
//             </div>

//             {/* History */}
//             {history.length > 0 && (
//               <div className="bg-gray-900 px-4 py-2 max-h-20 overflow-y-auto">
//                 {history.map((item, index) => (
//                   <div key={index} className="text-gray-400 text-xs font-mono">
//                     {item}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Display */}
//             <div className="bg-gray-900 px-6 py-6">
//               <div className="text-right">
//                 {memory !== null && operation && (
//                   <div className="text-gray-500 text-sm mb-1">
//                     {memory} {operation}
//                   </div>
//                 )}
//                 <div className="text-white text-4xl font-light break-all">
//                   {display}
//                 </div>
//               </div>
//             </div>

//             {/* Calculator Buttons */}
//             <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: isFullscreen ? 'calc(100vh - 250px)' : '500px' }}>
//               {/* Scientific Functions Row 1 */}
//               <div className="grid grid-cols-5 gap-2">
//                 <Button variant="function" onClick={() => scientificOperation('sin')}>sin</Button>
//                 <Button variant="function" onClick={() => scientificOperation('cos')}>cos</Button>
//                 <Button variant="function" onClick={() => scientificOperation('tan')}>tan</Button>
//                 <Button variant="function" onClick={() => scientificOperation('sqrt')}>√</Button>
//                 <Button variant="function" onClick={() => scientificOperation('square')}>x²</Button>
//               </div>

//               {/* Scientific Functions Row 2 */}
//               <div className="grid grid-cols-5 gap-2">
//                 <Button variant="function" onClick={() => scientificOperation('log')}>log</Button>
//                 <Button variant="function" onClick={() => scientificOperation('ln')}>ln</Button>
//                 <Button variant="function" onClick={() => scientificOperation('exp')}>eˣ</Button>
//                 <Button variant="function" onClick={() => scientificOperation('pi')}>π</Button>
//                 <Button variant="function" onClick={() => scientificOperation('e')}>e</Button>
//               </div>

//               {/* Main Calculator Grid */}
//               <div className="grid grid-cols-4 gap-2">
//                 <Button variant="clear" onClick={clear}>C</Button>
//                 <Button variant="clear" onClick={clearEntry}>CE</Button>
//                 <Button onClick={backspace}>
//                   <Delete size={20} />
//                 </Button>
//                 <Button variant="operator" onClick={() => performOperation('÷')}>÷</Button>

//                 <Button onClick={() => inputDigit(7)}>7</Button>
//                 <Button onClick={() => inputDigit(8)}>8</Button>
//                 <Button onClick={() => inputDigit(9)}>9</Button>
//                 <Button variant="operator" onClick={() => performOperation('×')}>×</Button>

//                 <Button onClick={() => inputDigit(4)}>4</Button>
//                 <Button onClick={() => inputDigit(5)}>5</Button>
//                 <Button onClick={() => inputDigit(6)}>6</Button>
//                 <Button variant="operator" onClick={() => performOperation('-')}>−</Button>

//                 <Button onClick={() => inputDigit(1)}>1</Button>
//                 <Button onClick={() => inputDigit(2)}>2</Button>
//                 <Button onClick={() => inputDigit(3)}>3</Button>
//                 <Button variant="operator" onClick={() => performOperation('+')}>+</Button>

//                 <Button onClick={toggleSign}>+/−</Button>
//                 <Button onClick={() => inputDigit(0)}>0</Button>
//                 <Button onClick={inputDecimal}>.</Button>
//                 <Button variant="equals" onClick={() => performOperation('=')}>=</Button>
//               </div>

//               {/* Additional Operations */}
//               <div className="grid grid-cols-3 gap-2">
//                 <Button variant="function" onClick={percentage}>%</Button>
//                 <Button variant="function" onClick={() => scientificOperation('1/x')}>1/x</Button>
//                 <Button variant="function" onClick={() => scientificOperation('cube')}>x³</Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
import React, { useState } from 'react';
import { X, Calculator, Delete } from 'lucide-react';

export default function ExamCalculator({ onClose }) {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState([]);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setMemory(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const backspace = () => {
    const newDisplay = display.slice(0, -1);
    setDisplay(newDisplay || '0');
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (memory === null) {
      setMemory(inputValue);
    } else if (operation) {
      const currentValue = memory || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setMemory(newValue);

      setHistory(prev => [...prev.slice(-4), `${currentValue} ${operation} ${inputValue} = ${newValue}`]);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstOperand, secondOperand, operation) => {
    switch (operation) {
      case '+':
        return firstOperand + secondOperand;
      case '-':
        return firstOperand - secondOperand;
      case '×':
        return firstOperand * secondOperand;
      case '÷':
        return secondOperand !== 0 ? firstOperand / secondOperand : 0;
      case '%':
        return firstOperand % secondOperand;
      default:
        return secondOperand;
    }
  };

  const toggleSign = () => {
    const newDisplay = parseFloat(display) * -1;
    setDisplay(String(newDisplay));
  };

  const percentage = () => {
    const value = parseFloat(display) / 100;
    setDisplay(String(value));
  };

  const scientificOperation = (op) => {
    const value = parseFloat(display);
    let result;

    switch (op) {
      case 'sqrt':
        result = Math.sqrt(value);
        break;
      case 'square':
        result = value * value;
        break;
      case 'cube':
        result = value * value * value;
        break;
      case 'sin':
        result = Math.sin(value * Math.PI / 180);
        break;
      case 'cos':
        result = Math.cos(value * Math.PI / 180);
        break;
      case 'tan':
        result = Math.tan(value * Math.PI / 180);
        break;
      case 'log':
        result = Math.log10(value);
        break;
      case 'ln':
        result = Math.log(value);
        break;
      case '1/x':
        result = 1 / value;
        break;
      case 'exp':
        result = Math.exp(value);
        break;
      case 'pi':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setHistory(prev => [...prev.slice(-4), `${op}(${value}) = ${result}`]);
  };

  const Button = ({ children, onClick, className = '', variant = 'default' }) => {
    const baseClass = "h-12 rounded-lg font-semibold transition-all active:scale-95 text-base";
    const variants = {
      default: "bg-gray-700 hover:bg-gray-600 text-white",
      operator: "bg-orange-500 hover:bg-orange-600 text-white",
      equals: "bg-green-600 hover:bg-green-700 text-white",
      function: "bg-blue-600 hover:bg-blue-700 text-white text-sm",
      clear: "bg-red-600 hover:bg-red-700 text-white"
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClass} ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="h-full w-full bg-gray-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Calculator size={20} />
          Scientific Calculator
        </h2>
        <button
          onClick={onClose}
          className=" cursor-pointer transition-colors bg-red-600 rounded-full"
          title="Close Calculator"
        >
          <X size={24} />
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-gray-900 px-4 py-2 overflow-y-auto flex-[3]">
          {history.map((item, index) => (
            <div key={index} className="text-gray-400 text-xs font-mono">
              {item}
            </div>
          ))}
        </div>
      )}


      {/* Display */}
      <div className="bg-gray-900 px-6 py-4 overflow-y-auto flex-[2]">
        <div className="text-right">
          {memory !== null && operation && (
            <div className="text-gray-500 text-sm mb-1">
              {memory} {operation}
            </div>
          )}
          <div className="text-white text-3xl font-light break-all">
            {display}
          </div>
        </div>
      </div>


      {/* Calculator Buttons */}
      <div className="p-4 space-y-2 overflow-y-auto flex-shrink-0">
        {/* Scientific Functions Row 1 */}
        <div className="grid grid-cols-5 gap-2">
          <Button variant="function" onClick={() => scientificOperation('sin')}>sin</Button>
          <Button variant="function" onClick={() => scientificOperation('cos')}>cos</Button>
          <Button variant="function" onClick={() => scientificOperation('tan')}>tan</Button>
          <Button variant="function" onClick={() => scientificOperation('sqrt')}>√</Button>
          <Button variant="function" onClick={() => scientificOperation('square')}>x²</Button>
        </div>

        {/* Scientific Functions Row 2 */}
        <div className="grid grid-cols-5 gap-2">
          <Button variant="function" onClick={() => scientificOperation('log')}>log</Button>
          <Button variant="function" onClick={() => scientificOperation('ln')}>ln</Button>
          <Button variant="function" onClick={() => scientificOperation('exp')}>eˣ</Button>
          <Button variant="function" onClick={() => scientificOperation('pi')}>π</Button>
          <Button variant="function" onClick={() => scientificOperation('e')}>e</Button>
        </div>

        {/* Main Calculator Grid */}
        <div className="grid grid-cols-4 gap-2">
          <Button variant="clear" onClick={clear}>C</Button>
          <Button variant="clear" onClick={clearEntry}>CE</Button>
          <Button onClick={backspace} className='flex items-center justify-center'>
            <Delete size={18} />
          </Button>
          <Button variant="operator" onClick={() => performOperation('÷')}>÷</Button>

          <Button onClick={() => inputDigit(7)}>7</Button>
          <Button onClick={() => inputDigit(8)}>8</Button>
          <Button onClick={() => inputDigit(9)}>9</Button>
          <Button variant="operator" onClick={() => performOperation('×')}>×</Button>

          <Button onClick={() => inputDigit(4)}>4</Button>
          <Button onClick={() => inputDigit(5)}>5</Button>
          <Button onClick={() => inputDigit(6)}>6</Button>
          <Button variant="operator" onClick={() => performOperation('-')}>−</Button>

          <Button onClick={() => inputDigit(1)}>1</Button>
          <Button onClick={() => inputDigit(2)}>2</Button>
          <Button onClick={() => inputDigit(3)}>3</Button>
          <Button variant="operator" onClick={() => performOperation('+')}>+</Button>

          <Button onClick={toggleSign}>+/−</Button>
          <Button onClick={() => inputDigit(0)}>0</Button>
          <Button onClick={inputDecimal}>.</Button>
          <Button variant="equals" onClick={() => performOperation('=')}>=</Button>
        </div>

        {/* Additional Operations */}
        <div className="grid grid-cols-3 gap-2">
          <Button variant="function" onClick={percentage}>%</Button>
          <Button variant="function" onClick={() => scientificOperation('1/x')}>1/x</Button>
          <Button variant="function" onClick={() => scientificOperation('cube')}>x³</Button>
        </div>
      </div>
    </div>
  );
}