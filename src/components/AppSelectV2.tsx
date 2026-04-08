import Select from "react-select";

type AppSelectV2Props = {

  options: { label: string; value: any }[];
  field: any;
  isMulti?:boolean
};

function AppSelectV2({ field, options, isMulti = false }: AppSelectV2Props) {
  // Find the selected option object from the value
  const selectedValue = isMulti
    ? options?.filter((opt) => field.value?.includes(opt.value))
    : options?.find((opt) => opt.value === field.value) || null;

  return (
    <div className="">
      <Select
        {...field}
        value={selectedValue}
        options={options}
        isMulti={isMulti}
        onChange={(selected: any) => {
          if (isMulti) {
            field.onChange(selected ? selected.map((s: any) => s.value) : []);
          } else {
            field.onChange(selected ? selected.value : null);
          }
        }}
      />
    </div>
  );
}

export default AppSelectV2;
