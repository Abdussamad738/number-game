import React, { useState,useRef } from 'react';
import { useDrag, useDrop,DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import './App.css';
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
        console.log("from didDrop :",sourceRowIndex,sourceColIndex, targetRowIndex, targetColIndex)
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
      // console.log(item)
    
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
    backgroundColor: isActive ? 'lightblue' : '',
    cursor: 'move',
    borderTop: isTargetColumn ? '2px solid red' : '',
    height: '75px',
    width: '100px'
  }; 

 

  const cellWrapperStyle = {
    opacity: isDragging ? 0.5 : 1,
    display: 'inline-block',
    cursor: 'move'
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
      <div ref={drag} style={cellWrapperStyle}>
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

  // const [{ canDrop, isOver }, drop] = useDrop({
  //   accept: 'MATRIX_CELL',
  //   drop: () => ({ rowIndex, colIndex }),
  //   canDrop: () => false, // Disable dropping in the MatrixCell itself
  //   collect: (monitor) => ({
  //     canDrop: monitor.canDrop(),
  //     isOver: monitor.isOver()
  //   })
  // });

  // const isActive = canDrop && isOver;
  const cellStyle = {
    opacity: isDragging ? 0.5 : 1,
    fontWeight: 'normal',
    cursor: 'move'
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
  // const handleDrop = (sourceRowIndex, sourceColIndex, targetRowIndex, targetColIndex) => {
  //   console.log("within handledrop, and the value in emptymatrix is:",emptyMatrix[targetRowIndex][targetColIndex]);
  //   if (emptyMatrix[targetRowIndex][targetColIndex] !== null) {
  //     // If the target cell is not empty, cancel the drop
      
  //     return;
  //   }
  
  //   moveItem(sourceRowIndex, sourceColIndex, targetRowIndex, targetColIndex);
  // };


  const moveItem = (sourceRowIndex, sourceColIndex, targetRowIndex, targetColIndex, isFromEmptyMatrix) => {
    const updatedMatrix = matrix.map((row) => [...row]);
    const updatedEmptyMatrix = emptyMatrix.map((row) => [...row]);
    const sourceValue = isFromEmptyMatrix ? updatedEmptyMatrix[sourceRowIndex][sourceColIndex] : updatedMatrix[sourceRowIndex][sourceColIndex];
  
    // Remove the number from the source matrix or empty matrix based on isFromEmptyMatrix
    if (isFromEmptyMatrix) {
      console.log("from moveitem :",sourceValue)
      updatedEmptyMatrix[sourceRowIndex][sourceColIndex] = null;
    } else {
      console.log("from moveitem else:",sourceValue)
      
      updatedMatrix[sourceRowIndex][sourceColIndex] = null;
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
  
  return (
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
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
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </DndProvider>
  );
};

export default Matrix;
