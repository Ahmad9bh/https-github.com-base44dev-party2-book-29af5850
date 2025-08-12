import React, { useState, useEffect } from 'react';
import { Dispute } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gavel, Clock, CheckCircle, ShieldQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';

const statusConfig = {
    open: { label: "Open", color: "bg-red-100 text-red-800", icon: <Gavel className="w-3 h-3" /> },
    investigating: { label: "Investigating", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3 h-3" /> },
    awaiting_response: { label: "Awaiting Response", color: "bg-blue-100 text-blue-800", icon: <ShieldQuestion className="w-3 h-3" /> },
    resolved: { label: "Resolved", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> },
    closed: { label: "Closed", color: "bg-gray-100 text-gray-800", icon: <CheckCircle className="w-3 h-3" /> },
};

export default function DisputeResolution() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const allDisputes = await Dispute.list('-created_date', 200);
      setDisputes(allDisputes || []);
    } catch (error) {
      console.error("Failed to load disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDisputesByStatus = (statuses) => {
    return disputes.filter(d => statuses.includes(d.status));
  };

  const DisputeList = ({ disputes }) => {
    if (disputes.length === 0) {
      return <p className="text-gray-500 py-8 text-center">No disputes in this category.</p>;
    }
    return (
      <div className="space-y-4">
        {disputes.map(dispute => (
          <Card key={dispute.id}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${statusConfig[dispute.status]?.color}`}>
                      {statusConfig[dispute.status]?.icon}
                      <span className="ml-1">{statusConfig[dispute.status]?.label}</span>
                    </Badge>
                    <p className="font-semibold">{dispute.reason.replace(/_/g, ' ')}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Case ID: <span className="font-mono text-xs">{dispute.id}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Reported by <strong>{dispute.reporter_name}</strong> against <strong>{dispute.defendant_name}</strong> on {format(new Date(dispute.created_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex items-center">
                   <Button asChild>
                    <Link to={createPageUrl(`DisputeDetails?id=${dispute.id}`)}>
                      View Case
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
        <CardHeader className="px-0">
            <CardTitle className="text-2xl">Dispute Resolution Center</CardTitle>
            <CardDescription>Mediate and resolve disputes between users and venue owners.</CardDescription>
        </CardHeader>

        <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">Active Cases ({filterDisputesByStatus(['open', 'investigating', 'awaiting_response']).length})</TabsTrigger>
                <TabsTrigger value="resolved">Resolved ({filterDisputesByStatus(['resolved']).length})</TabsTrigger>
                <TabsTrigger value="closed">Closed ({filterDisputesByStatus(['closed']).length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-6">
                <DisputeList disputes={filterDisputesByStatus(['open', 'investigating', 'awaiting_response'])} />
            </TabsContent>
            <TabsContent value="resolved" className="mt-6">
                 <DisputeList disputes={filterDisputesByStatus(['resolved'])} />
            </TabsContent>
            <TabsContent value="closed" className="mt-6">
                 <DisputeList disputes={filterDisputesByStatus(['closed'])} />
            </TabsContent>
        </Tabs>
    </div>
  );
}