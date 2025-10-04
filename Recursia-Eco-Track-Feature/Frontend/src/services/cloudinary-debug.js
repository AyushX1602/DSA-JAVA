// Cloudinary Debug and Test Utilities
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ecotrack_preset';

class CloudinaryDebugger {
  constructor() {
    this.cloudName = CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = CLOUDINARY_UPLOAD_PRESET;
    this.baseUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}`;
  }

  // Debug configuration
  debugConfiguration() {
    const config = {
      cloudName: this.cloudName,
      uploadPreset: this.uploadPreset,
      baseUrl: this.baseUrl,
      timestamp: new Date().toISOString()
    };
    
    console.log('🔧 Cloudinary Configuration Debug:', config);
    
    // Check for common issues
    const issues = [];
    
    if (this.cloudName === 'demo' || this.cloudName === 'your_cloud_name') {
      issues.push('❌ Cloud name is not set or using default value');
    }
    
    if (this.uploadPreset === 'ecotrack_preset' || this.uploadPreset === 'your_upload_preset') {
      issues.push('❌ Upload preset might be using default value');
    }
    
    if (issues.length > 0) {
      console.warn('⚠️ Potential Configuration Issues:', issues);
    } else {
      console.log('✅ Configuration looks good');
    }
    
    return { config, issues };
  }

  // Test upload with detailed error info
  async testUpload(file) {
    try {
      console.log('🚀 Starting Cloudinary test upload...');
      this.debugConfiguration();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      
      console.log('📤 Uploading to:', `${this.baseUrl}/image/upload`);
      console.log('📋 Form data contents:');
      for (let [key, value] of formData.entries()) {
        if (key === 'file') {
          console.log(`  ${key}: File object (${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      const response = await fetch(`${this.baseUrl}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      console.log('📨 Response status:', response.status, response.statusText);
      console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload failed with response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.error('❌ Parsed error:', errorJson);
          return {
            success: false,
            error: errorJson.error?.message || `HTTP ${response.status}: ${response.statusText}`,
            details: errorJson
          };
        } catch (parseError) {
          return {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
            rawError: errorText
          };
        }
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);
      
      return {
        success: true,
        data: {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          createdAt: result.created_at
        }
      };
    } catch (error) {
      console.error('💥 Upload error:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  // Test if Cloudinary service is reachable
  async testConnection() {
    try {
      console.log('🌐 Testing Cloudinary connection...');
      const testUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload/sample.jpg`;
      
      const response = await fetch(testUrl, { method: 'HEAD' });
      console.log('📡 Connection test response:', response.status, response.statusText);
      
      if (response.ok) {
        console.log('✅ Cloudinary connection successful');
        return { success: true, message: 'Connection successful' };
      } else {
        console.log('❌ Cloudinary connection failed');
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      console.error('💥 Connection test error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get detailed configuration instructions
  getSetupInstructions() {
    return {
      steps: [
        {
          step: 1,
          title: "Check Cloudinary Account",
          description: "Log into your Cloudinary dashboard at https://cloudinary.com/console"
        },
        {
          step: 2,
          title: "Verify Cloud Name",
          description: `Your cloud name should be: ${this.cloudName}`,
          action: "Check if this matches your Cloudinary dashboard"
        },
        {
          step: 3,
          title: "Create Upload Preset",
          description: `Create an unsigned upload preset named: ${this.uploadPreset}`,
          action: "Go to Settings > Upload > Add upload preset"
        },
        {
          step: 4,
          title: "Configure Upload Preset",
          description: "Set the upload preset to 'Unsigned' mode",
          details: [
            "Signing Mode: Unsigned",
            "Folder: ecotrack (optional)",
            "Allowed formats: jpg, png, gif, webp",
            "Max file size: 10MB",
            "Auto tagging: enabled (optional)"
          ]
        },
        {
          step: 5,
          title: "Update Environment Variables",
          description: "Ensure your .env file has the correct values",
          code: `VITE_CLOUDINARY_CLOUD_NAME=${this.cloudName}\nVITE_CLOUDINARY_UPLOAD_PRESET=${this.uploadPreset}`
        }
      ]
    };
  }
}

// Export singleton instance
const cloudinaryDebugger = new CloudinaryDebugger();
export default cloudinaryDebugger;