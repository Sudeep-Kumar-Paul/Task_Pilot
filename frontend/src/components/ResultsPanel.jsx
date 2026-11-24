export default function ResultsPanel({ result, taskType }) {
  if (!result) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col min-h-[400px] max-h-[600px]">
        <div className="px-4 py-3 border-b border-slate-800">
          <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
            <span className="text-base">📊</span>
            Results
          </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm py-12">
          <span className="text-3xl mb-2">📋</span>
          <p>No results yet.</p>
          <p className="text-xs mt-1">Results will appear here when the task completes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col min-h-[400px] max-h-[600px] animate-fade-in">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
          <span className="text-base">📊</span>
          Results
        </h3>
        <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-medium">
          Complete
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {taskType === 'price_comparison' && result.type === 'table' && (
          <PriceTable data={result} />
        )}
        {taskType === 'form_autofill' && result.type === 'confirmation' && (
          <Confirmation data={result} />
        )}
        {taskType === 'order_status' && result.type === 'status' && (
          <OrderStatus data={result} />
        )}

        {/* Fallback for any result type */}
        {!['table', 'confirmation', 'status'].includes(result.type) && (
          <GenericResult data={result} />
        )}
      </div>
    </div>
  );
}

function PriceTable({ data }) {
  const items = data.items || [];
  const columns = data.columns || ['Store', 'Price', 'Link'];

  return (
    <div className="space-y-3">
      {data.summary && (
        <p className="text-sm text-slate-300 mb-3">{data.summary}</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-700">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={i}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2.5 text-slate-300">
                    {col.toLowerCase() === 'link' && item[col] ? (
                      <a
                        href={item[col]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 underline"
                      >
                        Visit →
                      </a>
                    ) : (
                      item[col] ?? item[col.toLowerCase()] ?? '—'
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">
          No comparison data found.
        </p>
      )}
    </div>
  );
}

function Confirmation({ data }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
          <span className="text-emerald-400 text-lg">✓</span>
        </div>
        <div>
          <h4 className="font-medium text-white">Form Submitted</h4>
          <p className="text-sm text-slate-400">
            {data.message || 'The form was successfully filled and submitted.'}
          </p>
        </div>
      </div>

      {data.fields && (
        <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
          <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Submitted Fields
          </h5>
          {Object.entries(data.fields).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-slate-400">{key}</span>
              <span className="text-slate-200">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderStatus({ data }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📦</span>
        <div>
          <h4 className="font-medium text-white">Order Status</h4>
          <p className="text-sm text-slate-400">
            {data.order_id && `Order: ${data.order_id}`}
          </p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
        {data.status && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Status</span>
            <span className="text-indigo-400 font-medium">{data.status}</span>
          </div>
        )}
        {data.location && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Location</span>
            <span className="text-slate-200">{data.location}</span>
          </div>
        )}
        {data.estimated_delivery && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Est. Delivery</span>
            <span className="text-slate-200">{data.estimated_delivery}</span>
          </div>
        )}
        {data.last_update && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Last Update</span>
            <span className="text-slate-200">{data.last_update}</span>
          </div>
        )}
      </div>

      {data.message && (
        <p className="text-sm text-slate-300">{data.message}</p>
      )}
    </div>
  );
}

function GenericResult({ data }) {
  return (
    <div className="space-y-3">
      {data.message && (
        <p className="text-sm text-slate-300">{data.message}</p>
      )}
      <pre className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
