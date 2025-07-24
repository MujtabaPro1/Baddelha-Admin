
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../service/api';
import { toast } from 'react-toastify';
import { createInspection } from '../service/inspection';
import PageHeader from '../components/PageHeader';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const CustomerCheckIn = () => {
    const navigate = useNavigate();
    
    // State for multi-step form
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    
    // Timer state - 30 minutes in seconds
    const [timeRemaining, setTimeRemaining] = useState(30 * 60);
    const [timerActive, setTimerActive] = useState(false);
    
    // Form state
    const [identifier, setIdentifier] = useState('');
    const [identifierType, setIdentifierType] = useState('phone'); // 'phone' or 'email'
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Steps in the check-in process
    const steps = [
        'Customer Identification',
        'Terms & Conditions',
        'Appointment Details',
        'Start Inspection'
    ];
    
    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    // Countdown timer effect
    useEffect(() => {
        let interval: number | undefined;
        
        if (timerActive && timeRemaining > 0) {
            interval = window.setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            toast.warning("Time limit reached for check-in process");
        }
        
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [timerActive, timeRemaining]);
    
    // Start timer when component mounts
    useEffect(() => {
        setTimerActive(true);
    }, []);
    
    // Function to fetch appointment by phone or email
    const fetchAppointment = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Validate input
            if (!identifier) {
                throw new Error(`Please enter a valid ${identifierType}`);
            }
            
            if (identifierType === 'phone' && !/^\d{9,10}$/.test(identifier)) {
                throw new Error('Please enter a valid phone number (9-10 digits)');
            }
            
            if (identifierType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
                throw new Error('Please enter a valid email address');
            }
            
            // Construct query parameter based on identifier type
            const queryParam = identifierType === 'phone' ? 
                `${identifier}` : `${identifier}`;
            
            const response = await axiosInstance.get(`/1.0/book-appointment?search=${queryParam}`);
            
            if (response.data && response.data.length > 0) {
                // Get the most recent appointment
                const sortedAppointments = response.data.sort((a: any, b: any) => 
                    new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
                );
                
                const appointmentData = sortedAppointments[0];
                // Parse car details if they exist
                if (appointmentData.carDetail) {
                    appointmentData.car = JSON.parse(appointmentData.carDetail);
                }
                
                setAppointment(appointmentData);
                
                // Mark current step as completed
                if (!completedSteps.includes(currentStep)) {
                    setCompletedSteps(prev => [...prev, currentStep]);
                }
                
                // Move to next step
                setCurrentStep(1);
            } else {
                throw new Error(`No scheduled appointments found for this ${identifierType}`);
            }
        } catch (err: any) {
            console.error('Error fetching appointment:', err);
            setError(err.message || `Failed to find appointment with this ${identifierType}`);
        } finally {
            setLoading(false);
        }
    };
    
    // Function to start the inspection process
    const startInspection = async () => {
        setLoading(true);
        setError(null);
        
        try {
            if (!appointment) {
                throw new Error('No appointment data available');
            }
            
            // Create a new inspection
            const inspectionData = {
                appointmentId: appointment.uid,
                customerId: appointment.customerId,
                carId: appointment.carId,
                branchId: appointment.branchId
            };
            
            const response = await createInspection(inspectionData);
            
            if (response && response.id) {
                toast.success('Inspection started successfully!');
                // Navigate to the inspection report page
                navigate(`/inspection-report/${response.id}`);
            } else {
                throw new Error('Failed to create inspection');
            }
        } catch (err: any) {
            console.error('Error starting inspection:', err);
            setError(err.message || 'Failed to start inspection');
            toast.error(err.message || 'Failed to start inspection');
        } finally {
            setLoading(false);
        }
    };
    
    // Render the current step
    const renderStep = () => {
        switch (currentStep) {
            case 0: // Customer Identification
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Enter Your Contact Information</h2>
                        <p className="text-gray-600 mb-6">Please enter your phone number or email address to find your appointment.</p>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Identification Type</label>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input 
                                        type="radio" 
                                        className="form-radio text-blue-900" 
                                        name="identifierType" 
                                        value="phone" 
                                        checked={identifierType === 'phone'}
                                        onChange={() => setIdentifierType('phone')}
                                    />
                                    <span className="ml-2">Phone Number</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input 
                                        type="radio" 
                                        className="form-radio text-blue-900" 
                                        name="identifierType" 
                                        value="email" 
                                        checked={identifierType === 'email'}
                                        onChange={() => setIdentifierType('email')}
                                    />
                                    <span className="ml-2">Email Address</span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {identifierType === 'phone' ? 'Phone Number' : 'Email Address'}
                            </label>
                            <input 
                                type={identifierType === 'phone' ? 'tel' : 'email'}
                                className="form-input w-full"
                                placeholder={identifierType === 'phone' ? '5XXXXXXXX (without country code)' : 'email@example.com'}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                        </div>
                        
                        <button 
                            onClick={fetchAppointment}
                            disabled={loading || !identifier}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Searching...' : 'Find My Appointment'}
                        </button>
                    </div>
                );
                
            case 1: // Terms & Conditions
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Terms & Conditions</h2>
                        <div className="border rounded-md p-4 h-64 overflow-y-auto mb-6 bg-gray-50">
                            <h3 className="font-medium mb-2">Baddelha Inspection Terms</h3>
                            <p className="mb-4">By proceeding with this inspection, you agree to the following terms:</p>
                            <ol className="list-decimal pl-5 space-y-2">
                                <li>You authorize Baddelha's inspector to examine your vehicle thoroughly.</li>
                                <li>The inspection report will be used to evaluate your vehicle's condition and value.</li>
                                <li>You confirm that all information provided about the vehicle is accurate and complete.</li>
                                <li>You understand that any discrepancies found during inspection may affect the vehicle's valuation.</li>
                                <li>Baddelha is not responsible for any pre-existing conditions or damages not identified during inspection.</li>
                                <li>The inspection process may take up to 30 minutes to complete.</li>
                                <li>You agree to provide access to all vehicle areas and components as requested by the inspector.</li>
                                <li>You acknowledge that photographs will be taken of your vehicle for documentation purposes.</li>
                                <li>Personal data collected will be handled in accordance with our privacy policy.</li>
                                <li>You have the right to receive a copy of the completed inspection report.</li>
                            </ol>
                        </div>
                        
                        <div className="mb-6">
                            <label className="inline-flex items-center">
                                <input 
                                    type="checkbox" 
                                    className="form-checkbox text-blue-900 h-5 w-5" 
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                                <span className="ml-2 text-gray-700">I have read and agree to the terms and conditions</span>
                            </label>
                        </div>
                        
                        <div className="flex justify-between">
                            <button 
                                onClick={() => setCurrentStep(0)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <ChevronLeft size={16} className="mr-1" />
                                Back
                            </button>
                            
                            <button 
                                onClick={() => {
                                    if (!completedSteps.includes(currentStep)) {
                                        setCompletedSteps(prev => [...prev, currentStep]);
                                    }
                                    setCurrentStep(2);
                                }}
                                disabled={!termsAccepted}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                            >
                                Continue
                                <ChevronRight size={16} className="ml-1" />
                            </button>
                        </div>
                    </div>
                );
                
            case 2: // Appointment Details
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Your Appointment Details</h2>
                        
                        {appointment ? (
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h3 className="font-medium text-lg mb-2">Vehicle Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Make & Model</p>
                                            <p className="font-medium">{appointment.car?.make} {appointment.car?.model}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Year</p>
                                            <p className="font-medium">{appointment.car?.year}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Color</p>
                                            <p className="font-medium">{appointment.car?.color || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Plate Number</p>
                                            <p className="font-medium">{appointment.car?.plateNumber || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h3 className="font-medium text-lg mb-2">Appointment Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Date & Time</p>
                                            <p className="font-medium">
                                                {new Date(appointment.appointmentDate).toLocaleDateString()} at {' '}
                                                {new Date(appointment.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Branch</p>
                                            <p className="font-medium">{appointment.Branch?.enName || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Purpose</p>
                                            <p className="font-medium capitalize">{appointment.purpose || 'Inspection'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <p className="font-medium capitalize">{appointment.status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No appointment data available. Please go back and try again.</p>
                        )}
                        
                        <div className="flex justify-between mt-6">
                            <button 
                                onClick={() => setCurrentStep(1)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <ChevronLeft size={16} className="mr-1" />
                                Back
                            </button>
                            
                            <button 
                                onClick={() => {
                                    if (!completedSteps.includes(currentStep)) {
                                        setCompletedSteps(prev => [...prev, currentStep]);
                                    }
                                    setCurrentStep(3);
                                }}
                                disabled={!appointment}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                            >
                                Continue
                                <ChevronRight size={16} className="ml-1" />
                            </button>
                        </div>
                    </div>
                );
                
            case 3: // Start Inspection
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                        <div className="mb-8">
                            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Check size={48} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-2">Ready to Begin Inspection</h2>
                            <p className="text-gray-600">
                                Your vehicle is now ready for inspection. Click the button below to start the process.
                            </p>
                        </div>
                        
                        <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-md mb-8">
                            <h3 className="font-medium mb-2">What happens next?</h3>
                            <ol className="text-left list-decimal pl-5 space-y-1">
                                <li>Our inspector will examine your vehicle thoroughly</li>
                                <li>Photos will be taken of various parts of the vehicle</li>
                                <li>A detailed condition report will be generated</li>
                                <li>You'll receive a copy of the inspection report</li>
                            </ol>
                        </div>
                        
                        <div className="flex justify-between">
                            <button 
                                onClick={() => setCurrentStep(2)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <ChevronLeft size={16} className="mr-1" />
                                Back
                            </button>
                            
                            <button 
                                onClick={startInspection}
                                disabled={loading}
                                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Starting...' : 'Start Inspection'}
                            </button>
                        </div>
                        
                        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto lg:px-4 px-0  lg:py-8 py-0 max-w-4xl">
            <PageHeader 
                title="Customer Check-In" 
                description="Complete the check-in process to begin your vehicle inspection"
            />
            
            {/* Timer display */}
            {/* <div className="mb-6 flex justify-center">
                <div className="bg-blue-900 text-white px-4 py-2 rounded-md inline-flex items-center">
                    <span className="mr-2">Time Remaining:</span>
                    <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                </div>
            </div> */}
            
            {/* Progress bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    {steps.map((step, index) => (
                        <div 
                            key={index} 
                            className="flex flex-col items-center relative"
                        >
                            <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === index ? 'bg-blue-900 text-white' : 
                                    completedSteps.includes(index) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                            >
                                {completedSteps.includes(index) ? (
                                    <Check size={20} />
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <span className="text-xs mt-2 text-center">{step}</span>
                        </div>
                    ))}
                </div>
                
                <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                        <div 
                            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }} 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-900 transition-all duration-500"
                        ></div>
                    </div>
                </div>
            </div>
            
            {/* Step content */}
            {renderStep()}
        </div>
    );
};
 
export default CustomerCheckIn;