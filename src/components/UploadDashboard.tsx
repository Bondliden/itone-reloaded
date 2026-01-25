import React from 'react';
import { Upload, CheckCircle, Clock, XCircle, ExternalLink, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useUploadJobs } from '../hooks/usePlatinum';

export function UploadDashboard() {
  const { user } = useAuth();
  const { data: uploadJobs = [], refetch } = useUploadJobs(user?.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-400 animate-pulse" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Upload className="h-5 w-5 text-purple-400" />
          Upload Jobs
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Total Jobs</div>
          <div className="text-2xl font-bold text-white">{uploadJobs.length}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Processing</div>
          <div className="text-2xl font-bold text-blue-400">
            {uploadJobs.filter(j => j.status === 'processing').length}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-400">
            {uploadJobs.filter(j => j.status === 'completed').length}
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Job ID</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Platform</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Progress</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {uploadJobs.map((job) => (
              <tr key={job.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                  #{job.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white capitalize">{job.platform}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    <span className={`text-sm ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-full bg-white/10 rounded-full h-1.5 max-w-[100px]">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        job.status === 'completed' ? 'bg-green-500' : 
                        job.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(job.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {uploadJobs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Upload className="h-12 w-12 text-white/10 mx-auto mb-4" />
                  <p className="text-gray-400">No upload jobs found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
