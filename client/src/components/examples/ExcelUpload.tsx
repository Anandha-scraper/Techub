import ExcelUpload from '../ExcelUpload';

export default function ExcelUploadExample() {
  return (
    <div className="p-4">
      <ExcelUpload 
        onFileUpload={(file) => {
          console.log('File uploaded:', file.name);
        }} 
      />
    </div>
  );
}