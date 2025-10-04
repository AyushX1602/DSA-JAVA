import React, { useState } from "react";
import axios from "axios";
import { motion } from 'framer-motion';
import { Button } from '../ui/button';


export function CertificateGenerator() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateCertificate = async () => {
    if (!name) {
      alert("Please enter a name");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5002/generate", { name }, { responseType: 'blob' });

      // Create a URL for the PDF and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "certificate.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating certificate:", error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto glass-card p-8 rounded-2xl relative"
      >
        <div className='gradient' />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Generate Your Certificate</h2>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Enter the Name to Display on Certificate</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            className="w-full px-3 py-2 rounded-lg border bg-white/50"
            onChange={(e) => setName(e.target.value)}
            style={{ padding: "10px", marginRight: "10px" }}
          />
        </div>
        <Button variant="default" onClick={handleGenerateCertificate} disabled={loading}>
          {loading ? "Generating..." : "Generate PDF"}
        </Button>


      </motion.div>
    </div>
  );
};

export default CertificateGenerator;
