import React, { useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

// CSS Modules, react-datepicker-cssmodules.css
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';

interface AppDatePickerProps {
  field: any;
  selected: any;
}
const AppDatePicker = ({ field, selected }: AppDatePickerProps) => {
  return (
    <div className="w-full">
      <DatePicker
        {...field}
        selected={selected}
        
        className=" rounded border-[1.5px] border-stroke bg-transparent px-2 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
      />
    </div>
  );
};

export default AppDatePicker;
