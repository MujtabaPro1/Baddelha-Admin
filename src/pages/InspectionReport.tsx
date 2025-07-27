import { Controller, FormProvider, useForm } from "react-hook-form";

import AppSelectV2 from "../components/AppSelectV2";
import AppDatePicker from "../components/AppDatePicker";
import {ChangeEvent, useEffect, useState} from "react";
import { toast } from "react-toastify";
import { saveInspection, getInspectionSchema } from "../service/inspection";
import { createMedia } from "../service/media";
import { dataURLToBlob } from "../types/dataUrlToBlob";
import { MinusCircle, Check, ChevronRight, ChevronLeft } from "lucide-react";
import axiosInstance from "../service/api";
import { useNavigate, useParams } from "react-router-dom";
import { axiosErrorHandler } from "../types/utils";
import PageHeader from "../components/PageHeader";
import CarImage from "../images/img.png";
import CarBodySvg from "../components/CarBody";
import CarPartModal from "../components/CarPartModal";



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
  const [partConditions, setPartConditions] = useState<Record<string, string>>({});

 

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
      
      let formValues = {};
      inspection?.data?.map((item:any)=>{
        if(item.name !== 'Car Media' && item.name !== 'Document Images') {
          let val = item['fields'].reduce((acc: any, field: any) => ({
            ...acc,
            [field.fieldName.replace(/\s/g, "_")]: field.value,
          }), {});
          formValues = {
            ...formValues,
            ...val,
          };
    
        }
      })

      console.log("inspection---",inspection);
      setDefaultValues(formValues);
      setInitialData(inspection);
    } catch (ex: any) {
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
 
    const inspectionId = params.id;
    const body = {
      buyingPrice: "",
      inspectionStatus: "",
      inspection: JSON.stringify(data),
      carbody: partConditions,
    };

    setLoading(true);

    setSubmitState("Uploading Images");
    //upload document images
   // await uploadImages();

    //upload car images

    setSubmitState("Saving Inspection");
    //update inspection
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
    for (let field in mediaFiles) {
      let file = mediaFiles[field];

      if (!file.selectedImage) {
        continue;
      }

      file = dataURLToBlob(file.selectedImage);

      setSubmitState("Uploading Image " + field);

      const data = {
        imageableId: initialData?.id,
        imageableType: "Inspection",
        fileCaption: field,
      };

      let mediaResp = await createMedia(file, data);
      if (mediaResp.error) {
        toast.error("Image upload error");
      }
    }
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
      
      {httpError && <div className="text-red text-center text-danger">{JSON.stringify(httpError)}</div>}

      <form onSubmit={onSubmit}>
        {initialData && initialData?.map((i: any, index: number) => {
          // Only render the current step
          if (index !== currentStep) return null;

          console.log("here",i.name);

          if(i.name == 'Car Body Condition'){
            console.log("here",i.name);
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
                            {errors[_fieldName] && <span className="text-red">{`${errors[_fieldName]?.message}`}</span>}
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
              <>
                <h4>Saving..</h4>
                <p>{submitState}</p>
              </>
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
    </div>
  );
};

export default InspectionForm;
