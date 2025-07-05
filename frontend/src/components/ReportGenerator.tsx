import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { Download, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Report {
  id: string;
  name: string;
  type: string;
  format: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
}

export const ReportGenerator: React.FC = () => {
  const { hasRole } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasRole(['MANAGER', 'ADMIN'])) {
      loadReports();
    }
  }, [hasRole]);

  const loadReports = async () => {
    try {
      const response = await apiService.getReports({ limit: 5 });
      setReports(response.reports);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const generateInventoryReport = async (format: 'PDF' | 'EXCEL') => {
    setLoading(true);
    try {
      const response = await apiService.generateInventoryReport(format, true);
      toast.success('Report generation started. You will be notified when ready.');
      
      // Poll for report completion
      pollReportStatus(response.reportId);
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Report generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateForecastReport = async (format: 'PDF' | 'EXCEL') => {
    setLoading(true);
    try {
      const response = await apiService.generateForecastReport(format, 30);
      toast.success('Forecast report generation started.');
      
      pollReportStatus(response.reportId);
    } catch (error) {
      toast.error('Failed to generate forecast report');
      console.error('Forecast report generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const pollReportStatus = async (reportId: string) => {
    const checkStatus = async () => {
      try {
        const report = await apiService.getReport(reportId);
        
        if (report.status === 'COMPLETED') {
          toast.success('Report generated successfully!');
          loadReports();
          return;
        } else if (report.status === 'FAILED') {
          toast.error('Report generation failed');
          return;
        }
        
        // Continue polling if still processing
        setTimeout(checkStatus, 3000);
      } catch (error) {
        console.error('Failed to check report status:', error);
      }
    };

    setTimeout(checkStatus, 3000);
  };

  const downloadReport = async (reportId: string, fileName: string) => {
    try {
      const blob = await apiService.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
      console.error('Download failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!hasRole(['MANAGER', 'ADMIN'])) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">
          You don't have permission to access report generation.
        </p>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Report Generation</h2>
        
        <div className="grid grid-cols-1 gap-4 mb-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-4 w-4" />
              <h3 className="font-medium text-sm">Inventory Report</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Comprehensive stock levels and movements analysis
            </p>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => generateInventoryReport('PDF')}
                disabled={loading}
                className="flex-1"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'PDF'}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => generateInventoryReport('EXCEL')}
                disabled={loading}
                className="flex-1"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Excel'}
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-4 w-4" />
              <h3 className="font-medium text-sm">Forecast Report</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Sales predictions and demand analysis
            </p>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => generateForecastReport('PDF')}
                disabled={loading}
                className="flex-1"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'PDF'}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => generateForecastReport('EXCEL')}
                disabled={loading}
                className="flex-1"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Excel'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-md font-medium mb-4">Recent Reports</h3>
        {reports.length === 0 ? (
          <Card className="p-6 text-center min-h-[120px] flex items-center justify-center">
            <div>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No reports generated yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Generate your first report above</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.slice(0, 4).map((report) => (
              <Card key={report.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-sm truncate">{report.name}</h4>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                    {report.completedAt && (
                      <p className="text-xs text-muted-foreground/70">
                        Completed: {new Date(report.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {report.status === 'COMPLETED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadReport(report.id, `${report.name}.${report.format.toLowerCase()}`)}
                      className="ml-3 shrink-0"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </Card>
            ))}
            {reports.length > 4 && (
              <Card className="p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  +{reports.length - 4} more reports available
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
