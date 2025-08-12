import React, { useState } from 'react';
import { Dispute } from '@/api/entities';
import { VenueReport } from '@/api/entities';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useToast } from '@/components/ui/use-toast';
import { ShieldAlert, Flag, MessageSquare, Building, User, Calendar } from 'lucide-react';

const getDisputeStatusColor = (status) => {
    switch (status) {
        case 'open': return 'bg-blue-100 text-blue-800';
        case 'investigating': return 'bg-yellow-100 text-yellow-800';
        case 'awaiting_response': return 'bg-orange-100 text-orange-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        case 'closed': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100';
    }
};

const getReportStatusColor = (status) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'investigating': return 'bg-orange-100 text-orange-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        case 'dismissed': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100';
    }
};

const DisputeCard = ({ dispute, onStatusChange }) => {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                           <Badge variant="secondary" className="capitalize">{dispute.reason.replace('_', ' ')}</Badge>
                           <Badge className={getDisputeStatusColor(dispute.status)}>{dispute.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{dispute.description}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                            <p><User className="w-3 h-3 inline mr-1" /> Reporter: {dispute.reporter_name}</p>
                            <p><User className="w-3 h-3 inline mr-1" /> Defendant: {dispute.defendant_name}</p>
                            <p><Calendar className="w-3 h-3 inline mr-1" /> Opened: {format(new Date(dispute.created_date), 'PPP')}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full lg:w-48">
                         <Button asChild variant="outline" size="sm">
                            <Link to={createPageUrl(`DisputeDetails?id=${dispute.id}`)} target="_blank">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                View Conversation
                            </Link>
                        </Button>
                        <Select onValueChange={(newStatus) => onStatusChange(dispute.id, newStatus)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="investigating">Investigating</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const ReportCard = ({ report, onStatusChange }) => {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                           <Badge variant="secondary" className="capitalize">{report.report_type.replace('_', ' ')}</Badge>
                           <Badge className={getReportStatusColor(report.status)}>{report.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{report.description}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                             <p><User className="w-3 h-3 inline mr-1" /> Reporter ID: {report.reporter_id}</p>
                             <p><Calendar className="w-3 h-3 inline mr-1" /> Reported: {format(new Date(report.created_date), 'PPP')}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full lg:w-48">
                         <Button asChild variant="outline" size="sm">
                            <Link to={createPageUrl(`VenueDetails?id=${report.venue_id}`)} target="_blank">
                                <Building className="w-4 h-4 mr-2" />
                                View Venue
                            </Link>
                        </Button>
                        <Select onValueChange={(newStatus) => onStatusChange(report.id, newStatus, 'report')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="investigating">Investigating</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="dismissed">Dismissed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function DisputeResolution({ disputes = [], reports = [], onUpdate }) {
    const { toast } = useToast();

    const handleStatusChange = async (id, newStatus, type = 'dispute') => {
        try {
            if (type === 'dispute') {
                await Dispute.update(id, { status: newStatus });
            } else {
                await VenueReport.update(id, { status: newStatus });
            }
            toast({ title: 'Success', description: 'Status updated successfully.' });
            onUpdate();
        } catch (error) {
            console.error("Failed to update status:", error);
            toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
        }
    };
    
    const activeDisputes = disputes.filter(d => ['open', 'investigating', 'awaiting_response'].includes(d.status));
    const resolvedDisputes = disputes.filter(d => ['resolved', 'closed'].includes(d.status));
    
    const pendingReports = reports.filter(r => ['pending', 'investigating'].includes(r.status));
    const resolvedReports = reports.filter(r => ['resolved', 'dismissed'].includes(r.status));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dispute & Report Center</CardTitle>
                <CardDescription>Mediate booking disputes and review venue reports from users.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="disputes" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="disputes">
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            Booking Disputes ({activeDisputes.length})
                        </TabsTrigger>
                        <TabsTrigger value="reports">
                             <Flag className="w-4 h-4 mr-2" />
                             Venue Reports ({pendingReports.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="disputes" className="mt-4">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Active Cases</h3>
                            {activeDisputes.length > 0 ? (
                                activeDisputes.map(d => <DisputeCard key={d.id} dispute={d} onStatusChange={handleStatusChange} />)
                            ) : (
                                <p className="text-gray-500 text-sm">No active disputes.</p>
                            )}

                             <h3 className="text-lg font-medium pt-4 border-t">Resolved Cases</h3>
                             {resolvedDisputes.length > 0 ? (
                                resolvedDisputes.map(d => <DisputeCard key={d.id} dispute={d} onStatusChange={handleStatusChange} />)
                            ) : (
                                <p className="text-gray-500 text-sm">No resolved disputes.</p>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="reports" className="mt-4">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Pending Reports</h3>
                            {pendingReports.length > 0 ? (
                                pendingReports.map(r => <ReportCard key={r.id} report={r} onStatusChange={handleStatusChange} />)
                            ) : (
                                <p className="text-gray-500 text-sm">No pending venue reports.</p>
                            )}
                            
                             <h3 className="text-lg font-medium pt-4 border-t">Resolved Reports</h3>
                             {resolvedReports.length > 0 ? (
                                resolvedReports.map(r => <ReportCard key={r.id} report={r} onStatusChange={handleStatusChange} />)
                            ) : (
                                <p className="text-gray-500 text-sm">No resolved reports.</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}