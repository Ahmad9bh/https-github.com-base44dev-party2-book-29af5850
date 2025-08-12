import React, { useState, useEffect } from 'react';
import { SupportTicket } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, MessageCircle, Clock, CheckCircle, AlertTriangle, User as UserIcon, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { formatDistanceToNow } from 'date-fns';

export default function SupportTicketManager() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [searchTerm, statusFilter, priorityFilter, tickets]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const allTickets = await SupportTicket.list('-created_date', 100);
      setTickets(allTickets);
    } catch (err) {
      console.error('Failed to load support tickets:', err);
      error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.booking_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      setUpdating(true);
      const currentUser = await User.me();
      
      await SupportTicket.update(ticketId, {
        status: newStatus,
        assigned_to: currentUser.id,
        updated_date: new Date().toISOString()
      });

      success(`Ticket status updated to ${newStatus}`);
      loadTickets();
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      error('Failed to update ticket status');
    } finally {
      setUpdating(false);
    }
  };

  const assignTicket = async (ticketId) => {
    try {
      const currentUser = await User.me();
      
      await SupportTicket.update(ticketId, {
        assigned_to: currentUser.id,
        status: 'in_progress'
      });

      success('Ticket assigned to you');
      loadTickets();
    } catch (err) {
      console.error('Failed to assign ticket:', err);
      error('Failed to assign ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <MessageCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading tickets...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Support Ticket Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by subject, email, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'open').length}</p>
                <p className="text-sm text-gray-600">Open Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'in_progress').length}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{tickets.filter(t => t.priority === 'urgent').length}</p>
                <p className="text-sm text-gray-600">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'resolved').length}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Found</h3>
              <p className="text-gray-600">No support tickets match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(ticket.status)}
                        <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                          {ticket.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          <span>{ticket.user_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{ticket.user_email}</span>
                        </div>
                        <div>
                          <span>Created {formatDistanceToNow(new Date(ticket.created_date))} ago</span>
                        </div>
                      </div>
                      {ticket.booking_id && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">Booking ID: </span>
                          <span className="text-sm font-mono">{ticket.booking_id}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedTicket(ticket)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{ticket.subject}</DialogTitle>
                            <DialogDescription>
                              Ticket #{ticket.id} • Created {formatDistanceToNow(new Date(ticket.created_date))} ago
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Customer</Label>
                                <p className="text-sm">{ticket.user_name} ({ticket.user_email})</p>
                              </div>
                              <div>
                                <Label>Category</Label>
                                <p className="text-sm capitalize">{ticket.category?.replace('_', ' ')}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Description</Label>
                              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Select
                                defaultValue={ticket.status}
                                onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                                disabled={updating}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {!ticket.assigned_to && (
                                <Button onClick={() => assignTicket(ticket.id)} size="sm">
                                  Assign to Me
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {ticket.status === 'open' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                          disabled={updating}
                        >
                          Take Ticket
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 line-clamp-2">{ticket.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}