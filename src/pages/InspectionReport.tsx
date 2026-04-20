import { Controller, FormProvider, useForm } from "react-hook-form";

import AppSelectV2 from "../components/AppSelectV2";
import AppDatePicker from "../components/AppDatePicker";
import {ChangeEvent, useEffect, useState} from "react";
import { toast } from "react-toastify";
import { saveInspection, getInspectionSchema } from "../service/inspection";
import { createMedia } from "../service/media";
import { dataURLToBlob } from "../types/dataUrlToBlob";
import { MinusCircle, Check, ChevronRight, ChevronLeft, Plus } from "lucide-react";
import axiosInstance from "../service/api";
import { useNavigate, useParams } from "react-router-dom";
import { axiosErrorHandler } from "../types/utils";
import PageHeader from "../components/PageHeader";
import CarImage from "../images/img.png";
import CarBodySvg from "../components/CarBody";
import CarPartModal from "../components/CarPartModal";
import FieldDetailsModal from "../components/FieldDetailsModal";

import useStateRef from 'react-usestateref'


const InspectionForm = () => {
  // Initialize the form state and action

  let mode = 'create';
  const [loading, setLoading] = useState(false);
  const [submitState, setSubmitState] = useState("");
  const [httpError, setHttpError] = useState(null);
  const [mediaFiles, setMediaFiles] = useState<any>({});
  const navigate = useNavigate();
  const [initialData, setInitialData]: any = useState<any>(null);
  const params = useParams();
  const [images, setImages] = useState<any>([]);
  const [error,setError] = useState(false);
  
  // Stepper state
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track if form is being submitted
  
  // Timer state - 30 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const [timerActive, setTimerActive] = useState(false);

  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // Initialize all car parts with "original" condition
  const [partConditions, setPartConditions] = useState<Record<string, string>>({});
  
  // State for field details modal
  const [isFieldDetailsModalOpen, setIsFieldDetailsModalOpen] = useState<boolean>(false);
  const [selectedField, setSelectedField] = useState<string>('');
  const [fieldExtraData, setFieldExtraData,fieldExtraDataRef] = useStateRef<Record<string, { comment: string; image: string | null }>>({});



  const lights = [
  {
    name: "Check Engine",
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 16H12.01M12 11V13M14 8V5M11 5H17M6 12H3M3 9V15M21 11V19M6 8V16H8L10 19H18V10L16 8H6Z" stroke="#888780" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`
  },
  {
    name: "ABS",
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="13" stroke="#888780" stroke-width="1.5"/>
      <text x="20" y="25" text-anchor="middle" font-size="11" font-weight="600" font-family="sans-serif" fill="#888780">ABS</text>
    </svg>`
  },
  {
    name: "Airbag",
    svg: `<svg fill="#888780" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.003 512.003" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path d="M256.006,128c0-70.579-57.421-128-128-128s-128,57.421-128,128s57.421,128,128,128S256.006,198.579,256.006,128z"></path> <path d="M384.001,119.467c28.237,0,51.2-22.963,51.2-51.2s-22.963-51.2-51.2-51.2c-28.237,0-51.2,22.963-51.2,51.2 S355.765,119.467,384.001,119.467z M384.001,34.133c18.825,0,34.133,15.309,34.133,34.133S402.826,102.4,384.001,102.4 c-18.825,0-34.133-15.309-34.133-34.133S365.177,34.133,384.001,34.133z"></path> <path d="M509.394,105.5c1.664-1.613,2.603-3.823,2.603-6.135l-0.008-48.162c0-3.447-2.074-6.554-5.257-7.885 c-3.157-1.306-6.827-0.597-9.293,1.826L388.878,152.877c-7.902-10.453-18.884-18.022-31.77-21.572 c-31.13-8.542-63.215,8.832-73.011,39.62l-32.973,103.723l-6.153-6.153c-3.2-3.2-8.866-3.2-12.066,0l-24.132,24.141 c-3.337,3.328-3.337,8.73,0,12.066l9.404,9.404l-81.067-10.129c-12.561-1.596-24.619,6.477-27.955,18.722L69.51,468.064 c-2.586,9.472-1.033,19.644,4.267,27.913c5.291,8.26,13.884,13.935,23.569,15.548c1.894,0.316,3.789,0.469,5.666,0.469 c14.95,0,28.672-9.754,33.254-24.405l31.428-100.582c1.263-4.036,5.325-6.596,9.566-5.939L305.371,401.3l108.203,108.203 c1.596,1.596,3.772,2.5,6.033,2.5s4.429-0.905,6.033-2.5l24.132-24.141c3.337-3.337,3.337-8.73,0-12.066L347.713,371.237 l48.111-155.93L509.394,105.5z M179.914,364.214c-12.467-1.971-24.738,5.632-28.51,17.707l-31.428,100.582 c-2.628,8.397-11.187,13.628-19.823,12.186c-5.009-0.828-9.267-3.644-12.006-7.919c-2.739-4.267-3.507-9.318-2.176-14.217 l39.646-145.365c1.024-3.763,4.497-6.349,8.32-6.349c0.35,0,0.708,0.026,1.058,0.068l102.844,12.851l47.01,47.019 L179.914,364.214z M383.801,193.598c-0.29,2.722-0.819,5.436-1.647,8.115l-1.997,6.468L334.06,357.583l-69.35-69.35 l35.661-112.137c7.006-22.016,29.961-34.466,52.207-28.331c11.281,3.106,20.582,10.462,26.206,20.719 c0.683,1.246,1.101,2.586,1.656,3.874c0.717,1.698,1.451,3.388,1.946,5.146c0.239,0.836,0.341,1.707,0.529,2.56 c0.393,1.809,0.802,3.61,0.956,5.444c0.094,1.109,0,2.227,0,3.345C383.886,190.432,383.971,192.02,383.801,193.598z"></path> </g> </g> </g> </g></svg>`
  },
  {
    name: "Seatbelt",
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="10" r="4" stroke="#888780" stroke-width="1.5"/>
      <path d="M20 14v8" stroke="#888780" stroke-width="2" stroke-linecap="round"/>
      <path d="M14 18h12" stroke="#888780" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 22l-5 9h10l-5-9z" stroke="#888780" stroke-width="1.5"/>
      <path d="M20 22l6 5" stroke="#888780" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    name: "Oil Lamp",
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 30h14v-3H13v3z" stroke="#888780" stroke-width="1.5" fill="#888780"/>
      <path d="M16 27V20h8v7" stroke="#888780" stroke-width="1.5"/>
      <path d="M20 20v-5" stroke="#888780" stroke-width="1.5"/>
      <path d="M20 15c0 0-3-2-3-5h6c0 3-3 5-3 5z" stroke="#888780" stroke-width="1.5" fill="#888780"/>
      <path d="M27 23h2a2 2 0 0 1 0 4h-2" stroke="#888780" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    name: "Battery",
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="15" width="24" height="14" rx="2" stroke="#888780" stroke-width="1.5"/>
      <path d="M15 15v-3M25 15v-3" stroke="#888780" stroke-width="2" stroke-linecap="round"/>
      <path d="M14 22h4l-2 4h4l-2-4h4" stroke="#888780" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    name: "Brake Light",
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="8" stroke="#888780" stroke-width="1.5"/>
      <circle cx="20" cy="20" r="4" fill="#888780"/>
      <path d="M20 9v3M20 28v3M9 20h3M28 20h3" stroke="#888780" stroke-width="1.5" stroke-linecap="round"/>
      <text x="20" y="38" text-anchor="middle" font-size="8" fill="#888780" font-family="sans-serif">BRAKE</text>
    </svg>`
  },
  {
    name: "Coolant Temp",
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 10v14" stroke="#888780" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="20" cy="27" r="4" stroke="#888780" stroke-width="1.5" fill="#888780"/>
      <path d="M15 10h10M14 14h2M24 14h2M13 18h2M25 18h2" stroke="#888780" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M10 32 Q15 28 20 32 Q25 36 30 32" stroke="#888780" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    name: "Steering",
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="12" stroke="#888780" stroke-width="1.5"/>
      <circle cx="20" cy="20" r="3" fill="#888780"/>
      <path d="M20 8v9M20 23v9" stroke="#888780" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M8 20h9M23 20h9" stroke="#888780" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M11.5 11.5l6.5 6.5M22 22l6.5 6.5M11.5 28.5l6.5-6.5M22 18l6.5-6.5" stroke="#888780" stroke-width="1" stroke-linecap="round"/>
    </svg>`
  },
  {
    name: "Tire Pressure",
    svg: `<svg fill="#888780" viewBox="0 0 14 14" role="img" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="m 3.4767038,12.31335 c -0.67992,-0.039 -0.728272,-0.052 -0.803235,-0.2249 -0.02231,-0.051 -0.135858,-0.4012 -0.252334,-0.7775 l -0.211775,-0.6841 -0.212772,-0.3186 c -0.230041,-0.3444997 -0.496677,-0.8688997 -0.64244,-1.2635997 -0.11163,-0.3023 -0.244281,-0.8284 -0.297156,-1.1785 -0.0636,-0.4212 -0.07604,-1.0756 -0.02686,-1.4135 0.140864,-0.968 0.499903,-1.8707 1.055412,-2.6534 0.302845,-0.4267 0.326411,-0.5024 0.396083,-1.2724 0.05342,-0.5904 0.06811,-0.6492 0.191274,-0.7657 0.114098,-0.108 0.179796,-0.1194 0.685781,-0.1193 0.452647,10e-5 0.480334,0 0.570086,0.057 0.178091,0.1079 0.190546,0.1487 0.190317,0.6246 -2.48e-4,0.4828 -0.02917,0.6465 -0.160476,0.9082 -0.04726,0.094 -0.384248,0.5756 -0.748854,1.0698 -0.364605,0.4943 -0.693144,0.9544 -0.730085,1.0226 -0.158309,0.2923 -0.290046,0.9369 -0.31166,1.5251 -0.04482,1.2197 0.395902,2.428 1.225599,3.3601997 0.121399,0.1364 0.277376,0.2954 0.346616,0.3534 l 0.125891,0.1054 3.14259,0 3.1425952,0 0.19894,-0.1922 c 1.03673,-1.0014997 1.5719,-2.3744997 1.47926,-3.7949997 -0.0355,-0.5439 -0.18846,-1.1817 -0.34102,-1.4216 -0.04,-0.063 -0.35145,-0.4926 -0.69212,-0.9548 -0.71294,-0.9672 -0.74723,-1.0198 -0.8402902,-1.2867 -0.066,-0.1892 -0.0692,-0.2198 -0.07,-0.6614 -8.3e-4,-0.4297 0.003,-0.468 0.0503,-0.5317 0.1226802,-0.1646 0.1430202,-0.1701 0.6635502,-0.1788 0.5125,-0.01 0.61122,0.01 0.73312,0.1085 0.11207,0.094 0.14543,0.2278 0.18874,0.755 0.0635,0.7731 0.0874,0.8461 0.44864,1.3696 0.50672,0.7345 0.82577,1.521 0.97695,2.4084 0.0924,0.5426 0.061,1.3562 -0.0773,1.999 -0.14263,0.6632 -0.48435,1.4619 -0.87268,2.0397997 l -0.20641,0.3071 -0.22065,0.7143 c -0.12136,0.3928 -0.23999,0.746 -0.26363,0.7849 -0.076,0.1249 -0.1444,0.1418 -0.69146,0.1706 -0.27875,0.015 -0.58772,0.033 -0.6866102,0.041 l -0.17978,0.014 0,-0.3121 0,-0.3121 -0.21079,0 -0.21078,0 0,0.2975 0,0.2976 -0.63236,0 -0.63236,0 0,-0.2976 0,-0.2975 -0.21078,0 -0.210789,0 0,0.2975 0,0.2976 -0.632356,0 -0.632357,0 0,-0.2976 0,-0.2975 -0.210785,0 -0.210786,0 0,0.2975 0,0.2976 -0.632356,0 -0.632356,0 0,-0.2976 0,-0.2975 -0.210786,0 -0.210785,0 0,0.3099 0,0.31 -0.09299,0 c -0.05115,0 -0.365566,-0.019 -0.698708,-0.038 z m 3.229728,-2.3095 c -0.254728,-0.091 -0.445305,-0.2668997 -0.558284,-0.5153997 -0.0447,-0.098 -0.05563,-0.1677 -0.05627,-0.3576 -6.61e-4,-0.2047 0.0079,-0.2542 0.06566,-0.3774 0.08782,-0.1873 0.258312,-0.3657 0.435021,-0.4551 0.131221,-0.066 0.165179,-0.072 0.403656,-0.073 0.230463,-10e-5 0.276613,0.01 0.401645,0.066 0.173158,0.081 0.341556,0.2453 0.432261,0.4214 0.0568,0.1102 0.0699,0.1717 0.0782,0.3679 0.008,0.1979 10e-4,0.2586 -0.044,0.3791 -0.07581,0.2012 -0.275084,0.4111 -0.476799,0.502 -0.204625,0.092 -0.490129,0.1096997 -0.681153,0.041 z m -0.05102,-2.4120997 c -0.185841,-0.073 -0.384573,-0.2646 -0.483142,-0.4648 l -0.08119,-0.1649 0,-2.0712 0,-2.0712 0.07823,-0.1651 c 0.191331,-0.4038 0.628706,-0.6143 1.051461,-0.506 0.274673,0.07 0.474835,0.2312 0.61244,0.4923 l 0.0681,0.1292 0,2.1203 0,2.1203 -0.0697,0.1323 c -0.08938,0.1697 -0.250094,0.3299 -0.417883,0.4165 -0.113784,0.059 -0.167165,0.069 -0.380344,0.076 -0.204741,0.01 -0.270655,-10e-4 -0.378001,-0.044 z"></path></g></svg>`
  },
  {
    name: "Traction Control",
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 30 Q14 22 20 20 Q26 18 28 10" stroke="#888780" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M25 10l3 0 0 3" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 28h6M24 28h6" stroke="#888780" stroke-width="3" stroke-linecap="round"/>
      <circle cx="13" cy="30" r="3" stroke="#888780" stroke-width="1.5"/>
      <circle cx="27" cy="30" r="3" stroke="#888780" stroke-width="1.5"/>
    </svg>`
  }
];
 

  // List of all car parts from CarBodySvg
  const carParts = [
    'c_n_wing_rear_left',
    'c_n_door_front_left',
    'c_n_door_rear_left',
    'c_n_wing_front_left',
    'c_n_boot',
    'c_n_windscreen',
    'c_n_rear_screen',
    'c_n_bumper_front',
    'c_n_bumber_rear',
    'c_n_bonnet',
    'c_n_roof',
    'c_n_front_left_window',
    'c_n_wing_rear_right',
    'c_n_door_front_right',
    'c_n_door_rear_right',
    'c_n_wing_front_right',
    'c_n_front_right_window',
    'c_n_rear_left_window',
    'c_n_rear_right_window',
    'c_sunroof_moonroof'
  ];

 

  const [defaultValues, setDefaultValues] = useState<any>({});
  const methods = useForm({
    defaultValues
  });
  
  const {
    register,
    handleSubmit,
    watch,
    control,
    getValues,
    reset,
    formState: { errors },
  } = methods;

  const watchFieldsWarranty = watch(["Warranty_Plan"])
  const watchFieldsService = watch(["Service_Plan"])






  useEffect(()=>{
     getInspectionData();
     
     // Initialize all car parts with "original" condition
     const initialPartConditions: Record<string, string> = {};
     carParts.forEach(part => {
       initialPartConditions[part] = 'original';
     });
     setPartConditions(initialPartConditions);


  },[]);
  
  // Update form values when defaultValues change
  useEffect(() => {
    if (Object.keys(defaultValues).length > 0) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);
  
  // Set up steps based on initialData
  useEffect(() => {
    if (initialData) {
      // Extract section names for steps
      const sectionNames = initialData.map((section: any) => section.name);
      setSteps(sectionNames);
      
      // Start the timer when data is loaded
      setTimerActive(true);
    }
  }, [initialData]);
  
  // Countdown timer effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (timerActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Optional: Handle timer expiration
      toast.warning("Time limit reached for inspection form");
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [timerActive, timeRemaining]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getInspectionData = async () => {
    try {
      const inspection = await getInspectionSchema(params.id);

       if(!inspection || inspection?.error) {
        setError(true);
        return;
      }


      let formValues = {};
       console.log("inspection", inspection);
      inspection?.map((item:any)=>{
        console.log("item.name", item.name);
        if(item.name !== 'Car Media' && item.name !== 'Document Images' && item.name != 'Car Body Condition') {
          console.log("item", item);
          let val = item['fields'].reduce((acc: any, field: any) => {
            let fieldValue = field.value;
            // Pre-select first option for Drop Down fields if no value exists
            console.log(field.fieldType);
            const isDropDown = field.fieldType === 'Drop Down';
            const hasNoValue = fieldValue === null || fieldValue === undefined || fieldValue == '';
            const hasOptions = field.options?.length > 0;
            
            console.log('fieldName',field.fieldName);
            
            if(field.fieldName === 'Airbag Deployed' || field.fieldName === 'Chassis') {
              console.log('Skipping',field.fieldName);
              return acc;
            }
            
            if (isDropDown && hasNoValue && hasOptions) {
              fieldValue = field.options[0];
              console.log(`Setting default for ${field.fieldName} to: ${fieldValue}`);
            }
            return {
              ...acc,
              [field.fieldName.replace(/\s/g, "_")]: fieldValue,
            };
          }, {});
          formValues = {
            ...formValues,
            ...val,
          };
    
        }
      })

     
      console.log("inspection---",inspection);
      console.log("formValues with defaults---", formValues);
      setDefaultValues(formValues);
      setInitialData(inspection);
    } catch (ex: any) {
      console.error(ex);
      setError(true);
      return axiosErrorHandler(ex);
    }
  }



  const onSubmit = handleSubmit(async (data) => {
    // Only proceed if this is an actual submission (not just step navigation)
    if (!isSubmitting) {
      return;
    }

    let result = {};

    initialData?.inspection?.map((i:any)=>{
         result['General Information']  = {
           problem: 0,
           non_problem: 14,
         }
         if(i.name != 'General Information' && i.name != 'Document Images' && i.name != 'Car Media') {
           result[i.name] = {
              problem: 0,
              non_problem: 0,
           }
           i.fields.map((ins) => {
                 Object.keys(data).map((d)=>{
                    if(ins.fieldName == d.split("_").join(" ")){
                         if(i.name == 'Car Body'){
                           if(data[d]?.['label'] == 'Good' || data[d]?.label == 'No' || data[d]?.label == 'Okay' ||  data[d]?.label == 'Original Paint'){
                             result[i.name]['non_problem'] += 1;
                           }else{
                             result[i.name]['problem'] += 1;
                           }
                         }else{
                           if(ins.fieldName == 'Floor Mat'){
                             if(data[d]?.['label'] == 'Yes'){
                               result[i.name]['non_problem'] += 1;
                             }
                             if(data[d]?.['label'] == 'No'){
                               result[i.name]['problem'] += 1;
                             }
                           }
                           else if(ins.fieldName == 'Tire Matching'){
                             if(data[d]?.['label'] == 'Yes'){
                               result[i.name]['non_problem'] += 1;
                             }
                             if(data[d]?.['label'] == 'No'){
                               result[i.name]['problem'] += 1;
                             }
                           }
                           else {
                             if (data[d]?.['label'] == 'Okay' || data[d]?.['label'] == 'Available' || data[d]?.['label'] == 'No' || data[d]?.['label'] == 'Original Paint') {
                               result[i.name]['non_problem'] += 1;
                             } else {
                               result[i.name]['problem'] += 1;
                             }
                           }
                         }

                    }
                 })
           })
         }
    })
    data['overview'] = result;
    // Add extra data for Car Body fields
    data['extraData'] = fieldExtraDataRef?.current;
 
    const inspectionId = params.id;
    const body = {
      buyingPrice: "",
      inspectionStatus: "",
      inspection: JSON.stringify(data),
      carbody: JSON.stringify(partConditions),
    };

    setLoading(true);

    setSubmitState("Uploading Regular Images");
    // Upload document images
    await uploadImages();

    // Create a temporary object to store updated extra data with URLs
    const updatedExtraData = {...fieldExtraDataRef.current};
    let hasExtraImages = false;

    // Check if there are any extra data images to upload
    for (let field in fieldExtraDataRef.current) {
      if (fieldExtraDataRef.current[field]?.image && fieldExtraDataRef.current[field].image?.startsWith('data:')) {
        hasExtraImages = true;
        break;
      }
    }

    // Only process if there are extra images to upload
    if (hasExtraImages) {
      setSubmitState("Uploading Extra Data Images");
      
      // Process each field with extra data images
      for (let field in fieldExtraDataRef.current) {
        const extraData = fieldExtraDataRef.current[field];
        
        // Skip if there's no image or if it's already a URL (not base64)
        if (!extraData.image || !extraData.image.startsWith('data:')) {
          continue;
        }
        
        // Convert data URL to blob and then to File
        const blob = dataURLToBlob(extraData.image);
        // Create a File object from the Blob
        const file = new File([blob], `${field}_extra.jpg`, { type: blob.type });
        
        setSubmitState(`Uploading Extra Image for ${field}`);
        
        const data = {
          imageableId: params.id,
          imageableType: "Inspection",
          fileCaption: field + "_extra",
        };
        
        try {
          const mediaResp = await createMedia(file, data);
          console.log(mediaResp);
          if (mediaResp.error) {
            toast.error(`Extra image upload error for ${field}`);
          } else if (mediaResp.signedUrl) {
            // Update our temporary object with the URL
            updatedExtraData[field] = {
              ...updatedExtraData[field],
              image: mediaResp.signedUrl
            };
            
            // Also update the state for UI consistency
            setFieldExtraData(prev => ({
              ...prev,
              [field]: {
                ...prev[field],
                image: mediaResp.signedUrl
              }
            }));
          }
        } catch (error) {
          console.error(`Error uploading image for ${field}:`, error);
          toast.error(`Failed to upload image for ${field}`);
        }
      }
    }

    // Now use the updated extra data with all URLs (not base64) for the submission
    body.inspection = JSON.stringify({
      ...data,
      extraData: updatedExtraData // Use the locally updated object with all URLs
    });


    setSubmitState("Saving Inspection");
    console.log("Final extra data being submitted:", updatedExtraData);
    const response = await saveInspection(inspectionId, body);

    if (!response.error) {
      toast.success("Inspection Saved Successfully");
      navigate("/dashboard/inspections");
    } else {
      //redirect
      setHttpError(response.error);
      toast.error("Inspection failed to save");
    }

    setLoading(false);
    setIsSubmitting(false);
    setSubmitState("Inspection Saved");
  });

  const uploadImages = async () => {
    // Upload regular media files

    for (let field in mediaFiles) {
      let file = mediaFiles[field];

      if (!file.selectedImage) {
        continue;
      }

      const blob = dataURLToBlob(file.selectedImage);
      // Create a File object from the Blob
      file = new File([blob], `${field}.jpg`, { type: blob.type });

      setSubmitState("Uploading Image " + field);

      const data = {
        imageableId: params.id,
        imageableType: "Inspection",
        fileCaption: field,
      };

      let mediaResp = await createMedia(file, data);
      if (mediaResp.error) {
        toast.error("Image upload error");
      }
    }
    
    // Upload extra data images and update fieldExtraData with URLs
 
  };

  const handleImageChange = (field: string, event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]; // Get the selected file
    if (selectedFile) {
      const reader = new FileReader(); // Create a FileReader object
      reader.onload = () => {
        setMediaFiles((old: any) => {
          return { ...old, [field]: { selectedImage: reader.result } };
        }); // Set the selected image to the reader result
      };
      reader.readAsDataURL(selectedFile); // Read the selected file as a Data URL
    }
  };

  const handleImageRemove = (field: string) => {
    setMediaFiles((old: any) => {
      return { ...old, [field]: null };
    }); // Set the selected image to the reader result
  };

  const handleImageRemoveMedia = (field: any) => {
    if(confirm('Are you sure you want to delete?')) {
      axiosInstance.get('/1.0/media/delete/' + field.id).then((res) => {
                    window.location.reload();
      }).catch((err) => {
        alert(err);
      })
    }
  }



    if(error){
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg 
                  className="h-8 w-8 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Unable to Retrieve Inspection Details
              </h2>
              <p className="text-gray-600 mb-6">
                Something went wrong while loading the inspection information. 
                Please contact your administrator for assistance.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/inspector-inspections')}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Inspections
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If this problem persists, please contact support
              </p>
            </div>
          </div>
        </div>
      );
    }
    

    const renderIcon = (fieldName: string) => {
      // Map field names to icon names (handle variations)
      const nameMap: Record<string, string> = {
        'Battery Lamp': 'Battery',
        'Coolant Temperature': 'Coolant Temp',
        'Steering Light': 'Steering',
        'Tire Pressure Light': 'Tire Pressure',
        'Traction Control Light': 'Traction Control'
      };
      const iconName = nameMap[fieldName] || fieldName;
      const icon = lights.find((light) => light.name === iconName);
      // Return placeholder if no icon found
      if (!icon?.svg) {
        return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="15" stroke="#888780" stroke-width="1.5" fill="none"/>
          <text x="20" y="25" text-anchor="middle" font-size="8" fill="#888780" font-family="sans-serif">?</text>
        </svg>`;
      }
      return icon.svg;
    };


  return (

  <div>
      <PageHeader 
        title="Inspection Report" 
        description=""
      />
      
      {/* Countdown Timer */}
      <div className="mb-4 flex items-center justify-end">
        <div className="flex items-center bg-blue-900 bg-opacity-10 px-4 py-2 rounded-lg shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-900 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-gray-800">
            Time Remaining: <span className={`${timeRemaining < 300 ? 'text-red-600 font-bold' : 'text-blue-900'}`}>{formatTime(timeRemaining)}</span>
          </span>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
      <div className="flex justify-between">
        <h3 className="font-medium text-black">{mode == "edit" ? "Update" : "Create"} an Inspection</h3>

        <div>
          <p className="text-red">(Labels marked- * -are required)</p>
        </div>
      </div>
      
      {/* Stepper UI */}
      {steps.length > 0 && (
        <div className="my-8">
         
          
          {/* Progress indicator - Colorful bars */}
          <div className="mt-6 space-y-4">
            {/* All steps progress bar */}
            <p>Showing Step {currentStep + 1} of {steps.length}</p>
            <div className="relative w-full h-6 bg-gray-200 rounded-md overflow-hidden">
            
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-900 to-blue-800" 
                style={{ 
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                  transition: 'width 0.3s ease-in-out'
                }}
              />
            </div>
            
        
          </div>
        </div>
      )}
      
      {httpError && (
        <div className="p-4 mb-4 rounded-md bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="text-sm text-red-700">
                {typeof httpError === 'object' ? JSON.stringify(httpError) : httpError}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit}>
        {initialData && initialData?.map((i: any, index: number) => {
          // Only render the current step
          if (index !== currentStep) return null;

          if(i.name == 'Car Body Condition'){
            return (
              <div className="w-full p-4 rounded-md bg-[#F6F9FC] font-bold mt-2 mb-2 text-[#000] flex w-full justify-center items-center">
                <CarBodySvg
                  selectedPart={selectedPart}
                  hoveredPart={hoveredPart}
                  onSelectPart={(partName: string) => {
                    setSelectedPart(partName);
                    setIsModalOpen(true);
                  }}
                  onHoverPart={(partName: string | null) => {
                    setHoveredPart(partName);
                  }}
                />
                
                {/* Display selected parts and their conditions */}
                {Object.keys(partConditions).length > 0 && (
                  <div className="mt-4 p-3 border border-gray-200 rounded-md">
                    <h3 className="font-bold mb-2">Selected Parts Condition</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(partConditions).map(([part, condition]) => {
                        const formattedPart = part
                          .replace('c_n_', '')
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ');
                          
                        let conditionColor = '';
                        switch(condition) {
                          case 'original': conditionColor = '#4CAF50'; break;
                          case 'painted': conditionColor = '#2196F3'; break;
                          case 'repainted': conditionColor = '#FFC107'; break;
                          case 'damaged': conditionColor = '#F44336'; break;
                        }
                        
                        return (
                          <div 
                            key={part} 
                            className="flex items-center p-2 rounded-md" 
                            style={{ backgroundColor: `${conditionColor}20`, borderLeft: `3px solid ${conditionColor}` }}
                          >
                            <div className="flex-1">{formattedPart}</div>
                            <div className="font-medium capitalize">{condition}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <CarPartModal
                  isOpen={isModalOpen}
                  onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPart(null);
                  }}
                  partName={selectedPart}
                  onSelectCondition={(condition: string) => {
                    if (selectedPart) {
                      setPartConditions(prev => ({
                        ...prev,
                        [selectedPart]: condition
                      }));
                      setIsModalOpen(false);
                      setSelectedPart(null);
                    }
                  }}
                />
              </div>
            )
          }
          
          return (
            <div key={i.name + index}>
              <div className="w-full p-4 rounded-md bg-[#F6F9FC] font-bold mt-2 mb-2 text-[#000] ">{i.name}</div>

              {i.name === "Document Images" && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Document Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {i.fields.map((field: any) => {
                      const hasImage = mediaFiles[field]?.selectedImage;
                      return (
                        <div 
                          className={`relative rounded-lg overflow-hidden shadow-sm transition-all duration-200 ${hasImage ? 'ring-2 ring-blue-900' : 'border border-gray-200'}`} 
                          key={field}
                        >
                          <div className="aspect-square overflow-hidden bg-gray-50">
                            <label 
                              htmlFor={`${field}picker`}
                              className="flex items-center justify-center w-full h-full cursor-pointer"
                            >
                              <img
                                className={`w-full h-full object-cover ${!hasImage && 'opacity-60 p-2'}`}
                                alt={field}
                                src={hasImage ? mediaFiles[field].selectedImage : CarImage}
                              />
                              {!hasImage && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="bg-blue-900 text-white text-xs px-2 py-1 rounded-full">Add Image</span>
                                </div>
                              )}
                            </label>
                            <input
                              id={`${field}picker`}
                              type="file"
                              className="hidden"
                              onChange={(event) => handleImageChange(field, event)}
                              accept="image/*"
                            />
                          </div>
                          <div className="bg-white p-2">
                            <p className="text-xs font-medium text-center truncate">{field}</p>
                            {hasImage && (
                              <div className="flex justify-center mt-1">
                                <button
                                  type="button"
                                  className="inline-flex items-center text-xs text-red-600 hover:text-red-800"
                                  onClick={() => handleImageRemove(field)}
                                >
                                  <MinusCircle size={12} className="mr-1" />
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                          {hasImage && (
                            <div className="absolute top-2 right-2 bg-blue-900 rounded-full p-1 shadow-md">
                              <Check size={12} color="white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {i.name == "Car Media" && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Car Media</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {i.fields.map((field: any) => {
                      const hasImage = mediaFiles[field]?.selectedImage;
                      return (
                        <div 
                          className={`relative rounded-lg overflow-hidden shadow-sm transition-all duration-200 ${hasImage ? 'ring-2 ring-blue-900' : 'border border-gray-200'}`} 
                          key={field}
                        >
                          <div className="aspect-square overflow-hidden bg-gray-50">
                            <label 
                              htmlFor={`${field}picker`}
                              className="flex items-center justify-center w-full h-full cursor-pointer"
                            >
                              <img
                                className={`w-full h-full object-cover ${!hasImage && 'opacity-60 p-2'}`}
                                alt={field}
                                src={hasImage ? mediaFiles[field].selectedImage : CarImage}
                              />
                              {!hasImage && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="bg-blue-900 text-white text-xs px-2 py-1 rounded-full">Add Image</span>
                                </div>
                              )}
                            </label>
                            <input
                              id={`${field}picker`}
                              type="file"
                              className="hidden"
                              onChange={(event) => handleImageChange(field, event)}
                              accept="image/*"
                            />
                          </div>
                          <div className="bg-white p-2">
                            <p className="text-xs font-medium text-center truncate">{field}</p>
                            {hasImage && (
                              <div className="flex justify-center mt-1">
                                <button
                                  type="button"
                                  className="inline-flex items-center text-xs text-red-600 hover:text-red-800"
                                  onClick={() => handleImageRemove(field)}
                                >
                                  <MinusCircle size={12} className="mr-1" />
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                          {hasImage && (
                            <div className="absolute top-2 right-2 bg-blue-900 rounded-full p-1 shadow-md">
                              <Check size={12} color="white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


              <div className="grid grid-cols-3">
                {i.name !== "Document Images" &&
                  i.name !== "Car Media" &&
                  i?.fields?.map((field: any) => {
      
                    const _fieldName = field.fieldName.replace(/\s/g, "_");

                    const defaults: any = {};

                    if (field.disabled) {
                      defaults.disabled = true;
                    }
                    if(field.value){
                      defaults.value = field.value;
                    }

                    return (
                      <div className={"m-2"} key={_fieldName}>
                        {_fieldName == "Warranty_Valid_Till" ?
                          watchFieldsWarranty?.length > 0  && watchFieldsWarranty[0]?.label == "Yes" ?
                            <p>
                          {field.fieldName}
                          {!!field.required && <span className="text-red">*</span>}
                        </p> : <></> : _fieldName == "Service_Plan_Valid_Till" ?  watchFieldsService.length > 0  && watchFieldsService[0]?.label == "Yes"?   <p>
                          {field.fieldName}
                          {!!field.required && <span className="text-red">*</span>}
                        </p>: <></>: <p>
                              {field.fieldName}
                              {!!field.required && <span className="text-red">*</span>}
                            </p> }
                        {field.fieldType == "Date" && _fieldName == "Warranty_Valid_Till" && watchFieldsWarranty.length > 0  && watchFieldsWarranty[0]?.label == "Yes"  && (
                          <>
                            <Controller
                              name={_fieldName}
                              control={control}
                              rules={{
                                required: {
                                  value: !!field.required,
                                  message: "Required",
                                },
                              }}
                              render={(value) => <AppDatePicker field={value.field} selected={new Date()} />}
                            />
                            {errors[_fieldName] && <span className="text-red">{`${errors[_fieldName]?.message}`}</span>}
                          </>
                        )}
                        {field.fieldType == "Date" && _fieldName == "Service_Plan_Valid_Till" && watchFieldsService.length && watchFieldsService[0]?.label == "Yes" &&  (
                            <>
                              <Controller
                                  name={_fieldName}
                                  control={control}
                                  rules={{
                                    required: {
                                      value: !!field.required,
                                      message: "Required",
                                    },
                                  }}
                                  render={(value) => <AppDatePicker field={value.field} selected={new Date()} />}
                              />
                              {errors[_fieldName] && <span className="text-red">{`${errors[_fieldName]?.message}`}</span>}
                            </>
                        )}
                        {field.fieldType == "Date" && _fieldName != "Service_Plan_Valid_Till" && _fieldName !== "Warranty_Valid_Till" &&  (
                            <>
                              <Controller
                                  name={_fieldName}
                                  control={control}
                                  rules={{
                                    required: {
                                      value: !!field.required,
                                      message: "Required",
                                    },
                                  }}
                                  render={(value) => <AppDatePicker field={value.field} selected={new Date()} />}
                              />
                              {errors[_fieldName] && <span className="text-red">{`${errors[_fieldName]?.message}`}</span>}
                            </>
                        )}
                        {field.fieldType == "Field" && (
                          <>
                            <input
                              {...register(_fieldName, {
                                required: {
                                  value: !!field.required,
                                  message: "Required",
                                },
                              })}
                              defaultValue={field.value}
                              placeholder={"Enter " + field.fieldName}
                              className={"form-control w-full border border-[#CCC] h-[40px] rounded-sm pl-2 pr-2"}
                              {...defaults}
                            />
                            {errors[_fieldName] && <span className="text-red">{`${errors[_fieldName]?.message}`}</span>}
                          </>
                        )}
                        {field.fieldType == "Drop Down" && (
                          <>
                            <div className="relative">
                              <Controller
                                name={_fieldName}
                                control={control}
                                rules={{
                                  required: {
                                    value: !!field.required,
                                    message: "Required",
                                  },
                                }}
                                render={(value) => (
                                  <AppSelectV2
                                    field={value.field}
                                    options={field.options?.map((v: any) => ({
                                      label: v,
                                      value: v,
                                    }))}
                                  />
                                )}
                              />
                              {i.name === 'Car Body' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedField(_fieldName);
                                    setIsFieldDetailsModalOpen(true);
                                  }}
                                  className="bg-blue-900 text-white p-1 mt-2  rounded-sm hover:bg-blue-800 transition-colors"
                                  title="Add"
                                >
                                  <Plus size={16} />
                                </button>
                              )}
                            </div>
                            {errors[_fieldName] && <span className="text-red">{`${errors[_fieldName]?.message}`}</span>}
                            {i.name === 'Car Body' && fieldExtraData[_fieldName] && (
                              <div className="mt-1 p-2 bg-blue-50 rounded-md text-xs">
                                {fieldExtraData[_fieldName].comment && (
                                  <p className="text-gray-700">Comment: {fieldExtraData[_fieldName].comment}</p>
                                )}
                                {fieldExtraData[_fieldName].image && (
                                  <div className="mt-1">
                                    <img 
                                      src={fieldExtraData[_fieldName].image || ''} 
                                      alt="Field detail" 
                                      className="h-12 w-auto object-cover rounded" 
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {field.fieldType == "Drop Down - Multiple" && (
                          <>
                            <Controller
                              name={_fieldName}
                              control={control}
                              rules={{
                                required: {
                                  value: !!field.required,
                                  message: "Required",
                                },
                              }}
                              render={(value) => (
                                <AppSelectV2
                                  isMulti
                                  field={value.field}
                                  options={field.options?.map((v: any) => ({
                                    label: v,
                                    value: v,
                                  }))}
                                />
                              )}
                            />
                            {errors[_fieldName] && <span className="text-red">{`${errors[_fieldName]?.message}`}</span>}
                          </>
                        )}

                        {field.fieldType == "TextArea" && (
                            <>
                                <textarea
                                    {...register(_fieldName, {
                                      required: {
                                        value: !!field.required,
                                        message: "Required",
                                      },
                                    })}
                                    rows={6}
                                    maxLength={255}
                                    placeholder={"Enter " + field.fieldName}
                                    className={"form-control mt-4 w-full border border-[#CCC] w-full rounded-sm pl-2 pr-2"}
                                    {...defaults}
                                />
                                {errors[_fieldName] && <span className="text-red">{`${errors[_fieldName]?.message}`}</span>}

                              {errors[_fieldName] && <span className="text-red">{`${errors[_fieldName]?.message}`}</span>}
                            </>
                        )}

                        {field.fieldType == "Boolean" && (
                          <div className="flex items-center gap-4 mt-2">
                            {/* Icon */}
                            <div 
                              className="w-10 h-10 flex-shrink-0"
                              dangerouslySetInnerHTML={{ __html: renderIcon(field.fieldName) }} 
                            />
                            {/* Toggle Switch */}
                            <Controller
                              name={_fieldName}
                              control={control}
                              rules={{
                                required: {
                                  value: !!field.required,
                                  message: "Required",
                                },
                              }}
                              render={({ field: controllerField }) => (
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => controllerField.onChange(!controllerField.value)}
                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                      controllerField.value ? 'bg-red-500' : 'bg-gray-300'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                                        controllerField.value ? 'translate-x-8' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                  <span className={`text-sm font-medium ${controllerField.value ? 'text-red-600' : 'text-gray-500'}`}>
                                    {controllerField.value ? 'ON' : 'OFF'}
                                  </span>
                                </div>
                              )}
                            />
                            {errors[_fieldName] && <span className="text-red">{`${errors[_fieldName]?.message}`}</span>}
                          </div>
                        )}

                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}


        {images && images?.length ?  <div className="flex flex-wrap  gap-5 mt-5 ">
          { images.map((field: any) => {
            return (
                <div className="relative border-spacing-1 border-primary border-2 rounded" key={field}>
                  <div className="overflow-hidden w-30  h-30 text-center">
                    <label htmlFor={`${field}picker`}>
                      <img
                          style={{
                            width: "100%",
                            height: "auto",
                          }}
                          alt="image"
                          src={field?.url ?? "/images/img.png"}
                      />
                    </label>
                    <p className="text-[12px] absolute bottom-0 w-full">{field?.caption}</p>

                  </div>
                      <button
                          type="button"
                          className="bg-white absolute -top-3 -right-3  border-2 rounded-full border-white"
                          onClick={() => {
                            handleImageRemoveMedia(field);
                          }}
                      >
                        <MinusCircle size={20} color="red" />
                      </button>
                </div>
            );
          })}

        </div>: <></>}

        {/* Navigation and submit buttons */}
        {submitState && (
          <div className="my-4 p-4 rounded-md bg-blue-50 border border-blue-200">
            <div className="flex items-center">
              <div className="mr-3">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-900"></div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Saving...</h4>
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-900 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: submitState.includes('%') ? submitState : '100%' }}
                    ></div>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">{submitState}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between mt-10">
     
          <div className="flex items-center">
            
            {/* Previous button */}
            {currentStep > 0 && (
              <button 
                type="button" 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 mr-2 text-center font-medium text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </button>
            )}
          </div>
          
          <div>
            {/* Next button */}
            {currentStep < steps.length - 1 ? (
              <button 
                type="button" 
                onClick={() => {
                  // Mark current step as completed
                  if (!completedSteps.includes(currentStep)) {
                    setCompletedSteps(prev => [...prev, currentStep]);
                  }
                  // Move to next step
                  setCurrentStep(prev => prev + 1);
                }}
                className="inline-flex items-center justify-center rounded-md bg-blue-900 px-4 py-2 text-center font-medium text-white hover:bg-blue-800"
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </button>
            ) : (
              /* Submit button (only on last step) */
              <button 
                disabled={loading} 
                type="submit" 
                onClick={() => setIsSubmitting(true)}
                className="inline-flex items-center justify-center rounded-md bg-blue-900 px-4 py-2 text-center font-medium text-white hover:bg-opacity-90"
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            )}
          </div>
        </div>
      </form>
       </div>
       </div>
       
       {/* Field Details Modal */}
       <FieldDetailsModal
         isOpen={isFieldDetailsModalOpen}
         onClose={() => setIsFieldDetailsModalOpen(false)}
         fieldName={selectedField.replace(/_/g, ' ')}
         onSave={(details) => {
           setFieldExtraData(prev => ({
             ...prev,
             [selectedField]: details
           }));
         }}
       />
    </div>
  );
};

export default InspectionForm;
