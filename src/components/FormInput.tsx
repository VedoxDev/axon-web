interface FormInputProps {
  id: string;
  type: string;
  placeholder: string;
  label: string;
  className?: string;
  required?: boolean;
}

function FormInput({ 
  id, 
  type, 
  placeholder, 
  label, 
  className = "", 
  required = false 
}: FormInputProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <p className='mb-2 text-sm text-gray-300'>{label}</p>
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        required={required}
        className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm"
      />
    </div>
  );
}

export default FormInput; 