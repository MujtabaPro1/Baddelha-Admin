import Select from "react-select";

type AppSelectV2Props = {

  options: { label: string; value: any }[];
  field: any;
  isMulti?:boolean
};

function AppSelectV2({ field, options, isMulti = false }: AppSelectV2Props) {
  return (
    <div className="">
      <Select {...field} options={options} isMulti={isMulti} />
    </div>
  );
}

export default AppSelectV2;
