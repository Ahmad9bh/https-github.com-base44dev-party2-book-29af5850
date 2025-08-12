import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle, Clock, Users, DollarSign, Plus } from 'lucide-react';
import { EventPlan } from '@/api/entities';
import { Vendor } from '@/api/entities';
import { useToast } from '@/components/ui/toast';

export default function EventPlanningTools({ bookingId, userId, eventDate }) {
  const [eventPlan, setEventPlan] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [newTask, setNewTask] = useState({ task: '', due_date: '', priority: 'medium' });
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    loadEventPlan();
    loadVendors();
  }, [bookingId]);

  const loadEventPlan = async () => {
    try {
      const plans = await EventPlan.filter({ booking_id: bookingId });
      if (plans.length > 0) {
        setEventPlan(plans[0]);
      } else {
        // Create a new event plan
        const newPlan = await EventPlan.create({
          user_id: userId,
          booking_id: bookingId,
          event_name: 'My Event',
          event_date: eventDate,
          timeline: [],
          task_list: [],
          vendors_coordinated: [],
          budget_breakdown: {
            venue: 0,
            catering: 0,
            decorations: 0,
            entertainment: 0,
            other: 0
          }
        });
        setEventPlan(newPlan);
      }
    } catch (err) {
      error('Failed to load event plan');
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const allVendors = await Vendor.filter({ status: 'active' });
      setVendors(allVendors);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    }
  };

  const addTask = async () => {
    if (!newTask.task.trim()) return;
    
    try {
      const updatedTaskList = [
        ...eventPlan.task_list,
        {
          ...newTask,
          completed: false,
          assigned_to: userId
        }
      ];

      await EventPlan.update(eventPlan.id, { task_list: updatedTaskList });
      setEventPlan(prev => ({ ...prev, task_list: updatedTaskList }));
      setNewTask({ task: '', due_date: '', priority: 'medium' });
      success('Task added successfully');
    } catch (err) {
      error('Failed to add task');
    }
  };

  const toggleTask = async (taskIndex) => {
    try {
      const updatedTaskList = eventPlan.task_list.map((task, index) =>
        index === taskIndex ? { ...task, completed: !task.completed } : task
      );

      await EventPlan.update(eventPlan.id, { task_list: updatedTaskList });
      setEventPlan(prev => ({ ...prev, task_list: updatedTaskList }));
    } catch (err) {
      error('Failed to update task');
    }
  };

  const updateBudget = async (category, amount) => {
    try {
      const updatedBudget = {
        ...eventPlan.budget_breakdown,
        [category]: parseFloat(amount) || 0
      };

      await EventPlan.update(eventPlan.id, { budget_breakdown: updatedBudget });
      setEventPlan(prev => ({ ...prev, budget_breakdown: updatedBudget }));
    } catch (err) {
      error('Failed to update budget');
    }
  };

  if (loading) return <div>Loading event planning tools...</div>;

  const completedTasks = eventPlan?.task_list?.filter(t => t.completed).length || 0;
  const totalTasks = eventPlan?.task_list?.length || 0;
  const totalBudget = Object.values(eventPlan?.budget_breakdown || {}).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      {/* Event Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Event Planning Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedTasks}/{totalTasks}</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${totalBudget}</div>
              <div className="text-sm text-gray-600">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{eventPlan?.vendors_coordinated?.length || 0}</div>
              <div className="text-sm text-gray-600">Vendors Coordinated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Task List</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add New Task */}
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add a new task..."
                  value={newTask.task}
                  onChange={(e) => setNewTask(prev => ({ ...prev, task: e.target.value }))}
                />
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                />
                <Button onClick={addTask}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Task List */}
              <div className="space-y-2">
                {eventPlan?.task_list?.map((task, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(index)}
                    />
                    <div className="flex-1">
                      <p className={task.completed ? 'line-through text-gray-500' : ''}>{task.task}</p>
                      {task.due_date && (
                        <p className="text-sm text-gray-500">Due: {task.due_date}</p>
                      )}
                    </div>
                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>Budget Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(eventPlan?.budget_breakdown || {}).map(([category, amount]) => (
                  <div key={category} className="flex items-center gap-4">
                    <label className="w-24 capitalize">{category}:</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => updateBudget(category, e.target.value)}
                      className="w-32"
                    />
                    <span className="text-gray-500">USD</span>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Budget:</span>
                    <span>${totalBudget}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Coordination</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendors.map(vendor => (
                  <div key={vendor.id} className="p-4 border rounded-lg">
                    <h4 className="font-semibold">{vendor.company_name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{vendor.service_type}</p>
                    <p className="text-sm text-gray-500">{vendor.city}</p>
                    <div className="mt-2">
                      <Badge variant="outline">${vendor.base_price}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}