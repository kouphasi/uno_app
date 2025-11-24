interface ColorPickerProps {
  onSelectColor: (color: string) => void;
  onCancel: () => void;
}

export default function ColorPicker({ onSelectColor, onCancel }: ColorPickerProps) {
  const colors = [
    { name: 'red', code: '#ff0000', label: 'Red' },
    { name: 'green', code: '#00ff00', label: 'Green' },
    { name: 'blue', code: '#0000ff', label: 'Blue' },
    { name: 'yellow', code: '#ffff00', label: 'Yellow' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Choose a Color
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => onSelectColor(color.name)}
              className="h-24 rounded-lg font-bold text-white text-xl transition-transform hover:scale-110 shadow-lg"
              style={{ backgroundColor: color.code }}
            >
              {color.label}
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
