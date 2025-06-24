import supabase from '../config/supabase.js'; // Perhatikan ekstensi .js

export const getAllAttendances = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('attendances')
      .select('*, users!attendances_user_id_fkey(full_name, email)')
      .order('date', { ascending: false })
      .order('check_in_time', { ascending: false });

    if (error) {
      console.error('Error fetching all attendances:', error);
      return res.status(500).json({ message: 'Failed to retrieve all attendance records' });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyAttendance = async (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;
  const mentorId = req.user?.id;

  if (!mentorId) {
    return res.status(401).json({ message: 'Mentor ID not found' });
  }

  if (!status && !comment) {
    return res.status(400).json({ message: 'Please provide status or comment to update.' });
  }

  try {
    const updateData = {
      verified_by: mentorId,
    };
    if (status) updateData.status = status;
    if (comment) updateData.comment = comment;

    const { data, error } = await supabase
      .from('attendances')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating attendance:', error);
      return res.status(500).json({ message: 'Failed to update attendance record' });
    }

    if (!data) {
        return res.status(404).json({ message: 'Attendance record not found.' });
    }

    res.status(200).json({
      message: 'Attendance record updated successfully',
      attendance: data,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};