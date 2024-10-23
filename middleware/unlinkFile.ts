import fs from 'fs';
import path from 'path';

// Utility function to unlink a file
const unlinkFile = (filePath: string) => {
  console.log('file path',filePath)
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });
    
  }
};

export { unlinkFile };
