import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Booking } from '@/api/entities';
import { VenueReport } from '@/api/entities';
import { Dispute } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DownloadCloud, FileText, Calendar, TrendingUp, 
  Users, AlertTriangle, DollarSign, BarChart3 
} from 'lucide-react';
import { formatCurrency } from '@/components/common/FormatUtils';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AdminReportCenter() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    generateReport();
  }, [dateRange, reportType]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const startDate = new Date(dateRange.start_date);
      const endDate = new Date(dateRange.end_date);
      endDate.setHours(23, 59, 59, 999);

      // Fetch data based on report type
      let data = {};

      if (reportType === 'overview' || reportType === 'financial') {
        const bookings = await Booking.filter({
          created_date: { '$gte': startDate.toISOString(), '$lte': endDate.toISOString() }
        });
        
        data.bookings = bookings;
        data.totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        data.totalBookings = bookings.length;
        data.confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
        data.cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
      }

      if (reportType === 'overview' || reportType === 'venues') {
        const venues = await Venue.filter({
          created_date: { '$gte': startDate.toISOString(), '$lte': endDate.toISOString() }
        });
        data.venues = venues;
        data.newVenues = venues.length;
        data.activeVenues = venues.filter(v => v.status === 'active').length;
        data.pendingVenues = venues.filter(v => v.status === 'pending_approval').length;
      }

      if (reportType === 'overview' || reportType === 'users') {
        const users = await User.filter({
          created_date: { '$gte': startDate.toISOString(), '$lte': endDate.toISOString() }
        });
        data.users = users;
        data.newUsers = users.length;
        data.venueOwners = users.filter(u => u.user_type === 'venue_owner').length;
        data.regularUsers = users.filter(u => u.user_type === 'regular').length;
      }

      if (reportType === 'overview' || reportType === 'issues') {
        const reports = await VenueReport.filter({
          created_date: { '$gte': startDate.toISOString(), '$lte': endDate.toISOString() }
        });
        const disputes = await Dispute.filter({
          created_date: { '$gte': startDate.toISOString(), '$lte': endDate.toISOString() }
        });
        data.reports = reports;
        data.disputes = disputes;
        data.totalReports = reports.length;
        data.totalDisputes = disputes.length;
        data.resolvedIssues = [...reports, ...disputes].filter(i => i.status === 'resolved').length;
      }

      setReportData(data);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report."
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    if (!reportData) return;

    try {
      let exportData;
      let filename;

      switch (reportType) {
        case 'overview':
          exportData = {
            period: `${dateRange.start_date} to ${dateRange.end_date}`,
            summary: {
              totalRevenue: reportData.totalRevenue,
              totalBookings: reportData.totalBookings,
              newVenues: reportData.newVenues,
              newUsers: reportData.newUsers,
              totalReports: reportData.totalReports,
              totalDisputes: reportData.totalDisputes
            }
          };
          filename = `platform_overview_${dateRange.start_date}_${dateRange.end_date}`;
          break;

        case 'financial':
          exportData = {
            period: `${dateRange.start_date} to ${dateRange.end_date}`,
            bookings: reportData.bookings?.map(b => ({
              id: b.id,
              venue_id: b.venue_id,
              amount: b.total_amount,
              currency: b.currency,
              status: b.status,
              created_date: b.created_date
            })) || [],
            summary: {
              totalRevenue: reportData.totalRevenue,
              confirmedBookings: reportData.confirmedBookings,
              cancelledBookings: reportData.cancelledBookings
            }
          };
          filename = `financial_report_${dateRange.start_date}_${dateRange.end_date}`;
          break;

        case 'venues':
          exportData = {
            period: `${dateRange.start_date} to ${dateRange.end_date}`,
            venues: reportData.venues?.map(v => ({
              id: v.id,
              title: v.title,
              owner_id: v.owner_id,
              status: v.status,
              city: v.location?.city,
              created_date: v.created_date
            })) || []
          };
          filename = `venues_report_${dateRange.start_date}_${dateRange.end_date}`;
          break;

        default:
          exportData = reportData;
          filename = `${reportType}_report_${dateRange.start_date}_${dateRange.end_date}`;
      }

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Simple CSV export for bookings data
        if (reportData.bookings) {
          const csvContent = [
            'ID,Venue ID,Amount,Currency,Status,Created Date',
            ...reportData.bookings.map(b => 
              `${b.id},${b.venue_id},${b.total_amount || 0},${b.currency || 'USD'},${b.status},${b.created_date}`
            )
          ].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }

      toast({
        title: "Export Complete",
        description: `Report exported as ${format.toUpperCase()}`
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export report."
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Report Center</h1>
          <p className="text-gray-600">Generate and export detailed platform reports</p>
        </div>
      </div>

      {/* Report Configuration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="report_type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Platform Overview</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="venues">Venues Report</SelectItem>
                  <SelectItem value="users">Users Report</SelectItem>
                  <SelectItem value="issues">Issues & Disputes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange(prev => ({...prev, start_date: e.target.value}))}
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange(prev => ({...prev, end_date: e.target.value}))}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={() => exportReport('json')} variant="outline" disabled={loading || !reportData}>
                <DownloadCloud className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button onClick={() => exportReport('csv')} variant="outline" disabled={loading || !reportData}>
                <FileText className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner />}

      {/* Report Results */}
      {reportData && !loading && (
        <div className="space-y-6">
          {/* Overview Cards */}
          {(reportType === 'overview' || reportType === 'financial') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(reportData.totalRevenue || 0, 'USD')}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-3xl font-bold text-gray-900">{reportData.totalBookings || 0}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Confirmed</p>
                      <p className="text-3xl font-bold text-gray-900">{reportData.confirmedBookings || 0}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cancelled</p>
                      <p className="text-3xl font-bold text-gray-900">{reportData.cancelledBookings || 0}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Tables based on report type */}
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              {reportData.bookings && <TabsTrigger value="bookings">Bookings</TabsTrigger>}
              {reportData.venues && <TabsTrigger value="venues">Venues</TabsTrigger>}
              {reportData.users && <TabsTrigger value="users">Users</TabsTrigger>}
            </TabsList>

            <TabsContent value="summary" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Summary</CardTitle>
                  <p className="text-sm text-gray-600">
                    Period: {dateRange.start_date} to {dateRange.end_date}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {reportData.totalRevenue !== undefined && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalRevenue, 'USD')}</p>
                        <p className="text-sm text-gray-600">Revenue</p>
                      </div>
                    )}
                    {reportData.totalBookings !== undefined && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{reportData.totalBookings}</p>
                        <p className="text-sm text-gray-600">Bookings</p>
                      </div>
                    )}
                    {reportData.newVenues !== undefined && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{reportData.newVenues}</p>
                        <p className="text-sm text-gray-600">New Venues</p>
                      </div>
                    )}
                    {reportData.newUsers !== undefined && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{reportData.newUsers}</p>
                        <p className="text-sm text-gray-600">New Users</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {reportData.bookings && (
              <TabsContent value="bookings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Booking ID</th>
                            <th className="text-left p-2">Amount</th>
                            <th className="text-left p-2">Status</th>
                            <th className="text-left p-2">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.bookings.slice(0, 20).map(booking => (
                            <tr key={booking.id} className="border-b">
                              <td className="p-2">{booking.id.slice(0, 8)}</td>
                              <td className="p-2">{formatCurrency(booking.total_amount || 0, booking.currency || 'USD')}</td>
                              <td className="p-2">
                                <Badge className={`${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {booking.status}
                                </Badge>
                              </td>
                              <td className="p-2">{new Date(booking.created_date).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
}