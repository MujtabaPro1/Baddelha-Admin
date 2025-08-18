import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useParams } from 'react-router-dom';
import axiosInstance from '../service/api';
import { findInspection, getInspectionSchema } from '../service/inspection';
import { toast } from 'react-toastify';
import { Check, X, Clock, AlertCircle, ArrowUp, Clock10 } from 'lucide-react';
import CarBodySvgView from '../components/CarBodyView';

const CarsDetails = () => {
  const [carDetails, setCarDetails] = useState<any>(null);
  const [images, setImages] = useState<any>([]);
  const [inspectionDetails, setInspectionDetails] = useState<any>(null);
  const [inspectionSchema, setInspectionSchema] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  
  const params = useParams();

  useEffect(() => {
    fetchCarDetails();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      toast.warning("Time limit reached");
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [timeRemaining]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  async function fetchCarDetails() {
    setLoading(true);
    try {
      const resp = await axiosInstance.get("/1.0/car/find/" + params.id);
      console.log("Car details:", resp.data);
      setCarDetails(resp.data.car);
      setInspectionDetails(resp.data.car?.Inspection?.[0]);
      setInspectionSchema(resp.data.car?.Inspection?.[0]?.inspectionJson);
      
    
      // Fetch images if images exists
      if (resp.data?.images) {
        setImages(resp.data.images);
      }
    } catch (ex: unknown) {
      console.error(ex);
      setError("Failed to load car details");
      toast.error("Failed to load car details");
    } finally {
      setLoading(false);
    }
  }
  
  
  
  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    let bgColor = "bg-gray-200";
    let textColor = "text-gray-800";
    let icon = <Clock className="w-4 h-4 mr-1" />;
    
    switch(status?.toLowerCase()) {
      case 'available':
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        icon = <Check className="w-4 h-4 mr-1" />;
        break;
      case 'sold':
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        icon = <Check className="w-4 h-4 mr-1" />;
        break;
      case 'pending':
      case 'pending_inspection':
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        icon = <Clock className="w-4 h-4 mr-1" />;
        break;
      case 'rejected':
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        icon = <X className="w-4 h-4 mr-1" />;
        break;
      default:
        icon = <AlertCircle className="w-4 h-4 mr-1" />;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon}
        {status?.charAt(0).toUpperCase() + status?.slice(1).replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-medium">Error</h3>
        <p>{error}</p>
      </div>
    );
  }


  const markCarAsListed = async (carId: string) => {
    try {

        // let newPrice = Number(initialData.sellingPrice);

        // if(initialData.carStatus == "unlisted"){
        //   newPrice = Number(initialData.sellingPrice) * 1.02;
        //   }else{
        //   newPrice = Number(initialData.sellingPrice) * 1.05;
        //   }


        axiosInstance.put("/1.0/car/update/" + carId, {
          carStatus: 'listed',
          auctionEndTime: null,
        }).then((res) => {
          alert("Successfully updated your status");

          setTimeout(()=>{
            window.location.reload()
          },1000);

        }).catch((err) => {
          console.log('err', err);
        })


    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
      console.error("Error listing Car:", error);
    }
  }

  const markCarAsAuctionListed = async (carId: string) => {
    try {


       // const newPrice =  Number(initialData.sellingPrice) * 1.10;

        axiosInstance.put("/1.0/car/pushForAuction/" + carId, {
          carStatus: 'listed',
        }).then((res) => {
          alert("Successfully updated your status");

          setTimeout(()=>{
              window.location.reload()
          },1000);

        }).catch((err) => {
          console.log('err', err);
        })


    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
      console.error("Error listing Car:", error);
    }
  }

  const markCarStatus = async (carId: string,status:string) => {
    try {

      axiosInstance.put("/1.0/car/update/" + carId, {
        carStatus: status,
      }).then((res) => {

        setTimeout(()=>{
          window.location.reload()
        },1000);

      }).catch((err) => {
        console.log('err', err);
      })


    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
      console.error("Error listing Car:", error);
    }
  }



  return (
    <div>
     
      <PageHeader 
        title={carDetails ? `${carDetails.make} ${carDetails.model} ${carDetails.modelYear}` : "Car Details"} 
        description={`Car ID: ${params.id}`}
      />
      


        {carDetails?.carStatus == 'inspected' || carDetails?.carStatus == 'unlisted'    ?
          <div className={'w-75 flex items-end justify-end'}>
           <div onClick={()=>{
             if(confirm("Are you sure you want to push this car for listing")) {
               markCarAsListed(carDetails?.id);
             }
           }} className={'flex border bg-[#5cb85c] border-success p-2 rounded-md text-center text-white items-center cursor-pointer justify-center'}>
             <ArrowUp/>&nbsp;
             <div >Push to Listing</div>
           </div>

           <div onClick={()=>{
             if(confirm("Are you sure you want to push this car for auction")) {
               markCarAsAuctionListed(carDetails?.id);
             }
           }} className={`border bg-[#e9d502] cursor-pointer  p-2 flex items-center justify-center rounded-md text-center text-white ml-1 mr-1`}>
             <Clock10/>&nbsp;
             <div >
               Push to Auction</div>
           </div>
           </div>

            : <></>}
             <div className={'w-75 flex items-end justify-end'}>
             {carDetails?.carStatus == 'listed' || carDetails?.carStatus == 'hold' || carDetails?.carStatus == 'sold' || carDetails?.carStatus == 'returned'     ?  <div className={'flex items-center'}><div className={`mr-1 border-2 border-red-500 p-2 rounded-md text-center text-red-500`}>
          <button onClick={()=>{
            if(confirm("Are you sure you want to unlist this car from listing")) {
              markCarStatus(carDetails?.id,'unlisted');
            }

          }}>Unlist the Car</button>
        </div>
            <div className={`border-blue-500 border-2 text-blue-500 ml-1 mr-1 p-2 rounded-md text-center`}>
              <button onClick={()=>{
                if(confirm("Are you sure you want to mark as reserved")) {
                  markCarStatus(carDetails?.id,'hold');
                }
              }}>Mark as Reserved</button>
            </div>
              <div className={`border-gray-500 border-2 text-gray-500  ml-1 mr-1 p-2 rounded-md text-center `}>
                <button onClick={()=>{
                  if(confirm("Are you sure you want to mark as sold")) {
                    markCarStatus(carDetails?.id,'sold');
                  }
                }}>Mark as Sold</button>
              </div>
              <div className={`border-black border-2 text-black  ml-1 mr-1 p-2 rounded-md text-center`}>
                <button onClick={()=>{
                  if(confirm("Are you sure you want to mark as hold")) {
                    markCarStatus(carDetails?.id,'returned');
                  }
                }}>Mark as Returned</button>
              </div>
            </div>

            : <></>}
</div> 
     

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`${activeTab === 'details' ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Car Details
          </button>
          <button
            onClick={() => setActiveTab('inspection')}
            className={`${activeTab === 'inspection' ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Inspection Report
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`${activeTab === 'bids' ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Bids
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`${activeTab === 'images' ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Images
          </button>
        </nav>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'details' && carDetails && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Car General Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Details and specifications.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Make</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.make}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Model</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.model}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Year</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.modelYear}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {renderStatusBadge(carDetails.carStatus)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Mileage</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {carDetails.mileage ? `${carDetails.mileage.toLocaleString()} km` : 'N/A'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Body Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.bodyType || 'N/A'}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Engine</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.engine || carDetails.engineType || 'N/A'}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Gear Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.gearType || 'N/A'}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Book Value</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {carDetails.bookValue ? `SAR ${Number(carDetails.bookValue).toLocaleString()}` : 'N/A'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Selling Price</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {carDetails.sellingPrice ? `SAR ${Number(carDetails.sellingPrice).toLocaleString()}` : 'Not set'}
                </dd>
              </div>
              {carDetails.notes && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

  {/* Inspection Tab */}
  {activeTab === 'inspection' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Inspection Report</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Detailed inspection information.</p>
          </div>
          
          {!carDetails?.inspectionId ? (
            <div className="px-4 py-5 sm:px-6 text-center">
              <p className="text-gray-500">No inspection report available for this car.</p>
            </div>
          ) : !inspectionSchema ? (
            <div className="px-4 py-5 sm:px-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
            </div>
          ) : (
            <div className="border-t border-gray-200">
              {/* Inspection Progress Overview */}
              <div className="px-4 py-5 sm:px-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Inspection Overview</h4>
            
                <div className={"grid grid-cols-1 lg:grid-cols-2 gap-4 bg-white p-2"}>
            <div >
              <div className={"w-full p-4 rounded-md bg-[#F6F9FC] font-bold  mt-2 mb-2 text-[#000] flex justify-between items-center"}>
                <h1>Information</h1>
              </div>

              {inspectionDetails ?
              Object.keys(inspectionDetails?.inspectionJson).map((i, index) => {


                if(i == 'overview'){
                  return <></>;
                }

                return (
                    <div key={i + index} >
                      <div className={'w-full'}>
                        <div className={"m-2  border-b border-b-[#F7F7F7] flex items-center justify-between"} key={i + index}>
                          <p className={"font-bold text-[#000] mt-1 mb-1"}>{i.replace(/_/g, " ")}</p>
                          <p className={"mt-1 mb-1"}>{typeof inspectionDetails?.inspectionJson[i] == 'object' && inspectionDetails?.inspectionJson[i]?.length ? inspectionDetails?.inspectionJson[i][0].value : typeof inspectionDetails?.inspectionJson[i] == 'object' && !inspectionDetails?.inspectionJson[i]?.length ?  inspectionDetails?.inspectionJson[i]?.value : inspectionDetails?.inspectionJson[i] == "" ? "N/A" : inspectionDetails?.inspectionJson[i]}</p>
                        </div>
                      </div>
                    </div>
                  );
                }) : <>
                <p className="text-center mt-10 text-gray-500 text-lg">Loading Inspection Preview Soon .. </p>
                </>}
            </div>

            <div >
              <div className={"w-full p-4 rounded-md bg-[#F6F9FC] font-bold  mt-2 mb-2 text-[#000] "}>Images</div>
              <div className="flex flex-wrap">
                {images?.length && images?.map((img: any, index: number) => {
                  return (
                    <div key={img.caption + index}>
                      <div className={"flex flex-wrap cursor-pointer items-start justify-start"}>
                        <div
                          onClick={() => {
                           
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
              {inspectionDetails?.carBodyConditionJson && <CarBodySvgView data={inspectionDetails?.carBodyConditionJson}/>}
            </div>
          </div>
          </div>
              
             
            </div>
          )}
        </div>
      )}
    

      
    
      {/* Bids Tab */}
      {activeTab === 'bids' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Bids</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">All bids placed on this car.</p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            {/* This is a placeholder for bids - will need to be updated when bid API is available */}
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bids yet</h3>
              <p className="mt-1 text-sm text-gray-500">No bids have been placed on this car yet.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Images Tab */}
      {activeTab === 'images' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Car Images</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">All images related to this car.</p>
          </div>
          
          <div className="border-t border-gray-200">
            {images && images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {images.map((image: any, index: number) => (
                  <div key={index} className="relative group overflow-hidden rounded-lg shadow-md">
                    <img 
                      src={image.url || image.path} 
                      alt={`Car image ${index + 1}`} 
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm">
                        {image.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
                <p className="mt-1 text-sm text-gray-500">No images available for this car.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarsDetails;