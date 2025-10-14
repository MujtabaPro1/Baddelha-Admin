import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useParams } from 'react-router-dom';
import axiosInstance from '../service/api';
import { findInspection, getInspectionSchema } from '../service/inspection';
import { toast } from 'react-toastify';
import { Check, X, Clock, AlertCircle, ArrowUp, Clock10, DollarSign, Trophy } from 'lucide-react';
import CarBodySvgView from '../components/CarBodyView';
import AuctionHistory from '../components/AuctionHistory';

const numberWithCommas = (x: number) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const CarsDetails = () => {
  const [carDetails, setCarDetails] = useState<any>(null);
  const [images, setImages] = useState<any>([]);
  const [inspectionDetails, setInspectionDetails] = useState<any>(null);
  const [inspectionSchema, setInspectionSchema] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [user, setUser] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [placingBid, setPlacingBid] = useState<boolean>(false);
  const [winner, setWinner] = useState<any>(null);
  const [loadingWinner, setLoadingWinner] = useState<boolean>(false);
  const params = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const [bids, setBids] = useState<any>([]);
  const [auctionHistory, setAuctionHistory] = useState<any>([]);
  const [showPriceModal, setShowPriceModal] = useState<boolean>(false);
  const [editedPrice, setEditedPrice] = useState<number | null>(null);
  const [updatingPrice, setUpdatingPrice] = useState<boolean>(false);
  const [coverImage,setCoverImage] = useState(null);
  const [showRevealPriceModal, setShowRevealPriceModal] = useState<boolean>(false);
  const [revealPrice, setRevealPrice] = useState<number | null>(null);



  // Set initial edited price when car details are loaded
  useEffect(() => {
    if (carDetails?.sellingPrice) {
      setEditedPrice(Number(carDetails.sellingPrice));
    }
  }, [carDetails]);

  useEffect(()=>{
    const userDetails = localStorage.getItem('baddelha_user');
    if(userDetails){
      console.log(JSON.parse(userDetails || '{}'));
      setUser(JSON.parse(userDetails || '{}'));
    }
  },[]);

 

  useEffect(() => {
    fetchCarDetails();
    
    // Fetch auction winner if auctionId is available
    const auctionId = searchParams.get('auctionId');
    if (auctionId) {
      // Initial fetch
      fetchAuctionWinner(auctionId);
      fetchAuctionBids(auctionId);
      
      // Set up polling every minute (60000 ms)
      const pollingInterval = setInterval(() => {
        console.log('Polling auction data...');
        fetchAuctionWinner(auctionId);
        fetchAuctionBids(auctionId);
      }, 60000); // Poll every minute
      
      // Cleanup interval when component unmounts
      return () => {
        console.log('Clearing auction polling interval');
        clearInterval(pollingInterval);
      };
    }else{
      getAuctionDetails();
    }
  }, []);

  const getAuctionDetails = async () => {
    try {
      const resp = await axiosInstance.get("/1.0/auction?status=ENDED&carId=" + params.id);
      console.log(resp);
      if (resp.data?.data && Array.isArray(resp.data?.data)) {
        setAuctionHistory(resp.data?.data);
      }
    } catch (ex: unknown) {
      console.error(ex);
      setError("Failed to load auction details");
      toast.error("Failed to load auction details");
    }
  }

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
  


  async function fetchCarDetails() {
    setLoading(true);
    try {
      const resp = await axiosInstance.get("/1.0/car/find/" + params.id);
      console.log("Car details:", resp.data?.car);
      setCarDetails(resp.data.car);
      setInspectionDetails(resp.data.car?.Inspection?.[0]);
      setInspectionSchema(resp.data.car?.Inspection?.[0]?.inspectionJson);
      setCoverImage(resp?.data?.carImages?.[0]?.url);
      const auctionId = searchParams.get('auctionId');
      if(!auctionId){
      setBids(resp.data.car?.Bid);
      }
      
  
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

  async function fetchAuctionBids(auctionId: string) {
    setLoadingWinner(true);
    try {
      const response = await axiosInstance.get(`/1.0/auction/${auctionId}/bids`);
      setBids(response.data);
    } catch (error) {
      console.error("Failed to fetch auction winner:", error);
      // Don't show error toast as this is not critical
    } finally {
      setLoadingWinner(false);
    }
  }
  
  const fetchAuctionWinner = async (auctionId: string) => {
    setLoadingWinner(true);
    try {
      const response = await axiosInstance.get(`/1.0/auction/${auctionId}/winner`);
      setWinner(response.data);
    } catch (error) {
      console.error("Failed to fetch auction winner:", error);
      // Don't show error toast as this is not critical
    } finally {
      setLoadingWinner(false);
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

  const markCarAsInventory = async (carId: string) => {
    try {
      axiosInstance.post(`/1.0/car/${carId}/push/inventory`)
        .then((res) => {

          console.log(res);
          alert("Successfully pushed car to inventory");
          
          setTimeout(() => {
            window.location.href = '/cars'
          }, 1000);
        })
        .catch((err) => {
          alert(err?.response?.data?.message || "Something went wrong");
          console.log('err', err);
        });
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
      console.error("Error pushing car to inventory:", error);
    }
  }

  const markCarAsAuctionListed = async (carId: string) => {
    try {
      // Get the selling price from initialData
      const startPrice = Number(carDetails.bookValue);
      const durationInMinutes = 30; // Default auction duration

      axiosInstance.post("/1.0/auction/push", {
        carId: carId,
        startPrice: startPrice,
        durationInMinutes: durationInMinutes
      }).then((res) => {
        alert("Successfully pushed car to auction");

        setTimeout(()=>{
            window.location.href = '/cars'
        },1000);

      }).catch((err) => {
        alert(err?.response?.data?.message || "Something went wrong");
        console.log('err', err);
      })


    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
      console.error("Error listing Car:", error);
    }
  }

  // Function to update car selling price
  const updateCarPrice = async () => {
    if (!carDetails?.id || !editedPrice) return;
    
    try {
      setUpdatingPrice(true);
      
      await axiosInstance.put("/1.0/car/update/" + carDetails.id, {
        sellingPrice: editedPrice.toString()
      });
      
      toast.success("Price updated successfully");
      
      // Update local state with the new price
      setCarDetails({...carDetails, sellingPrice: editedPrice});
      setShowPriceModal(false);
      
      // Refresh car details to ensure we have the latest data
      fetchCarDetails();
      
    } catch (error: any) {
      toast.error(error?.message || "Failed to update price");
      console.error("Error updating price:", error);
    } finally {
      setUpdatingPrice(false);
    }
  };

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




  const removeCarStatusFromAuction = async (auctionId: string) => {
    try {
      axiosInstance.post("/1.0/auction/close/" + auctionId,{
        closeReason: 'User requested to close the auction',
      }).then((res) => {
        alert("Successfully removed car from auction");

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



  // Function to place an internal bid based on selling price
  const placeInternalBid = async () => {
    if (!carDetails?.id || !bidAmount) return;
    
    try {
      setPlacingBid(true);
      
      const auctionId = searchParams.get('auctionId') || '';

      axiosInstance.post(`/1.0/auction/${auctionId}/bid`, {
        amount: bidAmount
      })
      .then(response => {
        // Show success message
        alert(`Your bid of SAR ${numberWithCommas(bidAmount)} has been submitted successfully!`);
        // Redirect to listing page
        window.location.reload(); 
      })
      .catch(error => {
        console.error('Error submitting bid:', error);
        alert(`Failed to submit bid: ${error.response?.data?.message || 'Please try again later'}`);
      });

      
      toast.success("Internal bid placed successfully");
      
      // Refresh the page to show the new bid
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to place internal bid");
      console.error("Error placing internal bid:", error);
    } finally {
      setPlacingBid(false);
    }
  }


  // Winner section component
  const renderWinnerSection = () => {
    const auctionId = searchParams.get('auctionId');
    
    if (!auctionId || !carDetails?.carStatus?.toLowerCase().includes('auction')) {
      return null;
    }
    
    return (
      <div className="mb-6">
        {loadingWinner ? (
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-900 mr-3"></div>
            <p className="text-blue-900 font-medium">Loading auction results...</p>
          </div>
        ) : winner ? (
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm border-l-4 border-blue-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Trophy className="h-8 w-8 text-blue-900" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-blue-900">Current High Bidder</h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current High Bidder</p>
                    <p className="font-medium">{winner?.user?.firstName + " " + (winner?.user?.lastName || "" ) || 'Anonymous'}</p>
                    {winner?.user?.email && <p className="text-sm text-gray-500">{winner?.user?.email}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current High Bid</p>
                    <p className="font-bold text-blue-900">SAR {numberWithCommas(winner?.winningAmount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Winner
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border-l-4 border-yellow-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Auction in progress. No winner has been determined yet.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };



  return (
    <div>
     
      <PageHeader 
        title={carDetails ? `${carDetails.make} ${carDetails.model} ${carDetails.modelYear}` : "Car Details"} 
        description={`Car ID: ${params.id}`}
      />
      
      {/* Reveal Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Selling Price</h3>
              
              <div className="flex items-center mb-4">
                {coverImage ? (
                  <img 
                    src={coverImage} 
                    alt="Car thumbnail" 
                    className="w-20 h-20 object-cover rounded-md mr-4" 
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                
                <div>
                  <p className="font-medium">{carDetails?.make} {carDetails?.model}</p>
                  <p className="text-sm text-gray-500">{carDetails?.modelYear}</p>
                  <p className="text-xs text-gray-400">Reef: {carDetails?.id || 'N/A'}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">Selling Price (SAR)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">SAR</span>
                  </div>
                  <input
                    type="number"
                    id="sellingPrice"
                    className="pl-12 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 border-2"
                    value={editedPrice || ''}
                    onChange={(e) => setEditedPrice(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setShowPriceModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                  onClick={updateCarPrice}
                  disabled={updatingPrice}
                >
                  {updatingPrice ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>Save</>  
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      

      {showRevealPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reveal Price</h3>
              
              <div className="flex items-center mb-4">
                {coverImage ? (
                  <img 
                    src={coverImage} 
                    alt="Car thumbnail" 
                    className="w-20 h-20 object-cover rounded-md mr-4" 
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                
                <div>
                  <p className="font-medium">{carDetails?.make} {carDetails?.model}</p>
                  <p className="text-sm text-gray-500">{carDetails?.modelYear}</p>
                  <p className="text-xs text-gray-400">Reef: {carDetails?.id || 'N/A'}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">Selling Price (SAR)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">SAR</span>
                  </div>
                  <input
                    type="number"
                    id="sellingPrice"
                    className="pl-12 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 border-2"
                    value={revealPrice || carDetails?.sellingPrice}
                    onChange={(e) => setRevealPrice(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setShowRevealPriceModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                  onClick={() => {
                    if(confirm("Are you sure you want to reveal the price")) {
                      setShowRevealPriceModal(false);
                      toast("Price revealed successfully",{autoClose: 5000,position: "top-right",type: "success"});
      
                    }
                  }}
                  disabled={false}
                >
                  {updatingPrice ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Reveal...
                    </>
                  ) : (
                    <>Reveal</>  
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* Main content layout with auction history in right corner */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          {/* Winner Section */}
          {winner && winner?.winnerUserId && user?.role != 'sale' && renderWinnerSection()}
      


        
         
         {user && user?.role != 'sale' ?  <>
          {carDetails?.carStatus == 'inspected' || carDetails?.carStatus == 'unlisted'    ?
          <div className={'w-75 flex items-end justify-end'}>
           <div 
             onClick={()=>{
               if(!carDetails?.sellingPrice) {
                 toast.error("Cannot push to listing: Selling price is not set");
                 return;
               }
               if(confirm("Are you sure you want to push this car for listing")) {
                 markCarAsListed(carDetails?.id);
               }
             }} 
             className={`flex border ${!carDetails?.sellingPrice ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#5cb85c] cursor-pointer'} border-success p-2 rounded-md text-center text-white items-center justify-center`}
             title={!carDetails?.sellingPrice ? "Selling price must be set before pushing to listing" : "Push this car to listing"}
           >
             <ArrowUp/>&nbsp;
             <div>Push to Listing</div>
           </div>


           <div onClick={()=>{
             if(confirm("Are you sure you want to push this car for inventory")) {
               markCarAsInventory(carDetails?.id);
             }
           }} className={'ml-1 mr-1 flex border bg-red-500 border-red-500 p-2 rounded-md text-center text-white items-center cursor-pointer justify-center'}>
             <ArrowUp/>&nbsp;
             <div >Push to Inventory</div>
           </div>


           <div 
             onClick={()=>{
               if(!carDetails?.sellingPrice) {
                 toast.error("Cannot push to auction: Selling price is not set");
                 return;
               }
               if(confirm("Are you sure you want to push this car for auction")) {
                 markCarAsAuctionListed(carDetails?.id);
               }
             }} 
             className={`border ${!carDetails?.sellingPrice ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#e9d502] cursor-pointer'} p-2 flex items-center justify-center rounded-md text-center text-white ml-1 mr-1`}
             title={!carDetails?.sellingPrice ? "Selling price must be set before pushing to auction" : "Push this car to auction"}
           >
             <Clock10/>&nbsp;
             <div>
               Push to Auction</div>
           </div>
           </div>

            : <></>}
             <div className={'w-75 flex items-end justify-end'}>
             {carDetails?.carStatus == 'listed' || carDetails?.carStatus == 'hold' || carDetails?.carStatus == 'sold' || carDetails?.carStatus == 'returned' || carDetails?.carStatus == 'push_to_auction'     ?  <div className={'flex items-center'}><div className={`mr-1 border-2 border-red-500 p-2 rounded-md text-center text-red-500`}>
          <button onClick={()=>{
            if(confirm("Are you sure you want to unlist this car from listing")) {

              if(carDetails?.carStatus == 'push_to_auction'){
                removeCarStatusFromAuction(searchParams.get('auctionId') || '');
              }else{
                markCarStatus(carDetails?.id,'unlisted');
              }
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
            <div className={`border-2 border-red-800 text-red-800 ml-1 mr-1 p-2 rounded-md text-center`}>
              <button onClick={()=>{
                if(confirm("Are you sure you want to push to inventory")) {
                     markCarAsInventory(carDetails?.id);
                }
              }}>Push to Inventory</button>
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
     
         </> : <></>}
    

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
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                  <span>{carDetails.sellingPrice ? `SAR ${Number(carDetails.sellingPrice).toLocaleString()}` : 'Not set'}</span>
                  {user?.role == 'admin' || user?.role == 'qa' ? <button
                    onClick={() => {
                      setEditedPrice(Number(carDetails.sellingPrice) || 0);
                      setShowPriceModal(true);
                    }}
                    className="ml-2 inline-flex items-center px-2 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className="ml-1">Edit</span>
                  </button> : <></>}
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
            <h3 className="text-lg leading-6 font-medium text-gray-900">{ searchParams.get('auctionId') ? 'Bids' : 'Bids History'}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">All bids placed on this car.</p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            {/* Sales role internal bid section */}
            {user && user.role === 'sale' && carDetails?.carStatus == 'push_to_auction'  && carDetails?.bookValue && (
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  Place Internal Bid
                </h4>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex-grow">
                    <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">Bid Amount (SAR)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">SAR</span>
                      </div>
                      <input
                        type="number"
                        id="bidAmount"
                        className="pl-12 pr-12 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md h-10"
                        placeholder="0.00"
                        min="0"
                        step="1000"
                        defaultValue={carDetails.bookValue}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <div className="flex px-2">
                          <button 
                            type="button" 
                            className="text-blue-500 hover:text-blue-700 focus:outline-none"
                            onClick={() => {
                              const input = document.getElementById('bidAmount') as HTMLInputElement;
                              const currentValue = Number(input.value) || 0;
                              input.value = String(currentValue + 1000);
                              setBidAmount(currentValue + 1000);
                            }}
                          >
                            +
                          </button>
                          <span className="mx-1 text-gray-400">|</span>
                          <button 
                            type="button" 
                            className="text-blue-500 hover:text-blue-700 focus:outline-none"
                            onClick={() => {
                              const input = document.getElementById('bidAmount') as HTMLInputElement;
                              const currentValue = Number(input.value) || 0;
                              if (currentValue >= 1000) {
                                input.value = String(currentValue - 1000);
                                setBidAmount(currentValue - 1000);
                              }
                            }}
                          >
                            -
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Current book value: SAR {Number(carDetails.bookValue).toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={placeInternalBid}
                    disabled={placingBid || !bidAmount}
                  >
                    {placingBid ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Placing Bid...
                      </>
                    ) : (
                      <>Place Bid</>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">This will place an internal bid based on the selling price of the car.</p>
              </div>
            )}
            
            {/* Bids list or empty state */}
            {bids && bids.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="py-2 align-middle inline-block min-w-full">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-blue-900">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Bidder
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Type
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bids.map((bid: any, index: number) => (
                          <tr key={bid.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-900">
                                  <DollarSign className="h-5 w-5" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {bid?.userJson ? bid.userJson?.firstName + " " +  (bid.userJson?.lastName || "") : 'Anonymous'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {bid.userJson?.email || ''}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">
                                SAR {Number(bid.amount).toLocaleString()}
                              </div>
                              {bid.previousAmount && (
                                <div className="text-xs text-gray-500">
                                  Previous: SAR {Number(bid.previousAmount).toLocaleString()}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(bid.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(bid.createdAt).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                  bid.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                  bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  bid.userJson?.id == winner?.winnerUserId ? 'bg-green-100 text-green-800' : 
                                  'bg-blue-100 text-blue-800'}`}>
                                {bid.userJson?.id == winner?.winnerUserId ? 'Winner' : bid.status || 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bid.userJson?.type === 'Dealer' ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Dealer
                                </span>
                              ) : bid.userJson?.type === 'Sales Agent' ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                  Sales Agent
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Standard
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Bid progress indicator */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Bid Progress</h4>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-900 bg-blue-200">
                          Starting: SAR {carDetails?.bookValue ? Number(carDetails.bookValue).toLocaleString() : '0'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-900 bg-blue-200">
                          Current Highest: SAR {bids.length > 0 ? Number(Math.max(...bids.map((b: any) => b.amount))).toLocaleString() : '0'}
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div 
                        style={{ 
                          width: `${bids.length > 0 ? 
                            Math.min(100, ((Math.max(...bids.map((b: any) => b.amount)) - carDetails?.bookValue) / carDetails?.bookValue) * 100) : 0}%` 
                        }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-900"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bids yet</h3>
                <p className="mt-1 text-sm text-gray-500">No bids have been placed on this car yet.</p>
              </div>
            )}
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
        
        {/* Auction History in right corner */}
        
        <div className="md:w-1/4 lg:w-1/3">
         {/* Reveal Price button is now accessible via the edit button next to the selling price */}
         {(user?.role == 'admin' || user?.role == 'qa') ? <button
         onClick={() => {
             //setShowRevealPriceModal(true);
             setShowRevealPriceModal(true);
         }}
         className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded mb-4"
         >
           Reveal Price
         </button> : <></>}
          <AuctionHistory auctions={auctionHistory} />
        </div>
      </div>
    </div>
  );
};

export default CarsDetails;