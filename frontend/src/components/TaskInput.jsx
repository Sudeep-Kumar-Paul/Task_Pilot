import { useState } from 'react';

const TASK_TEMPLATES = [
  {
    id: 'price_comparison',
    title: 'Price Comparison',
    icon: '🔍',
    description: 'Compare prices for a product across multiple websites.',
    fields: [
      { name: 'product_name', label: 'Product Name', placeholder: 'e.g. MacBook Air M3', type: 'text' },
      { name: 'budget', label: 'Max Budget ($)', placeholder: 'e.g. 1200', type: 'number' },
    ],
  },
  {
    id: 'form_autofill',
    title: 'Form Autofill',
    icon: '📝',
    description: 'Automatically fill and submit a web form.',
    fields: [
      { name: 'target_url', label: 'Form URL', placeholder: 'https://example.com/form', type: 'url' },
      { name: 'fields', label: 'Fields (JSON)', placeholder: '{"name": "John", "email": "john@example.com"}', type: 'text' },
    ],
  },
  {
    id: 'order_status',
    title: 'Order Status',
    icon: '📦',
    description: 'Check the status of an order or shipment.',
    fields: [
      { name: 'tracking_url', label: 'Tracking URL', placeholder: 'https://carrier.com/tracking', type: 'url' },
      { name: 'order_id', label: 'Order / Tracking ID', placeholder: 'e.g. 1Z999AA10123456784', type: 'text' },
    ],
  },
];

export default function TaskInput({ onSubmitTask, isRunning }) {
  const [expandedTask, setExpandedTask] = useState(null);
  const [formData, setFormData] = useState({});

  const handleExpand = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
    setFormData({});
  };

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (template) => {
    const params = {};
    for (const field of template.fields) {
      const value = formData[field.name]?.trim();
      if (!value) return;

      if (field.name === 'fields') {
        try {
          params[field.name] = JSON.parse(value);
        } catch {
          return;
        }
      } else if (field.type === 'number') {
        params[field.name] = Number(value);
      } else {
        params[field.name] = value;
      }
    }

    const taskDescription =
      template.id === 'price_comparison'
        ? `Compare prices for "${params.product_name}" with a budget of $${params.budget}`
        : template.id === 'form_autofill'
          ? `Autofill form at ${params.target_url}`
          : `Check order status for ${params.order_id}`;

    onSubmitTask({
      task: taskDescription,
      taskType: template.id,
      params,
    });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-200 mb-1">
        Choose a Task
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TASK_TEMPLATES.map((template) => {
          const isExpanded = expandedTask === template.id;

          return (
            <div
              key={template.id}
              className={`bg-slate-900 border rounded-xl transition-all duration-200 ${
                isExpanded
                  ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10 col-span-1 md:col-span-3'
                  : 'border-slate-800 hover:border-slate-700 cursor-pointer'
              }`}
            >
              {/* Card header */}
              <button
                onClick={() => handleExpand(template.id)}
                disabled={isRunning}
                className="w-full p-4 text-left flex items-center gap-3 disabled:opacity-50"
              >
                <span className="text-2xl">{template.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm">
                    {template.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {template.description}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Expanded form */}
              {isExpanded && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="border-t border-slate-800 pt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {template.fields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            {field.label}
                          </label>
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            placeholder={field.placeholder}
                            value={formData[field.name] || ''}
                            onChange={(e) =>
                              handleChange(field.name, e.target.value)
                            }
                            disabled={isRunning}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition-all"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSubmit(template)}
                      disabled={isRunning}
                      className="w-full md:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isRunning ? (
                        <>
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-white rounded-full thinking-dot" />
                            <div className="w-1.5 h-1.5 bg-white rounded-full thinking-dot" />
                            <div className="w-1.5 h-1.5 bg-white rounded-full thinking-dot" />
                          </div>
                          Running…
                        </>
                      ) : (
                        <>▶ Run Task</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
