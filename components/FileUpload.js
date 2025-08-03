import { useState } from 'react';
import { uploadFile, generateFilePath } from '../lib/storage';

export default function FileUpload({ userId, tripId, cityId, onFileUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file || !userId || !tripId || !cityId) return;

    setUploading(true);
    try {
      const filePath = generateFilePath(userId, tripId, cityId, file.name);
      const downloadURL = await uploadFile(file, filePath);
      
      const fileData = {
        id: Date.now().toString(),
        name: file.name,
        url: downloadURL,
        type: file.type,
        size: file.size,
        path: filePath,
        uploadedAt: new Date().toISOString()
      };

      onFileUploaded(fileData);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="mt-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div className="text-blue-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Uploading...
          </div>
        ) : (
          <>
            <div className="text-gray-500 mb-2">
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Drag and drop files here or
            </div>
            <label className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-800 font-medium">browse files</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
              />
            </label>
            <p className="text-xs text-gray-400 mt-2">
              PDF, Images, Documents (Max 10MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}