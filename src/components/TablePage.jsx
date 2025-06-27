import React, { useEffect, useState } from "react";
import image from "../assets/csv.png";
import Papa from "papaparse";
import PivotTable from '../components/PivotTable'

const TablePage = () => {
  const [data, setData] = useState();
  const [check, setCheck] = useState(true);
  const [selectedOption, setSelectedOption] = useState("");

  //drag and for choose file box
  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setData(file);
      setCheck(false);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setData(file);
      setCheck(false);
    }
  };

  const style = { display: check === true ? "block" : "none" };

  const [tableColumns, setTableColumns] = useState([]);
  const [rows, setRows] = useState([]);

  //csv file read and table generater
  useEffect(() => {
    // console.log(data)

    if (!data) return;
    Papa.parse(data, {
      header: true,
      skipEmptyLine: true,
      complete: function (result) {
        const columnArray = [];
        const valueArray = [];

        result.data.map((d) => {
         
          const keys = Object.keys(d);
          const values = Object.values(d);
        
          if (keys.length === 0 || values.every(value => value === '' || value === null || value === undefined)) {
            return; 
          }
          columnArray.push(keys);
          valueArray.push(values);
        });
        
        
        setTableColumns(columnArray[0]);
        setRows(valueArray);
      },
    });
   
  }, [data]);


  // drag part
  const [droppedItem, setDroppedItem] = useState({
    value: [],
    column: [],
    row: [],
  });

  const dragStart = (e, item) => {
    e.dataTransfer.setData("text/plain", item);
  };

  const handleDragIsOver = (e) => {
    e.preventDefault();
  };

  const handleIsDrop = (e, name) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text");
    const exist = Object.keys(droppedItem).some((arr) =>
      droppedItem[arr].includes(data)
    );
    if (!exist) {
      setDroppedItem((prev) => ({
        ...prev,
        [name]: [...(prev[name] || []), data],
      }));
    }
  };
  const handleDelete = (column, field) => {
    const filtered = droppedItem[field].filter((item) => item !== column);
    setDroppedItem((prev) => ({
      ...prev,
      [field]: filtered,
    }));
  };


  const [tableShow, setTableShow] = useState(false);
  const tableGenerator = () => {
    if (
      droppedItem.value.length > 0 &&
      droppedItem.column.length > 0 &&
      droppedItem.row.length > 0 &&
      selectedOption.length>0
    ) {
      setTableShow((prev) => !prev);
    } else {
      alert("please fill the fields");
    }
  };


  return (
    <div className="flex flex-col place-items-center items-center justify-evenly bg-blue-200 py-2 h-screen box-border relative overflow-y-auto">
      <div
        className="h-[300px] w-[400px] bg-white rounded-lg m-[0px] p-[25px] place-items-center absolute "
        style={style}
      >
        <div className="h-[250px] w-[350px] border-2 border-dotted border-black rounded-lg text-center place-items-center flex flex-col justify-around p-[0px]">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className=" h-[150px] p-[10px] m-[0px]  place-items-center flex flex-col justify-around"
          >
            <img src={image} alt="file image" className="w-[80px] h-[80px]" />
            <h1>Drag your document here to start uploading</h1>
          </div>
          <div className="h-[100px] flex flex-col justify-around">
            <h5 className="m-[0px]">------------- or -------------</h5>
            <input
              type="file"
              className="pl-[90px] m-[0px] file:bg-blue-200 file:border-2 cursor-pointer file:px-1 file:py-1 file:rounded-lg"
              onChange={handleChange}
            ></input>
          </div>
        </div>
      </div>
      {data && (
       <div>
         <div className=" flex mx-2">
          <div>
            <div className="overflow-y-scroll h-[350px] my-5">
              <table className="h-auto w-fit">
                <thead className="bg-blue-500 text-white w-fit">
                  <tr>
                    {tableColumns.map((col, index) => (
                      <th
                        className="px-3 py-2 w-fit border border-black"
                        key={index}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="w-fit text-left">
                  {rows.map((tr, trIndex) => (
                    <tr key={trIndex} className="my-2">
                      {tr.map((td, index) => (
                        <td key={index} className="mx-2 px-3 h-4 border-2">
                          {td}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex">
            <div className="flex flex-col gap-2 my-2 text-center">
              <h2>Columns</h2>
              {tableColumns.map((column, index) => (
                <div
                  key={index}
                  className="border-2 border-blue-500 border-dotted px-2 py-2 w-35 mx-2 bg-white rounded-lg cursor-move text-blue-500"
                  draggable
                  onDragStart={(e) => dragStart(e, column)}
                >
                  {column}
                </div>
              ))}
            </div>
            {data && (
              <div className="flex flex-col gap-1 h-fit justify-evenly items-center mx-2">
                <h3>Row</h3>
                <div
                  className="bg-white w-35 h-35 border-5 border-blue-500 rounded-lg px-2 py-2 text-center text-white border-box"
                  onDragOver={handleDragIsOver}
                  onDrop={(e) => handleIsDrop(e, "row")}
                >
                  {droppedItem.row.map((selectedColumn, index) => (
                    <h2
                      key={index}
                      className="bg-blue-500 my-2 rounded-lg w-fit px-2 py-2 cursor-pointer hover:bg-red-500"
                      onClick={() => handleDelete(selectedColumn, "row")}
                    >
                      {selectedColumn}
                    </h2>
                  ))}
                </div>
                <h2>Column</h2>
                <div
                  className="bg-white w-35 h-35 border-5 border-blue-500 rounded-lg overflow-y-auto px-2 py-2 text-center text-white border-box "
                  onDragOver={handleDragIsOver}
                  onDrop={(e) => handleIsDrop(e, "column")}
                >
                  {droppedItem.column.map((selectedColumn, index) => (
                    <h2
                      key={index}
                      className="bg-blue-500 my-2 rounded-lg w-fit px-2 py-2 cursor-pointer  hover:bg-red-500"
                      onClick={() => handleDelete(selectedColumn, "column")}
                    >
                      {selectedColumn}
                    </h2>
                  ))}
                </div>
             
                <select
                  name="cars"
                  id="cars"
                  className="cursor-pointer"
                  onChange={(e) => setSelectedOption(e.target.value)}
                  required>

                  <option disabled selected>
                    choose the function
                  </option>
                  <option value="sum">sum</option>
                  <option value="count">count</option>
                  <option value="average">average</option>
                  <option value="min">min</option>
                  <option value="max">max</option>
                </select>
                <h2>Value</h2>
                <div
                  className="bg-white w-35 h-35 border-5 border-blue-500 overflow-y-auto rounded-lg px-2 py-2 text-center text-white border-box "
                  onDragOver={handleDragIsOver}
                  onDrop={(e) => handleIsDrop(e, "value")}
                >
                  {droppedItem.value.map((selectedColumn, index) => (
                    <h2
                      key={index}
                      className="bg-blue-500 my-2 rounded-lg w-fit px-2 py-2 cursor-pointer hover:bg-red-500"
                      onClick={() => handleDelete(selectedColumn, "value")}
                    >
                      {selectedColumn}
                    </h2>
                  ))}
                </div>
                <button
                  className="bg-blue-500 text-white w-30 h-10 rounded-lg cursor-pointer"
                  onClick={tableGenerator}
                >
                  Table generate
                </button>
              </div>
            )}
          </div>
        </div>
        {tableShow && (
  <PivotTable
  tableColumns={tableColumns}
  rows={rows}
  droppedItem={droppedItem}
  selectedOption = {selectedOption}
   />
)}
       </div>
        
      )}
    </div>
  );
};

export default TablePage;
