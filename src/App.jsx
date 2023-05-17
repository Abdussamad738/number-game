import React, { useState,useRef } from 'react';
import { useDrag, useDrop,DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';
const initialMatrix = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16]
];

const EmptyMatrixCell = ({ rowIndex, colIndex, moveItem, value }) => {
  const monitorRef = useRef(null); // Create a ref to store the monitor
  console.log("inside emptymatrixcell",rowIndex,colIndex,value);

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'MATRIX_CELL',
    drop: () => ({ rowIndex, colIndex }),
    collect: (monitor) => {
      monitorRef.current = monitor; // Store the monitor in the ref
      return {
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver()
      };
    },
    hover: () => {
      const item = monitorRef.current.getItem();
      const sourceRowIndex = item.rowIndex;
      const sourceColIndex = item.colIndex;
      const targetRowIndex = rowIndex;
      const targetColIndex = colIndex;
    
      // Ensure dragging within the same matrix
      if (sourceRowIndex === targetRowIndex && sourceColIndex === targetColIndex) return;
    
       // Move the item only when it is dropped (unclicked)
       if (monitorRef.current.didDrop()) return;
    
      moveItem(sourceRowIndex, sourceColIndex, targetRowIndex, targetColIndex);
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

  return (
    <td ref={drop} style={cellStyle}>
      {value !== null && <span>{value}</span>}
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
  const handleDrop = (sourceRowIndex, sourceColIndex, targetRowIndex, targetColIndex) => {
    console.log("handledrop:",sourceRowIndex, sourceColIndex, targetRowIndex, targetColIndex)
    if (emptyMatrix[targetRowIndex][targetColIndex] !== null) {
      console.log("inside handle drop,source and target is :",sourceRowIndex, sourceColIndex,emptyMatrix[targetRowIndex][targetColIndex],targetRowIndex,targetColIndex);
      // If the target cell is not empty, cancel the drop
      return;
    }

    moveItem(sourceRowIndex, sourceColIndex, targetRowIndex, targetColIndex);
  };


  const moveItem = (sourceRowIndex, sourceColIndex, targetRowIndex, targetColIndex) => {
    const updatedMatrix = matrix.map((row) => [...row]);
    const updatedEmptyMatrix = emptyMatrix.map((row) => [...row]);
    const sourceValue = updatedMatrix[sourceRowIndex][sourceColIndex];
    // Remove the number from the source matrix
  updatedMatrix[sourceRowIndex][sourceColIndex] = null;

  // Insert the number into the target matrix
  updatedEmptyMatrix[targetRowIndex][targetColIndex] = sourceValue;
  console.log(sourceValue)

  setMatrix(updatedMatrix);
  setEmptyMatrix(updatedEmptyMatrix);
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
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
                      value={value}
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                      moveItem={handleDrop}
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
