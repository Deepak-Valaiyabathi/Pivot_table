

import React, { useEffect, useState } from "react";


const createpivotColumnTree = (rows, tableColumns, pivotColumns, pivotValue) => {
  const colIndex = pivotColumns.map(col => tableColumns.indexOf(col));
  const tree = {};

  for (let row of rows) {
    let node = tree;

    for (let i = 0; i < colIndex.length; i++) {
      const key = row[colIndex[i]];
      if (key === undefined || key === null || key === '') continue;

      if (!node[key]) node[key] = {};
      node = node[key];
    }


    for (let i = 0; i < pivotValue.length; i++) {
      const key = pivotValue[i];
      if (!node[key]) {
        node[key] = {};
      }
    }
  }
  return tree;
};


const getColSpan = (node) => {
  if (Object.keys(node).length === 0) return 1;
  return Object.values(node).reduce((sum, child) => sum + getColSpan(child), 0);
};

const createHeaderRows = (tree, level = 0, columnLength, rows = []) => {
  if (!rows[level]) rows[level] = [];

  for (let key in tree) {
    const colSpan = getColSpan(tree[key]);
    rows[level].push({ label: key, colSpan });

    createHeaderRows(tree[key], level + 1, columnLength, rows);
  }


  while (rows.length < columnLength) rows.push([]);

  return rows;
};

const PivotTable = ({ tableColumns, rows, droppedItem, selectedOption }) => {
  const pivotColumnTree = createpivotColumnTree(rows, tableColumns, droppedItem.column, droppedItem.value);
  const [rowKeys, setRowKeys] = useState([]);
  const [colKeys, setColKeys] = useState([]);
  const [pivotData, setPivotData] = useState({});
  const [aggricate, setAggricate] = useState({})


  const valueFields = droppedItem.value.filter(name =>
    tableColumns.includes(name)
  );
  
  const aggricateFunction = (values)=>{
    if(selectedOption === "sum"){
      let result = 0;
      values.map((d)=>{
        result+=d;
      })
      return result;
    }
    else if(selectedOption === "average"){
      let count = values.length;
      let result = 0;
      values.map((d)=>{
        result+=d;
      })
      return result/count;
    }
    else if(selectedOption === "min"){
      let minValue = Math.min(...values);
      return minValue
    }
    else if(selectedOption === "max"){
      let maxValue = Math.max(...values);
      return maxValue;
    }
    else if(selectedOption === "count"){
      return values.length;
    }
  }
 
  useEffect(() => {
    if (!droppedItem || !rows?.length || !tableColumns?.length) return;
  
    const rowIndex = droppedItem.row
      .map(name => tableColumns.indexOf(name))
      .filter(i => i !== -1);
  
    const colIndex = droppedItem.column
      .map(name => tableColumns.indexOf(name))
      .filter(i => i !== -1);
  
    
    const valueIndex = valueFields.map(name => tableColumns.indexOf(name));
  
    if (!rowIndex.length || !colIndex.length || !valueIndex.length) {
      console.warn("Invalid droppedItem config.");
      return;
    }
  
    const tempPivotData = {};
    const rowKeysSet = new Set();
    const colKeysSet = new Set();
  
    rows.forEach(row => {
      const rowKeyParts = rowIndex.map(i => row[i] ?? 'N/A');
      const colKeyParts = colIndex.map(i => row[i] ?? 'N/A');
  
      const rowKey = rowKeyParts.join('|');
      const colKey = colKeyParts.join('|');
  
      rowKeysSet.add(rowKey);
      colKeysSet.add(colKey);
  
      valueIndex.forEach((valIdx, i) => {
        const valueName = valueFields[i]; 
        const cellKey = `${rowKey}|${colKey}|${valueName}`;
  
        const raw = row[valIdx];
        const numeric = parseFloat(raw);
        if (!isNaN(numeric)) {
          tempPivotData[cellKey] = (tempPivotData[cellKey] || 0) + numeric;
        }
      });
    });


    const finalResult = {}; 

    const getFilteredValues = (startingString, field) => {
      const values = [];
    
      for (const key in tempPivotData) {
        if (tempPivotData.hasOwnProperty(key)) {
          if (key.startsWith(startingString) && key.includes(field)) {
            values.push(tempPivotData[key]);
          }
        }
      }
    
      const result = aggricateFunction(values); 
    
      return { [`${startingString}|${field}`]: result }; 
    };
    
  
    [...rowKeysSet].forEach((region) => {
      droppedItem.value.forEach((field) => {
        const obj = getFilteredValues(region, field);
        Object.assign(finalResult, obj); 
      });
    });
    
  
    setAggricate(finalResult);

    setRowKeys([...rowKeysSet]);
    setColKeys([...colKeysSet]);
    setPivotData(tempPivotData);
    
  }, [droppedItem, rows, tableColumns, selectedOption]);
  

  return (
<div className="overflow-x-scroll w-[95vw]">
<table className="w-fit h-fit m-5">
   <thead className="bg-blue-500 text-white w-fit">
   {createHeaderRows(pivotColumnTree, 0, droppedItem.column.length).map((row, rowIndex, allRows) => (
  <tr key={rowIndex}>
  {console.log(rowIndex)}
    {rowIndex === 0 && (
      <>
        {droppedItem.row.map((rowItem, i) => (
          <th
            key={`row-header-${i}`}
            rowSpan={allRows.length}
            className="px-1 py-1 w-fit border border-black"
          >
            {rowItem}
          </th>
        ))}
      </>
    )}


    {row.map((item, colIndex) => (
      <th
        key={`col-header-${rowIndex}-${colIndex}`}
        colSpan={item.colSpan}
        className="px-1 py-1 w-fit border border-black"
      >
        {item.label}
      </th>
    ))}


    {rowIndex === 0 &&
      droppedItem.value.map((valField, idx) => (
        <th
          key={`aggr-header-${idx}`}
          rowSpan={allRows.length}
          className="px-1 py-1 w-fit border border-black"
        >
          {`${valField} ${selectedOption}`}
        </th>
      ))}
  </tr>
))}

</thead>

<tbody>
  {rowKeys.map((rowKey, i) => {
    const rowParts = rowKey.split('|');

    return (
      <tr key={`row-${i}`}>

        {rowParts.map((part, j) => (
          <td key={`rowpart-${i}-${j}`} className="px-1 py-1 w-fit border border-black">
            {part}
          </td>
        ))}


        {colKeys.map((colKey, colIdx) =>
          valueFields.map((valField, valIdx) => {
            const cellKey = `${rowKey}|${colKey}|${valField}`;
            const value = pivotData[cellKey] ?? 0;
            return (
              <td
                key={`cell-${i}-${colIdx}-${valIdx}`}
                className="px-1 py-1 w-fit border border-black"
              >
                {value.toFixed(2)}
              </td>
            );
          })
        )}


        {valueFields.map((valField, vIdx) => {
          const aggrKey = `${rowKey}|${valField}`;
          const aggrValue = aggricate[aggrKey] ?? 0;
          return (
            <td
              key={`aggr-${i}-${vIdx}`}
              className="px-1 py-1 w-fit border border-black"
            >
              {aggrValue.toFixed(2)}
            </td>
          );
        })}
      </tr>
    );
  })}
</tbody>
   </table>
</div>
  );
};

export default PivotTable;
