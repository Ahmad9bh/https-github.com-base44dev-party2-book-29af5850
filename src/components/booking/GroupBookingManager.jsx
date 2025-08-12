import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Mail, DollarSign, Calendar, Plus, Trash2 } from 'lucide-react';
import { GroupBooking } from '@/api/entities';
import { useToast } from '@/components/ui/toast';

export default function GroupBookingManager({ venue, eventDate, startTime, endTime, totalAmount, onGroupBookingCreated }) {
  const [contributors, setContributors] = useState([{ email: '', name: '', contribution_amount: 0 }]);
  const [paymentPlan, setPaymentPlan] = useState('split_equally');
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (paymentPlan === 'split_equally') {
      updateEqualSplit();
    }
  }, [contributors.length, paymentPlan, totalAmount]);

  const updateEqualSplit = () => {
    const amountPerPerson = totalAmount / contributors.length;
    setContributors(prev => prev.map(c => ({
      ...c,
      contribution_amount: Math.round(amountPerPerson * 100) / 100
    })));
  };

  const addContributor = () => {
    setContributors(prev => [...prev, { email: '', name: '', contribution_amount: 0 }]);
  };

  const removeContributor = (index) => {
    setContributors(prev => prev.filter((_, i) => i !== index));
  };

  const updateContributor = (index, field, value) => {
    setContributors(prev => prev.map((contributor, i) => 
      i === index ? { ...contributor, [field]: value } : contributor
    ));
  };

  const createInstallmentPlan = () => {
    const installmentCount = 3; // Default to 3 installments
    const amountPerInstallment = totalAmount / installmentCount;
    const newInstallments = [];
    
    for (let i = 0; i < installmentCount; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      
      newInstallments.push({
        due_date: dueDate.toISOString().split('T')[0],
        amount: Math.round(amountPerInstallment * 100) / 100,
        status: 'pending'
      });
    }
    
    setInstallments(newInstallments);
  };

  const handleCreateGroupBooking = async () => {
    setLoading(true);
    try {
      const totalContributions = contributors.reduce((sum, c) => sum + (c.contribution_amount || 0), 0);
      
      if (Math.abs(totalContributions - totalAmount) > 0.01) {
        error('Total contributions must equal the booking amount');
        return;
      }

      const groupBooking = await GroupBooking.create({
        primary_booker_id: 'current_user_id', // Would be actual user ID
        venue_id: venue.id,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        total_amount: totalAmount,
        contributors: contributors.map(c => ({
          ...c,
          payment_status: 'pending'
        })),
        payment_plan: paymentPlan,
        installment_schedule: paymentPlan === 'installments' ? installments : [],
        status: 'organizing'
      });

      success('Group booking created! Invitation emails will be sent to contributors.');
      onGroupBookingCreated(groupBooking);
    } catch (err) {
      console.error('Failed to create group booking:', err);
      error('Failed to create group booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Group Booking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Plan Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Payment Plan</label>
          <Select value={paymentPlan} onValueChange={setPaymentPlan}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="split_equally">Split Equally</SelectItem>
              <SelectItem value="custom_amounts">Custom Amounts</SelectItem>
              <SelectItem value="installments">Installment Plan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contributors */}
        {paymentPlan !== 'installments' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium">Contributors</label>
              <Button variant="outline" size="sm" onClick={addContributor}>
                <Plus className="w-4 h-4 mr-2" />
                Add Person
              </Button>
            </div>
            
            <div className="space-y-3">
              {contributors.map((contributor, index) => (
                <div key={index} className="flex gap-3 items-center p-3 border rounded-lg">
                  <Input
                    placeholder="Name"
                    value={contributor.name}
                    onChange={(e) => updateContributor(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={contributor.email}
                    onChange={(e) => updateContributor(index, 'email', e.target.value)}
                  />
                  <Input
                    placeholder="Amount"
                    type="number"
                    value={contributor.contribution_amount}
                    onChange={(e) => updateContributor(index, 'contribution_amount', parseFloat(e.target.value) || 0)}
                    disabled={paymentPlan === 'split_equally'}
                  />
                  {contributors.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeContributor(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Installment Plan */}
        {paymentPlan === 'installments' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium">Installment Schedule</label>
              {installments.length === 0 && (
                <Button variant="outline" size="sm" onClick={createInstallmentPlan}>
                  Create Plan
                </Button>
              )}
            </div>
            
            {installments.map((installment, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg mb-2">
                <div>
                  <p className="font-medium">Payment {index + 1}</p>
                  <p className="text-sm text-gray-600">Due: {installment.due_date}</p>
                </div>
                <Badge variant="outline">${installment.amount}</Badge>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span>Total Amount:</span>
            <span className="font-bold">${totalAmount}</span>
          </div>
          {paymentPlan !== 'installments' && (
            <div className="flex justify-between items-center">
              <span>Total Contributors:</span>
              <span>{contributors.length} people</span>
            </div>
          )}
        </div>

        <Button 
          onClick={handleCreateGroupBooking} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating...' : 'Create Group Booking'}
        </Button>
      </CardContent>
    </Card>
  );
}