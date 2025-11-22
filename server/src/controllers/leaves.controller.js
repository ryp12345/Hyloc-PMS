const { Leave, User, LeaveEntitlement, Staff, Role, Department, sequelize } = require('../models');

exports.apply = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      from_date,
      to_date,
      leave_duration,
      credited_days,
      leave_type,
      leave_reason,
      alternate_person,
      additional_alternate,
      available_on_phone
    } = req.body;

    // Validate required fields
    if (!from_date || !leave_reason) {
      return res.status(400).json({
        message: 'Missing required fields: from_date, leave_reason'
      });
    }

    const duration = (leave_duration || 'Full Day').trim();

    // Normalize dates and credited_days
    let normalizedFrom = from_date;
    let normalizedTo = to_date || from_date;
    let computedCredited = 0;

    // Helper to compute inclusive day difference
    const toYmd = (d) => new Date(d + 'T00:00:00');
    if (duration === 'Morning Half' || duration === 'Afternoon Half') {
      normalizedTo = normalizedFrom; // half-day must be same day
      computedCredited = 0.5;
    } else {
      // Full Day (default)
      const fromD = toYmd(normalizedFrom);
      const toD = toYmd(normalizedTo);
      if (isNaN(fromD) || isNaN(toD)) {
        return res.status(400).json({ message: 'Invalid date format. Expect YYYY-MM-DD' });
      }
      if (toD < fromD) {
        return res.status(400).json({ message: 'to_date cannot be earlier than from_date' });
      }
      const MS_PER_DAY = 24 * 60 * 60 * 1000;
      computedCredited = Math.round(((toD - fromD) / MS_PER_DAY + 1) * 10) / 10; // inclusive diff, 1 decimal
    }

    // If client explicitly sent credited_days, we still enforce server rules for half-day
    const finalCredited = (duration === 'Morning Half' || duration === 'Afternoon Half')
      ? 0.5
      : (Number(credited_days) > 0 ? Number(credited_days) : computedCredited);

    // Create leave application with enforced values
    const leaveData = {
      user_id: userId,
      from_date: normalizedFrom,
      to_date: normalizedTo,
      leave_duration: duration || 'Full Day',
      credited_days: finalCredited,
      leave_type: leave_type || 'Paid',
      leave_reason,
      alternate_person: alternate_person || null,
      additional_alternate: additional_alternate || null,
      available_on_phone: available_on_phone !== undefined ? available_on_phone : true,
      status: 'Pending'
    };

    const row = await Leave.create(leaveData);
    res.status(201).json(row);
  } catch (error) {
    console.error('Error creating leave application:', error);
    res.status(500).json({
      message: 'Error creating leave application',
      error: error.message
    });
  }
};

exports.myLeaves = async (req, res) => {
  const rows = await Leave.findAll({ where: { user_id: req.user.id }, order: [['created_at', 'DESC']] });
  res.json(rows);
};

exports.pendingLeaves = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    console.log('=== PENDING LEAVES DEBUG ===');
    console.log('Current User ID:', currentUserId);
    console.log('Current User Role (from token):', req.user.role);
    
    // Get current user with role_id and department
    const currentUserFull = await User.findByPk(currentUserId, {
      include: [
        { model: Role, attributes: ['id', 'name'] },
        {
          model: Staff,
          include: [{
            model: Department,
            as: 'Departments',
            attributes: ['id', 'dept_name'],
            through: { attributes: [] }
          }]
        }
      ]
    });
    
    if (!currentUserFull) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentUserRoleId = currentUserFull.Role?.id;
    const currentUserDeptId = currentUserFull?.Staff?.Departments?.[0]?.id;
    
    console.log('Current User Role ID:', currentUserRoleId);
    console.log('Current User Role Name:', currentUserFull.Role?.name);
    console.log('Current User Department ID:', currentUserDeptId);
    console.log('Current User Staff:', currentUserFull?.Staff ? 'EXISTS' : 'NULL');
    
    // Get all pending leaves with user details
    const allPendingLeaves = await Leave.findAll({ 
      where: { 
        status: 'Pending'
      },
      include: [
        { 
          model: User,
          attributes: ['id', 'email', 'role_id'],
          include: [{
            model: Staff,
            attributes: ['emp_id', 'phone_no', 'first_name', 'middle_name', 'last_name'],
            include: [{
              model: Department,
              as: 'Departments',
              attributes: ['id', 'dept_name'],
              through: { attributes: [] }
            }]
          }]
        }
      ],
      order: [['created_at', 'DESC']] 
    });
    
    console.log('Total Pending Leaves Found:', allPendingLeaves.length);
    
    // Filter leaves that this user should approve
    const leavesToApprove = [];
    
    for (const leave of allPendingLeaves) {
      const applicant = leave.User;
      const applicantDeptId = applicant?.Staff?.Departments?.[0]?.id;
      const applicantName = applicant?.Staff ? 
        [applicant.Staff.first_name, applicant.Staff.middle_name, applicant.Staff.last_name]
          .filter(Boolean).join(' ') : 'Unknown';
      
      console.log(`\nLeave ID ${leave.id}:`);
      console.log('  Applicant:', applicantName);
      console.log('  Applicant Role ID:', applicant?.role_id);
      console.log('  Applicant Dept ID:', applicantDeptId);
      console.log('  Credited Days:', leave.credited_days, 'Type:', typeof leave.credited_days);
      
      // Determine if current user should approve this leave
      let shouldApprove = false;
      
      if (currentUserRoleId === 1) { // Management (role_id 1)
        // Management approves ONLY: Employee >2 days, Manager leaves, HR leaves
        // Management should NOT see Employee <=2 days (those go to Manager)
        if (applicant.role_id === 3 && parseFloat(leave.credited_days) > 2) {
          shouldApprove = true;
          console.log('  MATCH: Management approving Employee >2 days');
        } else if (applicant.role_id === 2 || applicant.role_id === 4) {
          shouldApprove = true;
          console.log('  MATCH: Management approving Manager/HR leave');
        } else if (applicant.role_id === 3 && parseFloat(leave.credited_days) <= 2) {
          console.log('  SKIP: Employee <=2 days should go to Manager, not Management');
        }
      } else if (currentUserRoleId === 2) { // Manager (role_id 2)
        // Manager approves: Employee <=2 days from same department
        console.log('  Checking Manager approval conditions:');
        console.log('    Is Employee (role 3)?', applicant.role_id === 3);
        console.log('    Days <= 2?', parseFloat(leave.credited_days) <= 2);
        console.log('    Same dept?', applicantDeptId === currentUserDeptId);
        
        if (applicant.role_id === 3 && 
            parseFloat(leave.credited_days) <= 2 && 
            applicantDeptId && 
            currentUserDeptId &&
            applicantDeptId === currentUserDeptId) {
          shouldApprove = true;
          console.log('  MATCH: Manager approving Employee <=2 days same dept');
        }
      }
      // HR (role_id 4) has NO approval privileges - removed from workflow
      
      if (shouldApprove) {
        leavesToApprove.push(leave);
      }
    }
    
    console.log('\nTotal Leaves to Approve:', leavesToApprove.length);
    console.log('=== END DEBUG ===\n');
    
    res.json(leavesToApprove);
  } catch (error) {
    console.error('Error fetching pending leaves:', error);
    res.status(500).json({ message: 'Error fetching pending leaves', error: error.message });
  }
};

exports.allLeaves = async (req, res) => {
  if (!['Manager','Management','HR'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  const rows = await Leave.findAll({ 
    include: [{ 
      model: User, 
      attributes: ['email'],
      include: [{
        model: Staff,
        attributes: ['first_name', 'middle_name', 'last_name', 'emp_id']
      }]
    }],
    order: [['created_at', 'DESC']] 
  });
  res.json(rows);
};

exports.approve = async (req, res) => {
  try {
    const row = await Leave.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'User',
        attributes: ['role_id'],
        include: [{
          model: Staff,
          include: [{
            model: Department,
            as: 'Departments',
            through: { attributes: [] }
          }]
        }]
      }]
    });
    
    if (!row) return res.status(404).json({ message: 'Not found' });
    
    // Check if current user has privilege to approve
    const hasPrivilege = ['Manager', 'Management', 'HR'].includes(req.user.role);
    
    if (!hasPrivilege) {
      return res.status(403).json({ message: 'You are not authorized to approve this leave' });
    }
    
    await row.update({ status: 'Approved', approved_by: req.user.id });
    res.json(row);
  } catch (error) {
    console.error('Error approving leave:', error);
    res.status(500).json({ message: 'Error approving leave', error: error.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const row = await Leave.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'User',
        attributes: ['role_id'],
        include: [{
          model: Staff,
          include: [{
            model: Department,
            as: 'Departments',
            through: { attributes: [] }
          }]
        }]
      }]
    });
    
    if (!row) return res.status(404).json({ message: 'Not found' });
    
    // Check if current user has privilege to reject
    const hasPrivilege = ['Manager', 'Management', 'HR'].includes(req.user.role);
    
    if (!hasPrivilege) {
      return res.status(403).json({ message: 'You are not authorized to reject this leave' });
    }
    
    // Rejection reason is currently not stored in DB (no column).
    await row.update({ 
      status: 'Rejected', 
      approved_by: req.user.id
    });
    res.json(row);
  } catch (error) {
    console.error('Error rejecting leave:', error);
    res.status(500).json({ message: 'Error rejecting leave', error: error.message });
  }
};

exports.update = async (req, res) => {
  const row = await Leave.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  
  // Only the user who created it can update, and only if status is Pending
  if (row.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  if (row.status !== 'Pending') return res.status(400).json({ message: 'Can only update pending leaves' });
  
  await row.update(req.body);
  res.json(row);
};

exports.remove = async (req, res) => {
  try {
    const row = await Leave.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    
    // Only the user who created it can delete, and only if status is Pending
    if (row.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (row.status !== 'Pending') return res.status(400).json({ message: 'Can only delete pending leaves' });
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse leave dates
    const fromDate = new Date(row.from_date + 'T00:00:00');
    const toDate = new Date(row.to_date + 'T00:00:00');
    
    // Check if entire leave is in the future
    if (fromDate >= today) {
      // All dates are future - delete entire leave
      await row.destroy();
      return res.json({ message: 'Leave cancelled completely', type: 'full' });
    }
    
    // Check if entire leave is in the past
    if (toDate < today) {
      return res.status(400).json({ message: 'Cannot cancel leaves that have already been consumed' });
    }
    
    // Partial cancellation - some dates are past, some are future
    // Calculate the last past date (yesterday)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Calculate how many days to keep (past dates only)
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const daysToKeep = Math.round((yesterday - fromDate) / MS_PER_DAY) + 1;
    
    // Calculate new credited days (for full day leaves only, as half-day cannot span multiple days)
    const newCreditedDays = daysToKeep;
    
    // Update the leave to end at yesterday
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    await row.update({
      to_date: yesterdayStr,
      credited_days: newCreditedDays
    });
    
    // Calculate cancelled days
    const cancelledDays = parseFloat(row.credited_days) - newCreditedDays;
    
    res.json({ 
      message: `Leave partially cancelled. ${cancelledDays} day(s) cancelled, ${newCreditedDays} day(s) retained.`,
      type: 'partial',
      cancelledDays,
      retainedDays: newCreditedDays
    });
  } catch (error) {
    console.error('Error removing leave:', error);
    res.status(500).json({ message: 'Error cancelling leave', error: error.message });
  }
};

exports.getLeaveBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();
    
    // Get leave entitlement for current year
    const entitlement = await LeaveEntitlement.findOne({
      where: { 
        user_id: userId, 
        year: currentYear 
      }
    });
    
    if (!entitlement) {
      return res.json({
        leave_entitled: 0,
        leaves_accumulated: 0,
        leaves_availed: 0,
        leave_balance: 0
      });
    }
    
    // Calculate leave balance using formula: leave_balance = (leave_entitled + leaves_accumulated) - leaves_availed
    const leave_balance = parseFloat(
      (parseFloat(entitlement.leave_entitled) + parseFloat(entitlement.leaves_accumulated)) - 
      parseFloat(entitlement.leaves_availed)
    ).toFixed(1);
    
    res.json({
      leave_entitled: parseFloat(entitlement.leave_entitled),
      leaves_accumulated: parseFloat(entitlement.leaves_accumulated),
      leaves_availed: parseFloat(entitlement.leaves_availed),
      leave_balance: parseFloat(leave_balance)
    });
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ message: 'Error fetching leave balance', error: error.message });
  }
};

