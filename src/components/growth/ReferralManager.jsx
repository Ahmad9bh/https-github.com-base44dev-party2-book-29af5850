import React, { useState, useEffect } from 'react';
import { ReferralProgram } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Gift, Share2, Users, DollarSign, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function ReferralManager() {
    const [user, setUser] = useState(null);
    const [referralCode, setReferralCode] = useState('');
    const [referrals, setReferrals] = useState([]);
    const [stats, setStats] = useState({
        totalReferred: 0,
        totalEarned: 0,
        pendingRewards: 0
    });
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadReferralData();
    }, []);

    const loadReferralData = async () => {
        try {
            const userData = await User.me();
            setUser(userData);
            
            // Generate or get existing referral code
            const code = userData.referral_code || generateReferralCode(userData.full_name);
            setReferralCode(code);
            
            // Load user's referrals
            const userReferrals = await ReferralProgram.filter({ referrer_id: userData.id });
            setReferrals(userReferrals || []);
            
            // Calculate stats
            const totalReferred = userReferrals.length;
            const totalEarned = userReferrals
                .filter(r => r.status === 'completed')
                .reduce((sum, r) => sum + (r.referral_reward || 0), 0);
            const pendingRewards = userReferrals
                .filter(r => r.status === 'pending')
                .reduce((sum, r) => sum + (r.referral_reward || 0), 0);
                
            setStats({ totalReferred, totalEarned, pendingRewards });
            
        } catch (error) {
            console.error('Failed to load referral data:', error);
        }
    };

    const generateReferralCode = (fullName) => {
        const nameCode = fullName.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
        const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${nameCode}${randomCode}`;
    };

    const copyReferralLink = () => {
        const referralLink = `${window.location.origin}?ref=${referralCode}`;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        toast.success('Referral link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const shareReferral = () => {
        const referralLink = `${window.location.origin}?ref=${referralCode}`;
        const shareText = `Join Party2Go and book amazing venues! Use my referral code ${referralCode} and we both get rewards! ${referralLink}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Join Party2Go',
                text: shareText,
                url: referralLink
            });
        } else {
            // Fallback to copying
            copyReferralLink();
        }
    };

    if (!user) return null;

    const referralLink = `${window.location.origin}?ref=${referralCode}`;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Referral Program</h2>
                <p className="text-gray-600">Invite friends and earn rewards for every successful booking!</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            People Referred
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold">{stats.totalReferred}</span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Total Earned
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold">${stats.totalEarned}</span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            Pending Rewards
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold">${stats.pendingRewards}</span>
                    </CardContent>
                </Card>
            </div>

            {/* Referral Link Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Referral Link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Referral Code</label>
                        <div className="flex gap-2">
                            <Input value={referralCode} readOnly className="font-mono" />
                            <Button variant="outline" onClick={copyReferralLink}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">Full Referral Link</label>
                        <div className="flex gap-2">
                            <Input value={referralLink} readOnly className="text-sm" />
                            <Button onClick={shareReferral}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Share your referral link with friends</li>
                            <li>• They sign up and make their first booking</li>
                            <li>• You both get $25 credit towards future bookings</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Referral History */}
            <Card>
                <CardHeader>
                    <CardTitle>Referral History</CardTitle>
                </CardHeader>
                <CardContent>
                    {referrals.length === 0 ? (
                        <div className="text-center py-8">
                            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No referrals yet</p>
                            <p className="text-sm text-gray-400">Start sharing your link to earn rewards!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {referrals.map((referral, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Referral #{index + 1}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(referral.created_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold">${referral.referral_reward}</span>
                                        <Badge className={
                                            referral.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }>
                                            {referral.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}