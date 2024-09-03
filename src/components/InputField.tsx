interface InputFieldProps {
    value: string;
    isActive: boolean;
    bgColor: string;
}

function InputField({ value, isActive, bgColor }: InputFieldProps) {
    return (
        <div className={`w-14 h-14 border-2 m-1 flex items-center justify-center text-2xl font-bold ${isActive ? 'border-blue-500' : 'border-gray-500'} ${bgColor}`}>
            {value}
        </div>
    );
}

export default InputField;