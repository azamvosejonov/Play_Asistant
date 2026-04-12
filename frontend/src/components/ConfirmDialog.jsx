import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export default function ConfirmDialog({ 
  title, 
  message, 
  details, 
  onConfirm, 
  onCancel, 
  confirmText = "Tasdiqlash",
  cancelText = "Bekor qilish",
  type = "warning" // warning, success, danger
}) {
  const colors = {
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700'
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    }
  };

  const color = colors[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {type === 'warning' && <AlertTriangle className={`w-8 h-8 ${color.icon}`} />}
            {type === 'success' && <CheckCircle className={`w-8 h-8 ${color.icon}`} />}
            {type === 'danger' && <AlertTriangle className={`w-8 h-8 ${color.icon}`} />}
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className={`${color.bg} border ${color.border} rounded-lg p-4 mb-4`}>
          <p className="text-gray-800">{message}</p>
        </div>

        {/* Details */}
        {details && (
          <div className="mb-4 bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-600 mb-2">Ma'lumotlar:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary-600">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-all ${color.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
