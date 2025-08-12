import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Phone, Shield, MapPin, Clock, Users, FileText, CheckCircle, XCircle, Zap } from 'lucide-react';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Booking } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import { useToast } from '@/components/ui/toast';

const EMERGENCY_TYPES = [
  {
    id: 'medical',
    name: 'Medical Emergency',
    priority: 'critical',
    contacts: ['911', 'venue_security', 'event_coordinator'],
    icon: AlertTriangle,
    color: 'text-red-600'
  },
  {
    id: 'fire',
    name: 'Fire Emergency',
    priority: 'critical',
    contacts: ['911', 'fire_department', 'venue_security'],
    icon: AlertTriangle,
    color: 'text-red-600'
  },
  {
    id: 'security',
    name: 'Security Incident',
    priority: 'high',
    contacts: ['911', 'venue_security', 'local_police'],
    icon: Shield,
    color: 'text-orange-600'
  },
  {
    id: 'weather',
    name: 'Severe Weather',
    priority: 'high',
    contacts: ['venue_management', 'event_coordinator'],
    icon: MapPin,
    color: 'text-yellow-600'
  },
  {
    id: 'power',
    name: 'Power Outage',
    priority: 'medium',
    contacts: ['venue_maintenance', 'utility_company'],
    icon: Zap,
    color: 'text-blue-600'
  },
  {
    id: 'evacuation',
    name: 'Evacuation Required',
    priority: 'critical',
    contacts: ['911', 'venue_security', 'event_coordinator'],
    icon: Users,
    color: 'text-red-600'
  }
];

const EMERGENCY_CONTACTS = {
  '911': { name: 'Emergency Services', number: '911', type: 'emergency' },
  'venue_security': { name: 'Venue Security', number: '+1-555-SECURITY', type: 'venue' },
  'event_coordinator': { name: 'Event Coordinator', number: '+1-555-EVENTS', type: 'internal' },
  'fire_department': { name: 'Fire Department', number: '911', type: 'emergency' },
  'local_police': { name: 'Local Police', number: '911', type: 'emergency' },
  'venue_management': { name: 'Venue Management', number: '+1-555-VENUE', type: 'venue' },
  'venue_maintenance': { name: 'Venue Maintenance', number: '+1-555-MAINT', type: 'venue' },
  'utility_company': { name: 'Utility Company', number: '+1-555-POWER', type: 'external' }
};

const SAFETY_CHECKLISTS = {
  pre_event: [
    'Verify emergency exits are clear and marked',
    'Test emergency lighting systems',
    'Confirm first aid kit locations',
    'Review evacuation procedures with staff',
    'Check fire extinguisher locations',
    'Verify emergency contact information',
    'Test communication systems',
    'Confirm security personnel coverage'
  ],
  during_event: [
    'Monitor weather conditions',
    'Maintain clear emergency pathways',
    'Keep emergency contacts readily available',
    'Monitor crowd density and behavior',
    'Ensure security personnel are alert',
    'Check equipment safety regularly',
    'Maintain communication with venue staff'
  ],
  post_event: [
    'Conduct safety debrief with team',
    'Document any incidents or concerns',
    'Report equipment issues to venue',
    'Update emergency procedures if needed',
    'File incident reports if necessary'
  ]
};

export default function EmergencyProtocols({ bookingId, venueId }) {
  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const { success, error } = useToast();

  const [emergencyForm, setEmergencyForm] = useState({
    type: '',
    severity: 'medium',
    location: '',
    description: '',
    people_affected: 0,
    immediate_action_taken: '',
    assistance_needed: true,
    contact_authorities: false
  });

  const [safetyChecklist, setSafetyChecklist] = useState({
    pre_event: {},
    during_event: {},
    post_event: {}
  });

  useEffect(() => {
    loadEmergencyData();
  }, [bookingId, venueId]);

  const loadEmergencyData = async () => {
    try {
      setLoading(true);
      const userData = await User.me();
      setUser(userData);

      if (bookingId) {
        const bookingData = await Booking.get(bookingId);
        setBooking(bookingData);
        
        if (bookingData.venue_id) {
          const venueData = await Venue.get(bookingData.venue_id);
          setVenue(venueData);
        }
      } else if (venueId) {
        const venueData = await Venue.get(venueId);
        setVenue(venueData);
      }

      // Load emergency history (mock data)
      setEmergencyHistory([
        {
          id: 'em_001',
          type: 'medical',
          date: '2024-01-15T14:30:00Z',
          status: 'resolved',
          severity: 'medium',
          response_time: '00:03:45',
          resolution_time: '00:25:30'
        },
        {
          id: 'em_002',
          type: 'power',
          date: '2024-01-20T19:15:00Z',
          status: 'resolved',
          severity: 'low',
          response_time: '00:01:20',
          resolution_time: '00:45:00'
        }
      ]);

      // Initialize safety checklist
      const initialChecklist = {};
      Object.keys(SAFETY_CHECKLISTS).forEach(phase => {
        initialChecklist[phase] = {};
        SAFETY_CHECKLISTS[phase].forEach((item, index) => {
          initialChecklist[phase][index] = false;
        });
      });
      setSafetyChecklist(initialChecklist);

    } catch (err) {
      console.error('Failed to load emergency data:', err);
      error('Failed to load emergency data');
    } finally {
      setLoading(false);
    }
  };

  const reportEmergency = async () => {
    try {
      if (!emergencyForm.type || !emergencyForm.description) {
        error('Please fill in all required fields');
        return;
      }

      const emergencyReport = {
        id: `em_${Date.now()}`,
        ...emergencyForm,
        booking_id: bookingId,
        venue_id: venueId || booking?.venue_id,
        reported_by: user.id,
        reported_at: new Date().toISOString(),
        status: 'active',
        response_team_notified: false
      };

      // In a real application, this would create an emergency record
      setActiveEmergency(emergencyReport);
      setEmergencyHistory(prev => [emergencyReport, ...prev]);

      // Notify appropriate contacts
      const emergencyType = EMERGENCY_TYPES.find(t => t.id === emergencyForm.type);
      if (emergencyType) {
        await notifyEmergencyContacts(emergencyType, emergencyReport);
      }

      success('Emergency reported successfully. Help is on the way.');
      setShowEmergencyDialog(false);
      resetEmergencyForm();

      // Auto-resolve after 30 seconds for demo purposes
      setTimeout(() => {
        resolveEmergency(emergencyReport.id);
      }, 30000);

    } catch (err) {
      console.error('Failed to report emergency:', err);
      error('Failed to report emergency');
    }
  };

  const notifyEmergencyContacts = async (emergencyType, report) => {
    try {
      // Send notifications to relevant contacts
      const notifications = emergencyType.contacts.map(async (contactId) => {
        const contact = EMERGENCY_CONTACTS[contactId];
        if (contact && contact.type === 'internal') {
          // Send email notification for internal contacts
          await SendEmail({
            to: 'emergency@party2go.com', // Would be actual contact email
            subject: `EMERGENCY: ${emergencyType.name} Reported`,
            body: `
              Emergency Type: ${emergencyType.name}
              Severity: ${report.severity}
              Location: ${report.location}
              Description: ${report.description}
              People Affected: ${report.people_affected}
              Reported By: ${user.full_name || user.email}
              Time: ${new Date(report.reported_at).toLocaleString()}
              
              Immediate action required.
            `
          });
        }
      });

      await Promise.all(notifications);
    } catch (err) {
      console.error('Failed to notify emergency contacts:', err);
    }
  };

  const resolveEmergency = (emergencyId) => {
    setEmergencyHistory(prev => 
      prev.map(emergency => 
        emergency.id === emergencyId 
          ? { ...emergency, status: 'resolved', resolved_at: new Date().toISOString() }
          : emergency
      )
    );
    
    if (activeEmergency?.id === emergencyId) {
      setActiveEmergency(null);
    }
  };

  const resetEmergencyForm = () => {
    setEmergencyForm({
      type: '',
      severity: 'medium',
      location: '',
      description: '',
      people_affected: 0,
      immediate_action_taken: '',
      assistance_needed: true,
      contact_authorities: false
    });
  };

  const updateChecklistItem = (phase, itemIndex, checked) => {
    setSafetyChecklist(prev => ({
      ...prev,
      [phase]: {
        ...prev[phase],
        [itemIndex]: checked
      }
    }));
  };

  const getChecklistCompletion = (phase) => {
    const items = SAFETY_CHECKLISTS[phase];
    const completed = Object.values(safetyChecklist[phase] || {}).filter(Boolean).length;
    return Math.round((completed / items.length) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Emergency Alert */}
      {activeEmergency && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex justify-between items-start">
              <div>
                <strong>ACTIVE EMERGENCY:</strong> {EMERGENCY_TYPES.find(t => t.id === activeEmergency.type)?.name}
                <br />
                Location: {activeEmergency.location}
                <br />
                Time: {new Date(activeEmergency.reported_at).toLocaleString()}
              </div>
              <Button
                size="sm"
                onClick={() => resolveEmergency(activeEmergency.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Mark Resolved
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Emergency Action Center */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            Emergency Response Center
          </CardTitle>
          <p className="text-gray-600">
            Quick access to emergency procedures and contact information
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EMERGENCY_TYPES.map(emergencyType => {
              const Icon = emergencyType.icon;
              return (
                <Card key={emergencyType.id} className="border-2 hover:shadow-md cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${emergencyType.color}`} />
                    <h3 className="font-medium mb-1">{emergencyType.name}</h3>
                    <Badge 
                      className={
                        emergencyType.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        emergencyType.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {emergencyType.priority.toUpperCase()}
                    </Badge>
                    <div className="mt-3 space-y-1">
                      {emergencyType.contacts.slice(0, 2).map(contactId => {
                        const contact = EMERGENCY_CONTACTS[contactId];
                        return (
                          <div key={contactId} className="text-xs text-gray-600">
                            {contact.name}: {contact.number}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Report Emergency
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-red-600">Report Emergency</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <Phone className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>For life-threatening emergencies, call 911 immediately</strong>
                      <br />
                      Use this form for non-life-threatening incidents that require documentation and response.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Emergency Type *</Label>
                      <Select 
                        value={emergencyForm.type} 
                        onValueChange={(value) => setEmergencyForm({...emergencyForm, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select emergency type" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMERGENCY_TYPES.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Severity Level</Label>
                      <Select 
                        value={emergencyForm.severity} 
                        onValueChange={(value) => setEmergencyForm({...emergencyForm, severity: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Location *</Label>
                      <Input
                        value={emergencyForm.location}
                        onChange={(e) => setEmergencyForm({...emergencyForm, location: e.target.value})}
                        placeholder="Specific location within venue"
                      />
                    </div>
                    <div>
                      <Label>People Affected</Label>
                      <Input
                        type="number"
                        value={emergencyForm.people_affected}
                        onChange={(e) => setEmergencyForm({...emergencyForm, people_affected: parseInt(e.target.value)})}
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      value={emergencyForm.description}
                      onChange={(e) => setEmergencyForm({...emergencyForm, description: e.target.value})}
                      placeholder="Detailed description of the emergency situation..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Immediate Action Taken</Label>
                    <Textarea
                      value={emergencyForm.immediate_action_taken}
                      onChange={(e) => setEmergencyForm({...emergencyForm, immediate_action_taken: e.target.value})}
                      placeholder="Describe any immediate actions you've already taken..."
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="assistance_needed"
                      checked={emergencyForm.assistance_needed}
                      onChange={(e) => setEmergencyForm({...emergencyForm, assistance_needed: e.target.checked})}
                    />
                    <Label htmlFor="assistance_needed">Professional assistance needed</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="contact_authorities"
                      checked={emergencyForm.contact_authorities}
                      onChange={(e) => setEmergencyForm({...emergencyForm, contact_authorities: e.target.checked})}
                    />
                    <Label htmlFor="contact_authorities">Authorities have been contacted</Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowEmergencyDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={reportEmergency} className="bg-red-600 hover:bg-red-700">
                      Report Emergency
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Safety Checklist & Emergency History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Safety Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Safety Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pre_event">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="pre_event">Pre-Event</TabsTrigger>
                <TabsTrigger value="during_event">During Event</TabsTrigger>
                <TabsTrigger value="post_event">Post-Event</TabsTrigger>
              </TabsList>

              {Object.keys(SAFETY_CHECKLISTS).map(phase => (
                <TabsContent key={phase} value={phase} className="space-y-3">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">
                      {phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Checklist
                    </span>
                    <Badge variant="outline">
                      {getChecklistCompletion(phase)}% Complete
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {SAFETY_CHECKLISTS[phase].map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`${phase}_${index}`}
                          checked={safetyChecklist[phase]?.[index] || false}
                          onChange={(e) => updateChecklistItem(phase, index, e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor={`${phase}_${index}`} className="text-sm">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Emergency History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Emergency History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emergencyHistory.length > 0 ? (
                emergencyHistory.map(emergency => {
                  const emergencyType = EMERGENCY_TYPES.find(t => t.id === emergency.type);
                  const Icon = emergencyType?.icon || AlertTriangle;
                  
                  return (
                    <div key={emergency.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${getSeverityColor(emergency.severity)}`} />
                          <span className="font-medium">{emergencyType?.name}</span>
                        </div>
                        <Badge className={getStatusColor(emergency.status)}>
                          {emergency.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Date: {new Date(emergency.date).toLocaleString()}</p>
                        {emergency.response_time && (
                          <p>Response Time: {emergency.response_time}</p>
                        )}
                        {emergency.resolution_time && (
                          <p>Resolution Time: {emergency.resolution_time}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No emergency incidents recorded</p>
                  <p className="text-xs">Keep it that way with proper safety measures!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-600" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(EMERGENCY_CONTACTS).map(([id, contact]) => (
              <div key={id} className="border rounded-lg p-3 text-center">
                <h4 className="font-medium mb-1">{contact.name}</h4>
                <p className="text-lg font-mono text-blue-600 mb-2">{contact.number}</p>
                <Badge 
                  variant="outline"
                  className={
                    contact.type === 'emergency' ? 'border-red-500 text-red-600' :
                    contact.type === 'venue' ? 'border-blue-500 text-blue-600' :
                    contact.type === 'internal' ? 'border-green-500 text-green-600' :
                    'border-gray-500 text-gray-600'
                  }
                >
                  {contact.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}