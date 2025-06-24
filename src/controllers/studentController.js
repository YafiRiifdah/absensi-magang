import supabase from '../config/supabase.js'; // Perhatikan ekstensi .js

export const checkIn = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized, user ID not found' });
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    const { data: existingAttendance } = await supabase
      .from('attendances')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existingAttendance && existingAttendance.check_in_time) {
      return res.status(400).json({ message: 'You have already checked in today.' });
    }

    const { data, error } = await supabase
      .from('attendances')
      .insert([
        {
          user_id: userId,
          check_in_time: new Date().toISOString(),
          date: today,
          status: 'Hadir',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error during check-in:', error);
      return res.status(500).json({ message: 'Failed to check-in' });
    }

    res.status(201).json({
      message: 'Check-in successful',
      attendance: data,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkOut = async (req, res) => {
  const userId = req.user?.id;
  const today = new Date().toISOString().split('T')[0];

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized, user ID not found' });
  }

  try {
    const { data: attendanceToUpdate } = await supabase
      .from('attendances')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .is('check_out_time', null)
      .single();

    if (!attendanceToUpdate) {
      return res.status(404).json({ message: 'No active check-in found for today or already checked out.' });
    }

    const { data, error } = await supabase
      .from('attendances')
      .update({ check_out_time: new Date().toISOString() })
      .eq('id', attendanceToUpdate.id)
      .select()
      .single();

    if (error) {
      console.error('Error during check-out:', error);
      return res.status(500).json({ message: 'Failed to check-out' });
    }

    res.status(200).json({
      message: 'Check-out successful',
      attendance: data,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyAttendance = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized, user ID not found' });
  }

  try {
    const { data, error } = await supabase
      .from('attendances')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching attendance history:', error);
      return res.status(500).json({ message: 'Failed to retrieve attendance history' });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};