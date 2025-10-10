import React, { useState, ChangeEvent } from 'react';
import { X } from 'lucide-react';

type FieldDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  fieldName: string;
  onSave: (details: { comment: string; image: string | null }) => void;
};

const FieldDetailsModal: React.FC<FieldDetailsModalProps> = ({
  isOpen,
  onClose,
  fieldName,
  onSave,
}) => {
  const [comment, setComment] = useState('');
  const [image, setImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file size (limit to 1MB)
      if (selectedFile.size > 1024 * 1024) {
        alert('Image size should not exceed 1MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = () => {
    onSave({ comment, image });
    setComment('');
    setImage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Additional Details for {fieldName}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 h-24"
              placeholder="Add your comment here..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            {image ? (
              <div className="relative">
                <img 
                  src={image} 
                  alt="Selected" 
                  className="w-full h-40 object-cover rounded-md" 
                />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label 
                  htmlFor="image-upload"
                  className="cursor-pointer text-blue-900 hover:text-blue-700"
                >
                  Click to upload image
                </label>
                <p className="text-xs text-gray-500 mt-1">Max size: 1MB</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldDetailsModal;
