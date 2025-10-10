"use client";
import React, { useEffect, useRef, useState } from "react";
import InspectionForm from "../InspectionForm";


import ImageGallery from "react-image-gallery";

import Link from "next/link";
import { toast } from "react-toastify";
import { findInspection } from "../service/inspection";
import axiosInstance from "../service/api";
import { Check, File, ShieldCloseIcon, TimerResetIcon, Trash } from "lucide-react";
import { useParams } from "react-router-dom";
import CarBodySvg from "../components/CarBody";
import CarBodySvgView from "../components/CarBodyView";
import LanguageSelectionModal from "../components/LanguageSelectionModal";
import { useLanguage } from "../contexts/LanguageContext";


const isEmpty = (obj: any) => {
  return Object.keys(obj).length === 0;
}

const ViewInspectionPage = () => {
  const [data, setData] = useState<any>(null);
  const params = useParams();
  // Using ref for ImageGallery component
  const imageGalleryRef = useRef<any>(null); 
  



  useEffect(() => {
    if (params?.id) {
      findInspection(params.id).then(async (res) => {
        setData(res);
      });
    }
  }, [params?.id]);

  const [showGallery, setShowGallery] = useState(false);
  const [itemIndex, setStartIndex] = useState(0);

  const [reportLoader, setReportLoader] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { language } = useLanguage();
  
  const downloadReport = async (inspectionId: string, reportLanguage: string = 'en') => {
    try {
      setReportLoader(true);
      const response = await axiosInstance.get("/1.0/report/inspection/" + inspectionId, {
        responseType: "blob",
        params: {
          language: reportLanguage
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `inspection-report-${inspectionId}-${reportLanguage}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
      console.error("Error downloading report:", error);
    } finally {
      setReportLoader(false);
      setShowLanguageModal(false);
    }
  };

  const handleGenerateReport = (language: string) => {
    if (params?.id) {
      downloadReport(params.id, language);
    }
  };

  const markAsCompleted = async (inspectionId: string) => {
    try {
      axiosInstance.get("/1.0/inspection/mark-as-completed/" + inspectionId).then((res)=>{
        alert("Successfully updated your status");
        window.location.reload();
      }).catch((err)=>{
        console.log('err',err);
      })

    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
      console.error("Error downloading report:", error);
    } finally {
      setReportLoader(false);
    }
  };

  const markCarAsInspected = async (carId: string) => {
    try {
      axiosInstance.put("/1.0/car/update/" + carId,{
        carStatus: 'inspected',
        inspectionId: params?.id
      }).then((res)=>{
        alert("Successfully updated your status");

        findInspection(params.id).then((res) => {
          setData(res);
        });
      }).catch((err)=>{
        console.log('err',err);
      })

    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
      console.error("Error downloading report:", error);
    } finally {
      setReportLoader(false);
    }
  }



// Define interface for extra data items
interface ExtraDataItem {
  comment: string;
  image: string | null;
}

// Define interface for inspection data
interface InspectionData {
  extraData?: Record<string, ExtraDataItem>;
  overview?: any;
  [key: string]: any; // For other fields
}
   
let inspection: InspectionData | null = null;
if(data && data?.inspection?.inspectionJson && isEmpty(data?.inspection?.inspectionJson)){
  //return <p className="text-center mt-10 text-gray-500 text-lg">Loading Inspection Preview Soon .. </p>
  inspection = null;
}else if(data && data?.inspection?.inspectionJson){
  inspection = data?.inspection?.inspectionJson;
}


  return (
    <>
      <div className={'w-full flex justify-end mb-4'}>
        <button
            className={`${data?.inspection?.inspectionStatus ==  "Submit" ? "mr-5" : ''} bg-primary rounded-md flex items-center border border-primary px-1 py-1 text-center font-medium text-primary hover:bg-opacity-90 lg:px-4 xl:px-4`}
            aria-disabled={reportLoader}
            onClick={() => {
              setShowLanguageModal(true);
            }}
            style={{
              background: '#ececec',
              padding: '10px',
              border: '1px solid',
            }}
        >
          <File/>
          &nbsp;
          { reportLoader && (language === 'en' ? 'Generating Report.....' : 'جاري إنشاء التقرير...') }
          { !reportLoader && (language === 'en' ? 'Generate Report' : 'إنشاء تقرير') }
        </button>
        {data?.inspection?.inspectionStatus == "Submit" ? <button
            className="rounded-md bg-blue-900 flex items-center px-1 py-1 text-center font-medium text-white hover:bg-opacity-90 lg:px-4 xl:px-4"
            onClick={() => {


              if(data?.inspection?.inspectionStatus == "Submit") {

                if(confirm("Are you sure you want to mark as completed")) {
                  markAsCompleted(params.id);
                  markCarAsInspected(data?.inspection?.carId);
                }
              }else{
                if(confirm("Are you sure you want to push this car for listing")) {
                 // markCarAsListed(data?.inspection?.carId);
                }
              }
            }}
        >
          <Check/>
          &nbsp;
          Mark as Completed
        </button>: <></>}
      </div>

      {data?.error && <div className="text-red"> {JSON.stringify(data.error)} </div>}
      {showGallery ? (
        <div className={"wrapper"}>
          <div className={"thumbnails"}>
            <div className="top-bar">
              <button
                onClick={() => {
                  setShowGallery(!showGallery);
                }}
                type="button"
                className="button cursor-pointer"
              >
                 <p className="text-white font-bold text-2xl">X</p>
              </button>
            </div>
            <ImageGallery
              ref={imageGalleryRef}
              showPlayButton={false}
              startIndex={itemIndex}
              onErrorImageURL={"/images/loader.webp"}
              showFullscreenButton={false}
              lazyLoad={false}
              items={data.images?.map((item: any) => ({
                ...item,
                original: item.url,
                thumbnail: item.url,
              }))}
            />
          </div>
        </div>
      ) : (
        <div>
          <div className={"grid grid-cols-1 lg:grid-cols-2 gap-4 bg-white p-2"}>
            <div >
              <div className={"w-full p-4 rounded-md bg-[#F6F9FC] font-bold  mt-2 mb-2 text-[#000] flex justify-between items-center"}>
                <h1>Information</h1>
              </div>

              {inspection && Object.keys(inspection).length > 0 ?
              Object.keys(inspection).map((i, index) => {
                // Re-check the inspection data in case it was updated
                if(data && data?.inspection?.inspectionJson && isEmpty(data?.inspection?.inspectionJson)){
                  return <p className="text-center mt-10 text-gray-500 text-lg">Loading Inspection Preview Soon .. </p>
                }else if(data && data?.inspection?.inspectionJson){
                  inspection = data?.inspection?.inspectionJson;
                }

                if(!inspection || i === 'overview' || i === 'extraData'){
                  return null;
                }

                return (
                    <div key={i + index} >
                      <div className={'w-full'}>
                        <div className={"m-2  border-b border-b-[#F7F7F7] flex items-center justify-between"} key={i + index}>
                          <p className={"font-bold text-[#000] mt-1 mb-1"}>{i.replace(/_/g, " ")}</p>
                          <p className={"mt-1 mb-1"}>
                            {inspection && (
                              typeof inspection[i] === 'object' && inspection[i]?.length ? 
                                inspection[i][0].value : 
                              typeof inspection[i] === 'object' && !inspection[i]?.length ? 
                                inspection[i]?.value : 
                              inspection[i] === "" ? 
                                "N/A" : 
                                inspection[i]
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }) : <>
                <p className="text-center mt-10 text-gray-500 text-lg">Loading Inspection Preview Soon .. </p>
                </>}
            </div>

            <div >
              {/* Extra Data Section */}
              {inspection?.extraData && Object.keys(inspection.extraData).length > 0 && (
                <>
                  <div className={"w-full p-4 rounded-md bg-[#F6F9FC] font-bold mt-2 mb-2 text-[#000]"}>
                    Additional Field Details
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {Object.keys(inspection.extraData).map((key) => {
                      const extraItem = inspection.extraData?.[key] as ExtraDataItem;
                      if (!extraItem) return null;
                      
                      return (
                        <div key={key} className="border rounded-md p-3 bg-white shadow-sm">
                          <h3 className="font-bold text-gray-800 mb-2 border-b pb-2">
                            {key.replace(/_/g, " ")}
                          </h3>
                          
                          {extraItem.comment && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-600">Comment:</p>
                              <p className="text-gray-800">{extraItem.comment}</p>
                            </div>
                          )}
                          
                          {extraItem.image && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-600 mb-1">Image:</p>
                              <div className="relative">
                                <img 
                                  src={extraItem.image} 
                                  alt={`${key} detail`} 
                                  className="w-full h-auto max-h-48 object-contain rounded-md border" 
                                  onClick={() => {
                                    // Open image in new tab for better viewing
                                    if (extraItem.image) {
                                      window.open(extraItem.image, '_blank');
                                    }
                                  }}
                                />
                                <div className="absolute bottom-0 right-0 bg-blue-900 text-white text-xs px-2 py-1 rounded-tl-md cursor-pointer"
                                  onClick={() => {
                                    if (extraItem.image) {
                                      window.open(extraItem.image, '_blank');
                                    }
                                  }}>
                                  View Full
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              
              {/* Images Section */}
              <div className={"w-full p-4 rounded-md bg-[#F6F9FC] font-bold  mt-2 mb-2 text-[#000] "}>Images</div>
              <div className="flex flex-wrap">
                {data && data.images && data?.images?.map((img: any, index: number) => {
                  return (
                    <div key={img.caption + index}>
                      <div className={"flex flex-wrap cursor-pointer items-start justify-start"}>
                        <div
                          onClick={() => {
                            setShowGallery(true);
                            setStartIndex(index);
                          }}
                          className={"w-[120px] text-center ml-2 mr-2"}
                        >
                          <img className={"w-[120px] h-[100px] m-2 rounded-lg"} src={img.url} />
                          <small>{img.caption}</small>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="w-full p-4 rounded-md bg-[#F6F9FC] font-bold  mt-2 mb-2 text-[#000] text-lg">Car Body Condition</p>
              {data?.inspection?.carBodyConditionJson && <CarBodySvgView data={data?.inspection?.carBodyConditionJson}/>}
            </div>
          </div>
        </div>
      )}
      <LanguageSelectionModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onSelectLanguage={handleGenerateReport}
        isLoading={reportLoader}
      />
    </>
  );
};

export default ViewInspectionPage;
