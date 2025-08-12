import React, { useState, useEffect } from 'react';
import { Enterprise } from '@/api/entities';
import { Tenant } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Building, Globe } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function EnterpriseManagement() {
  const [enterprises, setEnterprises] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [enterpriseData, tenantData] = await Promise.all([
          Enterprise.list(),
          Tenant.list()
        ]);
        setEnterprises(enterpriseData);
        setTenants(tenantData);
      } catch (err) {
        console.error("Failed to load enterprise data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Enterprise & White-Label</h1>
        <Button><Plus className="w-4 h-4 mr-2" /> New Enterprise Account</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Enterprise Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building /> Enterprise Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {enterprises.map(ent => (
              <div key={ent.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{ent.company_name}</p>
                  <Badge className={ent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {ent.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{ent.plan_type}</p>
                <p className="text-sm text-gray-500">Contact: {ent.contact_person}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tenants (White-Label Sites) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe /> Tenants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tenants.map(t => (
              <div key={t.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{t.tenant_name}</p>
                   <Badge className={t.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {t.status}
                  </Badge>
                </div>
                <a href={`https://${t.subdomain}.party2go.com`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                  {t.subdomain}.party2go.com
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}