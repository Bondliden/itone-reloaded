import React from 'react';
import { Upload, CheckCircle, Clock, XCircle, ExternalLink, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../modules/auth';
import { useUploadJobs } from '../hooks/usePlatinum';

export function UploadDashboard() {
  const { state: { user } } = useAuth();
  const { data: uploadJobs = [], refetch } = useUploadJobs(user?.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-400 animate-pulse" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
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

  const getPlatformIcon = (platformName: string) => {
    switch (platformName) {
      case 'spotify':
        return <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">SP</div>;
      case 'amazon_music':
        return <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center text-white font-bold text-xs">AM</div>;
      case 'apple_music':
        return <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center text-white font-bold text-xs">AP</div>;
      case 'youtube_music':
        return <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">YT</div>;
      case 'deezer':
        return <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">DZ</div>;
      default:
        return <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center text-white font-bold text-xs">??</div>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: uploadJobs.length,
    completed: uploadJobs.filter(job => job.upload_status === 'completed').length,
    processing: uploadJobs.filter(job => job.upload_status === 'processing').length,
    failed: uploadJobs.filter(job => job.upload_status === 'failed').length
  };

  return (
    <div className="space-y-6">
      {/* Upload Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
          <Upload className="h-6 w-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Uploads</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
          <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.completed}</div>
          <div className="text-sm text-gray-400">Completed</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
          <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.processing}</div>
          <div className="text-sm text-gray-400">Processing</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
          <XCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.failed}</div>
          <div className="text-sm text-gray-400">Failed</div>
        </div>
      </div>

      {/* Upload History */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Upload History</h3>
          <Button
            onClick={() => refetch()}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {uploadJobs.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">No Uploads Yet</h4>
            <p className="text-gray-400">
              Start uploading your recordings to streaming platforms!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {uploadJobs.map((job) => (
              <div key={job.id} className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getPlatformIcon(job.platform?.name || '')}
                    <div>
                      <h4 className="text-white font-medium">
                        {job.metadata?.title || 'Untitled Recording'}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {job.platform?.display_name} • {formatDate(job.created_at)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(job.upload_status)}
                        <span className={`text-xs font-medium capitalize ${getStatusColor(job.upload_status)}`}>
                          {job.upload_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {job.upload_status === 'completed' && job.platform_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(job.platform_url, '_blank')}
                        className="text-white hover:bg-white/10"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {job.upload_status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {job.error_message && (
                  <div className="mt-3 bg-red-600/20 border border-red-400/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{job.error_message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Usage Summary */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
          This Month's Usage
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {uploadJobs.filter(job => {
                const jobDate = new Date(job.created_at);
                const now = new Date();
                return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <div className="text-sm text-gray-400">Uploads This Month</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              ${uploadJobs.reduce((total, job) => total + job.cost_used, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">Value Included</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {Math.max(0, 10 - uploadJobs.filter(job => {
                const jobDate = new Date(job.created_at);
                const now = new Date();
                return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
              }).length)}
            </div>
            <div className="text-sm text-gray-400">Credits Remaining</div>
          </div>
        </div>

        <div className="mt-4 bg-green-600/20 border border-green-400/30 rounded-lg p-3">
          <p className="text-green-400 text-sm text-center">
            ✨ All uploads included in your Platinum subscription • No additional charges
          </p>
        </div>
      </div>
    </div>
  );
}