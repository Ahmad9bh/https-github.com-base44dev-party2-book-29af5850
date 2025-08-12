import React, { useState, useEffect } from 'react';
import { DiscountCode } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DiscountManager({ venueId, ownerId, venueName, onUpdate }) {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();

    // Validate required props
    if (!venueId || !ownerId) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-red-600">
                    Error: Missing required venue or owner information.
                </CardContent>
            </Card>
        );
    }

    useEffect(() => {
        loadDiscountCodes();
    }, [venueId]);

    const loadDiscountCodes = async () => {
        setLoading(true);
        try {
            const discountCodes = await DiscountCode.filter({ venue_id: venueId });
            setCodes(discountCodes);
        } catch (err) {
            console.error("Failed to load discount codes:", err);
            error("Could not load discount codes.");
        } finally {
            setLoading(false);
        }
    };

    const addCode = () => {
        setCodes([...codes, {
            venue_id: venueId,
            owner_id: ownerId,
            code: '',
            discount_type: 'percentage',
            value: 10,
            is_active: true
        }]);
    };

    const updateCode = (index, field, value) => {
        const newCodes = [...codes];
        newCodes[index][field] = value;
        setCodes(newCodes);
    };

    const saveCode = async (index) => {
        const code = codes[index];
        if (!code.code.trim()) {
            error("Discount code cannot be empty.");
            return;
        }

        // Ensure required fields are present
        const codeData = {
            ...code,
            venue_id: venueId,
            owner_id: ownerId
        };

        try {
            if (code.id) {
                await DiscountCode.update(code.id, codeData);
            } else {
                await DiscountCode.create(codeData);
            }
            success("Discount code saved!");
            loadDiscountCodes();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error("Failed to save code:", err);
            error("Could not save the discount code.");
        }
    };

    const deleteCode = async (codeId, index) => {
        if (!codeId) {
             const newCodes = [...codes];
             newCodes.splice(index, 1);
             setCodes(newCodes);
             return;
        }
        try {
            await DiscountCode.delete(codeId);
            success("Discount code deleted.");
            loadDiscountCodes();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error("Failed to delete code:", err);
            error("Could not delete the discount code.");
        }
    };
    
    const copyCode = (codeText) => {
        navigator.clipboard.writeText(codeText);
        success(`Code "${codeText}" copied to clipboard!`);
    }

    if (loading) return <LoadingSpinner />;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Discount Codes - {venueName}</CardTitle>
                <CardDescription>
                    Create and manage discount codes for your customers to use during checkout.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {codes.map((code, index) => (
                        <div key={code.id || index} className="p-4 border rounded-lg space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Discount Code</Label>
                                    <div className="flex gap-2">
                                        <Input value={code.code} onChange={(e) => updateCode(index, 'code', e.target.value.toUpperCase())} placeholder="e.g. EARLYBIRD"/>
                                        <Button variant="outline" size="icon" onClick={() => copyCode(code.code)}><Copy className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                                <div>
                                    <Label>Discount Type</Label>
                                    <Select value={code.discount_type} onValueChange={(val) => updateCode(index, 'discount_type', val)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Value</Label>
                                    <Input type="number" value={code.value} onChange={(e) => updateCode(index, 'value', parseFloat(e.target.value))} />
                                </div>
                            </div>
                             <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id={`active-${index}`} checked={code.is_active} onCheckedChange={(checked) => updateCode(index, 'is_active', checked)} />
                                    <Label htmlFor={`active-${index}`}>Active</Label>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="destructive" size="sm" onClick={() => deleteCode(code.id, index)}><Trash2 className="w-4 h-4 mr-2"/>Delete</Button>
                                    <Button size="sm" onClick={() => saveCode(index)}>Save Code</Button>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
                <Button onClick={addCode} className="mt-6"><Plus className="w-4 h-4 mr-2" />Add New Code</Button>
            </CardContent>
        </Card>
    );
}