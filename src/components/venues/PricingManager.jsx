import React, { useState, useEffect } from 'react';
import { VenuePricing } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { getLocalizedText } from '@/components/common/FormatUtils';
import { useLocalization } from '@/components/common/LocalizationContext';
import { format } from 'date-fns';

export default function PricingManager({ venueId }) {
  const { currentLanguage } = useLocalization();
  const [rules, setRules] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPricingRules();
  }, [venueId]);

  const loadPricingRules = async () => {
    try {
      const pricingRules = await VenuePricing.filter({ venue_id: venueId });
      setRules(pricingRules);
    } catch (error) {
      console.error('Failed to load pricing rules:', error);
    }
  };

  const handleSaveRule = async () => {
    if (!currentRule || !currentRule.name || !currentRule.price_modifier_value) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    try {
        if(currentRule.id) {
             await VenuePricing.update(currentRule.id, currentRule);
        } else {
             await VenuePricing.create({ ...currentRule, venue_id: venueId });
        }
       
      toast({ title: 'Pricing rule saved' });
      setIsDialogOpen(false);
      setCurrentRule(null);
      loadPricingRules();
    } catch (error) {
      console.error('Failed to save pricing rule:', error);
      toast({ title: 'Failed to save rule', variant: 'destructive' });
    }
  };

  const handleEditRule = (rule) => {
    setCurrentRule(rule);
    setIsDialogOpen(true);
  };
  
  const handleAddNewRule = () => {
      setCurrentRule({ name: '', pricing_type: 'weekend', price_modifier_type: 'percentage', price_modifier_value: 0, is_active: true });
      setIsDialogOpen(true);
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await VenuePricing.delete(ruleId);
      toast({ title: 'Pricing rule deleted' });
      loadPricingRules();
    } catch (error) {
      console.error('Failed to delete pricing rule:', error);
      toast({ title: 'Failed to delete rule', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Dynamic Pricing Rules</CardTitle>
            <CardDescription>Set custom prices for weekends, holidays, or special events.</CardDescription>
          </div>
          <Button onClick={handleAddNewRule}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">{rule.name} ({rule.pricing_type})</p>
                <p className="text-sm text-gray-600">
                  {rule.price_modifier_type === 'percentage' ? `${rule.price_modifier_value}%` : `$${rule.price_modifier_value}`} adjustment
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule)}><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
            </div>
          ))}
          {rules.length === 0 && <p className="text-gray-500">No pricing rules defined yet.</p>}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentRule?.id ? 'Edit' : 'Add'} Pricing Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Rule Name (e.g., Weekend Surcharge)"
                value={currentRule?.name || ''}
                onChange={(e) => setCurrentRule({ ...currentRule, name: e.target.value })}
              />
              <Select
                value={currentRule?.pricing_type || 'weekend'}
                onValueChange={(value) => setCurrentRule({ ...currentRule, pricing_type: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekend">Weekend</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
               <div className="flex gap-2">
                <Select
                    value={currentRule?.price_modifier_type || 'percentage'}
                    onValueChange={(value) => setCurrentRule({ ...currentRule, price_modifier_type: value })}
                >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    type="number"
                    placeholder="Value"
                    value={currentRule?.price_modifier_value || 0}
                    onChange={(e) => setCurrentRule({ ...currentRule, price_modifier_value: parseFloat(e.target.value) })}
                />
               </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveRule}>Save Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}