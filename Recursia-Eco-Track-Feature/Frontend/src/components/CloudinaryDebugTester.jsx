import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, Bug, CheckCircle, AlertCircle } from 'lucide-react';
import cloudinaryDebugger from '../services/cloudinary-debug';
import cloudinaryService from '../services/cloudinary';

const CloudinaryDebugTester = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setTestResults(null);
  };

  const runConnectionTest = async () => {
    setIsLoading(true);
    try {
      const result = await cloudinaryDebugger.testConnection();
      setTestResults({ type: 'connection', result });
    } catch (error) {
      setTestResults({ 
        type: 'connection', 
        result: { success: false, error: error.message } 
      });
    }
    setIsLoading(false);
  };

  const runUploadTest = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await cloudinaryDebugger.testUpload(selectedFile);
      setTestResults({ type: 'upload', result });
    } catch (error) {
      setTestResults({ 
        type: 'upload', 
        result: { success: false, error: error.message } 
      });
    }
    setIsLoading(false);
  };

  const runNormalUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await cloudinaryService.uploadImage(selectedFile, {
        folder: 'ecotrack-debug',
        tags: ['debug', 'test']
      });
      setTestResults({ type: 'normal', result });
    } catch (error) {
      setTestResults({ 
        type: 'normal', 
        result: { success: false, error: error.message } 
      });
    }
    setIsLoading(false);
  };

  const showConfiguration = () => {
    const config = cloudinaryDebugger.debugConfiguration();
    setTestResults({ type: 'config', result: config });
  };

  const showSetupInstructions = () => {
    const instructions = cloudinaryDebugger.getSetupInstructions();
    setTestResults({ type: 'instructions', result: instructions });
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Cloudinary Debug Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Test Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full p-2 border rounded"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button 
              onClick={showConfiguration} 
              variant="outline"
              disabled={isLoading}
            >
              Show Config
            </Button>
            
            <Button 
              onClick={runConnectionTest}
              variant="outline"
              disabled={isLoading}
            >
              Test Connection
            </Button>
            
            <Button 
              onClick={runUploadTest}
              variant="outline"
              disabled={isLoading || !selectedFile}
            >
              Debug Upload
            </Button>
            
            <Button 
              onClick={runNormalUpload}
              variant="outline"
              disabled={isLoading || !selectedFile}
            >
              Normal Upload
            </Button>
            
            <Button 
              onClick={showSetupInstructions}
              variant="outline"
              disabled={isLoading}
            >
              Setup Guide
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Running test...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResults.result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Test Results - {testResults.type}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-auto whitespace-pre-wrap">
                {JSON.stringify(testResults.result, null, 2)}
              </pre>
            </div>

            {testResults.type === 'instructions' && (
              <div className="mt-4 space-y-4">
                <h3 className="font-semibold">Setup Instructions:</h3>
                {testResults.result.steps.map((step) => (
                  <div key={step.step} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">
                      Step {step.step}: {step.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {step.description}
                    </p>
                    {step.action && (
                      <p className="text-sm font-medium text-blue-600 mt-1">
                        Action: {step.action}
                      </p>
                    )}
                    {step.details && (
                      <ul className="text-sm text-gray-600 mt-2 ml-4">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="list-disc">{detail}</li>
                        ))}
                      </ul>
                    )}
                    {step.code && (
                      <div className="bg-gray-100 p-2 rounded mt-2">
                        <code className="text-sm">{step.code}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CloudinaryDebugTester;