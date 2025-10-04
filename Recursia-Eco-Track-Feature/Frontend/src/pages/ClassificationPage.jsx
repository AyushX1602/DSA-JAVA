import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, History, BarChart3, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardTopbar from '../components/DashboardTopbar';
import WasteClassifier from '../components/WasteClassifier';
import ClassificationHistory from '../components/ClassificationHistory';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import toast from 'react-hot-toast';

const ClassificationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('classify');
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleClassificationComplete = (result) => {
    toast.success(`Waste classified as ${result.classification.predicted_class.toUpperCase()}!`);
    // Trigger history refresh
    setRefreshHistory(prev => prev + 1);
    // Switch to history tab to show the new classification
    setTimeout(() => {
      setActiveTab('history');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardTopbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Waste Classification
                </h1>
                <p className="text-gray-600 mt-1">
                  Classify your waste using AI-powered image recognition
                </p>
              </div>
            </div>
            
            {/* Quick Stats Card */}
            <Card className="w-64">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">AI Accuracy</p>
                    <p className="text-2xl font-bold text-green-600">94.2%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="classify" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Classify Waste
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="classify" className="mt-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Instructions Card */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">How it works</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Upload or Capture</h4>
                          <p className="text-gray-600">Take a photo or upload an image of your waste</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">AI Analysis</h4>
                          <p className="text-gray-600">Our AI analyzes the image and identifies waste type</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Get Results</h4>
                          <p className="text-gray-600">Receive classification with confidence score</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Waste Classifier Component */}
                <WasteClassifier onClassificationComplete={handleClassificationComplete} />
              </motion.div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ClassificationHistory key={refreshHistory} />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle>Tips for Better Classification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Good Lighting</h4>
                  <p className="text-gray-600">Ensure your waste item is well-lit and clearly visible</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600">Clear Focus</h4>
                  <p className="text-gray-600">Make sure the image is sharp and not blurry</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-600">Single Item</h4>
                  <p className="text-gray-600">Focus on one waste item at a time for best results</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-600">Full View</h4>
                  <p className="text-gray-600">Capture the entire item, not just a portion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ClassificationPage;