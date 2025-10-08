import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Cpu, FileCode } from 'lucide-react';

const IconWrapper = ({ children }: { children: React.ReactNode }) => <div className="pr-4 flex-shrink-0">{children}</div>;

interface Log {
  id: string;
  action: string;
  agentId: string;
  scarCoinCost: number;
  proofOfWitness?: string | null;
  timestamp: string;
  status: string;
}

const LogCard = ({ log }: { log: Log }) => {
  const isSuccess = log.status === 'SUCCESS';
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${isSuccess ? 'border-green-500' : 'border-yellow-500'} flex items-center`}>
      <IconWrapper>
        {isSuccess ? <CheckCircle className="text-green-500" /> : <AlertTriangle className="text-yellow-500" />}
      </IconWrapper>
      <div className="flex-grow">
        <p className="font-semibold text-gray-800">{log.action}</p>
        <p className="text-sm text-gray-500">
          Agent: <span className="font-mono bg-gray-100 px-1 rounded">{log.agentId || 'System'}</span> | Cost: {log.scarCoinCost} SC
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Witness: <span className="font-mono">{log.proofOfWitness?.substring(0, 12) || 'N/A'}...</span>
        </p>
      </div>
      <div className="text-right text-sm text-gray-500 flex-shrink-0">
        {new Date(log.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default function LivingLens() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskType, setTaskType] = useState('web');
  const [taskName, setTaskName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/logs?limit=10');
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data.logs);
    } catch (err) {
      const e = err as Error;
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'tasks.build_project',
          payload: { type: taskType, name: taskName },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit task');
      }

      setSubmitStatus({ type: 'success', message: `Task '${taskName}' submitted successfully!` });
      setTaskName('');
      setTimeout(fetchLogs, 2000);
    } catch (err) {
      const e = err as Error;
      setSubmitStatus({ type: 'error', message: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Cpu className="text-blue-600" size={32} />
            <h1 className="text-xl font-bold text-gray-700">Sovereign Agent Machine</h1>
          </div>
          <span className="text-sm font-semibold text-green-500">● Live</span>
        </nav>
      </header>

      <main className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FileCode className="mr-2 text-blue-600" />Control Panel
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="task-type" className="block text-sm font-medium text-gray-700 mb-1">
                Scaffold Type
              </label>
              <select
                id="task-type"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="web">Web App</option>
                <option value="mobile">Mobile App</option>
                <option value="lib">Shared Library</option>
                <option value="api">API Service</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="task-name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                id="task-name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g., new-blog-project"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !taskName}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Scaffold New Project'}
            </button>
          </form>
          {submitStatus && (
            <div
              className={`mt-4 p-3 rounded-md text-sm ${submitStatus.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}
            >
              {submitStatus.message}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold mb-6">Governance Log</h2>
          <div className="space-y-4">
            {isLoading && <p>Loading logs...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && logs.map((log) => <LogCard key={log.id} log={log} />)}
            {!isLoading && !error && logs.length === 0 && <p>No logs found.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
