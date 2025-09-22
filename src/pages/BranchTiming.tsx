import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Divider, CircularProgress, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Paper, TextField } from '@mui/material';
import axiosInstance from '../service/api';
import { DaySchedule, Branch } from '../types/branchTiming';
import { toast } from 'react-toastify';
import { Clock, Plus, Trash2, Building } from 'lucide-react';

const BranchTiming: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [branchesLoading, setBranchesLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  // Days of the week in order
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchBranches();
  }, []);
  
  useEffect(() => {
    if (selectedBranchId) {
      fetchBranchTimings();
    } else {
      setSchedules([]);
    }
  }, [selectedBranchId]);
  
  const fetchBranches = async () => {
    setBranchesLoading(true);
    try {
      const response = await axiosInstance.get('/1.0/branch');
      const branchesData = response.data || [];
      setBranches(branchesData);
      
      // Auto-select the first branch if available
      if (branchesData.length > 0) {
        setSelectedBranchId(branchesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to load branches');
    } finally {
      setBranchesLoading(false);
    }
  };
  
  const handleBranchChange = (event: SelectChangeEvent) => {
    setSelectedBranchId(event.target.value);
  };

  const fetchBranchTimings = async () => {
    if (!selectedBranchId) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/1.0/branch-timing`);
      
      // Get the data from the response
      let timingData = response.data || [];
      
      // Ensure we have all days of the week
      const existingDays = timingData.map((item: any) => item.day);
      
      // Add any missing days with empty slots
      daysOfWeek.forEach(day => {
        if (!existingDays.includes(day)) {
          timingData.push({
            day,
            date: '', // This would be calculated based on the current week
            slots: []
          });
        }
      });
      
      // Sort by day of week
      timingData.sort((a: DaySchedule, b: DaySchedule) => {
        return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
      });
      
      setSchedules(timingData);
    } catch (error) {
      console.error('Error fetching branch timings:', error);
      toast.error('Failed to load branch timings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = (dayIndex: number) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[dayIndex].slots.push({ label: '' });
    setSchedules(updatedSchedules);
  };

  const handleRemoveSlot = (dayIndex: number, slotIndex: number) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[dayIndex].slots.splice(slotIndex, 1);
    setSchedules(updatedSchedules);
  };

  const handleSlotChange = (dayIndex: number, slotIndex: number, value: string) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[dayIndex].slots[slotIndex].label = value;
    setSchedules(updatedSchedules);
  };

  const handleSave = async () => {
    if (!selectedBranchId) {
      toast.error('Please select a branch first');
      return;
    }
    
    setSaving(true);
    try {
      // Filter out empty slots
      const dataToSave = schedules.map(day => ({
        ...day,
        slots: day.slots.filter(slot => slot.label.trim() !== '')
      }));
      
      await axiosInstance.post(`/1.0/branch/${selectedBranchId}`, { data: dataToSave });
      toast.success('Branch timings saved successfully');
      setEditMode(false);
      fetchBranchTimings(); // Refresh data
    } catch (error) {
      console.error('Error saving branch timings:', error);
      toast.error('Failed to save branch timings');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    fetchBranchTimings(); // Reset to original data
  };

  if (branchesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: '#1e3a8a' }} size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: 'linear-gradient(to right, #1e3a8a, #2563eb)',
          color: 'white'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Clock size={28} style={{ marginRight: '12px' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Branch Timing Management
            </Typography>
          </Box>
          <Box>
            {/* {editMode ? (
              <>
                <Button 
                  variant="contained" 
                  onClick={handleSave} 
                  disabled={saving || !selectedBranchId}
                  sx={{ 
                    mr: 2, 
                    bgcolor: 'white', 
                    color: '#1e3a8a',
                    '&:hover': { bgcolor: '#f8fafc', color: '#1e3a8a' },
                    fontWeight: 600,
                    px: 3
                  }}
                >
                  {saving ? <CircularProgress size={24} sx={{ color: '#1e3a8a' }} /> : 'Save Changes'}
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel}
                  disabled={saving}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                variant="contained" 
                onClick={() => setEditMode(true)}
                disabled={!selectedBranchId}
                sx={{ 
                  bgcolor: 'white', 
                  color: '#1e3a8a',
                  '&:hover': { bgcolor: '#f8fafc', color: '#1e3a8a' },
                  fontWeight: 600,
                  px: 3
                }}
              >
                Edit Timings
              </Button>
            )} */}
          </Box>
        </Box>
      </Paper>
      
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          bgcolor: 'white'
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <Building size={22} style={{ marginRight: '10px', color: '#1e3a8a' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3a8a' }}>
            Select Branch
          </Typography>
        </Box>
        
        <FormControl fullWidth variant="outlined">
          <InputLabel id="branch-select-label">Branch</InputLabel>
          <Select
            labelId="branch-select-label"
            id="branch-select"
            value={selectedBranchId}
            onChange={handleBranchChange}
            label="Branch"
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1e3a8a',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1e3a8a',
              },
            }}
          >
            {branches.length === 0 ? (
              <MenuItem disabled value="">
                <em>No branches available</em>
              </MenuItem>
            ) : (
              branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.enName}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress sx={{ color: '#1e3a8a' }} size={40} thickness={4} />
        </Box>
      ) : !selectedBranchId ? (
        <Box 
          sx={{ 
            py: 8, 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            bgcolor: '#f1f5f9',
            borderRadius: 2,
            color: '#64748b'
          }}
        >
          <Building size={48} style={{ marginBottom: '16px', opacity: 0.7 }} />
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Please select a branch to view timing details
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 3
          }}>
            {schedules.map((schedule, dayIndex) => {
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === schedule.day;
              return (
                <Box key={schedule.day}>
                  <Card 
                    elevation={3} 
                    sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)'
                      },
                      border: isToday ? '2px solid #1e3a8a' : 'none',
                      mb: 2
                }}
              >
                <Box 
                  sx={{ 
                    py: 1.5, 
                    px: 2, 
                    bgcolor: '#1e3a8a', 
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {schedule.day}
                  </Typography>
                  {schedule.date && (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {schedule.date}
                    </Typography>
                  )}
                  {isToday && (
                    <Box 
                      sx={{ 
                        bgcolor: '#22c55e', 
                        color: 'white', 
                        px: 1.5, 
                        py: 0.5, 
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      TODAY
                    </Box>
                  )}
                </Box>
                <CardContent sx={{ p: 2 }}>
                  {schedule.slots.length === 0 && !editMode && (
                    <Box 
                      sx={{ 
                        py: 3, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        color: 'text.secondary',
                        borderRadius: 1,
                        bgcolor: '#f1f5f9'
                      }}
                    >
                      <Typography>No time slots available</Typography>
                    </Box>
                  )}
                  
                  {schedule.slots.map((slot, slotIndex) => (
                    <Box key={slotIndex}>
                      {slotIndex > 0 && <Divider sx={{ my: 1.5 }} />}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {editMode ? (
                          <>
                            <TextField
                              fullWidth
                              size="small"
                              value={slot.label}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSlotChange(dayIndex, slotIndex, e.target.value)}
                              placeholder="e.g. 8 AM - 10 AM"
                              sx={{ 
                                mr: 1,
                                '& .MuiOutlinedInput-root': {
                                  '&:hover fieldset': {
                                    borderColor: '#1e3a8a',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#1e3a8a',
                                  },
                                },
                              }}
                            />
                            <Button 
                              size="small" 
                              color="error" 
                              variant="outlined"
                              onClick={() => handleRemoveSlot(dayIndex, slotIndex)}
                              sx={{ minWidth: '40px', width: '40px', height: '40px', p: 0 }}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </>
                        ) : (
                          <Box 
                            sx={{ 
                              py: 1.5, 
                              px: 2, 
                              width: '100%', 
                              bgcolor: '#f1f5f9', 
                              borderRadius: 1,
                              fontWeight: 500
                            }}
                          >
                            {slot.label || 'Empty slot'}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                  
                  {editMode && (
                    <Button 
                      variant="outlined" 
                      size="medium" 
                      onClick={() => handleAddSlot(dayIndex)} 
                      sx={{ 
                        mt: schedule.slots.length > 0 ? 2 : 0, 
                        width: '100%',
                        color: '#1e3a8a',
                        borderColor: '#1e3a8a',
                        '&:hover': {
                          borderColor: '#1e3a8a',
                          bgcolor: 'rgba(30, 58, 138, 0.04)'
                        },
                        py: 1
                      }}
                      startIcon={<Plus size={18} />}
                    >
                      Add Time Slot
                    </Button>
                  )}
                </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BranchTiming;
