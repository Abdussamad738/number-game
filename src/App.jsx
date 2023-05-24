import React, { useState,useRef, useEffect, useCallback } from 'react';
import { useDrag, useDrop,DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
// import Confetti from 'react-dom-confetti';
import Confetti from 'react-dom-confetti';
import './App.css';
import { useWindowSize } from "react-use";
import { Modal } from 'bootstrap';
import Particles from "react-tsparticles";

import { loadFull } from "tsparticles";
import particlesOptions from './particlesConfig.js';

const initialMatrix = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16]
];

const EmptyMatrixCell = ({ rowIndex, colIndex, moveItem, value }) => {
  const monitorRef = useRef(null); // Create a ref to store the monitor
  const interactionRef = useRef(false); // Create a ref to track interaction (mouse or touch)

  const handleInteractionStart = () => {
    interactionRef.current = true; // Set the interaction flag to true
  };

  const handleInteractionEnd = () => {
    interactionRef.current = false; // Set the interaction flag to false
  };

  const [{ isDragging }, drag] = useDrag({
    
    type: 'EMPTY_MATRIX_CELL',
    item: { sourceIndices: { rowIndex, colIndex }, isFromEmptyMatrix: true }, // Set isFromEmptyMatrix to true
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
      
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        
        // Handle the case where the item was dropped on a valid target
        const { sourceIndices } = item;
        const { rowIndex: sourceRowIndex, colIndex: sourceColIndex } = sourceIndices;
        const { rowIndex: targetRowIndex, colIndex: targetColIndex } = monitor.getDropResult();
        moveItem(sourceRowIndex, sourceColIndex, targetRowIndex, targetColIndex, true);
      } else {
        // Handle the case where the item was not dropped on a valid target
        const { sourceIndices } = item;
        const { rowIndex: sourceRowIndex, colIndex: sourceColIndex } = sourceIndices;
        moveItem(sourceRowIndex, sourceColIndex, null, null, true);
      }
    }
  });

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: ['MATRIX_CELL', 'EMPTY_MATRIX_CELL'],
    drop: () => ({ rowIndex, colIndex }),
    collect: (monitor) => {
      monitorRef.current = monitor; // Store the monitor in the ref
      return {
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver()
      };
    },
    hover: (_, monitor) => {
      const item = monitor.getItem();
      const sourceRowIndex = item.sourceIndices?.rowIndex; // Update to use optional chaining (?.)
      const sourceColIndex = item.sourceIndices?.colIndex; // Update to use optional chaining (?.)
      const targetRowIndex = rowIndex;
      const targetColIndex = colIndex;
     
    
      // Ensure dragging within the same matrix
      if (sourceRowIndex === targetRowIndex && sourceColIndex === targetColIndex) return;
    
      // Move the item only when it is dropped (interaction ended)
      if (!interactionRef.current || monitor.didDrop()) return;
    
      moveItem(sourceRowIndex, sourceColIndex, targetRowIndex, targetColIndex, item.isFromEmptyMatrix);
    }
  });

  const isActive = canDrop && isOver;
  const isTargetColumn = isOver && monitorRef.current.getItem().colIndex === colIndex; // Access the monitor from the ref
  const cellStyle = {
    backgroundColor: isActive ? 'lightblue' : '#333',
    cursor: 'grab',
    borderTop: isTargetColumn ? '2px solid red' : '',
    height: '25px',
    width: '30px',
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
    padding: '10px',
    margin: '5px',
    fontFamily: 'Arial, sans-serif',
  }; 


 


  return (
    <td
      ref={(node) => {
        drop(node);
        // Attach event listeners to track interaction (mouse or touch)
        node?.addEventListener('mousedown', handleInteractionStart);
        node?.addEventListener('touchstart', handleInteractionStart);
        node?.addEventListener('mouseup', handleInteractionEnd);
        node?.addEventListener('touchend', handleInteractionEnd);
      }}
      style={cellStyle}
    >
      <div ref={drag} >
        {value !== null && <span>{value}</span>}
      </div>
    </td>
  );
};
const MatrixCell = ({ value, rowIndex, colIndex, moveItem }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'MATRIX_CELL',
    item: { value, rowIndex, colIndex, isFromEmptyMatrix: false }, // Set isFromEmptyMatrix to false
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        moveItem(item.rowIndex, item.colIndex, dropResult.rowIndex, dropResult.colIndex);
      }
    }
  });


  const cellStyle = {
    opacity: isDragging ? 0.5 : 1,
    fontWeight: 'normal',
    cursor: 'grab',
    height: '35px',
    width: '35px',
    borderRadius: '8px',
    background: '#333',
    color: '#fff',
    padding: '10px',
    margin: '5px',
    fontFamily: 'Arial, sans-serif',
  };

  return (
    <div ref={drag} style={cellStyle}>
      {value}
    </div>
  );
};

const Matrix = () => {


  const [matrix, setMatrix] = useState(initialMatrix);
  // const [emptyMatrix, setEmptyMatrix] = useState(Array(4).fill(Array(4).fill(null)));

  const [emptyMatrix, setEmptyMatrix] = useState(() => {
    const rows = [];
    for (let i = 0; i < 4; i++) {
      rows.push(Array(4).fill(null));
    }
    return rows;
  });
  // const [isWon, setIsWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const [timer, setTimer] = useState(0);
  const particlesInit = (engine) => {
    loadFull(engine);
  };


  const moveItem = (sourceRowIndex, sourceColIndex, targetRowIndex, targetColIndex, isFromEmptyMatrix) => {
    const updatedMatrix = matrix.map((row) => [...row]);
    const updatedEmptyMatrix = emptyMatrix.map((row) => [...row]);
    const sourceValue = isFromEmptyMatrix ? updatedEmptyMatrix[sourceRowIndex][sourceColIndex] : updatedMatrix[sourceRowIndex][sourceColIndex];
  
    // Remove the number from the source matrix or empty matrix based on isFromEmptyMatrix
    if (isFromEmptyMatrix) {
      updatedEmptyMatrix[sourceRowIndex][sourceColIndex] = null;
    } else {
      
      
      
      updatedMatrix[sourceRowIndex][sourceColIndex] = null;
      if (!timer) {
        const interval = setInterval(() => {
          setTimer((prevTimer) => prevTimer + 1);
        }, 1000);
  
        
      }
    }
  
    if (targetRowIndex !== null && targetColIndex !== null) {
      // Insert the number into the target matrix
      if (isFromEmptyMatrix) {
        updatedEmptyMatrix[targetRowIndex][targetColIndex] = sourceValue ;
      } else {
        updatedEmptyMatrix[targetRowIndex][targetColIndex] = sourceValue;
      }
    }
  
    setMatrix(updatedMatrix);
    setEmptyMatrix(updatedEmptyMatrix);
  };

  const calculateColumnSum = (colIndex) => {
    let sum = 0;
    for (let i = 0; i < 4; i++) {
      sum += emptyMatrix[i][colIndex] || 0;
    }
    return sum;
  };

  const calculateRowSum = (rowIndex) => {
    let sum = 0;
    for (let j = 0; j < 4; j++) {
      sum += emptyMatrix[rowIndex][j] || 0;
    }
    return sum;
  };

  const calculateDiagonalSum = () => {
    let sum = 0;
    for (let i = 0; i < 4; i++) {
      sum += emptyMatrix[i][i] || 0;
    }
    return sum;
  };

  const renderWarning = (sum) => {
    if (sum !==34) {
      return <span className="warning">Sum: {sum}</span>;
    }
    return null;
  };

  const restartPage = () => {
    
    setMatrix(initialMatrix);
    setEmptyMatrix(() => {
      const rows = [];
      for (let i = 0; i < 4; i++) {
        rows.push(Array(4).fill(null));
      }
      return rows;
    });
    setTimer(0);
    window.location.reload();
    // setIsWon(false);
    
  };
  const confettiConfig = {
    angle: 90,
    spread: 45,
    startVelocity: 45,
    elementCount: 50,
    dragFriction: 0.1,
    duration: 3000,
    stagger: 3,
    width: '10px',
    height: '10px',
    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
  };
  
  

// Check if all cells in emptyMatrix are filled
  const isMatrixFilled = emptyMatrix.every((row) => row.every((cell) => cell !== null));
  if (isMatrixFilled) {
    // Calculate the sum of each row, column, and diagonal
    const rowSums = emptyMatrix.map((row) => row.reduce((sum, cell) => sum + (cell || 0), 0));
    const columnSums = Array.from({ length: 4 }, (_, colIndex) =>
      emptyMatrix.reduce((sum, row) => sum + (row[colIndex] || 0), 0)
    );
    const diagonalSum = emptyMatrix.reduce((sum, row, rowIndex) => sum + (row[rowIndex] || 0), 0);

    if (rowSums.every((sum) => sum === 34) && columnSums.every((sum) => sum === 34) && diagonalSum === 34) {
      // All sums are equal to 34, display 'Won' prompt
      // setIsWon(true);
      const elRef = document.getElementById("exampleModal");

      /// Triger modal
      /// Ignore error. We're referencing a library in index.html but the code editor thinks it's missing.
      const myModal = new Modal(elRef, {
        keyboard: false
      });

      /// Show modal.
      
      // setShowConfetti(true);
      

      /// turn of confetti after 5 seconds
      /// TODO: this looks horrible but it works.
      setTimeout(() => setShowConfetti(false), 5000);
      myModal.show(elRef);
      // restartPage();
      
      
    } else {
      // Sums are not equal to 34, display 'Failed' prompt
      alert('Failed!');
      restartPage();
    }
  }

 

  


  

  return (
    <div className="container">
      <p className='title'>Drag the numbers from the first matrix to the second matrix. The goal is to arrange the numbers in such a way that the sum of each row, column, and diagonal in the second matrix should be equal to <span className="number">34</span>.
      </p>
      
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
    <Particles init={particlesInit} options={particlesOptions} />
      <div className="matrix-container">
      
        <div className="matrix">
        
          <table>
            <tbody>
              {matrix.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((value, colIndex) => (
                    <td key={colIndex}>
                      <MatrixCell
                        value={value}
                        rowIndex={rowIndex}
                        colIndex={colIndex}
                        moveItem={moveItem}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="empty-matrix">
          <table>
            <tbody>
            {emptyMatrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((value, colIndex) => (
                  <td key={colIndex}style={{ width:'100px',height: '75px' }}>
                    <EmptyMatrixCell
                      value={value}  // Pass the value from emptyMatrix
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                      moveItem={moveItem}
                      
                    />
                  </td>
                ))}
                <td>{renderWarning(calculateRowSum(rowIndex))}</td>
              </tr>
            ))}
            <tr>
              {Array.from({ length: 4 }).map((_, index) => (
                <td key={index}>{renderWarning(calculateColumnSum(index))}</td>
              ))}
              <td colSpan="4">{renderWarning(calculateDiagonalSum())}</td>
            </tr>
            <tr>
              
            </tr>
            </tbody>
          </table>
        </div>

        <div className="timer">{timer}s</div>

   
        <Confetti {...confettiConfig} active={showConfetti} /> 
        
      
            

            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Congratss🎉🎊</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"onClick={restartPage}></button>
                  </div>
                  {/* <div class="modal-body">
                    ...
                  </div> */}
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"onClick={restartPage}>Close</button>
                    <button type="button" class="btn btn-primary" onClick={restartPage}>I want to try again!</button>
                  </div>
                </div>
              </div>
            </div>


      </div>
    </DndProvider>
    </div>
  );
};

export default Matrix;
